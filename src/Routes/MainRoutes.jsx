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
import TeacherSalaryConfig from '../Pages/Teachers/TeacherSalaryConfig';
import AddnewSystemUser from '../Pages/SuperAdmin/AddnewSystemUser';
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
import EditSysUser from '../Pages/SuperAdmin/EditSysUser';
import ManageAllUsers from '../Pages/SuperAdmin/ManageAllUsers';
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

      {/* Teachers */}
      <Route path="/teachers" element={<Teachers />} />
      <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
      <Route path="/teachers/assign" element={<ClassAssignment />} />
      <Route path="/teachers/:id" element={<DetailsView />} />
      <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails/>} />
      
       <Route path="/teachers/teacherSalary" element={<TeacherSalaryConfig />} />
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
