import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList, CheckSquare, Clock, School,
    Plus, BookOpen, ChevronDown, Edit2, FileText,
    LogIn, CheckCircle, Trash2, AlertCircle, RefreshCw,
    ChevronLeft, ChevronRight
} from "lucide-react";

import ListLoader from "../../Components/CommonComp/ListLoader";
import NewExamForm from "./NewExamForm";
import AddSubjectForm from "./AddSubjectForm";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import UpdateSubjectForm from "./UpdateExamForm";

import { getExams, getExamSubjects, deleteExamSubject, declareExamResult, getExamTypes } from "../../Api/Exams";
import { getActiveClasses } from "../../Api/TeachersAPI";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYear";
import { useDecodedUser } from "../../ContextAPI/UserContext";

// ─── tiny helpers ─────────────────────────────────────────────────────────────
function examTypeBg(name = "") {
    const m = {
        "Unit Test 1": "bg-purple-100 text-purple-700",
        "Unit Test 2": "bg-violet-100 text-violet-700",
        "Mid Term": "bg-blue-100 text-blue-700",
        "Mid Term-1": "bg-blue-100 text-blue-700",
        "Mid Term-2": "bg-cyan-100 text-cyan-700",
        "Final Term": "bg-orange-100 text-orange-700",
        "Pre-Board": "bg-pink-100 text-pink-700",
    };
    return m[name] ?? "bg-gray-100 text-gray-700";
}

function fmtRange(s, e) {
    if (!s || !e) return "—";
    const f = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return `${f(s)} – ${f(e)}`;
}

// ─── stat data builder ────────────────────────────────────────────────────────
function buildStats(exams) {
    const list = Array.isArray(exams) ? exams : [];
    const total = list.length;
    const declared = list.filter(e => e.resultDeclared).length;
    const pending = total - declared;
    const classes = new Set(list.map(e => e.schoolClassName).filter(Boolean));

    return [
        { label: "Total Exams", count: total, sub: "Scheduled", Icon: ClipboardList, bg: "bg-blue-50", ic: "text-blue-500", num: "text-blue-700" },
        { label: "Results Declared", count: declared, sub: "Marks Locked", Icon: CheckSquare, bg: "bg-green-50", ic: "text-green-500", num: "text-green-700" },
        { label: "Pending Result", count: pending, sub: pending ? "Awaiting" : "All clear", Icon: Clock, bg: "bg-amber-50", ic: "text-amber-500", num: "text-amber-600" },
        { label: "Classes Covered", count: classes.size, sub: classes.size ? [...classes].join(", ") : "None yet", Icon: School, bg: "bg-indigo-50", ic: "text-indigo-500", num: "text-indigo-700" },
    ];
}
function ActionIconButton({ Icon, label, compactLabel, tone = "neutral", compact, onClick }) {
    const toneClasses = {
        neutral: "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600",
        primary: "bg-gradient-to-br from-blue-600 to-blue-500 text-white border border-blue-600/20 shadow-sm shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600 hover:shadow-md hover:shadow-blue-500/40",
        warning: "bg-gradient-to-br from-orange-500 to-amber-500 text-white border border-orange-500/20 shadow-sm shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600 hover:shadow-md hover:shadow-orange-500/40",
        danger: "bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300",
    };

    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center justify-center gap-1 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-90 active:translate-y-0 ${compact ? "px-1.5 py-1 text-[10px]" : "px-3 py-2 text-xs"
                } ${toneClasses[tone]}`}
        >
            <Icon className={compact ? "w-3 h-3" : "w-3.5 h-3.5"} />
            <span>{compact ? (compactLabel ?? label) : label}</span>
        </button>
    );
}

function ExamActionButtons({ exam, onAction, compact }) {
    if (!exam) return null;
    const stop = (e) => e?.stopPropagation?.();

    if (exam.resultDeclared) {
        return (
            <div className="inline-flex items-center cursor-pointer gap-1.5">
                <ActionIconButton Icon={Edit2} label="Edit Marks" compactLabel="Marks" tone="neutral" compact={compact}
                    onClick={(e) => { stop(e); onAction(exam.id, "marks"); }} />
                <ActionIconButton Icon={FileText} label="View Reports" compactLabel="Report" tone="primary" compact={compact}
                    onClick={(e) => { stop(e); onAction(exam.id, "reports"); }} />
            </div>
        );
    }
    return (
        <div className="inline-flex items-center gap-1.5">
            <ActionIconButton Icon={LogIn} label="Enter Marks" compactLabel="Enter" tone="neutral" compact={compact}
                onClick={(e) => { stop(e); onAction(exam.id, "enter_marks"); }} />
            <ActionIconButton Icon={CheckCircle} label="Declare Result" compactLabel="Declare" tone="warning" compact={compact}
                onClick={(e) => { stop(e); onAction(exam.id, "declare"); }} />
        </div>
    );
}

function SubjectActionButtons({ sub, onEdit, onDelete, compact }) {
    return (
        <div className="inline-flex items-cente gap-1.5">
            <ActionIconButton Icon={Edit2} label="Edit Subject" compactLabel="Edit" tone="neutral" compact={compact}
    onClick={() => onEdit(sub)} />
<ActionIconButton Icon={Trash2} label="Remove Subject" compactLabel="Remove" tone="danger" compact={compact}
    onClick={() => onDelete(sub)} />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// STAT CARD
// ══════════════════════════════════════════════════════════════════
function StatCard({ d }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 min-w-0 w-full">
            <div className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center ${d.bg}`}>
                <d.Icon className={`w-5 h-5 ${d.ic}`} />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-gray-500 truncate">{d.label}</p>
                <p className={`text-2xl font-extrabold leading-none mt-0.5 ${d.num}`}>{d.count}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{d.sub}</p>
            </div>
        </div>
    );
}
function StatSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 animate-pulse">
            <div className="shrink-0 w-11 h-11 rounded-xl bg-gray-100" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-6 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// EXAM CARD  (shown below xl)
