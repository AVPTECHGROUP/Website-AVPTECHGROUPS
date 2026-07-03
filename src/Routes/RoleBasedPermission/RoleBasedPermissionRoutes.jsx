import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const RolesPermissionsManagement = lazy(() => import('../../Pages/RoleBasedPermission/PermissionManagement'));

export default function RoleBasedPermissionRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.GLOBAL_ADMIN_ONLY} />}>
      <Route path={ROUTE_PATHS.ROLES_PERMISSIONS} element={<RolesPermissionsManagement />} />
    </Route>
  );
}
