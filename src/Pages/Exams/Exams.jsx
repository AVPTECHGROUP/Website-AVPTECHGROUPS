import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
    ClipboardList, CheckSquare, Clock, School,
    Plus, BookOpen, ChevronDown, ChevronRight, Edit2, FileText,
    LogIn, CheckCircle, Trash2, AlertCircle, RefreshCw, Copy,
    Download, X, Loader2
} from "lucide-react";

import ListLoader from "../../Components/CommonComp/ListLoader";
import TooltipComponent from "../../Components/CommonComp/Tooltip_comp/TooltipComp";
import CreateExamEventWizard from "./NewExamForm";

import {
    getExamEvents,
    updateExamEvent,
    copyExamEvent,
    addClassesToExamEvent,
    removeClassFromExamEvent,
    getEventClassSubjects,
    addEventSubject,
    updateEventSubject,
    deleteEventSubject,
    declareEventExamResult,
    getExamTypes
} from "../../Api/Exams";
import { getActiveClasses } from "../../Api/TeachersAPI";
import { getAcademicYears, getCurrentAcademicYear } from "../../Api/AcademicYear";
import { useDecodedUser } from "../../ContextAPI/UserContext";
import { useAuth } from "../../hooks/useAuth";
import { PERMISSIONS as P } from "../../Constants/Permission";

// ─── helpers ──────────────────────────────────────────────────────────────
function fmtRange(s, e) {
    if (!s || !e) return "—";
    const f = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
    return `${f(s)} – ${f(e)}`;
}

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

// Status of a whole event, derived from its class-exams.
function eventStatus(ev) {
    const exams = ev.exams || [];
    const total = exams.length;
    const declared = exams.filter(e => e.resultDeclared).length;
    if (total === 0) return "scheduled";
    if (declared === total) return "declared";
    if (declared > 0) return "partial";
    const today = new Date().toISOString().slice(0, 10);
    if (ev.startDate && ev.startDate > today) return "scheduled";
    return "partial";
}

const EVENT_STATUS_META = {
    declared: { label: "Declared", badge: "bg-green-100 text-green-700", bar: "bg-green-500" },
    partial: { label: "Partial", badge: "bg-amber-100 text-amber-700", bar: "bg-amber-400" },
    scheduled: { label: "Scheduled", badge: "bg-blue-100 text-blue-700", bar: "bg-blue-300" },
};

// Per-class-exam row status.
function rowStatus(exam) {
    if (exam.resultDeclared) return "declared";
    if (typeof exam.marksEnteredPercent === "number") {
        if (exam.marksEnteredPercent <= 0) return "not_started";
        if (exam.marksEnteredPercent < 100) return "partial";
        return "ready";
    }
    if (!exam.subjectConfigCount) return "not_started";
    return "ready";
}

const ROW_META = {
    declared: { rowBg: "", chip: "bg-green-100 text-green-700", label: "Declared" },
    ready: { rowBg: "bg-green-50/60", chip: "bg-green-100 text-green-700", label: "Ready" },
    partial: { rowBg: "bg-amber-50/70", chip: "bg-amber-100 text-amber-700", label: "Pending" },
    not_started: { rowBg: "bg-orange-50/60", chip: "bg-orange-100 text-orange-700", label: "Not started" },
};

function buildStats(events) {
    const allExams = events.flatMap(e => e.exams || []);
    const totalEvents = events.length;
    const fullyDeclared = events.filter(e => eventStatus(e) === "declared").length;
    const pendingEvents = totalEvents - fullyDeclared;
    const classes = new Set(allExams.map(e => e.schoolClassName).filter(Boolean));

    return [
        { label: "Total Events", count: totalEvents, sub: "Scheduled", Icon: ClipboardList, bg: "bg-blue-50", ic: "text-blue-500", num: "text-blue-700" },
        { label: "Fully Declared", count: fullyDeclared, sub: "All results in", Icon: CheckSquare, bg: "bg-green-50", ic: "text-green-500", num: "text-green-700" },
        { label: "Pending", count: pendingEvents, sub: pendingEvents ? "Awaiting" : "All clear", Icon: Clock, bg: "bg-amber-50", ic: "text-amber-500", num: "text-amber-600" },
        { label: "Classes Covered", count: classes.size, sub: classes.size ? [...classes].join(", ") : "None yet", Icon: School, bg: "bg-indigo-50", ic: "text-indigo-500", num: "text-indigo-700" },
    ];
}

// ─── small UI atoms ────────────────────────────────────────────────────────
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

function FilterSelect({ value, onChange, disabled, children }) {
    return (
        <div className="relative w-full min-w-0">
            <select
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="appearance-none w-full bg-white border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed truncate"
            >
                {children}
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>
    );
}

// Custom Action Button Atom
function ActionBtn({ Icon, label, compactLabel, tone = "neutral", compact, onClick, disabled }) {
    const toneClasses = {
        neutral: "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600",
        primary: "bg-gradient-to-br from-blue-600 to-blue-500 text-white border border-blue-600/20 shadow-sm shadow-blue-500/30 hover:from-blue-700 hover:to-blue-600",
        warning: "bg-gradient-to-br from-orange-500 to-amber-500 text-white border border-orange-500/20 shadow-sm shadow-orange-500/30 hover:from-orange-600 hover:to-amber-600",
        success: "bg-gradient-to-br from-green-600 to-emerald-500 text-white border border-green-600/20 shadow-sm shadow-green-500/30 hover:from-green-700 hover:to-emerald-600",
        danger: "bg-white text-red-500 border border-red-200 hover:bg-red-50 hover:border-red-300",
    };
    return (
        <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClick?.(e); }}
            disabled={disabled}
            className={`flex items-center justify-center gap-1 rounded-lg font-semibold whitespace-nowrap transition-all duration-200 hover:-translate-y-0.5 active:scale-90 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none shrink-0 ${compact ? "px-1.5 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs"} ${toneClasses[tone]}`}
        >
            <Icon className={compact ? "w-3 h-3 shrink-0" : "w-3.5 h-3.5 shrink-0"} />
            <span>{compact ? (compactLabel ?? label) : label}</span>
        </button>
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

const ROW_GRID_COLS = "xl:grid-cols-[200px_minmax(160px,1fr)_120px_minmax(260px,1fr)]";

