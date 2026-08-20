import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Roles with no dashboard/sidebar access — their only safe landing point is
// the Select School / console page. Kept here (rather than importing
// RoutesConst) to avoid a circular import; if you add more dashboard-less
// roles later, add them here too.
const NO_DASHBOARD_ROLES = ['GLOBAL_SALES_SUPPORT'];

const RoleProtectedRoute = ({ allowedRoles, fallback, children }) => {
  const { role } = useAuth();

  if (!role) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(role)) {
    if (fallback) return fallback;
    // Default fallback used to be a blind '/dashboard' redirect, which is a
    // dead end (and potential redirect loop) for roles like
    // GLOBAL_SALES_SUPPORT that have no dashboard access at all.
    const safeDefault = NO_DASHBOARD_ROLES.includes(role) ? '/superAdmin' : '/dashboard';
    return <Navigate to={safeDefault} replace />;
  }

  return children ?? <Outlet />;
};

export default RoleProtectedRoute;