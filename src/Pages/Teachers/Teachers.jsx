import { useEffect, useMemo, useState } from 'react';
import { getTeachers, searchTeachers } from '../../Api/TeachersAPI';
import TeachersHeader from '../../Components/Teacher/ManagementComponents/TeachersHeader';
import QuickActions from '../../Components/Teacher/ManagementComponents/QuickActions';
import TeachersFilters from '../../Components/Teacher/ManagementComponents/TeachersFilters';
import TeachersTable from '../../Components/Teacher/ManagementComponents/TeachersTable';

const Teachers = () => {

  // STATE MANAGEMENT 
   const [refressStat, setRefressStat] = useState(0);
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

  // UI State
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Data State
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [classAssignTeacherId, setClassAssignTeacherId] = useState(null);
  // DEBOUNCED SEARCH
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // CHECK IF FILTERS ARE ACTIVE

  const hasActiveFilters = useMemo(() => {
    return (
      debouncedSearch.trim() !== '' ||
      statusFilter !== 'All Status' ||
      classFilter !== 'All Classes' ||
      salaryFilter !== 'All Salary Types'
    );
  }, [debouncedSearch, statusFilter, classFilter, salaryFilter]);

  // FETCH TEACHERS API CALL

  const fetchTeachers = async () => {
    setLoading(true);
    setError(null);

    try {
      let res;

      if (hasActiveFilters) {
        const filters = {};

        if (debouncedSearch.trim()) filters.searchTerm = debouncedSearch.trim();
        if (statusFilter !== 'All Status') filters.status = statusFilter.toUpperCase();
        if (classFilter !== 'All Classes') filters.assignedClasses = classFilter;
        if (salaryFilter !== 'All Salary Types') {
          filters.salaryType = salaryFilter === 'Monthly' ? 'MONTHLY' : 'PER_DAY';
        }

        res = await searchTeachers(filters, page - 1, rowsPerPage);
      } else {
        res = await getTeachers(page - 1, rowsPerPage);
      }

      const teacherArray = res.data || [];

      // Map API response to component-friendly format
      const mappedTeachers = teacherArray.map((teacher) => ({
        id: teacher.id,
        employeeCode: teacher.employeeCode || 'N/A',
        name: teacher.fullName || 'Unknown',
        avatar: (teacher.fullName || 'U')[0].toUpperCase(),
        image:
          teacher.imageUrl ||
          teacher.profileImage ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            teacher.fullName || 'User'
          )}&background=random`,
        role: teacher.designation || 'Teacher',
        mobile: teacher.mobile || 'N/A',
        classes: teacher.assignedClasses
          ? teacher.assignedClasses.split(',').map(c => c.trim())
          : [],
        subjects: teacher.assignedSubjects
          ? teacher.assignedSubjects.split(',').map(s => s.trim())
          : [],
        salaryType: teacher.salaryType || 'MONTHLY',
        status: teacher.status || 'ACTIVE',
        attendance: teacher.attendanceAccessStatus || 'ALLOWED',
        payroll: teacher.payrollStatus || 'INCLUDED',
        joiningDate: teacher.joiningDate || 'N/A'
      }));

      const filteredTeachers = mappedTeachers.filter(t => {
        if (classFilter !== 'All Classes' && !t.classes.includes(classFilter)) {
          return false;
        }
        if (salaryFilter !== 'All Salary Types' && t.salaryType !== (
          salaryFilter === 'Monthly' ? 'MONTHLY' : 'PER_DAY'
        )) {
          return false;
        }
        return true;
      });

      setTeachers(filteredTeachers);
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

  // FETCH ON DEPENDENCY CHANGE

  useEffect(() => {
    fetchTeachers();
  }, [page, rowsPerPage, debouncedSearch, statusFilter, classFilter, salaryFilter, hasActiveFilters]);

  // // CALCULATE STATISTICS
  const [statistics, setstatistics] = useState(
    {
      totalTeachers: 0,
      activeTeachers: 0,
      inactiveTeachers: 0,
      attendanceBlockedTeachers: 0
    }
  );

 const total = statistics.totalTeachers || 0;
  const active = statistics.activeTeachers || 0;
  const inActive = statistics.inactiveTeachers || 0;
  const payrollIncluded = teachers.filter(t => t.payroll === 'INCLUDED').length || 0;
  const attendanceBlocked = statistics.attendanceBlockedTeachers || 0;

  const stats = {
    total,
    active,
    activePercent: active,
    inActive,
    inActivePercent: inActive,
    payrollIncluded,
    attendanceBlocked
  };

  useEffect(() => {
    let fetchStatistics = async () => {
      try {
        const statistics_res = await getTeacherStatistics(); // for total statistics
        const res = statistics_res.data;
        setstatistics(res);
      }
      catch (e) {
        console.error("get statistics error:", e.message);
        throw error;
      }
    }
    setTimeout(()=>{
      fetchStatistics();
    },3000);
  }, [teachers])



  return (
    <div className="flex h-screen overflow-hidden bg-linear-to-b from-sky-50 to-sky-100">
      <div className="flex-1 overflow-auto w-0">
        
       {/* COMPONENT 1: Header with Stats */}
<TeachersHeader stats={stats} />

        {/* Page Content */}
        <div className="flex-1 overflow-auto p-4 sm:p-5 lg:p-4">
          {/* COMPONENT 2: Quick Actions */}
          <QuickActions teacherId={classAssignTeacherId} />

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
  />

          {/* COMPONENT 4: Table and Pagination */}
          <TeachersTable
            assignTeacherId={setClassAssignTeacherId}
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
          />
        </div>
      </div>
    </div>
  );
};

export default Teachers;