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

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("profile")) || null; }
    catch { return null; }
  });

  // ✅ Academic year stored once at login — used across fee module
  const [currentAcademicYear, setCurrentAcademicYear] = useState(() => {
    try { return JSON.parse(localStorage.getItem("currentAcademicYear")) || null; }
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

  /**
   * Call this right after login with the response from:
   * GET /api/v1/academic-years/current
   * Shape: { id, label, ... }
   */
  const saveCurrentAcademicYear = (yearData) => {
    if (yearData) {
      localStorage.setItem("currentAcademicYear", JSON.stringify(yearData));
    } else {
      localStorage.removeItem("currentAcademicYear");
    }
    setCurrentAcademicYear(yearData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("school");
    localStorage.removeItem("profile");
    localStorage.removeItem("currentAcademicYear");
    setToken(null);
    setUser(null);
    setSchoolInfo(null);
    setProfile(null);
    setCurrentAcademicYear(null);
  };

  return (
    <UserContext.Provider
      value={{
        user, setUser,
        token, saveToken,
        logout,
        schoolInfo, saveSchool,
        profile, saveProfile,
        currentAcademicYear, saveCurrentAcademicYear,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);