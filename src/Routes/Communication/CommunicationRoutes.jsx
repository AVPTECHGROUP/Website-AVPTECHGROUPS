import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const CircularsPage = lazy(() => import('../../Pages/Communication/Circulars/CircularsPage'));
const CreateCircularPage = lazy(() => import('../../Pages/Communication/Circulars/CreateCircularPage'));
const EventsPage = lazy(() => import('../../Pages/Communication/Events/EventsPage'));
const CreateEventPage = lazy(() => import('../../Pages/Communication/Events/CreateEventPage'));
const ApprovalQueuePage = lazy(() => import('../../Pages/Communication/ApprovalQueue/ApprovalQueuePage'));
const NotificationsPage = lazy(() => import('../../Pages/Communication/Notifications/NotificationsPage'));

export default function CommunicationRoutes() {
  return (
    <>
      {/* Circulars */}
      <Route
        path={ROUTE_PATHS.COMM_CIRCULARS}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <CircularsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.COMM_CIRCULARS_DETAIL}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <CircularsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.COMM_CIRCULARS_CREATE}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <CreateCircularPage />
          </RoleProtectedRoute>
        }
      />

      {/* Events */}
      <Route
        path={ROUTE_PATHS.COMM_EVENTS}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <EventsPage />
          </RoleProtectedRoute>
        }
      />
      <Route
        path={ROUTE_PATHS.COMM_EVENTS_CREATE}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <CreateEventPage />
          </RoleProtectedRoute>
        }
      />

      {/* Approval Queue */}
      <Route
        path={ROUTE_PATHS.COMM_APPROVAL}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.APPROVAL_ROLES}>
            <ApprovalQueuePage />
          </RoleProtectedRoute>
        }
      />

      {/* Notifications */}
      <Route
        path={ROUTE_PATHS.COMM_NOTIFICATIONS}
        element={
          <RoleProtectedRoute allowedRoles={ROLE_GROUPS.COMM_ROLES}>
            <NotificationsPage />
          </RoleProtectedRoute>
        }
      />
    </>
  );
}
