import { lazy } from 'react';
import { Navigate, Route } from 'react-router-dom';
import RoleProtectedRoute from '../../utils/RoleProtectedRoute';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const LeadManagementPage = lazy(() => import('../../Pages/LeadManagement/LeadManagementPage.jsx'));

// Standalone route — deliberately registered OUTSIDE AppLayout in MainRoutes.jsx.
// AppLayout renders the school-scoped sidebar/shell tied to whatever school is
// currently in localStorage/UserContext. Lead Management is a global CRM page
// with no school context, so it must sit at the same top-level tier as the
// school picker (/superAdmin) and Manage Schools (/super-admin/manage-schools) —
// not nested inside the per-school dashboard. Call as: leadManagementRoute()
export function leadManagementRoute() {
    return (
        <Route
            path={ROUTE_PATHS.LEAD_MANAGEMENT}
            element={
                <RoleProtectedRoute
                    allowedRoles={ROLE_GROUPS.LEAD_MANAGEMENT_ROLES}
                    // Was DASHBOARD — GLOBAL_SALES_SUPPORT has no dashboard access,
                    // so that fallback would strand them. SUPER_ADMIN (the school
                    // picker / console) is reachable by both roles in this group.
                    fallback={<Navigate to={ROUTE_PATHS.SUPER_ADMIN} replace />}
                >
                    <LeadManagementPage />
                </RoleProtectedRoute>
            }
        />
    );
}