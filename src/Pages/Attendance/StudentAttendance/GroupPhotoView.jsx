import { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import {
    Camera, Upload, ArrowLeft, X, AlertTriangle, CheckCircle2,
    Clock, ChevronRight, VideoOff, Loader2, Trash2, RefreshCw,
    Users,
} from "lucide-react";
import { groupMarkAttendance, unmarkAttendance } from "../../../Api/AttendanceApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const mapStatus = (apiStatus) => {
    if (!apiStatus) return "Not Marked";
    const s = apiStatus.toUpperCase();
    if (s === "PRESENT") return "Present";
    if (s === "LATE") return "Late";
    if (s === "PRESENT_MANUAL" || s === "MANUAL") return "Present (Manual)";
    return "Not Marked";
};

const avatarColor = (initials = "??") => {
    const colors = [
        "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
        "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
        "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700",
    ];
    return colors[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % colors.length];
};

const confidenceColor = (c) => {
    if (!c) return "bg-gray-200";
    if (c >= 80) return "bg-green-500";
    if (c >= 60) return "bg-yellow-500";
    return "bg-red-500";
};

// ─── Response Normalizer ──────────────────────────────────────────────────────
const extractGroupResponse = (res) => {
    if (!res) return null;
    if (res.data && typeof res.data === "object" && Array.isArray(res.data.results)) {
        return res.data;
    }
    if (Array.isArray(res.results)) return res;
    return res;
};

// ─── UnmarkInlineButton ───────────────────────────────────────────────────────
function UnmarkInlineButton({ attendanceId }) {
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    if (done) return <span className="text-xs text-gray-400 italic">Unmarked</span>;
    return (
        <button
            onClick={async () => {
                if (!attendanceId) return;
                setLoading(true);
                try { await unmarkAttendance(attendanceId, "Unmarked from group photo review"); setDone(true); }
                catch (err) { alert(err.message || "Failed to unmark"); }
                finally { setLoading(false); }
            }}
            disabled={loading}
            className="text-xs text-red-400 hover:text-red-600 cursor-pointer flex items-center gap-1 transition-colors disabled:opacity-50"
        >
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
            Unmark
        </button>
    );
}

