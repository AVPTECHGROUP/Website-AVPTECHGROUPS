import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Student = lazy(() => import('../../Pages/Students/Students'));
const AddNewStudent = lazy(() => import('../../Pages/Students/AddNewStudent'));
const EditStudentDetails = lazy(() => import('../../Pages/Students/EditStudentDetails'));
const StudentDetails = lazy(() => import('../../Pages/Students/StudentDetails'));

export default function StudentsRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
    <Route path="/students" element={<Student />} />
    <Route path="/students/addStudents" element={<AddNewStudent />} />
    <Route path="/students/:id" element={<StudentDetails />} />
    <Route path="/students/editStudent/:id" element={<EditStudentDetails />} />
  </Route>
  );
}

