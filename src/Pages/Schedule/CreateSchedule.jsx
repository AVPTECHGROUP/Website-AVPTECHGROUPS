import { useState, useEffect, useCallback } from 'react';
import {
    ChevronLeft, LayoutGrid, BarChart2, Wand2, ArrowLeftRight,
    Settings, Send, Printer, Trash2, Undo2, Redo2, Plus,
    Search, AlertTriangle, X, Eye, Pencil, User, RefreshCw, Clock,
    PanelLeft, PanelLeftClose
} from 'lucide-react';
import { toast } from 'react-toastify';

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
} from '../../Api/Academics/ScheduleApi';
import SectionSubjectService from '../../Api/Academics/SectionSubjectService';
import { TIMETABLE_CONSTS } from '../../Constants/StringConstants/TimetableConstants';

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
const getSubjectStyle = (code, index) => {
    const upper = (code || '').toUpperCase();
    return TIMETABLE_CONSTS.COLORS.SUBJECT_MAP[upper] || TIMETABLE_CONSTS.COLORS.SUBJECT_POOL[index % TIMETABLE_CONSTS.COLORS.SUBJECT_POOL.length];
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
    const [status, setStatus] = useState(timetable?.status || TIMETABLE_CONSTS.STATUS.DRAFT);
    const [showDraftBanner, setShowDraftBanner] = useState(timetable?.status === TIMETABLE_CONSTS.STATUS.DRAFT || timetable?.status === TIMETABLE_CONSTS.STATUS.DRAFT_UPPER);
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
    const [showPendingSubstitutions, setShowPendingSubstitutions] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [draggedSubject, setDraggedSubject] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);

    const [subjectSearch, setSubjectSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState(TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL);
    const [sidebarTab, setSidebarTab] = useState('subjects');
    const [mobileDay, setMobileDay] = useState('Mon');
    const [showMobileSidebar, setShowMobileSidebar] = useState(false);

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

    useEffect(() => {
        if (workingDays.length && !workingDays.includes(mobileDay)) {
            setMobileDay(workingDays[0]);
        }
    }, [workingDays, mobileDay]);

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
            const data = await SectionSubjectService.getSubjectsBySection(secId);
            const enriched = (data || []).map((s, i) => ({
                id: s.subjectId,
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
            setStatus(resolvedInfo?.status || TIMETABLE_CONSTS.STATUS.DRAFT);
            setShowDraftBanner(resolvedInfo?.status === TIMETABLE_CONSTS.STATUS.DRAFT || resolvedInfo?.status === TIMETABLE_CONSTS.STATUS.DRAFT_UPPER);
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
            toast.error(TIMETABLE_CONSTS.MESSAGES.ERR_LOAD_DATA);
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

    const undo = useCallback(() => {
        setHistoryIdx((prevIdx) => {
            if (prevIdx > 0) {
                const nextIdx = prevIdx - 1;
                setSlots(history[nextIdx]);
                return nextIdx;
            }
            return prevIdx;
        });
    }, [history]);

    const redo = useCallback(() => {
        setHistoryIdx((prevIdx) => {
            if (prevIdx < history.length - 1) {
                const nextIdx = prevIdx + 1;
                setSlots(history[nextIdx]);
                return nextIdx;
            }
            return prevIdx;
        });
    }, [history]);

    // ── Keydown Shortcuts (Ctrl + Z & Ctrl + Y) ──
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (isViewOnly) return;

            // Ignore when user is actively typing in inputs
            const activeElem = document.activeElement;
            if (activeElem && ['INPUT', 'TEXTAREA', 'SELECT'].includes(activeElem.tagName)) {
                return;
            }

            const isCtrlOrCmd = e.ctrlKey || e.metaKey;

            if (isCtrlOrCmd && e.key.toLowerCase() === 'z') {
                if (e.shiftKey) {
                    e.preventDefault();
                    redo();
                } else {
                    e.preventDefault();
                    undo();
                }
            } else if (isCtrlOrCmd && e.key.toLowerCase() === 'y') {
                e.preventDefault();
                redo();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [undo, redo, isViewOnly]);

    const getSlot = (day, periodId) =>
        slots.find(s => s.day === day && s.periodId === periodId);

    const toggleSlotSelection = (slot) => {
        const key = slotKey(slot);
        setSelectedSlotKey(prev => prev === key ? null : key);
    };
    const selectedSlots = slots.filter(s => slotKey(s) === selectedSlotKey);

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
        } catch (err) {
            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_SAVE_SLOT);
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
            toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_SLOT_REMOVED);
        } catch (err) {
            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_REMOVE_SLOT);
        }
    };

    const handleAutoFill = async () => {
        try {
            const result = await autoFillSlots(timetable.id);
            toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_AUTO_FILL(result?.filledCount));
            await loadTimetableData();
        } catch (err) {
            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_AUTO_FILL);
        }
    };

    // Directly clears all slots locally without calling API
    const handleClearAll = () => {
        setSlots([]);
        setSelectedSlotKey(null);
        pushHistory([]);
        toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_CLEAR_ALL);
    };

    const handlePublish = async () => {
        try {
            await publishTimetable(timetable.id);
            setStatus(TIMETABLE_CONSTS.STATUS.PUBLISHED);
            setShowDraftBanner(false);
            setShowPublishConfirm(false);
            toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_PUBLISHED);
        } catch (err) {
            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_PUBLISH);
        }
    };

    const handleBulkSave = async () => {
        try {
            setSavingAll(true);
            const apiSlots = slots.map(toApiSlot);
            await bulkSaveSlots(timetable.id, apiSlots);
            toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_SAVE_ALL);
        } catch (err) {
            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_SAVE_ALL);
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
        (subjectFilter === TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL || s.code === subjectFilter)
    );

    const uniqueTeacherNames = [...new Set(slots.map(s => s.teacher?.name).filter(Boolean))];

    const renderSlotCard = (day, period, slot, subjectMeta, teacherColor, isSelected) => {
        if (slot) {
            return (
                <div className={`relative rounded-lg border p-2.5 sm:p-2 group transition
                    ${isSelected ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                    ${subjectMeta ? `${subjectMeta.bg} ${subjectMeta.border}` : 'bg-gray-50 border-gray-200'}`}>
                    {!isViewOnly && (
                        <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSlotSelection(slot)}
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-1.5 right-1.5 w-4 h-4 sm:w-3.5 sm:h-3.5 accent-indigo-600 cursor-pointer z-10"
                            title="Select for substitution"
                        />
                    )}
                    {!isViewOnly && (
                        <div className="flex items-center justify-end gap-1.5 mt-1 sm:absolute sm:inset-x-0 sm:bottom-1.5 sm:justify-center sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-150 z-10">
                            <button
                                title={TIMETABLE_CONSTS.CREATE_SCHEDULE.TOOLTIP_EDIT}
                                onClick={() => setAddSlotTarget({ day, period, editSlot: slot })}
                                className="w-7 h-7 sm:w-6 sm:h-6 rounded bg-white/90 border border-gray-200 cursor-pointer shadow flex items-center justify-center hover:bg-blue-100 hover:border-blue-500 transition">
                                <Pencil size={12} className="text-gray-600" />
                            </button>
                            <button
                                title={TIMETABLE_CONSTS.CREATE_SCHEDULE.TOOLTIP_TEACHER}
                                onClick={() => setAssignTeacherTarget({ day, period, slot })}
                                className="w-7 h-7 sm:w-6 sm:h-6 rounded cursor-pointer bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-blue-100 hover:border-blue-500 transition">
                                <User size={12} className="text-gray-600" />
                            </button>
                            <button
                                title={TIMETABLE_CONSTS.CREATE_SCHEDULE.TOOLTIP_REMOVE}
                                onClick={() => handleRemoveSlot(day, period.id)}
                                className="w-7 h-7 sm:w-6 sm:h-6 rounded bg-white/90 border border-gray-200 cursor-pointer shadow flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition">
                                <Trash2 size={12} className="text-red-400" />
                            </button>
                        </div>
                    )}
                    <p className={`text-xs font-bold mb-0.5 pr-5 ${subjectMeta?.color || 'text-gray-600'}`}>
                        {slot.subject?.code}
                    </p>
                    <p className="text-xs sm:text-xs font-semibold text-gray-800 leading-tight">{slot.subject?.label}</p>
                    {slot.teacher?.name && (
                        <div className="flex items-center gap-1 mt-1">
                            <span className={`w-5 h-5 sm:w-4 sm:h-4 rounded-full ${teacherColor} text-white flex items-center justify-center shrink-0`} style={{ fontSize: '8px' }}>
                                {getInitials(slot.teacher.name)}
                            </span>
                            <span className="text-xs text-gray-500 truncate">{slot.teacher.name.split(' ')[0]}</span>
                        </div>
                    )}
                    {slot.room && <p className="text-xs text-gray-400 mt-0.5">📍 {slot.room}</p>}
                </div>
            );
        }
        if (isViewOnly) return null;
        return (
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
                        setAddSlotTarget({ day, period, prefillSubject: draggedSubject });
                        setDraggedSubject(null);
                    }
                }}
                className={`w-full min-h-16 sm:min-h-20 flex items-center justify-center rounded-lg transition border-2 border-dashed
                    ${dragOverCell?.day === day && dragOverCell?.periodId === period.id
                        ? 'border-blue-500 bg-blue-50 text-blue-600 scale-[1.02] shadow-sm'
                        : 'border-transparent hover:border-gray-200 text-gray-300 hover:text-gray-400 hover:bg-gray-100/60'
                    }`}>
                <Plus size={18} />
            </button>
        );
    };

    const sidebarPanel = (
        <>
            <div className="flex border-b border-gray-100 shrink-0">
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
                            className="w-full pl-8 pr-3 py-2 sm:py-1.5 text-sm sm:text-xs border border-gray-200 rounded-lg focus:outline-none" />
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{TIMETABLE_CONSTS.CREATE_SCHEDULE.DRAG_EMPTY}</p>
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
                                className="flex items-center gap-2 px-2 py-2.5 sm:py-2 rounded-lg hover:bg-gray-50 cursor-grab active:cursor-grabbing select-none"
                                title="Drag to a slot">
                                <span className={`w-1 h-6 rounded-full ${s.dot}`} />
                                <span className={`text-xs font-bold ${s.color}`}>{s.code}</span>
                                <span className="text-xs text-gray-700 flex-1 truncate">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {sidebarTab === 'hours' && (
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                    {subjectCounts.map(s => {
                        const hourPct = s.total ? Math.round((s.count / s.total) * 100) : 0;
                        return (
                            <div key={s.code}>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className={`font-bold ${s.color}`}>{s.code}</span>
                                    <span className="text-gray-400">{s.count}/{s.total}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div className={`h-1.5 rounded-full ${s.dot}`} style={{ width: `${hourPct}%` }} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-[#f0f4f9] flex flex-col relative overflow-hidden">

            {/* Draft Banner */}
            {showDraftBanner && status === TIMETABLE_CONSTS.STATUS.DRAFT && !isViewOnly && (
                <div className="bg-amber-50 border-b border-amber-200 px-3 sm:px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
                    <div className="flex items-start sm:items-center gap-2 text-amber-800 text-sm">
                        <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
                        <span>{TIMETABLE_CONSTS.CREATE_SCHEDULE.BANNER_DRAFT_TEXT}<strong>{TIMETABLE_CONSTS.CREATE_SCHEDULE.BANNER_DRAFT_STRONG}</strong>{TIMETABLE_CONSTS.CREATE_SCHEDULE.BANNER_DRAFT_END}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                        <button onClick={() => setShowPublishConfirm(true)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-amber-600 cursor-pointer text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition">
                            {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_PUBLISH_NOW}
                        </button>
                        <button onClick={() => setShowDraftBanner(false)}
                            className="flex-1 sm:flex-none px-3 py-1.5 bg-white border cursor-pointer border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition">
                            {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_DISMISS}
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-3 sm:px-4 py-2.5 sm:py-3 space-y-2.5">
                <div className="flex items-center gap-2 min-w-0">
                    <button onClick={onBack} className="flex items-center cursor-pointer gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium shrink-0">
                        <ChevronLeft size={16} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_BACK}
                    </button>
                    <div className="h-5 w-px bg-gray-200 hidden sm:block shrink-0" />
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-wrap">
                        <span className="font-bold text-gray-900 text-sm sm:text-base truncate">
                            {timetableInfo?.class || timetableInfo?.className}
                        </span>
                        <span className="text-gray-500 text-sm truncate">
                            {timetableInfo?.section || timetableInfo?.sectionName}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0
                            ${status === TIMETABLE_CONSTS.STATUS.DRAFT
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                            }`}>
                            {isViewOnly ? TIMETABLE_CONSTS.CREATE_SCHEDULE.VIEW_MODE : `${status}`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-between">
                    <div className="flex items-center gap-1">
                        <button onClick={() => setActiveTab('planner')}
                            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 cursor-pointer rounded-lg text-xs sm:text-sm font-medium transition
                                ${activeTab === 'planner' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <LayoutGrid size={15} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.TAB_PLANNER}
                        </button>
                        <button onClick={() => setActiveTab('analytics')}
                            className={`flex items-center cursor-pointer gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition
                                ${activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                            <BarChart2 size={15} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.TAB_ANALYTICS}
                        </button>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
                        {!isViewOnly && (
                            <>
                                <button onClick={undo} disabled={historyIdx === 0}
                                    className="p-2 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100 disabled:opacity-30 transition" title="Undo (Ctrl+Z)">
                                    <Undo2 size={16} />
                                </button>
                                <button onClick={redo} disabled={historyIdx === history.length - 1}
                                    className="p-2 rounded-lg text-gray-500 cursor-pointer hover:bg-gray-100 disabled:opacity-30 transition" title="Redo (Ctrl+Y)">
                                    <Redo2 size={16} />
                                </button>
                                <button onClick={handleAutoFill}
                                    className="flex items-center gap-1.5 px-2 sm:px-3 cursor-pointer py-1.5 border border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50 transition">
                                    <Wand2 size={14} /> <span className="hidden sm:inline">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_AUTO_FILL}</span>
                                </button>
                                <button
                                    onClick={handleBulkSave}
                                    disabled={savingAll}
                                    className={`flex items-center gap-1.5 px-2 sm:px-3 cursor-pointer py-1.5 rounded-lg text-xs sm:text-sm font-medium transition shadow-sm ${savingAll
                                        ? 'bg-blue-400 cursor-not-allowed opacity-80'
                                        : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                                    {savingAll ? (
                                        <><RefreshCw size={14} className="animate-spin" /> <span className="hidden sm:inline">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SAVING}</span></>
                                    ) : (
                                        <><span className="sm:hidden">💾</span><span className="hidden sm:inline">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SAVE_ALL}</span></>
                                    )}
                                </button>
                                {status === TIMETABLE_CONSTS.STATUS.DRAFT && (
                                    <button onClick={() => setShowPublishConfirm(true)}
                                        className="flex items-center gap-1.5 cursor-pointer px-2.5 sm:px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
                                        <Send size={14} /> <span className="hidden sm:inline">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_PUBLISH}</span>
                                    </button>
                                )}
                            </>
                        )}
                        {isViewOnly && (
                            <button onClick={() => setShowPrint(true)}
                                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 border cursor-pointer border-gray-200 rounded-lg text-xs sm:text-sm text-gray-700 hover:bg-gray-50">
                                <Printer size={14} /> <span className="hidden sm:inline">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_PRINT}</span>
                            </button>
                        )}
                    </div>
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
                    <div className="bg-white border-b border-gray-100 px-3 sm:px-5 py-2.5 grid grid-cols-2 md:grid-cols-3 xl:flex xl:flex-wrap xl:items-center gap-2">

                        {/* Working Days */}
                        <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{workingDays.length}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{TIMETABLE_CONSTS.CREATE_SCHEDULE.LBL_WORKING_DAYS}</p>
                            </div>
                        </div>

                        {/* Periods / Day */}
                        <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 15" />
                            </svg>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{timetableConfig?.periodsPerDay || periods.filter(p => !p.isBreak).length || 8}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{TIMETABLE_CONSTS.CREATE_SCHEDULE.LBL_PERIODS_DAY}</p>
                            </div>
                        </div>

                        {/* Slots Filled */}
                        <div className="flex items-center gap-2 sm:gap-3.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl bg-white col-span-2 md:col-span-1">
                            <div className="relative w-10 h-10 sm:w-[52px] sm:h-[52px] shrink-0">
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
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">{TIMETABLE_CONSTS.CREATE_SCHEDULE.LBL_SLOTS_FILLED}</p>
                                <div className="w-[90px] h-[3px] bg-gray-200 rounded-full mt-1.5">
                                    <div className="h-[3px] bg-blue-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* Empty Slots */}
                        <div className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-200 rounded-xl bg-white">
                            <svg className="text-slate-500 shrink-0" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                            </svg>
                            <div>
                                <p className={`text-[20px] font-bold leading-none ${emptyCount > 0 ? 'text-orange-500' : 'text-slate-900'}`}>{emptyCount}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{TIMETABLE_CONSTS.CREATE_SCHEDULE.LBL_EMPTY_SLOTS}</p>
                            </div>
                        </div>

                        {/* Teachers stat + Substitution buttons */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 border border-gray-200 rounded-xl bg-white col-span-2 md:col-span-1 xl:col-span-auto">
                            <div className="flex items-center">
                                {uniqueTeacherNames.length > 5 && (
                                    <span className="w-7 h-7 rounded-full border-2 border-white bg-indigo-500 text-white flex items-center justify-center shrink-0"
                                        style={{ fontSize: '9px', fontWeight: 700 }}>
                                        +{uniqueTeacherNames.length - 5}
                                    </span>
                                )}
                                {uniqueTeacherNames.slice(0, 5).map((n, i) => (
                                    <span key={n}
                                        className={`w-7 h-7 rounded-full border-2 border-white ${TIMETABLE_CONSTS.COLORS.TEACHER_MAP[n] || 'bg-gray-400'} text-white flex items-center justify-center shrink-0`}
                                        style={{ fontSize: '9px', fontWeight: 700, marginLeft: (i === 0 && uniqueTeacherNames.length <= 5) ? 0 : '-8px' }}>
                                        {getInitials(n)}
                                    </span>
                                ))}
                            </div>
                            <div>
                                <p className="text-[20px] font-bold text-slate-900 leading-none">{uniqueTeacherNames.length}</p>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">{TIMETABLE_CONSTS.CREATE_SCHEDULE.LBL_TEACHERS}</p>
                            </div>

                            {!isViewOnly && (
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5 sm:ml-2 w-full sm:w-auto">
                                    <button
                                        onClick={handleOpenSubstitution}
                                        disabled={selectedSlots.length === 0}
                                        title={selectedSlots.length === 0 ? 'Select one or more slots to arrange substitution' : `Arrange substitution for ${selectedSlots.length} slot(s)`}
                                        className={`flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border transition
                                            ${selectedSlots.length > 0
                                                ? 'bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 cursor-pointer shadow-sm'
                                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            }`}>
                                        <ArrowLeftRight size={13} />
                                        <span className="truncate">
                                            {selectedSlots.length > 0
                                                ? TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SUBSTITUTE_COUNT(selectedSlots.length)
                                                : TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SUBSTITUTE}
                                        </span>
                                    </button>
                                    <button
                                        onClick={() => setShowPendingSubstitutions(true)}
                                        title="View pending substitutions"
                                        className="flex items-center justify-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 cursor-pointer transition">
                                        <Clock size={13} />
                                        <span className="truncate">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_PENDING}</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Mobile sidebar toggle */}
                        {!isViewOnly && (
                            <button
                                onClick={() => setShowMobileSidebar(true)}
                                className="lg:hidden col-span-2 flex items-center justify-center gap-2 px-3 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                                <PanelLeft size={16} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SUB_PANEL}
                            </button>
                        )}

                        {/* Right side filters */}
                        {!isViewOnly && (
                            <div className="col-span-2 xl:col-span-auto xl:ml-auto flex items-center gap-2 flex-wrap w-full xl:w-auto">
                                <div className="flex gap-1 flex-wrap">
                                    <button onClick={() => setSubjectFilter(TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL)}
                                        className={`px-2.5 py-1 rounded-full text-xs cursor-pointer font-medium transition ${subjectFilter === TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL
                                            ? 'bg-blue-600 text-white shadow-sm'
                                            : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                        {TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL}
                                    </button>
                                    {subjectCounts.map(s => (
                                        <button key={s.code} onClick={() => setSubjectFilter(s.code === subjectFilter ? TIMETABLE_CONSTS.CREATE_SCHEDULE.FILTER_ALL : s.code)}
                                            className={`px-2.5 py-1 rounded-full cursor-pointer text-xs font-medium transition flex items-center gap-1 ${subjectFilter === s.code
                                                ? 'bg-blue-600 text-white shadow-sm'
                                                : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                            {s.code} {s.count}
                                        </button>
                                    ))}
                                </div>
                                <button onClick={() => setShowPrint(true)} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 cursor-pointer hover:bg-gray-50">
                                    <Printer size={13} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_PRINT}
                                </button>
                                <button onClick={handleClearAll} className="flex items-center gap-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs cursor-pointer text-red-500 hover:bg-red-50">
                                    <Trash2 size={13} /> {TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_CLEAR_ALL}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Planner Grid */}
                    <div className="flex flex-col lg:flex-row flex-1 overflow-hidden min-h-0">
                        {/* Mobile sidebar drawer */}
                        {!isViewOnly && showMobileSidebar && (
                            <>
                                <div
                                    className="lg:hidden fixed inset-0 bg-black/40 z-40"
                                    onClick={() => setShowMobileSidebar(false)}
                                />
                                <div className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 max-w-[88vw] bg-white border-r border-gray-200 shadow-xl flex flex-col min-h-0">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                                        <span className="text-sm font-semibold text-gray-800">{TIMETABLE_CONSTS.CREATE_SCHEDULE.BTN_SUB_PANEL}</span>
                                        <button
                                            onClick={() => setShowMobileSidebar(false)}
                                            className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                                            <PanelLeftClose size={18} className="text-gray-500" />
                                        </button>
                                    </div>
                                    {sidebarPanel}
                                </div>
                            </>
                        )}

                        {/* Desktop sidebar */}
                        {!isViewOnly && (
                            <div className="hidden lg:flex w-52 shrink-0 bg-white border-r border-gray-200 flex-col min-h-0">
                                {sidebarPanel}
                            </div>
                        )}

                        {/* Grid */}
                        <div className="flex-1 overflow-hidden flex flex-col min-h-0 min-w-0">
                            {loadingSlots ? (
                                <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                                    {TIMETABLE_CONSTS.CREATE_SCHEDULE.LOADING_TT}
                                </div>
                            ) : (
                                <>
                                    {/* Mobile / tablet day view */}
                                    <div className="lg:hidden flex flex-col flex-1 min-h-0">
                                        <div className="flex overflow-x-auto gap-1.5 p-2 bg-white border-b border-gray-200 shrink-0 scrollbar-thin">
                                            {workingDays.map(day => (
                                                <button
                                                    key={day}
                                                    onClick={() => setMobileDay(day)}
                                                    className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap shrink-0 transition
                                                    ${mobileDay === day
                                                            ? 'bg-gray-700 text-white shadow-sm'
                                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                    {day}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                                            {periods.map(period => {
                                                if (period.isBreak) {
                                                    return (
                                                        <div key={period.id} className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                                                            <div className="flex items-center gap-2">
                                                                <span>{period.emoji}</span>
                                                                <span className="text-sm font-semibold text-amber-800">{period.label}</span>
                                                                <span className="text-xs text-amber-600 ml-auto">{period.time}</span>
                                                                {period.duration && (
                                                                    <span className="bg-amber-200 text-amber-800 text-xs font-bold px-1.5 py-0.5 rounded">{period.duration}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                const slot = getSlot(mobileDay, period.id);
                                                const subjectMeta = slot
                                                    ? (subjectsList.find(s => s.code === slot.subject?.code || s.id === slot.subject?.id) || null)
                                                    : null;
                                                const teacherColor = slot?.teacher?.name ? (TIMETABLE_CONSTS.COLORS.TEACHER_MAP[slot.teacher.name] || 'bg-gray-400') : '';
                                                const isSelected = slot ? selectedSlotKey === slotKey(slot) : false;
                                                return (
                                                    <div key={period.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                                        <div className="px-3 py-2 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                                            <div>
                                                                <p className="text-xs font-semibold text-gray-400">{period.id}</p>
                                                                <p className="text-sm font-medium text-gray-800">{period.label}</p>
                                                            </div>
                                                            <p className="text-xs text-gray-400">{period.time}</p>
                                                        </div>
                                                        <div className="p-2">
                                                            {renderSlotCard(mobileDay, period, slot, subjectMeta, teacherColor, isSelected)}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Desktop table view */}
                                    <div className="hidden lg:block flex-1 relative w-full bg-white">
                                        <div className="absolute inset-0 overflow-x-auto">
                                            <table className="w-full border-collapse min-w-max">
                                                <thead>
                                                    <tr>
                                                        <th className="bg-gray-50 border-b border-r border-gray-200 px-4 py-3 text-left text-xs font-semibold text-gray-500 w-36 sticky left-0 top-0 z-20">
                                                            {TIMETABLE_CONSTS.CREATE_SCHEDULE.TH_PERIOD_TIME}
                                                        </th>
                                                        {workingDays.map(day => (
                                                            <th key={day}
                                                                className={`border-b border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold min-w-[120px] sticky top-0 z-11 ${day === 'Mon' ? 'bg-gray-600 text-white' : 'bg-gray-600 text-gray-200'}`}>
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
                                                                    <td className="border-b border-r border-gray-200 px-4 py-2 sticky left-0 bg-amber-50 z-10">
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
                                                                <td className="border-b border-r border-gray-200 px-4 py-3 sticky left-0 bg-white z-11">
                                                                    <p className="text-xs font-semibold text-gray-400">{period.id}</p>
                                                                    <p className="text-sm font-medium text-gray-800">{period.label}</p>
                                                                    <p className="text-xs text-gray-400">{period.time}</p>
                                                                </td>
                                                                {workingDays.map(day => {
                                                                    const slot = getSlot(day, period.id);
                                                                    const subjectMeta = slot
                                                                        ? (subjectsList.find(s => s.code === slot.subject?.code || s.id === slot.subject?.id) || null)
                                                                        : null;
                                                                    const teacherColor = slot?.teacher?.name ? (TIMETABLE_CONSTS.COLORS.TEACHER_MAP[slot.teacher.name] || 'bg-gray-400') : '';
                                                                    const isSelected = slot
                                                                        ? selectedSlotKey === slotKey(slot)
                                                                        : false;

                                                                    return (
                                                                        <td key={day} className="border-b border-r border-gray-200 p-1.5 align-top min-w-[120px]">
                                                                            {renderSlotCard(day, period, slot, subjectMeta, teacherColor, isSelected)}
                                                                        </td>
                                                                    );
                                                                })}
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="bg-white border-t border-gray-200 px-3 sm:px-4 py-2 flex items-center gap-2 sm:gap-3 text-xs text-gray-400 flex-wrap">
                        <span className="hidden md:inline">{workingDays.length} days · {timetableConfig?.periodsPerDay || periods.filter(p => !p.isBreak).length || 8} periods/day</span>
                        <span>•</span>
                        <span className={status === TIMETABLE_CONSTS.STATUS.DRAFT ? 'text-amber-600 font-medium' : 'text-blue-600 font-medium'}>{status}</span>
                        {selectedSlots.length > 0 && (
                            <>
                                <span className="hidden sm:inline">•</span>
                                <span className="text-indigo-600 font-medium">{selectedSlots.length} selected</span>
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
                            toast.success(TIMETABLE_CONSTS.MESSAGES.SUCC_SAVE_TEACHER);
                        } catch (err) {
                            toast.error(err.message || TIMETABLE_CONSTS.MESSAGES.ERR_SAVE_TEACHER);
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
                    onSuccess={(customMsg) => {
                        loadTimetableData();
                        setSubstitutionTarget(null);
                        setSelectedSlotKey(null);
                    }}
                />
            )}

            {/* Pending Substitutions Modal */}
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{TIMETABLE_CONSTS.CREATE_SCHEDULE.CONFIRM_PUB_TITLE}</h3>
                        <p className="text-sm text-gray-500 mb-5">
                            {TIMETABLE_CONSTS.CREATE_SCHEDULE.CONFIRM_PUB_MSG1}
                            <strong>{timetableInfo?.class} — {timetableInfo?.section}</strong>.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button onClick={() => setShowPublishConfirm(false)}
                                className="px-4 py-2 border border-gray-200 cursor-pointer rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                {TIMETABLE_CONSTS.CREATE_SCHEDULE.CONFIRM_PUB_CANCEL}
                            </button>
                            <button onClick={handlePublish}
                                className="px-4 py-2 bg-blue-600 cursor-pointer text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-sm">
                                {TIMETABLE_CONSTS.CREATE_SCHEDULE.CONFIRM_PUB_YES}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}