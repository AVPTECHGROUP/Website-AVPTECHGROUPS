import { useEffect, useMemo, useRef, useState } from 'react';
import { KeyIcon } from 'lucide-react';
import { toast } from 'react-toastify';
import { getTeachers, getTeacherStatistics, searchTeachers } from '../../Api/TeachersAPI';
import { getClasses } from '../../Api/TeachersAPI';
import TeachersHeader from '../../Components/Teacher/ManagementComponents/TeachersHeader';
import QuickActions from '../../Components/Teacher/ManagementComponents/QuickActions';
import TeachersFilters from '../../Components/Teacher/ManagementComponents/TeachersFilters';
import TeachersTable from '../../Components/Teacher/ManagementComponents/TeachersTable';
import PasswordResetModal from '../../Components/PopupResetPassword/ResetPasswordComponent';
import { resetUserPassword } from '../../Api/userManagementAPI';


const Teachers = () => {

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
      const data = await getClasses();
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

  // ── Row Selection Handler ─────────────────────────────────────────────────
  // Single-select: same row clicked again → deselect. Different row → replace.
  const handleRowSelect = (teacher) => {
    setSelectedTeacher((prev) => (prev?.id === teacher.id ? null : teacher));
  };

  // ── Reset Password API (same pattern as ManageAllUsers) ───────────────────
  const resetPassword = async (id) => {
    try {
      return await resetUserPassword(id);
    } catch (err) {
      toast.error(err.message || 'Reset password failed');
    }
  };

  // FETCH ON DEPENDENCY CHANGE
  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, debouncedSearch, statusFilter, classFilter, salaryFilter, hasActiveFilters]);

  // FETCH STATISTICS AND CLASSES ONCE ON MOUNT
  useEffect(() => {
    fetchStatistics();
    fetchClasses();
  }, []);

  // BUILD STATS OBJECT
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

        {/* COMPONENT 1: Header with Stats */}
        <TeachersHeader stats={stats} loading={statsLoading} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-4">

          <div className="flex items-center gap-3 mb-4">

            <QuickActions
              teacherId={selectedTeacher?.id ?? null}
              onResetPassword={() => setIsResetOpen(true)}
            />
          </div>

          {/* COMPONENT 3: Filters with Search */}
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
            assignTeacherId={() => { }}   // kept for backward compat
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

        {/* ── Reset Password Modal ────────────────────────────────────────── */}
        {/* Exact same integration as ManageAllUsers.jsx */}
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