// ══════════════════════════════════════════════════════════════════
function ExamCard({ exam, onAction, selected, onClick }) {
    const rb = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
    return (
        <div
            onClick={onClick}
            className={`p-4 cursor-pointer transition-colors border-b border-gray-100 last:border-0
                ${selected ? "bg-blue-50 border-l-[3px] border-l-blue-500" : "hover:bg-gray-50"}`}
        >
            {/* top row */}
            <div className="flex items-start gap-2 mb-2">
                <p className="flex-1 min-w-0 text-sm font-semibold text-gray-800 leading-snug break-words">{exam.name}</p>
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                    <ExamActionButtons exam={exam} onAction={onAction} />
                </div>
            </div>

            {/* badge row — wraps naturally */}
            <div className="flex flex-wrap gap-1.5 mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${examTypeBg(exam.examTypeName)}`}>{exam.examTypeName ?? "—"}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">{exam.schoolClassName ?? "—"}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">{exam.subjectConfigCount ?? 0} subj.</span>
                {exam.isActive && <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700">Active</span>}
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${rb}`}>
                    {exam.resultDeclared ? <CheckSquare className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {exam.resultDeclared ? "Declared" : "Pending"}
                </span>
            </div>

            <p className="text-xs text-gray-400">{fmtRange(exam.startDate, exam.endDate)}</p>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// SUBJECT CARD  (shown below xl)
// ══════════════════════════════════════════════════════════════════
function SubjectCard({ sub, onEdit, onDelete }) {
    return (
        <div className="p-4 border-b border-gray-100 last:border-0">
            <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5 w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-800">{sub.subjectName}</span>
                        {sub.subjectCode && <span className="text-xs font-mono text-gray-400">{sub.subjectCode}</span>}
                    </div>

                    {/* meta grid — 2-col on xs+ */}
                    <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                        <span className="text-xs text-gray-500">Section: <strong className="text-gray-700">{sub.sectionName ?? "—"}</strong></span>
                        <span className="text-xs text-gray-500">Max: <strong className="text-gray-700">{sub.maxMarks}</strong></span>
                        <span className="text-xs text-gray-500">Pass: <strong className="text-gray-700">{sub.passingMarks}</strong></span>
                        {sub.hasTheoryPractical && (
                            <span className="text-xs text-gray-500">Th/Pr: <strong className="text-gray-700">{sub.maxTheoryMarks}/{sub.maxPracticalMarks}</strong></span>
                        )}
                    </div>

                    <div className="mt-2">
                        {sub.hasTheoryPractical
                            ? <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">Theory + Practical</span>
                            : <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">Full marks</span>
                        }
                    </div>
                </div>

                {/* actions */}
                <div className="shrink-0" onClick={e => e.stopPropagation()}>
                    <SubjectActionButtons sub={sub} onEdit={onEdit} onDelete={onDelete} />
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MODALS
// ══════════════════════════════════════════════════════════════════
function DeleteSubjectModal({ name, onConfirm, onCancel, loading }) {
    useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-red-50 rounded-full"><AlertCircle className="w-5 h-5 text-red-500" /></div>
                    <h3 className="text-base font-semibold text-gray-800">Remove Subject</h3>
                </div>
                <p className="text-sm text-gray-600 mb-5">Remove <strong>{name}</strong> from this exam?</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-2">
                        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? "Removing…" : "Remove"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════════
function DeclareModal({ examName, onConfirm, onCancel, loading }) {
    useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-orange-50 rounded-full"><AlertCircle className="w-5 h-5 text-orange-500" /></div>
                    <h3 className="text-base font-semibold text-gray-800">Declare Result</h3>
                </div>
                <p className="text-sm text-gray-600 mb-1">Declaring result for:</p>
                <p className="text-sm font-semibold text-gray-800 mb-3">{examName}</p>
                <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-5">
                    This will <strong>permanently lock all marks</strong> and cannot be undone.
                </p>
                <div className="flex gap-3 justify-end">
                    <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                    <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-orange-500 rounded-lg hover:bg-orange-600 disabled:opacity-60 flex items-center gap-2">
                        {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                        {loading ? "Declaring…" : "Yes, Declare"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function ErrorToast({ message, onClose }) {
    useEffect(() => { const t = setTimeout(onClose, 4000); return () => clearTimeout(t); }, [onClose]);
    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto sm:max-w-sm z-50 bg-red-500 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="flex-1 min-w-0">{message}</span>
            <button onClick={onClose} className="ml-2 text-white/80 hover:text-white text-xl leading-none">×</button>
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// SELECT  (reusable)
// ══════════════════════════════════════════════════════════════════
function FilterSelect({ value, onChange, disabled, children }) {
    return (
        <div className="relative w-full">
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {children}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════
// MAIN MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════
export default function Exams() {
    const navigate = useNavigate();

    // meta
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [errorMeta, setErrorMeta] = useState(null);

    // filters
    const [classId, setClassId] = useState("");
    const [yearId, setYearId] = useState("");
    const [typeId, setTypeId] = useState("");

    // exams
    const [exams, setExams] = useState([]);
    const [loadingExams, setLoadingExams] = useState(false);
    const [errorExams, setErrorExams] = useState(null);

    // Frontend Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // selected exam
    const [selExam, setSelExam] = useState(null);
    const autoSelected = useRef(false);

    // subjects
    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [errorSubjects, setErrorSubjects] = useState(null);

    // modals / forms
    const [showNewExam, setShowNewExam] = useState(false);
    const [showAddSubject, setShowAddSubject] = useState(false);
    const [showUpdateSubjects, setShowUpdateSubjects] = useState(false);
    const [editSubject, setEditSubject] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deletingSubject, setDeletingSubject] = useState(false);
    const [deleteError, setDeleteError] = useState(null);
    const [declareTarget, setDeclareTarget] = useState(null);
    const [declaringExam, setDeclaringExam] = useState(false);
    const [declareError, setDeclareError] = useState(null);
    const { currentAcademicYear } = useDecodedUser();

    // ── meta ──────────────────────────────────────────────────────
    useEffect(() => {
        (async () => {
            setLoadingMeta(true);
            try {
                const [cls, types] = await Promise.all([
                    getActiveClasses(),
                    getExamTypes(),
                ]);

                // Fetch academic years
                const yearsResponse = await getAcademicYears();
                const yearsList = yearsResponse.years || [];

                if (currentAcademicYear?.id) {
                    setYearId(currentAcademicYear.id);
                }

                setClasses(Array.isArray(cls) ? cls : []);
                setAcademicYears(Array.isArray(yearsList) ? yearsList : []);
                setExamTypes(Array.isArray(types) ? types : []);

            } catch { setErrorMeta("Failed to load filters. Please refresh."); }
            finally { setLoadingMeta(false); }
        })();
    }, []);

    // ── exams ─────────────────────────────────────────────────────
    const fetchExams = useCallback(async () => {
        setLoadingExams(true); setErrorExams(null);
        try {
            const f = {};
            if (classId) f.classId = classId;
            if (yearId) f.academicYearId = yearId;
            if (typeId) f.examTypeId = typeId;

            const response = await getExams(f);
            const list = Array.isArray(response) ? response : [];
            setExams(list);
            setCurrentPage(1); // Reset pagination on data payload update

            if (list.length > 0 && !autoSelected.current) {
                setSelExam(list[0]); autoSelected.current = true;
            } else if (list.length === 0) {
                setSelExam(null); setSubjects([]);
            } else if (selExam) {
                const r = list.find(e => e.id === selExam.id);
                if (r) setSelExam(r);
            }
        } catch { setErrorExams("Failed to load exams."); setExams([]); }
        finally { setLoadingExams(false); }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [classId, yearId, typeId]);

    useEffect(() => { if (!loadingMeta) fetchExams(); }, [fetchExams, loadingMeta]);

    // ── subjects ──────────────────────────────────────────────────
    const fetchSubjects = useCallback(async () => {
        if (!selExam?.id) { setSubjects([]); return; }
        setLoadingSubjects(true); setErrorSubjects(null);
        try {
            const d = await getExamSubjects(selExam.id);
            setSubjects(Array.isArray(d) ? d : []);
        } catch { setErrorSubjects("Failed to load subjects."); setSubjects([]); }
        finally { setLoadingSubjects(false); }
    }, [selExam?.id]);

    useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

    // ── handlers ──────────────────────────────────────────────────
    const resetFilters = () => {
        setSelExam(null);
        setSubjects([]);
        setExams([]);
        autoSelected.current = false;
        setCurrentPage(1);
    };

    const handleAction = (examId, action) => {
        if (action === "declare") {
            const ex = exams.find(e => e.id === examId);
            if (ex && !ex.resultDeclared) setDeclareTarget({ id: ex.id, name: ex.name });
        } else if (action === "enter_marks" || action === "marks") {
            navigate(`/exams/marksEntry/${examId}`);
        } else if (action === "reports") {
            navigate(`/exams/reportCard/${examId}`);
        }
    };

    const handleDeclare = async () => {
        if (!declareTarget) return;
        setDeclaringExam(true); setDeclareError(null);
        try {
            const res = await declareExamResult(declareTarget.id);
            const upd = res?.data ?? res ?? {};
            setExams(p => p.map(e => e.id === declareTarget.id ? { ...e, resultDeclared: true, ...upd } : e));
            setSelExam(p => p?.id === declareTarget.id ? { ...p, resultDeclared: true, ...upd } : p);
            setDeclareTarget(null);
        } catch (err) {
            setDeclareError(err?.message || "Failed to declare result.");
        } finally { setDeclaringExam(false); }
    };

    const handleDeleteSubject = async () => {
        if (!deleteTarget || !selExam) return;
        setDeletingSubject(true);
        try {
            await deleteExamSubject(selExam.id, deleteTarget.configId);
            setDeleteTarget(null); fetchSubjects(); fetchExams();
        } catch (err) {
            setDeleteError(err?.message || "Failed to remove subject.");
            setDeleteTarget(null);
        } finally { setDeletingSubject(false); }
    };

    const handleSubjectSuccess = () => { setShowAddSubject(false); setEditSubject(null); fetchSubjects(); fetchExams(); };
    const handleNewExamSuccess = () => { setShowNewExam(false); autoSelected.current = false; fetchExams(); };

    const examClassId = selExam
        ? (selExam.schoolClassId || selExam.classId || selExam.class_id || classId || null)
        : classId || null;

    const stats = buildStats(exams);
    const selClassName = classes.find(c => String(c.id) === String(classId))?.name ?? "";
    const selYearLabel = academicYears.find(y => String(y.id) === String(yearId))?.label ?? "";

    // ── Client Side Pagination Slice Logic ──────────────────────
    const totalExams = exams.length;
    const indexOfLastExam = currentPage * rowsPerPage;
    const indexOfFirstExam = indexOfLastExam - rowsPerPage;
    const currentExams = exams.slice(indexOfFirstExam, indexOfLastExam);
    const totalPages = Math.ceil(totalExams / rowsPerPage);

    const showingStart = totalExams === 0 ? 0 : indexOfFirstExam + 1;
    const showingEnd = Math.min(indexOfLastExam, totalExams);

    // ══════════════════════════════════════════════════════════════
    return (
        <div className="min-h-screen bg-[#f3f6fb]">
            <div className="p-2 md:p-3 lg:p-4 xl:p-6 space-y-2 md:space-y-3 lg:space-y-4 max-w-[1600px] mx-auto">
                {/* ── PAGE HEADER ─────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        <TooltipComponent message="Efficiently manage exams." direction="right" color="nocolor">
                            Manage All Exams
                        </TooltipComponent>
                    </h1>
                </div>

                {/* ── ERROR BANNERS ────────────────────────────────── */}
                {errorMeta && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{errorMeta}</span>
                        <button onClick={() => window.location.reload()} className="text-xs font-medium underline shrink-0">Refresh</button>
                    </div>
                )}
                {declareError && !declareTarget && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{declareError}</span>
                        <button onClick={() => setDeclareError(null)} className="text-lg leading-none text-red-400 hover:text-red-600">×</button>
                    </div>
                )}

                {/* ── STAT CARDS ──────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
                    {(loadingExams || loadingMeta)
                        ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
                        : stats.map(s => <StatCard key={s.label} d={s} />)
                    }
                </div>

                {/* ── FILTERS + NEW EXAM ──────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-[1fr_1fr_1fr_auto] gap-1.5 md:gap-2 lg:gap-3">
                        <FilterSelect value={classId} onChange={e => { setClassId(e.target.value); resetFilters(); }} disabled={loadingMeta || !!errorMeta}>
                            <option value="">All Classes</option>
                            {loadingMeta ? <option disabled>Loading…</option> : classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </FilterSelect>

                        <FilterSelect
                            value={yearId}
                            onChange={e => { setYearId(e.target.value); resetFilters(); }}
                            disabled={loadingMeta}
                        >
                            <option value="">All Years</option>
                            {academicYears.map(y => {
                                const isCurrent = currentAcademicYear?.id === y.id;
                                return (
                                    <option key={y.id} value={y.id}>
                                        {isCurrent ? "🟢 " : ""}{y.label ?? y.name ?? y.value}
                                        {isCurrent ? " (Current Year)" : ""}
                                    </option>
                                );
                            })}
                        </FilterSelect>

                        <FilterSelect value={typeId} onChange={e => { setTypeId(e.target.value); setCurrentPage(1); }} disabled={loadingExams}>
                            <option value="">All Types</option>
                            {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </FilterSelect>

                        <button
                            onClick={() => setShowNewExam(true)}
                            disabled={loadingMeta}
                            className="flex items-center justify-center gap-2 w-full lg:w-auto px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Exam</span><span className="sm:hidden">New</span>
                        </button>
                    </div>
                </div>

                {/* ── EXAM SCHEDULE ────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* header */}
                    <div className="flex items-center justify-between gap-3 px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 border-b border-gray-100 flex-wrap">
                        <h2 className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 min-w-0 flex-1">
                            Exam Schedule
                            {(selClassName || selYearLabel) && (
                                <span className="text-blue-600 font-medium hidden sm:inline"> — {selClassName || "All Classes"}{selYearLabel ? ` (${selYearLabel})` : ""}</span>
                            )}
                        </h2>
                        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-1.5 md:px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap">
                            {loadingExams ? "…" : `${exams.length}`}
                        </span>
                    </div>

                    {errorExams && (
                        <div className="px-2 md:px-3 lg:px-4 xl:px-6 py-1.5 md:py-2 lg:py-3 text-xs md:text-sm text-red-600 bg-red-50 flex items-center gap-2 flex-wrap">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="flex-1 min-w-0">{errorExams}</span>
                            <button onClick={fetchExams} className="text-blue-600 text-xs font-medium underline shrink-0">Retry</button>
                        </div>
                    )}

                    {/* MOBILE / TABLET / LAPTOP  (< xl) — card list */}
                    <div className="xl:hidden">
                        {loadingExams
                            ? Array(3).fill(0).map((_, i) => (
                                <div key={i} className="p-4 border-b border-gray-100 last:border-0 space-y-2 animate-pulse">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="flex gap-2"><div className="h-5 bg-gray-100 rounded-full w-20" /><div className="h-5 bg-gray-100 rounded-full w-16" /></div>
                                    <div className="h-3 bg-gray-100 rounded w-1/3" />
                                </div>
                            ))
                            : currentExams.length === 0
                                ? <p className="text-sm text-gray-400 text-center py-12">No exams found.</p>
                                : currentExams.map(exam => (
                                    <ExamCard
                                        key={exam.id} exam={exam}
                                        onAction={handleAction}
                                        selected={selExam?.id === exam.id}
                                        onClick={() => { setSelExam(exam); setSubjects([]); }}
                                    />
                                ))
                        }
                    </div>

                    {/* DESKTOP (xl+) — table */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-xs md:text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">#</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Exam Name</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Type</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Class</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Dates</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Subjects</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Status</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Result</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingExams
                                    ? <ListLoader rows={3} avatar={false} colSpanSet={9} />
                                    : currentExams.length === 0
                                        ? <tr><td colSpan={9} className="text-center text-sm text-gray-400 py-12">No exams found.</td></tr>
                                        : currentExams.map((exam, idx) => {
                                            const isSelected = selExam?.id === exam.id;
                                            const rb = exam.resultDeclared ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700";
                                            return (
                                                <tr key={exam.id} onClick={() => { setSelExam(exam); setSubjects([]); }}
                                                    className={`border-b border-gray-50 hover:bg-blue-50/30 cursor-pointer transition-colors
                                                        ${isSelected ? "bg-blue-50/40 border-l-[2px] border-l-blue-500" : ""}`}>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-xs text-gray-400 font-medium">{indexOfFirstExam + idx + 1}</td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 font-semibold text-gray-800 max-w-[75px] md:max-w-[110px] truncate text-xs">{exam.name}</td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 whitespace-nowrap">
                                                        <span className={`px-1 py-0.5 rounded text-xs font-semibold ${examTypeBg(exam.examTypeName)}`}>{exam.examTypeName ?? "—"}</span>
                                                    </td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-gray-600 whitespace-nowrap max-w-[60px] md:max-w-[80px] truncate text-xs">{exam.schoolClassName ?? "—"}</td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-gray-600 whitespace-nowrap text-xs max-w-[90px] truncate">{fmtRange(exam.startDate, exam.endDate) ?? "—"}</td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 whitespace-nowrap text-xs font-semibold text-blue-700 text-center">{exam.subjectConfigCount ?? 0}</td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 whitespace-nowrap">
                                                        <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${exam.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                                                            {exam.isActive ? "Active" : "Inactive"}
                                                        </span>
                                                    </td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-semibold ${rb}`}>
                                                            {exam.resultDeclared ? "Declared" : "Pending"}
                                                        </span>
                                                    </td>
                                                    <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-center" onClick={e => e.stopPropagation()}>
                                                        <ExamActionButtons exam={exam} onAction={handleAction} compact />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                }
                            </tbody>
                        </table>
                    </div>

                    {/* ── PAGINATION FOOTER ────────────────────────────────── */}
                    {!loadingExams && totalExams > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-gray-200 bg-white text-xs sm:text-sm text-gray-600 select-none">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-6 gap-y-2 text-center sm:text-left">
                                <div>
                                    Showing <span className="font-medium">{showingStart}</span> to{" "}
                                    <span className="font-medium">{showingEnd}</span> of{" "}
                                    <span className="font-medium">{totalExams}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span>Rows per page:</span>
                                    <div className="relative">
                                        <select
                                            value={rowsPerPage}
                                            onChange={(e) => {
                                                setRowsPerPage(Number(e.target.value));
                                                setCurrentPage(1);
                                            }}
                                            className="appearance-none bg-white border border-gray-200 rounded-lg pl-2.5 pr-7 py-1 text-xs sm:text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer font-medium"
                                        >
                                            {[5, 10, 20, 50].map((size) => (
                                                <option key={size} value={size}>
                                                    {size}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-center gap-1">
                                <button
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${currentPage === page
                                            ? "bg-blue-600 text-white shadow-sm"
                                            : "text-gray-600 hover:bg-gray-100"
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── SUBJECT CONFIGURATION ────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    {/* header */}
                    <div className="px-2 md:px-3 lg:px-4 xl:px-6 py-2 md:py-3 lg:py-4 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1.5 md:gap-2 lg:gap-3">
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xs md:text-sm lg:text-base font-semibold text-gray-800 truncate">
                                    Subject Config
                                    {selExam && <span className="text-blue-600 font-medium hidden sm:inline"> — {selExam.name}</span>}
                                </h2>
                                {!selExam && <p className="text-xs text-gray-400 mt-0.5">Select exam to configure subjects.</p>}
                            </div>

                            <div className="grid grid-cols-2 md:flex gap-1 md:gap-1.5 lg:gap-2 shrink-0">
                                <button
                                    onClick={() => { setEditSubject(null); setShowAddSubject(true); }}
                                    disabled={!selExam || loadingExams}
                                    className="flex items-center justify-center gap-0.5 md:gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    <Plus className="w-3 md:w-3.5 lg:w-4 h-3 md:h-3.5 lg:h-4 shrink-0" />
                                    <span className="hidden md:inline">Add Subject</span><span className="md:hidden text-xs">Add</span>
                                </button>
                                <button
                                    onClick={() => setShowUpdateSubjects(true)}
                                    disabled={!selExam || loadingExams || subjects.length === 0}
                                    className="flex items-center justify-center gap-0.5 md:gap-1 lg:gap-1.5 px-1.5 md:px-2 lg:px-3 py-1 md:py-1.5 lg:py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap"
                                >
                                    <RefreshCw className="w-3 md:w-3.5 lg:w-4 h-3 md:h-3.5 lg:h-4 shrink-0" />
                                    <span className="hidden md:inline">Update</span><span className="md:hidden text-xs">Upd</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {errorSubjects && (
                        <div className="px-2 md:px-3 lg:px-4 xl:px-6 py-1.5 md:py-2 lg:py-3 text-xs md:text-sm text-red-600 bg-red-50 flex items-center gap-2 flex-wrap">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span className="flex-1 min-w-0">{errorSubjects}</span>
                            <button onClick={fetchSubjects} className="text-blue-600 text-xs font-medium underline shrink-0">Retry</button>
                        </div>
                    )}

                    {/* MOBILE / TABLET / LAPTOP (< xl) — subject cards */}
                    <div className="xl:hidden">
                        {loadingSubjects
                            ? Array(3).fill(0).map((_, i) => (
                                <div key={i} className="p-4 border-b border-gray-100 flex gap-3 animate-pulse">
                                    <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                                        <div className="h-3 bg-gray-100 rounded w-1/3" />
                                    </div>
                                </div>
                            ))
                            : subjects.length === 0
                                ? <p className="text-sm text-gray-400 text-center py-12">
                                    {selExam ? "No subjects configured for this exam." : "Select an exam to view subjects."}
                                </p>
                                : subjects.map(sub => (
                                    <SubjectCard
                                        key={sub.id} sub={sub}
                                        onEdit={s => { setEditSubject(s); setShowAddSubject(true); }}
                                        onDelete={s => setDeleteTarget({ configId: s.id, subjectName: s.subjectName })}
                                    />
                                ))
                        }
                    </div>

                    {/* DESKTOP (xl+) — subject table */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full text-xs md:text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Subject</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Code</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Section</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Max</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Pass</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-left text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Type</th>
                                    <th className="px-1.5 md:px-2 py-1.5 md:py-2 text-center text-xs font-semibold text-gray-500 uppercase whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingSubjects
                                    ? <ListLoader rows={4} avatar={true} colSpanSet={7} />
                                    : subjects.length === 0
                                        ? <tr><td colSpan={7} className="text-center text-sm text-gray-400 py-12">
                                            {selExam ? "No subjects configured for this exam." : "Select an exam row above to view subjects."}
                                        </td></tr>
                                        : subjects.map(sub => (
                                            <tr key={sub.id} className="border-b border-gray-50 hover:bg-blue-50/20 transition-colors">
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2">
                                                    <div className="flex items-center gap-0.5 font-medium text-gray-800 whitespace-nowrap max-w-[80px] md:max-w-[110px] truncate">
                                                        <BookOpen className="w-2.5 md:w-3 h-2.5 md:h-3 text-blue-400 shrink-0" /><span className="truncate text-xs">{sub.subjectName}</span>
                                                    </div>
                                                </td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-gray-500 font-mono text-xs whitespace-nowrap">{sub.subjectCode ?? "—"}</td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-gray-600 whitespace-nowrap max-w-[60px] md:max-w-[80px] truncate text-xs">{sub.sectionName ?? "—"}</td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 font-bold text-gray-800 whitespace-nowrap text-xs text-center">{sub.maxMarks}</td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-gray-600 whitespace-nowrap text-xs text-center">{sub.passingMarks}</td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 whitespace-nowrap text-xs">
                                                    {sub.hasTheoryPractical
                                                        ? <span className="px-1 py-0.5 rounded bg-blue-50 text-blue-700 font-semibold">T:{sub.maxTheoryMarks} P:{sub.maxPracticalMarks}</span>
                                                        : <span className="px-1 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">Full</span>
                                                    }
                                                </td>
                                                <td className="px-1.5 md:px-2 py-1.5 md:py-2 text-center">
                                                    <SubjectActionButtons
                                                        sub={sub}
                                                        onEdit={s => { setEditSubject(s); setShowAddSubject(true); }}
                                                        onDelete={s => setDeleteTarget({ configId: s.id, subjectName: s.subjectName })}
                                                        compact
                                                    />
                                                </td>
                                            </tr>
                                        ))
                                }
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>

            {/* ── MODALS ──────────────────────────────────────────── */}
            {showNewExam && (
                <NewExamForm onClose={() => setShowNewExam(false)} onSuccess={handleNewExamSuccess} defaultClassId={classId || null} />
            )}

            {showAddSubject && selExam && examClassId && (
                <AddSubjectForm
                    onClose={() => { setShowAddSubject(false); setEditSubject(null); }}
                    onSuccess={handleSubjectSuccess}
                    examId={selExam.id} examName={selExam.name}
                    classId={examClassId} editData={editSubject}
                    alreadyAddedSubjects={subjects}
                />
            )}

            {showUpdateSubjects && selExam && (
                <UpdateSubjectForm
                    examId={selExam.id} examName={selExam.name} subjects={subjects}
                    onClose={() => setShowUpdateSubjects(false)}
                    onSuccess={() => { setShowUpdateSubjects(false); fetchSubjects(); fetchExams(); }}
                />
            )}

            {deleteTarget && (
                <DeleteSubjectModal
                    name={deleteTarget.subjectName}
                    onConfirm={handleDeleteSubject}
                    onCancel={() => setDeleteTarget(null)}
                    loading={deletingSubject}
                />
            )}

            {declareTarget && (
                <DeclareModal
                    examName={declareTarget.name}
                    onConfirm={handleDeclare}
                    onCancel={() => { setDeclareTarget(null); setDeclareError(null); }}
                    loading={declaringExam}
                />
            )}

            {deleteError && <ErrorToast message={deleteError} onClose={() => setDeleteError(null)} />}
        </div>
    );
}