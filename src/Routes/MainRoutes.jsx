import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection — kept eager since they're needed on every route
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';
import RoleProtectedRoute from '../utils/RoleProtectedRoute';
import PermissionProtectedRoute from '../utils/PermissionProtectedRoute';
import { PERMISSIONS as P, SYSTEM_ROLES } from '../Constants/Permission';

// ─── Lazy-loaded Pages (code-split, fetched only when route is hit) ───────────
const Login = lazy(() => import('../Pages/Login_2'));
const Dashboard = lazy(() => import('../Pages/Dashboard'));
const Attendance = lazy(() => import('../Pages/Attendance/Attendance'));
const Leaves = lazy(() => import('../Pages/Leaves/Leaves'));
const Payroll = lazy(() => import('../Pages/Payroll'));
const Teachers = lazy(() => import('../Pages/Teachers/Teachers'));
const Settings = lazy(() => import('../Pages/Settings'));

// Attendance
const UsersAttendance = lazy(() => import('../Pages/Attendance/UsersAttendance'));
const MarkUserAttendance = lazy(() => import('../Pages/Attendance/MarkUserAttendance'));
const WarningVerificationFailed = lazy(() => import('../Components/UserAttendance/WarningVerificationFailed'));
const ManualAttendance = lazy(() => import('../Components/UserAttendance/ManualAttendanceRequest'));
const ExamConfiguration = lazy(() => import('../Pages/Exams/ExamConfiguration'));
const ClassSectionConfig = lazy(() => import('../Pages/Academics/ClassSectionConfig'));
const StudentAttendance = lazy(() => import('../Pages/Attendance/StudentAttendance/StudentAttendance'));
const StaffAttendanceRegistration = lazy(() => import('../Pages/Attendance/StaffAttendanceRegistration'));
const StudentAttendanceRegistration = lazy(() => import('../Pages/Attendance/StudentAttendanceRegistration'));

// Teachers
const DetailsView = lazy(() => import('../Pages/Teachers/DetailsView'));
const AddNewTeacher = lazy(() => import('../Pages/Teachers/AddNewTeacher'));
const EditTeachersDetails = lazy(() => import('../Pages/Teachers/EditTeachersDetaills'));
const ClassAssignment = lazy(() => import('../Pages/Teachers/ClassAssignment'));

// Super Admin / Global Admin
const AddnewSystemUser = lazy(() => import('../Pages/SuperAdmin/AddnewSystemUser'));
const EditSysUser = lazy(() => import('../Pages/SuperAdmin/EditSysUser'));
const ManageAllUsers = lazy(() => import('../Pages/SuperAdmin/ManageAllUsers'));
const ApplyLeaves = lazy(() => import('../Pages/Leaves/ApplyLeaves'));
const MyLeaves = lazy(() => import('../Pages/Leaves/MyLeaves'));
const SuperAdminSchools = lazy(() => import('../Pages/SuperAdmin/SuperAdminSchools'));

// Students
const Student = lazy(() => import('../Pages/Students/Students'));
const AddNewStudent = lazy(() => import('../Pages/Students/AddNewStudent'));
const EditStudentDetails = lazy(() => import('../Pages/Students/EditStudentDetails'));
const StudentDetails = lazy(() => import('../Pages/Students/StudentDetails'));
const HolidayManagment = lazy(() => import('../Pages/Leaves/Holiday/HolidayManagement'));
const LeaveConfig = lazy(() => import('../Pages/Leaves/LeaveConfig'));

// Stock Routes
const Stock = lazy(() => import('../Pages/Stock/Stock'));
const Store = lazy(() => import('../Pages/Stock/Stores'));
const Items = lazy(() => import('../Pages/Stock/Items'));
const Transactions = lazy(() => import('../Pages/Stock/Transactions'));
const Movement = lazy(() => import('../Pages/Stock/Movement'));
const ClassConfig = lazy(() => import('../Pages/Stock/ClassConfig/ClassConfig'));
const StudentOrders = lazy(() => import('../Pages/Stock/StudentOrders/StudentOrders'));
const CreateStudentOrder = lazy(() => import('../Pages/Stock/StudentOrders/CreateStudentOrder'));
const EditStudentOrder = lazy(() => import('../Pages/Stock/StudentOrders/EditStudentOrder'));

// Transport Routes
const Transport_Management = lazy(() => import('../Pages/Transport/Transport_Management'));
const Vehicles = lazy(() => import('../Pages/Transport/Vehicles'));
const Fee_Plans = lazy(() => import('../Pages/Transport/Fee_Plans/Fee_Plans'));
const Driver_Attendants = lazy(() => import('../Pages/Transport/Driver_Attendants'));
const Reports = lazy(() => import('../Pages/Transport/Reports/Reports'));
const Student_Allocations = lazy(() => import('../Pages/Transport/Student_Allocation/Student_Allocations'));
const Routes_Manage = lazy(() => import('../Pages/Transport/Routes_Manage'));

