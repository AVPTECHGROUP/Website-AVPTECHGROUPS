import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const Transport_Management = lazy(() => import('../../Pages/Transport/Transport_Management'));
const Vehicles = lazy(() => import('../../Pages/Transport/Vehicles'));
const Fee_Plans = lazy(() => import('../../Pages/Transport/Fee_Plans/Fee_Plans'));
const Driver_Attendants = lazy(() => import('../../Pages/Transport/Driver_Attendants'));
const Reports = lazy(() => import('../../Pages/Transport/Reports/Reports'));
const Student_Allocations = lazy(() => import('../../Pages/Transport/Student_Allocation/Student_Allocations'));
const Routes_Manage = lazy(() => import('../../Pages/Transport/Routes_Manage'));

export default function TransportRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.ADMIN_PRINCIPAL} />}>
      <Route path={ROUTE_PATHS.TRANSPORT} element={<Transport_Management />} />
      <Route path={ROUTE_PATHS.TRANSPORT_VEHICLES} element={<Vehicles />} />
      <Route path={ROUTE_PATHS.TRANSPORT_DRIVER_ATTENDANTS} element={<Driver_Attendants />} />
      <Route path={ROUTE_PATHS.TRANSPORT_ROUTES_MANAGEMENT} element={<Routes_Manage />} />
      <Route path={ROUTE_PATHS.TRANSPORT_STUDENT_ALLOCATIONS} element={<Student_Allocations />} />
      <Route path={ROUTE_PATHS.TRANSPORT_FEE_PLANS} element={<Fee_Plans />} />
      <Route path={ROUTE_PATHS.TRANSPORT_REPORTS} element={<Reports />} />
    </Route>
  );
}
