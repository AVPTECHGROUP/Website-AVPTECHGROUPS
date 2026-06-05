import { useState, useEffect } from 'react';
import { X, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { getTimetableConfig, saveTimetableConfig } from '../../../Api/ScheduleApi';
import { getAcademicYears, getCurrentAcademicYear } from '../../../Api/AcademicYear';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_PERIODS       = 10;
const MIN_PERIODS       = 1;
const MAX_PERIOD_MINS   = 59;
const MIN_PERIOD_MINS   = 20;
const MAX_BREAK_MINS    = 59;
const MIN_BREAK_MINS    = 5;

// ─── Schedule preview generator ───────────────────────────────────────────────
function generateSchedule({ startTime, periodsPerDay, duration, breaks }) {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    let mins = startH * 60 + startM;

    const pad = (n) => String(Math.floor(n)).padStart(2, '0');
    const toHHMM = (m) => `${pad(m / 60)}:${pad(m % 60)}`;

    for (let i = 1; i <= periodsPerDay; i++) {
        const start = toHHMM(mins);
        mins += duration;
        const end = toHHMM(mins);
        slots.push({ type: 'period', label: `Period ${i}`, start, end });

        const brk = breaks.find((b) => b.afterPeriod === i);
        if (brk) {
            const bStart = end;
            mins += brk.duration;
            const bEnd = toHHMM(mins);
            slots.push({ type: 'break', label: brk.label, start: bStart, end: bEnd, duration: brk.duration });
        }
    }
    return slots;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ type, message, onDismiss }) => (
    <div
        className={`fixed top-5 right-5 z-[9999] flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border text-sm font-medium
            ${type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'}`}
        style={{ animation: 'toastIn .2s ease-out' }}
    >
        {type === 'success'
            ? <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
            : <AlertCircle size={16} className="text-red-500 flex-shrink-0" />
        }
        {message}
        <button onClick={onDismiss} className="ml-2 opacity-50 hover:opacity-100">
            <X size={13} />
        </button>
        <style>{`@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}`}</style>
    </div>
);

// ─── Field error helper ───────────────────────────────────────────────────────
const FieldError = ({ msg }) =>
    msg ? <p className="text-[11px] text-red-500 mt-1">{msg}</p> : null;

