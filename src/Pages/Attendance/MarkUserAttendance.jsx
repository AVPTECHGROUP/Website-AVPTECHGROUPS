import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Sun, Frame, ShieldOff, User } from 'lucide-react';
import { toast } from 'react-toastify';
import Webcam from 'react-webcam';
import { markAttendanceByStafffFace } from '../../Api/Attendance/AttendanceApi';
import { useNavigate } from 'react-router-dom';
import { getSchoolLocation } from "../../utils/getSchoolLocation";

const MarkUserAttendance = () => {
  const [active, setActive] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successName, setSuccessName] = useState("");
  const [showAlreadyPopup, setShowAlreadyPopup] = useState(false);
  const [alreadyName, setAlreadyName] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);

  // ── Blink liveness ─────────────────────────────────────────────────────────
  // idle | loading | scanning | waiting | detected
  const [blinkPhase, setBlinkPhase] = useState("idle");
  const landmarkerRef = useRef(null); // cached FaceLandmarker (per session)
  const rafRef = useRef(null);
  const blinkCapturedRef = useRef(false);
  const faceSeenRef = useRef(false); // tracks first face-present transition
  const blinkFrameCountRef = useRef(0);     // consecutive above-threshold frames
  const blinkPeakRef = useRef(false); // true once BLINK_MIN_FRAMES reached
  const blinkPeakScoreRef = useRef(0);     // max score this cycle — screen detection gate

  const MEDIAPIPE_CDN = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/vision_bundle.mjs";
  const WASM_BASE = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm";
  const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";
  const BLINK_THRESHOLD = 0.45;
  const BLINK_MIN_FRAMES = 2;    // consecutive above-threshold frames → real blink
  const BLINK_OPEN_RESET = 0.25; // score must drop below this after peak to confirm open recovery
  const BLINK_PEAK_MIN = 0.65; // peak MUST reach this to pass — screens/photos produce shallow scores (0.45–0.60)

  // Cancel RAF on unmount
  useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

  const webcamRef = useRef(null);
  const navigate = useNavigate()

  const base64ToFile = (base64, filename) => {
    const arr = base64.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  // Handle Mark Attendance click — camera opens, blink check starts automatically via useEffect
  const handleMarkAttendance = () => {
    blinkCapturedRef.current = false;
    faceSeenRef.current = false;
    setBlinkPhase("idle");
    setActive(true);
  };

  // Capture image — called by blink loop (or Skip)
  const captureImage = useCallback(async () => {
    const { gpsLatitude, gpsLongitude } = getSchoolLocation();
    if (!webcamRef.current || isCapturing) return;

    setIsCapturing(true);

    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      toast.error("Failed to capture image");
      setIsCapturing(false);
      return;
    }

    try {
      const imageFile = base64ToFile(imageSrc, "attendance.jpg");

      const response = await markAttendanceByStafffFace({
        imageFile,
        gpsLatitude,
        gpsLongitude,
      });

  if (!response?.success || !response?.data?.verified) {
    toast.error("Face not recognized");
    navigate("/attendance/usersAttendance/warning");
    return;
  }

  const userName = response.data.userName || "User";
  const backendMessage =
    response.data.message || response.message || "";

  if (backendMessage.toLowerCase().includes("already")) {
    toast.warning(`${userName} — ${backendMessage}`);
    setAlreadyName(userName);
    setShowAlreadyPopup(true);
    setTimeout(() => setShowAlreadyPopup(false), 3000);
    return;
  }

  toast.success(`${userName} — ${backendMessage}`);
  setSuccessName(userName);
  setShowSuccessPopup(true);
  setTimeout(() => setShowSuccessPopup(false), 3000);

} catch (error) {
  console.error("Attendance error:", error);
  toast.error("Something went wrong. Please try again.");
  navigate("/attendance/usersAttendance/warning");
} finally {
  setIsCapturing(false); // 🔓 button unlock
  setBlinkPhase("idle");
  setActive(false);
}
  }, [navigate]);

