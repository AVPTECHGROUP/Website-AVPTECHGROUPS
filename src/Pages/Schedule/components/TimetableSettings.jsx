import { useState, useEffect } from 'react';
import { X, Settings } from 'lucide-react';
import { getTimetableById, updateTimetable } from '../../../Api/ScheduleApi';
import { getClasses, getSectionsByClass } from '../../../Api/TeachersAPI';
const YEARS = ['2025-2026', '2024-2025', '2026-2027'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function TimetableSettings({ timetable, timetableId, onClose, onApply }) {
    const [form, setForm] = useState({
        classId: null,
        sectionId: null,
        class: '',
        section: '',
        academicYear: timetable?.year || timetable?.academicYear || '2025-2026',
        status: timetable?.status || 'Draft',
        notes: timetable?.notes || '',
        workingDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);

    // Pre-fill form from API
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
                        class: data.className,
                        section: data.sectionName,
                        academicYear: data.academicYear || prev.academicYear,
                        status: data.status || prev.status,
                        notes: data.notes || '',
                    }));
                }
            } catch { /* keep defaults */ }
            finally { setLoading(false); }
        };
        loadInfo();
    }, [timetableId]);

    useEffect(() => {
        if (!form.classId) return;

        const loadSections = async () => {
            try {
                const data = await getSectionsByClass(form.classId);
                setSections(data || []);
            } catch (err) {
                console.error("Failed to load sections", err);
            }
        };

        loadSections();
    }, [form.classId]);

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const data = await getClasses();
                setClasses(data || []);
            } catch (err) {
                console.error("Failed to load classes", err);
            }
        };
        loadClasses();
    }, []);

    useEffect(() => {
        if (!classes.length || !form.classId) return;

        const selectedClass = classes.find(c => c.id === form.classId);

        if (selectedClass) {
            setForm(prev => ({
                ...prev,
                class: selectedClass.name
            }));
        }
    }, [classes, form.classId]);

    useEffect(() => {
        if (!sections.length || !form.sectionId) return;

        const selectedSection = sections.find(s => s.id === form.sectionId);

        if (selectedSection) {
            setForm(prev => ({
                ...prev,
                section: selectedSection.name
            }));
        }
    }, [sections, form.sectionId]);

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
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Settings size={18} className="text-gray-600" />
                        <h2 className="text-lg font-semibold text-gray-900">Timetable Settings</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
                ) : (
                    <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                        {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class <span className="text-red-500">*</span></label>
                                <select
                                    disabled={!form.classId}
                                    value={form.classId || ''}
                                    onChange={(e) => {
                                        const selected = classes.find(c => c.id === Number(e.target.value));
                                        setForm(prev => ({
                                            ...prev,
                                            classId: selected?.id,
                                            class: selected?.name || '',
                                            sectionId: null,
                                            section: ''
                                        }));
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Section <span className="text-red-500">*</span></label>
                                <select
                                    value={form.sectionId || ''}
                                    onChange={(e) => {
                                        const selected = sections.find(s => s.id === Number(e.target.value));
                                        setForm(prev => ({
                                            ...prev,
                                            sectionId: selected?.id,
                                            section: selected?.name || ''
                                        }));
                                    }}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Select Section</option>
                                    {sections.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year <span className="text-red-500">*</span></label>
                                <select value={form.academicYear} onChange={e => set('academicYear', e.target.value)}
                                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100">
                                    {YEARS.map(y => <option key={y}>{y}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <input value={form.status} readOnly
                                    className="w-full border border-gray-100 rounded-lg px-3 py-2 text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                                placeholder="Remarks about this timetable..."
                                rows={3}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Working Days</label>
                            <div className="flex flex-wrap gap-2">
                                {DAYS.map(day => (
                                    <button key={day} onClick={() => toggleDay(day)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition
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

                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleApply} disabled={saving || loading}
                        className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition">
                        {saving ? 'Saving...' : 'Apply Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}