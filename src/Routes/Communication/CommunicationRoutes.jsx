import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const CircularsPage = lazy(() => import('../../Pages/Communication/Circulars/CircularsPage'));
const CreateCircularPage = lazy(() => import('../../Pages/Communication/Circulars/CreateCircularPage'));
const EventsPage = lazy(() => import('../../Pages/Communication/Events/EventsPage'));
const CreateEventPage = lazy(() => import('../../Pages/Communication/Events/CreateEventPage'));
const ApprovalQueuePage = lazy(() => import('../../Pages/Communication/ApprovalQueue/ApprovalQueuePage'));
const NotificationsPage = lazy(() => import('../../Pages/Communication/Notifications/NotificationsPage'));

const COMM_ROLES = ['ADMIN', 'PRINCIPAL', 'TEACHER', 'GLOBAL_ADMIN', 'SUPER_ADMIN'];
const APPROVAL_ROLES = ['ADMIN', 'PRINCIPAL', 'GLOBAL_ADMIN', 'SUPER_ADMIN'];

export default function CommunicationRoutes() {
  return (
  <>
    {/* Circulars */}
    <Route
      path="/communication/circulars"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <CircularsPage />
        </RoleProtectedRoute>
      }
    />
    <Route
      path="/communication/circulars/:id"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <CircularsPage />
        </RoleProtectedRoute>
      }
    />
    <Route
      path="/communication/circulars/create"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <CreateCircularPage />
        </RoleProtectedRoute>
      }
    />

    {/* Events */}
    <Route
      path="/communication/events"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <EventsPage />
        </RoleProtectedRoute>
      }
    />
    <Route
      path="/communication/events/create"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <CreateEventPage />
        </RoleProtectedRoute>
      }
    />

    {/* Approval Queue */}
    <Route
      path="/communication/approval"
      element={
        <RoleProtectedRoute allowedRoles={APPROVAL_ROLES}>
          <ApprovalQueuePage />
        </RoleProtectedRoute>
      }
    />

    {/* Notifications */}
    <Route
      path="/communication/notifications"
      element={
        <RoleProtectedRoute allowedRoles={COMM_ROLES}>
          <NotificationsPage />
        </RoleProtectedRoute>
      }
    />
  </>
  );
}

