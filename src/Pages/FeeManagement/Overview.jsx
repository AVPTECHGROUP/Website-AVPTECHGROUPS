import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, TrendingUp, AlertCircle, Receipt, Percent, ArrowRight, Download, Plus, X, Printer, FileText } from 'lucide-react';
import { getFeeDashboard } from '../../Api/FeeDashboard';
import { getFeePeriods, getAcademicYears } from '../../Api/FeePeriods';
import { getOutstandingFees, createFeeCollection, createBulkFeeCollection, getFeeReceiptById } from '../../Api/FeeCollection';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_ACADEMIC_YEAR_ID = 3;
const TODAY = new Date().toISOString().split('T')[0];

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
  QUARTERLY:  '#1A3A5C',
  MONTHLY:    '#0369A1',
  YEARLY:     '#0D7A55',
  HALF_YEARLY:'#7C3AED',
  CUSTOM:     '#92400E',
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
    PAID:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    PARTIAL:   'bg-amber-50 text-amber-800 border-amber-200',
    OVERDUE:   'bg-red-50 text-red-700 border-red-200',
    PENDING:   'bg-gray-100 text-gray-600 border-gray-200',
    UNPAID:    'bg-gray-100 text-gray-600 border-gray-200',
    LOCKED:    'bg-gray-100 text-gray-600 border-gray-200',
    DRAFT:     'bg-amber-50 text-amber-800 border-amber-200',
    ACTIVE:    'bg-[#EEF4FF] text-[#1A3A5C] border-[#C7D7EE]',
    CLOSED:    'bg-gray-100 text-gray-600 border-gray-200',
    UPCOMING:  'bg-gray-100 text-gray-600 border-gray-200',
    QUARTERLY: 'bg-[#EEF4FF] text-[#1A3A5C] border-[#C7D7EE]',
    MONTHLY:   'bg-sky-50 text-sky-700 border-sky-200',
    YEARLY:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    HALF_YEARLY:'bg-violet-50 text-violet-700 border-violet-200',
    CUSTOM:    'bg-orange-50 text-orange-700 border-orange-200',
    CASH:      'bg-gray-100 text-gray-600 border-gray-200',
    ONLINE:    'bg-blue-50 text-blue-700 border-blue-200',
    CHEQUE:    'bg-gray-100 text-gray-600 border-gray-200',
    DD:        'bg-gray-100 text-gray-600 border-gray-200',
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
        <div className="px-6 py-5 max-h-[74vh] overflow-y-auto">{children}</div>
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
      <style>body{font-family:monospace;font-size:12px;padding:20px}.row{display:flex;justify-content:space-between;margin:3px 0}hr{border:none;border-top:1px dashed #999;margin:8px 0}.paid{color:#0D7A55;border:2px solid #0D7A55;display:inline-block;padding:3px 18px;font-size:16px;font-weight:900;letter-spacing:.15em;transform:rotate(-6deg);margin-top:14px;font-family:sans-serif}.center{text-align:center}</style>
      </head><body>${printRef.current?.innerHTML || ''}</body></html>`);
    w.document.close(); w.print();
  };
  return (
    <Modal open={open} onClose={onClose} title="Payment Receipt"
      footer={<><Btn variant="secondary" onClick={onClose}>Close</Btn><Btn variant="primary" onClick={handlePrint}><Printer size={13} /> Print</Btn><Btn variant="ghost"><FileText size={13} /> PDF</Btn></>}>
      <div ref={printRef} className="border-2 border-gray-300 rounded-xl p-6 font-mono text-xs max-w-sm mx-auto bg-gray-50">
        <div className="text-center mb-3 font-sans">
          <div className="text-[13.5px] font-extrabold">SPRINGDALE PUBLIC SCHOOL</div>
          <div className="text-[11px] text-gray-500 mt-1">123 Education Lane, New Delhi · 011-4567-8900</div>
        </div>
        <hr className="border-dashed border-gray-300" />
        <div className="flex justify-between font-bold my-2"><span>FEE RECEIPT</span><span>{receipt.receiptNo}</span></div>
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
const CollectFeeModal = ({ open, onClose, student, onSuccess }) => {
  const [form, setForm] = useState({ amountPaid: '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (open && student) {
      setForm({ amountPaid: student.balance?.toString() || '', paymentMode: 'CASH', paymentDate: TODAY, referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, student]);

  if (!open || !student) return null;
  const isOverdue = student.status === 'OVERDUE';
  const netTotal = (parseFloat(form.amountPaid) || 0) + (parseFloat(form.lateFine) || 0) - (parseFloat(form.discount) || 0);
  const MODES = [['CASH','💵','Cash'],['ONLINE','🌐','Online'],['CHEQUE','📝','Cheque'],['DD','🏦','DD']];

  const feeBreakdown = student.totalFee > 0 ? [
    { name: 'Tuition Fee',   amount: Math.floor(student.totalFee * 0.67) },
    { name: 'Transport Fee', amount: Math.floor(student.totalFee * 0.20) },
    { name: 'Lab Fee',       amount: Math.floor(student.totalFee * 0.10) },
    { name: 'Misc',          amount: student.totalFee - Math.floor(student.totalFee * 0.97) },
  ] : [];

  const handleSubmit = async () => {
    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0) { alert('Please enter a valid amount'); return; }
    try {
      setLoading(true);
      const res = await createFeeCollection({
        studentId: student.studentId,
        feeStructureId: student.feeStructureId,
        amountPaid: parseFloat(form.amountPaid),
        discount: parseFloat(form.discount) || 0,
        discountReason: form.discountReason || null,
        lateFine: parseFloat(form.lateFine) || 0,
        paymentMode: form.paymentMode,
        paymentDate: form.paymentDate,
        referenceNo: form.referenceNo || null,
        remarks: form.remarks || null,
      });
      onSuccess(res, student);
    } catch (e) { alert(e.message || 'Failed to record payment'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Collect Fee Payment" wide
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="success" onClick={handleSubmit} disabled={loading}>{loading ? 'Recording…' : '✓ Record & Generate Receipt'}</Btn></>}>
      <div className="grid grid-cols-2 gap-6">
        {/* Left col */}
        <div className="space-y-4">
          <div className="bg-[#EEF4FF] border border-[#C7D7EE] rounded-xl p-3 flex items-center gap-3">
            <Av name={student.studentName} status={student.status} size="lg" />
            <div>
              <div className="font-extrabold text-gray-900">{student.studentName}</div>
              <div className="text-xs text-gray-600">{student.studentCode} · Class {student.class}</div>
              <div className="text-[11px] text-gray-500 mt-0.5">Parent: {student.parentName || 'N/A'} · {student.parentPhone || '—'}</div>
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <div className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider mb-2">Fee Breakdown — {student.period}</div>
            {feeBreakdown.map((item) => (
              <div key={item.name} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                <span className="text-gray-700">{item.name}</span>
                <span className="font-semibold">{fmt(item.amount)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold pt-2 mt-1 border-t border-gray-300">
              <span>Total Due</span>
              <span className="text-[#1A3A5C] text-base">{fmt(student.balance)}</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-emerald-700 uppercase">Already Paid</div>
              <div className="text-lg font-extrabold text-emerald-600">{fmt(student.paidAmount || 0)}</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
              <div className="text-[10px] font-bold text-red-700 uppercase">Balance</div>
              <div className="text-lg font-extrabold text-red-600">{fmt(student.balance)}</div>
            </div>
          </div>
        </div>
        {/* Right col */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Amount to Collect *</label>
            <div className="relative">
              <Inp type="number" value={form.amountPaid} className="pr-28" onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))} />
              <button type="button" onClick={() => setForm((p) => ({ ...p, amountPaid: student.balance?.toString() }))}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1A3A5C] bg-[#EEF4FF] hover:bg-[#DDE8F5] border border-[#C7D7EE] px-2 py-1 rounded transition-colors">
                Full {fmt(student.balance)}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Mode *</label>
            <div className="grid grid-cols-4 gap-2">
              {MODES.map(([mode, icon, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border-2 transition-all ${form.paymentMode === mode ? 'border-[#1A3A5C] bg-[#EEF4FF] text-[#1A3A5C]' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}>
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
            <Inp type="number" value={form.discount} placeholder="Discount amount" onChange={(e) => setForm((p) => ({ ...p, discount: e.target.value }))} />
            <textarea value={form.discountReason} rows={2} onChange={(e) => setForm((p) => ({ ...p, discountReason: e.target.value }))}
              placeholder="Reason e.g. Sibling discount, scholarship..."
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] resize-none" />
          </div>
          {isOverdue && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <span>⚠️</span>
                <div>
                  <div className="text-sm font-bold text-amber-800">Past Due Date — Add Late Fine?</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">{student.daysLate || 0} day{student.daysLate !== 1 ? 's' : ''} overdue</div>
                </div>
              </div>
              <Inp type="number" value={form.lateFine} placeholder="Enter fine amount (₹)" onChange={(e) => setForm((p) => ({ ...p, lateFine: e.target.value }))} className="border-amber-300 focus:border-amber-500" />
            </div>
          )}
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Remarks</label>
            <textarea value={form.remarks} rows={2} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="Optional note..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] resize-none" />
          </div>
          <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Receipt No.</div>
              <div className="text-white font-bold text-sm mt-0.5">RC-{new Date().getFullYear()}-XXXXX</div>
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

  const update = (id, field, val) => setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: val } : r));
  const applyToAll = () => setRows((p) => p.map((r) => ({ ...r, paymentMode: commonMode, paymentDate: commonDate })));
  const grandTotal = rows.reduce((s, r) => s + (parseFloat(r.collectAmount) || 0), 0);
  const MODES = [{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'DD', label: 'DD' }];

  const handleSubmit = async () => {
    const bad = rows.find((r) => !r.collectAmount || parseFloat(r.collectAmount) <= 0);
    if (bad) { alert('Please fill in all collect amounts'); return; }
    try {
      setLoading(true);
      const res = await createBulkFeeCollection({
        payments: rows.map((r) => ({
          studentId: r.studentId, feeStructureId: r.feeStructureId,
          amountPaid: parseFloat(r.collectAmount),
          discount: parseFloat(r.discount) || 0,
          discountReason: null,
          lateFine: r.lateFine !== null && r.lateFine !== '' ? parseFloat(r.lateFine) : null,
          paymentMode: r.paymentMode, paymentDate: r.paymentDate,
          referenceNo: null, remarks: null,
        })),
      });
      onSuccess(res);
    } catch (e) { alert(e.message || 'Failed to process bulk payments'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Fee Collection — ${students.length} Students`} wide
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="success" onClick={handleSubmit} disabled={loading}>{loading ? 'Processing…' : `Process ${rows.length} Payments & Generate Receipts`}</Btn></>}>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-emerald-800">
        Payments will be recorded for all {students.length} selected students. Adjust amounts and late fines per row as needed.
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 flex items-end gap-4">
        <div>
          <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Common Payment Mode</label>
          <Sel value={commonMode} onChange={setCommonMode} options={MODES} className="w-32" />
        </div>
        <div>
          <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Date</label>
          <Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-40" />
        </div>
        <Btn variant="ghost" size="sm" onClick={applyToAll}>Apply to All Rows</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              {['Student', 'Class', 'Period', 'Balance Due', 'Collect Amount', 'Discount', 'Late Fine', 'Mode'].map((h) => (
                <th key={h} className="px-3 py-2 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className={`border-b border-gray-100 ${row.daysLate > 0 ? 'bg-red-50' : ''}`}>
                <td className="px-3 py-2.5">
                  <div className="font-semibold text-gray-900">{row.studentName}</div>
                  <div className="text-xs text-gray-500">{row.studentCode}</div>
                </td>
                <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{row.class}</span></td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{row.period}</td>
                <td className="px-3 py-2.5">
                  {row.daysLate > 0 ? <span className="text-red-700 text-xs font-bold">● {fmt(row.balanceDue)} · {row.daysLate}d late</span>
                    : <span className="font-semibold">{fmt(row.balanceDue)}</span>}
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" value={row.collectAmount} onChange={(e) => update(row.id, 'collectAmount', e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]" />
                </td>
                <td className="px-3 py-2.5">
                  <input type="number" value={row.discount} placeholder="0" onChange={(e) => update(row.id, 'discount', e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]" />
                </td>
                <td className="px-3 py-2.5">
                  {row.lateFine !== null
                    ? <input type="number" value={row.lateFine} placeholder="Fine" onChange={(e) => update(row.id, 'lateFine', e.target.value)}
                        className="w-20 px-2 py-1 text-sm border border-amber-300 rounded focus:outline-none focus:border-amber-500 bg-amber-50" />
                    : <span className="text-xs text-gray-400">N/A</span>}
                </td>
                <td className="px-3 py-2.5">
                  <select value={row.paymentMode} onChange={(e) => update(row.id, 'paymentMode', e.target.value)}
                    className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]">
                    {MODES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900 rounded-lg px-4 py-3 mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">{rows.length} receipts will be generated automatically</div>
        <div className="text-white font-extrabold text-base">Grand Total: {fmt(grandTotal)}</div>
      </div>
    </Modal>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, subtitle, type }) => {
  const styles = {
    total:   { border: '#1A3A5C', color: '#1A3A5C' },
    paid:    { border: '#0D7A55', color: '#0D7A55' },
    partial: { border: '#B45309', color: '#B45309' },
    overdue: { border: '#B91C1C', color: '#B91C1C' },
    discount:{ border: '#64748B', color: '#334155' },
  }[type] || { border: '#94A3B8', color: '#334155' };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
      style={{ borderLeft: `3px solid ${styles.border}` }}>
      <div className="text-[10px] font-bold tracking-widest uppercase text-gray-500 mb-1.5">{title}</div>
      <div className="text-2xl font-extrabold leading-none mb-1" style={{ color: styles.color }}>{value}</div>
      <div className="text-[11px] text-gray-500">{subtitle}</div>
    </div>
  );
};

// ─── Main Overview Component ──────────────────────────────────────────────────
const Overview = ({ onNavigate }) => {
  const [dashboard, setDashboard]     = useState(null);
  const [periods, setPeriods]         = useState([]);
  const [outstanding, setOutstanding] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [periodFilter, setPeriodFilter] = useState('');

  // Modal states
  const [collectModal, setCollectModal] = useState({ open: false, student: null });
  const [bulkModal, setBulkModal]       = useState({ open: false, students: [] });
  const [receiptModal, setReceiptModal] = useState({ open: false, receipt: null });
  const [selected, setSelected]         = useState([]);
  const navigate = useNavigate();

  // ── Load data ────────────────────────────────────────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, perds, out] = await Promise.all([
        getFeeDashboard(DEFAULT_ACADEMIC_YEAR_ID).catch(() => null),
        getFeePeriods(DEFAULT_ACADEMIC_YEAR_ID).catch(() => []),
        getOutstandingFees({}).catch(() => ({ records: [] })),
      ]);
      setDashboard(dash);
      setPeriods(Array.isArray(perds) ? perds : []);
      setOutstanding((out?.records || []).map((r) => ({
        id: r.id, studentId: r.student?.id || r.studentId,
        studentName: r.student?.name || r.studentName || '—',
        studentCode: r.student?.code || r.studentCode || '—',
        class: r.className, period: r.periodName,
        balance: r.balanceAmount, totalFee: r.totalAmount,
        paidAmount: r.paidAmount, status: r.status,
        daysLate: r.daysOverdue || 0,
        feeStructureId: r.feeStructureId, dueDate: r.dueDate,
      })));
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Derived stats (from API or fallback) ─────────────────────────────────
  const stats = {
    totalBilled:  dashboard?.totalBilled    || 0,
    collected:    dashboard?.totalCollected  || dashboard?.collected || 0,
    partial:      dashboard?.partialAmount  || dashboard?.partial || 0,
    overdue:      dashboard?.overdueAmount  || dashboard?.overdue || 0,
    discounts:    dashboard?.totalDiscount  || dashboard?.discounts || 0,
    collectedPct: dashboard?.collectionRate  || 0,
    partialStudents: dashboard?.partialStudentCount || 0,
    overdueStudents: dashboard?.overdueStudentCount || 0,
    discountStudents: dashboard?.discountStudentCount || 0,
    totalStudents:   dashboard?.totalStudents || 0,
    totalPeriods:    dashboard?.totalPeriods  || periods.length,
  };

  const classData    = dashboard?.classWiseCollection || dashboard?.classCollection || [];
  const recentColl   = dashboard?.recentCollections   || dashboard?.recentPayments  || [];
  const overdueAlerts = outstanding.filter((s) => s.status === 'OVERDUE').slice(0, 3);

  // ── Period status helper ─────────────────────────────────────────────────
  const getPeriodStatus = (p) => {
    const due = new Date(p.dueDate);
    const now = new Date();
    if (p.collectedAmount >= p.totalAmount && p.totalAmount > 0) return { label: 'Closed',   status: 'CLOSED' };
    if (due < now) return { label: 'Overdue',  status: 'OVERDUE' };
    if (p.collectedAmount > 0) return { label: 'Active',   status: 'PARTIAL' };
    return { label: 'Upcoming', status: 'PENDING' };
  };

  // ── Selection helpers ────────────────────────────────────────────────────
  const filteredOut = outstanding.filter((s) => !periodFilter || s.period?.includes(periodFilter));
  const selStudents = outstanding.filter((s) => selected.includes(s.id));
  const selTotal    = selStudents.reduce((a, s) => a + s.balance, 0);
  const toggleRow   = (id) => setSelected((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleAll   = () => {
    const ids = filteredOut.map((s) => s.id);
    const allSel = ids.every((id) => selected.includes(id));
    setSelected(allSel ? selected.filter((id) => !ids.includes(id)) : [...new Set([...selected, ...ids])]);
  };

  // ── Receipt helpers ──────────────────────────────────────────────────────
  const openReceipt = (res, student) => {
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo: res.receiptNo, date: res.paymentDate,
        studentName: student.studentName, studentCode: student.studentCode,
        class: student.class, period: student.period,
        components: res.components || [
          { name: 'Tuition Fee',   amount: Math.floor(student.totalFee * 0.67) },
          { name: 'Transport Fee', amount: Math.floor(student.totalFee * 0.20) },
          { name: 'Lab Fee',       amount: Math.floor(student.totalFee * 0.10) },
          { name: 'Misc',          amount: student.totalFee - Math.floor(student.totalFee * 0.97) },
        ],
        amountPaid: res.amountPaid, discount: res.discount || 0,
        lateFine: res.lateFine || 0, paymentMode: res.paymentMode,
        referenceNo: res.referenceNo, balanceAfter: res.balanceAfter || 0,
        recordedBy: res.recordedBy || 'Admin',
      },
    });
  };

  const handleCollectSuccess = (res, student) => {
    setCollectModal({ open: false, student: null });
    openReceipt(res, student);
    loadAll();
    setSelected([]);
  };

  const handleBulkSuccess = (responses) => {
    setBulkModal({ open: false, students: [] });
    alert(`✅ Successfully processed ${Array.isArray(responses) ? responses.length : '?'} payments!`);
    loadAll();
    setSelected([]);
  };

  const openCollect = (student) => setCollectModal({ open: true, student });
  const openBulk   = () => setBulkModal({ open: true, students: selStudents });

  // ─────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-[#1A3A5C] border-t-transparent rounded-full mx-auto mb-3" />
          <div className="text-sm text-gray-400">Loading dashboard…</div>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* ── Page header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Fee Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Academic Year 2025–26 · All Classes · {new Date().toLocaleString('en-IN', { month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm"><Download size={13} /> Export Report</Btn>
          <Btn variant="primary" size="sm" onClick={() => outstanding.length > 0 && openCollect(outstanding[0])}>
            <Plus size={13} /> Collect Fee
          </Btn>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Billed"      value={fmtCompact(stats.totalBilled)}  subtitle={`${stats.totalStudents} students · ${stats.totalPeriods} periods`}  type="total" />
        <StatCard title="Collected"         value={fmtCompact(stats.collected)}    subtitle={`${stats.collectedPct ? stats.collectedPct.toFixed(1) : '—'}% collection rate`} type="paid" />
        <StatCard title="Partial / Pending" value={fmtCompact(stats.partial)}      subtitle={`${stats.partialStudents} students with balance`}                   type="partial" />
        <StatCard title="Overdue"           value={fmtCompact(stats.overdue)}      subtitle={`${stats.overdueStudents} students past due date`}                  type="overdue" />
        <StatCard title="Discounts Given"   value={fmtCompact(stats.discounts)}    subtitle={`${stats.discountStudents} students`}                               type="discount" />
      </div>

      {/* ── 2-col section ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* Collection by class table */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-gray-800">Collection by Class</h3>
            <Sel value={periodFilter} onChange={setPeriodFilter} className="!w-auto !py-1 !px-2 text-xs"
              options={periods.map((p) => ({ value: p.name, label: p.name }))}
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
                  const pct = row.totalBilled > 0 ? Math.round((row.totalCollected / row.totalBilled) * 100) : 0;
                  const bal = (row.totalBilled || 0) - (row.totalCollected || 0);
                  const status = pct >= 100 ? 'PAID' : bal > 0 && new Date() > new Date() ? 'OVERDUE' : 'PARTIAL';
                  return (
                    <tr key={row.className || row.class} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-2.5 font-semibold text-sm">{row.className || row.class}</td>
                      <td className="px-3 py-2.5 text-sm">{row.studentCount || row.students || '—'}</td>
                      <td className="px-3 py-2.5 text-sm">{fmtCompact(row.totalBilled || row.billed)}</td>
                      <td className="px-3 py-2.5 text-sm font-semibold text-emerald-600">{fmtCompact(row.totalCollected || row.collected)}</td>
                      <td className={`px-3 py-2.5 text-sm font-semibold ${bal > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>{bal > 0 ? fmtCompact(bal) : '₹0'}</td>
                      <td className="px-3 py-2.5"><ProgressBar pct={pct} /></td>
                      <td className="px-3 py-2.5"><Bdg status={status}>{status === 'PAID' ? 'Paid' : status === 'OVERDUE' ? 'Overdue' : 'Partial'}</Bdg></td>
                    </tr>
                  );
                }) : (
                  /* Fallback static rows if API doesn't return class data */
                  [
                    { cls: 'Class 10', students: 82,  billed: 984000,  collected: 820000, pct: 83,  status: 'PARTIAL' },
                    { cls: 'Class 9',  students: 90,  billed: 990000,  collected: 990000, pct: 100, status: 'PAID' },
                    { cls: 'Class 8',  students: 76,  billed: 760000,  collected: 570000, pct: 75,  status: 'OVERDUE' },
                    { cls: 'Class 7',  students: 74,  billed: 666000,  collected: 590000, pct: 89,  status: 'PARTIAL' },
                    { cls: 'Class 6',  students: 72,  billed: 576000,  collected: 576000, pct: 100, status: 'PAID' },
                  ].map((row) => {
                    const bal = row.billed - row.collected;
                    return (
                      <tr key={row.cls} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                        <td className="px-3 py-2.5 font-semibold text-sm">{row.cls}</td>
                        <td className="px-3 py-2.5 text-sm">{row.students}</td>
                        <td className="px-3 py-2.5 text-sm">{fmtCompact(row.billed)}</td>
                        <td className="px-3 py-2.5 text-sm font-semibold text-emerald-600">{fmtCompact(row.collected)}</td>
                        <td className={`px-3 py-2.5 text-sm font-semibold ${bal > 0 ? (row.status === 'OVERDUE' ? 'text-red-600' : 'text-amber-600') : 'text-emerald-600'}`}>
                          {bal > 0 ? fmtCompact(bal) : '₹0'}
                        </td>
                        <td className="px-3 py-2.5"><ProgressBar pct={row.pct} /></td>
                        <td className="px-3 py-2.5"><Bdg status={row.status}>{row.status === 'PAID' ? 'Paid' : row.status === 'OVERDUE' ? 'Overdue' : 'Partial'}</Bdg></td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Recent Collections */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Recent Collections</h3>
              <button onClick={() => onNavigate && onNavigate('collections')}
                className="text-xs text-[#1A3A5C] font-semibold flex items-center gap-1 hover:underline">
                View all <ArrowRight size={11} />
              </button>
            </div>
            {recentColl.length > 0 ? recentColl.slice(0, 4).map((r, i, arr) => (
              <div key={r.id || i} className={`flex items-center gap-3 px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <Av name={r.studentName || r.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{r.studentName || r.name}</div>
                  <div className="text-[11px] text-gray-500">{r.className || r.class} · {r.periodName || r.period}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-emerald-600">{fmtCompact(r.amountPaid || r.amount)}</div>
                  <div className="text-[11px] text-gray-500">{r.paymentMode || r.mode}</div>
                </div>
              </div>
            )) : (
              /* Fallback static */
              [
                { name: 'Riya Sharma',      sub: 'Cl.10-A · Q1', amt: 12000,  mode: 'Cash',   isOk: true },
                { name: 'Arjun Verma',      sub: 'Cl.9-B · Q1',  amt: 9500,   mode: 'Online', isOk: true },
                { name: 'Priya Kapoor',     sub: 'Cl.8-A · Ann', amt: 5000,   mode: 'Cheque', isOk: false },
                { name: 'Siddharth Mishra', sub: 'Cl.7-B · Q1',  amt: 11200,  mode: 'Online', isOk: true },
              ].map((r, i, arr) => (
                <div key={r.name} className={`flex items-center gap-3 px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <Av name={r.name} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 truncate">{r.name}</div>
                    <div className="text-[11px] text-gray-500">{r.sub}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`text-sm font-bold ${r.isOk ? 'text-emerald-600' : 'text-amber-600'}`}>{fmtCompact(r.amt)}</div>
                    <div className="text-[11px] text-gray-500">{r.mode}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Overdue Alerts */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden" style={{ borderLeft: '3px solid #B91C1C' }}>
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800">Overdue Alerts</h3>
              <Btn variant="danger" size="xs" onClick={() => onNavigate && onNavigate('collections')}>View All</Btn>
            </div>
            {overdueAlerts.length > 0 ? overdueAlerts.map((a, i, arr) => (
              <div key={a.id} className={`flex items-center justify-between px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                <div>
                  <div className="text-sm font-semibold text-gray-900">{a.studentName}</div>
                  <div className="text-[11px] text-gray-500">{a.class} · {a.period} · {a.daysLate}d overdue</div>
                </div>
                <div className="text-right ml-3">
                  <div className="text-sm font-bold text-red-600">{fmtCompact(a.balance)}</div>
                  <Btn variant="primary" size="xs" onClick={() => openCollect(a)} className="mt-1">Collect</Btn>
                </div>
              </div>
            )) : (
              [{ name: 'Kavita Mehta', info: '9-A · Q1 · 21 days overdue', amt: 18000 },
               { name: 'Rahul Tiwari', info: '9-A · Q1 · 21 days overdue', amt: 12000 },
               { name: 'Neha Singh',   info: '8-A · Q1 · 16 days overdue', amt: 9500 }].map((a, i, arr) => (
                <div key={a.name} className={`flex items-center justify-between px-4 py-2.5 ${i < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{a.name}</div>
                    <div className="text-[11px] text-gray-500">{a.info}</div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-sm font-bold text-red-600">{fmtCompact(a.amt)}</div>
                    <Btn variant="primary" size="xs" className="mt-1" onClick={() => outstanding.length > 0 && openCollect(outstanding[0])}>Collect</Btn>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Outstanding table with bulk collect ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Outstanding Fees</h3>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Btn variant="success" size="sm" onClick={openBulk}>
                Collect Selected ({selected.length}) — {fmtCompact(selTotal)}
              </Btn>
            )}
            <Btn variant="ghost" size="sm" onClick={() => onNavigate && onNavigate('collections')}>
              View All <ArrowRight size={12} />
            </Btn>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="bg-[#1A3A5C] px-5 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-white font-bold text-sm">{selected.length} student{selected.length !== 1 ? 's' : ''} selected</div>
              <div className="text-white/60 text-sm">Total: <span className="font-bold text-white">{fmtCompact(selTotal)}</span></div>
            </div>
            <div className="flex gap-2">
              <Btn variant="secondary" size="sm" onClick={() => setSelected([])} className="!bg-white/10 !border-white/20 !text-white hover:!bg-white/20">Clear</Btn>
              <Btn variant="success" size="sm" onClick={openBulk}>Collect Selected ({selected.length})</Btn>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-3 py-2.5 w-8">
                  <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-[#1A3A5C]"
                    checked={filteredOut.length > 0 && filteredOut.every((s) => selected.includes(s.id))}
                    onChange={toggleAll} />
                </th>
                {['Student', 'Class', 'Period', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Action'].map((h) => (
                  <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredOut.slice(0, 8).map((s) => {
                const isSel = selected.includes(s.id);
                return (
                  <tr key={s.id} className={`border-b border-gray-100 transition-colors ${isSel ? 'bg-blue-50' : s.status === 'OVERDUE' ? 'bg-red-50/40 hover:bg-red-50' : 'hover:bg-gray-50'}`}>
                    <td className="px-3 py-3">
                      <input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-[#1A3A5C]" checked={isSel} onChange={() => toggleRow(s.id)} />
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
                    <td className="px-3 py-3"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{s.class}</span></td>
                    <td className="px-3 py-3 text-xs text-gray-600">{s.period}</td>
                    <td className="px-3 py-3 text-sm">{fmtCompact(s.totalFee)}</td>
                    <td className={`px-3 py-3 text-sm font-semibold ${s.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{fmtCompact(s.paidAmount)}</td>
                    <td className="px-3 py-3">
                      {s.status === 'OVERDUE' ? (
                        <div>
                          <div className="text-red-700 font-bold text-sm">{fmtCompact(s.balance)}</div>
                          <div className="flex items-center gap-1 text-red-600 text-[11px] font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />{s.daysLate}d overdue
                          </div>
                        </div>
                      ) : <span className="font-semibold text-gray-900 text-sm">{fmtCompact(s.balance)}</span>}
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <span className={s.status === 'OVERDUE' ? 'text-red-600 font-semibold' : 'text-gray-600'}>{fmtDate(s.dueDate)}</span>
                    </td>
                    <td className="px-3 py-3"><Bdg status={s.status}>{s.status === 'OVERDUE' ? 'Overdue' : s.status === 'PARTIAL' ? 'Partial' : 'Pending'}</Bdg></td>
                    <td className="px-3 py-3">
                      <Btn variant={s.status === 'OVERDUE' ? 'danger' : 'primary'} size="xs" onClick={() => openCollect(s)}>Collect</Btn>
                    </td>
                  </tr>
                );
              })}
              {filteredOut.length === 0 && (
                <tr><td colSpan={10} className="text-center py-10 text-sm text-gray-400">No outstanding fees found</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {filteredOut.length > 8 && (
          <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <span className="text-xs text-gray-500">Showing 8 of {filteredOut.length} records</span>
            <Btn variant="ghost" size="sm" onClick={() => onNavigate && onNavigate('collections')}>View All Outstanding</Btn>
          </div>
        )}
      </div>

      {/* ── Active Fee Periods ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Active Fee Periods — 2025–26</h3>
          <Btn variant="ghost" size="sm" onClick={() => navigate("/feemanagement/config")}>
            Manage Periods <ArrowRight size={12} />
          </Btn>
        </div>
        <div className="p-4 grid grid-cols-4 gap-4">
          {(periods.length > 0 ? periods : [
            { id: 1, name: 'Q1 2025-26',    type: 'QUARTERLY', dueDate: '2026-04-30', studentCount: 482, collectedAmount: 3420000, totalAmount: 4860000 },
            { id: 2, name: 'Q2 2025-26',    type: 'QUARTERLY', dueDate: '2026-07-31', studentCount: 0,   collectedAmount: 0,       totalAmount: 4860000 },
            { id: 3, name: 'Annual 2025-26',type: 'YEARLY',    dueDate: '2026-04-10', studentCount: 226, collectedAmount: 1210000, totalAmount: 1210000 },
            { id: 4, name: 'May 2026',       type: 'MONTHLY',  dueDate: '2026-05-10', studentCount: 124, collectedAmount: 320000,  totalAmount: 500000 },
          ]).map((p) => {
            const st = getPeriodStatus(p);
            const accent = PERIOD_TYPE_COLOR[p.type];
            return (
              <div key={p.id} className="rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow"
                style={{ borderLeft: `3px solid ${accent}` }}
                onClick={() => onNavigate && onNavigate('periods')}>
                <div className="flex items-center justify-between mb-2">
                  <Bdg status={p.type}>{PERIOD_TYPE_LABEL[p.type] || p.type}</Bdg>
                  <Bdg status={st.status}>{st.label}</Bdg>
                </div>
                <div className="text-sm font-bold text-gray-800">{p.name}</div>
                <div className="text-[11px] text-gray-500 mt-1">Due: {fmtDate(p.dueDate)}</div>
                <div className="text-xs font-bold mt-2" style={{ color: accent }}>
                  {p.studentCount > 0 ? `${p.studentCount} students` : 'Not started'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Modals ── */}
      <CollectFeeModal open={collectModal.open} onClose={() => setCollectModal({ open: false, student: null })} student={collectModal.student} onSuccess={handleCollectSuccess} />
      <BulkCollectModal open={bulkModal.open} onClose={() => setBulkModal({ open: false, students: [] })} students={bulkModal.students} onSuccess={handleBulkSuccess} />
      <ReceiptModal open={receiptModal.open} onClose={() => setReceiptModal({ open: false, receipt: null })} receipt={receiptModal.receipt} />
    </div>
  );
};

export default Overview;