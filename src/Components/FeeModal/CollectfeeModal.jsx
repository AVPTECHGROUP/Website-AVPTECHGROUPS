import React, { useState, useEffect } from 'react';
import Modal from '../../Components/FeeModal/Modal';
import Input from '../../Components/FeeModal/Input';
import Select from '../../Components/FeeModal/Select';
import Button from '../../Components/FeeModal/Button';
import { formatCurrency } from '../../Components/FeeModal/helper';

const CollectFeeModal = ({ isOpen, onClose, student, onSubmit }) => {
  const [formData, setFormData] = useState({
    amountPaid: '',
    discount: '0',
    discountReason: '',
    lateFine: '0',
    paymentMode: 'Cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    remarks: '',
  });
  
  useEffect(() => {
    if (student) {
      setFormData(prev => ({
        ...prev,
        amountPaid: student.balance.toString(),
      }));
    }
  }, [student]);
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const calculateTotal = () => {
    const amount = parseFloat(formData.amountPaid) || 0;
    const discount = parseFloat(formData.discount) || 0;
    const lateFine = parseFloat(formData.lateFine) || 0;
    return amount - discount + lateFine;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, student });
    onClose();
  };
  
  if (!student) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Collect Fee Payment" size="lg">
      <form onSubmit={handleSubmit}>
        <Modal.Body>
          {/* Student Info */}
          <div className="mb-6 p-4 bg-navy-light rounded-lg border border-[#C7D7EE]">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Student:</span>
                <span className="ml-2 font-semibold">{student.studentName}</span>
              </div>
              <div>
                <span className="text-gray-500">Class:</span>
                <span className="ml-2 font-semibold">{student.class}</span>
              </div>
              <div>
                <span className="text-gray-500">Total Fee:</span>
                <span className="ml-2 font-semibold">{formatCurrency(student.totalFee)}</span>
              </div>
              <div>
                <span className="text-gray-500">Balance:</span>
                <span className="ml-2 font-semibold text-danger">{formatCurrency(student.balance)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Form */}
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Amount Paid"
              type="number"
              value={formData.amountPaid}
              onChange={(val) => handleChange('amountPaid', val)}
              required
              placeholder="Enter amount"
            />
            
            <Input
              label="Payment Date"
              type="date"
              value={formData.paymentDate}
              onChange={(val) => handleChange('paymentDate', val)}
              required
            />
            
            <Input
              label="Discount"
              type="number"
              value={formData.discount}
              onChange={(val) => handleChange('discount', val)}
              placeholder="0"
            />
            
            <Input
              label="Late Fine"
              type="number"
              value={formData.lateFine}
              onChange={(val) => handleChange('lateFine', val)}
              placeholder="0"
            />
            
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Payment Mode <span className="text-danger ml-0.5">*</span>
              </label>
              <Select
                value={formData.paymentMode}
                onChange={(val) => handleChange('paymentMode', val)}
                options={[
                  { value: 'Cash', label: 'Cash' },
                  { value: 'Online', label: 'Online' },
                  { value: 'Cheque', label: 'Cheque' },
                  { value: 'Card', label: 'Card' },
                ]}
              />
            </div>
            
            <Input
              label="Reference No."
              type="text"
              value={formData.referenceNo}
              onChange={(val) => handleChange('referenceNo', val)}
              placeholder="Optional"
            />
            
            {formData.discount > 0 && (
              <div className="col-span-2">
                <Input
                  label="Discount Reason"
                  type="text"
                  value={formData.discountReason}
                  onChange={(val) => handleChange('discountReason', val)}
                  placeholder="Reason for discount"
                  required
                />
              </div>
            )}
            
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Remarks
              </label>
              <textarea
                value={formData.remarks}
                onChange={(e) => handleChange('remarks', e.target.value)}
                placeholder="Additional notes (optional)"
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-navy/20 focus:border-navy transition-all resize-none"
              />
            </div>
          </div>
          
          {/* Total Summary */}
          <div className="mt-6 p-4 bg-gray-900 rounded-lg">
            <div className="flex justify-between items-center text-white">
              <span className="text-sm opacity-70">Total Amount to Collect</span>
              <span className="text-xl font-extrabold">{formatCurrency(calculateTotal())}</span>
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose} type="button">
            Cancel
          </Button>
          <Button variant="success" type="submit">
            Process Payment & Generate Receipt
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
};

export default CollectFeeModal;