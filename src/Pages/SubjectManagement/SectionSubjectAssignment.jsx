// ─────────────────────────────────────────────────────────────────────────────
//  SectionSubjectAssignment.jsx  — fully responsive (mobile → desktop)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import SectionSubjectService from "../../Api/SectionSubjectService";

// ─── Design tokens ────────────────────────────────────────────────────────────
const INPUT_CLS =
  "border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white " +
  "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-300 transition w-full";

const BTN_PRIMARY =
  "flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-xl bg-blue-600 text-white " +
  "hover:bg-blue-700 active:scale-95 transition font-medium shadow-sm " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

const BTN_GHOST =
  "flex items-center justify-center gap-1.5 px-4 py-2 text-sm rounded-xl border border-slate-200 " +
  "text-slate-600 hover:bg-slate-50 active:scale-95 transition";

const BTN_DANGER =
  "flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs rounded-xl border border-rose-200 " +
  "text-rose-500 hover:bg-rose-50 active:scale-95 transition font-medium";

// ─── Primitives ───────────────────────────────────────────────────────────────

const Badge = ({ children, variant = "default" }) => {
  const cls = {
    default: "bg-slate-100 text-slate-500",
    code: "bg-blue-50 text-blue-600 font-mono text-[11px] tracking-wide",
    mandatory: "bg-violet-50 text-violet-600 border border-violet-100",
    optional: "bg-slate-50 text-slate-400 border border-slate-100",
    active: "bg-emerald-50 text-emerald-600 border border-emerald-100",
    inactive: "bg-rose-50 text-rose-400 border border-rose-100",
    hours: "bg-sky-50 text-sky-600 border border-sky-100",
    count: "bg-blue-100 text-blue-700 font-semibold",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium ${cls[variant]}`}>
      {children}
    </span>
  );
};

const IconBtn = ({ onClick, title, variant = "red" }) => {
  const cls = {
    red: "text-slate-300 hover:text-rose-500 hover:bg-rose-50",
    blue: "text-slate-300 hover:text-blue-500 hover:bg-blue-50",
  };
  return (
    <button onClick={onClick} title={title}
      className={`p-2 rounded-lg transition-all active:scale-90 touch-manipulation ${cls[variant]}`}>
      {variant === "blue" ? <PencilIcon /> : <TrashIcon />}
    </button>
  );
};

// Select with chevron / spinner — full width on mobile
const Select = ({ value, onChange, children, className = "", loading = false, disabled = false }) => (
  <div className="relative w-full">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      className={`appearance-none pr-8 ${INPUT_CLS} ${className} ${(disabled || loading) ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {loading ? <option value="">Loading…</option> : children}
    </select>
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
      {loading ? <SpinnerIcon /> : <ChevronIcon />}
    </span>
  </div>
);

// Skeleton loader rows
const SkeletonRow = ({ cols = 6 }) => (
  <tr>
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-4 py-4">
        <div className="h-3 bg-slate-100 rounded-full animate-pulse" style={{ width: `${40 + (i * 13) % 40}%` }} />
      </td>
    ))}
  </tr>
);

// Empty / no-data state
const EmptyState = ({ cols = 6, message }) => (
  <tr>
    <td colSpan={cols}>
      <div className="flex flex-col items-center justify-center py-12 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📚</div>
        <p className="text-sm text-slate-400 text-center px-4">{message}</p>
      </div>
    </td>
  </tr>
);

