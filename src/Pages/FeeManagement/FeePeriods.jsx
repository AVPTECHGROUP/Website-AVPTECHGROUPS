import React, { useState, useEffect, useContext } from 'react';
import Input from '../../Components/FeeModal/Input';
import Select from '../../Components/FeeModal/Select';
import {
  Plus, X, Pencil, Trash2, ArrowRight, Calendar, Users, Layers,
  CheckCircle2, AlertCircle, AlertTriangle, Info, Clock, Lock, Unlock,
} from 'lucide-react';
import {
  getFeePeriods,
  createFeePeriod,
  updateFeePeriod,
  deleteFeePeriod,
  closeFeePeriod,
  reopenFeePeriod,
} from '../../Api/FeeManagement/FeePeriods';
import { UserContext } from '../../ContextAPI/UserContext';

// Import Constants
import {
  STATUSES,
  PERIOD_TYPES,
  PERIOD_TYPE_LABELS,
  PERIOD_TYPE_GRADIENT,
  PERIOD_TYPE_BADGE_STYLE,
  STATUS_CONFIG_ADVANCED,
  FEE_PERIOD_STRINGS
} from '../../Constants/StringConstants/FeeManagementConstants';

// FIX: Period Name must be letters and spaces only — no digits, no symbols.
// Same rule as Custom Name in FeeStructures.jsx. Used both to strip
// disallowed characters as the user types/pastes and to validate on submit.
const NAME_ONLY_REGEX = /^[A-Za-z\s]*$/;
const ALPHANUMERIC_REGEX = /^[A-Za-z0-9\s]*$/;
const sanitizeNameInput = (val) => val.replace(/[^A-Za-z0-9\s]/g, '');

