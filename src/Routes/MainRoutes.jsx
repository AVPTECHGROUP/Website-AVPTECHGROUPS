// src/Routes/MainRoutes.jsx
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';
import PermissionProtectedRoute from '../utils/PermissionProtectedRoute';
import RoleProtectedRoute from '../utils/RoleProtectedRoute';
import { PERMISSIONS as P, SYSTEM_ROLES } from '../Constants/Permission';

// Auth / Landing
import Login from '../Pages/Login_2';
import SuperAdminSchools from '../Pages/SuperAdmin/SuperAdminSchools';

// Dashboard
import Dashboard from '../Pages/Dashboard';

// Users
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';

// Teachers
import Teachers from '../Pages/Teachers/Teachers';
import AddNewTeacher from '../Pages/Teachers/AddNewTeacher';
import EditTeachersDetaills from '../Pages/Teachers/EditTeachersDetaills';
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
import DetailsView from '../Pages/Teachers/DetailsView';

// Students
import Student from '../Pages/Students/Students';
import AddNewStudent from '../Pages/Students/AddNewStudent';
import StudentDetails from '../Pages/Students/StudentDetails';
import EditStudentDetails from '../Pages/Students/EditStudentDetails';

// Academics
// import SubjectsMaster from '../Pages/Academics/SubjectsMaster';
import ClassSectionConfig from '../Pages/Academics/ClassSectionConfig';
import SectionSubjectAssignment from '../Pages/SubjectManagement/SectionSubjectAssignment';
import HomeworkPage from '../Pages/Homework/Homeworkpage';
import TimeTable from '../Pages/Schedule/TimeTable'
import CreateSchedule from '../Pages/Schedule/CreateSchedule';
import AcademicYear from '../Pages/Attendance/AcademicYear/AcademicYear';

// Exams
import Exams from '../Pages/Exams/Exams';
import MarksEntry from '../Pages/Exams/MarksEntry';
import ReportCards from '../Pages/Exams/ReportCards';
import Analytics from '../Pages/Exams/Analytics';
import ExamConfiguration from '../Pages/Exams/ExamConfiguration';

// Communication
import CircularsPage from '../Pages/Communication/Circulars/CircularsPage'
import CreateCircularPage from '../Pages/Communication/Circulars/CreateCircularPage';
import EventsPage from '../Pages/Communication/Events/EventsPage';
import CreateEventPage from '../Pages/Communication/Events/CreateEventPage';
import ApprovalQueuePage from '../Pages/Communication/ApprovalQueue/ApprovalQueuePage';
import NotificationsPage from '../Pages/Communication/Notifications/NotificationsPage';

// Attendance
import Attendance from '../Pages/Attendance/Attendance';
import StaffAttendanceRegistration from '../Pages/Attendance/StaffAttendanceRegistration';
import StudentAttendanceRegistration from '../Pages/Attendance/StudentAttendanceRegistration';
import UsersAttendance from '../Pages/Attendance/UsersAttendance';
import WarningVerificationFailed from '../Components/UserAttendance/WarningVerificationFailed';
import ManualAttendance from '../Components/UserAttendance/ManualAttendanceRequest';
import StudentAttendance from '../Pages/Attendance/StudentAttendance/StudentAttendance';


// Leaves
import Leaves from '../Pages/Leaves/Leaves';
import MyLeaves from '../Pages/Leaves/MyLeaves';
import HolidayManagment from '../Pages/Leaves/Holiday/HolidayManagement';
import LeaveConfig from '../Pages/Leaves/LeaveConfig';

// Stock
import Stock from '../Pages/Stock/Stock';
// ⚠️ TODO: Stores page not yet built — route below is commented out until it exists
// import StoreComp from '../Pages/Stock/Store';
import Items from '../Pages/Stock/Items';
import ClassConfig from '../Pages/Stock/ClassConfig/ClassConfig';
import Transactions from '../Pages/Stock/Transactions';
import Movement from '../Pages/Stock/Movement';
import StudentOrders from '../Pages/Stock/StudentOrders/StudentOrders';
import CreateStudentOrder from '../Pages/Stock/StudentOrders/CreateStudentOrder';
import EditStudentOrder from '../Pages/Stock/StudentOrders/EditStudentOrder';

// Transport
import Transport_Management from '../Pages/Transport/Transport_Management';
import Vehicles from '../Pages/Transport/Vehicles';
import Driver_Attendants from '../Pages/Transport/Driver_Attendants';
import Routes_Manage from '../Pages/Transport/Routes_Manage';
import Student_Allocations from '../Pages/Transport/Student_Allocation/Student_Allocations';
import Fee_Plans from '../Pages/Transport/Fee_Plans/Fee_Plans';
import TransportReports from '../Pages/Transport/Reports/Reports';

// Fee Management
import OverviewPage from '../Pages/FeeManagement/Overview';
import FeeSynthesisPage from '../Pages/FeeManagement/FeeManagement';
import FeePeriods from '../Pages/FeeManagement/FeePeriods';
import FeeStructures from '../Pages/FeeManagement/Feestructures.';
import CollectionsPage from '../Pages/FeeManagement/Collectionhistory';

