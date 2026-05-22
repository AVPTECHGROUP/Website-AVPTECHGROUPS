import { useState, useCallback, useEffect } from 'react';
import {
    ChevronLeft, LayoutGrid, BarChart2, Wand2, ArrowLeftRight,
    Settings, Send, Printer, Trash2, Undo2, Redo2, Plus,
    Search, AlertTriangle, X, Eye, Pencil, User, RefreshCw, Clock
} from 'lucide-react';
import AddSlotModal from './components/AddSlotModal';
import TimetableSettings from './components/TimetableSettings';
import SubstitutionModal from './components/SubstitutionModal';
import PendingSubstitutionsModal from './components/PendingSubstitutionModel';
import AssignTeacherModal from './components/AssignTeacherModal';
import AnalyticsTab from './components/AnalyticsTab';
import PrintTimetableModal from './components/PrintTimeTableModal';

import {
    getTimetableById,
    getTimetableSlots,
    publishTimetable,
    autoFillSlots,
    bulkSaveSlots,
    deleteSlot,
    saveSlot,
    getTimetableConfig,
} from '../../Api/ScheduleApi';
import { getSubjectsBySection } from '../../Api/TeachersAPI';

// ── Helper: generate periods + breaks from config ──
const generatePeriodsFromConfig = (config) => {
    if (!config) return [];
    const { startTime, periodsPerDay, periodDurationMinutes, breaks = [] } = config;

    const toMinutes = (t) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
    };
    const toTimeStr = (mins) => {
        const h = Math.floor(mins / 60).toString().padStart(2, '0');
        const m = (mins % 60).toString().padStart(2, '0');
        return `${h}:${m}`;
    };

    const result = [];
    let current = toMinutes(startTime || '08:00');

    for (let i = 1; i <= periodsPerDay; i++) {
        const start = toTimeStr(current);
        current += periodDurationMinutes;
        const end = toTimeStr(current);
        result.push({
            id: `P${i}`,
            label: `Period ${i}`,
            time: `${start}–${end}`,
            isBreak: false,
        });

        const brk = breaks.find(b => b.afterPeriod === i);
        if (brk) {
            const bStart = toTimeStr(current);
            current += brk.duration;
            const bEnd = toTimeStr(current);
            result.push({
                id: `BRK${i}`,
                label: brk.label || 'Break',
                time: `${bStart}–${bEnd}`,
                isBreak: true,
                duration: `${brk.duration} min`,
                emoji: brk.label?.includes('Lunch') ? '🥗' : '🍎',
            });
        }
    }
    return result;
};

