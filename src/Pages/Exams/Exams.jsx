import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList,
    CheckSquare,
    Clock,
    School,
    Plus,
    BookOpen,
    ChevronDown,
    Edit2,
    FileText,
    LogIn,
    CheckCircle,
    Trash2,
    AlertCircle,
    RefreshCw,
} from "lucide-react";

import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import ListLoader from "../../Components/CommonComp/ListLoader";
import NewExamForm from "./NewExamForm";
import AddSubjectForm from "./AddSubjectForm";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import UpdateSubjectForm from "./UpdateExamForm";

import { getExams, getExamSubjects, deleteExamSubject, declareExamResult, getExamTypes } from "../../Api/Exams";
import { getActiveClasses } from "../../Api/TeachersAPI";
import { getListOfValues } from "../../Api/ListOfValues";

const ACADEMIC_YEAR_LOV = "ACADEMIC_YEAR";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExamTypeBg(typeName) {
    const map = {
        "Unit Test 1": "bg-purple-100 text-purple-700",
        "Unit Test 2": "bg-violet-100 text-violet-700",
        "Mid Term": "bg-blue-100 text-blue-700",
        "Mid Term-1": "bg-blue-100 text-blue-700",
        "Mid Term-2": "bg-cyan-100 text-cyan-700",
        "Final Term": "bg-orange-100 text-orange-700",
        "Pre-Board": "bg-pink-100 text-pink-700",
    };
    return map[typeName] ?? "bg-gray-100 text-gray-700";
}

function formatDateRange(startDate, endDate) {
    if (!startDate || !endDate) return "—";
    const fmt = (d) =>
        new Date(d).toLocaleDateString("en-IN", {
            day: "numeric", month: "short", year: "numeric",
        });
    return `${fmt(startDate)} – ${fmt(endDate)}`;
}

function getExamActions(exam) {
    if (!exam) return [];
    if (!exam.resultDeclared) {
        return [
            {
                label: "Enter Marks", value: "enter_marks", icon: LogIn,
                bg: "bg-white", text: "text-gray-700", hover: "hover:bg-gray-50", disabled: false,
            },
            {
                label: "Declare", value: "declare", icon: CheckCircle,
                bg: "bg-orange-500", text: "text-white", hover: "hover:bg-orange-600", disabled: false,
            },
        ];
    }
    return [
        { label: "Marks", value: "marks", icon: Edit2, bg: "bg-white", text: "text-gray-700", hover: "hover:bg-gray-50", disabled: false },
        { label: "Reports", value: "reports", icon: FileText, bg: "bg-blue-600", text: "text-white", hover: "hover:bg-blue-700", disabled: false },
    ];
}

function buildStats(exams) {
    const total = Array.isArray(exams) ? exams.length : 0;
    const declared = Array.isArray(exams) ? exams.filter((e) => e.resultDeclared).length : 0;
    const pending = total - declared;
    const classSet = new Set((Array.isArray(exams) ? exams : []).map((e) => e.schoolClassName).filter(Boolean));
    const ayLabels = [...new Set((Array.isArray(exams) ? exams : []).map((e) => e.academicYearLabel).filter(Boolean))];
    const ayLabel = ayLabels.join(", ") || "—";

    return [
        {
            key: "Total Exams",
            val: total > 0 ? `${total} — AY ${ayLabel}` : "0 — No exams yet",
            Icon: ClipboardList,
            iconBg: "bg-blue-50",
            iconColor: "text-blue-600",
        },
        {
            key: "Results Declared",
            val: declared > 0 ? `${declared} — Marks Locked` : "0 — None declared",
            Icon: CheckSquare,
            iconBg: "bg-green-50",
            iconColor: "text-green-600",
        },
        {
            key: "Pending Result",
            val: pending > 0 ? `${pending} — Pending` : "0 — All clear",
            Icon: Clock,
            iconBg: "bg-yellow-50",
            iconColor: "text-yellow-500",
        },
        {
            key: "Classes Covered",
            val: classSet.size > 0 ? `${classSet.size} — ${[...classSet].join(", ")}` : "0 — No classes",
            Icon: School,
            iconBg: "bg-indigo-50",
            iconColor: "text-indigo-600",
        },
    ];
}

