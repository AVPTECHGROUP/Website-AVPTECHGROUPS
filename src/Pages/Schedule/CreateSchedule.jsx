import { useState, useCallback, useEffect } from 'react';
import {
    ChevronLeft, LayoutGrid, BarChart2, Wand2, ArrowLeftRight,
    Settings, Send, Printer, Trash2, Undo2, Redo2, Plus,
    Search, AlertTriangle, X, Eye, Pencil, User, RefreshCw
} from 'lucide-react';
import AddSlotModal from './components/AddSlotModal';
import TimetableSettings from './components/TimetableSettings';
import SubstitutionModal from './components/SubstitutionModal';
import AssignTeacherModal from './components/AssignTeacherModal';
import AnalyticsTab from './components/AnalyticsTab';
import {
    getTimetableById,
    getTimetableSlots,
    publishTimetable,
    autoFillSlots,
    bulkSaveSlots,
    deleteSlot,
    saveSlot,
} from '../../api/ScheduleApi';
import { getSubjectsBySection } from '../../Api/TeachersAPI';

const WORKING_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const PERIODS = [
    { id: 'P1', label: 'Period 1', time: '08:00–08:45' },
    { id: 'P2', label: 'Period 2', time: '08:45–09:30' },
    { id: 'P3', label: 'Period 3', time: '09:30–10:15' },
    { id: 'P4', label: 'Period 4', time: '10:15–11:00' },
    { id: 'RECESS', label: 'Recess', time: '11:00–11:20', isBreak: true, duration: '20 min', emoji: '🍎' },
    { id: 'P5', label: 'Period 5', time: '11:20–12:05' },
    { id: 'P6', label: 'Period 6', time: '12:05–12:50' },
    { id: 'LUNCH', label: 'Lunch Break', time: '12:50–13:30', isBreak: true, duration: '40 min', emoji: '🥗' },
    { id: 'P7', label: 'Period 7', time: '13:30–14:15' },
    { id: 'P8', label: 'Period 8', time: '14:15–15:00' },
];

// ── Subject color helpers (dynamic, not hardcoded) ──
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

