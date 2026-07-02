import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS }from '../../../Constants/RoutesConstants/RoutesConst';

const SubjectsMaster = lazy(() => import('../../../Components/Subject/subject'));
const SectionSubjectAssignment = lazy(() => import('../../../Pages/SubjectManagement/SectionSubjectAssignment'));

export default function SubjectManagementRoutes() {
  return (
    <>
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.GLOBAL_SUPER_PRINCIPAL_ADMIN} />}>
        <Route path={ROUTE_PATHS.SUBJECTS_MASTER} element={<SubjectsMaster />} />
      </Route>

      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
        <Route path={ROUTE_PATHS.SECTION_SUBJECT_ASSIGNMENT} element={<SectionSubjectAssignment />} />
      </Route>
    </>
  );
}
