import { useState, useEffect } from 'react';
import { X, ArrowLeftRight } from 'lucide-react';
import {
    getSubstitutions,
    createSubstitution,
    updateSubstitutionStatus,
} from '../../../Api/ScheduleApi';

const REASONS = [
    'Medical Leave', 'Personal Leave', 'Official Duty',
    'Training / Workshop', 'Emergency', 'Other',
];

export default function SubstitutionModal({ timetableId, slot = null, onClose }) {
    const [form, setForm] = useState({
        date: '',
        originalTeacherId: slot?.teacher?.id || '',
        substituteTeacherId: '',
        reason: '',
        notes: '',
    });
    const [teachers, setTeachers] = useState([]);
    const [substitutions, setSubstitutions] = useState([]);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState('create'); // 'create' | 'list'

    // Load teachers list (reuse available teachers or use static)
    const STATIC_TEACHERS = [
        { id: 1, name: 'Kavita Rao' },
        { id: 2, name: 'Rajesh Kumar' },
        { id: 3, name: 'Priya Patel' },
        { id: 4, name: 'Meena Sharma' },
        { id: 5, name: 'Suresh Nair' },
        { id: 6, name: 'Anjali Singh' },
        { id: 7, name: 'Amit Joshi' },
    ];

    useEffect(() => {
        setTeachers(STATIC_TEACHERS);
        if (timetableId) loadSubstitutions();
    }, [timetableId]);

    const loadSubstitutions = async () => {
        try {
            const data = await getSubstitutions(timetableId);
            setSubstitutions(data || []);
        } catch {

        }
    };

    const set = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.date) errs.date = 'Required';
        if (!form.originalTeacherId) errs.originalTeacherId = 'Required';
        if (!form.substituteTeacherId) errs.substituteTeacherId = 'Required';
        if (form.originalTeacherId && form.substituteTeacherId &&
            String(form.originalTeacherId) === String(form.substituteTeacherId))
            errs.substituteTeacherId = 'Cannot be same as original teacher';
        return errs;
    };

    const handleConfirm = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setSaving(true);
            const payload = {
                slotId: slot?.slotId || null,
                substituteDate: form.date,
                originalTeacherId: parseInt(form.originalTeacherId),
                substituteTeacherId: parseInt(form.substituteTeacherId),
                reason: form.reason,
                notes: form.notes,
            };
            await createSubstitution(timetableId, payload);
            await loadSubstitutions();
            setTab('list');
        } catch (err) {
            setErrors({ submit: err.message });
        } finally {
            setSaving(false);
        }
    };

    const handleUpdateStatus = async (subId, status) => {
        try {
            await updateSubstitutionStatus(
                timetableId,
                subId,
                status
            );

            await loadSubstitutions();
        } catch {
            /* silent */
        }
    };

    const originalTeacherId = parseInt(form.originalTeacherId);

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight size={18} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Arrange Substitution</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100">
                    <button onClick={() => setTab('create')}
                        className={`flex-1 py-2.5 text-sm font-medium transition ${tab === 'create' ? 'border-b-2 border-[#1e293b] text-[#1e293b]' : 'text-gray-500 hover:text-gray-700'}`}>
                        + New
                    </button>
                    <button onClick={() => { setTab('list'); loadSubstitutions(); }}
                        className={`flex-1 py-2.5 text-sm font-medium transition ${tab === 'list' ? 'border-b-2 border-[#1e293b] text-[#1e293b]' : 'text-gray-500 hover:text-gray-700'}`}>
                        Pending ({substitutions.length})
                    </button>
                </div>

                {tab === 'create' && (
                    <>
                        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                            {/* Slot info if opened from slot */}
                            {slot && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-sm text-blue-800">
                                    Slot: <strong>{slot.subject?.label}</strong> — {slot.teacher?.name}
                                </div>
                            )}

                            {errors.submit && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{errors.submit}</p>}

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date <span className="text-red-500">*</span>
                                </label>
                                <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100
                        ${errors.date ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                            </div>

                            {/* Teachers */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Original Teacher <span className="text-red-500">*</span>
                                    </label>
                                    <select value={form.originalTeacherId} onChange={e => set('originalTeacherId', e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
                          ${errors.originalTeacherId ? 'border-red-300' : 'border-gray-200'}`}>
                                        <option value="">Select teacher</option>
                                        {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    {errors.originalTeacherId && <p className="text-xs text-red-500 mt-1">{errors.originalTeacherId}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Substitute <span className="text-red-500">*</span>
                                    </label>
                                    <select value={form.substituteTeacherId} onChange={e => set('substituteTeacherId', e.target.value)}
                                        className={`w-full border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
                          ${errors.substituteTeacherId ? 'border-red-300' : 'border-gray-200'}`}>
                                        <option value="">Select substitute</option>
                                        {teachers.filter(t => t.id !== originalTeacherId).map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                    {errors.substituteTeacherId && <p className="text-xs text-red-500 mt-1">{errors.substituteTeacherId}</p>}
                                </div>
                            </div>

                            {/* Reason */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                                <select value={form.reason} onChange={e => set('reason', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
                                    <option value="">Select reason</option>
                                    {REASONS.map(r => <option key={r}>{r}</option>)}
                                </select>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                                    placeholder="Any extra instructions..."
                                    rows={2}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                            <button onClick={onClose}
                                className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Cancel
                            </button>
                            <button onClick={handleConfirm} disabled={saving}
                                className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition">
                                {saving ? 'Saving...' : 'Confirm Substitution'}
                            </button>
                        </div>
                    </>
                )}

                {tab === 'list' && (
                    <div className="max-h-[60vh] overflow-y-auto">
                        {substitutions.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-sm">
                                <ArrowLeftRight size={32} className="mx-auto mb-2 opacity-20" />
                                No pending substitutions
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100">
                                {substitutions.map(sub => (
                                    <div key={sub.id} className="px-5 py-4">
                                        <div className="flex items-start justify-between gap-2">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {sub.originalTeacherName} → {sub.substituteTeacherName}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-0.5">{sub.substituteDate} · {sub.reason}</p>
                                                <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium
                                    ${sub.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                                        sub.status === 'CANCELLED' ? 'bg-red-100 text-red-600' :
                                                            'bg-amber-100 text-amber-700'}`}>
                                                    {sub.status || 'PENDING'}
                                                </span>
                                            </div>
                                            {(!sub.status || sub.status === 'PENDING') && (
                                                <div className="flex gap-1 shrink-0">
                                                    <button
                                                        onClick={() => handleUpdateStatus(sub.id, 'CONFIRMED')}
                                                        className="px-2 py-1 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">
                                                        Confirm
                                                    </button>
                                                    <button
                                                        onClick={() => handleUpdateStatus(sub.id, 'CANCELLED')}
                                                        className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50">
                                                        Cancel
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="px-5 py-4 border-t border-gray-100">
                            <button onClick={onClose}
                                className="w-full py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}