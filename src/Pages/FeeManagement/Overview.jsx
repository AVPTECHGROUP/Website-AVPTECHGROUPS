import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext
} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download, Plus, X, Printer, ArrowRight, Search,
  CheckCircle, AlertCircle, Info, AlertTriangle,
  CheckCircle2, TrendingUp, Users, Calendar, Layers,
  IndianRupee, Clock, BarChart2,
} from 'lucide-react';
import { getFeeDashboard } from '../../Api/FeeDashboard';
import { getFeePeriods } from '../../Api/FeePeriods';
import { getFeeStructures } from '../../Api/FeeStructures';
import { getStudentByClass } from '../../Api/StudentsApi';
import {
  getOutstandingFees, createFeeCollection,
  createBulkFeeCollection, getFeeCollectionHistory,
} from '../../Api/FeeCollection';
import { UserContext } from '../../ContextAPI/UserContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const ONE_MONTH_AGO = (() => {
  const d = new Date(); d.setMonth(d.getMonth() - 1); return d.toISOString().split('T')[0];
})();

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmt = (n) => '₹' + (Number(n) || 0).toLocaleString('en-IN');
const fmtCompact = (n) => {
  n = Number(n) || 0;
  if (n >= 10000000) return '₹' + (n / 10000000).toFixed(1) + 'Cr';
  if (n >= 100000)   return '₹' + (n / 100000).toFixed(1) + 'L';
  if (n >= 1000)     return '₹' + (n / 1000).toFixed(1) + 'K';
  return '₹' + n.toLocaleString('en-IN');
};
const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};
const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0] || '').join('').toUpperCase() || '??';

// ─── Period type config ───────────────────────────────────────────────────────
const PERIOD_TYPE_GRADIENT = {
  QUARTERLY:   'from-[#1A3A5C] to-[#2563EB]',
  MONTHLY:     'from-[#0369A1] to-[#0EA5E9]',
  YEARLY:      'from-[#0D7A55] to-[#10B981]',
  HALF_YEARLY: 'from-[#7C3AED] to-[#A78BFA]',
  CUSTOM:      'from-[#92400E] to-[#F59E0B]',
};
const PERIOD_TYPE_BADGE = {
  QUARTERLY:   'bg-blue-50 text-blue-700 border-blue-200',
  MONTHLY:     'bg-sky-50 text-sky-700 border-sky-200',
  YEARLY:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  HALF_YEARLY: 'bg-violet-50 text-violet-700 border-violet-200',
  CUSTOM:      'bg-amber-50 text-amber-700 border-amber-200',
};
const PERIOD_TYPE_LABEL = {
  QUARTERLY: 'Quarterly', MONTHLY: 'Monthly', YEARLY: 'Yearly',
  HALF_YEARLY: 'Half-Yearly', CUSTOM: 'Custom',
};

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
    error:   <AlertCircle  size={15} className="flex-shrink-0 text-red-400" />,
    warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
    info:    <Info          size={15} className="flex-shrink-0 text-blue-400" />,
  };
  return (
    <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id}
          className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
          style={{ animation: 'ovToastIn .22s ease-out' }}>
          {icons[t.type] || icons.info}
          <div className="flex-1 min-w-0">
            {t.title   && <div className="text-[13px] font-semibold">{t.title}</div>}
            {t.message && <div className="text-[12px] text-white/70 mt-0.5">{t.message}</div>}
          </div>
          <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
            className="opacity-50 hover:opacity-100 ml-1 mt-0.5 flex-shrink-0"><X size={13} /></button>
        </div>
      ))}
      <style>{`@keyframes ovToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
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
  const bg = status === 'OVERDUE' ? 'bg-red-700' : status === 'PARTIAL' ? 'bg-amber-700' : 'bg-[#1E3A5F]';
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
};

// Status pill — matches FeeStructures/FeePeriods
const StatusPill = ({ status, label }) => {
  const map = {
    PAID:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL:  'bg-amber-50 text-amber-700 border-amber-200',
    OVERDUE:  'bg-red-50 text-red-700 border-red-200',
    PENDING:  'bg-gray-100 text-gray-500 border-gray-200',
    UNPAID:   'bg-gray-100 text-gray-500 border-gray-200',
    CLOSED:   'bg-gray-100 text-gray-500 border-gray-200',
    UPCOMING: 'bg-gray-100 text-gray-500 border-gray-200',
    ACTIVE:   'bg-emerald-50 text-emerald-700 border-emerald-200',
    DRAFT:    'bg-amber-50 text-amber-700 border-amber-200',
    LOCKED:   'bg-gray-100 text-gray-500 border-gray-200',
  };
  const dotMap = {
    PAID: 'bg-emerald-500', PARTIAL: 'bg-amber-500', OVERDUE: 'bg-red-500',
    ACTIVE: 'bg-emerald-500', DRAFT: 'bg-amber-500',
  };
  const cls = map[status] || map.PENDING;
  const dot = dotMap[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11.5px] font-semibold ${cls}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />}
      {label}
    </span>
  );
};

// Type badge (period type)
const TypeBadge = ({ type }) => {
  const cls = PERIOD_TYPE_BADGE[type] || 'bg-gray-50 text-gray-600 border-gray-200';
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md border text-[11px] font-semibold ${cls}`}>
      {PERIOD_TYPE_LABEL[type] || type}
    </span>
  );
};

