import React, { useState, useEffect, useContext, useCallback, useRef } from 'react';
import {
  X, FileDown, AlertCircle, Printer, Search, Plus,
  CheckCircle, CheckCircle2, AlertTriangle, Info,
  ArrowRight, IndianRupee,
} from 'lucide-react';
import {
  getOutstandingFees,
  getFeeCollectionHistory,
  createFeeCollection,
  createBulkFeeCollection,
  getFeeReceiptById,
} from '../../Api/FeeCollection';
import { getFeePeriods }    from '../../Api/FeePeriods';
import { getFeeStructures } from '../../Api/FeeStructures';
import { getStudentByClass } from '../../Api/StudentsApi';
import { authFetch }        from '../../Authfetch/Authfetch';
import { UserContext }      from '../../ContextAPI/UserContext';
import FeeReceiptPrint      from '../../Components/FeeModal/FeeReciptPrint';

// ─── Constants ────────────────────────────────────────────────────────────────
const SCHOOL_ID  = 1;
const BASE_URL   = import.meta.env.VITE_API_BASE_V1;
const PAGE_SIZE  = 10;
const TODAY      = new Date().toISOString().split('T')[0];
const ONE_MONTH_AGO = (() => {
  const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
})();

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
    success: <CheckCircle2   size={15} className="flex-shrink-0 text-emerald-400" />,
    error:   <AlertCircle    size={15} className="flex-shrink-0 text-orange-400" />,
    warning: <AlertTriangle  size={15} className="flex-shrink-0 text-amber-400" />,
    info:    <Info           size={15} className="flex-shrink-0 text-blue-400" />,
  };
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
          style={{ animation: 'chToastIn .22s ease-out' }}>
          {icons[t.type] || icons.info}
          <div className="flex-1 min-w-0">
            {t.title   && <div className="text-[13px] font-semibold">{t.title}</div>}
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
  error:   (title, message, duration) => _toastDispatch?.({ type: 'error',   title, message, duration }),
  warning: (title, message, duration) => _toastDispatch?.({ type: 'warning', title, message, duration }),
  info:    (title, message, duration) => _toastDispatch?.({ type: 'info',    title, message, duration }),
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Av = ({ name, status, size = 'md' }) => {
  const sz = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-base' }[size];
  const bg = status === 'OVERDUE' ? 'bg-orange-700' : status === 'PARTIAL' ? 'bg-amber-700' : 'bg-[#1E3A5F]';
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
};

const StatusPill = ({ status, label }) => {
  const map = {
    PAID:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL:   'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE:   'bg-orange-50 text-orange-700 border-orange-200',
    PENDING:   'bg-gray-100 text-gray-500 border-gray-200',
    UNPAID:    'bg-gray-100 text-gray-500 border-gray-200',
    Pending:   'bg-gray-100 text-gray-500 border-gray-200',
    Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    CASH:      'bg-gray-100 text-gray-600 border-gray-200',
    ONLINE:    'bg-blue-50 text-blue-700 border-blue-200',
    CHEQUE:    'bg-slate-50 text-slate-600 border-slate-200',
    DD:        'bg-slate-50 text-slate-600 border-slate-200',
  };
  const dotMap = {
    PAID: 'bg-emerald-500', PARTIAL: 'bg-amber-500', OVERDUE: 'bg-orange-500',
    Completed: 'bg-emerald-500',
  };
  const cls = map[status] || 'bg-gray-100 text-gray-500 border-gray-200';
  const dot = dotMap[status];
  const display = status === 'UNPAID' ? 'Pending' : (label || status);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${cls}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />}
      {display}
    </span>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, subtitle, wide, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-start justify-center p-6 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-5xl' : 'max-w-lg'} my-4`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-[15px] font-bold text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={14} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// Shared button — matches Overview
const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, type = 'button', className = '' }) => {
  const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[12.5px]' }[size];
  const v = {
    primary:   'bg-[#2563EB] text-white hover:bg-blue-700',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost:     'bg-blue-50 text-[#1E3A5F] border border-blue-200 hover:bg-blue-100',
    navy:      'bg-[#1E3A5F] text-white hover:bg-[#162d4a]',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
      {children}
    </button>
  );
};