// ─── ResultCard ───────────────────────────────────────────────────────────────
function ResultCard({ result, type }) {
    const ini = getInitials(result.studentName || "");
    const bgMap = { marked: "bg-green-50 border-green-100", already: "bg-gray-50 border-gray-100", unknown: "bg-amber-50 border-amber-100" };
    return (
        <div className={`border rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${bgMap[type]}`}>
            <div className="flex items-center gap-2.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${type === "unknown" ? "bg-amber-100 text-amber-600" : avatarColor(ini)}`}>
                    {type === "unknown" ? "?" : ini}
                </div>
                <div>
                    {type === "unknown" ? (
                        <><p className="text-sm font-semibold text-gray-800">Face #{result.faceIndex + 1}</p><p className="text-xs text-gray-400">Confidence: {result.confidenceScore?.toFixed(1) ?? "—"}%</p></>
                    ) : (
                        <><p className="text-sm font-semibold text-gray-800">{result.studentName}</p><p className="text-xs text-gray-400">Roll {result.rollNumber} · ID: {result.studentId}{result.checkInTime && ` · ${result.checkInTime.slice(0, 5)}`}</p></>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap justify-end">
                {type === "marked" && (<><span className="text-xs font-semibold text-green-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> {mapStatus(result.attendanceStatus)}</span><div className="flex items-center gap-1"><div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className={`h-full rounded-full ${confidenceColor(result.confidenceScore)}`} style={{ width: `${result.confidenceScore ?? 0}%` }} /></div><span className="text-xs font-mono text-gray-500">{result.confidenceScore?.toFixed(1) ?? "—"}%</span></div><UnmarkInlineButton attendanceId={result.attendanceId} /></>)}
                {type === "already" && <span className="text-xs font-semibold text-gray-500 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Already Marked</span>}
                {type === "unknown" && <span className="text-xs font-semibold text-amber-600 flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Below Threshold</span>}
            </div>
        </div>
    );
}

// ─── WebcamModal (FIXED: landscape 16:9 for group photos) ────────────────────
function WebcamModal({ onClose, onCapture, processing }) {
    const webcamRef = useRef(null);
    const [camError, setCamError] = useState(false);
    const [captured, setCaptured] = useState(null);
    const [facingMode, setFacingMode] = useState("environment"); // default back cam for group

    // ✅ FIX: Landscape 16:9 constraints — wide enough to fit 10 people
    const videoConstraints = {
        facingMode,
        width: { ideal: 1920 },
        height: { ideal: 1080 },
        aspectRatio: 16 / 9,
    };

    const handleCapture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot({ width: 1920, height: 1080 });
        if (!imageSrc) { alert("Could not capture. Try again."); return; }

        const [header, base64] = imageSrc.split(",");
        const mime = header.match(/:(.*?);/)[1];
        const binary = atob(base64);
        const arr = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) arr[i] = binary.charCodeAt(i);
        const file = new File([new Blob([arr], { type: mime })], "group_photo.jpg", { type: mime });

        setCaptured({ dataUrl: imageSrc, file });
    }, []);

    const handleConfirm = () => {
        if (captured) onCapture(captured.file, captured.dataUrl);
    };

    const handleRetake = () => setCaptured(null);

    const toggleCamera = () => {
        setCaptured(null);
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    return (
        // ✅ FIX: Full-screen landscape modal, max-w-5xl
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-2 sm:p-4">
            <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-5xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-gray-800 text-sm">
                            {captured ? "Review Group Photo" : "Take Group Photo"}
                        </span>
                        {!captured && (
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                Wide-angle · Fit all students
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {!captured && (
                            <button onClick={toggleCamera} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                                <RefreshCw className="w-3.5 h-3.5" />
                                {facingMode === "user" ? "Back cam" : "Front cam"}
                            </button>
                        )}
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors cursor-pointer">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* ✅ FIX: Camera area — 16:9 landscape aspect ratio */}
                <div className="relative bg-black" style={{ aspectRatio: "16/9" }}>
                    {captured ? (
                        <img src={captured.dataUrl} alt="Captured" className="w-full h-full object-contain bg-black" />
                    ) : camError ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-gray-400">
                            <VideoOff className="w-12 h-12 text-gray-500" />
                            <p className="text-sm text-center px-6">Camera unavailable. Use "Upload Photo" instead.</p>
                        </div>
                    ) : (
                        <>
                            <Webcam
                                ref={webcamRef}
                                audio={false}
                                screenshotFormat="image/jpeg"
                                screenshotQuality={1}
                                videoConstraints={videoConstraints}
                                onUserMediaError={() => setCamError(true)}
                                className="w-full h-full object-cover"
                                mirrored={facingMode === "user"}
                            />
                            {/* ✅ FIX: Wide group frame guide instead of single face oval */}
                            <div className="absolute inset-0 pointer-events-none">
                                {/* Subtle vignette */}
                                <div className="absolute inset-0 bg-black/15" style={{
                                    maskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, black 100%)",
                                    WebkitMaskImage: "radial-gradient(ellipse 85% 75% at 50% 50%, transparent 55%, black 100%)"
                                }} />

                                {/* Wide rectangular group frame */}
                                <div className="absolute" style={{
                                    left: "50%", top: "50%",
                                    transform: "translate(-50%, -50%)",
                                    width: "88%", height: "75%",
                                    border: "2px dashed rgba(96, 165, 250, 0.85)",
                                    borderRadius: "10px",
                                }}>
                                    {/* Corner brackets */}
                                    <div className="absolute -top-0.5 -left-0.5 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg" />
                                    <div className="absolute -top-0.5 -right-0.5 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg" />
                                    <div className="absolute -bottom-0.5 -left-0.5 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg" />

                                    {/* Center label inside frame */}
                                    <div className="absolute top-3 left-1/2 -translate-x-1/2">
                                        <div className="bg-blue-600/70 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                                            <Users className="w-3 h-3" />
                                            Fit all students in this frame
                                        </div>
                                    </div>

                                    {/* Person silhouette guides — 10 slots */}
                                    <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-4">
                                        {Array.from({ length: 10 }).map((_, i) => (
                                            <div key={i} className="flex flex-col items-center gap-0.5 opacity-40">
                                                <div className="w-4 h-4 rounded-full border border-white/60" />
                                                <div className="w-3 h-3 rounded-sm border border-white/60" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bottom tip */}
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                                    <div className="bg-black/60 backdrop-blur-sm text-white text-xs px-4 py-2 rounded-full flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                                        Hold phone horizontal · Everyone faces camera · Good lighting
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="p-3 sm:p-4 bg-gray-50 border-t border-gray-200 shrink-0">
                    {captured ? (
                        <div className="space-y-3">
                            <div className="bg-white border border-gray-200 rounded-xl p-3">
                                <p className="text-xs font-semibold text-gray-600 mb-2">Before confirming, check:</p>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                    {[
                                        "All faces clearly visible",
                                        "No student cut off at edges",
                                        "Not blurry or too dark",
                                        "Everyone facing forward",
                                    ].map((tip) => (
                                        <div key={tip} className="flex items-start gap-1.5 text-xs text-gray-500">
                                            <CheckCircle2 className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
                                            {tip}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={handleRetake} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 cursor-pointer transition-colors">
                                    <RefreshCw className="w-4 h-4" /> Retake
                                </button>
                                <button onClick={handleConfirm} disabled={processing} className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                                    {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                    {processing ? "Sending..." : "Looks Good — Send"}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-2">
                            <button onClick={onClose} className="px-4 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-100 cursor-pointer transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleCapture} disabled={camError} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                                <Camera className="w-4 h-4" /> Capture Group Photo
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── SummaryCounters ──────────────────────────────────────────────────────────
function SummaryCounters({ groupResult }) {
    const items = [
        { val: groupResult.totalFacesDetected ?? 0, label: "Faces Detected", color: "bg-blue-50 border-blue-100", text: "text-blue-700" },
        { val: groupResult.totalMarkedNow ?? 0, label: "Marked Now", color: "bg-green-50 border-green-100", text: "text-green-700", icon: <CheckCircle2 className="w-4 h-4" /> },
        { val: groupResult.totalAlreadyMarked ?? 0, label: "Already Marked", color: "bg-gray-50 border-gray-200", text: "text-gray-600", icon: <Clock className="w-4 h-4" /> },
        { val: groupResult.totalBelowThreshold ?? 0, label: "Unrecognized", color: "bg-amber-50 border-amber-100", text: "text-amber-700", icon: <AlertTriangle className="w-4 h-4" /> },
    ];
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            {items.map((c) => (
                <div key={c.label} className={`${c.color} border rounded-xl p-3 sm:p-4 text-center`}>
                    <p className={`text-2xl sm:text-3xl font-black ${c.text}`}>{c.val}</p>
                    <p className={`text-xs font-semibold ${c.text} flex items-center justify-center gap-1 mt-1`}>{c.icon}<span className="leading-tight">{c.label}</span></p>
                </div>
            ))}
        </div>
    );
}

// ─── Tab 0: Upload ────────────────────────────────────────────────────────────
function UploadTab({ selectedClass, selectedSection, groupError, processing, capturedPreview, onOpenWebcam, onFileSelect }) {
    const fileRef = useRef();

    return (
        <div className="p-4 sm:p-5 space-y-4">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                <p className="text-xs font-semibold text-blue-700 mb-1.5">For best group face detection:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                    {[
                        "All faces visible — no one hidden behind others",
                        "Hold phone horizontally (landscape)",
                        "Well-lit — no strong backlight",
                        "Everyone facing the camera",
                    ].map(tip => (
                        <p key={tip} className="text-xs text-blue-600 flex items-start gap-1">
                            <span className="text-blue-400 shrink-0 mt-0.5">•</span>{tip}
                        </p>
                    ))}
                </div>
            </div>

            {groupError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex gap-2 text-sm text-red-700">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                    <div><p className="font-semibold">Error</p><p className="text-xs mt-0.5">{groupError}</p></div>
                </div>
            )}

            {processing && capturedPreview && (
                <div className="rounded-xl overflow-hidden border border-blue-200 shadow-sm">
                    <div className="relative">
                        <img src={capturedPreview} alt="Processing" className="w-full max-h-56 object-contain bg-gray-900" />
                        <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center">
                            <div className="bg-white rounded-2xl px-5 py-4 flex flex-col items-center gap-2 shadow-lg">
                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm font-semibold text-gray-700">Detecting faces...</p>
                                <p className="text-xs text-gray-400">AI is scanning the group photo</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {processing && !capturedPreview && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-8 flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    <p className="text-sm text-blue-700 font-semibold">Processing with AI face recognition...</p>
                </div>
            )}

            {!processing && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button onClick={onOpenWebcam}
                        className="flex flex-col items-center justify-center gap-3 border-2 border-blue-200 rounded-xl p-5 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all cursor-pointer group">
                        <div className="w-14 h-14 rounded-2xl bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center shadow-md transition-colors">
                            <Camera className="w-7 h-7 text-white" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-blue-700 text-sm">Open Camera</p>
                            <p className="text-xs text-blue-500 mt-0.5">Landscape · Group frame guide</p>
                        </div>
                    </button>
                    <button onClick={() => fileRef.current?.click()}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); onFileSelect(e.dataTransfer.files[0]); }}
                        className="flex flex-col items-center justify-center gap-3 border-2 border-dashed border-gray-300 rounded-xl p-5 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all cursor-pointer group">
                        <div className="w-14 h-14 rounded-2xl bg-gray-200 group-hover:bg-gray-300 flex items-center justify-center shadow-md transition-colors">
                            <Upload className="w-7 h-7 text-gray-600" />
                        </div>
                        <div className="text-center">
                            <p className="font-bold text-gray-700 text-sm">Upload Photo</p>
                            <p className="text-xs text-gray-500 mt-0.5">JPEG / PNG from device</p>
                        </div>
                    </button>
                </div>
            )}

            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFileSelect(e.target.files[0])} />

            {/* ✅ FIX: Show actual selected class & section IDs for debugging visibility */}
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="flex items-center gap-2 mb-1">
                    <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded">POST</span>
                    <span className="text-xs font-mono text-gray-600">/attendance/students/group-mark</span>
                </div>
                <p className="text-xs text-gray-400">
                    class_id=<span className="font-mono font-semibold text-gray-700">{selectedClass?.id ?? "⚠ not set"}</span>
                    {" "}· section_id=<span className="font-mono font-semibold text-gray-700">{selectedSection?.id ?? "⚠ not set"}</span>
                    {" "}· class=<span className="font-mono font-semibold text-gray-700">{selectedClass?.name ?? "—"}</span>
                    {" "}· section=<span className="font-mono font-semibold text-gray-700">{selectedSection?.name ?? "—"}</span>
                </p>
            </div>
        </div>
    );
}

// ─── Tab 1: Review Results ────────────────────────────────────────────────────
function ReviewTab({ groupResult, capturedPreview, onUploadAnother, onConfirm }) {
    const results = groupResult?.results ?? [];
    const markedNow      = results.filter(r => r.markStatus === "MARKED_NOW");
    const alreadyMarked  = results.filter(r => r.markStatus === "ALREADY_MARKED");
    const belowThreshold = results.filter(r => r.markStatus === "BELOW_THRESHOLD");
    const noFaces = (groupResult.totalFacesDetected ?? 0) === 0;

    return (
        <div className="p-4 sm:p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
                {capturedPreview && (
                    <div className="sm:w-48 shrink-0 rounded-xl overflow-hidden border border-gray-200 bg-gray-900">
                        <img src={capturedPreview} alt="Processed" className="w-full h-full object-contain max-h-40 sm:max-h-none" />
                        <p className="text-xs text-gray-400 text-center py-1.5 bg-gray-50 border-t border-gray-100">Processed photo</p>
                    </div>
                )}
                <div className="flex-1">
                    <SummaryCounters groupResult={groupResult} />
                </div>
            </div>

            {noFaces && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold text-red-700">No faces detected</p>
                            <p className="text-xs text-red-600 mt-0.5">Most common reasons:</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 ml-7">
                        {[
                            "Forehead/top of head cut off",
                            "Faces sideways or tilted too much",
                            "Students too far from camera",
                            "Dark lighting or heavy shadow",
                            "Faces partially covered",
                            "Students not enrolled in face recognition",
                        ].map(r => (
                            <p key={r} className="text-xs text-red-600 flex items-start gap-1.5">
                                <span className="text-red-400 shrink-0 mt-0.5">•</span>{r}
                            </p>
                        ))}
                    </div>
                    <button onClick={onUploadAnother}
                        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-5 py-2.5 text-sm font-semibold cursor-pointer transition-colors">
                        <Camera className="w-4 h-4" /> Try Again with Better Photo
                    </button>
                </div>
            )}

            {!noFaces && (groupResult.totalBelowThreshold ?? 0) > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2 text-sm text-amber-800">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                    <p><strong>{groupResult.totalBelowThreshold} face(s) unmatched.</strong> Student may not be enrolled. Mark them manually.</p>
                </div>
            )}

            {markedNow.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Newly Marked — {markedNow.length} students</p>
                    <div className="space-y-2">{markedNow.map(r => <ResultCard key={`m-${r.faceIndex}`} result={r} type="marked" />)}</div>
                </div>
            )}

            {alreadyMarked.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Already Marked (Skipped)</p>
                    <div className="space-y-2">{alreadyMarked.map(r => <ResultCard key={`a-${r.faceIndex}`} result={r} type="already" />)}</div>
                </div>
            )}

            {belowThreshold.length > 0 && (
                <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Unrecognized Faces</p>
                    <div className="space-y-2">{belowThreshold.map(r => <ResultCard key={`b-${r.faceIndex}`} result={r} type="unknown" />)}</div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-between pt-1">
                <button onClick={onUploadAnother}
                    className="flex items-center justify-center gap-2 border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Upload Another Photo
                </button>
                {!noFaces && (
                    <button onClick={onConfirm}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 py-2.5 text-sm font-semibold cursor-pointer transition-colors">
                        Confirm & Done <ChevronRight className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Tab 2: Done ──────────────────────────────────────────────────────────────
function DoneTab({ groupResult, onBack }) {
    return (
        <div className="p-8 sm:p-10 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-500 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-gray-800">Attendance Updated</h3>
            {groupResult && (
                <p className="text-gray-500 text-sm">
                    {groupResult.totalMarkedNow ?? 0} newly marked · {groupResult.totalAlreadyMarked ?? 0} already marked · {groupResult.totalBelowThreshold ?? 0} unrecognized
                </p>
            )}
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 max-w-md text-left text-sm text-green-800">
                <p>✔ Unrecognized students appear as <strong>Not Marked</strong> in the roster. Use <strong>Manual Mark</strong> or <strong>Individual Face Scan</strong> for them.</p>
            </div>
            <button onClick={onBack} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 sm:px-8 py-3 text-sm font-semibold cursor-pointer transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Full Roster
            </button>
        </div>
    );
}

// ─── Main GroupPhotoView Component ────────────────────────────────────────────
export default function GroupPhotoView({ onBack, selectedClass, selectedSection }) {
    const [tab, setTab] = useState(0);
    const [processing, setProcessing] = useState(false);
    const [showWebcam, setShowWebcam] = useState(false);
    const [groupResult, setGroupResult] = useState(null);
    const [groupError, setGroupError] = useState(null);
    const [capturedPreview, setCapturedPreview] = useState(null);

    // ✅ FIX: Log received props so you can see exactly what IDs are being passed in
    useEffect(() => {
        console.log("[GroupPhotoView] Props received →", {
            classId: selectedClass?.id,
            className: selectedClass?.name,
            sectionId: selectedSection?.id,
            sectionName: selectedSection?.name,
        });
    }, [selectedClass, selectedSection]);

    const TABS = ["1 · Upload Photos", "2 · Review Results", "3 · Confirm & Done"];

    const submitGroupPhoto = async (imageFile, previewUrl = null) => {
        // ✅ FIX: Validate IDs before submitting and warn clearly
        if (!selectedClass?.id || !selectedSection?.id) {
            alert(`Cannot submit: missing class or section.\nclass_id=${selectedClass?.id}, section_id=${selectedSection?.id}\n\nPlease go back and reselect the class and section.`);
            return;
        }

        setProcessing(true);
        setGroupResult(null);
        setGroupError(null);
        if (previewUrl) setCapturedPreview(previewUrl);

        // ✅ FIX: Log exactly what's being sent so you can verify IDs in console
        console.log("[GroupPhotoView] Submitting group photo →", {
            classId: selectedClass.id,
            className: selectedClass.name,
            sectionId: selectedSection.id,
            sectionName: selectedSection.name,
            imageSize: `${(imageFile.size / 1024).toFixed(0)}KB`,
            imageType: imageFile.type,
        });

        try {
            const rawRes = await groupMarkAttendance({
                classId: selectedClass.id,
                sectionId: selectedSection.id,
                image: imageFile,
                gps_latitude: "28.6139",
                gps_longitude: "77.209",
            });

            console.log("[GroupPhotoView] API response:", rawRes);

            const data = extractGroupResponse(rawRes);
            setGroupResult(data);
            setTab(1);
        } catch (err) {
            const msg = err?.response?.data?.message || err?.message || "Failed to process group photo";
            console.error("[GroupPhotoView] Error:", msg);
            setGroupError(msg);
        } finally {
            setProcessing(false);
        }
    };

    const handleWebcamCapture = (file, previewDataUrl) => {
        setShowWebcam(false);
        const previewUrl = URL.createObjectURL(file);
        submitGroupPhoto(file, previewDataUrl || previewUrl);
    };

    const handleFileSelect = async (file) => {
        if (!file) return;
        const previewUrl = URL.createObjectURL(file);
        submitGroupPhoto(file, previewUrl);
    };

    const handleUploadAnother = () => {
        setGroupResult(null);
        setGroupError(null);
        setCapturedPreview(null);
        setTab(0);
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center gap-3 flex-wrap">
                <button onClick={onBack} className="flex items-center gap-1 text-sm text-blue-600 hover:underline cursor-pointer">
                    <ArrowLeft className="w-4 h-4" /> Back to Roster
                </button>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-2 flex-wrap">
                    <Camera className="w-5 h-5 text-gray-600 shrink-0" />
                    <h2 className="font-bold text-gray-800 text-base">Group Photo Attendance</h2>
                    {selectedClass && selectedSection && (
                        <span className="text-sm text-gray-500 hidden sm:inline">
                            {selectedClass.name} · {selectedSection.name}
                            {/* ✅ FIX: Show IDs in header so teacher can verify */}
                            <span className="text-xs text-gray-400 ml-1">(class {selectedClass.id} · section {selectedSection.id})</span>
                        </span>
                    )}
                </div>
            </div>

            {/* Webcam Modal */}
            {showWebcam && (
                <WebcamModal
                    onClose={() => setShowWebcam(false)}
                    onCapture={handleWebcamCapture}
                    processing={processing}
                />
            )}

            {/* Card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <div className="flex overflow-x-auto">
                        {TABS.map((t, i) => (
                            <button key={t}
                                onClick={() => {
                                    if (i === 0) setTab(0);
                                    else if (i === 1 && groupResult) setTab(1);
                                    else if (i === 2 && groupResult) setTab(2);
                                }}
                                className={`flex-1 min-w-max px-3 sm:px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-colors whitespace-nowrap ${
                                    tab === i ? "border-blue-600 text-blue-600 bg-blue-50 cursor-pointer"
                                    : i > 0 && !groupResult ? "border-transparent text-gray-300 cursor-not-allowed"
                                    : "border-transparent text-gray-500 hover:text-gray-700 cursor-pointer"
                                }`}>
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                {tab === 0 && (
                    <UploadTab
                        selectedClass={selectedClass}
                        selectedSection={selectedSection}
                        groupError={groupError}
                        processing={processing}
                        capturedPreview={capturedPreview}
                        onOpenWebcam={() => setShowWebcam(true)}
                        onFileSelect={handleFileSelect}
                    />
                )}
                {tab === 1 && groupResult && (
                    <ReviewTab
                        groupResult={groupResult}
                        capturedPreview={capturedPreview}
                        onUploadAnother={handleUploadAnother}
                        onConfirm={() => setTab(2)}
                    />
                )}
                {tab === 2 && (
                    <DoneTab groupResult={groupResult} onBack={onBack} />
                )}
            </div>
        </div>
    );
}