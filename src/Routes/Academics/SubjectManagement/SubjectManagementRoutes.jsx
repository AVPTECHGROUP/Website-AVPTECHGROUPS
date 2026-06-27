import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';

const SubjectsMaster = lazy(() => import('../../../Components/Subject/subject'));
const SectionSubjectAssignment = lazy(() => import('../../../Pages/SubjectManagement/SectionSubjectAssignment'));

export default function SubjectManagementRoutes() {
  return (
    <>
      <Route element={<RoleProtectedRoute allowedRoles={['GLOBAL_ADMIN', 'SUPER_ADMIN', 'PRINCIPAL', 'ADMIN']} />}>
        <Route path="/subjectsmaster" element={<SubjectsMaster />} />
      </Route>

      <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
        <Route path="/sectionSubjectAssignment" element={<SectionSubjectAssignment />} />
      </Route>
    </>
  );
}