import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const RoleProtectedRoute = ({ allowedRoles, fallback, children }) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    if (fallback) return fallback;
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default RoleProtectedRoute;