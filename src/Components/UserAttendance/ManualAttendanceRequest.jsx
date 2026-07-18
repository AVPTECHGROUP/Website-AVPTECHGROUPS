import React, { useEffect, useRef, useState } from 'react'
import { TriangleAlert, Search, ChevronDown, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { getUsersSummary } from "../../Api/StaffManagement/UserManagementAPI";
import { requestManualAttendance } from '../../Api/Attendance/AttendanceApi';
import { toast } from 'react-toastify';
import { ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';
const TODAY = new Date().toISOString().split('T')[0];

/* ─── Field resolvers (same as ManualStaffAttendance) ─── */
const resolveStaff = (raw) => {
  const userId =
    raw.userId ?? raw.id ?? raw.user_id ??
    raw.staffId ?? raw.empId ?? null;

  const rolesArray = Array.isArray(raw.roles) ? raw.roles
    : Array.isArray(raw.userRoles) ? raw.userRoles
      : null;

  const userType =
    raw.userType ?? raw.role ?? raw.userRole ?? raw.roleName ??
    raw.type ?? raw.designation ?? raw.position ??
    (rolesArray && rolesArray.length > 0 ? rolesArray[0] : null);

  const firstName = raw.firstName ?? raw.first_name ?? '';
  const lastName = raw.lastName ?? raw.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  const userName =
    (raw.userName ?? raw.name ?? raw.fullName ??
      raw.full_name ?? fullName) || `User #${userId}`;

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
  return '—';
};

/* ─────────────────────────────────────────────────────── */

const ManualAttendance = () => {
  const navigate = useNavigate();

  /* Staff search dropdown */
  const [staffList, setStaffList] = useState([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [staffSearch, setStaffSearch] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const dropdownRef = useRef(null);

  /* Form fields */
  const [attendanceDate, setAttendanceDate] = useState(TODAY);
  const getCurrentTime = () => {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    return `${hours}:${minutes}`;
  };

  const [checkInTime, setCheckInTime] = useState(getCurrentTime());
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /* GPS */
  const [gps, setGps] = useState({ latitude: null, longitude: null });

  const MAX_WORDS = 100;

  const countChars = (text) => text.length;

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setGps({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setGps({ latitude: 0, longitude: 0 })
    );
  }, []);

  /* Fetch staff list */
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
                    Array.isArray(data?.results) ? data.results :
                      [];
        setStaffList(list);
      } catch {
        setStaffList([]);
      } finally {
        setStaffLoading(false);
      }
    };
    fetchStaff();
  }, [staffSearch]);

  /* Close dropdown on outside click */
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
    setSelectedStaff(resolveStaff(raw));
    setDropdownOpen(false);
    setStaffSearch('');
  };

  const handleSubmit = async () => {
    if (reason.trim().length > 500) {
      toast.error('Reason cannot exceed 500 characters');
      return;
    }

    if (!selectedStaff) { toast.error('Please select a staff member'); return; }
    if (!selectedStaff.userId) { toast.error('Could not resolve User ID'); return; }
    if (!selectedStaff.userType) { toast.error('Could not resolve User Role'); return; }
    if (!reason.trim()) { toast.error('Please enter a reason / remarks'); return; }

    try {
      setSubmitting(true);
      await requestManualAttendance({
        userId: selectedStaff.userId,
        userType: selectedStaff.userType,
        userName: selectedStaff.userName,
        remarks: reason.trim(),
        attendanceDate,
        checkInTime,
        gpsLatitude: gps.latitude ?? 0,
        gpsLongitude: gps.longitude ?? 0,
      });
      toast.success('Request Submitted');

      navigate(ROUTE_PATHS.ATTENDANCE_MARK_USER);

    } catch (error) {
      toast.error(error.message || 'Failed to submit manual attendance');
    } finally {
      boxSubmitting(false);
    }
  };

  const isValid = selectedStaff && reason.trim();

  return (
    <div className='flex h-screen overflow-hidden'>
      <div className='flex-1 flex w-full overflow-hidden flex-col'>
        <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-auto'>
          <div className='bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-4xl p-4 sm:p-6 lg:p-8 my-auto'>

            {/* Header */}
            <div className='flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 flex-col justify-center text-center'>
              <div className='flex items-center gap-2 sm:gap-3'>
                <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 flex items-center justify-center'>
                  <TriangleAlert fill='#e0b21c' color='#fef9c2' size={28} className='sm:w-8.75 sm:h-8.75' />
                </div>
                <h2 className='text-lg sm:text-xl lg:text-2xl text-[#ca9e0e] font-bold'>Verification Failed</h2>
              </div>
              <p className='text-xl sm:text-2xl lg:text-3xl font-bold'>Manual Attendance Request</p>
              <p className='text-xs sm:text-sm lg:text-base text-gray-500 max-w-2xl px-2'>
                The automated face verification was unsuccessful. Please verify the details and submit a manual request.
              </p>
            </div>

            <hr className="border-gray-100 mb-4 sm:mb-5" />

            {/* Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-y-5 sm:gap-x-4 mb-4 sm:mb-6">

              {/* Staff Searchable Dropdown — spans full width */}
              <div className='sm:col-span-2' ref={dropdownRef}>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  Staff Member <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(prev => !prev)}
                    className="w-full flex items-center justify-between px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    {selectedStaff ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold shrink-0">
                          {selectedStaff.userName.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-900 truncate">{selectedStaff.userName}</span>
                        <span className="shrink-0 px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">
                          {selectedStaff.userType}
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">— Select staff member —</span>
                    )}
                    <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-400 shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown panel */}
                  {dropdownOpen && (
                    <div className="absolute z-50 mt-1.5 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {/* Search inside dropdown */}
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            value={staffSearch}
                            onChange={(e) => setStaffSearch(e.target.value)}
                            placeholder="Search by name..."
                            autoFocus
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                          />
                        </div>
                      </div>

                      {/* Staff list */}
                      <div className="max-h-52 overflow-y-auto">
                        {staffLoading ? (
                          <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Loading staff...</span>
                          </div>
                        ) : staffList.length === 0 ? (
                          <div className="py-6 text-center text-sm text-gray-400">No staff members found</div>
                        ) : (
                          staffList.map((staff, idx) => {
                            const name = getDisplayName(staff);
                            const role = getDisplayRole(staff);
                            const id = staff.userId ?? staff.id ?? idx;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => handleSelectStaff(staff)}
                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-blue-50 transition-colors text-left group"
                              >
                                <div className="w-8 h-8 rounded-full bg-blue-100 group-hover:bg-blue-200 flex items-center justify-center text-blue-700 text-sm font-bold shrink-0 transition-colors">
                                  {name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-800 truncate">{name}</p>
                                  <p className="text-xs text-gray-400">ID: {id}</p>
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

              {/* User ID — auto-filled read-only */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={selectedStaff?.userId ?? ''}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* User Role — auto-filled read-only */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  User Role
                </label>
                <input
                  type="text"
                  value={selectedStaff?.userType ?? ''}
                  readOnly
                  placeholder="Auto-filled"
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Attendance Date */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  Attendance Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={attendanceDate}
                  max={TODAY}
                  onChange={(e) => setAttendanceDate(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Check-In Time */}
              <div className='w-full'>
                <label className="block text-xs sm:text-sm font-semibold text-gray-600 uppercase mb-1.5 sm:mb-2">
                  Check-In Time
                </label>
                <input
                  type="time"
                  value={checkInTime}
                  onChange={(e) => setCheckInTime(e.target.value)}
                  className="w-full px-3 py-2 sm:py-2.5 text-sm sm:text-base border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <hr className="border-gray-100 mb-3 sm:mb-4" />

            {/* Reason */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2 sm:mb-3">
              <h3 className="text-sm sm:text-[14.5px] font-semibold text-gray-800">Reason for Manual Attendance</h3>
              <span className="text-[10px] sm:text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 px-2 sm:px-2.5 py-0.5 rounded-full w-fit">Required</span>
            </div>

            <textarea
              value={reason}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length <= 500) {
                  setReason(value);
                }
              }}
              placeholder="Describe the reason for face verification failure..."
              rows={4}
              className="w-full border border-gray-200 rounded-lg p-3 sm:p-3.5 text-xs sm:text-[13px] text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-gray-50"
            />
            <div className="flex justify-end mt-2">
              <span
                className={`text-xs font-medium ${reason.length > 450
                  ? 'text-orange-500'
                  : 'text-gray-400'
                  }`}
              >
                {reason.length}/500 characters
              </span>
            </div>

            <p className="text-[11px] sm:text-[12px] text-gray-400 italic mt-2 sm:mt-2.5 mb-4 sm:mb-6">
              Your request will be sent to the department head for approval.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2 sm:gap-3">
              <button
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto px-4 sm:px-5 py-2.5 text-xs sm:text-[13.5px] font-semibold text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || !isValid}
                className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 text-xs sm:text-[13.5px] font-semibold text-white rounded-lg transition-all flex items-center justify-center gap-2 ${submitting
                  ? 'bg-blue-400 cursor-not-allowed'
                  : isValid
                    ? 'bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg'
                    : 'bg-blue-300 cursor-not-allowed'
                  }`}
              >
                {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>

            {/* Privacy / Help Notice */}
            <div className='mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded-lg'>
              <div className='w-4 h-4 shrink-0 mt-0.5 sm:mt-0'>
                <svg viewBox="0 0 24 24" fill="currentColor" className='text-gray-400'>
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z" />
                </svg>
              </div>
              <div className='flex flex-col sm:flex-row gap-1 text-center sm:text-left'>
                <strong className='text-xs sm:text-sm'>Having trouble?</strong>
                <p className='text-blue-600 text-xs sm:text-sm cursor-pointer font-medium hover:underline'>Contact System Administrator</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualAttendance;