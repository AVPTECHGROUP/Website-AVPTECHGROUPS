import { useState, useEffect, useMemo } from 'react';
import { BarChart2, Users, Grid, Target } from 'lucide-react';
import { getTimetableById, getTimetableSlots, getTimetableConfig } from '../../../Api/Academics/ScheduleApi';
import SectionSubjectService from '../../../Api/Academics/SectionSubjectService';
import { TIMETABLE_CONSTS }  from '../../../Constants/StringConstants/TimetableConstants';

const colorFor = (id) => TIMETABLE_CONSTS.COLORS.AVATAR_POOL[(id || 0) % TIMETABLE_CONSTS.COLORS.AVATAR_POOL.length].bg;
const getInitials = (name) => {
    if (!name) return '??';
    return name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase();
};

const badgeClass = (code) => {
    const upper = (code || '').toUpperCase();
    const style = TIMETABLE_CONSTS.COLORS.SUBJECT_MAP[upper];
    return style ? `${style.bg} ${style.color}` : 'bg-gray-100 text-gray-700';
};

export default function AnalyticsTab({
    slots: slotsProp = [],
    subjectsList: subjectsListProp = [],
    timetableId,
    sectionId,
    timetableInfo: timetableInfoProp = null,
    config: configProp = null,
}) {
    const [activeTab, setActiveTab] = useState('coverage');

    const [fetchedSlots, setFetchedSlots] = useState(null);
    const [fetchedSubjects, setFetchedSubjects] = useState(null);
    const [fetchedTimetable, setFetchedTimetable] = useState(null);
    const [fetchedConfig, setFetchedConfig] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            promises.push(getTimetableSlots(timetableId).then(d => { if (!cancelled) setFetchedSlots(d || []); }));

        if (!timetableInfoProp)
            promises.push(getTimetableById(timetableId).then(d => { if (!cancelled) setFetchedTimetable(d); }));

        if (!configProp)
            promises.push(getTimetableConfig().then(d => { if (!cancelled) setFetchedConfig(d); }));

        if (subjectsListProp.length === 0 && sectionId)
            promises.push(
                SectionSubjectService.getSubjectsBySection(sectionId).then(data => {
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

    const stats = useMemo(() => {
        const workingDays = config?.workingDays?.length ?? 6;
        const periodsPerDay = config?.periodsPerDay ?? 4;
        const MAX_PERIODS = workingDays * periodsPerDay;

        const totalSlots = timetableInfo?.totalSlots ?? MAX_PERIODS;
        const filledSlots = timetableInfo?.filledSlots ?? slots.length;
        const emptySlots = Math.max(0, totalSlots - filledSlots);
        const completion = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 0;

        const subjectCoverage = subjectsList.map(s => {
            const target = s.weeklyHours ?? (s.total > 0 ? s.total : 0);
            const filled = slots.filter(sl =>
                sl?.subject?.id === s.id ||
                sl?.subjectId === s.id ||
                sl?.subject?.code === s.code
            ).length;
            return { id: s.id, name: s.label || s.name || s.subjectName || '', code: s.code || '', filled, target };
        });

        const onTarget = subjectCoverage.filter(s => s.target > 0 && s.filled >= s.target).length;

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

    const behind = stats.subjectCoverage.filter(s => s.target > 0 && s.filled < s.target);
    const suggestions = [
        stats.emptySlots > 0 && TIMETABLE_CONSTS.ANALYTICS.SUGG_AUTO(stats.emptySlots),
        ...behind.slice(0, 2).map(s =>
            TIMETABLE_CONSTS.ANALYTICS.SUGG_PRIO(s.code, s.target - s.filled)
        ),
        stats.overloaded > 0 && TIMETABLE_CONSTS.ANALYTICS.SUGG_OVER(stats.overloaded, stats.MAX_PERIODS),
    ].filter(Boolean);

    const r = 55, cx = 72, strokeW = 14;
    const circ = 2 * Math.PI * r;
    const dash = (stats.completion / 100) * circ;

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48 text-sm text-gray-400">
                {TIMETABLE_CONSTS.ANALYTICS.LBL_LOADING}
            </div>
        );
    }
    if (error) {
        return <div className="p-4 sm:p-6 text-sm text-red-500">{TIMETABLE_CONSTS.ANALYTICS.LBL_ERR}{error}</div>;
    }

    return (
        <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">

            {/* ── Top stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                <div className="bg-white border border-orange-200 rounded-xl p-3 sm:p-4">
                    <BarChart2 size={18} className="text-orange-400 mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-orange-500">{stats.completion}%</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{TIMETABLE_CONSTS.ANALYTICS.LBL_COMPLETION}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">{stats.filledSlots} / {stats.totalSlots} {TIMETABLE_CONSTS.ANALYTICS.LBL_FILLED}</p>
                </div>

                <div className="bg-white border border-purple-200 rounded-xl p-3 sm:p-4">
                    <Target size={16} className="text-purple-400 mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-purple-500">{stats.onTarget}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{TIMETABLE_CONSTS.ANALYTICS.LBL_ON_TARGET}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">{stats.subjectCoverage.length - stats.onTarget} {TIMETABLE_CONSTS.ANALYTICS.LBL_BEHIND}</p>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                    <Grid size={16} className="text-gray-400 mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-gray-700">{stats.emptySlots}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{TIMETABLE_CONSTS.ANALYTICS.LBL_EMPTY_SLOTS}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">{TIMETABLE_CONSTS.ANALYTICS.LBL_AUTO_RES}</p>
                </div>

                <div className="bg-white border border-red-200 rounded-xl p-3 sm:p-4">
                    <Users size={16} className="text-red-400 mb-1" />
                    <p className="text-2xl sm:text-3xl font-bold text-red-500">{stats.overloaded}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">{TIMETABLE_CONSTS.ANALYTICS.LBL_OVERLOADED}</p>
                    <p className="text-xs text-gray-400 hidden sm:block">{TIMETABLE_CONSTS.ANALYTICS.LBL_ABOVE_PW}{stats.MAX_PERIODS}{TIMETABLE_CONSTS.ANALYTICS.LBL_PW}</p>
                </div>
            </div>

            {/* Bottom area - stacks on mobile, side-by-side on lg */}
            <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">

                {/* Donut + suggestions */}
                <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 flex flex-col items-center gap-4 w-full lg:w-60 shrink-0">
                    {/* Donut */}
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
                            [TIMETABLE_CONSTS.ANALYTICS.CHART_FILLED, stats.filledSlots, 'text-blue-600'],
                            [TIMETABLE_CONSTS.ANALYTICS.CHART_EMPTY, stats.emptySlots, 'text-gray-500'],
                            [TIMETABLE_CONSTS.ANALYTICS.CHART_TOTAL, stats.totalSlots, 'text-gray-700'],
                        ].map(([l, v, c]) => (
                            <div key={l}>
                                <p className={`text-xl font-bold ${c}`}>{v}</p>
                                <p className="text-xs text-gray-400">{l}</p>
                            </div>
                        ))}
                    </div>

                    {suggestions.length > 0 && (
                        <div className="w-full bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-1.5">
                            <p className="font-semibold text-gray-700">{TIMETABLE_CONSTS.ANALYTICS.SUGG_TITLE}</p>
                            {suggestions.map((s, i) => <p key={i}>{s}</p>)}
                        </div>
                    )}
                </div>

                {/* Tabs panel */}
                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden min-w-0">
                    <div className="flex border-b border-gray-100">
                        {[['coverage', TIMETABLE_CONSTS.ANALYTICS.TAB_COVERAGE], ['load', TIMETABLE_CONSTS.ANALYTICS.TAB_LOAD]].map(([key, label]) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`px-3 sm:px-5 py-3 text-xs sm:text-sm font-medium transition-colors flex-1 sm:flex-none
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
                            <div className="p-6 text-center text-gray-400 text-sm">{TIMETABLE_CONSTS.ANALYTICS.NO_SUBJ}</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.subjectCoverage.map(s => {
                                    const hasTarget = s.target > 0;
                                    const pct = hasTarget ? Math.min(Math.round((s.filled / s.target) * 100), 100) : 0;
                                    return (
                                        <div key={s.id || s.code} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                                            <span className={`text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded shrink-0 ${badgeClass(s.code)}`}>
                                                {s.code || '--'}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-700 flex-1 min-w-0 truncate">
                                                {s.name || TIMETABLE_CONSTS.ANALYTICS.UNNAMED}
                                            </span>
                                            {hasTarget && (
                                                <div className="hidden sm:flex flex-1 max-w-[120px] lg:max-w-[140px]">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div className="h-1.5 rounded-full bg-blue-400" style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            )}
                                            <span className="text-xs text-gray-500 shrink-0">
                                                {hasTarget ? `${s.filled}/${s.target}` : `${s.filled}`}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}

                    {/* Teacher load tab */}
                    {activeTab === 'load' && (
                        stats.teachers.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">{TIMETABLE_CONSTS.ANALYTICS.NO_TEACHER}</div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {stats.teachers.map(t => {
                                    const isOver = t.count > stats.MAX_PERIODS;
                                    const pct = Math.min(Math.round((t.count / stats.MAX_PERIODS) * 100), 100);
                                    return (
                                        <div key={t.id} className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3">
                                            <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[${colorFor(t.id)}] text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                                                {getInitials(t.name)}
                                            </span>
                                            <span className="text-xs sm:text-sm text-gray-700 flex-1 min-w-0 truncate">{t.name}</span>
                                            <div className="hidden sm:flex flex-1 max-w-[120px] lg:max-w-[140px]">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                    <div className={`h-1.5 rounded-full ${isOver ? 'bg-red-400' : 'bg-blue-400'}`}
                                                        style={{ width: `${pct}%` }} />
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-500 shrink-0">{t.count}{TIMETABLE_CONSTS.ANALYTICS.LBL_PER_WEEK}</span>
                                            {isOver && (
                                                <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0 hidden sm:inline">
                                                    {TIMETABLE_CONSTS.ANALYTICS.LBL_OVERLOAD_BADGE}
                                                </span>
                                            )}
                                            {isOver && (
                                                <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 sm:hidden" title={TIMETABLE_CONSTS.ANALYTICS.LBL_OVERLOAD_BADGE} />
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