import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection — kept eager since they're needed on every route
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';
import ScrollToTop from '../Components/CommonComp/ScrollToTop';
// ───  Route Modules ───────────
import AcademicsRoutes from './Academics/Academic/AcademicsRoutes';
import AttendanceRoutes from './Attendance/AttendanceRoutes';
import CommunicationRoutes from './Communication/CommunicationRoutes';
import DashboardRoutes from './Dashboard/DashboardRoutes';
import ExamsRoutes from './Academics/Exams/ExamsRoutes';
import FeeManagementRoutes from './FeeManagement/FeeManagementRoutes';
import HomeworkRoutes from './Academics/Homework/HomeworkRoutes';
import LeavesRoutes from './Leaves/LeavesRoutes';
import RoleBasedPermissionRoutes from './RoleBasedPermission/RoleBasedPermissionRoutes';
import ScheduleRoutes from './Academics/Schedule/ScheduleRoutes';
import SchoolsRoutes from './Schools/SchoolsRoutes';
import SchoolSpineWebRoutes from './SchoolSpineWeb/SchoolSpineWebRoutes';
import StockRoutes from './Stock/StockRoutes';
import StudentsRoutes from './Students/StudentsRoutes';
import SubjectManagementRoutes from './Academics/SubjectManagement/SubjectManagementRoutes';
import { superAdminSchoolPickerRoute, superAdminManageUsersRoutes } from './SuperAdmin/SuperAdminRoutes';
import TeachersRoutes from './Teachers/TeachersRoutes';
import PayrollRoutes from './Payroll/PayrollRoutes';
import TransportRoutes from './Transport/TransportRoutes';
import TemplatesRoutes from './Templates/TemplatesRoutes';

import { ROLE_GROUPS, ROUTE_PATHS, ROUTES_UI_STRINGS } from '../Constants/RoutesConstants/RoutesConst';
// ─── Lazy-loaded standalone pages ─────────────────────────────────────────────
const Login = lazy(() => import('../Pages/Login_2'));
const Settings = lazy(() => import('../Pages/Settings'));

// Attendance
const UsersAttendance = lazy(() => import('../Pages/Attendance/UsersAttendance'));
const MarkUserAttendance = lazy(() => import('../Pages/Attendance/MarkUserAttendance'));
const WarningVerificationFailed = lazy(() => import('../Components/UserAttendance/WarningVerificationFailed'));
const ManualAttendance = lazy(() => import('../Components/UserAttendance/ManualAttendanceRequest'));
const ExamConfiguration = lazy(() => import('../Pages/Exams/ExamConfiguration'));
const ClassSectionConfig = lazy(() => import('../Pages/Academics/ClassSectionConfig'));
// Student Promotion (bulk end-of-year class promotion wizard)
const StudentPromotion = lazy(() => import('../Pages/Students/StudentPromotion'));
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
const UserView = lazy(() => import('../Pages/SuperAdmin/UserView'));
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
const FeeStructures = lazy(() => import('../Pages/FeeManagement/Feestructures'));

// Public landing pages
const LandingApp = lazy(() => import('../Pages/SchoolSpineWeb/pages/Landing'));
const About = lazy(() => import('../Pages/SchoolSpineWeb/pages/About'));
const Contact = lazy(() => import('../Pages/SchoolSpineWeb/pages/Contact'));
const PrivacyPolicy = lazy(() => import('../Pages/SchoolSpineWeb/pages/Privacy_Policy'));
const LandingLayout = lazy(() => import('../Pages/SchoolSpineWeb/pages/LandingLayout'));
const Terms_Of_Service = lazy(() => import('../Pages/SchoolSpineWeb/pages/Terms'));
const Cookie_Policy = lazy(() => import('../Pages/SchoolSpineWeb/pages/CookiePolicy'));
const FaqListing = lazy(() => import('../Components/Homes/Faq/FaqLisitng'));
const FeatureDetails = lazy(() => import('../Components/Homes/Details/Features/FeatureDetails'));
const Blog = lazy(() => import('../Pages/SchoolSpineWeb/pages/Blog'));
const Support = lazy(() => import('../Pages/SchoolSpineWeb/pages/Help_Support'));
// Circulars and Events
const CircularsPage = lazy(() => import('../Pages/Communication/Circulars/CircularsPage'));
const CreateCircularPage = lazy(() => import('../Pages/Communication/Circulars/CreateCircularPage'));
const EventsPage = lazy(() => import('../Pages/Communication/Events/EventsPage'));
const CreateEventPage = lazy(() => import('../Pages/Communication/Events/CreateEventPage'));
const ApprovalQueuePage = lazy(() => import('../Pages/Communication/ApprovalQueue/ApprovalQueuePage'));
const NotificationsPage = lazy(() => import('../Pages/Communication/Notifications/NotificationsPage'));
const DemoRequest = lazy(() => import('../../src/Pages/DemoRequest/Demorequest'));
// ─── Suspense fallback — premium blue circle loader ────────────────────────────
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 sm:gap-5 bg-white px-4">
    <div className="relative h-12 w-12 sm:h-16 sm:w-16">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
    </div>
    <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">{ROUTES_UI_STRINGS.LOADING_APP}</p>
  </div>
);

// ─── Smart root redirect based on role ────────────────────────────────────────
const RootRedirect = () => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const role =
    storedUser?.userType ||
    (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null);
  if (role === 'STORE_SELLER') return <Navigate to={ROUTE_PATHS.STOCK_STUDENT_ORDERS_REDIRECT} replace />;
  return <Navigate to={ROUTE_PATHS.DASHBOARD} replace />;
};

// ──────────────────────────────────────────────────────────────────────────────
const MainRoutes = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Suspense fallback={<PageLoader />}>
      <ScrollToTop />
      <Routes>
        {/* ── Public landing pages — called as functions, not JSX components ── */}
        {SchoolSpineWebRoutes({ RootRedirect, isLoggedIn })}

        {/* ── Auth ── */}
        <Route path={ROUTE_PATHS.LOGIN} element={isLoggedIn ? <RootRedirect /> : <Login />} />

        {/* ── Protected ── */}
        <Route element={<ProtectedRoutes />}>
          {/* School picker — no AppLayout */}
          {superAdminSchoolPickerRoute()}

          {/* All app routes — inside AppLayout (sidebar) */}
          <Route element={<AppLayout />}>
            {DashboardRoutes()}
            <Route path={ROUTE_PATHS.SETTINGS} element={<Settings />} />

            {AttendanceRoutes()}
            {AcademicsRoutes()}
            {/* Student Promotion — bulk end-of-year class promotion wizard.
                Kept as an explicit route here since AcademicsRoutes.jsx wasn't
                available at edit time. Safe to move into AcademicsRoutes.jsx
                later — just drop this <Route> in there and remove it from here. */}
            <Route path="/academics/studentPromotion" element={<StudentPromotion />} />
            {CommunicationRoutes()}
            {ExamsRoutes()}
            {FeeManagementRoutes()}
            {HomeworkRoutes()}
            {LeavesRoutes()}
            {RoleBasedPermissionRoutes()}
            {ScheduleRoutes()}
            {SchoolsRoutes()}
            {StockRoutes()}
            {StudentsRoutes()}
            {SubjectManagementRoutes()}
            {superAdminManageUsersRoutes()}
            {TeachersRoutes()}
            {PayrollRoutes()}
            {TransportRoutes()}
            {TemplatesRoutes()}

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;