const Inp = ({ className = '', ...props }) => (
  <input className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white ${className}`} {...props} />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '', disabled }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
    className={`px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400 ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Collect Fee Modal ────────────────────────────────────────────────────────
const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess }) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY,
    referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
  });
  const [loading,         setLoading]         = useState(false);
  const [periodStructures, setPeriodStructures] = useState([]);
  const [periodClasses,   setPeriodClasses]   = useState([]);
  const [classesLoading,  setClassesLoading]  = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch,   setStudentSearch]   = useState('');
  const [activeStudent,   setActiveStudent]   = useState(null);

  // Derived values
  const balanceDue             = Number(activeStudent?.balance) || 0;
  const isFullyPaid            = activeStudent !== null && balanceDue <= 0;
  const amountNum              = parseFloat(form.amountPaid)  || 0;
  const discountNum            = parseFloat(form.discount)    || 0;
  const lateFineNum            = parseFloat(form.lateFine)    || 0;
  // Net cash collected after discount — this is what we send to the API
  const netAmount              = Math.max(0, amountNum - discountNum);
  const netTotal               = netAmount + lateFineNum;
  // Validate net (after discount) against balance — prevents the 400 error
  const amountExceedsBalance   = netAmount > balanceDue && balanceDue > 0;
  const discountExceedsAmount  = discountNum > amountNum;

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
        amountPaid:     initialStudent.balance > 0 ? String(initialStudent.balance) : '',
        paymentMode:    'CASH', paymentDate: TODAY,
        referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
      });
    } else {
      setActiveStudent(null); setSelectedPeriodId('');
      setForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  // Load classes for selected period
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
        toast.error('Load Failed', 'Could not fetch classes for this period.');
      } finally { setClassesLoading(false); }
    };
    load();
  }, [selectedPeriodId]);

  // Load students for selected class
  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    const load = async () => {
      setStudentsLoading(true);
      try {
        // Try getStudentByClass first, fall back to authFetch
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
        toast.error('Load Failed', 'Could not fetch students for this class.');
        setStudents([]);
      } finally { setStudentsLoading(false); }
    };
    load();
  }, [selectedClassId]);

  if (!open) return null;

  const isOverdue = activeStudent?.status === 'OVERDUE';
  const MODES     = [['CASH', '💵', 'Cash'], ['ONLINE', '🌐', 'Online'], ['CHEQUE', '📝', 'Cheque'], ['DD', '🏦', 'DD']];

  const filteredStudents = students.filter((s) => {
    const q    = studentSearch.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    return !q || name.includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName   = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const classObj   = periodClasses.find((c) => String(c.id) === selectedClassId);
    const matchedStr = periodStructures.find((st) => (st.classes || []).some((c) => String(c.id) === selectedClassId));
    const feeStructureId = matchedStr?.id ?? s.feeStructureId ?? null;
    const studentBalance = s.balanceDue ?? s.balance ?? 0;

    setActiveStudent({
      studentId:      s.id || s.studentId,
      studentName:    fullName,
      studentCode:    s.admissionNumber || s.studentCode,
      class:          s.className || s.class || classObj?.name || '',
      feeStructureId,
      feePeriodId:    selectedPeriodId,
      balance:        studentBalance,
      paidAmount:     s.paidAmount || 0,
      totalFee:       s.totalFee   || 0,
      dueDate:        s.dueDate,
      daysLate:       s.overdueDays || 0,
      status:
        s.overdueDays > 0 && studentBalance > 0 ? 'OVERDUE'
        : s.paidAmount > 0 && studentBalance > 0 ? 'PARTIAL'
        : studentBalance <= 0                    ? 'PAID'
        : 'PENDING',
      parentName:  s.parentName,
      parentPhone: s.parentPhone,
    });

    if (studentBalance <= 0) {
      setForm((p) => ({ ...p, amountPaid: '' }));
      toast.info('Fees Already Paid', `${fullName} has no outstanding balance.`);
    } else {
      setForm((p) => ({ ...p, amountPaid: String(studentBalance) }));
    }
  };

  const handleSubmit = async () => {
    if (!activeStudent)               { toast.warning('No Student Selected', 'Please select a student.'); return; }
    if (isFullyPaid)                  { toast.info('No Balance Due', `${activeStudent.studentName} has no outstanding balance.`); return; }
    if (!form.amountPaid || amountNum <= 0) { toast.warning('Invalid Amount', 'Please enter a valid amount.'); return; }
    if (amountExceedsBalance)         { toast.warning('Amount Too High', `Amount cannot exceed ${fmt(balanceDue)}.`); return; }
    if (discountExceedsAmount)        { toast.warning('Discount Too High', 'Discount cannot exceed the amount being collected.'); return; }
    if (!selectedPeriodId)            { toast.warning('No Period Selected', 'Please select a fee period.'); return; }
    if (!activeStudent.feeStructureId){ toast.error('Fee Structure Missing', 'No fee structure found for this class and period.'); return; }

    try {
      setLoading(true);
      const res = await createFeeCollection({
        studentId:      activeStudent.studentId,
        feeStructureId: activeStudent.feeStructureId,
        // Send net amount (gross − discount) — the actual cash collected
        amountPaid:     netAmount,
        discount:       discountNum || 0,
        discountReason: form.discountReason || null,
        lateFine:       lateFineNum || 0,
        paymentMode:    form.paymentMode,
        paymentDate:    form.paymentDate,
        referenceNo:    form.referenceNo || null,
        remarks:        form.remarks     || null,
      });
      toast.success('Payment Recorded', `Receipt generated for ${activeStudent.studentName}.`);
      onSuccess(res, activeStudent);
    } catch (e) {
      toast.error('Payment Failed', e.message || 'Could not record the payment. Please try again.');
    } finally { setLoading(false); }
  };

  const submitDisabled =
    loading || !activeStudent || isFullyPaid ||
    !form.amountPaid || amountNum <= 0 || netAmount <= 0 ||
    amountExceedsBalance || discountExceedsAmount;

  return (
    <Modal open={open} onClose={onClose}
      title="Collect Fee Payment"
      subtitle="Record a student fee payment and generate receipt"
      wide
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <div className="relative group">
            <Btn variant="success" onClick={handleSubmit} disabled={submitDisabled}>
              {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
              {loading ? 'Recording…' : '✓ Record & Generate Receipt'}
            </Btn>
            {activeStudent && isFullyPaid && (
              <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-800 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                ✓ Fees fully paid — no balance due
              </div>
            )}
          </div>
        </>
      }>
      <div className="grid grid-cols-2 gap-6">

        {/* ── LEFT: Period → Class → Student ── */}
        <div className="space-y-4">
          {/* Period */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fee Period <span className="text-gray-400">*</span></label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white">
              <option value="">-- Select fee period --</option>
              {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
            </select>
          </div>

          {/* Class chips */}
          {selectedPeriodId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Class <span className="text-gray-400">*</span>
                {classesLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              {!classesLoading && periodClasses.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  No classes linked to this period. Add a fee structure first.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50/50 max-h-32 overflow-y-auto">
                  {classesLoading
                    ? <div className="text-xs text-gray-400">Loading classes…</div>
                    : periodClasses.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setSelectedClassId(String(c.id)); setStudentSearch(''); setActiveStudent(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                          selectedClassId === String(c.id)
                            ? 'bg-[#1E3A5F] text-white border-[#1E3A5F]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#1E3A5F]/50 hover:text-[#1E3A5F]'
                        }`}>
                        {c.name}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* Student list */}
          {selectedClassId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Student <span className="text-gray-400">*</span>
                {studentsLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or admission no…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 bg-white" />
              </div>
              <div className="border border-gray-200 rounded-xl overflow-hidden max-h-52 overflow-y-auto">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-gray-400">Loading students…</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    {studentSearch ? 'No students match your search' : 'No students found in this class'}
                  </div>
                ) : filteredStudents.map((s) => {
                  const fullName   = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                  const isSelected = activeStudent?.studentId === (s.id || s.studentId);
                  const sBalance   = s.balanceDue ?? s.balance ?? 0;
                  const isPaid     = sBalance <= 0;
                  return (
                    <div key={s.id || s.studentId} onClick={() => selectStudent(s)}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-50 last:border-0 ${
                        isSelected ? 'bg-blue-50 border-l-4 border-l-[#1E3A5F]'
                        : isPaid    ? 'bg-emerald-50/50 hover:bg-emerald-50'
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

          {/* Student card */}
          {activeStudent && (
            <div className={`border rounded-xl p-3 flex items-center gap-3 ${
              isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'
            }`}>
              <Av name={activeStudent.studentName} status={activeStudent.status} size="lg" />
              <div>
                <div className="font-bold text-gray-900">{activeStudent.studentName}</div>
                <div className="text-xs text-gray-600">{activeStudent.studentCode} · Class {activeStudent.class}</div>
                {activeStudent.parentName && <div className="text-[11px] text-gray-500 mt-0.5">Parent: {activeStudent.parentName}</div>}
                {isFullyPaid && (
                  <div className="flex items-center gap-1 mt-1">
                    <CheckCircle size={12} className="text-emerald-600" />
                    <span className="text-[11px] font-bold text-emerald-700">Fees fully paid</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Paid / Balance summary */}
          {activeStudent && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Already Paid</div>
                <div className="text-lg font-extrabold text-emerald-600">{fmt(activeStudent.paidAmount || 0)}</div>
              </div>
              <div className={`border rounded-xl px-3 py-2 text-center ${
                isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-orange-50 border-orange-200'
              }`}>
                <div className={`text-[10px] font-bold uppercase ${isFullyPaid ? 'text-emerald-700' : 'text-orange-700'}`}>
                  Balance Due
                </div>
                <div className={`text-lg font-extrabold ${isFullyPaid ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {fmt(balanceDue)}
                </div>
              </div>
            </div>
          )}

          {/* Fully paid notice */}
          {isFullyPaid && (
            <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5">
              <CheckCircle size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold text-emerald-800">No payment required</div>
                <div className="text-[11px] text-emerald-700 mt-0.5">This student has no outstanding balance.</div>
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
                You can collect a <strong>partial amount</strong>. Enter any amount up to {fmt(balanceDue)}.
              </div>
            </div>
          )}

          {/* Amount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Amount to Collect <span className="text-gray-400">*</span>
            </label>
            <div className="relative">
              <Inp
                type="number"
                value={form.amountPaid}
                className={`pr-28 ${amountExceedsBalance ? 'border-orange-400 bg-orange-50' : ''}`}
                onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))}
                max={balanceDue} min={1}
                placeholder={`Max ${fmt(balanceDue)}`}
              />
              {activeStudent && balanceDue > 0 && (
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, amountPaid: String(balanceDue) }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1E3A5F] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded">
                  Full {fmt(balanceDue)}
                </button>
              )}
            </div>
            {amountExceedsBalance && (
              <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Net amount ({fmt(netAmount)}) exceeds balance due ({fmt(balanceDue)})
              </p>
            )}
            {/* Partial indicator */}
            {activeStudent && !isFullyPaid && netAmount > 0 && netAmount < balanceDue && !amountExceedsBalance && (
              <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Info size={11} /> Partial payment — {fmt(balanceDue - netAmount)} will remain outstanding
              </p>
            )}
          </div>

          {/* Payment mode */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Payment Mode <span className="text-gray-400">*</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map(([mode, icon, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border-2 transition-all ${
                    form.paymentMode === mode
                      ? 'border-[#1E3A5F] bg-blue-50 text-[#1E3A5F]'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-[#1E3A5F]/40'
                  }`}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10.5px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Date + Reference */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Payment Date <span className="text-gray-400">*</span>
              </label>
              <Inp type="date" value={form.paymentDate}
                onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reference No.</label>
              <Inp value={form.referenceNo} placeholder="TXN / Cheque no."
                onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />
            </div>
          </div>

          {/* Discount */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Discount <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <Inp
              type="number" value={form.discount} placeholder="Discount amount"
              className={discountExceedsAmount ? 'border-orange-400 bg-orange-50' : ''}
              onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))}
            />
            {discountExceedsAmount && (
              <p className="text-[11px] text-orange-600 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Discount cannot exceed collected amount ({fmt(amountNum)})
              </p>
            )}
            {discountNum > 0 && !discountExceedsAmount && (
              <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                <CheckCircle size={11} /> Discount of {fmt(discountNum)} applied
              </p>
            )}
            <textarea value={form.discountReason} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
              placeholder="Reason e.g. Sibling discount, scholarship…"
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

          {/* Late fine (overdue only) */}
          {isOverdue && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-start gap-2 mb-2">
                <AlertTriangle size={14} className="text-amber-600 mt-0.5" />
                <div>
                  <div className="text-sm font-bold text-amber-800">Past Due — Add Late Fine?</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Due: {fmtDate(activeStudent?.dueDate)} · {activeStudent?.daysLate} day{activeStudent?.daysLate !== 1 ? 's' : ''} overdue
                  </div>
                </div>
              </div>
              <Inp type="number" value={form.lateFine} placeholder="Fine amount (₹)"
                onChange={(e) => setForm((p) => ({ ...p, lateFine: e.target.value }))} />
            </div>
          )}

          {/* Remarks */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Remarks</label>
            <textarea value={form.remarks} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="Optional note…"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

          {/* Net total bar */}
          <div className="flex justify-between items-center bg-[#1E3A5F] rounded-xl px-4 py-3">
            <div>
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Receipt No.</div>
              <div className="text-white font-bold text-sm mt-0.5">Auto-generated</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Net Collected</div>
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
  const [commonMode, setCommonMode] = useState('CASH');
  const [commonDate, setCommonDate] = useState(TODAY);
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (open && students.length > 0) {
      setCommonMode('CASH'); setCommonDate(TODAY);
      setRows(students.map((s) => ({
        id: s.id, studentId: s.studentId, studentName: s.studentName,
        studentCode: s.studentCode, class: s.class, period: s.period,
        balanceDue: s.balance, feeStructureId: s.feeStructureId,
        collectAmount: s.balance, discount: 0,
        lateFine: s.status === 'OVERDUE' ? '' : null,
        daysLate: s.daysLate || 0, paymentMode: 'CASH', paymentDate: TODAY,
      })));
    }
  }, [open, students]);

  const update     = (id, field, val) => setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const applyAll   = () => setRows((p) => p.map((r) => ({ ...r, paymentMode: commonMode, paymentDate: commonDate })));
  const grandTotal = rows.reduce((s, r) => s + (parseFloat(r.collectAmount) || 0), 0);
  const MODES      = [{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'DD', label: 'DD' }];

  const handleSubmit = async () => {
    const bad = rows.find((r) => !r.collectAmount || parseFloat(r.collectAmount) <= 0);
    if (bad) { toast.warning('Missing Amount', `Please fill in collect amount for ${bad.studentName}.`); return; }
    const over = rows.find((r) => parseFloat(r.collectAmount) > parseFloat(r.balanceDue));
    if (over) { toast.warning('Amount Exceeds Balance', `${over.studentName}: exceeds balance of ${fmt(over.balanceDue)}.`); return; }
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
      toast.success('Bulk Payment Processed', `${Array.isArray(res) ? res.length : rows.length} receipts generated.`);
      onSuccess(res);
    } catch (e) {
      toast.error('Bulk Payment Failed', e.message || 'Could not process bulk payments.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose}
      title="Bulk Fee Collection"
      subtitle={`${students.length} students selected`}
      wide
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" onClick={handleSubmit} disabled={loading}>
            {loading && <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
            {loading ? 'Processing…' : `Process ${rows.length} Payments`}
          </Btn>
        </>
      }>
      <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 mb-4 text-sm text-emerald-800">
        <CheckCircle2 size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" />
        Payments will be recorded for all {students.length} selected students.
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-4 flex items-end gap-4">
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Common Payment Mode</label>
          <Sel value={commonMode} onChange={setCommonMode} options={MODES} className="w-32" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Date</label>
          <Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-40" />
        </div>
        <Btn variant="ghost" size="sm" onClick={applyAll}>Apply to All Rows</Btn>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Student', 'Class', 'Period', 'Balance Due', 'Collect Amount', 'Discount', 'Late Fine', 'Mode'].map((h) => (
                <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.id} className={row.daysLate > 0 ? 'bg-orange-50/60' : 'hover:bg-gray-50/60'}>
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-gray-900">{row.studentName}</div>
                  <div className="text-xs text-gray-400">{row.studentCode}</div>
                </td>
                <td className="px-3 py-2.5">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{row.class}</span>
                </td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{row.period}</td>
                <td className="px-3 py-2.5">
                  {row.daysLate > 0
                    ? <span className="text-red-700 text-xs font-bold">{fmt(row.balanceDue)} · {row.daysLate}d late</span>
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
                    {MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-between items-center bg-[#1E3A5F] rounded-xl px-4 py-3 mt-4">
        <div className="text-sm text-white/60">{rows.length} receipts will be generated</div>
        <div className="text-white font-extrabold text-base">Grand Total: {fmt(grandTotal)}</div>
      </div>
    </Modal>
  );
};

// ─── Main: CollectionsHistory ─────────────────────────────────────────────────
const CollectionsHistory = () => {
  const { currentAcademicYear } = useContext(UserContext);
  const academicYearId    = currentAcademicYear?.id    || null;
  const academicYearLabel = currentAcademicYear?.label || null;

  const [tab,      setTab]      = useState('outstanding');
  const [search,   setSearch]   = useState('');
  const [classF,   setClassF]   = useState('');
  const [periodF,  setPeriodF]  = useState('');
  const [statusF,  setStatusF]  = useState('');
  const [modeF,    setModeF]    = useState('');
  const [page,     setPage]     = useState(1);
  const [selected, setSelected] = useState([]);

  const [outstanding,    setOutstanding]    = useState([]);
  const [history,        setHistory]        = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState(null);
  const [classOptions,   setClassOptions]   = useState([]);
  const [periodOptions,  setPeriodOptions]  = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(true);

  const [collectModal, setCollectModal] = useState({ open: false, student: null });
  const [bulkModal,    setBulkModal]    = useState({ open: false, students: [] });
  const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });

  const [fromDate,   setFromDate]   = useState('');
  const [toDate,     setToDate]     = useState('');
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setFromDate(ONE_MONTH_AGO);
    setToDate(TODAY);
  }, []);

  // Load filter options
  useEffect(() => {
    if (!academicYearId) { setOptionsLoading(false); return; }
    const loadOptions = async () => {
      setOptionsLoading(true);
      try {
        const [classesRes, periodsData] = await Promise.all([
          authFetch(`${BASE_URL}/classes/school/${SCHOOL_ID}/active`).catch(() => null),
          getFeePeriods(academicYearId).catch(() => []),
        ]);
        if (classesRes?.ok) {
          const classesData = await classesRes.json();
          const records = Array.isArray(classesData) ? classesData : (classesData.data || []);
          setClassOptions(records.map((c) => ({ value: String(c.id), label: c.name || c.className })));
        }
        if (Array.isArray(periodsData)) {
          setPeriodOptions(periodsData.map((p) => ({ value: String(p.id), label: p.periodName || p.name })));
        }
      } catch (e) {
        console.error('Failed to load filter options:', e);
      } finally { setOptionsLoading(false); }
    };
    loadOptions();
  }, [academicYearId]);

  const fetchOutstanding = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (classF)  params.classId  = classF;
      if (periodF) params.periodId = periodF;
      const res = await getOutstandingFees(params);
      setOutstanding(
        (res.records || []).map((r, i) => {
          let status = 'PENDING';
          if ((r.paidAmount || 0) > 0 && r.balanceDue > 0) status = 'PARTIAL';
          if (r.balanceDue <= 0)                            status = 'PAID';
          if (r.overdueDays > 0 && r.balanceDue > 0)       status = 'OVERDUE';
          return {
            id: i + 1, studentId: r.studentId, studentName: r.studentName,
            studentCode: r.admissionNumber, class: r.className, section: r.sectionName,
            period: r.feePeriodName, feePeriodId: r.feePeriodId || r.periodId,
            balance: r.balanceDue, totalFee: r.totalFee, paidAmount: r.paidAmount,
            daysLate: r.overdueDays || 0, feeStructureId: r.feeStructureId,
            dueDate: r.dueDate, status,
          };
        })
      );
    } catch (e) {
      setError(e.message || 'Failed to load outstanding fees.');
      setOutstanding([]);
    } finally { setLoading(false); }
  }, [classF, periodF]);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const params = { fromDate, toDate, page: page - 1, size: PAGE_SIZE };
      if (classF)  params.classId  = classF;
      if (periodF) params.periodId = periodF;
      if (modeF)   params.mode     = modeF;
      const res = await getFeeCollectionHistory(params);
      const records = res?.records || [];
      setHistory(records.map((r) => ({
        id: r.id, receiptNo: r.receiptNo, date: r.paymentDate, studentName: r.studentName,
        studentCode: r.admissionNumber,
        class: `${r.className}${r.sectionName ? ' ' + r.sectionName : ''}`,
        period: r.feePeriodName, amount: r.amountPaid, discount: r.discount || 0,
        lateFine: r.lateFine || 0, mode: r.paymentMode, referenceNo: r.referenceNo,
        recordedBy: r.collectedBy, status: 'Completed',
      })));
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message || 'Failed to load history');
      setHistory([]);
    } finally { setLoading(false); }
  }, [fromDate, toDate, classF, periodF, modeF, page]);

  useEffect(() => {
    if (optionsLoading) return;
    if (tab === 'outstanding') fetchOutstanding();
    else if (fromDate && toDate) fetchHistory();
  }, [tab, fromDate, toDate, classF, periodF, modeF, page, optionsLoading, fetchOutstanding, fetchHistory]);

  if (!academicYearId || optionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <span className="w-6 h-6 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
        <div className="text-sm text-gray-500">
          {!academicYearId ? '⏳ Waiting for academic year…' : 'Loading fee periods and classes…'}
        </div>
      </div>
    );
  }

  // Filtering
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

  const pagedOut      = filteredOut.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalOutPages = Math.max(1, Math.ceil(filteredOut.length / PAGE_SIZE));
  const overdueCount  = outstanding.filter((s) => s.status === 'OVERDUE').length;

  const toggleRow = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll = () => {
    const ids   = filteredOut.map((s) => s.id);
    const allSel = ids.every((id) => selected.includes(id));
    setSelected(allSel ? (p) => p.filter((id) => !ids.includes(id)) : (p) => [...new Set([...p, ...ids])]);
  };
  const selStudents = outstanding.filter((s) => selected.includes(s.id));
  const selTotal    = selStudents.reduce((a, s) => a + s.balance, 0);

  const handleCollectSuccess = (response, student) => {
    setCollectModal({ open: false, student: null });
    const data = response?.data || response;
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo:    data.receiptNo,
        date:         data.paymentDate,
        studentName:  data.studentName     || student.studentName,
        studentCode:  data.admissionNumber || student.studentCode,
        class:        data.className       || student.class,
        period:       data.feePeriodName   || student.period,
        components:   data.components      || [{ name: 'Fee Payment', amount: data.amountPaid }],
        amountPaid:   data.amountPaid,
        discount:     data.discount        || 0,
        lateFine:     data.lateFine        || 0,
        paymentMode:  data.paymentMode,
        referenceNo:  data.referenceNo,
        balanceAfter: data.balanceAfter,
        recordedBy:   data.collectedBy     || 'Admin',
      },
    });
    fetchOutstanding(); setSelected([]);
  };

  const handleBulkSuccess = (responses) => {
    setBulkModal({ open: false, students: [] });
    toast.success('Bulk Payment Done', `${Array.isArray(responses) ? responses.length : '?'} payments processed successfully.`);
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
    <div className="space-y-5">
      <ToastContainer />

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Collections & History</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Academic Year {academicYearLabel} · Collect fee payments and view transaction history
          </p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <FileDown size={14} /> Export
          </button>
          <button onClick={() => setCollectModal({ open: true, student: null })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={15} /> Collect Fee
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-orange-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-orange-700">{error}</div>
          <button
            onClick={() => { setError(null); tab === 'outstanding' ? fetchOutstanding() : fetchHistory(); }}
            className="text-orange-600 hover:text-orange-800 font-semibold text-sm">
            Retry
          </button>
        </div>
      )}

      {/* ── Tabs ── */}
      <div className="flex border-b border-gray-200">
        {[
          { key: 'outstanding', label: 'Outstanding & Overdue', badge: overdueCount },
          { key: 'history',     label: 'Payment History',       badge: 0 },
        ].map((t) => (
          <button key={t.key}
            onClick={() => { setTab(t.key); resetTab(); }}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
              tab === t.key
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
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Student name or ID…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
            </div>
            <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); setSelected([]); }}
              options={periodOptions} placeholder="All Periods" className="w-40" />
            <Sel value={classF}  onChange={(v) => { setClassF(v);  setPage(1); setSelected([]); }}
              options={classOptions}  placeholder="All Classes"  className="w-36" />
            <Sel value={statusF} onChange={(v) => { setStatusF(v); setPage(1); }}
              options={[
                { value: 'OVERDUE', label: 'Overdue'  },
                { value: 'PARTIAL', label: 'Partial'  },
                { value: 'PENDING', label: 'Pending'  },
              ]}
              placeholder="All Status" className="w-36" />
          </div>

          {/* Bulk action bar */}
          {selected.length > 0 && (
            <div className="bg-[#1E3A5F] rounded-xl px-5 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-6">
                <div className="text-white font-bold text-sm">
                  {selected.length} student{selected.length !== 1 ? 's' : ''} selected
                </div>
                <div className="text-white/60 text-sm">
                  Total: <span className="font-bold text-white">{fmt(selTotal)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={() => setSelected([])}
                  className="!bg-white/10 hover:!bg-white/20 !border-white/30 !text-white">
                  Clear
                </Btn>
                <Btn variant="success" size="sm"
                  onClick={() => setBulkModal({ open: true, students: selStudents })}>
                  Collect Selected ({selected.length})
                </Btn>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
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
                    {['Student', 'Class', 'Period', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={10} className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">Loading outstanding fees…</div>
                      </td>
                    </tr>
                  ) : pagedOut.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-14 text-sm text-gray-400">No records found</td></tr>
                  ) : pagedOut.map((s) => {
                    const isSel = selected.includes(s.id);
                    return (
                      <tr key={s.id}
                        className={`transition-colors ${
                          isSel ? 'bg-blue-50 border-l-4 border-l-[#2563EB]' : 'hover:bg-gray-50/60'
                        }`}>
                        <td className="px-3 py-3">
                          <input type="checkbox"
                            className="w-3.5 h-3.5 cursor-pointer accent-[#2563EB] rounded"
                            checked={isSel} onChange={() => toggleRow(s.id)} />
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <Av name={s.studentName} status={s.status} size="sm" />
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">{s.studentName}</div>
                              <div className="text-xs text-gray-500">{s.studentCode}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{s.class}</span>
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">{s.period}</td>
                        <td className="px-3 py-3 text-sm text-gray-700">{fmt(s.totalFee)}</td>
                        <td className={`px-3 py-3 text-sm font-semibold ${s.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {fmt(s.paidAmount)}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-semibold text-gray-900 text-sm">{fmt(s.balance)}</span>
                          {s.status === 'OVERDUE' && (
                            <div className="text-[10.5px] text-orange-600 mt-0.5 font-medium">{s.daysLate}d overdue</div>
                          )}
                        </td>
                        <td className="px-3 py-3 text-xs text-gray-600">{fmtDate(s.dueDate)}</td>
                        <td className="px-3 py-3">
                          <StatusPill status={s.status} />
                        </td>
                        <td className="px-3 py-3">
                          <Btn variant="primary" size="xs"
                            onClick={() => setCollectModal({ open: true, student: s })}>
                            Collect
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
                  ← Prev
                </Btn>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => Math.min(totalOutPages, p + 1))} disabled={page >= totalOutPages}>
                  Next →
                </Btn>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ══ HISTORY TAB ══ */}
      {tab === 'history' && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Receipt no. or student…"
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all" />
            </div>
            <Inp type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-40" />
            <Inp type="date" value={toDate}   onChange={(e) => { setToDate(e.target.value);   setPage(1); }} className="w-40" />
            <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); }}
              options={periodOptions} placeholder="All Periods" className="w-40" />
            <Sel value={classF}  onChange={(v) => { setClassF(v);  setPage(1); }}
              options={classOptions}  placeholder="All Classes"  className="w-32" />
            <Sel value={modeF}   onChange={(v) => { setModeF(v);   setPage(1); }}
              options={[
                { value: 'CASH',   label: 'Cash'   },
                { value: 'ONLINE', label: 'Online' },
                { value: 'CHEQUE', label: 'Cheque' },
                { value: 'DD',     label: 'DD'     },
              ]}
              placeholder="All Modes" className="w-32" />
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100">
                    {['Receipt No.', 'Date', 'Student', 'Class', 'Period', 'Collected', 'Discount', 'Late Fine', 'Mode', 'Ref. No.', 'Recorded By', ''].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={12} className="text-center py-14">
                        <span className="w-7 h-7 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin inline-block mb-2" />
                        <div className="text-sm text-gray-400">Loading history…</div>
                      </td>
                    </tr>
                  ) : filteredHist.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-14 text-sm text-gray-400">No payment records found</td></tr>
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
                      <td className="px-3 py-3 text-xs text-gray-500">{h.discount  > 0 ? fmt(h.discount)  : '—'}</td>
                      <td className="px-3 py-3 text-xs text-amber-700">{h.lateFine > 0 ? fmt(h.lateFine) : '—'}</td>
                      <td className="px-3 py-3"><StatusPill status={h.mode} label={h.mode} /></td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.referenceNo || '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.recordedBy  || '—'}</td>
                      <td className="px-3 py-3">
                        <Btn variant="ghost" size="xs" onClick={() => handleViewReceipt(h)}>
                          Receipt
                        </Btn>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50/80 border-t border-gray-100">
              <span className="text-xs text-gray-500">Showing {filteredHist.length} transactions</span>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                  ← Prev
                </Btn>
                <Btn variant="primary" size="sm"
                  onClick={() => setPage((p) => p + 1)} disabled={filteredHist.length < PAGE_SIZE}>
                  Next →
                </Btn>
              </div>
            </div>
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