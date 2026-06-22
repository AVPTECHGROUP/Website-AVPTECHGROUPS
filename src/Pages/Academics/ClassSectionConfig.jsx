import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Search, ChevronDown,
  Eye, ArrowLeft, BookOpen, Users, Layers, AlertTriangle,
  GraduationCap, Hash, CheckCircle, SearchX, XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import ListLoader from '../../Components/CommonComp/ListLoader';
import TooltipComponent from '../../Components/CommonComp/Tooltip_comp/TooltipComp';
import {
  getAllClasses, createClass, updateClass, deleteClass,
  getSectionsByClass, createSection, updateSection, deleteSection,
  getTeachersDropdown,
} from '../../Api/ClassSectionAPI';
import { getCurrUserDetails } from '../../utils/GetCurrUserDetails';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getSchoolId = () => {
  try { return getCurrUserDetails()?.schoolId ?? null; }
  catch { return null; }
};

const GRADE_OPTIONS = [
  { value: 0, label: 'PG' },
  ...Array.from({ length: 12 }, (_, i) => ({ value: i + 1, label: `${i + 1}` })),
  { value: 13, label: 'Grade 13' },
  { value: 14, label: 'Grade 14' },
  { value: 15, label: 'Grade 15' },
];
const gradeLabelOf = (g) => GRADE_OPTIONS.find(o => o.value === g)?.label ?? `Grade ${g}`;

const GRADE_COLORS = [
  'bg-pink-50 text-pink-700',
  'bg-red-50 text-red-700',
  'bg-orange-50 text-orange-700',
  'bg-amber-50 text-amber-700',
  'bg-yellow-50 text-yellow-700',
  'bg-lime-50 text-lime-700',
  'bg-green-50 text-green-700',
  'bg-teal-50 text-teal-700',
  'bg-cyan-50 text-cyan-700',
  'bg-sky-50 text-sky-700',
  'bg-blue-50 text-blue-700',
  'bg-indigo-50 text-indigo-700',
  'bg-violet-50 text-violet-700',
  'bg-purple-50 text-purple-700',
  'bg-fuchsia-50 text-fuchsia-700',
  'bg-rose-50 text-rose-700',
];
const gradeColor = (g) => GRADE_COLORS[g % GRADE_COLORS.length];

