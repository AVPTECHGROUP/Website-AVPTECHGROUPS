import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import {
    Users,
    UserCheck,
    UserX,
    Search,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    ChevronLeft,
    ChevronRight,
    Trash2,
    X,
    FileText,
    Zap,
    Shield,
    Camera,
    AlertCircle,
    Upload,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import {
    getEnrollmentStats,
    getStaffEnrollment,
    enrollUserFaces,
    removeEnrollment,
} from "../../Api/AttendanceApi";

// ─── Constants ────────────────────────────────────────────────────────────────
const AVATAR_COLORS = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-rose-500",
    "bg-amber-500",
];

const ROLE_COLORS = {
    TEACHER: "bg-blue-100 text-blue-700",
    ADMIN: "bg-purple-100 text-purple-700",
    ACCOUNTANT: "bg-amber-100 text-amber-700",
    PRINCIPAL: "bg-teal-100 text-teal-700",
    RECEPTIONIST: "bg-pink-100 text-pink-700",
    SUPER_ADMIN: "bg-gray-100 text-gray-700",
};

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function StatusBadge({ status, photos }) {
    if (status === "ENROLLED")
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                <CheckCircle className="w-3.5 h-3.5" /> Enrolled
            </span>
        );
    if (status === "PARTIAL")
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5" /> Partial {photos}/5
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" /> Not Enrolled
        </span>
    );
}

function PhotoDots({ count, max = 5 }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <div key={i} className={`w-3 h-3 rounded-full ${i < count ? "bg-emerald-500" : "bg-gray-200"}`} />
            ))}
        </div>
    );
}

function ActionButton({ status, onEnroll, onReEnroll }) {
    if (status === "ENROLLED")
        return (
            <button onClick={onReEnroll} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition-colors border border-gray-200">
                <RefreshCw className="w-3.5 h-3.5" /> Re-enroll
            </button>
        );
    if (status === "PARTIAL")
        return (
            <button onClick={onEnroll} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors">
                <Camera className="w-3.5 h-3.5" /> Complete
            </button>
        );
    return (
        <button onClick={onEnroll} className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
            <Zap className="w-3.5 h-3.5" /> Enroll
        </button>
    );
}

