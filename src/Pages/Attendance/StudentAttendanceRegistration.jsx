import { useState, useRef, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import {
    Users, UserCheck, UserX, Search, CheckCircle, AlertTriangle,
    RefreshCw, ChevronRight, Trash2, X, Zap, Camera, BookOpen,
    GraduationCap, FileText, AlertCircle, Upload, RotateCcw
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import { getEnrollmentStats, getStudentEnrollment, getSectionEnrollmentStats, enrollUserFaces, removeEnrollment } from "../../Api/Attendance/AttendanceApi";
import { getClasses, getSectionsByClass } from "../../Api/Teachers/TeachersAPI";
import { getStudentsBySection } from "../../Api/Students/StudentsApi";
import { STUDENT_AVATAR_BG as AVATAR_BG, FACE_ANGLES as ANGLES, UI_STRINGS } from "../../Constants/StringConstants/AttendanceConstants";

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function StatusBadge({ status, photos }) {
    if (status === "ENROLLED")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5" />{UI_STRINGS.STUDENT_ENROLL.ENROLLED || "Enrolled"}
            </span>
        );
    if (status === "PARTIAL")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold border border-amber-200 whitespace-nowrap">
                <AlertTriangle className="w-3.5 h-3.5" />{photos}/5
            </span>
        );
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold border border-red-200 whitespace-nowrap">
            <AlertTriangle className="w-3.5 h-3.5" />{UI_STRINGS.STUDENT_ENROLL.STAT_NOT_ENROLLED}
        </span>
    );
}

function PhotoDots({ count, max = 5 }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < count ? "bg-emerald-500" : "bg-gray-200"}`} />
            ))}
        </div>
    );
}

// ⚡ New PhotoCaptureModal Component added for Students
function PhotoCaptureModal({ slotIndex, angleLabel, onCapture, onClose }) {
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
                const file = new File([blob], `student_face_${slotIndex + 1}_${Date.now()}.jpg`, { type: "image/jpeg" });
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden border border-gray-200">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-sm font-bold text-gray-900">
                            Photo {slotIndex + 1} ({angleLabel})
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {mode === "camera" ? UI_STRINGS.STAFF_ENROLL.CAM_GUIDE : UI_STRINGS.STAFF_ENROLL.CHOOSE_HOW}
                        </p>
                    </div>
                    <button onClick={onClose} className="cursor-pointer w-7 h-7 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                        <X className="w-3.5 h-3.5 text-gray-600" />
                    </button>
                </div>

                {!mode && (
                    <div className="p-5 space-y-3">
                        <button onClick={() => setMode("camera")}
                            className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-xl border-2 border-blue-100 bg-blue-50 hover:border-blue-400 hover:bg-blue-100 transition-all group text-left">
                            <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Camera className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-blue-800">{UI_STRINGS.STAFF_ENROLL.OPEN_CAM}</p>
                                <p className="text-xs text-blue-500 mt-0.5">{UI_STRINGS.STAFF_ENROLL.OPEN_CAM_SUB}</p>
                            </div>
                        </button>
                        <button onClick={() => { setMode("upload"); setTimeout(() => fileInputRef.current?.click(), 80); }}
                            className="cursor-pointer w-full flex items-center gap-4 p-4 rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-gray-300 hover:bg-gray-100 transition-all group text-left">
                            <div className="w-11 h-11 rounded-full bg-gray-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                <Upload className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-800">{UI_STRINGS.STAFF_ENROLL.UPLOAD_DEV}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{UI_STRINGS.STAFF_ENROLL.UPLOAD_DEV_SUB}</p>
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
                                <p className="text-xs text-center text-gray-500 mb-3">{UI_STRINGS.STAFF_ENROLL.PHOTO_LOOKS_GOOD}</p>
                                <div className="flex gap-2">
                                    <button onClick={() => setCapturedPreview(null)} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition-colors">
                                        <RefreshCw className="w-3.5 h-3.5" /> {UI_STRINGS.COMMON.RETAKE}
                                    </button>
                                    <button onClick={handleConfirmCapture} className="cursor-pointer flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors">
                                        <CheckCircle className="w-3.5 h-3.5" /> {UI_STRINGS.STAFF_ENROLL.BTN_USE_PHOTO}
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
                                            <p className="text-xs text-gray-400">{UI_STRINGS.STAFF_ENROLL.STARTING_CAM}</p>
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
                                    {cameraFacing === "user" ? UI_STRINGS.STAFF_ENROLL.SWITCH_BACK : UI_STRINGS.STAFF_ENROLL.SWITCH_FRONT}
                                </button>
                                <button onClick={handleCapture} disabled={!cameraReady}
                                    className={`cursor-pointer w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
                                        ${cameraReady ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}>
                                    <Camera className="w-4 h-4" /> {UI_STRINGS.STAFF_ENROLL.BTN_CLICK_PHOTO}
                                </button>
                                <button onClick={() => { setMode(null); setCameraReady(false); }}
                                    className="cursor-pointer w-full mt-2 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                                    {UI_STRINGS.STAFF_ENROLL.BACK_OPTS}
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
                            <p className="text-sm text-gray-600 font-medium">{UI_STRINGS.STAFF_ENROLL.OPENING_FILE}</p>
                            <p className="text-xs text-gray-400 text-center">{UI_STRINGS.STAFF_ENROLL.OPENING_FILE_SUB}</p>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => fileInputRef.current?.click()}
                                className="cursor-pointer flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors">
                                {UI_STRINGS.STAFF_ENROLL.BTN_BROWSE}
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