// ─── Inline Stat Card — fully controlled, no external component ───────────────
function StatCard({ stat }) {
    const { key, val, Icon, iconBg, iconColor } = stat;
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 w-full min-w-0">
            <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon className={`w-5 h-5 ${iconColor}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">{key}</p>
                <p className="text-sm font-bold text-gray-900 mt-0.5 truncate">{val}</p>
            </div>
        </div>
    );
}

// ─── Inline Stat Card Skeleton ────────────────────────────────────────────────
function StatCardLoader() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 w-full min-w-0 animate-pulse">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-100" />
            <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    );
}

// ─── Exam Card (mobile) ───────────────────────────────────────────────────────
function ExamCard({ exam, onAction, isSelected, onClick }) {
    const typeBg = getExamTypeBg(exam.examTypeName);
    const resultBg = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
    return (
        <div
            onClick={onClick}
            className={`p-4 border-b border-gray-100 last:border-0 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/50 border-l-2 border-l-blue-500" : "hover:bg-blue-50/20"}`}
        >
            <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{exam.name}</p>
                <div onClick={(e) => e.stopPropagation()}>
                    <ActionDropDownComp actionOptions={getExamActions(exam)} onAction={(a) => onAction(exam.id, a)} />
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeBg}`}>{exam.examTypeName}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{exam.schoolClassName}</span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{exam.subjectConfigCount ?? 0} subjects</span>
                {exam.isActive && <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Active</span>}
                <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${resultBg}`}>
                    {exam.resultDeclared ? <CheckSquare className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {exam.resultDeclared ? "Declared" : "Pending"}
                </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">{formatDateRange(exam.startDate, exam.endDate)}</p>
        </div>
    );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
