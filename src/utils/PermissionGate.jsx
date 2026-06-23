import { useAuth } from '../hooks/useAuth';

/**
 * Inline permission gate for buttons / UI elements.
 * Unlike PermissionProtectedRoute (which redirects), this simply hides or
 * swaps content based on the current user's permissions.
 *
 * Usage:
 *   <PermissionGate permission={P.STUDENT_CREATE}>
 *     <button>Add Student</button>
 *   </PermissionGate>
 *
 *   <PermissionGate any={[P.CIRCULAR_APPROVE, P.CIRCULAR_DELETE]}>
 *     <ActionMenu />
 *   </PermissionGate>
 *
 * Props:
 *   permission  — single permission string (OR logic with existing permissions)
 *   any         — string[] — user needs at least ONE
 *   all         — string[] — user needs ALL
 *   fallback    — element to render when access denied (default: null / hidden)
 */
const PermissionGate = ({ permission, any, all, children, fallback = null }) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  const allowed =
    permission   ? hasPermission(permission)     :
    any?.length  ? hasAnyPermission(any)         :
    all?.length  ? hasAllPermissions(all)        :
    true;

  return allowed ? children : fallback;
};

export default PermissionGate;
