import React from 'react';
import Modal from '../../Components/FeeModal/Modal';
import Button from '../../Components/FeeModal/Button';
import Badge from '../../Components/FeeModal/Badge';
import { formatCurrency, formatDate } from '../../Components/FeeModal/helper';
import { feeComponents } from '../../Components/FeeModal/mockData';

const ViewDetailsModal = ({ isOpen, onClose, student }) => {
  if (!student) return null;
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fee Details" size="md">
      <Modal.Body>
        <div className="space-y-5">
          {/* Student Info */}
          <div className="p-4 bg-navy-light rounded-lg border border-[#C7D7EE]">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500 text-xs mb-1">Student Name</div>
                <div className="font-semibold">{student.studentName}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Student Code</div>
                <div className="font-semibold">{student.studentCode}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Class</div>
                <div className="font-semibold">{student.class}</div>
              </div>
              <div>
                <div className="text-gray-500 text-xs mb-1">Period</div>
                <div className="font-semibold">{student.period}</div>
              </div>
            </div>
          </div>
          
          {/* Fee Breakdown */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Fee Breakdown</h4>
            <div className="space-y-2">
              {feeComponents.map((component, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-sm text-gray-600">{component.name}</span>
                  <span className="text-sm font-semibold">{formatCurrency(component.amount)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center py-2 pt-3 border-t-2 border-gray-200">
                <span className="text-sm font-bold">Total Fee</span>
                <span className="text-base font-extrabold text-navy">{formatCurrency(student.totalFee)}</span>
              </div>
            </div>
          </div>
          
          {/* Payment Status */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Payment Status</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="text-xs text-gray-500 mb-1">Total Fee</div>
                <div className="text-sm font-bold">{formatCurrency(student.totalFee)}</div>
              </div>
              <div className="p-3 bg-success-light rounded-lg border border-success-mid">
                <div className="text-xs text-gray-500 mb-1">Paid</div>
                <div className="text-sm font-bold text-success">{formatCurrency(student.paidAmount)}</div>
              </div>
              <div className="p-3 bg-danger-light rounded-lg border border-danger-mid">
                <div className="text-xs text-gray-500 mb-1">Balance</div>
                <div className="text-sm font-bold text-danger">{formatCurrency(student.balance)}</div>
              </div>
            </div>
          </div>
          
          {/* Payment Info */}
          <div>
            <h4 className="text-xs font-bold text-gray-700 mb-3 uppercase tracking-wider">Payment Information</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <Badge status={student.status} showDot />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Last Payment:</span>
                <span className="font-medium">{formatDate(student.lastPayment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payment Mode:</span>
                <span className="font-medium">{student.paymentMode}</span>
              </div>
            </div>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ViewDetailsModal;