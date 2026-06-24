// ─────────────────────────────────────────────────────────────────────────────
//  SectionSubjectAssignment.jsx — Responsive up to Desktop (xl breakpoint)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import SectionSubjectService from "../../Api/SectionSubjectService";
import { Edit, MinusCircle, BookOpen, Filter, Search, Plus } from "lucide-react";

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
    default:   "bg-slate-100 text-slate-500",
    code:      "bg-blue-50 text-blue-600 font-mono text-[11px] tracking-wide",
    mandatory: "bg-violet-50 text-violet-600 border border-violet-100",
    optional:  "bg-slate-50 text-slate-400 border border-slate-100",
    active:    "bg-emerald-50 text-emerald-600 border border-emerald-100",
    inactive:  "bg-rose-50 text-rose-400 border border-rose-100",
    hours:     "bg-sky-50 text-sky-600 border border-sky-100",
    count:     "bg-blue-100 text-blue-700 font-semibold",
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
    red:  "border border-rose-200 text-rose-600 bg-rose-50/40 hover:bg-rose-100/70",
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
      {loading ? <option value="">Loading…</option> : children}
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-xl overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-widest">Section Subjects</p>
            <h3 className="text-white font-semibold text-sm mt-0.5">Assign Subjects</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        <div className="p-4 space-y-3 max-h-[50vh] overflow-y-auto">
          {rows.map((row, i) => (
            <div key={i} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col gap-2.5">
              <div className="w-full">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">Subject</label>
                <Select value={row.subjectId} onChange={e => setRow(i, "subjectId", e.target.value)}>
                  <option value="">— Select Subject —</option>
                  {available.map(s => (
                    <option key={s.id} value={s.id} disabled={rows.some((r, ri) => ri !== i && r.subjectId === String(s.id))}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </Select>
              </div>

              <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-16">
                    <input
                      type="number" min={1} max={40} value={row.weeklyHours}
                      onChange={e => setRow(i, "weeklyHours", Number(e.target.value))}
                      className="h-7 border border-slate-200 rounded-md px-2 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full"
                    />
                  </div>
                  <button type="button" onClick={() => setRow(i, "isMandatory", !row.isMandatory)}
                    className={`h-7 px-2.5 rounded-md border text-[11px] font-medium ${row.isMandatory ? "bg-violet-50 border-violet-200 text-violet-700" : "bg-white border-slate-200 text-slate-400"}`}>
                    {row.isMandatory ? "Mandatory" : "Optional"}
                  </button>
                  <button type="button" onClick={() => setRow(i, "status", row.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
                    className={`h-7 px-2.5 rounded-md border text-[11px] font-medium ${row.status === "ACTIVE" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-slate-200 text-slate-400"}`}>
                    {row.status === "ACTIVE" ? "Active" : "Inactive"}
                  </button>
                </div>
                {rows.length > 1 && (
                  <button onClick={() => removeRow(i)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-md hover:bg-rose-50 transition">✕</button>
                )}
              </div>
            </div>
          ))}
          <button onClick={addRow} className="w-full py-2 rounded-xl border border-dashed border-slate-200 text-xs text-slate-400 hover:border-blue-300 hover:text-blue-500 transition flex items-center justify-center gap-1">
            + Add Another Subject
          </button>
        </div>

        <div className="px-4 py-3 flex gap-2 border-t border-slate-100 bg-slate-50/50">
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
    subjectId:   row.subjectId,
    weeklyHours: row.weeklyHours ?? 1,
    isMandatory: row.isMandatory ?? false,
    status:      row.status === "ACTIVE" ? "ACTIVE" : "INACTIVE",
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-sm overflow-hidden animate-slideUp">
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3.5 flex items-center justify-between">
          <div>
            <p className="text-blue-200 text-[10px] font-medium uppercase tracking-widest">Edit Assignment</p>
            <h3 className="text-white font-semibold text-sm mt-0.5 truncate max-w-[240px]">{row.subjectName}</h3>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white text-sm w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/10">✕</button>
        </div>

        <div className="p-4 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Weekly Hours</label>
            <input type="number" min={1} max={40} value={form.weeklyHours}
              onChange={e => set("weeklyHours", Number(e.target.value))}
              className="border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-full" />
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => set("isMandatory", !form.isMandatory)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                form.isMandatory ? "bg-blue-50 border-blue-200 text-blue-700" : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
              Mandatory
            </button>
            <button type="button" onClick={() => set("status", form.status === "ACTIVE" ? "INACTIVE" : "ACTIVE")}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                form.status === "ACTIVE" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-400"
              }`}>
              {form.status === "ACTIVE" ? "Active" : "Inactive"}
            </button>
          </div>

          <div className="flex gap-2 pt-1 border-t border-slate-100 pt-3">
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
          <button onClick={onCancel} disabled={busy} className={`${BTN_GHOST} flex-1`}>Cancel</button>
          <button onClick={handleConfirm} disabled={busy} className="flex-1 px-4 py-1.5 text-xs rounded-lg bg-rose-500 text-white hover:bg-rose-600 font-medium disabled:opacity-50">
            {busy ? "Removing…" : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
//  Main Component Layout Block
// ─────────────────────────────────────────────────────────────────────────────
export default function SectionSubjectAssignment() {
  const [classes,   setClasses]   = useState([]);
  const [sections,  setSections]  = useState([]);
  const [subjects,  setSubjects]  = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);

  const [selectedClassId,   setSelectedClassId]   = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  const [classesLoading,  setClassesLoading]  = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(false);
  const [tableLoading,    setTableLoading]    = useState(false);

  const [filterStatus, setFilterStatus] = useState("all");
  const [search,       setSearch]       = useState("");

  const [editRow,    setEditRow]    = useState(null);
  const [showAssign, setShowAssign] = useState(false);
  const [confirmDg,  setConfirmDg]  = useState(null);

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
  }, [loadClasses]);

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
    message: `Remove "${row.subjectName}" from this section?`,
    onConfirm: async () => {
      const res = await SectionSubjectService.removeSubject(selectedSectionId, row.subjectId);
      if (res) setSubjects(prev => prev.filter(s => s.subjectId !== row.subjectId));
      setConfirmDg(null);
    },
  });

  const selectedClassName   = classes.find(c => String(c.id) === selectedClassId)?.name ?? "";
  const selectedSectionName = sections.find(s => String(s.id) === selectedSectionId)?.name ?? "";
  const assignedSubjectIds  = subjects.map(s => String(s.subjectId));

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
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-11 shrink-0">Class</span>
            <Select value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)} loading={classesLoading} className="flex-1">
              {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-[180px] min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-13 shrink-0">Section</span>
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
            <span className="truncate">{selectedClassName || "—"} / {selectedSectionName || "—"}</span>
            <Badge variant="count">{filteredSubjects.length}</Badge>
          </div>
          <button onClick={() => setShowAssign(true)} disabled={!selectedSectionId} className={BTN_PRIMARY}>
            <Plus size={12} /> <span>Assign Subjects</span>
          </button>
        </div>

        {/* Dense Inputs Searching Controls Block Frame */}
        <div className="flex flex-row items-center gap-2 px-4 py-1.5 border-b border-slate-100 bg-white shrink-0">
          <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="w-[115px] sm:w-[125px]">
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
          </Select>

          <div className="relative flex-1 max-w-[260px]">
            <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              value={search} onChange={e => setSearch(e.target.value)} placeholder="Search subject code..."
              className="w-full pl-7 pr-2.5 py-1 text-xs border border-gray-200 rounded-lg bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>
        </div>

        {/* ── HIGH DENSITY COMPACT MOBLLE, TABLET & LAPTOP CARDS SCREEN (< 1280px) ── */}
        <div className="xl:hidden flex-1 overflow-y-auto bg-slate-50/20 p-2 space-y-2 custom-scrollbar min-h-0">
          {tableLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-5 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredSubjects.length === 0 ? (
            <EmptyState message={!selectedSectionId ? "Select section to load details." : "No matching subject details located."} />
          ) : (
            filteredSubjects.map((row) => (
              <div key={row.id} className="bg-white rounded-xl border border-slate-100 p-2.5 shadow-xs flex flex-row items-center justify-between gap-3 h-auto fade-row">
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">{row.subjectName}</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <Badge variant="code">{row.subjectCode}</Badge>
                    <Badge variant="hours">{row.weeklyHours} hrs</Badge>
                    <Badge variant={row.isMandatory ? "mandatory" : "optional"}>{row.isMandatory ? "Mandatory" : "Optional"}</Badge>
                    <Badge variant={row.status === "ACTIVE" ? "active" : "inactive"}>{row.status === "ACTIVE" ? "Active" : "Inactive"}</Badge>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-1 shrink-0 justify-center">
                  <ActionButton label="Edit" icon={Edit} variant="blue" onClick={() => setEditRow(row)} />
                  <ActionButton label="Remove" icon={MinusCircle} variant="red" onClick={() => handleRemove(row)} />
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
                  {["Subject", "Code", "Weekly Hours", "Mandatory", "Status", "Actions"].map(h => (
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
                          <EmptyState message={!selectedSectionId ? "Select a section to view assignments." : "No records match search selection parameters."} />
                        </td>
                      </tr>
                    : filteredSubjects.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/40 transition-colors fade-row">
                          <td className="px-6 py-1.5 text-xs font-semibold text-slate-800 whitespace-nowrap">{row.subjectName}</td>
                          <td className="px-6 py-1.5 whitespace-nowrap"><Badge variant="code">{row.subjectCode}</Badge></td>
                          <td className="px-6 py-1.5 whitespace-nowrap"><Badge variant="hours">{row.weeklyHours} hrs</Badge></td>
                          <td className="px-6 py-1.5 whitespace-nowrap">
                            <Badge variant={row.isMandatory ? "mandatory" : "optional"}>{row.isMandatory ? "Mandatory" : "Optional"}</Badge>
                          </td>
                          <td className="px-6 py-1.5 whitespace-nowrap">
                            <Badge variant={row.status === "ACTIVE" ? "active" : "inactive"}>{row.status === "ACTIVE" ? "Active" : "Inactive"}</Badge>
                          </td>
                          <td className="px-6 py-1.5 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <ActionButton label="Edit" icon={Edit} variant="blue" onClick={() => setEditRow(row)} />
                              <ActionButton label="Remove" icon={MinusCircle} variant="red" onClick={() => handleRemove(row)} />
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