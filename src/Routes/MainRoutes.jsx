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
<<<<<<< HEAD
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetaills'
import AssignDetails from '../Pages/Teachers/AssignDetails'
import ClassAssignment from '../Pages/Teachers/ClassAssignment';
=======
import EditTeachersDetails from '../Pages/Teachers/EditTeachersDetails'
import AssignDetails from '../Pages/Teachers/AssignDetails';
import TeacherSalaryConfig from '../Pages/Teachers/TeacherSalaryConfig';
>>>>>>> f7c4313526923000789975bd9f72006e941ceb93

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
        <Route path="/teachers/teacherSalary" element={<EditTeachersDetails />} />

      <Route path="/settings" element={<Settings />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />

    </Routes>
  );
};

export default MainRoutes;
