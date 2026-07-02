import { useState, useEffect, useRef } from 'react';
import { X, ClipboardEdit, FileText, Search, ChevronDown, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { getUsersSummary } from '../../Api/StaffManagement/UserManagementAPI';
import { requestManualAttendance } from '../../Api/Attendance/AttendanceApi';
import { getSchoolLocation } from "../../utils/getSchoolLocation";
import {
    REMARKS_MAX,
    DASH_PLACEHOLDER,
    TOAST_SELECT_STAFF, TOAST_RESOLVE_USER_ID, TOAST_RESOLVE_USER_ROLE,
    TOAST_ENTER_REMARKS, TOAST_REMARKS_EXCEED,
    TOAST_SUBMIT_SUCCESS, TOAST_SUBMIT_FAILED,
    UI_STRINGS
} from "../../Constants/StringConstants/AttendanceConstants";

const TODAY = new Date().toISOString().split('T')[0];

const resolveStaff = (raw) => {
    const userId = raw.userId ?? raw.id ?? raw.user_id ?? raw.staffId ?? raw.empId ?? null;
    const rolesArray = Array.isArray(raw.roles) ? raw.roles : Array.isArray(raw.userRoles) ? raw.userRoles : null;
    const userType = raw.userType ?? raw.role ?? raw.userRole ?? raw.roleName ?? raw.type ?? raw.designation ?? raw.position ?? (rolesArray && rolesArray.length > 0 ? rolesArray[0] : null);
    const firstName = raw.firstName ?? raw.first_name ?? '';
    const lastName = raw.lastName ?? raw.last_name ?? '';
    const fullName = `${firstName} ${lastName}`.trim();
    const userName = (raw.userName ?? raw.name ?? raw.fullName ?? raw.full_name ?? fullName) || `User #${userId}`;
    return { userId, userType, userName };
};

const getDisplayName = (raw) => {
    if (raw.userName) return raw.userName;
    if (raw.name) return raw.name;
    if (raw.fullName) return raw.fullName;
    const fn = raw.firstName ?? raw.first_name ?? '';
    const ln = raw.lastName ?? raw.last_name ?? '';
    return `${fn} ${ln}`.trim() || `User #${raw.userId ?? raw.id}`;
};

const getDisplayRole = (raw) => {
    if (raw.userType) return raw.userType;
    if (raw.role) return raw.role;
    if (raw.userRole) return raw.userRole;
    if (raw.roleName) return raw.roleName;
    if (raw.type) return raw.type;
    if (raw.designation) return raw.designation;
    if (raw.position) return raw.position;
    const arr = Array.isArray(raw.roles) ? raw.roles : Array.isArray(raw.userRoles) ? raw.userRoles : null;
    if (arr && arr.length > 0) return arr[0];
    return DASH_PLACEHOLDER;
};

const ManualStaffAttendance = ({ onClose, onSuccess }) => {
    const [staffList, setStaffList] = useState([]);
    const [staffLoading, setStaffLoading] = useState(false);
    const [staffSearch, setStaffSearch] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [selectedStaff, setSelectedStaff] = useState(null);
    const [attendanceDate, setAttendanceDate] = useState(TODAY);
    const [checkInTime, setCheckInTime] = useState('09:00');
    const [remarks, setRemarks] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchStaff = async () => {
            setStaffLoading(true);
            try {
                const data = await getUsersSummary({ search: staffSearch, size: 200 });
                const list =
                    Array.isArray(data) ? data :
                        Array.isArray(data?.content) ? data.content :
                            Array.isArray(data?.data) ? data.data :
                                Array.isArray(data?.users) ? data.users :
                                    Array.isArray(data?.result) ? data.result :
                                        Array.isArray(data?.results) ? data.results : [];
                setStaffList(list);
            } catch (err) {
                setStaffList([]);
            } finally {
                setStaffLoading(false);
            }
        };
        fetchStaff();
    }, [staffSearch]);

    useEffect(() => {
        const handler = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleSelectStaff = (raw) => {
        const resolved = resolveStaff(raw);
        setSelectedStaff(resolved);
        setDropdownOpen(false);
        setStaffSearch('');
    };

    const handleSubmit = async () => {
        const { gpsLatitude, gpsLongitude } = getSchoolLocation();
        if (!selectedStaff) { toast.error(TOAST_SELECT_STAFF); return; }
        if (!selectedStaff.userId) { toast.error(TOAST_RESOLVE_USER_ID); return; }
        if (!selectedStaff.userType) { toast.error(TOAST_RESOLVE_USER_ROLE); return; }
        if (!remarks.trim()) { toast.error(TOAST_ENTER_REMARKS); return; }
        if (remarks.trim().length > REMARKS_MAX) { toast.error(TOAST_REMARKS_EXCEED(REMARKS_MAX)); return; }

        setSubmitting(true);
        try {
            await requestManualAttendance({
                userId: selectedStaff.userId,
                userType: selectedStaff.userType,
                userName: selectedStaff.userName,
                gpsLatitude: parseFloat(gpsLatitude),
                gpsLongitude: parseFloat(gpsLongitude),
                remarks: remarks.trim(),
            });
            toast.success(TOAST_SUBMIT_SUCCESS);
            onSuccess?.();
            onClose();
        } catch (err) {
            toast.error(err.message || TOAST_SUBMIT_FAILED);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2">
                        <ClipboardEdit className="w-5 h-5 text-amber-500" />
                        <h3 className="text-base font-bold text-gray-900">{UI_STRINGS.MANUAL_STAFF.HEADER}</h3>
                    </div>
                    <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 px-6 py-4 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                            {UI_STRINGS.MANUAL_STAFF.STAFF_MEMBER} <span className="text-red-500">*</span>
                        </label>
                        <div className="relative" ref={dropdownRef}>
                            <button type="button" onClick={() => setDropdownOpen(prev => !prev)}
                                className="w-full flex items-center justify-between px-4 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all hover:border-amber-400">
                                {selectedStaff ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold shrink-0">
                                            {selectedStaff.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="font-semibold text-gray-900 truncate">{selectedStaff.userName}</span>
                                        <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                                            {selectedStaff.userType}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-gray-400">{UI_STRINGS.MANUAL_STAFF.SELECT_STAFF}</span>
                                )}
                                <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {dropdownOpen && (
                                <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                                    <div className="p-2 border-b border-gray-100">
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" value={staffSearch}
                                                onChange={(e) => setStaffSearch(e.target.value)}
                                                placeholder={UI_STRINGS.MANUAL_STAFF.SEARCH_NAME} autoFocus
                                                className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 bg-gray-50"
                                            />
                                        </div>
                                    </div>
                                    <div className="max-h-52 overflow-y-auto">
                                        {staffLoading ? (
                                            <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span className="text-sm">{UI_STRINGS.MANUAL_STAFF.LOADING_STAFF}</span>
                                            </div>
                                        ) : staffList.length === 0 ? (
                                            <div className="py-6 text-center text-sm text-gray-400">{UI_STRINGS.MANUAL_STAFF.NO_STAFF}</div>
                                        ) : (
                                            staffList.map((staff, idx) => {
                                                const name = getDisplayName(staff);
                                                const role = getDisplayRole(staff);
                                                const id = staff.userId ?? staff.id ?? idx;
                                                return (
                                                    <button key={id} type="button" onClick={() => handleSelectStaff(staff)}
                                                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-amber-50 transition-colors text-left group">
                                                        <div className="w-8 h-8 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 text-sm font-bold shrink-0 transition-colors">
                                                            {name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                                            <p className="text-xs text-gray-400">{UI_STRINGS.COMMON.ID_LABEL} {id}</p>
                                                        </div>
                                                        <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                                                            {role}
                                                        </span>
                                                    </button>
                                                );
                                            })
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                {UI_STRINGS.MANUAL_STAFF.ATTENDANCE_DATE} <span className="text-red-500">*</span>
                            </label>
                            <input type="date" value={attendanceDate} max={TODAY}
                                onChange={(e) => setAttendanceDate(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                                {UI_STRINGS.MANUAL_STAFF.CHECK_IN_TIME}
                            </label>
                            <input type="time" value={checkInTime}
                                onChange={(e) => setCheckInTime(e.target.value)}
                                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-1.5">
                            {UI_STRINGS.MANUAL_STAFF.REASON_REMARKS} <span className="text-red-500">*</span>
                        </label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value.slice(0, REMARKS_MAX))} rows={3} maxLength={REMARKS_MAX}
                            placeholder="e.g. Face recognition device unavailable..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all resize-none"
                        />
                        <div className="mt-2 flex items-center justify-between">
                            <div className={`text-xs ${remarks.trim().length > REMARKS_MAX ? 'text-red-600' : 'text-gray-500'}`}>{remarks.trim().length}/{REMARKS_MAX} {UI_STRINGS.MANUAL_STAFF.CHARACTERS}</div>
                            {remarks.trim().length > REMARKS_MAX && (
                                <div className="text-xs text-red-600">{UI_STRINGS.MANUAL_STAFF.REMARKS_EXCEED}</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 shrink-0">
                    <button onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all">
                        {UI_STRINGS.COMMON.CANCEL}
                    </button>
                    <button onClick={handleSubmit} disabled={submitting || remarks.trim().length > REMARKS_MAX}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 rounded-xl text-sm font-semibold text-white transition-all">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                        {submitting ? UI_STRINGS.MANUAL_STAFF.BTN_SUBMITTING : UI_STRINGS.MANUAL_STAFF.BTN_SUBMIT}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualStaffAttendance;