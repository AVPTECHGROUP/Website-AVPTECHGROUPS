import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
    Camera, ScanFace, CheckCircle2, XCircle, AlertTriangle,
    ArrowLeft, Upload, Trash2, Loader2, VideoOff, Clock,
    RefreshCw, ShieldAlert, BadgeCheck,
} from "lucide-react";
import { markAttendanceByFace, unmarkAttendance } from "../../../Api/Attendance/AttendanceApi";
import { getSchoolLocation } from "../../../utils/getSchoolLocation";
import {
    STATUS_NOT_MARKED, STATUS_PRESENT, STATUS_LATE, STATUS_PRESENT_MANUAL,
    AVATAR_INITIALS_COLORS, CONFIDENCE_BAR_COLOR_MAP,
    CONFIDENCE_HIGH_THRESHOLD, CONFIDENCE_MEDIUM_THRESHOLD,
    STUDENT_USER_TYPE, INITIAL_SCAN_STATE,
    MEDIAPIPE_CDN, WASM_BASE, MODEL_URL,
    BLINK_THRESHOLD, BLINK_MIN_FRAMES, BLINK_OPEN_RESET, BLINK_PEAK_MIN,
    UI_STRINGS
} from "../../../Constants/StringConstants/AttendanceConstants";

const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const mapStatus = (apiStatus) => {
    if (!apiStatus) return STATUS_NOT_MARKED;
    const s = apiStatus.toUpperCase();
    if (s === "PRESENT") return STATUS_PRESENT;
    if (s === "LATE") return STATUS_LATE;
    if (s === "PRESENT_MANUAL" || s === "MANUAL") return STATUS_PRESENT_MANUAL;
    return STATUS_NOT_MARKED;
};

const avatarColor = (initials = "??") => {
    return AVATAR_INITIALS_COLORS[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % AVATAR_INITIALS_COLORS.length];
};

const confidenceBarColor = (c) => {
    if (!c) return CONFIDENCE_BAR_COLOR_MAP.NONE;
    if (c >= CONFIDENCE_HIGH_THRESHOLD) return CONFIDENCE_BAR_COLOR_MAP.HIGH;
    if (c >= CONFIDENCE_MEDIUM_THRESHOLD) return CONFIDENCE_BAR_COLOR_MAP.MEDIUM;
    return CONFIDENCE_BAR_COLOR_MAP.LOW;
};

const dataURLtoBlob = (dataUrl) => {
    const [header, base64] = dataUrl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const binary = atob(base64);
    const arr = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
    return new Blob([arr], { type: mime });
};

const parseLowConfidenceError = (message = "") => {
    const confidenceMatch = message.match(/Face confidence \((\d+(?:\.\d+)?)%\)/i);
    const thresholdMatch = message.match(/threshold \((\d+(?:\.\d+)?)%\)/i);
    if (confidenceMatch && thresholdMatch) {
        return { isLowConfidence: true, confidence: parseFloat(confidenceMatch[1]), threshold: parseFloat(thresholdMatch[1]) };
    }
    return { isLowConfidence: false };
};

const extractApiResponse = (res) => {
    if (!res) return { rec: null, apiMessage: "" };
    if (res.data && typeof res.data === "object" && res.data.userId !== undefined) {
        return { rec: res.data, apiMessage: res.message || res.data?.message || "" };
    }
    if (res.userId !== undefined) {
        return { rec: res, apiMessage: res.message || "" };
    }
    return { rec: res, apiMessage: res?.message || "" };
};

const isStudentRecord = (rec) => {
    if (!rec) return false;
    const userType = rec.userType?.toUpperCase?.() || "";
    return userType === STUDENT_USER_TYPE;
};

export default function IndividualFaceScanView({ onBack, selectedClass, selectedSection }) {
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);
    const [scanState, setScanState] = useState(INITIAL_SCAN_STATE);
    const [capturedImage, setCapturedImage] = useState(null);
    const [camError, setCamError] = useState(false);
    const [unmarkLoading, setUnmarkLoading] = useState(false);
    const [blinkPhase, setBlinkPhase] = useState("idle");
    const landmarkerRef = useRef(null);
    const rafRef = useRef(null);
    const blinkCapturedRef = useRef(false);
    const blinkFrameCountRef = useRef(0);
    const blinkPeakRef = useRef(false);
    const blinkPeakScoreRef = useRef(0);

    useEffect(() => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); }, []);

    const submitScan = useCallback(async (imageBlob) => {
        const { gpsLatitude, gpsLongitude } = getSchoolLocation();
        if (!selectedClass?.id || !selectedSection?.id) {
            alert(UI_STRINGS.ALERTS.WAIT_BEFORE_PROCEEDING);
            return;
        }
        setScanState({ ...INITIAL_SCAN_STATE, status: "scanning" });

        try {
            const res = await markAttendanceByFace({
                imageFile: imageBlob,
                user_type: "STUDENT",
                class_id: selectedClass?.id,
                section_id: selectedSection?.id,
                gpsLatitude,
                gpsLongitude,
            });

            const { rec, apiMessage } = extractApiResponse(res);
            if (!isStudentRecord(rec)) {
                setScanState({ ...INITIAL_SCAN_STATE, status: "non_student", message: rec?.userType || UI_STRINGS.COMMON.UNKNOWN });
                return;
            }

            const isAlreadyMarked = apiMessage.toLowerCase().includes("already marked") || apiMessage.toLowerCase().includes("attendance already marked");
            if (isAlreadyMarked) {
                setScanState({ ...INITIAL_SCAN_STATE, status: "already_marked", data: rec });
                return;
            }

            if (!rec?.userId) throw new Error(UI_STRINGS.FACE_SCAN.SCAN_FAILED);
            setScanState({ ...INITIAL_SCAN_STATE, status: "success", data: rec });

        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || UI_STRINGS.COMMON.ERROR;
            const lowConf = parseLowConfidenceError(msg);
            if (lowConf.isLowConfidence) {
                setScanState({ ...INITIAL_SCAN_STATE, status: "low_confidence", confidence: lowConf.confidence, threshold: lowConf.threshold });
                return;
            }
            setScanState({ ...INITIAL_SCAN_STATE, status: "error", message: msg });
        }
    }, [selectedClass, selectedSection]);

    const doCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot();
        if (!imageSrc) return;
        setCapturedImage(imageSrc);
        submitScan(dataURLtoBlob(imageSrc));
    }, [submitScan]);

    const loadLandmarker = useCallback(async () => {
        if (landmarkerRef.current) return landmarkerRef.current;
        const { FaceLandmarker, FilesetResolver } = await import(/* @vite-ignore */ MEDIAPIPE_CDN);
        const fs = await FilesetResolver.forVisionTasks(WASM_BASE);
        const lm = await FaceLandmarker.createFromOptions(fs, {
            baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" }, outputFaceBlendshapes: true, runningMode: "VIDEO", numFaces: 1,
        });
        landmarkerRef.current = lm;
        return lm;
    }, []);

    const startBlinkCheck = useCallback(async () => {
        if (camError) { doCapture(); return; }
        setBlinkPhase("loading");
        blinkCapturedRef.current = false;
        blinkFrameCountRef.current = 0;
        blinkPeakRef.current = false;
        blinkPeakScoreRef.current = 0;
        try {
            const lm = await loadLandmarker();
            setBlinkPhase("waiting");

            const loop = () => {
                if (blinkCapturedRef.current) return;
                const video = webcamRef.current?.video;
                if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(loop); return; }
                const result = lm.detectForVideo(video, performance.now());
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
                                blinkCapturedRef.current = true;
                                setBlinkPhase("detected");
                                doCapture();
                                return;
                            }
                            blinkFrameCountRef.current = 0; blinkPeakRef.current = false; blinkPeakScoreRef.current = 0;
                        }
                        if (!blinkPeakRef.current) blinkFrameCountRef.current = 0;
                    }
                }
                rafRef.current = requestAnimationFrame(loop);
            };
            rafRef.current = requestAnimationFrame(loop);
        } catch (err) {
            console.error("Error loading landmarker:", err);
            setBlinkPhase("idle"); doCapture();
        }
    }, [camError, loadLandmarker, doCapture]);

    const handleFileUpload = useCallback((file) => {
        if (!file) return;
        setCapturedImage(URL.createObjectURL(file));
        submitScan(file);
    }, [submitScan]);

    const handleRetake = useCallback(() => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        blinkCapturedRef.current = true;
        blinkFrameCountRef.current = 0; blinkPeakRef.current = false; blinkPeakScoreRef.current = 0;
        setBlinkPhase("idle"); setScanState(INITIAL_SCAN_STATE); setCapturedImage(null);
    }, []);

    const handleUnmark = useCallback(async () => {
        const attendanceId = scanState.data?.id;
        if (!attendanceId) { alert(UI_STRINGS.ALERTS.NO_ATTENDANCE_ID); return; }
        setUnmarkLoading(true);
        try {
            await unmarkAttendance(attendanceId, "Wrong match corrected by teacher");
            handleRetake();
        } catch (err) {
            alert(err?.response?.data?.message || err?.message || UI_STRINGS.COMMON.ERROR);
        } finally {
            setUnmarkLoading(false);
        }
    }, [scanState.data, handleRetake]);

    const { status, data, confidence, threshold, message } = scanState;
    const isScanning = status === "scanning";
    const isTerminal = status !== "idle" && status !== "scanning";
    const isBlinkActive = blinkPhase === "loading" || blinkPhase === "waiting";
    const confidencePct = data?.faceConfidenceScore ? Math.round(data.faceConfidenceScore * 100) : null;
    const resultInitials = getInitials(data?.userName || "");

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:underline cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> {UI_STRINGS.COMMON.BACK_TO_ROSTER}
                </button>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2 flex-wrap">
                    <ScanFace className="w-5 h-5 text-gray-600" />
                    <h2 className="font-bold text-gray-800 text-base">{UI_STRINGS.FACE_SCAN.HEADER}</h2>
                    {selectedClass && selectedSection && (
                        <span className="text-sm text-gray-500">{selectedClass.name} · {selectedSection.name}</span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-xs font-semibold">
                        <ShieldAlert className="w-3 h-3" /> {UI_STRINGS.FACE_SCAN.STUDENTS_ONLY}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <Camera className="w-4 h-4" /> {UI_STRINGS.FACE_SCAN.CAPTURE_OR_UPLOAD}
                    </h3>
                    <div className="relative rounded-xl overflow-hidden bg-gray-900 w-full" style={{ aspectRatio: "4/3" }}>
                        {camError ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                                <VideoOff className="w-12 h-12 text-gray-600" />
                                <p className="text-sm text-center px-4">{UI_STRINGS.FACE_SCAN.CAM_UNAVAILABLE}</p>
                            </div>
                        ) : capturedImage ? (
                            <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                        ) : (
                            <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg"
                                videoConstraints={{ facingMode: "user", width: 640, height: 480 }}
                                onUserMediaError={() => setCamError(true)}
                                className="w-full h-full object-cover" />
                        )}
                        {isScanning && (
                            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
                                <p className="text-sm text-white font-semibold">{UI_STRINGS.FACE_SCAN.VERIFYING}</p>
                            </div>
                        )}
                        {blinkPhase === "loading" && !capturedImage && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 border-4 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
                                <p className="text-xs text-white font-semibold bg-black/40 px-3 py-1.5 rounded-full">{UI_STRINGS.FACE_SCAN.LOADING_LIVENESS}</p>
                            </div>
                        )}
                        {blinkPhase === "waiting" && !capturedImage && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-400 rounded-tl-md animate-pulse" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-400 rounded-tr-md animate-pulse" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-400 rounded-bl-md animate-pulse" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-400 rounded-br-md animate-pulse" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                                    <div className="text-4xl animate-pulse select-none">👁</div>
                                    <p className="text-sm font-bold text-white bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full whitespace-nowrap">
                                        {UI_STRINGS.FACE_SCAN.BLINK_INSTR}
                                    </p>
                                </div>
                                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5">
                                    {[0, 1, 2].map(i => (
                                        <div key={i} className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                    ))}
                                </div>
                            </div>
                        )}
                        {blinkPhase === "detected" && !capturedImage && (
                            <div className="absolute inset-0 bg-green-400/30 flex items-center justify-center">
                                <p className="text-sm font-bold text-white bg-green-600/80 px-4 py-2 rounded-full">{UI_STRINGS.FACE_SCAN.BLINK_DETECTED}</p>
                            </div>
                        )}
                        {!isScanning && !isBlinkActive && blinkPhase !== "detected" && !capturedImage && !camError && (
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-blue-400 rounded-tl-md" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-blue-400 rounded-tr-md" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-blue-400 rounded-bl-md" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-blue-400 rounded-br-md" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-xs text-blue-300 bg-black/40 px-2 py-1 rounded-full">{UI_STRINGS.FACE_SCAN.POSITION_FACE}</p>
                                </div>
                            </div>
                        )}
                    </div>
                    {status === "idle" && blinkPhase === "idle" && (
                        <div className="mt-4 flex flex-col sm:flex-row gap-2">
                            <button onClick={startBlinkCheck} disabled={camError}
                                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                                <Camera className="w-4 h-4" /> {UI_STRINGS.FACE_SCAN.CAPTURE_VERIFY}
                            </button>
                            <button onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                                <Upload className="w-4 h-4" /> {UI_STRINGS.COMMON.UPLOAD_PHOTO}
                            </button>
                        </div>
                    )}
                    {status === "idle" && blinkPhase === "loading" && (
                        <div className="mt-4 flex items-center justify-center gap-2 py-3 text-sm text-purple-600 bg-purple-50 rounded-xl border border-purple-100">
                            <Loader2 className="w-4 h-4 animate-spin" /> {UI_STRINGS.FACE_SCAN.LOADING_LIVENESS}
                        </div>
                    )}
                    {status === "idle" && blinkPhase === "waiting" && (
                        <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-center gap-2 py-3 text-sm text-amber-700 bg-amber-50 rounded-xl border border-amber-200 animate-pulse font-semibold">
                                <span className="text-base">👁</span> {UI_STRINGS.FACE_SCAN.BLINK_INSTR}
                            </div>
                            <button
                                onClick={() => { blinkCapturedRef.current = true; cancelAnimationFrame(rafRef.current); setBlinkPhase("idle"); doCapture(); }}
                                className="w-full text-xs text-gray-400 hover:text-gray-600 py-1.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                                {UI_STRINGS.FACE_SCAN.SKIP_BLINK}
                            </button>
                        </div>
                    )}
                    {isScanning && (
                        <div className="mt-4 flex items-center justify-center gap-2 py-3 text-sm text-gray-500">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" /> {UI_STRINGS.FACE_SCAN.ANALYZING}
                        </div>
                    )}
                    {isTerminal && (
                        <button onClick={handleRetake}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-100 text-blue-600 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors">
                            <RefreshCw className="w-4 h-4" />
                            {status === "low_confidence" ? UI_STRINGS.FACE_SCAN.RETRY : UI_STRINGS.FACE_SCAN.SCAN_ANOTHER}
                        </button>
                    )}
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={(e) => handleFileUpload(e.target.files[0])} />
                </div>

                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-green-600" /> {UI_STRINGS.FACE_SCAN.SCAN_RESULT}
                    </h3>
                    {status === "idle" && blinkPhase === "idle" && (
                        <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                            <ScanFace className="w-14 h-14 text-gray-200" />
                            <p className="text-sm text-center">{UI_STRINGS.FACE_SCAN.IDLE_DESC_1}</p>
                            <p className="text-xs text-blue-400 bg-blue-50 px-3 py-1 rounded-full">{UI_STRINGS.FACE_SCAN.IDLE_DESC_2}</p>
                        </div>
                    )}
                    {status === "idle" && blinkPhase === "loading" && (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <div className="w-16 h-16 rounded-full bg-purple-50 border-2 border-purple-200 flex items-center justify-center">
                                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-700">{UI_STRINGS.FACE_SCAN.SETUP_LIVENESS}</p>
                                <p className="text-xs text-gray-400 mt-1">{UI_STRINGS.FACE_SCAN.LOADING_MODEL}</p>
                            </div>
                            <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 w-full text-xs text-purple-700 text-center">
                                {UI_STRINGS.FACE_SCAN.ONCE_PER_SESSION}
                            </div>
                        </div>
                    )}
                    {status === "idle" && blinkPhase === "waiting" && (
                        <div className="flex flex-col items-center justify-center py-8 gap-4">
                            <div className="w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-300 flex items-center justify-center animate-pulse">
                                <span className="text-4xl select-none">👁</span>
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black text-gray-800">{UI_STRINGS.FACE_SCAN.LIVENESS_CHECK}</p>
                                <p className="text-sm text-amber-600 font-semibold mt-1">{UI_STRINGS.FACE_SCAN.BLINK_NATURALLY}</p>
                                <p className="text-xs text-gray-400 mt-1">{UI_STRINGS.FACE_SCAN.AUTO_CAPTURE}</p>
                            </div>
                            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1.5">
                                <p className="text-xs font-bold text-amber-700">{UI_STRINGS.FACE_SCAN.TIPS_BEST_RESULT}</p>
                                <ul className="text-xs text-amber-600 space-y-1 list-disc list-inside">
                                    {UI_STRINGS.FACE_SCAN.LIVENESS_TIPS.map((tip) => (
                                        <li key={tip}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {status === "scanning" && (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                            <p className="text-sm text-gray-500">{UI_STRINGS.FACE_SCAN.ANALYZING}</p>
                            <p className="text-xs text-gray-400">{UI_STRINGS.FACE_SCAN.VERIFYING_ID}</p>
                        </div>
                    )}
                    {status === "success" && data && (
                        <div className="space-y-3">
                            <div className="flex flex-col items-center py-4 gap-2">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black ${avatarColor(resultInitials)}`}>{resultInitials}</div>
                                <p className="text-lg font-black text-gray-800">{data.userName || UI_STRINGS.COMMON.UNKNOWN}</p>
                                <p className="text-sm text-gray-400">{UI_STRINGS.FACE_SCAN.USER_ID} {data.userId}</p>
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                        <BadgeCheck className="w-3.5 h-3.5" /> {UI_STRINGS.FACE_SCAN.ATTENDANCE_MARKED}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-xs font-semibold">{UI_STRINGS.FACE_SCAN.STUDENT_TAG}</span>
                                </div>
                                {data.requiresManualReview && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                                        <AlertTriangle className="w-3 h-3" /> {UI_STRINGS.FACE_SCAN.REQ_MANUAL_REVIEW}
                                    </span>
                                )}
                            </div>
                            <div className={`border rounded-xl p-3 flex justify-between items-center ${data.verified ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.STATUS}</span>
                                <span className={`text-sm font-bold flex items-center gap-1 ${data.verified ? "text-green-600" : "text-amber-600"}`}>
                                    {data.verified ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                                    {mapStatus(data.status)}
                                </span>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.CONFIDENCE}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className={`h-full rounded-full ${confidenceBarColor(confidencePct)}`} style={{ width: `${confidencePct || 0}%` }} />
                                    </div>
                                    <span className="text-sm font-bold text-gray-700">{confidencePct ?? UI_STRINGS.COMMON.N_A}%</span>
                                </div>
                            </div>
                            {data.faceThreshold != null && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.THRESHOLD}</span>
                                    <span className="text-sm font-bold text-gray-700">{Math.round(data.faceThreshold * 100)}%</span>
                                </div>
                            )}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.CHECK_IN}</span>
                                <span className="text-sm font-bold text-gray-700">{data.checkInTime?.slice(0, 5) || "—"}</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.ATTENDANCE_DATE}</span>
                                <span className="text-sm font-bold text-gray-700">{data.attendanceDate || "—"}</span>
                            </div>
                            <button onClick={handleUnmark} disabled={unmarkLoading || !(data.attendanceId || data.id)}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed border border-red-100 text-red-500 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors">
                                {unmarkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {unmarkLoading ? UI_STRINGS.COMMON.UNMARKING : UI_STRINGS.FACE_SCAN.UNMARK_WRONG_MATCH}
                            </button>
                        </div>
                    )}
                    {status === "already_marked" && data && (
                        <div className="space-y-3">
                            <div className="flex flex-col items-center py-4 gap-2">
                                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-2xl font-black ${avatarColor(resultInitials)}`}>{resultInitials}</div>
                                <p className="text-lg font-black text-gray-800">{data.userName || UI_STRINGS.COMMON.UNKNOWN}</p>
                                <p className="text-sm text-gray-400">{UI_STRINGS.FACE_SCAN.USER_ID} {data.userId}</p>
                                <div className="flex items-center gap-2 flex-wrap justify-center">
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                                        <Clock className="w-3.5 h-3.5" /> {UI_STRINGS.FACE_SCAN.ALREADY_MARKED_TODAY}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-600 rounded-full text-xs font-semibold">{UI_STRINGS.FACE_SCAN.STUDENT_TAG}</span>
                                </div>
                            </div>
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-center text-xs text-blue-700 font-medium">
                                {UI_STRINGS.FACE_SCAN.PREV_RECORDED}
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.STATUS}</span>
                                <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" /> {mapStatus(data.status)}
                                </span>
                            </div>
                            {confidencePct != null && (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                    <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.CONFIDENCE}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${confidenceBarColor(confidencePct)}`} style={{ width: `${confidencePct}%` }} />
                                        </div>
                                        <span className="text-sm font-bold text-gray-700">{confidencePct}%</span>
                                    </div>
                                </div>
                            )}
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.CHECK_IN}</span>
                                <span className="text-sm font-bold text-gray-700">{data.checkInTime?.slice(0, 5) || "—"}</span>
                            </div>
                            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-700">{UI_STRINGS.COMMON.ATTENDANCE_DATE}</span>
                                <span className="text-sm font-bold text-gray-700">{data.attendanceDate || "—"}</span>
                            </div>
                            <button onClick={handleUnmark} disabled={unmarkLoading || !(data.attendanceId || data.id)}
                                className="w-full flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed border border-red-100 text-red-500 rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors">
                                {unmarkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                {unmarkLoading ? UI_STRINGS.COMMON.UNMARKING : UI_STRINGS.FACE_SCAN.UNMARK_RECORD}
                            </button>
                        </div>
                    )}
                    {status === "non_student" && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-red-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-black text-gray-800">{UI_STRINGS.FACE_SCAN.ACCESS_DENIED}</p>
                                <p className="text-sm text-red-500 mt-1 font-semibold">{UI_STRINGS.FACE_SCAN.ONLY_STUDENTS}</p>
                            </div>
                            {message && (
                                <div className="w-full bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                                    <p className="text-xs text-red-500 font-semibold uppercase tracking-wide mb-1">{UI_STRINGS.FACE_SCAN.DETECTED_ROLE}</p>
                                    <p className="text-sm font-black text-red-600">{message}</p>
                                </div>
                            )}
                            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                                <p className="text-xs font-bold text-amber-700 flex items-center gap-1">
                                    <AlertTriangle className="w-3.5 h-3.5" /> {UI_STRINGS.FACE_SCAN.WHAT_HAPPENED}
                                </p>
                                <p className="text-xs text-amber-700">
                                    {UI_STRINGS.FACE_SCAN.DETECTED_A} <strong>{message || "non-student"}</strong> {UI_STRINGS.FACE_SCAN.ACCOUNT_TXT} <strong>{UI_STRINGS.FACE_SCAN.STRICTLY_STUDENT}</strong>.
                                </p>
                                <div className="border-t border-amber-200 pt-2 mt-2">
                                    <p className="text-xs font-bold text-amber-700 mb-1">{UI_STRINGS.FACE_SCAN.BLOCKED_ROLES}</p>
                                    <div className="flex flex-wrap gap-1">
                                        {["ADMIN", "SUPER_ADMIN", "TEACHER", "PRINCIPAL", "ACCOUNTANT", "PARENT", "RECEPTIONIST"].map((role) => (
                                            <span key={role} className="text-xs px-1.5 py-0.5 bg-red-100 text-red-600 rounded font-mono font-semibold">{role}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                                <p className="font-semibold mb-1">{UI_STRINGS.FACE_SCAN.NOTE}</p>
                                <p>{UI_STRINGS.FACE_SCAN.NOTE_DESC}</p>
                            </div>
                        </div>
                    )}
                    {status === "low_confidence" && (
                        <div className="flex flex-col items-center gap-4 py-6">
                            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-amber-500" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-gray-800">{UI_STRINGS.FACE_SCAN.LOW_CONFIDENCE}</p>
                                <p className="text-sm text-gray-500 mt-1">{UI_STRINGS.FACE_SCAN.CONF_TOO_LOW}</p>
                            </div>
                            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">{UI_STRINGS.FACE_SCAN.FACE_CONF}</span>
                                        <span className="text-amber-600 font-bold">{confidence?.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-amber-400 rounded-full transition-all duration-500" style={{ width: `${confidence}%` }} />
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-semibold mb-1">
                                        <span className="text-gray-600">{UI_STRINGS.FACE_SCAN.REQ_THRESHOLD}</span>
                                        <span className="text-green-600 font-bold">{threshold?.toFixed(1)}%</span>
                                    </div>
                                    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${threshold}%` }} />
                                    </div>
                                </div>
                                <p className="text-xs text-amber-700 text-center font-medium pt-1">
                                    {UI_STRINGS.FACE_SCAN.NEEDS} <strong>{(threshold - confidence).toFixed(1)}{UI_STRINGS.FACE_SCAN.MORE_CONF_TO_PASS}</strong>
                                </p>
                            </div>
                            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 space-y-2">
                                <p className="text-xs font-bold text-gray-600">{UI_STRINGS.FACE_SCAN.HOW_TO_IMPROVE}</p>
                                <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                                    {UI_STRINGS.FACE_SCAN.IMPROVE_TIPS.map(tip => (
                                        <li key={tip}>{tip}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    {status === "error" && (
                        <div className="flex flex-col items-center gap-4 py-8">
                            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                                <XCircle className="w-8 h-8 text-red-400" />
                            </div>
                            <div className="text-center">
                                <p className="text-base font-bold text-gray-800">{UI_STRINGS.FACE_SCAN.SCAN_FAILED}</p>
                                <p className="text-sm text-red-500 mt-1">{message}</p>
                            </div>
                            <div className="w-full bg-red-50 border border-red-100 rounded-xl p-3 space-y-1.5">
                                <p className="text-xs font-semibold text-red-700">{UI_STRINGS.FACE_SCAN.POSSIBLE_REASONS}</p>
                                <ul className="list-disc list-inside text-xs text-red-600 space-y-0.5">
                                    {UI_STRINGS.FACE_SCAN.FAILED_REASONS.map(reason => (
                                        <li key={reason}>{reason}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}