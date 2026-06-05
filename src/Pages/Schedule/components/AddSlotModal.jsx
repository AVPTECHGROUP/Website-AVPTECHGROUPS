import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { getAvailableTeachersForSlot } from '../../../Api/ScheduleApi';
import { getSubjectsBySection } from '../../../Api/TeachersAPI';

const SUBJECT_COLOR_MAP = {
    MATH: { color: 'text-blue-600', dot: 'bg-blue-500' },
    ENG: { color: 'text-green-600', dot: 'bg-green-500' },
    SCI: { color: 'text-yellow-600', dot: 'bg-yellow-500' },
    HIN: { color: 'text-purple-600', dot: 'bg-purple-500' },
    SST: { color: 'text-orange-600', dot: 'bg-orange-500' },
    COMP: { color: 'text-teal-600', dot: 'bg-teal-500' },
    PE: { color: 'text-red-600', dot: 'bg-red-500' },
    DRAW: { color: 'text-indigo-600', dot: 'bg-indigo-500' },
    BIO: { color: 'text-emerald-600', dot: 'bg-emerald-500' },
    CHEM: { color: 'text-pink-600', dot: 'bg-pink-500' },
    PHY: { color: 'text-sky-600', dot: 'bg-sky-500' },
    GEO: { color: 'text-lime-600', dot: 'bg-lime-500' },
    HIST: { color: 'text-amber-600', dot: 'bg-amber-500' },
};
const COLOR_POOL = [
    { color: 'text-blue-600', dot: 'bg-blue-500' },
    { color: 'text-green-600', dot: 'bg-green-500' },
    { color: 'text-purple-600', dot: 'bg-purple-500' },
    { color: 'text-orange-600', dot: 'bg-orange-500' },
    { color: 'text-teal-600', dot: 'bg-teal-500' },
    { color: 'text-red-600', dot: 'bg-red-500' },
    { color: 'text-indigo-600', dot: 'bg-indigo-500' },
    { color: 'text-pink-600', dot: 'bg-pink-500' },
    { color: 'text-sky-600', dot: 'bg-sky-500' },
    { color: 'text-amber-600', dot: 'bg-amber-500' },
];
const getSubjectColor = (code, index) => {
    const upper = (code || '').toUpperCase();
    return SUBJECT_COLOR_MAP[upper] || COLOR_POOL[index % COLOR_POOL.length];
};

const ROOMS = ['101', '102', 'Lab 1', 'Art', 'GRD'];

// Normalize teacher from API response
const normalizeTeacher = (t) => ({
    id: t.teacherId,
    name: t.teacherName,
    initials: t.initials,
    currentLoad: t.weeklyLoad,
});

// Reusable teacher row component
function TeacherRow({ t, selectedTeacher, setSelectedTeacher, colorClass = 'bg-green-500', opacity = '' }) {
    return (
        <label key={t.id} className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer ${opacity}`}>
            <input type="radio" name="slotTeacher" value={t.id}
                checked={selectedTeacher === t.id}
                onChange={() => setSelectedTeacher(t.id)}
                className="accent-[#1e293b]" />
            <span className={`w-7 h-7 rounded-full ${colorClass} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                {t.initials || t.name?.split(' ').map(w => w[0]).join('')}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                {t.currentLoad != null && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div className={`h-1 rounded-full ${colorClass}`}
                            style={{ width: `${Math.min((t.currentLoad / 30) * 100, 100)}%` }} />
                    </div>
                )}
            </div>
            {t.currentLoad != null && (
                <span className="text-xs text-gray-400 shrink-0">{t.currentLoad}h/w</span>
            )}
        </label>
    );
}

