import { useMemo, useState } from 'react';
import { allTeachers } from '../../assets/allTeachers';
import {
  Search,
  Bell,
  User,
  ChevronRight,
  ChevronLeft,
  Edit,
  UserPlusIcon,
  Users2,
  UserRoundXIcon,
  IndianRupee,
  ShieldBanIcon,
  Funnel,
  Eye,
  Power,
  UserCheck2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';



const Teachers = () => {

  // Stores text typed in search input (teacher name / id / role)
  const [search, setsearch] = useState('');

  // Stores selected teacher status filter (Active / Inactive / All)
  const [statusFilter, setStatusFilter] = useState('All Status');

  // Stores selected class filter (Class 5A, 6B etc.)
  const [classFilter, setClassFilter] = useState('All Classes');

  // Stores selected salary type filter (Monthly / Per Day)
  const [salaryFilter, setSalaryFilter] = useState('All Salary Types');

  // Stores current page number for pagination
  const [page, setpage] = useState(1);

  // Stores number of rows to show per page in table
  const [rowsPerpage, setrowsPerpage] = useState(10);

  // Controls mobile search bar visibility (true = open, false = closed)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const total = allTeachers.length;
    const active = allTeachers.filter(t => t.status === 'Active').length;
    const inActive = allTeachers.filter(t => t.status === 'Inactive').length;
    const payrollIncluded = allTeachers.filter(t => t.payroll === 'Included').length;
    const attendanceBlocked = allTeachers.filter(t => t.attendance === 'Blocked').length;

    return {
      total,
      active,
      activePercent: Math.round((active / total) * 100),
      inActive,
      inActivePercent: Math.round((inActive / total) * 100),
      payrollIncluded,
      attendanceBlocked
    };
  }, []);

  const filteredTeachers = useMemo(() => {
    return allTeachers.filter(teacher => {
      const matchesSearch = teacher.name.toLowerCase().includes(search.toLowerCase()) ||
        teacher.id.toLowerCase().includes(search.toLowerCase()) ||
        teacher.role.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All Status' || teacher.status === statusFilter;
      const matchesClass = classFilter === 'All Classes' || teacher.classes.some(c => c === classFilter);
      const matchesSalary = salaryFilter === 'All Salary Types' || teacher.salaryType === salaryFilter;

      return matchesSearch && matchesStatus && matchesClass && matchesSalary;
    });
  }, [search, statusFilter, classFilter, salaryFilter]);

  const totalPages = Math.ceil(filteredTeachers.length / rowsPerpage);
  const startIndex = (page - 1) * rowsPerpage;
  const endIndex = startIndex + rowsPerpage;
  const currentTeachers = filteredTeachers.slice(startIndex, endIndex);

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500'
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-0">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-[#F8FAFC] rounded-lg flex items-center justify-center border border-gray-300">
                <User size={20} className="sm:w-6 sm:h-6 text-blue-700" />
              </div>
              <h1 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Teachers Management</h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              {/* Desktop Search */}
              <div className="relative hidden md:block">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => {
                    setsearch(e.target.value);
                    setpage(1);
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

              <button className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-all relative">
                <Bell className="w-5 h-5 text-gray-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <button className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center hover:bg-gray-800 transition-all">
                <User className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          {mobileSearchOpen && (
            <div className="mt-4 md:hidden">
              <div className="relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  value={search}
                  onChange={(e) => {
                    setsearch(e.target.value);
                    setpage(1);
                  }}
                  type="text"
                  placeholder="Search Teacher"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {/* Page Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Manage Teachers</h2>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">Oversee and manage your academic staff directory.</p>
            </div>
            <button onClick={()=>navigate('/teachers/addTeacher')} className="px-4 sm:px-6 py-2.5 w-full sm:w-fit bg-blue-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-blue-700 transition-all">
              <UserPlusIcon className="w-5 h-5" />
              <span className="text-sm sm:text-base">Add New Teacher</span>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-6">
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

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="flex items-center gap-2 shrink-0">
                <Funnel className="w-5 h-5 text-gray-500" />
                <p className="text-base sm:text-lg font-medium">Filters:</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setpage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>

                <select
                  value={classFilter}
                  onChange={(e) => {
                    setClassFilter(e.target.value);
                    setpage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>All Classes</option>
                  <option>Class 5A</option>
                  <option>Class 6A</option>
                  <option>Class 6B</option>
                  <option>Class 7A</option>
                  <option>Class 7B</option>
                  <option>Class 8A</option>
                  <option>Class 8B</option>
                  <option>Class 9A</option>
                  <option>Class 9B</option>
                  <option>Class 10A</option>
                  <option>Class 10B</option>
                  <option>Class 11A</option>
                  <option>Class 11B</option>
                  <option>Class 12A</option>
                  <option>Class 12B</option>
                </select>

                <select
                  value={salaryFilter}
                  onChange={(e) => {
                    setSalaryFilter(e.target.value);
                    setpage(1);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option>All Salary Types</option>
                  <option>Monthly</option>
                  <option>Per Day</option>
                </select>
              </div>
            </div>
          </div>

          {/* MOBILE/TABLET CARDS VIEW (visible below 1024px) */}
          <div className="lg:hidden space-y-4 mb-6">
            {currentTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-full ${getAvatarColor(teacher.name)} flex items-center justify-center text-white font-semibold`}>
                      {teacher.avatar}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                      <p className="text-sm text-gray-500">{teacher.role}</p>
                      <p className="text-xs text-gray-400 mt-1">{teacher.id}</p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${teacher.status === 'Active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                      }`}></span>
                    {teacher.status}
                  </span>
                </div>

                {/* Details Grid */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mobile:</span>
                    <span className="text-sm font-medium text-gray-900">{teacher.mobile}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Classes:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {teacher.classes.map((cls, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">
                          {cls}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Subjects:</span>
                    <div className="flex flex-wrap gap-1 justify-end">
                      {teacher.subjects.map((subject, idx) => (
                        <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded">
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Salary Type:</span>
                    <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${teacher.salaryType === 'Monthly'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-yellow-50 text-yellow-700'
                      }`}>
                      {teacher.salaryType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Attendance:</span>
                    <span className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.attendance === 'Allowed'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {teacher.attendance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payroll:</span>
                    <span className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.payroll === 'Included'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-gray-100 text-gray-700'
                      }`}>
                      {teacher.payroll}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Joining Date:</span>
                    <span className="text-sm font-medium text-gray-900">{teacher.joiningDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button onClick={()=>navigate(`/teachers/${teacher.id}`)} className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">View</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Edit</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Power className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Toggle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP TABLE (visible 1024px and above) */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Full Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mobile Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payroll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTeachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(teacher.name)} flex items-center justify-center text-white font-semibold text-sm`}>
                            {teacher.avatar}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{teacher.name}</div>
                            <div className="text-xs text-gray-500">{teacher.role}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.mobile}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.classes.map((cls, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded">
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {teacher.subjects.map((subject, idx) => (
                            <span key={idx} className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded">
                              {subject}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${teacher.salaryType === 'Monthly'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-yellow-50 text-yellow-700'
                          }`}>
                          {teacher.salaryType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${teacher.status === 'Active'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                          }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                          {teacher.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 text-xs rounded ${teacher.attendance === 'Allowed'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {teacher.attendance}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-3 py-1 text-xs rounded ${teacher.payroll === 'Included'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-gray-100 text-gray-700'
                          }`}>
                          {teacher.payroll}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {teacher.joiningDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button onClick={()=>navigate(`/teachers/${teacher.id}`)} className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Eye className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">View</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Edit className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Edit</span>
                  </button>
                  <button className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all">
                    <Power className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-700">Toggle</span>
                  </button>
                </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length} results
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
                  disabled={page === 1}
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
                  onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col gap-4">
              <div className="text-center">
                <span className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredTeachers.length)} of {filteredTeachers.length} results
                </span>
              </div>

              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-700">Rows:</span>
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

              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setpage(prev => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {totalPages <= 5 ? (
                    [...Array(totalPages)].map((_, idx) => (
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
                    ))
                  ) : (
                    <>
                      <button
                        onClick={() => setpage(1)}
                        className={`px-3 py-1 rounded transition-all ${page === 1
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        1
                      </button>
                      {page > 3 && <span className="px-2 text-gray-400">...</span>}
                      {page > 2 && page < totalPages - 1 && (
                        <button
                          onClick={() => setpage(page)}
                          className="px-3 py-1 rounded bg-blue-500 text-white"
                        >
                          {page}
                        </button>
                      )}
                      {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                      <button
                        onClick={() => setpage(totalPages)}
                        className={`px-3 py-1 rounded transition-all ${page === totalPages
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                          }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setpage(prev => Math.min(totalPages, prev + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center text-sm text-gray-600">
                Page {page} of {totalPages}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Teachers;