import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  X, FileDown, AlertCircle, Printer, Search, Plus,
  CheckCircle, CheckCircle2, AlertTriangle, Info,
  ArrowRight, IndianRupee, ChevronDown, Filter,
} from 'lucide-react';
import {
  getOutstandingFees,
  getFeeCollectionHistory,
  createFeeCollection,
  createBulkFeeCollection,
  getFeeReceiptById,
} from '../../Api/FeeManagement/FeeCollection';
import { getFeePeriods } from '../../Api/FeeManagement/FeePeriods';
import { getFeeStructures } from '../../Api/FeeManagement/FeeStructures';
import { getStudentByClass } from '../../Api/Students/StudentsApi';
import { getActiveClasses } from '../../Api/Teachers/TeachersAPI';
import { authFetch } from '../../Authfetch/Authfetch';
import { UserContext } from '../../ContextAPI/UserContext';
import FeeReceiptPrint from '../../Components/FeeModal/FeeReciptPrint';

// Import Constants
import {
  BASE_URL,
  PAGE_SIZE,
  getTodayDate,
  getOneMonthAgoDate,
  STATUS_PILL_STYLES,
  PAYMENT_MODES_WITH_ICON,
  PAYMENT_MODE_OPTIONS,
  STATUSES,
  COLLECTION_HISTORY_STRINGS
} from '../../Constants/StringConstants/FeeManagementConstants';

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '??';

// ─── Toast ────────────────────────────────────────────────────────────────────
let _toastDispatch = null;

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  useEffect(() => {
    _toastDispatch = (t) => {
      const id = Date.now() + Math.random();
      setToasts((p) => [...p, { ...t, id }]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), t.duration || 4000);
    };
    return () => { _toastDispatch = null; };
  }, []);
  const icons = {
    success: <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />,
    error: <AlertCircle size={15} className="flex-shrink-0 text-orange-400" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
    info: <Info size={15} className="flex-shrink-0 text-blue-400" />,
  };
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none w-[calc(100vw-2rem)] max-w-sm">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl pointer-events-auto"
          style={{ animation: 'chToastIn .22s ease-out' }}>
          {icons[t.type] || icons.info}
          <div className="flex-1 min-w-0">
            {t.title && <div className="text-[13px] font-semibold">{t.title}</div>}
            {t.message && <div className="text-[12px] text-white/70 mt-0.5">{t.message}</div>}
          </div>
          <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            className="opacity-50 hover:opacity-100 ml-1 mt-0.5 flex-shrink-0"><X size={13} /></button>
        </div>
      ))}
      <style>{`@keyframes chToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
    </div>
  );
};

const toast = {
  success: (title, message, duration) => _toastDispatch?.({ type: 'success', title, message, duration }),
  error: (title, message, duration) => _toastDispatch?.({ type: 'error', title, message, duration }),
  warning: (title, message, duration) => _toastDispatch?.({ type: 'warning', title, message, duration }),
  info: (title, message, duration) => _toastDispatch?.({ type: 'info', title, message, duration }),
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Av = ({ name, status, size = 'md' }) => {
  const sz = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-base' }[size];
  const bg = status === STATUSES.OVERDUE ? 'bg-orange-700' : status === STATUSES.PARTIAL ? 'bg-amber-700' : 'bg-[#1E3A5F]';
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
};

const StatusPill = ({ status, label }) => {
  const cls = STATUS_PILL_STYLES[status] || STATUS_PILL_STYLES[STATUSES.PENDING];
  const display = status === STATUSES.UNPAID ? 'Pending' : (label || status);
  return (
    <span className={`inline-flex gap-1.5 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${cls}`}>
      {display}
    </span>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, wide, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-2 sm:p-4 md:p-6 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-5xl' : 'max-w-lg'} my-2 sm:my-4`}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-[14px] sm:text-[15px] font-bold text-gray-900 truncate">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5 truncate">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors flex-shrink-0">
            <X size={14} />
          </button>
        </div>
        <div className="px-4 sm:px-6 py-4 sm:py-5 max-h-[75vh] md:max-h-[85vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center sm:justify-end gap-2 px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = 'cursor-pointer' }) => {
  const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[12.5px]' }[size];
  const v = {
    primary: 'bg-[#2563EB] text-white hover:bg-blue-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost: 'bg-blue-50 text-[#1E3A5F] border border-blue-200 hover:bg-blue-100',
    navy: 'bg-[#1E3A5F] text-white hover:bg-[#162d4a]',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
      {children}
    </button>
  );
};