// ⚡ Updated PhotoSlot Component to manage modal triggers
function PhotoSlot({ index, file, angleLabel, onAdd, onRemove }) {
    const [showModal, setShowModal] = useState(false);
    const preview = file ? URL.createObjectURL(file) : null;
    return (
        <div className="flex flex-col gap-1.5">
            {showModal && (
                <PhotoCaptureModal slotIndex={index} angleLabel={angleLabel} onCapture={onAdd} onClose={() => setShowModal(false)} />
            )}
            <div className="relative">
                <div onClick={() => !file && setShowModal(true)}
                    className={`w-full rounded-xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center
                        ${file ? "border-emerald-400 bg-emerald-50" : "border-dashed border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer"}`}
                    style={{ height: "108px" }}>
                    {file ? (
                        <img src={preview} alt={angleLabel} className="w-full h-full object-cover" />
                    ) : (
                        <div className="flex flex-col items-center gap-1.5">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                <Camera className="w-5 h-5 text-gray-400" />
                            </div>
                            <span className="text-[11px] text-gray-400 font-medium">Photo {index + 1}</span>
                        </div>
                    )}
                </div>
                {file && (
                    <button onClick={() => onRemove(index)}
                        className="cursor-pointer absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 z-10 transition-colors">
                        <X className="w-3 h-3" />
                    </button>
                )}
                {file && (
                    <div className="absolute bottom-1.5 inset-x-0 flex justify-center">
                        <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full font-semibold">✓ Good</span>
                    </div>
                )}
            </div>
            <p className="text-center text-[11px] font-semibold text-gray-500">{angleLabel}</p>
        </div>
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

function SectionEnrollmentTable({ enrollmentList, enrollmentLoading, selectedStudent, onSelectStudent, selectedClass, selectedSection }) {
    const [showAll, setShowAll] = useState(false);
    const PAGE_SIZE = 10;
    const displayed = showAll ? enrollmentList : enrollmentList.slice(0, PAGE_SIZE);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700">{UI_STRINGS.STUDENT_ENROLL.SEC_ENROLL_STAT}</h3>
                <span className="text-[11px] text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                    {selectedClass?.name} · {selectedSection?.name}
                </span>
            </div>
            <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="col-span-5 text-[11px] font-bold text-gray-400 uppercase">Student</span>
                <span className="col-span-4 text-[11px] font-bold text-gray-400 uppercase">Photos</span>
                <span className="col-span-3 text-[11px] font-bold text-gray-400 uppercase">Status</span>
            </div>
            {enrollmentLoading ? (
                <div className="flex items-center justify-center py-12"><RefreshCw className="w-5 h-5 animate-spin text-blue-400" /></div>
            ) : enrollmentList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">{UI_STRINGS.STUDENT_ENROLL.NO_STUDENTS}</p>
            ) : (
                <div className={`divide-y divide-gray-50 transition-all ${showAll ? "max-h-none" : "max-h-[400px] overflow-y-auto"}`}>
                    {displayed.map((s, idx) => (
                        <div key={s.userId} onClick={() => onSelectStudent(s)}
                            className={`grid grid-cols-12 px-4 py-2.5 items-center cursor-pointer transition-colors hover:bg-blue-50/40 ${selectedStudent?.userId === s.userId ? "bg-blue-50/70" : ""}`}>
                            <div className="col-span-5 flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-full ${AVATAR_BG[idx % AVATAR_BG.length]} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                                    {getInitials(s.name)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-800 text-xs leading-tight truncate">{s.name}</p>
                                    <p className="text-[10px] text-gray-400">Roll {s.rollNumber || "—"}</p>
                                </div>
                            </div>
                            <div className="col-span-4">
                                {s.enrollmentStatus === "PARTIAL" ? <span className="text-xs font-bold text-amber-600">{s.photosCount}/5</span> : <PhotoDots count={s.photosCount || 0} />}
                            </div>
                            <div className="col-span-3"><StatusBadge status={s.enrollmentStatus} photos={s.photosCount} /></div>
                        </div>
                    ))}
                </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-[11px] text-gray-500">{enrollmentList.length} {UI_STRINGS.STUDENT_ENROLL.STUDENTS_TITLE.toLowerCase()} {UI_STRINGS.STUDENT_ENROLL.TOTAL_TXT}</span>
                {enrollmentList.length > PAGE_SIZE && (
                    <button onClick={() => setShowAll(!showAll)} className="cursor-pointer text-[11px] text-blue-600 font-semibold flex items-center gap-0.5 hover:underline">
                        {showAll ? UI_STRINGS.STUDENT_ENROLL.BTN_SHOW_LESS : `${UI_STRINGS.STUDENT_ENROLL.BTN_VIEW_ALL} (${enrollmentList.length})`}
                        <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? "rotate-90" : ""}`} />
                    </button>
                )}
            </div>
        </div>
    );
}

export default function StudentAttendanceRegistration() {
    const [stats, setStats] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);
    const [classes, setClasses] = useState([]);
    const [classesLoading, setClassesLoading] = useState(true);
    const [sections, setSections] = useState([]);
    const [sectionsLoading, setSectionsLoading] = useState(false);
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [enrollmentList, setEnrollmentList] = useState([]);
    const [enrollmentLoading, setEnrollmentLoading] = useState(false);
    const [sectionStats, setSectionStats] = useState(null);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [search, setSearch] = useState("");
    const [photos, setPhotos] = useState(Array(5).fill(null));
    const [activeStep, setActiveStep] = useState(1);
    const [enrolling, setEnrolling] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [toast, setToast] = useState(null);

    const uploadPanelRef = useRef(null);
    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await getEnrollmentStats();
            setStats(res.data);
        } catch (e) { console.error(e); }
        { setStatsLoading(false); }
    }, []);

    const fetchClasses = useCallback(async () => {
        try {
            setClassesLoading(true);
            const data = await getClasses();
            setClasses(data);
            if (data.length > 0) setSelectedClass(data[0]);
        } catch (e) { console.error(e); } finally { setClassesLoading(false); }
    }, []);

    const fetchSections = useCallback(async (classId) => {
        if (!classId) return;
        try {
            setSectionsLoading(true); setSections([]); setSelectedSection(null); setStudents([]); setEnrollmentList([]); setSelectedStudent(null);
            const data = await getSectionsByClass(classId);
            setSections(data);
            if (data.length > 0) setSelectedSection(data[0]);
        } catch (e) { console.error(e); } finally { setSectionsLoading(false); }
    }, []);

    const fetchStudents = useCallback(async (sectionId) => {
        if (!sectionId) return;
        try {
            setStudentsLoading(true);
            const data = await getStudentsBySection(sectionId, "ACTIVE");
            setStudents(data);
        } catch (e) { console.error(e); } finally { setStudentsLoading(false); }
    }, []);

    const fetchEnrollment = useCallback(async (sectionId) => {
        if (!sectionId) return;
        try {
            setEnrollmentLoading(true);
            const res = await getStudentEnrollment(sectionId);
            setEnrollmentList(res.data || []);
        } catch (e) { console.error(e); } finally { setEnrollmentLoading(false); }
    }, []);

    const fetchSectionStats = useCallback(async (sectionId) => {
        if (!sectionId) return;
        try {
            const res = await getSectionEnrollmentStats(sectionId);
            setSectionStats(res.data);
        } catch (e) { console.error(e); }
    }, []);

    useEffect(() => { fetchStats(); fetchClasses(); }, [fetchStats, fetchClasses]);
    useEffect(() => { if (selectedClass?.id) fetchSections(selectedClass.id); }, [selectedClass, fetchSections]);

    useEffect(() => {
        if (selectedSection?.id) {
            fetchStudents(selectedSection.id); fetchEnrollment(selectedSection.id); fetchSectionStats(selectedSection.id);
            setSelectedStudent(null); setPhotos(Array(5).fill(null)); setActiveStep(1);
        }
    }, [selectedSection, fetchStudents, fetchEnrollment, fetchSectionStats]);

    const handleClassChange = (classId) => {
        const cls = classes.find((c) => c.id === Number(classId));
        if (cls) setSelectedClass(cls);
    };

    const handleSectionChange = (sectionId) => {
        const sec = sections.find((s) => s.id === Number(sectionId));
        if (sec) setSelectedSection(sec);
    };

    const selectStudent = (s) => {
        setSelectedStudent(s); setPhotos(Array(5).fill(null)); setActiveStep(2);
        setTimeout(() => uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    };

    const selectFromEnrollment = (enrollItem) => {
        const student = students.find((s) => s.id === enrollItem.userId) || {
            id: enrollItem.userId, fullName: enrollItem.name, rollNumber: enrollItem.rollNumber, sectionId: selectedSection?.id, classId: selectedClass?.id,
        };
        setSelectedStudent({ ...student, enrollmentStatus: enrollItem.enrollmentStatus, photosCount: enrollItem.photosCount });
        setPhotos(Array(5).fill(null)); setActiveStep(2);
        setTimeout(() => uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    };

    const addPhoto = (i, file) => {
        const updated = [...photos]; updated[i] = file; setPhotos(updated);
        if (activeStep < 3) setActiveStep(3);
    };
    const removePhoto = (i) => { const updated = [...photos]; updated[i] = null; setPhotos(updated); };

    const handleEnroll = async () => {
        if (uploadedCount < 5 || !selectedStudent) return;
        try {
            setEnrolling(true);
            const studentId = selectedStudent.id || selectedStudent.userId;
            await enrollUserFaces({
                userId: studentId, userType: "STUDENT", classId: selectedClass?.id || selectedStudent.classId, sectionId: selectedSection?.id || selectedStudent.sectionId, images: photos,
            });
            showToast(`${selectedStudent.fullName || selectedStudent.name} enrolled successfully!`, "success");
            setActiveStep(4); setPhotos(Array(5).fill(null));
            await fetchEnrollment(selectedSection?.id); await fetchSectionStats(selectedSection?.id); await fetchStats();
            setSelectedStudent((prev) => ({ ...prev, enrollmentStatus: "ENROLLED", photosCount: 5 }));
        } catch (e) { showToast(e.message || "Enrollment failed", "error"); } finally { setEnrolling(false); }
    };

    const handleRemove = async () => {
        if (!selectedStudent) return;
        try {
            const studentId = selectedStudent.id || selectedStudent.userId;
            await removeEnrollment({ userId: studentId, userType: "STUDENT", classId: selectedClass?.id || selectedStudent.classId, sectionId: selectedSection?.id || selectedStudent.sectionId });
            showToast("Enrollment removed successfully.", "success");
            setPhotos(Array(5).fill(null)); setActiveStep(1);
            await fetchEnrollment(selectedSection?.id); await fetchSectionStats(selectedSection?.id); await fetchStats();
            setSelectedStudent((prev) => ({ ...prev, enrollmentStatus: "NOT_ENROLLED", photosCount: 0 }));
        } catch (e) { showToast(e.message || "Failed to remove enrollment", "error"); } finally { setRemoving(false); }
    };

    const uploadedCount = photos.filter(Boolean).length;
    const enrolledCount = sectionStats?.enrolled ?? enrollmentList.filter((s) => s.enrollmentStatus === "ENROLLED").length;
    const notEnrolledCount = sectionStats?.notEnrolled ?? enrollmentList.filter((s) => s.enrollmentStatus !== "ENROLLED").length;
    const pct = sectionStats?.enrollmentPercentage ?? (enrollmentList.length ? Math.round((enrolledCount / enrollmentList.length) * 100) : 0);

    const filteredStudents = students.filter((s) => {
        const name = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || String(s.rollNumber || "").includes(q);
    });

    const studentName = selectedStudent ? (selectedStudent.fullName || `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim()) : "";

    return (
        <div className="min-h-screen bg-[#EBF0F5] font-sans">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <div className=" px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{UI_STRINGS.STUDENT_ENROLL.HEADER}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{UI_STRINGS.STUDENT_ENROLL.SUBTITLE}</p>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statsLoading ? Array(4).fill(0).map((_, i) => <CardLoader key={i} />) : (
                        <>
                            <CardComponent IconName={GraduationCap} keyName={UI_STRINGS.STUDENT_ENROLL.STAT_REG} val={`${stats?.totalStudents ?? 0} `} iconTxColor="text-blue-600" iconBgColor="bg-blue-100" />
                            <CardComponent IconName={UserCheck} keyName={UI_STRINGS.STUDENT_ENROLL.STAT_ENROLLED} val={`${stats?.studentsEnrolled ?? 0} / ${stats?.totalStudents ?? 0}`} iconTxColor="text-emerald-600" iconBgColor="bg-emerald-100" />
                            <CardComponent IconName={UserX} keyName={UI_STRINGS.STUDENT_ENROLL.STAT_NOT_ENROLLED} val={`${(stats?.totalStudents ?? 0) - (stats?.studentsEnrolled ?? 0)} `} iconTxColor="text-red-500" iconBgColor="bg-red-100" />
                            <CardComponent IconName={Users} keyName={UI_STRINGS.STUDENT_ENROLL.STAT_COMPLETED} val={`${stats?.enrollmentPercentage ?? 0}% `} iconTxColor="text-purple-600" iconBgColor="bg-purple-100" />
                        </>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                    <div className="lg:col-span-3 space-y-4">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><BookOpen className="w-4 h-4 text-blue-500" /> {UI_STRINGS.STUDENT_ENROLL.SELECT_CLASS_SEC}</h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{UI_STRINGS.STUDENT_ENROLL.CLASS_LBL}</label>
                                    {classesLoading ? <div className="h-10 bg-gray-100 rounded-lg animate-pulse" /> : (
                                        <select value={selectedClass?.id || ""} onChange={(e) => handleClassChange(e.target.value)} className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400">
                                            {classes.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">{UI_STRINGS.STUDENT_ENROLL.SEC_LBL}</label>
                                    {sectionsLoading ? <div className="h-10 bg-gray-100 rounded-lg animate-pulse" /> : (
                                        <select value={selectedSection?.id || ""} onChange={(e) => handleSectionChange(e.target.value)} className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400" disabled={sections.length === 0}>
                                            {sections.length === 0 ? <option>{UI_STRINGS.STUDENT_ENROLL.NO_SECTIONS}</option> : sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500">{selectedClass?.name} · {selectedSection?.name}</span>
                                    <span className="text-xs font-bold text-blue-600">{pct}%</span>
                                </div>
                                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-3">
                                    <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 text-center">
                                        <p className="text-base font-bold text-emerald-700">{enrolledCount}</p>
                                        <p className="text-[11px] text-emerald-600 font-medium">{UI_STRINGS.STAFF_ENROLL.ENROLLED}</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
                                        <p className="text-base font-bold text-red-600">{notEnrolledCount}</p>
                                        <p className="text-[11px] text-red-500 font-medium">{UI_STRINGS.STUDENT_ENROLL.PENDING}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2"><Users className="w-4 h-4 text-blue-500" /> {UI_STRINGS.STUDENT_ENROLL.STUDENTS_TITLE}</h2>
                                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{students.length} {UI_STRINGS.STUDENT_ENROLL.TOTAL_TXT}</span>
                            </div>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={UI_STRINGS.STUDENT_ENROLL.SEARCH_TXT} className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400" />
                            </div>
                            <div className="space-y-1.5 max-h-80 overflow-y-auto">
                                {studentsLoading ? (
                                    <div className="flex items-center justify-center py-8"><RefreshCw className="w-5 h-5 animate-spin text-blue-400" /></div>
                                ) : filteredStudents.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">{students.length === 0 ? UI_STRINGS.STUDENT_ENROLL.SELECT_TO_LOAD : UI_STRINGS.STUDENT_ENROLL.NO_STUDENTS}</p>
                                ) : filteredStudents.map((s, idx) => {
                                    const name = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
                                    const enrollData = enrollmentList.find((e) => e.userId === s.id);
                                    const status = enrollData?.enrollmentStatus || "NOT_ENROLLED";
                                    return (
                                        <button key={s.id} onClick={() => selectStudent({ ...s, enrollmentStatus: status, photosCount: enrollData?.photosCount || 0 })}
                                            className={`cursor-pointer w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${selectedStudent?.id === s.id ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"}`}>
                                            <div className={`w-8 h-8 rounded-full ${AVATAR_BG[idx % AVATAR_BG.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{getInitials(name)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                                                <p className="text-[11px] text-gray-400">Roll {s.rollNumber || "—"}</p>
                                            </div>
                                            {status === "ENROLLED" ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" /> : status === "PARTIAL" ? <span className="text-[10px] font-bold text-amber-500 shrink-0">{enrollData?.photosCount}/5</span> : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-9 space-y-4">
                        {selectedStudent ? (
                            <>
                                <div ref={uploadPanelRef} className="grid grid-cols-1 xl:grid-cols-12 gap-4">
                                    <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center shrink-0 shadow">{getInitials(studentName)}</div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-gray-800">{studentName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">Roll No. {selectedStudent.rollNumber || "—"} · {selectedClass?.name} · {selectedSection?.name}</p>
                                                <p className="text-[11px] text-gray-400">{UI_STRINGS.COMMON.ID_LABEL} {selectedStudent.id}</p>
                                            </div>
                                            <StatusBadge status={selectedStudent.enrollmentStatus} photos={selectedStudent.photosCount} />
                                        </div>

                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">{UI_STRINGS.STAFF_ENROLL.UPLOAD_5} <span className="text-red-500">{UI_STRINGS.STUDENT_ENROLL.REQUIRED_ALL_5}</span></p>
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${uploadedCount === 5 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{uploadedCount}/5</span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {ANGLES.map((a, i) => (<PhotoSlot key={i} index={i} file={photos[i]} angleLabel={a.label} onAdd={addPhoto} onRemove={removePhoto} />))}
                                            </div>
                                            <div className="mt-3">
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full transition-all duration-500 bg-blue-500" style={{ width: `${(uploadedCount / 5) * 100}%` }} /></div>
                                            </div>

                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-3">
                                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Camera className="w-4 h-4 text-blue-500" /> {UI_STRINGS.STUDENT_ENROLL.REC_ANGLES}</h3>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {ANGLES.map((a, i) => {
                                                        const captured = !!photos[i];
                                                        return (
                                                            <div key={i} className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${captured ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${captured ? "bg-emerald-500" : "bg-blue-100"}`}>{captured ? <CheckCircle className="w-5 h-5 text-white" /> : <a.Icon className="w-4 h-4 text-blue-600" />}</div>
                                                                <div className="text-center"><p className={`text-[10px] font-bold leading-tight ${captured ? "text-emerald-700" : "text-gray-600"}`}>{a.label}</p></div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row gap-4 pt-1 border-t border-gray-100">
                                            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{UI_STRINGS.STUDENT_ENROLL.GUIDELINES_TITLE}</p>
                                                {[{ ok: true, text: UI_STRINGS.STUDENT_ENROLL.G1 }, { ok: true, text: UI_STRINGS.STUDENT_ENROLL.G2 }, { ok: false, text: UI_STRINGS.STUDENT_ENROLL.G3 }, { ok: null, text: UI_STRINGS.STUDENT_ENROLL.G4 }].map((g, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600"><span className="shrink-0">{g.ok === true ? "✅" : g.ok === false ? "❌" : "💡"}</span><span className="leading-snug">{g.text}</span></div>
                                                ))}
                                            </div>
                                            <div className="flex flex-row sm:flex-col gap-2 sm:w-36">
                                                <button onClick={() => setPhotos(Array(5).fill(null))} className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-colors"><Trash2 className="w-4 h-4" /> {UI_STRINGS.STAFF_ENROLL.BTN_CLEAR}</button>
                                                {selectedStudent.enrollmentStatus !== "NOT_ENROLLED" && (<button onClick={handleRemove} disabled={removing} className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors">{removing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} {UI_STRINGS.STUDENT_ENROLL.BTN_REMOVE}</button>)}
                                                <button onClick={handleEnroll} disabled={uploadedCount < 5 || enrolling} className={`cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${uploadedCount === 5 && !enrolling ? "bg-blue-600 hover:bg-blue-700 shadow-sm" : "bg-gray-300 cursor-not-allowed"}`}>{enrolling ? <><RefreshCw className="w-4 h-4 animate-spin" /> {UI_STRINGS.STAFF_ENROLL.ENROLLING}</> : <><Zap className="w-4 h-4" /> {UI_STRINGS.STUDENT_ENROLL.BTN_ENROLL_STUDENT}</>}</button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="xl:col-span-5 space-y-4">
                                        <SectionEnrollmentTable enrollmentList={enrollmentList} enrollmentLoading={enrollmentLoading} selectedStudent={selectedStudent} onSelectStudent={selectFromEnrollment} selectedClass={selectedClass} selectedSection={selectedSection} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4"><GraduationCap className="w-8 h-8 text-blue-400" /></div>
                                <p className="text-base font-bold text-gray-700">{UI_STRINGS.STUDENT_ENROLL.NO_STUDENT_SEL}</p>
                                <p className="text-sm text-gray-400 mt-1 max-w-xs">{UI_STRINGS.STUDENT_ENROLL.NO_STUDENT_DESC}</p>
                            </div>
                        )}

                        {!selectedStudent && selectedSection && (<SectionEnrollmentTable enrollmentList={enrollmentList} enrollmentLoading={enrollmentLoading} selectedStudent={selectedStudent} onSelectStudent={selectFromEnrollment} selectedClass={selectedClass} selectedSection={selectedSection} />)}
                    </div>
                </div>
            </div>
        </div>
    );
}