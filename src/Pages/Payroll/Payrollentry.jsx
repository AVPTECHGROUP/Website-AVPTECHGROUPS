import { Navigate } from 'react-router-dom';
import { getCurrUserDetails, getUserRole } from '../../utils/getCurrUserDetails';
import { ROLE_GROUPS, ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';
import Payroll from './Payroll';

// Single route target for ROUTE_PATHS.PAYROLL. Deciding admin-vs-self here,
// in one component, avoids registering the same path under two separate
// <Route> entries — React Router matches the first one it finds for a given
// path and never falls through to a sibling with an identical path, so a
// duplicate-path "fallback" route is unreachable dead code.
export default function PayrollEntry() {
    const currentUser = getCurrUserDetails();

    if (!currentUser) {
        return <Navigate to="/login" replace />;
    }

    const role = getUserRole(currentUser);
    const isAdminOrPrincipal = ROLE_GROUPS.ADMIN_PRINCIPAL.includes(role);

    return isAdminOrPrincipal ? <Payroll /> : <Navigate to={ROUTE_PATHS.PAYROLL_MY} replace />;
}