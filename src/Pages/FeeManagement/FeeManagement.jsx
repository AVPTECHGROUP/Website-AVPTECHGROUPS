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
import { FEE_MANAGEMENT_STRINGS } from '../../Constants/StringConstants/FeeManagementConstants';
// ─── AY subtitle ─────────────────────────────────────────────────────────────
const AySubtitle = ({ label, schoolName }) => {
    if (!label) return null;
    return (
        <div className="text-[11px] text-gray-500">
            {FEE_MANAGEMENT_STRINGS.ACADEMIC_YEAR_LABEL} {label}{schoolName ? <> &middot; {schoolName}</> : null}
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
            {FEE_MANAGEMENT_STRINGS.BTN_BACK}
        </button>
    );
};

// ─── Fee Synthesis Page ───────────────────────────────────────────────────────
export const FeeSynthesisPage = () => {
    const [tab, setTab] = React.useState(FEE_MANAGEMENT_STRINGS.TAB_KEY_PERIODS);
    // Stores the periodId to pre-filter FeeStructures when navigating from FeePeriods
    const [initialPeriodId, setInitialPeriodId] = React.useState(null);

    const { profile, user } = useDecodedUser();
    const { currentAcademicYear, schoolInfo } = useContext(UserContext);

    const TABS = [
        { key: FEE_MANAGEMENT_STRINGS.TAB_KEY_PERIODS, label: FEE_MANAGEMENT_STRINGS.TAB_PERIODS },
        { key: FEE_MANAGEMENT_STRINGS.TAB_KEY_STRUCTURES, label: FEE_MANAGEMENT_STRINGS.TAB_STRUCTURES },
    ];

    // Called by FeePeriods when user clicks "Structures" on a period card/row.
    // Switches to the structures tab and pre-filters by the given periodId.
    const goToStructures = (periodId) => {
        setInitialPeriodId(periodId ?? null);
        setTab(FEE_MANAGEMENT_STRINGS.TAB_KEY_STRUCTURES);
    };

    // When the user manually clicks the "Fee Periods" tab, clear the filter so
    // FeeStructures starts fresh next time.
    const handleTabClick = (key) => {
        if (key === FEE_MANAGEMENT_STRINGS.TAB_KEY_PERIODS) setInitialPeriodId(null);
        setTab(key);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">{FEE_MANAGEMENT_STRINGS.HEADER_FEE_CONFIG}</div>
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
                {tab === FEE_MANAGEMENT_STRINGS.TAB_KEY_PERIODS && <FeePeriods onGoToStructures={goToStructures} />}
                {tab === FEE_MANAGEMENT_STRINGS.TAB_KEY_STRUCTURES && <FeeStructures initialPeriodId={initialPeriodId} />}
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
                    <div className="font-bold text-lg text-gray-900 leading-tight">{FEE_MANAGEMENT_STRINGS.HEADER_COLLECTIONS}</div>
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
                    <div className="font-bold text-lg text-gray-900 leading-tight">{FEE_MANAGEMENT_STRINGS.HEADER_FEE_MANAGEMENT}</div>
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

    if (!currentAcademicYear?.id) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-base font-semibold text-gray-700">{FEE_MANAGEMENT_STRINGS.AY_NOT_LOADED_TITLE}</div>
                <div className="text-sm text-gray-500 max-w-sm text-center">
                    {FEE_MANAGEMENT_STRINGS.AY_NOT_LOADED_DESC}
                </div>
            </div>
        );
    }

    if (page === 'synthesis') return <FeeSynthesisPage />;
    if (page === 'collections') return <CollectionsPage />;
    return <OverviewPage />;
};

export default FeeManagement;