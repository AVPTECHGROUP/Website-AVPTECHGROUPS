import { lazy } from 'react';
import { Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';
import OverdueFeeNotifications from "../../Pages/FeeManagement/Overduefeenotification.jsx";

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
const FeeStructures = lazy(() => import('../../Pages/FeeManagement/Feestructures'));

export default function FeeManagementRoutes() {
  return (
    <Route element={<RoleProtectedRoute allowedRoles={ROLE_GROUPS.FEE_ROLES} />}>
      <Route path={ROUTE_PATHS.FEE_MANAGEMENT} element={<OverviewPage />} />
      <Route path={ROUTE_PATHS.FEE_MANAGEMENT_CONFIG} element={<FeeSynthesisPage />} />
      <Route path={ROUTE_PATHS.FEE_MANAGEMENT_PERIOD} element={<FeePeriods />} />
      <Route path={ROUTE_PATHS.FEE_MANAGEMENT_STRUCTURES} element={<FeeStructures />} />
      <Route path={ROUTE_PATHS.FEE_MANAGEMENT_COLLECTIONS} element={<CollectionsPage />} />
      <Route path='overduefeenotifications' element={<OverdueFeeNotifications />} />
    </Route>
  );
}
