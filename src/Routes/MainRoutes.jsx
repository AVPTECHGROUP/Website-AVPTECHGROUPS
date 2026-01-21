import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../Pages/Dashboard';
import Attendance from '../Pages/Attendance';
import Leaves from '../Pages/leaves';
import Payroll from '../Pages/Payroll';
import Teachers from '../Pages/Teachers/Teachers';
import Settings from '../Pages/Settings';
import Login_2 from '../Pages/Login_2';
import AddTeacher from '../Pages/Teachers/Teachers';
import DetailsView from '../Pages/Teachers/DetailsView';
import AddNewTeacher from '../Pages/Teachers/AddNewTeacher';
import TeacherSalaryConfig from '../Pages/Teachers/TeacherSalaryConfig';
import EditTeachersDetaills from '../Pages/Teachers/EditTeachersDetaills';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    // If no token, redirect to login
    return <Navigate to="/login" replace />;
  }
  return children;
};

const MainRoutes = () => {
  return (
    <Routes>
      {/* Login route */}
      <Route path="/login" element={<Login_2 />} />

      {/* Redirect root to dashboard */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/dashboard" />
          </ProtectedRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/attendance"
        element={
          <ProtectedRoute>
            <Attendance />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaves"
        element={
          <ProtectedRoute>
            <Leaves />
          </ProtectedRoute>
        }
      <Route path="/teachers/assign/:id" element={<AssignDetails/>} /> 
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <Payroll />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers"
        element={
          <ProtectedRoute>
            <Teachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teachers/:id"
        element={
          <ProtectedRoute>
            <DetailsView />
          </ProtectedRoute>
        }
      />
      <Route
        path='/teachers/addTeacher'
        element={
          <ProtectedRoute>
            <AddNewTeacher />
          </ProtectedRoute>
        }
      />
       <Route
        path='/teachers/TeacherSalary'
        element={
          <ProtectedRoute>
            <TeacherSalaryConfig />
          </ProtectedRoute>
        }
      />
        <Route
        path='/teachers/EditTeachersDetaills'
        element={
          <ProtectedRoute>
            <EditTeachersDetaills />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

export default MainRoutes;
