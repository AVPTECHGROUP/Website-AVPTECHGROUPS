import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { getTimetableConfig, saveTimetableConfig } from '../../../api/ScheduleApi';

function generateSchedule({ startTime, periodsPerDay, duration, breaks }) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;

    for (let i = 1; i <= periodsPerDay; i++) {
        const breakAfter = breaks.find(b => b.afterPeriod === i);
        const start = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
        currentMinutes += duration;
        const end = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
        slots.push({ type: 'period', label: `Period ${i}`, start, end });

        if (breakAfter) {
            const bStart = end;
            currentMinutes += breakAfter.duration;
            const bEnd = `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`;
            slots.push({ type: 'break', label: breakAfter.label, start: bStart, end: bEnd, duration: breakAfter.duration });
        }
    }
    return slots;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ScheduleConfig({ onClose }) {
    const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    const [startTime, setStartTime] = useState('08:00');
    const [periodsPerDay, setPeriodsPerDay] = useState(8);
    const [duration, setDuration] = useState(45);
    const [yearLabel, setYearLabel] = useState('2025-2026');
    const [breaks, setBreaks] = useState([
        { label: '🍎 Recess', afterPeriod: 4, duration: 20 },
        { label: '🥗 Lunch Break', afterPeriod: 6, duration: 40 },
    ]);
    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    // Load existing config on mount
    useEffect(() => {
        loadConfig();
    }, []);

    useEffect(() => {
        setPreview(generateSchedule({ startTime, periodsPerDay, duration, breaks }));
    }, [startTime, periodsPerDay, duration, breaks]);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await getTimetableConfig();
            if (data) {
                if (data.workingDays) setWorkingDays(data.workingDays);
                if (data.startTime) setStartTime(data.startTime);
                if (data.periodsPerDay) setPeriodsPerDay(data.periodsPerDay);
                if (data.periodDurationMinutes) setDuration(data.periodDurationMinutes);
                if (data.academicYear) setYearLabel(data.academicYear);
                if (data.breaks) setBreaks(data.breaks);
            }
        } catch { /* keep defaults */ }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError('');
            await saveTimetableConfig({
                academicYear: yearLabel,
                workingDays,
                periodsPerDay,
                periodDurationMinutes: duration,
                startTime,
                breaks,
            });
            setSuccessMsg('Configuration saved ✓');
            setTimeout(() => { setSuccessMsg(''); onClose(); }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to save configuration');
        } finally {
            setSaving(false);
        }
    };

    const toggleDay = (day) => {
        setWorkingDays(prev =>
            prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
        );
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Settings size={20} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">School Time Configuration</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading config...</div>
                ) : (
                    <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                        {/* Left - Config */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
                            {successMsg && <p className="text-xs text-green-600 bg-green-50 px-3 py-2 rounded-lg">{successMsg}</p>}

                            {/* Academic Year */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">ACADEMIC YEAR</p>
                                <input value={yearLabel} onChange={e => setYearLabel(e.target.value)}
                                    placeholder="e.g. 2025-2026"
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                            </div>

                            {/* Working Days */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">WORKING DAYS</p>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(day => (
                                        <button key={day} onClick={() => toggleDay(day)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition
                        ${workingDays.includes(day) ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                            {day}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Period Settings */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">PERIOD SETTINGS</p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                                        <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600 mb-1 block">Periods / Day</label>
                                        <input type="number" min={1} max={12} value={periodsPerDay}
                                            onChange={e => setPeriodsPerDay(Number(e.target.value))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-600 mb-1 block">Duration (min)</label>
                                        <input type="number" min={20} max={120} value={duration}
                                            onChange={e => setDuration(Number(e.target.value))}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
                                    </div>
                                </div>
                            </div>

                            {/* Breaks */}
                            <div>
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">BREAKS</p>
                                <div className="space-y-3">
                                    {breaks.map((brk, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3 flex-wrap">
                                            <span className="text-sm font-medium text-gray-700 flex-1 min-w-25">{brk.label}</span>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500">After Period</label>
                                                <input type="number" min={1} max={periodsPerDay} value={brk.afterPeriod}
                                                    onChange={e => {
                                                        const updated = [...breaks];
                                                        updated[i] = { ...updated[i], afterPeriod: Number(e.target.value) };
                                                        setBreaks(updated);
                                                    }}
                                                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <label className="text-xs text-gray-500">Duration (min)</label>
                                                <input type="number" min={5} max={90} value={brk.duration}
                                                    onChange={e => {
                                                        const updated = [...breaks];
                                                        updated[i] = { ...updated[i], duration: Number(e.target.value) };
                                                        setBreaks(updated);
                                                    }}
                                                    className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none" />
                                            </div>
                                            <button onClick={() => setBreaks(breaks.filter((_, j) => j !== i))}
                                                className="text-red-400 hover:text-red-600 text-xs">✕</button>
                                        </div>
                                    ))}
                                    <button onClick={() => setBreaks([...breaks, { label: '☕ Break', afterPeriod: periodsPerDay, duration: 15 }])}
                                        className="text-sm text-blue-600 hover:underline font-medium">
                                        + Add Break
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Right - Live Preview */}
                        <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto bg-gray-50 p-4">
                            <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">LIVE SCHEDULE PREVIEW</p>
                            <div className="space-y-2">
                                {preview.map((slot, i) => (
                                    <div key={i}
                                        className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm
                        ${slot.type === 'break' ? 'bg-yellow-50 border border-yellow-200' : 'bg-white border border-gray-200'}`}>
                                        <div className="flex items-center gap-2">
                                            {slot.type === 'break'
                                                ? <span className="text-base">{slot.label.split(' ')[0]}</span>
                                                : <span className="w-2 h-2 rounded-sm bg-green-400 block shrink-0" />}
                                            <span className={`font-medium ${slot.type === 'break' ? 'text-yellow-800' : 'text-gray-800'}`}>
                                                {slot.type === 'break' ? slot.label.split(' ').slice(1).join(' ') : slot.label}
                                            </span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs text-gray-500">{slot.start}–{slot.end}</span>
                                            {slot.type === 'break' && (
                                                <span className="ml-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-1.5 py-0.5 rounded">
                                                    {slot.duration} min
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || loading}
                        className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition">
                        {saving ? 'Saving...' : 'Save Configuration'}
                    </button>
                </div>
            </div>
        </div>
    );
}