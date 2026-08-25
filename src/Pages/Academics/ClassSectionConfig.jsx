import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit2, Trash2, RefreshCw, X, Search, ChevronDown,
  Eye, ArrowLeft, BookOpen, Users, Layers, AlertTriangle,
  GraduationCap, Hash, CheckCircle, SearchX, XCircle,
  AlignLeft, ListOrdered, LayoutGrid
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
} from '../../Api/Academics/ClassSectionAPI';
import {getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";
import { CLASS_SEC_CONSTS, COMMON_STATUS } from "../../Constants/StringConstants/AcademicsConstants";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const getSchoolId = () => {
  try { return getCurrUserDetails()?.schoolId ?? null; }
  catch { return null; }
};

const gradeLabelOf = (g) => CLASS_SEC_CONSTS.GRADE_OPTIONS.find(o => o.value === g)?.label ?? `Grade ${g}`;
const gradeColor = (g) => CLASS_SEC_CONSTS.GRADE_COLORS[g % CLASS_SEC_CONSTS.GRADE_COLORS.length];

const occupancyColor = (pct) => {
  if (pct >= 90) return 'bg-red-500';
  if (pct >= 70) return 'bg-amber-500';
  return 'bg-green-500';
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ active }) => (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'
    }`}>
    <span className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-green-700' : 'bg-gray-400'}`} />
      {active ? CLASS_SEC_CONSTS.TEXT.ACTIVE : CLASS_SEC_CONSTS.TEXT.INACTIVE}
  </span>
);

