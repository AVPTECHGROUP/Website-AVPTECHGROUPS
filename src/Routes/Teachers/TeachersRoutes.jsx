import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Teachers = lazy(() => import('../../Pages/Teachers/Teachers'));
const DetailsView = lazy(() => import('../../Pages/Teachers/DetailsView'));
const AddNewTeacher = lazy(() => import('../../Pages/Teachers/AddNewTeacher'));
const EditTeachersDetails = lazy(() => import('../../Pages/Teachers/EditTeachersDetaills'));
const ClassAssignment = lazy(() => import('../../Pages/Teachers/ClassAssignment'));

export default function TeachersRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
    <Route path="/teachers" element={<Teachers />} />
    <Route path="/teachers/addTeacher" element={<AddNewTeacher />} />
    <Route path="/teachers/editTeacher/:id" element={<EditTeachersDetails />} />
    <Route path="/teachers/classAssignment/:teacherId" element={<ClassAssignment />} />
    <Route path="/teachers/:id" element={<DetailsView />} />
  </Route>
  );
}

