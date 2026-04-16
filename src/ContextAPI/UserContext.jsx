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

  // ✅ Load profile from localStorage on mount
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("profile")) || null; }
    catch { return null; }
  });

  useEffect(() => {
    try {
      const decodedToken = getCurrUserDetails();
      if (decodedToken) {
        setUser({
          id:          decodedToken.userId,
          userType:    decodedToken.roles?.[0],
          email:       decodedToken.sub,
          permissions: decodedToken.permissions,
          schoolId:    decodedToken.schoolId,
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

  // ✅ Call this after login with response.data.user.profile
  const saveProfile = (profileData) => {
    if (profileData) {
      localStorage.setItem("profile", JSON.stringify(profileData));
    } else {
      localStorage.removeItem("profile");
    }
    setProfile(profileData);
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
    localStorage.removeItem("profile");
    setToken(null);
    setUser(null);
    setSchoolInfo(null);
    setProfile(null);
  };

  return (
    <UserContext.Provider
      value={{ user, setUser, token, saveToken, logout, schoolInfo, saveSchool, profile, saveProfile }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);