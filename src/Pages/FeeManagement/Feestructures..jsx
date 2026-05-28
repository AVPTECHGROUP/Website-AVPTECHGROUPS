import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../../Components/FeeModal/Button';
import Badge from '../../Components/FeeModal/Badge';
import Modal from '../../Components/FeeModal/Modal';
import Select from '../../Components/FeeModal/Select';
import Input from '../../Components/FeeModal/Input';
import { Plus, X, Pencil, Eye, Trash2, AlertTriangle, CheckCircle2, Info, AlertCircle, Calendar, Users, Layers, IndianRupee } from 'lucide-react';
import {
  getFeeStructures,
  createFeeStructure,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} from '../../Api/FeeStructures';
import { getFeePeriods } from '../../Api/FeePeriods';
import { getActiveClasses } from '../../Api/ClassSectionAPI';
import { UserContext } from '../../ContextAPI/UserContext';

// ─── Toast ────────────────────────────────────────────────────────────────────
let _dispatch = null;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _dispatch = (t) => {
      const id = Date.now() + Math.random();
      setToasts((p) => [...p, { ...t, id }]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), t.duration || 4000);
    };
    return () => { _dispatch = null; };
  }, []);

  const icons = {
    success: <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />,
    error:   <AlertCircle  size={15} className="flex-shrink-0 text-red-400" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
    info:    <Info          size={15} className="flex-shrink-0 text-blue-400" />,
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
          style={{ animation: 'fsToastIn .22s ease-out' }}>
          {icons[t.type] || icons.info}
          <div className="flex-1 min-w-0">
            {t.title   && <div className="text-[13px] font-semibold">{t.title}</div>}
            {t.message && <div className="text-[12px] text-white/70 mt-0.5">{t.message}</div>}
          </div>
          <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            className="opacity-50 hover:opacity-100 ml-1 mt-0.5 flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      ))}
      <style>{`@keyframes fsToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
};

const toast = {
  success: (title, message) => _dispatch?.({ type: 'success', title, message }),
  error:   (title, message) => _dispatch?.({ type: 'error',   title, message }),
  warning: (title, message) => _dispatch?.({ type: 'warning', title, message }),
  info:    (title, message) => _dispatch?.({ type: 'info',    title, message }),
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ open, onClose, onConfirm, loading, structureName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Delete Fee Structure?</h3>
            <p className="text-sm text-gray-500 mt-1">
              <strong className="text-gray-700">{structureName}</strong> will be permanently removed.
              This cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Deleting…' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000)   return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000)     return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
};

const STATUS_PILL = {
  ACTIVE: { label: 'Active',  bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  DRAFT:  { label: 'Draft',   bg: 'bg-amber-50   text-amber-700   border-amber-200'   },
  LOCKED: { label: 'Locked',  bg: 'bg-gray-100   text-gray-500    border-gray-200'    },
};

const COMPONENT_TYPE_OPTIONS = [
  { value: 'TUITION_FEE',   label: 'Tuition Fee'   },
  { value: 'TRANSPORT_FEE', label: 'Transport Fee'  },
  { value: 'LAB_FEE',       label: 'Lab Fee'        },
  { value: 'LIBRARY_FEE',   label: 'Library Fee'    },
  { value: 'ACTIVITY_FEE',  label: 'Activity Fee'   },
  { value: 'SPORTS_FEE',    label: 'Sports Fee'     },
  { value: 'EXAM_FEE',      label: 'Exam Fee'       },
  { value: 'MISC',      label: 'Misc Fee'       },
  { value: 'OTHER',     label: 'Other Fee'      },
];

const REQUIRES_CUSTOM_NAME = ['MISC', 'OTHER'];

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ status }) => {
  const s = STATUS_PILL[status?.toUpperCase()] || STATUS_PILL.DRAFT;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold ${s.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${
        status === 'ACTIVE' ? 'bg-emerald-500' : status === 'DRAFT' ? 'bg-amber-500' : 'bg-gray-400'
      }`} />
      {s.label}
    </span>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
function ViewDetailsModal({ isOpen, onClose, structure }) {
  if (!isOpen || !structure) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-[15px] font-bold text-gray-900">Fee Structure Details</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              ['Period',   structure.feePeriod?.name || '—'],
              ['Classes',  structure.classes?.map((c) => c.name).join(', ') || '—'],
              ['Status',   null],
              ['Students', structure.studentCount || '—'],
            ].map(([label, val]) => (
              <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                {label === 'Status'
                  ? <StatusPill status={structure.status} />
                  : <div className="text-sm font-semibold text-gray-800">{val}</div>
                }
              </div>
            ))}
          </div>
          <div>
            <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">Fee Components</div>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {structure.components?.map((comp, i, arr) => (
                <div key={i} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-gray-50' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                  <span className="text-gray-600">{comp.customName || comp.componentType}</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(comp.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center px-4 py-3 bg-[#1E3A5F] rounded-b-xl">
                <span className="text-sm font-bold text-white/80">Total</span>
                <span className="text-base font-extrabold text-white">{formatCurrency(structure.totalAmount)}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Structure Modal (Create / Edit) ─────────────────────────────────────────