// FIX: Pull start/end bounds for the current academic year off whatever
// shape `currentAcademicYear` happens to have. UserContext.js isn't visible
// from here, so this tries a few common field-name variants. If none match,
// it silently falls back to "no upper bound / today as lower bound" so the
// form still works — but the AY-only restriction won't actually apply until
// the correct field name is confirmed.
const getAcademicYearBounds = (academicYear) => {
  const rawStart = academicYear?.startDate || academicYear?.fromDate || academicYear?.start || academicYear?.beginDate;
  const rawEnd = academicYear?.endDate || academicYear?.toDate || academicYear?.end || academicYear?.finishDate;

  const toDateStr = (d) => {
    if (!d) return null;
    const parsed = new Date(d);
    return isNaN(parsed.getTime()) ? null : parsed.toISOString().split('T')[0];
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const ayStartStr = toDateStr(rawStart);
  const ayEndStr = toDateStr(rawEnd);

  // Due date can't be before today, and can't be before the AY start either —
  // whichever is later wins as the lower bound.
  const minDate = ayStartStr && ayStartStr > todayStr ? ayStartStr : todayStr;
  const maxDate = ayEndStr || undefined;

  return { minDate, maxDate };
};

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
    error: <AlertCircle size={15} className="flex-shrink-0 text-red-400" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
    info: <Info size={15} className="flex-shrink-0 text-blue-400" />,
  };

  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
          style={{ animation: 'fpToastIn .22s ease-out' }}>
          {icons[t.type] || icons.info}
          <div className="flex-1 min-w-0">
            {t.title && <div className="text-[13px] font-semibold">{t.title}</div>}
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
  error: (title, message) => _dispatch?.({ type: 'error', title, message }),
  warning: (title, message) => _dispatch?.({ type: 'warning', title, message }),
  info: (title, message) => _dispatch?.({ type: 'info', title, message }),
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ open, onClose, onConfirm, loading, periodName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
            <Trash2 size={18} className="text-red-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{FEE_PERIOD_STRINGS.DELETE_TITLE}</h3>
            <p className="text-sm text-gray-500 mt-1">
              <strong className="text-gray-700">{periodName}</strong> {FEE_PERIOD_STRINGS.DELETE_WARNING}
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {FEE_PERIOD_STRINGS.CANCEL}
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? FEE_PERIOD_STRINGS.DELETING : FEE_PERIOD_STRINGS.DELETE_BTN}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Close Period Confirm Modal ───────────────────────────────────────────────
const CloseConfirmModal = ({ open, onClose, onConfirm, loading, periodName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <Lock size={18} className="text-amber-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Close Fee Period?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to close <strong className="text-gray-700">{periodName}</strong>? Once closed,
              no further payments can be recorded against this period.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Closing…' : 'Close Period'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Reopen Period Confirm Modal ──────────────────────────────────────────────
const ReopenConfirmModal = ({ open, onClose, onConfirm, loading, periodName }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
            <Unlock size={18} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">Reopen Fee Period?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to reopen <strong className="text-gray-700">{periodName}</strong>? Payments
              can be recorded against this period again once it's reopened.
            </p>
          </div>
        </div>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Reopening…' : 'Reopen Period'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Constants & Helpers ──────────────────────────────────────────────────────
// FIX: closed periods should never show as Overdue — once a period is
// closed, the due-date-vs-today check is skipped entirely and the status
// falls back to Paid / Partial / Pending based on actual collection.
const getStatusInfo = (period) => {
  const dueDate = new Date(period.dueDate);
  const today = new Date();
  if (period.collectedAmount && period.totalAmount && period.collectedAmount >= period.totalAmount)
    return STATUSES.PAID;
  if (period.status !== 'CLOSED' && dueDate < today) return STATUSES.OVERDUE;
  if (period.collectedAmount && period.collectedAmount > 0) return STATUSES.PARTIAL;
  return STATUSES.PENDING;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount) => {
  if (!amount || amount === 0) return '₹0';
  if (amount >= 10000000) return '₹' + (amount / 10000000).toFixed(1) + 'Cr';
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
};

// Simple text-dot status — used for both payment status and lifecycle status.
// Deliberately plain (dot + text, no pill background) to cut down visual noise.
const StatusText = ({ dotColorClass, textColorClass, label }) => (
  <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold whitespace-nowrap ${textColorClass}`}>
    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotColorClass}`} />
    {label}
  </span>
);

const PAYMENT_STATUS_DOT = {
  [STATUSES.PAID]: 'bg-emerald-500',
  [STATUSES.OVERDUE]: 'bg-red-500',
  [STATUSES.PARTIAL]: 'bg-amber-500',
  [STATUSES.PENDING]: 'bg-gray-400',
};
const PAYMENT_STATUS_TEXT = {
  [STATUSES.PAID]: 'text-emerald-700',
  [STATUSES.OVERDUE]: 'text-red-600',
  [STATUSES.PARTIAL]: 'text-amber-700',
  [STATUSES.PENDING]: 'text-gray-500',
};

const PaymentStatusText = ({ statusKey }) => {
  const cfg = STATUS_CONFIG_ADVANCED[statusKey] || STATUS_CONFIG_ADVANCED[STATUSES.PENDING];
  return (
    <StatusText
      dotColorClass={PAYMENT_STATUS_DOT[statusKey] || 'bg-gray-400'}
      textColorClass={PAYMENT_STATUS_TEXT[statusKey] || 'text-gray-500'}
      label={cfg.label}
    />
  );
};

const LifecycleStatusText = ({ status }) => {
  if (!status) return null;
  const isClosed = status === 'CLOSED';
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold whitespace-nowrap ${isClosed ? 'text-gray-400' : 'text-emerald-600'}`}>
      {isClosed ? <Lock size={10} className="flex-shrink-0" /> : <CheckCircle2 size={10} className="flex-shrink-0" />}
      {isClosed ? 'Closed' : 'Active'}
    </span>
  );
};

// ─── Period Modal ─────────────────────────────────────────────────────────────
// FIX: Academic Year is never user-selectable here anymore — it's always
// pinned to the school's current academic year (from UserContext), for both
// create and edit. The dropdown + the getAcademicYears fetch that used to
// back it have been removed entirely.
// FIX: Type is only editable while creating a new period. Once a period
// exists, its Type is locked (shown read-only) — only Name, Due Date, and
// Notes remain editable on the edit flow.
function PeriodModal({ isOpen, onClose, period, academicYear, onSuccess }) {
  const isEdit = !!period;
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '', type: PERIOD_TYPES.QUARTERLY, academicYearId: '', academicYearLabel: '', dueDate: '', notes: '',
  });

  // FIX: due date is now bounded to the current academic year's start/end
  // (never before today, never outside the AY), instead of just "today
  // onward" — prevents picking a due date like 1999 or a past AY.
  const { minDate, maxDate } = getAcademicYearBounds(academicYear);

  useEffect(() => {
    if (!isOpen) return;
    if (period) {
      setForm({
        name: period.name || '',
        type: period.type || PERIOD_TYPES.QUARTERLY,
        // Always the period's own AY when editing — never user-changeable.
        academicYearId: period.academicYearId || academicYear?.id || '',
        academicYearLabel: period.academicYearLabel || academicYear?.label || '',
        dueDate: period.dueDate ? period.dueDate.split('T')[0] : '',
        notes: period.notes || '',
      });
    } else {
      setForm({
        name: '',
        type: PERIOD_TYPES.QUARTERLY,
        // New periods are always created under the current academic year.
        academicYearId: academicYear?.id || '',
        academicYearLabel: academicYear?.label || '',
        dueDate: '',
        notes: '',
      });
    }
  }, [isOpen, period, academicYear]);

  // FIX: Period Name is letters/spaces only — strip any digit or symbol as
  // the user types or pastes, same rule as Custom Name in FeeStructures.jsx.
  // Every other field goes through unchanged.
  const set = (k, v) => setForm((p) => ({ ...p, [k]: k === 'name' ? sanitizeNameInput(v) : v }));

  const handleSubmit = async () => {
    if (!form.name.trim()) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, FEE_PERIOD_STRINGS.TOAST_VALIDATION_NAME); return; }
    // FIX: belt-and-suspenders check on submit — blocks any numbers or
    // symbols that might slip through, not just what's typed directly.
    if (!ALPHANUMERIC_REGEX.test(form.name)) {
      toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, 'Period name can only contain letters and numbers');
      return;
    }
    // if (!NAME_ONLY_REGEX.test(form.name)) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, 'Period name can only contain letters'); return; }
    if (!form.type) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, FEE_PERIOD_STRINGS.TOAST_VALIDATION_TYPE); return; }
    if (!form.academicYearId) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, 'Please select an academic year'); return; }
    if (!form.dueDate) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, FEE_PERIOD_STRINGS.TOAST_VALIDATION_DATE); return; }
    // FIX: reject a due date outside the current academic year's bounds
    // even if it was somehow typed in manually rather than picked.
    if (minDate && form.dueDate < minDate) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, `Due date can't be before ${formatDate(minDate)}`); return; }
    if (maxDate && form.dueDate > maxDate) { toast.error(FEE_PERIOD_STRINGS.TOAST_VALIDATION, `Due date can't be after ${formatDate(maxDate)} (end of ${form.academicYearLabel || academicYear?.label})`); return; }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type,
        academicYearId: form.academicYearId,
        academicYearLabel: form.academicYearLabel,
        dueDate: form.dueDate,
        notes: form.notes.trim(),
      };
      if (isEdit) {
        await updateFeePeriod(period.id, payload);
        toast.success(FEE_PERIOD_STRINGS.TOAST_UPDATED_TITLE, FEE_PERIOD_STRINGS.TOAST_UPDATED_MSG);
      } else {
        await createFeePeriod(payload);
        toast.success(FEE_PERIOD_STRINGS.TOAST_CREATED_TITLE, FEE_PERIOD_STRINGS.TOAST_CREATED_MSG);
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(FEE_PERIOD_STRINGS.TOAST_SAVE_FAILED, error.message || `Failed to ${isEdit ? 'update' : 'create'} fee period`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    // FIX: removed the backdrop onClick-to-close handler below so this
    // modal only closes via the explicit X button (or Cancel/Save flow).
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">{isEdit ? FEE_PERIOD_STRINGS.MODAL_EDIT_TITLE : FEE_PERIOD_STRINGS.MODAL_NEW_TITLE}</h2>
            <p className="text-xs text-gray-400 mt-0.5">AY {form.academicYearLabel || academicYear?.label}</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <Input
              label={FEE_PERIOD_STRINGS.LABEL_NAME}
              value={form.name}
              onChange={(v) => set('name', v)}
              placeholder={FEE_PERIOD_STRINGS.PLACEHOLDER_NAME}
              required
            />
            <div className="text-xs text-gray-400 mt-1">{FEE_PERIOD_STRINGS.HELP_NAME}</div>
          </div>

          {/* Type: editable only when creating. Locked (read-only) once the
                period exists, since changing it after structures/payments
                are attached would be structurally inconsistent. */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {FEE_PERIOD_STRINGS.LABEL_TYPE} {!isEdit && <span className="text-red-500">*</span>}
            </label>
            {isEdit ? (
              <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                {PERIOD_TYPE_LABELS[form.type] || form.type}
              </div>
            ) : (
              <Select
                value={form.type}
                onChange={(v) => set('type', v)}
                options={Object.keys(PERIOD_TYPES).map(key => ({
                  value: PERIOD_TYPES[key],
                  label: PERIOD_TYPE_LABELS[PERIOD_TYPES[key]]
                }))}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label={FEE_PERIOD_STRINGS.LABEL_DUE_DATE}
              type="date"
              value={form.dueDate}
              min={minDate}
              max={maxDate}
              onChange={(v) => set('dueDate', v)}
              required
            />

            {/* Academic Year: never a dropdown — always the school's
                  current academic year, shown read-only, for both create
                  and edit. */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{FEE_PERIOD_STRINGS.LABEL_ACADEMIC_YEAR}</label>
              <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold truncate">
                {form.academicYearLabel || academicYear?.label || '—'}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{FEE_PERIOD_STRINGS.LABEL_NOTES}</label>
            <textarea
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              placeholder={FEE_PERIOD_STRINGS.PLACEHOLDER_NOTES}
              rows={2}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
            {FEE_PERIOD_STRINGS.CANCEL}
          </button>
          <button onClick={handleSubmit} disabled={loading}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? FEE_PERIOD_STRINGS.BTN_SAVING : isEdit ? FEE_PERIOD_STRINGS.BTN_UPDATE : FEE_PERIOD_STRINGS.BTN_SAVE}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Period Card (redesigned — simpler, quieter, easier to scan) ──────────────
const PeriodCard = ({ p, onEdit, onDelete, onClosePeriod, onReopenPeriod, onGoToStructures }) => {
  const statusKey = getStatusInfo(p);
  const isClosed = p.status === 'CLOSED';
  const canDelete = p.structureCount === 0 && statusKey !== STATUSES.PAID && !isClosed;
  const canEdit = statusKey !== STATUSES.PAID && !isClosed;

  // FIX: a closed period that isn't Paid/Partial used to fall back to
  // STATUSES.PENDING, whose label is "Upcoming" — wrong once the period is
  // closed and its due date has already passed. Show a neutral "Unpaid"
  // instead in that case; Paid/Partial still render normally since those
  // reflect real collection data.
  const showAsUnpaid = isClosed && statusKey !== STATUSES.PAID && statusKey !== STATUSES.PARTIAL;

  return (
    <div className={`h-full bg-white rounded-xl border shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden flex flex-col ${isClosed ? 'border-gray-150 bg-gray-50/40' : 'border-gray-200'}`}>
      {/* Card body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Row 1: Name + lifecycle status */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-bold text-gray-900 leading-snug break-words" title={p.name}>
            {p.name}
          </h3>
          <LifecycleStatusText status={p.status} />
        </div>

        {/* Row 2: type · payment status, plain text separated by a dot */}
        <div className="flex items-center gap-2 text-xs text-gray-500 -mt-1">
          <span className="font-medium">{PERIOD_TYPE_LABELS[p.type] || p.type}</span>
          <span className="text-gray-300">•</span>
          {showAsUnpaid ? (
            <StatusText dotColorClass="bg-gray-400" textColorClass="text-gray-500" label="Unpaid" />
          ) : (
            <PaymentStatusText statusKey={statusKey} />
          )}
        </div>

        {/* Due date */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-1 border-t border-gray-100">
          <Clock size={12} className="text-gray-400 flex-shrink-0" />
          Due <span className="font-semibold text-gray-700">{formatDate(p.dueDate)}</span>
        </div>

        {/* Structures / Students — plain inline row, no boxes */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1.5">
            <Layers size={12} className="text-gray-400" />
            <span className="font-semibold text-gray-800">{p.structureCount || 0}</span> Structures
          </span>

        </div>

        {/* Collection progress — only when there's data */}
        {(p.totalAmount > 0) && (
          <div className="pt-1">
            <div className="flex justify-between items-center text-[11px] text-gray-500 mb-1 gap-2">
              <span>Collected</span>
              <span className="font-semibold text-gray-700">{formatCurrency(p.collectedAmount || 0)} / {formatCurrency(p.totalAmount)}</span>
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

      {/* Footer: actions — quieter, text-first, icons only for destructive/secondary */}
      <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between gap-2">
        <button
          onClick={() => onGoToStructures(p.id)}
          className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] hover:underline">
          View Structures <ArrowRight size={11} />
        </button>

        <div className="flex items-center gap-1">
          {isClosed ? (
            <button
              onClick={(e) => { e.stopPropagation(); onReopenPeriod(p); }}
              title="Reopen period"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-emerald-600">
              <Unlock size={13} />
            </button>
          ) : (
            <button
              onClick={(e) => { e.stopPropagation(); onClosePeriod(p); }}
              title="Close period"
              className="h-7 w-7 rounded-lg flex items-center justify-center text-amber-600 ">
              <Lock size={13} />
            </button>
          )}
          {canEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(p); }}
              title="Edit period"
              className="h-7 w-7 rounded-lg flex items-center justify-center  text-[#1E3A5F] bg-blue-50 ">
              <Pencil size={13} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(p); }}
              title="Delete period"
              className="h-7 w-7 rounded-lg flex items-center justify-center  text-red-600 ">
              <Trash2 size={13} />
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
  const academicYearId = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;

  const [modal, setModal] = useState(false);
  const [editPeriod, setEditPeriod] = useState(null);
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ open: false, period: null, loading: false });
  const [closeModal, setCloseModal] = useState({ open: false, period: null, loading: false });
  const [reopenModal, setReopenModal] = useState({ open: false, period: null, loading: false });

  const fetchPeriods = async () => {
    if (!academicYearId) return;
    setLoading(true);
    try {
      const data = await getFeePeriods(academicYearId);
      setPeriods(Array.isArray(data) ? data : []);
    } catch {
      toast.error(FEE_PERIOD_STRINGS.TOAST_FETCH_FAILED, FEE_PERIOD_STRINGS.TOAST_FETCH_FAILED_MSG);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!academicYearId) return;
    fetchPeriods();
  }, [academicYearId]);

  const openNew = () => { setEditPeriod(null); setModal(true); };
  const openEdit = (p) => { setEditPeriod(p); setModal(true); };
  const close = () => { setModal(false); setEditPeriod(null); };
  const handleSuccess = () => fetchPeriods();

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
      toast.success(FEE_PERIOD_STRINGS.TOAST_DELETED_TITLE, `"${p.name}" has been permanently removed.`);
      cancelDelete();
      fetchPeriods();
    } catch (error) {
      setDeleteModal((prev) => ({ ...prev, loading: false }));
      toast.error(FEE_PERIOD_STRINGS.TOAST_DELETE_FAILED, error.message || 'Could not delete the fee period. Please try again.');
    }
  };

  // ── Close period flow ──────────────────────────────────────────────────────
  const promptClose = (p) => setCloseModal({ open: true, period: p, loading: false });
  const cancelClose = () => setCloseModal({ open: false, period: null, loading: false });

  const confirmClose = async () => {
    const p = closeModal.period;
    if (!p) return;
    setCloseModal((prev) => ({ ...prev, loading: true }));
    try {
      await closeFeePeriod(p.id);
      toast.success('Period Closed', `"${p.name}" is now closed. No further payments can be recorded against it.`);
      cancelClose();
      fetchPeriods();
    } catch (error) {
      setCloseModal((prev) => ({ ...prev, loading: false }));
      toast.error('Close Failed', error.message || 'Could not close the fee period. Please try again.');
    }
  };

  // ── Reopen period flow ─────────────────────────────────────────────────────
  const promptReopen = (p) => setReopenModal({ open: true, period: p, loading: false });
  const cancelReopen = () => setReopenModal({ open: false, period: null, loading: false });

  const confirmReopen = async () => {
    const p = reopenModal.period;
    if (!p) return;
    setReopenModal((prev) => ({ ...prev, loading: true }));
    try {
      await reopenFeePeriod(p.id);
      toast.success('Period Reopened', `"${p.name}" is now open again. Payments can be recorded against it.`);
      cancelReopen();
      fetchPeriods();
    } catch (error) {
      setReopenModal((prev) => ({ ...prev, loading: false }));
      toast.error('Reopen Failed', error.message || 'Could not reopen the fee period. Please try again.');
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
    <div className="max-w-[1440px] mx-auto space-y-5 px-3 sm:px-4 lg:px-6">
      <ToastContainer />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{FEE_PERIOD_STRINGS.HEADER_TITLE}</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{FEE_PERIOD_STRINGS.HEADER_SUBTITLE} {academicYearLabel}</p>
        </div>
        <button onClick={openNew}
          className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm self-start sm:self-auto">
          <Plus size={15} /> {FEE_PERIOD_STRINGS.BTN_NEW_PERIOD}
        </button>
      </div>

      {/* ── Info banner ───────────────────────────────────────────────────── */}
      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
        <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
        <span>
          {FEE_PERIOD_STRINGS.INFO_BANNER}
        </span>
      </div>

      {/* ── Cards section ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
            {FEE_PERIOD_STRINGS.HEADER_TITLE}
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
            <div className="text-sm font-semibold text-gray-500">{FEE_PERIOD_STRINGS.EMPTY_TITLE}</div>
            <div className="text-xs text-gray-400 mt-1 mb-4">{FEE_PERIOD_STRINGS.EMPTY_DESC}</div>
            <button onClick={openNew}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors">
              {FEE_PERIOD_STRINGS.BTN_NEW_PERIOD}
            </button>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
              {periods.map((p) => (
                <PeriodCard
                  key={p.id}
                  p={p}
                  onEdit={openEdit}
                  onDelete={promptDelete}
                  onClosePeriod={promptClose}
                  onReopenPeriod={promptReopen}
                  onGoToStructures={goToStructures}
                />
              ))}

              {/* Add new placeholder card */}
              <div
                onClick={openNew}
                className="rounded-xl border-[1.5px] border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#2563EB] hover:bg-blue-50/50 transition-all duration-200 min-h-[180px] gap-2">
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                  <Plus size={18} className="text-gray-400" />
                </div>
                <div className="text-sm font-semibold text-gray-500">{FEE_PERIOD_STRINGS.BTN_NEW_PERIOD}</div>
                <div className="text-[11px] text-gray-400">Add Q3, October, etc.</div>
              </div>
            </div>
          </div>
        )}

        {/* Footer count */}
        {periods.length > 0 && (
          <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/50">
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

      <CloseConfirmModal
        open={closeModal.open}
        onClose={cancelClose}
        onConfirm={confirmClose}
        loading={closeModal.loading}
        periodName={closeModal.period?.name || ''}
      />

      <ReopenConfirmModal
        open={reopenModal.open}
        onClose={cancelReopen}
        onConfirm={confirmReopen}
        loading={reopenModal.loading}
        periodName={reopenModal.period?.name || ''}
      />
    </div>
  );
};

export default FeePeriods;