import React from 'react';
import Modal from '../../Components/FeeModal/Modal';
import Button from '../../Components/FeeModal/Button';
import { formatCurrency, formatDate } from '../../Components/FeeModal/helper';
import { Printer, FileDown } from 'lucide-react';

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  if (!receipt) return null;
  
  const handlePrint = () => {
    window.print();
  };
  
  const handleDownloadPDF = () => {
    // Implement PDF download logic
    alert('PDF download functionality would be implemented here');
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Payment Receipt" size="md">
      <Modal.Body>
        <div className="font-sans">
          {/* School Header */}
          <div className="text-center mb-4 mt">
            
          </div>
          
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Receipt Header */}
          <div className="flex justify-between items-center font-bold text-sm mb-3">
            <span>FEE RECEIPT</span>
            <span>{receipt.receiptNo}</span>
          </div>
          
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Receipt Details */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{formatDate(receipt.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student:</span>
              <span className="font-medium">{receipt.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="font-medium">{receipt.class}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Adm. No.:</span>
              <span className="font-medium">{receipt.studentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Period:</span>
              <span className="font-medium">{receipt.period}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Fee Components */}
          <div className="space-y-2 text-sm">
            {receipt.components.map((component, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">{component.name}</span>
                <span className="font-medium">{formatCurrency(component.amount)}</span>
              </div>
            ))}
            {receipt.lateFine > 0 && (
              <div className="flex justify-between text-warning">
                <span>Late Fine</span>
                <span className="font-medium">{formatCurrency(receipt.lateFine)}</span>
              </div>
            )}
            {receipt.discount > 0 && (
              <div className="flex justify-between text-success">
                <span>Discount</span>
                <span className="font-medium">-{formatCurrency(receipt.discount)}</span>
              </div>
            )}
          </div>
          
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Total */}
          <div className="flex justify-between items-center font-bold text-sm mb-2">
            <span>TOTAL COLLECTED</span>
            <span className="text-base">{formatCurrency(receipt.amountPaid)}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Mode:</span>
              <span className="font-medium">{receipt.paymentMode}</span>
            </div>
            <div className="flex justify-between text-success">
              <span>Balance After:</span>
              <span className="font-medium">{formatCurrency(receipt.balanceAfter)}</span>
            </div>
          </div>
          
          <div className="border-t border-gray-300 my-3"></div>
          
          {/* Footer */}
          <div className="flex justify-between text-[11px] text-gray-500">
            <span>By: {receipt.recordedBy || 'System'}</span>
            <span>{formatDate(receipt.date)}</span>
          </div>
          
          {/* Paid Stamp */}
          <div className="text-center mt-4">
            <span className="inline-block border-2 border-success text-success px-5 py-1 text-base font-black tracking-[0.15em] transform -rotate-6">
              PAID
            </span>
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
        <Button variant="primary" icon={<Printer size={16} />} onClick={handlePrint}>
          Print
        </Button>
        <Button variant="ghost" icon={<FileDown size={16} />} onClick={handleDownloadPDF}>
          PDF
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceiptModal;