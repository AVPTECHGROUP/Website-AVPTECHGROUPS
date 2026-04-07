import { createContext, useContext, useEffect, useState } from "react";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("school")) || null; }
    catch { return null; }
  });

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

  const saveSchool = (school) => {
    if (school) {
      localStorage.setItem("school", JSON.stringify(school));
    } else {
      localStorage.removeItem("school");
    }
    setSchoolInfo(school);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("school");
    setToken(null);
    setUser(null);
    setSchoolInfo(null);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, token, saveToken, logout, schoolInfo, saveSchool }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);