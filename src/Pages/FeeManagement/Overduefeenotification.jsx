import React, { useState, useEffect, useContext, useMemo } from 'react';
import Select from '../../Components/FeeModal/Select';
import {
    AlertCircle, AlertTriangle, CheckCircle2, Info, X,
    Clock, Bell, Users, Search, Send, Calendar, Phone, Hash,
    ChevronLeft, ChevronRight, Layers,
} from 'lucide-react';
import { getFeePeriods } from '../../Api/FeeManagement/FeePeriods';
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
// 2. Per-student checkboxes are still removed — the backend notifies EVERY
//    parent with an overdue balance for the chosen class + period (+
//    structure, see #6 below), full stop.
// 3. schoolId is read from UserContext (`useContext(UserContext).schoolId`).
// 4. Outstanding-fee record shape: same defensive normalization as before
//    in `mergeStudentRecord()` — adjust field names to your real response.
// 5. `getOutstandingFees` accepts a `{ classId, periodId, status, page,
//    size }` object today. This file now ALSO passes `structureId` and
//    `search` in that same call — I don't have FeeCollection.js in this
//    conversation, so I can't confirm/fix whether those two new params
//    actually get forwarded into the query string. If they're silently
//    dropped, structure-scoping and server-side search won't take effect
//    until FeeCollection.js is updated to pass them through. Paste that
//    file and I'll wire it up exactly.
// 6. A fee period can have MULTIPLE fee structures (confirmed by your
//    /v1/fee/structures?periodId=12 response — 6 structures, several of
//    them scoped to the same class with different amounts/custom names).
//    A Fee Structure dropdown now sits between Period and Class so the
//    correct structure (and therefore correct amount) is unambiguous. The
//    Class dropdown is now scoped ONLY to the selected structure's classes
//    — not merged across every structure on the period like before.
// 7. Search is debounced and sent to the backend as `search` on every page
//    fetch (assumption #5 above) instead of being filtered only on the
//    current page client-side.
// 8. Backend needs to actually use `structureId` to scope the returned
//    outstanding-fee amounts/rows to that specific structure — otherwise
//    picking different structures for the same class+period will show the
//    same (wrong) numbers.
// 9. NEW: `currentAcademicYear` comes from UserContext (same field
//    CollectionsHistory.jsx reads as `currentAcademicYear?.id` /
//    `currentAcademicYear?.label`). If your UserContext names these fields
//    differently, adjust the two lines right after `useContext(UserContext)`
//    below.

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

const titleCase = (s = '') =>
    s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

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
// SINGLE structure, falling back to a single classId/className shape
// defensively in case an older/different endpoint version is hit.
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

// Builds a human-readable label for the Fee Structure dropdown:
// "{feePeriodName} - {custom name, or '-' when null}". A period can have
// several structures with a null `name` (the default/standard ones) and
// at most a couple with a custom name like "science tour fee" — the
// amount is appended purely so same-named entries stay distinguishable
// in the dropdown, since name + period alone can repeat.
const buildStructureLabel = (s) => {
    const period = s.feePeriodName || '—';
    const customName = s.name || '-';
    return `${period} - ${customName} · ${formatCurrency(s.totalAmount)}`;
};

const initials = (name = '') => name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

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

// FIX (requested — bug: "shows 1 selected but sends to all 19"): sums an
// already-fetched list of raw outstanding-fee records' due amounts, using
// the same field-fallback chain as mergeStudentRecord above so the "true
// total due" figure (see fetchTrueOverdueTotal effect below) is computed
// consistently with what's shown per-row in the table.
const sumDueAmount = (records) =>
    (records || []).reduce(
        (sum, r) => sum + (r.balanceDue ?? r.dueAmount ?? r.outstandingAmount ?? r.balanceAmount ?? 0),
        0
    );