function ClassRow({ event, exam, sections, onAction, onRemove }) {
    const status = rowStatus(exam);
    const meta = ROW_META[status];
    const { hasPermission } = useAuth();

    return (
        <div className={`px-3 sm:px-4 py-3.5 border-b border-gray-100 last:border-0 ${meta.rowBg}`}>
            <div className={`flex flex-col gap-3 xl:grid ${ROW_GRID_COLS} xl:gap-3 xl:items-center`}>

                {/* COLUMN 1: CLASS INFO */}
                <div className="min-w-0 flex items-center justify-between xl:block">
                    <div>
                        <p className="text-sm font-bold text-gray-800">{exam.schoolClassName}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase ${exam.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-gray-100 text-gray-500"}`}>
                            {exam.isActive ? "Active" : "Inactive"}
                        </span>
                    </div>
                    <span className={`xl:hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase shrink-0 ${meta.chip}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {meta.label}
                    </span>
                </div>

                {/* COLUMN 2: SECTIONS */}
                <div className="min-w-0 flex flex-wrap items-center gap-1.5">
                    {sections === undefined ? (
                        <span className="text-xs text-gray-400 animate-pulse">Loading sections…</span>
                    ) : sections.length === 0 ? (
                        <span className="text-sm text-gray-400 font-medium">No sections configured</span>
                    ) : (
                        sections.map(s => (
                            <span key={s.sectionId} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                                {s.sectionName} {exam.resultDeclared ? "✓" : ""}
                            </span>
                        ))
                    )}
                </div>

                {/* COLUMN 3: STATUS CHIP */}
                <div className="hidden xl:flex items-center min-w-0">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase ${meta.chip}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current" />
                        {meta.label}
                    </span>
                </div>

                {/* COLUMN 4: ACTION BUTTONS */}
                <div className="flex flex-wrap items-center gap-2 min-w-0 xl:justify-end">
                    {status === "declared" && (
                        <>
                            <ActionBtn Icon={FileText} label="Reports" tone="primary" onClick={() => onAction(exam, "reports")} />
                            {hasPermission(P.EXAM_EDIT) && (
                              <ActionBtn Icon={BookOpen} label="Subjects" tone="neutral" onClick={() => onAction(exam, "subjects")} />
                            )}
                        </>
                    )}
                    {status === "ready" && (
                        <>
                            {hasPermission(P.EXAM_MARKS_ENTER) && (
                              <ActionBtn Icon={LogIn} label="Marks" tone="neutral" onClick={() => onAction(exam, "enter_marks")} />
                            )}
                            {hasPermission(P.EXAM_APPROVE) && (
                              <ActionBtn Icon={CheckCircle} label="Declare" tone="success" onClick={() => onAction(exam, "declare")} />
                            )}
                            {hasPermission(P.EXAM_EDIT) && (
                              <ActionBtn Icon={BookOpen} label="Subjects" tone="neutral" onClick={() => onAction(exam, "subjects")} />
                            )}
                        </>
                    )}
                    {status === "partial" && (
                        <>
                            {hasPermission(P.EXAM_MARKS_ENTER) && (
                              <ActionBtn Icon={LogIn} label="Enter Marks" tone="primary" onClick={() => onAction(exam, "enter_marks")} />
                            )}
                            {hasPermission(P.EXAM_EDIT) && (
                              <ActionBtn Icon={BookOpen} label="Subjects" tone="neutral" onClick={() => onAction(exam, "subjects")} />
                            )}
                        </>
                    )}
                    {status === "not_started" && (
                        <>
                            {hasPermission(P.EXAM_MARKS_ENTER) && (
                              <ActionBtn Icon={LogIn} label="Enter Marks" tone="warning" onClick={() => onAction(exam, "enter_marks")} />
                            )}
                            {hasPermission(P.EXAM_EDIT) && (
                              <ActionBtn Icon={BookOpen} label="Subjects" tone="neutral" onClick={() => onAction(exam, "subjects")} />
                            )}
                        </>
                    )}

                    {hasPermission(P.EXAM_DELETE) && (
                      <ActionBtn
                          Icon={Trash2}
                          label="Remove"
                          tone="danger"
                          disabled={exam.resultDeclared}
                          onClick={() => onRemove(exam)}
                      />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── EventItem Accordion Component ───────────────────────────────────────────
function EventItem({ event, expanded, onToggle, sectionsCache, onLoadSections, onAction, onRemoveClass, onAddClass, onEdit, onCopy }) {
    const exams = event.exams || [];
    const total = exams.length;
    const declared = exams.filter(e => e.resultDeclared).length;
    const status = eventStatus(event);
    const meta = EVENT_STATUS_META[status];
    const pct = total ? Math.round((declared / total) * 100) : 0;
    const { hasPermission } = useAuth();

    useEffect(() => {
        if (expanded) onLoadSections(event);
    }, [expanded, event, onLoadSections]);

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div onClick={onToggle} className="cursor-pointer px-3 md:px-4 py-3 flex flex-col lg:flex-row lg:items-center gap-2 lg:gap-4 min-w-0">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                    {expanded ? <ChevronDown className="w-4 h-4 text-gray-400 mt-1 shrink-0" /> : <ChevronRight className="w-4 h-4 text-gray-400 mt-1 shrink-0" />}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm md:text-base font-semibold text-gray-800 truncate">{event.name}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${examTypeBg(event.examTypeName)}`}>{event.examTypeName}</span>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5 truncate">
                            {fmtRange(event.startDate, event.endDate)} · {total} class{total !== 1 ? "es" : ""} · {declared === total && total > 0 ? "All results declared" : `${declared} of ${total} declared`}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-4 shrink-0 flex-wrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${meta.badge}`}>{meta.label}</span>
                    <div className="hidden sm:flex items-center gap-2 w-36 shrink-0">
                        <span className="text-[11px] text-gray-400 whitespace-nowrap">Results: {pct}%</span>
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${meta.bar}`} style={{ width: `${pct}%` }} />
                        </div>
                    </div>
                    {hasPermission(P.EXAM_EDIT) && (
                      <ActionBtn Icon={Edit2} label="Edit" tone="neutral" compact onClick={() => onEdit(event)} />
                    )}
                    {hasPermission(P.EXAM_CREATE) && (
                      <ActionBtn Icon={Copy} label="Copy" tone="neutral" compact onClick={() => onCopy(event)} />
                    )}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-gray-100">
                    <div className={`hidden xl:grid ${ROW_GRID_COLS} xl:gap-3 px-4 py-3 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200/60`}>
                        <span>Class</span>
                        <span>Sections (marks)</span>
                        <span>Status</span>
                        <span className="text-right">Actions</span>
                    </div>
                    {exams.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-8">No classes in this event yet.</p>
                    ) : exams.map(exam => (
                        <ClassRow
                            key={exam.id}
                            event={event}
                            exam={exam}
                            sections={sectionsCache[`${event.eventId}-${exam.schoolClassId}`]}
                            onAction={onAction}
                            onRemove={onRemoveClass}
                        />
                    ))}
                    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-t border-gray-100 gap-2">
                        <span className="text-xs font-medium text-gray-400">{total} class{total !== 1 ? "es" : ""} in this event</span>
                        {hasPermission(P.EXAM_EDIT) && (
                          <ActionBtn Icon={Plus} label="Add Class to Event" tone="neutral" onClick={() => onAddClass(event)} />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Modals Components ────────────────────────────────────────────────────────
function ModalShell({ title, icon: Icon, onClose, children, maxW = "max-w-md" }) {
    useEffect(() => { document.body.style.overflow = "hidden"; return () => { document.body.style.overflow = ""; }; }, []);
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className={`bg-white rounded-2xl shadow-2xl w-full ${maxW} max-h-[90vh] overflow-y-auto`}>
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                        {Icon && <Icon className="w-5 h-5 text-blue-600 shrink-0" />}
                        <h3 className="text-base font-semibold text-gray-800 truncate">{title}</h3>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 shrink-0">
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-5">{children}</div>
            </div>
        </div>
    );
}

function DeclareModal({ examName, onConfirm, onCancel, loading }) {
    return (
        <ModalShell title="Declare Result" icon={AlertCircle} onClose={onCancel}>
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
        </ModalShell>
    );
}

function RemoveClassModal({ exam, onConfirm, onCancel, loading }) {
    return (
        <ModalShell title="Remove Class" icon={AlertCircle} onClose={onCancel}>
            <p className="text-sm text-gray-600 mb-5">Remove <strong>{exam.schoolClassName}</strong> from this exam event? This deletes its subject configs too.</p>
            <div className="flex gap-3 justify-end">
                <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                <button onClick={onConfirm} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-60 flex items-center gap-2">
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Removing…" : "Remove"}
                </button>
            </div>
        </ModalShell>
    );
}

function EditEventModal({ event, onSave, onCancel, loading }) {
    const [form, setForm] = useState({
        name: event.name || "",
        startDate: event.startDate || "",
        endDate: event.endDate || "",
        description: event.description || "",
    });
    return (
        <ModalShell title="Edit Exam Event" icon={Edit2} onClose={onCancel}>
            <div className="space-y-3">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Event Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
                <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                <button onClick={() => onSave(form)} disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Saving…" : "Save Changes"}
                </button>
            </div>
        </ModalShell>
    );
}

function CopyEventModal({ event, examTypes, academicYears, onSave, onCancel, loading }) {
    const [form, setForm] = useState({
        examTypeId: event.examTypeId,
        academicYearId: event.academicYearId,
        name: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    return (
        <ModalShell title="Copy Exam Event" icon={Copy} onClose={onCancel}>
            <p className="text-xs text-gray-500 mb-4">Copies classes & subject configs from <strong>{event.name}</strong>.</p>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Exam Type</label>
                        <select value={form.examTypeId} onChange={e => setForm(f => ({ ...f, examTypeId: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Academic Year</label>
                        <select value={form.academicYearId} onChange={e => setForm(f => ({ ...f, academicYearId: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                            {academicYears.map(y => <option key={y.id} value={y.id}>{y.label ?? y.name}</option>)}
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Event Name</label>
                    <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Auto-generated if blank"
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                        <input type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                        <input type="date" value={form.endDate} min={form.startDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                </div>
            </div>
            <div className="flex gap-3 justify-end mt-5">
                <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                <button onClick={() => onSave(form)} disabled={loading || !form.startDate || !form.endDate} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Copying…" : "Create Copy"}
                </button>
            </div>
        </ModalShell>
    );
}

function AddClassModal({ event, allClasses, onSave, onCancel, loading }) {
    const existingIds = new Set((event.exams || []).map(e => e.schoolClassId));
    const available = allClasses.filter(c => !existingIds.has(Number(c.id)));
    const [picked, setPicked] = useState([]);

    const toggle = (id) => setPicked(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

    return (
        <ModalShell title="Add Class to Event" icon={Plus} onClose={onCancel}>
            {available.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">All classes are already part of this event.</p>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {available.map(c => {
                        const id = Number(c.id);
                        const sel = picked.includes(id);
                        return (
                            <button key={id} type="button" onClick={() => toggle(id)}
                                className={`px-3 py-2 rounded-lg border text-sm font-medium transition-all truncate ${sel ? "border-indigo-400 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200" : "border-gray-200 text-gray-700 hover:border-gray-300"}`}>
                                {c.name}
                            </button>
                        );
                    })}
                </div>
            )}
            <div className="flex gap-3 justify-end mt-5">
                <button onClick={onCancel} disabled={loading} className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60">Cancel</button>
                <button onClick={() => onSave(picked)} disabled={loading || picked.length === 0} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2">
                    {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Adding…" : `Add ${picked.length || ""} Class${picked.length === 1 ? "" : "es"}`}
                </button>
            </div>
        </ModalShell>
    );
}

function SubjectsModal({ event, exam, onClose, onChanged }) {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const d = await getEventClassSubjects(event.eventId, exam.schoolClassId);
            setSubjects(Array.isArray(d) ? d : []);
        } catch {
            setError("Failed to load subjects.");
        } finally { setLoading(false); }
    }, [event.eventId, exam.schoolClassId]);

    useEffect(() => { load(); }, [load]);

    const handleDelete = async (configId) => {
        setBusyId(configId);
        try {
            await deleteEventSubject(event.eventId, exam.schoolClassId, configId);
            await load();
            onChanged?.();
        } catch {
            setError("Failed to remove subject.");
        } finally { setBusyId(null); }
    };

    return (
        <ModalShell title={`Subjects — ${exam.schoolClassName}`} icon={BookOpen} onClose={onClose} maxW="max-w-lg">
            {error && <div className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</div>}
            {loading ? (
                <div className="py-8 flex justify-center"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /></div>
            ) : subjects.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No subjects configured for this class.</p>
            ) : (
                <div className="space-y-2">
                    {subjects.map(s => (
                        <div key={s.id} className="flex items-center justify-between gap-2 px-3 py-2 border border-gray-100 rounded-lg">
                            <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{s.subjectName} <span className="text-xs text-gray-400">({s.sectionName})</span></p>
                                <p className="text-xs text-gray-500">Max {s.maxMarks} · Pass {s.passingMarks}{s.hasTheoryPractical ? ` · T:${s.maxTheoryMarks} P:${s.maxPracticalMarks}` : ""}</p>
                            </div>
                            <button onClick={() => handleDelete(s.id)} disabled={busyId === s.id}
                                className="shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                                {busyId === s.id ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </ModalShell>
    );
}

// ─── Main ExamEvents Component ───────────────────────────────────────────────
export default function ExamEvents() {
    const navigate = useNavigate();
    const { currentAcademicYear } = useDecodedUser();
    const { hasPermission } = useAuth();

    // meta states
    const [classes, setClasses] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [examTypes, setExamTypes] = useState([]);
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [errorMeta, setErrorMeta] = useState(null);

    // filter states
    const [classId, setClassId] = useState("");
    const [yearId, setYearId] = useState("");
    const [typeId, setTypeId] = useState("");
    const [status, setStatus] = useState("");

    // events records states
    const [events, setEvents] = useState([]);
    const [loadingEvents, setLoadingEvents] = useState(false);
    const [errorEvents, setErrorEvents] = useState(null);
    const [expandedIds, setExpandedIds] = useState(() => new Set());
    const [sectionsCache, setSectionsCache] = useState({});

    // modals control states
    const [showWizard, setShowWizard] = useState(false);
    const [editTarget, setEditTarget] = useState(null);
    const [editSaving, setEditSaving] = useState(false);
    const [copyTarget, setCopyTarget] = useState(null);
    const [copySaving, setCopySaving] = useState(false);
    const [addClassTarget, setAddClassTarget] = useState(null);
    const [addClassSaving, setAddClassSaving] = useState(false);
    const [removeClassTarget, setRemoveClassTarget] = useState(null);
    const [removeClassSaving, setRemoveClassSaving] = useState(false);
    const [declareTarget, setDeclareTarget] = useState(null);
    const [declaringExam, setDeclaringExam] = useState(false);
    const [subjectsTarget, setSubjectsTarget] = useState(null);
    const [toastError, setToastError] = useState(null);

    // Load filters meta data on mount
    useEffect(() => {
        (async () => {
            setLoadingMeta(true);
            try {
                const [cls, types] = await Promise.all([getActiveClasses(), getExamTypes()]);
                const yearsResponse = await getAcademicYears();
                const yearsList = yearsResponse.years || [];

                if (currentAcademicYear?.id) setYearId(currentAcademicYear.id);

                setClasses(Array.isArray(cls) ? cls : []);
                setAcademicYears(Array.isArray(yearsList) ? yearsList : []);
                setExamTypes(Array.isArray(types) ? types : []);
            } catch { setErrorMeta("Failed to load filters. Please refresh."); }
            finally { setLoadingMeta(false); }
        })();
    }, [currentAcademicYear]);

    // Fetch Events list data matching filters
    const fetchEvents = useCallback(async () => {
        setLoadingEvents(true); setErrorEvents(null);
        try {
            const f = {};
            if (yearId) f.academicYearId = yearId;
            if (typeId) f.examTypeId = typeId;
            if (status) f.status = status;

            let list = await getExamEvents(f);
            list = Array.isArray(list) ? list : [];

            if (classId) {
                list = list
                    .map(ev => ({ ...ev, exams: (ev.exams || []).filter(e => String(e.schoolClassId) === String(classId)) }))
                    .filter(ev => ev.exams.length > 0);
            }

            setEvents(list);
        } catch { setErrorEvents("Failed to load exam events."); setEvents([]); }
        finally { setLoadingEvents(false); }
    }, [yearId, typeId, status, classId]);

    useEffect(() => { if (!loadingMeta) fetchEvents(); }, [fetchEvents, loadingMeta]);

    const loadSectionsForEvent = useCallback(async (event) => {
        for (const exam of event.exams || []) {
            const key = `${event.eventId}-${exam.schoolClassId}`;
            if (sectionsCache[key] !== undefined) continue;
            try {
                const subs = await getEventClassSubjects(event.eventId, exam.schoolClassId);
                const bySection = new Map();
                (subs || []).forEach(s => {
                    if (!bySection.has(s.sectionId)) bySection.set(s.sectionId, { sectionId: s.sectionId, sectionName: s.sectionName });
                });
                setSectionsCache(prev => ({ ...prev, [key]: [...bySection.values()] }));
            } catch {
                setSectionsCache(prev => ({ ...prev, [key]: [] }));
            }
        }
    }, [sectionsCache]);

    const toggleExpand = (eventId) => {
        setExpandedIds(prev => {
            const next = new Set(prev);
            next.has(eventId) ? next.delete(eventId) : next.add(eventId);
            return next;
        });
    };

    const handleAction = (exam, action) => {
        if (action === "declare") {
            setDeclareTarget({ examId: exam.id, name: `${exam.schoolClassName} — ${exam.name}` });
        } else if (action === "enter_marks" || action === "marks") {
            navigate(`/exams/marksEntry/${exam.id}`);
        } else if (action === "reports") {
            navigate(`/exams/reportCard/${exam.id}`);
        } else if (action === "subjects") {
            const ev = events.find(e => (e.exams || []).some(x => x.id === exam.id));
            setSubjectsTarget({ event: ev, exam });
        }
    };

    const handleDeclare = async () => {
        if (!declareTarget) return;
        setDeclaringExam(true);
        try {
            await declareEventExamResult(declareTarget.examId);
            await fetchEvents();
            setDeclareTarget(null);
        } catch (err) {
            setToastError(err?.message || "Failed to declare result.");
        } finally { setDeclaringExam(false); }
    };

    const handleRemoveClass = async () => {
        if (!removeClassTarget) return;
        const { event, exam } = removeClassTarget;
        setRemoveClassSaving(true);
        try {
            await removeClassFromExamEvent(event.eventId, exam.schoolClassId);
            await fetchEvents();
            setRemoveClassTarget(null);
        } catch (err) {
            setToastError(err?.message || "Failed to remove class.");
        } finally { setRemoveClassSaving(false); }
    };

    const handleAddClass = async (classIds) => {
        if (!addClassTarget) return;
        setAddClassSaving(true);
        try {
            await addClassesToExamEvent(addClassTarget.eventId, classIds);
            await fetchEvents();
            setAddClassTarget(null);
        } catch (err) {
            setToastError(err?.message || "Failed to add classes.");
        } finally { setAddClassSaving(false); }
    };

    const handleEditSave = async (form) => {
        if (!editTarget) return;
        setEditSaving(true);
        try {
            await updateExamEvent(editTarget.eventId, {
                examTypeId: editTarget.examTypeId,
                academicYearId: editTarget.academicYearId,
                classIds: (editTarget.exams || []).map(e => e.schoolClassId),
                ...form,
            });
            await fetchEvents();
            setEditTarget(null);
        } catch (err) {
            setToastError(err?.message || "Failed to update event.");
        } finally { setEditSaving(false); }
    };

    const handleCopySave = async (form) => {
        if (!copyTarget) return;
        setCopySaving(true);
        try {
            await copyExamEvent(copyTarget.eventId, {
                examTypeId: Number(form.examTypeId),
                academicYearId: Number(form.academicYearId),
                name: form.name || undefined,
                startDate: form.startDate,
                endDate: form.endDate,
                description: form.description || undefined,
            });
            await fetchEvents();
            setCopyTarget(null);
        } catch (err) {
            setToastError(err?.message || "Failed to copy event.");
        } finally { setCopySaving(false); }
    };

    const handleExportSchedule = () => {
        if (events.length === 0) return;
        const rows = [["Event", "Exam Type", "Class", "Start", "End", "Subjects", "Status"]];
        events.forEach(ev => {
            (ev.exams || []).forEach(exam => {
                rows.push([ev.name, ev.examTypeName, exam.schoolClassName, exam.startDate, exam.endDate, exam.subjectConfigCount ?? 0, exam.resultDeclared ? "Declared" : "Pending"]);
            });
        });
        const csv = rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "exam-schedule.csv"; a.click();
        URL.revokeObjectURL(url);
    };

    const stats = buildStats(events);
    const allClassesForAdd = classes;

    return (
        <div className="min-h-screen bg-[#f3f6fb] overflow-x-hidden">
            <div className="p-2 md:p-3 lg:p-4 xl:p-6 space-y-2 md:space-y-3 lg:space-y-4 max-w-[1700px] mx-auto">
                
                {/* ── PAGE HEADER ─────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                        <TooltipComponent message="Manage school-wide exam events across classes." direction="right" color="nocolor">
                            Exam Events
                        </TooltipComponent>
                    </h1>
                </div>

                {errorMeta && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{errorMeta}</span>
                        <button onClick={() => window.location.reload()} className="text-xs font-medium underline shrink-0">Refresh</button>
                    </div>
                )}

                {/* ── STAT CARDS ──────────────────────────────────── */}
                <div className="grid grid-cols-2 md:grid-cols-2 xl:grid-cols-4 gap-2 sm:gap-3">
                    {(loadingEvents || loadingMeta)
                        ? Array(4).fill(0).map((_, i) => <StatSkeleton key={i} />)
                        : stats.map(s => <StatCard key={s.label} d={s} />)
                    }
                </div>

                {/* ── FILTERS ──────────────────────────────────────── */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-2 md:px-3 lg:px-4 py-2 md:py-3 lg:py-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 2xl:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] gap-1.5 md:gap-2 lg:gap-3">
                        <FilterSelect value={yearId} onChange={e => setYearId(e.target.value)} disabled={loadingMeta}>
                            <option value="">All Years</option>
                            {academicYears.map(y => {
                                const isCurrent = currentAcademicYear?.id === y.id;
                                return <option key={y.id} value={y.id}>{isCurrent ? "🟢 " : ""}{y.label ?? y.name}{isCurrent ? " (Current)" : ""}</option>;
                            })}
                        </FilterSelect>

                        <FilterSelect value={typeId} onChange={e => setTypeId(e.target.value)} disabled={loadingMeta}>
                            <option value="">All Exam Types</option>
                            {examTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </FilterSelect>

                        <FilterSelect value={classId} onChange={e => setClassId(e.target.value)} disabled={loadingMeta}>
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </FilterSelect>

                        <FilterSelect value={status} onChange={e => setStatus(e.target.value)} disabled={loadingMeta}>
                            <option value="">All Statuses</option>
                            <option value="declared">Declared</option>
                            <option value="partial">Partial</option>
                            <option value="scheduled">Scheduled</option>
                        </FilterSelect>

                        <button
                            onClick={handleExportSchedule}
                            disabled={loadingEvents || events.length === 0}
                            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-gray-200 text-gray-700 text-xs sm:text-sm font-semibold rounded-lg transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50 whitespace-nowrap"
                        >
                            <Download className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">Export Schedule</span><span className="sm:hidden">Export</span>
                        </button>

                        {hasPermission(P.EXAM_CREATE) && (
                          <button
                              onClick={() => setShowWizard(true)}
                              disabled={loadingMeta}
                              className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-lg transition-all shadow-sm active:scale-95 disabled:opacity-60 whitespace-nowrap"
                          >
                              <Plus className="w-4 h-4 shrink-0" /> <span className="hidden sm:inline">New Exam Event</span><span className="sm:hidden">New</span>
                          </button>
                        )}
                    </div>
                </div>

                {/* ── ERROR BANNER ─────────────────────────────────── */}
                {errorEvents && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 flex items-center gap-2 flex-wrap">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span className="flex-1">{errorEvents}</span>
                        <button onClick={fetchEvents} className="text-xs font-medium underline shrink-0">Retry</button>
                    </div>
                )}

                {/* ── EVENT LIST ───────────────────────────────────── */}
                <div className="space-y-3">
                    {loadingEvents ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden p-4">
                            <table className="w-full">
                                <tbody>
                                    <ListLoader rows={4} avatar={false} colSpanSet={1} />
                                </tbody>
                            </table>
                        </div>
                    ) : events.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center text-sm text-gray-400">
                            No exam events found. Create one to get started.
                        </div>
                    ) : (
                        events.map(ev => (
                            <EventItem
                                key={ev.eventId}
                                event={ev}
                                expanded={expandedIds.has(ev.eventId)}
                                onToggle={() => toggleExpand(ev.eventId)}
                                sectionsCache={sectionsCache}
                                onLoadSections={loadSectionsForEvent}
                                onAction={handleAction}
                                onRemoveClass={(exam) => setRemoveClassTarget({ event: ev, exam })}
                                onAddClass={(event) => setAddClassTarget(event)}
                                onEdit={(event) => setEditTarget(event)}
                                onCopy={(event) => setCopyTarget(event)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* ── MODALS & WIZARD ──────────────────────────────────── */}
            {showWizard && (
                <CreateExamEventWizard
                    examTypes={examTypes}
                    academicYears={academicYears}
                    classes={classes}
                    currentAcademicYearId={currentAcademicYear?.id}
                    onClose={() => setShowWizard(false)}
                    onSuccess={() => { setShowWizard(false); fetchEvents(); }}
                />
            )}

            {editTarget && (
                <EditEventModal event={editTarget} onSave={handleEditSave} onCancel={() => setEditTarget(null)} loading={editSaving} />
            )}

            {copyTarget && (
                <CopyEventModal event={copyTarget} examTypes={examTypes} academicYears={academicYears}
                    onSave={handleCopySave} onCancel={() => setCopyTarget(null)} loading={copySaving} />
            )}

            {addClassTarget && (
                <AddClassModal event={addClassTarget} allClasses={allClassesForAdd}
                    onSave={handleAddClass} onCancel={() => setAddClassTarget(null)} loading={addClassSaving} />
            )}

            {removeClassTarget && (
                <RemoveClassModal exam={removeClassTarget.exam} onConfirm={handleRemoveClass} onCancel={() => setRemoveClassTarget(null)} loading={removeClassSaving} />
            )}

            {declareTarget && (
                <DeclareModal examName={declareTarget.name} onConfirm={handleDeclare} onCancel={() => setDeclareTarget(null)} loading={declaringExam} />
            )}

            {subjectsTarget && (
                <SubjectsModal event={subjectsTarget.event} exam={subjectsTarget.exam}
                    onClose={() => setSubjectsTarget(null)} onChanged={fetchEvents} />
            )}

            {toastError && <ErrorToast message={toastError} onClose={() => setToastError(null)} />}
        </div>
    );
}