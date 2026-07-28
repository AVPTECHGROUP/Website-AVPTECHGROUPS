// ─────────────────────────────────────────────────────────────────────────────
//  SectionSubjectAssignment.jsx — Responsive up to Desktop (xl breakpoint)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import SectionSubjectService from "../../Api/Academics/SectionSubjectService";
import { Edit, MinusCircle, BookOpen, Filter, Search, Plus, Check } from "lucide-react";
import { COMMON_STATUS, SEC_SUB_CONSTS } from "../../Constants/StringConstants/AcademicsConstants";

// ─── Design tokens ────────────────────────────────────────────────────────────
const INPUT_CLS =
  "border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white " +
  "focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition w-full shadow-2xs";

const BTN_PRIMARY =
  "flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg bg-blue-600 text-white " +
  "hover:bg-blue-700 active:scale-95 transition font-medium shadow-xs " +
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100";

const BTN_GHOST =
  "flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs rounded-lg border border-slate-200 " +
  "text-slate-600 hover:bg-slate-50 active:scale-95 transition";

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
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium ${cls[variant]}`}>
      {children}
    </span>
  );
};

const ActionButton = ({ onClick, variant = "blue", label, icon: Icon }) => {
  const cls = {
    blue: "border border-blue-200 text-blue-600 bg-blue-50/40 hover:bg-blue-100/70",
    red: "border border-rose-200 text-rose-600 bg-rose-50/40 hover:bg-rose-100/70",
  };
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold 
        transition-all cursor-pointer select-none touch-manipulation active:scale-95 ${cls[variant]}`}
    >
      <Icon size={12} strokeWidth={2.2} className="shrink-0" />
      <span>{label}</span>
    </button>
  );
};

const Select = ({ value, onChange, children, className = "", loading = false, disabled = false }) => (
  <div className="relative w-full min-w-0">
    <select
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      className={`appearance-none pr-8 ${INPUT_CLS} ${className} ${(disabled || loading) ? "opacity-60 cursor-not-allowed" : ""}`}
    >
      {loading ? <option value="">{SEC_SUB_CONSTS.TEXT.LOADING}</option> : children}
    </select>
    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">
      {loading ? "..." : "▾"}
    </span>
  </div>
);

const SkeletonRow = () => (
  <tr className="border-b border-slate-100">
    {[...Array(6)].map((_, i) => (
      <td key={i} className="px-6 py-3">
        <div className="h-2.5 bg-slate-100 rounded-full animate-pulse w-4/5" />
      </td>
    ))}
  </tr>
);

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-12 gap-2 text-center w-full">
    <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-xl shadow-xs">📚</div>
    <p className="text-xs text-slate-400 max-w-xs px-4">{message}</p>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