// Progress bar
const ProgressBar = ({ pct }) => {
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 70 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-[11px] text-gray-500">{pct}%</span>
    </div>
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
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
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

// Shared button
const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[12.5px]' }[size];
  const v = {
    primary:   'bg-[#2563EB] text-white hover:bg-blue-700',
    success:   'bg-emerald-600 text-white hover:bg-emerald-700',
    danger:    'bg-red-600 text-white hover:bg-red-700',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost:     'bg-blue-50 text-[#1E3A5F] border border-blue-200 hover:bg-blue-100',
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
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

// ─── Receipt Modal ────────────────────────────────────────────────────────────
const ReceiptModal = ({ open, onClose, receipt }) => {
  const printRef = useRef();
  if (!open || !receipt) return null;
  const handlePrint = () => {
    const w = window.open('', '_blank');
    w.document.write(`<html><head><title>Receipt ${receipt.receiptNo}</title>
      <style>body{font-family:monospace;font-size:12px;padding:20px}hr{border:none;border-top:1px dashed #999;margin:8px 0}</style>
      </head><body>${printRef.current?.innerHTML || ''}</body></html>`);
    w.document.close(); w.print();
  };
  return (
    <Modal open={open} onClose={onClose} title="Payment Receipt"
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Close</Btn>
          <Btn variant="primary" onClick={handlePrint}><Printer size={13} /> Print</Btn>
        </>
      }>
      <div ref={printRef} className="border-2 border-gray-200 rounded-xl p-6 font-mono text-xs max-w-sm mx-auto bg-gray-50">
        <div className="text-center mb-3 font-sans"><div className="text-[13.5px] font-extrabold">FEE RECEIPT</div></div>
        <hr className="border-dashed border-gray-300" />
        <div className="flex justify-between font-bold my-2"><span>RECEIPT</span><span>{receipt.receiptNo}</span></div>
        <hr className="border-dashed border-gray-300" />
        <div className="space-y-1 my-2">
          {[['Date', fmtDate(receipt.date)], ['Student', receipt.studentName], ['Class', receipt.class || receipt.className],
            ['Adm. No.', receipt.studentCode], ['Period', receipt.period || receipt.periodName]].map(([k, v]) => (
            <div key={k} className="flex justify-between"><span>{k}:</span><span>{v}</span></div>
          ))}
        </div>
        <hr className="border-dashed border-gray-300" />
        <div className="space-y-1 my-2">
          {(receipt.components || []).map((c, i) => (
            <div key={i} className="flex justify-between"><span>{c.name || c.componentType}</span><span>{fmt(c.amount)}</span></div>
          ))}
          {receipt.lateFine > 0 && <div className="flex justify-between text-amber-700 font-semibold"><span>Late Fine</span><span>{fmt(receipt.lateFine)}</span></div>}
          {receipt.discount > 0 && <div className="flex justify-between text-emerald-700 font-semibold"><span>Discount</span><span>-{fmt(receipt.discount)}</span></div>}
        </div>
        <hr className="border-dashed border-gray-300" />
        <div className="space-y-1 my-2">
          <div className="flex justify-between font-bold"><span>TOTAL COLLECTED</span><span>{fmt(receipt.amountPaid)}</span></div>
          <div className="flex justify-between"><span>Mode:</span><span>{receipt.paymentMode}</span></div>
          {receipt.referenceNo && <div className="flex justify-between"><span>Ref:</span><span>{receipt.referenceNo}</span></div>}
          <div className="flex justify-between text-emerald-700 font-semibold"><span>Balance After:</span><span>{fmt(receipt.balanceAfter)}</span></div>
        </div>
        <hr className="border-dashed border-gray-300" />
        <div className="flex justify-between text-[10px] text-gray-400 font-sans mt-2">
          <span>By: {receipt.recordedBy || 'Admin'}</span><span>{fmtDate(receipt.date)}</span>
        </div>
        <div className="text-center mt-4">
          <span className="inline-block text-emerald-700 border-2 border-emerald-700 px-5 py-1 font-black text-base tracking-widest -rotate-[6deg] font-sans">PAID</span>
        </div>
      </div>
    </Modal>
  );
};

// ─── Collect Fee Modal ────────────────────────────────────────────────────────
const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess }) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY,
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

  const balanceDue          = Number(activeStudent?.balance) || 0;
  const isFullyPaid         = activeStudent !== null && balanceDue <= 0;
  const amountNum           = parseFloat(form.amountPaid)  || 0;
  const discountNum         = parseFloat(form.discount)    || 0;
  const lateFineNum         = parseFloat(form.lateFine)    || 0;
  const netTotal            = amountNum + lateFineNum - discountNum;
  const amountExceedsBalance   = amountNum > balanceDue && balanceDue > 0;
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
      setForm({ amountPaid: initialStudent.balance > 0 ? initialStudent.balance?.toString() : '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    } else {
      setActiveStudent(null); setSelectedPeriodId('');
      setForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  useEffect(() => {
    if (!selectedPeriodId) { setPeriodStructures([]); setPeriodClasses([]); setSelectedClassId(''); setStudents([]); setActiveStudent(null); return; }
    const load = async () => {
      setClassesLoading(true);
      try {
        const structures = await getFeeStructures(parseInt(selectedPeriodId));
        const arr = Array.isArray(structures) ? structures : [];
        setPeriodStructures(arr);
        const seen = new Set(); const classes = [];
        arr.forEach((s) => (s.classes || []).forEach((c) => { if (!seen.has(c.id)) { seen.add(c.id); classes.push({ id: c.id, name: c.name || c.className }); } }));
        setPeriodClasses(classes);
      } catch { toast.error('Load Failed', 'Could not fetch classes for this period.'); }
      finally { setClassesLoading(false); }
    };
    load();
  }, [selectedPeriodId]);

  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    const load = async () => {
      setStudentsLoading(true);
      try { const list = await getStudentByClass(selectedClassId); setStudents(Array.isArray(list) ? list : []); }
      catch { toast.error('Load Failed', 'Could not fetch students for this class.'); setStudents([]); }
      finally { setStudentsLoading(false); }
    };
    load();
  }, [selectedClassId]);

  if (!open) return null;

  const isOverdue = activeStudent?.status === 'OVERDUE';
  const MODES = [['CASH', '💵', 'Cash'], ['ONLINE', '🌐', 'Online'], ['CHEQUE', '📝', 'Cheque'], ['DD', '🏦', 'DD']];
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    return !q || name.includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const classObj = periodClasses.find((c) => String(c.id) === selectedClassId);
    const matchedStructure = periodStructures.find((struct) => (struct.classes || []).some((c) => String(c.id) === selectedClassId));
    const resolvedFeeStructureId = matchedStructure?.id ?? s.feeStructureId ?? null;
    const studentBalance = s.balanceDue ?? s.balance ?? 0;
    setActiveStudent({
      studentId: s.id || s.studentId, studentName: fullName, studentCode: s.admissionNumber || s.studentCode,
      class: s.className || s.class || classObj?.name || '', feeStructureId: resolvedFeeStructureId,
      feePeriodId: selectedPeriodId, balance: studentBalance, paidAmount: s.paidAmount || 0,
      totalFee: s.totalFee || 0, dueDate: s.dueDate, daysLate: s.overdueDays || 0,
      status: (s.overdueDays > 0 && studentBalance > 0) ? 'OVERDUE' : (s.paidAmount > 0 && studentBalance > 0) ? 'PARTIAL' : studentBalance <= 0 ? 'PAID' : 'PENDING',
      parentName: s.parentName, parentPhone: s.parentPhone,
    });
    if (studentBalance <= 0) {
      setForm((p) => ({ ...p, amountPaid: '' }));
      toast.info('Fees Already Paid', `${fullName} has no outstanding balance.`);
    } else {
      setForm((p) => ({ ...p, amountPaid: String(studentBalance) }));
    }
  };

  const handleSubmit = async () => {
    if (!activeStudent)                            { toast.warning('No Student Selected', 'Please select a student to continue.'); return; }
    if (isFullyPaid)                               { toast.info('No Balance Due', `${activeStudent.studentName} has already paid all fees.`); return; }
    if (!form.amountPaid || amountNum <= 0)        { toast.warning('Invalid Amount', 'Please enter a valid amount to collect.'); return; }
    if (amountExceedsBalance)                      { toast.warning('Amount Too High', `Amount cannot exceed ${fmt(balanceDue)}.`); return; }
    if (discountExceedsAmount)                     { toast.warning('Discount Too High', 'Discount cannot exceed the amount being collected.'); return; }
    if (!selectedPeriodId)                         { toast.warning('No Period Selected', 'Please select a fee period.'); return; }
    if (!activeStudent.feeStructureId)             { toast.error('Fee Structure Missing', 'No fee structure found for this class and period.'); return; }
    try {
      setLoading(true);
      const res = await createFeeCollection({
        studentId: activeStudent.studentId, feeStructureId: activeStudent.feeStructureId,
        amountPaid: amountNum, discount: discountNum || 0, discountReason: form.discountReason || null,
        lateFine: lateFineNum || 0, paymentMode: form.paymentMode, paymentDate: form.paymentDate,
        referenceNo: form.referenceNo || null, remarks: form.remarks || null,
      });
      toast.success('Payment Recorded', `Receipt generated for ${activeStudent.studentName}.`);
      onSuccess(res, activeStudent);
    } catch (e) {
      toast.error('Payment Failed', e.message || 'Could not record the payment. Please try again.');
    } finally { setLoading(false); }
  };

  const submitDisabled = loading || !activeStudent || isFullyPaid || !form.amountPaid || amountNum <= 0 || amountExceedsBalance || discountExceedsAmount;

  return (
    <Modal open={open} onClose={onClose} title="Collect Fee Payment" subtitle="Record a student fee payment and generate receipt" wide
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
        {/* LEFT: Period → Class → Student */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Fee Period <span className="text-red-500">*</span></label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all bg-white">
              <option value="">-- Select fee period --</option>
              {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
            </select>
          </div>

          {selectedPeriodId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Class <span className="text-red-500">*</span>
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

          {selectedClassId && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Student <span className="text-red-500">*</span>
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
                        isSelected ? 'bg-blue-50 border-l-4 border-l-[#1E3A5F]' : isPaid ? 'bg-emerald-50/50 hover:bg-emerald-50' : 'hover:bg-gray-50'
                      }`}>
                      <Av name={fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{fullName}</div>
                        <div className="text-xs text-gray-500">{s.admissionNumber || s.studentCode || '—'}</div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {isPaid
                          ? <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">Paid</span>
                          : <span className="text-[10px] font-semibold text-red-600">{fmt(sBalance)}</span>
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

          {activeStudent && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Already Paid</div>
                <div className="text-lg font-extrabold text-emerald-600">{fmt(activeStudent.paidAmount || 0)}</div>
              </div>
              <div className={`border rounded-xl px-3 py-2 text-center ${isFullyPaid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                <div className={`text-[10px] font-bold uppercase ${isFullyPaid ? 'text-emerald-700' : 'text-red-700'}`}>Balance Due</div>
                <div className={`text-lg font-extrabold ${isFullyPaid ? 'text-emerald-600' : 'text-red-600'}`}>{fmt(balanceDue)}</div>
              </div>
            </div>
          )}

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

        {/* RIGHT: Payment form */}
        <div className={`space-y-4 ${isFullyPaid ? 'opacity-40 pointer-events-none select-none' : ''}`}>
          {activeStudent && !isFullyPaid && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
              <Info size={13} className="text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-[11px] text-blue-700">
                You can collect a <strong>partial amount</strong>. Enter any amount up to {fmt(balanceDue)}.
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Amount to Collect <span className="text-red-500">*</span></label>
            <div className="relative">
              <Inp type="number" value={form.amountPaid}
                className={`pr-28 ${amountExceedsBalance ? 'border-red-400 bg-red-50' : ''}`}
                onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))}
                max={balanceDue} min={1} placeholder={`Max ${fmt(balanceDue)}`} />
              {activeStudent && balanceDue > 0 && (
                <button type="button" onClick={() => setForm((p) => ({ ...p, amountPaid: String(balanceDue) }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1E3A5F] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2 py-1 rounded">
                  Full {fmt(balanceDue)}
                </button>
              )}
            </div>
            {amountExceedsBalance && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                <AlertCircle size={11} /> Amount exceeds balance due ({fmt(balanceDue)})
              </p>
            )}
            {activeStudent && !isFullyPaid && amountNum > 0 && amountNum < balanceDue && !amountExceedsBalance && (
              <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                <Info size={11} /> Partial — {fmt(balanceDue - amountNum)} will remain outstanding
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Mode <span className="text-red-500">*</span></label>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map(([mode, icon, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-xl border-2 transition-all ${
                    form.paymentMode === mode ? 'border-[#1E3A5F] bg-blue-50 text-[#1E3A5F]' : 'border-gray-200 bg-white text-gray-600 hover:border-[#1E3A5F]/40'
                  }`}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10.5px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Date <span className="text-red-500">*</span></label>
              <Inp type="date" value={form.paymentDate} onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">Reference No.</label>
              <Inp value={form.referenceNo} placeholder="TXN / Cheque no." onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Discount <span className="text-gray-400 font-normal">(optional)</span></label>
            <Inp type="number" value={form.discount} placeholder="Discount amount"
              className={discountExceedsAmount ? 'border-red-400 bg-red-50' : ''}
              onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
            {discountExceedsAmount && (
              <p className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1"><AlertCircle size={11} /> Discount cannot exceed collected amount</p>
            )}
            <textarea value={form.discountReason} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
              placeholder="Reason e.g. Sibling discount, scholarship…"
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 resize-none" />
          </div>

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
              <div className="text-[10px] text-white/50 uppercase tracking-wider">Net Total</div>
              <div className={`font-extrabold text-xl ${netTotal > 0 ? 'text-white' : 'text-white/30'}`}>
                {netTotal > 0 ? fmt(netTotal) : '—'}
              </div>
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
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && students.length > 0) {
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

  const update    = (id, field, val) => setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const applyAll  = () => setRows((p) => p.map((r) => ({ ...r, paymentMode: commonMode, paymentDate: commonDate })));
  const grandTotal= rows.reduce((s, r) => s + (parseFloat(r.collectAmount) || 0), 0);
  const MODES     = [{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'DD', label: 'DD' }];

  const handleSubmit = async () => {
    const bad = rows.find((r) => !r.collectAmount || parseFloat(r.collectAmount) <= 0);
    if (bad) { toast.warning('Missing Amount', `Please fill in collect amount for ${bad.studentName}.`); return; }
    const overAmount = rows.find((r) => parseFloat(r.collectAmount) > parseFloat(r.balanceDue));
    if (overAmount) { toast.warning('Amount Exceeds Balance', `${overAmount.studentName}: exceeds balance of ${fmt(overAmount.balanceDue)}.`); return; }
    try {
      setLoading(true);
      const res = await createBulkFeeCollection({ payments: rows.map((r) => ({ studentId: r.studentId, feeStructureId: r.feeStructureId, amountPaid: parseFloat(r.collectAmount), discount: parseFloat(r.discount) || 0, discountReason: null, lateFine: r.lateFine !== null && r.lateFine !== '' ? parseFloat(r.lateFine) : null, paymentMode: r.paymentMode, paymentDate: r.paymentDate, referenceNo: null, remarks: null })) });
      toast.success('Bulk Payment Processed', `${Array.isArray(res) ? res.length : rows.length} receipts generated.`);
      onSuccess(res);
    } catch (e) { toast.error('Bulk Payment Failed', e.message || 'Could not process bulk payments.');
    } finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Fee Collection`} subtitle={`${students.length} students selected`} wide
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
        <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Common Payment Mode</label><Sel value={commonMode} onChange={setCommonMode} options={MODES} className="w-32" /></div>
        <div><label className="block text-xs font-semibold text-gray-700 mb-1.5">Payment Date</label><Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-40" /></div>
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
              <tr key={row.id} className={row.daysLate > 0 ? 'bg-red-50/60' : ''}>
                <td className="px-3 py-2.5"><div className="font-semibold text-gray-900">{row.studentName}</div><div className="text-xs text-gray-400">{row.studentCode}</div></td>
                <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 text-xs font-semibold rounded-md">{row.class}</span></td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{row.period}</td>
                <td className="px-3 py-2.5">{row.daysLate > 0 ? <span className="text-red-700 text-xs font-bold">{fmt(row.balanceDue)} · {row.daysLate}d late</span> : <span className="font-semibold">{fmt(row.balanceDue)}</span>}</td>
                <td className="px-3 py-2.5"><input type="number" value={row.collectAmount} onChange={(e) => update(row.id, 'collectAmount', e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" /></td>
                <td className="px-3 py-2.5"><input type="number" value={row.discount} placeholder="0" onChange={(e) => update(row.id, 'discount', e.target.value)} className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400" /></td>
                <td className="px-3 py-2.5">{row.lateFine !== null ? <input type="number" value={row.lateFine} placeholder="Fine" onChange={(e) => update(row.id, 'lateFine', e.target.value)} className="w-20 px-2 py-1 text-sm border border-amber-200 rounded-lg bg-amber-50" /> : <span className="text-xs text-gray-300">N/A</span>}</td>
                <td className="px-3 py-2.5"><select value={row.paymentMode} onChange={(e) => update(row.id, 'paymentMode', e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded-lg">{MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, type, icon: Icon }) => {
  const config = {
    total:    { accent: 'from-[#1E3A5F] to-[#2563EB]', text: 'text-[#1E3A5F]', bg: 'bg-blue-50' },
    paid:     { accent: 'from-emerald-500 to-teal-500', text: 'text-emerald-700', bg: 'bg-emerald-50' },
    partial:  { accent: 'from-amber-400 to-orange-400', text: 'text-amber-700',   bg: 'bg-amber-50'   },
    overdue:  { accent: 'from-red-500 to-rose-500',     text: 'text-red-700',     bg: 'bg-red-50'     },
    discount: { accent: 'from-gray-400 to-slate-500',   text: 'text-gray-700',    bg: 'bg-gray-50'    },
  }[type] || { accent: 'from-gray-400 to-gray-500', text: 'text-gray-700', bg: 'bg-gray-50' };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className={`h-1 w-full bg-gradient-to-r ${config.accent}`} />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10.5px] font-bold tracking-wider uppercase text-gray-400">{title}</div>
          {Icon && (
            <div className={`w-7 h-7 rounded-lg ${config.bg} flex items-center justify-center`}>
              <Icon size={14} className={config.text} />
            </div>
          )}
        </div>
        <div className={`text-2xl font-extrabold leading-none mb-1.5 ${config.text}`}>{value}</div>
        <div className="text-[11px] text-gray-400">{subtitle}</div>
      </div>
    </div>
  );
};

// ─── Main Overview ────────────────────────────────────────────────────────────
const Overview = ({ onNavigate }) => {
  const navigate = useNavigate();
  const { currentAcademicYear } = useContext(UserContext);
  const academicYearId    = currentAcademicYear?.id;
  const academicYearLabel = currentAcademicYear?.label;

  const [dashboard,      setDashboard]      = useState(null);
  const [periods,        setPeriods]        = useState([]);
  const [periodOptions,  setPeriodOptions]  = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [periodFilter,   setPeriodFilter]   = useState('');
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [collectModal, setCollectModal] = useState({ open: false, student: null });
  const [bulkModal,    setBulkModal]    = useState({ open: false, students: [] });
  const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await getFeeCollectionHistory({ fromDate: ONE_MONTH_AGO, toDate: TODAY, page: 0, size: 10 });
      const records = res?.records || [];
      setHistory(records.map((item) => ({
        id: item.id, receiptNo: item.receiptNo, studentName: item.studentName,
        studentCode: item.admissionNumber || item.studentCode,
        class: item.className || item.class, section: item.sectionName || item.section,
        period: item.feePeriodName || item.period,
        amount: item.amountPaid || item.amount, discount: item.discount || 0,
        lateFine: item.lateFine || 0, balanceAfter: item.balanceAfter || 0,
        mode: item.paymentMode || item.mode, date: item.paymentDate || item.date,
        referenceNo: item.referenceNo, recordedBy: item.collectedBy || item.recordedBy,
      })));
    } catch (err) { console.error('History fetch error:', err); }
    finally { setHistoryLoading(false); }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const loadAll = useCallback(async () => {
    if (!academicYearId) return;
    setLoading(true);
    try {
      const [dash, perds] = await Promise.all([
        getFeeDashboard(academicYearId).catch(() => null),
        getFeePeriods(academicYearId).catch(() => []),
      ]);
      setDashboard(dash || {});
      const periodsArray = Array.isArray(perds) ? perds : [];
      setPeriods(periodsArray);
      setPeriodOptions(periodsArray.map((p) => ({ value: String(p.id), label: p.name || p.periodName || `Period ${p.id}` })));
    } catch (e) {
      toast.error('Load Failed', 'Could not fetch fee data. Please refresh.');
    } finally { setLoading(false); }
  }, [academicYearId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const stats = {
    totalBilled:      dashboard?.totalBilled           || dashboard?.totalFee        || 0,
    collected:        dashboard?.totalCollected        || dashboard?.collected       || 0,
    partial:          dashboard?.totalPartialOrPending || dashboard?.partialAmount   || 0,
    overdue:          dashboard?.totalOverdue          || dashboard?.overdueAmount   || 0,
    discounts:        dashboard?.totalDiscounts        || dashboard?.totalDiscount   || 0,
    collectedPct:     dashboard?.collectionRate        || dashboard?.collectionRatio || 0,
    partialStudents:  dashboard?.partialStudentCount   || dashboard?.partialStudents || 0,
    overdueStudents:  dashboard?.overdueStudentCount   || dashboard?.overdueStudents || 0,
    discountStudents: dashboard?.discountStudentCount  || dashboard?.discountStudents|| 0,
    totalStudents:    dashboard?.totalStudents         || 0,
    totalPeriods:     dashboard?.totalPeriods          || periods.length,
  };

  const classData = dashboard?.classRows || dashboard?.classWiseCollection || dashboard?.classCollection || dashboard?.classData || [];

  const getPeriodStatus = (p) => {
    if (p.collectedAmount >= p.totalAmount && p.totalAmount > 0) return { label: 'Closed',   key: 'CLOSED'   };
    if (new Date(p.dueDate) < new Date())                        return { label: 'Overdue',  key: 'OVERDUE'  };
    if (p.collectedAmount > 0)                                   return { label: 'Active',   key: 'ACTIVE'   };
    return                                                              { label: 'Upcoming', key: 'PENDING'  };
  };

  const openReceipt = (res, student) => {
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo: res.receiptNo || res.data?.receiptNo, date: res.paymentDate || res.data?.paymentDate,
        studentName: student.studentName, studentCode: student.studentCode, class: student.class, period: student.period,
        components: res.components || res.data?.components || [], amountPaid: res.amountPaid || res.data?.amountPaid,
        discount: res.discount || 0, lateFine: res.lateFine || 0, paymentMode: res.paymentMode || res.data?.paymentMode,
        referenceNo: res.referenceNo, balanceAfter: res.balanceAfter || 0, recordedBy: res.recordedBy || 'Admin',
      },
    });
  };

  const handleCollectSuccess = (res, student) => {
    setCollectModal({ open: false, student: null });
    openReceipt(res, student);
    loadAll(); fetchHistory();
  };

  const handleBulkSuccess = () => {
    setBulkModal({ open: false, students: [] });
    loadAll(); fetchHistory();
  };

  if (!academicYearId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400 text-sm">⏳ Waiting for academic year data…</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <ToastContainer />

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Fee Dashboard</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            Academic Year {academicYearLabel} · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <Download size={14} /> Export
          </button>
          <button onClick={() => setCollectModal({ open: true, student: null })}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
            <Plus size={15} /> Collect Fee
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          Loading data…
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Billed"      value={fmtCompact(stats.totalBilled)} subtitle={`${stats.totalStudents} students · ${stats.totalPeriods} periods`}                         type="total"    icon={IndianRupee} />
        <StatCard title="Collected"         value={fmtCompact(stats.collected)}   subtitle={`${stats.collectedPct ? Number(stats.collectedPct).toFixed(1) : '—'}% collection rate`}    type="paid"     icon={TrendingUp}  />
        <StatCard title="Partial / Pending" value={fmtCompact(stats.partial)}     subtitle={`${stats.partialStudents} students with balance`}                                           type="partial"  icon={Clock}       />
        <StatCard title="Overdue"           value={fmtCompact(stats.overdue)}     subtitle={`${stats.overdueStudents} students past due date`}                                          type="overdue"  icon={AlertCircle} />
        <StatCard title="Discounts Given"   value={fmtCompact(stats.discounts)}   subtitle={`${stats.discountStudents} students`}                                                       type="discount" icon={Users}       />
      </div>

      {/* ── 2-col body ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Collection by Class */}
        <div className="col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
              Collection by Class
            </h3>
            <select value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg bg-white text-gray-700 outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400">
              <option value="">All Periods</option>
              {periods.map((p) => <option key={p.id} value={p.name || p.periodName}>{p.name || p.periodName}</option>)}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-100">
                  {['Class', 'Students', 'Billed', 'Collected', 'Balance', 'Progress', 'Status'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-[10.5px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {classData.length > 0 ? classData.map((row) => {
                  const billed    = row.totalBilled    || row.billed    || 0;
                  const collected = row.totalCollected || row.collected || 0;
                  const pct       = row.progressPercent != null ? Math.round(row.progressPercent) : (billed > 0 ? Math.round((collected / billed) * 100) : 0);
                  const bal       = billed - collected;
                  return (
                    <tr key={row.className || row.classId} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-3 font-semibold text-sm text-gray-900">{row.className || row.class}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{row.studentCount || row.students || '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700">{fmtCompact(billed)}</td>
                      <td className="px-4 py-3 text-sm font-semibold text-emerald-600">{fmtCompact(collected)}</td>
                      <td className={`px-4 py-3 text-sm font-semibold ${bal > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{bal > 0 ? fmtCompact(bal) : '₹0'}</td>
                      <td className="px-4 py-3"><ProgressBar pct={pct} /></td>
                      <td className="px-4 py-3">
                        <StatusPill status={pct >= 100 ? 'PAID' : 'PARTIAL'} label={pct >= 100 ? 'Paid' : 'Partial'} />
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="text-center py-12 text-sm text-gray-400">No class data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Collections */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
              Recent Collections
            </h3>
            <button onClick={() => onNavigate && onNavigate('collections')}
              className="text-xs text-[#2563EB] font-semibold flex items-center gap-1 hover:underline">
              View all <ArrowRight size={11} />
            </button>
          </div>
          {historyLoading ? (
            <div className="flex items-center justify-center py-10 gap-2">
              <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-gray-400">Loading…</span>
            </div>
          ) : history.length > 0 ? history.slice(0, 6).map((item, i, arr) => (
            <div key={item.id || i} className={`flex items-center gap-3 px-4 py-3 ${i < arr.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50/60 transition-colors`}>
              <Av name={item.studentName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{item.studentName}</div>
                <div className="text-[11px] text-gray-400">{item.class} · {item.period}</div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold text-emerald-600">{fmtCompact(item.amount)}</div>
                <div className="text-[11px] text-gray-400">{item.mode}</div>
              </div>
            </div>
          )) : (
            <div className="text-center py-12 text-sm text-gray-400">No recent collections</div>
          )}
        </div>
      </div>

      {/* ── Active Fee Periods ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
            Active Fee Periods
            <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">{periods.length}</span>
          </h3>
          <button onClick={() => navigate('/feemanagement/config')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#1E3A5F] border border-blue-200 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors">
            Manage Periods <ArrowRight size={11} />
          </button>
        </div>
        <div className="p-5">
          {periods.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {periods.map((p) => {
                const st = getPeriodStatus(p);
                const grad = PERIOD_TYPE_GRADIENT[p.type] || 'from-gray-400 to-gray-500';
                return (
                  <div key={p.id}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer group"
                    onClick={() => onNavigate && onNavigate('periods')}>
                    <div className={`h-1 w-full bg-gradient-to-r ${grad}`} />
                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                            <Calendar size={12} className="text-[#1E3A5F]" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-[13px] font-bold text-gray-900 truncate">{p.name || p.periodName}</div>
                            <TypeBadge type={p.type} />
                          </div>
                        </div>
                        <StatusPill status={st.key} label={st.label} />
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <Clock size={10} className="text-gray-400" />
                        Due <strong className="text-gray-700">{fmtDate(p.dueDate)}</strong>
                      </div>
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Structures</div>
                          <div className="text-sm font-bold text-gray-800 mt-0.5">{p.structureCount || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">Students</div>
                          <div className="text-sm font-bold text-gray-800 mt-0.5">{p.studentCount || 0}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 text-sm text-gray-400">No fee periods found</div>
          )}
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
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
      <ReceiptModal
        open={receiptModal.open}
        onClose={() => setReceiptModal({ open: false, receipt: null })}
        receipt={receiptModal.receipt}
      />
    </div>
  );
};

export default Overview;