import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const AddnewSystemUser = lazy(() => import('../../Pages/SuperAdmin/AddnewSystemUser'));
const EditSysUser = lazy(() => import('../../Pages/SuperAdmin/EditSysUser'));
const ManageAllUsers = lazy(() => import('../../Pages/SuperAdmin/ManageAllUsers'));
const UserView = lazy(() => import('../../Pages/SuperAdmin/UserView'));
const SuperAdminSchools = lazy(() => import('../../Pages/SuperAdmin/SuperAdminSchools'));

const SCHOOL_PICKER_ROLES = ['SUPER_ADMIN', 'GLOBAL_ADMIN'];
const MANAGE_USERS_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL'];

// School picker — outside AppLayout (no sidebar). Call as: superAdminSchoolPickerRoute()
export function superAdminSchoolPickerRoute() {
  return (
    <Route
      path="/superAdmin"
      element={
        <RoleProtectedRoute allowedRoles={SCHOOL_PICKER_ROLES}>
          <SuperAdminSchools />
        </RoleProtectedRoute>
      }
    />
  );
}

// User management — inside AppLayout. Call as: superAdminManageUsersRoutes()
export function superAdminManageUsersRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={MANAGE_USERS_ROLES} />}>
      <Route path="/manageUsers/addUser" element={<AddnewSystemUser />} />
      <Route path="/manageUsers/editUser/:id" element={<EditSysUser />} />
      <Route path="/manageUsers/:id" element={<UserView />} />
      <Route path="/manageUsers" element={<ManageAllUsers />} />
    </Route>
  );
}
