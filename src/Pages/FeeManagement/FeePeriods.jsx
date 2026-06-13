import React, { useState, useEffect, useContext } from 'react';
import Input from '../../Components/FeeModal/Input';
import Select from '../../Components/FeeModal/Select';
import {
  Plus, X, Pencil, Trash2, ArrowRight, Calendar, Users, Layers,
  CheckCircle2, AlertCircle, AlertTriangle, Info, Clock,
} from 'lucide-react';
import {
  getFeePeriods,
  createFeePeriod,
  updateFeePeriod,
  deleteFeePeriod,
} from '../../Api/FeePeriods';
import { getAcademicYearsLov } from '../../Api/AcademicYear';
import { UserContext } from '../../ContextAPI/UserContext';

// ─── Toast (self-contained, matches FeeStructures) ────────────────────────────
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
          style={{ animation: 'fpToastIn .22s ease-out' }}>
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
      <style>{`@keyframes fpToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
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
const DeleteConfirmModal = ({ open, onClose, onConfirm, loading, periodName }) => {
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
            <h3 className="text-base font-bold text-gray-900">Delete Fee Period?</h3>
            <p className="text-sm text-gray-500 mt-1">
              <strong className="text-gray-700">{periodName}</strong> will be permanently removed.
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

// ─── Constants ────────────────────────────────────────────────────────────────
const TYPE_ACCENT = {
  QUARTERLY:   'from-[#1A3A5C] to-[#2563EB]',
  MONTHLY:     'from-[#0369A1] to-[#0EA5E9]',
  YEARLY:      'from-[#0D7A55] to-[#10B981]',
  HALF_YEARLY: 'from-[#7C3AED] to-[#A78BFA]',
  CUSTOM:      'from-[#92400E] to-[#F59E0B]',
};

const TYPE_BADGE_STYLE = {
  QUARTERLY:   'bg-blue-50 text-blue-700 border-blue-200',
  MONTHLY:     'bg-sky-50 text-sky-700 border-sky-200',
  YEARLY:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  HALF_YEARLY: 'bg-violet-50 text-violet-700 border-violet-200',
  CUSTOM:      'bg-amber-50 text-amber-700 border-amber-200',
};

const typeLabels = {
  QUARTERLY:   'Quarterly',
  MONTHLY:     'Monthly',
  YEARLY:      'Yearly',
  HALF_YEARLY: 'Half-Yearly',
  CUSTOM:      'Custom',
};

const STATUS_CONFIG = {
  PAID:    { label: 'Closed',   bg: 'bg-gray-100 text-gray-500 border-gray-200',         dot: 'bg-gray-400'    },
  OVERDUE: { label: 'Overdue',  bg: 'bg-red-50 text-red-700 border-red-200',             dot: 'bg-red-500'     },
  PARTIAL: { label: 'Active',   bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  PENDING: { label: 'Upcoming', bg: 'bg-amber-50 text-amber-700 border-amber-200',       dot: 'bg-amber-500'   },
};

const getStatusInfo = (period) => {
  const dueDate = new Date(period.dueDate);
  const today   = new Date();
  if (period.collectedAmount && period.totalAmount && period.collectedAmount >= period.totalAmount)
    return 'PAID';
  if (dueDate < today) return 'OVERDUE';
  if (period.collectedAmount && period.collectedAmount > 0) return 'PARTIAL';
  return 'PENDING';
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000)   return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000)     return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
};

// ─── Status Pill ──────────────────────────────────────────────────────────────
const StatusPill = ({ statusKey }) => {
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.PENDING;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold ${cfg.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

// ─── Type Badge ───────────────────────────────────────────────────────────────
const TypeBadge = ({ type }) => {
  const style = TYPE_BADGE_STYLE[type] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${style}`}>
      {typeLabels[type] || type}
    </span>
  );
};

// ─── Helper: unwrap various API response shapes into an array ────────────────
const unwrapList = (r) =>
  Array.isArray(r)                 ? r :
  Array.isArray(r?.years)          ? r.years :
  Array.isArray(r?.data)           ? r.data :
  Array.isArray(r?.content)        ? r.content :
  Array.isArray(r?.data?.years)    ? r.data.years :
  Array.isArray(r?.data?.data)     ? r.data.data :
  Array.isArray(r?.data?.content)  ? r.data.content : [];

