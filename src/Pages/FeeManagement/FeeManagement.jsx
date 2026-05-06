import React, { useState } from 'react';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures.';
import CollectionsHistory from './Collectionhistory';
import CollectFeeModal     from '../../Components/FeeModal/CollectfeeModal';
import ReceiptModal        from '../../Components/FeeModal/ReceiptModal';
import Button              from '../../Components/FeeModal/Button';
import { studentFeeData, feeComponents } from '../../Components/FeeModal/mockData';

const TABS = [
  { key: 'overview',     label: 'Dashboard'               },
  { key: 'periods',      label: 'Fee Periods'             },
  { key: 'structures',   label: 'Fee Structures'          },
  { key: 'collections',  label: 'Collections & History', badge: 9 },
];

const FeeManagement = () => {
  const [page, setPage] = useState('overview');
  const [collectModal, setCollectModal] = useState({ isOpen: false, student: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, receipt: null });

  const handleCollect = (student = studentFeeData.find((s) => s.balance > 0)) => {
    setCollectModal({ isOpen: true, student });
  };

  const handleFeeSubmit = (data) => {
    const receipt = {
      receiptNo:    `RC-2026-${String(Math.floor(Math.random() * 99999)).padStart(5, '0')}`,
      date:         data.paymentDate,
      studentName:  data.student.studentName,
      studentCode:  data.student.studentCode,
      class:        data.student.class,
      period:       data.student.period,
      components:   feeComponents,
      amountPaid:   parseFloat(data.amountPaid),
      discount:     parseFloat(data.discount)  || 0,
      lateFine:     parseFloat(data.lateFine)  || 0,
      paymentMode:  data.paymentMode,
      balanceAfter: data.student.balance - parseFloat(data.amountPaid),
    };
    setCollectModal({ isOpen: false, student: null });
    setReceiptModal({ isOpen: true, receipt });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ── Topbar ── */}
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-2 z-40">
        <div>
          <div className=" font-bold text-lg text-black-600 leading-tight">Fee Management</div>
          
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">⬇ Export</Button>
          <Button variant="primary"   size="sm" onClick={() => handleCollect()}>+ Collect Fee</Button>
          <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-navy flex items-center justify-center text-white text-[11px] font-bold">AK</div>
            <div>
              <div className="text-xs font-bold text-gray-800 leading-tight">Amit Kumar</div>
              <div className="text-[10px] text-gray-500 leading-none">Admin</div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Module Tab Nav ── */}
      <nav className="bg-white border-b border-gray-200 px-6 flex sticky top-14 z-30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setPage(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              page === t.key
                ? 'text-navy border-navy'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.label}
            {t.badge && (
              <span className="bg-danger text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{t.badge}</span>
            )}
          </button>
        ))}
      </nav>

      {/* ── Page body ── */}
      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full ">
        {page === 'overview'    && <Overview           onNavigate={setPage} onCollect={handleCollect} />}
        {page === 'periods'     && <FeePeriods         onNavigate={setPage} />}
        {page === 'structures'  && <FeeStructures />}
        {page === 'collections' && <CollectionsHistory />}
      </main>

      {/* ── Global Modals ── */}
      <CollectFeeModal
        isOpen={collectModal.isOpen}
        onClose={() => setCollectModal({ isOpen: false, student: null })}
        student={collectModal.student}
        onSubmit={handleFeeSubmit}
      />
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, receipt: null })}
        receipt={receiptModal.receipt}
      />
    </div>
  );
};

export default FeeManagement;