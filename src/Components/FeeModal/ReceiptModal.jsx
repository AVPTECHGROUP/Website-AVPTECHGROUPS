// ReceiptModal.jsx — displays fee receipt returned from POST /v1/fee/collections
// or fetched via GET /v1/fee/collections/receipt/:id

import React, { useRef } from 'react';
import { useDecodedUser } from '../../ContextAPI/UserContext';

const fmtINR = (n) => (n == null ? '—' : `₹${Number(n).toLocaleString('en-IN')}`);

const ReceiptModal = ({ isOpen, onClose, receipt }) => {
  const { profile, user, schoolInfo } = useDecodedUser();
  const printRef = useRef(null);

  if (!isOpen || !receipt) return null;

  const recordedBy = receipt.recordedBy
    || (profile ? [profile.firstName, profile.lastName].filter(Boolean).join(' ') : user?.email || '');

  const schoolName = schoolInfo?.name || receipt.schoolName || 'School';
  const schoolAddr = schoolInfo?.address || receipt.schoolAddress || '';

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open('', '_blank');
    win.document.write(`
      <html><head><title>Fee Receipt</title>
      <style>
        body { font-family: 'Courier New', monospace; font-size: 12px; padding: 20px; }
        .rct-row { display: flex; justify-content: space-between; margin-bottom: 4px; }
        .rct-div { border-top: 1px dashed #ccc; margin: 8px 0; }
        .fw7 { font-weight: 700; }
        .cs  { color: green; }
      </style></head>
      <body onload="window.print();window.close();">${content}</body></html>
    `);
    win.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-[1001] flex items-start justify-center overflow-y-auto"
      style={{ background: 'rgba(15,23,42,.55)', backdropFilter: 'blur(4px)', padding: '40px 20px' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-[15px] font-extrabold tracking-tight">Payment Receipt</h2>
          <button onClick={onClose} className="w-7 h-7 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 text-base transition-colors">✕</button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 max-h-[74vh] overflow-y-auto">
          <div
            ref={printRef}
            style={{
              border: '1.5px solid #CBD5E1',
              borderRadius: 12,
              padding: 24,
              fontFamily: "'Courier New', monospace",
              fontSize: 12,
              maxWidth: 360,
              margin: '0 auto',
              background: '#FAFAFA',
            }}
          >
            {/* School header */}
            <div style={{ textAlign: 'center', marginBottom: 14 }}>
              <div style={{ fontSize: 13.5, fontWeight: 800, letterSpacing: '-0.01em', fontFamily: 'Inter, sans-serif' }}>
                {schoolName.toUpperCase()}
              </div>
              {schoolAddr && (
                <div style={{ fontSize: 11, color: '#64748B', marginTop: 3, fontFamily: 'Inter, sans-serif' }}>
                  {schoolAddr}
                </div>
              )}
            </div>

            <hr style={{ border: 'none', borderTop: '1px dashed #CBD5E1', margin: '8px 0' }} />
            <Row bold left="FEE RECEIPT" right={receipt.receiptNo || '—'} />
            <hr style={{ border: 'none', borderTop: '1px dashed #CBD5E1', margin: '8px 0' }} />

            <Row left="Date:"        right={receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'} />
            <Row left="Student:"     right={receipt.studentName || '—'} />
            {receipt.class   && <Row left="Class:"  right={receipt.class} />}
            {receipt.studentCode && <Row left="Adm. No.:" right={receipt.studentCode} />}
            {receipt.period  && <Row left="Period:"  right={receipt.period} />}

            <hr style={{ border: 'none', borderTop: '1px dashed #CBD5E1', margin: '8px 0' }} />

            {/* Fee components */}
            {Array.isArray(receipt.components) && receipt.components.length > 0
              ? receipt.components.map((c, i) => (
                  <Row key={i} left={c.name || c.componentName} right={fmtINR(c.amount)} />
                ))
              : null
            }

            {receipt.discount > 0 && (
              <Row left="Discount" right={`-${fmtINR(receipt.discount)}`} style={{ color: '#0D7A55' }} />
            )}
            {receipt.lateFine > 0 && (
              <Row left="Late Fine" right={fmtINR(receipt.lateFine)} style={{ color: '#B45309' }} />
            )}

            <hr style={{ border: 'none', borderTop: '1px dashed #CBD5E1', margin: '8px 0' }} />
            <Row bold left="TOTAL COLLECTED" right={fmtINR(receipt.amountPaid)} />
            <Row left="Mode:" right={receipt.paymentMode} />
            {receipt.referenceNo && <Row left="Ref No:" right={receipt.referenceNo} />}

            <Row
              left="Balance After:"
              right={fmtINR(receipt.balanceAfter)}
              style={{ color: receipt.balanceAfter <= 0 ? '#0D7A55' : '#B45309', fontWeight: 600 }}
            />

            <hr style={{ border: 'none', borderTop: '1px dashed #CBD5E1', margin: '8px 0' }} />
            <Row
              left={`By: ${recordedBy}`}
              right={receipt.paymentDate ? new Date(receipt.paymentDate).toLocaleDateString('en-IN') : ''}
              style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'Inter, sans-serif' }}
            />

            {/* PAID stamp */}
            {receipt.balanceAfter <= 0 && (
              <div style={{ textAlign: 'center', marginTop: 14 }}>
                <span style={{
                  display: 'inline-block',
                  color: '#0D7A55',
                  border: '2px solid #0D7A55',
                  padding: '3px 18px',
                  fontSize: 15,
                  fontWeight: 900,
                  letterSpacing: '.15em',
                  transform: 'rotate(-6deg)',
                  fontFamily: 'Inter, sans-serif',
                }}>PAID</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[12.5px] font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-[12.5px] font-semibold text-white bg-[#1A3A5C] hover:bg-[#0F2744] rounded-lg transition-colors"
          >
            🖨 Print
          </button>
        </div>
      </div>
    </div>
  );
};

const Row = ({ left, right, bold, style }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, ...(bold ? { fontWeight: 700 } : {}), ...style }}>
    <span>{left}</span>
    <span>{right}</span>
  </div>
);

export default ReceiptModal;