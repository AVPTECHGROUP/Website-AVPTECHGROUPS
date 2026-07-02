import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Dashboard = lazy(() => import('../../Pages/Dashboard/Dashboard'));

export default function DashboardRoutes() {
  return (
    <Route
      path={ROUTE_PATHS.DASHBOARD}
      element={
        <RoleProtectedRoute
          allowedRoles={ROLE_GROUPS.DASHBOARD_ROLES}
          fallback={<Navigate to={ROUTE_PATHS.STOCK_STUDENT_ORDERS_REDIRECT} replace />}
        >
          <Dashboard />
        </RoleProtectedRoute>
      }
    />
  );
}