// ─── Main component ───────────────────────────────────────────────────────────
export default function ScheduleConfig({ onClose }) {
    // ── State ──────────────────────────────────────────────────────────────────
    const [workingDays,   setWorkingDays]   = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    const [startTime,     setStartTime]     = useState('08:00');
    const [periodsPerDay, setPeriodsPerDay] = useState(8);
    const [duration,      setDuration]      = useState(45);
    const [academicYears,   setAcademicYears]   = useState([]);   // list from API
    const [selectedYearId,  setSelectedYearId]  = useState('');   // chosen year id
    const [yearsLoading,    setYearsLoading]    = useState(true);
    const [breaks, setBreaks] = useState([
        { label: '🍎 Recess',       afterPeriod: 4, duration: 20 },
        { label: '🥗 Lunch Break',  afterPeriod: 6, duration: 40 },
    ]);

    const [preview,     setPreview]     = useState([]);
    const [loading,     setLoading]     = useState(false);
    const [saving,      setSaving]      = useState(false);
    const [toast,       setToast]       = useState(null); // { type, message }
    const [fieldErrors, setFieldErrors] = useState({});  // key → message

    // ── Live preview — always uses clamped valid values ───────────────────────
    useEffect(() => {
        const safePeriods  = Math.min(Math.max(periodsPerDay  || MIN_PERIODS,  MIN_PERIODS),  MAX_PERIODS);
        const safeDuration = Math.min(Math.max(duration       || MIN_PERIOD_MINS, MIN_PERIOD_MINS), MAX_PERIOD_MINS);
        const safeBreaks   = breaks.map((b) => ({
            ...b,
            duration: Math.min(Math.max(b.duration || MIN_BREAK_MINS, MIN_BREAK_MINS), MAX_BREAK_MINS),
        }));
        setPreview(generateSchedule({ startTime, periodsPerDay: safePeriods, duration: safeDuration, breaks: safeBreaks }));
    }, [startTime, periodsPerDay, duration, breaks]);

    // ── Load academic years + existing config ──────────────────────────────────
    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                setYearsLoading(true);

                // Fetch years list and current year in parallel
                const [yearsResult, currentYear] = await Promise.allSettled([
                    getAcademicYears(),
                    getCurrentAcademicYear(),
                ]);

                const yearsList =
                    yearsResult.status === 'fulfilled' ? (yearsResult.value?.years ?? []) : [];
                setAcademicYears(yearsList);

                // Default selection: current academic year
                if (currentYear.status === 'fulfilled' && currentYear.value?.id) {
                    setSelectedYearId(String(currentYear.value.id));
                } else if (yearsList.length > 0) {
                    setSelectedYearId(String(yearsList[0].id));
                }

                // Load timetable config
                const config = await getTimetableConfig();
                if (!config) return;
                if (config.workingDays)           setWorkingDays(config.workingDays);
                if (config.startTime)             setStartTime(config.startTime);
                if (config.periodsPerDay)         setPeriodsPerDay(Math.min(config.periodsPerDay, MAX_PERIODS));
                if (config.periodDurationMinutes) setDuration(Math.min(config.periodDurationMinutes, MAX_PERIOD_MINS));
                // Override year selection if config specifies one
                if (config.academicYearId)        setSelectedYearId(String(config.academicYearId));
                if (Array.isArray(config.breaks) && config.breaks.length > 0) {
                    setBreaks(
                        config.breaks.map((b) => ({
                            ...b,
                            duration: Math.max(MIN_BREAK_MINS, Math.min(b.duration || MIN_BREAK_MINS, MAX_BREAK_MINS)),
                        }))
                    );
                }
            } catch {
                /* keep defaults silently */
            } finally {
                setLoading(false);
                setYearsLoading(false);
            }
        };
        loadAll();
    }, []);

    // ── Validation ─────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};

        if (periodsPerDay < MIN_PERIODS || periodsPerDay > MAX_PERIODS) {
            errs.periodsPerDay = `Must be between ${MIN_PERIODS} and ${MAX_PERIODS} periods.`;
        }

        if (duration < MIN_PERIOD_MINS || duration > MAX_PERIOD_MINS) {
            errs.duration = `Period duration must be between ${MIN_PERIOD_MINS} and ${MAX_PERIOD_MINS} minutes.`;
        }

        breaks.forEach((b, i) => {
            if (!b.duration || b.duration < MIN_BREAK_MINS) {
                errs[`break_${i}`] = `Min ${MIN_BREAK_MINS} min.`;
            } else if (b.duration > MAX_BREAK_MINS) {
                errs[`break_${i}`] = `Max ${MAX_BREAK_MINS} min.`;
            }
        });

        if (workingDays.length === 0) {
            errs.workingDays = 'Select at least one working day.';
        }

        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Save ───────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await saveTimetableConfig({
                academicYearId:         selectedYearId,
                workingDays,
                periodsPerDay,
                periodDurationMinutes:  duration,
                startTime,
                breaks,
            });
            showToast('success', 'Configuration saved successfully.');
            setTimeout(onClose, 1800);
        } catch (err) {
            showToast('error', err.message || 'Failed to save configuration.');
        } finally {
            setSaving(false);
        }
    };

    // ── Toast helpers ──────────────────────────────────────────────────────────
    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Periods per day — hard block at MAX, parseInt removes leading zeros ─────
    const handlePeriodsChange = (val) => {
        if (val === '') {
            // Allow field to be cleared while typing; blur will restore min
            setPeriodsPerDay('');
            setFieldErrors((p) => ({ ...p, periodsPerDay: `Required. Enter ${MIN_PERIODS}–${MAX_PERIODS}.` }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_PERIODS) return;              // hard block — refuse the keystroke
        setPeriodsPerDay(n);                       // number stored → no leading zeros
        if (n < MIN_PERIODS) {
            setFieldErrors((p) => ({ ...p, periodsPerDay: `Minimum is ${MIN_PERIODS} period.` }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e.periodsPerDay; return e; });
        }
    };

    // ── Duration — hard block at MAX, parseInt removes leading zeros ──────────
    const handleDurationChange = (val) => {
        if (val === '') {
            setDuration('');
            setFieldErrors((p) => ({ ...p, duration: `Required. Enter ${MIN_PERIOD_MINS}–${MAX_PERIOD_MINS} min.` }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_PERIOD_MINS) return;           // hard block — refuse the keystroke
        setDuration(n);                             // number stored → no leading zeros
        if (n < MIN_PERIOD_MINS) {
            setFieldErrors((p) => ({ ...p, duration: `Min period duration is ${MIN_PERIOD_MINS} minutes.` }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e.duration; return e; });
        }
    };

    // ── Break duration — hard block at MAX, parseInt removes leading zeros ──────
    const handleBreakDuration = (idx, val) => {
        if (val === '') {
            const updated = [...breaks];
            updated[idx] = { ...updated[idx], duration: '' };
            setBreaks(updated);
            setFieldErrors((p) => ({ ...p, [`break_${idx}`]: `Min ${MIN_BREAK_MINS} min.` }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_BREAK_MINS) return;            // hard block — refuse the keystroke
        const updated = [...breaks];
        updated[idx] = { ...updated[idx], duration: n };
        setBreaks(updated);
        if (n < MIN_BREAK_MINS) {
            setFieldErrors((p) => ({ ...p, [`break_${idx}`]: `Min ${MIN_BREAK_MINS} min.` }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e[`break_${idx}`]; return e; });
        }
    };

    const toggleDay = (day) =>
        setWorkingDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );

    // ─── Render ────────────────────────────────────────────────────────────────
    return (
        <>
            {toast && (
                <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
            )}

            <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

                    {/* ── Header ─────────────────────────────────────────────────────── */}
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
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            Loading configuration…
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                            {/* ── LEFT — Config form ─────────────────────────────────────── */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-6">

                                {/* Academic Year — from API */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">ACADEMIC YEAR</p>
                                    <select
                                        value={selectedYearId}
                                        onChange={(e) => setSelectedYearId(e.target.value)}
                                        disabled={yearsLoading}
                                        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white disabled:bg-gray-50 disabled:text-gray-400"
                                    >
                                        {yearsLoading ? (
                                            <option value="">Loading…</option>
                                        ) : academicYears.length === 0 ? (
                                            <option value="">No academic years found</option>
                                        ) : (
                                            academicYears.map((yr) => (
                                                <option key={yr.id} value={String(yr.id)}>
                                                    {yr.label || yr.name || yr.year}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>

                                {/* Working Days */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">WORKING DAYS</p>
                                    <div className="flex flex-wrap gap-2">
                                        {DAYS.map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => toggleDay(day)}
                                                className={`px-4 py-2 rounded-lg text-sm font-medium transition
                                                    ${workingDays.includes(day)
                                                        ? 'bg-[#1e293b] text-white'
                                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                    <FieldError msg={fieldErrors.workingDays} />
                                </div>

                                {/* Period Settings */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">PERIOD SETTINGS</p>
                                    <div className="grid grid-cols-2 gap-4">

                                        {/* Start Time */}
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">Start Time</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        {/* Periods per day — max 10 */}
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                Periods / Day
                                                <span className="text-gray-400 font-normal ml-1">(max {MAX_PERIODS})</span>
                                            </label>
                                            <input
                                                type="number"
                                                min={MIN_PERIODS}
                                                max={MAX_PERIODS}
                                                value={periodsPerDay}
                                                onChange={(e) => handlePeriodsChange(e.target.value)}
                                                onBlur={() => {
                                                    // Clamp on blur: restore to valid range if left empty or below min
                                                    if (!periodsPerDay || periodsPerDay < MIN_PERIODS) {
                                                        setPeriodsPerDay(MIN_PERIODS);
                                                        setFieldErrors((p) => { const e = { ...p }; delete e.periodsPerDay; return e; });
                                                    }
                                                }}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100
                                                    ${fieldErrors.periodsPerDay ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            />
                                            <FieldError msg={fieldErrors.periodsPerDay} />
                                        </div>

                                        {/* Duration — max 59 min */}
                                        <div className="col-span-2">
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                Period Duration (min)
                                                <span className="text-gray-400 font-normal ml-1">({MIN_PERIOD_MINS}–{MAX_PERIOD_MINS} min)</span>
                                            </label>
                                            <input
                                                type="number"
                                                min={MIN_PERIOD_MINS}
                                                max={MAX_PERIOD_MINS}
                                                value={duration}
                                                onChange={(e) => handleDurationChange(e.target.value)}
                                                onBlur={() => {
                                                    if (!duration || duration < MIN_PERIOD_MINS) {
                                                        setDuration(MIN_PERIOD_MINS);
                                                        setFieldErrors((p) => { const e = { ...p }; delete e.duration; return e; });
                                                    }
                                                }}
                                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100
                                                    ${fieldErrors.duration ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                            />
                                            <FieldError msg={fieldErrors.duration} />
                                        </div>
                                    </div>
                                </div>

                                {/* Breaks */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">BREAKS</p>
                                    <div className="space-y-3">
                                        {breaks.map((brk, i) => (
                                            <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="text-sm font-medium text-gray-700 flex-1 min-w-[100px]">
                                                        {brk.label}
                                                    </span>

                                                    {/* After Period */}
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-gray-500 whitespace-nowrap">After Period</label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={periodsPerDay}
                                                            value={brk.afterPeriod}
                                                            onChange={(e) => {
                                                                const updated = [...breaks];
                                                                updated[i] = { ...updated[i], afterPeriod: Number(e.target.value) };
                                                                setBreaks(updated);
                                                            }}
                                                            className="w-16 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none"
                                                        />
                                                    </div>

                                                    {/* Break Duration — validated */}
                                                    <div className="flex items-center gap-2">
                                                        <label className="text-xs text-gray-500 whitespace-nowrap">
                                                            Duration (min)
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={MIN_BREAK_MINS}
                                                            max={MAX_BREAK_MINS}
                                                            value={brk.duration}
                                                            onChange={(e) => handleBreakDuration(i, e.target.value)}
                                                            onBlur={() => {
                                                                const updated = [...breaks];
                                                                const cur = updated[i].duration;
                                                                if (!cur || cur < MIN_BREAK_MINS) {
                                                                    updated[i] = { ...updated[i], duration: MIN_BREAK_MINS };
                                                                    setBreaks(updated);
                                                                    setFieldErrors((p) => { const e = { ...p }; delete e[`break_${i}`]; return e; });
                                                                }
                                                            }}
                                                            className={`w-16 border rounded px-2 py-1 text-xs focus:outline-none
                                                                ${fieldErrors[`break_${i}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                                        />
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBreaks(breaks.filter((_, j) => j !== i));
                                                            setFieldErrors((p) => { const e = { ...p }; delete e[`break_${i}`]; return e; });
                                                        }}
                                                        className="text-red-400 hover:text-red-600 text-xs"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <FieldError msg={fieldErrors[`break_${i}`]} />
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBreaks([
                                                    ...breaks,
                                                    { label: '☕ Break', afterPeriod: periodsPerDay, duration: MIN_BREAK_MINS },
                                                ])
                                            }
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            + Add Break
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT — Live preview ────────────────────────────────────── */}
                            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto bg-gray-50 p-4">
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">LIVE SCHEDULE PREVIEW</p>
                                <div className="space-y-2">
                                    {preview.map((slot, i) => (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm
                                                ${slot.type === 'break'
                                                    ? 'bg-yellow-50 border border-yellow-200'
                                                    : 'bg-white border border-gray-200'}`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {slot.type === 'break'
                                                    ? <span className="text-base">{slot.label.split(' ')[0]}</span>
                                                    : <span className="w-2 h-2 rounded-sm bg-green-400 block shrink-0" />
                                                }
                                                <span className={`font-medium ${slot.type === 'break' ? 'text-yellow-800' : 'text-gray-800'}`}>
                                                    {slot.type === 'break'
                                                        ? slot.label.split(' ').slice(1).join(' ')
                                                        : slot.label}
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

                    {/* ── Footer ─────────────────────────────────────────────────────── */}
                    <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition"
                        >
                            {saving ? 'Saving…' : 'Save Configuration'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}