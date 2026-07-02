import { useState, useEffect } from 'react';
import { X, Loader2, Search, ChevronRight, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { getAvailableTeachersForSlot } from '../../../Api/Academics/ScheduleApi';
import SectionSubjectService from "../../../Api/Academics/SectionSubjectService";
import { TIMETABLE_CONSTS } from '../../../Constants/StringConstants/TimetableConstants';

/* ─── Helpers (rely on constants now) ────────────────────────── */
const getSubjectColor = (code, index) => {
    const upper = (code || '').toUpperCase();
    return TIMETABLE_CONSTS.COLORS.SUBJECT_MAP[upper] || TIMETABLE_CONSTS.COLORS.SUBJECT_POOL[index % TIMETABLE_CONSTS.COLORS.SUBJECT_POOL.length];
};

const normalizeTeacher = (t) => ({
    id: t.teacherId,
    name: t.teacherName,
    initials: t.initials || t.teacherName?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(),
    currentLoad: t.weeklyLoad,
});

/* ─── avatar colours (cycle by id) ──────────────────────────── */
const avatarColor = (id) => TIMETABLE_CONSTS.COLORS.AVATAR_POOL[(id || 0) % TIMETABLE_CONSTS.COLORS.AVATAR_POOL.length];

/* ─── SearchBar ──────────────────────────────────────────────── */
function SearchBar({ value, onChange, placeholder, disabled }) {
    return (
        <div className={`flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2
            focus-within:border-gray-400 focus-within:bg-white transition
            ${disabled ? 'opacity-40 pointer-events-none' : ''}`}>
            <Search size={13} className="text-gray-400 shrink-0" />
            <input
                type="text"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 placeholder-gray-400"
            />
            {value && (
                <button onClick={() => onChange('')} className="text-gray-400 hover:text-gray-600">
                    <X size={12} />
                </button>
            )}
        </div>
    );
}

/* ─── TeacherRow ─────────────────────────────────────────────── */
/**
 * readOnly=true → busy/conflict teachers: no radio, no click, conflict badge shown
 */
function TeacherRow({ t, selected, onSelect, barColor = '#22c55e', readOnly = false }) {
    const ac = avatarColor(t.id);
    const pct = t.currentLoad != null ? Math.min((t.currentLoad / 35) * 100, 100) : null;

    const content = (
        <>
            {/* indicator: radio for selectable, conflict icon for busy */}
            {readOnly ? (
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                    <AlertCircle size={12} className="text-red-400" />
                </span>
            ) : (
                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                    ${selected ? 'border-slate-800' : 'border-gray-300'}`}>
                    {selected && <span className="w-2 h-2 rounded-full bg-slate-800 block" />}
                </span>
            )}

            {/* avatar */}
            <span
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                style={{ background: ac.bg, color: ac.text }}
            >
                {t.initials}
            </span>

            {/* name + load bar */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate leading-tight">{t.name}</p>
                {pct !== null && (
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1 bg-gray-100 rounded-full">
                            <div className="h-1 rounded-full transition-all"
                                style={{ width: `${pct}%`, background: barColor }} />
                        </div>
                        <span className="text-[11px] text-gray-400 shrink-0">{t.currentLoad}h/w</span>
                    </div>
                )}
            </div>

            {!readOnly && selected && <ChevronRight size={14} className="text-slate-500 shrink-0" />}
        </>
    );

    if (readOnly) {
        return (
            <div className="w-full flex items-center gap-3 px-4 py-2.5 opacity-50 cursor-not-allowed select-none">
                {content}
            </div>
        );
    }

    return (
        <button
            onClick={() => onSelect(selected ? null : t.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors
                ${selected ? 'bg-slate-50' : 'hover:bg-gray-50'}`}
        >
            {content}
        </button>
    );
}

/* ─── section label ──────────────────────────────────────────── */
function SectionLabel({ children, className = '' }) {
    return (
        <p className={`text-[10px] font-semibold uppercase tracking-wider px-4 pt-3 pb-1 ${className}`}>
            {children}
        </p>
    );
}

/* ─── main modal ─────────────────────────────────────────────── */
export default function AddSlotModal({
    day,
    period,
    timetableId,
    sectionId,
    editSlot = null,
    prefillSubject = null,
    onClose,
    onSave,
}) {
    const isEdit = !!editSlot;

    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [subjectError, setSubjectError] = useState('');

    const [teachers, setTeachers] = useState({ bestMatch: [], others: [], busy: [] });
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    // ── FIX: initialise selectedSubject safely from editSlot or prefill ──
    const [selectedSubject, setSelectedSubject] = useState(
        editSlot?.subject ?? prefillSubject ?? null
    );
    // ── FIX: initialise teacher id — guard both possible shapes ──────────
    const [selectedTeacher, setSelectedTeacher] = useState(
        editSlot?.teacherId ?? editSlot?.teacher?.id ?? null
    );
    const [selectedRoom, setSelectedRoom] = useState(editSlot?.room || TIMETABLE_CONSTS.ADD_SLOT.ROOMS[0]);
    const [subjectSearch, setSubjectSearch] = useState('');
    const [teacherSearch, setTeacherSearch] = useState('');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    /* load subjects on mount */
    useEffect(() => {
        if (!sectionId) { setSubjectError(TIMETABLE_CONSTS.MESSAGES.ERR_LOAD_SUBJ); return; }
        loadSubjects();
    }, [sectionId]);

    const loadSubjects = async () => {
        try {
            setLoadingSubjects(true);
            setSubjectError('');
            const data = await SectionSubjectService.getSubjectsBySection(sectionId);
            const enriched = (data || []).map((s, i) => ({
                id: s.id,
                code: s.code || s.subjectCode || '',
                label: s.name || s.subjectName || '',
                ...getSubjectColor(s.code || s.subjectCode, i),
            }));
            setSubjects(enriched);

            // Resolve and upgrade the currently selected subject to its enriched version
            const currentId = editSlot?.subject?.id ?? prefillSubject?.id;
            if (currentId) {
                const matched = enriched.find(s => s.id === currentId);
                if (matched) setSelectedSubject(matched);
            }
        } catch {
            setSubjectError(TIMETABLE_CONSTS.ADD_SLOT.ERR_LOAD_SUBJ);
        } finally {
            setLoadingSubjects(false);
        }
    };

    /* load teachers whenever subject changes */
    useEffect(() => {
        if (!selectedSubject?.id || !timetableId || !period?.id) return;
        const periodNumber = parseInt(period.id.replace('P', ''));
        if (isNaN(periodNumber)) return;
        setTeacherSearch('');
        loadTeachers(selectedSubject.id, periodNumber);
    }, [selectedSubject?.id]);

    const loadTeachers = async (subjectId, periodNumber) => {
        try {
            setLoadingTeachers(true);
            const res = await getAvailableTeachersForSlot(timetableId, day, periodNumber, subjectId);
            setTeachers({
                bestMatch: (res?.bestMatch || []).map(normalizeTeacher),
                others: (res?.others || []).map(normalizeTeacher),
                busy: (res?.busy || []).map(normalizeTeacher),
            });
        } catch {
            setTeachers({ bestMatch: [], others: [], busy: [] });
        } finally {
            setLoadingTeachers(false);
        }
    };

    /* filtered subjects */
    const filteredSubjects = subjects.filter(s => {
        const q = subjectSearch.trim().toLowerCase();
        return !q || s.label.toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
    });

    /* filtered teachers */
    const filterTeachers = (list) => {
        const q = teacherSearch.trim().toLowerCase();
        if (!q) return list;
        return list.filter(t =>
            t.name.toLowerCase().includes(q) ||
            (t.initials || '').toLowerCase().includes(q)
        );
    };
    const filteredBest = filterTeachers(teachers.bestMatch);
    const filteredOthers = filterTeachers(teachers.others);
    const filteredBusy = filterTeachers(teachers.busy);
    const totalFiltered = filteredBest.length + filteredOthers.length + filteredBusy.length;
    const hasAny = teachers.bestMatch.length + teachers.others.length + teachers.busy.length > 0;

    /* ── FIX: handleSave — no longer falls back to editSlot.teacher ─────
       When selectedTeacher is null, teacher is intentionally unassigned.
    ──────────────────────────────────────────────────────────────────── */
    const handleSave = async () => {
        if (!selectedSubject) { setFormError(TIMETABLE_CONSTS.ADD_SLOT.ERR_NO_SUBJ); return; }
        try {
            setSaving(true);
            const allTeachers = [...teachers.bestMatch, ...teachers.others, ...teachers.busy];

            // If selectedTeacher is null → deliberately unassigned; do NOT fall back.
            const teacher = selectedTeacher !== null
                ? (allTeachers.find(t => t.id === selectedTeacher) ?? null)
                : null;

            await onSave({
                subject: { id: selectedSubject.id, code: selectedSubject.code, label: selectedSubject.label },
                subjectId: selectedSubject.id,
                teacher,
                teacherId: selectedTeacher,
                room: selectedRoom,
                day,
                period,
            });

            // Toast on success
            if (teacher) {
                toast.success(TIMETABLE_CONSTS.ADD_SLOT.SUCC_ASSIGNED(teacher.name), { position: 'top-right' });
            } else {
                toast.success(TIMETABLE_CONSTS.ADD_SLOT.SUCC_UNASSIGNED, { position: 'top-right' });
            }
        } catch {
            toast.error(TIMETABLE_CONSTS.ADD_SLOT.ERR_SAVE_FAIL, { position: 'top-right' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* ── header ── */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <h2 className="text-base font-semibold text-gray-900">
                            {isEdit ? TIMETABLE_CONSTS.ADD_SLOT.TITLE_EDIT : TIMETABLE_CONSTS.ADD_SLOT.TITLE_ADD}
                        </h2>
                        <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1">
                            <span className="bg-slate-800 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                                {day}
                            </span>
                            <span className="text-sm text-slate-700 font-medium">{period?.label}</span>
                            <span className="text-xs text-slate-400 ml-1">{period?.time}</span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── body: two columns ── */}
                <div className="flex flex-1 overflow-hidden divide-x divide-gray-100 min-h-0">

                    {/* ════ LEFT — Subject + Room ════ */}
                    <div className="w-[44%] flex flex-col overflow-hidden">

                        <div className="px-5 pt-4 pb-2 flex items-center justify-between shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {TIMETABLE_CONSTS.ADD_SLOT.LBL_SUBJECT} <span className="text-red-400 normal-case">*</span>
                            </p>
                            {formError && (
                                <p className="text-[11px] text-red-500">{formError}</p>
                            )}
                        </div>

                        <div className="px-4 pb-2 shrink-0">
                            <SearchBar
                                value={subjectSearch}
                                onChange={setSubjectSearch}
                                placeholder={TIMETABLE_CONSTS.ADD_SLOT.PH_SEARCH_SUBJ}
                                disabled={loadingSubjects || !!subjectError}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 min-h-0">
                            {loadingSubjects ? (
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-12">
                                    <Loader2 size={15} className="animate-spin" /> {TIMETABLE_CONSTS.ADD_SLOT.LBL_LOADING}
                                </div>
                            ) : subjectError ? (
                                <div className="flex items-center justify-between text-xs text-red-500 bg-red-50 px-3 py-2.5 rounded-xl border border-red-100 mt-2">
                                    <span>{subjectError}</span>
                                    <button onClick={loadSubjects} className="underline ml-2 shrink-0">{TIMETABLE_CONSTS.ADD_SLOT.BTN_RETRY}</button>
                                </div>
                            ) : subjects.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-12 italic">{TIMETABLE_CONSTS.ADD_SLOT.NO_SUBJECTS}</p>
                            ) : filteredSubjects.length === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-8 italic">{TIMETABLE_CONSTS.ADD_SLOT.NO_MATCH(subjectSearch)}</p>
                            ) : (
                                <div className="flex flex-col gap-1.5 pb-2">
                                    {filteredSubjects.map(s => {
                                        const active = selectedSubject?.id === s.id;
                                        return (
                                            <button
                                                key={s.id}
                                                onClick={() => { setSelectedSubject(s); setFormError(''); }}
                                                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border transition text-left
                                                    ${active
                                                        ? 'border-transparent shadow-sm'
                                                        : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'}`}
                                                style={active ? { background: s.bg, borderColor: s.dot } : {}}
                                            >
                                                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: s.dot }} />
                                                <span className="text-xs font-bold shrink-0 w-10" style={{ color: s.color }}>{s.code}</span>
                                                <span className="text-sm text-gray-700 flex-1 truncate">{s.label}</span>
                                                {active && (
                                                    <span
                                                        className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[10px] shrink-0"
                                                        style={{ background: s.dot }}
                                                    >✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* room picker */}
                        <div className="px-4 py-4 border-t border-gray-100 shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                                {TIMETABLE_CONSTS.ADD_SLOT.LBL_ROOM}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <input
                                    value={selectedRoom}
                                    onChange={e => setSelectedRoom(e.target.value)}
                                    placeholder={TIMETABLE_CONSTS.ADD_SLOT.PH_ROOM}
                                    className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gray-400 text-gray-700 transition"
                                />
                                {TIMETABLE_CONSTS.ADD_SLOT.ROOMS.map(r => (
                                    <button key={r}
                                        onClick={() => setSelectedRoom(r)}
                                        className={`px-3 py-2 rounded-xl text-xs font-medium border transition
                                            ${selectedRoom === r
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ════ RIGHT — Teacher ════ */}
                    <div className="flex-1 flex flex-col overflow-hidden min-h-0">

                        <div className="px-5 pt-4 pb-2 shrink-0">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{TIMETABLE_CONSTS.ADD_SLOT.LBL_TEACHER}</p>
                        </div>

                        <div className="px-4 pb-2 shrink-0">
                            <SearchBar
                                value={teacherSearch}
                                onChange={setTeacherSearch}
                                placeholder={TIMETABLE_CONSTS.ADD_SLOT.PH_SEARCH_TEACHER}
                                disabled={!selectedSubject}
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto border border-gray-100 rounded-xl mx-4 mb-4 min-h-0">

                            {/* ── Not Assigned row ── */}
                            <button
                                onClick={() => setSelectedTeacher(null)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 border-b border-gray-100 text-left transition
                                    ${selectedTeacher === null ? 'bg-slate-50' : 'hover:bg-gray-50'}`}
                            >
                                <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0
                                    ${selectedTeacher === null ? 'border-slate-800' : 'border-gray-300'}`}>
                                    {selectedTeacher === null && <span className="w-2 h-2 rounded-full bg-slate-800 block" />}
                                </span>
                                <span className="text-sm text-gray-400 italic">{TIMETABLE_CONSTS.ADD_SLOT.LBL_NOT_ASSIGNED}</span>
                            </button>

                            {/* ── states ── */}
                            {!selectedSubject ? (
                                <p className="text-xs text-gray-400 text-center py-10 italic">{TIMETABLE_CONSTS.ADD_SLOT.LBL_SELECT_SUBJ_FIRST}</p>
                            ) : loadingTeachers ? (
                                <div className="flex items-center justify-center gap-2 text-xs text-gray-400 py-10">
                                    <Loader2 size={13} className="animate-spin" /> {TIMETABLE_CONSTS.ADD_SLOT.LOADING_TEACHERS}
                                </div>
                            ) : !hasAny ? (
                                <p className="text-xs text-gray-400 text-center py-10 italic">{TIMETABLE_CONSTS.ADD_SLOT.NO_TEACHERS}</p>
                            ) : totalFiltered === 0 ? (
                                <p className="text-xs text-gray-400 text-center py-10 italic">{TIMETABLE_CONSTS.ADD_SLOT.NO_MATCH(teacherSearch)}</p>
                            ) : (
                                <>
                                    {filteredBest.length > 0 && (
                                        <>
                                            <SectionLabel className="text-emerald-600">{TIMETABLE_CONSTS.ADD_SLOT.LBL_BEST_MATCH}</SectionLabel>
                                            {filteredBest.map(t => (
                                                <TeacherRow key={t.id} t={t}
                                                    selected={selectedTeacher === t.id}
                                                    onSelect={setSelectedTeacher}
                                                    barColor="#22c55e" />
                                            ))}
                                        </>
                                    )}
                                    {filteredOthers.length > 0 && (
                                        <>
                                            <SectionLabel className="text-gray-400">{TIMETABLE_CONSTS.ADD_SLOT.LBL_OTHERS}</SectionLabel>
                                            {filteredOthers.map(t => (
                                                <TeacherRow key={t.id} t={t}
                                                    selected={selectedTeacher === t.id}
                                                    onSelect={setSelectedTeacher}
                                                    barColor="#60a5fa" />
                                            ))}
                                        </>
                                    )}
                                    {/* ── Busy teachers are READ-ONLY — no radio, no selection ── */}
                                    {filteredBusy.length > 0 && (
                                        <>
                                            <SectionLabel className="text-red-400">{TIMETABLE_CONSTS.ADD_SLOT.LBL_BUSY}</SectionLabel>
                                            {filteredBusy.map(t => (
                                                <TeacherRow key={t.id} t={t}
                                                    selected={false}
                                                    onSelect={() => { }}
                                                    barColor="#f87171"
                                                    readOnly />
                                            ))}
                                        </>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── footer ── */}
                <div className="flex justify-end gap-2.5 px-6 py-4 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button onClick={onClose}
                        className="px-5 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-100 transition">
                        {TIMETABLE_CONSTS.ADD_SLOT.BTN_CANCEL}
                    </button>
                    <button onClick={handleSave} disabled={saving || loadingSubjects}
                        className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition disabled:opacity-50">
                        {saving ? TIMETABLE_CONSTS.ADD_SLOT.BTN_SAVING : isEdit ? TIMETABLE_CONSTS.ADD_SLOT.BTN_UPDATE : TIMETABLE_CONSTS.ADD_SLOT.BTN_ADD}
                    </button>
                </div>
            </div>
        </div>
    );
}