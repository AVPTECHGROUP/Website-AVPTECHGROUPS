// src/utils/PermissionProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useContext } from 'react';
import { UserContext } from '../ContextAPI/UserContext';

const getUserPermissions = (ctxUser) => {
  if (ctxUser?.permissions) return ctxUser.permissions;
  try {
    return JSON.parse(localStorage.getItem('user'))?.permissions || [];
  } catch {
    return [];
  }
};

/**
 * allowedPermissions: array — user needs AT LEAST ONE of these (OR logic)
 * excludePermissions: array — if user has ANY of these, access is denied
 *   (used for the rare "show only if user lacks X" case, e.g. /leaves redirect
 *   for users who can view but not approve leaves)
 * fallback: element to render/redirect to when access is denied (defaults to /dashboard)
 */
const PermissionProtectedRoute = ({ allowedPermissions, excludePermissions, children, fallback }) => {
  const { user: ctxUser } = useContext(UserContext);
  const userPermissions = getUserPermissions(ctxUser);

  const hasRequired = !allowedPermissions?.length
    || allowedPermissions.some(p => userPermissions.includes(p));

  const hasExcluded = !!excludePermissions?.length
    && excludePermissions.some(p => userPermissions.includes(p));

  const hasAccess = hasRequired && !hasExcluded;

  if (!hasAccess) return fallback ?? <Navigate to="/dashboard" replace />;
  return children ?? <Outlet />;
};

export default PermissionProtectedRoute;