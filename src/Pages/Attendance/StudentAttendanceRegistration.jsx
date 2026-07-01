import { useState, useRef, useEffect, useCallback } from "react";
import {
    Users, UserCheck, UserX, Search, CheckCircle, AlertTriangle,
    RefreshCw, ChevronRight, Trash2, X, Zap, Camera, BookOpen,
    ArrowUp, ArrowDown, ArrowLeft, ArrowRight,
    GraduationCap, FileText, AlertCircle, RotateCcw,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import { getEnrollmentStats, getStudentEnrollment, getSectionEnrollmentStats, enrollUserFaces, removeEnrollment, } from "../../Api/AttendanceApi";
import { getClasses, getSectionsByClass } from "../../Api/TeachersAPI";
import { getStudentsBySection } from "../../Api/StudentsApi";

const AVATAR_BG = [
    "bg-blue-500", "bg-rose-500", "bg-emerald-500",
    "bg-amber-500", "bg-purple-500", "bg-teal-500",
];

const ANGLES = [
    { Icon: Camera, label: "Front", desc: "Look straight" },
    { Icon: ArrowLeft, label: "Left 15°", desc: "Slightly left" },
    { Icon: ArrowRight, label: "Right 15°", desc: "Slightly right" },
    { Icon: ArrowUp, label: "Tilt Up", desc: "Chin up" },
    { Icon: ArrowDown, label: "Tilt Down", desc: "Chin down" },
];

function getInitials(name = "") {
    return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status, photos }) {
    if (status === "ENROLLED")
        return (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200 whitespace-nowrap">
                <CheckCircle className="w-3.5 h-3.5" />Enrolled
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
            <AlertTriangle className="w-3.5 h-3.5" />Not Enrolled
        </span>
    );
}

// ─── PhotoDots ────────────────────────────────────────────────────────────────
function PhotoDots({ count, max = 5 }) {
    return (
        <div className="flex gap-1">
            {Array.from({ length: max }).map((_, i) => (
                <div key={i} className={`w-2.5 h-2.5 rounded-full ${i < count ? "bg-emerald-500" : "bg-gray-200"}`} />
            ))}
        </div>
    );
}