const Inp = ({ className = '', ...props }) => (
  <input className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`} {...props} />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '', disabled }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
    className={`px-3 py-2 cursor-pointer text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400 ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Collect Fee Modal ────────────────────────────────────────────────────────
const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess }) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    amountPaid: '', paymentMode: STATUSES.CASH, paymentDate: getTodayDate(),
    referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
  });
  const [loading, setLoading] = useState(false);
  const [periodStructures, setPeriodStructures] = useState([]);
  const [periodClasses, setPeriodClasses] = useState([]);
  const [classesLoading, setClassesLoading] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students, setStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch, setStudentSearch] = useState('');
  const [activeStudent, setActiveStudent] = useState(null);

  const balanceDue = Number(activeStudent?.balance) || 0;
  const isFullyPaid = activeStudent !== null && balanceDue <= 0;
  const amountNum = parseFloat(form.amountPaid) || 0;
  const discountNum = parseFloat(form.discount) || 0;
  const lateFineNum = parseFloat(form.lateFine) || 0;
  const netAmount = Math.max(0, amountNum - discountNum);
  const netTotal = netAmount + lateFineNum;
  const amountExceedsBalance = netAmount > balanceDue && balanceDue > 0;
  const discountExceedsAmount = discountNum > amountNum;

  useEffect(() => {
    if (!open) return;
    setPeriodStructures([]); setPeriodClasses([]); setSelectedClassId('');
    setStudents([]); setStudentSearch('');
    if (initialStudent) {
      setActiveStudent(initialStudent);
      const matched =
        periodOptions.find((p) => String(p.value) === String(initialStudent.feePeriodId)) ||
        periodOptions.find((p) => p.label?.trim().toLowerCase() === initialStudent.period?.trim().toLowerCase()) ||
        periodOptions[0];
      setSelectedPeriodId(matched ? String(matched.value) : '');
      setForm({
        amountPaid: initialStudent.balance > 0 ? String(initialStudent.balance) : '',
        paymentMode: STATUSES.CASH, paymentDate: getTodayDate(),
        referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
      });
    } else {
      setActiveStudent(null); setSelectedPeriodId('');
      setForm({ amountPaid: '', paymentMode: STATUSES.CASH, paymentDate: getTodayDate(), referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  useEffect(() => {
    if (!selectedPeriodId) {
      setPeriodStructures([]); setPeriodClasses([]); setSelectedClassId(''); setStudents([]); setActiveStudent(null);
      return;
    }
    const load = async () => {
      setClassesLoading(true);
      try {
        const structures = await getFeeStructures(parseInt(selectedPeriodId));
        const arr = Array.isArray(structures) ? structures : [];
        setPeriodStructures(arr);
        const seen = new Set(); const classes = [];
        arr.forEach((s) => (s.classes || []).forEach((c) => {
          if (!seen.has(c.id)) { seen.add(c.id); classes.push({ id: c.id, name: c.name || c.className }); }
        }));
        setPeriodClasses(classes);
      } catch {
        toast.error(COLLECTION_HISTORY_STRINGS.TOAST_LOAD_FAILED, COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_FETCH_CLASSES);
      } finally { setClassesLoading(false); }
    };
    load();
  }, [selectedPeriodId]);

  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    const load = async () => {
      setStudentsLoading(true);
      try {
        let list = [];
        try {
          list = await getStudentByClass(selectedClassId);
        } catch {
          const res = await authFetch(`${BASE_URL}/students/class/${selectedClassId}?status=ACTIVE`);
          const data = await res.json();
          list = Array.isArray(data) ? data : (data?.data || []);
        }
        setStudents(Array.isArray(list) ? list : []);
      } catch {
        toast.error(COLLECTION_HISTORY_STRINGS.TOAST_LOAD_FAILED, COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_FETCH_STUDENTS);
        setStudents([]);
      } finally { setStudentsLoading(false); }
    };
    load();
  }, [selectedClassId]);

  if (!open) return null;

  const isOverdue = activeStudent?.status === STATUSES.OVERDUE;

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    return !q || name.includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const classObj = periodClasses.find((c) => String(c.id) === selectedClassId);
    const matchedStr = periodStructures.find((st) => (st.classes || []).some((c) => String(c.id) === selectedClassId));
    const feeStructureId = matchedStr?.id ?? s.feeStructureId ?? null;
    const studentBalance = s.balanceDue ?? s.balance ?? 0;

    setActiveStudent({
      studentId: s.id || s.studentId,
      studentName: fullName,
      studentCode: s.admissionNumber || s.studentCode,
      class: s.className || s.class || classObj?.name || '',
      feeStructureId,
      feePeriodId: selectedPeriodId,
      balance: studentBalance,
      paidAmount: s.paidAmount || 0,
      totalFee: s.totalFee || 0,
      dueDate: s.dueDate,
      daysLate: s.overdueDays || 0,
      status:
        s.overdueDays > 0 && studentBalance > 0 ? STATUSES.OVERDUE
          : s.paidAmount > 0 && studentBalance > 0 ? STATUSES.PARTIAL
            : studentBalance <= 0 ? STATUSES.PAID
              : STATUSES.PENDING,
      parentName: s.parentName,
      parentPhone: s.parentPhone,
    });

    if (studentBalance <= 0) {
      setForm((p) => ({ ...p, amountPaid: '' }));
      toast.info(COLLECTION_HISTORY_STRINGS.TOAST_FEES_ALREADY_PAID, `${fullName} has no outstanding balance.`);
    } else {
      setForm((p) => ({ ...p, amountPaid: String(studentBalance) }));
    }
  };

  const handleSubmit = async () => {
    if (!activeStudent) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_NO_STUDENT_SELECTED, COLLECTION_HISTORY_STRINGS.TOAST_PLEASE_SELECT_STUDENT); return; }
    if (isFullyPaid) { toast.info(COLLECTION_HISTORY_STRINGS.TOAST_NO_BALANCE_DUE, `${activeStudent.studentName} has no outstanding balance.`); return; }
    if (!form.amountPaid || amountNum <= 0) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_INVALID_AMOUNT, COLLECTION_HISTORY_STRINGS.TOAST_PLEASE_ENTER_VALID_AMOUNT); return; }
    if (amountExceedsBalance) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_AMOUNT_TOO_HIGH, `Amount cannot exceed ${fmt(balanceDue)}.`); return; }
    if (discountExceedsAmount) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_DISCOUNT_TOO_HIGH, COLLECTION_HISTORY_STRINGS.TOAST_DISCOUNT_EXCEEDS); return; }
    if (!selectedPeriodId) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_NO_PERIOD_SELECTED, COLLECTION_HISTORY_STRINGS.TOAST_PLEASE_SELECT_PERIOD); return; }
    if (!activeStudent.feeStructureId) { toast.error(COLLECTION_HISTORY_STRINGS.TOAST_FEE_STRUCTURE_MISSING, COLLECTION_HISTORY_STRINGS.TOAST_NO_FEE_STRUCTURE_FOUND); return; }

    try {
      setLoading(true);
      const res = await createFeeCollection({
        studentId: activeStudent.studentId,
        feeStructureId: activeStudent.feeStructureId,
        amountPaid: netAmount,
        discount: discountNum || 0,
        discountReason: form.discountReason || null,
        lateFine: lateFineNum || 0,
        paymentMode: form.paymentMode,
        paymentDate: form.paymentDate,
        referenceNo: form.referenceNo || null,
        remarks: form.remarks || null,
      });
      toast.success(COLLECTION_HISTORY_STRINGS.TOAST_PAYMENT_RECORDED, `Receipt generated for ${activeStudent.studentName}.`);
      onSuccess(res, activeStudent);
    } catch (e) {
      toast.error(COLLECTION_HISTORY_STRINGS.TOAST_PAYMENT_FAILED, e.message || COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_RECORD_PAYMENT);
    } finally { setLoading(false); }
  };

  const submitDisabled =
    loading || !activeStudent || isFullyPaid ||
    !form.amountPaid || amountNum <= 0 || netAmount <= 0 ||
    amountExceedsBalance || discountExceedsAmount;

  return (
    <Modal open={open} onClose={onClose}
      title={COLLECTION_HISTORY_STRINGS.BTN_COLLECT_FEE}
      subtitle={COLLECTION_HISTORY_STRINGS.HEADER_SUBTITLE}
      wide
      footer={
        <>
          <Btn variant="secondary" onClick={onClose} className="w-full sm:w-auto">{COLLECTION_HISTORY_STRINGS.BTN_CANCEL}</Btn>
          <div className="relative group w-full sm:w-auto">
            <Btn variant="success" onClick={handleSubmit} disabled={submitDisabled} className="w-full sm:w-auto">
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? COLLECTION_HISTORY_STRINGS.BTN_RECORDING : COLLECTION_HISTORY_STRINGS.BTN_RECORD_RECEIPT}
            </Btn>
            {activeStudent && isFullyPaid && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                ✓ {COLLECTION_HISTORY_STRINGS.MSG_NO_OUTSTANDING_BAL}
              </div>
            )}
          </div>
        </>
      }>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── LEFT: Period → Class → Student ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fee Period <span className="text-gray-400">*</span></label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white">
              <option value="">-- Select fee period --</option>
              {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
            </select>
          </div>

          {selectedPeriodId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Class <span className="text-gray-400">*</span>
                {classesLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              {!classesLoading && periodClasses.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  {COLLECTION_HISTORY_STRINGS.MSG_NO_CLASSES}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-32 overflow-y-auto">
                  {classesLoading
                    ? <div className="text-xs text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_CLASSES}</div>
                    : periodClasses.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setSelectedClassId(String(c.id)); setStudentSearch(''); setActiveStudent(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${selectedClassId === String(c.id)
                          ? 'bg-blue-950 text-white border-blue-950'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-blue-950/50 hover:text-blue-950'
                          }`}>
                        {c.name}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {selectedClassId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Student <span className="text-gray-400">*</span>
                {studentsLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_STUDENT}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white" />
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_STUDENTS}</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    {studentSearch ? COLLECTION_HISTORY_STRINGS.MSG_NO_STUDENT_MATCH : COLLECTION_HISTORY_STRINGS.MSG_NO_STUDENTS_CLASS}
                  </div>
                ) : filteredStudents.map((s) => {
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                  const isSelected = activeStudent?.studentId === (s.id || s.studentId);
                  const sBalance = s.balanceDue ?? s.balance ?? 0;
                  const isPaid = sBalance <= 0;
                  return (
                    <div key={s.id || s.studentId} onClick={() => selectStudent(s)}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${isSelected ? 'bg-blue-50 border-l-4 border-l-[#1E3A5F]'
                        : isPaid ? 'bg-emerald-50/50 hover:bg-emerald-50'
                          : 'hover:bg-gray-50'
                        }`}>
                      <Av name={fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{fullName}</div>
                        <div className="text-xs text-gray-500">{s.admissionNumber || s.studentCode || '—'}</div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {isPaid
                          ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Paid</span>
                          : <span className="text-[10px] font-semibold text-orange-600">{fmt(sBalance)}</span>
                        }
                        {isSelected && <span className="text-[10px] font-bold text-[#1E3A5F] bg-blue-100 px-2 py-0.5 rounded-md">Selected</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeStudent && (
            <div className={`border rounded-xl p-3 flex items-center gap-3 ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
              <Av name={activeStudent.studentName} status={activeStudent.status} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="font-bold text-gray-900 truncate">{activeStudent.studentName}</div>
                <div className="text-xs text-gray-600 truncate">{activeStudent.studentCode} · Class {activeStudent.class}</div>
                {activeStudent.parentName && <div className="text-[11px] text-gray-500 mt-0.5 truncate">Parent: {activeStudent.parentName}</div>}
                {isFullyPaid && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle size={12} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-700">{COLLECTION_HISTORY_STRINGS.LBL_FEES_FULLY_PAID}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeStudent && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase truncate">{COLLECTION_HISTORY_STRINGS.LBL_ALREADY_PAID}</div>
                <div className="text-base sm:text-lg font-extrabold text-emerald-600 break-all">{fmt(activeStudent.paidAmount || 0)}</div>
              </div>
              <div className={`border border-gray-200 rounded-xl px-3 py-2 text-center ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'}`}>
                <div className={`text-[10px] font-bold uppercase truncate ${isFullyPaid ? 'text-emerald-700' : 'text-orange-700'}`}>
                  {COLLECTION_HISTORY_STRINGS.LBL_BALANCE_DUE}
                </div>
                <div className={`text-base sm:text-lg font-extrabold break-all ${isFullyPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {fmt(balanceDue)}
                </div>
              </div>
            </div>
          )}

          {isFullyPaid && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-emerald-800">{COLLECTION_HISTORY_STRINGS.MSG_NO_PAYMENT_REQD}</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">{COLLECTION_HISTORY_STRINGS.MSG_NO_OUTSTANDING_BAL}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Payment form ── */}
        <div className={`space-y-4 ${isFullyPaid ? 'opacity-40 pointer-events-none select-none' : ''}`}>

          {activeStudent && !isFullyPaid && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <Info size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-blue-700">
                {COLLECTION_HISTORY_STRINGS.MSG_PARTIAL_INFO} {fmt(balanceDue)}.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {COLLECTION_HISTORY_STRINGS.LBL_AMOUNT_TO_COLLECT} <span className="text-gray-400">*</span>
            </label>
            <div className="relative">
              <Inp
                type="number"
                value={form.amountPaid}
                className={`pr-24 sm:pr-28 ${amountExceedsBalance ? 'border-orange-400 bg-orange-50' : ''}`}
                onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))}
                max={balanceDue} min={1}
                placeholder={`Max ${fmt(balanceDue)}`}
              />
              {activeStudent && balanceDue > 0 && (
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, amountPaid: String(balanceDue) }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] sm:text-[11px] font-semibold text-[#1E3A5F] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded">
                  Full {fmt(balanceDue)}
                </button>
              )}
            </div>
            {amountExceedsBalance && (
              <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {COLLECTION_HISTORY_STRINGS.MSG_EXCEEDS_BALANCE} ({fmt(balanceDue)})
              </p>
            )}
            {activeStudent && !isFullyPaid && netAmount > 0 && netAmount < balanceDue && !amountExceedsBalance && (
              <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Info size={11} /> {COLLECTION_HISTORY_STRINGS.MSG_PARTIAL_REMAIN}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_MODE} <span className="text-gray-400">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PAYMENT_MODES_WITH_ICON.map(([mode, icon, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1 sm:gap-1.5 px-2 py-2 sm:py-2.5 rounded-xl border-2 transition-all ${form.paymentMode === mode
                    ? 'border-[#1E3A5F] bg-blue-50 text-[#1E3A5F]'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-[#1E3A5F]/40'
                    }`}>
                  <span className="text-lg sm:text-xl">{icon}</span>
                  <span className="text-[10px] sm:text-[11px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                {COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_DATE} <span className="text-gray-400">*</span>
              </label>
              <Inp type="date" value={form.paymentDate}
                onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_REFERENCE_NO}</label>
              <Inp value={form.referenceNo} placeholder="TXN / Cheque no."
                onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              {COLLECTION_HISTORY_STRINGS.LBL_DISCOUNT} <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Inp
              type="number" value={form.discount} placeholder="Discount amount"
              className={discountExceedsAmount ? 'border-orange-400 bg-orange-50' : ''}
              onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
            />
            {discountExceedsAmount && (
              <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> {COLLECTION_HISTORY_STRINGS.MSG_DISCOUNT_EXCEEDS}
              </p>
            )}
            {discountNum > 0 && !discountExceedsAmount && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle size={11} /> Discount of {fmt(discountNum)} applied
              </p>
            )}
            <textarea value={form.discountReason} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
              placeholder={COLLECTION_HISTORY_STRINGS.LBL_REASON}
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

          {isOverdue && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-800">{COLLECTION_HISTORY_STRINGS.MSG_LATE_FINE_PROMPT}</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Due: {fmtDate(activeStudent?.dueDate)} · {activeStudent?.daysLate} day{activeStudent?.daysLate !== 1 ? 's' : ''} overdue
                  </div>
                </div>
              </div>
              <Inp type="number" value={form.lateFine} placeholder="Fine amount (₹)"
                onChange={(e) => setForm((p) => ({ ...p, lateFine: e.target.value }))} />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_REMARKS}</label>
            <textarea value={form.remarks} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder={COLLECTION_HISTORY_STRINGS.LBL_OPTIONAL_NOTE}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#1E3A5F] rounded-xl px-4 py-3 gap-2">
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">{COLLECTION_HISTORY_STRINGS.LBL_RECEIPT_NO}</div>
              <div className="text-white font-bold text-sm mt-0.5">{COLLECTION_HISTORY_STRINGS.LBL_AUTO_GENERATED}</div>
            </div>
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">{COLLECTION_HISTORY_STRINGS.LBL_NET_COLLECTED}</div>
              <div className={`font-extrabold text-xl ${netTotal > 0 ? 'text-white' : 'text-white/30'}`}>
                {netTotal > 0 ? fmt(netTotal) : '—'}
              </div>
              {discountNum > 0 && amountNum > 0 && !discountExceedsAmount && (
                <div className="text-[10px] text-white/50 mt-0.5">
                  {fmt(amountNum)} − {fmt(discountNum)} discount{lateFineNum > 0 ? ` + ${fmt(lateFineNum)} fine` : ''}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

// ─── Bulk Collect Modal ───────────────────────────────────────────────────────
const BulkCollectModal = ({ open, onClose, students, onSuccess }) => {
  const [commonMode, setCommonMode] = useState(STATUSES.CASH);
  const [commonDate, setCommonDate] = useState(getTodayDate());
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && students.length > 0) {
      setCommonMode(STATUSES.CASH); setCommonDate(getTodayDate());
      setRows(students.map((s) => ({
        id: s.id, studentId: s.studentId, studentName: s.studentName,
        studentCode: s.studentCode, class: s.class, period: s.period,
        balanceDue: s.balance, feeStructureId: s.feeStructureId,
        collectAmount: s.balance, discount: 0,
        lateFine: s.status === STATUSES.OVERDUE ? '' : null,
        daysLate: s.daysLate || 0, paymentMode: STATUSES.CASH, paymentDate: getTodayDate(),
      })));
    }
  }, [open, students]);

  const update = (id, field, val) => setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const applyAll = () => setRows((p) => p.map((r) => ({ ...r, paymentMode: commonMode, paymentDate: commonDate })));
  const grandTotal = rows.reduce((s, r) => s + (parseFloat(r.collectAmount) || 0), 0);

  const handleSubmit = async () => {
    const bad = rows.find((r) => !r.collectAmount || parseFloat(r.collectAmount) <= 0);
    if (bad) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_MISSING_AMOUNT, `Please fill in collect amount for ${bad.studentName}.`); return; }
    const over = rows.find((r) => parseFloat(r.collectAmount) > parseFloat(r.balanceDue));
    if (over) { toast.warning(COLLECTION_HISTORY_STRINGS.TOAST_AMOUNT_EXCEEDS_BALANCE, `${over.studentName}: exceeds balance of ${fmt(over.balanceDue)}.`); return; }
    try {
      setLoading(true);
      const res = await createBulkFeeCollection({
        payments: rows.map((r) => ({
          studentId: r.studentId, feeStructureId: r.feeStructureId,
          amountPaid: parseFloat(r.collectAmount), discount: parseFloat(r.discount) || 0,
          discountReason: null,
          lateFine: r.lateFine !== null && r.lateFine !== '' ? parseFloat(r.lateFine) : null,
          paymentMode: r.paymentMode, paymentDate: r.paymentDate,
          referenceNo: null, remarks: null,
        })),
      });
      toast.success(COLLECTION_HISTORY_STRINGS.TOAST_BULK_PROCESSED, `${Array.isArray(res) ? res.length : rows.length} receipts generated.`);
      onSuccess(res);
    } catch (e) {
      toast.error(COLLECTION_HISTORY_STRINGS.TOAST_BULK_FAILED, e.message || COLLECTION_HISTORY_STRINGS.TOAST_COULD_NOT_PROCESS_BULK);
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}
      title={COLLECTION_HISTORY_STRINGS.BTN_COLLECT_FEE}
      subtitle={`${students.length} students selected`}
      wide
      footer={
        <>
          <Btn variant="secondary" onClick={onClose} className="w-full sm:w-auto">{COLLECTION_HISTORY_STRINGS.BTN_CANCEL}</Btn>
          <Btn variant="success" onClick={handleSubmit} disabled={loading} className="w-full sm:w-auto">
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? COLLECTION_HISTORY_STRINGS.BTN_PROCESSING : `${COLLECTION_HISTORY_STRINGS.BTN_PROCESS_PAYMENTS} ${rows.length}`}
          </Btn>
        </>
      }>
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-800">
        <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        Payments will be recorded for all {students.length} selected students.
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 mb-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_MODE}</label>
          <Sel value={commonMode} onChange={setCommonMode} options={PAYMENT_MODE_OPTIONS} className="w-full sm:w-32" />
        </div>
        <div className="w-full sm:w-auto">
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">{COLLECTION_HISTORY_STRINGS.LBL_PAYMENT_DATE}</label>
          <Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-full sm:w-40" />
        </div>
        <Btn variant="ghost" size="sm" onClick={applyAll} className="w-full sm:w-auto mt-2 sm:mt-0">{COLLECTION_HISTORY_STRINGS.BTN_APPLY_ALL}</Btn>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {COLLECTION_HISTORY_STRINGS.TABLE_BULK_HEADERS.map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.id} className={row.daysLate > 0 ? 'bg-orange-50/60' : 'hover:bg-gray-50/60'}>
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-gray-900">{row.studentName}</div>
                  <div className="text-xs text-gray-400">{row.studentCode} · {row.class}</div>
                </td>
                <td className="px-3 py-2.5">
                  {row.daysLate > 0
                    ? <span className="text-red-700 text-xs font-bold">{fmt(row.balanceDue)}<br /><span className="text-[10px]">{row.daysLate}d late</span></span>
                    : <span className="font-semibold text-gray-800">{fmt(row.balanceDue)}</span>
                  }
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" value={row.collectAmount}
                    onChange={(e) => update(row.id, 'collectAmount', e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" value={row.discount} placeholder="0"
                    onChange={(e) => update(row.id, 'discount', e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" />
                </td>
                <td className="px-3 py-2.5">
                  {row.lateFine !== null
                    ? <input type="number" value={row.lateFine} placeholder="Fine"
                      onChange={(e) => update(row.id, 'lateFine', e.target.value)}
                      className="w-20 px-2 py-1 text-sm border border-amber-200 rounded-lg bg-amber-50" />
                    : <span className="text-xs text-gray-300">N/A</span>
                  }
                </td>
                <td className="px-3 py-2.5">
                  <select value={row.paymentMode} onChange={(e) => update(row.id, 'paymentMode', e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400">
                    {PAYMENT_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center bg-[#1E3A5F] rounded-xl px-4 py-3 mt-4 gap-2">
        <div className="text-sm text-white/60 text-center sm:text-left">{rows.length} {COLLECTION_HISTORY_STRINGS.MSG_RECEIPTS_GENERATED}</div>
        <div className="text-white font-extrabold text-base text-center sm:text-right">{COLLECTION_HISTORY_STRINGS.LBL_GRAND_TOTAL}: {fmt(grandTotal)}</div>
      </div>
    </Modal>
  );
};

// ─── Mobile Card for Outstanding ──────────────────────────────────────────────
const OutstandingCard = ({ s, selected, onToggle, onCollect }) => {
  const isSel = selected;
  return (
    <div className={`rounded-xl border p-3 transition-all ${isSel ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-200'}`}>
      <div className="flex items-start gap-3">
        <input type="checkbox"
          className="w-3.5 h-3.5 cursor-pointer accent-[#2563EB] rounded mt-1 flex-shrink-0"
          checked={isSel} onChange={onToggle} />
        <Av name={s.studentName} status={s.status} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 text-sm truncate">{s.studentName}</div>
              <div className="text-xs text-gray-500 truncate">{s.studentCode}</div>
            </div>
            <StatusPill status={s.status} />
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">Class: </span>
              <span className="font-semibold text-blue-700">{s.class}</span>
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">Period: </span>{s.period}
            </div>
            <div className="text-xs text-gray-500">
              <span className="text-gray-400">Due: </span>{fmtDate(s.dueDate)}
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-2">
            <div className="flex gap-3 min-w-0">
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 uppercase truncate">{COLLECTION_HISTORY_STRINGS.LBL_ALREADY_PAID}</div>
                <div className={`text-sm font-semibold ${s.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                  {fmt(s.paidAmount)}
                </div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-gray-400 uppercase truncate">{COLLECTION_HISTORY_STRINGS.LBL_BALANCE_DUE}</div>
                <div className="text-sm font-bold text-gray-900">{fmt(s.balance)}</div>
                {s.status === STATUSES.OVERDUE && (
                  <div className="text-[10px] text-orange-600 font-medium truncate">{s.daysLate}d overdue</div>
                )}
              </div>
            </div>
            <Btn variant="primary" size="xs" onClick={onCollect}>{COLLECTION_HISTORY_STRINGS.BTN_COLLECT}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Mobile Card for History ──────────────────────────────────────────────────
const HistoryCard = ({ h, onView }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-3">
    <div className="flex items-start justify-between gap-2 mb-2">
      <div className="min-w-0 flex-1">
        <span className="text-[#2563EB] font-bold text-xs">{h.receiptNo}</span>
        <div className="font-semibold text-gray-900 text-sm mt-0.5 truncate">{h.studentName}</div>
        <div className="text-xs text-gray-400 truncate">{h.studentCode}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="font-bold text-emerald-600 text-base">{fmt(h.amount)}</div>
        <StatusPill status={h.mode} label={h.mode} />
      </div>
    </div>
    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
      <span><span className="text-gray-400">Date: </span>{fmtDate(h.date)}</span>
      <span><span className="text-gray-400">Class: </span>{h.class}</span>
      <span><span className="text-gray-400">Period: </span>{h.period}</span>
      {h.discount > 0 && <span><span className="text-gray-400">Discount: </span>{fmt(h.discount)}</span>}
      {h.lateFine > 0 && <span className="text-amber-700"><span className="text-gray-400">Fine: </span>{fmt(h.lateFine)}</span>}
      {h.referenceNo && <span className="text-gray-400 truncate"><span className="text-gray-400">Ref: </span>{h.referenceNo}</span>}
    </div>
    <div className="flex justify-end pt-1 border-t border-gray-50">
      <Btn variant="ghost" size="xs" onClick={onView}>{COLLECTION_HISTORY_STRINGS.BTN_VIEW_RECEIPT}</Btn>
    </div>
  </div>
);

// ─── Main: CollectionsHistory ─────────────────────────────────────────────────
const CollectionsHistory = () => {
  const { currentAcademicYear, schoolId } = useContext(UserContext);
  const academicYearId = currentAcademicYear?.id || null;
  const academicYearLabel = currentAcademicYear?.label || null;

  const [tab, setTab] = useState('outstanding');
  const [search, setSearch] = useState('');
  const [classF, setClassF] = useState('');
  const [periodF, setPeriodF] = useState('');
  const [statusF, setStatusF] = useState('');
  const [modeF, setModeF] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [outstanding, setOutstanding] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [classOptions, setClassOptions] = useState([]);
  const [periodOptions, setPeriodOptions] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [collectModal, setCollectModal] = useState({ open: false, student: null });
  const [bulkModal, setBulkModal] = useState({ open: false, students: [] });
  const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFromDate(getOneMonthAgoDate());
    setToDate(getTodayDate());
  }, []);

  useEffect(() => {
    if (!academicYearId || !schoolId) { setOptionsLoading(false); return; }
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [classesData, periodsData] = await Promise.all([
          getActiveClasses(schoolId).catch(() => []),
          getFeePeriods(academicYearId).catch(() => []),
        ]);
        const records = Array.isArray(classesData) ? classesData : (classesData?.data || []);
        setClassOptions(records.map((c) => ({ value: String(c.id), label: c.name || c.className })));

        if (Array.isArray(periodsData)) {
          setPeriodOptions(periodsData.map((p) => ({ value: String(p.id), label: p.periodName || p.name })));
        }
      } catch (e) {
        console.error('Failed to load filter options:', e);
      } finally { setOptionsLoading(false); }
    };
    loadOptions();
  }, [academicYearId, schoolId]);

  const fetchOutstanding = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (classF) params.classId = classF;
      if (periodF) params.periodId = periodF;
      const res = await getOutstandingFees(params);
      const raw = res?.content ?? res?.data?.content ?? res?.records ?? res ?? [];
      const records = Array.isArray(raw) ? raw : [];
      setOutstanding(
        records.map((r, i) => {
          let status = STATUSES.PENDING;
          if ((r.paidAmount || 0) > 0 && r.balanceDue > 0) status = STATUSES.PARTIAL;
          if (r.balanceDue <= 0) status = STATUSES.PAID;
          if (r.overdueDays > 0 && r.balanceDue > 0) status = STATUSES.OVERDUE;
          return {
            id: i + 1,
            studentId: r.studentId,
            studentName: r.studentName,
            studentCode: r.admissionNumber,
            class: r.className,
            section: r.sectionName,
            period: r.feePeriodName,
            feePeriodId: r.feePeriodId || r.periodId,
            balance: r.balanceDue,
            totalFee: r.totalFee,
            paidAmount: r.paidAmount,
            daysLate: r.overdueDays || 0,
            feeStructureId: r.feeStructureId,
            dueDate: r.dueDate,
            status,
          };
        })
      );
    } catch (e) {
      setError(e.message || COLLECTION_HISTORY_STRINGS.ERR_LOAD_OUTSTANDING);
      setOutstanding([]);
    } finally { setLoading(false); }
  }, [classF, periodF]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = { fromDate, toDate, page: page - 1, size: PAGE_SIZE };
      if (classF) params.classId = classF;
      if (periodF) params.periodId = periodF;
      if (modeF) params.mode = modeF;
      const res = await getFeeCollectionHistory(params);
      const records = res.data?.content || res.records || [];
      setHistory(records.map((r) => ({
        id: r.id, receiptNo: r.receiptNo, date: r.paymentDate, studentName: r.studentName,
        studentCode: r.admissionNumber,
        class: `${r.className}${r.sectionName ? ' ' + r.sectionName : ''}`,
        period: r.feePeriodName, amount: r.amountPaid, discount: r.discount || 0,
        lateFine: r.lateFine || 0, mode: r.paymentMode, referenceNo: r.referenceNo,
        recordedBy: r.collectedBy, status: STATUSES.COMPLETED,
      })));
      setTotalPages(res?.data?.totalPages || res?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message || COLLECTION_HISTORY_STRINGS.ERR_LOAD_HISTORY);
      setHistory([]);
    } finally { setLoading(false); }
  }, [fromDate, toDate, classF, periodF, modeF, page]);

  useEffect(() => {
    if (optionsLoading) return;
    if (tab === 'outstanding') fetchOutstanding();
    else if (fromDate && toDate) fetchHistory();
  }, [tab, fromDate, toDate, classF, periodF, modeF, page, optionsLoading, fetchOutstanding, fetchHistory]);

  if (!academicYearId || !schoolId || optionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <span className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-gray-500">
          {!academicYearId || !schoolId ? COLLECTION_HISTORY_STRINGS.MSG_WAITING : COLLECTION_HISTORY_STRINGS.MSG_LOADING_OPTIONS}
        </div>
      </div>
    );
  }

  const filteredOut = outstanding.filter((s) => {
    const q = search.toLowerCase();
    return (
      (!q || s.studentName.toLowerCase().includes(q) || (s.studentCode || '').toLowerCase().includes(q)) &&
      (!statusF || s.status === statusF)
    );
  });
  const filteredHist = history.filter((h) => {
    const q = search.toLowerCase();
    return !q || h.studentName.toLowerCase().includes(q) || (h.receiptNo || '').toLowerCase().includes(q);
  });

  const pagedOut = filteredOut.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalOutPages = Math.max(1, Math.ceil(filteredOut.length / PAGE_SIZE));
  const overdueCount = outstanding.filter((s) => s.status === STATUSES.OVERDUE).length;

  const toggleRow = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => {
    const ids = filteredOut.map((s) => s.id);
    const allSel = ids.every((id) => selected.includes(id));
    setSelected(allSel ? (p) => p.filter((id) => !ids.includes(id)) : (p) => [...new Set([...p, ...ids])]);
  };
  const selStudents = outstanding.filter((s) => selected.includes(s.id));
  const selTotal = selStudents.reduce((a, s) => a + s.balance, 0);

  const handleCollectSuccess = (response, student) => {
    setCollectModal({ open: false, student: null });
    const data = response?.data || response;
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo: data.receiptNo,
        date: data.paymentDate,
        studentName: data.studentName || student.studentName,
        studentCode: data.admissionNumber || student.studentCode,
        class: data.className || student.class,
        period: data.feePeriodName || student.period,
        components: data.components || [{ name: 'Fee Payment', amount: data.amountPaid }],
        amountPaid: data.amountPaid,
        discount: data.discount || 0,
        lateFine: data.lateFine || 0,
        paymentMode: data.paymentMode,
        referenceNo: data.referenceNo,
        balanceAfter: data.balanceAfter,
        recordedBy: data.collectedBy || 'Admin',
      },
    });
    fetchOutstanding(); setSelected([]);
  };

  const handleBulkSuccess = (responses) => {
    setBulkModal({ open: false, students: [] });
    toast.success(COLLECTION_HISTORY_STRINGS.TOAST_BULK_PROCESSED, `${Array.isArray(responses) ? responses.length : '?'} receipts generated.`);
    fetchOutstanding(); setSelected([]);
  };

  const handleViewReceipt = async (item) => {
    try {
      const data = await getFeeReceiptById(item.id);
      setReceiptModal({
        open: true,
        receipt: {
          receiptNo: data.receiptNo, date: data.paymentDate,
          studentName: data.studentName, studentCode: data.studentCode,
          class: data.className, period: data.periodName,
          components: data.components || [{ name: 'Fee Payment', amount: item.amount }],
          amountPaid: data.amountPaid, discount: data.discount || 0,
          lateFine: data.lateFine || 0, paymentMode: data.paymentMode,
          referenceNo: data.referenceNo, balanceAfter: data.balanceAfter,
          recordedBy: data.recordedBy,
        },
      });
    } catch {
      setReceiptModal({
        open: true,
        receipt: {
          receiptNo: item.receiptNo, date: item.date,
          studentName: item.studentName, studentCode: item.studentCode,
          class: item.class, period: item.period,
          components: [{ name: 'Fee Payment', amount: item.amount }],
          amountPaid: item.amount, discount: item.discount || 0,
          lateFine: item.lateFine || 0, paymentMode: item.mode,
          referenceNo: item.referenceNo, balanceAfter: 0, recordedBy: item.recordedBy,
        },
      });
    }
  };

  const resetTab = () => {
    setSearch(''); setClassF(''); setPeriodF(''); setStatusF('');
    setModeF(''); setPage(1); setSelected([]); setError(null);
  };

  return (
    <div className="space-y-4 sm:space-y-5 px-2 sm:px-4 max-w-full overflow-hidden">
      <ToastContainer />

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">{COLLECTION_HISTORY_STRINGS.HEADER_TITLE}</h1>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 truncate">
            Academic Year {academicYearLabel} · {COLLECTION_HISTORY_STRINGS.HEADER_SUBTITLE}
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-shrink-0">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold text-gray-700 bg-white border border-gray-200 cursor-pointer rounded-lg hover:bg-gray-50 transition-colors">
            <FileDown size={13} />
            <span>{COLLECTION_HISTORY_STRINGS.BTN_EXPORT}</span>
          </button>
          <button onClick={() => setCollectModal({ open: true, student: null })}
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-[#2563EB] rounded-lg cursor-pointer hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={13} />
            <span>{COLLECTION_HISTORY_STRINGS.BTN_COLLECT_FEE}</span>
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-orange-700 min-w-0">{error}</div>
          <button
            onClick={() => { setError(null); tab === 'outstanding' ? fetchOutstanding() : fetchHistory(); }}
            className="text-orange-600 hover:text-orange-800 font-semibold text-sm flex-shrink-0">
            Retry
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200 ">
        {[
          { key: 'outstanding', label: COLLECTION_HISTORY_STRINGS.TAB_OUTSTANDING, badge: overdueCount },
          { key: 'history', label: COLLECTION_HISTORY_STRINGS.TAB_HISTORY, badge: 0 },
        ].map((t) => (
          <button key={t.key}
            onClick={() => { setTab(t.key); resetTab(); }}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12px] sm:text-[13px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap flex-shrink-0 ${tab === t.key
              ? 'text-[#2563EB] border-[#2563EB]'
              : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
              }`}>
            {t.label}
            {t.badge > 0 && (
              <span className="bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ══ OUTSTANDING TAB ══ */}
      {tab === 'outstanding' && (
        <>
          {/* Filters */}
          <div>
            {/* Mobile filter toggle */}
            <div className="flex gap-2 md:hidden mb-2">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_STUDENT}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors flex-shrink-0 ${showFilters || classF || periodF || statusF
                  ? 'bg-blue-50 text-[#1E3A5F] border-blue-200'
                  : 'bg-white text-gray-700 border-gray-200'
                  }`}>
                <Filter size={13} />
                <span>{COLLECTION_HISTORY_STRINGS.BTN_FILTERS}</span>
                {(classF || periodF || statusF) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                )}
              </button>
            </div>

            {/* Mobile expanded filters */}
            {showFilters && (
              <div className="flex flex-col gap-2 mb-3 p-3 bg-gray-50 rounded-xl md:hidden border border-gray-100">
                <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); setSelected([]); }}
                  options={periodOptions} placeholder="All Periods" className="w-full" />
                <Sel value={classF} onChange={(v) => { setClassF(v); setPage(1); setSelected([]); }}
                  options={classOptions} placeholder="All Classes" className="w-full" />
                <Sel value={statusF} onChange={(v) => { setStatusF(v); setPage(1); }}
                  options={[
                    { value: STATUSES.OVERDUE, label: 'Overdue' },
                    { value: STATUSES.PARTIAL, label: 'Partial' },
                    { value: STATUSES.PENDING, label: 'Pending' },
                  ]}
                  placeholder="All Status" className="w-full" />
              </div>
            )}

            {/* Desktop filters */}
            <div className="hidden md:flex lg:flex-nowrap flex-wrap items-center gap-2 w-full">
              <div className="relative flex-1 min-w-[150px] lg:min-w-[200px]">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_STUDENT}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
              </div>
              <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); setSelected([]); }}
                options={periodOptions} placeholder="All Periods" className="w-full md:w-40 flex-shrink-0" />
              <Sel value={classF} onChange={(v) => { setClassF(v); setPage(1); setSelected([]); }}
                options={classOptions} placeholder="All Classes" className="w-full md:w-36 flex-shrink-0" />
              <Sel value={statusF} onChange={(v) => { setStatusF(v); setPage(1); }}
                options={[
                  { value: STATUSES.OVERDUE, label: 'Overdue' },
                  { value: STATUSES.PARTIAL, label: 'Partial' },
                  { value: STATUSES.PENDING, label: 'Pending' },
                ]}
                placeholder="All Status" className="w-full md:w-36 flex-shrink-0" />
            </div>
          </div>

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="bg-[#1E3A5F] rounded-xl px-4 py-3 flex flex-row items-center justify-between gap-3 shadow-md">
              <div className="min-w-0">
                <div className="text-white font-bold text-xs sm:text-sm">
                  {selected.length} selected
                </div>
                <div className="text-white/60 text-xs truncate">
                  Total: <span className="font-bold text-white">{fmt(selTotal)}</span>
                </div>
              </div>
              <div className="flex gap-1.5 flex-shrink-0">
                <Btn variant="secondary" size="sm" onClick={() => setSelected([])}
                  className="!bg-white/10 hover:!bg-white/20 !border-white/30 !text-white text-xs px-2.5">
                  {COLLECTION_HISTORY_STRINGS.BTN_CLEAR}
                </Btn>
                <Btn variant="success" size="sm" className="text-xs px-3"
                  onClick={() => setBulkModal({ open: true, students: selStudents })}>
                  {COLLECTION_HISTORY_STRINGS.BTN_COLLECT} ({selected.length})
                </Btn>
              </div>
            </div>
          )}

          {/* ── Desktop Table (hidden on mobile) ── */}
          <div className="hidden lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    <th className="px-3 py-2.5 w-8">
                      <input type="checkbox"
                        className="w-3.5 h-3.5 cursor-pointer accent-[#2563EB] rounded"
                        checked={filteredOut.length > 0 && filteredOut.every((s) => selected.includes(s.id))}
                        onChange={toggleAll} />
                    </th>
                    {COLLECTION_HISTORY_STRINGS.TABLE_OUTSTANDING_HEADERS.map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_OUTSTANDING}</div>
                      </td>
                    </tr>
                  ) : pagedOut.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-14 text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_NO_OUTSTANDING_RECORDS}</td></tr>
                  ) : pagedOut.map((s) => {
                    const isSel = selected.includes(s.id);
                    return (
                      <tr key={s.id}
                        className={`transition-colors ${isSel ? 'bg-blue-50 border-l-4 border-l-[#2563EB]' : 'hover:bg-gray-50/60'}`}>
                        <td className="px-3 py-3">
                          <input type="checkbox"
                            className="w-3.5 h-3.5 cursor-pointer accent-[#2563EB] rounded"
                            checked={isSel} onChange={() => toggleRow(s.id)} />
                        </td>
                        <td className="px-3 py-3">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{s.studentName}</div>
                            <div className="text-xs text-gray-500">{s.studentCode}</div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md ">{s.class}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">{s.period}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{fmt(s.totalFee)}</td>
                        <td className={`px-3 py-3 text-sm font-semibold ${s.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {fmt(s.paidAmount)}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-semibold text-gray-900 text-sm">{fmt(s.balance)}</span>
                          {s.status === STATUSES.OVERDUE && (
                            <div className="text-[10.5px] text-orange-600 mt-0.5 font-medium">{s.daysLate}d overdue</div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-left text-gray-600">{fmtDate(s.dueDate)}</td>
                        <td className="px-3 py-3">
                          <StatusPill status={s.status} />
                        </td>
                        <td className="px-3 py-3">
                          <Btn variant="primary" size="xs"
                            onClick={() => setCollectModal({ open: true, student: s })}>
                            {COLLECTION_HISTORY_STRINGS.BTN_COLLECT}
                          </Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Showing {filteredOut.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOut.length)} of {filteredOut.length} records
              </span>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  {COLLECTION_HISTORY_STRINGS.BTN_PREV}
                </Btn>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => Math.min(totalOutPages, p + 1))} disabled={page >= totalOutPages}>
                  {COLLECTION_HISTORY_STRINGS.BTN_NEXT}
                </Btn>
              </div>
            </div>
          </div>

          {/* ── Tablet/Mobile Cards (hidden on lg+) ── */}
          <div className="lg:hidden space-y-3">
            {/* Select all bar */}
            {filteredOut.length > 0 && (
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-3 py-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                  <input type="checkbox"
                    className="w-3.5 h-3.5 cursor-pointer accent-[#2563EB] rounded"
                    checked={filteredOut.length > 0 && filteredOut.every((s) => selected.includes(s.id))}
                    onChange={toggleAll} />
                  Select All ({filteredOut.length})
                </label>
                <span className="text-xs text-gray-400">
                  Total: {filteredOut.length}
                </span>
              </div>
            )}

            {loading ? (
              <div className="text-center py-14">
                <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                <div className="text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_OUTSTANDING}</div>
              </div>
            ) : pagedOut.length === 0 ? (
              <div className="text-center py-14 text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_NO_OUTSTANDING_RECORDS}</div>
            ) : pagedOut.map((s) => (
              <OutstandingCard
                key={s.id}
                s={s}
                selected={selected.includes(s.id)}
                onToggle={() => toggleRow(s.id)}
                onCollect={() => setCollectModal({ open: true, student: s })}
              />
            ))}

            {/* Mobile Pagination */}
            {filteredOut.length > PAGE_SIZE && (
              <div className="flex items-center justify-between pt-2">
                <Btn variant="secondary" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  {COLLECTION_HISTORY_STRINGS.BTN_PREV}
                </Btn>
                <span className="text-xs text-gray-500">Page {page} of {totalOutPages}</span>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => Math.min(totalOutPages, p + 1))} disabled={page >= totalOutPages}>
                  {COLLECTION_HISTORY_STRINGS.BTN_NEXT}
                </Btn>
              </div>
            )}
          </div>
        </>
      )}

      {/* ══ HISTORY TAB ══ */}
      {tab === 'history' && (
        <>
          {/* Mobile filter toggle */}
          <div className="flex gap-2 md:hidden mb-2">
            <div className="relative flex-1">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_HISTORY}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
            </div>
            <button onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-2 text-sm font-semibold rounded-lg border transition-colors flex-shrink-0 ${showFilters || classF || periodF || modeF
                ? 'bg-blue-50 text-[#1E3A5F] border-blue-200'
                : 'bg-white text-gray-700 border-gray-200'
                }`}>
              <Filter size={13} />
              <span>{COLLECTION_HISTORY_STRINGS.BTN_FILTERS}</span>
            </button>
          </div>

          {showFilters && (
            <div className="flex flex-col gap-2 mb-3 p-3 bg-gray-50 rounded-xl md:hidden border border-gray-100">
              <div className="grid grid-cols-2 gap-2">
                <Inp type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-full" />
                <Inp type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} className="w-full" />
              </div>
              <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); }}
                options={periodOptions} placeholder="All Periods" className="w-full" />
              <Sel value={classF} onChange={(v) => { setClassF(v); setPage(1); }}
                options={classOptions} placeholder="All Classes" className="w-full" />
              <Sel value={modeF} onChange={(v) => { setModeF(v); setPage(1); }}
                options={PAYMENT_MODE_OPTIONS}
                placeholder="All Modes" className="w-full" />
            </div>
          )}

          {/* Desktop Filters */}
          <div className="hidden md:flex  flex-wrap items-center gap-2 w-full">
            <div className="relative flex-1 min-w-[150px] lg:min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder={COLLECTION_HISTORY_STRINGS.PLACEHOLDER_SEARCH_HISTORY}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white" />
            </div>
            <div className="w-full md:w-36 lg:w-40 flex-shrink-0">
              <Inp type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} />
            </div>
            <div className="w-full md:w-36 lg:w-40 flex-shrink-0">
              <Inp type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1); }} />
            </div>
            <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); }}
              options={periodOptions} placeholder="All Periods" className="w-full md:w-36 lg:w-40 flex-shrink-0" />
            <Sel value={classF} onChange={(v) => { setClassF(v); setPage(1); }}
              options={classOptions} placeholder="All Classes" className="w-full md:w-32 flex-shrink-0" />
            <Sel value={modeF} onChange={(v) => { setModeF(v); setPage(1); }}
              options={PAYMENT_MODE_OPTIONS}
              placeholder="All Modes" className="w-full md:w-32 flex-shrink-0" />
          </div>

          {/* ── Desktop Table ── */}
          <div className="hidden xl:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {COLLECTION_HISTORY_STRINGS.TABLE_HISTORY_HEADERS.map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_HISTORY}</div>
                      </td>
                    </tr>
                  ) : filteredHist.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-14 text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_NO_HISTORY_RECORDS}</td></tr>
                  ) : filteredHist.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-3 py-3">
                        <span className="text-[#2563EB] font-bold text-xs">{h.receiptNo}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{fmtDate(h.date)}</td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-gray-900 text-sm">{h.studentName}</div>
                        <div className="text-xs text-gray-400">{h.studentCode}</div>
                      </td>
                      <td className="px-3 py-3">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{h.class}</span>
                      </td>
                      <td className="px-3 py-3 text-xs text-gray-600">{h.period}</td>
                      <td className="px-3 py-3 font-bold text-emerald-600 text-sm">{fmt(h.amount)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.discount > 0 ? fmt(h.discount) : '—'}</td>
                      <td className="px-3 py-3 text-xs text-amber-700">{h.lateFine > 0 ? fmt(h.lateFine) : '—'}</td>
                      <td className="px-3 py-3"><StatusPill status={h.mode} label={h.mode} /></td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.referenceNo || '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.recordedBy || '—'}</td>
                      <td className="px-3 py-3">
                        <Btn variant="ghost" size="xs" onClick={() => handleViewReceipt(h)}>
                          {COLLECTION_HISTORY_STRINGS.BTN_VIEW_RECEIPT}
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
              <span className="text-xs text-gray-500">Showing {filteredHist.length} transactions</span>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  {COLLECTION_HISTORY_STRINGS.BTN_PREV}
                </Btn>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => p + 1)} disabled={filteredHist.length < PAGE_SIZE}>
                  {COLLECTION_HISTORY_STRINGS.BTN_NEXT}
                </Btn>
              </div>
            </div>
          </div>

          {/* ── Mobile/Tablet Cards ── */}
          <div className="xl:hidden space-y-3">
            {loading ? (
              <div className="text-center py-14">
                <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                <div className="text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_LOADING_HISTORY}</div>
              </div>
            ) : filteredHist.length === 0 ? (
              <div className="text-center py-14 text-sm text-gray-400">{COLLECTION_HISTORY_STRINGS.MSG_NO_HISTORY_RECORDS}</div>
            ) : filteredHist.map((h) => (
              <HistoryCard key={h.id} h={h} onView={() => handleViewReceipt(h)} />
            ))}

            {filteredHist.length >= PAGE_SIZE && (
              <div className="flex items-center justify-between pt-2">
                <Btn variant="secondary" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  {COLLECTION_HISTORY_STRINGS.BTN_PREV}
                </Btn>
                <span className="text-xs text-gray-500">Page {page}</span>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => p + 1)} disabled={filteredHist.length < PAGE_SIZE}>
                  {COLLECTION_HISTORY_STRINGS.BTN_NEXT}
                </Btn>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── Modals ── */}
      <CollectFeeModal
        open={collectModal.open}
        onClose={() => setCollectModal({ open: false, student: null })}
        student={collectModal.student}
        periodOptions={periodOptions}
        onSuccess={handleCollectSuccess}
      />
      <BulkCollectModal
        open={bulkModal.open}
        onClose={() => setBulkModal({ open: false, students: [] })}
        students={bulkModal.students}
        onSuccess={handleBulkSuccess}
      />
      {receiptModal.open && (
        <FeeReceiptPrint
          receipt={receiptModal.receipt}
          onClose={() => setReceiptModal({ open: false, receipt: null })}
        />
      )}
    </div>
  );
};

export default CollectionsHistory;