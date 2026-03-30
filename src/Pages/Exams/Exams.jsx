import { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";

import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import NewExamForm from "./NewExamForm";
import AddSubjectForm from "./AddSubjectForm";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";

import { getExams, getExamSubjects, deleteExamSubject, declareExamResult } from "../../Api/Exams";
import { getClasses } from "../../Api/TeachersAPI"; // ✅ Removed: getAllSections (no longer needed)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getExamTypeBg(typeName) {
    const map = {
        "Unit Test 1": "bg-purple-100 text-purple-700",
        "Unit Test 2": "bg-violet-100 text-violet-700",
        "Mid Term":    "bg-blue-100 text-blue-700",
        "Final Term":  "bg-orange-100 text-orange-700",
        "Pre-Board":   "bg-pink-100 text-pink-700",
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
    if (!exam.resultDeclared) {
        return [
            { label: "Enter Marks", value: "enter_marks", icon: LogIn,
              bg: "bg-white", text: "text-gray-700", hover: "hover:bg-gray-50", disabled: false },
            { label: "Declare", value: "declare", icon: CheckCircle,
              bg: "bg-orange-500", text: "text-white", hover: "hover:bg-orange-600", disabled: false },
        ];
    }
    return [
        { label: "Marks",   value: "marks",   icon: Edit2,    bg: "bg-white",    text: "text-gray-700", hover: "hover:bg-gray-50",  disabled: false },
        { label: "Reports", value: "reports", icon: FileText, bg: "bg-blue-600", text: "text-white",    hover: "hover:bg-blue-700", disabled: false },
    ];
}

function buildStats(exams) {
    const total    = exams.length;
    const declared = exams.filter((e) => e.resultDeclared).length;
    const pending  = total - declared;
    const classSet = new Set(exams.map((e) => e.schoolClassName).filter(Boolean));
    const ayLabel  = exams[0]?.academicYearLabel ?? "—";
    return [
        { key: "Total Exams",      val: `${total} — AY ${ayLabel}`,                              icon: ClipboardList, iconBgColor: "bg-blue-50",   iconTxColor: "text-blue-600"   },
        { key: "Results Declared", val: `${declared} — Marks Locked`,                            icon: CheckSquare,  iconBgColor: "bg-green-50",  iconTxColor: "text-green-600"  },
        { key: "Pending Result",   val: `${pending} — Pending`,                                  icon: Clock,        iconBgColor: "bg-yellow-50", iconTxColor: "text-yellow-600" },
        { key: "Classes Covered",  val: `${classSet.size} — ${[...classSet].join(", ") || "—"}`, icon: School,       iconBgColor: "bg-indigo-50", iconTxColor: "text-indigo-600" },
    ];
}

// ─── Exam Card (mobile) ───────────────────────────────────────────────────────
function ExamCard({ exam, onAction }) {
    const typeBg   = getExamTypeBg(exam.examTypeName);
    const resultBg = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
    return (
        <div className="p-4 border-b border-gray-100 last:border-0 hover:bg-blue-50/20 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-3">
                <p className="text-sm font-semibold text-gray-800 leading-tight">{exam.name}</p>
                <ActionDropDownComp actionOptions={getExamActions(exam)} onAction={(a) => onAction(exam.id, a)} />
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
                    <button
                        onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {loading ? "Removing..." : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Declare Confirm Modal ────────────────────────────────────────────────────
function DeclareConfirmModal({ examName, onConfirm, onCancel, loading }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-full">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-800">Declare Result</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">
                    You are about to declare the result for:
                </p>
                <p className="text-sm font-semibold text-gray-800 mb-3">{examName}</p>
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5">
                    This action will <strong>permanently lock all marks</strong> and cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button
                        onClick={onCancel} disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 active:scale-95 transition-all disabled:opacity-60"
                    >
                        {loading ? "Declaring..." : "Yes, Declare"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Exams() {

    // ── Meta ──────────────────────────────────────────────────────────────────
    const [classes,     setClasses]     = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);

    // ── Filters ───────────────────────────────────────────────────────────────
    const [selectedClassId,        setSelectedClassId]        = useState(null);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
    const [selectedExamTypeLabel,  setSelectedExamTypeLabel]  = useState("");

    // ── Data ──────────────────────────────────────────────────────────────────
    const [exams,    setExams]    = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [selectedExamForSubjects, setSelectedExamForSubjects] = useState(null);

    // ── Loading / error ───────────────────────────────────────────────────────
    const [loadingExams,    setLoadingExams]    = useState(false);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [errorExams,      setErrorExams]      = useState(null);
    const [errorSubjects,   setErrorSubjects]   = useState(null);

    // ── Modal state ───────────────────────────────────────────────────────────
    const [showNewExam,     setShowNewExam]     = useState(false);
    const [showAddSubject,  setShowAddSubject]  = useState(false);
    const [editSubject,     setEditSubject]     = useState(null);
    const [deleteTarget,    setDeleteTarget]    = useState(null);
    const [deletingSubject, setDeletingSubject] = useState(false);

    // ── Declare state ─────────────────────────────────────────────────────────
    const [declareTarget, setDeclareTarget] = useState(null); // { id, name }
    const [declaringExam, setDeclaringExam] = useState(false);
    const [declareError,  setDeclareError]  = useState(null);

    // ── Derived ───────────────────────────────────────────────────────────────
    const academicYears = [...new Map(
        exams.map((e) => [e.academicYearId, { id: e.academicYearId, label: e.academicYearLabel }])
    ).values()];

    const examTypeNames = [...new Set(exams.map((e) => e.examTypeName).filter(Boolean))];

    // ── 1. Load classes on mount ───────────────────────────────────────────────
    useEffect(() => {
        const loadMeta = async () => {
            setLoadingMeta(true);
            try {
                // ✅ Only fetch classes — sections no longer needed here
                const cls = await getClasses();
                setClasses(cls);
                if (cls.length > 0) setSelectedClassId(cls[0].id);
            } catch (err) {
                console.error("Exams meta load error:", err);
            } finally {
                setLoadingMeta(false);
            }
        };
        loadMeta();
    }, []);

    // ── 2. Load exams when class / academic-year filter changes ───────────────
    const fetchExams = useCallback(async () => {
        if (!selectedClassId) return;
        setLoadingExams(true);
        setErrorExams(null);
        try {
            const filters = { classId: selectedClassId };
            if (selectedAcademicYearId) filters.academicYearId = selectedAcademicYearId;
            const data = await getExams(filters);
            setExams(data);
            if (data.length > 0 && !selectedExamForSubjects) {
                setSelectedExamForSubjects(data[0]);
            }
        } catch {
            setErrorExams("Failed to load exams. Please try again.");
        } finally {
            setLoadingExams(false);
        }
    }, [selectedClassId, selectedAcademicYearId]);

    useEffect(() => { fetchExams(); }, [fetchExams]);

    // ── 3. Load subjects for selected exam ────────────────────────────────────
    // ✅ Removed selectedSectionId param — AddSubjectForm handles section-subject
    //    scoping internally via getSectionSubjectsByClass(classId)
    const fetchSubjects = useCallback(async () => {
        if (!selectedExamForSubjects?.id) return;
        setLoadingSubjects(true);
        setErrorSubjects(null);
        try {
            // Pass no sectionId — fetch all subjects for this exam
            const data = await getExamSubjects(selectedExamForSubjects.id);
            setSubjects(data);
        } catch {
            setErrorSubjects("Failed to load subjects.");
        } finally {
            setLoadingSubjects(false);
        }
    }, [selectedExamForSubjects?.id]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    // ── Handlers ──────────────────────────────────────────────────────────────
    const handleExamAction = (examId, action) => {
        if (action === "declare") {
            const exam = exams.find((e) => e.id === examId);
            if (exam) setDeclareTarget({ id: exam.id, name: exam.name });
            return;
        }
        // TODO: wire up enter_marks / marks / reports flows
        console.log("Exam action:", examId, action);
    };

    const handleDeclareConfirm = async () => {
        if (!declareTarget) return;
        setDeclaringExam(true);
        setDeclareError(null);
        try {
            const res = await declareExamResult(declareTarget.id);
            const updatedExam = res?.data;

            setExams((prev) =>
                prev.map((e) => (e.id === declareTarget.id ? { ...e, ...updatedExam } : e))
            );
            setSelectedExamForSubjects((prev) =>
                prev?.id === declareTarget.id ? { ...prev, ...updatedExam } : prev
            );
            setDeclareTarget(null);
        } catch (err) {
            console.error("Declare result error:", err);
            setDeclareError("Failed to declare result. Please try again.");
        } finally {
            setDeclaringExam(false);
        }
    };

    const handleNewExamSuccess = () => {
        setShowNewExam(false);
        fetchExams();
    };

    const handleSubjectSuccess = () => {
        setShowAddSubject(false);
        setEditSubject(null);
        fetchSubjects();
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
        } catch (err) {
            console.error("Delete subject error:", err);
        } finally {
            setDeletingSubject(false);
        }
    };

    // ── Derived ───────────────────────────────────────────────────────────────
    const stats = exams.length > 0 ? buildStats(exams) : null;

    const filteredExams = selectedExamTypeLabel
        ? exams.filter((e) => e.examTypeName === selectedExamTypeLabel)
        : exams;

    const selectedClassName = classes.find((c) => c.id === selectedClassId)?.name ?? "";
    const selectedAYLabel   = academicYears.find((y) => y.id === Number(selectedAcademicYearId))?.label ?? "";

    // ── Resolve classId to pass to AddSubjectForm ─────────────────────────────
    // ✅ Try both field names the backend might return
    const examClassId = selectedExamForSubjects
        ? (selectedExamForSubjects.schoolClassId || selectedExamForSubjects.classId || selectedClassId)
        : null;

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f3f6fb] p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">

            {/* Page Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    <TooltipComponent message="Efficiently manage exams." direction="right" color="nocolor">
                        Manage All Exams
                    </TooltipComponent>
                </h2>
            </div>

            {/* Declare Error Banner */}
            {declareError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {declareError}
                    <button
                        onClick={() => setDeclareError(null)}
                        className="ml-auto text-red-400 hover:text-red-600 text-lg leading-none"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* ── Stats Row ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {loadingExams || loadingMeta || !stats
                    ? Array(4).fill(0).map((_, i) => <CardLoader key={i} />)
                    : stats.map((s) => (
                        <CardComponent
                            key={s.key}
                            IconName={s.icon}
                            keyName={s.key}
                            val={s.val}
                            iconBgColor={s.iconBgColor}
                            iconTxColor={s.iconTxColor}
                        />
                    ))}
            </div>

            {/* ── Filters + New Exam ── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-4 sm:px-5 py-4">
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">

                    {/* Class */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedClassId ?? ""}
                            onChange={(e) => {
                                setSelectedClassId(Number(e.target.value));
                                setSelectedExamForSubjects(null);
                            }}
                            disabled={loadingMeta}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60"
                        >
                            {loadingMeta
                                ? <option>Loading...</option>
                                : classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)
                            }
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Academic Year */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedAcademicYearId}
                            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Years</option>
                            {academicYears.map((y) => (
                                <option key={y.id} value={y.id}>{y.label}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    {/* Exam Type */}
                    <div className="relative w-full sm:w-auto">
                        <select
                            value={selectedExamTypeLabel}
                            onChange={(e) => setSelectedExamTypeLabel(e.target.value)}
                            className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="">All Types</option>
                            {examTypeNames.map((name) => (
                                <option key={name} value={name}>{name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>

                    <div className="hidden sm:block flex-1" />

                    <button
                        onClick={() => setShowNewExam(true)}
                        className="flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95"
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
                        {selectedClassName && (
                            <> — <span className="text-blue-600">
                                {selectedClassName}{selectedAYLabel ? ` (${selectedAYLabel})` : ""}
                            </span></>
                        )}
                    </h2>
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                        {filteredExams.length} exam{filteredExams.length !== 1 ? "s" : ""}
                    </span>
                </div>

                {errorExams && (
                    <div className="px-6 py-4 text-sm text-red-600 bg-red-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errorExams}
                    </div>
                )}

                {/* Mobile */}
                <div className="block md:hidden">
                    {loadingExams
                        ? (
                            <div className="divide-y divide-gray-100">
                                {Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="p-4 space-y-2 animate-pulse">
                                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                                        <div className="flex gap-2">
                                            <div className="h-6 bg-gray-100 rounded-full w-20" />
                                            <div className="h-6 bg-gray-100 rounded-full w-16" />
                                            <div className="h-6 bg-gray-100 rounded-full w-20" />
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    </div>
                                ))}
                            </div>
                        )
                        : filteredExams.length === 0
                            ? <p className="text-sm text-gray-400 text-center py-10">No exams found.</p>
                            : filteredExams.map((exam) => (
                                <ExamCard key={exam.id} exam={exam} onAction={handleExamAction} />
                            ))
                    }
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-y border-gray-100">
                                {["Exam Name", "Type", "Class", "Date Range", "Subjects", "Status", "Result", "Actions"].map((h) => (
                                    <th
                                        key={h}
                                        className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                                    >
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loadingExams ? (
                                <ListLoader rows={3} avatar={false} colSpanSet={8} />
                            ) : filteredExams.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="text-center text-sm text-gray-400 py-10">
                                        No exams found.
                                    </td>
                                </tr>
                            ) : filteredExams.map((exam) => {
                                const typeBg     = getExamTypeBg(exam.examTypeName);
                                const resultBg   = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
                                const isSelected = selectedExamForSubjects?.id === exam.id;
                                return (
                                    <tr
                                        key={exam.id}
                                        onClick={() => setSelectedExamForSubjects(exam)}
                                        className={`border-b border-gray-50 hover:bg-blue-50/30 transition-colors cursor-pointer ${isSelected ? "bg-blue-50/40 border-l-2 border-l-blue-500" : ""}`}
                                    >
                                        <td className="px-4 py-3 font-semibold text-gray-800 whitespace-nowrap">{exam.name}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${typeBg}`}>{exam.examTypeName}</span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{exam.schoolClassName}</td>
                                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDateRange(exam.startDate, exam.endDate)}</td>
                                        <td className="px-4 py-3">
                                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                                                {exam.subjectConfigCount ?? 0} subjects
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            {exam.isActive && (
                                                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700">Active</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold w-fit ${resultBg}`}>
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
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-sm sm:text-base font-semibold text-gray-800">
                            Subject Configuration
                            {selectedExamForSubjects && (
                                <> — <span className="text-blue-600">{selectedExamForSubjects.name}</span></>
                            )}
                        </h2>
                        {!selectedExamForSubjects && (
                            <p className="text-xs text-gray-400">Click an exam row above to configure its subjects.</p>
                        )}
                    </div>

                    {/* ✅ Removed: section filter dropdown — no longer needed */}
                    <button
                        onClick={() => { setEditSubject(null); setShowAddSubject(true); }}
                        disabled={!selectedExamForSubjects}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto justify-center"
                    >
                        <Plus className="w-4 h-4" />
                        Add Subject
                    </button>
                </div>

                {errorSubjects && (
                    <div className="px-6 py-3 text-sm text-red-600 bg-red-50 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" /> {errorSubjects}
                    </div>
                )}

                {/* Mobile card layout */}
                <div className="block sm:hidden divide-y divide-gray-100">
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
                                            <div className="h-3 bg-gray-100 rounded w-12" />
                                        </div>
                                        <div className="h-6 bg-gray-100 rounded-full w-32" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : subjects.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-10">
                            {selectedExamForSubjects ? "No subjects configured." : "Select an exam to view subjects."}
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
                                    <span className="text-xs text-gray-500">Section: <b>{sub.sectionName}</b></span>
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
                                <button
                                    onClick={() => handleEditSubject(sub)}
                                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => setDeleteTarget({ configId: sub.id, subjectName: sub.subjectName })}
                                    className="p-1.5 text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto pb-2">
                    <table className="w-full text-sm">
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
                                        {selectedExamForSubjects
                                            ? "No subjects configured for this exam."
                                            : "Select an exam row above to view subjects."}
                                    </td>
                                </tr>
                            ) : subjects.map((sub) => (
                                <tr key={sub.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                                    <td className="px-4 lg:px-6 py-3">
                                        <div className="flex items-center gap-2 font-medium text-gray-800">
                                            <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                                            {sub.subjectName}
                                        </div>
                                    </td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-500 font-mono text-xs">{sub.subjectCode}</td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-600">{sub.sectionName}</td>
                                    <td className="px-4 lg:px-6 py-3 font-bold text-gray-800">{sub.maxMarks}</td>
                                    <td className="px-4 lg:px-6 py-3 text-gray-600">{sub.passingMarks}</td>
                                    <td className="px-4 lg:px-6 py-3">
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
                                            <button
                                                onClick={() => handleEditSubject(sub)}
                                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => setDeleteTarget({ configId: sub.id, subjectName: sub.subjectName })}
                                                className="p-1.5 text-red-500 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-all"
                                                title="Remove subject"
                                            >
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
                />
            )}

            {/* ✅ Fixed AddSubjectForm call:
                - Removed: defaultSectionId (prop no longer exists)
                - classId uses examClassId which falls back to selectedClassId
                  in case the exam object doesn't have schoolClassId/classId field
            */}
            {showAddSubject && selectedExamForSubjects && (
                <AddSubjectForm
                    onClose={() => { setShowAddSubject(false); setEditSubject(null); }}
                    onSuccess={handleSubjectSuccess}
                    examId={selectedExamForSubjects.id}
                    examName={selectedExamForSubjects.name}
                    classId={examClassId}
                    editData={editSubject}
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
        </div>
    );
}