function DeleteConfirmModal({ subjectName, onConfirm, onCancel, loading }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 rounded-full">
                        <AlertCircle className="w-5 h-5 text-red-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Remove Subject</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5">
                    Are you sure you want to remove <strong>{subjectName}</strong> from this exam?
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? "Removing..." : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Declare Confirm Modal ────────────────────────────────────────────────────
function DeclareConfirmModal({ examName, onConfirm, onCancel, loading }) {
    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = ""; };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-full">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Declare Result</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">You are about to declare the result for:</p>
                <p className="text-sm font-semibold text-gray-800 mb-3">{examName}</p>
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5">
                    This action will <strong>permanently lock all marks</strong> and cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-60">
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60 flex items-center gap-2">
                        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? "Declaring..." : "Yes, Declare"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Error Toast ──────────────────────────────────────────────────────────────
function ErrorToast({ message, onClose }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000);
        return () => clearTimeout(t);
    }, [onClose]);
    return (
        <div className="fixed bottom-4 right-4 z-50 bg-red-500 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {message}
            <button onClick={onClose} className="ml-2 text-white/80 hover:text-white text-lg leading-none">×</button>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Exams() {
    const navigate = useNavigate();

    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [errorMeta, setErrorMeta] = useState(null);

    const [selectedClassId, setSelectedClassId] = useState("");
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
    const [selectedExamTypeId, setSelectedExamTypeId] = useState("");
    const [exams, setExams] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [selectedTypeId, setSelectedTypeId] = useState("");
    const [subjects, setSubjects] = useState([]);
    const [selectedExamForSubjects, setSelectedExamForSubjects] = useState(null);
    const [showUpdateSubjects, setShowUpdateSubjects] = useState(false);

    const [loadingExams, setLoadingExams] = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [errorExams, setErrorExams] = useState(null);
    const [errorSubjects, setErrorSubjects] = useState(null);
    const [deleteError, setDeleteError] = useState(null);

    const [showNewExam, setShowNewExam] = useState(false);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [editSubject, setEditSubject] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingSubject, setDeletingSubject] = useState(false);

    const [declareTarget, setDeclareTarget] = useState(null);
    const [declaringExam, setDeclaringExam] = useState(false);
    const [declareError, setDeclareError] = useState(null);
    const hasAutoSelectedExam = useRef(false);

    const examTypeNames = [...new Set(exams.map((e) => e.examTypeName).filter(Boolean))];

    // ── Load meta ────────────────────────────────────────────────────────────
    useEffect(() => {
        const loadMeta = async () => {
            setLoadingMeta(true);
            setErrorMeta(null);
            try {
                const [cls, years, types] = await Promise.all([
                    getActiveClasses(),
                    getListOfValues(ACADEMIC_YEAR_LOV),
                    getExamTypes(),
                ]);
                setExamTypes(Array.isArray(types) ? types : []);
                setClasses(Array.isArray(cls) ? cls : []);
                setAcademicYears(Array.isArray(years) ? years : []);
            } catch (err) {
                console.error("Exams meta load error:", err);
                setErrorMeta("Failed to load filters. Please refresh the page.");
            } finally {
                setLoadingMeta(false);
            }
        };
        loadMeta();
    }, []);

    // ── Fetch exams ───────────────────────────────────────────────────────────
    const fetchExams = useCallback(async () => {
        setLoadingExams(true);
        setErrorExams(null);
        try {
            const filters = {};

            if (selectedClassId) {
                filters.classId = selectedClassId;
            }

            if (selectedAcademicYearId) {
                filters.academicYearId = selectedAcademicYearId;
            }

            if (selectedExamTypeId) {
                filters.examTypeId = selectedExamTypeId;
            }
            const data = await getExams(filters);
            const examList = Array.isArray(data) ? data : [];
            setExams(examList);
            if (examList.length > 0 && !hasAutoSelectedExam.current) {
                setSelectedExamForSubjects(examList[0]);
                hasAutoSelectedExam.current = true;
            } else if (examList.length === 0) {
                setSelectedExamForSubjects(null);
                setSubjects([]);
            } else if (selectedExamForSubjects) {
                const refreshed = examList.find((e) => e.id === selectedExamForSubjects.id);
                if (refreshed) setSelectedExamForSubjects(refreshed);
            }
        } catch (err) {
            console.error("fetchExams error:", err);
            setErrorExams("Failed to load exams. Please try again.");
            setExams([]);
        } finally {
            setLoadingExams(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClassId, selectedAcademicYearId, selectedExamTypeId]);
    useEffect(() => {
        if (!loadingMeta) fetchExams();
    }, [fetchExams, loadingMeta]);

    // ── Fetch subjects ────────────────────────────────────────────────────────
    const fetchSubjects = useCallback(async () => {
        if (!selectedExamForSubjects?.id) { setSubjects([]); return; }
        setLoadingSubjects(true);
        setErrorSubjects(null);
        try {
            const data = await getExamSubjects(selectedExamForSubjects.id);
            setSubjects(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("fetchSubjects error:", err);
            setErrorSubjects("Failed to load subjects. Please try again.");
            setSubjects([]);
        } finally {
            setLoadingSubjects(false);
        }
    }, [selectedExamForSubjects?.id]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleClassChange = (newClassId) => {
        setSelectedClassId(newClassId);
        setSelectedExamForSubjects(null);
        setSubjects([]);
        setExams([]);
        setSelectedExamTypeLabel("");
        hasAutoSelectedExam.current = false;
    };

    const handleAcademicYearChange = (yearId) => {
        setSelectedAcademicYearId(yearId);
        setSelectedExamForSubjects(null);
        setSubjects([]);
        setExams([]);
        setSelectedExamTypeLabel("");
        hasAutoSelectedExam.current = false;
    };

    const handleExamAction = (examId, action) => {
        if (action === "declare") {
            const exam = exams.find((e) => e.id === examId);
            if (exam && !exam.resultDeclared) setDeclareTarget({ id: exam.id, name: exam.name });
            return;
        }
        if (action === "enter_marks" || action === "marks") {
            navigate(`/exams/marksEntry/${examId}`);
            return;
        }
        if (action === "reports") {
            navigate(`/exams/reportCard/${examId}`);
            return;
        }
    };

    const handleDeclareConfirm = async () => {
        if (!declareTarget) return;
        setDeclaringExam(true);
        setDeclareError(null);
        try {
            const res = await declareExamResult(declareTarget.id);
            const updatedExam = res?.data ?? res ?? {};
            setExams((prev) => prev.map((e) => e.id === declareTarget.id ? { ...e, resultDeclared: true, ...updatedExam } : e));
            setSelectedExamForSubjects((prev) => prev?.id === declareTarget.id ? { ...prev, resultDeclared: true, ...updatedExam } : prev);
            setDeclareTarget(null);
        } catch (err) {
            console.error("Declare result error:", err);
            setDeclareError(err?.message || "Failed to declare result. Please try again.");
        } finally {
            setDeclaringExam(false);
        }
    };

    const handleNewExamSuccess = () => {
        setShowNewExam(false);
        hasAutoSelectedExam.current = false;
        fetchExams();
    };

    const handleSubjectSuccess = () => {
        setShowAddSubject(false);
        setEditSubject(null);
        fetchSubjects();
        fetchExams();
    };

    const handleEditSubject = (subConfig) => {
        setEditSubject(subConfig);
        setShowAddSubject(true);
    };

    const handleDeleteSubject = async () => {
        if (!deleteTarget || !selectedExamForSubjects) return;
        setDeletingSubject(true);
        try {
            await deleteExamSubject(selectedExamForSubjects.id, deleteTarget.configId);
            setDeleteTarget(null);
            fetchSubjects();
            fetchExams();
        } catch (err) {
            console.error("Delete subject error:", err);
            setDeleteError(err?.message || "Failed to remove subject. Please try again.");
            setDeleteTarget(null);
        } finally {
            setDeletingSubject(false);
        }
    };

    const handleExamRowClick = (exam) => {
        setSelectedExamForSubjects(exam);
        setSubjects([]);
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const stats = buildStats(exams);
    const filteredExams = exams;
    const selectedClassName = classes.find((c) => String(c.id) === String(selectedClassId))?.name ?? "";
    const selectedAYLabel = academicYears.find((y) => String(y.id) === String(selectedAcademicYearId))?.label ?? "";
    const examClassId = selectedExamForSubjects
        ? (selectedExamForSubjects.schoolClassId || selectedExamForSubjects.classId || selectedExamForSubjects.class_id || selectedClassId || null)
        : selectedClassId || null;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f3f6fb] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

            {/* Page Title */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Efficiently manage exams." direction="right" color="nocolor">
                        Manage All Exams
                    </TooltipComponent>
                </h2>
            </div>

            {/* Meta error banner */}
            {errorMeta && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {errorMeta}
                    <button onClick={() => window.location.reload()} className="ml-auto text-red-600 hover:text-red-800 text-xs font-medium underline">
                        Refresh
                    </button>
                </div>
            )}

            {/* Declare Error Banner */}
            {declareError && !declareTarget && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {declareError}
                    <button onClick={() => setDeclareError(null)} className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none">×</button>
                </div>
            )}

            {/*
              ── Stats Grid ──────────────────────────────────────────────────
              Mobile  (<640px)  : 1 col — full width
              Tablet  (640px+)  : 2 col — 2×2 grid, each card fills its cell
              Desktop (1024px+) : 4 col — one row

              KEY FIX: StatCard is a self-contained component with w-full + min-w-0
              so it ALWAYS fits its grid cell no matter the viewport.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(loadingExams || loadingMeta)
                    ? Array(4).fill(0).map((_, i) => <StatCardLoader key={i} />)
                    : stats.map((s) => <StatCard key={s.key} stat={s} />)
                }
            </div>

            {/* ── Filters + New Exam ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                {/*
                  Mobile: stack vertically (flex-col)
                  Tablet+: horizontal row with wrapping (flex-row flex-wrap)
                  Selects have explicit max-w so they never push the row wider than the container
                */}
                <div className="flex flex-col sm:flex-row flex-wrap gap-3">

                    {/* Class */}
                    <div className="relative w-full sm:w-36">
                        <select
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value)}
                            disabled={loadingMeta || !!errorMeta}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="">All Classes</option>
                            {loadingMeta
                                ? <option disabled>Loading...</option>
                                : classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                            }
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Academic Year */}
                    <div className="relative w-full sm:w-36">
                        <select
                            value={selectedAcademicYearId}
                            onChange={(e) => handleAcademicYearChange(e.target.value)}
                            disabled={loadingMeta}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="">All Years</option>
                            {loadingMeta
                                ? <option disabled>Loading...</option>
                                : academicYears.map((y) => <option key={y.id} value={y.id}>{y.label ?? y.name ?? y.value}</option>)
                            }
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Exam Type */}
                    <div className="relative w-full sm:w-36">
                        <select
                            value={selectedExamTypeId}
                            onChange={(e) => setSelectedExamTypeId(e.target.value)}
                            disabled={loadingExams || examTypeNames.length === 0}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <option value="">All Types</option>
                            {examTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                    {type.name}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Spacer — pushes button right on sm+ */}
                    <div className="hidden sm:block flex-1" />

                    <button
                        onClick={() => setShowNewExam(true)}
                        disabled={loadingMeta}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        <Plus className="w-4 h-4" />
                        New Exam
                    </button>
                </div>
            </div>

            {/* ── Exam Schedule ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">
                    <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate pr-2">
                        Exam Schedule
                        {(selectedClassName || selectedAYLabel) && (
                            <> — <span className="text-blue-600">
                                {selectedClassName || "All Classes"}{selectedAYLabel ? ` (${selectedAYLabel})` : ""}
                            </span></>
                        )}
                    </h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {loadingExams ? "..." : `${filteredExams.length} exam${filteredExams.length !== 1 ? "s" : ""}`}
                    </span>
                </div>

                {errorExams && (
                    <div className="px-6 py-4 text-sm text-red-600 bg-red-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorExams}
                        <button onClick={fetchExams} className="ml-auto text-blue-600 hover:text-blue-800 text-xs font-medium underline">Retry</button>
                    </div>
                )}

                {/* Mobile list */}
                <div className="block xl:hidden">
                    {loadingExams ? (
                        <div className="divide-y divide-gray-100">
                            {Array(3).fill(0).map((_, i) => (
                                <div key={i} className="p-4 space-y-2 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="flex gap-2">
                                        <div className="h-6 bg-gray-100 rounded-full w-20" />
                                        <div className="h-6 bg-gray-100 rounded-full w-16" />
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : filteredExams.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            {exams.length > 0 ? "No exams match the selected filter." : "No exams found. Create your first exam!"}
                        </p>
                    ) : filteredExams.map((exam) => (
                        <ExamCard
                            key={exam.id}
                            exam={exam}
                            onAction={handleExamAction}
                            isSelected={selectedExamForSubjects?.id === exam.id}
                            onClick={() => handleExamRowClick(exam)}
                        />
                    ))}
                </div>

                {/* Desktop table — horizontal scroll when content is wider than container */}
                <div className="hidden xl:block w-full overflow-x-auto">
                    <table className="w-full min-w-[820px] text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                {["#", "Exam Name", "Type", "Class", "Date Range", "Subjects", "Status", "Result", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loadingExams ? (
                                <ListLoader rows={3} avatar={false} colSpanSet={9} />
                            ) : filteredExams.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="text-center text-sm text-gray-400 py-10">
                                        {exams.length > 0 ? "No exams match the selected filter." : "No exams found. Create your first exam!"}
                                    </td>
                                </tr>
                            ) : filteredExams.map((exam, idx) => {
                                const typeBg = getExamTypeBg(exam.examTypeName);
                                const resultBg = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
                                const isSelected = selectedExamForSubjects?.id === exam.id;
                                return (
                                    <tr
                                        key={exam.id}
                                        onClick={() => handleExamRowClick(exam)}
                                        className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/40 border-l-4 border-l-blue-500" : ""}`}
                                    >
                                        <td className="px-4 py-3 text-gray-400 text-xs font-medium">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{exam.name}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeBg}`}>{exam.examTypeName ?? "—"}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{exam.schoolClassName ?? "—"}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateRange(exam.startDate, exam.endDate)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                {exam.subjectConfigCount ?? 0} subjects
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${exam.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                {exam.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${resultBg}`}>
                                                {exam.resultDeclared ? <CheckSquare className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                                {exam.resultDeclared ? "Declared" : "Pending"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                            <ActionDropDownComp
                                                actionOptions={getExamActions(exam)}
                                                onAction={(action) => handleExamAction(exam.id, action)}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Subject Configuration ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-gray-100">
                    <div className="min-w-0">
                        <h2 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                            Subject Configuration
                            {selectedExamForSubjects && (
                                <> — <span className="text-blue-600">{selectedExamForSubjects.name}</span></>
                            )}
                        </h2>
                        {!selectedExamForSubjects && (
                            <p className="text-xs text-gray-400 mt-0.5">Click an exam row above to configure its subjects.</p>
                        )}
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <button
                            onClick={() => { setEditSubject(null); setShowAddSubject(true); }}
                            disabled={!selectedExamForSubjects || loadingExams}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-4 h-4" />
                            Add Subject
                        </button>
                        <button
                            onClick={() => setShowUpdateSubjects(true)}
                            disabled={!selectedExamForSubjects || loadingExams || subjects.length === 0}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className="w-4 h-4" />
                            Update Subject
                        </button>
                    </div>
                </div>

                {errorSubjects && (
                    <div className="px-6 py-3 text-sm text-red-600 bg-red-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        {errorSubjects}
                        <button onClick={fetchSubjects} className="ml-auto text-blue-600 hover:text-blue-800 text-xs font-medium underline">Retry</button>
                    </div>
                )}

                {/* Mobile card layout */}
                <div className="block xl:hidden divide-y divide-gray-100">
                    {loadingSubjects ? (
                        <div className="divide-y divide-gray-100">
                            {Array(4).fill(0).map((_, i) => (
                                <div key={i} className="p-4 flex items-start gap-3 animate-pulse">
                                    <div className="w-8 h-8 bg-gray-200 rounded-full shrink-0 mt-0.5" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="flex gap-2">
                                            <div className="h-3 bg-gray-100 rounded w-16" />
                                            <div className="h-3 bg-gray-100 rounded w-12" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : subjects.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            {selectedExamForSubjects ? "No subjects configured for this exam." : "Select an exam to view subjects."}
                        </p>
                    ) : subjects.map((sub) => (
                        <div key={sub.id} className="p-4 flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                    <span className="font-semibold text-sm text-gray-800 truncate">{sub.subjectName}</span>
                                    <span className="text-xs text-gray-400 font-mono shrink-0">{sub.subjectCode}</span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs text-gray-500">Section: <b>{sub.sectionName ?? "—"}</b></span>
                                    <span className="text-xs text-gray-500">Max: <b>{sub.maxMarks}</b></span>
                                    <span className="text-xs text-gray-500">Pass: <b>{sub.passingMarks}</b></span>
                                </div>
                                <div className="mt-2">
                                    {sub.hasTheoryPractical ? (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                            Theory {sub.maxTheoryMarks} + Practical {sub.maxPracticalMarks}
                                        </span>
                                    ) : (
                                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Full marks</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button onClick={() => handleEditSubject(sub)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                                    Edit
                                </button>
                                <button onClick={() => setDeleteTarget({ configId: sub.id, subjectName: sub.subjectName })}
                                    className="p-1.5 text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table — horizontal scroll */}
                <div className="hidden xl:block w-full overflow-x-auto">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                {["Subject", "Code", "Section", "Max Marks", "Pass Marks", "Theory / Practical", "Actions"].map((h) => (
                                    <th key={h} className="text-left px-4 lg:px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loadingSubjects ? (
                                <ListLoader rows={4} avatar={true} colSpanSet={7} />
                            ) : subjects.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="text-center text-sm text-gray-400 py-10">
                                        {selectedExamForSubjects ? "No subjects configured for this exam." : "Select an exam row above to view subjects."}
                                    </td>
                                </tr>
                            ) : subjects.map((sub) => (
                                <tr key={sub.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                                    <td className="px-4 lg:px-6 py-3">
                                        <div className="flex items-center gap-2 font-medium text-gray-800 whitespace-nowrap">
                                            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                            {sub.subjectName}
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-500 font-mono text-xs whitespace-nowrap">{sub.subjectCode ?? "—"}</td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-600 whitespace-nowrap">{sub.sectionName ?? "—"}</td>
                                    <td className="px-4 lg:px-6 py-3 font-bold text-gray-800">{sub.maxMarks}</td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-600">{sub.passingMarks}</td>
                                    <td className="px-4 lg:px-6 py-3 whitespace-nowrap">
                                        {sub.hasTheoryPractical ? (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                Theory {sub.maxTheoryMarks} + Practical {sub.maxPracticalMarks}
                                            </span>
                                        ) : (
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Full marks</span>
                                        )}
                                    </td>
                                    <td className="px-4 lg:px-6 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => handleEditSubject(sub)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all whitespace-nowrap">
                                                Edit
                                            </button>
                                            <button onClick={() => setDeleteTarget({ configId: sub.id, subjectName: sub.subjectName })}
                                                className="p-1.5 text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                                                title="Remove subject">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Modals ── */}
            {showNewExam && (
                <NewExamForm
                    onClose={() => setShowNewExam(false)}
                    onSuccess={handleNewExamSuccess}
                    defaultClassId={selectedClassId || null}
                />
            )}

            {showAddSubject && selectedExamForSubjects && examClassId && (
                <AddSubjectForm
                    onClose={() => { setShowAddSubject(false); setEditSubject(null); }}
                    onSuccess={handleSubjectSuccess}
                    examId={selectedExamForSubjects.id}
                    examName={selectedExamForSubjects.name}
                    classId={examClassId}
                    editData={editSubject}
                    alreadyAddedSubjects={subjects}
                />
            )}

            {showUpdateSubjects && selectedExamForSubjects && (
                <UpdateSubjectForm
                    examId={selectedExamForSubjects.id}
                    examName={selectedExamForSubjects.name}
                    subjects={subjects}
                    onClose={() => setShowUpdateSubjects(false)}
                    onSuccess={() => {
                        setShowUpdateSubjects(false);
                        fetchSubjects();
                        fetchExams();
                    }}
                />
            )}

            {deleteTarget && (
                <DeleteConfirmModal
                    subjectName={deleteTarget.subjectName}
                    onConfirm={handleDeleteSubject}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deletingSubject}
                />
            )}

            {declareTarget && (
                <DeclareConfirmModal
                    examName={declareTarget.name}
                    onConfirm={handleDeclareConfirm}
                    onCancel={() => { setDeclareTarget(null); setDeclareError(null); }}
                    loading={declaringExam}
                />
            )}

            {deleteError && (
                <ErrorToast message={deleteError} onClose={() => setDeleteError(null)} />
            )}
        </div>
    );
}