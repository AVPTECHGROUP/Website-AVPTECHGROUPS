import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Dashboard = lazy(() => import('../../Pages/Dashboard/Dashboard'));

export default function DashboardRoutes() {
  return (
  <Route
    path="/dashboard"
    element={
      <RoleProtectedRoute
        allowedRoles={['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STORE_ACCOUNTANT']}
        fallback={<Navigate to="/stock/studentOrders" replace />}
      >
        <Dashboard />
      </RoleProtectedRoute>
    }
  />
  );
}

