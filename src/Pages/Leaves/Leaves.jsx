import React, { useEffect, useState, useCallback } from 'react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import CardLoader from '../../Components/CommonComp/CardLoader';
import {
  ThumbsUpIcon,
  ClockIcon,
  CalendarX2,
  CalendarRange,
  LucideCalendarDays,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  SearchX,
  UserRoundXIcon,
  XIcon,
} from 'lucide-react';
import LeavesReqInfoComponent from '../../Components/LeavesComponents/LeaveReqInfoComponent';
import {
  approoveRejLeaveReq,
  getAllLeaveRequest,
  getALLLeavesStatistics,
} from '../../Api/Leaves/LeavesManagementAPI';
import { toast } from 'react-toastify';
import { getListOfValues } from '../../Api/Lov/ListOfValues';
import ListLoader from '../../Components/CommonComp/ListLoader';
import { useDecodedUser } from '../../ContextAPI/UserContext';
import {
  ROLE_HIERARCHY,
  STATUS_STYLES,
  AVATAR_COLORS,
  LEAVES_TEXT,
  LEAVES_TOAST_MESSAGES,
} from '../../Constants/StringConstants/LeavesConstants';

// ── Hierarchy — imported from leavesConstants ─────────────────────────────

function getRoleRank(role) {
  const idx = ROLE_HIERARCHY.indexOf((role ?? '').toUpperCase());
  return idx === -1 ? Infinity : idx;
}

/**
 * Returns true only when:
 *  1. The viewer is NOT the leave applicant (no self-approval)
 *  2. The viewer's role is strictly higher in the hierarchy than the applicant's role
 */
function canViewerApprove({ viewerUserId, viewerRole, applicantUserId, applicantRole }) {
  if (!viewerUserId || !applicantUserId) return false;
  // Rule 1 — no self-approval
  if (String(viewerUserId) === String(applicantUserId)) return false;
  // Rule 2 — viewer must be strictly higher (lower rank index)
  return getRoleRank(viewerRole) < getRoleRank(applicantRole);
}

