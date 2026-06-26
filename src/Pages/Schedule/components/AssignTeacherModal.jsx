import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAvailableTeachersForSlot } from '../../../Api/Academics/ScheduleApi';

const normalizeTeacher = (t) => ({
    id: t.teacherId,
    name: t.teacherName,
    initials: t.initials || t.teacherName?.split(' ').map(w => w[0]).join(''),
    currentLoad: t.weeklyLoad,
});

function TeacherRow({ t, selectedTeacherId, onSelect, colorClass = 'bg-blue-500', dimmed = false }) {
    const initials = t.initials || t.name?.split(' ').map(w => w[0]).join('') || '?';
    return (
        <label className={`flex items-center gap-3 px-3 py-2.5 cursor-pointer transition hover:bg-gray-50 ${dimmed ? 'opacity-50' : ''}`}>
            <input
                type="radio"
                name="assignTeacher"
                value={t.id}
                checked={selectedTeacherId === t.id}
                onChange={() => onSelect(t.id)}
                className="accent-[#1e293b]"
            />
            <span className={`w-8 h-8 rounded-full ${colorClass} text-white text-xs font-bold flex items-center justify-center shrink-0`}>
                {initials}
            </span>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{t.name}</p>
                {t.currentLoad != null && (
                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                        <div
                            className={`h-1 rounded-full ${colorClass}`}
                            style={{ width: `${Math.min((t.currentLoad / 30) * 100, 100)}%` }}
                        />
                    </div>
                )}
            </div>
            {t.currentLoad != null && (
                <span className="text-xs text-gray-400 shrink-0">{t.currentLoad}h/w</span>
            )}
        </label>
    );
}

export default function AssignTeacherModal({ day, period, slot, timetableId, onClose, onSave }) {
    const [teachers, setTeachers] = useState({ bestMatch: [], others: [], busy: [] });
    const [selectedTeacherId, setSelectedTeacherId] = useState(slot?.teacher?.id || null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const subjectCode = slot?.subject?.code;
    const subjectLabel = slot?.subject?.label;

    useEffect(() => {
        if (!timetableId || !slot?.subject?.id || !period?.id) return;
        const periodNumber = parseInt(period.id.replace('P', ''));
        if (!isNaN(periodNumber)) loadTeachers(periodNumber);
    }, []);

    const loadTeachers = async (periodNumber) => {
        try {
            setLoading(true);
            const res = await getAvailableTeachersForSlot(timetableId, day, periodNumber, slot?.subject?.id);

            const bestMatch = (res?.bestMatch || []).map(normalizeTeacher);
            const others = (res?.others || []).map(normalizeTeacher);
            const busy = (res?.busy || []).map(normalizeTeacher);

            if (slot?.teacher?.id) {
                const inBestMatch = bestMatch.find(t => t.id === slot.teacher.id);
                const inOthers = others.find(t => t.id === slot.teacher.id);
                if (!inBestMatch && !inOthers) {
                    const idx = busy.findIndex(t => t.id === slot.teacher.id);
                    if (idx !== -1) {
                        const [moved] = busy.splice(idx, 1);
                        others.unshift(moved);
                    }
                }
            }

            setTeachers({ bestMatch, others, busy });
        } catch (err) {
            console.error('Teacher load failed:', err);
            setTeachers({ bestMatch: [], others: [], busy: [] });
        } finally {
            setLoading(false);
        }
    };

    const handleAssign = async () => {
        if (!selectedTeacherId) return;
        try {
            setSaving(true);
            await onSave(selectedTeacherId);
        } finally {
            setSaving(false);
        }
    };

    const hasAnyTeacher = teachers.bestMatch.length > 0 || teachers.others.length > 0 || teachers.busy.length > 0;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-sm max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 sm:py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Assign Teacher</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{day} · {period?.label}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 sm:p-5 space-y-4">

                    {/* Subject badge */}
                    <div className="flex items-center gap-2 px-3 py-2 border border-orange-200 bg-orange-50 rounded-lg">
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">{subjectCode}</span>
                        <span className="text-sm font-medium text-gray-800">{subjectLabel}</span>
                    </div>

                    {/* Currently Assigned */}
                    {slot?.teacher?.name && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-2">CURRENTLY ASSIGNED</p>
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                                <span className="w-8 h-8 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                                    {slot.teacher.name?.split(' ').map(w => w[0]).join('') || '?'}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{slot.teacher.name}</p>
                                    <p className="text-xs text-gray-500">{subjectLabel}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Teacher list */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-2">SELECT TEACHER</p>

                        <div className="border border-gray-200 rounded-lg overflow-hidden max-h-52 sm:max-h-64 overflow-y-auto divide-y divide-gray-100">

                            <label className="flex items-center gap-3 px-3 py-2.5 cursor-pointer hover:bg-gray-50">
                                <input type="radio" name="assignTeacher" value=""
                                    checked={!selectedTeacherId}
                                    onChange={() => setSelectedTeacherId(null)}
                                    className="accent-[#1e293b]" />
                                <span className="text-sm text-gray-400 italic">— Unassigned —</span>
                            </label>

                            {loading ? (
                                <p className="text-sm text-gray-400 py-4 text-center">Loading teachers…</p>
                            ) : !hasAnyTeacher ? (
                                <p className="text-sm text-gray-400 py-4 text-center italic">No teachers found</p>
                            ) : (
                                <>
                                    {teachers.bestMatch.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 px-3 pt-2 pb-1 uppercase tracking-wide">⭐ Best Match</p>
                                            {teachers.bestMatch.map(t => (
                                                <TeacherRow key={t.id} t={t} selectedTeacherId={selectedTeacherId}
                                                    onSelect={setSelectedTeacherId} colorClass="bg-green-500" />
                                            ))}
                                        </div>
                                    )}
                                    {teachers.others.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 px-3 pt-2 pb-1 uppercase tracking-wide">Others</p>
                                            {teachers.others.map(t => (
                                                <TeacherRow key={t.id} t={t} selectedTeacherId={selectedTeacherId}
                                                    onSelect={setSelectedTeacherId} colorClass="bg-blue-400" />
                                            ))}
                                        </div>
                                    )}
                                    {teachers.busy.length > 0 && (
                                        <div>
                                            <p className="text-xs font-semibold text-red-400 px-3 pt-2 pb-1 uppercase tracking-wide">🔴 Busy (Conflict)</p>
                                            {teachers.busy.map(t => (
                                                <TeacherRow key={t.id} t={t} selectedTeacherId={selectedTeacherId}
                                                    onSelect={setSelectedTeacherId} colorClass="bg-red-400" dimmed={true} />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 text-center">
                        Cancel
                    </button>
                    <button onClick={handleAssign} disabled={!selectedTeacherId || saving}
                        className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-40 transition text-center">
                        {saving ? 'Assigning…' : 'Assign Teacher'}
                    </button>
                </div>
            </div>
        </div>
    );
}