const SubjectsMaster = lazy(() => import('../Components/Subject/subject'));
const RolesPermissionsManagement = lazy(() => import('../Pages/RoleBasedPermission/PermissionManagement'));
const SectionSubjectAssignment = lazy(() => import('../Pages/SubjectManagement/SectionSubjectAssignment'));
const Exams = lazy(() => import('../Pages/Exams/Exams'));
const MarksEntry = lazy(() => import('../Pages/Exams/MarksEntry'));
const ReportCards = lazy(() => import('../Pages/Exams/ReportCards'));
const Analytics = lazy(() => import('../Pages/Exams/Analytics'));
const SchoolConfig = lazy(() => import('../Pages/Schools/SchoolConfig'));
const HomeworkPage = lazy(() => import('../Pages/Homework/Homeworkpage'));

// FeeManagement exports multiple named components from one module —
// each lazy() call still only loads the chunk once (cached by vite)
const OverviewPage = lazy(() =>
  import('../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.OverviewPage }))
);
const FeeSynthesisPage = lazy(() =>
  import('../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.FeeSynthesisPage }))
);
const CollectionsPage = lazy(() =>
  import('../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.CollectionsPage }))
);

const AcademicYear = lazy(() => import('../Pages/Attendance/AcademicYear/AcademicYear'));
const TimeTable = lazy(() => import('../Pages/Schedule/TimeTable'));
const CreateSchedule = lazy(() => import('../Pages/Schedule/CreateSchedule'));
const FeePeriods = lazy(() => import('../Pages/FeeManagement/FeePeriods'));
const FeeStructures = lazy(() => import('../Pages/FeeManagement/Feestructures.'));

// Public landing pages
const LandingApp = lazy(() => import('../Pages/SchoolSpineWeb/pages/Landing'));
const About = lazy(() => import('../Pages/SchoolSpineWeb/pages/About'));
const Contact = lazy(() => import('../Pages/SchoolSpineWeb/pages/Contact'));
const PrivacyPolicy = lazy(() => import('../Pages/SchoolSpineWeb/pages/Privacy_Policy'));
const LandingLayout = lazy(() => import('../Pages/SchoolSpineWeb/pages/LandingLayout'));
const Terms_Of_Service = lazy(() => import('../Pages/SchoolSpineWeb/pages/Terms'));
const Cookie_Policy = lazy(() => import('../Pages/SchoolSpineWeb/pages/CookiePolicy'));
const FaqListing = lazy(() => import('../Components/Homes/Faq/FaqLisitng'));

// Circulars and Events
const CircularsPage = lazy(() => import('../Pages/Communication/Circulars/CircularsPage'));
const CreateCircularPage = lazy(() => import('../Pages/Communication/Circulars/CreateCircularPage'));
const EventsPage = lazy(() => import('../Pages/Communication/Events/EventsPage'));
const CreateEventPage = lazy(() => import('../Pages/Communication/Events/CreateEventPage'));
const ApprovalQueuePage = lazy(() => import('../Pages/Communication/ApprovalQueue/ApprovalQueuePage'));
const NotificationsPage = lazy(() => import('../Pages/Communication/Notifications/NotificationsPage'));

// ─── Suspense fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 sm:gap-5 bg-white px-4">
    <div className="relative h-12 w-12 sm:h-16 sm:w-16">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
    </div>
    <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">Loading SchoolSpine...</p>
  </div>
);

// ─── Role groups — kept only for stock (unchanged) and school picker ───────────
const STOCK_ACCOUNTANT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT'];
const STOCK_SELLER_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT', 'STORE_SELLER'];
const SCHOOL_PICKER_ROLES = SYSTEM_ROLES.SCHOOL_PICKER;

// ─── Smart root redirect based on role ────────────────────────────────────────
const RootRedirect = () => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) } catch { return null }
  })();
  const role = storedUser?.userType
    || (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null);

  if (role === 'STORE_SELLER') return <Navigate to="/stock/studentOrders" replace />;
  return <Navigate to="/dashboard" replace />;
};
// ──────────────────────────────────────────────────────────────────────────────

