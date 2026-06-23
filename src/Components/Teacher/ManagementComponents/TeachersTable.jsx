import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { activateStatus, deactivateStatus } from '../../../Api/TeachersAPI';
import ActionDropDownComp from '../../CommonComp/ActionDropDownComp';
import ListLoader from '../../CommonComp/ListLoader';

const TeachersTable = ({
  // ── NEW: selection props ─────────────────────────────────────────────────
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

  // Which row id is currently being hovered (desktop only — drives checkbox visibility)
  const [hoveredId, setHoveredId] = useState(null);

  const getAvatarColor = (name) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500',
    ];
    return colors[(name?.charCodeAt(0) ?? 0) % colors.length];
  };

  const resolveTeacherName = (teacher) => teacher.name || teacher.fullName || 'User';
  const resolveTeacherImage = (teacher) => teacher.profileImageUrl || teacher.image || '';
  const resolveTeacherAvatar = (teacher) => teacher.avatar || (resolveTeacherName(teacher)[0] || 'U').toUpperCase();

  const handleToggleStatus = async (teacher) => {
    // 1. Optimistic row flip
    setTeachers((prev) =>
      prev.map((t) =>
        t.id === teacher.id
          ? { ...t, status: t.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' }
          : t
      )
    );
    // 2. Optimistic stat card update
    if (onStatusToggle) onStatusToggle(teacher.status);

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
      // 3. Rollback on failure
      fetchTeachers();
      if (onStatusToggle) onStatusToggle(teacher.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE');
    }
  };

  const NoDataFound = ({ message = 'No data found' }) => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Inbox className="w-7 h-7 text-gray-500" />
      </div>
      <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
      <p className="text-sm text-gray-500 mt-1">Try adjusting filters or add new records</p>
    </div>
  );

  const callAllActions =
    propCallAllActions ||
    (async (optVal, teacher) => {
      if (optVal === 'view') navigate(`/teachers/${teacher.id}`);
      else if (optVal === 'editTeacher') navigate(`/teachers/editTeacher/${teacher.id}`);
      else if (optVal === 'toogleStatus' || optVal === 'toggleStatus') handleToggleStatus(teacher);
    });

  const getActionOptions = (teacher) => {
    if (propActionOptions) return propActionOptions;
    return [
      { value: 'view', label: 'View', icon: Eye, text: 'text-gray-600', bg: 'bg-blue-50', hover: 'hover:bg-gray-200' },
      { value: 'editTeacher', label: 'Edit', icon: Edit, text: 'text-blue-600', bg: 'bg-blue-50', hover: 'hover:bg-blue-100' },
      {
        value: 'toogleStatus',
        label: teacher.status === 'ACTIVE' ? 'Deactivate' : 'Activate',
        icon: Power,
        text: teacher.status === 'ACTIVE' ? 'text-red-600' : 'text-green-600',
        bg: teacher.status === 'ACTIVE' ? 'bg-red-50' : 'bg-green-50',
        hover: teacher.status === 'ACTIVE' ? 'hover:bg-red-100' : 'hover:bg-green-100',
      },
    ];
  };

  // ── Checkbox cell ────────────────────────────────────────────────────────
  // Visible only when the row is hovered OR already selected.
  // Clicking it triggers onRowSelect (single-select logic lives in Teachers.jsx).
  const CheckboxCell = ({ teacher }) => {
    const isSelected = selectedTeacherId === teacher.id;
    // Show the box only on hover or when selected — otherwise invisible (keeps row clean)
    const isVisible = isSelected || hoveredId === teacher.id;

    return (
      <td
        className="pl-4 pr-1 py-4 w-10"
        onClick={(e) => {
          e.stopPropagation(); // prevent row's onClick from double-firing
          if (!isUserTable && onRowSelect) onRowSelect(teacher);
        }}
      >
        <div
          className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-100 cursor-pointer select-none
            ${isSelected
              ? 'bg-blue-600 border-blue-600'
              : isVisible
                ? 'border-gray-400 bg-white hover:border-blue-400'
                : 'border-transparent bg-transparent'
            }`}
        >
          {isSelected && (
            <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
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
      </td>
    );
  };

  return (
    <>
      {/* ── MOBILE CARDS (< 1024px) ──────────────────────────────────────── */}
      <div className="lg:hidden space-y-4 mb-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
          </div>
        ) : teachers.length === 0 ? (
          <NoDataFound message={`No ${isUserTable ? 'users' : 'teachers'} found`} />
        ) : (
          teachers.map((teacher) => {
            const isSelected = selectedTeacherId === teacher.id;
            return (
              <div
                key={teacher.id}
                onClick={() => { if (!isUserTable && onRowSelect) onRowSelect(teacher); }}
                className={`bg-white rounded-xl border p-4 shadow-sm transition-all cursor-pointer
                  ${isSelected
                    ? 'border-blue-400 ring-1 ring-blue-300 bg-blue-50/40'
                    : 'border-gray-200 hover:shadow-md'
                  }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {/* Checkbox indicator on mobile */}
                    {!isUserTable && (
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all
                        ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-gray-300 bg-white'}`}
                      >
                        {isSelected && (
                          <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                    )}
                    {resolveTeacherImage(teacher) ? (
                      <img
                        src={resolveTeacherImage(teacher)}
                        alt={resolveTeacherName(teacher)}
                        className="
        w-10
        h-10
        rounded-full
        object-cover
        shrink-0
        overflow-hidden
    "
                      />
                    ) : null}
                    <div className={`w-9 h-9 rounded-full ${getAvatarColor(resolveTeacherName(teacher))} flex items-center justify-center text-white text-sm font-semibold shrink-0 ${resolveTeacherImage(teacher) ? 'hidden' : ''}`}
                      style={resolveTeacherImage(teacher) ? { display: 'none' } : {}}>
                      {resolveTeacherAvatar(teacher)}
                    </div>
                    {/* <div className={`w-12 h-12 rounded-full ${getAvatarColor(teacher.name)} flex items-center justify-center text-white font-semibold`}>
                      {teacher.avatar}
                    </div> */}
                    <div>
                      <h3 className="font-semibold text-gray-900">{teacher.name}</h3>
                      <p className="text-sm text-gray-500">{teacher.role}</p>
                      {teacher.employeeCode && <p className="text-xs text-gray-400 mt-1">{teacher.employeeCode}</p>}
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    {teacher.status}
                  </span>
                </div>

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
                          <span key={idx} className="inline-block px-2 py-0.5 text-xs bg-blue-50 text-blue-600 rounded">{cls}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {!isUserTable && teacher.salaryType && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Salary Type:</span>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded-full ${teacher.salaryType === 'MONTHLY' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>
                        {teacher.salaryType}
                      </span>
                    </div>
                  )}
                  {!isUserTable && teacher.attendance && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Attendance:</span>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.attendance === 'ALLOWED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                        {teacher.attendance}
                      </span>
                    </div>
                  )}
                  {!isUserTable && teacher.payroll && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Payroll:</span>
                      <span className={`inline-block px-2.5 py-1 text-xs rounded ${teacher.payroll === 'INCLUDED' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>
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

                {/* Stop card click when interacting with the action dropdown */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <div className="flex-1">
                    <ActionDropDownComp actionOptions={getActionOptions(teacher)} onAction={(optVal) => callAllActions(optVal, teacher)} />
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
            <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10 ">
              <tr>
                {/* Empty header cell for the checkbox column */}
                {!isUserTable && <th className="w-10 pl-4 pr-1 py-3" />}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {isUserTable ? 'User Name' : 'Full Name'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mobile Number</th>
                {!isUserTable && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Salary Type</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                {!isUserTable && (
                  <>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payroll</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joining Date</th>
                  </>
                )}
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <ListLoader />
              ) : error ? (
                <tr>
                  <td colSpan={isUserTable ? 4 : 10} className="px-6 py-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserRoundXIcon className="w-6 h-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading {isUserTable ? 'Users' : 'Teachers'}</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                  </td>
                </tr>
              ) : teachers.length === 0 ? (
                <tr>
                  <td colSpan={isUserTable ? 4 : 10}>
                    <NoDataFound message={`No ${isUserTable ? 'users' : 'teachers'} found`} />
                  </td>
                </tr>
              ) : (
                teachers.map((teacher) => {
                  const isSelected = selectedTeacherId === teacher.id;
                  return (
                    <tr
                      key={teacher.id}
                      onMouseEnter={() => !isUserTable && setHoveredId(teacher.id)}
                      onMouseLeave={() => !isUserTable && setHoveredId(null)}
                      className={`transition-colors duration-100
                        ${isSelected ? 'bg-blue-50' : hoveredId === teacher.id ? 'bg-gray-50' : 'bg-white'}`}
                    >
                      {/* ── Checkbox cell — hover-only visibility ── */}
                      {!isUserTable && <CheckboxCell teacher={teacher} />}

                      {/* ── Full Name ── */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3 border border-transparent hover:border-gray-300 rounded transition-colors cursor-pointer">
                          {resolveTeacherImage(teacher) ? (
                            <img
                              src={resolveTeacherImage(teacher)}
                              alt={resolveTeacherName(teacher)}
                              className="
            w-10
            h-10
            rounded-full
            object-cover
            shrink-0
        "
                            />
                          ) : (
                            <div
                              className={`
            w-10
            h-10
            rounded-full
            ${getAvatarColor(resolveTeacherName(teacher))}
            flex
            items-center
            justify-center
            text-white
            text-sm
            font-semibold
            shrink-0
        `}
                            >
                              {resolveTeacherAvatar(teacher)}
                            </div>
                          )}
                          <div className={`w-10 h-10 rounded-full ${getAvatarColor(resolveTeacherName(teacher))} flex items-center justify-center text-white text-sm font-semibold shrink-0 ${resolveTeacherImage(teacher) ? 'hidden' : ''}`}
                            style={resolveTeacherImage(teacher) ? { display: 'none' } : {}}>
                            {resolveTeacherAvatar(teacher)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{resolveTeacherName(teacher)}</div>
                            <div className="text-xs font-medium text-gray-800 bg-gray-100 w-fit rounded-xs px-1 py-0.5">{teacher.employeeCode}</div>
                          </div>
                        </div>
                      </td>

                      {/* ── Mobile ── */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.mobile}</td>

                      {/* ── Salary Type ── */}
                      {!isUserTable && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 text-xs rounded-full ${teacher.salaryType === 'MONTHLY' ? 'bg-teal-50 text-teal-700' : 'bg-yellow-50 text-yellow-700'}`}>
                            {teacher.salaryType}
                          </span>
                        </td>
                      )}

                      {/* ── Status ── */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${teacher.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                          {teacher.status}
                        </span>
                      </td>

                      {/* ── Attendance / Payroll / Joining Date ── */}
                      {!isUserTable && (
                        <>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 text-xs rounded ${teacher.attendance === 'ALLOWED' ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {teacher.attendance}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-block px-3 py-1 text-xs rounded ${teacher.payroll === 'INCLUDED' ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-700'}`}>
                              {teacher.payroll}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{teacher.joiningDate}</td>
                        </>
                      )}

                      {/* ── Actions — stop row click propagation ── */}
                      <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
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
              Showing {(page - 1) * rowsPerPage + 1} to {Math.min(page * rowsPerPage, totalElements)} of {totalElements}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-700">Rows per page:</span>
              <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading || !!error}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {[...Array(totalPages)].map((_, idx) => (
              <button key={idx + 1} onClick={() => setPage(idx + 1)}
                className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                {idx + 1}
              </button>
            ))}
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading || !!error}
              className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Pagination */}
      <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col gap-4">
          <div className="text-center text-sm text-gray-700">
            Showing {(page - 1) * rowsPerPage + 1} – {Math.min(page * rowsPerPage, totalElements)} of {totalElements}
          </div>
          <div className="flex items-center justify-center gap-2">
            <span className="text-sm text-gray-700">Rows:</span>
            <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading || !!error}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1">
              {totalPages <= 5 ? (
                [...Array(totalPages)].map((_, idx) => (
                  <button key={idx + 1} onClick={() => setPage(idx + 1)}
                    className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                    {idx + 1}
                  </button>
                ))
              ) : (
                <>
                  <button onClick={() => setPage(1)} className={`px-3 py-1 rounded ${page === 1 ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>1</button>
                  {page > 3 && <span className="px-2 text-gray-400">...</span>}
                  {page > 2 && page < totalPages - 1 && (
                    <button onClick={() => setPage(page)} className="px-3 py-1 rounded bg-blue-500 text-white">{page}</button>
                  )}
                  {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                  <button onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded ${page === totalPages ? 'bg-blue-500 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>{totalPages}</button>
                </>
              )}
            </div>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || loading || !!error}
              className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center text-sm text-gray-600">Page {page} of {totalPages}</div>
        </div>
      </div>
    </>
  );
};

export default TeachersTable;