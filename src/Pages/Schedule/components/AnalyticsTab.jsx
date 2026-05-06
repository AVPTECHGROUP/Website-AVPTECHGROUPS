import { useState } from 'react';
import { BarChart2, Users, Grid, Target } from 'lucide-react';

const TEACHER_LOAD = [
    { name: 'Kavita Rao', initials: 'KR', color: 'bg-pink-500', hours: 18, max: 22 },
    { name: 'Rajesh Kumar', initials: 'RK', color: 'bg-blue-500', hours: 24, max: 22 },
    { name: 'Priya Patel', initials: 'PP', color: 'bg-orange-500', hours: 16, max: 22 },
    { name: 'Meena Sharma', initials: 'MS', color: 'bg-green-500', hours: 20, max: 22 },
    { name: 'Suresh Nair', initials: 'SN', color: 'bg-purple-500', hours: 22, max: 22 },
    { name: 'Anjali Singh', initials: 'AS', color: 'bg-amber-500', hours: 12, max: 22 },
    { name: 'Amit Joshi', initials: 'AJ', color: 'bg-cyan-500', hours: 8, max: 22 },
];

export default function AnalyticsTab({ slots = [], subjectsList = [] }) {
    const [activeTab, setActiveTab] = useState('coverage');

    const totalSlots = 48;
    const filled = slots.length;
    const empty = totalSlots - filled;
    const completion = Math.round((filled / totalSlots) * 100);

    const subjectsFilled = subjectsList.map(s => {
        const filled = slots.filter(
            sl => sl?.subject?.id === s.id || sl?.subject?.code === s.code
        ).length;

        return {
            ...s,
            filled,
            total: s.total ?? null,
        };
    });

    const onTarget = subjectsFilled.filter(
        s => s.total && s.total > 0 && s.filled >= s.total
    ).length;
    const overloaded = TEACHER_LOAD.filter(t => t.hours > t.max).length;

    return (
        <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white border border-orange-200 rounded-xl p-4">
                    <BarChart2 size={18} className="text-orange-400 mb-1" />
                    <p className="text-3xl font-bold text-orange-500">{completion}%</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Completion</p>
                    <p className="text-xs text-gray-400">{filled} / {totalSlots} slots filled</p>
                </div>
                <div className="bg-white border border-purple-200 rounded-xl p-4">
                    <Target size={18} className="text-purple-400 mb-1" />
                    <p className="text-3xl font-bold text-purple-500">{onTarget}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Subjects On Target</p>
                    <p className="text-xs text-gray-400">
                        {subjectsFilled.length - onTarget} behind
                    </p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <Grid size={18} className="text-gray-400 mb-1" />
                    <p className="text-3xl font-bold text-gray-700">{empty}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Empty Slots</p>
                    <p className="text-xs text-gray-400">Auto-fill can resolve these</p>
                </div>
                <div className="bg-white border border-red-200 rounded-xl p-4">
                    <Users size={18} className="text-red-400 mb-1" />
                    <p className="text-3xl font-bold text-red-500">{overloaded}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-0.5 uppercase tracking-wide">Overloaded Teachers</p>
                    <p className="text-xs text-gray-400">Above 22 h/w threshold</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-4 w-full lg:w-60 shrink-0">
                    <div className="relative w-32 h-32">
                        <svg viewBox="0 0 36 36" className="w-32 h-32 -rotate-90">
                            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" strokeWidth="3.8" />
                            <circle cx="18" cy="18" r="15.9" fill="none"
                                stroke={completion > 0 ? '#3b82f6' : '#e5e7eb'}
                                strokeWidth="3.8"
                                strokeDasharray={`${completion} ${100 - completion}`}
                                strokeLinecap="round" />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">{completion}%</span>
                        </div>
                    </div>

                    <div className="flex justify-around w-full text-center">
                        {[['FILLED', filled, 'text-blue-600'], ['EMPTY', empty, 'text-gray-500'], ['TOTAL', totalSlots, 'text-gray-700']].map(([l, v, c]) => (
                            <div key={l}>
                                <p className={`text-xl font-bold ${c}`}>{v}</p>
                                <p className="text-xs text-gray-400">{l}</p>
                            </div>
                        ))}
                    </div>

                    <div className="w-full bg-gray-50 rounded-lg p-3 text-xs text-gray-600 space-y-2">
                        <p className="font-semibold text-gray-700">⚡ Suggestions</p>
                        {empty > 0 && <p>Use <b>Auto-fill</b> to place {empty} remaining slots.</p>}
                        {subjectsFilled
                            .filter(s => s.total && s.total > 0 && s.filled < s.total)
                            .slice(0, 2).map(s => (
                                <p key={s.id || s.code}>Prioritize <b>{s.code}</b>, {s.total - s.filled} periods behind target.</p>
                            ))}
                        {overloaded > 0 && <p>{overloaded} teacher(s) exceed 22 h/w — redistribute load.</p>}
                    </div>
                </div>

                <div className="flex-1 bg-white border border-gray-200 rounded-xl overflow-hidden min-w-0">
                    <div className="flex border-b border-gray-100">
                        {[['coverage', '📘 Subject Coverage'], ['load', '👥 Teacher Load']].map(([key, label]) => (
                            <button key={key} onClick={() => setActiveTab(key)}
                                className={`px-5 py-3 text-sm font-medium transition-colors flex-1 sm:flex-none ${activeTab === key ? 'border-b-2 border-[#1e293b] text-[#1e293b] bg-gray-50/50' : 'text-gray-500 hover:text-gray-700'}`}>
                                {label}
                            </button>
                        ))}
                    </div>

                    {activeTab === 'coverage' && (
                        subjectsFilled.length === 0 ? (
                            <div className="p-6 text-center text-gray-400 text-sm">
                                No subjects available for this timetable.
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {subjectsFilled.map(s => {
                                    const hasTarget = s.total && s.total > 0;
                                    const pct = hasTarget ? Math.round((s.filled / s.total) * 100) : 0;
                                    const left = hasTarget ? s.total - s.filled : 0;

                                    return (
                                        <div key={s.id || s.code} className="flex items-center gap-3 px-4 py-3">
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded shrink-0 ${s.color || 'bg-gray-100 text-gray-700'}`}>
                                                {s.code || '--'}
                                            </span>

                                            <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">
                                                {s.label || s.name || 'Unnamed Subject'}
                                            </span>

                                            {hasTarget && (
                                                <div className="hidden sm:flex flex-1 max-w-35">
                                                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                        <div
                                                            className="h-1.5 rounded-full bg-blue-400"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <span className="text-xs text-gray-500">
                                                {hasTarget ? `${s.filled}/${s.total}` : `${s.filled} slots`}
                                            </span>

                                            {hasTarget ? (
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )
                    )}
                    {activeTab === 'load' && (
                        <div className="divide-y divide-gray-50">
                            {TEACHER_LOAD.map(t => {
                                const isOver = t.hours > t.max;
                                const pct = Math.min(Math.round((t.hours / t.max) * 100), 100);
                                return (
                                    <div key={t.name} className="flex items-center gap-3 px-4 py-3">
                                        <span className={`w-8 h-8 rounded-full ${t.color} text-white text-xs font-bold flex items-center justify-center shrink-0`}>{t.initials}</span>
                                        <span className="text-sm text-gray-700 flex-1 min-w-0 truncate">{t.name}</span>
                                        <div className="hidden sm:flex flex-1 max-w-35">
                                            <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                                                <div className={`h-1.5 rounded-full ${isOver ? 'bg-red-400' : 'bg-blue-400'}`} style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 shrink-0">{t.hours}h/w</span>
                                        {isOver && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-600 shrink-0">Overloaded</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}