// ── Subject color helpers ──
const SUBJECT_COLOR_MAP = {
    MATH: { color: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
    ENG: { color: 'text-green-600', dot: 'bg-green-500', border: 'border-green-200', bg: 'bg-green-50' },
    SCI: { color: 'text-yellow-600', dot: 'bg-yellow-400', border: 'border-yellow-200', bg: 'bg-yellow-50' },
    HIN: { color: 'text-purple-600', dot: 'bg-purple-500', border: 'border-purple-200', bg: 'bg-purple-50' },
    SST: { color: 'text-orange-600', dot: 'bg-orange-400', border: 'border-orange-200', bg: 'bg-orange-50' },
    COMP: { color: 'text-teal-600', dot: 'bg-teal-500', border: 'border-teal-200', bg: 'bg-teal-50' },
    PE: { color: 'text-red-600', dot: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50' },
    DRAW: { color: 'text-indigo-600', dot: 'bg-indigo-500', border: 'border-indigo-200', bg: 'bg-indigo-50' },
    BIO: { color: 'text-emerald-600', dot: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50' },
    CHEM: { color: 'text-pink-600', dot: 'bg-pink-500', border: 'border-pink-200', bg: 'bg-pink-50' },
    PHY: { color: 'text-sky-600', dot: 'bg-sky-500', border: 'border-sky-200', bg: 'bg-sky-50' },
    GEO: { color: 'text-lime-600', dot: 'bg-lime-500', border: 'border-lime-200', bg: 'bg-lime-50' },
    HIST: { color: 'text-amber-600', dot: 'bg-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
};
const COLOR_POOL = [
    { color: 'text-blue-600', dot: 'bg-blue-500', border: 'border-blue-200', bg: 'bg-blue-50' },
    { color: 'text-green-600', dot: 'bg-green-500', border: 'border-green-200', bg: 'bg-green-50' },
    { color: 'text-purple-600', dot: 'bg-purple-500', border: 'border-purple-200', bg: 'bg-purple-50' },
    { color: 'text-orange-600', dot: 'bg-orange-400', border: 'border-orange-200', bg: 'bg-orange-50' },
    { color: 'text-teal-600', dot: 'bg-teal-500', border: 'border-teal-200', bg: 'bg-teal-50' },
    { color: 'text-red-600', dot: 'bg-red-500', border: 'border-red-200', bg: 'bg-red-50' },
    { color: 'text-indigo-600', dot: 'bg-indigo-500', border: 'border-indigo-200', bg: 'bg-indigo-50' },
    { color: 'text-pink-600', dot: 'bg-pink-500', border: 'border-pink-200', bg: 'bg-pink-50' },
    { color: 'text-sky-600', dot: 'bg-sky-500', border: 'border-sky-200', bg: 'bg-sky-50' },
    { color: 'text-amber-600', dot: 'bg-amber-500', border: 'border-amber-200', bg: 'bg-amber-50' },
];
const getSubjectStyle = (code, index) => {
    const upper = (code || '').toUpperCase();
    return SUBJECT_COLOR_MAP[upper] || COLOR_POOL[index % COLOR_POOL.length];
};

const TEACHER_COLORS = {
    'Kavita Rao': 'bg-pink-500', 'Rajesh Kumar': 'bg-blue-500',
    'Priya Patel': 'bg-orange-500', 'Meena Sharma': 'bg-green-500',
    'Suresh Nair': 'bg-purple-500', 'Anjali Singh': 'bg-amber-500',
    'Amit Joshi': 'bg-cyan-500', 'Vikas Mishra': 'bg-rose-500',
};

const getInitials = (name) => name ? name.split(' ').map(w => w[0]).join('').toUpperCase() : '?';

const normalizeSlot = (apiSlot) => ({
    day: apiSlot.dayOfWeek,
    periodId: `P${apiSlot.periodNumber}`,
    subject: {
        id: apiSlot.subjectId || apiSlot.subject?.id,
        code: apiSlot.subjectCode || apiSlot.subject?.code,
        label: apiSlot.subjectName || apiSlot.subject?.label,
    },
    teacher: {
        id: apiSlot.teacherId || apiSlot.teacher?.id,
        name: apiSlot.teacherName || apiSlot.teacher?.name,
    },
    room: apiSlot.room,
    slotId: apiSlot.id,
});

const toApiSlot = (slot) => ({
    dayOfWeek: slot.day,
    periodNumber: parseInt(slot.periodId.replace('P', '')),
    subjectId: slot.subject?.id ?? slot.subjectId ?? null,
    teacherId: slot.teacher?.id ?? slot.teacherId ?? null,
    room: slot.room || null,
});

const slotKey = (slot) => `${slot.day}_${slot.periodId}`;

export default function CreateSchedule({ timetable, mode = 'edit', onBack }) {
    const isViewOnly = mode === 'view';
    const [activeTab, setActiveTab] = useState('planner');
    const [timetableInfo, setTimetableInfo] = useState(timetable);
    const [status, setStatus] = useState(timetable?.status || 'Draft');
    const [showDraftBanner, setShowDraftBanner] = useState(timetable?.status === 'Draft');
    const [slots, setSlots] = useState([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [history, setHistory] = useState([[]]);
    const [historyIdx, setHistoryIdx] = useState(0);
    const [showPrint, setShowPrint] = useState(false);
    const [savingAll, setSavingAll] = useState(false);

    // ── Slot selection for substitution ──
    const [selectedSlotKey, setSelectedSlotKey] = useState(null);

    // Modal states
    const [addSlotTarget, setAddSlotTarget] = useState(null);
    const [assignTeacherTarget, setAssignTeacherTarget] = useState(null);
    const [substitutionTarget, setSubstitutionTarget] = useState(null);
    const [showPendingSubstitutions, setShowPendingSubstitutions] = useState(false); // ← NEW
    const [showSettings, setShowSettings] = useState(false);
    const [showSubstitution, setShowSubstitution] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [draggedSubject, setDraggedSubject] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);

    const [subjectSearch, setSubjectSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sidebarTab, setSidebarTab] = useState('subjects');
    const [toastMsg, setToastMsg] = useState('');

    const [timetableConfig, setTimetableConfig] = useState(null);
    const [workingDays, setWorkingDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
    const [periods, setPeriods] = useState([]);

    const [subjectsList, setSubjectsList] = useState([]);
    const sectionId = timetable?.sectionId || timetableInfo?.sectionId || null;

    useEffect(() => {
        if (!timetable?.id) return;
        loadTimetableData();
        loadConfig();
    }, [timetable?.id]);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const loadConfig = async () => {
        try {
            const config = await getTimetableConfig();
            if (config) {
                setTimetableConfig(config);
                if (config.workingDays?.length) setWorkingDays(config.workingDays);
                const generatedPeriods = generatePeriodsFromConfig(config);
                setPeriods(generatedPeriods);
            }
        } catch (err) {
            console.error('Failed to load timetable config:', err);
            setWorkingDays(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
            setPeriods(generatePeriodsFromConfig({
                startTime: '08:00',
                periodsPerDay: 8,
                periodDurationMinutes: 45,
                breaks: [
                    { afterPeriod: 4, label: '🍎 Recess', duration: 20 },
                    { afterPeriod: 6, label: '🥗 Lunch Break', duration: 40 },
                ],
            }));
        }
    };

    const loadSubjects = async (secId) => {
        if (!secId || subjectsList.length > 0) return;
        try {
            const data = await getSubjectsBySection(secId);
            const enriched = (data || []).map((s, i) => ({
                id: s.id,
                code: s.code || s.subjectCode || '',
                label: s.name || s.subjectName || '',
                total: 0,
                ...getSubjectStyle(s.code || s.subjectCode, i),
            }));
            setSubjectsList(enriched);
        } catch (err) {
            console.error('Failed to load subjects:', err);
        }
    };

    const loadTimetableData = async () => {
        try {
            setLoadingSlots(true);
            const [info, slotsData] = await Promise.all([
                getTimetableById(timetable.id),
                getTimetableSlots(timetable.id),
            ]);
            const resolvedInfo = info || timetable;
            setTimetableInfo(resolvedInfo);
            setStatus(resolvedInfo?.status || 'Draft');
            setShowDraftBanner(resolvedInfo?.status === 'Draft' || resolvedInfo?.status === 'DRAFT');
            const normalized = (slotsData || []).map(normalizeSlot);
            setSlots(normalized);
            setHistory([normalized]);
            setHistoryIdx(0);
            const resolvedSectionId = resolvedInfo?.sectionId || timetable?.sectionId;
            if (resolvedSectionId) {
                await loadSubjects(resolvedSectionId);
            }
        } catch (err) {
            console.error('Failed to load timetable data:', err);
            showToast('Failed to load timetable data');
        } finally {
            setLoadingSlots(false);
        }
    };

    const pushHistory = (newSlots) => {
        const newHistory = history.slice(0, historyIdx + 1);
        newHistory.push(newSlots);
        setHistory(newHistory);
        setHistoryIdx(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIdx > 0) {
            setHistoryIdx(historyIdx - 1);
            setSlots(history[historyIdx - 1]);
        }
    };

    const redo = () => {
        if (historyIdx < history.length - 1) {
            setHistoryIdx(historyIdx + 1);
            setSlots(history[historyIdx + 1]);
        }
    };

    const getSlot = (day, periodId) =>
        slots.find(s => s.day === day && s.periodId === periodId);

    const toggleSlotSelection = (slot) => {
        const key = slotKey(slot);

        setSelectedSlotKey(prev =>
            prev === key ? null : key
        );
    };
    const selectedSlots = slots.filter(
        s => slotKey(s) === selectedSlotKey
    );

    const handleOpenSubstitution = () => {
        if (selectedSlots.length === 0) return;
        setSubstitutionTarget(selectedSlots);
    };

    const handleAddSlot = async (data) => {
        try {
            const payload = {
                dayOfWeek: data.day,
                periodNumber: parseInt(data.period.id.replace('P', '')),
                subjectId: data.subject?.id || data.subjectId,
                teacherId: data.teacher?.id || data.teacherId,
                room: data.room,
            };
            const saved = await saveSlot(timetable.id, payload);
            const newSlot = saved ? normalizeSlot(saved) : {
                day: data.day,
                periodId: data.period.id,
                subject: data.subject,
                teacher: data.teacher,
                room: data.room,
            };
            const newSlots = slots.filter(s => !(s.day === data.day && s.periodId === data.period.id));
            newSlots.push(newSlot);
            setSlots(newSlots);
            pushHistory(newSlots);
            setAddSlotTarget(null);
            showToast('Slot saved ✓');
        } catch (err) {
            showToast(err.message || 'Failed to save slot');
        }
    };

    const handleRemoveSlot = async (day, periodId) => {
        try {
            const periodNumber = parseInt(periodId.replace('P', ''));
            await deleteSlot(timetable.id, day, periodNumber);
            const newSlots = slots.filter(s => !(s.day === day && s.periodId === periodId));
            setSlots(newSlots);
            pushHistory(newSlots);
            const key = `${day}_${periodId}`;
            if (selectedSlotKey === key) {
                setSelectedSlotKey(null);
            }
            showToast('Slot removed');
        } catch (err) {
            showToast(err.message || 'Failed to remove slot');
        }
    };

    const handleAutoFill = async () => {
        try {
            const result = await autoFillSlots(timetable.id);
            showToast(`Auto-filled ${result?.filledCount ?? ''} slots`);
            await loadTimetableData();
        } catch (err) {
            showToast(err.message || 'Auto-fill failed');
        }
    };

    const handleClearAll = async () => {
        try {
            await bulkSaveSlots(timetable.id, []);
            setSlots([]);
            setSelectedSlotKey(null);
            pushHistory([]);
            showToast('All slots cleared');
        } catch (err) {
            showToast(err.message || 'Failed to clear slots');
        }
    };

    const handlePublish = async () => {
        try {
            await publishTimetable(timetable.id);
            setStatus('Published');
            setShowDraftBanner(false);
            setShowPublishConfirm(false);
            showToast('Timetable published ✓');
        } catch (err) {
            showToast(err.message || 'Failed to publish');
        }
    };

    const handleBulkSave = async () => {
        try {
            setSavingAll(true);
            const apiSlots = slots.map(toApiSlot);
            await bulkSaveSlots(timetable.id, apiSlots);
            showToast('All slots saved ✓');
        } catch (err) {
            showToast(err.message || 'Failed to save slots');
        } finally {
            setSavingAll(false);
        }
    };

    const totalSlots = workingDays.length * (timetableConfig?.periodsPerDay || periods.filter(p => !p.isBreak).length || 8);
    const filledCount = slots.length;
    const emptyCount = totalSlots - filledCount;
    const pct = Math.round((filledCount / totalSlots) * 100);

    const subjectCounts = subjectsList.map(s => ({
        ...s,
        count: slots.filter(sl => sl?.subject?.code === s.code || sl?.subject?.id === s.id).length,
    }));

    const filteredSubjects = subjectCounts.filter(s =>
        s.label.toLowerCase().includes(subjectSearch.toLowerCase()) &&
        (subjectFilter === 'All' || s.code === subjectFilter)
    );

    const uniqueTeacherNames = [...new Set(slots.map(s => s.teacher?.name).filter(Boolean))];

    return (
        <div className="min-h-screen bg-[#f0f4f9] flex flex-col relative">

            {/* Toast */}
            {toastMsg && (
                <div className="fixed bottom-5 right-5 z-100 bg-[#1e293b] text-white text-sm px-4 py-2.5 rounded-xl shadow-xl animate-fade-in">
                    {toastMsg}
                </div>
            )}

            {/* Draft Banner */}
            {showDraftBanner && status === 'Draft' && !isViewOnly && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-amber-800 text-sm">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0" />
                        <span>This timetable is in <strong>DRAFT</strong> mode. Review and publish when ready.</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button onClick={() => setShowPublishConfirm(true)}
                            className="px-3 py-1.5 bg-amber-600 cursor-pointer text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition">
                            Publish Now
                        </button>
                        <button onClick={() => setShowDraftBanner(false)}
                            className="px-3 py-1.5 bg-white border cursor-pointer border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
                <button onClick={onBack} className="flex items-center cursor-pointer gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium">
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">
                        {timetableInfo?.class || timetableInfo?.className}
                    </span>
                    <span className="text-gray-500">
                        {timetableInfo?.section || timetableInfo?.sectionName}
                    </span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ml-1
                        ${status === 'Draft'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}>
                        {isViewOnly ? 'View' : `${status}`}
                    </span>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => setActiveTab('planner')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 cursor-pointer rounded-lg text-sm font-medium transition
                            ${activeTab === 'planner' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <LayoutGrid size={15} /> Planner
                    </button>
                    <button onClick={() => setActiveTab('analytics')}
                        className={`flex items-center cursor-pointer gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
                            ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                        <BarChart2 size={15} /> Analytics
                    </button>
                </div>

                {/* Right-side actions */}
                <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                    {!isViewOnly && (
                        <>
                            <button onClick={undo} disabled={historyIdx === 0}
                                className="p-2 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100 disabled:opacity-30 transition" title="Undo">
                                <Undo2 size={16} />
                            </button>
                            <button onClick={redo} disabled={historyIdx === history.length - 1}
                                className="p-2 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100 disabled:opacity-30 transition" title="Redo">
                                <Redo2 size={16} />
                            </button>
                            <button onClick={handleAutoFill}
                                className="flex items-center gap-1.5 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                <Wand2 size={14} /> Auto-fill
                            </button>
                            <button
                                onClick={handleBulkSave}
                                disabled={savingAll}
                                className={`flex items-center gap-1.5 px-3 cursor-pointer py-1.5 rounded-lg text-sm font-medium transition shadow-sm ${savingAll
                                    ? 'bg-blue-400 cursor-not-allowed opacity-80'
                                    : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                {savingAll ? (
                                    <><RefreshCw size={14} className="animate-spin" /> Saving...</>
                                ) : (
                                    <>💾 Save All</>
                                )}
                            </button>
                            <button onClick={() => setShowSettings(true)}
                                className="flex items-center gap-1.5 px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                <Settings size={14} /> Settings
                            </button>
                            {status === 'Draft' && (
                                <button onClick={() => setShowPublishConfirm(true)}
                                    className="flex items-center gap-1.5 cursor-pointer px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                                    <Send size={14} /> Publish
                                </button>
                            )}
                        </>
                    )}
                    {isViewOnly && (
                        <button onClick={() => setShowPrint(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 border cursor-pointer border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            <Printer size={14} /> Print
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="flex-1 overflow-auto">
                    <AnalyticsTab
                        slots={slots}
                        subjectsList={subjectsList}
                        timetableId={timetable?.id}
                        sectionId={sectionId}
                        timetableInfo={timetableInfo}
                        config={timetableConfig}
                    />
                </div>
            ) : (
                <>
                    {/* Stats Bar */}
                    <div className="bg-white border-b border-gray-100 px-5 py-2.5 flex items-center gap-2 flex-wrap">

                        {/* Working Days */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{workingDays.length}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Working Days</p>
                            </div>
                        </div>

                        {/* Periods / Day */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
                            </svg>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{timetableConfig?.periodsPerDay || periods.filter(p => !p.isBreak).length || 8}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Periods / Day</p>
                            </div>
                        </div>

                        {/* Slots Filled */}
                        <div className="flex items-center gap-3.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
                            <div className="relative w-[52px] h-[52px] shrink-0">
                                <svg viewBox="0 0 36 36" width="52" height="52" style={{ transform: 'rotate(-90deg)' }}>
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#2563eb" strokeWidth="3.5"
                                        strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[11px] font-bold text-slate-800">{pct}%</span>
                                </div>
                            </div>
                            <div>
                                <div className="flex items-baseline gap-1 leading-none">
                                    <span className="text-[22px] font-bold text-slate-900">{filledCount}</span>
                                    <span className="text-sm font-medium text-slate-400">/{totalSlots}</span>
                                </div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">Slots Filled</p>
                                <div className="w-[90px] h-[3px] bg-gray-200 rounded-full mt-1.5">
                                    <div className="h-[3px] bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Empty Slots */}
                        <div className="flex items-center gap-2.5 px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            <div>
                                <p className={`text-[20px] font-bold leading-none ${emptyCount > 0 ? 'text-orange-500' : 'text-slate-900'}`}>{emptyCount}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Empty Slots</p>
                            </div>
                        </div>

                        {/* Teachers stat + Substitution buttons */}
                        <div className="flex items-center gap-3 px-4 py-2.5 border border-gray-200 rounded-xl bg-white">
                            <div className="flex items-center">
                                {uniqueTeacherNames.length > 5 && (
                                    <span className="w-7 h-7 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center shrink-0"
                                        style={{ fontSize: '9px', fontWeight: 700 }}>
                                        +{uniqueTeacherNames.length - 5}
                                    </span>
                                )}
                                {uniqueTeacherNames.slice(0, 5).map((n, i) => (
                                    <span key={n}
                                        className={`w-7 h-7 rounded-full border-2 border-white ${TEACHER_COLORS[n] || 'bg-gray-400'} text-white flex items-center justify-center shrink-0`}
                                        style={{ fontSize: '9px', fontWeight: 700, marginLeft: (i === 0 && uniqueTeacherNames.length <= 5) ? 0 : '-8px' }}>
                                        {getInitials(n)}
                                    </span>
                                ))}
                            </div>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{uniqueTeacherNames.length}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">Teachers</p>
                            </div>

                            {!isViewOnly && (
                                <div className="flex items-center gap-1.5 ml-2">
                                    {/* ── Arrange Substitution (enabled when ≥1 slot selected) ── */}
                                    <button
                                        onClick={handleOpenSubstitution}
                                        disabled={selectedSlots.length === 0}
                                        title={selectedSlots.length === 0 ? 'Select one or more slots to arrange substitution' : `Arrange substitution for ${selectedSlots.length} slot(s)`}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                                            ${selectedSlots.length > 0
                                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}>
                                        <ArrowLeftRight size={13} />
                                        {selectedSlots.length > 0
                                            ? `Arrange Substitution (${selectedSlots.length})`
                                            : 'Arrange Substitution'}
                                    </button>

                                    {/* ── Pending Substitutions button ── */}
                                    <button
                                        onClick={() => setShowPendingSubstitutions(true)}
                                        title="View pending substitutions"
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer transition">
                                        <Clock size={13} />
                                        Pending Substitution
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right side filters */}
                        {!isViewOnly && (
                            <div className="ml-auto flex items-center gap-2 flex-wrap">
                                <div className="flex gap-1 flex-wrap">
                                    <button onClick={() => setSubjectFilter('All')}
                                        className={`px-2.5 py-1 rounded-full text-xs cursor-pointer font-medium transition ${subjectFilter === 'All'
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                        All
                                    </button>
                                    {subjectCounts.map(s => (
                                        <button key={s.code} onClick={() => setSubjectFilter(s.code === subjectFilter ? 'All' : s.code)}
                                            className={`px-2.5 py-1 rounded-full cursor-pointer text-xs font-medium transition flex items-center gap-1 ${subjectFilter === s.code
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                            {s.code} {s.count}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowPrint(true)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
                                    <Printer size={13} /> Print
                                </button>
                                <button onClick={handleClearAll} className="flex items-center gap-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs cursor-pointer text-red-500 hover:bg-red-50">
                                    <Trash2 size={13} /> Clear All
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Planner Grid */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        {!isViewOnly && (
                            <div className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col min-h-0">
                                <div className="flex border-b border-gray-100">
                                    <button onClick={() => setSidebarTab('subjects')}
                                        className={`flex-1 py-2.5 text-xs font-medium transition cursor-pointer ${sidebarTab === 'subjects' ? 'border-b-2 border-blue-600 text-blue-600 bg-blue-50' : 'text-gray-500'}`}>
                                        Subjects
                                    </button>
                                    <button onClick={() => setSidebarTab('hours')}
                                        className={`flex-1 py-2.5 text-xs font-medium cursor-pointer transition flex items-center justify-center gap-1 ${sidebarTab === 'hours' ? 'border-b-2 border-[#1e293b] text-[#1e293b]' : 'text-gray-500'}`}>
                                        <BarChart2 size={12} /> Hours
                                    </button>
                                </div>

                                {sidebarTab === 'subjects' && (
                                    <div className="flex-1 min-h-0 overflow-y-auto p-3">
                                        <div className="relative mb-2">
                                            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)}
                                                placeholder="Search subjects..."
                                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none" />
                                        </div>
                                        <p className="text-xs text-gray-400 mb-2">Click empty slot to add subjects</p>
                                        <div className="space-y-1">
                                            {filteredSubjects.map(s => (
                                                <div
                                                    key={s.code}
                                                    draggable
                                                    onDragStart={(e) => {
                                                        setDraggedSubject(s);
                                                        e.dataTransfer.effectAllowed = 'copy';
                                                    }}
                                                    onDragEnd={() => setDraggedSubject(null)}
                                                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing select-none"
                                                    title="Drag to a slot">
                                                    <span className={`w-1 h-6 rounded-full ${s.dot}`} />
                                                    <span className={`text-xs font-bold ${s.color}`}>{s.code}</span>
                                                    <span className="text-xs text-gray-700 flex-1">{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sidebarTab === 'hours' && (
                                    <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                                        {subjectCounts.map(s => {
                                            const pct = s.total ? Math.round((s.count / s.total) * 100) : 0;
                                            return (
                                                <div key={s.code}>
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className={`font-bold ${s.color}`}>{s.code}</span>
                                                        <span className="text-gray-400">{s.count}/{s.total}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                        <div className={`h-1.5 rounded-full ${s.dot}`} style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grid */}
                        <div className="flex-1 overflow-auto">
                            {loadingSlots ? (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                                    Loading timetable...
                                </div>
                            ) : (
                                <table className="w-full border-collapse min-w-150">
                                    <thead>
                                        <tr>
                                            <th className="bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 w-36 sticky left-0 z-10">
                                                PERIOD / TIME
                                            </th>
                                            {workingDays.map(day => (
                                                <th key={day}
                                                    className={`border-b border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold min-w-32.5 ${day === 'Mon' ? 'bg-gray-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
                                                    {day === 'Mon' ? `• ${day}` : day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {periods.map(period => {
                                            if (period.isBreak) {
                                                return (
                                                    <tr key={period.id} className="bg-amber-50/60">
                                                        <td className="border-b border-r border-gray-200 px-4 py-2 sticky left-0 bg-amber-50/80 z-10">
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{period.emoji}</span>
                                                                <span className="text-xs font-semibold text-amber-800">{period.label}</span>
                                                            </div>
                                                            <p className="text-xs text-amber-600">{period.time}</p>
                                                        </td>
                                                        {workingDays.map(day => (
                                                            <td key={day} className="border-b border-r border-gray-200 px-3 py-2">
                                                                {day === workingDays[0] && (
                                                                    <div className="flex items-center gap-2">
                                                                        <span>{period.emoji}</span>
                                                                        <span className="text-xs text-amber-700 font-medium">{period.time}</span>
                                                                        <span className="bg-amber-200 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded">{period.duration}</span>
                                                                    </div>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                );
                                            }

                                            return (
                                                <tr key={period.id} className="hover:bg-gray-50/40 transition">
                                                    <td className="border-b border-r border-gray-200 px-4 py-3 sticky left-0 bg-white z-10">
                                                        <p className="text-xs font-semibold text-gray-400">{period.id}</p>
                                                        <p className="text-sm font-medium text-gray-800">{period.label}</p>
                                                        <p className="text-xs text-gray-400">{period.time}</p>
                                                    </td>
                                                    {workingDays.map(day => {
                                                        const slot = getSlot(day, period.id);
                                                        const subjectMeta = slot
                                                            ? (subjectsList.find(s => s.code === slot.subject?.code || s.id === slot.subject?.id) || null)
                                                            : null;
                                                        const teacherColor = slot?.teacher?.name ? (TEACHER_COLORS[slot.teacher.name] || 'bg-gray-400') : '';
                                                        const isSelected = slot
                                                            ? selectedSlotKey === slotKey(slot)
                                                            : false;

                                                        return (
                                                            <td key={day} className="border-b border-r border-gray-200 p-1.5 align-top">
                                                                {slot ? (
                                                                    <div className={`relative rounded-lg border p-2 group transition
                                                                        ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                                                        ${subjectMeta ? `${subjectMeta.bg} ${subjectMeta.border}` : 'bg-gray-50 border-gray-200'}`}>

                                                                        {!isViewOnly && (
                                                                            <input
                                                                                type="checkbox"
                                                                                checked={isSelected}
                                                                                onChange={() => toggleSlotSelection(slot)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                className="absolute top-1.5 right-1.5 w-3.5 h-3.5 accent-indigo-600 cursor-pointer z-10"
                                                                                title="Select for substitution"
                                                                            />
                                                                        )}

                                                                        {!isViewOnly && (
                                                                            <div className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10">
                                                                                <button
                                                                                    title="Edit Slot"
                                                                                    onClick={() => setAddSlotTarget({ day, period, editSlot: slot })}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 cursor-pointer shadow flex items-center justify-center hover:bg-blue-100 hover:border-blue-500 transition">
                                                                                    <Pencil size={10} className="text-gray-600" />
                                                                                </button>
                                                                                <button
                                                                                    title="Assign Teacher"
                                                                                    onClick={() => setAssignTeacherTarget({ day, period, slot })}
                                                                                    className="w-6 h-6 rounded cursor-pointer bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-blue-100 hover:border-blue-500 transition">
                                                                                    <User size={10} className="text-gray-600" />
                                                                                </button>
                                                                                <button
                                                                                    title="Remove Slot"
                                                                                    onClick={() => handleRemoveSlot(day, period.id)}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 cursor-pointer shadow flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition">
                                                                                    <Trash2 size={10} className="text-red-400" />
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        <p className={`text-xs font-bold mb-0.5 pr-4 ${subjectMeta?.color || 'text-gray-600'}`}>
                                                                            {slot.subject?.code}
                                                                        </p>
                                                                        <p className="text-xs font-semibold text-gray-800 leading-tight">{slot.subject?.label}</p>
                                                                        {slot.teacher?.name && (
                                                                            <div className="flex items-center gap-1 mt-1">
                                                                                <span className={`w-4 h-4 rounded-full ${teacherColor} text-white flex items-center justify-center shrink-0`} style={{ fontSize: '8px' }}>
                                                                                    {getInitials(slot.teacher.name)}
                                                                                </span>
                                                                                <span className="text-xs text-gray-500 truncate">{slot.teacher.name.split(' ')[0]}</span>
                                                                            </div>
                                                                        )}
                                                                        {slot.room && (
                                                                            <p className="text-xs text-gray-400 mt-0.5">📍 {slot.room}</p>
                                                                        )}
                                                                        {!isViewOnly && <div className="h-5" />}
                                                                    </div>
                                                                ) : (
                                                                    !isViewOnly && (
                                                                        <button
                                                                            onClick={() => setAddSlotTarget({ day, period })}
                                                                            onDragOver={(e) => {
                                                                                e.preventDefault();
                                                                                e.dataTransfer.dropEffect = 'copy';
                                                                                setDragOverCell({ day, periodId: period.id });
                                                                            }}
                                                                            onDragLeave={() => setDragOverCell(null)}
                                                                            onDrop={(e) => {
                                                                                e.preventDefault();
                                                                                setDragOverCell(null);
                                                                                if (draggedSubject) {
                                                                                    setAddSlotTarget({
                                                                                        day,
                                                                                        period,
                                                                                        prefillSubject: draggedSubject,
                                                                                    });
                                                                                    setDraggedSubject(null);
                                                                                }
                                                                            }}
                                                                            className={`w-full h-full min-h-20 flex items-center justify-center rounded-lg transition border-2 border-dashed
                                                                                ${dragOverCell?.day === day && dragOverCell?.periodId === period.id
                                                                                    ? 'border-blue-500 bg-blue-50 text-blue-600 scale-[1.02] shadow-sm'
                                                                                    : 'border-transparent hover:border-gray-200 text-gray-300 hover:text-gray-400 hover:bg-gray-100/60'
                                                                                }`}>
                                                                            <Plus size={18} />
                                                                        </button>
                                                                    )
                                                                )}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-gray-200 px-4 py-2 flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                        <span>📋 {timetableInfo?.class} — {timetableInfo?.section}</span>
                        <span>•</span>
                        <span>📅 {timetableInfo?.year || timetableInfo?.academicYear}</span>
                        <span>•</span>
                        <span>{workingDays.length} days · {timetableConfig?.periodsPerDay || periods.filter(p => !p.isBreak).length || 8} periods/day</span>
                        <span>•</span>
                        <span className={status === 'Draft' ? 'text-amber-600 font-medium' : 'text-blue-600 font-medium'}>{status}</span>
                        {selectedSlots.length > 0 && (
                            <>
                                <span>•</span>
                                <span className="text-indigo-600 font-medium">{selectedSlots.length} slot(s) selected</span>
                            </>
                        )}
                    </div>
                </>
            )}

            {/* ── Modals ── */}

            {addSlotTarget && !isViewOnly && (
                <AddSlotModal
                    day={addSlotTarget.day}
                    period={addSlotTarget.period}
                    timetableId={timetable?.id}
                    sectionId={sectionId}
                    editSlot={addSlotTarget.editSlot || null}
                    prefillSubject={addSlotTarget.prefillSubject || null}
                    onClose={() => setAddSlotTarget(null)}
                    onSave={handleAddSlot}
                />
            )}

            {assignTeacherTarget && !isViewOnly && (
                <AssignTeacherModal
                    day={assignTeacherTarget.day}
                    period={assignTeacherTarget.period}
                    slot={assignTeacherTarget.slot}
                    timetableId={timetable?.id}
                    onClose={() => setAssignTeacherTarget(null)}
                    onSave={async (teacherId) => {
                        try {
                            const { day, period, slot } = assignTeacherTarget;
                            await saveSlot(timetable.id, {
                                dayOfWeek: day,
                                periodNumber: parseInt(period.id.replace('P', '')),
                                subjectId: slot.subject?.id,
                                teacherId,
                                room: slot.room,
                            });
                            await loadTimetableData();
                            setAssignTeacherTarget(null);
                            showToast('Teacher assigned ✓');
                        } catch (err) {
                            showToast(err.message || 'Failed to assign teacher');
                        }
                    }}
                />
            )}

            {/* Arrange Substitution Modal */}
            {substitutionTarget && !isViewOnly && (
                <SubstitutionModal
                    timetableId={timetable?.id}
                    selectedSlots={substitutionTarget}
                    onClose={() => {
                        setSubstitutionTarget(null);
                        setSelectedSlotKey(null);
                    }}
                />
            )}

            {/* Pending Substitutions Modal — separate popup */}
            {showPendingSubstitutions && !isViewOnly && (
                <PendingSubstitutionsModal
                    timetableId={timetable?.id}
                    onClose={() => setShowPendingSubstitutions(false)}
                />
            )}

            {showSettings && !isViewOnly && (
                <TimetableSettings
                    timetable={timetableInfo}
                    timetableId={timetable?.id}
                    onClose={() => setShowSettings(false)}
                    onApply={async () => {
                        await loadTimetableData();
                        setShowSettings(false);
                    }}
                />
            )}

            {showPrint && (
                <PrintTimetableModal
                    timetableInfo={timetableInfo}
                    slots={slots}
                    workingDays={workingDays}
                    periods={periods}
                    subjectsList={subjectsList}
                    config={timetableConfig}
                    onClose={() => setShowPrint(false)}
                />
            )}

            {showPublishConfirm && (
                <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Publish Timetable?</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            This will make the timetable visible to all students and teachers for{' '}
                            <strong>{timetableInfo?.class} — {timetableInfo?.section}</strong>.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowPublishConfirm(false)}
                                className="px-4 py-2 border border-gray-200 cursor-pointer rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handlePublish}
                                className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                                Yes, Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}