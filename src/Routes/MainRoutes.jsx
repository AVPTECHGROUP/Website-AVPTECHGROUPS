import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout & Protection — kept eager since they're needed on every route
import AppLayout from '../Layout/AppLayout';
import ProtectedRoutes from '../utils/Protectedroutes';

// ─── Modular Route Modules ───────────
import AcademicsRoutes from './Academics/Academic/AcademicsRoutes';
import AttendanceRoutes from './Attendance/AttendanceRoutes';
import CommunicationRoutes from './Communication/CommunicationRoutes';
import DashboardRoutes from './Dashboard/DashboardRoutes';
import ExamsRoutes from './Academics/Exams/ExamsRoutes';
import FeeManagementRoutes from './FeeManagement/FeeManagementRoutes';
import HomeworkRoutes from './Academics/Homework/HomeworkRoutes';
import LeavesRoutes from './Leaves/LeavesRoutes';
import RoleBasedPermissionRoutes from './RoleBasedPermission/RoleBasedPermissionRoutes';
import ScheduleRoutes from './Academics/Schedule/ScheduleRoutes';
import SchoolsRoutes from './Schools/SchoolsRoutes';
import SchoolSpineWebRoutes from './SchoolSpineWeb/SchoolSpineWebRoutes';
import StockRoutes from './Stock/StockRoutes';
import StudentsRoutes from './Students/StudentsRoutes';
import SubjectManagementRoutes from './Academics/SubjectManagement/SubjectManagementRoutes';
import { superAdminSchoolPickerRoute, superAdminManageUsersRoutes } from './SuperAdmin/SuperAdminRoutes';
import TeachersRoutes from './Teachers/TeachersRoutes';
import TransportRoutes from './Transport/TransportRoutes';

// ─── Lazy-loaded standalone pages ─────────────────────────────────────────────
const Login = lazy(() => import('../Pages/Login_2'));
const Settings = lazy(() => import('../Pages/Settings'));

// ─── Suspense fallback ─────────────────────────────────────────────────────────
const PageLoader = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-4 sm:gap-5 bg-white px-4">
    <div className="relative h-12 w-12 sm:h-16 sm:w-16">
      <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 border-r-blue-600 animate-spin" />
    </div>
    <p className="text-base sm:text-lg font-semibold text-gray-700 text-center">Loading SchoolSpine...</p>
  </div>
);

// ─── Smart root redirect based on role ────────────────────────────────────────
const RootRedirect = () => {
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const role =
    storedUser?.userType ||
    (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null);
  if (role === 'STORE_SELLER') return <Navigate to="/stock/studentOrders" replace />;
  return <Navigate to="/dashboard" replace />;
};

// ──────────────────────────────────────────────────────────────────────────────
const MainRoutes = () => {
  const isLoggedIn = !!localStorage.getItem('token');

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* ── Public landing pages — called as functions, not JSX components ── */}
        {SchoolSpineWebRoutes({ RootRedirect, isLoggedIn })}

        {/* ── Auth ── */}
        <Route path="/login" element={isLoggedIn ? <RootRedirect /> : <Login />} />

        {/* ── Protected ── */}
        <Route element={<ProtectedRoutes />}>
          {/* School picker — no AppLayout */}
          {superAdminSchoolPickerRoute()}

          {/* All app routes — inside AppLayout (sidebar) */}
          <Route element={<AppLayout />}>
            {DashboardRoutes()}
            <Route path="/settings" element={<Settings />} />

            {AttendanceRoutes()}
            {AcademicsRoutes()}
            {CommunicationRoutes()}
            {ExamsRoutes()}
            {FeeManagementRoutes()}
            {HomeworkRoutes()}
            {LeavesRoutes()}
            {RoleBasedPermissionRoutes()}
            {ScheduleRoutes()}
            {SchoolsRoutes()}
            {StockRoutes()}
            {StudentsRoutes()}
            {SubjectManagementRoutes()}
            {superAdminManageUsersRoutes()}
            {TeachersRoutes()}
            {TransportRoutes()}

            {/* Fallback */}
            <Route path="*" element={<RootRedirect />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

export default MainRoutes;