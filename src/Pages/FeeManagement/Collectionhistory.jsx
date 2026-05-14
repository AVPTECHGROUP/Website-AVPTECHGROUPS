import React, { useState, useEffect,  useContext } from 'react';
import { X, FileDown, AlertCircle, Printer, FileText, Search } from 'lucide-react';
import {
  getOutstandingFees,
  getFeeCollectionHistory,
  createFeeCollection,
  createBulkFeeCollection,
  getFeeReceiptById,
} from '../../Api/FeeCollection';
import { getFeePeriods } from '../../Api/FeePeriods';
import { getFeeStructures } from '../../Api/FeeStructures';
import { authFetch } from '../../Authfetch/Authfetch';
import { UserContext } from '../../ContextAPI/UserContext';
import FeeReceiptPrint from '../../Components/FeeModal/FeeReciptPrint';

// ─── Constants ────────────────────────────────────────────────────────────────
const SCHOOL_ID = 1;
const BASE_URL  = import.meta.env.VITE_API_BASE_V1;
const PAGE_SIZE = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt     = (n) => 'Rs.' + (Number(n) || 0).toLocaleString('en-IN');   // ← plain ASCII for jsPDF
const fmtDisp = (n) => '₹'  + (Number(n) || 0).toLocaleString('en-IN');   // ← ₹ for UI only

const fmtDate = (d) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  catch { return d; }
};

const todayISO = () => new Date().toISOString().split('T')[0];

const initials = (name = '') =>
  name.split(' ').slice(0, 2).map((w) => w[0]).join('').toUpperCase();

// ─── Shared UI primitives ─────────────────────────────────────────────────────
const Av = ({ name, status, size = 'md' }) => {
  const sz = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' }[size];
  const bg = status === 'PARTIAL' ? 'bg-amber-700' : 'bg-[#1A3A5C]';
  return (
    <div className={`${sz} ${bg} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials(name)}
    </div>
  );
};

const Badge = ({ status }) => {
  const map = {
    OVERDUE: 'bg-red-50 text-red-700 border border-red-200',
    PARTIAL: 'bg-amber-50 text-amber-800 border border-amber-200',
    UNPAID:  'bg-gray-100 text-gray-600 border border-gray-200',
    Pending: 'bg-gray-100 text-gray-600 border border-gray-200',
    PAID:    'bg-emerald-50 text-emerald-700 border border-emerald-200',
    Completed:'bg-emerald-50 text-emerald-700 border border-emerald-200',
    CASH:    'bg-gray-100 text-gray-600 border border-gray-200',
    ONLINE:  'bg-blue-50 text-blue-700 border border-blue-200',
    CHEQUE:  'bg-gray-100 text-gray-600 border border-gray-200',
    DD:      'bg-gray-100 text-gray-600 border border-gray-200',
    Cash:    'bg-gray-100 text-gray-600 border border-gray-200',
    Online:  'bg-blue-50 text-blue-700 border border-blue-200',
    Cheque:  'bg-gray-100 text-gray-600 border border-gray-200',
  };
  const label = status === 'UNPAID' ? 'Pending' : status;
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10.5px] font-bold ${map[status] || 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
      {label}
    </span>
  );
};

const Btn = ({ children, variant = 'primary', size = 'md', onClick, type = 'button', disabled, className = '' }) => {
  const sz = { xs: 'px-2 py-1 text-[11px]', sm: 'px-3 py-1.5 text-[12px]', md: 'px-4 py-2 text-[12.5px]' }[size];
  const v  = {
    primary:   'bg-[#1A3A5C] text-white hover:bg-[#0F2744]',
    success:   'bg-emerald-700 text-white hover:bg-emerald-800',
    danger:    'bg-red-700 text-white hover:bg-red-800',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    ghost:     'bg-[#EEF4FF] text-[#1A3A5C] border border-[#C7D7EE] hover:bg-[#DDE8F5]',
  }[variant];
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center justify-center gap-1.5 font-semibold rounded-lg transition-all active:scale-[.98] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap ${sz} ${v} ${className}`}>
      {children}
    </button>
  );
};

const Inp = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white ${className}`}
    {...props}
  />
);

const Sel = ({ options = [], placeholder, value, onChange, className = '' }) => (
  <select value={value} onChange={(e) => onChange(e.target.value)}
    className={`px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white ${className}`}>
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
  </select>
);

// ─── Modal shell ──────────────────────────────────────────────────────────────
const Modal = ({ open, onClose, title, wide, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/55 z-50 flex items-start justify-center p-10 overflow-y-auto backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? 'max-w-5xl' : 'max-w-lg'} my-4`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-extrabold tracking-tight text-gray-900">{title}</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
            <X size={16} />
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

