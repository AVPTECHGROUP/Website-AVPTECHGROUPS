import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const SchoolConfig = lazy(() => import('../../Pages/Schools/SchoolConfig'));
const AcademicYear = lazy(() => import('../../Pages/Attendance/AcademicYear/AcademicYear'));

export default function SchoolsRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.SUPER_GLOBAL_ADMIN} />}>
      <Route path={ROUTE_PATHS.SCHOOL_CONFIG} element={<SchoolConfig />} />
      <Route path={ROUTE_PATHS.ACADEMIC_YEAR} element={<AcademicYear />} />
    </Route>
  );
}