//  Assign Subjects Modal (UPDATED: Bulk Checkbox Selection)
// ─────────────────────────────────────────────────────────────────────────────
const AssignModal = ({ sectionId, allSubjects, assignedSubjectIds, onClose, onAssigned }) => {
  // Available subjects that are not yet assigned to this section
  const availableSubjects = allSubjects.filter(s => !assignedSubjectIds.includes(String(s.id)));

  // State mapping each subject ID to its configuration: { selected, weeklyHours, isMandatory, status }
  const [subjectConfigs, setSubjectConfigs] = useState(() => {
    const initial = {};
    availableSubjects.forEach(s => {
      initial[s.id] = {
        selected: false,
        weeklyHours: 1,
        isMandatory: false,
        status: COMMON_STATUS.ACTIVE
      };
    });
    return initial;
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [saving, setSaving] = useState(false);

  const toggleSelect = (id) => {
    setSubjectConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], selected: !prev[id]?.selected }
    }));
  };

  const updateConfig = (id, key, value) => {
    setSubjectConfigs(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: value }
    }));
  };

  const selectedCount = Object.values(subjectConfigs).filter(c => c.selected).length;

  const toggleSelectAll = () => {
    const filteredAvailable = availableSubjects.filter(s => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q);
    });

    const allFilteredSelected = filteredAvailable.every(s => subjectConfigs[s.id]?.selected);

    setSubjectConfigs(prev => {
      const next = { ...prev };
      filteredAvailable.forEach(s => {
        next[s.id] = { ...next[s.id], selected: !allFilteredSelected };
      });
      return next;
    });
  };

  const handleSave = async () => {
    const payload = Object.entries(subjectConfigs)
      .filter(([_, cfg]) => cfg.selected)
      .map(([subjectId, cfg]) => ({
        subjectId: Number(subjectId),
        weeklyHours: Math.max(1, Number(cfg.weeklyHours) || 1),
        isMandatory: Boolean(cfg.isMandatory),
        status: cfg.status
      }));

    if (!payload.length) return;

    setSaving(true);
    const res = await SectionSubjectService.assignSubjects({ sectionId, subjects: payload });
    setSaving(false);
    if (res) onAssigned();
  };

  const filteredSubjects = availableSubjects.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-2xl overflow-hidden animate-slideUp flex flex-col max-h-[90vh]">

        {/* Modal Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between shrink-0">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-widest">{SEC_SUB_CONSTS.TEXT.SECTION_SUBJECTS}</p>
            <h3 className="text-white font-semibold text-sm mt-0.5">{SEC_SUB_CONSTS.TEXT.ASSIGN_SUBJECTS}</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer">✕</button>
        </div>

        {/* Toolbar: Search & Select All */}
        <div className="p-3 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search available subjects..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {filteredSubjects.length > 0 && (
            <button
              type="button"
              onClick={toggleSelectAll}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200/60 px-3 py-1.5 rounded-lg transition shrink-0 cursor-pointer w-full sm:w-auto text-center"
            >
              {filteredSubjects.every(s => subjectConfigs[s.id]?.selected) ? "Deselect All Filtered" : "Select All Filtered"}
            </button>
          )}
        </div>

        {/* List of Available Subjects */}
        <div className="p-3 sm:p-4 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
          {filteredSubjects.length === 0 ? (
            <EmptyState message={availableSubjects.length === 0 ? "All available subjects are already assigned to this section." : "No subjects found matching your search."} />
          ) : (
            filteredSubjects.map(subject => {
              const cfg = subjectConfigs[subject.id] || { selected: false, weeklyHours: 1, isMandatory: false, status: COMMON_STATUS.ACTIVE };

              return (
                <div
                  key={subject.id}
                  className={`p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${cfg.selected
                      ? "bg-blue-50/40 border-blue-200 shadow-2xs"
                      : "bg-white border-slate-100 hover:border-slate-200"
                    }`}
                >
                  {/* Subject Info Checkbox */}
                  <div
                    onClick={() => toggleSelect(subject.id)}
                    className="flex items-center gap-3 cursor-pointer select-none flex-1 min-w-0"
                  >
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition ${cfg.selected ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                      }`}>
                      {cfg.selected && <Check size={12} strokeWidth={3} />}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800 truncate">{subject.name}</span>
                        <Badge variant="code">{subject.code}</Badge>
                      </div>
                    </div>
                  </div>

                  {/* Config options (Hours, Mandatory, Active) */}
                  {cfg.selected && (
                    <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
                      <div className="w-20 relative">
                        <input
                          type="number"
                          min={1}
                          max={40}
                          value={cfg.weeklyHours}
                          onChange={e => updateConfig(subject.id, "weeklyHours", Number(e.target.value))}
                          className="h-7 w-full border border-slate-200 rounded-md pl-2 pr-7 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[10px] font-medium text-slate-400 pointer-events-none">
                          /hr
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => updateConfig(subject.id, "isMandatory", !cfg.isMandatory)}
                        className={`h-7 px-2.5 rounded-md border text-[11px] font-medium transition cursor-pointer ${cfg.isMandatory ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-400"
                          }`}
                      >
                        {cfg.isMandatory ? SEC_SUB_CONSTS.TEXT.MANDATORY : SEC_SUB_CONSTS.TEXT.OPTIONAL}
                      </button>

                      <button
                        type="button"
                        onClick={() => updateConfig(subject.id, "status", cfg.status === COMMON_STATUS.ACTIVE ? COMMON_STATUS.INACTIVE : COMMON_STATUS.ACTIVE)}
                        className={`h-7 px-2.5 rounded-md border text-[11px] font-medium transition cursor-pointer ${cfg.status === COMMON_STATUS.ACTIVE ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-400"
                          }`}
                      >
                        {cfg.status === COMMON_STATUS.ACTIVE ? SEC_SUB_CONSTS.TEXT.ACTIVE : SEC_SUB_CONSTS.TEXT.INACTIVE}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-4 py-3 flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            {selectedCount} subject{selectedCount !== 1 ? "s" : ""} selected
          </span>

          <div className="flex gap-2">
            <button onClick={onClose} disabled={saving} className={BTN_GHOST}>
              {SEC_SUB_CONSTS.TEXT.CANCEL}
            </button>
            <button onClick={handleSave} disabled={saving || selectedCount === 0} className={BTN_PRIMARY}>
              {saving ? SEC_SUB_CONSTS.TEXT.SAVING : `${SEC_SUB_CONSTS.TEXT.ASSIGN_SUBJECTS} (${selectedCount})`}
            </button>
          </div>
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
    status: row.status === COMMON_STATUS.ACTIVE ? COMMON_STATUS.ACTIVE : COMMON_STATUS.INACTIVE,
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-widest">{SEC_SUB_CONSTS.TEXT.EDIT_ASSIGNMENT}</p>
            <h3 className="text-white font-semibold text-sm mt-0.5 truncate max-w-[240px]">{row.subjectName}</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10 cursor-pointer">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{SEC_SUB_CONSTS.TEXT.WEEKLY_HOURS}</label>
            <input type="number" min={1} max={40} value={form.weeklyHours}
              onChange={e => set("weeklyHours", Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => set("isMandatory", !form.isMandatory)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${form.isMandatory ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
              {SEC_SUB_CONSTS.TEXT.MANDATORY}
            </button>
            <button type="button" onClick={() => set("status", form.status === COMMON_STATUS.ACTIVE ? COMMON_STATUS.INACTIVE : COMMON_STATUS.ACTIVE)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all cursor-pointer ${form.status === COMMON_STATUS.ACTIVE ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
                }`}>
              {form.status === COMMON_STATUS.ACTIVE ? SEC_SUB_CONSTS.TEXT.ACTIVE : SEC_SUB_CONSTS.TEXT.INACTIVE}
            </button>
          </div>

          <div className="flex gap-2 border-t border-slate-100 pt-3">
            <button onClick={onClose} className={`${BTN_GHOST} flex-1`}>{SEC_SUB_CONSTS.TEXT.CANCEL}</button>
            <button onClick={() => onSave(form)} className={`${BTN_PRIMARY} flex-1`}>{SEC_SUB_CONSTS.TEXT.SAVE_CHANGES}</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Confirm Dialog
// ─────────────────────────────────────────────────────────────────────────────
const ConfirmDialog = ({ message, onConfirm, onCancel }) => {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    if (busy) return;
    setBusy(true);
    try { await onConfirm(); }
    catch { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm p-4 space-y-4 animate-slideUp">
        <p className="text-xs text-slate-700 leading-relaxed font-medium">{message}</p>
        <div className="flex gap-2">
          <button onClick={onCancel} disabled={busy} className={`${BTN_GHOST} flex-1`}>{SEC_SUB_CONSTS.TEXT.CANCEL}</button>
          <button onClick={handleConfirm} disabled={busy} className="flex-1 px-4 py-1.5 text-xs rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-medium disabled:opacity-50 cursor-pointer">
            {busy ? SEC_SUB_CONSTS.TEXT.REMOVING : SEC_SUB_CONSTS.TEXT.CONFIRM}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component Layout Block
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionSubjectAssignment({ refreshKey }) {
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

  const loadClasses = useCallback(async () => {
    setClassesLoading(true);
    const data = await SectionSubjectService.getActiveClasses();
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

  useEffect(() => {
    loadClasses();
    SectionSubjectService.getAllSubjects().then(setAllSubjects);
  }, [loadClasses,refreshKey]);

  useEffect(() => {
    if (selectedClassId) loadSections(selectedClassId);
  }, [selectedClassId, loadSections]);

  useEffect(() => {
    if (selectedSectionId) loadSubjects(selectedSectionId);
  }, [selectedSectionId, filterStatus]);

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
    message: SEC_SUB_CONSTS.CONFIRM.REMOVE(row.subjectName),
    onConfirm: async () => {
      const res = await SectionSubjectService.removeSubject(selectedSectionId, row.subjectId);
      if (res) setSubjects(prev => prev.filter(s => s.subjectId !== row.subjectId));
      setConfirmDg(null);
    },
  });

  const selectedClassName = classes.find(c => String(c.id) === selectedClassId)?.name ?? "";
  const selectedSectionName = sections.find(s => String(s.id) === selectedSectionId)?.name ?? "";
  const assignedSubjectIds = subjects.map(s => String(s.subjectId));

  const filteredSubjects = subjects.filter(s => {
    if (!search) return true;
    const q = search.toLowerCase();
    return s.subjectName?.toLowerCase().includes(q) || s.subjectCode?.toLowerCase().includes(q);
  });

  return (
    <div className="w-full flex flex-col h-full min-h-0 justify-between min-w-0 bg-gradient-to-b from-sky-50 to-sky-100">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { font-family: 'Inter', sans-serif; }
        .fade-row { animation: fadeRow .12s ease-out; }
        @keyframes fadeRow { from { opacity:0; transform:translateY(1px); } to { opacity:1; transform:none; } }
        .animate-slideUp { animation: slideUp .15s ease-out; }
        @keyframes slideUp { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:none; } }
      `}</style>

      {/* Class & Section Selection Header Card Block */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-3 m-2 sm:m-4 shrink-0">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full min-w-0">
          <div className="flex items-center gap-2 w-full sm:w-[180px] min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-11 shrink-0">{SEC_SUB_CONSTS.TEXT.CLASS}</span>
            <Select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} loading={classesLoading} className="flex-1">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-[180px] min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-13 shrink-0">{SEC_SUB_CONSTS.TEXT.SECTION}</span>
            <Select value={selectedSectionId} onChange={e => setSelectedSectionId(e.target.value)} loading={sectionsLoading} disabled={!selectedClassId} className="flex-1">
              {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </Select>
          </div>
        </div>
      </div>

      {/* Main Subjects Render Area Wrapper Block Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs mx-2 sm:mx-4 mb-4 flex flex-col overflow-hidden flex-1 min-h-0">

        {/* Compact Dynamic Card Subheader Layout Block */}
        <div className="flex items-center justify-between gap-3 px-4 py-2 bg-slate-50/50 border-b border-slate-100 shrink-0">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 min-w-0">
            <Filter size={12} className="text-slate-400 stroke-[2.5]" />
            <span className="truncate">{selectedClassName || SEC_SUB_CONSTS.TEXT.FALLBACK_DASH} / {selectedSectionName || SEC_SUB_CONSTS.TEXT.FALLBACK_DASH}</span>
            <Badge variant="count">{filteredSubjects.length}</Badge>
          </div>
          <button onClick={() => setShowAssign(true)} disabled={!selectedSectionId} className={BTN_PRIMARY}>
            <Plus size={12} /> <span>{SEC_SUB_CONSTS.TEXT.ASSIGN_SUBJECTS}</span>
          </button>
        </div>

        {/* Dense Inputs Searching Controls Block Frame */}
        <div className="flex flex-row items-center gap-2 px-4 py-1.5 border-b border-slate-100 bg-white shrink-0">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-[115px] sm:w-[125px]">
            <option value="all">{SEC_SUB_CONSTS.TEXT.ALL_STATUS}</option>
            <option value="active">{SEC_SUB_CONSTS.TEXT.ACTIVE_ONLY}</option>
          </Select>

          <div className="relative flex-1 max-w-[260px]">
            {/* Search Input available for further filter extensions */}
          </div>
        </div>

        {/* ── HIGH DENSITY COMPACT MOBLLE, TABLET & LAPTOP CARDS SCREEN (< 1280px) ── */}
        <div className="xl:hidden flex-1 overflow-y-auto bg-slate-50/20 p-2 space-y-2 custom-scrollbar min-h-0">
          {tableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <EmptyState message={!selectedSectionId ? SEC_SUB_CONSTS.TEXT.EMPTY_SEC_DTL : SEC_SUB_CONSTS.TEXT.EMPTY_SUB_DTL} />
          ) : (
            filteredSubjects.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-slate-100 p-2.5 shadow-xs flex flex-row items-center justify-between gap-3 h-auto fade-row">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{row.subjectName}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="code">{row.subjectCode}</Badge>
                    <Badge variant="hours">{row.weeklyHours} {SEC_SUB_CONSTS.TEXT.HRS}</Badge>
                    <Badge variant={row.isMandatory ? "mandatory" : "optional"}>
                      {row.isMandatory ? SEC_SUB_CONSTS.TEXT.MANDATORY : SEC_SUB_CONSTS.TEXT.OPTIONAL}
                    </Badge>
                    <Badge variant={row.status === COMMON_STATUS.ACTIVE ? "active" : "inactive"}>
                      {row.status === COMMON_STATUS.ACTIVE ? SEC_SUB_CONSTS.TEXT.ACTIVE : SEC_SUB_CONSTS.TEXT.INACTIVE}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-1 shrink-0 justify-center">
                  <ActionButton label={SEC_SUB_CONSTS.TEXT.EDIT} icon={Edit} variant="blue" onClick={() => setEditRow(row)} />
                  <ActionButton label={SEC_SUB_CONSTS.TEXT.REMOVE} icon={MinusCircle} variant="red" onClick={() => handleRemove(row)} />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── LARGE SCREEN DESKTOP ONLY SYSTEM (≥ 1280px / xl Breakpoint) ─── */}
        <div className="hidden xl:block flex-1 overflow-hidden relative flex flex-col min-h-0 w-full">
          <div className="overflow-x-auto overflow-y-auto block align-middle flex-1 custom-scrollbar min-h-0">
            <table className="w-full border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 select-none">
                <tr>
                  {SEC_SUB_CONSTS.HEADERS.map(h => (
                    <th key={h} className="px-6 py-2 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {tableLoading
                  ? [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                  : filteredSubjects.length === 0
                    ? <tr>
                      <td colSpan={6} className="py-6">
                        <EmptyState message={!selectedSectionId ? SEC_SUB_CONSTS.TEXT.EMPTY_VIEW_ASS : SEC_SUB_CONSTS.TEXT.EMPTY_NO_MATCH} />
                      </td>
                    </tr>
                    : filteredSubjects.map(row => (
                      <tr key={row.id} className="hover:bg-slate-50/40 transition-colors fade-row">
                        <td className="px-6 py-1.5 text-xs font-semibold text-slate-800 whitespace-nowrap">{row.subjectName}</td>
                        <td className="px-6 py-1.5 whitespace-nowrap"><Badge variant="code">{row.subjectCode}</Badge></td>
                        <td className="px-6 py-1.5 whitespace-nowrap"><Badge variant="hours">{row.weeklyHours} {SEC_SUB_CONSTS.TEXT.HRS}</Badge></td>
                        <td className="px-6 py-1.5 whitespace-nowrap">
                          <Badge variant={row.isMandatory ? "mandatory" : "optional"}>
                            {row.isMandatory ? SEC_SUB_CONSTS.TEXT.MANDATORY : SEC_SUB_CONSTS.TEXT.OPTIONAL}
                          </Badge>
                        </td>
                        <td className="px-6 py-1.5 whitespace-nowrap">
                          <Badge variant={row.status === COMMON_STATUS.ACTIVE ? "active" : "inactive"}>
                            {row.status === COMMON_STATUS.ACTIVE ? SEC_SUB_CONSTS.TEXT.ACTIVE : SEC_SUB_CONSTS.TEXT.INACTIVE}
                          </Badge>
                        </td>
                        <td className="px-6 py-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5">
                            <ActionButton label={SEC_SUB_CONSTS.TEXT.EDIT} icon={Edit} variant="blue" onClick={() => setEditRow(row)} />
                            <ActionButton label={SEC_SUB_CONSTS.TEXT.REMOVE} icon={MinusCircle} variant="red" onClick={() => handleRemove(row)} />
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

      {/* Modals Handling */}
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