// ─── Collect Fee Modal ────────────────────────────────────────────────────────
// Shows classes assigned to the selected period (via fee structures),
// then students in the selected class, with a live search bar.
const CollectFeeModal = ({ open, onClose, student: initialStudent, periodOptions, onSuccess }) => {
  const [selectedPeriodId, setSelectedPeriodId] = useState('');
  const [form, setForm] = useState({
    amountPaid: '', paymentMode: 'CASH', paymentDate: todayISO(),
    referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
  });
  const [loading, setLoading] = useState(false);

  // ── Class / student picker state ──────────────────────────────────────────
  const [periodClasses,    setPeriodClasses]    = useState([]);   // classes linked to period via structures
  const [classesLoading,   setClassesLoading]   = useState(false);
  const [selectedClassId,  setSelectedClassId]  = useState('');
  const [students,         setStudents]         = useState([]);
  const [studentsLoading,  setStudentsLoading]  = useState(false);
  const [studentSearch,    setStudentSearch]    = useState('');
  const [activeStudent,    setActiveStudent]    = useState(initialStudent || null);

  // ── Init when modal opens ─────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    setActiveStudent(initialStudent || null);
    setSelectedClassId('');
    setStudents([]);
    setStudentSearch('');
    setPeriodClasses([]);

    if (initialStudent) {
      // Pre-fill form from existing student row
      let matched = null;
      if (initialStudent.feePeriodId) matched = periodOptions.find((p) => String(p.value) === String(initialStudent.feePeriodId));
      if (!matched && initialStudent.period) matched = periodOptions.find((p) => p.label?.trim().toLowerCase() === initialStudent.period?.trim().toLowerCase());
      if (!matched && periodOptions.length > 0) matched = periodOptions[0];
      setSelectedPeriodId(matched ? String(matched.value) : '');
      setForm({
        amountPaid: initialStudent.balance?.toString() || '', paymentMode: 'CASH', paymentDate: todayISO(),
        referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '',
      });
    } else {
      setSelectedPeriodId('');
      setForm({ amountPaid: '', paymentMode: 'CASH', paymentDate: todayISO(), referenceNo: '', discount: '', discountReason: '', lateFine: '', remarks: '' });
    }
  }, [open, initialStudent, periodOptions]);

  // ── Load classes for selected period via fee structures ───────────────────
  useEffect(() => {
    if (!selectedPeriodId) { setPeriodClasses([]); setSelectedClassId(''); setStudents([]); return; }
    const load = async () => {
      setClassesLoading(true);
      setPeriodClasses([]);
      setSelectedClassId('');
      setStudents([]);
      try {
        // getFeeStructures(periodId) returns structures, each has .classes array
        const structures = await getFeeStructures(parseInt(selectedPeriodId));
        // Flatten all classes across structures, deduplicate by id
        const seen = new Set();
        const classes = [];
        (Array.isArray(structures) ? structures : []).forEach((s) => {
          (s.classes || []).forEach((c) => {
            if (!seen.has(c.id)) { seen.add(c.id); classes.push({ id: c.id, name: c.name || c.className }); }
          });
        });
        setPeriodClasses(classes);
      } catch (e) {
        console.error('Failed to load classes for period:', e);
      } finally {
        setClassesLoading(false);
      }
    };
    load();
  }, [selectedPeriodId]);

  // ── Load students for selected class ─────────────────────────────────────
  useEffect(() => {
    if (!selectedClassId) { setStudents([]); return; }
    const load = async () => {
      setStudentsLoading(true);
      try {
        const res = await authFetch(`${BASE_URL}/students/class/${selectedClassId}?status=ACTIVE`);
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data?.data || []);
        setStudents(list);
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

  const MODES     = { CASH: '💵 Cash', ONLINE: '🌐 Online', CHEQUE: '📝 Cheque', DD: '🏦 DD' };
  const isOverdue = activeStudent?.status === 'OVERDUE';
  const netTotal  = (parseFloat(form.amountPaid) || 0) + (parseFloat(form.lateFine) || 0) - (parseFloat(form.discount) || 0);

  // Filter students by search
  const filteredStudents = students.filter((s) => {
    const q = studentSearch.toLowerCase();
    return !q ||
      (s.firstName + ' ' + s.lastName).toLowerCase().includes(q) ||
      (s.admissionNumber || '').toLowerCase().includes(q);
  });

  const selectStudent = (s) => {
    const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
    setActiveStudent({
      studentId:      s.id || s.studentId,
      studentName:    fullName,
      studentCode:    s.admissionNumber || s.studentCode,
      class:          s.className || s.class || periodClasses.find(c => String(c.id) === selectedClassId)?.name || '',
      feeStructureId: s.feeStructureId,
      feePeriodId:    selectedPeriodId,
      balance:        s.balanceDue || s.balance || 0,
      paidAmount:     s.paidAmount || 0,
      totalFee:       s.totalFee   || 0,
      dueDate:        s.dueDate,
      daysLate:       s.overdueDays || 0,
      status:         (s.overdueDays > 0 && s.balanceDue > 0) ? 'OVERDUE' : (s.paidAmount > 0 && s.balanceDue > 0) ? 'PARTIAL' : 'PENDING',
      parentName:     s.parentName,
      parentPhone:    s.parentPhone,
    });
    setForm((p) => ({ ...p, amountPaid: String(s.balanceDue || s.balance || '') }));
  };

  const handleSubmit = async () => {
    if (!activeStudent) { alert('Please select a student'); return; }
    if (!form.amountPaid || parseFloat(form.amountPaid) <= 0) { alert('Please enter a valid amount'); return; }
    if (!selectedPeriodId) { alert('Please select a fee period'); return; }
    try {
      setLoading(true);
      const response = await createFeeCollection({
        studentId:      activeStudent.studentId,
        feeStructureId: activeStudent.feeStructureId,
        amountPaid:     parseFloat(form.amountPaid),
        discount:       parseFloat(form.discount) || 0,
        discountReason: form.discountReason || null,
        lateFine:       parseFloat(form.lateFine) || 0,
        paymentMode:    form.paymentMode,
        paymentDate:    form.paymentDate,
        referenceNo:    form.referenceNo || null,
        remarks:        form.remarks || null,
      });
      onSuccess(response, activeStudent);
    } catch (e) { alert(e.message || 'Failed to record payment.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title="Collect Fee Payment" wide
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="success" onClick={handleSubmit} disabled={loading || !activeStudent}>{loading ? 'Recording…' : '✓ Record & Generate Receipt'}</Btn></>}>
      <div className="grid grid-cols-2 gap-6">

        {/* ── LEFT COLUMN ── */}
        <div className="space-y-4">

          {/* Period selector */}
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Fee Period *</label>
            <select value={selectedPeriodId} onChange={(e) => setSelectedPeriodId(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white">
              <option value="">-- Select fee period --</option>
              {periodOptions.map((p) => <option key={p.value} value={String(p.value)}>{p.label}</option>)}
            </select>
          </div>

          {/* Class selector — only shows classes linked to the period */}
          {selectedPeriodId && (
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">
                Class * {classesLoading && <span className="text-gray-400 font-normal">(loading…)</span>}
              </label>
              {periodClasses.length === 0 && !classesLoading ? (
                <div className="text-xs text-gray-400 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
                  No classes linked to this period yet.
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 max-h-32 overflow-y-auto">
                  {periodClasses.map((c) => (
                    <button key={c.id} type="button"
                      onClick={() => setSelectedClassId(String(c.id))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border-2 ${
                        selectedClassId === String(c.id)
                          ? 'bg-[#1A3A5C] text-white border-[#1A3A5C]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#1A3A5C]/40'
                      }`}>
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Student search within class */}
          {selectedClassId && (
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">
                Select Student * {studentsLoading && <span className="text-gray-400 font-normal">(loading…)</span>}
              </label>
              <div className="relative mb-2">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input value={studentSearch} onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or admission no…"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all bg-white" />
              </div>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-h-48 overflow-y-auto">
                {studentsLoading ? (
                  <div className="text-center py-6 text-sm text-gray-400">Loading students…</div>
                ) : filteredStudents.length === 0 ? (
                  <div className="text-center py-6 text-sm text-gray-400">No students found</div>
                ) : filteredStudents.map((s) => {
                  const fullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
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
                      {isSelected && <span className="text-[10px] font-bold text-[#1A3A5C] bg-[#DDE8F5] px-2 py-0.5 rounded">Selected</span>}
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
                {activeStudent.parentName && <div className="text-[11px] text-gray-500 mt-0.5">Parent: {activeStudent.parentName}</div>}
              </div>
            </div>
          )}

          {/* Paid / Balance summary */}
          {activeStudent && (
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-emerald-700 uppercase">Already Paid</div>
                <div className="text-lg font-extrabold text-emerald-600">{fmtDisp(activeStudent.paidAmount || 0)}</div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
                <div className="text-[10px] font-bold text-red-700 uppercase">Balance</div>
                <div className="text-lg font-extrabold text-red-600">{fmtDisp(activeStudent.balance)}</div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="space-y-4">
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Amount to Collect *</label>
            <div className="relative">
              <Inp type="number" value={form.amountPaid} className="pr-28" onChange={(e) => setForm((p) => ({ ...p, amountPaid: e.target.value }))} />
              {activeStudent && (
                <button type="button" onClick={() => setForm((p) => ({ ...p, amountPaid: String(activeStudent.balance || '') }))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[#1A3A5C] bg-[#EEF4FF] hover:bg-[#DDE8F5] border border-[#C7D7EE] px-2 py-1 rounded">
                  Full {fmtDisp(activeStudent.balance)}
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Mode *</label>
            <div className="grid grid-cols-4 gap-2">
              {Object.entries(MODES).map(([mode, label]) => (
                <button key={mode} type="button" onClick={() => setForm((p) => ({ ...p, paymentMode: mode }))}
                  className={`flex flex-col items-center gap-1.5 px-2 py-2.5 rounded-lg border-2 transition-all ${form.paymentMode === mode ? 'border-[#1A3A5C] bg-[#EEF4FF] text-[#1A3A5C]' : 'border-gray-200 bg-white text-gray-600'}`}>
                  <span className="text-xl">{label.split(' ')[0]}</span>
                  <span className="text-[10.5px] font-bold">{label.split(' ')[1]}</span>
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
              className="w-full mt-2 px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all resize-none" />
          </div>
          {isOverdue && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <span>⚠️</span>
                <div>
                  <div className="text-sm font-bold text-amber-800">Past Due Date — Add Late Fine?</div>
                  <div className="text-[11px] text-amber-700 mt-0.5">Due was {fmtDate(activeStudent?.dueDate)} · {activeStudent?.daysLate} day{activeStudent?.daysLate !== 1 ? 's' : ''} overdue</div>
                </div>
              </div>
              <Inp type="number" value={form.lateFine} placeholder="Enter manually — leave blank to waive"
                onChange={(e) => setForm((p) => ({ ...p, lateFine: e.target.value }))} className="border-amber-300 focus:border-amber-500" />
            </div>
          )}
          <div>
            <label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Remarks</label>
            <textarea value={form.remarks} rows={2} onChange={(e) => setForm((p) => ({ ...p, remarks: e.target.value }))}
              placeholder="Optional note..."
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all resize-none" />
          </div>
          <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
            <div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Receipt No.</div>
              <div className="text-white font-bold text-sm mt-0.5">Auto-generated</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] text-gray-400 uppercase tracking-wider">Net Total</div>
              <div className="text-white font-extrabold text-xl">{fmtDisp(netTotal)}</div>
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
  const [commonDate, setCommonDate] = useState(todayISO());
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(false);

  useEffect(() => {
    if (open && students.length > 0) {
      setCommonMode('CASH'); setCommonDate(todayISO());
      setRows(students.map((s) => ({
        id: s.id, studentId: s.studentId, studentName: s.studentName,
        studentCode: s.studentCode, class: s.class, period: s.period,
        balanceDue: s.balance, feeStructureId: s.feeStructureId,
        collectAmount: s.balance, discount: 0,
        lateFine: s.status === 'OVERDUE' ? '' : null,
        daysLate: s.daysLate || 0, paymentMode: 'CASH', paymentDate: todayISO(),
      })));
    }
  }, [open, students]);

  const update     = (id, field, value) => setRows((p) => p.map((r) => r.id === id ? { ...r, [field]: value } : r));
  const applyToAll = () => setRows((p) => p.map((r) => ({ ...r, paymentMode: commonMode, paymentDate: commonDate })));
  const grandTotal = rows.reduce((s, r) => s + (parseFloat(r.collectAmount) || 0), 0);
  const modeOpts   = [{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'DD', label: 'DD' }];

  const handleSubmit = async () => {
    const bad = rows.find((r) => !r.collectAmount || parseFloat(r.collectAmount) <= 0);
    if (bad) { alert('Please fill in all collect amounts'); return; }
    try {
      setLoading(true);
      const response = await createBulkFeeCollection({
        payments: rows.map((r) => ({
          studentId: r.studentId, feeStructureId: r.feeStructureId,
          amountPaid: parseFloat(r.collectAmount), discount: parseFloat(r.discount) || 0,
          discountReason: null, lateFine: r.lateFine !== null && r.lateFine !== '' ? parseFloat(r.lateFine) : null,
          paymentMode: r.paymentMode, paymentDate: r.paymentDate, referenceNo: null, remarks: null,
        })),
      });
      onSuccess(response);
    } catch (e) { alert(e.message || 'Failed to process bulk payments.'); }
    finally { setLoading(false); }
  };

  return (
    <Modal open={open} onClose={onClose} title={`Bulk Fee Collection — ${students.length} Students`} wide
      footer={<><Btn variant="secondary" onClick={onClose}>Cancel</Btn><Btn variant="success" onClick={handleSubmit} disabled={loading}>{loading ? 'Processing…' : `Process ${rows.length} Payments & Generate Receipts`}</Btn></>}>
      <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5 mb-4 text-sm text-emerald-800">Payments will be recorded for all {students.length} selected students.</div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 mb-4 flex items-end gap-4">
        <div><label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Common Payment Mode</label><Sel value={commonMode} onChange={setCommonMode} options={modeOpts} className="w-32" /></div>
        <div><label className="block text-[11.5px] font-semibold text-gray-600 mb-1">Payment Date</label><Inp type="date" value={commonDate} onChange={(e) => setCommonDate(e.target.value)} className="w-40" /></div>
        <Btn variant="ghost" size="sm" onClick={applyToAll}>Apply to All Rows</Btn>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-200">{['Student', 'Class', 'Period', 'Balance Due', 'Collect Amount', 'Discount', 'Late Fine', 'Mode'].map((h) => <th key={h} className="px-3 py-2 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
             <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-3 py-2.5"><div className="font-semibold text-gray-900">{row.studentName}</div><div className="text-xs text-gray-500">{row.studentCode}</div></td>
                <td className="px-3 py-2.5"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{row.class}</span></td>
                <td className="px-3 py-2.5 text-xs text-gray-600">{row.period}</td>
                <td className="px-3 py-2.5">{row.daysLate > 0 ? <span className="text-red-700 text-xs font-bold">● {fmtDisp(row.balanceDue)} · {row.daysLate}d late</span> : <span className="font-semibold">{fmtDisp(row.balanceDue)}</span>}</td>
                <td className="px-3 py-2.5"><input type="number" value={row.collectAmount} onChange={(e) => update(row.id, 'collectAmount', e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]" /></td>
                <td className="px-3 py-2.5"><input type="number" value={row.discount} placeholder="0" onChange={(e) => update(row.id, 'discount', e.target.value)} className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:border-[#1A3A5C]" /></td>
                <td className="px-3 py-2.5">{row.lateFine !== null ? <input type="number" value={row.lateFine} placeholder="Fine" onChange={(e) => update(row.id, 'lateFine', e.target.value)} className="w-20 px-2 py-1 text-sm border border-amber-300 rounded bg-amber-50" /> : <span className="text-xs text-gray-400">N/A</span>}</td>
                <td className="px-3 py-2.5"><select value={row.paymentMode} onChange={(e) => update(row.id, 'paymentMode', e.target.value)} className="w-24 px-2 py-1 text-sm border border-gray-200 rounded">{modeOpts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-gray-900 rounded-lg px-4 py-3 mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-400">{rows.length} receipts will be generated automatically</div>
        <div className="text-white font-extrabold text-base">Grand Total: {fmtDisp(grandTotal)}</div>
      </div>
    </Modal>
  );
};

// ─── Receipt Modal ────────────────────────────────────────────────────────────


// ─── CollectionsHistory ───────────────────────────────────────────────────────
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
    const today       = new Date();
    const oneMonthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
    const f           = (d) => d.toISOString().split('T')[0];
    setFromDate(f(oneMonthAgo));
    setToDate(f(today));
  }, []);

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
      } finally {
        setOptionsLoading(false);
      }
    };
    loadOptions();
  }, [academicYearId]);

  const fetchOutstanding = async () => {
    try {
      setLoading(true); setError(null);
      const params = {};
      if (classF)  params.classId  = classF;
      if (periodF) params.periodId = periodF;
      const res = await getOutstandingFees(params);
      setOutstanding(
        (res.records || []).map((r, index) => {
          let status = 'PENDING';
          if ((r.paidAmount || 0) > 0 && r.balanceDue > 0) status = 'PARTIAL';
          if (r.balanceDue <= 0)                            status = 'PAID';
          if (r.overdueDays > 0 && r.balanceDue > 0)       status = 'OVERDUE';
          return {
            id: index + 1, studentId: r.studentId, studentName: r.studentName,
            studentCode: r.admissionNumber, class: r.className, section: r.sectionName,
            period: r.feePeriodName, feePeriodId: r.feePeriodId || r.periodId || r.fee_period_id,
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
  };

  const fetchHistory = async () => {
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
        studentCode: r.admissionNumber, class: `${r.className}${r.sectionName ? ' ' + r.sectionName : ''}`,
        period: r.feePeriodName, amount: r.amountPaid, discount: r.discount || 0,
        lateFine: r.lateFine || 0, mode: r.paymentMode, referenceNo: r.referenceNo,
        recordedBy: r.collectedBy, status: 'Completed',
      })));
      setTotalPages(res?.pagination?.totalPages || 1);
    } catch (e) {
      setError(e.message || 'Failed to load history');
      setHistory([]);
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (optionsLoading) return;
    if (tab === 'outstanding') fetchOutstanding();
    else if (fromDate && toDate) fetchHistory();
  }, [tab, fromDate, toDate, classF, periodF, modeF, page, optionsLoading]);

  if (!academicYearId || optionsLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-3">
        <div className="animate-spin w-6 h-6 border-2 border-[#1A3A5C] border-t-transparent rounded-full" />
        <div className="text-sm text-gray-500">{!academicYearId ? '⏳ Waiting for academic year…' : 'Loading fee periods and classes…'}</div>
      </div>
    );
  }

  const filteredOut  = outstanding.filter((s) => {
    const q = search.toLowerCase();
    return (!q || s.studentName.toLowerCase().includes(q) || (s.studentCode || '').toLowerCase().includes(q)) && (!statusF || s.status === statusF);
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
    const ids = filteredOut.map((s) => s.id);
    const allSel = ids.every((id) => selected.includes(id));
    if (allSel) setSelected((p) => p.filter((id) => !ids.includes(id)));
    else        setSelected((p) => [...new Set([...p, ...ids])]);
  };
  const selStudents = outstanding.filter((s) => selected.includes(s.id));
  const selTotal    = selStudents.reduce((a, s) => a + s.balance, 0);

  const handleCollectSuccess = (response, student) => {
    setCollectModal({ open: false, student: null });
    setReceiptModal({
      open: true,
      receipt: {
        receiptNo: response.receiptNo, date: response.paymentDate,
        studentName: student.studentName, studentCode: student.studentCode,
        class: student.class, period: student.period,
        components: response.components || [],
        amountPaid: response.amountPaid, discount: response.discount || 0,
        lateFine: response.lateFine || 0, paymentMode: response.paymentMode,
        referenceNo: response.referenceNo, balanceAfter: response.balanceAfter,
        recordedBy: response.recordedBy || 'Admin',
      },
    });
    fetchOutstanding(); setSelected([]);
  };

  const handleBulkSuccess = (responses) => {
    setBulkModal({ open: false, students: [] });
    alert(`Successfully processed ${Array.isArray(responses) ? responses.length : '?'} payments!`);
    fetchOutstanding(); setSelected([]);
  };

  const handleViewReceipt = async (item) => {
    try {
      const data = await getFeeReceiptById(item.id);
      setReceiptModal({ open: true, receipt: { receiptNo: data.receiptNo, date: data.paymentDate, studentName: data.studentName, studentCode: data.studentCode, class: data.className, period: data.periodName, components: data.components || [{ name: 'Fee Payment', amount: item.amount }], amountPaid: data.amountPaid, discount: data.discount || 0, lateFine: data.lateFine || 0, paymentMode: data.paymentMode, referenceNo: data.referenceNo, balanceAfter: data.balanceAfter, recordedBy: data.recordedBy } });
    } catch {
      setReceiptModal({ open: true, receipt: { receiptNo: item.receiptNo, date: item.date, studentName: item.studentName, studentCode: item.studentCode, class: item.class, period: item.period, components: [{ name: 'Fee Payment', amount: item.amount }], amountPaid: item.amount, discount: item.discount || 0, lateFine: item.lateFine || 0, paymentMode: item.mode, referenceNo: item.referenceNo, balanceAfter: 0, recordedBy: item.recordedBy } });
    }
  };

  const resetTab = () => { setSearch(''); setClassF(''); setPeriodF(''); setStatusF(''); setModeF(''); setPage(1); setSelected([]); setError(null); };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Collections &amp; History</h1>
          <p className="text-xs text-gray-500 mt-0.5">AY {academicYearLabel} · Collect fee payments and view complete transaction history</p>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" size="sm"><FileDown size={13} /> Export</Btn>
          <Btn variant="primary" size="sm" onClick={() => setCollectModal({ open: true, student: null })}>+ Collect Fee</Btn>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-start gap-3">
          <AlertCircle size={16} className="text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1 text-sm text-red-700">{error}</div>
          <button onClick={() => { setError(null); tab === 'outstanding' ? fetchOutstanding() : fetchHistory(); }} className="text-red-600 hover:text-red-800 font-semibold text-sm">Retry</button>
        </div>
      )}

      <div className="flex border-b border-gray-200">
        {[{ key: 'outstanding', label: 'Outstanding & Overdue', badge: overdueCount }, { key: 'history', label: 'Payment History', badge: 0 }].map((t) => (
          <button key={t.key} onClick={() => { setTab(t.key); resetTab(); }}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${tab === t.key ? 'text-[#1A3A5C] border-[#1A3A5C]' : 'text-gray-500 border-transparent hover:text-gray-700'}`}>
            {t.label}
            {t.badge > 0 && <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>}
          </button>
        ))}
      </div>

      {tab === 'outstanding' && (
        <>
          <div className="flex flex-wrap gap-2">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="🔍 Student name or ID..."
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all" />
            <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); setSelected([]); }} options={periodOptions} placeholder="All Periods" className="w-40" />
            <Sel value={classF}  onChange={(v) => { setClassF(v);  setPage(1); setSelected([]); }} options={classOptions}  placeholder="All Classes" className="w-36" />
            <Sel value={statusF} onChange={(v) => { setStatusF(v); setPage(1); }}
              options={[{ value: 'OVERDUE', label: 'Overdue' }, { value: 'PARTIAL', label: 'Partial' }, { value: 'UNPAID', label: 'Pending' }]}
              placeholder="All Status" className="w-36" />
          </div>

          {selected.length > 0 && (
            <div className="bg-[#1A3A5C] rounded-lg px-5 py-3 flex items-center justify-between shadow-md">
              <div className="flex items-center gap-6">
                <div className="text-white font-bold text-sm">{selected.length} student{selected.length !== 1 ? 's' : ''} selected</div>
                <div className="text-white/60 text-sm">Total: <span className="font-bold text-white">{fmtDisp(selTotal)}</span></div>
              </div>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={() => setSelected([])} className="!bg-white/10 hover:!bg-white/20 !border-white/30 !text-white">Clear</Btn>
                <Btn variant="success" size="sm" onClick={() => setBulkModal({ open: true, students: selStudents })}>Collect Selected ({selected.length})</Btn>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 w-8"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-[#1A3A5C]" checked={filteredOut.length > 0 && filteredOut.every((s) => selected.includes(s.id))} onChange={toggleAll} /></th>
                    {['Student', 'Class', 'Period', 'Total Fee', 'Paid', 'Balance Due', 'Due Date', 'Status', 'Action'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={10} className="text-center py-12"><div className="animate-spin w-7 h-7 border-2 border-[#1A3A5C] border-t-transparent rounded-full mx-auto mb-2" /><div className="text-sm text-gray-400">Loading...</div></td></tr>
                  ) : pagedOut.length === 0 ? (
                    <tr><td colSpan={10} className="text-center py-12 text-sm text-gray-400">No records found</td></tr>
                  ) : pagedOut.map((s) => {
                    const isSel = selected.includes(s.id);
                    return (
                      <tr key={s.id} className={`border-b border-gray-100 transition-colors ${isSel ? 'bg-blue-50 border-l-4 border-l-[#1A3A5C]' : 'hover:bg-gray-50'}`}>
                        <td className="px-3 py-3"><input type="checkbox" className="w-3.5 h-3.5 cursor-pointer accent-[#1A3A5C]" checked={isSel} onChange={() => toggleRow(s.id)} /></td>
                        <td className="px-3 py-3"><div className="flex items-center gap-2"><Av name={s.studentName} status={s.status} size="sm" /><div><div className="font-semibold text-gray-900 text-sm">{s.studentName}</div><div className="text-xs text-gray-500">{s.studentCode}</div></div></div></td>
                        <td className="px-3 py-3"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{s.class}</span></td>
                        <td className="px-3 py-3 text-xs text-gray-600">{s.period}</td>
                        <td className="px-3 py-3 text-sm">{fmtDisp(s.totalFee)}</td>
                        <td className={`px-3 py-3 text-sm font-semibold ${s.paidAmount > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>{fmtDisp(s.paidAmount)}</td>
                      <td className="px-3 py-3">
  <span className="font-semibold text-gray-900 text-sm">{fmtDisp(s.balance)}</span>
  {s.status === 'OVERDUE' && (
    <div className="text-[11px] text-gray-500 mt-0.5">{s.daysLate}d overdue</div>
  )}
</td>
                       <td className="px-3 py-3 text-xs text-gray-600">
  {fmtDate(s.dueDate)}
</td>
                        <td className="px-3 py-3"><Badge status={s.status} /></td>
                        <td className="px-3 py-3"><Btn variant="primary" size="xs" onClick={() => setCollectModal({ open: true, student: s })}>Collect</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200">
              <span className="text-xs text-gray-500">Showing {filteredOut.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredOut.length)} of {filteredOut.length} records</span>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Btn>
                <Btn variant="primary"   size="sm" onClick={() => setPage((p) => Math.min(totalOutPages, p + 1))} disabled={page >= totalOutPages}>Next →</Btn>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'history' && (
        <>
          <div className="flex flex-wrap gap-2">
            <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="🔍 Receipt no. or student..."
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#1A3A5C]/10 focus:border-[#1A3A5C] transition-all" />
            <Inp type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1); }} className="w-40" />
            <Inp type="date" value={toDate}   onChange={(e) => { setToDate(e.target.value);   setPage(1); }} className="w-40" />
            <Sel value={periodF} onChange={(v) => { setPeriodF(v); setPage(1); }} options={periodOptions} placeholder="All Periods" className="w-40" />
            <Sel value={classF}  onChange={(v) => { setClassF(v);  setPage(1); }} options={classOptions}  placeholder="All Classes"  className="w-32" />
            <Sel value={modeF}   onChange={(v) => { setModeF(v);   setPage(1); }}
              options={[{ value: 'CASH', label: 'Cash' }, { value: 'ONLINE', label: 'Online' }, { value: 'CHEQUE', label: 'Cheque' }, { value: 'DD', label: 'DD' }]}
              placeholder="All Modes" className="w-32" />
          </div>
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    {['Receipt No.', 'Date', 'Student', 'Class', 'Period', 'Collected', 'Discount', 'Late Fine', 'Mode', 'Ref. No.', 'Recorded By', ''].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left text-[10.5px] font-bold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={12} className="text-center py-12"><div className="animate-spin w-7 h-7 border-2 border-[#1A3A5C] border-t-transparent rounded-full mx-auto mb-2" /><div className="text-sm text-gray-400">Loading history...</div></td></tr>
                  ) : filteredHist.length === 0 ? (
                    <tr><td colSpan={12} className="text-center py-12 text-sm text-gray-400">No payment records found</td></tr>
                  ) : filteredHist.map((h) => (
                    <tr key={h.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="px-3 py-3"><span className="text-[#1A3A5C] font-bold text-xs">{h.receiptNo}</span></td>
                      <td className="px-3 py-3 text-xs text-gray-600">{fmtDate(h.date)}</td>
                      <td className="px-3 py-3"><div className="font-semibold text-gray-900 text-sm">{h.studentName}</div><div className="text-xs text-gray-400">{h.studentCode}</div></td>
                      <td className="px-3 py-3"><span className="px-2 py-0.5 bg-[#EEF4FF] text-[#1A3A5C] text-xs font-semibold rounded">{h.class}</span></td>
                      <td className="px-3 py-3 text-xs text-gray-600">{h.period}</td>
                      <td className="px-3 py-3 font-bold text-emerald-600">{fmtDisp(h.amount)}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.discount  > 0 ? fmtDisp(h.discount)  : '—'}</td>
                      <td className="px-3 py-3 text-xs text-amber-700">{h.lateFine > 0 ? fmtDisp(h.lateFine) : '—'}</td>
                      <td className="px-3 py-3"><Badge status={h.mode} /></td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.referenceNo || '—'}</td>
                      <td className="px-3 py-3 text-xs text-gray-500">{h.recordedBy  || '—'}</td>
                      <td className="px-3 py-3"><Btn variant="ghost" size="xs" onClick={() => handleViewReceipt(h)}>Receipt</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-t border-gray-200">
              <span className="text-xs text-gray-500">Showing {filteredHist.length} transactions</span>
              <div className="flex gap-2">
                <Btn variant="secondary" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>← Prev</Btn>
                <Btn variant="primary"   size="sm" onClick={() => setPage((p) => p + 1)} disabled={filteredHist.length < PAGE_SIZE}>Next →</Btn>
              </div>
            </div>
          </div>
        </>
      )}

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