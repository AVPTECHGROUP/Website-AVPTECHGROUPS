import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';

const HomeworkPage = lazy(() => import('../../../Pages/Homework/Homeworkpage'));

export default function HomeworkRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
    <Route path="/homework" element={<HomeworkPage />} />
  </Route>
  );
}

