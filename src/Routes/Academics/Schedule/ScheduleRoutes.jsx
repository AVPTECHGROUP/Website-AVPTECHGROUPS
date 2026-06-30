import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS }from '../../../Constants/RoutesConstants/RoutesConst';

const TimeTable = lazy(() => import('../../../Pages/Schedule/TimeTable'));
const CreateSchedule = lazy(() => import('../../../Pages/Schedule/CreateSchedule'));

export default function ScheduleRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.SCHEDULE_ROLES} />}>
      <Route path={ROUTE_PATHS.SCHEDULE} element={<TimeTable />} />
      <Route path={ROUTE_PATHS.SCHEDULE_CREATE} element={<CreateSchedule />} />
    </Route>
  );
}
