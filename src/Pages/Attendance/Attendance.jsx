import { ClipboardList, UserCheck2, UserX, ChartBarBigIcon, Eye, Edit, Filter, FilterIcon } from 'lucide-react';
import CardComponent from '../../Components/CommonComp/CardComponent';
import { useEffect, useState } from 'react';
import { allAttendanceDetails, attendanceStatistics } from '../../Api/AttendanceApi';
import ListLoader from '../../Components/CommonComp/ListLoader';

const Attendance = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [attendanceList, setattendanceList] = useState([])
  const [page, setpage] = useState(0)
  const [size, setsize] = useState(10)
  const [pagination, setpagination] = useState(null)
  const [stats, setstats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [listLoading, setListLoading] = useState(false)
  const [error, seterror] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setStatsLoading(true)
        const data = await attendanceStatistics(selectedDate)
        setstats(data)
      } catch (err) {
        seterror(err.message);
      } finally {
        setStatsLoading(false);
      }
    }
    if (selectedDate) {
      fetchStats();
    }
  }, [selectedDate])

  useEffect(() => {
    const fetchAttendanceList = async () => {
      try {
        setListLoading(true);

        const res = await allAttendanceDetails({
          attendanceDate: selectedDate,
          role: selectedRole !== 'ALL' ? selectedRole : undefined,
          status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
          page,
          size
        });

        setattendanceList(res?.data || []);
        setpagination(res?.pagination || null);
      } catch (error) {
        seterror(error.message);
      } finally {
        setListLoading(false);
      }
    };

    fetchAttendanceList();
  }, [selectedDate, selectedRole, selectedStatus, page, size]);

  const startRow = pagination ? page * size + 1 : 0;
  const endRow = pagination ? Math.min((page + 1) * size, pagination.totalElements) : 0;


  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-0">
        {/* Page Content */}
        <div className="flex-1 bg-linear-to-b from-sky-50 to-sky-100 overflow-auto p-3 sm:p-4 md:p-6 lg:p-8">
          {/* Page Title */}
          <div className="mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900">Attendance Overview</h2>
                <p className="text-gray-500 mt-1 font-medium text-xs sm:text-sm md:text-base">Here's an overview of today's attendance across the school.</p>
              </div>
            </div>

            {/* Calendar Section */}
            <div className="mt-3 sm:mt-4">
              <p className="text-sm sm:text-base font-medium text-gray-600 mb-2 sm:mb-3">Select a date to view attendance records:</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white shadow-sm hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base font-medium"
                />
                <div className="w-full sm:w-auto px-3 sm:px-4 py-2 sm:py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-xs sm:text-sm md:text-base font-semibold text-blue-700">
                  <span className="hidden md:inline">{formatDate(selectedDate)}</span>
                  <span className="md:hidden">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-4 sm:mb-6 lg:mb-8">
            <CardComponent
              IconName={ChartBarBigIcon}
              keyName='Overall Attendance'
              val={statsLoading ? "..." : stats?.totalRecords ?? 0}
              iconTxColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />

            <CardComponent
              IconName={UserCheck2}
              keyName='Total Present'
              val={statsLoading ? "..." : stats?.totalPresent ?? 0}
              iconTxColor="text-green-600"
              iconBgColor="bg-green-100"
            />

            <CardComponent
              IconName={UserX}
              keyName='Total Absent'
              val={statsLoading ? "..." : stats?.totalAbsent ?? 0}
              iconTxColor="text-red-600"
              iconBgColor="bg-red-100"
            />

            <CardComponent
              IconName={UserCheck2}
              keyName='Attendance Percentage'
              val={statsLoading ? "..." : `${stats?.attendancePercentage ?? 0}%`}
              iconTxColor="text-blue-600"
              iconBgColor="bg-blue-100"
            />
          </div>

          {/* Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-3 sm:mb-4">
            <div className='flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4'>
              <div className='flex items-center gap-1.5 sm:gap-2'>
                <FilterIcon size={18} className="sm:w-5 sm:h-5" />
                <label className='text-gray-600 text-sm sm:text-base md:text-lg font-medium'>Filters:</label>
              </div>
              <div className="flex sm:flex-row flex-col gap-2 sm:gap-3 md:gap-4 w-full sm:w-auto">
                {/* Role Dropdown */}
                <div className="flex-1 sm:flex-none">
                  <select
                    value={selectedRole}
                    onChange={(e) => {
                      setSelectedRole(e.target.value);
                      setpage(0);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-sm sm:text-base text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="ALL">All Roles</option>
                    <option value="SUPER_ADMIN">Super Admin</option>
                    <option value="ADMIN">Admin</option>
                    <option value="PRINCIPAL">Principal</option>
                    <option value="TEACHER">Teacher</option>
                    <option value="ACCOUNTANT">Accountant</option>
                    <option value="RECEPTIONIST">Receptionist</option>
                    <option value="PARENT">Parent</option>
                  </select>
                </div>

                {/* Status Dropdown */}
                <div className="flex-1 sm:flex-none">
                  <select
                    value={selectedStatus}
                    onChange={(e) => {
                      setSelectedStatus(e.target.value);
                      setpage(0);
                    }}
                    className="w-full sm:w-auto px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 border border-gray-300 rounded-lg bg-white text-sm sm:text-base text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="ALL">All Status</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Desktop Table View (hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">USER ID</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">FULL NAME</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ATTENDANCE DATE</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">CHECK-IN TIME</th>
                    <th className="px-4 lg:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {/* Loading */}
                  {listLoading && (
                    <ListLoader />
                  )}

                  {/* Data rows */}
                  {!listLoading && attendanceList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 lg:px-6 py-4 text-sm  font-medium text-gray-900">
                        {item.userId}
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-semibold shrink-0">
                            {item.userName?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">
                              {item.userName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.userType}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                        {item.attendanceDate}
                      </td>

                      <td className="px-4 lg:px-6 py-4 text-sm text-gray-700">
                        {item.checkInTime || '--'}
                      </td>

                      <td className="px-4 lg:px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-semibold
    ${item.status === 'PRESENT'
                              ? 'bg-green-50 text-green-700'
                              : item.status === 'LATE'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                        >
                          {item.status}
                        </span>

                      </td>
                    </tr>
                  ))}

                  {!listLoading && attendanceList.length === 0 && (
                    <tr>
                      <td colSpan="5" className="text-center py-8 text-gray-500 text-sm">
                        No attendance records found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View (visible only on mobile) */}
            <div className="md:hidden">
              {/*  Loading */}
              {listLoading && (
                <div className="py-10">
                  <div className="flex justify-center flex-col items-center">
                    <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className='text-sm mt-2'>Loading...</p>
                  </div>
                </div>
              )}

              {/* Data cards */}
              {!listLoading && attendanceList.map((item) => (
                <div key={item.id} className="p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  {/* User Info */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-semibold shrink-0">
                      {item.userName?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-base truncate">
                        {item.userName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.userType}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        ID: {item.userId}
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-semibold
    ${item.status === 'PRESENT'
                          ? 'bg-green-50 text-green-700'
                          : item.status === 'LATE'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                    >
                      {item.status}
                    </span>

                  </div>

                  {/* Additional Details */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Date</p>
                      <p className="text-gray-900 font-medium text-xs">{item.attendanceDate}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-0.5">Check-in</p>
                      <p className="text-gray-900 font-medium text-xs">{item.checkInTime || '--'}</p>
                    </div>
                  </div>
                </div>
              ))}

              {!listLoading && attendanceList.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  No attendance records found
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 px-3 sm:px-4 lg:px-6 py-3 sm:py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-xs sm:text-sm">
                <span className="text-gray-700 font-medium">
                  Showing {startRow} to {endRow} of {pagination?.totalElements || 0}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">Rows per page:</span>
                  <select
                    value={size}
                    onChange={(e) => {
                      setsize(Number(e.target.value));
                      setpage(0);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 sm:gap-2">
                <button
                  disabled={!pagination?.hasPrevious}
                  onClick={() => setpage((prev) => prev - 1)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors
                    ${pagination?.hasPrevious
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  ← <span className="hidden xs:inline">Previous</span>
                </button>

                <span className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-blue-700">
                  Page {page + 1}
                </span>

                <button
                  disabled={!pagination?.hasNext}
                  onClick={() => setpage((prev) => prev + 1)}
                  className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded text-xs sm:text-sm font-medium transition-colors
                    ${pagination?.hasNext
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                >
                  <span className="hidden xs:inline">Next</span> →
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