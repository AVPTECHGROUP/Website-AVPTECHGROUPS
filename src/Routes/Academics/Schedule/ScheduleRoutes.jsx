import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';

const TimeTable = lazy(() => import('../../../Pages/Schedule/TimeTable'));
const CreateSchedule = lazy(() => import('../../../Pages/Schedule/CreateSchedule'));

const SCHEDULE_ROLES = ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'ADMIN'];

export default function ScheduleRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={SCHEDULE_ROLES} />}>
      <Route path="/schedule" element={<TimeTable />} />
      <Route path="/schedule/create" element={<CreateSchedule />} />
    </Route>
  );
}