// Helper to convert local slot to API format
// ✅ subjectId: subject.id > slot-level subjectId fallback
const toApiSlot = (slot) => ({
    dayOfWeek: slot.day,
    periodNumber: parseInt(slot.periodId.replace('P', '')),
    subjectId: slot.subject?.id ?? slot.subjectId ?? null,
    teacherId: slot.teacher?.id ?? slot.teacherId ?? null,
    room: slot.room || null,
});

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

    // Modal states
    const [addSlotTarget, setAddSlotTarget] = useState(null);       // { day, period, editSlot? }
    const [editSlotTarget, setEditSlotTarget] = useState(null);     // slot to edit
    const [assignTeacherTarget, setAssignTeacherTarget] = useState(null); // { day, period, slot }
    const [substitutionTarget, setSubstitutionTarget] = useState(null);   // slot for substitution
    const [showSettings, setShowSettings] = useState(false);
    const [showSubstitution, setShowSubstitution] = useState(false);
    const [showPublishConfirm, setShowPublishConfirm] = useState(false);
    const [draggedSubject, setDraggedSubject] = useState(null);

    const [subjectSearch, setSubjectSearch] = useState('');
    const [subjectFilter, setSubjectFilter] = useState('All');
    const [sidebarTab, setSidebarTab] = useState('subjects');
    const [toastMsg, setToastMsg] = useState('');

    // ── Dynamic subjects from section API ──
    const [subjectsList, setSubjectsList] = useState([]);
    // sectionId: from timetable prop (set by normalizeApiTimetable in TimeTable.jsx)
    const sectionId = timetable?.sectionId || timetableInfo?.sectionId || null;

    // ── Load timetable info + slots + subjects on mount ──
    useEffect(() => {
        if (!timetable?.id) return;
        loadTimetableData();
    }, [timetable?.id]);

    // Load subjects when sectionId is known
    useEffect(() => {
        if (!sectionId) return;
        loadSubjects(sectionId);
    }, [sectionId]);

    const showToast = (msg) => {
        setToastMsg(msg);
        setTimeout(() => setToastMsg(''), 3000);
    };

    const loadSubjects = async (secId) => {
        try {
            const data = await getSubjectsBySection(secId);
            // getSubjectsBySection returns: [{ id: subjectId, name, code }]
            const enriched = (data || []).map((s, i) => ({
                id: s.id,
                code: s.code || s.subjectCode || '',
                label: s.name || s.subjectName || '',
                total: 0, // no hardcoded target needed
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
            // If sectionId comes from API (not already in timetable prop), load subjects now
            const resolvedSectionId = resolvedInfo?.sectionId || timetable?.sectionId;
            if (resolvedSectionId && subjectsList.length === 0) {
                loadSubjects(resolvedSectionId);
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

    // ── Add / Edit slot ──
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
            setEditSlotTarget(null);
            showToast('Slot saved ✓');
        } catch (err) {
            showToast(err.message || 'Failed to save slot');
        }
    };

    // ── Remove single slot ──
    const handleRemoveSlot = async (day, periodId) => {
        try {
            const periodNumber = parseInt(periodId.replace('P', ''));
            await deleteSlot(timetable.id, day, periodNumber);
            const newSlots = slots.filter(s => !(s.day === day && s.periodId === periodId));
            setSlots(newSlots);
            pushHistory(newSlots);
            showToast('Slot removed');
        } catch (err) {
            showToast(err.message || 'Failed to remove slot');
        }
    };

    // ── Auto-fill ──
    const handleAutoFill = async () => {
        try {
            const result = await autoFillSlots(timetable.id);
            showToast(`Auto-filled ${result?.filledCount ?? ''} slots`);
            await loadTimetableData();
        } catch (err) {
            showToast(err.message || 'Auto-fill failed');
        }
    };

    // ── Clear all slots ──
    const handleClearAll = async () => {
        try {
            await bulkSaveSlots(timetable.id, []);
            setSlots([]);
            pushHistory([]);
            showToast('All slots cleared');
        } catch (err) {
            showToast(err.message || 'Failed to clear slots');
        }
    };

    // ── Publish ──
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

    // ── Bulk Save (Save All) ──
    const handleBulkSave = async () => {
        try {
            const apiSlots = slots.map(toApiSlot);
            await bulkSaveSlots(timetable.id, apiSlots);
            showToast('All slots saved ✓');
        } catch (err) {
            showToast(err.message || 'Failed to save slots');
        }
    };

    const totalSlots = 48;
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
                            className="px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg hover:bg-amber-700 transition">
                            Publish Now
                        </button>
                        <button onClick={() => setShowDraftBanner(false)}
                            className="px-3 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-semibold rounded-lg hover:bg-amber-50 transition">
                            Dismiss
                        </button>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 flex-wrap">
                <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium">
                    <ChevronLeft size={16} /> Back
                </button>
                <div className="h-5 w-px bg-gray-200" />
                <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{timetableInfo?.class}</span>
                    <span className="text-gray-500">{timetableInfo?.section}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ml-1
            ${status === 'Draft' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {isViewOnly ? '👁 View' : `— ${status}`}
                    </span>
                </div>

                {/* Tab switcher */}
                <div className="flex items-center gap-1 ml-2">
                    <button onClick={() => setActiveTab('planner')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
              ${activeTab === 'planner' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <LayoutGrid size={15} /> Planner
                    </button>
                    <button onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition
              ${activeTab === 'analytics' ? 'bg-[#1e293b] text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                        <BarChart2 size={15} /> Analytics
                    </button>
                </div>

                {/* Right-side actions */}
                <div className="flex items-center gap-1.5 ml-auto flex-wrap">
                    {!isViewOnly && (
                        <>
                            <button onClick={undo} disabled={historyIdx === 0}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition" title="Undo">
                                <Undo2 size={16} />
                            </button>
                            <button onClick={redo} disabled={historyIdx === history.length - 1}
                                className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition" title="Redo">
                                <Redo2 size={16} />
                            </button>
                            <button onClick={handleAutoFill}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                <Wand2 size={14} /> Auto-fill
                            </button>
                            <button onClick={handleBulkSave}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-blue-200 bg-blue-50 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition">
                                💾 Save All
                            </button>
                            <button onClick={() => setShowSubstitution(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                <ArrowLeftRight size={14} /> Substitution
                            </button>
                            <button onClick={() => setShowSettings(true)}
                                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition">
                                <Settings size={14} /> Settings
                            </button>
                            {status === 'Draft' && (
                                <button onClick={() => setShowPublishConfirm(true)}
                                    className="flex items-center gap-1.5 px-4 py-1.5 bg-[#1e293b] text-white rounded-lg text-sm font-semibold hover:bg-[#334155] transition">
                                    <Send size={14} /> Publish
                                </button>
                            )}
                        </>
                    )}
                    {isViewOnly && (
                        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50">
                            <Printer size={14} /> Print
                        </button>
                    )}
                </div>
            </div>

            {activeTab === 'analytics' ? (
                <div className="flex-1 overflow-auto">
                    <AnalyticsTab slots={slots} subjectsList={subjectsList}/>
                </div>
            ) : (
                <>
                    {/* Stats Bar */}
                    <div className="bg-white border-b border-gray-100 px-4 py-3">
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-xs">📅</span>
                                <span className="font-semibold">{WORKING_DAYS.length}</span>
                                <span className="text-gray-400">Working Days</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="w-5 h-5 bg-gray-100 rounded flex items-center justify-center text-xs">⏱</span>
                                <span className="font-semibold">8</span>
                                <span className="text-gray-400">Periods / Day</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="w-8 h-8 relative">
                                    <svg viewBox="0 0 36 36" className="w-8 h-8 -rotate-90">
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="4" />
                                        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#3b82f6" strokeWidth="4"
                                            strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
                                    </svg>
                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700">{pct}%</span>
                                </div>
                                <div>
                                    <span className="font-semibold">{filledCount}/{totalSlots}</span>
                                    <span className="text-gray-400 ml-1">Slots Filled</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="font-semibold text-amber-600">{emptyCount}</span>
                                <span className="text-gray-400">Empty Slots</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                <div className="flex -space-x-1">
                                    {uniqueTeacherNames.slice(0, 5).map(n => (
                                        <span key={n} className={`w-6 h-6 rounded-full border-2 border-white ${TEACHER_COLORS[n] || 'bg-gray-400'} text-white text-xs font-bold flex items-center justify-center`}>
                                            {getInitials(n)}
                                        </span>
                                    ))}
                                    {uniqueTeacherNames.length > 5 && (
                                        <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-300 text-gray-700 text-xs font-bold flex items-center justify-center">
                                            +{uniqueTeacherNames.length - 5}
                                        </span>
                                    )}
                                </div>
                                <span className="font-semibold">{uniqueTeacherNames.length}</span>
                                <span className="text-gray-400">Teachers</span>
                            </div>

                            {!isViewOnly && (
                                <div className="ml-auto flex items-center gap-2">
                                    <div className="flex gap-1 flex-wrap">
                                        <button onClick={() => setSubjectFilter('All')}
                                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition ${subjectFilter === 'All' ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                            All
                                        </button>
                                        {subjectCounts.map(s => (
                                            <button key={s.code} onClick={() => setSubjectFilter(s.code === subjectFilter ? 'All' : s.code)}
                                                className={`px-2.5 py-1 rounded-full text-xs font-medium transition flex items-center gap-1
                          ${subjectFilter === s.code ? 'bg-[#1e293b] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                                                {s.code} {s.count}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => window.print()} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50">
                                        <Printer size={13} /> Print
                                    </button>
                                    <button onClick={handleClearAll} className="flex items-center gap-1 px-3 py-1.5 border border-red-100 rounded-lg text-xs text-red-500 hover:bg-red-50">
                                        <Trash2 size={13} /> Clear All
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Planner Grid */}
                    <div className="flex flex-1 overflow-hidden">
                        {/* Sidebar */}
                        {!isViewOnly && (
                            <div className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
                                <div className="flex border-b border-gray-100">
                                    <button onClick={() => setSidebarTab('subjects')}
                                        className={`flex-1 py-2.5 text-xs font-medium transition ${sidebarTab === 'subjects' ? 'border-b-2 border-[#1e293b] text-[#1e293b]' : 'text-gray-500'}`}>
                                        Subjects
                                    </button>
                                    <button onClick={() => setSidebarTab('hours')}
                                        className={`flex-1 py-2.5 text-xs font-medium transition flex items-center justify-center gap-1 ${sidebarTab === 'hours' ? 'border-b-2 border-[#1e293b] text-[#1e293b]' : 'text-gray-500'}`}>
                                        <BarChart2 size={12} /> Hours
                                    </button>
                                </div>

                                {sidebarTab === 'subjects' && (
                                    <div className="flex-1 overflow-y-auto p-3">
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
                                                    onDragStart={() => setDraggedSubject(s)}
                                                    className="flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50 cursor-grab"
                                                >
                                                    <span className={`w-1 h-6 rounded-full ${s.dot}`} />
                                                    <span className={`text-xs font-bold ${s.color}`}>{s.code}</span>
                                                    <span className="text-xs text-gray-700 flex-1">{s.label}</span>
                                                    <span className="text-xs text-gray-400">{s.count}/{s.total}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {sidebarTab === 'hours' && (
                                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
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
                                            {WORKING_DAYS.map(day => (
                                                <th key={day}
                                                    className={`border-b border-r border-gray-200 px-3 py-3 text-center text-sm font-semibold min-w-32.5
                          ${day === 'Mon' ? 'bg-[#1e293b] text-white' : 'bg-gray-800 text-gray-200'}`}>
                                                    {day === 'Mon' ? `• ${day}` : day}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {PERIODS.map(period => {
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
                                                        {WORKING_DAYS.map(day => (
                                                            <td key={day} className="border-b border-r border-gray-200 px-3 py-2">
                                                                {day === WORKING_DAYS[0] && (
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
                                                    {WORKING_DAYS.map(day => {
                                                        const slot = getSlot(day, period.id);
                                                        const subjectMeta = slot
                                                            ? (subjectsList.find(s => s.code === slot.subject?.code || s.id === slot.subject?.id) || null)
                                                            : null;
                                                        const teacherColor = slot?.teacher?.name ? (TEACHER_COLORS[slot.teacher.name] || 'bg-gray-400') : '';

                                                        return (
                                                            <td key={day} className="border-b border-r border-gray-200 p-1.5 align-top">
                                                                {slot ? (
                                                                    // ── FILLED SLOT with 4 hover icons ──
                                                                    <div className={`relative rounded-lg border p-2 group
                                      ${subjectMeta ? `${subjectMeta.bg} ${subjectMeta.border}` : 'bg-gray-50 border-gray-200'}`}>

                                                                        {/* 4 action icons on hover */}
                                                                        {!isViewOnly && (
                                                                            <div className="absolute inset-x-0 bottom-1.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-150 z-10">
                                                                                {/* 1. Edit slot */}
                                                                                <button
                                                                                    title="Edit Slot"
                                                                                    onClick={() => setAddSlotTarget({ day, period, editSlot: slot })}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-blue-50 hover:border-blue-300 transition">
                                                                                    <Pencil size={10} className="text-gray-600" />
                                                                                </button>
                                                                                {/* 2. Assign Teacher */}
                                                                                <button
                                                                                    title="Assign Teacher"
                                                                                    onClick={() => setAssignTeacherTarget({ day, period, slot })}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-green-50 hover:border-green-300 transition">
                                                                                    <User size={10} className="text-gray-600" />
                                                                                </button>
                                                                                {/* 3. Substitution */}
                                                                                <button
                                                                                    title="Arrange Substitution"
                                                                                    onClick={() => setSubstitutionTarget({ day, period, slot })}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-purple-50 hover:border-purple-300 transition">
                                                                                    <RefreshCw size={10} className="text-gray-600" />
                                                                                </button>
                                                                                {/* 4. Delete slot */}
                                                                                <button
                                                                                    title="Remove Slot"
                                                                                    onClick={() => handleRemoveSlot(day, period.id)}
                                                                                    className="w-6 h-6 rounded bg-white/90 border border-gray-200 shadow flex items-center justify-center hover:bg-red-50 hover:border-red-300 transition">
                                                                                    <Trash2 size={10} className="text-red-400" />
                                                                                </button>
                                                                            </div>
                                                                        )}

                                                                        <p className={`text-xs font-bold mb-0.5 ${subjectMeta?.color || 'text-gray-600'}`}>
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
                                                                        {/* Spacer so icons don't overlap text */}
                                                                        {!isViewOnly && <div className="h-5" />}
                                                                    </div>
                                                                ) : (
                                                                    !isViewOnly && (
                                                                        <button
                                                                            onClick={() => setAddSlotTarget({ day, period })}

                                                                            onDragOver={(e) => e.preventDefault()}

                                                                            onDrop={() => {
                                                                                if (draggedSubject) {
                                                                                    setAddSlotTarget({
                                                                                        day,
                                                                                        period,
                                                                                        prefillSubject: draggedSubject,
                                                                                    });
                                                                                    setDraggedSubject(null);
                                                                                }
                                                                            }}

                                                                            className="w-full h-full min-h-20 flex items-center justify-center text-gray-300 hover:text-gray-400 hover:bg-gray-100/60 rounded-lg transition border-2 border-transparent hover:border-gray-200 border-dashed"
                                                                        >
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
                        <span>6 days · 8 periods/day</span>
                        <span>•</span>
                        <span className={status === 'Draft' ? 'text-amber-600 font-medium' : 'text-blue-600 font-medium'}>{status}</span>
                    </div>
                </>
            )}

            {/* ── Modals ── */}

            {/* Add / Edit Slot Modal */}
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

            {/* Assign Teacher Modal */}
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

            {/* Substitution Modal — slot-level */}
            {substitutionTarget && !isViewOnly && (
                <SubstitutionModal
                    timetableId={timetable?.id}
                    slot={substitutionTarget.slot}
                    onClose={() => setSubstitutionTarget(null)}
                />
            )}

            {/* Substitution Modal — toolbar level */}
            {showSubstitution && !isViewOnly && (
                <SubstitutionModal
                    timetableId={timetable?.id}
                    onClose={() => setShowSubstitution(false)}
                />
            )}

            {/* Settings Modal */}
            {showSettings && !isViewOnly && (
                <TimetableSettings
                    timetable={timetableInfo}
                    timetableId={timetable?.id}
                    onClose={() => setShowSettings(false)}
                    onApply={async (updatedForm) => {
                        setWorkingDays(updatedForm.workingDays); 
                        await loadTimetableData();
                        setShowSettings(false);
                    }}
                />
            )}

            {/* Publish Confirm */}
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
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handlePublish}
                                className="px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155]">
                                Yes, Publish
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}