// ─── Confirm Send Modal ────────────────────────────────────────────────────
// No message field, no student picker: the backend notifies every parent
// with an overdue balance for the chosen class + period (+ structure), so
// this is a straight confirmation, not a compose step.
//
// FIX (requested): studentCount/totalDue passed in here must ALWAYS
// reflect the true, unsearched, unpaginated scope of who will actually be
// notified — never the current page's or the current search's numbers.
// See the `trueOverdueTotal` state + its effect in the main component.
const ConfirmSendModal = ({ open, onClose, onConfirm, loading, loadingTotals, className, periodName, structureName, studentCount, totalDue }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div>
                        <h3 className="text-base font-bold text-gray-900">Send Overdue Fee Reminders</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{className} · {periodName}{structureName ? ` · ${structureName}` : ''}</p>
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
                            overdue balance in this class for this period — regardless of any search
                            or page filter currently applied to the table below. Individual targeting
                            isn't supported by the notification service.
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                            <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Students (all overdue)</div>
                            <div className="font-bold text-gray-800 mt-0.5">
                                {loadingTotals ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin inline-block" /> : studentCount}
                            </div>
                        </div>
                        <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                            <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Total Due (all overdue)</div>
                            <div className="font-bold text-gray-800 mt-0.5">
                                {loadingTotals ? <span className="w-4 h-4 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin inline-block" /> : formatCurrency(totalDue)}
                            </div>
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
                        disabled={loading || loadingTotals}
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

// ─── Pagination Bar ─────────────────────────────────────────────────────────
const getPageNumbers = (currentPageZeroIdx, totalPages) => {
    const cur = currentPageZeroIdx + 1;
    if (totalPages <= 7) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages = [1];
    if (cur > 3) pages.push('…');
    const start = Math.max(2, cur - 1);
    const end = Math.min(totalPages - 1, cur + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (cur < totalPages - 2) pages.push('…');
    pages.push(totalPages);
    return pages;
};

const PaginationBar = ({ currentPage, totalPages, totalElements, pageSize, pageSizeOptions, onPageChange, onPageSizeChange }) => {
    if (totalElements === 0) return null;
    const from = currentPage * pageSize + 1;
    const to = Math.min((currentPage + 1) * pageSize, totalElements);
    const pageNumbers = getPageNumbers(currentPage, totalPages);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-gray-100 bg-gray-50/50 text-xs text-gray-500">
            <span>Showing {from} to {to} of {totalElements}</span>
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    Rows per page:
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="border border-gray-200 rounded-md px-2 py-1 text-xs outline-none cursor-pointer"
                    >
                        {pageSizeOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-1.5">
                    <button
                        onClick={() => onPageChange(Math.max(0, currentPage - 1))}
                        disabled={currentPage <= 0}
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-white transition-colors"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {pageNumbers.map((n, i) =>
                        n === '…' ? (
                            <span key={`ellipsis-${i}`} className="w-7 h-7 flex items-center justify-center text-gray-400">…</span>
                        ) : (
                            <button
                                key={n}
                                onClick={() => onPageChange(n - 1)}
                                className={`w-7 h-7 rounded-md border flex items-center justify-center font-semibold transition-colors
                                    ${n - 1 === currentPage ? 'border-[#2563EB] bg-[#2563EB] text-white' : 'border-gray-200 hover:bg-white text-gray-600'}`}
                            >
                                {n}
                            </button>
                        )
                    )}
                    <button
                        onClick={() => onPageChange(Math.min(totalPages - 1, currentPage + 1))}
                        disabled={currentPage >= totalPages - 1}
                        className="w-7 h-7 rounded-md border border-gray-200 flex items-center justify-center disabled:opacity-40 hover:bg-white transition-colors"
                    >
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Component ─────────────────────────────────────────────────────────────
const OverdueFeeNotifications = () => {
    // FIX (requested): academic year is no longer a separate API call + a
    // dropdown the admin picks from — it's read directly from UserContext's
    // `currentAcademicYear`, the school's actual current academic year
    // (same source CollectionsHistory.jsx already relies on). There is
    // nothing to select anymore; the page is always scoped to whichever
    // year is currently active for the school.
    const { schoolId, currentAcademicYear } = useContext(UserContext);
    const academicYearId = currentAcademicYear?.id || null;
    const academicYearLabel = currentAcademicYear?.label || currentAcademicYear?.name || '';

    // Overdue periods (open only)
    const [periods, setPeriods] = useState([]);
    const [periodsLoading, setPeriodsLoading] = useState(false);
    const [selectedPeriodId, setSelectedPeriodId] = useState('');

    // Fee structures for the selected period
    const [allClasses, setAllClasses] = useState([]);
    const [structures, setStructures] = useState([]);
    const [structuresLoading, setStructuresLoading] = useState(false);
    const [selectedStructureId, setSelectedStructureId] = useState('');
    const [selectedClassId, setSelectedClassId] = useState('');

    // Students — server-side paginated via getOutstandingFees.
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [profileMap, setProfileMap] = useState(new Map());

    // Pagination
    const PAGE_SIZE_OPTIONS = [10, 25, 50];
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // FIX (requested — bug: "students selected 1 but sends to all 19"):
    // the TRUE scope of who gets notified, completely independent of the
    // search box and pagination above. This is what actually drives the
    // confirm-send modal's numbers — see the effect below.
    const [trueOverdueTotal, setTrueOverdueTotal] = useState({ count: 0, dueAmount: 0 });
    const [trueTotalLoading, setTrueTotalLoading] = useState(false);

    // Send notification modal
    const [modalOpen, setModalOpen] = useState(false);
    const [sending, setSending] = useState(false);

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

    // Fetch fee periods for the school's current academic year, then keep
    // only OPEN periods whose due date has already passed.
    useEffect(() => {
        if (!academicYearId) return;
        setSelectedPeriodId('');
        (async () => {
            setPeriodsLoading(true);
            try {
                const data = await getFeePeriods(academicYearId);
                const overdue = (Array.isArray(data) ? data : []).filter(isOpenOverduePeriod);
                setPeriods(overdue);
            } catch (err) {
                toast.error('Failed to load fee periods', err.message);
                setPeriods([]);
            } finally {
                setPeriodsLoading(false);
            }
        })();
    }, [academicYearId]);

    // Once a period is picked, fetch ALL its fee structures.
    useEffect(() => {
        setSelectedStructureId('');
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

    // Reset the class selection whenever the structure changes.
    useEffect(() => {
        setSelectedClassId('');
    }, [selectedStructureId]);

    // Fetch full student profiles for the selected class.
    useEffect(() => {
        setProfileMap(new Map());
        if (!selectedClassId) return;
        (async () => {
            try {
                const data = await getStudentByClass(selectedClassId);
                const list = Array.isArray(data) ? data : (data?.data || []);
                const map = new Map();
                list.forEach((p) => {
                    const id = p.id ?? p.studentId;
                    if (id != null) map.set(String(id), p);
                });
                setProfileMap(map);
            } catch (err) {
                toast.error('Failed to load student profiles', err.message);
            }
        })();
    }, [selectedClassId]);

    const selectedPeriod = periods.find((p) => String(p.id) === selectedPeriodId);

    const structureOptions = useMemo(
        () => structures.map((s) => ({ value: String(s.id), label: buildStructureLabel(s) })),
        [structures]
    );

    const selectedStructure = structures.find((s) => String(s.id) === selectedStructureId);

    const classOptions = useMemo(() => {
        if (!selectedStructure) return [];
        return normalizeStructureClasses(selectedStructure).map((c) => ({
            value: String(c.id),
            label: c.name || allClasses.find((ac) => String(ac.id) === String(c.id))?.name || `Class ${c.id}`,
        }));
    }, [selectedStructure, allClasses]);

    const selectedClass = classOptions.find((c) => c.value === selectedClassId);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setCurrentPage(0);
    }, [selectedPeriodId, selectedStructureId, selectedClassId, pageSize, debouncedSearch]);

    // Fetch the current page of overdue students — respects search +
    // pagination. This is ONLY for what's displayed on screen; it must
    // never be used to decide what actually gets notified — see
    // trueOverdueTotal below for that.
    useEffect(() => {
        if (!selectedPeriodId || !selectedStructureId || !selectedClassId) {
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
                    structureId: selectedStructureId,
                    status: 'OVERDUE',
                    search: debouncedSearch || undefined,
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
    }, [selectedPeriodId, selectedStructureId, selectedClassId, currentPage, pageSize, debouncedSearch]);

    // FIX (requested — bug: "students selected 1 but sends to all 19"): the
    // actual notification send only ever passes classId+periodId(+
    // structureId) to the backend — it completely ignores the search box
    // and the current page (see handleConfirmSend below). So the confirm
    // modal's numbers must come from a SEPARATE, unsearched, unpaginated
    // fetch of the whole overdue scope — not from `students`/`totalElements`
    // above, which reflect only what's currently displayed. This effect
    // intentionally does NOT depend on `debouncedSearch`, `currentPage`, or
    // `pageSize` — only on the actual notification scope (class/period/
    // structure) — so typing into search or changing pages never changes
    // what this shows.
    //
    // `size: 2000` is a practical cap to pull the whole overdue list for a
    // single class in one request rather than paginating just to sum it —
    // a single class realistically won't exceed that. If a class ever
    // could, swap this for a backend aggregate endpoint (total count +
    // total due) instead of summing client-side.
    useEffect(() => {
        if (!selectedPeriodId || !selectedStructureId || !selectedClassId) {
            setTrueOverdueTotal({ count: 0, dueAmount: 0 });
            return;
        }
        let cancelled = false;
        (async () => {
            setTrueTotalLoading(true);
            try {
                const { records, pagination } = await getOutstandingFees({
                    classId: selectedClassId,
                    periodId: selectedPeriodId,
                    structureId: selectedStructureId,
                    status: 'OVERDUE',
                    page: 0,
                    size: 2000,
                });
                if (cancelled) return;
                setTrueOverdueTotal({
                    count: pagination?.totalElements ?? records.length,
                    dueAmount: sumDueAmount(records),
                });
            } catch (err) {
                if (!cancelled) {
                    toast.error('Failed to compute total overdue count', err.message);
                    setTrueOverdueTotal({ count: 0, dueAmount: 0 });
                }
            } finally {
                if (!cancelled) setTrueTotalLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [selectedPeriodId, selectedStructureId, selectedClassId]);

    const filteredStudents = useMemo(
        () => students.map((r) => mergeStudentRecord(r, profileMap.get(String(r.studentId ?? r.id)))),
        [students, profileMap]
    );

    const handleConfirmSend = async () => {
        setSending(true);
        try {
            // Note: this deliberately never includes `search` — the send has
            // always covered the full scope regardless of what's typed in
            // the search box, which is exactly the behavior the confirm
            // modal now accurately reflects via trueOverdueTotal.
            const result = await sendOverdueFeeNotifications({
                classId: selectedClassId,
                periodId: selectedPeriodId,
                structureId: selectedStructureId,
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

                {/* FIX (requested): read-only label sourced from UserContext's
                    currentAcademicYear — no dropdown, no separate API call.
                    The page is always scoped to the school's actual current
                    academic year. */}
                <div className="w-full sm:w-auto">
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Academic Year</label>
                    <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-700 font-semibold inline-flex items-center gap-2 w-full sm:w-auto">
                        <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                        {academicYearId ? (academicYearLabel || `Year #${academicYearId}`) : 'Loading…'}
                    </div>
                </div>
            </div>

            {/* Info banner */}
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-sm text-blue-700">
                <Info size={15} className="flex-shrink-0 mt-0.5 text-blue-500" />
                <span>Only open fee periods whose due date has already passed are shown below. Each period can have multiple fee structures — pick the exact structure so amounts and class lists stay accurate.</span>
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

                {!academicYearId ? (
                    <div className="flex items-center justify-center py-14">
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                            Waiting for academic year…
                        </div>
                    </div>
                ) : periodsLoading ? (
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
                        <div className="text-xs text-gray-400 mt-1">Nothing is currently past its due date for {academicYearLabel || 'this academic year'}.</div>
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

            {/* Fee Structure + Class filters — structure narrows the class list */}
            {selectedPeriodId && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                                <Layers size={12} className="text-gray-400" />
                                Fee Structure <span className="text-red-500">*</span>
                            </label>
                            {structuresLoading ? (
                                <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">Loading structures…</div>
                            ) : structureOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                                    No fee structures for this period
                                </div>
                            ) : (
                                <Select
                                    value={selectedStructureId}
                                    onChange={setSelectedStructureId}
                                    options={structureOptions}
                                    placeholder="Select a fee structure"
                                />
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                Class <span className="text-red-500">*</span>
                            </label>
                            {!selectedStructureId ? (
                                <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                                    Select a fee structure first
                                </div>
                            ) : classOptions.length === 0 ? (
                                <div className="px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
                                    No classes attached to this structure
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
                </div>
            )}

            {/* Students table */}
            {selectedPeriodId && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-3 px-4 sm:px-5 py-4 border-b border-gray-100">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <span className="w-1 h-4 rounded-full bg-[#2563EB] inline-block" />
                            Students with Pending Fees
                            {totalElements > 0 && (
                                <span className="ml-1 px-2 py-0.5 bg-blue-50 text-blue-600 text-[11px] font-bold rounded-full border border-blue-100">
                  {totalElements}
                </span>
                            )}
                        </h2>

                        {selectedClassId && (
                            <div>
                                <div className="relative w-full sm:w-72">
                                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search by name, roll no. or admission no."
                                        className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-all w-full text-left"
                                    />
                                </div>
                                {/* FIX (requested): explicit reminder that search only
                                    narrows this table's view — it never narrows who
                                    actually gets notified. */}
                                {debouncedSearch && (
                                    <p className="text-[11px] text-gray-400 mt-1.5">
                                        Search only filters this table — the reminder still goes to all {trueOverdueTotal.count} overdue student(s) in this class/period.
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {!selectedStructureId ? (
                        <div className="text-center py-16 px-4">
                            <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                <Layers size={20} className="text-gray-400" />
                            </div>
                            <div className="text-sm font-semibold text-gray-500">Select a fee structure</div>
                            <div className="text-xs text-gray-400 mt-1">Pick the exact fee structure for this period first.</div>
                        </div>
                    ) : !selectedClassId ? (
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
                            <div className="text-xs text-gray-400 mt-1">Everyone in this class has cleared dues for this period and structure.</div>
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
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 py-3 text-gray-500">
                        <span className="inline-flex items-center gap-1">

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
                        <PaginationBar
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            pageSize={pageSize}
                            pageSizeOptions={PAGE_SIZE_OPTIONS}
                            onPageChange={setCurrentPage}
                            onPageSizeChange={setPageSize}
                        />
                    )}

                    {filteredStudents.length > 0 && (
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-t border-gray-100">
                            <p className="text-xs text-gray-500">
                                <span className="font-semibold text-gray-700">{filteredStudents.length}</span> student(s) on this page
                                <span className="ml-2 text-gray-400">
                                    · reminder covers all {trueTotalLoading ? '…' : trueOverdueTotal.count} overdue student(s) in this class
                                </span>
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
                loadingTotals={trueTotalLoading}
                className={selectedClass?.label || '—'}
                periodName={selectedPeriod?.name || '—'}
                structureName={selectedStructure ? buildStructureLabel(selectedStructure) : ''}
                studentCount={trueOverdueTotal.count}
                totalDue={trueOverdueTotal.dueAmount}
            />
        </div>
    );
};

export default OverdueFeeNotifications;