function ReEnrollModal({ staff, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Re-enroll Staff?</h3>
                        <p className="text-xs text-gray-500 mt-0.5">This will remove all existing face data</p>
                    </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
                    <p className="text-sm font-semibold text-gray-700">{staff?.name}</p>
                    <p className="text-xs text-gray-400">{staff?.code} · {staff?.roles?.[0]}</p>
                </div>
                <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                    All <span className="font-semibold text-amber-600">existing face embeddings</span> will be permanently deleted. Staff will need to be re-enrolled.
                </p>
                <div className="flex gap-3">
                    <button onClick={onCancel} disabled={loading} className="cursor-pointer flex-1 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-semibold transition-colors">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} className="cursor-pointer flex-1 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2">
                        {loading ? <><RefreshCw className="w-4 h-4 animate-spin" /> Removing...</> : "Yes, Re-enroll"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── PhotoCaptureModal ────────────────────────────────────────────────────────
function PhotoCaptureModal({ slotIndex, onCapture, onClose }) {
    const [mode, setMode] = useState(null);
    const [cameraFacing, setCameraFacing] = useState("user");
    const [cameraReady, setCameraReady] = useState(false);
    const [capturedPreview, setCapturedPreview] = useState(null);
    const webcamRef = useRef(null);
    const fileInputRef = useRef(null);

    useEffect(() => { setCameraReady(false); }, [cameraFacing]);

    const handleCapture = useCallback(() => {
        if (!webcamRef.current) return;
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) return;
        fetch(imageSrc)
            .then((res) => res.blob())
            .then((blob) => {
                const file = new File([blob], `face_${slotIndex + 1}_${Date.now()}.jpg`, { type: "image/jpeg" });
                setCapturedPreview({ src: imageSrc, file });
            });
    }, [slotIndex]);

    const handleConfirmCapture = () => {
        if (!capturedPreview) return;
        onCapture(slotIndex, capturedPreview.file);
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        onCapture(slotIndex, file);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Photo Slot {slotIndex + 1} — Add Face Photo
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {mode === "camera" ? "Position face within the oval guide" : "Choose how to add this photo"}
                        </p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <X className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                </div>

                {!mode && (
                    <div className="p-5 space-y-3">
                        <button
                            onClick={() => setMode("camera")}
                            className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group text-left"
                        >
                            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-blue-800">Open Live Camera</p>
                                <p className="text-xs text-blue-500 mt-0.5">Click photo in real-time using webcam</p>
                            </div>
                        </button>
                        <button
                            onClick={() => { setMode("upload"); setTimeout(() => fileInputRef.current?.click(), 80); }}
                            className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all group text-left"
                        >
                            <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">Upload from Device</p>
                                <p className="text-xs text-gray-400 mt-0.5">Select an existing photo from your gallery</p>
                            </div>
                        </button>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                )}

                {mode === "camera" && (
                    <div className="p-4">
                        {capturedPreview ? (
                            <div>
                                <div className="rounded-xl overflow-hidden mb-3 bg-black" style={{ aspectRatio: "4/3" }}>
                                    <img src={capturedPreview.src} alt="Captured" className="w-full h-full object-cover"
                                        style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }} />
                                </div>
                                <p className="text-xs text-center text-gray-500 mb-3">Photo looks good? Confirm to use it.</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCapturedPreview(null)} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors">
                                        <RefreshCw className="w-3.5 h-3.5" /> Retake
                                    </button>
                                    <button onClick={handleConfirmCapture} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" /> Use This Photo
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="rounded-xl overflow-hidden mb-3 bg-gray-900 relative" style={{ aspectRatio: "4/3" }}>
                                    <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg" screenshotQuality={0.92}
                                        videoConstraints={{ facingMode: cameraFacing, width: 640, height: 480 }}
                                        onUserMedia={() => setCameraReady(true)} onUserMediaError={() => setCameraReady(false)}
                                        className="w-full h-full object-cover" style={{ transform: cameraFacing === "user" ? "scaleX(-1)" : "none" }} />
                                    {!cameraReady && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900">
                                            <RefreshCw className="w-6 h-6 text-gray-400 animate-spin mb-2" />
                                            <p className="text-xs text-gray-400">Starting camera...</p>
                                        </div>
                                    )}
                                    {cameraReady && (
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="border-2 border-white/70 border-dashed rounded-full" style={{ width: "42%", height: "68%" }} />
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                        F{slotIndex + 1}
                                    </div>
                                </div>
                                <button onClick={() => { setCameraFacing((f) => f === "user" ? "environment" : "user"); }}
                                    className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-medium transition-colors mb-3">
                                    <RefreshCw className="w-3 h-3" />
                                    {cameraFacing === "user" ? "Switch to Back Camera" : "Switch to Front Camera"}
                                </button>
                                <button onClick={handleCapture} disabled={!cameraReady}
                                    className={`cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                                        ${cameraReady ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                                    <Camera className="w-4 h-4" /> Click Photo
                                </button>
                                <button onClick={() => { setMode(null); setCameraReady(false); }}
                                    className="cursor-pointer w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                    ← Back to options
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {mode === "upload" && (
                    <div className="p-5">
                        <div className="flex flex-col items-center justify-center py-6 gap-3">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Upload className="w-5 h-5 text-gray-500" />
                            </div>
                            <p className="text-sm text-gray-600 font-medium">Opening file picker...</p>
                            <p className="text-xs text-gray-400 text-center">If it didn't open, tap Browse Files below</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                                Browse Files
                            </button>
                            <button onClick={() => setMode(null)}
                                className="cursor-pointer flex-1 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-xs font-semibold transition-colors">
                                Back
                            </button>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    </div>
                )}
            </div>
        </div>
    );
}

function PhotoSlot({ index, file, onAdd, onRemove }) {
    const [showModal, setShowModal] = useState(false);
    const preview = file ? URL.createObjectURL(file) : null;

    return (
        <>
            {showModal && (
                <PhotoCaptureModal slotIndex={index} onCapture={onAdd} onClose={() => setShowModal(false)} />
            )}
            <div className="relative">
                <div
                    onClick={() => !file && setShowModal(true)}
                    className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all overflow-hidden
                        ${file ? "border-emerald-400 bg-emerald-50" : "border-dashed border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"}`}
                >
                    {file
                        ? <img src={preview} alt={`F${index + 1}`} className="w-full h-full object-cover" />
                        : <><Camera className="w-6 h-6 text-gray-400 mb-1" /><span className="text-xs text-gray-500 font-medium">F{index + 1}</span></>
                    }
                </div>
                {file && (
                    <button onClick={() => onRemove(index)} className="cursor-pointer absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors z-10">
                        <X className="w-3 h-3" />
                    </button>
                )}
                {file && (
                    <div className="absolute bottom-1 left-1 right-1 flex justify-center">
                        <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.5 rounded font-semibold">✓ Good</span>
                    </div>
                )}
            </div>
        </>
    );
}

function Toast({ message, type, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
            ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message}
            <button onClick={onClose} className="cursor-pointer ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StaffAttendanceRegistration() {

    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // ── Single source of truth: all staff from enrollment API (size=500, no filter) ──
    const [allStaff, setAllStaff] = useState([]);
    const [allStaffLoading, setAllStaffLoading] = useState(true);
    const [userSearch, setUserSearch] = useState("");

    const [enrollmentMap, setEnrollmentMap] = useState({});

    const [tablePage, setTablePage] = useState(0);
    const [filterStatus, setFilterStatus] = useState("");

    // ── Upload / Enroll state ──
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [photos, setPhotos] = useState(Array(5).fill(null));
    const [activeStep, setActiveStep] = useState(1);

    const [enrolling, setEnrolling] = useState(false);
    const [reEnrollTarget, setReEnrollTarget] = useState(null);
    const [reEnrollLoading, setReEnrollLoading] = useState(false);
    const [toast, setToast] = useState(null);

    const uploadPanelRef = useRef(null);

    const fetchAllStaff = useCallback(async () => {
        try {
            setAllStaffLoading(true);
            const res = await getStaffEnrollment(0, 500, "id", undefined);
            const records = res.data || [];
            setAllStaff(records);

            const map = {};
            records.forEach((r) => { map[r.userId] = r; });
            setEnrollmentMap(map);
        } catch (e) {
            console.error("fetchAllStaff error:", e);
        } finally {
            setAllStaffLoading(false);
        }
    }, []);

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await getEnrollmentStats();
            setStats(res.data);
        } catch (e) { console.error(e); }
        finally { setStatsLoading(false); }
    }, []);

    useEffect(() => {
        fetchStats();
        fetchAllStaff();
    }, [fetchStats, fetchAllStaff]);


    useEffect(() => {
        if (!selectedStaff?.userId) return;
        const live = enrollmentMap[selectedStaff.userId];
        if (!live) return;
        setSelectedStaff((prev) => {
            if (
                prev.enrollmentStatus === live.enrollmentStatus &&
                prev.photosCount === (live.photosCount || 0)
            ) return prev;
            return {
                ...prev,
                enrollmentStatus: live.enrollmentStatus,
                photosCount: live.photosCount || 0,
                fullyEnrolled: live.fullyEnrolled,
            };
        });
    }, [enrollmentMap]);

    const refreshAll = useCallback(async (targetUserId) => {
        const [freshAllStaffRes] = await Promise.all([
            getStaffEnrollment(0, 500, "id"),
            fetchStats()
        ]);

        const freshRecords = freshAllStaffRes.data || [];
        const freshMap = {};
        freshRecords.forEach((r) => { freshMap[r.userId] = r; });
        setAllStaff(freshRecords);
        setEnrollmentMap(freshMap);

        if (targetUserId && freshMap[targetUserId]) {
            const live = freshMap[targetUserId];
            setSelectedStaff((prev) =>
                prev?.userId === targetUserId
                    ? { ...prev, enrollmentStatus: live.enrollmentStatus, photosCount: live.photosCount || 0, fullyEnrolled: live.fullyEnrolled }
                    : prev
            );
        }
    }, [fetchStats]);

    const showToast = (message, type = "success") => setToast({ message, type });

    const scrollToUpload = () =>
        setTimeout(() => uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    const handleSelectStaff = (record) => {
        setSelectedStaff({
            userId: record.userId,
            name: record.name,
            code: record.code || "—",
            roles: record.roles,
            userType: record.userType || record.roles?.[0] || "TEACHER",
            enrollmentStatus: record.enrollmentStatus,
            photosCount: record.photosCount || 0,
            fullyEnrolled: record.fullyEnrolled,
        });
        setPhotos(Array(5).fill(null));
        setActiveStep(2);
        scrollToUpload();
    };

    const handleTableEnroll = (staff) => {
        setSelectedStaff({
            userId: staff.userId,
            name: staff.name,
            code: staff.code || "—",
            roles: staff.roles,
            userType: staff.userType || staff.roles?.[0] || "TEACHER",
            enrollmentStatus: staff.enrollmentStatus,
            photosCount: staff.photosCount || 0,
            fullyEnrolled: staff.fullyEnrolled,
        });
        setPhotos(Array(5).fill(null));
        setActiveStep(2);
        scrollToUpload();
    };

    const handleTableReEnroll = (staff) => setReEnrollTarget(staff);

    const confirmReEnroll = async () => {
        if (!reEnrollTarget) return;
        const targetId = reEnrollTarget.userId;
        const existing = enrollmentMap[targetId];

        if (!existing) {
            showToast("No enrollment found for this user", "error");
            setReEnrollTarget(null);
            return;
        }

        try {
            setReEnrollLoading(true);
            await removeEnrollment({
                userId: targetId,
                userType: existing?.roles?.[0] || reEnrollTarget?.roles?.[0],
            });
            showToast("Enrollment removed successfully");
            setReEnrollTarget(null);
            await refreshAll(targetId);
        } catch (e) {
            showToast(e.message || "Failed to remove enrollment", "error");
        } finally {
            setReEnrollLoading(false);
        }
    };

    const handleAddPhoto = (index, file) => {
        const updated = [...photos]; updated[index] = file; setPhotos(updated);
        if (activeStep < 3) setActiveStep(3);
    };
    const handleRemovePhoto = (index) => {
        const updated = [...photos]; updated[index] = null; setPhotos(updated);
    };
    const handleClearAll = () => setPhotos(Array(5).fill(null));

    const handleEnroll = async () => {
        if (uploadedCount < 5 || !selectedStaff) return;
        const enrolledId = selectedStaff.userId;
        try {
            setEnrolling(true);
            await enrollUserFaces({
                userId: enrolledId,
                userType: selectedStaff.userType || selectedStaff.roles?.[0] || "TEACHER",
                images: photos,
            });

            showToast(`${selectedStaff.name} enrolled successfully!`);
            setActiveStep(4);
            setPhotos(Array(5).fill(null));

            setSelectedStaff((prev) => ({
                ...prev,
                enrollmentStatus: "ENROLLED",
                photosCount: 5,
                fullyEnrolled: true,
            }));

            await refreshAll(enrolledId);
        } catch (e) {
            showToast(e.message || "Enrollment failed", "error");
        } finally {
            setEnrolling(false);
        }
    };

    const uploadedCount = photos.filter(Boolean).length;

    const filteredStaff = allStaff.filter((r) => {
        const q = userSearch.toLowerCase();
        return (
            (r.name || "").toLowerCase().includes(q) ||
            (r.code || "").toLowerCase().includes(q)
        );
    });

    const tableFilteredData = allStaff.filter((staff) => {
        if (!filterStatus) return true;
        return staff.enrollmentStatus === filterStatus;
    });
    const tablePageSize = 10;

    const paginatedStaff = tableFilteredData.slice(
        tablePage * tablePageSize,
        (tablePage + 1) * tablePageSize
    );

    const tableTotalPages = Math.max(
        1,
        Math.ceil(tableFilteredData.length / tablePageSize)
    );
    return (
        <div className="min-h-screen bg-[#EBF0F5] font-sans">
            {reEnrollTarget && (
                <ReEnrollModal staff={reEnrollTarget} onConfirm={confirmReEnroll}
                    onCancel={() => setReEnrollTarget(null)} loading={reEnrollLoading} />
            )}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* ── Header ── */}
            <div className="px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Staff Face Enrollment</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Register staff faces for automated attendance recognition</p>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* ── Stat Cards (Modified for 1024px Laptop layout) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statsLoading ? Array(4).fill(0).map((_, i) => <CardLoader key={i} />) : (
                        <>
                            <CardComponent IconName={Shield} keyName="Total Staff Registered" val={`${stats?.totalStaff ?? 0}`} iconTxColor="text-blue-600" iconBgColor="bg-blue-100" />
                            <CardComponent IconName={UserCheck} keyName="Staff Enrolled" val={`${stats?.staffEnrolled ?? 0} / ${stats?.totalStaff ?? 0}`} iconTxColor="text-emerald-600" iconBgColor="bg-emerald-100" />
                            <CardComponent IconName={UserX} keyName="Not Enrolled" val={`${(stats?.totalStaff ?? 0) - (stats?.staffEnrolled ?? 0)}`} iconTxColor="text-red-500" iconBgColor="bg-red-100" />
                            <CardComponent IconName={Users} keyName="Enrollment Completed" val={`${stats?.enrollmentPercentage ?? 0}%`} iconTxColor="text-purple-600" iconBgColor="bg-purple-100" />
                        </>
                    )}
                </div>

                {/* ── Staff List + Table ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Panel */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 h-full">
                            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Select Staff Member
                                {!allStaffLoading && (
                                    <span className="ml-auto text-xs font-normal text-gray-400">{allStaff.length} staff</span>
                                )}
                            </h2>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)}
                                    placeholder="Search by name or employee code..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                                {allStaffLoading ? (
                                    <div className="flex items-center justify-center py-10">
                                        <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                                    </div>
                                ) : filteredStaff.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-8">No staff found</p>
                                ) : filteredStaff.map((record, idx) => {
                                    const role = record.roles?.[0] || "—";
                                    const isSelected = selectedStaff?.userId === record.userId;

                                    return (
                                        <button
                                            key={record.userId}
                                            onClick={() => handleSelectStaff(record)}
                                            className={`cursor-pointer w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all
                                                ${isSelected ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-100 bg-white hover:border-gray-300 hover:bg-gray-50"}`}
                                        >
                                            <div className={`w-9 h-9 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                {getInitials(record.name) || "?"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate">{record.name}</p>
                                                <p className="text-xs text-gray-500">{record.code || "—"} · {role}</p>
                                            </div>
                                            {record.enrollmentStatus === "ENROLLED"
                                                ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                : record.enrollmentStatus === "PARTIAL"
                                                    ? <span className="text-[10px] font-bold text-amber-500 shrink-0">{record.photosCount}/5</span>
                                                    : <AlertTriangle className="w-3.5 h-3.5 text-gray-300 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Right Table */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden h-full flex flex-col">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 py-4 border-b border-gray-100">
                                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <FileText className="w-4 h-4 text-blue-500" /> Staff Enrollment Status
                                </h2>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); setTablePage(0); }}
                                    className="cursor-pointer text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-400 self-start sm:self-auto"
                                >
                                    <option value="">All Status</option>
                                    <option value="ENROLLED">Enrolled</option>
                                    <option value="NOT_ENROLLED">Not Enrolled</option>
                                    <option value="PARTIAL">Partial</option>
                                </select>
                            </div>

                            <div className="overflow-x-auto flex-1">
                                {allStaffLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                                    </div>
                                ) : (
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-100">
                                                {["Staff Member", "Role", "Photos", "Status", "Actions"].map((h) => (
                                                    <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 whitespace-nowrap">{h}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {paginatedStaff.length === 0 ? (
                                                <tr><td colSpan={5} className="text-center py-12 text-sm text-gray-400">No staff members found</td></tr>
                                            ) : paginatedStaff.map((staff, idx) => {
                                                const role = staff.roles?.[0] || staff.userType || "—";
                                                return (
                                                    <tr key={staff.userId}
                                                        className={`hover:bg-blue-50/40 transition-colors ${selectedStaff?.userId === staff.userId ? "bg-blue-50/60" : ""}`}>
                                                        <td className="px-4 py-3">
                                                            <div className="flex items-center gap-2.5">
                                                                <div className={`w-8 h-8 rounded-full ${AVATAR_COLORS[idx % AVATAR_COLORS.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                                    {getInitials(staff.name)}
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-gray-800 text-xs leading-tight">{staff.name}</p>
                                                                    <p className="text-gray-400 text-[11px]">{staff.code || "—"}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${ROLE_COLORS[role] || "bg-gray-100 text-gray-600"}`}>{role}</span>
                                                        </td>
                                                        <td className="px-4 py-3"><PhotoDots count={staff.photosCount || 0} /></td>
                                                        <td className="px-4 py-3"><StatusBadge status={staff.enrollmentStatus} photos={staff.photosCount} /></td>
                                                        <td className="px-4 py-3">
                                                            <ActionButton
                                                                status={staff.enrollmentStatus}
                                                                onEnroll={() => handleTableEnroll(staff)}
                                                                onReEnroll={() => handleTableReEnroll(staff)}
                                                            />
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-wrap gap-2">
                                <span className="text-xs text-gray-500">Page {tablePage + 1} of {tableTotalPages}</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setTablePage((p) => Math.max(0, p - 1))} disabled={tablePage === 0}
                                        className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronLeft className="w-4 h-4 text-gray-600" />
                                    </button>
                                    {Array.from({ length: Math.min(tableTotalPages, 5) }).map((_, i) => (
                                        <button key={i} onClick={() => setTablePage(i)}
                                            className={`cursor-pointer w-7 h-7 rounded-lg text-xs font-semibold border transition-colors
                                                ${tablePage === i ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button onClick={() => setTablePage((p) => Math.min(tableTotalPages - 1, p + 1))} disabled={tablePage >= tableTotalPages - 1}
                                        className="cursor-pointer w-7 h-7 rounded-lg flex items-center justify-center border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 transition-colors">
                                        <ChevronRight className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Upload Panel ── */}
                {selectedStaff && (
                    <div ref={uploadPanelRef} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                        {/* Steps */}
                        <div className="flex items-center gap-1 mb-5 text-xs font-semibold overflow-x-auto pb-1">
                            {["Select Staff", "Upload Photos", "Enroll"].map((step, i) => (
                                <div key={step} className="flex items-center shrink-0">
                                    <div className={`px-3 py-1.5 rounded-full ${activeStep > i + 1 ? "bg-blue-600 text-white"
                                        : activeStep === i + 1 ? "bg-blue-100 text-blue-700 border border-blue-300"
                                            : "bg-gray-100 text-gray-400"
                                        }`}>{i + 1} · {step}</div>
                                    {i < 2 && <div className="w-8 h-px bg-gray-300 mx-1" />}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                            {/* Staff Info */}
                            <div className="md:col-span-3">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 h-full">
                                    <div className="w-12 h-12 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                                        {getInitials(selectedStaff.name)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-gray-800 leading-tight">{selectedStaff.name}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{selectedStaff.code} · {selectedStaff.roles?.[0] || "—"}</p>
                                        <p className="text-xs text-gray-400 mt-0.5">Group: school-staff</p>
                                        <p className="text-xs text-gray-400">User ID: {selectedStaff.userId}</p>
                                        <div className="mt-2">
                                            <StatusBadge status={selectedStaff.enrollmentStatus} photos={selectedStaff.photosCount} />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Photos */}
                            <div className="md:col-span-6">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                                        Upload 5 Face Photos <span className="text-red-500">(REQUIRED)</span>
                                    </p>
                                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${uploadedCount === 5 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                        {uploadedCount}/5
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-2">
                                    {Array(5).fill(0).map((_, i) => (
                                        <PhotoSlot key={i} index={i} file={photos[i]} onAdd={handleAddPhoto} onRemove={handleRemovePhoto} />
                                    ))}
                                </div>
                                <div className="mt-3">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Photos uploaded</span><span>{uploadedCount} / 5</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-500 bg-blue-500"
                                            style={{ width: `${(uploadedCount / 5) * 100}%` }} />
                                    </div>
                                    <p className="text-[11px] text-right mt-1 text-gray-400">
                                        {uploadedCount === 5 ? "✅ All photos ready to enroll" : `${5 - uploadedCount} more photo${5 - uploadedCount !== 1 ? "s" : ""} needed`}
                                    </p>
                                </div>
                            </div>

                            {/* Guidelines + Actions */}
                            <div className="md:col-span-3 flex flex-col gap-3">
                                <div className="bg-gray-50 rounded-xl p-4 text-xs text-gray-600 space-y-2 border border-gray-100">
                                    <p className="font-bold text-gray-700 text-sm mb-2">Photo guidelines:</p>
                                    {[
                                        { ok: true, text: "Face clearly visible, well-lit, centered" },
                                        { ok: true, text: "Different angles: front, left, right, up, down" },
                                        { ok: false, text: "No sunglasses, masks or heavy shadows" },
                                        { ok: false, text: "Min 200×200 px · Max 5 MB each" },
                                    ].map((g, i) => (
                                        <div key={i} className="flex items-start gap-2">
                                            <span className="shrink-0 mt-0.5">{g.ok ? "✅" : "❌"}</span>
                                            <span className="leading-relaxed">{g.text}</span>
                                        </div>
                                    ))}
                                </div>
                                <button onClick={handleClearAll}
                                    className="cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-colors">
                                    <Trash2 className="w-4 h-4" /> Clear All
                                </button>
                                <button onClick={handleEnroll} disabled={uploadedCount < 5 || enrolling}
                                    className={`cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-all
                                        ${uploadedCount === 5 && !enrolling ? "bg-blue-600 hover:bg-blue-700 shadow-sm" : "bg-gray-300 cursor-not-allowed"}`}>
                                    {enrolling ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enrolling...</> : <><Zap className="w-4 h-4" /> Enroll Staff</>}
                                </button>
                                {uploadedCount < 5 && (
                                    <p className="text-[11px] text-center text-gray-400">
                                        {5 - uploadedCount} more photo{5 - uploadedCount !== 1 ? "s" : ""} needed
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}