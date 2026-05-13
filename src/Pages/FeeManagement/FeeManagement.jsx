// FeeManagement.jsx
//
// Academic year flow:
//   1. SchoolSelectedCard calls getCurrentAcademicYear()
//      → returns { id, label, ... } directly (already unwrapped by the API fn)
//   2. saveCurrentAcademicYear({ id, label }) → UserContext + localStorage
//   3. UserContext initialises from localStorage on load, so it's available
//      synchronously on first render — no useEffect needed here
//   4. All child pages (Overview, FeePeriods, FeeStructures, CollectionsHistory)
//      read currentAcademicYear from UserContext themselves via useContext.
//      No props needed.

import React, { useContext } from 'react';
import { useDecodedUser, UserContext } from '../../ContextAPI/UserContext';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures.';
import CollectionsHistory from './Collectionhistory';
import Button from '../../Components/FeeModal/Button';



// ─── AY subtitle ─────────────────────────────────────────────────────────────
const AySubtitle = ({ label, schoolName }) => {
    if (!label) return null;
    return (
        <div className="text-[11px] text-gray-500">
            Academic Year {label}{schoolName ? <> &middot; {schoolName}</> : null}
        </div>
    );
};

// ─── Fee Synthesis Page ───────────────────────────────────────────────────────
export const FeeSynthesisPage = () => {
    const [tab, setTab]                     = React.useState('periods');
    const { profile, user }                 = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);
    const TABS = [{ key: 'periods', label: 'Fee Periods' }, { key: 'structures', label: 'Fee Structures' }];

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Synthesis</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
                {/* <UserPill profile={profile} user={user} /> */}
            </header>
            <nav className="bg-white border-b border-gray-200 px-6 flex sticky top-14 z-30">
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${
                            tab === t.key ? 'text-[#1A3A5C] border-[#1A3A5C]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                        }`}>
                        {t.label}
                    </button>
                ))}
            </nav>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                {/* ✅ No props — child reads from UserContext directly */}
                {tab === 'periods'    && <FeePeriods />}
                {tab === 'structures' && <FeeStructures />}
            </main>
        </div>
    );
};

// ─── Collections Page ─────────────────────────────────────────────────────────
export const CollectionsPage = () => {
    const { profile, user }                   = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Collections &amp; History</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
                {/* <UserPill profile={profile} user={user} /> */}
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                {/* ✅ No props — child reads from UserContext directly */}
                <CollectionsHistory />
            </main>
        </div>
    );
};

// ─── Overview / Dashboard Page ────────────────────────────────────────────────
export const OverviewPage = () => {
    const { profile, user }                   = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Management</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
                {/* <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm">⬇ Export</Button>
                    <UserPill profile={profile} user={user} />
                </div> */}
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                {/* ✅ No props — Overview reads from UserContext directly */}
                <Overview onNavigate={() => {}} />
            </main>
        </div>
    );
};

// ─── Root FeeManagement ───────────────────────────────────────────────────────
//
// ✅ Reads currentAcademicYear from UserContext directly.
//    UserContext initialises from localStorage synchronously, so there is
//    NO flash of "not loaded" on first render.
//    No useState, no useEffect, no localStorage read here.
//
const FeeManagement = ({ page = 'overview' }) => {
    const { currentAcademicYear } = useContext(UserContext);

    console.log('[FeeManagement] currentAcademicYear from context:', currentAcademicYear);

    // Guard — if context is empty AND localStorage is empty, the user hasn't
    // gone through school selection. Show a clear message.
    if (!currentAcademicYear?.id) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-base font-semibold text-gray-700">Academic year not loaded</div>
                <div className="text-sm text-gray-500 max-w-sm text-center">
                    Could not determine the current academic year.
                    Please go back and select a school, or refresh the page.
                </div>
            </div>
        );
    }

    if (page === 'synthesis')   return <FeeSynthesisPage />;
    if (page === 'collections') return <CollectionsPage />;
    return <OverviewPage />;
};

export default FeeManagement;