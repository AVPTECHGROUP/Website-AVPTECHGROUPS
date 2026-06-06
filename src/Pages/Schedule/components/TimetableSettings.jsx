import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { getTimetableById, updateTimetable } from '../../../Api/ScheduleApi';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TimetableSettings({ timetable, timetableId, onClose, onApply }) {
    const [form, setForm] = useState({
        classId: null,
        sectionId: null,
        className: '',
        sectionName: '',
        academicYear: timetable?.year || timetable?.academicYear || timetable?.academicYearLabel || '2025-2026',
        status: timetable?.status || 'Draft',
        notes: timetable?.notes || '',
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!timetableId) return;
        const loadInfo = async () => {
            try {
                setLoading(true);
                const data = await getTimetableById(timetableId);
                if (data) {
                    setForm(prev => ({
                        ...prev,
                        classId: data.classId,
                        sectionId: data.sectionId,
                        className: data.className || '',
                        sectionName: data.sectionName || '',
                        academicYear: data.academicYearLabel || data.academicYear || prev.academicYear,
                        status: data.status || prev.status,
                        notes: data.notes || '',
                    }));
                }
            } catch {
                /* keep defaults */
            } finally {
                setLoading(false);
            }
        };
        loadInfo();
    }, [timetableId]);

    const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

    const toggleDay = (day) => {
        set('workingDays', form.workingDays.includes(day)
            ? form.workingDays.filter(d => d !== day)
            : [...form.workingDays, day]);
    };

    const handleApply = async () => {
        if (!timetableId) { onApply?.(form); onClose(); return; }
        try {
            setSaving(true);
            setError('');
            await updateTimetable(timetableId, {
                classId: form.classId,
                sectionId: form.sectionId,
                academicYear: form.academicYear,
                notes: form.notes,
            });
            onApply?.(form);
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Settings size={17} className="text-gray-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Timetable Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={17} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : (
                    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-h-[65vh] sm:max-h-[60vh] overflow-y-auto">
                        {error && (
                            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                        )}

                        {/* Class & Section */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <div className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 font-medium min-h-[38px] flex items-center">
                                    {form.className || '—'}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
                                <div className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 font-medium min-h-[38px] flex items-center">
                                    {form.sectionName || '—'}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
                            </div>
                        </div>

                        {/* Academic Year & Status */}
                        <div className="grid grid-cols-2 gap-3 sm:gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                                <div className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-700 font-medium min-h-[38px] flex items-center">
                                    {form.academicYear || '—'}
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Cannot be changed</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <div className={`w-full border rounded-lg px-3 py-2 text-sm font-semibold min-h-[38px] flex items-center
                                    ${form.status === 'PUBLISHED' || form.status === 'Published'
                                        ? 'bg-green-50 border-green-200 text-green-700'
                                        : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                                    {form.status === 'PUBLISHED' ? '✓ Published' :
                                        form.status === 'DRAFT' ? '⊘ Draft' : form.status}
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={e => set('notes', e.target.value)}
                                placeholder="Remarks about this timetable..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                            />
                        </div>

                        {/* Working Days */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Working Days
                                <span className="text-xs text-gray-400 font-normal ml-2">(from School Config)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <button key={day} onClick={() => toggleDay(day)}
                                        className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition
                                            ${form.workingDays.includes(day)
                                                ? 'bg-[#1e293b] text-white'
                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`}>
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 text-center">
                        Cancel
                    </button>
                    <button onClick={handleApply} disabled={saving || loading}
                        className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition text-center">
                        {saving ? 'Saving...' : 'Apply Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}