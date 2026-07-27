import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import Button from '../../Components/FeeModal/Button.jsx';
import Badge from '../../Components/FeeModal/Badge.jsx';
import Modal from '../../Components/FeeModal/Modal.jsx';
import Select from '../../Components/FeeModal/Select.jsx';
import Input from '../../Components/FeeModal/Input.jsx';
import { Plus, X, Pencil, Eye, Trash2, AlertTriangle, CheckCircle2, Info, AlertCircle, Calendar, Layers, FileText } from 'lucide-react';
import {
  getFeeStructures,
  createFeeStructure,
  getFeeStructureById,
  updateFeeStructure,
  deleteFeeStructure,
} from '../../Api/FeeManagement/FeeStructures.js';
import { getFeePeriods } from '../../Api/FeeManagement/FeePeriods.js';
import { UserContext } from '../../ContextAPI/UserContext.jsx';
import SectionSubjectService from '../../Api/Academics/SectionSubjectService.js';
// NOTE: confirm this path matches where you actually export getStudentByClass.
import { getStudentByClass } from '../../Api/Students/StudentsApi.js';
// Import Constants
import {
  STATUSES,
  STATUS_PILL_STYLES,
  COMPONENT_TYPE_OPTIONS,
  REQUIRES_CUSTOM_NAME,
  FEE_STRUCTURE_STRINGS
} from '../../Constants/StringConstants/FeeManagementConstants.js';

// Transport is billed/tracked separately (see the transport-due integration
// in Collections & History), so it's never an option when building a
// structure's fee components — filtered at the point of use rather than
// editing the shared constants file, so nothing else that reuses
// COMPONENT_TYPE_OPTIONS is affected.
const STRUCTURE_COMPONENT_OPTIONS = COMPONENT_TYPE_OPTIONS.filter((o) => o.value !== 'TRANSPORT_FEE');

// FIX: Custom Name (used for Misc Fee / Other Fee components) must be
// letters and spaces only — no digits, no symbols. This regex is used both
// to strip disallowed characters as the user types and to validate on
// submit (covers paste, which onChange filtering alone wouldn't fully block
// if a component were to bypass updateComponent).
const NAME_ONLY_REGEX = /^[A-Za-z\s]*$/;
const sanitizeNameInput = (val) => val.replace(/[^A-Za-z\s]/g, '');

// FIX (issue 1 — negative amounts): amounts must be a non-negative whole
// number. Strip anything that isn't a digit (this removes the minus sign
// and decimal point entirely, so a negative or fractional value can never
// be typed or pasted in, and the stepper increments 0 → 1 → 2 instead of
// crawling up by 0.01).
const sanitizeAmountInput = (val) => val.replace(/[^0-9]/g, '');

// Structure Name is a free-text label (e.g. "Regular Fee Structure",
// "Sibling Discount Structure") used purely for display, so it allows
// letters, numbers, spaces and a small set of common punctuation — not
// restricted to letters-only like the component Custom Name field.
const sanitizeStructureNameInput = (val) => val.replace(/[^A-Za-z0-9\s&\-',.()/]/g, '');
const STRUCTURE_NAME_MAX_LEN = 60;

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
    error: <AlertCircle size={15} className="flex-shrink-0 text-red-400" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
    info: <Info size={15} className="flex-shrink-0 text-blue-400" />,
  };

  return (
      <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
            <div key={t.id}
                 className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
                 style={{ animation: 'fsToastIn .22s ease-out' }}>
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
        <style>{`@keyframes fsToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
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
// FIX (issue 3 — accidental close): the backdrop click-to-close handler has
// been removed. This modal now only closes via the explicit Cancel button
// or the X (there is no X here, so Cancel is the only escape hatch), never
// by clicking outside the dialog.
const DeleteConfirmModal = ({ open, onClose, onConfirm, loading, structureName }) => {
  if (!open) return null;
  return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
              <Trash2 size={18} className="text-red-600" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{FEE_STRUCTURE_STRINGS.DELETE_TITLE}</h3>
              <p className="text-sm text-gray-500 mt-1">
                <strong className="text-gray-700">{structureName}</strong> {FEE_STRUCTURE_STRINGS.DELETE_WARNING}
              </p>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onClose} disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {FEE_STRUCTURE_STRINGS.CANCEL}
            </button>
            <button onClick={onConfirm} disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? FEE_STRUCTURE_STRINGS.DELETING : FEE_STRUCTURE_STRINGS.DELETE_BTN}
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
  if (amount >= 100000) return '₹' + (amount / 100000).toFixed(1) + 'L';
  if (amount >= 1000) return '₹' + (amount / 1000).toFixed(1) + 'K';
  return '₹' + amount.toLocaleString('en-IN');
};

// ─── Status Pill (used inside the modals — unchanged) ─────────────────────────
const StatusPill = ({ status }) => {
  const statusKey = status?.toUpperCase() || STATUSES.DRAFT;
  const bgStyle = STATUS_PILL_STYLES[statusKey] || STATUS_PILL_STYLES[STATUSES.DRAFT];
  const label = statusKey === STATUSES.ACTIVE ? 'Active' : statusKey === STATUSES.DRAFT ? 'Draft' : 'Locked';

  return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold ${bgStyle}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${statusKey === STATUSES.ACTIVE ? 'bg-emerald-500' : statusKey === STATUSES.DRAFT ? 'bg-amber-500' : 'bg-gray-400'
      }`} />
        {label}
    </span>
  );
};