// ── Component ──────────────────────────────────────────────────────────────────
const Leaves = () => {
  const date = new Date().toLocaleDateString();

  // ── Auth context ─────────────────────────────────────────────────────────────
  const { user: currentUser } = useDecodedUser();
  // currentUser shape: { id, userType, email, permissions, schoolId }

  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [noUserFound, setNoUserFound] = useState(null);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [leaveStatusFilter, setLeaveStatusFilter] = useState('');
  const [leaveType, setLeaveType] = useState('');
  const [fromDateFilter, setFromDateFilter] = useState('');
  const [toDateFilter, setToDateFilter] = useState('');

  const [leaveReq, setLeaveReq] = useState([]);
  const [statistics, setStatistics] = useState({
    pendingRequests: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalLeavesToday: 0,
    totalThisMonth: 0,
    totalLeavesThisWeek: 0,
  });

  const [listOfLeaveType, setListOfLeaveType] = useState([]);
  const [listOfLeaveStatus, setListOfLeaveStatus] = useState([]);
  const [statLoading, setStatLoading] = useState(true);
  const [refreshStat, setRefreshStat] = useState(0);

  // Auto-fetch whenever dependencies change; also reset to page 1 when filters change
  const isFirstRender = React.useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      fetchLeaveRequests();
      return;
    }
    setPage(1);
  }, [debouncedSearch, leaveStatusFilter, leaveType, fromDateFilter, toDateFilter]);

  // ── List of values ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchListOfValues = async () => {
      try {
        const leaveTypeRes = await getListOfValues('LEAVE_TYPE');
        setListOfLeaveType(
          leaveTypeRes
            .filter((i) => i.isActive)
            .map(({ id, value, label }) => ({ id, value, label }))
        );

        const leaveStatusRes = await getListOfValues('LEAVE_STATUS');
        setListOfLeaveStatus(
          leaveStatusRes
            .filter((i) => i.isActive && i.value !== 'WITHDRAWN')
            .map(({ id, value, label }) => ({ id, value, label }))
        );
      } catch (e) {
        console.error('get list of values error:', e.message);
      }
    };
    fetchListOfValues();
  }, []);

  const handleExportCSV = () => {
    if (leaveReq.length === 0) {
      toast.warning("No data available to export.");
      return;
    }

    // 1. Define the CSV Headers matching your table structure
    const headers = ["Employee Name", "Employee Code", "Leave Type", "From Date", "To Date", "Duration", "Status"];

    // 2. Map row content and convert values to descriptive text labels
    const rows = leaveReq.map(emp => [
      emp.name,
      emp.empCode || 'N/A',
      getLabelFromValue(listOfLeaveType, emp.leaveType),
      emp.fromDate,
      emp.toDate,
      getLeaveDurationText(emp),
      emp.currEmpstatus
    ]);

    // 3. Assemble content string escaping dynamic text columns properly
    const csvContent = [
      headers.join(","),
      ...rows.map(row =>
        row.map(val => {
          const cleanVal = String(val ?? '').replace(/"/g, '""');
          return cleanVal.includes(',') || cleanVal.includes('\n') || cleanVal.includes('"')
            ? `"${cleanVal}"`
            : cleanVal;
        }).join(",")
      )
    ].join("\n");

    // 4. Trigger localized window download target block
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Leave_Requests_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ── Statistics ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchStatistics = async () => {
      setStatLoading(true);
      try {
        const res = await getALLLeavesStatistics();
        setStatistics(res.data);
      } catch (e) {
        console.error('get statistics error:', e.message);
      } finally {
        setStatLoading(false);
      }
    };
    fetchStatistics();
  }, [refreshStat]);

  // ── Debounce search ───────────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  // ── Fetch leave requests ──────────────────────────────────────────────────────
  const fetchLeaveRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoUserFound(false);

    try {
      const res = await getAllLeaveRequest(
        page - 1,
        rowsPerPage,
        'id',
        leaveStatusFilter,
        leaveType === 'All Types' ? '' : leaveType,
        debouncedSearch.trim(),
        fromDateFilter,
        toDateFilter
      );

      const leaveRequests = res.data || [];
      setNoUserFound(leaveRequests.length === 0);

      setLeaveReq(
        leaveRequests.map((employee) => ({
          leaveId: employee.id,
          id: employee.userId,           // applicant's user ID
          applicantRole: employee.userType || '',   // applicant's role — used for hierarchy check
          name: employee.userName || 'Unknown',
          leaveType: employee.leaveType,
          fromDate: employee.fromDate,
          toDate: employee.toDate,
          totalDays: employee.totalDays,
          reason: employee.reason,
          reviewRemarks: employee.reviewRemarks,
          status: employee.status,
          empCode: employee.employeeCode,
          avatar: (employee.userName || 'U')[0].toUpperCase(),
          isHalfDay:
            employee.isHalfDay === true ||
            employee.isHalfDay === 'true' ||
            employee.isHalfDay === 'TRUE',
          image:
            employee.imageUrl ||
            employee.profileImage ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userName)}&background=random`,
          role: employee.userType || 'N/A',
          currEmpstatus: employee.status,
        }))
      );

      setTotalElements(res.pagination?.totalElements || 0);
      setTotalPages(res.pagination?.totalPages || 0);
    } catch (err) {
      console.error('Error fetching leave requests:', err);
      setError(err.message || 'Something went wrong');
      setLeaveReq([]);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, leaveStatusFilter, leaveType, fromDateFilter, toDateFilter]);

  useEffect(() => {
    fetchLeaveRequests();
  }, [page, rowsPerPage, fetchLeaveRequests]);

  // ── Helpers ───────────────────────────────────────────────────────────────────
  const getAvatarColor = (name) => {
    const colors = AVATAR_COLORS;
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  function getLabelFromValue(data, value) {
    return data.find((i) => i.value === value)?.label ?? value;
  }

  const hasActiveFilters =
    search || leaveStatusFilter || (leaveType && leaveType !== 'All Types') || fromDateFilter || toDateFilter;

  const clearAllFilters = () => {
    setSearch('');
    setLeaveStatusFilter('');
    setLeaveType('');
    setFromDateFilter('');
    setToDateFilter('');
  };

  // ── Per-row approve gate ──────────────────────────────────────────────────────
  // emp.currEmpstatus must still be PENDING; additionally the hierarchy check must pass.
  function showApproveReject(emp) {
    if (emp.currEmpstatus !== 'PENDING') return false;
    return canViewerApprove({
      viewerUserId: currentUser?.id,
      viewerRole: currentUser?.userType,
      applicantUserId: emp.id,
      applicantRole: emp.applicantRole,
    });
  }

  // ── Cards config ──────────────────────────────────────────────────────────────
  const cardsArray = [
    {
      IconName: ClockIcon,
      keyName: LEAVES_TEXT.statCards.pendingRequests,
      val: statistics.pendingApproval,
      iconTxColor: 'text-orange-600',
      iconBgColor: 'bg-orange-50',
    },
    {
      IconName: ThumbsUpIcon,
      keyName: LEAVES_TEXT.statCards.approvedThisMonth,
      val: statistics.approvedThisMonth,
      iconTxColor: 'text-green-600',
      iconBgColor: 'bg-green-50',
    },
    {
      IconName: CalendarX2,
      keyName: LEAVES_TEXT.statCards.rejectedThisMonth,
      val: statistics.rejectedThisMonth,
      iconTxColor: 'text-red-600',
      iconBgColor: 'bg-red-50',
    },
    {
      IconName: CalendarRange,
      keyName: LEAVES_TEXT.statCards.appliedThisMonth,
      val: statistics.appliedThisMonth,
      iconTxColor: 'text-blue-600',
      iconBgColor: 'bg-blue-50',
    },
  ];

  // statusStyles imported from leavesConstants as STATUS_STYLES
  const statusStyles = STATUS_STYLES;

  // ── Popup state ───────────────────────────────────────────────────────────────
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [remarkVal, setRemarksVal] = useState(LEAVES_TEXT.defaultRemark);

  const handleViewClick = (user) => {
    setRemarksVal(user.reviewRemarks || '');
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
    setRemarksVal('');
  };

  const handleLeaveApproveReq = async () => {
    try {
      const res = await approoveRejLeaveReq(selectedUser.leaveId, remarkVal);
      toast.success(res.message);
      handleClosePopup();
      fetchLeaveRequests();
      setRefreshStat((p) => p + 1);
    } catch (error) {
      toast.error(error.message || LEAVES_TOAST_MESSAGES.approvalFailed);
    }
  };

  const handleLeaveRejectReq = async () => {
    try {
      const res = await approoveRejLeaveReq(selectedUser.leaveId, remarkVal, 'REJECTED');
      toast.success(res.message);
      handleClosePopup();
      fetchLeaveRequests();
      setRefreshStat((p) => p + 1);
    } catch (error) {
      toast.error(error.message || LEAVES_TOAST_MESSAGES.rejectionFailed);
    }
  };

  const getLeaveDurationText = (emp) => {
    const days = Number(emp.totalDays || 0);
    const isHalfDay =
      emp.isHalfDay === true || emp.isHalfDay === 'true' || emp.isHalfDay === 'TRUE';

    if (days === 0 && isHalfDay) return LEAVES_TEXT.duration.halfDay;
    if (days === 0 && !isHalfDay) return LEAVES_TEXT.duration.weekendOrHoliday;

    const totalDuration = isHalfDay ? days + 0.5 : days;
    return `${totalDuration} ${totalDuration === 1 ? LEAVES_TEXT.duration.day : LEAVES_TEXT.duration.days}`;
  };

  // ── Pagination helpers ────────────────────────────────────────────────────────
  const safeTotalElements = Number(totalElements) || 0;
  const safeRowsPerPage = Number(rowsPerPage) || 10;
  const safePage = Number(page) || 1;
  const showingFrom = (safePage - 1) * safeRowsPerPage + 1;
  const showingTo = Math.min(safePage * safeRowsPerPage, safeTotalElements);

  const pageNumbers = () => {
    const tp = Number(totalPages) || 0;
    const cur = Math.min(Math.max(1, Number(page) || 1), tp);
    if (tp <= 5) return [...Array(tp)].map((_, i) => i + 1);
    let start = Math.max(2, cur - 1);
    let end = Math.min(tp - 1, start + 2);
    if (end - start < 2) start = Math.max(2, end - 2);
    const pages = [1];
    for (let p = start; p <= end; p++) pages.push(p);
    pages.push(tp);
    return [...new Set(pages)].sort((a, b) => a - b);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <div className="flex-1 bg-gradient-to-b from-sky-50 to-slate-100 overflow-auto p-4 pt-2 lg:pt-4 sm:p-6 lg:p-8">

          {/* ── Page Title ── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-5 gap-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                Leave Management
              </h2>
              <p className="text-gray-500 mt-0.5 text-sm">
                Review and manage employee leave requests for the current academic session.
              </p>
            </div>
            <button className="self-start sm:self-auto px-3 py-1.5 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-sm whitespace-nowrap">
              <LucideCalendarDays className="w-4 h-4 text-blue-400" />
              <span className="text-gray-600 font-medium">{date}</span>
            </button>
          </div>

          {/* ── Stats Cards ── */}
          <div className="grid sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 text-sm mt-4 mb-4">
            {statLoading
              ? cardsArray.map((_, i) => <CardLoader key={i} />)
              : cardsArray.map((card) => (
                <CardComponent
                  key={card.keyName}
                  IconName={card.IconName}
                  keyName={card.keyName.toUpperCase()}
                  val={card.val}
                  iconTxColor={card.iconTxColor}
                  iconBgColor={card.iconBgColor}
                />
              ))}
          </div>

          {/* ── Filters ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 items-center">
              {/* Search */}
              <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-300 transition-all">
                <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by employee name…"
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent placeholder-gray-400"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600">
                    <XIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Leave Type */}
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 w-full"
              >
                <option value="">All Leave Types</option>
                <option value="All Types">All Types</option>
                {listOfLeaveType.map((v) => (
                  <option key={v.id} value={v.value}>{v.label}</option>
                ))}
              </select>

              {/* Status */}
              <select
                value={leaveStatusFilter}
                onChange={(e) => setLeaveStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-600 w-full"
              >
                <option value="">All Status</option>
                {listOfLeaveStatus.map((v) => (
                  <option key={v.id} value={v.value}>{v.label}</option>
                ))}
              </select>

              {/* Clear filters pill */}
              {hasActiveFilters ? (
                <button
                  onClick={clearAllFilters}
                  className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-100 transition-all"
                >
                  <XIcon className="w-3.5 h-3.5" /> Clear filters
                </button>
              ) : (
                <div />
              )}

              {/* Date range & Export Actions */}
              <div className="sm:col-span-2 lg:col-span-2 flex items-center gap-2">
                <input
                  value={fromDateFilter}
                  onChange={(e) => setFromDateFilter(e.target.value)}
                  type="date"
                  className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm w-full text-gray-600"
                />
                <span className="text-gray-400 text-xs font-medium">to</span>
                <input
                  value={toDateFilter}
                  onChange={(e) => setToDateFilter(e.target.value)}
                  type="date"
                  className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm w-full text-gray-600"
                />
                <button
                  onClick={handleExportCSV}
                  disabled={loading || leaveReq.length === 0}
                  className="px-3 py-2 bg-blue-600 text-white font-medium rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm whitespace-nowrap cursor-pointer"
                  title="Export current table view to CSV"
                >
                  Export CSV
                </button>
              </div>
            </div>

            {/* Active filter chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pt-2.5 border-t border-gray-100">
                {search && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Search: {search}
                    <button onClick={() => setSearch('')}><XIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {leaveType && leaveType !== 'All Types' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Type: {getLabelFromValue(listOfLeaveType, leaveType)}
                    <button onClick={() => setLeaveType('')}><XIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {leaveStatusFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    Status: {getLabelFromValue(listOfLeaveStatus, leaveStatusFilter)}
                    <button onClick={() => setLeaveStatusFilter('')}><XIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {fromDateFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    From: {fromDateFilter}
                    <button onClick={() => setFromDateFilter('')}><XIcon className="w-3 h-3" /></button>
                  </span>
                )}
                {toDateFilter && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-200">
                    To: {toDateFilter}
                    <button onClick={() => setToDateFilter('')}><XIcon className="w-3 h-3" /></button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* ── Table ── */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

            {/* DESKTOP TABLE */}
            <div className="hidden lg:block overflow-hidden rounded-t-xl">
              <div className="overflow-y-auto overflow-x-auto max-h-[calc(100vh-380px)]">
                <table className="w-full table-fixed">
                  <colgroup>
                    <col className="w-[22%]" />
                    <col className="w-[16%]" />
                    <col className="w-[11%]" />
                    <col className="w-[11%]" />
                    <col className="w-[8%]" />
                    <col className="w-[14%]" />
                    <col className="w-[18%]" />
                  </colgroup>
                  <thead className="bg-gray-50 sticky top-0 z-10 border-b border-gray-200">
                    <tr>
                      {LEAVES_TEXT.table.headers.map((h) => (
                        <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {loading ? (
                      <ListLoader />
                    ) : error ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center">
                          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <UserRoundXIcon className="w-5 h-5 text-red-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-800 mb-1">{LEAVES_TEXT.emptyStates.errorTitle}</p>
                          <p className="text-xs text-gray-500 mb-3">{error}</p>
                          <button onClick={fetchLeaveRequests} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : noUserFound ? (
                      <tr>
                        <td colSpan="7" className="px-6 py-10 text-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                            <SearchX className="w-5 h-5 text-blue-400" />
                          </div>
                          <p className="text-sm font-semibold text-gray-600">{LEAVES_TEXT.emptyStates.noRequests}</p>
                          {hasActiveFilters && (
                            <button onClick={clearAllFilters} className="mt-2 text-xs text-blue-600 hover:underline">
                              Clear all filters
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      leaveReq.map((emp) => (
                        <tr key={emp.leaveId} className="hover:bg-slate-50 transition-colors">
                          {/* Employee */}
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-7 h-7 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                                {emp.avatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{emp.name}</p>
                                <p className="text-xs text-gray-400 truncate">{emp.empCode}</p>
                              </div>
                            </div>
                          </td>
                          {/* Leave Type */}
                          <td className="px-3 py-2 text-xs text-gray-600 truncate">
                            {getLabelFromValue(listOfLeaveType, emp.leaveType)}
                          </td>
                          {/* Dates */}
                          <td className="px-3 py-2 text-xs text-gray-600 tabular-nums">{emp.fromDate}</td>
                          <td className="px-3 py-2 text-xs text-gray-600 tabular-nums">{emp.toDate}</td>
                          {/* Days */}
                          <td className="px-2 py-1 text-[11px] font-semibold text-gray-800 tabular-nums">
                            {getLeaveDurationText(emp)}
                          </td>
                          {/* Status */}
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusStyles[emp.currEmpstatus] ?? 'bg-gray-100 text-gray-700'}`}>
                              {emp.currEmpstatus}
                            </span>
                          </td>
                          {/* Action — hierarchy + self-approval guard applied here */}
                          <td className="px-3 py-2">
                            {showApproveReject(emp) ? (
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => handleViewClick(emp)}
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                                >
                                  {LEAVES_TEXT.buttons.approve}
                                </button>
                                <button
                                  onClick={() => handleViewClick(emp)}
                                  className="px-2.5 py-1 bg-red-50 text-red-600 rounded-md text-xs font-medium hover:bg-red-100 transition-colors border border-red-200"
                                >
                                  {LEAVES_TEXT.buttons.reject}
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleViewClick(emp)}
                                className="px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                              >
                                {LEAVES_TEXT.buttons.view}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* MOBILE CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lg:hidden p-3">
              {loading ? (
                <div className="col-span-full text-center py-8">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">Loading requests…</span>
                </div>
              ) : error ? (
                <div className="col-span-full flex flex-col items-center py-10 text-center">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mb-3">
                    <UserRoundXIcon className="w-5 h-5 text-red-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-800 mb-1">Error Loading Requests</p>
                  <p className="text-xs text-gray-500 mb-3">{error}</p>
                  <button onClick={fetchLeaveRequests} className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">
                    {LEAVES_TEXT.buttons.retry}
                  </button>
                </div>
              ) : noUserFound ? (
                <div className="col-span-full text-center py-10">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <SearchX className="w-5 h-5 text-blue-500" />
                  </div>
                  <p className="text-sm font-semibold text-gray-600">No requests found</p>
                </div>
              ) : (
                leaveReq.map((emp) => (
                  <div key={emp.leaveId} className="bg-white border border-gray-200 rounded-xl p-3.5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3 pb-3 border-b border-gray-100">
                      <div className={`w-9 h-9 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white text-sm font-semibold`}>
                        {emp.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{emp.name}</p>
                        <p className="text-xs text-gray-400">{emp.empCode}</p>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${statusStyles[emp.currEmpstatus] ?? ''}`}>
                        {emp.currEmpstatus}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                      <div>
                        <p className="text-gray-400 mb-0.5">Leave Type</p>
                        <p className="font-medium text-gray-800">{getLabelFromValue(listOfLeaveType, emp.leaveType)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">Duration</p>
                        <p className="font-medium text-gray-800">{getLeaveDurationText(emp)}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">From</p>
                        <p className="text-gray-700">{emp.fromDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 mb-0.5">To</p>
                        <p className="text-gray-700">{emp.toDate}</p>
                      </div>
                    </div>
                    {emp.reason && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{emp.reason}</p>
                    )}
                    {/* Action — hierarchy + self-approval guard applied here */}
                    <div className="w-full">
                      {showApproveReject(emp) ? (
                        <div className="flex gap-2 w-full">
                          <button
                            onClick={() => handleViewClick(emp)}
                            className="flex-1 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium hover:bg-emerald-100 transition-colors border border-emerald-200"
                          >
                            {LEAVES_TEXT.buttons.approve}
                          </button>
                          <button
                            onClick={() => handleViewClick(emp)}
                            className="flex-1 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium hover:bg-red-100 transition-colors border border-red-200"
                          >
                            {LEAVES_TEXT.buttons.reject}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleViewClick(emp)}
                          className="w-full px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                        >
                          {LEAVES_TEXT.buttons.viewDetails}
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ── Pagination ── */}
            <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>
                  {safeTotalElements > 0
                    ? `${showingFrom}–${showingTo} of ${safeTotalElements}`
                    : '0 results'}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                    className="px-2 py-1 border border-gray-200 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers().map((pNum, idx, arr) => (
                  <React.Fragment key={pNum}>
                    {idx > 0 && arr[idx - 1] !== pNum - 1 && (
                      <span className="px-1 text-gray-400 text-xs">…</span>
                    )}
                    <button
                      onClick={() => setPage(pNum)}
                      className={`w-7 h-7 text-xs rounded font-medium transition-all ${page === pNum ? 'bg-blue-500 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                    >
                      {pNum}
                    </button>
                  </React.Fragment>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading || totalPages === 0}
                  className="p-1.5 text-gray-500 hover:bg-gray-100 rounded disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup */}
      <LeavesReqInfoComponent
        isOpen={isPopupOpen}
        onClose={handleClosePopup}
        userData={selectedUser}
        handleLeaveApprove={handleLeaveApproveReq}
        handleLeaveReject={handleLeaveRejectReq}
        setRemarks={setRemarksVal}
        remarks={remarkVal}
        listLeavetype={listOfLeaveType}
      />
    </div>
  );
};

export default Leaves;