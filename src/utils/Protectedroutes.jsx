import { Outlet, Navigate, useLocation } from 'react-router-dom';
import {jwtDecode} from "./getCurrUserDetails/GetCurrUserDetails.js";

const Protectedroutes = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const payload = jwtDecode(token);
  const isExpired = !payload || payload.exp < Math.floor(Date.now() / 1000);

  if (isExpired) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default Protectedroutes;