// Mobile subject card — replaces table rows on small screens
const SubjectCard = ({ row, onEdit, onRemove }) => (
  <div className="p-4 border-b border-slate-50 last:border-0 fade-row">
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{row.subjectName}</p>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          <Badge variant="code">{row.subjectCode}</Badge>
          <Badge variant="hours">{row.weeklyHours} hrs</Badge>
          <Badge variant={row.isMandatory ? "mandatory" : "optional"}>
            {row.isMandatory ? "Mandatory" : "Optional"}
          </Badge>
          <Badge variant={row.status === "ACTIVE" ? "active" : "inactive"}>
            {row.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-0.5 shrink-0">
        <IconBtn variant="blue" title="Edit" onClick={() => onEdit(row)} />
        <IconBtn variant="red" title="Remove" onClick={() => onRemove(row)} />
      </div>
    </div>
  </div>
);

// ─── Icons ────────────────────────────────────────────────────────────────────
const PencilIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
  </svg>
);
const PlusIcon = () => (
  <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
  </svg>
);
const SearchIcon = () => (
  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
  </svg>
);
const ChevronIcon = () => (
  <svg className="h-3.5 w-3.5 text-slate-400" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
  </svg>
);
const SpinnerIcon = () => (
  <svg className="h-3.5 w-3.5 text-slate-400 animate-spin" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
  </svg>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Assign Subjects Modal
// ─────────────────────────────────────────────────────────────────────────────
const AssignModal = ({ sectionId, allSubjects, assignedSubjectIds, onClose, onAssigned }) => {
  const [rows, setRows] = useState([{ subjectId: "", weeklyHours: 1, isMandatory: false, status: "ACTIVE" }]);
  const [saving, setSaving] = useState(false);

  const available = allSubjects.filter(s => !assignedSubjectIds.includes(String(s.id)));

  const setRow = (i, key, value) =>
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [key]: value } : r));

  const addRow = () =>
    setRows(prev => [...prev, { subjectId: "", weeklyHours: 1, isMandatory: false, status: "ACTIVE" }]);

  const removeRow = (i) =>
    setRows(prev => prev.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    const valid = rows.filter(r => r.subjectId);
    if (!valid.length) return;
    setSaving(true);
    const res = await SectionSubjectService.assignSubjects({ sectionId, subjects: valid });
    setSaving(false);
    if (res) onAssigned();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl overflow-hidden animate-slideUp">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Section Subjects</p>
            <h3 className="text-white font-semibold text-base mt-0.5">Assign Subjects</h3>
          </div>
          <button onClick={onClose}
            className="text-blue-200 hover:text-white transition text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 touch-manipulation">
            ✕
          </button>
        </div>

        {/* Rows */}
        <div className="p-4 space-y-3 max-h-[55vh] overflow-y-auto">
          {rows.map((row, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">

              {/* Subject picker — full width */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Subject</label>
                <Select value={row.subjectId} onChange={e => setRow(i, "subjectId", e.target.value)}>
                  <option value="">— Select —</option>
                  {available.map(s => (
                    <option key={s.id} value={s.id}
                      disabled={rows.some((r, ri) => ri !== i && r.subjectId === String(s.id))}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </Select>
              </div>

              {/* Hours + toggles row */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Weekly hours */}
                <div className="space-y-1 w-24 shrink-0">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">Hrs/wk</label>
                  <input type="number" min={1} max={40} value={row.weeklyHours}
                    onChange={e => setRow(i, "weeklyHours", Number(e.target.value))}
                    className="border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-full" />
                </div>

                {/* Mandatory */}
                <button type="button" onClick={() => setRow(i, "isMandatory", !row.isMandatory)}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all touch-manipulation ${row.isMandatory
                    ? "bg-violet-50 border-violet-200 text-violet-700"
                    : "bg-white border-slate-200 text-slate-400"
                    }`}>
                  {row.isMandatory ? "Mandatory" : "Optional"}
                </button>

                {/* Status */}
                <button type="button" onClick={() => setRow(i, "status", row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                  className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all touch-manipulation ${row.status === "ACTIVE"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "bg-white border-slate-200 text-slate-400"
                    }`}>
                  {row.status === "ACTIVE" ? "Active" : "Inactive"}
                </button>

                {/* Remove row */}
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)}
                    className="ml-auto p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition touch-manipulation">
                    <TrashIcon />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button onClick={addRow}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-200 text-sm text-slate-400 hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-1.5 touch-manipulation">
            <PlusIcon /> Add another subject
          </button>
        </div>

        {/* Footer */}
        <div className="px-4 pb-4 pt-2 flex gap-2 border-t border-slate-100">
          <button onClick={onClose} className={`${BTN_GHOST} flex-1`}>Cancel</button>
          <button onClick={handleSave} disabled={saving || rows.every(r => !r.subjectId)} className={`${BTN_PRIMARY} flex-1`}>
            {saving ? "Saving…" : "Assign Subjects"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Edit Assignment Modal
// ─────────────────────────────────────────────────────────────────────────────
const EditModal = ({ row, onClose, onSave }) => {
  const [form, setForm] = useState({
    subjectId: row.subjectId,
    weeklyHours: row.weeklyHours ?? 1,
    isMandatory: row.isMandatory ?? false,
    status: row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden animate-slideUp">

        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-xs font-medium uppercase tracking-widest">Edit Assignment</p>
            <h3 className="text-white font-semibold text-base mt-0.5 truncate max-w-[220px]">{row.subjectName}</h3>
          </div>
          <button onClick={onClose}
            className="text-blue-200 hover:text-white transition text-xl w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/10 touch-manipulation">
            ✕
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Weekly Hours</label>
            <input type="number" min={1} max={40} value={form.weeklyHours}
              onChange={e => set("weeklyHours", Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-full" />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => set("isMandatory", !form.isMandatory)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all touch-manipulation ${form.isMandatory
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${form.isMandatory ? "bg-blue-500" : "bg-slate-300"}`} />
              Mandatory
            </button>

            <button type="button" onClick={() => set("status", form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all touch-manipulation ${form.status === "ACTIVE"
                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${form.status === "ACTIVE" ? "bg-emerald-500" : "bg-slate-300"}`} />
              {form.status === "ACTIVE" ? "Active" : "Inactive"}
            </button>
          </div>

          <div className="flex gap-2 pt-1">
            <button onClick={onClose} className={`${BTN_GHOST} flex-1`}>Cancel</button>
            <button onClick={() => onSave(form)} className={`${BTN_PRIMARY} flex-1`}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Confirm Dialog
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-0 sm:p-4">
    <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-5 space-y-4 animate-slideUp">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
          <TrashIcon />
        </div>
        <p className="text-sm text-slate-700 pt-1.5 leading-relaxed">{message}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className={`${BTN_GHOST} flex-1`}>Cancel</button>
        <button onClick={onConfirm}
          className="flex-1 px-4 py-2 text-sm rounded-xl bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition font-medium touch-manipulation">
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionSubjectAssignment() {

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [classesLoading, setClassesLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [search, setSearch] = useState("");

  const [editRow, setEditRow] = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [confirmDg, setConfirmDg] = useState(null);

  // ─── Loaders ──────────────────────────────────────────────────────────────

  const loadClasses = useCallback(async () => {
    setClassesLoading(true);
    const data = await SectionSubjectService.getAllClasses();
    setClasses(data);
    if (data.length) setSelectedClassId(String(data[0].id));
    setClassesLoading(false);
  }, []);

  const loadSections = useCallback(async (classId) => {
    setSectionsLoading(true);
    setSections([]);
    setSelectedSectionId("");
    setSubjects([]);
    const data = await SectionSubjectService.getSectionsByClass(classId);
    setSections(data);
    if (data.length) setSelectedSectionId(String(data[0].id));
    setSectionsLoading(false);
  }, []);

  const loadSubjects = useCallback(async (sectionId) => {
    setTableLoading(true);
    const data = filterStatus === "active"
      ? await SectionSubjectService.getActiveSubjectsBySection(sectionId)
      : await SectionSubjectService.getSubjectsBySection(sectionId);
    setSubjects(data);
    setTableLoading(false);
  }, [filterStatus]);

  // ─── Effects ──────────────────────────────────────────────────────────────

  useEffect(() => {
    loadClasses();
    SectionSubjectService.getAllSubjects().then(setAllSubjects);
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClassId) loadSections(selectedClassId);
  }, [selectedClassId, loadSections]);

  useEffect(() => {
    if (selectedSectionId) loadSubjects(selectedSectionId);
  }, [selectedSectionId, filterStatus]);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleSaveEdit = async (form) => {
    const res = await SectionSubjectService.updateAssignment(editRow.id, form);
    if (res) setSubjects(prev => prev.map(s => s.id === editRow.id ? { ...s, ...form } : s));
    setEditRow(null);
  };

  const handleAssigned = () => {
    setShowAssign(false);
    if (selectedSectionId) loadSubjects(selectedSectionId);
  };

  const handleRemove = (row) => setConfirmDg({
    message: `Remove "${row.subjectName}" from this section?`,
    onConfirm: async () => {
      const res = await SectionSubjectService.removeSubject(selectedSectionId, row.subjectId);
      if (res) setSubjects(prev => prev.filter(s => s.subjectId !== row.subjectId));
      setConfirmDg(null);
    },
  });

  const handleRemoveAll = () => setConfirmDg({
    message: "Remove ALL subjects from this section? This cannot be undone.",
    onConfirm: async () => {
      const res = await SectionSubjectService.removeAllSubjects(selectedSectionId);
      if (res) setSubjects([]);
      setConfirmDg(null);
    },
  });

  // ─── Derived ──────────────────────────────────────────────────────────────

  const selectedClassName = classes.find(c => String(c.id) === selectedClassId)?.name ?? "";
  const selectedSectionName = sections.find(s => String(s.id) === selectedSectionId)?.name ?? "";
  const assignedSubjectIds = subjects.map(s => String(s.subjectId));

  const filteredSubjects = subjects.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q);
  });

  // ─────────────────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f5f6fa]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .fade-row { animation: fadeRow .18s ease; }
        @keyframes fadeRow { from { opacity:0; transform:translateY(4px); } to { opacity:1; transform:none; } }
        .row-hover:hover td { background: #f8f9ff; }
        @keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
        .animate-slideUp { animation: slideUp .22s ease; }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-5 sm:pb-8 space-y-4 sm:space-y-5">

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div>
          {/* <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Academic → Subjects</p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
            Section–Subject Assignment
          </h1> */}
        </div>

        {/* ── Class & Section selector ─────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
            Select Class &amp; Section
          </p>
          {/* Stack vertically on mobile, side-by-side on sm+ */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Class</label>
              <Select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                loading={classesLoading}
              >
                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-500">Section</label>
              <Select
                value={selectedSectionId}
                onChange={e => setSelectedSectionId(e.target.value)}
                loading={sectionsLoading}
                disabled={!selectedClassId}
              >
                {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </Select>
            </div>
          </div>
        </div>

        {/* ── Subjects card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

          {/* Card header */}
          <div className="flex items-center justify-between gap-2 px-4 sm:px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2 min-w-0">
              <div className="min-w-0">
                <p className="text-xs text-slate-400 font-medium hidden sm:block">Assigned Subjects</p>
                <h2 className="text-sm sm:text-base font-semibold text-slate-800 truncate">
                  {selectedClassName || "—"}&nbsp;/&nbsp;{selectedSectionName || "—"}
                </h2>
              </div>
              <Badge variant="count">{filteredSubjects.length}</Badge>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {/* On mobile: icon-only danger button to save space */}
              <button onClick={handleRemoveAll} disabled={!subjects.length}
                className={`${BTN_DANGER} sm:px-3`}>
                <TrashIcon />
                <span className="hidden sm:inline">Remove All</span>
              </button>
              <button onClick={() => setShowAssign(true)} disabled={!selectedSectionId}
                className={BTN_PRIMARY}>
                <PlusIcon />
                <span className="hidden sm:inline">Assign Subjects</span>
                <span className="sm:hidden">Assign</span>
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-slate-50/60 border-b border-slate-100">
            {/* Status filter — shrinks on mobile */}
            <div className="w-32 sm:w-36 shrink-0">
              <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
              </Select>
            </div>

            {/* Search */}
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2"><SearchIcon /></span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search…"
                className="pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 w-full"
              />
            </div>
          </div>

          {/* ── Mobile: card list (hidden on md+) ──────────────────────────── */}
          <div className="md:hidden">
            {tableLoading
              ? <div className="py-12 flex flex-col items-center gap-2">
                <SpinnerIcon />
                <p className="text-xs text-slate-400">Loading subjects…</p>
              </div>
              : filteredSubjects.length === 0
                ? <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl">📚</div>
                  <p className="text-sm text-slate-400 text-center px-4">
                    {!selectedSectionId
                      ? "Select a section to view subjects."
                      : subjects.length === 0
                        ? "No subjects assigned to this section."
                        : "No results match your search."}
                  </p>
                </div>
                : filteredSubjects.map(row => (
                  <SubjectCard key={row.id} row={row}
                    onEdit={setEditRow}
                    onRemove={handleRemove}
                  />
                ))
            }
          </div>

          {/* ── Desktop: table (hidden on mobile) ──────────────────────────── */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/40">
                  {["Subject", "Code", "Weekly Hours", "Mandatory", "Status", "Actions"].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[11px] font-semibold text-slate-400 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {tableLoading
                  ? [...Array(4)].map((_, i) => <SkeletonRow key={i} cols={6} />)
                  : filteredSubjects.length === 0
                    ? <EmptyState cols={6} message={
                      !selectedSectionId
                        ? "Select a section to view subjects."
                        : subjects.length === 0
                          ? "No subjects assigned to this section."
                          : "No results match your search."
                    } />
                    : filteredSubjects.map(row => (
                      <tr key={row.id} className="row-hover transition-colors fade-row">
                        <td className="px-6 py-3.5 font-semibold text-slate-800 whitespace-nowrap">{row.subjectName}</td>
                        <td className="px-6 py-3.5"><Badge variant="code">{row.subjectCode}</Badge></td>
                        <td className="px-6 py-3.5"><Badge variant="hours">{row.weeklyHours} hrs</Badge></td>
                        <td className="px-6 py-3.5">
                          <Badge variant={row.isMandatory ? "mandatory" : "optional"}>
                            {row.isMandatory ? "Mandatory" : "Optional"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <Badge variant={row.status === "ACTIVE" ? "active" : "inactive"}>
                            {row.status === "ACTIVE" ? "Active" : "Inactive"}
                          </Badge>
                        </td>
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-0.5">
                            <IconBtn variant="blue" title="Edit" onClick={() => setEditRow(row)} />
                            <IconBtn variant="red" title="Remove" onClick={() => handleRemove(row)} />
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      {showAssign && (
        <AssignModal
          sectionId={selectedSectionId}
          allSubjects={allSubjects}
          assignedSubjectIds={assignedSubjectIds}
          onClose={() => setShowAssign(false)}
          onAssigned={handleAssigned}
        />
      )}
      {editRow && (
        <EditModal
          row={editRow}
          onClose={() => setEditRow(null)}
          onSave={handleSaveEdit}
        />
      )}
      {confirmDg && (
        <ConfirmDialog
          message={confirmDg.message}
          onConfirm={confirmDg.onConfirm}
          onCancel={() => setConfirmDg(null)}
        />
      )}
    </div>
  );
}