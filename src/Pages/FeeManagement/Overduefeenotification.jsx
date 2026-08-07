import React, { useState, useEffect, useContext, useMemo } from 'react';
import Select from '../../Components/FeeModal/Select';
import {
    AlertCircle, AlertTriangle, CheckCircle2, Info, X,
    Clock, Bell, Users, Search, Send, Calendar, Phone, Hash,
} from 'lucide-react';
import { getFeePeriods, getAcademicYears } from '../../Api/FeeManagement/FeePeriods';
import { getOutstandingFees } from '../../Api/FeeManagement/FeeCollection.js';
import { getFeeStructures } from '../../Api/FeeManagement/FeeStructures';
import { getActiveClasses } from '../../Api/Academics/ClassSectionAPI.js';
import { getStudentByClass } from '../../Api/Students/StudentsApi.js';
import {sendOverdueFeeNotifications} from "../../Api/FeeManagement/FeeNotification.js";
import { UserContext } from '../../ContextAPI/UserContext';

// ─── ASSUMPTIONS (please confirm / adjust) ────────────────────────────────────
// 1. `sendOverdueFeeNotifications` lives in
//    '../../Api/FeeManagement/FeeNotifications.js' and matches the function
//    you pasted (POST /v1/fee/notifications/overdue?classId=&periodId=,
//    empty body). Update the import path if it's actually somewhere else.
// 2. Backend only accepts classId + periodId as query params — no
//    studentIds, no custom message. It notifies EVERY parent with an
//    overdue balance for that class + period, full stop.
// 3. Per-student checkboxes have been removed entirely. Since the backend
//    can't target individual students, the "select some rows" table UX was
//    just noise — the Send button always targets the whole class+period,
//    and the totals in the confirm modal now come straight from
//    `filteredStudents` (i.e. everything currently shown, search included).
// 4. schoolId is read from UserContext (`useContext(UserContext).schoolId`).
// 5. Outstanding-fee record shape: same defensive normalization as before
//    in `mergeStudentRecord()` — adjust field names to your real response.

// ─── Toast (self-contained) ───────────────────────────────────────────────────
let _dispatch = null;
const ToastContainer = () => {
    const [toasts, setToasts] = useState([]);
    useEffect(() => {
        _dispatch = (t) => {
            const id = Date.now() + Math.random();
            setToasts((p) => [...p, { ...t, id }]);
            setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), t.duration || 4000);
        };
        return () => { _dispatch = null; };
    }, []);
    const icons = {
        success: <CheckCircle2 size={15} className="flex-shrink-0 text-emerald-400" />,
        error: <AlertCircle size={15} className="flex-shrink-0 text-red-400" />,
        warning: <AlertTriangle size={15} className="flex-shrink-0 text-amber-400" />,
        info: <Info size={15} className="flex-shrink-0 text-blue-400" />,
    };
    return (
        <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id}
                     className="flex items-start gap-3 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-2xl min-w-[280px] max-w-sm pointer-events-auto"
                     style={{ animation: 'ofnToastIn .22s ease-out' }}>
                    {icons[t.type] || icons.info}
                    <div className="flex-1 min-w-0">
                        {t.title && <div className="text-[13px] font-semibold">{t.title}</div>}
                        {t.message && <div className="text-[12px] text-white/70 mt-0.5">{t.message}</div>}
                    </div>
                    <button onClick={() => setToasts((p) => p.filter((x) => x.id !== t.id))}
                            className="opacity-50 hover:opacity-100 ml-1 mt-0.5 flex-shrink-0">
                        <X size={13} />
                    </button>
                </div>
            ))}
            <style>{`@keyframes ofnToastIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:none}}`}</style>
        </div>
    );
};
const toast = {
    success: (title, message) => _dispatch?.({ type: 'success', title, message }),
    error: (title, message) => _dispatch?.({ type: 'error', title, message }),
    warning: (title, message) => _dispatch?.({ type: 'warning', title, message }),
    info: (title, message) => _dispatch?.({ type: 'info', title, message }),
};

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatCurrency = (amount) => {
    if (!amount) return '₹0';
    return '₹' + Number(amount).toLocaleString('en-IN');
};

// Only OPEN periods (status !== CLOSED) whose due date has already passed.
const isOpenOverduePeriod = (period) => {
    const today = new Date().toISOString().split('T')[0];
    const due = period.dueDate ? period.dueDate.split('T')[0] : null;
    return due && due < today && period.status !== 'CLOSED';
};

const normalizeClass = (raw) => ({
    id: raw.id ?? raw.classId,
    name: raw.className ?? raw.name ?? raw.label ?? `Class ${raw.id ?? raw.classId}`,
});