function StructureModal({ isOpen, onClose, structure, periods, classes, onSuccess, academicYear }) {
  const isEdit = !!structure;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    feePeriodId: '',
    classIds: [],
    components: [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
  });

  useEffect(() => {
    if (!isOpen) return;
    if (structure) {
      setForm({
        feePeriodId: structure.feePeriodId?.toString() || '',
        classIds:    structure.classes?.map((c) => c.id) || [],
        components:  structure.components?.map((comp, idx) => ({
          componentType: comp.componentType || 'TUITION_FEE',
          customName:    comp.customName    || '',
          amount:        comp.amount?.toString() || '',
          displayOrder:  comp.displayOrder ?? idx,
        })) || [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
      });
    } else {
      setForm({
        feePeriodId: '',
        classIds: [],
        components: [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
      });
    }
  }, [isOpen, structure]);

  const toggleClass = (id) =>
    setForm((p) => ({ ...p, classIds: p.classIds.includes(id) ? p.classIds.filter((x) => x !== id) : [...p.classIds, id] }));

  const addComponent = () =>
    setForm((p) => ({ ...p, components: [...p.components, { componentType: '', customName: '', amount: '', displayOrder: p.components.length }] }));

  const removeComponent = (i) =>
    setForm((p) => ({ ...p, components: p.components.filter((_, idx) => idx !== i) }));

  const updateComponent = (i, field, val) =>
    setForm((p) => ({
      ...p,
      components: p.components.map((c, idx) => {
        if (idx !== i) return c;
        const updated = { ...c, [field]: val };
        if (field === 'componentType' && !REQUIRES_CUSTOM_NAME.includes(val)) updated.customName = '';
        return updated;
      }),
    }));

  const totalAmount   = form.components.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const selectedClasses = classes.filter((c) => form.classIds.includes(c.id));
  const totalStudents = selectedClasses.reduce((s, c) => s + (c.studentCount || 0), 0);

  const handleSubmit = async (saveAsDraft) => {
    if (!form.feePeriodId)            { toast.error('Validation', 'Please select a fee period');            return; }
    if (form.classIds.length === 0)   { toast.error('Validation', 'Please select at least one class');      return; }
    if (form.components.length === 0) { toast.error('Validation', 'Please add at least one fee component'); return; }

    for (let i = 0; i < form.components.length; i++) {
      const comp = form.components[i];
      const rowLabel = `row ${i + 1}`;
      if (!comp.componentType)                   { toast.error('Validation', `Select component type for ${rowLabel}`); return; }
      if (!comp.amount || parseFloat(comp.amount) <= 0) { toast.error('Validation', `Enter valid amount for ${rowLabel}`); return; }
      if (REQUIRES_CUSTOM_NAME.includes(comp.componentType) && !comp.customName?.trim()) {
        const label = comp.componentType === 'MISC_FEE' ? 'Misc Fee' : 'Other Fee';
        toast.error('Validation', `"Custom Name" is required for ${label} (${rowLabel})`);
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        feePeriodId: parseInt(form.feePeriodId),
        classIds:    form.classIds,
        components:  form.components.map((c, idx) => ({
          componentType: c.componentType,
          customName:    REQUIRES_CUSTOM_NAME.includes(c.componentType) ? c.customName.trim() : (c.customName.trim() || null),
          amount:        parseFloat(c.amount),
          displayOrder:  idx,
        })),
        saveAsDraft,
      };
      if (isEdit) {
        await updateFeeStructure(structure.id, payload);
        toast.success('Structure Updated', 'Fee structure has been updated successfully.');
      } else {
        await createFeeStructure(payload);
        toast.success(saveAsDraft ? 'Draft Saved' : 'Structure Published', saveAsDraft ? 'Fee structure saved as draft.' : 'Fee structure has been published.');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Save Failed', error.message || `Failed to ${isEdit ? 'update' : 'create'} fee structure`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">{isEdit ? 'Edit Fee Structure' : 'Create Fee Structure'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">AY {academicYear?.label}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[78vh] overflow-y-auto">
          {/* Step 1 */}
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">1</div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Select Period</span>
            </div>
            <div className="mb-3 px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm text-blue-700">
              Academic Year: <strong>{academicYear?.label || '—'}</strong>
            </div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Fee Period <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.feePeriodId}
              onChange={(v) => setForm((p) => ({ ...p, feePeriodId: v }))}
              options={[
                { value: '', label: '-- Select a period --' },
                ...periods.map((p) => ({ value: p.id.toString(), label: p.name })),
              ]}
            />
          </div>

          {/* Step 2 */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">2</div>
              <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Apply to Classes</span>
            </div>
            <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200 max-h-44 overflow-y-auto">
              {classes.map((cls) => (
                <label key={cls.id}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold select-none ${
                    form.classIds.includes(cls.id)
                      ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1E3A5F]/50 hover:text-[#1E3A5F]'
                  }`}>
                  <input type="checkbox" className="sr-only" checked={form.classIds.includes(cls.id)} onChange={() => toggleClass(cls.id)} />
                  {cls.name}
                  {cls.studentCount > 0 && <span className="text-[10px] opacity-60">({cls.studentCount})</span>}
                </label>
              ))}
            </div>
            {form.classIds.length > 0 && (
              <div className="mt-2.5 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                Selected: <strong>{selectedClasses.map((c) => c.name).join(', ')}</strong> · {totalStudents} students
              </div>
            )}
          </div>

          {/* Step 3 */}
          <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">3</div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Fee Components</span>
              </div>
              <button onClick={addComponent}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] bg-white border border-[#1E3A5F]/30 rounded-lg hover:bg-blue-50 transition-colors">
                <Plus size={12} /> Add Component
              </button>
            </div>

            <div className="grid grid-cols-12 gap-3 text-[10.5px] font-bold text-gray-400 uppercase tracking-wider px-1 mb-2">
              <div className="col-span-5">Type</div>
              <div className="col-span-4">Custom Name <span className="normal-case font-normal text-gray-300">(Misc/Other)</span></div>
              <div className="col-span-2">Amount</div>
              <div className="col-span-1" />
            </div>

            <div className="space-y-2">
              {form.components.map((comp, i) => {
                const needsName = REQUIRES_CUSTOM_NAME.includes(comp.componentType);
                return (
                  <div key={i} className="grid grid-cols-12 gap-3 items-start">
                    <div className="col-span-5">
                      <Select
                        value={comp.componentType}
                        onChange={(v) => updateComponent(i, 'componentType', v)}
                        options={[{ value: '', label: '-- Select --' }, ...COMPONENT_TYPE_OPTIONS]}
                      />
                    </div>
                    <div className="col-span-4">
                      <Input
                        value={comp.customName}
                        onChange={(v) => updateComponent(i, 'customName', v)}
                        placeholder={needsName ? 'Required…' : 'Optional…'}
                        disabled={!needsName}
                        className={needsName && !comp.customName?.trim() ? 'border-amber-400' : ''}
                      />
                      {needsName && !comp.customName?.trim() && (
                        <p className="text-[10px] text-amber-600 mt-0.5 pl-1">Required for this type</p>
                      )}
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        value={comp.amount}
                        onChange={(v) => updateComponent(i, 'amount', v)}
                        placeholder="0"
                      />
                    </div>
                    <div className="col-span-1 flex items-center justify-center pt-1">
                      {form.components.length > 1 && (
                        <button type="button" onClick={() => removeComponent(i)}
                          className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex justify-between items-center bg-[#1E3A5F] rounded-xl px-4 py-3">
              <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">Total Fee</span>
              <span className="text-xl font-extrabold text-white">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          {!isEdit && (
            <button onClick={() => handleSubmit(true)} disabled={loading}
              className="px-4 py-2 text-sm font-semibold text-[#1E3A5F] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors">
              Save as Draft
            </button>
          )}
          <button onClick={() => handleSubmit(false)} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Update Structure' : 'Save Structure'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Fee Structure Card ───────────────────────────────────────────────────────
const FeeStructureCard = ({ s, periods, onView, onEdit, onDelete }) => {
  const statusKey  = s.status?.toUpperCase() || 'DRAFT';
  const periodName = s.feePeriod?.name || periods.find((p) => p.id === s.feePeriodId)?.name || '—';
  const compCount  = s.components?.length || 0;
  const compPreview = s.components?.slice(0, 3).map((c) => c.customName || c.componentType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') || '—';
  const canDelete  = statusKey === 'DRAFT' || (statusKey === 'ACTIVE' && !s.studentCount);

  // Status accent color for card top border
  const accentColor =
    statusKey === 'ACTIVE' ? 'from-emerald-400 to-teal-500' :
    statusKey === 'LOCKED' ? 'from-gray-300 to-gray-400' :
                             'from-amber-400 to-orange-400';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group flex flex-col">
      {/* Colored top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentColor}`} />

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header row: period name + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/8 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-[#1E3A5F]" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-gray-900 truncate">{periodName}</div>
              <div className="text-[10.5px] text-gray-400 mt-0.5">Fee Period</div>
            </div>
          </div>
          <StatusPill status={statusKey} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {/* Classes */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <Layers size={10} /> Classes
            </div>
            <div className="flex flex-wrap gap-1">
              {s.classes?.slice(0, 3).map((c) => (
                <span key={c.id} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[10px] font-semibold rounded-md">
                  {c.name}
                </span>
              ))}
              {(s.classes?.length || 0) > 3 && (
                <span className="px-1.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 text-[10px] font-semibold rounded-md">
                  +{s.classes.length - 3}
                </span>
              )}
              {(!s.classes || s.classes.length === 0) && <span className="text-xs text-gray-300">—</span>}
            </div>
          </div>

          {/* Students */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <Users size={10} /> Students
            </div>
            <div className="text-sm font-bold text-gray-800">
              {s.studentCount > 0 ? s.studentCount : <span className="text-gray-300 font-normal text-xs">—</span>}
            </div>
          </div>

          {/* Components count */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              <Layers size={10} /> Items
            </div>
            <div className="text-sm font-bold text-gray-800">{compCount}</div>
          </div>
        </div>

        {/* Component preview */}
        {compCount > 0 && (
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Components</div>
            <div className="text-xs text-gray-600 truncate" title={compPreview}>{compPreview}</div>
            {compCount > 3 && (
              <div className="text-[10px] text-gray-400 mt-0.5">+{compCount - 3} more</div>
            )}
          </div>
        )}
      </div>

      {/* Footer: total + actions */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-5 py-3 flex items-center justify-between gap-3">
        {/* Total amount */}
        <div>
          <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Total</div>
          <div className="text-base font-extrabold text-[#1E3A5F]">{formatCurrency(s.totalAmount)}</div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {statusKey !== 'DRAFT' && (
            <button onClick={() => onView(s)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
              <Eye size={12} /> View
            </button>
          )}
          {statusKey !== 'LOCKED' && (
            <button onClick={() => onEdit(s)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
              <Pencil size={12} /> {statusKey === 'DRAFT' ? 'Edit Draft' : 'Edit'}
            </button>
          )}
          {canDelete && (
            <button onClick={() => onDelete(s)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── FeeStructures ─────────────────────────────────────────────────────────────
const FeeStructures = ({ initialPeriodId: initialPeriodIdProp }) => {
  const { currentAcademicYear } = useContext(UserContext);
  const academicYearId    = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;
  const location = useLocation();

  const [periodFilter,      setPeriodFilter]      = useState('');
  const [modal,             setModal]             = useState(null);
  const [activeStructure,   setActiveStructure]   = useState(null);
  const [structures,        setStructures]        = useState([]);
  const [periods,           setPeriods]           = useState([]);
  const [classes,           setClasses]           = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [structuresLoading, setStructuresLoading] = useState(false);

  const [deleteModal, setDeleteModal] = useState({ open: false, structure: null, loading: false });

  const getSchoolId = () => {
    try { return JSON.parse(localStorage.getItem('user') || '{}').schoolId || 1; }
    catch { return 1; }
  };

  const fetchStructures = useCallback(async (periodId) => {
    try {
      setStructuresLoading(true);
      const data = await getFeeStructures(periodId ?? '');
      setStructures(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Fetch Failed', 'Could not load fee structures.');
    } finally {
      setStructuresLoading(false);
    }
  }, []);

  const fetchPeriods = useCallback(async () => {
    if (!academicYearId) return;
    try {
      const data = await getFeePeriods(academicYearId);
      setPeriods(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Fetch Failed', 'Could not load fee periods.');
    }
  }, [academicYearId]);

  const fetchClasses = useCallback(async () => {
    try {
      const schoolId    = getSchoolId();
      const classesData = await getActiveClasses(schoolId);
      const normalized  =
        Array.isArray(classesData)         ? classesData       :
        Array.isArray(classesData?.data)   ? classesData.data  :
        Array.isArray(classesData?.result) ? classesData.result : [];
      setClasses(normalized);
    } catch {
      toast.error('Fetch Failed', 'Could not load classes.');
    }
  }, []);

  useEffect(() => {
    if (!academicYearId) return;
    const incomingId = initialPeriodIdProp ?? location.state?.periodId;
    const resolvedId = incomingId ? incomingId.toString() : '';
    if (resolvedId) setPeriodFilter(resolvedId);
    const init = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchPeriods(), fetchStructures(resolvedId ? parseInt(resolvedId) : null), fetchClasses()]);
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [academicYearId, initialPeriodIdProp]);

  const openCreate = () => { setActiveStructure(null); setModal('create'); };

  const openEdit = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure(full);
      setModal('edit');
    } catch {
      toast.error('Load Failed', 'Could not load structure details.');
    }
  };

  const openView = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure(full);
      setModal('view');
    } catch {
      toast.error('Load Failed', 'Could not load structure details.');
    }
  };

  const close         = () => { setModal(null); setActiveStructure(null); };
  const handleSuccess = () => fetchStructures(periodFilter ? parseInt(periodFilter) : null);

  const promptDelete = (s) => setDeleteModal({ open: true, structure: s, loading: false });
  const cancelDelete = () => setDeleteModal({ open: false, structure: null, loading: false });

  const confirmDelete = async () => {
    const s = deleteModal.structure;
    if (!s) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    try {
      await deleteFeeStructure(s.id);
      toast.success('Structure Deleted', `"${s.feePeriod?.name || 'Fee structure'}" has been permanently removed.`);
      cancelDelete();
      handleSuccess();
    } catch (error) {
      setDeleteModal((p) => ({ ...p, loading: false }));
      toast.error('Delete Failed', error.message || 'Could not delete the fee structure. Please try again.');
    }
  };

  const handlePeriodFilterChange = (value) => {
    setPeriodFilter(value);
    fetchStructures(value ? parseInt(value) : null);
  };

  const filtered = periodFilter
    ? structures.filter((s) => s.feePeriodId === parseInt(periodFilter))
    : structures;

  const deleteStructureName = deleteModal.structure
    ? `${deleteModal.structure.feePeriod?.name || 'Period'} — ${deleteModal.structure.classes?.map((c) => c.name).join(', ') || 'Classes'}`
    : '';

  if (!academicYearId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">⏳ Waiting for academic year…</div>
      </div>
    );
  }

  if (loading && structures.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading fee structures…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Structures</h1>
          <p className="text-sm text-gray-400 mt-0.5">Class-wise fee components per period · AY {academicYearLabel}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={periodFilter}
            onChange={(e) => handlePeriodFilterChange(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-44">
            <option value="">All Periods</option>
            {periods.map((p) => <option key={p.id} value={p.id.toString()}>{p.name}</option>)}
          </select>
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={15} /> Add Structure
          </button>
        </div>
      </div>

      {/* ── Info banner ─────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>
          A structure sets fee components and amounts for selected classes under a period.
          Once any payment is recorded it is <strong>locked</strong> and cannot be edited.
        </span>
      </div>

      {/* ── Cards section ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
            Fee Structures
            {filtered.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                {filtered.length}
              </span>
            )}
          </h2>
          {structuresLoading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
              Refreshing…
            </div>
          )}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && !structuresLoading ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Plus size={20} className="text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-500">No fee structures found</div>
            <div className="text-xs text-gray-400 mt-1 mb-4">
              {periodFilter ? 'No structures for the selected period.' : 'Get started by creating your first structure.'}
            </div>
            <button onClick={openCreate}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors">
              Create Structure
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((s) => (
                <FeeStructureCard
                  key={s.id}
                  s={s}
                  periods={periods}
                  onView={openView}
                  onEdit={openEdit}
                  onDelete={promptDelete}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer count */}
        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Showing {filtered.length} structure{filtered.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      <StructureModal
        isOpen={modal === 'create'}
        onClose={close}
        periods={periods}
        classes={classes}
        onSuccess={handleSuccess}
        academicYear={currentAcademicYear}
      />
      <StructureModal
        isOpen={modal === 'edit'}
        onClose={close}
        structure={activeStructure}
        periods={periods}
        classes={classes}
        onSuccess={handleSuccess}
        academicYear={currentAcademicYear}
      />
      <ViewDetailsModal
        isOpen={modal === 'view'}
        onClose={close}
        structure={activeStructure}
      />
      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        loading={deleteModal.loading}
        structureName={deleteStructureName}
      />
    </div>
  );
};

export default FeeStructures;