import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const LeadManagementPage = lazy(() => import('../../Pages/LeadManagement/LeadManagementPage.jsx'));

export default function LeadRoutes() {
    return (
        <Route
            path={ROUTE_PATHS.LEAD_MANAGEMENT}
            element={
                <RoleProtectedRoute
                    allowedRoles={ROLE_GROUPS.GLOBAL_ADMIN_ONLY}
                    fallback={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />}
                >
                    <LeadManagementPage />
                </RoleProtectedRoute>
            }
        />
    );
}