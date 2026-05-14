import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useContext
} from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Plus, X, Printer, FileText, ArrowRight, Search } from 'lucide-react';
import { getFeeDashboard } from '../../Api/FeeDashboard';
import { getFeePeriods } from '../../Api/FeePeriods';
import { getFeeStructures } from '../../Api/FeeStructures';
import { getStudentByClass } from '../../Api/StudentsApi';
import { getOutstandingFees, createFeeCollection, createBulkFeeCollection, getFeeCollectionHistory } from '../../Api/FeeCollection';
import { UserContext } from '../../ContextAPI/UserContext';

// ─── Constants ────────────────────────────────────────────────────────────────
const TODAY = new Date().toISOString().split('T')[0];
const ONE_MONTH_AGO = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d.toISOString().split('T')[0];
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

// ─── Token colours ────────────────────────────────────────────────────────────
const PERIOD_TYPE_COLOR = {
  QUARTERLY:   '#1A3A5C',
  MONTHLY:     '#0369A1',
  YEARLY:      '#0D7A55',
  HALF_YEARLY: '#7C3AED',
  CUSTOM:      '#92400E',
};
const PERIOD_TYPE_LABEL = {
  QUARTERLY: 'Quarterly', MONTHLY: 'Monthly', YEARLY: 'Yearly',
  HALF_YEARLY: 'Half-Yearly', CUSTOM: 'Custom',
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Av = ({ name, status, size = 'md' }) => {
  const sz = { sm: 'w-7 h-7 text-[10px]', md: 'w-9 h-9 text-xs', lg: 'w-12 h-12 text-base' }[size];
  const bg = status === 'OVERDUE' ? 'bg-red-700' : status === 'PARTIAL' ? 'bg-amber-700' : 'bg-[#1A3A5C]';
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
};

const Bdg = ({ status, children }) => {
  const map = {
    PAID:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL:     'bg-amber-50 text-amber-800 border-amber-200',
    OVERDUE:     'bg-red-50 text-red-700 border-red-200',
    PENDING:     'bg-gray-100 text-gray-600 border-gray-200',
    UNPAID:      'bg-gray-100 text-gray-600 border-gray-200',
    LOCKED:      'bg-gray-100 text-gray-600 border-gray-200',
    DRAFT:       'bg-amber-50 text-amber-800 border-amber-200',
    ACTIVE:      'bg-[#EEF4FF] text-[#1A3A5C] border-[#C7D7EE]',
    CLOSED:      'bg-gray-100 text-gray-600 border-gray-200',
    UPCOMING:    'bg-gray-100 text-gray-600 border-gray-200',
    QUARTERLY:   'bg-[#EEF4FF] text-[#1A3A5C] border-[#C7D7EE]',
    MONTHLY:     'bg-sky-50 text-sky-700 border-sky-200',
    YEARLY:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    HALF_YEARLY: 'bg-violet-50 text-violet-700 border-violet-200',
    CUSTOM:      'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 rounded border text-[10.5px] font-bold ${map[status] || map.PENDING}`}>
      {children}
    </span>
  );
};

const Btn = ({ children, variant = 'primary', size = 'md', onClick, disabled, className = '' }) => {
  const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-[12.5px]' }[size];
  const v = {
    primary:   'bg-[#1A3A5C] text-white hover:bg-[#0F2744]',
    success:   'bg-emerald-700 text-white hover:bg-emerald-800',
    danger:    'bg-red-700 text-white hover:bg-red-800',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost:     'bg-[#EEF4FF] text-[#1A3A5C] border border-[#C7D7EE] hover:bg-[#DDE8F5]',
  }[variant];
  return (
    <button onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
      {children}
    </button>
  );
};

const Inp = ({ className = '', ...props }) => (
  <input className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white ${className}`} {...props} />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '', disabled }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)} disabled={disabled}
    className={`px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white disabled:bg-gray-50 disabled:text-gray-400 ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Progress bar ─────────────────────────────────────────────────────────────
const ProgressBar = ({ pct }) => {
  const color = pct >= 100 ? '#0D7A55' : pct >= 85 ? '#0D7A55' : pct >= 70 ? '#B45309' : '#B91C1C';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-gray-200 rounded-full overflow-hidden">
        <div style={{ width: `${Math.min(pct, 100)}%`, background: color }} className="h-full rounded-full transition-all duration-500" />
      </div>
      <span className="text-[11px] text-gray-500">{pct}%</span>
    </div>
  );
};

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, wide, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center p-10 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-5xl' : 'max-w-lg'} my-4`} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-extrabold tracking-tight text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500">
            <X size={15} />
          </button>
        </div>
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

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
      footer={<><Btn variant="secondary" onClick={onClose}>Close</Btn><Btn variant="primary" onClick={handlePrint}><Printer size={13} /> Print</Btn></>}>
      <div ref={printRef} className="border-2 border-gray-300 rounded-xl p-6 font-mono text-xs max-w-sm mx-auto bg-gray-50">
        <div className="text-center mb-3 font-sans"><div className="text-[13.5px] font-extrabold">FEE RECEIPT</div></div>
        <hr className="border-dashed border-gray-300" />
        <div className="flex justify-between font-bold my-2"><span>RECEIPT</span><span>{receipt.receiptNo}</span></div>
        <hr className="border-dashed border-gray-300" />
        <div className="space-y-1 my-2">
          {[['Date', fmtDate(receipt.date)], ['Student', receipt.studentName], ['Class', receipt.class || receipt.className], ['Adm. No.', receipt.studentCode], ['Period', receipt.period || receipt.periodName]].map(([k, v]) => (
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
// Step 1: Select Period → Step 2: Pick Class (from structures) → Step 3: Pick Student → Step 4: Payment
const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess }) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY,
    referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
  });
  const [loading, setLoading] = useState(false);

  // ── Class / student picker ────────────────────────────────────────────────
  const [periodClasses,   setPeriodClasses]   = useState([]);
  const [classesLoading,  setClassesLoading]  = useState(false);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch,   setStudentSearch]   = useState('');
  const [activeStudent,   setActiveStudent]   = useState(null);

  // ── Reset on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setPeriodClasses([]);
    setSelectedClassId('');
    setStudents([]);
    setStudentSearch('');

    if (initialStudent) {
      // Came from "Collect" button on a table row — pre-fill everything
      setActiveStudent(initialStudent);
      const matched =
        periodOptions.find((p) => String(p.value) === String(initialStudent.feePeriodId)) ||
        periodOptions.find((p) => p.label?.trim().toLowerCase() === initialStudent.period?.trim().toLowerCase()) ||
        periodOptions[0];
      setSelectedPeriodId(matched ? String(matched.value) : '');
      setForm({
        amountPaid: initialStudent.balance?.toString() || '',
        paymentMode: 'CASH', paymentDate: TODAY,
        referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
      });
    } else {
      // Fresh modal — user must pick period → class → student
      setActiveStudent(null);
      setSelectedPeriodId('');
      setForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  // ── Load classes for selected period (via fee structures) ─────────────────
  useEffect(() => {
    if (!selectedPeriodId) { setPeriodClasses([]); setSelectedClassId(''); setStudents([]); setActiveStudent(null); return; }
    const load = async () => {
      setClassesLoading(true);
      setPeriodClasses([]);
      setSelectedClassId('');
      setStudents([]);
      if (!initialStudent) setActiveStudent(null);
      try {
        const structures = await getFeeStructures(parseInt(selectedPeriodId));
        const seen = new Set();
        const classes = [];
        (Array.isArray(structures) ? structures : []).forEach((s) => {
          (s.classes || []).forEach((c) => {
            if (!seen.has(c.id)) {
              seen.add(c.id);
              classes.push({ id: c.id, name: c.name || c.className });
            }
          });
        });
        setPeriodClasses(classes);
      } catch (e) {
        console.error('Failed to load period classes:', e);
      } finally {
        setClassesLoading(false);
      }
    };
    load();
  }, [selectedPeriodId]);

  // ── Load students for selected class using getStudentByClass ──────────────
  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    const load = async () => {
      setStudentsLoading(true);
      try {
        // getStudentByClass from StudentApi — uses VITE_API_BASE_DOUBLE_V1
        const list = await getStudentByClass(selectedClassId);
        setStudents(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error('Failed to load students:', e);
        setStudents([]);
      } finally {
        setStudentsLoading(false);
      }
    };
    load();
  }, [selectedClassId]);

  if (!open) return null;

  const isOverdue = activeStudent?.status === 'OVERDUE';
  const netTotal  = (parseFloat(form.amountPaid) || 0) + (parseFloat(form.lateFine) || 0) - (parseFloat(form.discount) || 0);
  const MODES     = [['CASH', '💵', 'Cash'], ['ONLINE', '🌐', 'Online'], ['CHEQUE', '📝', 'Cheque'], ['DD', '🏦', 'DD']];

  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    const name = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
    return !q || name.includes(q) || (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    const classObj = periodClasses.find((c) => String(c.id) === selectedClassId);
    setActiveStudent({
      studentId:      s.id || s.studentId,
      studentName:    fullName,
      studentCode:    s.admissionNumber || s.studentCode,
      class:          s.className || s.class || classObj?.name || '',
      feeStructureId: s.feeStructureId,
      feePeriodId:    selectedPeriodId,
      balance:        s.balanceDue ?? s.balance ?? 0,
      paidAmount:     s.paidAmount || 0,
      totalFee:       s.totalFee   || 0,
      dueDate:        s.dueDate,
      daysLate:       s.overdueDays || 0,
      status:         (s.overdueDays > 0 && (s.balanceDue ?? 0) > 0) ? 'OVERDUE'
                    : (s.paidAmount > 0 && (s.balanceDue ?? 0) > 0) ? 'PARTIAL'
                    : 'PENDING',
      parentName:     s.parentName,
      parentPhone:    s.parentPhone,
    });
    setForm((p) => ({ ...p, amountPaid: String(s.balanceDue ?? s.balance ?? '') }));
  };

  const handleSubmit = async () => {
    if (!activeStudent)                                              { alert('Please select a student');       return; }
    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0)       { alert('Please enter a valid amount');   return; }
    if (!selectedPeriodId)                                           { alert('Please select a fee period');    return; }
    try {
      setLoading(true);
      const res = await createFeeCollection({
        studentId:      activeStudent.studentId,
        feeStructureId: activeStudent.feeStructureId,
        amountPaid:     parseFloat(form.amountPaid),
        discount:       parseFloat(form.discount)   || 0,
        discountReason: form.discountReason         || null,
        lateFine:       parseFloat(form.lateFine)   || 0,
        paymentMode:    form.paymentMode,
        paymentDate:    form.paymentDate,
        referenceNo:    form.referenceNo            || null,
        remarks:        form.remarks                || null,
      });
      onSuccess(res, activeStudent);
    } catch (e) { alert(e.message || 'Failed to record payment'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Collect Fee Payment" wide
      footer={
        <>
          <Btn variant="secondary" onClick={onClose}>Cancel</Btn>
          <Btn variant="success" onClick={handleSubmit} disabled={loading || !activeStudent}>
            {loading ? 'Recording…' : '✓ Record & Generate Receipt'}
          </Btn>
        </>
      }>
      <div className="grid grid-cols-2 gap-6">

        {/* ── LEFT: Period → Class → Student picker ── */}
        <div className="space-y-4">

          {/* 1. Period */}
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Fee Period *</label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white">
              <option value="">-- Select fee period --</option>
              {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
            </select>
          </div>

          {/* 2. Classes linked to selected period */}
          {selectedPeriodId && (
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">
                Class *{classesLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              {!classesLoading && periodClasses.length === 0 ? (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-2 rounded-lg">
                  No classes linked to this period. Add a fee structure first.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                  {classesLoading
                    ? <div className="text-xs text-gray-400">Loading classes…</div>
                    : periodClasses.map((c) => (
                      <button key={c.id} type="button"
                        onClick={() => { setSelectedClassId(String(c.id)); setStudentSearch(''); setActiveStudent(null); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                          selectedClassId === String(c.id)
                            ? 'bg-[#1A3A5C] text-white border-[#1A3A5C]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#1A3A5C]/50'
                        }`}>
                        {c.name}
                      </button>
                    ))
                  }
                </div>
              )}
            </div>
          )}

          {/* 3. Students in selected class */}
          {selectedClassId && (
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">
                Student *{studentsLoading && <span className="text-gray-400 font-normal ml-1">(loading…)</span>}
              </label>
              {/* Search bar */}
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or admission no…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white"
                />
              </div>
              {/* Student list */}
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 overflow-y-auto">
                {studentsLoading ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <div className="animate-spin w-4 h-4 border-2 border-[#1A3A5C] border-t-transparent rounded-full" />
                    <span className="text-xs text-gray-400">Loading students…</span>
                  </div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-400">
                    {studentSearch ? 'No students match your search' : 'No students found in this class'}
                  </div>
                ) : filteredStudents.map((s) => {
                  const fullName   = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                  const isSelected = activeStudent?.studentId === (s.id || s.studentId);
                  return (
                    <div key={s.id || s.studentId}
                      onClick={() => selectStudent(s)}
                      className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors border-b border-gray-100 last:border-0 ${
                        isSelected ? 'bg-[#EEF4FF] border-l-4 border-l-[#1A3A5C]' : 'hover:bg-gray-50'
                      }`}>
                      <Av name={fullName} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-gray-900 truncate">{fullName}</div>
                        <div className="text-xs text-gray-500">{s.admissionNumber || s.studentCode || '—'}</div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-[#1A3A5C] bg-[#DDE8F5] px-2 py-0.5 rounded flex-shrink-0">
                          Selected
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Selected student card */}
          {activeStudent && (
            <div className="bg-[#EEF4FF] border border-[#C7D7EE] rounded-xl p-3 flex items-center gap-3">
              <Av name={activeStudent.studentName} status={activeStudent.status} size="lg" />
              <div>
                <div className="font-extrabold text-gray-900">{activeStudent.studentName}</div>
                <div className="text-xs text-gray-600">{activeStudent.studentCode} · Class {activeStudent.class}</div>
                {activeStudent.parentName && (
                  <div className="text-[11px] text-gray-500 mt-0.5">Parent: {activeStudent.parentName}</div>
                )}
              </div>
            </div>
          )}

          {/* Paid / Balance */}
          {activeStudent && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Already Paid</div>
                <div className="text-lg font-extrabold text-emerald-600">{fmt(activeStudent.paidAmount || 0)}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-red-700 uppercase">Balance Due</div>
                <div className="text-lg font-extrabold text-red-600">{fmt(activeStudent.balance)}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Payment form ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Amount to Collect *</label>
            <div className="relative">
              <Inp type="number" value={form.amountPaid} className="pr-28"
                onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))} />
              {activeStudent && (
                <button type="button"
                  onClick={() => setForm((p) => ({ ...p, amountPaid: String(activeStudent.balance || '') }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1A3A5C] bg-[#EEF4FF] hover:bg-[#DDE8F5] border border-[#C7D7EE] px-2 py-1 rounded">
                  Full {fmt(activeStudent.balance)}
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Mode *</label>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map(([mode, icon, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border-2 transition-all ${
                    form.paymentMode === mode ? 'border-[#1A3A5C] bg-[#EEF4FF] text-[#1A3A5C]' : 'border-gray-200 bg-white text-gray-600'
                  }`}>
                  <span className="text-xl">{icon}</span>
                  <span className="text-[10.5px] font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Date *</label>
              <Inp type="date" value={form.paymentDate} onChange={(e) => setForm((p) => ({ ...p, paymentDate: e.target.value }))} />
            </div>
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Reference No.</label>
              <Inp value={form.referenceNo} placeholder="TXN / Cheque no." onChange={(e) => setForm((p) => ({ ...p, referenceNo: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Discount (optional)</label>
            <Inp type="number" value={form.discount} placeholder="Discount amount"
              onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
            <textarea value={form.discountReason} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
              placeholder="Reason e.g. Sibling discount, scholarship..."
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] resize-none" />
          </div>

          {isOverdue && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <span>⚠️</span>
                <div>
                  <div className="text-sm font-bold text-amber-800">Past Due — Add Late Fine?</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">
                    Due: {fmtDate(activeStudent?.dueDate)} · {activeStudent?.daysLate} day{activeStudent?.daysLate !== 1 ? 's' : ''} overdue
                  </div>
                </div>
              </div>
              <Inp type="number" value={form.lateFine} placeholder="Fine amount (₹)"
                onChange={(e) => setForm((p) => ({ ...p, lateFine: e.target.value }))}
                className="border-amber-300 focus:border-amber-500" />
            </div>
          )}

          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Remarks</label>
            <textarea value={form.remarks} rows={2}
              onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="Optional note..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] resize-none" />
          </div>

          <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Receipt No.</div>
              <div className="text-white font-bold text-sm mt-0.5">Auto-generated</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Net Total</div>
              <div className="text-white font-extrabold text-xl">{fmt(netTotal)}</div>
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
    if (bad) { alert('Please fill in all collect amounts'); return; }
    try {
      setLoading(true);
      const res = await createBulkFeeCollection({
        payments: rows.map((r) => ({
          studentId: r.studentId, feeStructureId: r.feeStructureId,
          amountPaid: parseFloat(r.collectAmount), discount: parseFloat(r.discount) || 0,
          discountReason: null,
          lateFine: r.lateFine !== null && r.lateFine !== '' ? parseFloat(r.lateFine) : null,
          paymentMode: r.paymentMode, paymentDate: r.paymentDate, referenceNo: null, remarks: null,
        })),
      });
      onSuccess(res);
    } catch (e) { alert(e.message || 'Failed to process bulk payments'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Fee Collection — ${students.length} Students`} wide
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="success" onClick={handleSubmit} disabled={loading}>{loading ? 'Processing…' : `Process ${rows.length} Payments`}</Btn></>}>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-emerald-800">
        Payments will be recorded for all {students.length} selected students.
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 flex items-end gap-4">
        <div><label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Common Payment Mode</label><Sel value={commonMode} onChange={setCommonMode} options={MODES} className="w-32" /></div>
        <div><label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Date</label><Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-40" /></div>
        <Btn variant="ghost" size="sm" onClick={applyAll}>Apply to All Rows</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">{['Student','Class','Period','Balance Due','Collect Amount','Discount','Late Fine','Mode'].map((h)=><th key={h} className="px-3 py-2 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b border-gray-100 ${row.daysLate > 0 ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2.5"><div className="font-semibold text-gray-900">{row.studentName}</div><div className="text-xs text-gray-500">{row.studentCode}</div></td>
                <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{row.class}</span></td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{row.period}</td>
                <td className="px-3 py-2.5">{row.daysLate > 0 ? <span className="text-red-700 text-xs font-bold">● {fmt(row.balanceDue)} · {row.daysLate}d late</span> : <span className="font-semibold">{fmt(row.balanceDue)}</span>}</td>
                <td className="px-3 py-2.5"><input type="number" value={row.collectAmount} onChange={(e)=>update(row.id,'collectAmount',e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]"/></td>
                <td className="px-3 py-2.5"><input type="number" value={row.discount} placeholder="0" onChange={(e)=>update(row.id,'discount',e.target.value)} className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]"/></td>
                <td className="px-3 py-2.5">{row.lateFine!==null?<input type="number" value={row.lateFine} placeholder="Fine" onChange={(e)=>update(row.id,'lateFine',e.target.value)} className="w-20 px-2 py-1 text-sm border border-amber-300 rounded bg-amber-50"/>:<span className="text-xs text-gray-400">N/A</span>}</td>
                <td className="px-3 py-2.5"><select value={row.paymentMode} onChange={(e)=>update(row.id,'paymentMode',e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded">{MODES.map((o)=><option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900 rounded-lg px-4 py-3 mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">{rows.length} receipts will be generated</div>
        <div className="text-white font-extrabold text-base">Grand Total: {fmt(grandTotal)}</div>
      </div>
    </Modal>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, type }) => {
  const styles = {
    total:    { border: '#1A3A5C', color: '#1A3A5C' },
    paid:     { border: '#0D7A55', color: '#0D7A55' },
    partial:  { border: '#B45309', color: '#B45309' },
    overdue:  { border: '#B91C1C', color: '#B91C1C' },
    discount: { border: '#64748B', color: '#334155' },
  }[type] || { border: '#94A3B8', color: '#334155' };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow" style={{ borderLeft: `3px solid ${styles.border}` }}>
      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5">{title}</div>
      <div className="text-2xl font-extrabold leading-none mb-1" style={{ color: styles.color }}>{value}</div>
      <div className="text-[11px] text-gray-500">{subtitle}</div>
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
  const [outstanding,    setOutstanding]    = useState([]);
  const [loading,        setLoading]        = useState(false);
  const [periodFilter,   setPeriodFilter]   = useState('');
  const [history,        setHistory]        = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [collectModal, setCollectModal] = useState({ open: false, student: null });
  const [bulkModal,    setBulkModal]    = useState({ open: false, students: [] });
  const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });
  const [selected,     setSelected]     = useState([]);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res     = await getFeeCollectionHistory({ fromDate: ONE_MONTH_AGO, toDate: TODAY, page: 0, size: 10 });
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
    } catch (e) { console.error('loadAll error:', e); }
    finally { setLoading(false); }
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
    if (p.collectedAmount >= p.totalAmount && p.totalAmount > 0) return { label: 'Closed',   status: 'CLOSED'  };
    if (new Date(p.dueDate) < new Date())                        return { label: 'Overdue',  status: 'OVERDUE' };
    if (p.collectedAmount > 0)                                   return { label: 'Active',   status: 'PARTIAL' };
    return { label: 'Upcoming', status: 'PENDING' };
  };

  const openReceipt = (res, student) => {
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo:   res.receiptNo   || res.data?.receiptNo,
        date:        res.paymentDate || res.data?.paymentDate,
        studentName: student.studentName, studentCode: student.studentCode,
        class: student.class, period: student.period,
        components:  res.components  || res.data?.components || [],
        amountPaid:  res.amountPaid  || res.data?.amountPaid,
        discount:    res.discount    || 0, lateFine: res.lateFine || 0,
        paymentMode: res.paymentMode || res.data?.paymentMode,
        referenceNo: res.referenceNo, balanceAfter: res.balanceAfter || 0,
        recordedBy:  res.recordedBy  || 'Admin',
      },
    });
  };

  const handleCollectSuccess = (res, student) => {
    setCollectModal({ open: false, student: null });
    openReceipt(res, student);
    loadAll(); fetchHistory(); setSelected([]);
  };

  const handleBulkSuccess = (responses) => {
    setBulkModal({ open: false, students: [] });
    alert(`✅ Successfully processed ${Array.isArray(responses) ? responses.length : '?'} payments!`);
    loadAll(); fetchHistory(); setSelected([]);
  };

  if (!academicYearId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 text-sm">⏳ Waiting for academic year data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Fee Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">
            Academic Year {academicYearLabel} · All Classes · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm"><Download size={13} /> Export Report</Btn>
          <Btn variant="primary" size="sm" onClick={() => setCollectModal({ open: true, student: null })}>
            <Plus size={13} /> Collect Fee
          </Btn>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <div className="animate-spin w-4 h-4 border-2 border-[#1A3A5C] border-t-transparent rounded-full" />
          Loading data…
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Billed"      value={fmtCompact(stats.totalBilled)}  subtitle={`${stats.totalStudents} students · ${stats.totalPeriods} periods`}                    type="total"    />
        <StatCard title="Collected"         value={fmtCompact(stats.collected)}    subtitle={`${stats.collectedPct ? Number(stats.collectedPct).toFixed(1) : '—'}% collection rate`} type="paid"     />
        <StatCard title="Partial / Pending" value={fmtCompact(stats.partial)}      subtitle={`${stats.partialStudents} students with balance`}                                        type="partial"  />
        <StatCard title="Overdue"           value={fmtCompact(stats.overdue)}      subtitle={`${stats.overdueStudents} students past due date`}                                       type="overdue"  />
        <StatCard title="Discounts Given"   value={fmtCompact(stats.discounts)}    subtitle={`${stats.discountStudents} students`}                                                    type="discount" />
      </div>

      {/* 2-col */}
      <div className="grid grid-cols-3 gap-4">

        {/* Collection by Class */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Collection by Class</h3>
            <Sel value={periodFilter} onChange={setPeriodFilter} className="!w-auto !py-1 !px-2 text-xs"
              options={periods.map((p) => ({ value: p.name || p.periodName, label: p.name || p.periodName }))}
              placeholder="All Periods" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {['Class', 'Students', 'Billed', 'Collected', 'Balance', 'Progress', 'Status'].map((h) => (
                    <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classData.length > 0 ? classData.map((row) => {
                  const billed    = row.totalBilled    || row.billed    || 0;
                  const collected = row.totalCollected || row.collected || 0;
                  const pct       = row.progressPercent != null ? Math.round(row.progressPercent) : (billed > 0 ? Math.round((collected / billed) * 100) : 0);
                  const bal       = billed - collected;
                  const status    = pct >= 100 ? 'PAID' : bal > 0 ? 'PARTIAL' : 'PAID';
                  return (
                    <tr key={row.className || row.class || row.classId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-sm">{row.className || row.class}</td>
                      <td className="px-3 py-2.5 text-sm">{row.studentCount || row.students || '—'}</td>
                      <td className="px-3 py-2.5 text-sm">{fmtCompact(billed)}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-emerald-600">{fmtCompact(collected)}</td>
                      <td className={`px-3 py-2.5 text-sm font-semibold ${bal > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{bal > 0 ? fmtCompact(bal) : '₹0'}</td>
                      <td className="px-3 py-2.5"><ProgressBar pct={pct} /></td>
                      <td className="px-3 py-2.5"><Bdg status={status}>{status === 'PAID' ? 'Paid' : 'Partial'}</Bdg></td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="text-center py-8 text-sm text-gray-400">No class data available</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Collections */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Recent Collections</h3>
              <button onClick={() => onNavigate && onNavigate('collections')}
                className="text-xs text-[#1A3A5C] font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowRight size={11} />
              </button>
            </div>
            {historyLoading ? (
              <div className="flex items-center justify-center py-8 gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-[#1A3A5C] border-t-transparent rounded-full" />
                <span className="text-xs text-gray-400">Loading…</span>
              </div>
            ) : history.length > 0 ? history.slice(0, 4).map((item, i, arr) => (
              <div key={item.id || i} className={`flex items-center gap-3 px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <Av name={item.studentName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{item.studentName}</div>
                  <div className="text-[11px] text-gray-500">{item.class} · {item.period}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-emerald-600">{fmtCompact(item.amount)}</div>
                  <div className="text-[11px] text-gray-500">{item.mode}</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-6 text-sm text-gray-400">No recent collections</div>
            )}
          </div>
        </div>
      </div>

      {/* Active Fee Periods */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Active Fee Periods — {academicYearLabel}</h3>
          <Btn variant="ghost" size="sm" onClick={() => navigate('/feemanagement/config')}>
            Manage Periods <ArrowRight size={12} />
          </Btn>
        </div>
        <div className="p-4 grid grid-cols-4 gap-4">
          {periods.length > 0 ? periods.map((p) => {
            const st     = getPeriodStatus(p);
            const accent = PERIOD_TYPE_COLOR[p.type] || PERIOD_TYPE_COLOR.QUARTERLY;
            return (
              <div key={p.id} className="rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${accent}` }}
                onClick={() => onNavigate && onNavigate('periods')}>
                <div className="flex items-center justify-between mb-2">
                  <Bdg status={p.type}>{PERIOD_TYPE_LABEL[p.type] || p.type}</Bdg>
                  <Bdg status={st.status}>{st.label}</Bdg>
                </div>
                <div className="text-sm font-bold text-gray-800">{p.name || p.periodName}</div>
                <div className="text-[11px] text-gray-500 mt-1">Due: {fmtDate(p.dueDate)}</div>
                <div className="text-xs font-bold mt-2" style={{ color: accent }}>
                  {p.studentCount > 0 ? `${p.studentCount} students` : 'Not started'}
                </div>
              </div>
            );
          }) : (
            <div className="col-span-4 text-center py-6 text-sm text-gray-400">No fee periods found</div>
          )}
        </div>
      </div>

      {/* Modals */}
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