import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Edit,
  UserRoundXIcon,
  Eye,
  Power
} from 'lucide-react';
import { toast } from 'react-toastify';
import { activateStatus, deactivateStatus } from '../../../Api/TeachersAPI';

const TeachersTable = ({
  teachers,
  setTeachers,
  loading,
  error,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  totalElements,
  totalPages,
  fetchTeachers
}) => {
  const navigate = useNavigate();
  const toggleDebounceRef = useRef(null);

  // ============================================
  // HELPER FUNCTIONS
  // ============================================

  // Get avatar color based on name
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

  // Toggle teacher active/inactive status
  const handleToggleStatus = (teacher) => {

  setTeachers(prev =>
    prev.map(t =>
      t.id === teacher.id
        ? {
            ...t,
            status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
          }
        : t
    )
  );
  if (toggleDebounceRef.current) {
    clearTimeout(toggleDebounceRef.current);
  }
  toggleDebounceRef.current = setTimeout(async () => {
    try {
      if (teacher.status === 'ACTIVE') {
        await deactivateStatus(teacher.id);
        toast.success(`${teacher.name} deactivated`);
      } else {
        await activateStatus(teacher.id);
        toast.success(`${teacher.name} activated`);
      }
    } catch (err) {
      toast.error('Status update failed');
      fetchTeachers(); // rollback from server
    }
  }, 500);
};

  // MOBILE/TABLET CARDS VIEW 

  return (
    <>
      {/* Mobile Cards (visible below 1024px) */}
      <div className="lg:hidden space-y-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading teachers...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRoundXIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Teachers</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          teachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full ${getAvatarColor(
                      teacher.name
                    )} flex items-center justify-center text-white font-semibold`}
                  >
                    {teacher.avatar}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                    <p className="text-sm text-gray-500">{teacher.role}</p>
                    <p className="text-xs text-gray-400 mt-1">{teacher.employeeCode}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${
                    teacher.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></span>
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
                    {(teacher.classes || []).map((cls, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Subjects:</span>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {(teacher.subjects || []).map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-block px-2 py-0.5 text-xs bg-purple-50 text-purple-600 rounded"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Salary Type:</span>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs rounded-full ${
                      teacher.salaryType === 'MONTHLY'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-yellow-50 text-yellow-700'
                    }`}
                  >
                    {teacher.salaryType}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Attendance:</span>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs rounded ${
                      teacher.attendance === 'ALLOWED'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {teacher.attendance}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Payroll:</span>
                  <span
                    className={`inline-block px-2.5 py-1 text-xs rounded ${
                      teacher.payroll === 'INCLUDED'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
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
                <button
                  onClick={() => navigate(`/teachers/${teacher.id}`)}
                  className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Eye className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">View</span>
                </button>
                <button
                  onClick={() => navigate(`/teachers/editTeacher/${teacher.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Edit className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Edit</span>
                </button>
                <button
                  onClick={() => handleToggleStatus(teacher)}
                  disabled={loading}
                  className={`flex-1 px-3 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                    teacher.status === 'ACTIVE'
                      ? 'bg-red-50 hover:bg-red-100'
                      : 'bg-green-50 hover:bg-green-100'
                  }`}
                >
                  <Power
                    className={`w-4 h-4 ${
                      teacher.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600'
                    }`}
                  />
                  <span className="text-sm font-medium">
                    {teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                  </span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (visible 1024px+) */}

      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="max-h-[calc(100vh-210px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
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
              {loading ? (
                <tr>
                  <td colSpan="11" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center flex-col">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium ml-4">Loading teachers...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="11" className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserRoundXIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Teachers</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teacher.employeeCode}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <img src={teacher.image} className="w-10 h-10 rounded-full" alt="" />
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
                        {(teacher.classes || []).map((cls, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {(teacher.subjects || []).map((subject, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-1 text-xs bg-purple-50 text-purple-600 rounded"
                          >
                            {subject}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded-full ${
                          teacher.salaryType === 'MONTHLY'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {teacher.salaryType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${
                          teacher.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        ></span>
                        {teacher.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded ${
                          teacher.attendance === 'ALLOWED'
                            ? 'bg-blue-50 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {teacher.attendance}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 text-xs rounded ${
                          teacher.payroll === 'INCLUDED'
                            ? 'bg-teal-50 text-teal-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {teacher.payroll}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {teacher.joiningDate}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => navigate(`/teachers/${teacher.id}`)}
                          className="flex-1 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                          <span className="text-sm font-medium text-gray-700">View</span>
                        </button>
                        <button
                          onClick={() => navigate(`/teachers/editTeacher/${teacher.id}`)}
                          className="flex-1 px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center gap-2 transition-all"
                        >
                          <Edit className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-blue-700">Edit</span>
                        </button>
                        <button
                          onClick={() => handleToggleStatus(teacher)}
                          disabled={loading}
                          className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 ${
                            teacher.status === 'ACTIVE' ? 'bg-blue-500' : 'bg-gray-300'
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${
                              teacher.status === 'ACTIVE' ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          ></div>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* DESKTOP PAGINATION */}

        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-700">
              {(() => {
                const safeTotalElements = Number(totalElements) || 0;
                const safeRowsPerPage = Number(rowsPerPage) || 10;
                const safePage = Number(page) || 1;

                return (
                  <>
                    Showing {(safePage - 1) * safeRowsPerPage + 1} to{' '}
                    {Math.min(safePage * safeRowsPerPage, safeTotalElements)} of{' '}
                    {safeTotalElements}
                  </>
                );
              })()}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
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
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading || error}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx + 1}
                onClick={() => setPage(idx + 1)}
                className={`px-3 py-1 rounded transition-all ${
                  page === idx + 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading || error}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* MOBILE PAGINATION */}
      {/* ============================================ */}

      <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          <div className="text-center">
            {(() => {
              const safeTotalElements = Number(totalElements) || 0;
              const safeRowsPerPage = Number(rowsPerPage) || 10;
              const safePage = Number(page) || 1;

              return (
                <>
                  Showing {(safePage - 1) * safeRowsPerPage + 1} to{' '}
                  {Math.min(safePage * safeRowsPerPage, safeTotalElements)} of {safeTotalElements}
                </>
              );
            })()}
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-700">Rows:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setPage(1);
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
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1 || loading || error}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-1">
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setPage(idx + 1)}
                    className={`px-3 py-1 rounded transition-all ${
                      page === idx + 1
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
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 rounded transition-all ${
                      page === 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    1
                  </button>
                  {page > 3 && <span className="px-2 text-gray-400">...</span>}
                  {page > 2 && page < totalPages - 1 && (
                    <button
                      onClick={() => setPage(page)}
                      className="px-3 py-1 rounded bg-blue-500 text-white"
                    >
                      {page}
                    </button>
                  )}
                  {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`px-3 py-1 rounded transition-all ${
                      page === totalPages
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
              type="button"
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page === totalPages || loading || error}
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
    </>
  );
};

export default TeachersTable;