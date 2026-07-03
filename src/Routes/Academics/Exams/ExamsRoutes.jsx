import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS }from '../../../Constants/RoutesConstants/RoutesConst';

const Exams = lazy(() => import('../../../Pages/Exams/Exams'));
const MarksEntry = lazy(() => import('../../../Pages/Exams/MarksEntry'));
const ReportCards = lazy(() => import('../../../Pages/Exams/ReportCards'));
const Analytics = lazy(() => import('../../../Pages/Exams/Analytics'));
const ExamConfiguration = lazy(() => import('../../../Pages/Exams/ExamConfiguration'));

export default function ExamsRoutes() {
  return (
    <>
      {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL_TEACHER} />}>
        <Route path={ROUTE_PATHS.EXAMS} element={<Exams />} />
        <Route path={ROUTE_PATHS.EXAMS_MARKS_ENTRY} element={<MarksEntry />} />
        <Route path={ROUTE_PATHS.EXAMS_REPORT_CARD} element={<ReportCards />} />
      </Route>

      {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
      <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
        <Route path={ROUTE_PATHS.EXAMS_ANALYTICS} element={<Analytics />} />
        <Route path={ROUTE_PATHS.EXAMS_CONFIG} element={<ExamConfiguration />} />
      </Route>
    </>
  );
}
