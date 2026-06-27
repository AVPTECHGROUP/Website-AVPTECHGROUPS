import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const Transport_Management = lazy(() => import('../../Pages/Transport/Transport_Management'));
const Vehicles = lazy(() => import('../../Pages/Transport/Vehicles'));
const Fee_Plans = lazy(() => import('../../Pages/Transport/Fee_Plans/Fee_Plans'));
const Driver_Attendants = lazy(() => import('../../Pages/Transport/Driver_Attendants'));
const Reports = lazy(() => import('../../Pages/Transport/Reports/Reports'));
const Student_Allocations = lazy(() => import('../../Pages/Transport/Student_Allocation/Student_Allocations'));
const Routes_Manage = lazy(() => import('../../Pages/Transport/Routes_Manage'));

export default function TransportRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL']} />}>
    <Route path="/route" element={<Transport_Management />} />
    <Route path="/route/vehicles" element={<Vehicles />} />
    <Route path="/route/Driver&Attendants" element={<Driver_Attendants />} />
    <Route path="/route/routes_management" element={<Routes_Manage />} />
    <Route path="/route/studentAllocations" element={<Student_Allocations />} />
    <Route path="/route/feePlans" element={<Fee_Plans />} />
    <Route path="/route/reports" element={<Reports />} />
  </Route>
  );
}

