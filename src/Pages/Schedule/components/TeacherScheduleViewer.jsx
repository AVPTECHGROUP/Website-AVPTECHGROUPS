import { useState, useEffect } from 'react';
import {
    X, User, ChevronDown, BookOpen, Clock,
    Home, Coffee, CalendarDays, AlertCircle,
    WifiOff, CheckCircle2, Hash
} from 'lucide-react';
import { getTeachers } from '../../../Api/Teachers/TeachersAPI';
import { getTeacherSchedule } from '../../../Api/Academics/ScheduleApi';

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Format today's date as yyyy-MM-dd for the date input default
function todayISO() {
    return new Date().toISOString().split('T')[0];
}

// Friendly display: "Mon, 9 May 2026"
function formatDisplayDate(isoDate) {
    if (!isoDate) return '';
    return new Date(isoDate).toLocaleDateString('en-IN', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
    });
}

// Derive duration label from HH:mm strings
function getDuration(start, end) {
    if (!start || !end) return '';
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);
    const mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) return '';
    return `${mins} min`;
}

const PERIOD_COLORS = [
    { bg: 'bg-blue-50',    border: 'border-blue-200',   icon: 'text-blue-500',   badge: 'bg-blue-100 text-blue-700',    dot: 'bg-blue-400' },
    { bg: 'bg-violet-50',  border: 'border-violet-200', icon: 'text-violet-500', badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-400' },
    { bg: 'bg-emerald-50', border: 'border-emerald-200',icon: 'text-emerald-500',badge: 'bg-emerald-100 text-emerald-700',dot: 'bg-emerald-400' },
    { bg: 'bg-orange-50',  border: 'border-orange-200', icon: 'text-orange-500', badge: 'bg-orange-100 text-orange-700', dot: 'bg-orange-400' },
    { bg: 'bg-pink-50',    border: 'border-pink-200',   icon: 'text-pink-500',   badge: 'bg-pink-100 text-pink-700',    dot: 'bg-pink-400' },
    { bg: 'bg-cyan-50',    border: 'border-cyan-200',   icon: 'text-cyan-500',   badge: 'bg-cyan-100 text-cyan-700',    dot: 'bg-cyan-400' },
    { bg: 'bg-amber-50',   border: 'border-amber-200',  icon: 'text-amber-500',  badge: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TeacherScheduleViewer({ onClose }) {
    const [teachers, setTeachers] = useState([]);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedDate, setSelectedDate] = useState(todayISO());
    const [scheduleData, setScheduleData] = useState(null);   // full API data object
    const [loadingTeachers, setLoadingTeachers] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [errorTeachers, setErrorTeachers] = useState(null);
    const [errorSchedule, setErrorSchedule] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState('');

    // Load teachers on mount
    useEffect(() => {
        const load = async () => {
            setLoadingTeachers(true);
            setErrorTeachers(null);
            try {
                const data = await getTeachers(0, 100);
                // getTeachers returns paginated response: { content: [...] } or { data: { content: [...] } }
                const list = data?.content ?? data?.data?.content ?? data?.data ?? (Array.isArray(data) ? data : []);
                setTeachers(list);
            } catch (err) {
                console.error('getTeachers error:', err);
                setErrorTeachers('Failed to load teachers. Please try again.');
            } finally {
                setLoadingTeachers(false);
            }
        };
        load();
    }, []);

    // Fetch schedule whenever teacher or date changes
    useEffect(() => {
        if (!selectedTeacher?.id) return;
        const fetch = async () => {
            setLoadingSchedule(true);
            setErrorSchedule(null);
            setScheduleData(null);
            try {
                // API returns data object: { teacherId, teacherName, date, dayOfWeek, periods[], workingDay }
                const data = await getTeacherSchedule(selectedTeacher.id, selectedDate || null);
                setScheduleData(data ?? null);
            } catch (err) {
                console.error('getTeacherSchedule error:', err);
                setErrorSchedule(err?.message || 'Failed to load schedule. Please try again.');
            } finally {
                setLoadingSchedule(false);
            }
        };
        fetch();
    }, [selectedTeacher, selectedDate]);

    const handleSelectTeacher = (teacher) => {
        setSelectedTeacher(teacher);
        setDropdownOpen(false);
        setTeacherSearch('');
        setScheduleData(null);
        setErrorSchedule(null);
    };

    // Filtered teacher list for search
    const filteredTeachers = teacherSearch
        ? teachers.filter(t =>
            (t.name || t.fullName || '').toLowerCase().includes(teacherSearch.toLowerCase())
          )
        : teachers;

    // Derived from scheduleData
    const periods = scheduleData?.periods ?? [];
    const isWorkingDay = scheduleData?.workingDay ?? true;
    const dayOfWeek = scheduleData?.dayOfWeek ?? '';
    const assignedCount = periods.length;

    // Teacher display name helper
    const teacherDisplayName = (t) => t?.name || t?.fullName || t?.teacherName || `Teacher #${t?.id}`;
    const teacherInitial = (t) => (teacherDisplayName(t)[0] ?? '?').toUpperCase();

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
                className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
                style={{ animation: 'popIn 0.22s cubic-bezier(.22,1,.36,1)' }}
            >
                {/* ── Header ─────────────────────────────────────────────── */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
                    <div>
                        <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            Teacher Schedule Viewer
                        </h2>
                        <p className="text-xs text-blue-200 mt-0.5">
                            View any teacher's daily period schedule
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/20 transition text-white flex-shrink-0"
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* ── Body ───────────────────────────────────────────────── */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">

                    {/* ── Top controls: always visible ── */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                        {/* Teacher dropdown */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Select Teacher *
                            </label>
                            <div className="relative">
                                <button
                                    onClick={() => setDropdownOpen(o => !o)}
                                    disabled={loadingTeachers || !!errorTeachers}
                                    className="w-full flex items-center justify-between gap-2 px-3 py-2.5 border border-gray-200 rounded-xl bg-white hover:border-blue-300 transition text-sm font-medium text-gray-700 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    <span className="flex items-center gap-2 min-w-0">
                                        <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                            {selectedTeacher
                                                ? <span className="text-xs font-bold text-blue-600">{teacherInitial(selectedTeacher)}</span>
                                                : <User size={13} className="text-blue-500" />
                                            }
                                        </span>
                                        <span className="truncate text-sm">
                                            {selectedTeacher ? teacherDisplayName(selectedTeacher) : 'Choose a teacher'}
                                        </span>
                                    </span>
                                    <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${dropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {dropdownOpen && !loadingTeachers && (
                                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                                        <div className="p-2 border-b border-gray-100">
                                            <input
                                                autoFocus
                                                value={teacherSearch}
                                                onChange={(e) => setTeacherSearch(e.target.value)}
                                                placeholder="Search teacher…"
                                                className="w-full px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
                                            />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto">
                                            {filteredTeachers.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">No teachers found</p>
                                            ) : filteredTeachers.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => handleSelectTeacher(t)}
                                                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-blue-50 transition text-left
                                                        ${selectedTeacher?.id === t.id ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-gray-700'}`}
                                                >
                                                    <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                                                        {teacherInitial(t)}
                                                    </span>
                                                    <span className="truncate">{teacherDisplayName(t)}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Date picker */}
                        <div>
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                                Date
                            </label>
                            <div className="relative">
                                <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                <input
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => setSelectedDate(e.target.value)}
                                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300 hover:border-blue-300 transition shadow-sm"
                                />
                            </div>
                            {selectedDate && (
                                <p className="text-xs text-gray-400 mt-1 pl-1">
                                    {formatDisplayDate(selectedDate)}
                                    {dayOfWeek && ` · ${dayOfWeek}`}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* ── Center area: shimmer / error / empty / schedule ── */}
                    {loadingTeachers ? (
                        /* Shimmer while teachers API loads */
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 animate-pulse" />
                            <div className="h-3 w-40 bg-gray-100 rounded animate-pulse" />
                            <div className="h-3 w-28 bg-gray-100 rounded animate-pulse" />
                        </div>
                    ) : (
                        <>
                            {/* ── Teacher error ── */}
                            {errorTeachers && (
                                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                    <AlertCircle size={15} className="shrink-0" />
                                    {errorTeachers}
                                </div>
                            )}

                            {/* ── Schedule results area ── */}
                            {selectedTeacher ? (
                                <>
                                    {/* Loading */}
                                    {loadingSchedule && (
                                        <div className="space-y-3">
                                            {Array(3).fill(0).map((_, i) => (
                                                <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                                            ))}
                                        </div>
                                    )}

                                    {/* Error */}
                                    {!loadingSchedule && errorSchedule && (
                                        <div className="flex items-start gap-2 px-3 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
                                            <WifiOff size={15} className="shrink-0 mt-0.5" />
                                            <span>{errorSchedule}</span>
                                        </div>
                                    )}

                                    {/* Non-working day */}
                                    {!loadingSchedule && !errorSchedule && scheduleData && !isWorkingDay && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                                                <Coffee size={24} className="text-gray-400" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-600">Non-working day</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {formatDisplayDate(scheduleData.date)} is not a working day.
                                            </p>
                                        </div>
                                    )}

                                    {/* No periods */}
                                    {!loadingSchedule && !errorSchedule && scheduleData && isWorkingDay && periods.length === 0 && (
                                        <div className="flex flex-col items-center justify-center py-10 text-center">
                                            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center mb-3">
                                                <BookOpen size={24} className="text-blue-300" />
                                            </div>
                                            <p className="text-sm font-semibold text-gray-600">No periods assigned</p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {teacherDisplayName(selectedTeacher)} has no periods on {formatDisplayDate(scheduleData.date)}.
                                            </p>
                                        </div>
                                    )}

                                    {/* Schedule loaded with periods */}
                                    {!loadingSchedule && !errorSchedule && scheduleData && isWorkingDay && periods.length > 0 && (
                                        <>
                                            {/* Summary bar */}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold border border-blue-200">
                                                    <BookOpen size={11} />
                                                    {assignedCount} Period{assignedCount !== 1 ? 's' : ''}
                                                </span>
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                                                    <CheckCircle2 size={11} />
                                                     {`Working day : ${scheduleData.dayOfWeek}`}
                                                </span>
                                                {scheduleData.teacherName && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
                                                        <User size={11} />
                                                        {scheduleData.teacherName}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Period cards */}
                                            <div className="space-y-2.5">
                                                {periods.map((period, idx) => {
                                                    const color = PERIOD_COLORS[idx % PERIOD_COLORS.length];
                                                    const duration = getDuration(period.startTime, period.endTime);
                                                    return (
                                                        <div
                                                            key={period.periodNumber ?? idx}
                                                            className={`flex items-start gap-3 sm:gap-4 px-4 py-3.5 rounded-xl border ${color.bg} ${color.border} transition-all`}
                                                        >
                                                            {/* Period number circle */}
                                                            <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                                                <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                                                                    <span className={`text-xs font-bold ${color.icon}`}>
                                                                        P-{period.periodNumber ?? idx + 1}
                                                                    </span>
                                                                </div>
                                                                {idx < periods.length - 1 && (
                                                                    <div className={`w-0.5 h-3 rounded-full ${color.dot} opacity-30`} />
                                                                )}
                                                            </div>

                                                            {/* Content */}
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-start justify-between gap-2 flex-wrap">
                                                                    <div className="flex items-center gap-2 flex-wrap">
                                                                        <p className="text-sm font-bold text-gray-800 leading-tight">
                                                                            {period.subjectName}
                                                                        </p>
                                                                        {period.subjectCode && (
                                                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${color.badge}`}>
                                                                                {period.subjectCode}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    {duration && (
                                                                        <span className="text-[10px] font-semibold text-gray-400 bg-white px-2 py-0.5 rounded-full border border-gray-100 flex-shrink-0">
                                                                            {duration}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="mt-1.5">
                                                                    <span className={`inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full ${color.badge}`}>
                                                                        {period.className}
                                                                        {period.sectionName && ` · ${period.sectionName}`}
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center gap-4 mt-2 flex-wrap">
                                                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                        <Clock size={11} className="flex-shrink-0" />
                                                                        {period.startTime} – {period.endTime}
                                                                    </span>
                                                                    {period.room && (
                                                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                                                            <Home size={11} className="flex-shrink-0" />
                                                                            {period.room}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                /* No teacher selected — nice prompt state */
                                !errorTeachers && (
                                    <div className="flex flex-col items-center justify-center py-10 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center mb-3 shadow-sm">
                                            <User size={28} className="text-blue-400" />
                                        </div>
                                        <p className="text-sm font-semibold text-gray-600">
                                            {teachers.length} teacher{teachers.length !== 1 ? 's' : ''} loaded
                                        </p>
                                        <p className="text-xs text-gray-400 mt-1">
                                            Select a teacher above to view their schedule
                                        </p>
                                    </div>
                                )
                            )}
                        </>
                    )}

                {/* ── Footer ─────────────────────────────────────────────── */}
                <div className="px-5 sm:px-6 py-3 border-t border-gray-100 flex justify-end bg-gray-50 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            <style>{`
                @keyframes popIn {
                    from { opacity: 0; transform: scale(0.95) translateY(10px); }
                    to   { opacity: 1; transform: scale(1) translateY(0); }
                }
            `}</style>
        </div>
        </div>
    );
}