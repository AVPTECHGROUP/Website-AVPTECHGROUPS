import { useState, useEffect, useMemo } from 'react';
import { X, ClipboardEdit, FileText, Search, Loader2, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUsersSummary } from '../../Api/StaffManagement/UserManagementAPI';
import { requestManualAttendance } from '../../Api/Attendance/AttendanceApi';
import { getSchoolLocation } from "../../utils/getSchoolLocation";

const TODAY = new Date().toISOString().split('T')[0];
const REMARKS_MAX = 200;

/* Display helpers for raw list items */
const getDisplayName = (raw) => {
    if (raw.userName) return raw.userName;
    if (raw.name) return raw.name;
    if (raw.fullName) return raw.fullName;
    const fn = raw.firstName ?? raw.first_name ?? '';
    const ln = raw.lastName ?? raw.last_name ?? '';
    return `${fn} ${ln}`.trim() || `User #${raw.userId ?? raw.id}`;
};

const getDisplayRole = (raw) => {
    const rolesArray = Array.isArray(raw.roles) ? raw.roles
        : Array.isArray(raw.userRoles) ? raw.userRoles : null;
    return (
        raw.userType ?? raw.role ?? raw.userRole ?? raw.roleName ??
        raw.type ?? raw.designation ?? raw.position ??
        (rolesArray && rolesArray.length > 0 ? rolesArray[0] : null) ?? '—'
    );
};

const getUserId = (raw, idx) => raw.userId ?? raw.id ?? raw.user_id ?? raw.staffId ?? raw.empId ?? idx;

