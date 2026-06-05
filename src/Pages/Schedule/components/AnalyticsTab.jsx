import { useState, useEffect, useMemo } from 'react';
import { BarChart2, Users, Grid, Target } from 'lucide-react';
import { getTimetableById, getTimetableSlots, getTimetableConfig } from '../../../Api/ScheduleApi';
import { getSubjectsBySection } from '../../../Api/TeachersAPI';

const AVATAR_COLORS = [
    'bg-pink-500', 'bg-blue-500', 'bg-orange-500', 'bg-green-500',
    'bg-purple-500', 'bg-amber-500', 'bg-cyan-500', 'bg-red-500',
    'bg-teal-500', 'bg-violet-500',
];
const SUBJECT_BADGE_COLORS = {
    MATH: 'bg-blue-100 text-blue-700',
    ENG: 'bg-green-100 text-green-700',
    PHY: 'bg-sky-100 text-sky-700',
    CHEM: 'bg-pink-100 text-pink-700',
    BIO: 'bg-emerald-100 text-emerald-700',
    CS: 'bg-cyan-100 text-cyan-700',
    HIN: 'bg-purple-100 text-purple-700',
    SST: 'bg-orange-100 text-orange-700',
};

const colorFor = (id) => AVATAR_COLORS[(id || 0) % AVATAR_COLORS.length];
const getInitials = (name) => {
    if (!name) return '??';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
};
const badgeClass = (code) => SUBJECT_BADGE_COLORS[code] || 'bg-gray-100 text-gray-700';

