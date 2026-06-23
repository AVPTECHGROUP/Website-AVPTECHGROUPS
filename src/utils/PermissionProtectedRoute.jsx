import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

/**
 * allowedPermissions: string[] — user needs AT LEAST ONE (OR logic)
 * excludePermissions: string[] — if user has ANY of these, access is denied
 * fallback: element shown when access is denied (defaults to /dashboard redirect)
 */
const PermissionProtectedRoute = ({ allowedPermissions, excludePermissions, children, fallback }) => {
  const { hasAnyPermission, permissions } = useAuth();

  const hasRequired = !allowedPermissions?.length || hasAnyPermission(allowedPermissions);
  const hasExcluded = !!excludePermissions?.length && excludePermissions.some((p) => permissions.includes(p));

  if (!hasRequired || hasExcluded) {
    return fallback ?? <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

export default PermissionProtectedRoute;
