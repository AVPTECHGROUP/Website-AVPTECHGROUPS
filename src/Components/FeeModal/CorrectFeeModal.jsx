// CollectfeeModal.jsx — Collect Fee modal
// - Pre-fills student data from overdue record passed via `student` prop
// - On submit: calls createFeeCollection API, returns receipt data via onSubmit
// - Shows toast on success/error

import React, { useEffect, useRef, useState } from 'react';
import { createFeeCollection } from '../../Api/FeeCollectionApi';
import { getOutstandingFees } from '../../Api/FeeCollectionApi';
import { useToast } from '../Toast/Toast';

const PAYMENT_MODES = [
  { value: 'CASH', label: 'Cash', icon: '💵' },
  { value: 'ONLINE', label: 'Online', icon: '📲' },
  { value: 'CHEQUE', label: 'Cheque', icon: '🏦' },
  { value: 'DD', label: 'D.D.', icon: '📄' },
];

const fmtINR = (n) => n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`;
const today = () => new Date().toISOString().split('T')[0];
const SEARCH_DEBOUNCE_MS = 300;

const CollectFeeModal = ({ isOpen, onClose, student: initialStudent, onSubmit }) => {
  const { show: toast } = useToast();

  // ── State ──────────────────────────────────────────────────────────────────
  const [student, setStudent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const [amountPaid, setAmountPaid] = useState('');
  const [discount, setDiscount] = useState('');
  const [discountNote, setDiscountNote] = useState('');
  const [lateFine, setLateFine] = useState('');
  const [paymentMode, setPaymentMode] = useState('CASH');
  const [paymentDate, setPaymentDate] = useState(today());
  const [referenceNo, setReferenceNo] = useState('');
  const [remarks, setRemarks] = useState('');

  const [submitting, setSubmitting] = useState(false);

  // Debounce + race-condition guards for search
  const debounceRef = useRef(null);
  const searchSeqRef = useRef(0);

  // ── Pre-fill when student prop changes ────────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    if (initialStudent) {
      setStudent(initialStudent);
      setAmountPaid(String(initialStudent.balance || ''));
      setLateFine(String(initialStudent.lateFine || ''));
    } else {
      setStudent(null);
      setSearchQuery('');
      setSearchResults([]);
    }
    // Reset form fields
    setDiscount('');
    setDiscountNote('');
    setPaymentMode('CASH');
    setPaymentDate(today());
    setReferenceNo('');
    setRemarks('');
  }, [isOpen, initialStudent]);

  // Clear any pending debounce timer when modal closes/unmounts
  useEffect(() => {
    if (!isOpen && debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [isOpen]);

  // ── Student search (debounced, race-safe) ──────────────────────────────────
  const runSearch = async (q) => {
    const mySeq = ++searchSeqRef.current;
    setSearching(true);
    try {
      // Outstanding fees endpoint returns all — client-side filter by name/code
      const res = await getOutstandingFees({});
      // Ignore this result if a newer search has started since this one fired
      if (mySeq !== searchSeqRef.current) return;

      const records = res?.records || res?.data?.content || res?.content || [];
      const qLow = q.toLowerCase();
      const filtered = records.filter((r) => {
        const name = (r.studentName || '').toLowerCase();
        const code = (r.studentCode || '').toLowerCase();
        return name.includes(qLow) || code.includes(qLow);
      }).slice(0, 8);

      setSearchResults(filtered);
    } catch (err) {
      if (mySeq === searchSeqRef.current) {
        toast('Search failed: ' + err.message, 'error');
      }
    } finally {
      if (mySeq === searchSeqRef.current) setSearching(false);
    }
  };

  const handleSearch = (q) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (q.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      // Bump sequence so any in-flight search response gets ignored
      searchSeqRef.current++;
      return;
    }

    debounceRef.current = setTimeout(() => runSearch(q), SEARCH_DEBOUNCE_MS);
  };

  const selectStudent = (s) => {
    setStudent(s);
    setAmountPaid(String(s.balance || ''));
    setLateFine(String(s.lateFine || ''));
    setSearchResults([]);
    setSearchQuery('');
    searchSeqRef.current++; // invalidate any pending search
  };

  // ── Derived values ─────────────────────────────────────────────────────────
  const totalDue = student?.balance || 0;
  const totalFee = student?.totalFee || 0;
  const paid = parseFloat(amountPaid) || 0;
  const discountVal = parseFloat(discount) || 0;
  const lateFineVal = parseFloat(lateFine) || 0;

  // Total amount the student actually owes for this period, after discount, plus any late fine
  const totalObligation = Math.max(0, totalDue - discountVal + lateFineVal);
  // What remains after this payment is applied
  const balanceAfter = Math.max(0, totalObligation - paid);

  // ── Validate ───────────────────────────────────────────────────────────────
  const validate = () => {
    if (!student) { toast('Please select a student', 'warning'); return false; }
    if (!paid || paid <= 0) { toast('Enter a valid amount', 'warning'); return false; }
    if (paid > totalObligation + 0.01) {
      toast(`Amount cannot exceed balance ₹${totalObligation.toLocaleString('en-IN')}`, 'warning');
      return false;
    }
    if (!paymentDate) { toast('Select a payment date', 'warning'); return false; }
    if ((paymentMode === 'ONLINE' || paymentMode === 'CHEQUE' || paymentMode === 'DD') && !referenceNo.trim()) {
      toast('Reference number is required for this payment mode', 'warning');
      return false;
    }
    return true;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      studentId: student.studentId || student.id,
      feeStructureId: student.feeStructureId,
      amountPaid: paid,
      discount: discountVal || 0,
      discountReason: discountNote || '',
      lateFine: lateFineVal || 0,
      paymentMode,
      paymentDate,
      referenceNo: referenceNo || '',
      remarks: remarks || '',
    };

    try {
      const res = await createFeeCollection(payload);
      // Defensive: handle both { data: {...} } and unwrapped {...} response shapes
      const data = res?.data || res || {};

      toast(`Fee collected successfully! Receipt: ${data.receiptNo || ''}`, 'success');
      // Pass receipt data up to parent for ReceiptModal
      onSubmit?.({
        receiptNo: data.receiptNo,
        paymentDate,
        studentName: student.studentName,
        studentCode: student.studentCode,
        class: student.className || student.class,
        period: student.periodName || student.period,
        components: data.components || student.components || [],
        amountPaid: paid,
        discount: discountVal,
        lateFine: lateFineVal,
        paymentMode,
        balanceAfter: data.balanceAfter ?? balanceAfter,
        referenceNo: referenceNo || '',
        recordedBy: data.recordedBy || '',
      });
    } catch (err) {
      toast(`Payment failed: ${err.message}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)', padding: '40px 20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[680px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-extrabold tracking-tight">Collect Fee</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-base transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[74vh] overflow-y-auto space-y-5">

          {/* Student Selection */}
          {!student ? (
            <div>
              <label className="block text-[11.5px] font-semibold text-gray-600 mb-1.5">Search Student</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Type student name or admission number..."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                />
                {searching && (
                  <div className="absolute right-3 top-2.5">
                    <div className="w-4 h-4 border-2 border-[#1A3A5C] border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
              {searchResults.length > 0 && (
                <div className="mt-1 border border-gray-200 rounded-lg overflow-hidden shadow-sm">
                  {searchResults.map((r, i) => (
                    <button
                      key={r.studentId || i}
                      onClick={() => selectStudent(r)}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left border-b border-gray-100 last:border-0 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#1A3A5C] text-white text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                        {(r.studentName || '?').slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-[13px]">{r.studentName}</div>
                        <div className="text-[11px] text-gray-500">{r.studentCode} · {r.className}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[13px] font-bold text-red-600">{fmtINR(r.balance)}</div>
                        <div className="text-[10px] text-gray-400">balance</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Student card */
            <div className="bg-[#EEF4FF] border border-[#C7D7EE] rounded-xl p-3 flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#1A3A5C] text-white text-[14px] font-bold flex items-center justify-center flex-shrink-0">
                {(student.studentName || '?').slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-bold text-[14px] text-gray-900">{student.studentName}</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {student.studentCode} · {student.className} · {student.periodName || student.period}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[13px] font-bold text-amber-700">Balance: {fmtINR(student.balance)}</div>
                <div className="text-[11px] text-gray-500">Total: {fmtINR(student.totalFee)}</div>
              </div>
              <button
                onClick={() => { setStudent(null); setAmountPaid(''); }}
                className="text-[11px] text-gray-400 hover:text-gray-600 ml-1"
              >
                Change
              </button>
            </div>
          )}

          {/* Payment form — shown only when student is selected */}
          {student && (
            <>
              {/* Amount + Discount + Late Fine */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">Amount Paid *</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="₹0"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">Discount</label>
                  <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="₹0"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">Late Fine</label>
                  <input
                    type="number"
                    value={lateFine}
                    onChange={(e) => setLateFine(e.target.value)}
                    placeholder="₹0"
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
              </div>

              {/* Discount reason */}
              {discountVal > 0 && (
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">Discount Reason</label>
                  <input
                    type="text"
                    value={discountNote}
                    onChange={(e) => setDiscountNote(e.target.value)}
                    placeholder="e.g. Scholarship, sibling discount..."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
              )}

              {/* Payment Mode */}
              <div>
                <label className="text-[11.5px] font-semibold text-gray-600 mb-2 block">Payment Mode</label>
                <div className="flex gap-2">
                  {PAYMENT_MODES.map(m => (
                    <button
                      key={m.value}
                      onClick={() => setPaymentMode(m.value)}
                      className={`flex-1 flex flex-col items-center gap-1 border rounded-lg py-2.5 transition-all text-[10.5px] font-bold ${paymentMode === m.value
                          ? 'border-[#1A3A5C] bg-[#EEF4FF] text-[#1A3A5C]'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                        }`}
                    >
                      <span className="text-[18px]">{m.icon}</span>
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date + Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">Payment Date *</label>
                  <input
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    max={today()}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11.5px] font-semibold text-gray-600">
                    Reference No{paymentMode !== 'CASH' ? ' *' : ''}
                  </label>
                  <input
                    type="text"
                    value={referenceNo}
                    onChange={(e) => setReferenceNo(e.target.value)}
                    placeholder="Txn / cheque no."
                    className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                  />
                </div>
              </div>

              {/* Remarks */}
              <div className="flex flex-col gap-1">
                <label className="text-[11.5px] font-semibold text-gray-600">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Optional note..."
                  className="border border-gray-200 rounded-lg px-3 py-2 text-[13px] outline-none focus:border-[#1A3A5C] focus:ring-2 focus:ring-[#1A3A5C]/10"
                />
              </div>

              {/* Summary bar */}
              <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
                <div className="text-[12px] text-gray-400">
                  Balance after: <span className={balanceAfter > 0 ? 'text-amber-300 font-bold' : 'text-green-400 font-bold'}>
                    {fmtINR(balanceAfter)}
                  </span>
                </div>
                <div className="text-white font-extrabold text-[15px]">
                  Net Payable: {fmtINR(totalObligation)}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12.5px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || !student}
            className={`px-5 py-2 text-[12.5px] font-semibold text-white rounded-lg transition-colors flex items-center gap-2 ${submitting || !student
                ? 'bg-green-300 cursor-not-allowed'
                : 'bg-green-700 hover:bg-green-800'
              }`}
          >
            {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
            {submitting ? 'Processing...' : 'Collect & Generate Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollectFeeModal;