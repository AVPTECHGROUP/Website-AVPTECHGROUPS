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
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetaills'
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
import TeacherSalaryConfig from '../Pages/Teachers/TeacherSalaryConfig';
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';

const MainRoutes = () => {
  return (
    <Routes>

      {/* Default Redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* Pages */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/attendance" element={<Attendance />} />
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/payroll" element={<Payroll />} />

      {/* Super Admin  */}
      <Route path='/dashboard/addUser' element={<AddnewSystemUser/>} />
      <Route path='/dashboard/editUser' element={<EditSysUser/>} />
      <Route path='/dashboard/manageUsers' element={<ManageAllUsers/>} />

      
      {/* Teachers */}
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
      <Route path="/teachers/:id" element={<DetailsView />} />
      <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails/>} />

      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default MainRoutes;