// ─── PhotoSlot ────────────────────────────────────────────────────────────────
function PhotoSlot({ index, file, angleLabel, onAdd, onRemove }) {
    const ref = useRef();
    const preview = file ? URL.createObjectURL(file) : null;
    return (
        <div className="flex flex-col gap-1.5">
            <div className="relative">
                <div
                    onClick={() => !file && ref.current?.click()}
                    className={`w-full rounded-xl border-2 transition-all overflow-hidden flex flex-col items-center justify-center
            ${file
                            ? "border-emerald-400 bg-emerald-50"
                            : "border-dashed border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                        }`}
                    style={{ height: "108px" }}
                >
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
                    <input ref={ref} type="file" accept="image/*" className="hidden"
                        onChange={(e) => e.target.files[0] && onAdd(index, e.target.files[0])} />
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

// ─── Toast ────────────────────────────────────────────────────────────────────
function Toast({ message, type, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 3500);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold
      ${type === "success" ? "bg-emerald-600 text-white" : "bg-red-600 text-white"}`}>
            {type === "success" ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {message}
            <button onClick={onClose} className="cursor-pointer ml-2 opacity-70 hover:opacity-100"><X className="w-3.5 h-3.5" /></button>
        </div>
    );
}

// ─── Section Enrollment Table (with View All expand) ─────────────────────────
function SectionEnrollmentTable({
    enrollmentList, enrollmentLoading, selectedStudent,
    onSelectStudent, selectedClass, selectedSection,
}) {
    const [showAll, setShowAll] = useState(false);
    const PAGE_SIZE = 10;
    const displayed = showAll ? enrollmentList : enrollmentList.slice(0, PAGE_SIZE);

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700">Section Enrollment Status</h3>
                <span className="text-[11px] text-gray-500 bg-white border border-gray-200 px-2 py-0.5 rounded-full font-semibold">
                    {selectedClass?.name} · {selectedSection?.name}
                </span>
            </div>
            {/* Table header */}
            <div className="grid grid-cols-12 px-4 py-2 bg-gray-50 border-b border-gray-100">
                <span className="col-span-5 text-[11px] font-bold text-gray-400 uppercase">Student</span>
                <span className="col-span-4 text-[11px] font-bold text-gray-400 uppercase">Photos</span>
                <span className="col-span-3 text-[11px] font-bold text-gray-400 uppercase">Status</span>
            </div>
            {enrollmentLoading ? (
                <div className="flex items-center justify-center py-12">
                    <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                </div>
            ) : enrollmentList.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-8">No students found</p>
            ) : (
                <div className={`divide-y divide-gray-50 transition-all ${showAll ? "max-h-none" : "max-h-[400px] overflow-y-auto"}`}>
                    {displayed.map((s, idx) => (
                        <div key={s.userId} onClick={() => onSelectStudent(s)}
                            className={`grid grid-cols-12 px-4 py-2.5 items-center cursor-pointer transition-colors hover:bg-blue-50/40 ${selectedStudent?.userId === s.userId ? "bg-blue-50/70" : ""}`}>
                            <div className="col-span-5 flex items-center gap-2 min-w-0">
                                <div className={`w-7 h-7 rounded-full ${AVATAR_BG[idx % AVATAR_BG.length]} text-white text-[10px] font-bold flex items-center justify-center shrink-0`}>
                                    {getInitials(s.name)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate leading-tight">{s.name}</p>
                                    <p className="text-[10px] text-gray-400">Roll {s.rollNumber || "—"}</p>
                                </div>
                            </div>
                            <div className="col-span-4">
                                {s.enrollmentStatus === "PARTIAL"
                                    ? <span className="text-xs font-bold text-amber-600">{s.photosCount}/5</span>
                                    : <PhotoDots count={s.photosCount || 0} />}
                            </div>
                            <div className="col-span-3">
                                <StatusBadge status={s.enrollmentStatus} photos={s.photosCount} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="px-4 py-2.5 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                <span className="text-[11px] text-gray-500">{enrollmentList.length} students total</span>
                {enrollmentList.length > PAGE_SIZE && (
                    <button
                        onClick={() => setShowAll(!showAll)}
                        className="cursor-pointer text-[11px] text-blue-600 font-semibold flex items-center gap-0.5 hover:underline"
                    >
                        {showAll ? "Show Less" : `View All (${enrollmentList.length})`}
                        <ChevronRight className={`w-3 h-3 transition-transform ${showAll ? "rotate-90" : ""}`} />
                    </button>
                )}
            </div>
        </div>
    );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function StudentAttendanceRegistration() {
    // ── Data state ──
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

    // ── Selection state ──
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);

    // ── UI state ──
    const [search, setSearch] = useState("");
    const [photos, setPhotos] = useState(Array(5).fill(null));
    const [activeStep, setActiveStep] = useState(1);
    const [enrolling, setEnrolling] = useState(false);
    const [removing, setRemoving] = useState(false);
    const [toast, setToast] = useState(null);

    const uploadPanelRef = useRef(null);

    // ── Fetchers ──
    const showToast = (message, type = "success") => setToast({ message, type });

    const fetchStats = useCallback(async () => {
        try {
            setStatsLoading(true);
            const res = await getEnrollmentStats();
            setStats(res.data);
        } catch (e) { console.error(e); } 
        finally
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
            setSectionsLoading(true);
            setSections([]);
            setSelectedSection(null);
            setStudents([]);
            setEnrollmentList([]);
            setSelectedStudent(null);
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

    // ── Effects ──
    useEffect(() => { fetchStats(); fetchClasses(); }, [fetchStats, fetchClasses]);

    useEffect(() => {
        if (selectedClass?.id) fetchSections(selectedClass.id);
    }, [selectedClass, fetchSections]);

    useEffect(() => {
        if (selectedSection?.id) {
            fetchStudents(selectedSection.id);
            fetchEnrollment(selectedSection.id);
            fetchSectionStats(selectedSection.id);
            setSelectedStudent(null);
            setPhotos(Array(5).fill(null));
            setActiveStep(1);
        }
    }, [selectedSection, fetchStudents, fetchEnrollment, fetchSectionStats]);

    // ── Handlers ──
    const handleClassChange = (classId) => {
        const cls = classes.find((c) => c.id === Number(classId));
        if (cls) setSelectedClass(cls);
    };

    const handleSectionChange = (sectionId) => {
        const sec = sections.find((s) => s.id === Number(sectionId));
        if (sec) setSelectedSection(sec);
    };

    const selectStudent = (s) => {
        setSelectedStudent(s);
        setPhotos(Array(5).fill(null));
        setActiveStep(2);
        setTimeout(() => uploadPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    };

    const selectFromEnrollment = (enrollItem) => {
        const student = students.find((s) => s.id === enrollItem.userId) || {
            id: enrollItem.userId,
            fullName: enrollItem.name,
            rollNumber: enrollItem.rollNumber,
            sectionId: selectedSection?.id,
            classId: selectedClass?.id,
        };
        setSelectedStudent({
            ...student,
            enrollmentStatus: enrollItem.enrollmentStatus,
            photosCount: enrollItem.photosCount,
        });
        setPhotos(Array(5).fill(null));
        setActiveStep(2);
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
                userId: studentId,
                userType: "STUDENT",
                classId: selectedClass?.id || selectedStudent.classId,
                sectionId: selectedSection?.id || selectedStudent.sectionId,
                images: photos,
            });
            showToast(`${selectedStudent.fullName || selectedStudent.name} enrolled successfully!`, "success");
            setActiveStep(4);
            setPhotos(Array(5).fill(null));
            await fetchEnrollment(selectedSection?.id);
            await fetchSectionStats(selectedSection?.id);
            await fetchStats();
            setSelectedStudent((prev) => ({ ...prev, enrollmentStatus: "ENROLLED", photosCount: 5 }));
        } catch (e) {
            showToast(e.message || "Enrollment failed", "error");
        } finally {
            setEnrolling(false);
        }
    };

    const handleRemove = async () => {
        if (!selectedStudent) return;
        try {
            setRemoving(true);
            const studentId = selectedStudent.id || selectedStudent.userId;
            await removeEnrollment({
                userId: studentId,
                userType: "STUDENT",
                classId: selectedClass?.id || selectedStudent.classId,
                sectionId: selectedSection?.id || selectedStudent.sectionId,
            });
            showToast("Enrollment removed successfully.", "success");
            setPhotos(Array(5).fill(null));
            setActiveStep(1);
            await fetchEnrollment(selectedSection?.id);
            await fetchSectionStats(selectedSection?.id);
            await fetchStats();
            setSelectedStudent((prev) => ({ ...prev, enrollmentStatus: "NOT_ENROLLED", photosCount: 0 }));
        } catch (e) {
            showToast(e.message || "Failed to remove enrollment", "error");
        } finally {
            setRemoving(false);
        }
    };

    // ── Derived ──
    const uploadedCount = photos.filter(Boolean).length;
    const enrolledCount = sectionStats?.enrolled ?? enrollmentList.filter((s) => s.enrollmentStatus === "ENROLLED").length;
    const notEnrolledCount = sectionStats?.notEnrolled ?? enrollmentList.filter((s) => s.enrollmentStatus !== "ENROLLED").length;
    const pct = sectionStats?.enrollmentPercentage ?? (enrollmentList.length ? Math.round((enrolledCount / enrollmentList.length) * 100) : 0);

    const filteredStudents = students.filter((s) => {
        const name = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
        const q = search.toLowerCase();
        return name.toLowerCase().includes(q) || String(s.rollNumber || "").includes(q);
    });

    const STEPS = ["Select Class", "Select Student", "Upload Photos", "Enroll"];

    const studentName = selectedStudent
        ? (selectedStudent.fullName || `${selectedStudent.firstName || ""} ${selectedStudent.lastName || ""}`.trim())
        : "";

    return (
        <div className="min-h-screen bg-[#EBF0F5] font-sans">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* ── Header ── */}
            <div className=" px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Student Face Enrollment</h1>
                        <p className="text-sm text-gray-500 mt-0.5">Register student faces for automated attendance recognition</p>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

                {/* ── Stat Cards (Modified for 1024px Laptop Layout) ── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {statsLoading ? (
                        Array(4).fill(0).map((_, i) => <CardLoader key={i} />)
                    ) : (
                        <>
                            <CardComponent IconName={GraduationCap} keyName="Total Registered Students" val={`${stats?.totalStudents ?? 0} `} iconTxColor="text-blue-600" iconBgColor="bg-blue-100" />
                            <CardComponent IconName={UserCheck} keyName="Students Enrolled" val={`${stats?.studentsEnrolled ?? 0} / ${stats?.totalStudents ?? 0}`} iconTxColor="text-emerald-600" iconBgColor="bg-emerald-100" />
                            <CardComponent IconName={UserX} keyName="Not Enrolled" val={`${(stats?.totalStudents ?? 0) - (stats?.studentsEnrolled ?? 0)} `} iconTxColor="text-red-500" iconBgColor="bg-red-100" />
                            <CardComponent IconName={Users} keyName="Enrollment completed" val={`${stats?.studentEnrollmentPercentage ?? 0}% `} iconTxColor="text-purple-600" iconBgColor="bg-purple-100" />
                        </>
                    )}
                </div>

                {/* ── Main 2-col layout ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

                    {/* ════ LEFT SIDEBAR ════ */}
                    <div className="lg:col-span-3 space-y-4">

                        {/* Class & Section Card */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <h2 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-blue-500" /> Select Class & Section
                            </h2>
                            <div className="space-y-3">
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Class</label>
                                    {classesLoading ? (
                                        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <select
                                            value={selectedClass?.id || ""}
                                            onChange={(e) => handleClassChange(e.target.value)}
                                            className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                        >
                                            {classes.map((c) => (
                                                <option key={c.id} value={c.id}>{c.name}</option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div>
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1 block">Section</label>
                                    {sectionsLoading ? (
                                        <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                                    ) : (
                                        <select
                                            value={selectedSection?.id || ""}
                                            onChange={(e) => handleSectionChange(e.target.value)}
                                            className="cursor-pointer w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                                            disabled={sections.length === 0}
                                        >
                                            {sections.length === 0
                                                ? <option>No sections</option>
                                                : sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)
                                            }
                                        </select>
                                    )}
                                </div>
                            </div>

                            {/* Section Progress */}
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
                                        <p className="text-[11px] text-emerald-600 font-medium">Enrolled</p>
                                    </div>
                                    <div className="bg-red-50 border border-red-100 rounded-lg p-2 text-center">
                                        <p className="text-base font-bold text-red-600">{notEnrolledCount}</p>
                                        <p className="text-[11px] text-red-500 font-medium">Pending</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Users className="w-4 h-4 text-blue-500" /> Students
                                </h2>
                                <span className="text-[11px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{students.length} total</span>
                            </div>
                            <div className="relative mb-3">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search name or roll..."
                                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>
                            <div className="space-y-1.5 max-h-80 overflow-y-auto">
                                {studentsLoading ? (
                                    <div className="flex items-center justify-center py-8">
                                        <RefreshCw className="w-5 h-5 animate-spin text-blue-400" />
                                    </div>
                                ) : filteredStudents.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-6">
                                        {students.length === 0 ? "Select a section to load students" : "No students found"}
                                    </p>
                                ) : (
                                    filteredStudents.map((s, idx) => {
                                        const name = s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim();
                                        const enrollData = enrollmentList.find((e) => e.userId === s.id);
                                        const status = enrollData?.enrollmentStatus || "NOT_ENROLLED";
                                        const photosCount = enrollData?.photosCount || 0;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => selectStudent({ ...s, enrollmentStatus: status, photosCount })}
                                                className={`cursor-pointer w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${selectedStudent?.id === s.id
                                                    ? "border-blue-400 bg-blue-50 shadow-sm"
                                                    : "border-gray-100 hover:border-gray-300 hover:bg-gray-50"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-full ${AVATAR_BG[idx % AVATAR_BG.length]} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                    {getInitials(name)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 truncate">{name}</p>
                                                    <p className="text-[11px] text-gray-400">Roll {s.rollNumber || "—"}</p>
                                                </div>
                                                {status === "ENROLLED"
                                                    ? <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                                                    : status === "PARTIAL"
                                                        ? <span className="text-[10px] font-bold text-amber-500 shrink-0">{photosCount}/5</span>
                                                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ════ RIGHT CONTENT ════ */}
                    <div className="lg:col-span-9 space-y-4">
                        {selectedStudent ? (
                            <>
                                {/* Steps */}
                                <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-3.5">
                                    <div className="flex items-center gap-1 overflow-x-auto">
                                        {STEPS.map((step, i) => (
                                            <div key={step} className="flex items-center shrink-0">
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${activeStep > i + 1 ? "bg-blue-600 text-white"
                                                    : activeStep === i + 1 ? "bg-blue-100 text-blue-700 border border-blue-300"
                                                        : "bg-gray-100 text-gray-400"
                                                    }`}>
                                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${activeStep > i + 1 ? "bg-white/25 text-white"
                                                        : activeStep === i + 1 ? "bg-blue-200 text-blue-700"
                                                            : "bg-gray-200 text-gray-500"
                                                        }`}>{i + 1}</span>
                                                    {step}
                                                </div>
                                                {i < STEPS.length - 1 && <div className="w-5 h-px bg-gray-300 mx-1" />}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Two-col: Upload + Sidebar */}
                                <div ref={uploadPanelRef} className="grid grid-cols-1 xl:grid-cols-12 gap-4">

                                    {/* ── Upload Card ── */}
                                    <div className="xl:col-span-7 bg-white rounded-xl border border-gray-200 shadow-sm p-5 space-y-4">

                                        {/* Student Info Banner */}
                                        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                                            <div className="w-14 h-14 rounded-full bg-blue-600 text-white text-base font-bold flex items-center justify-center shrink-0 shadow">
                                                {getInitials(studentName)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-base font-bold text-gray-800">{studentName}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Roll No. {selectedStudent.rollNumber || "—"} · {selectedClass?.name} · {selectedSection?.name}
                                                </p>
                                                <p className="text-[11px] text-gray-400">Student ID: {selectedStudent.id}</p>
                                            </div>
                                            <StatusBadge status={selectedStudent.enrollmentStatus} photos={selectedStudent.photosCount} />
                                        </div>

                                        {/* Upload slots */}
                                        <div>
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                    Upload 5 Face Photos <span className="text-red-500">(ALL 5 REQUIRED)</span>
                                                </p>
                                                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${uploadedCount === 5 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>
                                                    {uploadedCount}/5
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-5 gap-3">
                                                {ANGLES.map((a, i) => (
                                                    <PhotoSlot key={i} index={i} file={photos[i]}
                                                        angleLabel={a.label} onAdd={addPhoto} onRemove={removePhoto} />
                                                ))}
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-3">
                                                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full transition-all duration-500 bg-blue-500"
                                                        style={{ width: `${(uploadedCount / 5) * 100}%` }} />
                                                </div>
                                                <p className="text-[11px] text-right mt-1 text-gray-400">
                                                    {uploadedCount === 5 ? "✅ All photos ready to enroll" : `${5 - uploadedCount} more photo${5 - uploadedCount !== 1 ? "s" : ""} needed`}
                                                </p>
                                            </div>

                                            {/* Photo Angles Reference */}
                                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mt-3">
                                                <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                                    <Camera className="w-4 h-4 text-blue-500" /> Recommended Photo Angles
                                                </h3>
                                                <div className="grid grid-cols-5 gap-2">
                                                    {ANGLES.map((a, i) => {
                                                        const captured = !!photos[i];
                                                        return (
                                                            <div key={i} className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border transition-all ${captured ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"}`}>
                                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${captured ? "bg-emerald-500" : "bg-blue-100"}`}>
                                                                    {captured
                                                                        ? <CheckCircle className="w-5 h-5 text-white" />
                                                                        : <a.Icon className="w-4 h-4 text-blue-600" />}
                                                                </div>
                                                                <div className="text-center">
                                                                    <p className={`text-[10px] font-bold leading-tight ${captured ? "text-emerald-700" : "text-gray-600"}`}>{a.label}</p>
                                                                    <p className="text-[9px] text-gray-400 mt-0.5 leading-tight hidden sm:block">{a.desc}</p>
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Guidelines + Actions */}
                                        <div className="flex flex-col sm:flex-row gap-4 pt-1 border-t border-gray-100">
                                            <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 space-y-2">
                                                <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Photo Guidelines</p>
                                                {[
                                                    { ok: true, text: "Clear frontal face, uniform background preferred" },
                                                    { ok: true, text: "5 varied angles for better recognition accuracy" },
                                                    { ok: false, text: "No hats, scarves, or heavy shadows on face" },
                                                    { ok: null, text: "Tip: Classroom lighting works best" },
                                                ].map((g, i) => (
                                                    <div key={i} className="flex items-start gap-2 text-xs text-gray-600">
                                                        <span className="shrink-0">{g.ok === true ? "✅" : g.ok === false ? "❌" : "💡"}</span>
                                                        <span className="leading-snug">{g.text}</span>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex flex-row sm:flex-col gap-2 sm:w-36">
                                                <button
                                                    onClick={() => setPhotos(Array(5).fill(null))}
                                                    className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 text-sm font-semibold transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" /> Clear All
                                                </button>
                                                {selectedStudent.enrollmentStatus !== "NOT_ENROLLED" && (
                                                    <button
                                                        onClick={handleRemove}
                                                        disabled={removing}
                                                        className="cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold transition-colors"
                                                    >
                                                        {removing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />} Remove
                                                    </button>
                                                )}
                                                <button
                                                    onClick={handleEnroll}
                                                    disabled={uploadedCount < 5 || enrolling}
                                                    className={`cursor-pointer flex-1 sm:flex-none flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-white text-sm font-semibold transition-all ${uploadedCount === 5 && !enrolling ? "bg-blue-600 hover:bg-blue-700 shadow-sm" : "bg-gray-300 cursor-not-allowed"}`}
                                                >
                                                    {enrolling
                                                        ? <><RefreshCw className="w-4 h-4 animate-spin" /> Enrolling...</>
                                                        : <><Zap className="w-4 h-4" /> Enroll Student</>}
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column — Section Enrollment Table */}
                                    <div className="xl:col-span-5 space-y-4">
                                        <SectionEnrollmentTable
                                            enrollmentList={enrollmentList}
                                            enrollmentLoading={enrollmentLoading}
                                            selectedStudent={selectedStudent}
                                            onSelectStudent={selectFromEnrollment}
                                            selectedClass={selectedClass}
                                            selectedSection={selectedSection}
                                        />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col items-center justify-center py-24 text-center">
                                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                                    <GraduationCap className="w-8 h-8 text-blue-400" />
                                </div>
                                <p className="text-base font-bold text-gray-700">No student selected</p>
                                <p className="text-sm text-gray-400 mt-1 max-w-xs">Select a class, section, and student from the left panel to begin face enrollment.</p>
                            </div>
                        )}

                        {/* Section Enrollment Table always visible even without selected student */}
                        {!selectedStudent && selectedSection && (
                            <SectionEnrollmentTable
                                enrollmentList={enrollmentList}
                                enrollmentLoading={enrollmentLoading}
                                selectedStudent={selectedStudent}
                                onSelectStudent={selectFromEnrollment}
                                selectedClass={selectedClass}
                                selectedSection={selectedSection}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}