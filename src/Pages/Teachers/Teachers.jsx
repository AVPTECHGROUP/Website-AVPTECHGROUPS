import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTeachers, getTeacherStatistics, searchTeachers } from '../../Api/Teachers/TeachersAPI';
import { getActiveClasses } from '../../Api/Teachers/TeachersAPI';
import TeachersHeader from '../../Components/Teacher/ManagementComponents/TeachersHeader';
import QuickActions from '../../Components/Teacher/ManagementComponents/QuickActions';
import TeachersFilters from '../../Components/Teacher/ManagementComponents/TeachersFilters';
import TeachersTable from '../../Components/Teacher/ManagementComponents/TeachersTable';
import PasswordResetModal from '../../Components/PopupResetPassword/ResetPasswordComponent';
import { resetUserPassword } from '../../Api/StaffManagement/UserManagementAPI';
import TEACHER_MODULE_STRINGS from '../../Constants/StringConstants/TeacherConstants';

const Teachers = () => {
  const strings = TEACHER_MODULE_STRINGS;
  // Search and Filters
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [classFilter, setClassFilter] = useState('All Classes');
  const [salaryFilter, setSalaryFilter] = useState('All Salary Types');

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Data State
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Classes State
  const [classes, setClasses] = useState([]);

  // Statistics State
  const [statistics, setStatistics] = useState({
    totalTeachers: 0,
    activeTeachers: 0,
    inactiveTeachers: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  const [selectedTeacher, setSelectedTeacher] = useState(null);

  // ── Reset Password Modal ──────────────────────────────────────────────────
  const [isResetOpen, setIsResetOpen] = useState(false);

  // Ref for scroll-to-top on page change
  const scrollContainerRef = useRef(null);

  // DEBOUNCED SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // SCROLL TO TOP WHEN PAGE CHANGES
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [page]);

  // CHECK IF FILTERS ARE ACTIVE
  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.trim() !== '' ||
      statusFilter !== 'All Status' ||
      classFilter !== 'All Classes' ||
      salaryFilter !== 'All Salary Types'
    );
  }, [debouncedSearch, statusFilter, classFilter, salaryFilter]);

  // FETCH CLASSES FROM API
  const fetchClasses = async () => {
    try {
      const data = await getActiveClasses();
      setClasses(data);
    } catch (e) {
      console.error('fetchClasses error:', e.message);
    }
  };

  // FETCH TEACHERS
  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;

      if (hasActiveFilters) {
        const filters = {};
        if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();
        if (statusFilter !== 'All Status') filters.status = statusFilter.toUpperCase();
        if (classFilter !== 'All Classes') {
          filters.classId = Number(classFilter);
        }
        if (salaryFilter !== 'All Salary Types') {
          const salaryMap = {
            'Monthly': 'MONTHLY',
            'Per Day': 'PER_DAY',
          };
          filters.salaryType = salaryMap[salaryFilter];
        }

        res = await searchTeachers(filters, page - 1, rowsPerPage);
      } else {
        res = await getTeachers(page - 1, rowsPerPage);
      }

      const teacherArray = res.data || [];

      const mappedTeachers = teacherArray.map((teacher) => ({
        id: teacher.id,
        userId: teacher.userId,
        employeeCode: teacher.employeeCode || 'N/A',
        name: teacher.fullName || 'Unknown',
        avatar: (teacher.fullName || 'U')[0].toUpperCase(),
        image:
          teacher.profileImageUrl ||
          teacher.imageUrl ||
          teacher.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            teacher.fullName || 'User'
          )}&background=random`,
        role: teacher.designation || 'Teacher',
        mobile: teacher.mobile || 'N/A',
        classes: teacher.assignedClasses
          ? teacher.assignedClasses.split(',').map((c) => c.trim())
          : [],
        subjects: teacher.assignedSubjects
          ? teacher.assignedSubjects.split(',').map((s) => s.trim())
          : [],
        salaryType: teacher.salaryType || 'MONTHLY',
        status: teacher.status || 'ACTIVE',
        attendance: teacher.attendanceAccessStatus || 'ALLOWED',
        payroll: teacher.payrollStatus || 'INCLUDED',
        joiningDate: teacher.joiningDate || 'N/A',
      }));

      setTeachers(mappedTeachers);
      setTotalElements(res.pagination?.totalElements || 0);
      setTotalPages(res.pagination?.totalPages || 0);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err.message || 'Something went wrong');
      setTeachers([]);
    } finally {
      setLoading(false);
    }
  };

  // FETCH STATISTICS
  const fetchStatistics = async () => {
    setStatsLoading(true);
    try {
      const statistics_res = await getTeacherStatistics();
      setStatistics(statistics_res.data);
    } catch (e) {
      console.error('Get statistics error:', e.message);
    } finally {
      setStatsLoading(false);
    }
  };

  // OPTIMISTIC STATISTICS UPDATE — called by TeachersTable on toggle
  const updateStatisticsOptimistically = (prevStatus) => {
    setStatistics((prev) => {
      if (prevStatus === 'ACTIVE') {
        return {
          ...prev,
          activeTeachers: Math.max(0, prev.activeTeachers - 1),
          inactiveTeachers: prev.inactiveTeachers + 1,
        };
      } else {
        return {
          ...prev,
          activeTeachers: prev.activeTeachers + 1,
          inactiveTeachers: Math.max(0, prev.inactiveTeachers - 1),
        };
      }
    });
  };

  const handleRowSelect = (teacher) => {
    setSelectedTeacher((prev) => (prev?.id === teacher.id ? null : teacher));
  };

  const resetPassword = async (id) => {
    try {
      return await resetUserPassword(id);
    } catch (err) {
      toast.error(err.message || strings.COMMON.RETRY);
    }
  };

  // ── CSV CELL ESCAPING HELPER ─────────────────────────────────────────────
  const csvCell = (val) => {
    const str = val == null ? '' : String(val).trim();
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // ── EXPORT CSV LOGIC FOR TEACHERS ────────────────────────────────────────
  const handleExportTeachersCSV = () => {
    if (teachers.length === 0) {
      toast.info(strings.TEACHERS_LIST.EXPORT_INFO);
      return;
    }

    // Header structure according to the table fields
    const HEADERS = strings.TEACHERS_LIST.TABLE_HEADERS;

    // Mapping over current paginated mapped teachers array
    const dataRows = teachers.map((t) =>
      [
        csvCell(t.name),
        csvCell(t.employeeCode),
        csvCell(t.role),
        csvCell(t.mobile),
        csvCell(t.classes.join(' | ')), // Multiple classes separated by pipe operator
        csvCell(t.salaryType),
        csvCell(t.status),
        csvCell(t.attendance),
        csvCell(t.payroll),
        csvCell(t.joiningDate),
      ].join(',')
    );

    const csvString = [HEADERS.join(','), ...dataRows].join('\n');
    const blob = new Blob(['\uFEFF' + csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    const date = new Date().toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `teachers_page${page}of${totalPages}_${rowsPerPage}rows_${date}.csv`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);

    toast.success(strings.TEACHERS_LIST.EXPORT_SUCCESS.replace('{count}', teachers.length).replace('{plural}', teachers.length !== 1 ? 's' : '').replace('{page}', page).replace('{totalPages}', totalPages));
  };

  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, debouncedSearch, statusFilter, classFilter, salaryFilter, hasActiveFilters]);

  useEffect(() => {
    fetchStatistics();
    fetchClasses();
  }, []);

  const total = statistics.totalTeachers || 0;
  const active = statistics.activeTeachers || 0;
  const inActive = statistics.inactiveTeachers || 0;
  const activePercent = total > 0 ? Math.round((active / total) * 100) : 0;
  const inActivePercent = total > 0 ? Math.round((inActive / total) * 100) : 0;

  const stats = {
    total,
    active,
    activePercent,
    inActive,
    inActivePercent,
    monthlyTeachers: statistics.monthlyTeachers || 0,
    perDayTeachers: statistics.perDayTeachers || 0,
  };

  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
      <div ref={scrollContainerRef} className="flex-1 overflow-auto w-0">

        <TeachersHeader stats={stats} loading={statsLoading} />

        <div className="flex-1 overflow-auto p-4 pt-0 sm:p-5 sm:pt-0 lg:p-4 lg:pt-0">
          <div className="flex items-center gap-2">
            {/* Passed handleExportTeachersCSV handler into QuickActions component */}
            <QuickActions
              teacherId={selectedTeacher?.id ?? null}
              onResetPassword={() => setIsResetOpen(true)}
              onExportCSV={handleExportTeachersCSV}
            />
          </div>

          <TeachersFilters
            search={search}
            setSearch={setSearch}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            classFilter={classFilter}
            setClassFilter={setClassFilter}
            salaryFilter={salaryFilter}
            setSalaryFilter={setSalaryFilter}
            setPage={setPage}
            classes={classes}
          />

          <TeachersTable
            selectedTeacherId={selectedTeacher?.id ?? null}
            onRowSelect={handleRowSelect}
            assignTeacherId={() => { }}
            teachers={teachers}
            setTeachers={setTeachers}
            loading={loading}
            error={error}
            page={page}
            setPage={setPage}
            rowsPerPage={rowsPerPage}
            setRowsPerPage={setRowsPerPage}
            totalElements={totalElements}
            totalPages={totalPages}
            fetchTeachers={fetchTeachers}
            onStatusToggle={updateStatisticsOptimistically}
          />
        </div>

        <PasswordResetModal
          isOpen={isResetOpen}
          onClose={() => setIsResetOpen(false)}
          userName={selectedTeacher?.name}
          onReset={() => resetPassword(selectedTeacher?.userId)}
          currUserId={selectedTeacher?.userId}
        />

      </div>
    </div>
  );
};

export default Teachers;