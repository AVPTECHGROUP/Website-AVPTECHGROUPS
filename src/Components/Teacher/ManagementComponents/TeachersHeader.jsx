import {
  Bell,
  User,
  Users2,
  UserCheck2,
  UserRoundXIcon,
  IndianRupee,
  ShieldBanIcon,
  Calendar
} from 'lucide-react';

const TeachersHeader = ({ stats }) => {
  const date = new Date().toLocaleDateString();

  return (
    <div className="px-4 sm:px-5 lg:px-4 pt-4">
      {/* PAGE TITLE AND DATE */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
            Manage Teachers
          </h2>
          <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
            Oversee and manage your academic staff directory.
          </p>
        </div>
      </div>

      {/* STATISTICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-5">
        {/* Total Teachers Card */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <Users2 className="w-6 h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 font-semibold text-sm">Total Teachers</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        {/* Active Teachers Card */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
              <UserCheck2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 font-semibold text-sm">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">{stats.activePercent}% of total</p>
            </div>
          </div>
        </div>

        {/* Inactive Teachers Card */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center shrink-0">
              <UserRoundXIcon className="w-6 h-6 text-red-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 font-semibold text-sm">Inactive</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inActive}</p>
              <p className="text-xs text-gray-500">{stats.inActivePercent}% of total</p>
            </div>
          </div>
        </div>

        {/* Payroll Included Card */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-teal-50 rounded-xl flex items-center justify-center shrink-0">
              <IndianRupee className="w-6 h-6 text-teal-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 font-semibold text-sm">Payroll Included</p>
              <p className="text-2xl font-bold text-gray-900">{stats.payrollIncluded}</p>
            </div>
          </div>
        </div>

        {/* Attendance Blocked Card */}
        <div className="bg-white shadow-md rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center shrink-0">
              <ShieldBanIcon className="w-6 h-6 text-orange-600" />
            </div>
            <div className="min-w-0">
              <p className="text-gray-600 font-semibold text-sm">Attendance Blocked</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attendanceBlocked}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeachersHeader;