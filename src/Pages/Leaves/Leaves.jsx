import React, { useEffect, useState } from 'react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import {
  ThumbsUpIcon,
  ClockIcon,
  CalendarDaysIcon,
  CalendarX2,
  CalendarRange,
  LucideCalendarDays,
  SearchIcon,
  ChevronLeft,
  ChevronRight,
  SearchX,
  UserRoundXIcon,
} from 'lucide-react';
import LeavesReqInfoComponent from '../../Components/LeavesComponents/LeaveReqInfoComponent';
import { approoveRejLeaveReq, getAllLeaveRequest, getALLLeavesStatistics, } from '../../Api/LeavesManagementAPI';
import { toast } from 'react-toastify';

const Leaves = () => {
  const date = new Date().toLocaleDateString();

  const [error, setError] = useState(null);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setpage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [rowsPerpage, setrowsPerpage] = useState(10);
  const [noUserFound, set_noUserFound] = useState(null);

  // Stores text typed in search input (sys_user name / id / role)
  const [search, setsearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [leavestatusFilter, setleavestatusFilter] = useState('All Status');
  const [leaveType, setleaveType] = useState('');
  const [frommDateFilter, setfrommDateFilter] = useState('');
  const [toDateFilter, settoDateFilter] = useState('');


  const [resetFiltersCallApiDependency, setresetFiltersCallApiDependency] = useState(0);


  const [leaveReq, setLeaveReq] = useState([]);
  const [statistics, setstatistics] = useState({
    pendingRequests: 0,
    approvedThisMonth: 0,
    rejectedThisMonth: 0,
    totalLeavesToday: 0,
    totalThisMonth: 0,
    totalLeavesThisWeek: 0
  });

  //for leave statistics 
  const [refressStat, setRefressStat] = useState(0);
  const [refressfeth, setRefressfetch] = useState(0);
  useEffect(() => {
    let fetchStatistics = async () => {
      try {
        const statistics_res = await getALLLeavesStatistics(); // for total statistics
        const res = statistics_res.data;
        setstatistics(res);
      }
      catch (e) {
        console.error("get statistics error:", e.message);
        throw error;
      }
    }
    fetchStatistics();
  }, [refressStat])

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500'
    ];
    const index = name?.charCodeAt(0) % colors.length || 0;
    return colors[index];
  };

  //debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  //for active filters
  const fetchWithFilters = (async () => {
    setLoading(true);
    try {
      const filters = { userName: '', status: '', leaveType: '', frommDate: '', toDate: '' };
      if (debouncedSearch.trim()) filters.userName = debouncedSearch.trim();
      if (leavestatusFilter !== 'All Status') filters.status = leavestatusFilter;
      if (leaveType !== 'All Types') filters.leaveType = leaveType;
      if (frommDateFilter !== "") filters.frommDate = frommDateFilter;
      if (toDateFilter !== "") filters.toDate = toDateFilter;

      const res = await getAllLeaveRequest(page - 1, rowsPerpage, 'id', filters.status, filters.leaveType, filters.userName, filters.frommDate, filters.toDate);
      const leaveRequests = res.data || [];

      if (leaveRequests.length === 0) {
        set_noUserFound(true);
      } else {
        set_noUserFound(false);
      }

      const mappedRequests = leaveRequests.map((employee) => ({
        leaveId: employee.id,
        id: employee.userId,
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
        image: employee.imageUrl || employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userName)}&background=random`,
        role: employee.userType || 'N/A',
        currEmpstatus: employee.status,
      }));

      setLeaveReq(mappedRequests);
    }
    catch (err) {
      console.error("Error fetching users:", err);
      setError(err.message || "Something went wrong");
      setLeaveReq([]);
    }
    finally {
      setLoading(false);
    }

  });
  //for reset filters 
  function resetFiltersCallApi() {
    try {
      setError(null);
      setsearch('');
      setleavestatusFilter('All Status');
      setleaveType('All Types');
      setfrommDateFilter('');
      settoDateFilter('');
      // increment dependency to trigger any useEffect relying on it
      setresetFiltersCallApiDependency(prev => prev + 1);
    } catch (err) {
      console.error("Error resetting filters:", err);
      setError(err.message || "Something went wrong");
      setLeaveReq([]);
    }
  }

  useEffect(() => {
    const fetchLeaveRequest = async () => {
      let res;
      setLoading(true);
      setError(null);
      try {
        set_noUserFound(false); // for reset no user found
        res = await getAllLeaveRequest(page - 1, rowsPerpage);
        const leaveRequests = res.data || [];

        if (leaveRequests.length === 0) {
          set_noUserFound(true);
        } else {
          set_noUserFound(false);
        }

        const mappedRequests = leaveRequests.map((employee) => ({
          leaveId: employee.id,
          id: employee.userId,
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
          image: employee.imageUrl || employee.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userName)}&background=random`,
          role: employee.userType || 'N/A',
          currEmpstatus: employee.status,
        }));

        setLeaveReq(mappedRequests); // Set mapped data to state for UI rendering

        // Pagination
        setTotalElements(res.pagination?.totalElements || 0);
        setTotalPages(res.pagination?.totalPages || 0);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Something went wrong");
        setLeaveReq([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveRequest();
  }, [page, rowsPerpage, resetFiltersCallApiDependency, refressfeth]);

  const cardsArray = [{ IconName: ClockIcon, keyName: "Pending request", val: statistics.pendingRequests, iconTxColor: "text-orange-600", iconBgColor: "bg-orange-50" },
  { IconName: ThumbsUpIcon, keyName: "Approved Leaves  month", val: statistics.approvedThisMonth, iconTxColor: "text-green-600", iconBgColor: "bg-green-50" },
  { IconName: CalendarX2, keyName: "Rejected leaves month", val: statistics.rejectedThisMonth, iconTxColor: "text-red-600", iconBgColor: "bg-red-50" },
  { IconName: CalendarRange, keyName: "Total leaves month", val: statistics.totalThisMonth, iconTxColor: "text-blue-600", iconBgColor: "bg-blue-50" },
  // { IconName: CalendarDaysIcon, keyName: "Total leaves today", val: statistics.totalLeavesToday, iconTxColor: "text-gray-600", iconBgColor: "bg-gray-50" },
  { IconName: CalendarDaysIcon, keyName: "total leaves  week", val: statistics.totalLeavesThisWeek, iconTxColor: "text-yellow-600", iconBgColor: "bg-yellow-50" }
  ];

  const statusStyles = {
    PENDING: 'bg-yellow-50 text-yellow-800',
    APPROVED: 'bg-green-50 text-green-800',
    REJECTED: 'bg-red-50 text-red-800',
    CANCELLED: 'bg-orange-50 text-orange-800',
    WITHDRAWN: 'bg-gray-50 text-gray-800'
  };

  //for pop pup open 
  const [selectedUser, setSelectedUser] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const [remarkVal, setRemarksVal] = useState('As per the policy');

  const handleViewClick = (user) => {
    setRemarksVal(user.reviewRemarks)
    setSelectedUser(user);
    setIsPopupOpen(true);
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setTimeout(() => setSelectedUser(null), 300);
    setRemarksVal('As per the policy');
  };

  const handleLeaveApproveReq = async () => {
    console.log('leave request approved with remark val ----------->', remarkVal, 'is remark and user is ', selectedUser);
    try {
      const res = await approoveRejLeaveReq(selectedUser.leaveId, remarkVal);
      const message = res.message;
      toast.success(message);
      setRefressfetch((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Leave Approval failed');
    }
  }
  const handleLeaveRejectReq = async () => {
    console.log('leave request reject -----------> user val is  ', selectedUser);
    try {
      const res = await approoveRejLeaveReq(selectedUser.leaveId, remarkVal, 'REJECTED');
      const message = res.message;
      toast.success(message);
      setRefressfetch((prev) => prev + 1);
    } catch (error) {
      toast.error(error.message || 'Leave Approval failed');
    }
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Page Content */}
        <div className="flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-4 pt-2 lg:pt-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Manage All Leaves</h2>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Review and manage employee leave requests for the current academic session.</p>
            </div>
            <div className="flex object-fill">
              <button className=" px-4 py-2 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-md">
                <LucideCalendarDays className="w-4 h-4 text-blue-400" />
                <span className="">{date}</span>
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className='grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm mb-6'>
            {
              cardsArray.map((card) => (
                <CardComponent key={card.keyName} IconName={card.IconName} keyName={card.keyName.toUpperCase()} val={card.val} iconTxColor={card.iconTxColor} iconBgColor={card.iconBgColor} />
              ))
            }
          </div>

          {/* Filters */}
          <div className="bg-white grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 px-4 py-3 rounded-xl border border-gray-200 mb-4">
            {/* Search */}
            <div className="flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-3 py-2 focus-within:shadow-sm focus-within:shadow-blue-200 md:col-span-2">
              <SearchIcon className="w-5 h-5 text-gray-500" />
              <input
                value={search}
                onChange={(e) => { setsearch(e.target.value) }}
                placeholder="Search by name ..."
                className="text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full bg-transparent"
              />
            </div>
            {/* Leave Type */}
            <select
              value={leaveType}
              onChange={(e) => { setleaveType(e.target.value) }}
              className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full">
              <option value="All Types">All Leave Types</option>
              {[{ value: 'SICK_LEAVE', key: 'Sick Leave' },
              { value: 'CASUAL_LEAVE', key: 'Casual Leave' },
              { value: 'EARNED_LEAVE', key: 'Earned Leave' },
              { value: 'UNPAID_LEAVE', key: 'Unpaid Leave' },
              { value: 'MATERNITY_LEAVE', key: 'Maternity Leave' },
              { value: 'PATERNITY_LEAVE', key: 'Paternity Leave' },
              { value: 'BEREAVEMENT_LEAVE', key: 'Bereavement Leave' },
              { value: 'STUDY_LEAVE', key: 'Study Leave' },
              { value: 'COMPENSATORY_OFF', key: 'Compensatory Leave' },
              { value: 'SPECIAL_LEAVE', key: 'Special Leave' }
              ].map((val) => (<option key={val.value} value={val.value}>{val.key}</option>))}
            </select>

            {/* Leave Status */}
            <select
              value={leavestatusFilter}
              onChange={(e) => { setleavestatusFilter(e.target.value) }}
              className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full">
              <option value="All Status">All Status</option>
              {[{ value: 'PENDING', key: 'Pending' },
              { value: 'APPROVED', key: 'Approved' },
              { value: 'REJECTED', key: 'Rejected' },
              { value: 'CANCELLED', key: 'Cancelled' },
              { value: 'WITHDRAWN', key: 'Withdrawn' }
              ].map((val) => (<option key={val.value} value={val.value}>{val.key}</option>))}
            </select>

            {/* Date From */}
            <div className='flex gap-2 col-span-2 items-center align-middle'>
              <input value={frommDateFilter} onChange={(e) => setfrommDateFilter(e.target.value)} type="date" className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full" />
              <span className='font-medium text-gray-600'>to</span>
              {/* Date To */}
              <input value={toDateFilter} onChange={(e) => settoDateFilter(e.target.value)} type="date" className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm w-full"
              />
            </div>

            <button onClick={fetchWithFilters} className='bg-blue-400 rounded-lg text-white sm:text-xs lg:text-sm hover:bg-blue-500 cursor-pointer px-2'>  Apply </button>
            <button onClick={() => (resetFiltersCallApi())} className='bg-gray-200 rounded-lg text-black text-sm py-1 hover:bg-gray-300 cursor-pointer  px-2'>Reset</button>
          </div>


          {/* Leaves requests Table */}
          <div className="bg-white rounded-xl border border-gray-200">

            {/* ================= DESKTOP TABLE ================= */}

            <div className="hidden lg:block bg-white rounded-t-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-y-auto overflow-x-auto min-h-30 max-h-[calc(100vh-450px)]">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      {['Employee Name', 'Leave Type', 'Leave from', 'Leave to', 'Total', 'Status', 'Action'].map((h, index) => (
                        <th
                          key={index}
                          className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider bg-gray-50"
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan="6" className="text-center py-8">
                          <div className="flex flex-col items-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                            <span className="text-gray-600">Please wait while Loading requests...</span>
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan="11" className="px-6 py-8 text-center">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <UserRoundXIcon className="w-6 h-6 text-red-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Users</h3>
                          <p className="text-gray-600 mb-4">{error}</p>
                          <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Retry
                          </button>
                        </td>
                      </tr>
                    ) : noUserFound ? <tr>
                      <td colSpan="7" className="px-6 py-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          <SearchX className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">No Request Found</h3>
                      </td>
                    </tr> : leaveReq.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full ${getAvatarColor(emp.name)} flex items-center justify-center text-white font-semibold shrink-0`}>
                              {emp.avatar}
                            </div>
                            <p className="font-medium text-gray-900 text-sm">
                              {emp.name}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {emp.leaveType}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {emp.fromDate}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {emp.toDate}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {emp.totalDays} {emp.totalDays === 1 ? 'day' : 'days'}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${statusStyles[emp.currEmpstatus]}`}
                          >
                            {emp.currEmpstatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => handleViewClick(emp)} className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= MOBILE CARDS ================= */}
            {/* Mobile/Tablet Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden p-4 space-y-4">
              {
                loading ? (
                  <div className="text-center py-8">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                                    <span className="text-gray-600">Loading requests...</span>
                                </div>
                            </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">

                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                      <UserRoundXIcon className="w-6 h-6 text-red-500" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Error Loading Users
                    </h3>

                    <p className="text-gray-600 mb-4 max-w-md">
                      {error}
                    </p>

                    <button
                      onClick={() => window.location.reload()}
                      className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Retry
                    </button>

                  </div>

                ) : noUserFound ? <tr>
                  <td colSpan="7" className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                      <SearchX className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-700 mb-2">No Request Found</h3>
                  </td>
                </tr> : leaveReq.map((emp) => (
                  <div
                    key={emp.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                      <div
                        className={`w-12 h-12 rounded-full ${getAvatarColor(
                          emp.name
                        )} flex items-center justify-center text-white font-semibold`}
                      >
                        {emp.avatar}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 text-base">
                          {emp.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {emp.empCode || emp.id}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[emp.currEmpstatus]
                          }`}
                      >
                        {emp.currEmpstatus}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          Leave Type
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {emp.leaveType}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-800 mb-1">
                          Duration
                        </p>
                        <p className="text-sm font-semibold text-gray-900">
                          {emp.totalDays} {emp.totalDays === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          From Date
                        </p>
                        <p className="text-sm text-gray-700">{emp.fromDate}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">
                          To Date
                        </p>
                        <p className="text-sm text-gray-700">{emp.toDate}</p>
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-gray-700 pb-4"><li className='ml-6'>{emp.reason}</li></p>


                    {/* Action Button */}
                    <button onClick={() => handleViewClick(emp)} className="w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                      View Details
                    </button>
                  </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm text-gray-700">
                  {(() => {
                    page
                    const safeTotalElements = Number(totalElements) || 0;
                    const safeRowsPerPage = Number(rowsPerpage) || 10;
                    const safePage = Number() || 1;

                    return (
                      <>
                        Showing {(safePage - 1) * safeRowsPerPage + 1} to{' '}
                        {Math.min(safePage * safeRowsPerPage, safeTotalElements)} of {safeTotalElements}
                      </>
                    );
                  })()}

                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">Rows per page:</span>
                  <select
                    value={rowsPerpage}
                    onChange={(e) => {
                      setrowsPerpage(Number(e.target.value));
                      setpage(1);
                    }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setpage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1 || loading || error}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setpage(idx + 1)}
                    className={`px-3 py-1 rounded transition-all ${page === idx + 1
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  type='button'
                  onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === 1 || loading || error}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* poppup called */}
      <LeavesReqInfoComponent isOpen={isPopupOpen} onClose={handleClosePopup} userData={selectedUser} handleLeaveApprove={handleLeaveApproveReq} handleLeaveReject={handleLeaveRejectReq} setRemarks={setRemarksVal} remarks={remarkVal} />
    </div>
  );
};

export default Leaves;