// Payroll
import Payroll from '../Pages/Payroll';

// System (role-locked)
import RolesPermissionsManagement from '../Pages/RoleBasedPermission/PermissionManagement';
import SchoolConfig from '../Pages/Schools/SchoolConfig';

const MainRoutes = () => {
  return (
    <Routes>
      {/* ── Public / Auth ─────────────────────────────────────────────── */}
      <Route path="/login" element={<Login />} />
      <Route
        path="/superAdmin"
        element={
          <RoleProtectedRoute allowedRoles={SYSTEM_ROLES.SCHOOL_PICKER}>
            <SuperAdminSchools />
          </RoleProtectedRoute>
        }
      />

      {/* ── Authenticated app shell ──────────────────────────────────── */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Dashboard */}
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

          {/* Manage Users */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.USER_VIEW]} />}>
            <Route path="/manageUsers" element={<ManageAllUsers />} />
            <Route path="/manageUsers/adduser" element={<AddnewSystemUser />} />
            <Route path="/manageUsers/editUser/:id" element={<EditSysUser />} />
          </Route>

          {/* Teachers */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.TEACHER_VIEW]} />}>
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
            <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetaills />} />
            <Route path="/teachers/classAssignment/:teacherId" element={<ClassAssignment />} />
            <Route path="/teachers/:id" element={<DetailsView />} />
          </Route>

          {/* Students */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STUDENT_VIEW]} />}>
            <Route path="/students" element={<Student />} />
            <Route path="/students/addStudents" element={<AddNewStudent />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/students/editStudent/:id" element={<EditStudentDetails />} />
          </Route>

          {/* Academics */}
          {/* <Route element={<PermissionProtectedRoute allowedPermissions={[P.ACADEMIC_VIEW]} />}>
            <Route path="/subjectsmaster" element={<SubjectsMaster />} />
          </Route> */}

          <Route element={<PermissionProtectedRoute allowedPermissions={[P.ACADEMIC_YEAR_MANAGE]} />}>
            <Route path="/academics/classSections" element={<ClassSectionConfig />} />
            <Route path="/sectionSubjectAssignment" element={<SectionSubjectAssignment />} />
            <Route path="/academicYear" element={<AcademicYear />} />
          </Route>

          <Route element={<PermissionProtectedRoute allowedPermissions={[P.HOMEWORK_VIEW]} />}>
            <Route path="/homework" element={<HomeworkPage />} />
          </Route>

          <Route element={<PermissionProtectedRoute allowedPermissions={[P.TIMETABLE_VIEW]} />}>
            <Route path="/schedule" element={<TimeTable />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.TIMETABLE_MANAGE]} />}>
            <Route path="/schedule/create" element={<CreateSchedule />} />
          </Route>

          {/* Exams — Overview matches Sidebar's any-of gate for TEACHER */}
          <Route
            element={
              <PermissionProtectedRoute
                allowedPermissions={[P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER]}
              />
            }
          >
            <Route path="/exams" element={<Exams />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.EXAM_MARKS_ENTER]} />}>
            <Route path="/exams/marksEntry/:examId?" element={<MarksEntry />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.EXAM_MARKS_VIEW_CLASS]} />}>
            <Route path="/exams/reportCard/:examId?" element={<ReportCards />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.EXAM_APPROVE]} />}>
            <Route path="/exams/analytics" element={<Analytics />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.EXAM_CREATE]} />}>
            <Route path="/exams/examConfig" element={<ExamConfiguration />} />
          </Route>

          {/* Communication */}
          <Route
            element={
              <PermissionProtectedRoute
                allowedPermissions={[P.CIRCULAR_CREATE, P.CIRCULAR_APPROVE, P.CIRCULAR_DELETE]}
              />
            }
          >
            <Route path="/communication/circulars" element={<CircularsPage />} />
            <Route path="/communication/circulars/:id" element={<CircularsPage />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.CIRCULAR_CREATE]} />}>
            <Route path="/communication/circulars/create" element={<CreateCircularPage />} />
          </Route>

          <Route
            element={
              <PermissionProtectedRoute
                allowedPermissions={[P.EVENT_CREATE, P.EVENT_APPROVE, P.EVENT_DELETE]}
              />
            }
          >
            <Route path="/communication/events" element={<EventsPage />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.EVENT_CREATE]} />}>
            <Route path="/communication/events/create" element={<CreateEventPage />} />
          </Route>

          <Route
            element={
              <PermissionProtectedRoute allowedPermissions={[P.CIRCULAR_APPROVE, P.EVENT_APPROVE]} />
            }
          >
            <Route path="/communication/approval" element={<ApprovalQueuePage />} />
          </Route>

          <Route element={<PermissionProtectedRoute allowedPermissions={[P.NOTICE_VIEW]} />}>
            <Route path="/communication/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Attendance — matches Sidebar's any-of gate for TEACHER (no ATTENDANCE_VIEW) */}
          <Route
            element={
              <PermissionProtectedRoute
                allowedPermissions={[P.ATTENDANCE_VIEW, P.ATTENDANCE_CREATE, P.ATTENDANCE_EDIT]}
              />
            }
          >
            <Route path="/attendance" element={<Attendance />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_APPROVE]} />}>
            <Route path="/attendance/staffImgReg" element={<StaffAttendanceRegistration />} />
            <Route path="/attendance/studentImgReg" element={<StudentAttendanceRegistration />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.ATTENDANCE_CREATE]} />}>
            <Route path="/attendance/markUserAttendance" element={<UsersAttendance />} />
            <Route path="/attendance/studentAttendance" element={<StudentAttendance />} />
            <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />
            <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
            <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />
          </Route>

          {/* Leaves */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.LEAVE_VIEW]} />}>
            <Route path="/leaves/applyLeaves" element={<Navigate to="/leaves/myLeaves" replace />} />
            <Route path="/leaves/myLeaves" element={<MyLeaves />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.LEAVE_APPROVE]} />}>
            <Route path="/leaves" element={<Leaves />} />
          </Route>
          {/* Proxy gate — see LEAVE_DELETE note in permissions.js */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.LEAVE_DELETE]} />}>
            <Route path="/leaves/manageHolidays" element={<HolidayManagment />} />
            <Route path="/leaves/leaveConfig" element={<LeaveConfig />} />
          </Route>

          {/* Stock */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STOCK_OVERVIEW]} />}>
            <Route path="/stock" element={<Stock />} />
          </Route>
          {/* ⚠️ TODO: Stores page not yet built — uncomment once Pages/Stock/Store.jsx exists
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STORE_VIEW]} />}>
            <Route path="/stock/stores" element={<StoreComp />} />
          </Route>
          */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STOCK_ITEM_VIEW]} />}>
            <Route path="/stock/items" element={<Items />} />
          </Route>
          <Route
            element={
              <PermissionProtectedRoute
                allowedPermissions={[P.STOCK_INWARD, P.STOCK_OUTWARD, P.STOCK_TRANSFER]}
              />
            }
          >
            <Route path="/stock/transactions" element={<Transactions />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.CLASS_ITEM_CONFIG_VIEW]} />}>
            <Route path="/stock/classConfig" element={<ClassConfig />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STOCK_MOVEMENT_VIEW]} />}>
            <Route path="/stock/movementHistory" element={<Movement />} />
          </Route>

          {/* Student Orders — same permission whether reached via Stock or the
              standalone Sidebar entry for STORE_SELLER-type roles */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.STUDENT_ORDER_VIEW]} />}>
            <Route path="/stock/studentOrders" element={<StudentOrders />} />
            <Route path="/stock/studentOrders/addOrder" element={<CreateStudentOrder />} />
            <Route path="/stock/studentOrders/editOrder" element={<EditStudentOrder />} />
          </Route>

          {/* Transport */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.TRANSPORT_VIEW]} />}>
            <Route path="/route" element={<Transport_Management />} />
            <Route path="/route/vehicles" element={<Vehicles />} />
            <Route path="/route/Driver&Attendants" element={<Driver_Attendants />} />
            <Route path="/route/routes_management" element={<Routes_Manage />} />
            <Route path="/route/reports" element={<TransportReports />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.TRANSPORT_EDIT]} />}>
            <Route path="/route/studentAllocations" element={<Student_Allocations />} />
            <Route path="/route/feePlans" element={<Fee_Plans />} />
          </Route>

          {/* Fee Management */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.FEE_VIEW]} />}>
            <Route path="/feemanagement" element={<OverviewPage />} />
            <Route path="/feemanagement/period" element={<FeePeriods />} />
            <Route path="/feemanagement/structures" element={<FeeStructures />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.FEE_STRUCTURE_MANAGE]} />}>
            <Route path="/feemanagement/config" element={<FeeSynthesisPage />} />
          </Route>
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.FEE_COLLECT]} />}>
            <Route path="/feemanagement/collections" element={<CollectionsPage />} />
          </Route>

          {/* Payroll */}
          <Route element={<PermissionProtectedRoute allowedPermissions={[P.PAYROLL_VIEW]} />}>
            <Route path="/payroll" element={<Payroll />} />
          </Route>

          {/* ── System screens — ROLE-locked, never permission-gated ────── */}
          <Route element={<RoleProtectedRoute allowedRoles={SYSTEM_ROLES.ROLE_MANAGE} />}>
            <Route path="/rolesPermissions" element={<RolesPermissionsManagement />} />
          </Route>
          <Route element={<RoleProtectedRoute allowedRoles={SYSTEM_ROLES.SCHOOL_CONFIG_MANAGE} />}>
            <Route path="/schoolConfig" element={<SchoolConfig />} />
          </Route>

          {/* Catch-all inside the app shell */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Catch-all outside the app shell (not logged in) */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

export default MainRoutes;