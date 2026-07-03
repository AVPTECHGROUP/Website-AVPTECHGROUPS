import { useState, useEffect } from 'react';
import { X, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { getTimetableConfig, saveTimetableConfig } from '../../../Api/Academics/ScheduleApi';
import { getAcademicYears, getCurrentAcademicYear } from '../../../Api/AcademicYears/AcademicYear';
import { TIMETABLE_CONSTS } from '../../../Constants/StringConstants/TimetableConstants';

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MAX_PERIODS = 10;
const MIN_PERIODS = 1;
const MAX_PERIOD_MINS = 59;
const MIN_PERIOD_MINS = 20;
const MAX_BREAK_MINS = 59;
const MIN_BREAK_MINS = 5;

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
    const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    const [startTime, setStartTime] = useState('08:00');
    const [periodsPerDay, setPeriodsPerDay] = useState(8);
    const [duration, setDuration] = useState(45);
    const [academicYears, setAcademicYears] = useState([]);
    const [selectedYearId, setSelectedYearId] = useState('');
    const [currentYearId, setCurrentYearId] = useState('');
    const [yearsLoading, setYearsLoading] = useState(true);
    const [breaks, setBreaks] = useState([
        { label: '🍎 Recess', afterPeriod: 4, duration: 20 },
        { label: '🥗 Lunch Break', afterPeriod: 6, duration: 40 },
    ]);

    const [preview, setPreview] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState(null);
    const [fieldErrors, setFieldErrors] = useState({});

    // ── Live preview ──────────────────────────────────────────────────────────
    useEffect(() => {
        const safePeriods = Math.min(Math.max(periodsPerDay || MIN_PERIODS, MIN_PERIODS), MAX_PERIODS);
        const safeDuration = Math.min(Math.max(duration || MIN_PERIOD_MINS, MIN_PERIOD_MINS), MAX_PERIOD_MINS);
        const safeBreaks = breaks.map((b) => ({
            ...b,
            duration: Math.min(Math.max(b.duration || MIN_BREAK_MINS, MIN_BREAK_MINS), MAX_BREAK_MINS),
        }));
        setPreview(generateSchedule({ startTime, periodsPerDay: safePeriods, duration: safeDuration, breaks: safeBreaks }));
    }, [startTime, periodsPerDay, duration, breaks]);

    // ── Load academic years + existing config ─────────────────────────────────
    useEffect(() => {
        const loadAll = async () => {
            try {
                setLoading(true);
                setYearsLoading(true);

                const [yearsResult, currentYear] = await Promise.allSettled([
                    getAcademicYears(),
                    getCurrentAcademicYear(),
                ]);

                const rawYears =
                    yearsResult.status === 'fulfilled' ? yearsResult.value : [];
                const yearsList = Array.isArray(rawYears)
                    ? rawYears
                    : Array.isArray(rawYears?.data)
                        ? rawYears.data
                        : [];
                setAcademicYears(yearsList);

                if (currentYear.status === 'fulfilled' && currentYear.value?.id) {
                    const cid = String(currentYear.value.id);
                    setCurrentYearId(cid);
                    setSelectedYearId(cid);
                } else if (yearsList.length > 0) {
                    setSelectedYearId(String(yearsList[0].id));
                }

                const config = await getTimetableConfig();
                if (!config) return;
                if (config.workingDays) setWorkingDays(config.workingDays);
                if (config.startTime) setStartTime(config.startTime);
                if (config.periodsPerDay) setPeriodsPerDay(Math.min(config.periodsPerDay, MAX_PERIODS));
                if (config.periodDurationMinutes) setDuration(Math.min(config.periodDurationMinutes, MAX_PERIOD_MINS));
                if (config.academicYearId) setSelectedYearId(String(config.academicYearId));
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

    // ── Validation ────────────────────────────────────────────────────────────
    const validate = () => {
        const errs = {};

        if (periodsPerDay < MIN_PERIODS || periodsPerDay > MAX_PERIODS) {
            errs.periodsPerDay = TIMETABLE_CONSTS.CONFIG.ERR_PERIOD_RANGE(MIN_PERIODS, MAX_PERIODS);
        }
        if (duration < MIN_PERIOD_MINS || duration > MAX_PERIOD_MINS) {
            errs.duration = TIMETABLE_CONSTS.CONFIG.ERR_DUR_RANGE(MIN_PERIOD_MINS, MAX_PERIOD_MINS);
        }
        breaks.forEach((b, i) => {
            if (!b.duration || b.duration < MIN_BREAK_MINS) {
                errs[`break_${i}`] = TIMETABLE_CONSTS.CONFIG.ERR_MIN_MIN(MIN_BREAK_MINS);
            } else if (b.duration > MAX_BREAK_MINS) {
                errs[`break_${i}`] = TIMETABLE_CONSTS.CONFIG.ERR_MAX_MIN(MAX_BREAK_MINS);
            }
        });
        if (workingDays.length === 0) {
            errs.workingDays = TIMETABLE_CONSTS.CONFIG.ERR_REQ_DAY;
        }

        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async () => {
        if (!validate()) return;
        try {
            setSaving(true);
            await saveTimetableConfig({
                academicYearId: selectedYearId,
                workingDays,
                periodsPerDay,
                periodDurationMinutes: duration,
                startTime,
                breaks,
            });
            showToast('success', TIMETABLE_CONSTS.CONFIG.SUCC_SAVE);
            setTimeout(onClose, 1800);
        } catch (err) {
            showToast('error', err.message || TIMETABLE_CONSTS.CONFIG.ERR_SAVE);
        } finally {
            setSaving(false);
        }
    };

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 3500);
    };

    // ── Periods per day ───────────────────────────────────────────────────────
    const handlePeriodsChange = (val) => {
        if (val === '') {
            setPeriodsPerDay('');
            setFieldErrors((p) => ({ ...p, periodsPerDay: TIMETABLE_CONSTS.CONFIG.ERR_REQ_ENTER(MIN_PERIODS, MAX_PERIODS) }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_PERIODS) return;
        setPeriodsPerDay(n);
        if (n < MIN_PERIODS) {
            setFieldErrors((p) => ({ ...p, periodsPerDay: TIMETABLE_CONSTS.CONFIG.ERR_MIN_PERIOD(MIN_PERIODS) }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e.periodsPerDay; return e; });
        }
    };

    // ── Duration ──────────────────────────────────────────────────────────────
    const handleDurationChange = (val) => {
        if (val === '') {
            setDuration('');
            setFieldErrors((p) => ({ ...p, duration: TIMETABLE_CONSTS.CONFIG.ERR_REQ_ENTER_MIN(MIN_PERIOD_MINS, MAX_PERIOD_MINS) }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_PERIOD_MINS) return;
        setDuration(n);
        if (n < MIN_PERIOD_MINS) {
            setFieldErrors((p) => ({ ...p, duration: TIMETABLE_CONSTS.CONFIG.ERR_MIN_DUR(MIN_PERIOD_MINS) }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e.duration; return e; });
        }
    };

    const handleBreakDuration = (idx, val) => {
        if (val === '') {
            const updated = [...breaks];
            updated[idx] = { ...updated[idx], duration: '' };
            setBreaks(updated);
            setFieldErrors((p) => ({ ...p, [`break_${idx}`]: TIMETABLE_CONSTS.CONFIG.ERR_MIN_MIN(MIN_BREAK_MINS) }));
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        if (n > MAX_BREAK_MINS) return;
        const updated = [...breaks];
        updated[idx] = { ...updated[idx], duration: n };
        setBreaks(updated);
        if (n < MIN_BREAK_MINS) {
            setFieldErrors((p) => ({ ...p, [`break_${idx}`]: TIMETABLE_CONSTS.CONFIG.ERR_MIN_MIN(MIN_BREAK_MINS) }));
        } else {
            setFieldErrors((p) => { const e = { ...p }; delete e[`break_${idx}`]; return e; });
        }
    };

    const handleAfterPeriodChange = (idx, val) => {
        if (val === '') {
            const updated = [...breaks];
            updated[idx] = { ...updated[idx], afterPeriod: '' };
            setBreaks(updated);
            return;
        }
        const n = parseInt(val, 10);
        if (isNaN(n)) return;
        const safePeriods = periodsPerDay || MAX_PERIODS;
        if (n > safePeriods) return;
        const updated = [...breaks];
        updated[idx] = { ...updated[idx], afterPeriod: n };
        setBreaks(updated);
    };

    const handleAfterPeriodBlur = (idx) => {
        const cur = breaks[idx].afterPeriod;
        if (!cur || cur < 1) {
            const updated = [...breaks];
            updated[idx] = { ...updated[idx], afterPeriod: 1 };
            setBreaks(updated);
        }
    };

    const toggleDay = (day) =>
        setWorkingDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <>
            {toast && (
                <Toast type={toast.type} message={toast.message} onDismiss={() => setToast(null)} />
            )}

            <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
                <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col">

                    {/* ── Header ──────────────────────────────────────────────────── */}
                    <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                        <div className="flex items-center gap-2 min-w-0">
                            <Settings size={20} className="text-gray-600 shrink-0" />
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{TIMETABLE_CONSTS.CONFIG.TITLE}</h2>
                        </div>
                        <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                            <X size={18} className="text-gray-500" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
                            {TIMETABLE_CONSTS.CONFIG.LOADING}
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">

                            {/* ── LEFT — Config form ───────────────────────────────────── */}
                            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 sm:space-y-6">

                                {/* Academic Year */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">{TIMETABLE_CONSTS.CONFIG.LBL_YEAR}</p>
                                    <div className="relative">
                                        <select
                                            value={selectedYearId}
                                            onChange={(e) => setSelectedYearId(e.target.value)}
                                            disabled={yearsLoading}
                                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white disabled:bg-gray-50 disabled:text-gray-400 appearance-none pr-28"
                                        >
                                            {yearsLoading ? (
                                                <option value="">{TIMETABLE_CONSTS.CONFIG.PH_LOAD_YEAR}</option>
                                            ) : academicYears.length === 0 ? (
                                                <option value="">{TIMETABLE_CONSTS.CONFIG.PH_NO_YEAR}</option>
                                            ) : (
                                                academicYears.map((yr) => (
                                                    <option key={yr.id} value={String(yr.id)}>
                                                        {yr.label || yr.name || yr.year}
                                                        {String(yr.id) === currentYearId ? TIMETABLE_CONSTS.CONFIG.LBL_CUR_YEAR : ''}
                                                    </option>
                                                ))
                                            )}
                                        </select>
                                        {!yearsLoading && selectedYearId === currentYearId && currentYearId !== '' && (
                                            <span className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-emerald-100 text-emerald-700 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                                                {TIMETABLE_CONSTS.CONFIG.BADGE_CUR_YEAR}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Working Days */}
                                <div>
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">{TIMETABLE_CONSTS.CONFIG.LBL_DAYS}</p>
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
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">{TIMETABLE_CONSTS.CONFIG.LBL_PERIODS}</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                        {/* Start Time */}
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">{TIMETABLE_CONSTS.CONFIG.LBL_START_TIME}</label>
                                            <input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100"
                                            />
                                        </div>

                                        {/* Periods per day */}
                                        <div>
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                {TIMETABLE_CONSTS.CONFIG.LBL_PERIOD_DAY}
                                                <span className="text-gray-400 font-normal ml-1">{TIMETABLE_CONSTS.CONFIG.LBL_MAX_PAREN(MAX_PERIODS)}</span>
                                            </label>
                                            <input
                                                type="number"
                                                min={MIN_PERIODS}
                                                max={MAX_PERIODS}
                                                value={periodsPerDay}
                                                onChange={(e) => handlePeriodsChange(e.target.value)}
                                                onBlur={() => {
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

                                        {/* Duration */}
                                        <div className="col-span-2">
                                            <label className="text-sm text-gray-600 mb-1 block">
                                                {TIMETABLE_CONSTS.CONFIG.LBL_DUR}
                                                <span className="text-gray-400 font-normal ml-1">{TIMETABLE_CONSTS.CONFIG.LBL_DUR_PAREN(MIN_PERIOD_MINS, MAX_PERIOD_MINS)}</span>
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
                                    <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">{TIMETABLE_CONSTS.CONFIG.LBL_BREAKS}</p>
                                    <div className="space-y-3">
                                        {breaks.map((brk, i) => (
                                            <div key={i} className="bg-gray-50 rounded-lg p-3 space-y-2">

                                                {/* Row 1 — label + remove */}
                                                <div className="flex items-center justify-between gap-2">
                                                    <span className="text-sm font-medium text-gray-700 truncate">
                                                        {brk.label}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setBreaks(breaks.filter((_, j) => j !== i));
                                                            setFieldErrors((p) => { const e = { ...p }; delete e[`break_${i}`]; return e; });
                                                        }}
                                                        className="shrink-0 text-red-400 hover:text-red-600 text-xs leading-none"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>

                                                {/* Row 2 — After Period + Duration, side by side, never wrap */}
                                                <div className="flex items-center gap-4">

                                                    {/* After Period */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <label className="text-xs text-gray-500 whitespace-nowrap">
                                                            {TIMETABLE_CONSTS.CONFIG.LBL_AFTER_PERIOD}
                                                            <span className="text-gray-400 ml-1">{TIMETABLE_CONSTS.CONFIG.LBL_AFTER_PAREN(periodsPerDay || MAX_PERIODS)}</span>
                                                        </label>
                                                        <input
                                                            type="number"
                                                            min={1}
                                                            max={periodsPerDay || MAX_PERIODS}
                                                            value={brk.afterPeriod}
                                                            onChange={(e) => handleAfterPeriodChange(i, e.target.value)}
                                                            onBlur={() => handleAfterPeriodBlur(i)}
                                                            className="w-14 border border-gray-200 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-200"
                                                        />
                                                    </div>

                                                    {/* Divider */}
                                                    <div className="w-px h-4 bg-gray-200 shrink-0" />

                                                    {/* Break Duration */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <label className="text-xs text-gray-500 whitespace-nowrap">
                                                            {TIMETABLE_CONSTS.CONFIG.LBL_DUR_MIN}
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
                                                            className={`w-14 border rounded px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-200
                                                                ${fieldErrors[`break_${i}`] ? 'border-red-400 bg-red-50' : 'border-gray-200'}`}
                                                        />
                                                    </div>
                                                </div>

                                                <FieldError msg={fieldErrors[`break_${i}`]} />
                                            </div>
                                        ))}

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setBreaks([
                                                    ...breaks,
                                                    { label: TIMETABLE_CONSTS.CONFIG.DEF_BREAK_LABEL, afterPeriod: periodsPerDay || 1, duration: MIN_BREAK_MINS },
                                                ])
                                            }
                                            className="text-sm text-blue-600 hover:underline font-medium"
                                        >
                                            {TIMETABLE_CONSTS.CONFIG.BTN_ADD_BREAK}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* ── RIGHT — Live preview ──────────────────────────────────── */}
                            <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto bg-gray-50 p-4">
                                <p className="text-xs font-semibold text-gray-500 tracking-widest mb-3">{TIMETABLE_CONSTS.CONFIG.LBL_PREVIEW}</p>
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

                    {/* ── Footer ──────────────────────────────────────────────────── */}
                    <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition"
                        >
                            {TIMETABLE_CONSTS.CONFIG.BTN_CANCEL}
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            disabled={saving || loading}
                            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition"
                        >
                            {saving ? TIMETABLE_CONSTS.CONFIG.BTN_SAVING : TIMETABLE_CONSTS.CONFIG.BTN_SAVE}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}