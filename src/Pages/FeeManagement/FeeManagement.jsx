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
//      No props needed (except the new tab-switching callbacks).

import React, { useContext } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDecodedUser, UserContext } from '../../ContextAPI/UserContext';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures';
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

// ─── Back Button ─────────────────────────────────────────────────────────────
const BackButton = () => {
    const navigate = useNavigate();
    return (
        <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium
                       text-gray-700 bg-white border border-gray-300 rounded-lg
                       hover:bg-gray-50 transition-colors"
        >
            <ArrowLeft size={16} />
            Back
        </button>
    );
};

// ─── Fee Synthesis Page ───────────────────────────────────────────────────────
export const FeeSynthesisPage = () => {
    const [tab, setTab] = React.useState('periods');
    // Stores the periodId to pre-filter FeeStructures when navigating from FeePeriods
    const [initialPeriodId, setInitialPeriodId] = React.useState(null);

    const { profile, user } = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    const TABS = [
        { key: 'periods', label: 'Fee Periods' },
        { key: 'structures', label: 'Fee Structures' },
    ];

    // Called by FeePeriods when user clicks "Structures" on a period card/row.
    // Switches to the structures tab and pre-filters by the given periodId.
    const goToStructures = (periodId) => {
        setInitialPeriodId(periodId ?? null);
        setTab('structures');
    };

    // When the user manually clicks the "Fee Periods" tab, clear the filter so
    // FeeStructures starts fresh next time.
    const handleTabClick = (key) => {
        if (key === 'periods') setInitialPeriodId(null);
        setTab(key);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Config</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
                <div className="flex items-center gap-3">
                    <BackButton />
                </div>
            </header>

            <nav className="bg-white border-b border-gray-200 px-6 flex sticky top-14 z-30">
                {TABS.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => handleTabClick(t.key)}
                        className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.key
                                ? 'text-[#1A3A5C] border-[#1A3A5C]'
                                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                {/*
                  FeePeriods receives onGoToStructures so it can switch tabs
                  instead of doing a route navigation.
                  FeeStructures receives initialPeriodId to pre-filter on load.
                */}
                {tab === 'periods' && <FeePeriods onGoToStructures={goToStructures} />}
                {tab === 'structures' && <FeeStructures initialPeriodId={initialPeriodId} />}
            </main>
        </div>
    );
};


// ─── Collections Page ─────────────────────────────────────────────────────────
export const CollectionsPage = () => {
    const { profile, user } = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Collections &amp; History</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                <CollectionsHistory />
            </main>
        </div>
    );
};

// ─── Overview / Dashboard Page ────────────────────────────────────────────────
export const OverviewPage = () => {
    const { profile, user } = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Management</div>
                    <AySubtitle label={currentAcademicYear?.label} schoolName={schoolInfo?.schoolName} />
                </div>
                <div className="flex items-center gap-3">
                    <BackButton />
                </div>
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                <Overview onNavigate={() => { }} />
            </main>
        </div>
    );
};

// ─── Root FeeManagement ───────────────────────────────────────────────────────
const FeeManagement = ({ page = 'overview' }) => {
    const { currentAcademicYear } = useContext(UserContext);

    console.log('[FeeManagement] currentAcademicYear from context:', currentAcademicYear);

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

    if (page === 'synthesis') return <FeeSynthesisPage />;
    if (page === 'collections') return <CollectionsPage />;
    return <OverviewPage />;
};

export default FeeManagement;