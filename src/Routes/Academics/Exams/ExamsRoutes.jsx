import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';

const Exams = lazy(() => import('../../../Pages/Exams/Exams'));
const MarksEntry = lazy(() => import('../../../Pages/Exams/MarksEntry'));
const ReportCards = lazy(() => import('../../../Pages/Exams/ReportCards'));
const Analytics = lazy(() => import('../../../Pages/Exams/Analytics'));
const ExamConfiguration = lazy(() => import('../../../Pages/Exams/ExamConfiguration'));

export default function ExamsRoutes() {
  return (
  <>
    {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL, TEACHER */}
    <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER']} />}>
      <Route path="/exams" element={<Exams />} />
      <Route path="/exams/marksEntry/:examId?" element={<MarksEntry />} />
      <Route path="/exams/reportCard/:examId?" element={<ReportCards />} />
    </Route>

    {/* ADMIN, SUPER_ADMIN, GLOBAL_ADMIN, PRINCIPAL */}
    <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
      <Route path="/exams/analytics" element={<Analytics />} />
      <Route path="/exams/examConfig" element={<ExamConfiguration />} />
    </Route>
  </>
  );
}

