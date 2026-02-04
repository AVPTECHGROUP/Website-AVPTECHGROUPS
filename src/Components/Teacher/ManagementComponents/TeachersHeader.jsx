import {
  Search,
  Bell,
  User,
  Users2,
  UserCheck2,
  UserRoundXIcon,
  IndianRupee,
  ShieldBanIcon,
  Calendar
} from 'lucide-react';

const TeachersHeader = ({
  search,
  setSearch,
  setPage,
  mobileSearchOpen,
  setMobileSearchOpen,
  stats
}) => {
  const date = new Date().toLocaleDateString();

  return (
    <>
      {/* ============================================ */}
      {/* FIXED TOP NAV BAR ONLY */}
      {/* ============================================ */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-5 py-4 shrink-0">
        <div className="flex items-center justify-between">
          {/* Left: Page Icon and Title */}
          <div className="flex items-center gap-2 p-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F8FAFC] rounded-lg flex items-center justify-center border border-gray-300">
              <User size={20} className="sm:w-6 sm:h-6 text-blue-700" />
            </div>
            <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">
              Teachers Management
            </h1>
          </div>

          {/* Right: Search and Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Desktop Search */}
            <div className="relative hidden md:block">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                type="text"
                placeholder="Search Teacher"
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-48 lg:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Mobile Search Button */}
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all md:hidden"
            >
              <Search className="w-5 h-5 text-gray-700" />
            </button>

            {/* Notification Button */}
            <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all relative">
              <Bell className="w-5 h-5 text-gray-700" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Button */}
            <button className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all">
              <User className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar (Expandable) */}
        {mobileSearchOpen && (
          <div className="mt-4 md:hidden">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                type="text"
                placeholder="Search Teacher"
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </header>
      <div>
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
            <div className="flex gap-3 w-fit">
              <button className="px-4 py-2 border bg-white border-gray-200 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition-all text-sm shadow-md">
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
              </button>
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
      </div>
    </>
  );
};

export default TeachersHeader;