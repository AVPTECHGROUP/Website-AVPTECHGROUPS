import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Leaves = lazy(() => import('../../Pages/Leaves/Leaves'));
const ApplyLeaves = lazy(() => import('../../Pages/Leaves/ApplyLeaves'));
const MyLeaves = lazy(() => import('../../Pages/Leaves/MyLeaves'));
const HolidayManagment = lazy(() => import('../../Pages/Leaves/Holiday/HolidayManagement'));
const LeaveConfig = lazy(() => import('../../Pages/Leaves/LeaveConfig'));

export default function LeavesRoutes() {
  return (
  <>
    {/* Available to all authenticated users */}
    <Route path="/leaves/applyLeaves" element={<ApplyLeaves />} />
    <Route path="/leaves/myLeaves" element={<MyLeaves />} />

    {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
    <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
      <Route path="/leaves" element={<Leaves />} />
      <Route path="/leaves/manageHolidays" element={<HolidayManagment />} />
    </Route>

    {/* Leave Config */}
    <Route element={<RoleProtectedRoute allowedRoles={['GLOBAL_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ADMIN']} />}>
      <Route path="/leaves/leaveConfig" element={<LeaveConfig />} />
    </Route>

    {/* Redirect non-admin roles away from /leaves */}
    <Route element={<RoleProtectedRoute allowedRoles={['TEACHER', 'PRINCIPAL', 'RECEPTIONIST', 'ACCOUNTANT']} />}>
      <Route path="/leaves" element={<Navigate to="/leaves/myLeaves" replace />} />
    </Route>
  </>
  );
}

