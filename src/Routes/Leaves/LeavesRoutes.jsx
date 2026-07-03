import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Leaves = lazy(() => import('../../Pages/Leaves/Leaves'));
const ApplyLeaves = lazy(() => import('../../Pages/Leaves/ApplyLeaves'));
const MyLeaves = lazy(() => import('../../Pages/Leaves/MyLeaves'));
const HolidayManagment = lazy(() => import('../../Pages/Leaves/Holiday/HolidayManagement'));
const LeaveConfig = lazy(() => import('../../Pages/Leaves/LeaveConfig'));

export default function LeavesRoutes() {
  return (
    <>
      {/* Available to all authenticated users */}
      <Route path={ROUTE_PATHS.LEAVES_APPLY} element={<ApplyLeaves />} />
      <Route path={ROUTE_PATHS.LEAVES_MY} element={<MyLeaves />} />

      {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
        <Route path={ROUTE_PATHS.LEAVES} element={<Leaves />} />
        <Route path={ROUTE_PATHS.LEAVES_MANAGE_HOLIDAYS} element={<HolidayManagment />} />
      </Route>

      {/* Leave Config */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.GLOBAL_SUPER_PRINCIPAL_ADMIN} />}>
        <Route path={ROUTE_PATHS.LEAVES_CONFIG} element={<LeaveConfig />} />
      </Route>

      {/* Redirect non-admin roles away from /leaves */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.LEAVES_REDIRECT_ROLES} />}>
        <Route path={ROUTE_PATHS.LEAVES} element={<Navigate to={ROUTE_PATHS.LEAVES_MY} replace />} />
      </Route>
    </>
  );
}
