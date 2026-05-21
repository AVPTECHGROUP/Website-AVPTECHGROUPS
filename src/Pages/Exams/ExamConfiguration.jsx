import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  BookOpen,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";

import {
  getGradeConfigs,
  createGradeConfig,
  updateGradeConfig,
  deleteGradeConfig,
} from "../../Api/Exams";

import {
  getExamTypes,
  createExamType,
  updateExamType,
  activateExamType,
  deactivateExamType,
} from "../../Api/Exams";
import { toast } from "react-toastify";

// ─── Grade colour helper ──────────────────────────────────────────────────────
const gradeStyle = (g = "") => {
  const map = {
    "A+": "bg-green-100 text-green-700",
    A: "bg-emerald-100 text-emerald-700",
    "B+": "bg-blue-100 text-blue-700",
    B: "bg-indigo-100 text-indigo-700",
    C: "bg-yellow-100 text-yellow-700",
    D: "bg-orange-100 text-orange-700",
    F: "bg-red-100 text-red-700",
  };
  return map[g] || "bg-gray-100 text-gray-700";
};
const Field = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  multiline = false,
}) => (
  <div>
    <label className="block text-xs font-semibold text-gray-600 mb-1">
      {label}<span className="text-red-500 ml-0.5">*</span>
    </label>

    {multiline ? (
      <textarea
        rows={3}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none
        ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
      />
    ) : (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400
        ${error ? "border-red-400 bg-red-50" : "border-gray-200 bg-gray-50"}`}
      />
    )}

    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
);
// ─── Confirm Delete Modal ─────────────────────────────────────────────────────
const ConfirmModal = ({ onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="bg-red-100 p-2 rounded-full"><AlertTriangle className="h-5 w-5 text-red-600" /></div>
        <h3 className="text-base font-semibold text-gray-800">Confirm Delete</h3>
      </div>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this record? This action cannot be undone.</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer transition flex items-center gap-2 disabled:opacity-60">
          {loading && <Loader2 className="h-4 w-4 animate-spin" />} Delete
        </button>
      </div>
    </div>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// GRADE CONFIG TAB
// ═══════════════════════════════════════════════════════════════════════════════
const GRADE_INIT = { gradeName: "", minPercentage: "", maxPercentage: "", description: "" };

const GradeConfigTab = () => {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(GRADE_INIT);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState({});

  const fetchGrades = useCallback(async () => {
    setLoading(true);
    try { setGrades(await getGradeConfigs()); }
    catch { toast.error("Failed to load grade configs"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchGrades(); }, [fetchGrades]);

  const openAdd = () => { setEditItem(null); setForm(GRADE_INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (g) => { setEditItem(g); setForm({ gradeName: g.gradeName, minPercentage: g.minPercentage, maxPercentage: g.maxPercentage, description: g.description }); setErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setForm(GRADE_INIT); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.gradeName.trim()) e.gradeName = "Grade name is required";
    if (form.minPercentage === "" || form.minPercentage < 0 || form.minPercentage > 100) e.minPercentage = "Enter valid min % (0-100)";
    if (form.maxPercentage === "" || form.maxPercentage < 0 || form.maxPercentage > 100) e.maxPercentage = "Enter valid max % (0-100)";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { gradeName: form.gradeName, minPercentage: Number(form.minPercentage), maxPercentage: Number(form.maxPercentage), description: form.description };
      if (editItem) await updateGradeConfig(editItem.id, payload);
      else await createGradeConfig(payload);
      toast.success(
        editItem
          ? "Grade updated successfully!"
          : "Grade created successfully!"
      );
      closeModal();
      fetchGrades();
    } catch { toast.error("Operation failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await deleteGradeConfig(deleteTarget.id); toast.success("Grade deleted successfully!"); setDeleteTarget(null); fetchGrades(); }
    catch { toast.error("Delete failed. Please try again."); }
    finally { setDeleting(false); }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold text-gray-700">Grading Scale Configuration</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition cursor-pointer shadow-sm self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Grade Band
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Grade</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Min %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Max %</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <ListLoader rows={4} avatar={true} colSpanSet={6} />
            ) : grades.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">No grade bands configured yet.</td></tr>
            ) : (
              grades.map((g) => (
                <tr key={g.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-bold ${gradeStyle(g.gradeName)}`}>
                      {g.gradeName}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{Number(g.minPercentage).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-700 font-medium">{Number(g.maxPercentage).toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{g.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${g.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {g.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropDownComp
                      onAction={(val) => { if (val === "edit") openEdit(g); if (val === "delete") setDeleteTarget(g); }}
                      actionOptions={[
                        { label: "Delete", value: "delete", icon: Trash2, bg: "bg-red-50", text: "text-red-600", hover: "hover:bg-red-100" },
                        { label: "Edit", value: "edit", icon: Pencil, bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-100" },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">{editItem ? "Edit Grade Band" : "Add Grade Band"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 cursor-pointer transition"><X className="h-5 w-5" /></button>
            </div>
            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              <Field
                label="Grade Name"
                placeholder="Enter grade name"
                value={form.gradeName}
                onChange={(e) => setForm(p => ({ ...p, gradeName: e.target.value }))}
                error={errors.gradeName}
              />
              <div className="grid grid-cols-2 gap-4">
                <Field
                  label="Min Percentage"
                  type="number"
                  placeholder='0'
                  value={form.minPercentage}
                  onChange={(e) => setForm(p => ({ ...p, minPercentage: e.target.value }))}
                  error={errors.minPercentage}
                />
                <Field
                  label="Max Percentage"
                  type="number"
                  placeholder='100'
                  value={form.maxPercentage}
                  onChange={(e) => setForm(p => ({ ...p, maxPercentage: e.target.value }))}
                  error={errors.maxPercentage}
                />
              </div>
              <Field
                label="Description"
                placeholder="Enter grade description"
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                error={errors.description}
              />
            </div>
            {/* Modal Footer */}
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer transition flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editItem ? "Update" : "Add Grade Band"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && <ConfirmModal onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}

    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// EXAM TYPE TAB
// ═══════════════════════════════════════════════════════════════════════════════
const ET_INIT = { name: "", description: "" };

const ExamTypeTab = () => {
  const [examTypes, setExamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(ET_INIT);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(null);
  
  const [errors, setErrors] = useState({});


  const fetchTypes = useCallback(async () => {
    setLoading(true);
    try { setExamTypes(await getExamTypes()); }
    catch { toast.error("Failed to load exam types"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTypes(); }, [fetchTypes]);

  const openAdd = () => { setEditItem(null); setForm(ET_INIT); setErrors({}); setModalOpen(true); };
  const openEdit = (t) => { setEditItem(t); setForm({ name: t.name, description: t.description }); setErrors({}); setModalOpen(true); };
  const closeModal = () => { setModalOpen(false); setEditItem(null); setForm(ET_INIT); setErrors({}); };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Exam type name is required";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (editItem) await updateExamType(editItem.id, form);
      else await createExamType(form);
      toast.success(
        editItem
          ? "Exam type updated!"
          : "Exam type created!"
      );
      closeModal();
      fetchTypes();
    } catch { toast.error("Operation failed. Please try again."); }
    finally { setSaving(false); }
  };

  const handleToggle = async (t) => {
    setToggling(t.id);
    try {
      if (t.isActive) await deactivateExamType(t.id);
      else await activateExamType(t.id);
      toast.success(
        `Exam type ${t.isActive ? "deactivated" : "activated"} successfully!`
      );
      fetchTypes();
    } catch { toast.error("Status update failed."); }
    finally { setToggling(null); }
  };
  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="text-base font-semibold text-gray-700">Exam Types Master</h2>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition cursor-pointer shadow-sm self-start sm:self-auto">
          <Plus className="h-4 w-4" /> Add Exam Type
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide w-12">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Description</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <ListLoader rows={4} avatar={false} colSpanSet={5} />
            ) : examTypes.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-gray-400 text-sm">No exam types configured yet.</td></tr>
            ) : (
              examTypes.map((t, idx) => (
                <tr key={t.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 text-gray-800 font-semibold">{t.name}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{t.description}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${t.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {t.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <ActionDropDownComp
                      onAction={(val) => {
                        if (val === "edit") openEdit(t);
                        if (val === "toggle") handleToggle(t);
                      }}
                      actionOptions={[
                        {
                          label: toggling === t.id ? "..." : (t.isActive ? "Deactivate" : "Activate"),
                          value: "toggle",
                          icon: t.isActive ? ToggleRight : ToggleLeft,
                          bg: t.isActive ? "bg-orange-50" : "bg-green-50",
                          text: t.isActive ? "text-orange-600" : "text-green-600",
                          hover: t.isActive ? "hover:bg-orange-100" : "hover:bg-green-100",
                          disabled: toggling === t.id,
                        },
                        { label: "Edit", value: "edit", icon: Pencil, bg: "bg-blue-50", text: "text-blue-600", hover: "hover:bg-blue-100" },
                      ]}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-800">{editItem ? "Edit Exam Type" : "Add Exam Type"}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 cursor-pointer transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <Field
                label="Exam Type Name"
                value={form.name}
                onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                error={errors.name}
              />

              <Field
                label="Description"
                multiline
                value={form.description}
                onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))}
                error={errors.description}
              />
            </div>
            <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
              <button onClick={closeModal} className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 cursor-pointer transition flex items-center gap-2 disabled:opacity-60">
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editItem ? "Update" : "Add Exam Type"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TABS = [
  { key: "grade", label: "Grade Config", icon: BookOpen },
  { key: "exam", label: "Exam Type", icon: ClipboardList },
];

export default function ExamConfiguration() {
  const [activeTab, setActiveTab] = useState("grade");

  return (
    <div className="min-h-screen bg-gray-50/70 p-3 sm:p-5 lg:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Exam Configuration</h1>
          <p className="text-sm text-gray-400 mt-1">Manage grading scales and exam type definitions</p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 w-fit mb-6 shadow-sm">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                ${activeTab === key
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden xs:inline sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6">
          {activeTab === "grade" ? <GradeConfigTab /> : <ExamTypeTab />}
        </div>

      </div>
    </div>
  );
}