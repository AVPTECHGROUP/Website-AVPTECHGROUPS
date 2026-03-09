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
import AttendanceImgReg from '../Pages/Attendance/AttendanceImgReg';
import MarkUserAttendance from '../Pages/Attendance/MarkUserAttendance';
import WarningVerificationFailed from '../Components/UserAttendance/WarningVerificationFailed';
import ManualAttendance from '../Components/UserAttendance/ManualAttendanceRequest';

// Teachers
import DetailsView from '../Pages/Teachers/DetailsView';
import AddNewTeacher from '../Pages/Teachers/AddNewTeacher';
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetaills';
import ClassAssignment from '../Pages/Teachers/ClassAssignment';

// Super Admin
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';
import ApplyLeaves from '../Pages/Leaves/ApplyLeaves';
import MyLeaves from '../Pages/Leaves/MyLeaves';

// Sttudents
import Student from '../Pages/Students/Students';
import AddNewStudent from '../Pages/Students/AddNewStudent';
import EditStudentDetails from '../Pages/Students/EditStudentDetails';
import StudentDetails from '../Pages/Students/StudentDetails';
import HolidayManagment from '../Pages/Leaves/Holiday/HolidayManagement';
import RoleProtectedRoute from '../utils/RoleProtectedRoute';
import Stock from '../Pages/Stock/Stock';
import Store from '../Pages/Stock/Stores';
import Items from '../Pages/Stock/Items';
import Transactions from '../Pages/Stock/Transactions';
import Movement from '../Pages/Stock/Movement';
import Transport_Management from '../Pages/Transport/Transport_Management';
import Vehicles from '../Pages/Transport/Vehicles';
import Fee_Plans from '../Pages/Transport/Fee_Plans';
import Driver_Attendants from '../Pages/Transport/Driver_Attendants';
import Reports from '../Pages/Transport/Reports';
import Student_Allocations from '../Pages/Transport/Student_Allocations';
import Routes_Manage from '../Pages/Transport/Routes_Manage';

const MainRoutes = () => {
  const isTokenExist = localStorage.getItem('token');
  return (
    <Routes>
      {/* PUBLIC ROUTE (NO SIDEBAR) */}
      <Route path="/login" element={isTokenExist ? <Navigate to="/dashboard" /> : <Login />} />

      {/* PROTECTED ROUTES */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>

          {/* SHARED ROUTES — accessible by all logged-in roles */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/leaves/applyLeaves" element={<ApplyLeaves />} />
          <Route path="/leaves/myLeaves" element={<MyLeaves />} />
          <Route path="/attendance/markUserAttendance" element={<MarkUserAttendance />} />

          {/* ADMIN & SUPER_ADMIN ONLY */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']} />}>
            <Route path="/dashboard/addUser" element={<AddnewSystemUser />} />
            <Route path="/dashboard/editUser/:id" element={<EditSysUser />} />
            <Route path="/dashboard/manageUsers" element={<ManageAllUsers />} />

            <Route path="/attendance" element={<Attendance />} />
            <Route path="/attendance/attendanceImgReg" element={<AttendanceImgReg />} />
            <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />
            <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
            <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />

            <Route path="/teachers" element={<Teachers />} />
            <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
            <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails />} />
            <Route path="/teachers/classAssignment/:teacherId" element={<ClassAssignment />} />
            <Route path="/teachers/:id" element={<DetailsView />} />

            {/* Students */}
            <Route path="/students" element={<Student />} />
            <Route path="/students/addStudents" element={<AddNewStudent />} />
            <Route path="/students/:id" element={<StudentDetails />} />
            <Route path="/students/editStudent/:id" element={<EditStudentDetails />} />

            <Route path="/leaves" element={<Leaves />} />
            <Route path="/leaves/manageHolidays" element={<HolidayManagment />} />
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']} />}>
            <Route path="/payroll" element={<Payroll />} />
          </Route>

          {/* Stock */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']} />}>
            <Route path="/stock" element={<Stock />} />
            <Route path="/stock/stores" element={<Store />} />
            <Route path="/stock/items" element={<Items />} />
            <Route path="/stock/transactions" element={<Transactions />} />
            <Route path="/stock/movementHistory" element={<Movement />} />
          </Route>
          
          {/* Transport */}
          <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT']} />}>
            <Route path="/route" element={<Transport_Management/>} />
            <Route path="/route/vehicles" element={<Vehicles/>} />
            <Route path="/route/Driver&Attendants" element={<Driver_Attendants />} />
            <Route path="/route/routes_management" element={<Routes_Manage/>} />
            <Route path="/route/studentAllocations" element={<Student_Allocations />} />
            <Route path="/route/feePlans" element={<Fee_Plans />}/>
            <Route path="/route/reports" element={<Reports />}/>
          </Route>

          <Route element={<RoleProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL', 'RECEPTIONIST', 'ACCOUNTANT']} />}>
            <Route path="/leaves" element={<Navigate to="/leaves/myLeaves" replace />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Route>
      </Route>

    </Routes>
  );
};

export default MainRoutes;