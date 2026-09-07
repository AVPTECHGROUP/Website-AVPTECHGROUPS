import {
  FilterIcon, Calendar, CalendarCheck2Icon,
  Users, Clock, LogOut, ClipboardCheck, Download, Search, ScanFace, ClipboardEdit, UserX, UserCheck2,
  FileSpreadsheet,
} from 'lucide-react';
import CardLoader from '../../Components/CommonComp/CardLoader';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { toast } from 'react-toastify';
import ManualStaffAttendance from './ManualStaffAttendance';
import MonthlyStaffAttendanceSheetModal from './MonthlyStaffAttendanceSheetModal';

import {
  allAttendanceDetails,
  attendanceStatistics,
} from '../../Api/Attendance/AttendanceApi';
import { getRolesSummary } from '../../Api/StaffManagement/UserManagementAPI';

import {
  ATTENDANCE_TABS as TABS,
  ATTENDANCE_STATUS_OPTIONS as STATUS_OPTIONS,
  AVATAR_COLORS,
  STATUS_BADGE_CLASS_MAP, STATUS_BADGE_DEFAULT_CLASS,
  STATUS_LABEL_MAP,
  SOURCE_MANUAL, SOURCE_MANUAL_LABEL, SOURCE_FACE_LABEL, SOURCE_EMPTY_PLACEHOLDER,
  CSV_HEADERS, CSV_DEFAULT_FILENAME, TOAST_NO_DATA_TO_EXPORT, TOAST_CSV_EXPORT_SUCCESS,
  UI_STRINGS
} from "../../Constants/StringConstants/AttendanceConstants";

const TODAY = new Date().toISOString().split('T')[0];

const getAvatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

const getStatusBadge = (status) => {
  return STATUS_BADGE_CLASS_MAP[status] || STATUS_BADGE_DEFAULT_CLASS;
};

const getStatusLabel = (status) => {
  return STATUS_LABEL_MAP[status] || status;
};

const getSourceBadge = (source) => {
  if (!source) return <span className="text-xs text-gray-400">{SOURCE_EMPTY_PLACEHOLDER}</span>;
  if (source === SOURCE_MANUAL) return <span className="inline-flex items-center gap-1 text-xs text-orange-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />{SOURCE_MANUAL_LABEL}</span>;
  return <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block" />{SOURCE_FACE_LABEL}</span>;
};

const exportToCSV = (data, filename = CSV_DEFAULT_FILENAME) => {
  if (!data || data.length === 0) { toast.info(TOAST_NO_DATA_TO_EXPORT); return; }
  const headers = CSV_HEADERS;
  const rows = data.map((item, idx) => [
    idx + 1,
    item.userName || '',
    item.userId || '',
    item.userType || '',
    item.attendanceDate || '',
    item.checkInTime || '',
    item.attendanceSource || '',
    getStatusLabel(item.status),
  ]);
  const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  toast.success(TOAST_CSV_EXPORT_SUCCESS);
};

