import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const SchoolConfig = lazy(() => import('../../Pages/Schools/SchoolConfig'));
const AcademicYear = lazy(() => import('../../Pages/Attendance/AcademicYear/AcademicYear'));

export default function SchoolsRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['SUPER_ADMIN', 'GLOBAL_ADMIN']} />}>
    <Route path="/schoolConfig" element={<SchoolConfig />} />
    <Route path="/academicYear" element={<AcademicYear />} />
  </Route>
  );
}

