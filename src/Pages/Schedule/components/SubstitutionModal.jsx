import { useState, useEffect } from 'react';
import { X, ArrowLeftRight, AlertCircle, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    getSubstitutions,
    createSubstitution,
    updateSubstitutionStatus,
    getAvailableTeachersForSlot,
} from '../../../Api/Academics/ScheduleApi';
import { TIMETABLE_CONSTS } from '../../../Constants/StringConstants/TimetableConstants';

export default function SubstitutionModal({ timetableId, selectedSlots = [], onClose, onSuccess }) {
    const [activeSlotIndex, setActiveSlotIndex] = useState(0);
    const activeSlot = selectedSlots[activeSlotIndex] || null;

    const [form, setForm] = useState({
        date: '',
        substituteTeacherId: '',
        reason: '',
        reasonOther: '',
        notes: '',
    });

    const [availableTeachers, setAvailableTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(false);

    const [substitutions, setSubstitutions] = useState([]);
    const [existingSubstitution, setExistingSubstitution] = useState(null);

    const [teacherDropdownOpen, setTeacherDropdownOpen] = useState(false);
    const [teacherSearch, setTeacherSearch] = useState('');

    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (timetableId) loadSubstitutions();
    }, [timetableId]);

    useEffect(() => {
        if (!activeSlot) return;
        fetchAvailableTeachers(activeSlot);
        checkExistingSubstitution(activeSlot);
        setForm(prev => ({
            ...prev,
            substituteTeacherId: '',
            reason: '',
            reasonOther: '',
            notes: '',
        }));
        setErrors({});
    }, [activeSlotIndex, substitutions.length]);

    const loadSubstitutions = async () => {
        try {
            const data = await getSubstitutions(timetableId);
            setSubstitutions(data || []);
        } catch { }
    };

    const fetchAvailableTeachers = async (slot) => {
        if (!slot) return;
        try {
            setLoadingTeachers(true);
            setAvailableTeachers([]);
            const periodNumber = parseInt((slot.periodId || '').replace('P', ''));
            const result = await getAvailableTeachersForSlot(timetableId, slot.day, periodNumber, slot.subject?.id);
            const data = result?.data || result;
            const bestMatch = data?.bestMatch || [];
            const others = data?.others || [];
            const list = Array.isArray(result) ? result : [...bestMatch, ...others];
            setAvailableTeachers(list);
        } catch (err) {
            console.error('fetchAvailableTeachers error:', err);
            setAvailableTeachers([]);
        } finally {
            setLoadingTeachers(false);
        }
    };

    const checkExistingSubstitution = (slot) => {
        if (!slot?.slotId || substitutions.length === 0) { setExistingSubstitution(null); return; }
        const existing = substitutions.find(s => s.slotId === slot.slotId && s.status === TIMETABLE_CONSTS.STATUS.PENDING);
        if (existing) {
            setExistingSubstitution(existing);
            setForm({
                date: existing.substituteDate || '',
                substituteTeacherId: String(existing.substituteTeacherId || ''),
                reason: TIMETABLE_CONSTS.SUBSTITUTION.REASONS.includes(existing.reason) ? existing.reason : TIMETABLE_CONSTS.SUBSTITUTION.OTHER,
                reasonOther: TIMETABLE_CONSTS.SUBSTITUTION.REASONS.includes(existing.reason) ? '' : (existing.reason || ''),
                notes: existing.notes || '',
            });
        } else {
            setExistingSubstitution(null);
        }
    };

    const set = (key, val) => {
        setForm(prev => ({ ...prev, [key]: val }));
        setErrors(prev => ({ ...prev, [key]: '' }));
    };

    const validate = () => {
        const errs = {};
        if (!form.date) errs.date = TIMETABLE_CONSTS.SUBSTITUTION.ERR_DATE_REQ;
        if (!form.substituteTeacherId) errs.substituteTeacherId = TIMETABLE_CONSTS.SUBSTITUTION.ERR_TEACHER_REQ;
        if (activeSlot?.teacher?.id && String(activeSlot.teacher.id) === String(form.substituteTeacherId))
            errs.substituteTeacherId = TIMETABLE_CONSTS.SUBSTITUTION.ERR_TEACHER_SAME;
        if (!form.reason) errs.reason = TIMETABLE_CONSTS.SUBSTITUTION.ERR_REASON_REQ;
        if (form.reason === TIMETABLE_CONSTS.SUBSTITUTION.OTHER && !form.reasonOther.trim())
            errs.reasonOther = TIMETABLE_CONSTS.SUBSTITUTION.ERR_REASON_SPEC;
        return errs;
    };

    const resolvedReason = form.reason === TIMETABLE_CONSTS.SUBSTITUTION.OTHER ? form.reasonOther.trim() : form.reason;

    const handleConfirm = async () => {
        const errs = validate();
        if (Object.keys(errs).length > 0) { setErrors(errs); return; }
        try {
            setSaving(true);
            let successMsg = '';

            if (existingSubstitution) {
                await updateSubstitutionStatus(timetableId, existingSubstitution.id, TIMETABLE_CONSTS.STATUS.CONFIRMED);
                successMsg = 'Substitution updated successfully!';
            } else {
                const payload = {
                    slotId: activeSlot?.slotId || null,
                    substituteDate: form.date,
                    originalTeacherId: activeSlot?.teacher?.id ? parseInt(activeSlot.teacher.id) : undefined,
                    substituteTeacherId: parseInt(form.substituteTeacherId),
                    reason: resolvedReason,
                    notes: form.notes,
                };
                await createSubstitution(timetableId, payload);
                successMsg = 'Substitution arranged successfully!';
            }

            // Toast show kar rahe hain
            toast.success(successMsg);

            await loadSubstitutions();

            // Multiple slots select hone par next slot par move karo, varna close karo
            if (activeSlotIndex < selectedSlots.length - 1) {
                setActiveSlotIndex(i => i + 1);
            } else {
                if (onSuccess) onSuccess(successMsg);
                onClose();
            }
        } catch (err) {
            const errorMsg = err.message || TIMETABLE_CONSTS.SUBSTITUTION.ERR_SUBMIT_GEN;
            toast.error(errorMsg);
            setErrors({ submit: errorMsg });
        } finally {
            setSaving(false);
        }
    };

    const teacherDisplayName = (t) => t?.name || t?.teacherName || `Teacher #${t?.id || t?.teacherId}`;
    const teacherInitial = (t) => (teacherDisplayName(t)[0] ?? '?').toUpperCase();

    const filteredTeachers = teacherSearch
        ? availableTeachers.filter(t => teacherDisplayName(t).toLowerCase().includes(teacherSearch.toLowerCase()))
        : availableTeachers;

    const isUpdate = !!existingSubstitution;
    const originalTeacherName = activeSlot?.teacher?.name || '—';

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full max-w-md max-h-[92vh] overflow-hidden flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <ArrowLeftRight size={17} className="text-blue-600" />
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                            {isUpdate ? TIMETABLE_CONSTS.SUBSTITUTION.TITLE_UPDATE : TIMETABLE_CONSTS.SUBSTITUTION.TITLE_ARRANGE}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer">
                        <X size={17} className="text-gray-500" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] sm:max-h-[62vh] overflow-y-auto">

                    {/* Multi-slot picker */}
                    {selectedSlots.length > 1 && (
                        <div>
                            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                                {TIMETABLE_CONSTS.SUBSTITUTION.LBL_SEL_SLOT}
                            </label>
                            <div className="flex flex-wrap gap-1.5">
                                {selectedSlots.map((s, i) => (
                                    <button key={i} onClick={() => setActiveSlotIndex(i)}
                                        className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition cursor-pointer
                                            ${activeSlotIndex === i
                                                ? 'bg-indigo-600 text-white border-indigo-600'
                                                : 'bg-gray-100 text-gray-600 border-gray-200 hover:border-indigo-400'}`}>
                                        {s.day} · {s.periodId} · {s.subject?.code || '—'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Slot context card */}
                    {activeSlot && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-blue-900">
                                        {activeSlot.subject?.label || activeSlot.subject?.code || TIMETABLE_CONSTS.SUBSTITUTION.LBL_UNKNOWN_SUBJ}
                                    </p>
                                    <p className="text-blue-600 text-xs mt-0.5">
                                        {activeSlot.day} · {activeSlot.periodId}
                                        {activeSlot.room ? ` · 📍 ${activeSlot.room}` : ''}
                                    </p>
                                </div>
                                {isUpdate && (
                                    <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full border border-amber-200 shrink-0">
                                        {TIMETABLE_CONSTS.SUBSTITUTION.BADGE_PENDING}
                                    </span>
                                )}
                            </div>
                        </div>
                    )}

                    {errors.submit && (
                        <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
                            <AlertCircle size={13} />
                            {errors.submit}
                        </div>
                    )}

                    {/* Original Teacher */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{TIMETABLE_CONSTS.SUBSTITUTION.LBL_ORIG_TEACHER}</label>
                        <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-600 select-none">
                            {originalTeacherName}
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {TIMETABLE_CONSTS.SUBSTITUTION.LBL_DATE} <span className="text-red-500">*</span>
                        </label>
                        <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100
                                ${errors.date ? 'border-red-300' : 'border-gray-200'}`} />
                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                    </div>

                    {/* Substitute Teacher */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {TIMETABLE_CONSTS.SUBSTITUTION.LBL_SUB_TEACHER} <span className="text-red-500">*</span>
                        </label>

                        {loadingTeachers ? (
                            <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2.5 text-sm text-gray-400">
                                {TIMETABLE_CONSTS.SUBSTITUTION.LOADING_TEACHERS}
                            </div>
                        ) : (
                            <div className="relative">
                                <button type="button" onClick={() => setTeacherDropdownOpen(o => !o)}
                                    className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 sm:py-2 border rounded-lg bg-white text-sm transition
                                        ${errors.substituteTeacherId ? 'border-red-300' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <span className="flex items-center gap-2 min-w-0">
                                        {form.substituteTeacherId ? (
                                            <>
                                                <span className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                                                    {teacherInitial(availableTeachers.find(t => String(t.id || t.teacherId) === String(form.substituteTeacherId)))}
                                                </span>
                                                <span className="truncate">
                                                    {teacherDisplayName(availableTeachers.find(t => String(t.id || t.teacherId) === String(form.substituteTeacherId)))}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-gray-500">{TIMETABLE_CONSTS.SUBSTITUTION.PH_SEL_TEACHER}</span>
                                        )}
                                    </span>
                                    <ChevronDown size={15} className={`text-gray-400 transition-transform shrink-0 ${teacherDropdownOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {teacherDropdownOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-30 overflow-hidden">
                                        <div className="p-2 border-b border-gray-100">
                                            <input autoFocus value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)}
                                                placeholder={TIMETABLE_CONSTS.SUBSTITUTION.PH_SEARCH_TEACHER}
                                                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300" />
                                        </div>
                                        <div className="max-h-44 overflow-y-auto">
                                            {filteredTeachers.length === 0 ? (
                                                <p className="text-xs text-gray-400 text-center py-4">{TIMETABLE_CONSTS.SUBSTITUTION.NO_TEACHERS}</p>
                                            ) : (
                                                filteredTeachers.map(t => {
                                                    const teacherId = t.id || t.teacherId;
                                                    return (
                                                        <button type="button" key={teacherId}
                                                            onClick={() => { set('substituteTeacherId', String(teacherId)); setTeacherDropdownOpen(false); setTeacherSearch(''); }}
                                                            className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition
                                                                ${String(form.substituteTeacherId) === String(teacherId)
                                                                    ? 'bg-blue-50 text-blue-700 font-semibold'
                                                                    : 'text-gray-700 hover:bg-blue-50'}`}>
                                                            <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600 shrink-0">
                                                                {teacherInitial(t)}
                                                            </span>
                                                            <span className="truncate">{teacherDisplayName(t)}</span>
                                                        </button>
                                                    );
                                                })
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {errors.substituteTeacherId && <p className="text-xs text-red-500 mt-1">{errors.substituteTeacherId}</p>}
                    </div>

                    {/* Reason */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {TIMETABLE_CONSTS.SUBSTITUTION.LBL_REASON} <span className="text-red-500">*</span>
                        </label>
                        <select value={form.reason} onChange={e => set('reason', e.target.value)}
                            className={`w-full border rounded-lg px-3 py-2.5 sm:py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-100
                                ${errors.reason ? 'border-red-300' : 'border-gray-200'}`}>
                            <option value="">{TIMETABLE_CONSTS.SUBSTITUTION.PH_SEL_REASON}</option>
                            {TIMETABLE_CONSTS.SUBSTITUTION.REASONS.map(r => <option key={r}>{r}</option>)}
                        </select>
                        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
                    </div>

                    {/* "Other" reason */}
                    {form.reason === TIMETABLE_CONSTS.SUBSTITUTION.OTHER && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                {TIMETABLE_CONSTS.SUBSTITUTION.LBL_SPEC_REASON} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <textarea value={form.reasonOther}
                                    onChange={e => { if (e.target.value.length <= 100) set('reasonOther', e.target.value); }}
                                    placeholder={TIMETABLE_CONSTS.SUBSTITUTION.PH_DESC_REASON}
                                    rows={2} maxLength={100}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none
                                        ${errors.reasonOther ? 'border-red-300' : 'border-gray-200'}`} />
                                <span className="absolute bottom-2 right-2 text-xs text-gray-400">{form.reasonOther.length}/100</span>
                            </div>
                            {errors.reasonOther && <p className="text-xs text-red-500 mt-1">{errors.reasonOther}</p>}
                        </div>
                    )}

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{TIMETABLE_CONSTS.SUBSTITUTION.LBL_NOTES}</label>
                        <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
                            placeholder={TIMETABLE_CONSTS.SUBSTITUTION.PH_NOTES}
                            rows={2}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 resize-none" />
                    </div>
                </div>

                {/* Footer / Buttons */}
                <div className="flex gap-3 px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100">
                    <button onClick={onClose}
                        className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer transition text-center">
                        {TIMETABLE_CONSTS.SUBSTITUTION.BTN_CANCEL}
                    </button>
                    <button onClick={handleConfirm} disabled={saving}
                        className="flex-1 sm:flex-none px-5 py-2.5 sm:py-2 bg-[#1e293b] text-white rounded-lg text-sm font-medium hover:bg-[#334155] disabled:opacity-50 transition cursor-pointer text-center">
                        {saving ? TIMETABLE_CONSTS.SUBSTITUTION.BTN_SAVING : isUpdate ? TIMETABLE_CONSTS.SUBSTITUTION.BTN_UPDATE : TIMETABLE_CONSTS.SUBSTITUTION.BTN_CONFIRM}
                    </button>
                </div>
            </div>
        </div>
    );
}