// Simple text-dot status — mirrors the plain, quiet style used on the Fee
// Periods card (dot + text, no pill background) so both pages read the
// same way.
const STATUS_DOT = {
  [STATUSES.ACTIVE]: 'bg-emerald-500',
  [STATUSES.DRAFT]: 'bg-amber-500',
  [STATUSES.LOCKED]: 'bg-gray-400',
};
const STATUS_TEXT_COLOR = {
  [STATUSES.ACTIVE]: 'text-emerald-700',
  [STATUSES.DRAFT]: 'text-amber-700',
  [STATUSES.LOCKED]: 'text-gray-500',
};
const StatusDotText = ({ status }) => {
  const key = status?.toUpperCase() || STATUSES.DRAFT;
  const label = key === STATUSES.ACTIVE ? 'Active' : key === STATUSES.DRAFT ? 'Draft' : 'Locked';
  return (
      <span className={`inline-flex items-center gap-1.5 text-[11.5px] font-semibold whitespace-nowrap ${STATUS_TEXT_COLOR[key] || 'text-gray-500'}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[key] || 'bg-gray-400'}`} />
        {label}
    </span>
  );
};

// ─── View Details Modal ───────────────────────────────────────────────────────
// FIX: now takes `periods` (for a period-name fallback) and `allClasses`
// (the school's class list WITH studentCount merged in via getStudentByClass
// in fetchClasses below). structure.classes from the detail endpoint only
// carries id/name, no count and sometimes no nested feePeriod object, which
// is why Period/Students previously showed blank or "—".
// FIX (issue 3): backdrop click-to-close removed — only the X button closes
// this modal now.
// UPDATE: added a "Structure Name" field to the top grid (now a clean 2×2
// layout: Structure Name, Period, Classes, Status) so the label given at
// creation time is visible here too, not just on the card.
function ViewDetailsModal({ isOpen, onClose, structure, periods = [], allClasses = [] }) {
  if (!isOpen || !structure) return null;

  const periodName = structure.feePeriod?.name
      || periods.find((p) => p.id === structure.feePeriodId)?.name
      || '—';

  const structureName = structure.structureName || structure.name || '—';

  const computedTotal = structure.components?.reduce((s, c) => s + (Number(c.amount) || 0), 0);
  const displayTotal = structure.totalAmount ?? computedTotal ?? 0;

  const studentCount = structure.studentCount ?? (
      structure.classes?.reduce((sum, c) => {
        const match = allClasses.find((cl) => cl.id === c.id);
        return sum + (match?.studentCount ?? c.studentCount ?? 0);
      }, 0) || 0
  );

  return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h2 className="text-[15px] font-bold text-gray-900">{FEE_STRUCTURE_STRINGS.VIEW_TITLE}</h2>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
              <X size={14} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-2 gap-3">
              {[
                ['Structure Name', structureName],
                [FEE_STRUCTURE_STRINGS.LBL_PERIOD, periodName],
                [FEE_STRUCTURE_STRINGS.LBL_CLASSES, structure.classes?.map((c) => c.name).join(', ') || '—'],
                [FEE_STRUCTURE_STRINGS.LBL_STATUS, null],
              ].map(([label, val]) => (
                  <div key={label} className="bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
                    <div className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-wider mb-1">{label}</div>
                    {label === FEE_STRUCTURE_STRINGS.LBL_STATUS
                        ? <StatusPill status={structure.status} />
                        : <div className="text-sm font-semibold text-gray-800">{val}</div>
                    }
                  </div>
              ))}
            </div>
            <div>
              <div className="text-[10.5px] font-bold text-gray-400 uppercase tracking-wider mb-2">{FEE_STRUCTURE_STRINGS.LBL_COMPONENTS}</div>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {structure.components?.map((comp, i, arr) => (
                    <div key={i} className={`flex justify-between items-center px-4 py-2.5 text-sm ${i < arr.length - 1 ? 'border-b border-gray-50' : ''} ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                      <span className="text-gray-600">{comp.customName || comp.componentType}</span>
                      <span className="font-semibold text-gray-900">{formatCurrency(comp.amount)}</span>
                    </div>
                ))}
                <div className="flex justify-between items-center px-4 py-3 bg-[#1E3A5F] rounded-b-xl">
                  <span className="text-sm font-bold text-white/80">{FEE_STRUCTURE_STRINGS.LBL_TOTAL}</span>
                  <span className="text-base font-extrabold text-white">{formatCurrency(displayTotal)}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex justify-end px-6 py-4 border-t border-gray-100">
            <button onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              {FEE_STRUCTURE_STRINGS.BTN_CLOSE}
            </button>
          </div>
        </div>
      </div>
  );
}

// ─── Structure Modal (Create / Edit) ─────────────────────────────────────────
// FIX: Academic Year is NEVER a dropdown anymore, in either create or edit
// mode. It's always the school's current academic year (passed in via the
// `academicYear` prop, sourced from UserContext), shown as a plain
// read-only label — exactly the same pattern FeePeriods.jsx already uses
// for its own modal. All the getAcademicYears/getCurrentAcademicYear
// fetching and the year-scoped period refetch have been removed entirely,
// since there is nothing left to switch years for.
//
// FIX: Fee Period is now lockable via `lockedPeriodId` / `lockedPeriodName`.
// When the user arrives here from a specific period's "View Structures"
// button (FeePeriods.jsx → onGoToStructures), the parent passes that
// period's id in on create, and the Fee Period field is shown as a locked,
// read-only value instead of a dropdown — so a structure created from
// "June" can only ever be created for June, not silently redirected to any
// other period/month. When there's no locked period (e.g. navigating to
// Fee Structures directly and clicking "Add Structure"), the dropdown still
// works as before, scoped to the current academic year's periods.
//
// FIX (issue 3): backdrop click-to-close removed — only the X button closes
// this modal now, so an accidental click on the page behind the dialog no
// longer discards in-progress form data.
//
// UPDATE: added an optional "Structure Name" field (Step 1, between
// Academic Year and Fee Period) so a structure can be given a short,
// human-readable label — e.g. "Regular Fee Structure" or "Sibling Discount
// Structure" — that's shown on the card and in View Details instead of
// forcing everyone to identify structures purely by period + class list.
function StructureModal({ isOpen, onClose, structure, periods, classes, onSuccess, academicYear, lockedPeriodId, lockedPeriodName }) {
  const isEdit = !!structure;
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    structureName: '',
    feePeriodId: '',
    classIds: [],
    components: [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
  });

  useEffect(() => {
    if (!isOpen) return;
    if (structure) {
      setForm({
        structureName: structure.structureName || structure.name || '',
        feePeriodId: structure.feePeriodId?.toString() || '',
        classIds: structure.classes?.map((c) => c.id) || [],
        components: structure.components?.map((comp, idx) => ({
          componentType: comp.componentType || 'TUITION_FEE',
          customName: comp.customName || '',
          amount: comp.amount?.toString() || '',
          displayOrder: comp.displayOrder ?? idx,
        })) || [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
      });
    } else {
      setForm({
        structureName: '',
        // FIX: when a specific period was clicked into (lockedPeriodId),
        // pre-fill and pin the form to that period instead of leaving it
        // blank / open to any period.
        feePeriodId: lockedPeriodId ? lockedPeriodId.toString() : '',
        classIds: [],
        components: [{ componentType: 'TUITION_FEE', customName: '', amount: '', displayOrder: 0 }],
      });
    }
  }, [isOpen, structure, lockedPeriodId]);

  const handleStructureNameChange = (val) =>
      setForm((p) => ({ ...p, structureName: sanitizeStructureNameInput(val).slice(0, STRUCTURE_NAME_MAX_LEN) }));

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
          // FIX: Custom Name is letters/spaces only — strip any digit or
          // symbol as the user types (also covers paste, since the pasted
          // text still flows through this handler).
          // FIX (issue 1): Amount can never contain a minus sign — strip it
          // (and any other non-numeric character) as the user types/pastes,
          // so a negative amount can't be entered in the first place.
          let nextVal = val;
          if (field === 'customName') nextVal = sanitizeNameInput(val);
          if (field === 'amount') nextVal = sanitizeAmountInput(val);
          const updated = { ...c, [field]: nextVal };
          if (field === 'componentType' && !REQUIRES_CUSTOM_NAME.includes(val)) updated.customName = '';
          return updated;
        }),
      }));

  const totalAmount = form.components.reduce((s, c) => s + (parseFloat(c.amount) || 0), 0);
  const selectedClasses = classes.filter((c) => form.classIds.includes(c.id));
  const totalStudents = selectedClasses.reduce((s, c) => s + (c.studentCount || 0), 0);

  // Fee Period options are always just the current academic year's periods
  // (the `periods` prop, fetched once by the parent for currentAcademicYear
  // — there's no year switching left to complicate this).
  const periodOptions = periods;
  const displayYearLabel = academicYear?.label || '—';

  // Resolve the locked period's display name: prefer what the parent
  // explicitly passed in (works even before `periods` has loaded), fall
  // back to looking it up in `periods`.
  const resolvedLockedPeriodName = !isEdit && lockedPeriodId
      ? (lockedPeriodName || periods.find((p) => p.id === lockedPeriodId)?.name || '—')
      : null;

  // FIX (issue 2 — duplicate components): a component type that doesn't
  // require a custom name (e.g. Tuition Fee, Library Fee) can only appear
  // once per structure — there's no way to distinguish two "Tuition Fee"
  // rows from each other, so allowing both is always a mistake. Types that
  // DO require a custom name (Misc Fee / Other Fee) are the exception,
  // since two rows of the same type are legitimately different line items
  // as long as their custom names differ (e.g. "Lab Fee" vs "Sports Fee",
  // both under Misc Fee).
  const getUsedTypesForRow = (rowIndex) =>
      form.components
          .filter((c, idx) => idx !== rowIndex && c.componentType && !REQUIRES_CUSTOM_NAME.includes(c.componentType))
          .map((c) => c.componentType);

  const handleSubmit = async (saveAsDraft) => {
    if (!form.feePeriodId) { toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, 'Please select a fee period'); return; }
    if (form.classIds.length === 0) { toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, 'Please select at least one class'); return; }
    if (form.components.length === 0) { toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, 'Please add at least one fee component'); return; }

    for (let i = 0; i < form.components.length; i++) {
      const comp = form.components[i];
      const rowLabel = `row ${i + 1}`;
      if (!comp.componentType) { toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `Select component type for ${rowLabel}`); return; }
      // FIX (issue 1): reject zero, blank, and any amount that isn't a
      // valid positive number (negative values can no longer even be typed
      // thanks to sanitizeAmountInput, but this is kept as a hard backstop).
      const amountNum = parseFloat(comp.amount);
      if (!comp.amount || isNaN(amountNum) || amountNum <= 0) {
        toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `Enter a valid amount greater than 0 for ${rowLabel}`);
        return;
      }
      if (REQUIRES_CUSTOM_NAME.includes(comp.componentType)) {
        if (!comp.customName?.trim()) {
          const label = comp.componentType === 'MISC_FEE' ? 'Misc Fee' : 'Other Fee';
          toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `"Custom Name" is required for ${label} (${rowLabel})`);
          return;
        }
        // FIX: belt-and-suspenders check on submit — blocks any numbers or
        // symbols that might slip through (e.g. programmatic state updates),
        // not just what's typed directly into the input.
        if (!NAME_ONLY_REGEX.test(comp.customName)) {
          toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `"Custom Name" can only contain letters (${rowLabel})`);
          return;
        }
      }
    }

    // FIX (issue 2): block duplicate component types (e.g. Tuition Fee
    // added twice). Misc Fee / Other Fee are only flagged as duplicates
    // when both the type AND the custom name match — different custom
    // names under the same type are legitimate distinct line items.
    const seenSimpleTypes = new Set();
    const seenCustomEntries = new Set();
    for (let i = 0; i < form.components.length; i++) {
      const comp = form.components[i];
      if (REQUIRES_CUSTOM_NAME.includes(comp.componentType)) {
        const key = `${comp.componentType}::${comp.customName.trim().toLowerCase()}`;
        if (seenCustomEntries.has(key)) {
          toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `"${comp.customName.trim()}" has already been added — each component must be unique`);
          return;
        }
        seenCustomEntries.add(key);
      } else if (comp.componentType) {
        if (seenSimpleTypes.has(comp.componentType)) {
          const label = STRUCTURE_COMPONENT_OPTIONS.find((o) => o.value === comp.componentType)?.label || comp.componentType;
          toast.error(FEE_STRUCTURE_STRINGS.TOAST_VALIDATION, `"${label}" has already been added — each component can only be added once`);
          return;
        }
        seenSimpleTypes.add(comp.componentType);
      }
    }

    setLoading(true);
    try {
      const payload = {
        structureName: form.structureName.trim() || null,
        feePeriodId: parseInt(form.feePeriodId),
        classIds: form.classIds,
        components: form.components.map((c, idx) => ({
          componentType: c.componentType,
          customName: REQUIRES_CUSTOM_NAME.includes(c.componentType) ? c.customName.trim() : (c.customName.trim() || null),
          amount: parseFloat(c.amount),
          displayOrder: idx,
        })),
        saveAsDraft,
      };
      if (isEdit) {
        await updateFeeStructure(structure.id, payload);
        toast.success(FEE_STRUCTURE_STRINGS.TOAST_UPDATED_TITLE, FEE_STRUCTURE_STRINGS.TOAST_UPDATED_MSG);
      } else {
        await createFeeStructure(payload);
        toast.success(saveAsDraft ? FEE_STRUCTURE_STRINGS.TOAST_DRAFT_SAVED : FEE_STRUCTURE_STRINGS.TOAST_PUBLISHED, saveAsDraft ? 'Fee structure saved as draft.' : 'Fee structure has been published.');
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_SAVE_FAILED, error.message || `Failed to ${isEdit ? 'update' : 'create'} fee structure`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
      <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-4">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-[15px] font-bold text-gray-900">{isEdit ? FEE_STRUCTURE_STRINGS.MODAL_EDIT_TITLE : FEE_STRUCTURE_STRINGS.MODAL_NEW_TITLE}</h2>
              <p className="text-xs text-gray-400 mt-0.5">AY {displayYearLabel}</p>
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
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{FEE_STRUCTURE_STRINGS.STEP_1_TITLE}</span>
              </div>

              {/* Academic Year: never a dropdown — always the school's
                  current academic year, shown read-only, for both create
                  and edit. */}
              <div className="mb-3 px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm text-blue-700">
                Academic Year: <strong>{displayYearLabel}</strong>
              </div>

              {/* Structure Name: optional short label used to identify this
                  structure at a glance (e.g. "Regular Fee Structure",
                  "Sibling Discount Structure"). Purely descriptive — not
                  sent as an identifier, just shown on the card and in View
                  Details. Falls back to the period name everywhere if left
                  blank, so existing structures are unaffected. */}
              <div className="mb-3">
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Structure Name <span className="text-gray-400 font-normal normal-case">(optional)</span>
                </label>
                <Input
                    value={form.structureName}
                    onChange={handleStructureNameChange}

                />
                <p className="text-[11px] text-gray-400 mt-1">A short label to identify Fees Breakdown
                </p>
              </div>

              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Fee Period <span className="text-red-500">*</span>
              </label>

              {/* Fee Period: locked to a single period (read-only) when the
                  user arrived here via a specific period's "View
                  Structures" button; otherwise a normal dropdown scoped to
                  the current academic year's periods. */}
              {resolvedLockedPeriodName ? (
                  <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold">
                    {resolvedLockedPeriodName}
                  </div>
              ) : (
                  <Select
                      value={form.feePeriodId}
                      onChange={(v) => setForm((p) => ({ ...p, feePeriodId: v }))}
                      options={[
                        { value: '', label: '-- Select a period --' },
                        ...periodOptions.map((p) => ({ value: p.id.toString(), label: p.name })),
                      ]}
                  />
              )}
              {!isEdit && !resolvedLockedPeriodName && periodOptions.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1.5">No fee periods exist for {displayYearLabel} yet — create one first from the Fee Periods tab.</p>
              )}
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-[#1E3A5F] text-white flex items-center justify-center text-[10px] font-bold">2</div>
                <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{FEE_STRUCTURE_STRINGS.STEP_2_TITLE}</span>
              </div>
              <div className="flex flex-wrap gap-2 p-3 bg-white rounded-lg border border-gray-200 max-h-44 overflow-y-auto">
                {classes.map((cls) => (
                    <label key={cls.id}
                           className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border cursor-pointer transition-all text-xs font-semibold select-none ${form.classIds.includes(cls.id)
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
                  <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{FEE_STRUCTURE_STRINGS.STEP_3_TITLE}</span>
                </div>
                <button onClick={addComponent}
                        className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] bg-white border border-[#1E3A5F]/30 rounded-lg hover:bg-blue-50 transition-colors">
                  <Plus size={12} /> {FEE_STRUCTURE_STRINGS.BTN_ADD_COMPONENT}
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
                  // FIX (issue 2): hide component types already used by
                  // another row (unless that type supports a custom name,
                  // in which case repeats are fine as long as the name
                  // differs — enforced at submit time instead).
                  const usedTypes = getUsedTypesForRow(i);
                  const rowOptions = STRUCTURE_COMPONENT_OPTIONS.filter(
                      (o) => o.value === comp.componentType || !usedTypes.includes(o.value)
                  );
                  return (
                      <div key={i} className="grid grid-cols-12 gap-3 items-start">
                        <div className="col-span-5">
                          {/* Transport Fee filtered out — billed separately, not part of a structure */}
                          <Select
                              value={comp.componentType}
                              onChange={(v) => updateComponent(i, 'componentType', v)}
                              options={[{ value: '', label: '-- Select --' }, ...rowOptions]}
                          />
                        </div>
                        <div className="col-span-4">
                          {/* FIX: letters/spaces only. updateComponent strips
                              digits/symbols on every keystroke and on paste. */}
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
                          {/* FIX (issue 1): min="0" and step="1" as native
                              backstops, plus updateComponent strips any
                              non-digit character (including '-' and '.') so
                              only whole, non-negative amounts can be typed
                              in, and the up/down arrows step 0 → 1 → 2. */}
                          <Input
                              type="number"
                              min="0"
                              step="1"
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
                <span className="text-xs text-white/60 uppercase tracking-wider font-semibold">{FEE_STRUCTURE_STRINGS.LBL_TOTAL}</span>
                <span className="text-xl font-extrabold text-white">{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            <button onClick={onClose} disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
              {FEE_STRUCTURE_STRINGS.CANCEL}
            </button>
            {!isEdit && (
                <button onClick={() => handleSubmit(true)} disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-[#1E3A5F] bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 disabled:opacity-50 transition-colors">
                  {FEE_STRUCTURE_STRINGS.BTN_SAVE_DRAFT}
                </button>
            )}
            <button onClick={() => handleSubmit(false)} disabled={loading}
                    className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? FEE_STRUCTURE_STRINGS.BTN_SAVING : isEdit ? FEE_STRUCTURE_STRINGS.BTN_UPDATE : FEE_STRUCTURE_STRINGS.BTN_SAVE}
            </button>
          </div>
        </div>
      </div>
  );
}

// ─── Fee Structure Card (redesigned — matches the quiet FeePeriods style) ─────
// FIX: dropped the Students stat entirely (per request), dropped the
// gradient top bar and boxed stat tiles, and fixed the footer so it never
// clips the Delete button at 1024px — actions are icon-only with tooltips
// (mirrors PeriodCard) so three buttons always fit even in a 4-column grid
// on a 1024px-wide viewport. Class chips and the components line now share
// consistent padding/line-height with the rest of the card.
// UPDATE: the card title now leads with the Structure Name when one was
// given at creation time (e.g. "Sibling Discount Structure"), with the fee
// period shown as a small subtitle underneath — instead of the period name
// being the only identifier. If no structure name was set, the card falls
// back to exactly the previous behaviour (period name as the title, no
// subtitle), so older structures still read cleanly.
const FeeStructureCard = ({ s, periods, onView, onEdit, onDelete }) => {
  const statusKey = s.status?.toUpperCase() || STATUSES.DRAFT;
  const periodName = s.feePeriod?.name || periods.find((p) => p.id === s.feePeriodId)?.name || '—';
  const structureName = s.structureName || s.name || '';
  const cardTitle = structureName || periodName;
  const compCount = s.components?.length || 0;
  const compPreview = s.components?.slice(0, 3).map((c) => c.customName || c.componentType?.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())).join(', ') || '—';
  const canDelete = statusKey === STATUSES.DRAFT || (statusKey === STATUSES.ACTIVE && !s.studentCount);

  return (
      <div className="h-full bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 overflow-hidden flex flex-col">
        {/* Card body */}
        <div className="p-4 flex-1 flex flex-col gap-3">
          {/* Row 1: Structure name (or period name as fallback) + status */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-[#1E3A5F]/8 flex items-center justify-center flex-shrink-0">
                {structureName
                    ? <FileText size={13} className="text-[#1E3A5F]" />
                    : <Calendar size={13} className="text-[#1E3A5F]" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-[15px] font-bold text-gray-900 truncate" title={cardTitle}>{cardTitle}</h3>
                {structureName && (
                    <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                      <Calendar size={10} className="flex-shrink-0" />
                      <span className="truncate">{periodName}</span>
                    </div>
                )}
              </div>
            </div>
            <StatusDotText status={statusKey} />
          </div>

          {/* Class chips — consistent padding/line-height so they always
              align cleanly regardless of how many wrap */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-gray-100">
            {s.classes?.slice(0, 4).map((c) => (
                <span key={c.id} className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-[11px] font-semibold rounded-md leading-5">
                  {c.name}
                </span>
            ))}
            {(s.classes?.length || 0) > 4 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 text-[11px] font-semibold rounded-md leading-5">
                  +{s.classes.length - 4}
                </span>
            )}
            {(!s.classes || s.classes.length === 0) && <span className="text-xs text-gray-300">No classes assigned</span>}
          </div>

          {/* Items count + component preview — plain text row, same
              treatment as the Structures/Students row on Fee Periods */}
          <div className="flex items-start gap-1.5 text-xs text-gray-500">
            <Layers size={12} className="text-gray-400 flex-shrink-0 mt-0.5" />
            <span className="min-w-0">
              <span className="font-semibold text-gray-800">{compCount}</span> item{compCount !== 1 ? 's' : ''}
              {compCount > 0 && <span className="text-gray-400"> · </span>}
              {compCount > 0 && <span className="truncate">{compPreview}{compCount > 3 ? ` +${compCount - 3} more` : ''}</span>}
            </span>
          </div>
        </div>

        {/* Footer: total + actions — icon-only with tooltips so View/Edit/
            Delete always fit without clipping, even at 1024px in a 4-col grid */}
        <div className="border-t border-gray-100 px-4 py-2.5 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{FEE_STRUCTURE_STRINGS.LBL_TOTAL}</div>
            <div className="text-sm font-extrabold text-[#1E3A5F] truncate">{formatCurrency(s.totalAmount)}</div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            {statusKey !== STATUSES.DRAFT && (
                <button onClick={() => onView(s)} title="View details"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 ">
                  <Eye size={13} />
                </button>
            )}
            {statusKey !== STATUSES.LOCKED && (
                <button onClick={() => onEdit(s)} title={statusKey === STATUSES.DRAFT ? 'Edit draft' : 'Edit'}
                        className="h-7 w-7 rounded-lg flex items-center justify-center  text-[#1E3A5F] bg-blue-50 ">
                  <Pencil size={13} />
                </button>
            )}
            {canDelete && (
                <button onClick={() => onDelete(s)} title="Delete structure"
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-red-600 bg-red-50 ">
                  <Trash2 size={13} />
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
  const academicYearId = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;
  const location = useLocation();

  const [periodFilter, setPeriodFilter] = useState('');
  // FIX: when the user arrives here via a specific period's "View
  // Structures" button, `lockedPeriodId` pins the page to that single
  // period — the filter dropdown is locked to it and "Add Structure" can
  // only create structures for that period. `lockedPeriodName` is cached
  // separately so the lock still displays correctly even before `periods`
  // has finished loading.
  const [lockedPeriodId, setLockedPeriodId] = useState(null);
  const [lockedPeriodName, setLockedPeriodName] = useState('');
  const [modal, setModal] = useState(null);
  const [activeStructure, setActiveStructure] = useState(null);
  const [structures, setStructures] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
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
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_FETCH_FAILED, 'Could not load fee structures.');
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
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_FETCH_FAILED, 'Could not load fee periods.');
    }
  }, [academicYearId]);

  // FIX: SectionSubjectService.getActiveClasses() returns class metadata
  // only — no student-count field. getStudentByClass(classId) is the only
  // endpoint that actually knows the ACTIVE roster for a class, so we fetch
  // that per class (in parallel) and use the array length as studentCount.
  // This is what makes "Class 9 (21)" style counts show up correctly in the
  // Step 2 class picker and in View Details.
  const fetchClasses = useCallback(async () => {
    try {
      const classesData = await SectionSubjectService.getActiveClasses();
      const rawList =
          Array.isArray(classesData) ? classesData :
              Array.isArray(classesData?.data) ? classesData.data :
                  Array.isArray(classesData?.result) ? classesData.result : [];

      const withCounts = await Promise.all(
          rawList.map(async (cls) => {
            try {
              const students = await getStudentByClass(cls.id);
              return { ...cls, studentCount: Array.isArray(students) ? students.length : 0 };
            } catch {
              return { ...cls, studentCount: 0 };
            }
          })
      );

      setClasses(withCounts);
    } catch {
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_FETCH_FAILED, 'Could not load classes.');
    }
  }, []);

  useEffect(() => {
    if (!academicYearId) return;
    const incomingId = initialPeriodIdProp ?? location.state?.periodId;
    const resolvedId = incomingId ? incomingId.toString() : '';
    // FIX: an incoming period id (from FeePeriods → "View Structures") now
    // locks the page to that period, not just pre-selects the filter.
    if (resolvedId) {
      setPeriodFilter(resolvedId);
      setLockedPeriodId(parseInt(resolvedId));
      setLockedPeriodName(location.state?.periodName || '');
    } else {
      setLockedPeriodId(null);
      setLockedPeriodName('');
    }
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

  // Once `periods` loads, backfill the locked period's display name if we
  // didn't already have it from navigation state.
  useEffect(() => {
    if (!lockedPeriodId || lockedPeriodName) return;
    const match = periods.find((p) => p.id === lockedPeriodId);
    if (match) setLockedPeriodName(match.name);
  }, [periods, lockedPeriodId, lockedPeriodName]);

  const openCreate = () => { setActiveStructure(null); setModal('create'); };

  // FIX: merge the list-row summary (`s` — already has feePeriod/studentCount
  // from getFeeStructures) into whatever the detail endpoint returns, so
  // fields the detail endpoint omits don't disappear in the modal.
  const openEdit = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure({ ...s, ...full });
      setModal('edit');
    } catch {
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_LOAD_FAILED, 'Could not load structure details.');
    }
  };

  const openView = async (s) => {
    try {
      const full = await getFeeStructureById(s.id);
      setActiveStructure({ ...s, ...full });
      setModal('view');
    } catch {
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_LOAD_FAILED, 'Could not load structure details.');
    }
  };

  const close = () => { setModal(null); setActiveStructure(null); };
  const handleSuccess = () => fetchStructures(periodFilter ? parseInt(periodFilter) : null);

  const promptDelete = (s) => setDeleteModal({ open: true, structure: s, loading: false });
  const cancelDelete = () => setDeleteModal({ open: false, structure: null, loading: false });

  const confirmDelete = async () => {
    const s = deleteModal.structure;
    if (!s) return;
    setDeleteModal((p) => ({ ...p, loading: true }));
    try {
      await deleteFeeStructure(s.id);
      toast.success(FEE_STRUCTURE_STRINGS.TOAST_DELETED_TITLE, `"${s.feePeriod?.name || 'Fee structure'}" has been permanently removed.`);
      cancelDelete();
      handleSuccess();
    } catch (error) {
      setDeleteModal((p) => ({ ...p, loading: false }));
      toast.error(FEE_STRUCTURE_STRINGS.TOAST_DELETE_FAILED, error.message || 'Could not delete the fee structure. Please try again.');
    }
  };

  const handlePeriodFilterChange = (value) => {
    // Locked periods can't be changed via the filter — guard just in case
    // the (disabled) select still fires an event.
    if (lockedPeriodId) return;
    setPeriodFilter(value);
    fetchStructures(value ? parseInt(value) : null);
  };

  // FIX: lets the user step out of a locked period (e.g. they came in via
  // "View Structures" for June but now want to browse/manage every period).
  const clearPeriodLock = () => {
    setLockedPeriodId(null);
    setLockedPeriodName('');
    setPeriodFilter('');
    fetchStructures(null);
  };

  const filtered = periodFilter
      ? structures.filter((s) => s.feePeriodId === parseInt(periodFilter))
      : structures;

  const deleteStructureName = deleteModal.structure
      ? `${deleteModal.structure.structureName || deleteModal.structure.feePeriod?.name || 'Period'} — ${deleteModal.structure.classes?.map((c) => c.name).join(', ') || 'Classes'}`
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
      <div className="max-w-[1440px] mx-auto space-y-5 px-3 sm:px-4 lg:px-6">
        <ToastContainer />

        {/* ── Page header ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{FEE_STRUCTURE_STRINGS.HEADER_TITLE}</h1>
            <p className="text-xs sm:text-sm text-gray-400 mt-0.5">{FEE_STRUCTURE_STRINGS.HEADER_SUBTITLE} {academicYearLabel}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
            <select
                value={periodFilter}
                onChange={(e) => handlePeriodFilterChange(e.target.value)}
                disabled={!!lockedPeriodId}
                className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-full sm:w-44 disabled:opacity-70 disabled:cursor-not-allowed">
              {!lockedPeriodId && <option value="">All Periods</option>}
              {periods.map((p) => <option key={p.id} value={p.id.toString()}>{p.name}</option>)}
            </select>
            <button onClick={openCreate}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              <Plus size={15} /> {FEE_STRUCTURE_STRINGS.BTN_ADD_STRUCTURE}
            </button>
          </div>
        </div>

        {/* ── Locked-period banner ─────────────────────────────────────────── */}
        {lockedPeriodId && (
            <div className="flex flex-wrap items-center gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 text-sm text-amber-800">
              <Info size={15} className="flex-shrink-0 text-amber-500" />
              <span>
                Showing and creating structures for <strong>{lockedPeriodName || '…'}</strong> only.
              </span>
              <button onClick={clearPeriodLock}
                      className="ml-auto text-xs font-semibold text-amber-700 underline hover:text-amber-900">
                View all periods
              </button>
            </div>
        )}

        {/* ── Info banner ─────────────────────────────────────────────────── */}
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
          <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
          <span>
          {FEE_STRUCTURE_STRINGS.INFO_BANNER}
        </span>
        </div>

        {/* ── Cards section ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Section header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
              {FEE_STRUCTURE_STRINGS.HEADER_TITLE}
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
                <div className="text-sm font-semibold text-gray-500">{FEE_STRUCTURE_STRINGS.EMPTY_TITLE}</div>
                <div className="text-xs text-gray-400 mt-1 mb-4">
                  {periodFilter ? FEE_STRUCTURE_STRINGS.EMPTY_DESC_FILTERED : FEE_STRUCTURE_STRINGS.EMPTY_DESC_DEFAULT}
                </div>
                <button onClick={openCreate}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors">
                  {FEE_STRUCTURE_STRINGS.BTN_CREATE}
                </button>
              </div>
          ) : (
              <div className="p-4 sm:p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
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
              <div className="px-4 sm:px-5 py-3 border-t border-gray-100 bg-gray-50/50">
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
            lockedPeriodId={lockedPeriodId}
            lockedPeriodName={lockedPeriodName}
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
            periods={periods}
            allClasses={classes}
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