import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection — kept eager since they're needed on every route
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';
import RoleProtectedRoute from '../utils/RoleProtectedRoute';

// ─── Lazy-loaded Pages (code-split, fetched only when route is hit) ───────────
const Login = lazy(() => import('../Pages/Login_2'));
const Dashboard = lazy(() => import('../Pages/Dashboard/Dashboard'));
const Attendance = lazy(() => import('../Pages/Attendance/Attendance'));
const Leaves = lazy(() => import('../Pages/Leaves/Leaves'));
// const Payroll = lazy(() => import('../Pages/Payroll'));
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
const UserView = lazy(() => import('../Pages/SuperAdmin/UserView'));

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
// each lazy() call still only loads the chunk once (cached by webpack/vite)
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

// ─── Suspense fallback — premium blue circle loader ────────────────────────────
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 sm:gap-5 bg-white px-4">
    <div className="relative h-12 w-12 sm:h-16 sm:w-16">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
    </div>
    <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">Loading SchoolSpine...</p>
  </div>
);

// ─── Role Groups ───────────────────────────────────────────────────────────────
const STOCK_ACCOUNTANT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT'];
const STOCK_SELLER_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT', 'STORE_SELLER'];
const SCHEDULE_ROLES = ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
// ✅ Roles that see the school picker (requiresSchoolSelection: true)
const SCHOOL_PICKER_ROLES = ['SUPER_ADMIN', 'GLOBAL_ADMIN'];

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
        {/* Public landing pages (redirect to app when logged-in) */}
        <Route path="/" element={isTokenExist ? <RootRedirect /> : <LandingApp />} />
        <Route path="/about" element={isTokenExist ? <RootRedirect /> : <LandingLayout><About /></LandingLayout>} />
        <Route path="/contact" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Contact /></LandingLayout>} />
        <Route path="/privacy-policy" element={isTokenExist ? <RootRedirect /> : <LandingLayout><PrivacyPolicy /></LandingLayout>} />
        <Route path="/terms" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Terms_Of_Service /></LandingLayout>} />
        <Route path="/cookies" element={isTokenExist ? <RootRedirect /> : <LandingLayout><Cookie_Policy /></LandingLayout>} />
        <Route path="/faqs" element={isTokenExist ? <RootRedirect /> : <LandingLayout><FaqListing /></LandingLayout>} />
        {/* PUBLIC */}
        {/* Redirect logged-in users away from login */}
        <Route path="/login" element={isTokenExist ? <RootRedirect /> : <Login />} />

        {/* PROTECTED */}
        <Route element={<ProtectedRoutes />}>

          {/* School picker (no AppLayout) - SUPER_ADMIN or GLOBAL_ADMIN */}
          <Route
            path="/superAdmin"
            element={
              <RoleProtectedRoute allowedRoles={SCHOOL_PICKER_ROLES}>
                <SuperAdminSchools />
              </RoleProtectedRoute>
            }
          />

          {/* All other routes — wrapped in AppLayout (has Sidebar) */}
          <Route element={<AppLayout />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <RoleProtectedRoute
                  allowedRoles={['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STORE_ACCOUNTANT']}
                  fallback={<Navigate to="/stock/studentOrders" replace />}
                >
                  <Dashboard />
                </RoleProtectedRoute>
              }
            />

            <Route path="/settings" element={<Settings />} />
            <Route path="/leaves/applyLeaves" element={<ApplyLeaves />} />
            <Route path="/leaves/myLeaves" element={<MyLeaves />} />
            <Route path="/attendance/markUserAttendance" element={<MarkUserAttendance />} />

            {/* ONLY GLOBAL_ADMIN */}
            <Route element={<RoleProtectedRoute allowedRoles={['GLOBAL_ADMIN']} />}>
              <Route path="/rolesPermissions" element={<RolesPermissionsManagement />} />
            </Route>

            {/* ── Fees  ── */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT']} />}>
              <Route path='/feemanagement' element={<OverviewPage />} />
              <Route path='/feemanagement/config' element={<FeeSynthesisPage />} />
              <Route path='/feemanagement/period' element={<FeePeriods />} />
              <Route path='/feemanagement/structures' element={<FeeStructures />} />
              <Route path='/feemanagement/collections' element={<CollectionsPage />} />
            </Route>
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
              <Route path="/exams" element={<Exams />} />
              <Route path="/exams/marksEntry/:examId?" element={<MarksEntry />} />
              <Route path="/exams/reportCard/:examId?" element={<ReportCards />} />
              <Route path="/attendance/studentAttendance" element={<StudentAttendance />} />
            </Route>

            {/* ADMIN, SUPER_ADMIN & GLOBAL_ADMIN */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
              <Route path="/manageUsers/addUser" element={<AddnewSystemUser />} />
              <Route path="/manageUsers/editUser/:id" element={<EditSysUser />} />
              <Route path="/manageUsers/:id" element={<UserView/>} />
              <Route path="/manageUsers" element={<ManageAllUsers />} />

              <Route path="/attendance" element={<Attendance />} />
              <Route path="/attendance/staffImgReg" element={<StaffAttendanceRegistration />} />
              <Route path="/attendance/studentImgReg" element={<StudentAttendanceRegistration />} />
              <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />

              <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
              <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />

              <Route path="/exams/analytics" element={<Analytics />} />
              <Route path="/exams/examConfig" element={<ExamConfiguration />} />
              <Route path="/academics/classSections" element={<ClassSectionConfig />} />

              <Route element={<RoleProtectedRoute allowedRoles={SCHEDULE_ROLES} />}>
                <Route path="/schedule" element={<TimeTable />} />
                <Route path="/schedule/create" element={<CreateSchedule />} />
              </Route>

              <Route path="/teachers" element={<Teachers />} />
              <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
              <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails />} />
              <Route path="/teachers/classAssignment/:teacherId" element={<ClassAssignment />} />
              <Route path="/teachers/:id" element={<DetailsView />} />

              <Route path="/students" element={<Student />} />
              <Route path="/students/addStudents" element={<AddNewStudent />} />
              <Route path="/students/:id" element={<StudentDetails />} />
              <Route path="/students/editStudent/:id" element={<EditStudentDetails />} />

              <Route path="/leaves" element={<Leaves />} />
              <Route path="/leaves/manageHolidays" element={<HolidayManagment />} />

              {/* Subject Section Assignment */}
              <Route path="/sectionSubjectAssignment" element={<SectionSubjectAssignment />} />
            </Route>

            {/* Leave Config — GLOBAL_ADMIN, SUPER_ADMIN, PRINCIPAL */}
            <Route element={<RoleProtectedRoute allowedRoles={['GLOBAL_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ADMIN']} />}>
              <Route path="/leaves/leaveConfig" element={<LeaveConfig />} />
              <Route path='/subjectsmaster' element={<SubjectsMaster />} />
            </Route>

            {/* Stock */}
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

            {/* Transport */}
            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
              <Route path="/route" element={<Transport_Management />} />
              <Route path="/route/vehicles" element={<Vehicles />} />
              <Route path="/route/Driver&Attendants" element={<Driver_Attendants />} />
              <Route path="/route/routes_management" element={<Routes_Manage />} />
              <Route path="/route/studentAllocations" element={<Student_Allocations />} />
              <Route path="/route/feePlans" element={<Fee_Plans />} />
              <Route path="/route/reports" element={<Reports />} />
            </Route>

            <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
              <Route path="/homework" element={<HomeworkPage />} />
            </Route>

            {/* Leaves redirect for non-admin */}
            <Route element={<RoleProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL', 'RECEPTIONIST', 'ACCOUNTANT']} />}>
              <Route path="/leaves" element={<Navigate to="/leaves/myLeaves" replace />} />
            </Route>

            {/* Schools Management */}
            <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']} />}>
              <Route path="/schoolConfig" element={<SchoolConfig />} />
              <Route path="/academicYear" element={<AcademicYear />} />
            </Route>

            {/* for events and notifications */}

            {/* Circulars */}
            <Route path="/communication/circulars" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <CircularsPage />
              </RoleProtectedRoute>
            } />
            <Route path="/communication/circulars/:id" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <CircularsPage />
              </RoleProtectedRoute>
            } />

            <Route path="/communication/circulars/create" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <CreateCircularPage />
              </RoleProtectedRoute>
            } />

            {/* Events */}
            <Route path="/communication/events" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <EventsPage />
              </RoleProtectedRoute>
            } />

            <Route path="/communication/events/create" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <CreateEventPage />
              </RoleProtectedRoute>
            } />

            {/* Approval Queue — admin/principal only */}
            <Route path="/communication/approval" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <ApprovalQueuePage />
              </RoleProtectedRoute>
            } />

            {/* Notifications */}
            <Route path="/communication/notifications" element={
              <RoleProtectedRoute allowedRoles={['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN']}>
                <NotificationsPage />
              </RoleProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />

          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;