const Attendance = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [attendanceList, setAttendanceList] = useState([]);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [pagination, setPagination] = useState(null);
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [manualMarkOpen, setManualMarkOpen] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const debounceRef = useRef(null);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatTimeToIST = (timeString) => {
    return timeString || '—';
  };

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getRolesSummary();
        const formattedRoles =
          response?.data
            ?.filter((role) => role.name !== "GLOBAL_ADMIN")
            ?.map((role) => ({
              id: role.id,
              value: role.name,
              label: role.displayName,
            })) || [];
        setRoles(formattedRoles);
      } catch (err) {
        console.error("Failed to fetch roles:", err);
        setRoles([]);
      }
    };
    fetchRoles();
  }, []);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchStats = async () => {
      try {
        setStatsLoading(true);
        const data = await attendanceStatistics(selectedDate);
        setStats(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, [selectedDate]);

  const fetchList = useCallback(async (params) => {
    try {
      setListLoading(true);
      const res = await allAttendanceDetails(params);
      setAttendanceList(res?.data || []);
      setPagination(res?.pagination || null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchList({
        attendanceDate: selectedDate,
        role: selectedRole !== 'ALL' ? selectedRole : undefined,
        status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
        userName: searchQuery.trim() || undefined,
        page,
        size,
      });
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [selectedDate, selectedRole, selectedStatus, searchQuery, page, size, fetchList]);

  const handleTabClick = (tabId) => {
    if (tabId === 'pendingApprovals') navigate('/attendance/usersAttendance');
  };

  const handleReset = () => {
    setSelectedRole('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
    setPage(0);
  };

  const handleManualSuccess = () => {
    fetchList({
      attendanceDate: selectedDate,
      role: selectedRole !== 'ALL' ? selectedRole : undefined,
      status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
      userName: searchQuery.trim() || undefined,
      page,
      size,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(attendanceList, `attendance_${selectedDate}.csv`);
  };

  const startRow = pagination ? page * size + 1 : 0;
  const endRow = pagination ? Math.min((page + 1) * size, pagination.totalElements) : 0;

  const statCards = [
    { icon: Users, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_TOTAL_STAFF, val: stats?.totalStaff ?? 0, sub: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_TOTAL_REG, subColor: 'text-gray-400', iconTx: 'text-blue-600', iconBg: 'bg-blue-100' },
    { icon: UserCheck2, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_PRESENT, val: stats?.totalPresent ?? 0, sub: `${Number(stats?.attendancePercentage ?? 0).toFixed(1)}${UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_ATT_PCT}`, subColor: 'text-green-600 font-semibold', iconTx: 'text-green-600', iconBg: 'bg-green-100' },
    { icon: Clock, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_LATE, val: stats?.totalLate ?? 0, sub: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_LATE_SUB, subColor: 'text-orange-500 font-semibold', iconTx: 'text-orange-500', iconBg: 'bg-orange-100' },
    { icon: UserX, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_ABSENT, val: stats?.totalAbsent ?? 0, sub: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_ABSENT_SUB, subColor: 'text-gray-400', iconTx: 'text-red-500', iconBg: 'bg-red-100' },
    { icon: LogOut, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_LEAVE, val: stats?.totalOnLeave ?? 0, sub: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_LEAVE_SUB, subColor: 'text-gray-400', iconTx: 'text-purple-600', iconBg: 'bg-purple-100' },
    { icon: ClipboardCheck, label: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_PENDING, val: stats?.totalPendingApproval ?? 0, sub: UI_STRINGS.ATTENDANCE_OVERVIEW.STAT_PENDING_SUB, subColor: 'text-yellow-600 font-semibold', iconTx: 'text-yellow-600', iconBg: 'bg-yellow-100' },
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {manualMarkOpen && (
        <ManualStaffAttendance
          onClose={() => setManualMarkOpen(false)}
          onSuccess={handleManualSuccess}
        />
      )}

      {/* ── Monthly Staff Attendance Sheet Modal ── */}
      <MonthlyStaffAttendanceSheetModal
        isOpen={showMonthlyModal}
        onClose={() => setShowMonthlyModal(false)}
        roles={roles}
      />

      <div className="flex-1 flex flex-col overflow-hidden w-0">
        <div className="flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{UI_STRINGS.ATTENDANCE_OVERVIEW.HEADER}</h2>
              <p className="text-gray-500 mt-1 text-xs sm:text-sm font-medium">
                {UI_STRINGS.ATTENDANCE_OVERVIEW.SUBTITLE}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
              <input
                type="date" value={selectedDate} max={TODAY}
                onChange={(e) => { setSelectedDate(e.target.value); setPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-xl bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium transition-all"
              />
              <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-xl text-xs sm:text-sm font-semibold text-blue-700 shadow-sm whitespace-nowrap">
                <span className="hidden lg:inline">{formatDate(selectedDate)}</span>
                <span className="lg:hidden">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <div className="grid grid-cols-2 gap-2 sm:hidden">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const active = tab.id === 'attendanceOverview';
                return (
                  <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all border
                      ${active ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white text-gray-500 border-gray-200 hover:border-blue-300 hover:text-blue-600'}`}>
                    <Icon className="w-4 h-4 shrink-0" /><span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="hidden sm:block">
              <div className="flex gap-1 border-b border-gray-200">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const active = tab.id === 'attendanceOverview';
                  return (
                    <button key={tab.id} onClick={() => handleTabClick(tab.id)}
                      className={`inline-flex items-center cursor-pointer gap-2 px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                        ${active ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                      <Icon className="w-5 h-5 shrink-0" />{tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4 mb-5">
            {statsLoading
              ? statCards.map((_, i) => <CardLoader key={i} />)
              : statCards.map((card) => (
                <div key={card.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-2.5 hover:shadow-md transition-shadow">
                  <div className={`w-9 h-9 rounded-xl ${card.iconBg} flex items-center justify-center shrink-0`}>
                    <card.icon className={`w-5 h-5 ${card.iconTx}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 leading-tight">{card.val}</p>
                    <p className="text-xs font-semibold text-gray-600 mt-0.5">{card.label}</p>
                    <p className={`text-xs mt-0.5 ${card.subColor}`}>{card.sub}</p>
                  </div>
                </div>
              ))}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <button onClick={() => navigate('/attendance/markUserAttendance')}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer">
                <ScanFace className="w-4 h-4" />
                <span className="hidden sm:inline">{UI_STRINGS.ATTENDANCE_OVERVIEW.BTN_INDIVIDUAL_SCAN}</span>
                <span className="sm:hidden">{UI_STRINGS.ATTENDANCE_OVERVIEW.BTN_FACE_SCAN}</span>
              </button>
              <button onClick={() => setManualMarkOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer">
                <ClipboardEdit className="w-4 h-4" />
                {UI_STRINGS.ATTENDANCE_OVERVIEW.BTN_MANUAL}
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {/* Monthly Register Sheet Action Button */}
              <button
                onClick={() => setShowMonthlyModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#107c41] hover:bg-[#0b5c30] text-white text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Monthly Register Sheet
              </button>

              <button onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-xl shadow-sm transition-all cursor-pointer">
                <Download className="w-4 h-4" />
                {UI_STRINGS.ATTENDANCE_OVERVIEW.BTN_EXPORT}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FilterIcon size={15} className="text-gray-400 shrink-0" />
                  <span className="text-gray-600 text-sm font-semibold">{UI_STRINGS.ATTENDANCE_OVERVIEW.FILTERS}</span>
                </div>
                <button onClick={handleReset}
                  className="text-xs text-gray-500 hover:text-red-500 font-semibold transition-colors cursor-pointer">
                  {UI_STRINGS.ATTENDANCE_OVERVIEW.RESET}
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <select
                  value={selectedRole}
                  onChange={(e) => { setSelectedRole(e.target.value); setPage(0); }}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  <option value="ALL">{UI_STRINGS.ATTENDANCE_OVERVIEW.ALL_ROLES}</option>
                  {roles.map((r) => (
                    <option key={r.id ?? r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedStatus}
                  onChange={(e) => { setSelectedStatus(e.target.value); setPage(0); }}
                  className="px-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-sm"
                >
                  {STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <div className="flex-1 min-w-40 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text" value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                    placeholder={UI_STRINGS.ATTENDANCE_OVERVIEW.SEARCH_PLACEHOLDER}
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {UI_STRINGS.ATTENDANCE_OVERVIEW.HEADERS.map((col) => (
                      <th key={col} className="px-4 lg:px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {listLoading && <ListLoader />}
                  {!listLoading && attendanceList.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 lg:px-5 py-4 text-xs text-gray-400 font-medium">{startRow + idx}</td>
                      <td className="px-4 lg:px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full ${getAvatarColor(item.userName)} flex items-center justify-center text-white text-sm font-bold shrink-0`}>
                            {item.userName?.charAt(0)?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{item.userName}</p>
                            <p className="text-xs text-gray-400">{UI_STRINGS.COMMON.ID_LABEL} {item.userId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-5 py-4">
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg">{item.userType}</span>
                      </td>
                      <td className="px-4 lg:px-5 py-4 text-sm text-gray-600">{item.attendanceDate}</td>
                      <td className="px-4 lg:px-5 py-4 text-sm font-semibold text-gray-800">{formatTimeToIST(item.checkInTime, item.attendanceDate)}</td>
                      <td className="px-4 lg:px-5 py-4">{getSourceBadge(item.attendanceSource)}</td>
                      <td className="px-4 lg:px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!listLoading && attendanceList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-16 text-gray-400">
                        <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium">{UI_STRINGS.ATTENDANCE_OVERVIEW.NO_RECORDS}</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="md:hidden">
              {listLoading && (
                <div className="py-12 flex flex-col items-center gap-3">
                  <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                  <p className="text-sm text-gray-500">{UI_STRINGS.COMMON.LOADING}</p>
                </div>
              )}
              {!listLoading && attendanceList.map((item) => (
                <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/20">
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`w-11 h-11 rounded-full ${getAvatarColor(item.userName)} flex items-center justify-center text-white text-base font-bold shrink-0`}>
                      {item.userName?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate">{item.userName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{UI_STRINGS.COMMON.ID_LABEL} {item.userId} · {item.userType}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-semibold ${getStatusBadge(item.status)}`}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 bg-gray-50 rounded-xl p-3">
                    <div><p className="text-xs text-gray-400 mb-0.5">{UI_STRINGS.COMMON.DATE}</p><p className="text-xs font-semibold text-gray-800">{item.attendanceDate}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">{UI_STRINGS.COMMON.CHECK_IN}</p><p className="text-xs font-semibold text-gray-800">{item.checkInTime || '—'}</p></div>
                    <div><p className="text-xs text-gray-400 mb-0.5">{UI_STRINGS.COMMON.SOURCE}</p>{getSourceBadge(item.attendanceSource)}</div>
                  </div>
                </div>
              ))}
              {!listLoading && attendanceList.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                  <Calendar className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm font-medium">{UI_STRINGS.COMMON.NO_RECORDS_FOUND}</p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-600 font-medium text-xs sm:text-sm">
                  {UI_STRINGS.ATTENDANCE_OVERVIEW.SHOWING} {startRow}{UI_STRINGS.ATTENDANCE_OVERVIEW.TO}{endRow} {UI_STRINGS.ATTENDANCE_OVERVIEW.OF} {pagination?.totalElements || 0}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400 text-xs">{UI_STRINGS.COMMON.ROWS}</span>
                  <select value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}
                    className="border border-gray-300 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled={!pagination?.hasPrevious}
                  onClick={() => setPage(p => p - 1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${pagination?.hasPrevious ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Prev
                </button>
                <span className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg border border-blue-100">{page + 1}</span>
                <button
                  disabled={!pagination?.hasNext}
                  onClick={() => setPage(p => p + 1)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${pagination?.hasNext ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  Next
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Attendance;