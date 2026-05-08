import React, { useState, useEffect } from 'react';
import Button from './Button';
import { X } from 'lucide-react';
import { formatCurrency } from './helper';

const BulkCollectModal = ({ isOpen, onClose, students, onSubmit }) => {
  const [commonPaymentMode, setCommonPaymentMode] = useState('Cash');
  const [commonPaymentDate, setCommonPaymentDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    if (isOpen && students.length > 0) {
      // Initialize payment data
      const initialPayments = students.map((student) => ({
        id: student.id,
        studentId: student.studentId,
        studentName: student.studentName,
        studentCode: student.studentCode,
        class: student.class,
        period: student.period,
        balanceDue: student.balance,
        feeStructureId: student.feeStructureId,
        collectAmount: student.balance,
        discount: 0,
        discountReason: '',
        lateFine: student.status === 'OVERDUE' ? '' : null,
        daysLate: student.daysLate,
        paymentMode: 'Cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNo: '',
        remarks: ''
      }));
      setPayments(initialPayments);
    }
  }, [isOpen, students]);

  const updatePayment = (id, field, value) => {
    setPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p))
    );
  };

  const applyToAll = () => {
    setPayments((prev) =>
      prev.map((p) => ({
        ...p,
        paymentMode: commonPaymentMode,
        paymentDate: commonPaymentDate
      }))
    );
  };

  const handleSubmit = () => {
    // Validate
    const isValid = payments.every(
      (p) => p.collectAmount > 0 && p.paymentMode && p.paymentDate
    );
    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }

    const bulkData = {
      payments: payments.map((p) => ({
        studentId: p.studentId,
        feeStructureId: p.feeStructureId,
        amountPaid: parseFloat(p.collectAmount),
        discount: parseFloat(p.discount) || 0,
        discountReason: p.discountReason || null,
        lateFine: p.lateFine ? parseFloat(p.lateFine) : null,
        paymentMode: p.paymentMode,
        paymentDate: p.paymentDate,
        referenceNo: p.referenceNo || null,
        remarks: p.remarks || null
      }))
    };

    onSubmit(bulkData);
  };

  const grandTotal = payments.reduce(
    (sum, p) => sum + parseFloat(p.collectAmount || 0),
    0
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
              Bulk Fee Collection — {students.length} Students
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Info banner */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg px-4 py-3 mb-4">
            <p className="text-sm text-teal-800">
              Payments will be recorded for all {students.length} selected
              students. Adjust amounts, discounts and late fines per row as
              needed.
            </p>
          </div>

          {/* Common controls */}
          <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Common Payment Mode
                </label>
                <select
                  value={commonPaymentMode}
                  onChange={(e) => setCommonPaymentMode(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all bg-white"
                >
                  <option>Cash</option>
                  <option>Online</option>
                  <option>Cheque</option>
                  <option>DD</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Payment Date
                </label>
                <input
                  type="date"
                  value={commonPaymentDate}
                  onChange={(e) => setCommonPaymentDate(e.target.value)}
                  className="px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all bg-white"
                />
              </div>
              <div className="flex items-end">
                <Button variant="primary" size="sm" onClick={applyToAll}>
                  Apply to All Rows
                </Button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Class
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Balance Due
                  </th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Collect Amount
                  </th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Late Fine
                  </th>
                  <th className="px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Mode
                  </th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr
                    key={payment.id}
                    className={`border-b border-gray-100 ${
                      payment.daysLate > 0 ? 'bg-red-50' : ''
                    }`}
                  >
                    <td className="px-3 py-3">
                      <div className="font-semibold text-gray-900">
                        {payment.studentName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {payment.studentCode}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="px-2 py-0.5 bg-navy-light text-navy text-xs font-semibold rounded">
                        {payment.class}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-xs text-gray-600">
                      {payment.period}
                    </td>
                    <td className="px-3 py-3 text-right">
                      {payment.daysLate > 0 ? (
                        <span className="text-danger text-xs font-bold">
                          ● {formatCurrency(payment.balanceDue)} · {payment.daysLate}d late
                        </span>
                      ) : (
                        <span className="font-semibold">
                          {formatCurrency(payment.balanceDue)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        value={payment.collectAmount}
                        onChange={(e) =>
                          updatePayment(payment.id, 'collectAmount', e.target.value)
                        }
                        className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        value={payment.discount}
                        onChange={(e) =>
                          updatePayment(payment.id, 'discount', e.target.value)
                        }
                        placeholder="0"
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                      />
                    </td>
                    <td className="px-3 py-3">
                      {payment.daysLate > 0 ? (
                        <input
                          type="number"
                          value={payment.lateFine}
                          onChange={(e) =>
                            updatePayment(payment.id, 'lateFine', e.target.value)
                          }
                          placeholder="Fine"
                          className="w-20 px-2 py-1 text-sm border border-yellow-300 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400/20 focus:border-yellow-400 bg-yellow-50"
                        />
                      ) : (
                        <span className="text-xs text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={payment.paymentMode}
                        onChange={(e) =>
                          updatePayment(payment.id, 'paymentMode', e.target.value)
                        }
                        className="w-24 px-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy"
                      >
                        <option>Cash</option>
                        <option>Online</option>
                        <option>Cheque</option>
                        <option>DD</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Grand total bar */}
          <div className="bg-gray-900 rounded-lg px-4 py-3 mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-400">
              {payments.length} receipts will be generated automatically
            </div>
            <div className="text-white font-extrabold text-lg">
              Grand Total: {formatCurrency(grandTotal)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="success" size="md" onClick={handleSubmit}>
            Process {payments.length} Payments & Generate Receipts
          </Button>
        </div>

        {/* API Reference */}
        <div className="px-6 py-3 bg-slate-900 text-white text-xs font-mono">
          <div className="font-bold text-blue-300 mb-1">
            📡 BULK COLLECT API
          </div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-green-600 px-2 py-0.5 rounded font-bold text-[10px]">
              POST
            </span>
            <span className="text-blue-200">/v1/fee/collections/bulk</span>
            <span className="bg-purple-600 px-2 py-0.5 rounded text-[9px]">
              FEE_COLLECT
            </span>
          </div>
          <div className="text-gray-400 text-[11px]">
            ↳ Body: &#123; payments: [&#123; studentId, feeStructureId, amountPaid, discount,
            discountReason, lateFine, paymentMode, paymentDate, referenceNo, remarks
            &#125;, ...] &#125;
          </div>
          <div className="text-gray-400 text-[11px]">
            ↳ Returns a list of <span className="text-green-300">FeePaymentResponseDto</span> —
            one per student; each has its own <span className="text-green-300">receiptNo</span>
          </div>
          <div className="text-yellow-300 text-[11px] mt-1">
            💡 "Apply to All Rows" sets the same paymentMode + paymentDate across all entries
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkCollectModal;