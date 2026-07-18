import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const AddnewSystemUser = lazy(() => import('../../Pages/SuperAdmin/AddnewSystemUser'));
const EditSysUser = lazy(() => import('../../Pages/SuperAdmin/EditSysUser'));
const ManageAllUsers = lazy(() => import('../../Pages/SuperAdmin/ManageAllUsers'));
const UserView = lazy(() => import('../../Pages/SuperAdmin/UserView'));
const SuperAdminSchools = lazy(() => import('../../Pages/SuperAdmin/SuperAdminSchools'));

// School picker — outside AppLayout (no sidebar). Call as: superAdminSchoolPickerRoute()
export function superAdminSchoolPickerRoute() {
  return (
    <Route
      path={ROUTE_PATHS.SUPER_ADMIN}
      element={
        <RoleProtectedRoute allowedRoles={ROLE_GROUPS.SCHOOL_PICKER_ROLES}>
          <SuperAdminSchools />
        </RoleProtectedRoute>
      }
    />
  );
}

// User management — inside AppLayout. Call as: superAdminManageUsersRoutes()
export function superAdminManageUsersRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.MANAGE_USERS_ROLES} />}>
      <Route path={ROUTE_PATHS.MANAGE_USERS_ADD} element={<AddnewSystemUser />} />
      <Route path={ROUTE_PATHS.MANAGE_USERS_EDIT} element={<EditSysUser />} />
      <Route path={ROUTE_PATHS.MANAGE_USERS_DETAIL} element={<UserView />} />
      <Route path={ROUTE_PATHS.MANAGE_USERS} element={<ManageAllUsers />} />
    </Route>
  );
}
