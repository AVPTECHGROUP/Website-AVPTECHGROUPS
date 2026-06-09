import { useState, useEffect } from 'react';
import { X, Calendar } from 'lucide-react';
import { getClasses, getSectionsByClass } from '../../../Api/TeachersAPI';
import { getAcademicYears } from '../../../Api/AcademicYear';
import { useDecodedUser } from '../../../ContextAPI/UserContext';

export default function AddTimetableModal({ onClose, onSubmit, existingTimetables = [] }) {
    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [loadingSections, setLoadingSections] = useState(false);
    const [academicYears, setAcademicYears] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { currentAcademicYear } = useDecodedUser();
    const currentYearId = currentAcademicYear?.id;
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
    
    // Auto-select current academic year when years or current user data become available
    useEffect(() => {
        if (!academicYears || academicYears.length === 0) return;
        // If user already selected an academic year, do not override
        if (form.academicYear) return;

        const defaultYear = academicYears.find(y => String(y.id) === String(currentAcademicYear?.id)) || academicYears[0];
        if (defaultYear && defaultYear.id) {
            setForm(prev => ({ ...prev, academicYear: defaultYear.id }));
        }
    }, [academicYears, currentAcademicYear, form.academicYear]);
    useEffect(() => {
        const loadMeta = async () => {
            try {
                setLoadingClasses(true);

                const [classData, yearResp] = await Promise.all([
                    getClasses(),
                    getAcademicYears()
                ]);

                setClasses(classData || []);
                // getAcademicYears returns { years: [...] }
                const yearsList = (yearResp && (yearResp.years || yearResp)) || [];
                setAcademicYears(Array.isArray(yearsList) ? yearsList : []);

                // Note: we intentionally do not force-select a default here —
                // a separate effect below will pick the current academic year
                // once `academicYears` and `currentAcademicYear` are both available.

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

    const handleSubmit = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setIsSubmitting(true);
            await onSubmit(form);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <Calendar size={20} className="text-blue-600 shrink-0" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">New Timetable Schedule</h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 transition">
                        <X size={18} className="text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-4 sm:p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Class & Section */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                            {academicYears.map(year => {
                                const isCurrent = String(currentYearId) === String(year.id);
                                const display = year.name || year.label || year.value || year.year || year.display || String(year.id);
                                const label = `${isCurrent ? '★ ' : ''}${display}${isCurrent ? ' (Current Year)' : ''}`;

                                return (
                                    <option key={year.id ?? display} value={year.id ?? display}>
                                        {label}
                                    </option>
                                );
                            })}
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
                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 px-4 sm:px-6 py-4 border-t border-gray-100 shrink-0">
                    <button onClick={onClose}
                        className="w-full sm:w-auto px-5 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-5 py-2.5 sm:py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? (
                            <span className="flex items-center justify-center gap-2">
                                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Creating...
                            </span>
                        ) : 'Create Schedule'}
                    </button>
                </div>
            </div>
        </div>
    );
}