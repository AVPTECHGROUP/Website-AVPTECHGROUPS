import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getAvailableTeachersForSlot } from '../../../api/ScheduleApi';

export default function AssignTeacherModal({ day, period, slot, timetableId, onClose, onSave }) {
    const [teachers, setTeachers] = useState({ available: [], busy: [] });
    const [selectedTeacherId, setSelectedTeacherId] = useState(slot?.teacher?.id || null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!timetableId || !slot?.subject?.id || !period?.id) return;
        const periodNumber = parseInt(period.id.replace('P', ''));
        loadTeachers(periodNumber);
    }, []);

    const loadTeachers = async (periodNumber) => {
        try {
            setLoading(true);
            const data = await getAvailableTeachersForSlot(timetableId, day, periodNumber, slot?.subject?.id);
            setTeachers({
                available: data?.available || [],
                busy: data?.busy || [],
            });
        } catch {
            setTeachers({ available: [], busy: [] });
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

    const subjectCode = slot?.subject?.code;
    const subjectLabel = slot?.subject?.label;
    const currentTeacher = slot?.teacher;

    const getInitials = (name) => name?.split(' ').map(w => w[0]).join('') || '?';

    const allTeachers = [...(teachers.available || []), ...(teachers.busy || [])];

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-semibold text-gray-900">Assign Teacher</h2>
                        <p className="text-xs text-gray-400 mt-0.5">{day} · {period?.label}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={16} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-5 space-y-4">
                    {/* Subject badge */}
                    <div className="flex items-center gap-2 px-3 py-2 border border-orange-200 bg-orange-50 rounded-lg">
                        <span className="text-xs font-bold text-orange-700 bg-orange-100 px-2 py-0.5 rounded">{subjectCode}</span>
                        <span className="text-sm font-medium text-gray-800">{subjectLabel}</span>
                    </div>

                    {/* Currently Assigned */}
                    {currentTeacher?.name && (
                        <div>
                            <p className="text-xs font-semibold text-gray-400 tracking-widest mb-2">CURRENTLY ASSIGNED</p>
                            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2.5">
                                <span className="w-9 h-9 rounded-full bg-green-600 text-white text-sm font-bold flex items-center justify-center shrink-0">
                                    {getInitials(currentTeacher.name)}
                                </span>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900">{currentTeacher.name}</p>
                                    <p className="text-xs text-gray-500">{subjectLabel}</p>
                                    <div className="w-full bg-gray-200 rounded-full h-1 mt-1.5">
                                        <div className="bg-green-500 h-1 rounded-full" style={{ width: '75%' }} />
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 shrink-0">{currentTeacher.load || '18h/w'}</span>
                            </div>
                        </div>
                    )}

                    {/* Available teachers list */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 tracking-widest mb-2">AVAILABLE</p>
                        {loading ? (
                            <p className="text-sm text-gray-400 py-3 text-center">Loading...</p>
                        ) : allTeachers.length === 0 ? (
                            <p className="text-sm text-gray-400 py-3 text-center italic">No teachers found</p>
                        ) : (
                            <div className="space-y-1 max-h-52 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                                {teachers.available.map(t => (
                                    <label key={t.id} className={`flex items-center gap-2 px-3 py-2.5 cursor-pointer transition
                        ${selectedTeacherId === t.id ? 'bg-blue-50' : 'hover:bg-gray-50'}`}>
                                        <input type="radio" name="assignTeacher" value={t.id}
                                            checked={selectedTeacherId === t.id}
                                            onChange={() => setSelectedTeacherId(t.id)}
                                            className="accent-[#1e293b]" />
                                        <span className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                            {getInitials(t.name)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800">{t.name}</p>
                                            {t.currentLoad != null && (
                                                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                                                    <div className="bg-blue-500 h-1 rounded-full"
                                                        style={{ width: `${Math.min((t.currentLoad / 30) * 100, 100)}%` }} />
                                                </div>
                                            )}
                                        </div>
                                        {t.currentLoad != null && <span className="text-xs text-gray-400 shrink-0">{t.currentLoad}h/w</span>}
                                    </label>
                                ))}

                                {teachers.busy.map(t => (
                                    <label key={t.id} className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-gray-50 opacity-50">
                                        <input type="radio" name="assignTeacher" value={t.id}
                                            checked={selectedTeacherId === t.id}
                                            onChange={() => setSelectedTeacherId(t.id)}
                                            className="accent-[#1e293b]" />
                                        <span className="w-8 h-8 rounded-full bg-red-400 text-white text-xs font-bold flex items-center justify-center shrink-0">
                                            {getInitials(t.name)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-700">{t.name}</p>
                                            <p className="text-xs text-red-400">Busy this period</p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleAssign} disabled={!selectedTeacherId || saving}
                        className="px-4 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-40 transition">
                        {saving ? 'Assigning...' : 'Assign Teacher'}
                    </button>
                </div>
            </div>
        </div>
    );
}