// A fee structure can be attached to MULTIPLE classes at once — the real
// response shape is `structure.classes: [{ id, name, gradeLevel,
// studentCount }, ...]`. This pulls every { id, name } pair out of a
// structure, falling back to a single classId/className shape defensively
// in case an older/different endpoint version is hit.
const normalizeStructureClasses = (raw) => {
    if (Array.isArray(raw.classes) && raw.classes.length > 0) {
        return raw.classes
            .map((c) => ({ id: c.id ?? c.classId, name: c.name ?? c.className ?? (c.id != null ? `Class ${c.id}` : null) }))
            .filter((c) => c.id != null);
    }
    const id = raw.classId ?? raw.class?.id ?? raw.class_id;
    if (id == null) return [];
    const name = raw.className ?? raw.class?.name ?? raw.class?.className ?? `Class ${id}`;
    return [{ id, name }];
};

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

// Merge an outstanding-fee record with the matching full student profile
// (from getStudentByClass) so the table can show useful contact info.
const mergeStudentRecord = (outstandingRaw, profile) => {
    const p = profile || {};
    const personal = p.personalDetails || {};
    return {
        studentId: outstandingRaw.studentId ?? outstandingRaw.id ?? p.id,
        name: p.fullName ?? outstandingRaw.studentName ?? outstandingRaw.name ?? '—',
        admissionNumber: p.admissionNumber ?? outstandingRaw.admissionNumber ?? '—',
        rollNumber: p.rollNumber ?? outstandingRaw.rollNumber ?? '—',
        className: p.className ?? outstandingRaw.className ?? outstandingRaw.class ?? '—',
        section: p.sectionName ?? outstandingRaw.section ?? '',
        dueAmount: outstandingRaw.balanceDue ?? outstandingRaw.dueAmount ?? outstandingRaw.outstandingAmount ?? outstandingRaw.balanceAmount ?? 0,
        overdueDays: outstandingRaw.overdueDays ?? null,
        guardianName: p.guardianName || p.fatherName || p.motherName || '—',
        guardianPhone: p.guardianPhone || p.fatherPhone || p.motherPhone || personal.mobile || outstandingRaw.mobileNumber || '',
        profileImageUrl: p.profileImageUrl || '',
    };
};

