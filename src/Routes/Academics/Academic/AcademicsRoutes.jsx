import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';

const ClassSectionConfig = lazy(() => import('../../../Pages/Academics/ClassSectionConfig'));

export default function AcademicsRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
    <Route path="/academics/classSections" element={<ClassSectionConfig />} />
  </Route>
  );
}