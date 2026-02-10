import { Bell, Search, Upload, User, ChevronLeft, ChevronRight, Inbox, Calendar } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { pendingApprovals } from '../../Api/AttendanceApi'
import { approveManualAttendance } from '../../Api/AttendanceApi'

const UsersAttendance = () => {

  // State management
  const [currentPage, setCurrentPage] = useState(1)
  const [pendingUsers, setpendingUsers] = useState([])
  const [listLoading, setListLoading] = useState(false)
  const itemsPerPage = 10
  const date = new Date().toLocaleDateString()

  useEffect(() => {
    const loadPendingList = async () => {
      try {
        setListLoading(true);
        const approvals = await pendingApprovals()
        setpendingUsers(approvals)
      }
      catch (error) {
        toast.error(error.message)
      }
      finally {
        setListLoading(false);
      }
    }
    loadPendingList();
  }, [])

  // Calculate pagination
  const totalPages = Math.ceil(pendingUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = pendingUsers.slice(startIndex, endIndex);

  const handleApprove = async (user) => {
    try {
      const res = await approveManualAttendance({
        attendanceId: user.id,
        approved: true,
        remarks: "Approved by admin",
        overrideStatus: "PRESENT",
      });

      setpendingUsers(prev =>
        prev.map(u =>
          u.id === user.id
            ? { ...u, status: res.data.status }
            : u
        )
      );
      toast.success(
        `${user.userName || "User"} - ${res.message}`
      );

    } catch (error) {
      toast.error(error.message || "Approval failed");
    }
  };
  // Pagination handlers
  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const goToPrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Component */}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">

        {/* Page Content - Attendance Table */}
        <div className='flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-4 sm:p-6 lg:p-8'>
          <div className='flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4'>
            <div className='flex flex-col gap-2'>
              <h1 className='text-xl sm:text-3xl font-bold text-gray-900'>Pending Approvals</h1>
              <p className='text-gray-500 mt-1 font-medium text-xs sm:text-sm lg:text-base'>Manage and track daily attendance pending records for all users.</p>
            </div>
          </div>

          <div className='flex flex-col sm:flex-row gap-3 w-full sm:w-fit mb-4'>
            <button className='px-3 py-2 text-sm bg-white border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-all cursor-pointer shadow-md'>
              <Calendar color='grey' className='w-5 h-5' />
              <span className='text-gray-600 font-medium'>{date}</span>
            </button>
            <button className='px-3 py-2 cursor-pointer bg-blue-500 border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-all text-sm shadow-md'>
              <Upload className="w-5 h-5 text-white" />
              <span className='font-medium text-sm sm:text-base text-white'>Export Reports</span>
            </button>
          </div>

          {/* Desktop Table View - Hidden on Mobile */}
          <div className='hidden lg:block bg-white rounded-2xl shadow-lg overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full table-fixed'>
                <thead className='bg-gray-50 border-b border-gray-200'>
                  <tr>
                    <th className='w-[12%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>User Name</th>
                    <th className='w-[10%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Employee ID</th>
                    <th className='w-[12%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Department</th>
                    <th className='w-[12%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Attendance Date</th>
                    <th className='w-[28%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Manual Attendance Reason</th>
                    <th className='w-[13%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Status</th>
                    <th className='w-[13%] px-4 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider'>Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {listLoading && (
                    <tr>
                      <td colSpan="7" className="py-10">
                        <div className="flex justify-center flex-col items-center">
                          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                          <p className='text-sm sm:text-xl mt-2'>Loading...</p>
                        </div>
                      </td>
                    </tr>
                  )}
                  {!listLoading && currentUsers.length > 0 && (
                    currentUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 text-center py-4">
                          <div className="truncate">
                            <span className="font-medium text-gray-900">
                              {user.userName || "N/A"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <span className="text-gray-600 font-medium">
                            {user.userId}
                          </span>
                        </td>
                        <td className="px-4 text-center py-4">
                          <div className="truncate">
                            <span className="text-gray-600">
                              {user.userType}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 text-center py-4">
                          <span className="text-gray-600 whitespace-nowrap">
                            {user.attendanceDate}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="truncate" title={user.remarks}>
                            <span className="text-gray-600">
                              {user.remarks || "—"}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${user.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                              {user.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <div className="flex justify-center">
                            <button
                              onClick={() => handleApprove(user)}
                              disabled={user.status === "PRESENT"}
                              className={`px-4 py-2 rounded-lg font-semibold text-white transition-all whitespace-nowrap ${user.status === "PRESENT" ? "bg-green-500 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}`}>
                              {user.status === "PRESENT" ? "Approved" : "Approve"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                  {!listLoading && currentUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                          <Inbox className="w-12 h-12 text-gray-400" />
                          <p className="text-xl font-semibold">No pending approvals</p>
                          <p className="text-lg text-gray-400">
                            All attendance records are up to date
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Desktop Pagination */}
            <div className='px-6 py-4 border-t border-gray-200 flex items-center justify-between'>
              <div className='text-sm text-gray-600'>
                Showing {startIndex + 1}-{Math.min(endIndex, pendingUsers.length)} of {pendingUsers.length} users
              </div>
              <div className='flex items-center gap-2'>
                <button
                  onClick={goToPrevious}
                  disabled={currentPage === 1}
                  className='w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronLeft className='w-5 h-5' />
                </button>

                {[...Array(totalPages)].map((_, index) => {
                  const pageNum = index + 1
                  if (
                    pageNum === 1 ||
                    pageNum === totalPages ||
                    (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center font-medium transition-all ${currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                          }`}
                      >
                        {pageNum}
                      </button>
                    )
                  } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                    return <span key={pageNum} className='px-1'>...</span>
                  }
                  return null
                })}

                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages}
                  className='w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                >
                  <ChevronRight className='w-5 h-5' />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Card View - Visible only on Mobile/Tablet */}
          <div className='lg:hidden space-y-4'>
            {currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <div key={user.id} className='bg-white rounded-2xl shadow-lg p-4 sm:p-6'>
                  {/* User Header */}
                  <div className='flex items-start justify-between mb-4 pb-4 border-b border-gray-200'>
                    <div className='flex-1'>
                      <h3 className='font-bold text-gray-900 text-lg mb-1'>
                        {user.userName || "N/A"}
                      </h3>
                      <p className='text-sm text-gray-500'>ID: {user.userId}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.status === "PRESENT" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                      {user.status}
                    </span>
                  </div>

                  {/* User Details Grid */}
                  <div className='space-y-3 mb-4'>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-500 font-medium'>Department</span>
                      <span className='text-sm text-gray-900 font-semibold'>{user.userType}</span>
                    </div>
                    <div className='flex justify-between items-center'>
                      <span className='text-sm text-gray-500 font-medium'>Attendance Date</span>
                      <span className='text-sm text-gray-900 font-semibold'>{user.attendanceDate}</span>
                    </div>
                    {user.remarks && (
                      <div className='flex flex-col gap-1'>
                        <span className='text-sm text-gray-500 font-medium'>Reason</span>
                        <p className='text-sm text-gray-900 bg-gray-50 p-2 rounded-lg'>
                          {user.remarks}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleApprove(user)}
                    disabled={user.status === "PRESENT"}
                    className={`w-full px-4 py-3 rounded-xl font-semibold text-white transition-all ${user.status === "PRESENT"
                      ? "bg-green-500 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600"}`}>
                    {user.status === "PRESENT" ? "Approved" : "Approve"}
                  </button>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-16">
                <div className="flex flex-col items-center justify-center gap-3 text-gray-500">
                  <Inbox className="w-12 h-12 text-gray-400" />
                  <p className="text-xl font-semibold">No pending approvals</p>
                  <p className="text-sm sm:text-base text-gray-400 text-center">
                    All attendance records are up to date
                  </p>
                </div>
              </div>
            )}

            {/* Mobile Pagination */}
            {currentUsers.length > 0 && (
              <div className='bg-white rounded-2xl shadow-lg p-4'>
                <div className='text-sm text-gray-600 text-center mb-4'>
                  Showing {startIndex + 1}-{Math.min(endIndex, pendingUsers.length)} of {pendingUsers.length} users
                </div>
                <div className='flex items-center justify-center gap-2'>
                  <button
                    onClick={goToPrevious}
                    disabled={currentPage === 1}
                    className='w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronLeft className='w-5 h-5' />
                  </button>

                  <div className='flex items-center gap-1 sm:gap-2'>
                    {[...Array(totalPages)].map((_, index) => {
                      const pageNum = index + 1
                      if (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                      ) {
                        return (
                          <button
                            key={pageNum}
                            onClick={() => goToPage(pageNum)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center font-medium transition-all text-sm ${currentPage === pageNum
                              ? 'bg-blue-600 text-white'
                              : 'border border-gray-300 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        )
                      } else if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                        return <span key={pageNum} className='px-1 text-gray-400'>...</span>
                      }
                      return null
                    })}
                  </div>

                  <button
                    onClick={goToNext}
                    disabled={currentPage === totalPages}
                    className='w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                  >
                    <ChevronRight className='w-5 h-5' />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default UsersAttendance