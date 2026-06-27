import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';

const OverviewPage = lazy(() =>
  import('../../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.OverviewPage }))
  );
const FeeSynthesisPage = lazy(() =>
  import('../../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.FeeSynthesisPage }))
  );
const CollectionsPage = lazy(() =>
  import('../../Pages/FeeManagement/FeeManagement').then((m) => ({ default: m.CollectionsPage }))
  );
const FeePeriods = lazy(() => import('../../Pages/FeeManagement/FeePeriods'));
const FeeStructures = lazy(() => import('../../Pages/FeeManagement/Feestructures.'));

const FEE_ROLES = ['ADMIN', 'SUPER_ADMIN', 'GLOBAL_ADMIN', 'PRINCIPAL', 'TEACHER', 'ACCOUNTANT'];

export default function FeeManagementRoutes() {
  return (
  <Route element={<RoleProtectedRoute allowedRoles={FEE_ROLES} />}>
    <Route path="/feemanagement" element={<OverviewPage />} />
    <Route path="/feemanagement/config" element={<FeeSynthesisPage />} />
    <Route path="/feemanagement/period" element={<FeePeriods />} />
    <Route path="/feemanagement/structures" element={<FeeStructures />} />
    <Route path="/feemanagement/collections" element={<CollectionsPage />} />
  </Route>
  );
}