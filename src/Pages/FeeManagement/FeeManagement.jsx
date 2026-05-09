// FeeManagement.jsx — Root router
// Academic year is fetched ONCE here via /academic-years/current
// then passed down to all other fee pages as props.
// No child page ever calls /academic-years or /academic-years/current directly.

import React, { useState, useEffect } from 'react';
import { useDecodedUser } from '../../ContextAPI/UserContext';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures.';
import CollectionsHistory from './Collectionhistory';
import Button from '../../Components/FeeModal/Button';
import { getCurrentAcademicYear } from "../../Api/AcademicYear";

// ─── Shared Topbar User Pill ──────────────────────────────────────────────────
const UserPill = ({ profile, user }) => {
  const fullName = profile
    ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
    : (user?.email?.split('@')[0] || 'User');
  const role = profile?.designation || user?.userType || 'Admin';
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

// ─── Fee Synthesis Page ───────────────────────────────────────────────────────
export const FeeSynthesisPage = ({ academicYear, yearLoading, yearError }) => {

  const [tab, setTab] = useState('periods');
  const { profile, user } = useDecodedUser();

  const TABS = [
    { key: 'periods',    label: 'Fee Periods'    },
    { key: 'structures', label: 'Fee Structures' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Fee Synthesis</div>
          {academicYear?.label && (
            <div className="text-[11px] text-gray-500">AY {academicYear.label}</div>
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
        {tab === 'periods'    && <FeePeriods    academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} onNavigate={(t) => setTab(t)} />}
        {tab === 'structures' && <FeeStructures academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} />}
      </main>
    </div>
  );
};

// ─── Collections Page ─────────────────────────────────────────────────────────
export const CollectionsPage = ({ academicYear, yearLoading, yearError }) => {
  const { profile, user } = useDecodedUser();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Collections &amp; History</div>
          {academicYear?.label && (
            <div className="text-[11px] text-gray-500">AY {academicYear.label}</div>
          )}
        </div>
        <UserPill profile={profile} user={user} />
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <CollectionsHistory academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} />
      </main>
    </div>
  );
};

// ─── Overview / Dashboard Page ────────────────────────────────────────────────
export const OverviewPage = ({ academicYear, yearLoading, yearError }) => {
  const { profile, user } = useDecodedUser();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
        <div>
          <div className="font-bold text-lg text-gray-900 leading-tight">Fee Management</div>
          {academicYear?.label && (
            <div className="text-[11px] text-gray-500">AY {academicYear.label}</div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm">⬇ Export</Button>
          <UserPill profile={profile} user={user} />
        </div>
      </header>

      <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
        <Overview
          onNavigate={() => {}}
          academicYear={academicYear}
          yearLoading={yearLoading}
          yearError={yearError}
        />
      </main>
    </div>
  );
};

// ─── Root FeeManagement — single source of truth for academic year ─────────────
const FeeManagement = ({ page = 'overview' }) => {
  console.log("FeeManagement Rendered");
  const [academicYear, setAcademicYear] = useState(null);
  const [yearLoading, setYearLoading] = useState(true);
  const [yearError, setYearError] = useState(null);
  


  useEffect(() => {

  console.log("useEffect Running");
    const loadAcademicYear = async () => {
       console.log("loadAcademicYear Called");
      try {
        setYearLoading(true);
        setYearError(null);

        const res = await getCurrentAcademicYear();
        
        console.log('Academic Year API Response:', res);

        // Extract year from response
        const year = res?.data || res;

        console.log('Extracted Academic Year:', year);

        // Validate the year data
        if (!year || !year.id) {
          throw new Error('Invalid academic year data received');
        }

        setAcademicYear({
          id: year.id,
          label: year.label || year.name || year.academicYearName || `AY ${year.id}`,
        });

        console.log('Academic Year Set:', {
          id: year.id,
          label: year.label || year.name || year.academicYearName || `AY ${year.id}`,
        });

      } catch (err) {
        console.error("Failed to load academic year:", err);
        setYearError(err.message || 'Failed to load academic year');
      } finally {
        setYearLoading(false);
      }
    };

    loadAcademicYear();
  }, []);

  if (page === 'synthesis') {
    return <FeeSynthesisPage academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} />;
  }
  
  if (page === 'collections') {
    return <CollectionsPage academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} />;
  }

  return <OverviewPage academicYear={academicYear} yearLoading={yearLoading} yearError={yearError} />;
};

export default FeeManagement;