// Load FaceLandmarker from CDN once, cache in ref
const loadLandmarker = useCallback(async () => {
  if (landmarkerRef.current) return landmarkerRef.current;
  const { FaceLandmarker, FilesetResolver } = await import(/* @vite-ignore */ MEDIAPIPE_CDN);
  const fs = await FilesetResolver.forVisionTasks(WASM_BASE);
  const lm = await FaceLandmarker.createFromOptions(fs, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    outputFaceBlendshapes: true,
    runningMode: "VIDEO",
    numFaces: 1,
  });
  landmarkerRef.current = lm;
  return lm;
}, []);

// Auto-start blink check as soon as camera opens (50ms delay to let Webcam render)
const startBlinkCheckRef = useRef(null);
useEffect(() => {
  if (!active) return;
  const t = setTimeout(() => startBlinkCheckRef.current?.(), 50);
  return () => clearTimeout(t);
}, [active]);

// Full automatic flow: loading → scanning for face → face found → waiting for blink → auto-capture
const startBlinkCheck = useCallback(async () => {
  blinkCapturedRef.current = false;
  faceSeenRef.current = false;
  blinkFrameCountRef.current = 0;
  blinkPeakRef.current = false;
  blinkPeakScoreRef.current = 0;
  setBlinkPhase("loading");
  try {
    const lm = await loadLandmarker();
    setBlinkPhase("scanning"); // looking for a face

    const loop = () => {
      if (blinkCapturedRef.current) return;
      const video = webcamRef.current?.video;
      if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return; }

      const result = lm.detectForVideo(video, performance.now());
      const hasFace = (result?.faceLandmarks?.length ?? 0) > 0;

      if (!hasFace) {
        // Face left frame — go back to scanning
        if (faceSeenRef.current) {
          faceSeenRef.current = false;
          setBlinkPhase("scanning");
        }
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      // Face present — transition to waiting for blink
      if (!faceSeenRef.current) {
        faceSeenRef.current = true;
        setBlinkPhase("waiting");
      }

      // Check for blink
      const shapes = result?.faceBlendshapes?.[0]?.categories;
      if (shapes) {
        const L = shapes.find(s => s.categoryName === "eyeBlinkLeft")?.score ?? 0;
        const R = shapes.find(s => s.categoryName === "eyeBlinkRight")?.score ?? 0;
        const score = Math.max(L, R);
        if (score > BLINK_THRESHOLD) {
          blinkFrameCountRef.current++;
          if (score > blinkPeakScoreRef.current) blinkPeakScoreRef.current = score;
          if (blinkFrameCountRef.current >= BLINK_MIN_FRAMES) blinkPeakRef.current = true;
        } else {
          if (blinkPeakRef.current && score < BLINK_OPEN_RESET) {
            if (blinkPeakScoreRef.current >= BLINK_PEAK_MIN) {
              // Deep blink confirmed — real face, not a screen or photo
              blinkCapturedRef.current = true;
              setBlinkPhase("detected");
              captureImage();
              return;
            }
            // Shallow peak → likely screen/video replay — silently reset for retry
            blinkFrameCountRef.current = 0;
            blinkPeakRef.current = false;
            blinkPeakScoreRef.current = 0;
          }
          if (!blinkPeakRef.current) blinkFrameCountRef.current = 0;
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  } catch (err) {
    console.error("Blink detection error:", err);
    setBlinkPhase("idle");
    captureImage(); // fallback if CDN/model fails
  }
}, [loadLandmarker, captureImage]);

// Keep ref in sync so the useEffect can call the latest version
useEffect(() => { startBlinkCheckRef.current = startBlinkCheck; }, [startBlinkCheck]);

const cancelBlink = () => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  blinkCapturedRef.current = true;
  setBlinkPhase("idle");
  setActive(false);
};

const skipBlink = () => {
  if (rafRef.current) cancelAnimationFrame(rafRef.current);
  blinkCapturedRef.current = true;
  setBlinkPhase("idle");
  captureImage();
};

// Handle webcam errors
const handleWebcamError = (error) => {
  console.error('Webcam error:', error);
  toast.error('Failed to access camera. Please check permissions.', {
    toastId: 'camera-error',
    position: 'top-right',
    autoClose: 3000,
  });
  setActive(false);
};

return (
  <div className="min-h-screen bg-blue-50 flex items-center justify-center p-2">
    {/* Success Popup - FULL SCREEN */}
    {showSuccessPopup && (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-linear-to-br from-green-500/95 to-green-600/95 px-4">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-10 text-center transform animate-scaleIn">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Attendance Marked!
          </h2>

          <p className="text-gray-700 text-2xl font-bold mb-2">
            {successName}
          </p>

          <p className="mt-3 text-xl text-gray-600">
            Your attendance has been recorded successfully
          </p>
        </div>
      </div>
    )}

    {/* Already Marked Popup - FULL SCREEN */}
    {showAlreadyPopup && (
      <div className="fixed inset-0 z-9999 flex items-center justify-center bg-linear-to-br from-green-500/95 to-green-500/95 px-4">
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-10 text-center transform animate-scaleIn">
          <div className="mx-auto mb-6 w-24 h-24 rounded-full bg-yellow-100 flex items-center justify-center">
            <svg
              className="w-16 h-16 text-yellow-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
            </svg>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Already Marked!
          </h2>

          <p className="text-gray-700 text-2xl font-bold mb-2">
            {alreadyName}
          </p>

          <p className="mt-3 text-xl text-gray-600">
            Your attendance was already recorded for today
          </p>
        </div>
      </div>
    )}

    <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-2">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Staff Attendance
        </h1>
        <p className="text-sm md:text-base text-gray-600">
          Please position your face within the frame for live capture to verify your identity.
        </p>
      </div>
      {/* Camera Section */}
      <div className="bg-gray-50 rounded-xl p-6 md:p-5 mb-6">
        <div
          className="relative w-full max-w-xl mx-auto bg-white rounded-lg border-2 border-dashed border-blue-200 flex items-center justify-center overflow-hidden"
          style={{
            aspectRatio: active && window.innerWidth < 420 ? '9/16' : '3/2'
          }}
        >
          {!active ? (
            /* Placeholder */
            <div className="flex flex-col items-center justify-center text-center p-4">
              <div className="w-20 h-20 md:w-24 md:h-24 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-200 rounded-full flex items-center justify-center">
                  <div className="flex gap-2">
                    <Camera size={45} color='blue' />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500">Camera not initialized</p>
            </div>
          ) : (
            /* Camera View */
            <div className="w-full h-full relative">
              {/* Webcam */}
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover rounded-lg"
                mirrored={true}
                onUserMediaError={handleWebcamError}
                videoConstraints={{
                  facingMode: 'user',
                  width: { ideal: 1280 },
                  height: { ideal: 720 }
                }}
              />

              {/* Frame corners — color reflects current phase */}
              {["tl", "tr", "bl", "br"].map(pos => (
                <div key={pos} className={`absolute w-8 h-8 ${pos === "tl" ? "top-4 left-4 border-t-4 border-l-4 rounded-tl-lg" :
                  pos === "tr" ? "top-4 right-4 border-t-4 border-r-4 rounded-tr-lg" :
                    pos === "bl" ? "bottom-4 left-4 border-b-4 border-l-4 rounded-bl-lg" :
                      "bottom-4 right-4 border-b-4 border-r-4 rounded-br-lg"
                  } ${blinkPhase === "waiting" ? "border-amber-400 animate-pulse" :
                    blinkPhase === "scanning" ? "border-blue-400 animate-pulse" :
                      blinkPhase === "detected" ? "border-green-400" :
                        "border-blue-500"
                  }`} />
              ))}

              {/* Loading overlay */}
              {blinkPhase === "loading" && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3 rounded-lg">
                  <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
                  <p className="text-xs text-white font-semibold bg-black/40 px-3 py-1.5 rounded-full">Loading liveness check…</p>
                </div>
              )}

              {/* Scanning overlay — looking for a face */}
              {blinkPhase === "scanning" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-3">
                  <div className="w-16 h-16 rounded-full border-2 border-dashed border-blue-400/70 animate-ping absolute" />
                  <div className="w-16 h-16 rounded-full border-2 border-blue-400/50 absolute" />
                  <p className="text-sm font-bold text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full mt-20">
                    Looking for your face…
                  </p>
                </div>
              )}

              {/* Waiting for blink overlay */}
              {blinkPhase === "waiting" && (
                <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center gap-2">
                  <div className="text-5xl animate-pulse select-none">👁</div>
                  <p className="text-sm font-bold text-white bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full">
                    Blink your eyes to capture
                  </p>
                  <div className="absolute bottom-6 flex gap-1.5">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Blink detected flash */}
              {blinkPhase === "detected" && (
                <div className="absolute inset-0 bg-green-400/30 rounded-lg flex items-center justify-center">
                  <p className="text-sm font-bold text-white bg-green-600/80 px-4 py-2 rounded-full">✓ Blink detected!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Verification Text */}
        <div className="text-center mt-4">
          <p className="text-sm text-gray-600">
            {!active ? 'Click the button below to start'
              : blinkPhase === "loading" ? 'Loading liveness check…'
                : blinkPhase === "scanning" ? '🔍 Looking for your face…'
                  : blinkPhase === "waiting" ? '👁 Face detected — blink to capture'
                    : blinkPhase === "detected" ? '✓ Blink detected! Capturing…'
                      : 'Starting…'}
          </p>
        </div>

        {/* Action area — fully automatic, only Cancel / Skip shown */}
        <div className="flex flex-col items-center gap-2 mt-4">
          {!active ? (
            <button
              onClick={handleMarkAttendance}
              className="flex items-center text-xl gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-semibold px-9 py-3 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg max-[420px]:text-base max-[420px]:px-6 max-[420px]:py-2.5"
            >
              <Camera className="w-5 h-5 max-[420px]:w-4 max-[420px]:h-4" />
              Mark Attendance
            </button>
          ) : blinkPhase === "loading" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                <div className="w-4 h-4 border-2 border-purple-400 border-t-purple-600 rounded-full animate-spin" />
                Loading liveness check…
              </div>
              <button onClick={cancelBlink} className="text-xs text-red-400 hover:text-red-600 py-1 cursor-pointer transition-colors">Cancel</button>
            </div>
          ) : blinkPhase === "scanning" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full animate-spin" />
                Looking for your face…
              </div>
              <button onClick={cancelBlink} className="text-xs text-red-400 hover:text-red-600 py-1 cursor-pointer transition-colors">Cancel</button>
            </div>
          ) : blinkPhase === "waiting" ? (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-amber-50 text-amber-700 border border-amber-300 animate-pulse">
                <span className="text-lg">👁</span> Blink to capture…
              </div>
              <button onClick={skipBlink} className="text-xs text-gray-400 hover:text-gray-600 py-1 cursor-pointer transition-colors">
                Skip liveness check
              </button>
              <button onClick={cancelBlink} className="text-xs text-red-400 hover:text-red-600 py-1 cursor-pointer transition-colors">Cancel</button>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold bg-green-50 text-green-700 border border-green-300">
              <div className="w-4 h-4 border-2 border-green-400 border-t-green-600 rounded-full animate-spin" />
              Capturing…
            </div>
          )}
        </div>
      </div>

      {/* Guidelines Section */}
      <div className="mb-6 pl-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4 text-center md:text-left">
          Guidelines for successful capture
        </h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Sun className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Good Lighting</h3>
              <p className="text-sm text-gray-600">Ensure the area is well lit and no glare</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Frame className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Stay in Frame</h3>
              <p className="text-sm text-gray-600">Keep your face centered and look forward</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <ShieldOff className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">No Masks</h3>
              <p className="text-sm text-gray-600">Remove masks or heavy coverings</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Single Person</h3>
              <p className="text-sm text-gray-600">Ensure only one person is in view</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};

export default MarkUserAttendance;