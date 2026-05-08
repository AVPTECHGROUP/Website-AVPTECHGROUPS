// FeeManagement.jsx — Root router
// Route: /feemanagement             → OverviewPage (dashboard)
// Route: /feemanagement/synthesis   → FeeSynthesisPage  (Fee Periods + Fee Structures tabs)
// Route: /feemanagement/collections → CollectionsPage   (Outstanding + History tabs)

import React, { useState } from 'react';
import { useDecodedUser } from '../../ContextAPI/UserContext';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures.';
import CollectionsHistory from './Collectionhistory';
import CollectFeeModal from '../../Components/FeeModal/CollectfeeModal';
import ReceiptModal from '../../Components/FeeModal/ReceiptModal';
import Button from '../../Components/FeeModal/Button';

// ─── Shared Topbar User Pill ──────────────────────────────────────────────────
const UserPill = ({ profile, user }) => {
  // Derive display name: prefer profile.firstName + lastName, fall back to email
  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : (user?.email?.split('@')[0] || 'User');

  const role = profile?.designation || user?.userType || 'Admin';

  // Build initials
  const initials = profile
    ? `${(profile.firstName?.[0] || '').toUpperCase()}${(profile.lastName?.[0] || '').toUpperCase()}`
    : fullName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
      <div className="w-7 h-7 rounded-full bg-[#1A3A5C] flex items-center justify-center text-white text-[11px] font-bold">
        {initials}
      </div>
      <div>
        <div className="text-xs font-bold text-gray-800 leading-tight">{fullName}</div>
        <div className="text-[10px] text-gray-500 leading-none">{role}</div>
      </div>
    </div>
  );
};

// ─── Fee Synthesis Page ────────────────────────────────────────────────────────
export const FeeSynthesisPage = () => {
  const [tab, setTab] = useState('periods');
  const { profile, user, currentAcademicYear } = useDecodedUser();

  const TABS = [
    { key: 'periods',    label: 'Fee Periods'    },
    { key: 'structures', label: 'Fee Structures' },
  ];

  const handleNavigate = (target) => {
    if (target === 'structures') setTab('structures');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Fee Synthesis</div>
          {currentAcademicYear && (
            <div className="text-[11px] text-gray-500">AY {currentAcademicYear.label}</div>
          )}
        </div>
        <UserPill profile={profile} user={user} />
      </header>

      <nav className="bg-white border-b border-gray-200 px-6 flex sticky top-14 z-30">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
              tab === t.key
                ? 'text-[#1A3A5C] border-[#1A3A5C]'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        {tab === 'periods'    && <FeePeriods   onNavigate={handleNavigate} />}
        {tab === 'structures' && <FeeStructures />}
      </main>
    </div>
  );
};

// ─── Collections Page ─────────────────────────────────────────────────────────
export const CollectionsPage = () => {
  const { profile, user, currentAcademicYear } = useDecodedUser();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Collections &amp; History</div>
          {currentAcademicYear && (
            <div className="text-[11px] text-gray-500">AY {currentAcademicYear.label}</div>
          )}
        </div>
        <UserPill profile={profile} user={user} />
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <CollectionsHistory />
      </main>
    </div>
  );
};

// ─── Overview / Dashboard Page ────────────────────────────────────────────────
export const OverviewPage = () => {
  const { profile, user, currentAcademicYear } = useDecodedUser();

  const [collectModal, setCollectModal] = useState({ isOpen: false, student: null });
  const [receiptModal, setReceiptModal] = useState({ isOpen: false, receipt: null });

  // Called by Overview when "Collect" is clicked on an overdue student row
  // student shape comes from getOutstandingFees API response
  const handleCollect = (student = null) => {
    setCollectModal({ isOpen: true, student });
  };

  // Called by CollectFeeModal on successful payment
  // receipt shape is returned directly from POST /v1/fee/collections response
  const handleFeeSubmit = (receiptData) => {
    setCollectModal({ isOpen: false, student: null });
    setReceiptModal({ isOpen: true, receipt: receiptData });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Fee Management</div>
          {currentAcademicYear && (
            <div className="text-[11px] text-gray-500">AY {currentAcademicYear.label}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">⬇ Export</Button>
          <Button variant="primary" size="sm" onClick={() => handleCollect(null)}>+ Collect Fee</Button>
          <UserPill profile={profile} user={user} />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        {/* Overview receives onCollect so overdue alert buttons can pre-fill the modal */}
        <Overview onNavigate={() => {}} onCollect={handleCollect} />
      </main>

      {/* Collect Fee Modal */}
      <CollectFeeModal
        isOpen={collectModal.isOpen}
        onClose={() => setCollectModal({ isOpen: false, student: null })}
        student={collectModal.student}
        onSubmit={handleFeeSubmit}
      />

      {/* Receipt Modal — shown after successful payment */}
      <ReceiptModal
        isOpen={receiptModal.isOpen}
        onClose={() => setReceiptModal({ isOpen: false, receipt: null })}
        receipt={receiptModal.receipt}
      />
    </div>
  );
};

// ─── Default export ────────────────────────────────────────────────────────────
const FeeManagement = ({ page = 'overview' }) => {
  if (page === 'synthesis')   return <FeeSynthesisPage />;
  if (page === 'collections') return <CollectionsPage />;
  return <OverviewPage />;
};

export default FeeManagement;