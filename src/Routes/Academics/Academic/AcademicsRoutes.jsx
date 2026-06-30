import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS }from '../../../Constants/RoutesConstants/RoutesConst';

const ClassSectionConfig = lazy(() => import('../../../Pages/Academics/ClassSectionConfig'));

export default function AcademicsRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
      <Route path={ROUTE_PATHS.ACADEMICS_CLASS_SECTIONS} element={<ClassSectionConfig />} />
    </Route>
  );
}
