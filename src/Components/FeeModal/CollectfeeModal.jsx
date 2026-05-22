import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X, Calendar } from 'lucide-react';
import { formatCurrency } from './helper';

const CollectFeeModal = ({ isOpen, onClose, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    amountPaid: '',
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    discount: '',
    discountReason: '',
    lateFine: '',
    remarks: ''
  });

  const [feeBreakdown, setFeeBreakdown] = useState([]);
  const [showLateFine, setShowLateFine] = useState(false);

  useEffect(() => {
    if (isOpen && student) {
      // Initialize form data
      setFormData({
        amountPaid: student.balance.toString(),
        paymentMode: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNo: '',
        discount: '',
        discountReason: '',
        lateFine: '',
        remarks: ''
      });

      // Mock fee breakdown (in real app, fetch from API)
      setFeeBreakdown([
        { name: 'Tuition Fee', amount: Math.floor(student.balance * 0.67) },
        { name: 'Transport Fee', amount: Math.floor(student.balance * 0.2) },
        { name: 'Lab Fee', amount: Math.floor(student.balance * 0.1) },
        { name: 'Misc', amount: student.balance - Math.floor(student.balance * 0.97) }
      ]);

      // Check if overdue
      setShowLateFine(student.status === 'OVERDUE');
    }
  }, [isOpen, student]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleModeSelect = (mode) => {
    setFormData((prev) => ({ ...prev, paymentMode: mode }));
  };

  const handleFullPayment = () => {
    setFormData((prev) => ({
      ...prev,
      amountPaid: student.balance.toString()
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation
    if (!formData.amountPaid || parseFloat(formData.amountPaid) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!formData.paymentDate) {
      alert('Please select a payment date');
      return;
    }

    onSubmit({
      ...formData,
      student
    });
  };

  const netTotal =
    parseFloat(formData.amountPaid || 0) +
    parseFloat(formData.lateFine || 0) -
    parseFloat(formData.discount || 0);

  const balanceAfter = student
    ? student.balance - parseFloat(formData.amountPaid || 0)
    : 0;

  if (!isOpen || !student) return null;

  const inputClass =
    'w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
            Collect Fee Payment
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-5 grid grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Student Info */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Search Student *
                </label>
                <input
                  type="text"
                  value={student.studentName}
                  disabled
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              {/* Student Card */}
              <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {student.studentName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-gray-900">
                      {student.studentName}
                    </div>
                    <div className="text-sm text-gray-600">
                      {student.studentCode} · Class {student.class}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Parent: {student.parentName || 'Suresh Mehta'} · {student.parentPhone || '98765-43210'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Fee Period */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Fee Period *
                </label>
                <select
                  className={inputClass}
                  disabled
                  value={student.period}
                >
                  <option>{student.period} — Balance: {formatCurrency(student.balance)} {student.status === 'OVERDUE' && '(Overdue)'}</option>
                </select>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">
                  FEE BREAKDOWN — {student.period}
                </div>
                <div className="space-y-2">
                  {feeBreakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </span>
                    </div>
                  ))}
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between items-center font-bold">
                    <span>Total Due</span>
                    <span className="text-lg">{formatCurrency(student.balance)}</span>
                  </div>
                </div>

                {/* Already Paid / Balance */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="bg-green-50 border border-green-200 rounded px-3 py-2 text-center">
                    <div className="text-[10px] font-bold text-green-700 uppercase tracking-wide">
                      Already Paid
                    </div>
                    <div className="text-lg font-extrabold text-green-600">
                      {formatCurrency(student.paidAmount || 0)}
                    </div>
                  </div>
                  <div className="bg-red-50 border border-red-200 rounded px-3 py-2 text-center">
                    <div className="text-[10px] font-bold text-red-700 uppercase tracking-wide">
                      Balance
                    </div>
                    <div className="text-lg font-extrabold text-red-600">
                      {formatCurrency(student.balance)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Amount to Collect */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Amount to Collect *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => handleChange('amountPaid', e.target.value)}
                    className={inputClass}
                    required
                    min="0"
                    step="0.01"
                  />
                  <button
                    type="button"
                    onClick={handleFullPayment}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-navy hover:text-navy-dark px-2 py-1 rounded bg-navy-light hover:bg-blue-100 transition-colors"
                  >
                    Full {formatCurrency(student.balance)}
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Balance due: {formatCurrency(student.balance)}
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Payment Mode *
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['Cash', 'Online', 'Cheque', 'DD'].map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => handleModeSelect(mode)}
                      className={`flex flex-col items-center justify-center gap-2 px-3 py-3 rounded-lg border-2 transition-all ${
                        formData.paymentMode === mode
                          ? 'border-navy bg-navy-light text-navy'
                          : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl">
                        {mode === 'Cash' && '💵'}
                        {mode === 'Online' && '🌐'}
                        {mode === 'Cheque' && '📝'}
                        {mode === 'DD' && '🏦'}
                      </div>
                      <div className="text-xs font-semibold">{mode}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Date & Reference */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Payment Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => handleChange('paymentDate', e.target.value)}
                      className={inputClass}
                      required
                    />
                    <Calendar
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                      size={16}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-2">
                    Reference No.
                  </label>
                  <input
                    type="text"
                    value={formData.referenceNo}
                    onChange={(e) => handleChange('referenceNo', e.target.value)}
                    placeholder="TXN / Cheque no."
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Discount */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Discount (optional)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) => handleChange('discount', e.target.value)}
                  placeholder="Discount amount e.g. 500"
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
                <textarea
                  value={formData.discountReason}
                  onChange={(e) => handleChange('discountReason', e.target.value)}
                  placeholder="Reason e.g. Sibling discount, scholarship..."
                  className={`${inputClass} mt-2`}
                  rows={2}
                />
              </div>

              {/* Late Fine */}
              {showLateFine && (
                <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-yellow-600">⚠️</span>
                    <div className="flex-1">
                      <div className="text-sm font-bold text-yellow-800">
                        Past Due Date — Add Late Fine?
                      </div>
                      <div className="text-xs text-yellow-700 mt-0.5">
                        Due was {student.dueDate || 'Apr 30, 2026'} · {student.daysLate} day
                        {student.daysLate !== 1 ? 's' : ''} overdue
                      </div>
                    </div>
                  </div>
                  <label className="block text-xs font-bold text-yellow-800 mb-1">
                    Late Fine Amount (₹)
                  </label>
                  <input
                    type="number"
                    value={formData.lateFine}
                    onChange={(e) => handleChange('lateFine', e.target.value)}
                    placeholder="Enter manually e.g. 100 — leave blank to waive"
                    className="w-full px-3 py-2 text-sm border border-yellow-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 transition-all bg-white"
                    min="0"
                    step="0.01"
                  />
                </div>
              )}

              {/* Remarks */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => handleChange('remarks', e.target.value)}
                  placeholder="Optional note..."
                  className={inputClass}
                  rows={2}
                />
              </div>

              {/* Receipt Preview */}
              <div className="bg-gray-900 rounded-lg px-4 py-3 flex justify-between items-center">
                <div className="text-xs text-gray-400 uppercase tracking-wide">
                  Receipt No.
                  <div className="text-white font-bold text-sm mt-0.5">
                    RC-2026-00897
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 uppercase tracking-wide">
                    Net Total
                  </div>
                  <div className="text-white font-extrabold text-xl">
                    {formatCurrency(netTotal)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="success" size="md">
              ✓ Record & Generate Receipt
            </Button>
          </div>

          {/* API Reference */}
          <div className="px-6 py-3 bg-slate-900 text-white text-xs font-mono">
            <div className="font-bold text-blue-300 mb-1">
              📡 COLLECT FEE (SINGLE) APIS
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-600 px-2 py-0.5 rounded font-bold text-[10px]">
                GET
              </span>
              <span className="text-blue-200">
                /v1/fee/collections/outstanding?classId=&#123;id&#125;&periodId=&#123;id&#125;
              </span>
              <span className="bg-purple-600 px-2 py-0.5 rounded text-[9px]">
                FEE_REPORT_VIEW
              </span>
            </div>
            <div className="text-gray-400 text-[11px] mb-2">
              ↳ Pre-fill student's outstanding balance when period is selected in the modal
            </div>

            <div className="flex items-center gap-2 mb-1">
              <span className="bg-green-600 px-2 py-0.5 rounded font-bold text-[10px]">
                POST
              </span>
              <span className="text-blue-200">/v1/fee/collections</span>
              <span className="bg-purple-600 px-2 py-0.5 rounded text-[9px]">
                FEE_COLLECT
              </span>
            </div>
            <div className="text-gray-400 text-[11px] mb-1">
              ↳ Record & Generate Receipt — body: &#123; studentId, feeStructureId, amountPaid,
              discount, discountReason, lateFine, paymentMode, paymentDate, referenceNo, remarks &#125;
            </div>
            <div className="text-gray-400 text-[11px] mb-1">
              ↳ <span className="text-blue-200">paymentMode</span>: CASH | ONLINE | CHEQUE | DD
            </div>
            <div className="text-gray-400 text-[11px]">
              ↳ Response includes <span className="text-green-300">receiptNo</span>,{' '}
              <span className="text-green-300">balanceAfter</span> — display in receipt modal
            </div>
            <div className="text-yellow-300 text-[11px] mt-1">
              💡 <span className="text-yellow-200">lateFine</span> is optional — leave null to
              waive even when overdue
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CollectFeeModal;