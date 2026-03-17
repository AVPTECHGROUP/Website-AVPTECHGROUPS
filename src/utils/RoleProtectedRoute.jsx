import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react';
import { UserContext } from '../ContextAPI/UserContext';

const RoleProtectedRoute = ({ allowedRoles, fallback, children }) => {
  const { user } = useContext(UserContext);

  if (!user) return null;

  const userType = user.userType;

  if (!allowedRoles.includes(userType)) {
    return fallback ? fallback : <Navigate to="/dashboard" replace />
  }
 
  return children ? children : <Outlet />
}

export default RoleProtectedRoute