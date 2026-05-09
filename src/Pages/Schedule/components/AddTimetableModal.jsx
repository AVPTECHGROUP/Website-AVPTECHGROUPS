import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { getClasses, getSectionsByClass } from '../../../Api/TeachersAPI';
import { getListOfValues } from '../../../Api/ListOfValues';


export default function AddTimetableModal({ onClose, onSubmit, existingTimetables = [] }) {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);

    const [form, setForm] = useState({
        classId: '',
        className: '',
        sectionId: '',
        sectionName: '',
        academicYear: '',
        copyFrom: '',
        copyFromTimetableId: null,
        notes: '',
    });
    const [errors, setErrors] = useState({});

    // Load classes on mount
    useEffect(() => {
        const loadClasses = async () => {
            try {
                setLoadingClasses(true);
                const data = await getClasses();
                setClasses(data || []);
            } catch (err) {
                console.error('Failed to load classes:', err);
            } finally {
                setLoadingClasses(false);
            }
        };
        loadClasses();
    }, []);
    useEffect(() => {
        const loadMeta = async () => {
            try {
                setLoadingClasses(true);

                const [classData, yearData] = await Promise.all([
                    getClasses(),
                    getListOfValues('ACADEMIC_YEAR')
                ]);

                setClasses(classData || []);
                setAcademicYears(yearData || []);

                // Default select first academic year
                if (yearData?.length > 0) {
                    setForm(prev => ({
                        ...prev,
                        academicYear: yearData[0].id
                    }));
                }

            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoadingClasses(false);
            }
        };

        loadMeta();
    }, []);
    // Load sections when classId changes
    useEffect(() => {
        if (!form.classId) { setSections([]); return; }
        const loadSections = async () => {
            try {
                setLoadingSections(true);
                const data = await getSectionsByClass(form.classId);
                setSections(data || []);
            } catch (err) {
                console.error('Failed to load sections:', err);
                setSections([]);
            } finally {
                setLoadingSections(false);
            }
        };
        loadSections();
    }, [form.classId]);

    const set = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const handleClassChange = (e) => {
        const selected = classes.find(c => String(c.id) === e.target.value);
        setForm(prev => ({
            ...prev,
            classId: selected?.id || '',
            className: selected?.name || selected?.className || '',
            sectionId: '',
            sectionName: '',
        }));
        setErrors(prev => ({ ...prev, classId: '', sectionId: '' }));
    };

    const handleSectionChange = (e) => {
        const selected = sections.find(s => String(s.id) === e.target.value);
        setForm(prev => ({
            ...prev,
            sectionId: selected?.id || '',
            sectionName: selected?.name || selected?.sectionName || '',
        }));
        setErrors(prev => ({ ...prev, sectionId: '' }));
    };

    const handleCopyFromChange = (e) => {
        const val = e.target.value;
        if (!val) {
            setForm(prev => ({ ...prev, copyFrom: '', copyFromTimetableId: null }));
            return;
        }
        const found = existingTimetables.find(t => String(t.id) === val);
        setForm(prev => ({
            ...prev,
            copyFrom: val,
            copyFromTimetableId: found?.id || null,
        }));
    };

    const validate = () => {
        const errs = {};
        if (!form.classId) errs.classId = 'Class is required';
        if (!form.sectionId) errs.sectionId = 'Section is required';
        if (!form.academicYear) errs.academicYear = 'Academic year is required';
        return errs;
    };

    const handleSubmit = () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        onSubmit(form);
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Calendar size={20} className="text-blue-600" />
                        <h2 className="text-lg font-semibold text-gray-900">New Timetable Schedule</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5">
                    {/* Class & Section */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Class */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.classId}
                                onChange={handleClassChange}
                                disabled={loadingClasses}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white
                  ${errors.classId ? 'border-red-300' : 'border-gray-200'}
                  ${loadingClasses ? 'opacity-60 cursor-wait' : ''}`}
                            >
                                <option value="">
                                    {loadingClasses ? 'Loading...' : '— Select Class —'}
                                </option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name || c.className || `Class ${c.id}`}
                                    </option>
                                ))}
                            </select>
                            {errors.classId && <p className="text-xs text-red-500 mt-1">{errors.classId}</p>}
                        </div>

                        {/* Section */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={form.sectionId}
                                onChange={handleSectionChange}
                                disabled={!form.classId || loadingSections}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white
                  ${errors.sectionId ? 'border-red-300' : 'border-gray-200'}
                  ${(!form.classId || loadingSections) ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                <option value="">
                                    {!form.classId ? '— Select Class first —'
                                        : loadingSections ? 'Loading...'
                                            : sections.length === 0 ? 'No sections found'
                                                : '— Select Section —'}
                                </option>
                                {sections.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.name || s.sectionName || `Section ${s.id}`}
                                    </option>
                                ))}
                            </select>
                            {errors.sectionId && <p className="text-xs text-red-500 mt-1">{errors.sectionId}</p>}
                        </div>
                    </div>

                    {/* Academic Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Academic Year <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={form.academicYear}
                            onChange={e => set('academicYear', e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white
    ${errors.academicYear ? 'border-red-300' : 'border-gray-200'}`}
                        >
                            <option value="">— Select Academic Year —</option>

                            {academicYears.map(year => (
                                <option key={year.id} value={year.id}>
                                    {year.name || year.value}
                                </option>
                            ))}
                        </select>
                        {errors.academicYear && <p className="text-xs text-red-500 mt-1">{errors.academicYear}</p>}
                    </div>

                    {/* Copy From */}
                    {existingTimetables.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Copy Schedule From <span className="text-gray-400 font-normal">(optional)</span>
                            </label>
                            <select
                                value={form.copyFrom}
                                onChange={handleCopyFromChange}
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
                            >
                                <option value="">– Start empty –</option>
                                {existingTimetables.map(t => (
                                    <option key={t.id} value={t.id}>
                                        {t.class} – {t.section} ({t.year})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={form.notes}
                            onChange={e => set('notes', e.target.value)}
                            placeholder="Any remarks..."
                            rows={3}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="px-5 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button onClick={handleSubmit}
                        className="px-5 py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] transition">
                        Create Schedule
                    </button>
                </div>
            </div>
        </div>
    );
}