// ─── Confirm Send Modal ────────────────────────────────────────────────────
// No message field, no student picker: the backend notifies every parent
// with an overdue balance for the chosen class + period, so this is a
// straight confirmation, not a compose step.
const ConfirmSendModal = ({ open, onClose, onConfirm, loading, className, periodName, studentCount, totalDue }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Send Overdue Fee Reminders</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{className} · {periodName}</p>
                    </div>
                    <button onClick={onClose} className="w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors">
                        <X size={14} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-3">
                    <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3.5 py-3 text-xs text-amber-800">
                        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5 text-amber-500" />
                        <span>
                            This sends a push notification to <strong>every</strong> parent with an
                            overdue balance in this class for this period. Individual targeting
                            isn't supported by the notification service.
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                            <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Students</div>
                            <div className="font-bold text-gray-800 mt-0.5">{studentCount}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                            <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Total Due</div>
                            <div className="font-bold text-gray-800 mt-0.5">{formatCurrency(totalDue)}</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <button onClick={onClose} disabled={loading}
                            className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2">
                        {loading ? <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> : <Send size={13} />}
                        {loading ? 'Sending…' : 'Send to All Overdue'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Overdue Period Card ──────────────────────────────────────────────────────
const OverduePeriodCard = ({ p, selected, onSelect }) => (
    <div
        onClick={() => onSelect(p.id)}
        className={`cursor-pointer bg-white rounded-xl border shadow-sm hover:shadow-md transition-all duration-200 p-4 ${selected ? 'border-[#2563EB] ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'}`}
    >
        <div className="flex items-start justify-between gap-2">
            <h3 className="text-[14px] font-bold text-gray-900 leading-snug break-words" title={p.name}>{p.name}</h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 whitespace-nowrap">
        <CheckCircle2 size={10} /> Active
      </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            <span className="font-medium">{p.type}</span>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-red-600 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> Overdue
      </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-2 mt-2 border-t border-gray-100">
            <Clock size={12} className="text-gray-400 flex-shrink-0" />
            Due <span className="font-semibold text-gray-700">{formatDate(p.dueDate)}</span>
        </div>
    </div>
);

// ─── Component ─────────────────────────────────────────────────────────────
const OverdueFeeNotifications = () => {
    const { schoolId } = useContext(UserContext);

    // Academic year filter
    const [academicYears, setAcademicYears] = useState([]);
    const [academicYearsLoading, setAcademicYearsLoading] = useState(false);
    const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');

    // Overdue periods (open only)
    const [periods, setPeriods] = useState([]);
    const [periodsLoading, setPeriodsLoading] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState('');

    // All active classes (used only to resolve a class name if a fee
    // structure doesn't carry one) + classes restricted to this period.
    const [allClasses, setAllClasses] = useState([]);
    const [structures, setStructures] = useState([]);
    const [structuresLoading, setStructuresLoading] = useState(false);
    const [selectedClassId, setSelectedClassId] = useState('');

    // Students — server-side paginated via getOutstandingFees. No
    // selection state anymore: the backend only accepts classId + periodId,
    // so every row shown (subject to the search filter) is what gets
    // notified — there's nothing per-row left to toggle.
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [profileMap, setProfileMap] = useState(new Map());

    // Pagination
    const PAGE_SIZE_OPTIONS = [15, 25, 50];
    const [pageSize, setPageSize] = useState(15);
    const [currentPage, setCurrentPage] = useState(0); // 0-indexed
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Send notification modal
    const [modalOpen, setModalOpen] = useState(false);
    const [sending, setSending] = useState(false);

    // Load academic years once
    useEffect(() => {
        (async () => {
            setAcademicYearsLoading(true);
            try {
                const data = await getAcademicYears();
                const list = Array.isArray(data) ? data : [];
                setAcademicYears(list);
                if (list.length > 0) setSelectedAcademicYearId(String(list[0].id));
            } catch (err) {
                toast.error('Failed to load academic years', err.message);
            } finally {
                setAcademicYearsLoading(false);
            }
        })();
    }, []);

    // Load all active classes once (school-scoped) — used only as a name
    // fallback when a fee structure doesn't include a className.
    useEffect(() => {
        if (!schoolId) return;
        (async () => {
            try {
                const data = await getActiveClasses(schoolId);
                const list = Array.isArray(data) ? data : (data?.data || []);
                setAllClasses(list.map(normalizeClass));
            } catch (err) {
                toast.error('Failed to load classes', err.message);
            }
        })();
    }, [schoolId]);

    // Fetch fee periods whenever the academic year filter changes, then keep
    // only OPEN periods whose due date has already passed.
    useEffect(() => {
        if (!selectedAcademicYearId) return;
        setSelectedPeriodId('');
        (async () => {
            setPeriodsLoading(true);
            try {
                const data = await getFeePeriods(selectedAcademicYearId);
                const overdue = (Array.isArray(data) ? data : []).filter(isOpenOverduePeriod);
                setPeriods(overdue);
            } catch (err) {
                toast.error('Failed to load fee periods', err.message);
                setPeriods([]);
            } finally {
                setPeriodsLoading(false);
            }
        })();
    }, [selectedAcademicYearId]);

    // Once a period is picked, fetch ITS fee structures — the classes
    // dropdown is restricted to only the classes that actually have a
    // structure attached to this period.
    useEffect(() => {
        setSelectedClassId('');
        setStructures([]);
        if (!selectedPeriodId) return;
        (async () => {
            setStructuresLoading(true);
            try {
                const data = await getFeeStructures(selectedPeriodId);
                setStructures(Array.isArray(data) ? data : []);
            } catch (err) {
                toast.error('Failed to load fee structures for this period', err.message);
                setStructures([]);
            } finally {
                setStructuresLoading(false);
            }
        })();
    }, [selectedPeriodId]);

    const selectedPeriod = periods.find((p) => String(p.id) === selectedPeriodId);

    // Distinct classes that have a fee structure on the selected period.
    // Prefer the structure's own className; fall back to the school's class
    // list if the structure only carries a classId.
    const classOptions = useMemo(() => {
        const byId = new Map();
        structures.forEach((s) => {
            normalizeStructureClasses(s).forEach((c) => {
                const fallbackName = allClasses.find((ac) => String(ac.id) === String(c.id))?.name;
                byId.set(String(c.id), c.name || fallbackName || `Class ${c.id}`);
            });
        });
        return Array.from(byId.entries()).map(([id, name]) => ({ value: id, label: name }));
    }, [structures, allClasses]);

    const selectedClass = classOptions.find((c) => c.value === selectedClassId);

    // Fetch each student's full profile once per class (not paginated — the
    // roster is small) so photo/admission no./guardian contact are available
    // regardless of which page of overdue records is showing.
    useEffect(() => {
        if (!selectedClassId) {
            setProfileMap(new Map());
            return;
        }
        (async () => {
            try {
                const profiles = await getStudentByClass(selectedClassId);
                setProfileMap(new Map((profiles || []).map((p) => [String(p.id), p])));
            } catch {
                setProfileMap(new Map());
            }
        })();
    }, [selectedClassId]);

    // Reset to page 1 whenever the period, class, or page size changes.
    useEffect(() => {
        setCurrentPage(0);
    }, [selectedPeriodId, selectedClassId, pageSize]);

    // Fetch the current page of overdue students once a period + class are
    // both picked.
    useEffect(() => {
        if (!selectedPeriodId || !selectedClassId) {
            setStudents([]);
            setTotalPages(0);
            setTotalElements(0);
            return;
        }
        (async () => {
            setStudentsLoading(true);
            try {
                const { records, pagination } = await getOutstandingFees({
                    classId: selectedClassId,
                    periodId: selectedPeriodId,
                    status: 'OVERDUE',
                    page: currentPage,
                    size: pageSize,
                });
                setStudents(records);
                setTotalPages(pagination.totalPages || 0);
                setTotalElements(pagination.totalElements || 0);
            } catch (err) {
                toast.error('Failed to load overdue students', err.message);
                setStudents([]);
                setTotalPages(0);
                setTotalElements(0);
            } finally {
                setStudentsLoading(false);
            }
        })();
    }, [selectedPeriodId, selectedClassId, currentPage, pageSize]);

    // Merge the current page's raw overdue records with each student's full
    // profile for a richer table (photo, admission no., guardian contact).
    const mergedStudents = useMemo(
        () => students.map((r) => mergeStudentRecord(r, profileMap.get(String(r.studentId ?? r.id)))),
        [students, profileMap]
    );

    const filteredStudents = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return mergedStudents;
        return mergedStudents.filter((s) =>
            s.name.toLowerCase().includes(q) ||
            String(s.rollNumber).toLowerCase().includes(q) ||
            String(s.admissionNumber).toLowerCase().includes(q)
        );
    }, [mergedStudents, search]);

    // Totals shown in the confirm modal reflect what's currently shown on
    // this page (search-filtered), as a preview — the actual send always
    // covers the whole class+period regardless of pagination/search, since
    // the backend can't be scoped to a subset of students.
    const totalDueAll = useMemo(
        () => filteredStudents.reduce((sum, s) => sum + (s.dueAmount || 0), 0),
        [filteredStudents]
    );

    const handleConfirmSend = async () => {
        setSending(true);
        try {
            // TODO: if the backend ever adds studentIds / message support,
            // pass them here. Today it only accepts classId + periodId and
            // notifies every overdue parent in that scope.
            const result = await sendOverdueFeeNotifications({
                classId: selectedClassId,
                periodId: selectedPeriodId,
            });
            const { studentsNotified, parentsReached, deviceTokensReached, message } = result?.data || {};
            toast.success(
                'Notifications sent',
                message || `Reminders sent for ${studentsNotified ?? '—'} student(s) to ${parentsReached ?? '—'} parent(s) (${deviceTokensReached ?? 0} device(s)).`
            );
            setModalOpen(false);
        } catch (err) {
            toast.error('Failed to send notifications', err.message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-[1200px] mx-auto space-y-5 px-3 sm:px-4 lg:px-6">
            <ToastContainer />

            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">Overdue Fee Notifications</h1>
                    <p className="text-xs sm:text-sm text-gray-400 mt-0.5">Remind students with pending fees past their due date</p>
                </div>

                <div className="w-full sm:w-64">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Academic Year</label>
                    {academicYearsLoading ? (
                        <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">Loading…</div>
                    ) : (
                        <Select
                            value={selectedAcademicYearId}
                            onChange={setSelectedAcademicYearId}
                            options={academicYears.map((ay) => ({ value: String(ay.id), label: ay.label || ay.name }))}
                            placeholder="Select academic year"
                        />
                    )}
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <span>Only open fee periods whose due date has already passed are shown below. The class list is restricted to classes that actually have a fee structure attached to the period you pick.</span>
            </div>

            {/* Overdue periods */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-2 px-4 sm:px-5 py-4 border-b border-gray-100">
                    <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                        <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
                        Overdue Fee Periods
                        {periods.length > 0 && (
                            <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                {periods.length}
              </span>
                        )}
                    </h2>
                </div>

                {periodsLoading ? (
                    <div className="flex items-center justify-center py-14">
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            Loading fee periods…
                        </div>
                    </div>
                ) : periods.length === 0 ? (
                    <div className="text-center py-14 px-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <Calendar size={20} className="text-gray-400" />
                        </div>
                        <div className="text-sm font-semibold text-gray-500">No open overdue fee periods</div>
                        <div className="text-xs text-gray-400 mt-1">Nothing is currently past its due date for this academic year.</div>
                    </div>
                ) : (
                    <div className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {periods.map((p) => (
                                <OverduePeriodCard
                                    key={p.id}
                                    p={p}
                                    selected={String(p.id) === selectedPeriodId}
                                    onSelect={(id) => setSelectedPeriodId(String(id))}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Class filter — restricted to classes with a fee structure on this period */}
            {selectedPeriodId && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
                    <div className="max-w-xs">
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                            Class <span className="text-red-500">*</span>
                        </label>
                        {structuresLoading ? (
                            <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">Loading classes…</div>
                        ) : classOptions.length === 0 ? (
                            <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                                No fee structures attached to this period yet
                            </div>
                        ) : (
                            <Select
                                value={selectedClassId}
                                onChange={setSelectedClassId}
                                options={classOptions}
                                placeholder="Select a class"
                            />
                        )}
                    </div>
                </div>
            )}

            {/* Students table */}
            {selectedPeriodId && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
                            Students with Pending Fees
                            {students.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                  {students.length}
                </span>
                            )}
                        </h2>

                        {students.length > 0 && (
                            <div className="relative">
                                <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search by name, roll no. or admission no."
                                    className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-64"
                                />
                            </div>
                        )}
                    </div>

                    {!selectedClassId ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Users size={20} className="text-gray-400" />
                            </div>
                            <div className="text-sm font-semibold text-gray-500">Select a class</div>
                            <div className="text-xs text-gray-400 mt-1">Pending students will show up here once a class is picked.</div>
                        </div>
                    ) : studentsLoading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="text-gray-400 text-sm flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Loading overdue students…
                            </div>
                        </div>
                    ) : filteredStudents.length === 0 ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <CheckCircle2 size={20} className="text-emerald-500" />
                            </div>
                            <div className="text-sm font-semibold text-gray-500">No pending fees</div>
                            <div className="text-xs text-gray-400 mt-1">Everyone in this class has cleared dues for this period.</div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                <tr className="border-b border-gray-100 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                                    <th className="px-4 sm:px-5 py-3">Student</th>
                                    <th className="px-3 py-3">Admission No.</th>
                                    <th className="px-3 py-3">Class</th>
                                    <th className="px-3 py-3">Guardian Contact</th>
                                    <th className="px-3 py-3 text-right">Due Amount</th>
                                </tr>
                                </thead>
                                <tbody>
                                {filteredStudents.map((s) => (
                                    <tr
                                        key={s.studentId}
                                        className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                                    >
                                        <td className="px-4 sm:px-5 py-3">
                                            <div className="flex items-center gap-2.5">
                                                {s.profileImageUrl ? (
                                                    <img src={s.profileImageUrl} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-100" />
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                                                        {initials(s.name)}
                                                    </div>
                                                )}
                                                <div className="min-w-0">
                                                    <div className="font-semibold text-gray-800 truncate">{s.name}</div>
                                                    <div className="text-[11px] text-gray-400">Roll {s.rollNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">
                        <span className="inline-flex items-center gap-1">
                          <Hash size={11} className="text-gray-300" />
                            {s.admissionNumber}
                        </span>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">{s.className}{s.section ? ` - ${s.section}` : ''}</td>
                                        <td className="px-3 py-3 text-gray-500">
                                            {s.guardianPhone ? (
                                                <div>
                                                    <div className="flex items-center gap-1 text-gray-700 font-medium">
                                                        <Phone size={11} className="text-gray-400" />
                                                        {s.guardianPhone}
                                                    </div>
                                                    <div className="text-[11px] text-gray-400">{s.guardianName}</div>
                                                </div>
                                            ) : '—'}
                                        </td>
                                        <td className="px-3 py-3 text-right font-semibold text-red-600">{formatCurrency(s.dueAmount)}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {filteredStudents.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{filteredStudents.length}</span> student(s) shown
                                <span className="ml-2 text-gray-400">· {formatCurrency(totalDueAll)} total due</span>
                            </p>
                            <button
                                onClick={() => setModalOpen(true)}
                                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#2563EB] rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Bell size={14} />
                                Send Reminder to All Overdue
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ConfirmSendModal
                open={modalOpen}
                onClose={() => !sending && setModalOpen(false)}
                onConfirm={handleConfirmSend}
                loading={sending}
                className={selectedClass?.label || '—'}
                periodName={selectedPeriod?.name || '—'}
                studentCount={filteredStudents.length}
                totalDue={totalDueAll}
            />
        </div>
    );
};

export default OverdueFeeNotifications;