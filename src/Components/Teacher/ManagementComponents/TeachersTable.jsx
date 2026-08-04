import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { PERMISSIONS as P } from '../../../Constants/Permission';
import {
  ChevronRight,
  ChevronLeft,
  Edit,
  UserRoundXIcon,
  Eye,
  Inbox,
  Power,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { activateStatus, deactivateStatus } from '../../../Api/Teachers/TeachersAPI';
import ActionDropDownComp from '../../CommonComp/ActionDropDownComp';
import ListLoader from '../../CommonComp/ListLoader';

// Extracted to prevent recreation on every render
const NoDataFound = ({ message = 'No data found' }) => (
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

const TeachersTable = ({
  selectedTeacherId,
  onRowSelect,
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
  actionOptions: propActionOptions,
  callAllActions: propCallAllActions,
  isUserTable = false,
  onStatusToggle,
}) => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [hoveredId, setHoveredId] = useState(null);

  // Feature Flag Check for Payroll
  const isPayrollEnabled = (() => {
    try {
      const school = JSON.parse(localStorage.getItem('school'));
      return school?.features?.payrollEnabled ?? true;
    } catch {
      return true;
    }
  })();

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

  const resolveTeacherName = (teacher) =>
    teacher.name || teacher.fullName || 'User';

  const resolveTeacherImage = (teacher) =>
    teacher.profileImageUrl || teacher.image || '';

  const resolveTeacherAvatar = (teacher) =>
    teacher.avatar || (resolveTeacherName(teacher)[0] || 'U').toUpperCase();

  const handleToggleStatus = async (teacher) => {
    if (teacher.id === selectedTeacherId && onRowSelect) {
      onRowSelect(teacher);
    }

    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacher.id
          ? { ...t, status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : t
      )
    );
    if (onStatusToggle) onStatusToggle(teacher.status);

    try {
      if (teacher.status === 'ACTIVE') {
        await deactivateStatus(teacher.id);
        toast.success(`${teacher.name} deactivated`);
      } else {
        await activateStatus(teacher.id);
        toast.success(`${teacher.name} activated`);
      }
    } catch (error) {
      toast.error('Status update failed');
      fetchTeachers();
      if (onStatusToggle) {
        onStatusToggle(teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
      }
    }
  };

  const callAllActions =
    propCallAllActions ||
    (async (optVal, teacher) => {
      if (optVal === 'view') navigate(`/teachers/${teacher.id}`);
      else if (optVal === 'editTeacher')
        navigate(`/teachers/editTeacher/${teacher.id}`);
      else if (optVal === 'toggleStatus') handleToggleStatus(teacher);
    });

  const getActionOptions = (teacher) => {
    if (propActionOptions) return propActionOptions;
    const options = [
      {
        value: 'view',
        label: 'View',
        icon: Eye,
        text: 'text-gray-600',
        bg: 'bg-blue-50',
        hover: 'hover:bg-gray-200',
      },
    ];
    const editPerm = isUserTable ? P.USER_EDIT : P.TEACHER_EDIT;
    if (hasPermission(editPerm)) {
      options.push(
        {
          value: 'editTeacher',
          label: 'Edit',
          icon: Edit,
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          hover: 'hover:bg-blue-100',
        },
        {
          value: 'toggleStatus',
          label: teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
          icon: Power,
          text: teacher.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600',
          bg: teacher.status === 'ACTIVE' ? 'bg-red-50' : 'bg-green-50',
          hover:
            teacher.status === 'ACTIVE'
              ? 'hover:bg-red-100'
              : 'hover:bg-green-100',
        }
      );
    }
    return options;
  };

  const tableColSpan = isUserTable ? 4 : (isPayrollEnabled ? 9 : 8);

  return (
    <>
      {/* ── MOBILE CARDS (< 1024px) ──────────────────────────────────────── */}
      <div className="lg:hidden space-y-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                Loading {isUserTable ? 'users' : 'teachers'}...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserRoundXIcon className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Error Loading {isUserTable ? 'Users' : 'Teachers'}
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : !teachers?.length ? (
          <NoDataFound
            message={`No ${isUserTable ? 'users' : 'teachers'} found`}
          />
        ) : (
          teachers.map((teacher) => {
            const isActive = teacher.status === 'ACTIVE';
            const isSelected = isActive && selectedTeacherId === teacher.id;

            return (
              <div
                key={teacher.id}
                onClick={() => {
                  if (!isUserTable && isActive && onRowSelect) onRowSelect(teacher);
                }}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all ${isActive ? 'cursor-pointer hover:shadow-md' : 'cursor-default'
                  } ${isSelected
                    ? 'border-blue-400 ring-1 ring-blue-300 bg-blue-50/40'
                    : 'border-gray-200'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {!isUserTable && isActive && (
                      <div
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all ${isSelected
                          ? 'bg-blue-600 border-blue-600'
                          : 'border-gray-300 bg-white'
                          }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-2.5 h-2.5 text-white"
                            viewBox="0 0 12 12"
                            fill="none"
                          >
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    {resolveTeacherImage(teacher) ? (
                      <img
                        src={resolveTeacherImage(teacher)}
                        alt={resolveTeacherName(teacher)}
                        className="w-10 h-10 rounded-full object-cover shrink-0 overflow-hidden"
                      />
                    ) : (
                      <div
                        className={`w-9 h-9 rounded-full ${getAvatarColor(
                          resolveTeacherName(teacher)
                        )} flex items-center justify-center text-white text-sm font-semibold shrink-0`}
                      >
                        {resolveTeacherAvatar(teacher)}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {teacher.name}
                      </h3>
                      <p className="text-sm text-gray-500">{teacher.role}</p>
                      {teacher.employeeCode && (
                        <p className="text-xs text-gray-400 mt-1">
                          {teacher.employeeCode}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                      }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE'
                        ? 'bg-green-500'
                        : 'bg-red-500'
                        }`}
                    />
                    {teacher.status}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Mobile:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {teacher.mobile}
                    </span>
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
                  {!isUserTable && teacher.salaryType && isPayrollEnabled && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        Salary Type:
                      </span>
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
                  {!isUserTable && teacher.payroll && isPayrollEnabled && (
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
                      <span className="text-sm text-gray-500">
                        Joining Date:
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {teacher.joiningDate}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center gap-2 pt-3 border-t border-gray-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1">
                    <ActionDropDownComp
                      actionOptions={getActionOptions(teacher)}
                      onAction={(optVal) => callAllActions(optVal, teacher)}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── DESKTOP TABLE (≥ 1024px) ─────────────────────────────────────── */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto min-h-[calc(250px)] max-h-[calc(100vh-400px)] overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
              <tr>
                {!isUserTable && <th className="w-10 pl-4 pr-1 py-2" />}
                <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isUserTable ? 'User Name' : 'Full Name'}
                </th>
                <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mobile Number
                </th>
                {!isUserTable && isPayrollEnabled && (
                  <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary Type
                  </th>
                )}
                <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                {!isUserTable && (
                  <>
                    <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    {isPayrollEnabled && (
                      <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payroll
                      </th>
                    )}
                    <th className="px-2 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joining Date
                    </th>
                  </>
                )}
                <th className="px-2 py-2.5 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <ListLoader rows={7} />
              ) : error ? (
                <tr>
                  <td
                    colSpan={tableColSpan}
                    className="px-6 py-8 text-center"
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserRoundXIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      Error Loading {isUserTable ? 'Users' : 'Teachers'}
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : !teachers?.length ? (
                <tr>
                  <td colSpan={tableColSpan}>
                    <NoDataFound
                      message={`No ${isUserTable ? 'users' : 'teachers'} found`}
                    />
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const isActive = teacher.status === 'ACTIVE';
                  const isSelected = isActive && selectedTeacherId === teacher.id;
                  const isVisibleCheckbox =
                    isActive && (isSelected || hoveredId === teacher.id);

                  return (
                    <tr
                      key={teacher.id}
                      onMouseEnter={() =>
                        !isUserTable && isActive && setHoveredId(teacher.id)
                      }
                      onMouseLeave={() => !isUserTable && setHoveredId(null)}
                      onClick={() => {
                        if (!isUserTable && isActive && onRowSelect) onRowSelect(teacher);
                      }}
                      className={`transition-colors duration-100 py-0 ${isActive ? 'cursor-pointer' : 'cursor-default'
                        } ${isSelected
                          ? 'bg-blue-50'
                          : hoveredId === teacher.id && isActive
                            ? 'bg-gray-50'
                            : 'bg-white'
                        }`}
                    >
                      {!isUserTable && (
                        <td className="pl-4 pr-1 py-2 w-10">
                          {isActive && (
                            <div
                              className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-100 select-none ${isSelected
                                ? 'bg-blue-600 border-blue-600'
                                : isVisibleCheckbox
                                  ? 'border-gray-400 bg-white hover:border-blue-400'
                                  : 'border-transparent bg-transparent'
                                }`}
                            >
                              {isSelected && (
                                <svg
                                  className="w-2.5 h-2.5 text-white"
                                  viewBox="0 0 12 12"
                                  fill="none"
                                >
                                  <path
                                    d="M2 6l3 3 5-5"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </div>
                          )}
                        </td>
                      )}

                      <td className="px-6 py-2 whitespace-nowrap">
                        <div className="flex items-center gap-3 border border-transparent rounded transition-colors">
                          {resolveTeacherImage(teacher) ? (
                            <img
                              src={resolveTeacherImage(teacher)}
                              alt={resolveTeacherName(teacher)}
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0 ${getAvatarColor(
                                resolveTeacherName(teacher)
                              )}`}
                            >
                              {resolveTeacherAvatar(teacher)}
                            </div>
                          )}
                          <div>
                            <div className="text-xs font-medium text-gray-900">
                              {resolveTeacherName(teacher)}
                            </div>
                            <div className="text-[10px] font-medium text-gray-800 bg-gray-100 w-fit rounded-sm px-1">
                              {teacher.employeeCode}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                        {teacher.mobile}
                      </td>

                      {!isUserTable && isPayrollEnabled && (
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-block px-3 py-1 text-xs rounded-full ${teacher.salaryType === 'MONTHLY'
                              ? 'bg-teal-50 text-teal-700'
                              : 'bg-yellow-50 text-yellow-700'
                              }`}
                          >
                            {teacher.salaryType}
                          </span>
                        </td>
                      )}

                      <td className="px-3 py-2 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE'
                              ? 'bg-green-500'
                              : 'bg-red-500'
                              }`}
                          />
                          {teacher.status}
                        </span>
                      </td>

                      {!isUserTable && (
                        <>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span
                              className={`inline-block px-3 py-1 text-xs rounded ${teacher.attendance === 'ALLOWED'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                                }`}
                            >
                              {teacher.attendance}
                            </span>
                          </td>
                          {isPayrollEnabled && (
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span
                                className={`inline-block px-3 py-1 text-xs rounded ${teacher.payroll === 'INCLUDED'
                                  ? 'bg-teal-50 text-teal-700'
                                  : 'bg-gray-100 text-gray-700'
                                  }`}
                              >
                                {teacher.payroll}
                              </span>
                            </td>
                          )}
                          <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                            {teacher.joiningDate}
                          </td>
                        </>
                      )}

                      <td
                        className="px-3 py-2 whitespace-nowrap text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ActionDropDownComp
                          actionOptions={getActionOptions(teacher)}
                          onAction={(optVal) => callAllActions(optVal, teacher)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Desktop Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-700">
              {totalElements > 0 ? (
                <>
                  Showing {(page - 1) * rowsPerPage + 1} to{' '}
                  {Math.min(page * rowsPerPage, totalElements)} of{' '}
                  {totalElements}
                </>
              ) : (
                'No records found'
              )}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading || !!error || totalElements === 0}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {(() => {
              if (!totalPages || totalPages <= 1) return null;

              const base =
                'min-w-[28px] h-7 px-1.5 rounded text-xs transition-all font-medium';

              const active = 'bg-blue-500 text-white';
              const inactive = 'text-gray-600 hover:bg-gray-100';

              const btn = (num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`${base} ${page === num ? active : inactive}`}
                >
                  {num}
                </button>
              );

              const dots = (key) => (
                <span
                  key={key}
                  className="min-w-[28px] h-7 flex items-center justify-center text-gray-400 text-xs select-none"
                >
                  …
                </span>
              );

              if (totalPages <= 7) {
                return Array.from({ length: totalPages }, (_, i) =>
                  btn(i + 1)
                );
              }

              const pages = new Set([
                1,
                2,
                totalPages - 1,
                totalPages,
              ]);

              for (
                let i = Math.max(1, page - 1);
                i <= Math.min(totalPages, page + 1);
                i++
              ) {
                pages.add(i);
              }

              const sorted = Array.from(pages).sort((a, b) => a - b);

              return sorted.reduce((acc, num, idx) => {
                if (
                  idx > 0 &&
                  num - sorted[idx - 1] > 1
                ) {
                  acc.push(dots(`d${idx}`));
                }

                acc.push(btn(num));

                return acc;
              }, []);
            })()}

            <button
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
              disabled={
                page === totalPages ||
                loading ||
                !!error ||
                totalElements === 0
              }
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
          <div className="text-center text-sm text-gray-700">
            {totalElements > 0 ? (
              <>
                Showing {(page - 1) * rowsPerPage + 1} –{' '}
                {Math.min(page * rowsPerPage, totalElements)} of {totalElements}
              </>
            ) : (
              'No records found'
            )}
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading || !!error || totalElements === 0}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {totalPages <= 5 ? (
                [...Array(totalPages || 0)].map((_, idx) => (
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
                    className={`px-3 py-1 rounded ${page === 1
                      ? 'bg-blue-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
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
                  {page < totalPages - 2 && (
                    <span className="px-2 text-gray-400">...</span>
                  )}
                  <button
                    onClick={() => setPage(totalPages)}
                    className={`px-3 py-1 rounded ${page === totalPages
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={
                page === totalPages || loading || !!error || totalElements === 0
              }
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">
            Page {page} of {totalPages || 1}
          </div>
        </div>
      </div>
    </>
  );
};

export default TeachersTable;