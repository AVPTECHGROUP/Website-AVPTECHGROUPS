// FeeManagement.jsx
// Academic year flow:
//   SchoolSelectedCard → getCurrentAcademicYear() → saveCurrentAcademicYear() + localStorage
//   FeeManagement reads context first, then localStorage fallback
//   Passes { id, label } as prop to every child page

import React, { useState, useContext ,useEffect } from 'react';
import { useDecodedUser, UserContext } from '../../ContextAPI/UserContext';
import Overview from './Overview';
import FeePeriods from './FeePeriods';
import FeeStructures from './Feestructures.';
import CollectionsHistory from './Collectionhistory';
import Button from '../../Components/FeeModal/Button';



// ─── User pill ────────────────────────────────────────────────────────────────
const UserPill = ({ profile, user }) => {
    const fullName = profile
        ? [profile.firstName, profile.lastName].filter(Boolean).join(' ')
        : (user?.email?.split('@')[0] || 'User');
    const role = profile?.designation || user?.userType || 'Admin';
    const initials = fullName.slice(0, 2).toUpperCase();
    return (
        <div className="flex items-center gap-2 border border-gray-200 rounded-full pl-1 pr-3 py-1 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="w-7 h-7 rounded-full bg-[#1A3A5C] flex items-center justify-center text-white text-[11px] font-bold">{initials}</div>
            <div>
                <div className="text-xs font-bold text-gray-800 leading-tight">{fullName}</div>
                <div className="text-[10px] text-gray-500 leading-none">{role}</div>
            </div>
        </div>
    );
};

const AySubtitle = ({ academicYear, schoolName }) => {
    if (!academicYear?.label) return null;
    return (
        <div className="text-[11px] text-gray-500">
            Academic Year {academicYear.label}{schoolName ? <> &middot; {schoolName}</> : null}
        </div>
    );
};

// ─── Pages ────────────────────────────────────────────────────────────────────
export const FeeSynthesisPage = ({ academicYear }) => {
    const [tab, setTab] = useState('periods');
    const { profile, user } = useDecodedUser();
   const { schoolInfo: currentSchool } = useContext(UserContext);
    const TABS = [{ key: 'periods', label: 'Fee Periods' }, { key: 'structures', label: 'Fee Structures' }];
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Synthesis</div>
                    <AySubtitle academicYear={academicYear} schoolName={currentSchool?.schoolName} />
                </div>
                <UserPill profile={profile} user={user} />
            </header>
            <nav className="bg-white border-b border-gray-200 px-6 flex sticky top-14 z-30">
                {TABS.map((t) => (
                    <button key={t.key} onClick={() => setTab(t.key)}
                        className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${tab === t.key ? 'text-[#1A3A5C] border-[#1A3A5C]' : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'}`}>
                        {t.label}
                    </button>
                ))}
            </nav>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                {tab === 'periods'    && <FeePeriods    academicYear={academicYear} />}
                {tab === 'structures' && <FeeStructures academicYear={academicYear} />}
            </main>
        </div>
    );
};

export const CollectionsPage = ({ academicYear }) => {
    const { profile, user } = useDecodedUser();
  const { schoolInfo: currentSchool } = useContext(UserContext);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Collections &amp; History</div>
                    <AySubtitle academicYear={academicYear} schoolName={currentSchool?.schoolName} />
                </div>
                <UserPill profile={profile} user={user} />
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                <CollectionsHistory academicYear={academicYear} />
            </main>
        </div>
    );
};

export const OverviewPage = ({ academicYear }) => {
    const { profile, user } = useDecodedUser();
    const { schoolInfo: currentSchool } = useContext(UserContext);
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <header className="bg-white border-b border-gray-200 px-6 h-14 flex items-center justify-between sticky top-0 z-40">
                <div>
                    <div className="font-bold text-lg text-gray-900 leading-tight">Fee Management</div>
                    <AySubtitle academicYear={academicYear} schoolName={currentSchool?.schoolName} />
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm">⬇ Export</Button>
                    <UserPill profile={profile} user={user} />
                </div>
            </header>
            <main className="flex-1 p-6 max-w-[1600px] mx-auto w-full">
                <Overview onNavigate={() => {}} academicYear={academicYear} />
            </main>
        </div>
    );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
const FeeManagement = ({ page = 'overview' }) => {

    const [academicYear, setAcademicYear] = useState(null);

    useEffect(() => {

        try {
            const stored = localStorage.getItem('currentAcademicYear');

            if (!stored) {
                console.warn('[FeeManagement] No academic year in localStorage');
                return;
            }

            const parsed = JSON.parse(stored);

            console.log(
                '[FeeManagement] Loaded academic year:',
                parsed
            );

            if (parsed?.id) {
                setAcademicYear({
                    id: parsed.id,
                    label: parsed.label,
                });
            }

        } catch (err) {
            console.error(
                '[FeeManagement] Failed to parse academic year',
                err
            );
        }

    }, []);

    

    if (!academicYear?.id) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="text-base font-semibold text-gray-700">Academic year not loaded</div>
                <div className="text-sm text-gray-500 max-w-sm text-center">
                    Please open browser DevTools → Console and check the
                    "[FeeManagement]" logs above. Also check Application → Local Storage
                    for a <code className="bg-gray-100 px-1 rounded">currentAcademicYear</code> key.
                </div>
                <button
                    onClick={() => {
                        // Last-resort: try reading from all possible localStorage keys
                        const keys = ['currentAcademicYear', 'academicYear', 'ayData', 'ay'];
                        for (const k of keys) {
                            try {
                                const v = JSON.parse(localStorage.getItem(k) || 'null');
                                if (v?.id) {
                                    console.log(`Found AY under key "${k}":`, v);
                                    alert(`Found academic year under "${k}": id=${v.id}, label=${v.label}\nCheck console for details.`);
                                    return;
                                }
                            } catch { /* ignore */ }
                        }
                        alert('No academic year found in localStorage. Check console for [FeeManagement] logs.');
                    }}
                    className="text-xs text-blue-600 underline cursor-pointer"
                >
                    Debug: check localStorage
                </button>
            </div>
        );
    }

    if (page === 'synthesis')   return <FeeSynthesisPage academicYear={academicYear} />;
    if (page === 'collections') return <CollectionsPage  academicYear={academicYear} />;
    return <OverviewPage academicYear={academicYear} />;
};

export default FeeManagement;