import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react';
import { UserContext } from '../ContextAPI/UserContext';

const RoleProtectedRoute = ({ allowedRoles, fallback, children }) => {
  const { user: ctxUser } = useContext(UserContext);

  // fallback to localStorage in case UserContext hasn't hydrated yet
  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null } catch { return null }
  })();

  const user = ctxUser || storedUser;

  // if still no user, redirect to login
  if (!user) return <Navigate to="/login" replace />;

  const userType = user.userType || (Array.isArray(user.roles) ? user.roles[0] : null);

  if (!allowedRoles.includes(userType)) {
    return fallback ? fallback : <Navigate to="/dashboard" replace />
  }

  return children ? children : <Outlet />
}

export default RoleProtectedRoute