export default function AddSlotModal({
    day,
    period,
    timetableId,
    sectionId,
    editSlot = null,
    prefillSubject = null,   // ← drag-drop se aata hai — auto select this subject
    onClose,
    onSave,
}) {
    const isEdit = !!editSlot;

    const [subjects, setSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);
    const [subjectError, setSubjectError] = useState('');

    // API returns bestMatch, others, busy — all separate
    const [teachers, setTeachers] = useState({ bestMatch: [], others: [], busy: [] });
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    // Priority: editSlot.subject > prefillSubject (drag) > null
    const [selectedSubject, setSelectedSubject] = useState(editSlot?.subject || prefillSubject || null);
    const [selectedTeacher, setSelectedTeacher] = useState(editSlot?.teacher?.id || null);
    const [selectedRoom, setSelectedRoom] = useState(editSlot?.room || '101');
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);

    // Load subjects on mount
    useEffect(() => {
        if (!sectionId) { setSubjectError('sectionId not provided'); return; }
        loadSubjects();
    }, [sectionId]);

    const loadSubjects = async () => {
        try {
            setLoadingSubjects(true);
            setSubjectError('');
            const data = await getSubjectsBySection(sectionId);
            const enriched = (data || []).map((s, i) => ({
                id: s.id,
                code: s.code || s.subjectCode || '',
                label: s.name || s.subjectName || '',
                ...getSubjectColor(s.code || s.subjectCode, i),
            }));
            setSubjects(enriched);

            // Edit mode: match subject from API list
            if (isEdit && editSlot?.subject?.id) {
                const matched = enriched.find(s => s.id === editSlot.subject.id);
                if (matched) setSelectedSubject(matched);
            }
            // Drag-drop prefill: match from API list by id
            else if (prefillSubject?.id) {
                const matched = enriched.find(s => s.id === prefillSubject.id);
                if (matched) setSelectedSubject(matched);
                else setSelectedSubject(prefillSubject); // use as-is if not found
            }
        } catch (err) {
            setSubjectError('Failed to load subjects. Please retry.');
        } finally {
            setLoadingSubjects(false);
        }
    };

    // Load teachers when subject changes
    useEffect(() => {
        if (!selectedSubject?.id || !timetableId || !period?.id) return;
        const periodNumber = parseInt(period.id.replace('P', ''));
        if (isNaN(periodNumber)) return;
        loadTeachers(selectedSubject.id, periodNumber);
    }, [selectedSubject?.id]);

    const loadTeachers = async (subjectId, periodNumber) => {
        try {
            setLoadingTeachers(true);
            const res = await getAvailableTeachersForSlot(timetableId, day, periodNumber, subjectId);
            // ✅ API returns: { bestMatch: [...], others: [...], busy: [...] }
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

    const handleSave = async () => {
        if (!selectedSubject) { setFormError('Please select a subject.'); return; }
        try {
            setSaving(true);
            const allTeachers = [...teachers.bestMatch, ...teachers.others, ...teachers.busy];
            const teacher = allTeachers.find(t => t.id === selectedTeacher) || editSlot?.teacher || null;
            await onSave({
                subject: { id: selectedSubject.id, code: selectedSubject.code, label: selectedSubject.label },
                subjectId: selectedSubject.id,
                teacher,
                teacherId: selectedTeacher,
                room: selectedRoom,
                day,
                period,
            });
        } finally {
            setSaving(false);
        }
    };

    const hasAnyTeacher = teachers.bestMatch.length > 0 || teachers.others.length > 0 || teachers.busy.length > 0;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {isEdit ? '✏️ Edit Slot' : '+ Add Slot'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-5">

                    {/* Period Info Banner */}
                    <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2.5 border border-gray-200">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#1e293b] text-white text-xs font-bold px-2 py-0.5 rounded">{day}</span>
                            <span className="text-sm font-medium text-gray-700">{period?.label}</span>
                        </div>
                        <span className="text-sm text-gray-500">{period?.time}</span>
                    </div>

                    {/* Subjects */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Subject <span className="text-red-500">*</span>
                        </label>
                        {formError && <p className="text-xs text-red-500 mb-2">{formError}</p>}

                        {loadingSubjects ? (
                            <div className="flex items-center justify-center gap-2 text-sm text-gray-400 py-6 border border-gray-200 rounded-lg">
                                <Loader2 size={16} className="animate-spin" /> Loading subjects...
                            </div>
                        ) : subjectError ? (
                            <div className="flex items-center justify-between text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                <span>{subjectError}</span>
                                <button onClick={loadSubjects} className="underline ml-2">Retry</button>
                            </div>
                        ) : subjects.length === 0 ? (
                            <div className="text-xs text-gray-400 bg-gray-50 px-3 py-4 rounded-lg text-center italic border border-gray-200">
                                No subjects found for this section
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-0.5">
                                {subjects.map(s => (
                                    <button key={s.id}
                                        onClick={() => { setSelectedSubject(s); setFormError(''); }}
                                        className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition text-left w-full
                                            ${selectedSubject?.id === s.id
                                                ? 'border-orange-400 bg-orange-50 text-orange-700'
                                                : 'border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                                        <span className={`text-xs font-bold ${s.color} shrink-0`}>{s.code}</span>
                                        <span className="truncate flex-1 text-xs">{s.label}</span>
                                        {selectedSubject?.id === s.id && <span className="text-orange-500 shrink-0">✓</span>}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Teacher + Room */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Teacher */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Teacher</label>
                            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">

                                {/* Unassigned */}
                                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100">
                                    <input type="radio" name="slotTeacher" value=""
                                        checked={!selectedTeacher}
                                        onChange={() => setSelectedTeacher(null)}
                                        className="accent-[#1e293b]" />
                                    <span className="text-sm text-gray-500 italic">— Unassigned —</span>
                                </label>

                                {!selectedSubject ? (
                                    <p className="text-xs text-gray-400 px-3 py-3 italic text-center">Select a subject first</p>
                                ) : loadingTeachers ? (
                                    <div className="flex items-center gap-2 px-3 py-3 text-xs text-gray-400">
                                        <Loader2 size={12} className="animate-spin" /> Loading teachers...
                                    </div>
                                ) : !hasAnyTeacher ? (
                                    <p className="text-xs text-gray-400 px-3 py-3 italic text-center">No teachers found</p>
                                ) : (
                                    <>
                                        {/* Best Match */}
                                        {teachers.bestMatch.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold px-3 pt-2 pb-1 uppercase tracking-wide">⭐ Best Match</p>
                                                {teachers.bestMatch.map(t => (
                                                    <TeacherRow key={t.id} t={t} selectedTeacher={selectedTeacher}
                                                        setSelectedTeacher={setSelectedTeacher} colorClass="bg-green-500" />
                                                ))}
                                            </div>
                                        )}

                                        {/* Others */}
                                        {teachers.others.length > 0 && (
                                            <div>
                                                <p className="text-xs text-gray-400 font-semibold px-3 pt-2 pb-1 uppercase tracking-wide">Others</p>
                                                {teachers.others.map(t => (
                                                    <TeacherRow key={t.id} t={t} selectedTeacher={selectedTeacher}
                                                        setSelectedTeacher={setSelectedTeacher} colorClass="bg-blue-400" />
                                                ))}
                                            </div>
                                        )}

                                        {/* Busy */}
                                        {teachers.busy.length > 0 && (
                                            <div>
                                                <p className="text-xs text-red-400 font-semibold px-3 pt-2 pb-1 uppercase tracking-wide">🔴 Busy (Conflict)</p>
                                                {teachers.busy.map(t => (
                                                    <TeacherRow key={t.id} t={t} selectedTeacher={selectedTeacher}
                                                        setSelectedTeacher={setSelectedTeacher} colorClass="bg-red-400" opacity="opacity-60" />
                                                ))}
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Room */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Room / Venue</label>
                            <input value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}
                                placeholder="Room number..."
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-blue-100" />
                            <div className="flex flex-wrap gap-2">
                                {ROOMS.map(r => (
                                    <button key={r} onClick={() => setSelectedRoom(r)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition
                                            ${selectedRoom === r ? 'bg-[#1e293b] text-white border-[#1e293b]' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                        {r}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSave} disabled={saving || loadingSubjects}
                        className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] transition disabled:opacity-50">
                        {saving ? 'Saving...' : isEdit ? 'Update Slot' : 'Add Slot'}
                    </button>
                </div>
            </div>
        </div>
    );
}