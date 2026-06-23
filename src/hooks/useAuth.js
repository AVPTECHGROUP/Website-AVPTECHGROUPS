import { useContext } from 'react';
import { UserContext } from '../ContextAPI/UserContext';

/**
 * Central hook for auth state and permission checking.
 * Reads exclusively from UserContext (which decodes the JWT once on init).
 * Do not read from localStorage directly — permissions live in the JWT, not
 * in the API-response user object that AuthApi stores as localStorage.user.
 */
export const useAuth = () => {
  const { user } = useContext(UserContext);

  const permissions = user?.permissions ?? [];
  const role = user?.userType ?? null;

  return {
    user,
    role,
    permissions,
    /** True if the user has this exact permission */
    hasPermission: (perm) => permissions.includes(perm),
    /** True if the user has at least one of the given permissions */
    hasAnyPermission: (permList) => permList.some((p) => permissions.includes(p)),
    /** True if the user has every one of the given permissions */
    hasAllPermissions: (permList) => permList.every((p) => permissions.includes(p)),
    /** True if the user's role matches */
    hasRole: (r) => role === r,
    /** True if the user's role is in the given list */
    hasAnyRole: (roles) => roles.includes(role),
  };
};
