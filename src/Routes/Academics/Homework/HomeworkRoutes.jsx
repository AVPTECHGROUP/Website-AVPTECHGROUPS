import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS }from '../../../Constants/RoutesConstants/RoutesConst';

const HomeworkPage = lazy(() => import('../../../Pages/Homework/Homeworkpage'));

export default function HomeworkRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL_TEACHER} />}>
      <Route path={ROUTE_PATHS.HOMEWORK} element={<HomeworkPage />} />
    </Route>
  );
}
