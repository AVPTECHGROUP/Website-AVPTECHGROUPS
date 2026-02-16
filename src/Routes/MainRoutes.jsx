import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';

// Pages
import Login from '../Pages/Login_2';
import Dashboard from '../Pages/Dashboard';
import Attendance from '../Pages/Attendance/Attendance';
import Leaves from '../Pages/leaves';
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

// Sttudents
import Student from '../Pages/Students/Students';
import AddNewStudent from '../Pages/Students/AddNewStudent';
import EditStudentDetails from '../Pages/Students/EditStudentDetails';
import StudentDetails from '../Pages/Students/StudentDetails';

const MainRoutes = () => {
  return (
    <Routes>

      {/* Default */}
      {/* <Route path="/" element={<Navigate to="/login" />} /> */}

      {/* 🔓 PUBLIC ROUTE (NO SIDEBAR) */}
      <Route path="/login" element={<Login />} />

      {/* 🔐 PROTECTED ROUTES */}
      <Route element={<ProtectedRoutes />}>
        <Route element={<AppLayout />}>

          {/* Super Admin */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/addUser" element={<AddnewSystemUser />} />
          <Route path="/dashboard/editUser/:id" element={<EditSysUser />} />
          <Route path="/dashboard/manageUsers" element={<ManageAllUsers />} />

          {/* Attendance */}
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance/attendanceImgReg" element={<AttendanceImgReg />} />
          <Route path="/attendance/markUserAttendance" element={<MarkUserAttendance />} />
          <Route path="/attendance/usersAttendance" element={<UsersAttendance />} />
          <Route path="/attendance/usersAttendance/warning" element={<WarningVerificationFailed />} />
          <Route path="/attendance/usersAttendance/manual" element={<ManualAttendance />} />

          {/* Teachers */}
          <Route path="/teachers" element={<Teachers />} />
          <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
          <Route path="/teachers/:id" element={<DetailsView />} />
          <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails />} />
          <Route path="/teachers/classAssignment" element={<ClassAssignment />} />

          {/* Students */}
          <Route path="/students" element={<Student/>} />
          <Route path="/students/addStudents" element={<AddNewStudent/>} />
          <Route path="/students/:id" element={<StudentDetails/>} />
          <Route path="/students/editStudent/:id" element={<EditStudentDetails/>} />


          {/* Others */}

          <Route path="/leaves" element={<Leaves />} />
          <Route path="/payroll" element={<Payroll />} />

          {/* Settings */}
          <Route path="/settings" element={<Settings />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/dashboard" />} />

        </Route>
      </Route>

    </Routes>
  );
};

export default MainRoutes;