// ─── Class Detail View Modal ──────────────────────────────────────────────────
const ClassDetailModal = ({ cls, onClose, onEdit, onInactive, onManageSections }) => {
  if (!cls) return null;
  return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <BookOpen className="w-4.5 h-4.5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">{cls.name}</h2>
                <p className="text-xs text-gray-400">{CLASS_SEC_CONSTS.TEXT.CLASS_DETAILS}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${gradeColor(cls.gradeLevel)}`}>
              {gradeLabelOf(cls.gradeLevel)}
            </span>
              <StatusBadge active={cls.status === COMMON_STATUS.ACTIVE} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{CLASS_SEC_CONSTS.TEXT.TOTAL_SECTIONS}</p>
                <p className="text-2xl font-bold text-gray-900">{cls.totalSections ?? 0}</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{CLASS_SEC_CONSTS.TEXT.DISPLAY_ORDER}</p>
                <p className="text-2xl font-bold text-gray-900">
                  {cls.displayOrder != null ? cls.displayOrder : <span className="text-gray-400 text-sm font-normal">{CLASS_SEC_CONSTS.TEXT.FALLBACK_DASH}</span>}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl px-4 py-3">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">{CLASS_SEC_CONSTS.TEXT.DESCRIPTION}</p>
              {cls.description
                  ? <p className="text-sm text-gray-700 leading-relaxed">{cls.description}</p>
                  : <p className="text-sm text-gray-400 italic">{CLASS_SEC_CONSTS.TEXT.NO_DESC}</p>
              }
            </div>

            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl">
              <GraduationCap className="w-4 h-4 text-gray-400 shrink-0" />
              <div>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{CLASS_SEC_CONSTS.TEXT.GRADE_LEVEL}</p>
                <p className="text-sm font-semibold text-gray-800 mt-0.5">
                  {gradeLabelOf(cls.gradeLevel)}
                  <span className="text-gray-400 font-normal text-xs ml-1">{CLASS_SEC_CONSTS.TEXT.LEVEL_PREFIX}{cls.gradeLevel}{CLASS_SEC_CONSTS.TEXT.LEVEL_SUFFIX}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button
                onClick={() => { onClose(); onManageSections(cls); }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold text-sm transition-colors cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              {CLASS_SEC_CONSTS.TEXT.MANAGE_SECTIONS}
            </button>

            <div className="flex items-center gap-2">
              {cls.status !== COMMON_STATUS.INACTIVE && (
                  <button
                      onClick={() => { onClose(); onInactive(cls); }}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 font-semibold text-sm transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" /> {CLASS_SEC_CONSTS.TEXT.INACTIVE}
                  </button>
              )}
              <button
                  onClick={() => { onClose(); onEdit(cls); }}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-semibold text-sm transition-colors cursor-pointer"
              >
                <Edit2 className="w-4 h-4" /> {CLASS_SEC_CONSTS.TEXT.EDIT}
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

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
                  className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
            {CLASS_SEC_CONSTS.TEXT.CANCEL}
          </button>
          <button onClick={onConfirm} disabled={loading}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer">
            {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
            {CLASS_SEC_CONSTS.TEXT.CONFIRM}
          </button>
        </div>
      </div>
    </div>
);

// ─── Class Modal (Add / Edit) ─────────────────────────────────────────────────
const EMPTY_CLASS = { name: '', gradeLevel: '', description: '', displayOrder: '', status: COMMON_STATUS.ACTIVE };

const ClassModal = ({ mode, initial, onSubmit, onClose, loading }) => {
  const [form, setForm] = useState(EMPTY_CLASS);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (mode === 'edit' && initial) {
      setForm({
        name: initial.name ?? '',
        gradeLevel: initial.gradeLevel ?? '',
        description: initial.description ?? '',
        displayOrder: initial.displayOrder ?? '',
        status: initial.status ?? COMMON_STATUS.ACTIVE,
      });
    } else {
      setForm(EMPTY_CLASS);
    }
  }, [mode, initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = CLASS_SEC_CONSTS.VALIDATION.CLASS_NAME_REQ;
    if (form.name.trim().length > 50) e.name = CLASS_SEC_CONSTS.VALIDATION.MAX_50;
    if (form.gradeLevel === '') e.gradeLevel = CLASS_SEC_CONSTS.VALIDATION.GRADE_REQ;
    if (Number(form.gradeLevel) < 0 || Number(form.gradeLevel) > 15) e.gradeLevel = CLASS_SEC_CONSTS.VALIDATION.GRADE_RANGE;
    if (form.description && form.description.length > 500) e.description = CLASS_SEC_CONSTS.VALIDATION.MAX_500;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      name: form.name.trim(),
      gradeLevel: Number(form.gradeLevel),
      description: form.description?.trim() || null,
      displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : null,
      status: form.status,
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
                {mode === 'add' ? CLASS_SEC_CONSTS.TEXT.ADD_CLASS : CLASS_SEC_CONSTS.TEXT.EDIT_CLASS}
              </h2>
            </div>
            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {CLASS_SEC_CONSTS.TEXT.CLASS_NAME} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_CLASS_NAME}
                       className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {CLASS_SEC_CONSTS.TEXT.GRADE_LEVEL} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select value={form.gradeLevel} onChange={e => set('gradeLevel', e.target.value)}
                          className={`w-full appearance-none border rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.gradeLevel ? 'border-red-400' : 'border-gray-200'}`}>
                    <option value="">{CLASS_SEC_CONSTS.TEXT.SELECT_GRADE}</option>
                    {CLASS_SEC_CONSTS.GRADE_OPTIONS.map(o => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                {errors.gradeLevel && <p className="text-xs text-red-500 mt-1">{errors.gradeLevel}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.DESCRIPTION}</label>
              <textarea rows={3} value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder={CLASS_SEC_CONSTS.TEXT.PH_CLASS_DESC}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
                <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.DISPLAY_ORDER}</label>
                <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_ORDER_CLASS}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.STATUS}</label>
                <div className="relative">
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                          className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400">
                    <option value={COMMON_STATUS.ACTIVE}>{CLASS_SEC_CONSTS.TEXT.ACTIVE}</option>
                    <option value={COMMON_STATUS.INACTIVE}>{CLASS_SEC_CONSTS.TEXT.INACTIVE}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button type="button" onClick={onClose} disabled={loading}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
              {CLASS_SEC_CONSTS.TEXT.CANCEL}
            </button>
            <button type="button" onClick={(e) => handleSubmit(e)} disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer">
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'add' ? CLASS_SEC_CONSTS.TEXT.CREATE_CLASS : CLASS_SEC_CONSTS.TEXT.SAVE_CHANGES}
            </button>
          </div>
        </div>
      </div>
  );
};

// ─── Section Modal (Add / Edit) ───────────────────────────────────────────────
const EMPTY_SECTION = { name: '', roomNumber: '', capacity: '', classTeacherId: '', description: '', displayOrder: '', status: COMMON_STATUS.ACTIVE };

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
        name: initial.name ?? '',
        roomNumber: initial.roomNumber ?? '',
        capacity: initial.capacity ?? '',
        classTeacherId: initial.classTeacherId ?? '',
        description: initial.description ?? '',
        displayOrder: initial.displayOrder ?? '',
        status: initial.status ?? COMMON_STATUS.ACTIVE,
      });
    } else {
      setForm(EMPTY_SECTION);
    }
  }, [mode, initial]);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = CLASS_SEC_CONSTS.VALIDATION.SEC_NAME_REQ;
    if (form.name.trim().length > 50) e.name = CLASS_SEC_CONSTS.VALIDATION.MAX_50;
    if (form.capacity !== '' && Number(form.capacity) < 1) e.capacity = CLASS_SEC_CONSTS.VALIDATION.CAP_MIN;
    if (form.description && form.description.length > 500) e.description = CLASS_SEC_CONSTS.VALIDATION.MAX_500;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      classId,
      name: form.name.trim(),
      roomNumber: form.roomNumber?.trim() || null,
      capacity: form.capacity !== '' ? Number(form.capacity) : null,
      classTeacherId: form.classTeacherId !== '' ? Number(form.classTeacherId) : null,
      description: form.description?.trim() || null,
      displayOrder: form.displayOrder !== '' ? Number(form.displayOrder) : null,
      status: form.status,
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
                {mode === 'add' ? CLASS_SEC_CONSTS.TEXT.ADD_SECTION : CLASS_SEC_CONSTS.TEXT.EDIT_SECTION}
              </h2>
            </div>
            <button onClick={onClose} disabled={loading} className="text-gray-400 hover:text-gray-600 cursor-pointer"><X className="w-5 h-5" /></button>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {CLASS_SEC_CONSTS.TEXT.SECTION_NAME} <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.name} onChange={e => set('name', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_SEC_NAME}
                       className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.name ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.ROOM_NUMBER}</label>
                <input type="text" value={form.roomNumber} onChange={e => set('roomNumber', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_ROOM}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.CAPACITY}</label>
                <input type="number" min="1" value={form.capacity} onChange={e => set('capacity', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_CAPACITY}
                       className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 ${errors.capacity ? 'border-red-400' : 'border-gray-200'}`} />
                {errors.capacity && <p className="text-xs text-red-500 mt-1">{errors.capacity}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.CLASS_TEACHER}</label>
                <div className="relative">
                  <select value={form.classTeacherId} onChange={e => set('classTeacherId', e.target.value)}
                          disabled={tLoading}
                          className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 disabled:bg-gray-50">
                    <option value="">{CLASS_SEC_CONSTS.TEXT.SELECT_TEACHER_PREFIX}{tLoading ? CLASS_SEC_CONSTS.TEXT.LOADING_TEACHERS : CLASS_SEC_CONSTS.TEXT.NO_TEACHER_ASSIGNED}{CLASS_SEC_CONSTS.TEXT.SELECT_TEACHER_SUFFIX}</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.DESCRIPTION}</label>
              <textarea rows={2} value={form.description} onChange={e => set('description', e.target.value)}
                        placeholder={CLASS_SEC_CONSTS.TEXT.PH_SEC_DESC}
                        className={`w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 resize-none ${errors.description ? 'border-red-400' : 'border-gray-200'}`} />
              <div className="flex justify-between mt-1">
                {errors.description ? <p className="text-xs text-red-500">{errors.description}</p> : <span />}
                <span className="text-xs text-gray-400">{form.description?.length || 0}/500</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.DISPLAY_ORDER}</label>
                <input type="number" min="0" value={form.displayOrder} onChange={e => set('displayOrder', e.target.value)}
                       placeholder={CLASS_SEC_CONSTS.TEXT.PH_ORDER_SEC}
                       className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{CLASS_SEC_CONSTS.TEXT.STATUS}</label>
                <div className="relative">
                  <select value={form.status} onChange={e => set('status', e.target.value)}
                          className="w-full appearance-none border border-gray-200 rounded-lg pl-3 pr-8 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400">
                    <option value={COMMON_STATUS.ACTIVE}>{CLASS_SEC_CONSTS.TEXT.ACTIVE}</option>
                    <option value={COMMON_STATUS.INACTIVE}>{CLASS_SEC_CONSTS.TEXT.INACTIVE}</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </form>

          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
            <button type="button" onClick={onClose} disabled={loading}
                    className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 font-medium text-sm transition-colors cursor-pointer">
              {CLASS_SEC_CONSTS.TEXT.CANCEL}
            </button>
            <button type="button" onClick={handleSubmit} disabled={loading}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors flex items-center gap-2 disabled:opacity-60 cursor-pointer">
              {loading && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
              {mode === 'add' ? CLASS_SEC_CONSTS.TEXT.CREATE_SECTION : CLASS_SEC_CONSTS.TEXT.SAVE_CHANGES}
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

  const [viewClass, setViewClass] = useState(null);

  const fetchClasses = useCallback(async (search = classSearch, grade = classGrade, status = classStatus) => {
    if (!schoolId) { toast.error(CLASS_SEC_CONSTS.ERRORS.NO_SCHOOL_ID); return; }
    try {
      setClassLoading(true);
      const res = await getAllClasses(schoolId, { search, gradeLevel: grade, status });
      setClasses(res.data || []);
    } catch (err) {
      toast.error(err.message || CLASS_SEC_CONSTS.ERRORS.LOAD_CLASSES);
    } finally {
      setClassLoading(false);
    }
  }, [schoolId, classSearch, classGrade, classStatus]);

  useEffect(() => { fetchClasses(); }, []);

  const fetchSections = useCallback(async (classIdParam, status) => {
    const cid = classIdParam ?? selectedClass?.id;
    if (!cid) return;

    const targetStatus = status !== undefined ? status : sectionStatus;

    try {
      setSectionLoading(true);

      const apiStatus = targetStatus === '' ? undefined : targetStatus;

      const res = await getSectionsByClass(cid, apiStatus);
      setSections(res.data || []);
    } catch (err) {
      toast.error(err.message || CLASS_SEC_CONSTS.ERRORS.LOAD_SECTIONS);
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
        toast.success(CLASS_SEC_CONSTS.SUCCESS.CLASS_CREATED(payload.name));
      } else {
        await updateClass(classModal.data.id, { ...payload, schoolId });
        toast.success(CLASS_SEC_CONSTS.SUCCESS.CLASS_UPDATED(payload.name));
      }
      setClassModal(null);
      await fetchClasses();
    } catch (err) {
      toast.error(err.message || CLASS_SEC_CONSTS.ERRORS.SAVE_CLASS);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleSectionSubmit = async (payload) => {
    try {
      setSubmitLoading(true);
      if (sectionModal.mode === 'add') {
        await createSection(payload);
        toast.success(CLASS_SEC_CONSTS.SUCCESS.SEC_CREATED(payload.name));
        const updatedClass = {
          ...selectedClass,
          totalSections: (selectedClass?.totalSections ?? 0) + 1,
        };
        setSelectedClass(updatedClass);
        setClasses(prev => prev.map(c => (c.id === updatedClass.id ? updatedClass : c)));
      } else {
        await updateSection(sectionModal.data.id, payload);
        toast.success(CLASS_SEC_CONSTS.SUCCESS.SEC_UPDATED(payload.name));
      }
      setSectionModal(null);
      await fetchSections(selectedClass?.id, sectionStatus);
    } catch (err) {
      toast.error(err.message || CLASS_SEC_CONSTS.ERRORS.SAVE_SECTION);
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
        toast.success(CLASS_SEC_CONSTS.SUCCESS.CLASS_PROCESSED(item.name));
        setDeleteTarget(null);
        await fetchClasses();
      } else {
        await deleteSection(item.id);
        toast.success(CLASS_SEC_CONSTS.SUCCESS.SEC_INACTIVE(item.name));
        const updatedClass = {
          ...selectedClass,
          totalSections: Math.max((selectedClass?.totalSections ?? 1) - 1, 0),
        };
        setSelectedClass(updatedClass);
        setClasses(prev => prev.map(c => (c.id === updatedClass.id ? updatedClass : c)));
        setDeleteTarget(null);
        await fetchSections(selectedClass?.id, sectionStatus);
      }
    } catch (err) {
      toast.error(err.message || CLASS_SEC_CONSTS.ERRORS.PROCEED);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  const totalClasses = classes.length;
  const activeClasses = classes.filter(c => c.status === COMMON_STATUS.ACTIVE).length;
  const totalSections = classes.reduce((s, c) => s + (c.totalSections || 0), 0);
  const gradeLevels = classes.map(c => c.gradeLevel).filter(g => g !== null && g !== undefined);
  const gradeRange = gradeLevels.length
      ? `${gradeLabelOf(Math.min(...gradeLevels))} – ${gradeLabelOf(Math.max(...gradeLevels))}`
      : CLASS_SEC_CONSTS.TEXT.FALLBACK_DASH;

  const totalCapacity = sections.reduce((s, sec) => s + (sec.capacity || 0), 0);
  const totalEnrolled = sections.reduce((s, sec) => s + (sec.currentStrength || 0), 0);
  const occupancyPct = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

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
      { IconName: BookOpen, keyName: CLASS_SEC_CONSTS.TEXT.CARD_TOTAL_CLASSES, val: totalClasses, iconTxColor: 'text-blue-600', iconBgColor: 'bg-blue-50' },
      { IconName: CheckCircle, keyName: CLASS_SEC_CONSTS.TEXT.CARD_ACTIVE_CLASSES, val: activeClasses, iconTxColor: 'text-green-600', iconBgColor: 'bg-green-50' },
      { IconName: Layers, keyName: CLASS_SEC_CONSTS.TEXT.CARD_SECTIONS, val: totalSections, iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
      { IconName: GraduationCap, keyName: CLASS_SEC_CONSTS.TEXT.CARD_GRADE_RANGE, val: gradeRange, iconTxColor: 'text-orange-400', iconBgColor: 'bg-orange-50' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 xl:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{CLASS_SEC_CONSTS.TEXT.TITLE}</h1>
              <p className="text-sm text-gray-500 mt-1">{CLASS_SEC_CONSTS.TEXT.SUBTITLE}</p>
            </div>
            <button
                onClick={() => setClassModal({ mode: 'add' })}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-4 h-4" /> {CLASS_SEC_CONSTS.TEXT.ADD_CLASS}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {classStatsCards.map((card, i) => <CardComponent key={i} {...card} />)}
          </div>

          {/* Table panel */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Filter bar */}
            <div className="px-3 lg:px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
              <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
                <Search className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                    type="text"
                    value={classSearch}
                    onChange={e => setClassSearch(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && fetchClasses(classSearch, classGrade, classStatus)}
                    placeholder={CLASS_SEC_CONSTS.TEXT.SEARCH_CLASS_PH}
                    className="text-sm focus:outline-none bg-transparent w-full text-gray-700"
                />
              </div>
              <div className="relative">
                <select
                    value={classGrade}
                    onChange={e => { setClassGrade(e.target.value); fetchClasses(classSearch, e.target.value, classStatus); }}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
                >
                  <option value="">{CLASS_SEC_CONSTS.TEXT.ALL_GRADES}</option>
                  {CLASS_SEC_CONSTS.GRADE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                    value={classStatus}
                    onChange={e => { setClassStatus(e.target.value); fetchClasses(classSearch, classGrade, e.target.value); }}
                    className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
                >
                  <option value="">{CLASS_SEC_CONSTS.TEXT.ALL_STATUS}</option>
                  <option value={COMMON_STATUS.ACTIVE}>{CLASS_SEC_CONSTS.TEXT.ACTIVE}</option>
                  <option value={COMMON_STATUS.INACTIVE}>{CLASS_SEC_CONSTS.TEXT.INACTIVE}</option>
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button
                  onClick={() => fetchClasses(classSearch, classGrade, classStatus)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                {CLASS_SEC_CONSTS.TEXT.SEARCH_BTN}
              </button>
            </div>

            {/* Desktop table */}
            <div className="hidden lg:block overflow-x-auto overflow-y-auto max-h-130 w-full">
              <table className="w-full min-w-[700px]">
                <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr className="text-sm">
                  <th className="px-3 lg:px-4 py-4 text-left font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_CLASS_NAME}</th>
                  <th className="px-3 lg:px-4 py-4 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_DESC}</th>
                  <th className="px-3 lg:px-4 py-4 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_SECTIONS}</th>
                  <th className="px-3 lg:px-4 py-4 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_STATUS}</th>
                  <th className="px-3 lg:px-4 py-4 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_ACTIONS}</th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {classLoading && <ListLoader avatar={false} colSpanSet={5} />}

                {!classLoading && classes.length === 0 && (
                    <tr>
                      <td colSpan="5" className="py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                            <SearchX className="w-6 h-6 text-blue-500" />
                          </div>
                          <p className="text-sm font-semibold text-gray-700">{CLASS_SEC_CONSTS.TEXT.NO_CLASSES}</p>
                          <p className="text-xs text-gray-400">{CLASS_SEC_CONSTS.TEXT.NO_CLASSES_SUB}</p>
                        </div>
                      </td>
                    </tr>
                )}

                {!classLoading && classes.map((cls, idx) => (
                    <tr key={cls.id} className="hover:bg-gray-50 transition-colors text-sm">
                      <td className="px-3 lg:px-4 py-4">
                        <p className="font-semibold text-gray-900">{cls.name}</p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${gradeColor(cls.gradeLevel)}`}>
                        {gradeLabelOf(cls.gradeLevel)}
                      </span>
                      </td>
                      <td className="px-3 lg:px-4 py-4 text-center">
                        <p className="text-gray-500 truncate max-w-[320px] mx-auto">{cls.description || CLASS_SEC_CONSTS.TEXT.FALLBACK_DASH}</p>
                      </td>
                      <td className="px-3 lg:px-4 py-4 text-center">
                        <button
                            onClick={() => openSections(cls)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 border border-blue-200/50 text-xs font-semibold hover:bg-blue-100 hover:text-blue-700 transition-all cursor-pointer shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{CLASS_SEC_CONSTS.TEXT.ADD_SECTIONS_BTN} ({cls.totalSections ?? 0})</span>
                        </button>
                      </td>
                      <td className="px-3 lg:px-4 py-4 text-center">
                        <StatusBadge active={cls.status === COMMON_STATUS.ACTIVE} />
                      </td>
                      <td className="px-3 lg:px-4 py-4">
                        <div className="flex items-center justify-center gap-4 text-xs font-semibold whitespace-nowrap">
                          <button
                              onClick={() => setViewClass(cls)}
                              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" /> {CLASS_SEC_CONSTS.TEXT.BTN_VIEW}
                          </button>
                          <button
                              onClick={() => setClassModal({ mode: 'edit', data: cls })}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> {CLASS_SEC_CONSTS.TEXT.EDIT}
                          </button>
                          {cls.status !== COMMON_STATUS.INACTIVE && (
                              <button
                                  onClick={() => setDeleteTarget({ type: 'class', item: cls })}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> {CLASS_SEC_CONSTS.TEXT.INACTIVE}
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="lg:hidden">
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
                      <p className="text-sm font-semibold text-gray-700">{CLASS_SEC_CONSTS.TEXT.NO_CLASSES}</p>
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
                              <button onClick={() => setViewClass(cls)} className="text-indigo-600 cursor-pointer">{CLASS_SEC_CONSTS.TEXT.BTN_VIEW}</button>
                              <button onClick={() => setClassModal({ mode: 'edit', data: cls })} className="text-blue-600 cursor-pointer">{CLASS_SEC_CONSTS.TEXT.EDIT}</button>
                              {cls.status !== COMMON_STATUS.INACTIVE && (
                                  <button onClick={() => setDeleteTarget({ type: 'class', item: cls })} className="text-red-500 cursor-pointer">{CLASS_SEC_CONSTS.TEXT.INACTIVE}</button>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between gap-3 text-xs text-gray-500 mt-2">
                            <button
                                onClick={() => openSections(cls)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 border border-blue-100 font-semibold cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> {CLASS_SEC_CONSTS.TEXT.ADD_SECTIONS_BTN} ({cls.totalSections ?? 0})
                            </button>
                            <StatusBadge active={cls.status === COMMON_STATUS.ACTIVE} />
                          </div>
                          {cls.description && <p className="text-xs text-gray-400 mt-2 line-clamp-1">{cls.description}</p>}
                        </div>
                    ))}
                  </div>
              )}
            </div>
          </div>

          {/* Modals Containers */}
          {viewClass && (
              <ClassDetailModal
                  cls={viewClass}
                  onClose={() => setViewClass(null)}
                  onEdit={(cls) => setClassModal({ mode: 'edit', data: cls })}
                  onInactive={(cls) => setDeleteTarget({ type: 'class', item: cls })}
                  onManageSections={openSections}
              />
          )}

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
                  title={CLASS_SEC_CONSTS.DELETE.CLASS_TITLE}
                  message={CLASS_SEC_CONSTS.DELETE.CLASS_MSG(deleteTarget.item.name)}
                  subMessage={CLASS_SEC_CONSTS.DELETE.CLASS_SUB}
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
    { IconName: Layers, keyName: CLASS_SEC_CONSTS.TEXT.CARD_SECTIONS, val: sections.length, iconTxColor: 'text-blue-600', iconBgColor: 'bg-blue-50' },
    { IconName: Users, keyName: CLASS_SEC_CONSTS.TEXT.CARD_CAPACITY, val: totalCapacity, iconTxColor: 'text-purple-600', iconBgColor: 'bg-purple-50' },
    { IconName: Users, keyName: CLASS_SEC_CONSTS.TEXT.CARD_ENROLLED, val: totalEnrolled, iconTxColor: 'text-green-600', iconBgColor: 'bg-green-50' },
    {
      IconName: Hash, keyName: CLASS_SEC_CONSTS.TEXT.CARD_OCCUPANCY, val: `${occupancyPct}%`,
      iconTxColor: totalCapacity === 0 ? 'text-gray-400' : occupancyPct >= 90 ? 'text-red-600' : occupancyPct >= 70 ? 'text-amber-600' : 'text-green-600',
      iconBgColor: totalCapacity === 0 ? 'bg-gray-50' : occupancyPct >= 90 ? 'bg-red-50' : occupancyPct >= 70 ? 'bg-amber-50' : 'bg-green-50',
    },
  ];

  return (
      <div className="min-h-screen bg-gray-50 p-4 xl:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
                onClick={() => { setView('classes'); setSelectedClass(null); setSections([]); }}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors cursor-pointer"
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
              <p className="text-sm text-gray-500 mt-0.5">{CLASS_SEC_CONSTS.TEXT.SEC_CONFIG_SUB}</p>
            </div>
          </div>
          <button
              onClick={() => setSectionModal({ mode: 'add' })}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 font-medium text-sm transition-colors shadow-sm self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {CLASS_SEC_CONSTS.TEXT.ADD_SECTION}
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {sectionStatsCards.map((card, i) => <CardComponent key={i} {...card} />)}
        </div>

        {/* Sections Table Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-3 lg:px-4 py-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
            <div className="flex flex-1 items-center gap-2 border border-gray-200 rounded-lg bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                  type="text"
                  value={sectionSearch}
                  onChange={e => setSectionSearch(e.target.value)}
                  placeholder={CLASS_SEC_CONSTS.TEXT.SEARCH_SEC_PH}
                  className="text-sm focus:outline-none bg-transparent w-full text-gray-700"
              />
            </div>
            <div className="relative">
              <select
                  value={sectionStatus}
                  onChange={e => {
                    setSectionStatus(e.target.value);
                    fetchSections(selectedClass?.id, e.target.value);
                  }}
                  className="appearance-none pl-3 pr-8 py-2 text-sm border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer w-full"
              >
                <option value="">{CLASS_SEC_CONSTS.TEXT.ALL_STATUS}</option>
                <option value={COMMON_STATUS.ACTIVE}>{CLASS_SEC_CONSTS.TEXT.ACTIVE}</option>
                <option value={COMMON_STATUS.INACTIVE}>{CLASS_SEC_CONSTS.TEXT.INACTIVE}</option>
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Desktop Sections Table */}
          <div className="hidden md:block overflow-x-auto overflow-y-auto max-h-130 w-full">
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr className="text-sm">
                <th className="px-4 lg:px-6 py-3 text-left font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_SECTION}</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_ROOM}</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_CAP_ENR}</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide hidden xl:table-cell">{CLASS_SEC_CONSTS.TEXT.TH_CLASS_TEACHER}</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_STATUS}</th>
                <th className="px-4 lg:px-6 py-3 text-center font-semibold text-gray-600 uppercase tracking-wide">{CLASS_SEC_CONSTS.TEXT.TH_ACTIONS}</th>
              </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
              {sectionLoading && <ListLoader avatar={false} colSpanSet={7} />}

              {!sectionLoading && filteredSections.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
                          <SearchX className="w-6 h-6 text-blue-500" />
                        </div>
                        <p className="text-sm font-semibold text-gray-700">{CLASS_SEC_CONSTS.TEXT.NO_SECTIONS}</p>
                        <p className="text-xs text-gray-400">{CLASS_SEC_CONSTS.TEXT.NO_SECTIONS_SUB}</p>
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
                      <td className="px-4 lg:px-6 py-4">
                        <p className="font-semibold text-gray-900 text-sm">{sec.name}</p>
                        {sec.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-[180px]">{sec.description}</p>}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        {sec.roomNumber
                            ? <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 text-xs font-medium">{sec.roomNumber}</span>
                            : <span className="text-gray-400 text-sm">{CLASS_SEC_CONSTS.TEXT.FALLBACK_DASH}</span>
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
                            <span className="text-gray-400 text-sm">{enr} / {CLASS_SEC_CONSTS.TEXT.FALLBACK_DASH}</span>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center hidden xl:table-cell">
                        <p className="text-sm text-gray-600">
                          {sec.classTeacherName || <span className="text-gray-400 italic text-xs">{CLASS_SEC_CONSTS.TEXT.NO_TEACHER_ASSIGNED}</span>}
                        </p>
                      </td>
                      <td className="px-4 lg:px-6 py-4 text-center">
                        <StatusBadge active={sec.status === COMMON_STATUS.ACTIVE} />
                      </td>
                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center justify-center gap-4 text-xs font-semibold whitespace-nowrap">
                          <button
                              onClick={() => setSectionModal({ mode: 'edit', data: sec })}
                              className="flex items-center gap-1 text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" /> {CLASS_SEC_CONSTS.TEXT.EDIT}
                          </button>
                          {sec.status !== COMMON_STATUS.INACTIVE && (
                              <button
                                  onClick={() => setDeleteTarget({ type: 'section', item: sec })}
                                  className="flex items-center gap-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <XCircle className="w-3.5 h-3.5" /> {CLASS_SEC_CONSTS.TEXT.INACTIVE}
                              </button>
                          )}
                        </div>
                      </td>
                    </tr>
                );
              })}
              </tbody>
            </table>
          </div>

          {/* Mobile Sections Cards Layout */}
          <div className="lg:hidden">
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
                    <p className="text-sm font-semibold text-gray-700">{CLASS_SEC_CONSTS.TEXT.NO_SECTIONS}</p>
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
                            <div className="flex gap-3 text-xs font-bold items-center">
                              <button onClick={() => setSectionModal({ mode: 'edit', data: sec })} className="text-blue-600 cursor-pointer">{CLASS_SEC_CONSTS.TEXT.EDIT}</button>
                              {sec.status !== COMMON_STATUS.INACTIVE && (
                                  <button onClick={() => setDeleteTarget({ type: 'section', item: sec })} className="text-red-500 cursor-pointer">{CLASS_SEC_CONSTS.TEXT.INACTIVE}</button>
                              )}
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
                            <StatusBadge active={sec.status === COMMON_STATUS.ACTIVE} />
                          </div>
                          {!sec.classTeacherName && <p className="text-xs text-gray-400 italic mt-1">{CLASS_SEC_CONSTS.TEXT.NO_TEACHER_ASSIGNED}</p>}
                          {sec.classTeacherName && <p className="text-xs text-gray-500 mt-1">{CLASS_SEC_CONSTS.TEXT.LBL_TEACHER}{sec.classTeacherName}</p>}
                        </div>
                    );
                  })}
                </div>
            )}
          </div>
        </div>

        {/* Section Dialog Modals */}
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
                title={CLASS_SEC_CONSTS.DELETE.SEC_TITLE}
                message={CLASS_SEC_CONSTS.DELETE.SEC_MSG(deleteTarget.item.name)}
                subMessage={CLASS_SEC_CONSTS.DELETE.SEC_SUB(deleteTarget.item.currentStrength || 0)}
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteTarget(null)}
                loading={deleteLoading}
            />
        )}
      </div>
  );
}