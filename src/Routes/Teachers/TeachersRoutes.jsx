import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Teachers = lazy(() => import('../../Pages/Teachers/Teachers'));
const DetailsView = lazy(() => import('../../Pages/Teachers/DetailsView'));
const AddNewTeacher = lazy(() => import('../../Pages/Teachers/AddNewTeacher'));
const EditTeachersDetails = lazy(() => import('../../Pages/Teachers/EditTeachersDetaills'));
const ClassAssignment = lazy(() => import('../../Pages/Teachers/ClassAssignment'));

export default function TeachersRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
      <Route path={ROUTE_PATHS.TEACHERS} element={<Teachers />} />
      <Route path={ROUTE_PATHS.TEACHERS_ADD} element={<AddNewTeacher />} />
      <Route path={ROUTE_PATHS.TEACHERS_EDIT} element={<EditTeachersDetails />} />
      <Route path={ROUTE_PATHS.TEACHERS_CLASS_ASSIGNMENT} element={<ClassAssignment />} />
      <Route path={ROUTE_PATHS.TEACHERS_DETAIL} element={<DetailsView />} />
    </Route>
  );
}
