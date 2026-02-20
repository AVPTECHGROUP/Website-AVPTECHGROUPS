import { Navigate, Outlet } from 'react-router-dom'
import { useContext } from 'react';
import { UserContext } from '../ContextAPI/UserContext';

const RoleProtectedRoute = ({ allowedRoles }) => {
  const {user} = useContext(UserContext);
  if (!user) {
    return null;
  }
  const userType = user.userType;
  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/dashboard" replace />
  }
  return <Outlet />
}

export default RoleProtectedRoute