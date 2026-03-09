import { createContext, useContext, useEffect, useState } from "react";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  useEffect(() => {
    try {
      const decodedToken = getCurrUserDetails();

      if (decodedToken) {
        setUser({
          id: decodedToken.userId,
          userType: decodedToken.roles?.[0],
          email: decodedToken.sub,
          permissions: decodedToken.permissions,
        });
      }
    } catch (error) {
      setUser(null);
    }
  }, [token]);

  const saveToken = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, token, saveToken, logout }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => {
  return useContext(UserContext);
};