// ─── Period Modal ─────────────────────────────────────────────────────────────
function PeriodModal({ isOpen, onClose, period, academicYear, onSuccess }) {
  const isEdit = !!period;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: 'QUARTERLY', academicYearId: '', academicYearLabel: '', dueDate: '', notes: '',
  });

  // Academic years dropdown data
  const [academicYears,        setAcademicYears]        = useState([]);
  const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
  const [currentAcademicYearId, setCurrentAcademicYearId] = useState(null);

  // Fetch academic years (with isCurrent flags) whenever the modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchAcademicYears = async () => {
      setAcademicYearsLoading(true);
      try {
        const response = await getAcademicYearsLov();
        const list = unwrapList(response);

        // Sort: current first, then newest to oldest
        const sorted = [...list].sort((a, b) => {
          if (a.isCurrent) return -1;
          if (b.isCurrent) return 1;
          return (b.id ?? 0) - (a.id ?? 0);
        });

        setAcademicYears(sorted);

        const current = sorted.find((y) => y.isCurrent);
        if (current?.id != null) {
          setCurrentAcademicYearId(current.id);
        } else if (academicYear?.id != null) {
          setCurrentAcademicYearId(academicYear.id);
        }
      } catch (error) {
        console.error('Failed to fetch academic years', error);
        // Fallback: at least show the context's current academic year
        if (academicYear?.id != null) {
          setAcademicYears([{ id: academicYear.id, label: academicYear.label, isCurrent: true }]);
          setCurrentAcademicYearId(academicYear.id);
        } else {
          setAcademicYears([]);
        }
      } finally {
        setAcademicYearsLoading(false);
      }
    };

    fetchAcademicYears();
  }, [isOpen, academicYear]);

  useEffect(() => {
    if (!isOpen) return;
    if (period) {
      setForm({
        name:              period.name || '',
        type:              period.type || 'QUARTERLY',
        academicYearId:    period.academicYearId != null ? String(period.academicYearId) : (academicYear?.id != null ? String(academicYear.id) : ''),
        academicYearLabel: academicYear?.label || period.academicYearLabel || '',
        dueDate:           period.dueDate ? period.dueDate.split('T')[0] : '',
        notes:             period.notes || '',
      });
    } else {
      setForm({
        name: '',
        type: 'QUARTERLY',
        academicYearId: academicYear?.id != null ? String(academicYear.id) : '',
        academicYearLabel: academicYear?.label || '',
        dueDate: '',
        notes: '',
      });
    }
  }, [isOpen, period, academicYear]);

  // Auto-select current academic year once the list arrives, if nothing chosen yet
  useEffect(() => {
    if (!isOpen) return;
    if (currentAcademicYearId == null) return;
    if (form.academicYearId) return;

    const cur = academicYears.find((y) => Number(y.id) === Number(currentAcademicYearId));
    setForm((p) => ({
      ...p,
      academicYearId: String(currentAcademicYearId),
      academicYearLabel: cur?.label || p.academicYearLabel,
    }));
  }, [isOpen, currentAcademicYearId, academicYears]);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleAcademicYearChange = (value) => {
    const selected = academicYears.find((y) => String(y.id) === String(value));
    setForm((p) => ({
      ...p,
      academicYearId: value,
      academicYearLabel: selected?.label || p.academicYearLabel,
    }));
  };

  const selectedAcademicYearObj = academicYears.find((y) => String(y.id) === String(form.academicYearId));
  const isSelectedCurrent =
    !!selectedAcademicYearObj &&
    (selectedAcademicYearObj.isCurrent ||
      (currentAcademicYearId != null && Number(selectedAcademicYearObj.id) === Number(currentAcademicYearId)));

  const handleSubmit = async () => {
    if (!form.name.trim())     { toast.error('Validation', 'Period name is required');        return; }
    if (!form.type)            { toast.error('Validation', 'Period type is required');        return; }
    if (!form.dueDate)         { toast.error('Validation', 'Due date is required');           return; }
    if (!form.academicYearId)  { toast.error('Validation', 'Academic year is required');      return; }

    setLoading(true);
    try {
      const payload = {
        name:              form.name.trim(),
        type:              form.type,
        academicYearId:    Number(form.academicYearId),
        academicYearLabel: form.academicYearLabel,
        dueDate:           form.dueDate,
        notes:             form.notes.trim(),
      };
      if (isEdit) {
        await updateFeePeriod(period.id, payload);
        toast.success('Period Updated', 'Fee period has been updated successfully.');
      } else {
        await createFeePeriod(payload);
        toast.success('Period Created', 'Fee period has been created successfully.');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error('Save Failed', error.message || `Failed to ${isEdit ? 'update' : 'create'} fee period`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">{isEdit ? 'Edit Fee Period' : 'New Fee Period'}</h2>
            <p className="text-xs text-gray-400 mt-0.5">AY {form.academicYearLabel || academicYear?.label}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <Input
              label="Period Name"
              value={form.name}
              onChange={(v) => set('name', v)}
              placeholder="e.g. Q1, Q3, October, Term 1, Annual…"
              required
            />
            <div className="text-xs text-gray-400 mt-1">A clear name visible to staff when collecting payments.</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Type <span className="text-red-500">*</span>
            </label>
            <Select
              value={form.type}
              onChange={(v) => set('type', v)}
              options={[
                { value: 'MONTHLY',     label: 'Monthly'           },
                { value: 'QUARTERLY',   label: 'Quarterly'         },
                { value: 'HALF_YEARLY', label: 'Half-Yearly'       },
                { value: 'YEARLY',      label: 'Yearly'            },
                { value: 'CUSTOM',      label: 'Custom / One-time' },
              ]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Due Date"
              type="date"
              value={form.dueDate}
              onChange={(v) => set('dueDate', v)}
              required
            />
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Academic Year <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.academicYearId}
                onChange={handleAcademicYearChange}
                disabled={academicYearsLoading}
                options={[
                  { value: '', label: academicYearsLoading ? 'Loading...' : 'Select Academic Year' },
                  ...academicYears.map((year) => {
                    const isCur =
                      year.isCurrent ||
                      (currentAcademicYearId != null && Number(year.id) === Number(currentAcademicYearId));
                    return {
                      value: String(year.id),
                      label: `${isCur ? '● ' : ''}${year.label}${isCur ? ' (Current)' : ''}`,
                    };
                  }),
                ]}
              />
              {!academicYearsLoading && isSelectedCurrent && (
                <div className="mt-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-green-50 border border-green-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-600">Current Academic Year</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder="e.g. Second quarter of the academic year…"
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Saving…' : isEdit ? 'Update Period' : 'Save Period'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Period Card ──────────────────────────────────────────────────────────────
const PeriodCard = ({ p, onEdit, onDelete, onGoToStructures }) => {
  const statusKey   = getStatusInfo(p);
  const accentGrad  = TYPE_ACCENT[p.type] || 'from-gray-400 to-gray-500';
  const canDelete   = p.structureCount === 0 && statusKey !== 'PAID';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col group">
      {/* Colored top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentGrad}`} />

      {/* Card body */}
      <div className="p-5 flex-1 flex flex-col gap-4">
        {/* Header: type badge + status */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#1E3A5F]/8 flex items-center justify-center flex-shrink-0">
              <Calendar size={14} className="text-[#1E3A5F]" />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-gray-900 truncate">{p.name}</div>
              <TypeBadge type={p.type} />
            </div>
          </div>
          <StatusPill statusKey={statusKey} />
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100" />

        {/* Due date */}
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Clock size={12} className="text-gray-400 flex-shrink-0" />
          <span>Due <strong className="text-gray-700">{formatDate(p.dueDate)}</strong></span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <Layers size={10} /> Structures
            </div>
            <div className="text-sm font-bold text-gray-800">{p.structureCount || 0}</div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
            <div className="flex items-center gap-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">
              <Users size={10} /> Students
            </div>
            <div className="text-sm font-bold text-gray-800">{p.studentCount || 0}</div>
          </div>
        </div>

        {/* Collection bar — only show if there's data */}
        {(p.totalAmount > 0) && (
          <div>
            <div className="flex justify-between text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <span>Collected</span>
              <span>{formatCurrency(p.collectedAmount || 0)} / {formatCurrency(p.totalAmount)}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((p.collectedAmount || 0) / p.totalAmount) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: actions */}
      <div className="border-t border-gray-100 bg-gray-50/60 px-4 py-3 flex items-center justify-between gap-2">
        {/* View structures */}
        <button
          onClick={() => onGoToStructures(p.id)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-[#2563EB] border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
          <Layers size={12} /> Structures <ArrowRight size={11} />
        </button>

        <div className="flex items-center gap-1.5">
          {statusKey !== 'PAID' && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(p); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-[#1E3A5F] border border-[#1E3A5F]/20 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap">
              <Pencil size={12} /> Edit
            </button>
          )}
          {canDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(p); }}
              className="flex items-center gap-1 px-2.5 py-1.5 text-[11.5px] font-semibold text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── FeePeriods ───────────────────────────────────────────────────────────────
const FeePeriods = ({ onGoToStructures }) => {
  const { currentAcademicYear } = useContext(UserContext);
  const academicYearId    = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;

  const [modal,      setModal]      = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periods,    setPeriods]    = useState([]);
  const [loading,    setLoading]    = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, period: null, loading: false });

  const fetchPeriods = async () => {
    if (!academicYearId) return;
    setLoading(true);
    try {
      const data = await getFeePeriods(academicYearId);
      setPeriods(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Fetch Failed', 'Failed to fetch fee periods');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!academicYearId) return;
    fetchPeriods();
  }, [academicYearId]);

  const openNew       = ()  => { setEditPeriod(null); setModal(true); };
  const openEdit      = (p) => { setEditPeriod(p);    setModal(true); };
  const close         = ()  => { setModal(false);     setEditPeriod(null); };
  const handleSuccess = ()  => fetchPeriods();

  const goToStructures = (periodId) => {
    if (onGoToStructures) onGoToStructures(periodId);
  };

  const promptDelete = (p) => setDeleteModal({ open: true, period: p, loading: false });
  const cancelDelete = () => setDeleteModal({ open: false, period: null, loading: false });

  const confirmDelete = async () => {
    const p = deleteModal.period;
    if (!p) return;
    setDeleteModal((prev) => ({ ...prev, loading: true }));
    try {
      await deleteFeePeriod(p.id);
      toast.success('Period Deleted', `"${p.name}" has been permanently removed.`);
      cancelDelete();
      fetchPeriods();
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
      toast.error('Delete Failed', error.message || 'Could not delete the fee period. Please try again.');
    }
  };

  if (!academicYearId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">⏳ Waiting for academic year…</div>
      </div>
    );
  }

  if (loading && periods.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading fee periods…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Periods</h1>
          <p className="text-sm text-gray-400 mt-0.5">Define named installment periods · AY {academicYearLabel}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
          <Plus size={15} /> New Fee Period
        </button>
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>
          Fee Periods define <strong>when</strong> fee is due. After creating a period, attach class-wise fee
          structures from the <strong>Fee Structures</strong> tab.
        </span>
      </div>

      {/* ── Cards section ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
            Fee Periods
            {periods.length > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                {periods.length}
              </span>
            )}
          </h2>
          {loading && (
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-transparent rounded-full animate-spin" />
              Refreshing…
            </div>
          )}
        </div>

        {/* Empty state */}
        {periods.length === 0 && !loading ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Calendar size={20} className="text-gray-400" />
            </div>
            <div className="text-sm font-semibold text-gray-500">No fee periods yet</div>
            <div className="text-xs text-gray-400 mt-1 mb-4">Get started by creating your first fee period.</div>
            <button onClick={openNew}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors">
              New Fee Period
            </button>
          </div>
        ) : (
          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {periods.map((p) => (
                <PeriodCard
                  key={p.id}
                  p={p}
                  onEdit={openEdit}
                  onDelete={promptDelete}
                  onGoToStructures={goToStructures}
                />
              ))}

              {/* Add new placeholder card */}
              <div
                onClick={openNew}
                className="rounded-2xl border-[1.5px] border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] hover:bg-blue-50/50 transition-all duration-200 min-h-[200px] gap-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Plus size={18} className="text-gray-400" />
                </div>
                <div className="text-sm font-semibold text-gray-500">New Fee Period</div>
                <div className="text-[11px] text-gray-400">Add Q3, October, etc.</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer count */}
        {periods.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50">
            <p className="text-xs text-gray-400">Showing {periods.length} period{periods.length !== 1 ? 's' : ''}</p>
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      <PeriodModal
        isOpen={modal}
        onClose={close}
        period={editPeriod}
        academicYear={currentAcademicYear}
        onSuccess={handleSuccess}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        loading={deleteModal.loading}
        periodName={deleteModal.period?.name || ''}
      />
    </div>
  );
};

export default FeePeriods;