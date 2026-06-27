import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const RolesPermissionsManagement = lazy(() => import('../../Pages/RoleBasedPermission/PermissionManagement'));

export default function RoleBasedPermissionRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['GLOBAL_ADMIN']} />}>
    <Route path="/rolesPermissions" element={<RolesPermissionsManagement />} />
  </Route>
  );
}