const occupancyColor = (pct) => {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-green-500';
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${
    active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
  }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-700' : 'bg-gray-400'}`} />
    {active ? 'Active' : 'Inactive'}
  </span>
);

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteModal = ({ title, message, subMessage, onConfirm, onCancel, loading }) => (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
      <div className="px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
            {subMessage && <p className="text-xs text-gray-400 mt-1">{subMessage}</p>}
          </div>
        </div>
      </div>
      <div className="flex gap-3 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
        <button onClick={onCancel} disabled={loading}
          className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60">
          {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
          Confirm
        </button>
      </div>
    </div>
  </div>
);

// ─── Class Modal (Add / Edit) ─────────────────────────────────────────────────
const EMPTY_CLASS = { name: '', gradeLevel: '', description: '', displayOrder: '', status: 'ACTIVE' };

const ClassModal = ({ mode, initial, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_CLASS);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm({
        name:         initial.name         ?? '',
        gradeLevel:   initial.gradeLevel   ?? '',
        description:  initial.description  ?? '',
        displayOrder: initial.displayOrder ?? '',
        status:       initial.status       ?? 'ACTIVE',
      });
    } else {
      setForm(EMPTY_CLASS);
    }
  }, [mode, initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())           e.name       = 'Class name is required';
    if (form.name.trim().length > 50) e.name      = 'Max 50 characters';
    if (form.gradeLevel === '')       e.gradeLevel = 'Grade level is required';
    if (Number(form.gradeLevel) < 0 || Number(form.gradeLevel) > 15) e.gradeLevel = 'Must be 0–15';
    if (form.description && form.description.length > 500) e.description = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name:         form.name.trim(),
      gradeLevel:   Number(form.gradeLevel),
      description:  form.description?.trim() || null,
      displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : null,
      status:       form.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {mode === 'add' ? 'Add Class' : 'Edit Class'}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Class Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. Class X, Grade 5, LKG"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade Level <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}
                  className={`w-full appearance-none border rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.gradeLevel ? 'border-red-400' : 'border-gray-200'}`}>
                  <option value="">— Select grade —</option>
                  {GRADE_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              {errors.gradeLevel && <p className="text-xs text-red-500 mt-1">{errors.gradeLevel}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional notes about this class"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
            <div className="flex justify-between mt-1">
              {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
              <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)}
                placeholder="e.g. 10"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors">
            Cancel
          </button>
          <button type="button" onClick={(e) => handleSubmit(e)} disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {mode === 'add' ? 'Create Class' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Section Modal (Add / Edit) ───────────────────────────────────────────────
const EMPTY_SECTION = { name: '', roomNumber: '', capacity: '', classTeacherId: '', description: '', displayOrder: '', status: 'ACTIVE' };

const SectionModal = ({ mode, initial, classId, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_SECTION);
  const [errors, setErrors] = useState({});
  const [teachers, setTeachers] = useState([]);
  const [tLoading, setTLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setTLoading(true);
        const res = await getTeachersDropdown();
        setTeachers(res.data || []);
      } catch { /* teachers optional */ }
      finally { setTLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm({
        name:            initial.name            ?? '',
        roomNumber:      initial.roomNumber      ?? '',
        capacity:        initial.capacity        ?? '',
        classTeacherId:  initial.classTeacherId  ?? '',
        description:     initial.description     ?? '',
        displayOrder:    initial.displayOrder    ?? '',
        status:          initial.status          ?? 'ACTIVE',
      });
    } else {
      setForm(EMPTY_SECTION);
    }
  }, [mode, initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())               e.name     = 'Section name is required';
    if (form.name.trim().length > 50)   e.name     = 'Max 50 characters';
    if (form.capacity !== '' && Number(form.capacity) < 1) e.capacity = 'Must be ≥ 1';
    if (form.description && form.description.length > 500) e.description = 'Max 500 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      classId,
      name:           form.name.trim(),
      roomNumber:     form.roomNumber?.trim() || null,
      capacity:       form.capacity !== '' ? Number(form.capacity) : null,
      classTeacherId: form.classTeacherId !== '' ? Number(form.classTeacherId) : null,
      description:    form.description?.trim() || null,
      displayOrder:   form.displayOrder !== '' ? Number(form.displayOrder) : null,
      status:         form.status,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-gray-900">
              {mode === 'add' ? 'Add Section' : 'Edit Section'}
            </h2>
          </div>
          <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Section Name <span className="text-red-500">*</span>
              </label>
              <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                placeholder="e.g. A, B, Science"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Room Number</label>
              <input type="text" value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)}
                placeholder="e.g. 101, Lab-3"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
              <input type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                placeholder="Max students"
                className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.capacity ? 'border-red-400' : 'border-gray-200'}`} />
              {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Teacher</label>
              <div className="relative">
                <select value={form.classTeacherId} onChange={e => set('classTeacherId', e.target.value)}
                  disabled={tLoading}
                  className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 disabled:bg-gray-50">
                  <option value="">— {tLoading ? 'Loading...' : 'No teacher assigned'} —</option>
                  {teachers.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.fullName}{t.employeeCode ? ` (${t.employeeCode})` : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Optional notes"
              className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
            <div className="flex justify-between mt-1">
              {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
              <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)}
                placeholder="e.g. 1"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <div className="relative">
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400">
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        </form>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button type="button" onClick={onClose} disabled={loading}
            className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60">
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {mode === 'add' ? 'Create Section' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function ClassSectionConfig() {
  const schoolId = getSchoolId();

  const [view, setView] = useState('classes'); 
  const [selectedClass, setSelectedClass] = useState(null);

  const [classes, setClasses] = useState([]);
  const [classLoading, setClassLoading] = useState(false);
  const [classSearch, setClassSearch] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [classStatus, setClassStatus] = useState('');

  const [sections, setSections] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionSearch, setSectionSearch] = useState('');
  const [sectionStatus, setSectionStatus] = useState('');

  const [classModal, setClassModal] = useState(null);   
  const [sectionModal, setSectionModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null); 
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchClasses = useCallback(async (search = classSearch, grade = classGrade, status = classStatus) => {
    if (!schoolId) { toast.error('School ID not found — please re-login'); return; }
    try {
      setClassLoading(true);
      const res = await getAllClasses(schoolId, { search, gradeLevel: grade, status });
      setClasses(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load classes');
    } finally {
      setClassLoading(false);
    }
  }, [schoolId, classSearch, classGrade, classStatus]);

  useEffect(() => { fetchClasses(); }, []);

  const fetchSections = useCallback(async (classIdParam, status = sectionStatus) => {
    const cid = classIdParam ?? selectedClass?.id;
    if (!cid) return;
    try {
      setSectionLoading(true);
      const res = await getSectionsByClass(cid, status || undefined);
      setSections(res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to load sections');
    } finally {
      setSectionLoading(false);
    }
  }, [selectedClass, sectionStatus]);

  const openSections = (cls) => {
    setSelectedClass(cls);
    setSectionSearch('');
    setSectionStatus('');
    setView('sections');
    fetchSections(cls.id, '');
  };

  const handleClassSubmit = async (payload) => {
    try {
      setSubmitLoading(true);
      if (classModal.mode === 'add') {
        await createClass({ ...payload, schoolId });
        toast.success(`${payload.name} created successfully`);
      } else {
        await updateClass(classModal.data.id, { ...payload, schoolId });
        toast.success(`${payload.name} updated successfully`);
      }
      setClassModal(null);
      await fetchClasses();
    } catch (err) {
      toast.error(err.message || 'Failed to save class');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSectionSubmit = async (payload) => {
    try {
      setSubmitLoading(true);
      if (sectionModal.mode === 'add') {
        await createSection(payload);
        toast.success(`Section ${payload.name} created successfully`);

        const updatedClass = {
          ...selectedClass,
          totalSections: (selectedClass?.totalSections ?? 0) + 1,
        };
        setSelectedClass(updatedClass);
        setClasses(prev =>
          prev.map(c => (c.id === updatedClass.id ? updatedClass : c))
        );
      } else {
        await updateSection(sectionModal.data.id, payload);
        toast.success(`Section ${payload.name} updated successfully`);
      }
      setSectionModal(null);
      await fetchSections(selectedClass?.id);
    } catch (err) {
      toast.error(err.message || 'Failed to save section');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    try {
      setDeleteLoading(true);
      if (type === 'class') {
        await deleteClass(item.id);
        toast.success(`${item.name} status processed successfully`);
        setDeleteTarget(null);
        await fetchClasses();
      } else {
        await deleteSection(item.id);
        toast.success(`Section ${item.name} deleted successfully`);

        const updatedClass = {
          ...selectedClass,
          totalSections: Math.max((selectedClass?.totalSections ?? 1) - 1, 0),
        };
        setSelectedClass(updatedClass);
        setClasses(prev =>
          prev.map(c => (c.id === updatedClass.id ? updatedClass : c))
        );

        setDeleteTarget(null);
        await fetchSections(selectedClass?.id);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to proceed');
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalClasses   = classes.length;
  const activeClasses  = classes.filter(c => c.status === 'ACTIVE').length;
  const totalSections  = classes.reduce((s, c) => s + (c.totalSections || 0), 0);
  const gradeLevels    = classes.map(c => c.gradeLevel).filter(g => g !== null && g !== undefined);
  const gradeRange     = gradeLevels.length
    ? `${gradeLabelOf(Math.min(...gradeLevels))} – ${gradeLabelOf(Math.max(...gradeLevels))}`
    : '—';

  const totalCapacity   = sections.reduce((s, sec) => s + (sec.capacity || 0), 0);
  const totalEnrolled   = sections.reduce((s, sec) => s + (sec.currentStrength || 0), 0);
  const occupancyPct    = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  const filteredSections = sections.filter(sec => {
    if (!sectionSearch) return true;
    const q = sectionSearch.toLowerCase();
    return (sec.name?.toLowerCase().includes(q) || sec.roomNumber?.toLowerCase().includes(q));
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // PANEL 1 — CLASSES
  // ═══════════════════════════════════════════════════════════════════════════
  if (view === 'classes') {
    const classStatsCards = [
      { IconName: BookOpen,      keyName: 'Total Classes',    val: totalClasses,    iconTxColor: 'text-blue-600',   iconBgColor: 'bg-blue-50'   },
      { IconName: CheckCircle,  keyName: 'Active Classes',   val: activeClasses,   iconTxColor: 'text-green-600',  iconBgColor: 'bg-green-50'  },
      { IconName: Layers,        keyName: 'Total Sections',   val: totalSections,   iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
      { IconName: GraduationCap, keyName: 'Grade Range',      val: gradeRange,      iconTxColor: 'text-orange-400', iconBgColor: 'bg-orange-50'  },
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4 xl:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Class & Section Configuration</h1>
            <p className="text-sm text-gray-500 mt-1">Manage classes and their sections for your school</p>
          </div>
          <button
            onClick={() => setClassModal({ mode: 'add' })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Class
          </button>
        </div>

        {/* Stats - Shifted grid layout to xl for wider views to prevent compression at 1024px */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {classStatsCards.map((card, i) => <CardComponent key={i} {...card} />)}
        </div>

        {/* Table panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Filter bar */}
          <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                type="text"
                value={classSearch}
                onChange={e => setClassSearch(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fetchClasses(classSearch, classGrade, classStatus)}
                placeholder="Search by class name..."
                className="text-sm focus:outline-none bg-transparent w-full text-gray-700"
              />
            </div>
            <div className="relative">
              <select
                value={classGrade}
                onChange={e => { setClassGrade(e.target.value); fetchClasses(classSearch, e.target.value, classStatus); }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
              >
                <option value="">All Grades</option>
                {GRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={classStatus}
                onChange={e => { setClassStatus(e.target.value); fetchClasses(classSearch, classGrade, e.target.value); }}
                className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
              >
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <button
              onClick={() => fetchClasses(classSearch, classGrade, classStatus)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>

          {/* Desktop table - Added explicit horizontal overflow safety wrapper */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-130 w-full">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr className="text-sm">
                  <th className="px-4 xl:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">#</th>
                  <th className="px-4 xl:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Class Name</th>
                  <th className="px-4 xl:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Grade</th>
                  {/* Pushed to xl breakpoint to give action column room on laptop view grids */}
                  <th className="px-4 xl:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide hidden xl:table-cell">Description</th>
                  <th className="px-4 xl:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Sections</th>
                  <th className="px-4 xl:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                  <th className="px-4 xl:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {classLoading && <ListLoader avatar={false} />}

                {!classLoading && classes.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <SearchX className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">No classes found</p>
                        <p className="text-xs text-gray-400">Click <span className="font-medium text-blue-500">"Add Class"</span> to create your first class</p>
                      </div>
                    </td>
                  </tr>
                )}

                {!classLoading && classes.map((cls, idx) => (
                  <tr key={cls.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-4 xl:px-6 py-4 text-gray-500">{idx + 1}</td>
                    <td className="px-4 xl:px-6 py-4">
                      <p className="font-semibold text-gray-900">{cls.name}</p>
                    </td>
                    <td className="px-4 xl:px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${gradeColor(cls.gradeLevel)}`}>
                        {gradeLabelOf(cls.gradeLevel)}
                      </span>
                    </td>
                    <td className="px-4 xl:px-6 py-4 text-center hidden xl:table-cell">
                      <p className="text-gray-500 truncate max-w-[220px] mx-auto">{cls.description || '—'}</p>
                    </td>
                    
                    <td className="px-4 xl:px-6 py-4 text-center">
                      <button
                        onClick={() => openSections(cls)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/50 text-xs font-semibold hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Sections ({cls.totalSections ?? 0})</span>
                      </button>
                    </td>

                    <td className="px-4 xl:px-6 py-4 text-center">
                      <StatusBadge active={cls.status === 'ACTIVE'} />
                    </td>

                    <td className="px-4 xl:px-6 py-4">
                      <div className="flex items-center justify-center gap-3.5 font-bold text-xs whitespace-nowrap">
                        <button 
                          onClick={() => openSections(cls)}
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> View
                        </button>
                        <button 
                          onClick={() => setClassModal({ mode: 'edit', data: cls })}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Edit
                        </button>
                        {cls.status !== 'INACTIVE' && (
                          <button 
                            onClick={() => setDeleteTarget({ type: 'class', item: cls })}
                            className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Inactive
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards View */}
          <div className="md:hidden">
            {classLoading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
              </div>
            )}
            {!classLoading && classes.length === 0 && (
              <div className="py-16 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                    <SearchX className="w-6 h-6 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">No classes found</p>
                </div>
              </div>
            )}
            {!classLoading && classes.length > 0 && (
              <div className="divide-y divide-gray-200">
                {classes.map((cls) => (
                  <div key={cls.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1 pr-3">
                        <p className="font-semibold text-gray-900 text-sm">{cls.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${gradeColor(cls.gradeLevel)}`}>
                          {gradeLabelOf(cls.gradeLevel)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs font-bold">
                        <button onClick={() => openSections(cls)} className="text-indigo-600">View</button>
                        <button onClick={() => setClassModal({ mode: 'edit', data: cls })} className="text-blue-600">Edit</button>
                        {cls.status !== 'INACTIVE' && (
                          <button onClick={() => setDeleteTarget({ type: 'class', item: cls })} className="text-red-500">Inactive</button>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-2">
                      <button
                        onClick={() => openSections(cls)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-semibold"
                      >
                        <Plus className="w-3 h-3" /> Add Sections ({cls.totalSections ?? 0})
                      </button>
                      <StatusBadge active={cls.status === 'ACTIVE'} />
                    </div>
                    {cls.description && <p className="text-xs text-gray-400 mt-2 line-clamp-1">{cls.description}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {classModal && (
          <ClassModal
            mode={classModal.mode}
            initial={classModal.data || null}
            onSubmit={handleClassSubmit}
            onClose={() => setClassModal(null)}
            loading={submitLoading}
          />
        )}

        {deleteTarget?.type === 'class' && (
          <DeleteModal
            title="Move to Inactive"
            message={`Are you sure you want to mark "${deleteTarget.item.name}" as Inactive?`}
            subMessage="This configuration won't be displayed on operational workflows."
            onConfirm={handleDeleteConfirm}
            onCancel={() => setDeleteTarget(null)}
            loading={deleteLoading}
          />
        )}
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PANEL 2 — SECTIONS
  // ═══════════════════════════════════════════════════════════════════════════
  const sectionStatsCards = [
    { IconName: Layers,   keyName: 'Sections',         val: sections.length, iconTxColor: 'text-blue-600',   iconBgColor: 'bg-blue-50'   },
    { IconName: Users,    keyName: 'Total Capacity',   val: totalCapacity,   iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
    { IconName: Users,    keyName: 'Enrolled',         val: totalEnrolled,   iconTxColor: 'text-green-600',  iconBgColor: 'bg-green-50'  },
    { IconName: Hash,     keyName: 'Occupancy',        val: `${occupancyPct}%`, iconTxColor: totalCapacity === 0 ? 'text-gray-400' : occupancyPct >= 90 ? 'text-red-600' : occupancyPct >= 70 ? 'text-amber-600' : 'text-green-600', iconBgColor: totalCapacity === 0 ? 'bg-gray-50' : occupancyPct >= 90 ? 'bg-red-50' : occupancyPct >= 70 ? 'bg-amber-50' : 'bg-green-50' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 xl:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setView('classes'); setSelectedClass(null); setSections([]); }}
            className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">{selectedClass?.name}</h1>
              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${gradeColor(selectedClass?.gradeLevel)}`}>
                {gradeLabelOf(selectedClass?.gradeLevel)}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Sections Configuration</p>
          </div>
        </div>
        <button
          onClick={() => setSectionModal({ mode: 'add' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Section
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {sectionStatsCards.map((card, i) => <CardComponent key={i} {...card} />)}
      </div>

      {/* Table panel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Filter bar */}
        <div className="px-4 xl:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
            <Search className="w-4 h-4 text-gray-400 shrink-0" />
            <input
              type="text"
              value={sectionSearch}
              onChange={e => setSectionSearch(e.target.value)}
              placeholder="Search by section name or room..."
              className="text-sm focus:outline-none bg-transparent w-full text-gray-700"
            />
          </div>
          <div className="relative">
            <select
              value={sectionStatus}
              onChange={e => { setSectionStatus(e.target.value); fetchSections(selectedClass?.id, e.target.value || undefined); }}
              className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
            >
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Desktop table - Added dynamic column hiding for teacher name up to xl screens */}
        <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-130 w-full">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr className="text-sm">
                <th className="px-4 lg:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">#</th>
                <th className="px-4 lg:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">Section</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Room</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Capacity / Enrolled</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide hidden xl:table-cell">Class Teacher</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Status</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sectionLoading && <ListLoader avatar={false} />}

              {!sectionLoading && filteredSections.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                        <SearchX className="w-6 h-6 text-blue-500" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700">No sections found</p>
                      <p className="text-xs text-gray-400">Click <span className="font-medium text-blue-500">"Add Section"</span> to create the first section</p>
                    </div>
                  </td>
                </tr>
              )}

              {!sectionLoading && filteredSections.map((sec, idx) => {
                const cap = sec.capacity || 0;
                const enr = sec.currentStrength || 0;
                const pct = cap > 0 ? Math.round((enr / cap) * 100) : 0;
                return (
                  <tr key={sec.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 lg:px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                    <td className="px-4 lg:px-6 py-4">
                      <p className="font-semibold text-gray-900 text-sm">{sec.name}</p>
                      {sec.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{sec.description}</p>}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      {sec.roomNumber
                        ? <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">{sec.roomNumber}</span>
                        : <span className="text-gray-400 text-sm">—</span>
                      }
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      {cap > 0 ? (
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-medium text-gray-700">{enr} / {cap}</span>
                          <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${occupancyColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={`text-xs font-medium ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}`}>{pct}%</span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">{enr} / —</span>
                      )}
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center hidden xl:table-cell">
                      <p className="text-sm text-gray-600">
                        {sec.classTeacherName || <span className="text-gray-400 italic text-xs">No teacher assigned</span>}
                      </p>
                    </td>
                    <td className="px-4 lg:px-6 py-4 text-center">
                      <StatusBadge active={sec.status === 'ACTIVE'} />
                    </td>
                    <td className="px-4 lg:px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => setSectionModal({ mode: 'edit', data: sec })}
                          className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 className="w-4 lg:w-5 h-4 lg:h-5 text-blue-600" />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'section', item: sec })}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 className="w-4 lg:w-5 h-4 lg:h-5 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden">
          {sectionLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          )}
          {!sectionLoading && filteredSections.length === 0 && (
            <div className="py-16 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                  <SearchX className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-sm font-semibold text-gray-700">No sections found</p>
              </div>
            </div>
          )}
          {!sectionLoading && filteredSections.length > 0 && (
            <div className="divide-y divide-gray-200">
              {filteredSections.map(sec => {
                const cap = sec.capacity || 0;
                const enr = sec.currentStrength || 0;
                const pct = cap > 0 ? Math.round((enr / cap) * 100) : 0;
                return (
                  <div key={sec.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{sec.name}</p>
                        {sec.roomNumber && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs font-medium mt-1">{sec.roomNumber}</span>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setSectionModal({ mode: 'edit', data: sec })} className="p-1.5 hover:bg-blue-50 rounded-lg">
                          <Edit2 className="w-4 h-4 text-blue-600" />
                        </button>
                        <button onClick={() => setDeleteTarget({ type: 'section', item: sec })} className="p-1.5 hover:bg-red-50 rounded-lg">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                      {cap > 0 && (
                        <div className="flex items-center gap-1.5">
                          <span>{enr}/{cap}</span>
                          <div className="w-14 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${occupancyColor(pct)}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                          <span className={pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-amber-600' : 'text-green-600'}>{pct}%</span>
                        </div>
                      )}
                      <StatusBadge active={sec.status === 'ACTIVE'} />
                    </div>
                    {!sec.classTeacherName && <p className="text-xs text-gray-400 italic mt-1">No teacher assigned</p>}
                    {sec.classTeacherName && <p className="text-xs text-gray-500 mt-1">Teacher: {sec.classTeacherName}</p>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {sectionModal && (
        <SectionModal
          mode={sectionModal.mode}
          initial={sectionModal.data || null}
          classId={selectedClass?.id}
          onSubmit={handleSectionSubmit}
          onClose={() => setSectionModal(null)}
          loading={submitLoading}
        />
      )}

      {deleteTarget?.type === 'section' && (
        <DeleteModal
          title="Delete Section"
          message={`Are you sure you want to delete Section "${deleteTarget.item.name}"?`}
          subMessage={`This will fail if students are currently enrolled (${deleteTarget.item.currentStrength || 0} enrolled).`}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  );
}