/* ─────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────── */
const ManualStaffAttendance = ({ onClose, onSuccess }) => {
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffSearch, setStaffSearch] = useState('');

    const [attendanceDate, setAttendanceDate] = useState(TODAY);

    // Map<userId, { userId, userType, userName, checkInTime, remarks }>
    const [selections, setSelections] = useState(new Map());
    const [submitting, setSubmitting] = useState(false);

    /* ── Fetch full staff list once ── */
    useEffect(() => {
        const fetchStaff = async () => {
            setStaffLoading(true);
            try {
                const data = await getUsersSummary({ size: 500 });
                const list =
                    Array.isArray(data) ? data :
                        Array.isArray(data?.content) ? data.content :
                            Array.isArray(data?.data) ? data.data :
                                Array.isArray(data?.users) ? data.users :
                                    Array.isArray(data?.result) ? data.result :
                                        Array.isArray(data?.results) ? data.results :
                                            [];
                setStaffList(list);
            } catch (err) {
                console.error('[BulkAttendance] Failed to fetch staff:', err);
                setStaffList([]);
            } finally {
                setStaffLoading(false);
            }
        };
        fetchStaff();
    }, []);

    /* ── Client-side search filter (selections persist regardless of filter) ── */
    const filteredStaff = useMemo(() => {
        if (!staffSearch.trim()) return staffList;
        const q = staffSearch.toLowerCase();
        return staffList.filter((s) => getDisplayName(s).toLowerCase().includes(q));
    }, [staffList, staffSearch]);

    /* ── Toggle selection ── */
    const toggleStaff = (raw, idx) => {
        const userId = getUserId(raw, idx);
        setSelections((prev) => {
            const next = new Map(prev);
            if (next.has(userId)) {
                next.delete(userId);
            } else {
                next.set(userId, {
                    userId,
                    userType: getDisplayRole(raw),
                    userName: getDisplayName(raw),
                    checkInTime: '09:00',
                    remarks: '',
                });
            }
            return next;
        });
    };

    const updateSelection = (userId, field, value) => {
        setSelections((prev) => {
            const next = new Map(prev);
            const entry = next.get(userId);
            if (!entry) return prev;
            next.set(userId, { ...entry, [field]: value });
            return next;
        });
    };

    const selectedCount = selections.size;

    /* ── Validation: every selected entry must have checkInTime + remarks ── */
    const invalidSelections = useMemo(() => {
        const invalid = [];
        for (const entry of selections.values()) {
            if (!entry.checkInTime || !entry.remarks.trim() || entry.remarks.trim().length > REMARKS_MAX) {
                invalid.push(entry.userId);
            }
        }
        return invalid;
    }, [selections]);

    /* ── Submit (bulk) ── */
    const handleSubmit = async () => {
        if (selectedCount === 0) {
            toast.error('Please select at least one staff member');
            return;
        }
        if (invalidSelections.length > 0) {
            toast.error('Fill check-in time & remarks (within 200 chars) for all selected staff');
            return;
        }

        const payload = {
            attendanceDate,
            staff: Array.from(selections.values()).map((s) => ({
                userId: s.userId,
                userType: s.userType,
                status: 'PRESENT',
                checkInTime: s.checkInTime,
                remarks: s.remarks.trim(),
            })),
        };

        setSubmitting(true);
        try {
            const res = await bulkManualStaffAttendance(payload);
            const summary = res?.data;
            if (summary) {
                toast.success(
                    `Marked: ${summary.totalMarked} | Already Marked: ${summary.totalAlreadyMarked} | Failed: ${summary.totalFailed}`
                );
            } else {
                toast.success('Bulk attendance submitted!');
            }
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || 'Bulk submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardEdit className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-900">Bulk Manual Attendance</h3>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Top bar: shared date + search */}
                <div className="px-6 py-4 border-b border-gray-100 shrink-0 space-y-3">
                    <div className="flex items-center gap-3">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide shrink-0">
                            Attendance Date <span className="text-red-500">*</span>
                        </label>
                        <input type="date" value={attendanceDate} max={TODAY}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                        />
                        <span className="ml-auto text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-md">
                            {selectedCount} selected
                        </span>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            placeholder="Search staff by name..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                        />
                    </div>
                </div>

                {/* Staff list */}
                <div className="overflow-y-auto flex-1 px-6 py-3 space-y-2">
                    {staffLoading ? (
                        <div className="flex items-center justify-center py-10 gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading staff...</span>
                        </div>
                    ) : filteredStaff.length === 0 ? (
                        <div className="py-10 text-center text-sm text-gray-400">No staff members found</div>
                    ) : (
                        filteredStaff.map((raw, idx) => {
                            const userId = getUserId(raw, idx);
                            const name = getDisplayName(raw);
                            const role = getDisplayRole(raw);
                            const entry = selections.get(userId);
                            const isSelected = !!entry;
                            const isInvalid = isSelected && invalidSelections.includes(userId);

                            return (
                                <div key={userId}
                                    className={`border rounded-xl transition-all ${isSelected ? 'border-amber-300 bg-amber-50/40' : 'border-gray-200 bg-white'}`}>
                                    {/* Row */}
                                    <button type="button" onClick={() => toggleStaff(raw, idx)}
                                        className="w-full flex items-center gap-3 px-4 py-3 text-left">
                                        <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-all ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-gray-300'}`}>
                                            {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-sm font-bold shrink-0">
                                            {name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                            <p className="text-xs text-gray-400">ID: {userId}</p>
                                        </div>
                                        <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                                            {role}
                                        </span>
                                    </button>

                                    {/* Expanded fields when selected */}
                                    {isSelected && (
                                        <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-[140px_1fr] gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1">
                                                    Check-In Time <span className="text-red-500">*</span>
                                                </label>
                                                <input type="time" value={entry.checkInTime}
                                                    onChange={(e) => updateSelection(userId, 'checkInTime', e.target.value)}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wide mb-1">
                                                    Remarks <span className="text-red-500">*</span>
                                                </label>
                                                <input type="text" value={entry.remarks}
                                                    maxLength={REMARKS_MAX}
                                                    onChange={(e) => updateSelection(userId, 'remarks', e.target.value)}
                                                    placeholder="e.g. Face recognition device unavailable..."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                                                />
                                            </div>
                                            {isInvalid && (
                                                <div className="sm:col-span-2 text-xs text-red-600">
                                                    Check-in time & remarks required (max {REMARKS_MAX} chars)
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Footer */}
                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
                        Cancel
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || selectedCount === 0}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-all">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {submitting ? 'Submitting...' : `Submit ${selectedCount > 0 ? `(${selectedCount})` : ''}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualStaffAttendance;