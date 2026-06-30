import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Student = lazy(() => import('../../Pages/Students/Students'));
const AddNewStudent = lazy(() => import('../../Pages/Students/AddNewStudent'));
const EditStudentDetails = lazy(() => import('../../Pages/Students/EditStudentDetails'));
const StudentDetails = lazy(() => import('../../Pages/Students/StudentDetails'));

export default function StudentsRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
      <Route path={ROUTE_PATHS.STUDENTS} element={<Student />} />
      <Route path={ROUTE_PATHS.STUDENTS_ADD} element={<AddNewStudent />} />
      <Route path={ROUTE_PATHS.STUDENTS_DETAIL} element={<StudentDetails />} />
      <Route path={ROUTE_PATHS.STUDENTS_EDIT} element={<EditStudentDetails />} />
    </Route>
  );
}
