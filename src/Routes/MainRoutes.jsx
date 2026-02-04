import React from 'react';
import Protectedroutes from '../utils/Protectedroutes';
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
import EditTeachersDetails from "../Pages/Teachers/EditTeachersDetaills";
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
import Login_2 from '../Pages/Login_2';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';  
import WarningVerificationFailed from '../Components/Teacher/UserAttendance/WarningVerificationFailed';
import ManualAttendance from '../Components/Teacher/UserAttendance/ManualAttendance';
import ApprovedManualAttendance from '../Components/Teacher/UserAttendance/ApprovedManualAttendance';
import UsersAttendance from '../Pages/Attendance/UsersAttendance';
import AttendanceImgReg from '../Pages/Attendance/AttendanceImgReg';
import MarkUserAttendance from '../Pages/Attendance/MarkUserAttendance';

const MainRoutes = () => {
  return (
    <Routes>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/login" />} />
       
      {/* Pages */}
      <Route path='/login' element={<Login_2/>} />

      
      
      <Route element={<Protectedroutes/>}>  
        <Route element={<AppLayout/>}/>  

              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/leaves" element={<Leaves />} />
              <Route path="/payroll" element={<Payroll />} />

           {/* Super Admin  */}
              <Route path='/dashboard/addUser' element={<AddnewSystemUser/>} />
              <Route path='/dashboard/editUser' element={<EditSysUser/>} />
               <Route path='/dashboard/manageUsers' element={<ManageAllUsers/>} />
               <Route path='/dashboard/usersAttendance' element={<UsersAttendance/>}/>
                <Route path='/dashboard/attendanceImgReg' element={<AttendanceImgReg/>}/>
                  <Route path='/dashboard/markUserAttendance' element={<MarkUserAttendance/>}/>

      
            {/* Teachers */}
               <Route path="/teachers" element={<Teachers />} />
               <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
               <Route path="/teachers/:id" element={<DetailsView />} />
               <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails/>} />
       
    
               <Route path="/teachers/classAssignment" element={<ClassAssignment />} />
            {/* for testing purpose */}
               <Route path='dashboard/addSystemUser' element={<AddnewSystemUser/>} />
              <Route path='/teachers/usersAttendance/warning' element={<WarningVerificationFailed/>}/>
               <Route path='/teachers/usersAttendance/manual' element={<ManualAttendance/>}/>
               <Route path='/teachers/usersAttendance/approved' element={<ApprovedManualAttendance/>}/>
     
      

      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

            {/* Fallback */}
                <Route path="*" element={<Navigate to="/login" />} />
        </Route>
    
    </Routes>
  );
};

export default MainRoutes;
