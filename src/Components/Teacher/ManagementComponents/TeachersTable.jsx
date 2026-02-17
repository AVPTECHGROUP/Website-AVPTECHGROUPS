import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Edit,
  UserRoundXIcon,
  Eye,
  Inbox,
  Power
} from 'lucide-react';
import { toast } from 'react-toastify';
import { activateStatus, deactivateStatus } from '../../../Api/TeachersAPI';
import ActionDropDownComp from '../../CommonComp/ActionDropDownComp';

const TeachersTable = ({
  assignTeacherId,
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
  fetchTeachers,
  actionOptions: propActionOptions, // Accept action options as prop
  callAllActions: propCallAllActions, // Accept action handler as prop
  isUserTable = false // Flag to determine if this is for users or teachers
}) => {
  const navigate = useNavigate();
  const [assignId, setAssignTeacherId] = useState(null);

  // HELPER FUNCTIONS

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

  // Toggle teacher/user active/inactive status
  const handleToggleStatus = async (teacher) => {
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
  };

  const NoDataFound = ({ message = "No data found" }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
      <p className="text-sm text-gray-500 mt-1">
        Try adjusting filters or add new records
      </p>
    </div>
  );

  // Use prop action handler if provided, otherwise use default
  const callAllActions = propCallAllActions || (async (optVal, teacher) => {
    if (optVal === 'view') navigate(`/teachers/${teacher.id}`);
    else if (optVal === 'editTeacher') navigate(`/teachers/editTeacher/${teacher.id}`);
    else if (optVal === 'toogleStatus' || optVal === 'toggleStatus') handleToggleStatus(teacher);
  });

  // Use prop action options if provided, otherwise use default
  const actionOptions = propActionOptions || [
    {
      value: "view",
      label: "View",
      icon: Eye,
      text: "text-gray-600",
      bg: "bg-blue-50",
      hover: "hover:bg-gray-100",
    },
    {
      value: "editTeacher",
      label: "Edit",
      icon: Edit,
      text: "text-blue-600",
      bg: "bg-green-50",
      hover: "hover:bg-blue-100",
    },
    {
      value: "toogleStatus",
      label: "Toggle Status",
      icon: Power,
      text: "text-yellow-600",
      bg: "bg-yellow-50",
      hover: "hover:bg-yellow-100",
    },
  ];

  // MOBILE/TABLET CARDS VIEW 
  return (
    <>
      {/* Mobile Cards (visible below 1024px) */}
      <div className="lg:hidden space-y-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600 font-medium">Loading {isUserTable ? 'users' : 'teachers'}...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRoundXIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading {isUserTable ? 'Users' : 'Teachers'}</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : teachers.length === 0 ? (
          <NoDataFound message={`No ${isUserTable ? 'users' : 'teachers'} found`} />
        ) : (
          teachers.map((teacher) => (
            <div key={teacher.id}
              className={`bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all`}
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
                    {teacher.employeeCode && <p className="text-xs text-gray-400 mt-1">{teacher.employeeCode}</p>}
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
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

                {!isUserTable && teacher.classes && (
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
                )}

                {!isUserTable && teacher.salaryType && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Salary Type:</span>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs rounded-full ${teacher.salaryType === 'MONTHLY'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-yellow-50 text-yellow-700'
                        }`}
                    >
                      {teacher.salaryType}
                    </span>
                  </div>
                )}

                {!isUserTable && teacher.attendance && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Attendance:</span>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.attendance === 'ALLOWED'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {teacher.attendance}
                    </span>
                  </div>
                )}

                {!isUserTable && teacher.payroll && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Payroll:</span>
                    <span
                      className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.payroll === 'INCLUDED'
                        ? 'bg-teal-50 text-teal-700'
                        : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {teacher.payroll}
                    </span>
                  </div>
                )}

                {!isUserTable && teacher.joiningDate && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Joining Date:</span>
                    <span className="text-sm font-medium text-gray-900">{teacher.joiningDate}</span>
                  </div>
                )}
              </div>
              <div className='flex items-center align-middle'>
                <span className='text-sm text-gray-500 pb-1.5 pr-2'>Select Teacher </span>
                <div className="flex items-center justify-evenly gap-2 px-1">
                <button
                  onClick={() => {
                    if (isUserTable) return;
                    setAssignTeacherId(assignId === teacher.id ? null : teacher.id);
                    if (assignId !== teacher.id) assignTeacherId(teacher.id);
                  }}
                  className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none ${assignId === teacher.id ? 'bg-blue-600' : 'bg-gray-300'
                    }`}
                >
                  {/* Sliding dot */}
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${assignId === teacher.id ? 'translate-x-5' : 'translate-x-0'
                      }`}
                  />
                </button>
              </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                <div className="flex-1">
                  <ActionDropDownComp
                    actionOptions={actionOptions}
                    onAction={(optVal) => callAllActions(optVal, teacher)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* DESKTOP TABLE VIEW (visible 1024px+) */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {!isUserTable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee Code
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isUserTable ? 'User Name' : 'Full Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </th>
                {!isUserTable && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Classes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Salary Type
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {!isUserTable && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payroll
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                  </>
                )}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={isUserTable ? "4" : "10"} className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center flex-col">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-gray-600 font-medium ml-4">Loading {isUserTable ? 'users' : 'teachers'}...</p>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={isUserTable ? "4" : "10"} className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserRoundXIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading {isUserTable ? 'Users' : 'Teachers'}</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={isUserTable ? "4" : "10"}>
                    <NoDataFound message={`No ${isUserTable ? 'users' : 'teachers'} found`} />
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => (
                  <tr
                    onClick={() => {
                      if (!isUserTable) {
                        setAssignTeacherId(teacher.id);
                        assignTeacherId(teacher.id);
                      }
                    }}
                    key={teacher.id}
                    className={`${assignId === teacher.id && !isUserTable ? "bg-blue-50" : ""}`}
                  >
                    {!isUserTable && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {teacher.employeeCode}
                      </td>
                    )}
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
                    {!isUserTable && (
                      <>
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
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full ${teacher.salaryType === 'MONTHLY'
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-yellow-50 text-yellow-700'
                              }`}
                          >
                            {teacher.salaryType}
                          </span>
                        </td>
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE'
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'
                            }`}
                        ></span>
                        {teacher.status}
                      </span>
                    </td>
                    {!isUserTable && (
                      <>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded ${teacher.attendance === 'ALLOWED'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                              }`}
                          >
                            {teacher.attendance}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded ${teacher.payroll === 'INCLUDED'
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
                      </>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <ActionDropDownComp
                        actionOptions={actionOptions}
                        onAction={(optVal) => callAllActions(optVal, teacher)}
                      />
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
                className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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

      {/* MOBILE PAGINATION */}
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
                    onClick={() => setPage(1)}
                    className={`px-3 py-1 rounded transition-all ${page === 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'
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