export default function AnalyticsTab({
    // Props passed from CreateSchedule parent
    slots: slotsProp = [],
    subjectsList: subjectsListProp = [],
    timetableId,
    sectionId,
    timetableInfo: timetableInfoProp = null,
    config: configProp = null,
}) {
    const [activeTab, setActiveTab] = useState('coverage');

    // Only fetch what parent didn't provide
    const [fetchedSlots, setFetchedSlots] = useState(null);
    const [fetchedSubjects, setFetchedSubjects] = useState(null);
    const [fetchedTimetable, setFetchedTimetable] = useState(null);
    const [fetchedConfig, setFetchedConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Prefer parent props, fallback to fetched
    const slots = slotsProp.length > 0 ? slotsProp : (fetchedSlots ?? []);
    const subjectsList = subjectsListProp.length > 0 ? subjectsListProp : (fetchedSubjects ?? []);
    const timetableInfo = timetableInfoProp ?? fetchedTimetable ?? null;
    const config = configProp ?? fetchedConfig ?? null;

    useEffect(() => {
        const needsFetch =
            slotsProp.length === 0 ||
            subjectsListProp.length === 0 ||
            !timetableInfoProp ||
            !configProp;

        if (!needsFetch || !timetableId) return;

        let cancelled = false;
        setLoading(true);
        setError(null);

        const promises = [];

        if (slotsProp.length === 0)
            promises.push(
                getTimetableSlots(timetableId)
                    .then(d => { if (!cancelled) setFetchedSlots(d || []); })
            );

        if (!timetableInfoProp)
            promises.push(
                getTimetableById(timetableId)
                    .then(d => { if (!cancelled) setFetchedTimetable(d); })
            );

        if (!configProp)
            promises.push(
                getTimetableConfig()
                    .then(d => { if (!cancelled) setFetchedConfig(d); })
            );

        if (subjectsListProp.length === 0 && sectionId)
            promises.push(
                getSubjectsBySection(sectionId).then(data => {
                    if (!cancelled) {
                        setFetchedSubjects((data || []).map(s => ({
                            id: s.id || s.subjectId,
                            code: s.code || s.subjectCode || '',
                            label: s.name || s.subjectName || '',
                            weeklyHours: s.weeklyHours || 0,
                        })));
                    }
                })
            );

        Promise.all(promises)
            .catch(err => { if (!cancelled) setError(err.message); })
            .finally(() => { if (!cancelled) setLoading(false); });

        return () => { cancelled = true; };
    }, [timetableId, sectionId]);

    // ── Derived stats ──────────────────────────────────────────
    const stats = useMemo(() => {
        const workingDays = config?.workingDays?.length ?? 6;
        const periodsPerDay = config?.periodsPerDay ?? 4;
        const MAX_PERIODS = workingDays * periodsPerDay;

        const totalSlots = timetableInfo?.totalSlots ?? MAX_PERIODS;
        const filledSlots = timetableInfo?.filledSlots ?? slots.length;
        const emptySlots = Math.max(0, totalSlots - filledSlots);
        const completion = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

        // Subject coverage
        // Parent's subjectsList has { id, code, label, total (=0 hardcoded) }
        // weeklyHours comes from API — use it as target if total is 0
        const subjectCoverage = subjectsList.map(s => {
            const target = s.weeklyHours ?? (s.total > 0 ? s.total : 0);
            const filled = slots.filter(sl =>
                sl?.subject?.id === s.id ||
                sl?.subjectId === s.id ||
                sl?.subject?.code === s.code
            ).length;
            return {
                id: s.id,
                name: s.label || s.name || s.subjectName || '',
                code: s.code || '',
                filled,
                target,
            };
        });

        const onTarget = subjectCoverage.filter(s => s.target > 0 && s.filled >= s.target).length;

        // Teacher load from slots
        const teacherMap = {};
        slots.forEach(sl => {
            const id = sl?.teacher?.id ?? sl?.teacherId;
            const name = sl?.teacher?.name ?? sl?.teacherName;
            if (!id) return;
            if (!teacherMap[id]) teacherMap[id] = { id, name: name || `Teacher ${id}`, count: 0 };
            teacherMap[id].count++;
        });
        const teachers = Object.values(teacherMap).sort((a, b) => b.count - a.count);
        const overloaded = teachers.filter(t => t.count > MAX_PERIODS).length;

        return { totalSlots, filledSlots, emptySlots, completion, subjectCoverage, onTarget, teachers, overloaded, MAX_PERIODS };
    }, [slots, subjectsList, timetableInfo, config]);

    // ── Suggestions ───────────────────────────────────────────
    const behind = stats.subjectCoverage.filter(s => s.target > 0 && s.filled < s.target);
    const suggestions = [
        stats.emptySlots > 0 && `Use Auto-fill to place ${stats.emptySlots} remaining slot${stats.emptySlots > 1 ? 's' : ''}.`,
        ...behind.slice(0, 2).map(s =>
            `Prioritize ${s.code} — ${s.target - s.filled} period${s.target - s.filled > 1 ? 's' : ''} behind target.`
        ),
        stats.overloaded > 0 && `${stats.overloaded} teacher${stats.overloaded > 1 ? 's' : ''} exceed ${stats.MAX_PERIODS} periods/week.`,
    ].filter(Boolean);

    // ── Donut ─────────────────────────────────────────────────
    const r = 55, cx = 72, strokeW = 14;
    const circ = 2 * Math.PI * r;
    const dash = (stats.completion / 100) * circ;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                Loading analytics…
            </div>
        );
    }
    if (error) {
        return <div className="p-6 text-sm text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">

            {/* ── Top stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-white border border-orange-200 rounded-xl p-3 sm:p-4">
                    <BarChart2 size={18} className="text-orange-400 mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-orange-500">{stats.completion}%</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Completion</p>
                    <p className="text-xs text-gray-400">{stats.filledSlots} / {stats.totalSlots} slots filled</p>
                </div>

                <div className="bg-white border border-purple-200 rounded-xl p-4">
                    <Target size={18} className="text-purple-400 mb-1" />
                    <p className="text-3xl font-bold text-purple-500">{stats.onTarget}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Subjects on target</p>
                    <p className="text-xs text-gray-400">{stats.subjectCoverage.length - stats.onTarget} behind</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Grid size={18} className="text-gray-400 mb-1" />
                    <p className="text-3xl font-bold text-gray-700">{stats.emptySlots}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Empty slots</p>
                    <p className="text-xs text-gray-400">Auto-fill can resolve these</p>
                </div>

                <div className="bg-white border border-red-200 rounded-xl p-4">
                    <Users size={18} className="text-red-400 mb-1" />
                    <p className="text-3xl font-bold text-red-500">{stats.overloaded}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Overloaded teachers</p>
                    <p className="text-xs text-gray-400">Above {stats.MAX_PERIODS} periods/week</p>
                </div>
            </div>

            {/* ── Bottom area ── */}
            <div className="flex flex-col lg:flex-row gap-4">

                {/* Donut + suggestions */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-4 w-full lg:w-60 shrink-0">
                    <div className="relative" style={{ width: cx * 2, height: cx * 2 }}>
                        <svg viewBox={`0 0 ${cx * 2} ${cx * 2}`} width={cx * 2} height={cx * 2}
                            style={{ transform: 'rotate(-90deg)' }}>
                            <circle cx={cx} cy={cx} r={r} fill="none" stroke="#f3f4f6" strokeWidth={strokeW} />
                            <circle cx={cx} cy={cx} r={r} fill="none"
                                stroke={stats.completion > 0 ? '#3b82f6' : '#e5e7eb'}
                                strokeWidth={strokeW}
                                strokeDasharray={`${dash} ${circ - dash}`}
                                strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">{stats.completion}%</span>
                        </div>
                    </div>

                    <div className="flex justify-around w-full text-center">
                        {[
                            ['FILLED', stats.filledSlots, 'text-blue-600'],
                            ['EMPTY', stats.emptySlots, 'text-gray-500'],
                            ['TOTAL', stats.totalSlots, 'text-gray-700'],
                        ].map(([l, v, c]) => (
                            <div key={l}>
                                <p className={`text-xl font-bold ${c}`}>{v}</p>
                                <p className="text-xs text-gray-400">{l}</p>
                            </div>
                        ))}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="w-full bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1.5">
                            <p className="font-semibold text-gray-700">⚡ Suggestions</p>
                            {suggestions.map((s, i) => <p key={i}>{s}</p>)}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden min-w-0">
                    <div className="flex border-b border-gray-100">
                        {[['coverage', '📘 Subject coverage'], ['load', '👥 Teacher load']].map(([key, label]) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`px-5 py-3 text-sm font-medium transition-colors flex-1 sm:flex-none
                                    ${activeTab === key
                                        ? 'border-b-2 border-[#1e293b] text-[#1e293b] bg-gray-50/50'
                                        : 'text-gray-500 hover:text-gray-700'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {/* Subject coverage tab */}
                    {activeTab === 'coverage' && (
                        stats.subjectCoverage.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">No subjects available.</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.subjectCoverage.map(s => {
                                    const hasTarget = s.target > 0;
                                    const pct = hasTarget ? Math.min(Math.round((s.filled / s.target) * 100), 100) : 0;
                                    const left = hasTarget ? s.target - s.filled : 0;
                                    return (
                                        <div key={s.id || s.code} className="flex items-center gap-3 px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${badgeClass(s.code)}`}>
                                                {s.code || '--'}
                                            </span>
                                            <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                                                {s.name || 'Unnamed'}
                                            </span>
                                            {hasTarget && (
                                                <div className="hidden sm:flex flex-1 max-w-[140px]">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div className="h-1.5 rounded-full bg-blue-400"
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500">
                                                {hasTarget ? `${s.filled}/${s.target}` : `${s.filled} slots`}
                                            </span>
                                            {/* {hasTarget ? (
                                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${left === 0
                                                        ? 'bg-green-100 text-green-700'
                                                        : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {left === 0 ? '✓ Done' : `${left} left`}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                    No target
                                                </span>
                                            )} */}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Teacher load tab */}
                    {activeTab === 'load' && (
                        stats.teachers.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">No teacher data in slots.</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.teachers.map(t => {
                                    const isOver = t.count > stats.MAX_PERIODS;
                                    const pct = Math.min(Math.round((t.count / stats.MAX_PERIODS) * 100), 100);
                                    return (
                                        <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                                            <span className={`w-8 h-8 rounded-full ${colorFor(t.id)} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                {getInitials(t.name)}
                                            </span>
                                            <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{t.name}</span>
                                            <div className="hidden sm:flex flex-1 max-w-[140px]">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${isOver ? 'bg-red-400' : 'bg-blue-400'}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0">{t.count} periods/w</span>
                                            {isOver && (
                                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">
                                                    Overloaded
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
}