import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';

// Pages
import Login from '../Pages/Login_2';
import Dashboard from '../Pages/Dashboard';
import Attendance from '../Pages/Attendance/Attendance';
import Leaves from '../Pages/Leaves/Leaves';
import Payroll from '../Pages/Payroll';
import Teachers from '../Pages/Teachers/Teachers';
import Settings from '../Pages/Settings';

// Attendance
import UsersAttendance from '../Pages/Attendance/UsersAttendance';
import MarkUserAttendance from '../Pages/Attendance/MarkUserAttendance';
import WarningVerificationFailed from '../Components/UserAttendance/WarningVerificationFailed';
import ManualAttendance from '../Components/UserAttendance/ManualAttendanceRequest';
import ExamConfiguration from '../Pages/Exams/ExamConfiguration';
import ClassSectionConfig from '../Pages/Academics/ClassSectionConfig';
import StudentAttendance from '../Pages/Attendance/StudentAttendance/StudentAttendance';
import StaffAttendanceRegistration from '../Pages/Attendance/StaffAttendanceRegistration';
import StudentAttendanceRegistration from '../Pages/Attendance/StudentAttendanceRegistration';

// Teachers
import DetailsView from '../Pages/Teachers/DetailsView';
import AddNewTeacher from '../Pages/Teachers/AddNewTeacher';
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetaills';
import ClassAssignment from '../Pages/Teachers/ClassAssignment';

// Super Admin / Global Admin
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';
import ApplyLeaves from '../Pages/Leaves/ApplyLeaves';
import MyLeaves from '../Pages/Leaves/MyLeaves';
import SuperAdminSchools from '../Pages/SuperAdmin/SuperAdminSchools';

// Students
import Student from '../Pages/Students/Students';
import AddNewStudent from '../Pages/Students/AddNewStudent';
import EditStudentDetails from '../Pages/Students/EditStudentDetails';
import StudentDetails from '../Pages/Students/StudentDetails';
import HolidayManagment from '../Pages/Leaves/Holiday/HolidayManagement';
import LeaveConfig from '../Pages/Leaves/LeaveConfig';
import RoleProtectedRoute from '../utils/RoleProtectedRoute';

// Stock Routes
import Stock from '../Pages/Stock/Stock';
import Store from '../Pages/Stock/Stores';
import Items from '../Pages/Stock/Items';
import Transactions from '../Pages/Stock/Transactions';
import Movement from '../Pages/Stock/Movement';
import ClassConfig from '../Pages/Stock/ClassConfig/ClassConfig';
import StudentOrders from '../Pages/Stock/StudentOrders/StudentOrders';
import CreateStudentOrder from '../Pages/Stock/StudentOrders/CreateStudentOrder';
import EditStudentOrder from '../Pages/Stock/StudentOrders/EditStudentOrder';

// Transport Routes
import Transport_Management from '../Pages/Transport/Transport_Management';
import Vehicles from '../Pages/Transport/Vehicles';
import Fee_Plans from '../Pages/Transport/Fee_Plans/Fee_Plans';
import Driver_Attendants from '../Pages/Transport/Driver_Attendants';
import Reports from '../Pages/Transport/Reports/Reports';
import Student_Allocations from '../Pages/Transport/Student_Allocation/Student_Allocations';
import Routes_Manage from '../Pages/Transport/Routes_Manage';
import SubjectsMaster from '../Components/Subject/subject';
import RolesPermissionsManagement from '../Pages/RoleBasedPermission/PermissionManagement';
import SectionSubjectAssignment from '../Pages/SubjectManagement/SectionSubjectAssignment';
import Exams from '../Pages/Exams/Exams';
import MarksEntry from '../Pages/Exams/MarksEntry';
import ReportCards from '../Pages/Exams/ReportCards';
import Analytics from '../Pages/Exams/Analytics';
import SchoolConfig from '../Pages/Schools/SchoolConfig';
import HomeworkPage from '../Pages/Homework/Homeworkpage';
import { OverviewPage, FeeSynthesisPage, CollectionsPage } from '../Pages/FeeManagement/FeeManagement';

import AcademicYear from '../Pages/Attendance/AcademicYear/AcademicYear';
import TimeTable from '../Pages/Schedule/TimeTable';
import CreateSchedule from '../Pages/Schedule/CreateSchedule';
import FeePeriods from '../Pages/FeeManagement/FeePeriods';
import FeeStructures from '../Pages/FeeManagement/Feestructures.';

import LandingApp from "../Pages/SchoolSpineWeb/pages/Landing";
import About from "../Pages/SchoolSpineWeb/pages/About";
import Contact from "../Pages/SchoolSpineWeb/pages/Contact";
import PrivacyPolicy from "../Pages/SchoolSpineWeb/pages/Privacy_Policy";
// Circulars and Events
import CircularsPage from '../Pages/Communication/Circulars/CircularsPage';
import CreateCircularPage from '../Pages/Communication/Circulars/CreateCircularPage';
import EventsPage from '../Pages/Communication/Events/EventsPage';
import CreateEventPage from '../Pages/Communication/Events/CreateEventPage';
import ApprovalQueuePage from '../Pages/Communication/ApprovalQueue/ApprovalQueuePage';
import NotificationsPage from '../Pages/Communication/Notifications/NotificationsPage';



// ─── Role Groups ───────────────────────────────────────────────────────────────
const STOCK_ACCOUNTANT_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT'];
const STOCK_SELLER_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'STORE_ACCOUNTANT', 'STORE_SELLER'];
const SCHEDULE_ROLES = ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];
// ✅ Roles that see the school picker (requiresSchoolSelection: true)
import LandingLayout from "../Pages/SchoolSpineWeb/pages/LandingLayout";
import Terms_Of_Service from '../Pages/SchoolSpineWeb/pages/Terms';
import Cookie_Policy from '../Pages/SchoolSpineWeb/pages/CookiePolicy';
import FaqListing from '../Components/Homes/Faq/FaqLisitng';
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


          {/* ── Fees  ──
                */}
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

          {/* Payroll */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'ACCOUNTANT']} />}>
            <Route path="/payroll" element={<Payroll />} />
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
  );
};

export default MainRoutes;