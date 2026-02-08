import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';
import Attendance from '../Pages/Attendance';
import Leaves from '../Pages/leaves';
import Payroll from '../Pages/Payroll';
import Teachers from '../Pages/Teachers/Teachers';
import Settings from '../Pages/Settings';
import DetailsView from '../Pages/Teachers/DetailsView';
import AddNewTeacher from '../Pages/Teachers/AddNewTeacher';
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetaills'
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';  
import WarningVerificationFailed from '../Components/UserAttendance/WarningVerificationFailed';
import ManualAttendance from '../Components/UserAttendance/ManualAttendanceRequest';
import ApprovedManualAttendance from '../Components/UserAttendance/ApprovedManualAttendance';
import UsersAttendance from '../Pages/Attendance/UsersAttendance';
import AttendanceImgReg from '../Pages/Attendance/AttendanceImgReg';
import MarkUserAttendance from '../Pages/Attendance/MarkUserAttendance';

const MainRoutes = () => {
  return (
    <Routes>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/attendance" element={<Attendance />} />
      {/* Attendance routes */}
      <Route path="/attendance/attendanceImgReg" element={<AttendanceImgReg/>}/>
      <Route path='/attendance/markUserAttendance' element={<MarkUserAttendance/>}/>
      <Route path='/attendance/usersAttendance' element={<UsersAttendance/>}/>
      <Route path='/attendance/usersAttendance/warning' element={<WarningVerificationFailed/>}/>
      <Route path='/attendance/usersAttendance/manual' element={<ManualAttendance/>}/>
      <Route path='/attendance/usersAttendance/approved' element={<ApprovedManualAttendance/>}/>
      {/*  */}
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/payroll" element={<Payroll />} />

      {/* Super Admin  */}
      <Route path='/dashboard/addUser' element={<AddnewSystemUser/>} />
      <Route path='/dashboard/editUser' element={<EditSysUser/>} />
      <Route path='/dashboard/manageUsers' element={<ManageAllUsers/>} />

      {/* Teachers */}
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
      <Route path="/teachers/assign" element={<ClassAssignment />} />
      <Route path="/teachers/:id" element={<DetailsView />} />
      <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails/>} />
      
        <Route path="/teachers/classAssignment" element={<ClassAssignment />} />
       {/* for testing purpose */}
       <Route path='dashboard/addSystemUser' element={<AddnewSystemUser/>} />

      

      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default MainRoutes;