const MainRoutes = () => {
  const isTokenExist = localStorage.getItem('token');

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public landing pages (redirect to app when logged-in) ── */}
        <Route path="/" element={isTokenExist ? <RootRedirect /> : <LandingApp />} />
        <Route path="/about" element={isTokenExist ? <RootRedirect /> : <LandingLayout><About /></LandingLayout>} />
        <Route path="/contact" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Contact /></LandingLayout>} />
        <Route path="/privacy-policy" element={isTokenExist ? <RootRedirect /> : <LandingLayout><PrivacyPolicy /></LandingLayout>} />
        <Route path="/terms" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Terms_Of_Service /></LandingLayout>} />
        <Route path="/cookies" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Cookie_Policy /></LandingLayout>} />
        <Route path="/faqs" element={isTokenExist ? <RootRedirect /> : <LandingLayout><FaqListing /></LandingLayout>} />
        <Route path="/login" element={isTokenExist ? <RootRedirect /> : <Login />} />

        {/* ── Protected (token required) ── */}
        <Route element={<ProtectedRoutes />}>

          {/* School picker — role-locked by design, no AppLayout */}
          <Route
            path="/superAdmin"
            element={
              <RoleProtectedRoute allowedRoles={SCHOOL_PICKER_ROLES}>
                <SuperAdminSchools />
              </RoleProtectedRoute>
            }
          />

          {/* All app routes inside AppLayout (Sidebar) */}
          <Route element={<AppLayout />}>

            {/* ── Dashboard ── */}
            <Route
              path="/dashboard"
              element={
                <PermissionProtectedRoute
                  allowedPermissions={[P.DASHBOARD_VIEW]}
                  fallback={<Navigate to="/stock/studentOrders" replace />}
                >
                  <Dashboard />
                </PermissionProtectedRoute>
              }
            />

            {/* Settings — no extra gate; any authenticated user */}
            <Route path="/settings" element={<Settings />} />

            {/* ── System screens — role-locked, never permission-gated ── */}
            <Route element={<RoleProtectedRoute allowedRoles={SYSTEM_ROLES.ROLE_MANAGE} />}>
              <Route path="/rolesPermissions" element={<RolesPermissionsManagement />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={SYSTEM_ROLES.SCHOOL_CONFIG_MANAGE} />}>
              <Route path="/schoolConfig" element={<SchoolConfig />} />
            </Route>

            {/* ── Academic Year ── */}
            <Route
              path="/academicYear"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.ACADEMIC_YEAR_MANAGE]}>
                  <AcademicYear />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Manage Users ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.USER_VIEW]} />}>
              <Route path="/manageUsers" element={<ManageAllUsers />} />
            </Route>
            <Route
              path="/manageUsers/addUser"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.USER_CREATE]}>
                  <AddnewSystemUser />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/manageUsers/editUser/:id"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.USER_EDIT]}>
                  <EditSysUser />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Teachers ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.TEACHER_VIEW]} />}>
              <Route path="/teachers" element={<Teachers />} />
              <Route path="/teachers/:id" element={<DetailsView />} />
            </Route>
            <Route
              path="/teachers/addTeacher"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.TEACHER_CREATE]}>
                  <AddNewTeacher />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/teachers/editTeacher/:id"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.TEACHER_EDIT]}>
                  <EditTeachersDetails />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/teachers/classAssignment/:teacherId"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.TEACHER_EDIT]}>
                  <ClassAssignment />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Students ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.STUDENT_VIEW]} />}>
              <Route path="/students" element={<Student />} />
              <Route path="/students/:id" element={<StudentDetails />} />
            </Route>
            <Route
              path="/students/addStudents"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.STUDENT_CREATE]}>
                  <AddNewStudent />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/students/editStudent/:id"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.STUDENT_EDIT]}>
                  <EditStudentDetails />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Academics ── */}
            <Route
              path="/subjectsmaster"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.ACADEMIC_VIEW]}>
                  <SubjectsMaster />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/sectionSubjectAssignment"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.ACADEMIC_VIEW, P.ACADEMIC_EDIT]}>
                  <SectionSubjectAssignment />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/academics/classSections"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.CLASS_SECTION_MANAGE]}>
                  <ClassSectionConfig />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Timetable / Schedule ── */}
            <Route
              path="/schedule"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.TIMETABLE_VIEW]}>
                  <TimeTable />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/schedule/create"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.TIMETABLE_MANAGE]}>
                  <CreateSchedule />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Homework ── */}
            <Route
              path="/homework"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.HOMEWORK_VIEW]}>
                  <HomeworkPage />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Exams ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER]} />}>
              <Route path="/exams" element={<Exams />} />
            </Route>
            <Route
              path="/exams/marksEntry/:examId?"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.EXAM_MARKS_ENTER]}>
                  <MarksEntry />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/exams/reportCard/:examId?"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.EXAM_MARKS_VIEW_CLASS]}>
                  <ReportCards />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/exams/analytics"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.EXAM_ANALYTICS_VIEW]}>
                  <Analytics />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/exams/examConfig"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.EXAM_CONFIG_MANAGE]}>
                  <ExamConfiguration />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Attendance ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_VIEW, P.ATTENDANCE_CREATE, P.ATTENDANCE_EDIT]} />}>
              <Route path="/attendance" element={<Attendance />} />
            </Route>
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_APPROVE]} />}>
              <Route path="/attendance/staffImgReg" element={<StaffAttendanceRegistration />} />
              <Route path="/attendance/studentImgReg" element={<StudentAttendanceRegistration />} />
            </Route>
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_VIEW]} />}>
              <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />
              <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
            </Route>
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_CREATE]} />}>
              <Route path="/attendance/markUserAttendance" element={<MarkUserAttendance />} />
              <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />
              <Route path="/attendance/studentAttendance" element={<StudentAttendance />} />
            </Route>

            {/* ── Leaves ── */}
            <Route
              path="/leaves/applyLeaves"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.LEAVE_CREATE]}>
                  <ApplyLeaves />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/leaves/myLeaves"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.LEAVE_VIEW]}>
                  <MyLeaves />
                </PermissionProtectedRoute>
              }
            />
            {/* Users with LEAVE_VIEW but not LEAVE_APPROVE land on /leaves/myLeaves */}
            <Route
              path="/leaves"
              element={
                <PermissionProtectedRoute
                  allowedPermissions={[P.LEAVE_APPROVE]}
                  fallback={<Navigate to="/leaves/myLeaves" replace />}
                >
                  <Leaves />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/leaves/manageHolidays"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.HOLIDAY_MANAGE]}>
                  <HolidayManagment />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/leaves/leaveConfig"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.LEAVE_CONFIG_MANAGE]}>
                  <LeaveConfig />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Payroll ── */}
            <Route
              path="/payroll"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.PAYROLL_VIEW]}>
                  <Payroll />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Transport ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.TRANSPORT_VIEW]} />}>
              <Route path="/route" element={<Transport_Management />} />
              <Route path="/route/vehicles" element={<Vehicles />} />
              <Route path="/route/Driver&Attendants" element={<Driver_Attendants />} />
              <Route path="/route/routes_management" element={<Routes_Manage />} />
              <Route path="/route/reports" element={<Reports />} />
            </Route>
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.TRANSPORT_EDIT]} />}>
              <Route path="/route/studentAllocations" element={<Student_Allocations />} />
              <Route path="/route/feePlans" element={<Fee_Plans />} />
            </Route>

            {/* ── Fee Management ── */}
            <Route
              path="/feemanagement"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.FEE_VIEW]}>
                  <OverviewPage />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/feemanagement/config"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.FEE_STRUCTURE_MANAGE]}>
                  <FeeSynthesisPage />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/feemanagement/period"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.FEE_PERIOD_VIEW]}>
                  <FeePeriods />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/feemanagement/structures"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.FEE_STRUCTURE_VIEW]}>
                  <FeeStructures />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/feemanagement/collections"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.FEE_COLLECT]}>
                  <CollectionsPage />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Communication ── */}
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.CIRCULAR_VIEW, P.CIRCULAR_CREATE, P.CIRCULAR_APPROVE, P.CIRCULAR_DELETE]} />}>
              <Route path="/communication/circulars" element={<CircularsPage />} />
              <Route path="/communication/circulars/:id" element={<CircularsPage />} />
            </Route>
            <Route
              path="/communication/circulars/create"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.CIRCULAR_CREATE]}>
                  <CreateCircularPage />
                </PermissionProtectedRoute>
              }
            />
            <Route element={<PermissionProtectedRoute allowedPermissions={[P.EVENT_VIEW, P.EVENT_CREATE, P.EVENT_APPROVE, P.EVENT_DELETE]} />}>
              <Route path="/communication/events" element={<EventsPage />} />
            </Route>
            <Route
              path="/communication/events/create"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.EVENT_CREATE]}>
                  <CreateEventPage />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/communication/approval"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.CIRCULAR_APPROVE, P.EVENT_APPROVE]}>
                  <ApprovalQueuePage />
                </PermissionProtectedRoute>
              }
            />
            <Route
              path="/communication/notifications"
              element={
                <PermissionProtectedRoute allowedPermissions={[P.NOTICE_VIEW]}>
                  <NotificationsPage />
                </PermissionProtectedRoute>
              }
            />

            {/* ── Stock / Store — UNCHANGED, still role-based ── */}
            <Route element={<RoleProtectedRoute allowedRoles={STOCK_ACCOUNTANT_ROLES} />}>
              <Route path="/stock" element={<Stock />} />
              <Route path="/stock/stores" element={<Store />} />
              <Route path="/stock/items" element={<Items />} />
              <Route path="/stock/classConfig" element={<ClassConfig />} />
              <Route path="/stock/transactions" element={<Transactions />} />
              <Route path="/stock/movementHistory" element={<Movement />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={STOCK_SELLER_ROLES} />}>
              <Route path="/stock/studentOrders" element={<StudentOrders />} />
              <Route path="/stock/studentOrders/addOrder" element={<CreateStudentOrder />} />
              <Route path="/stock/studentOrders/editOrder" element={<EditStudentOrder />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />

          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;
