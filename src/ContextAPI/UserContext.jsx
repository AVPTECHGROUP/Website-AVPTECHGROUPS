// context/UserContext.jsx  ← UPDATED with FCM integration
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";
import { useFcmToken } from "../hooks/useFcmToken";

export const UserContext = createContext();

/**
 * Lightweight foreground notification display.
 * Replace with your own toast/notification system if preferred.
 */
function showForegroundNotification(payload) {
  const title = payload?.notification?.title ?? "New Notification";
  const body  = payload?.notification?.body  ?? "";
  // Uses the native Notification API; feel free to swap for a toast library
  if (Notification.permission === "granted") {
    new Notification(title, { body, icon: "/logo.png" });
  }
}

export const UserProvider = ({ children }) => {
  const [user, setUser]   = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [schoolInfo, setSchoolInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem("school")) || null; }
    catch { return null; }
  });

  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem("profile")) || null; }
    catch { return null; }
  });

  const [currentAcademicYear, setCurrentAcademicYear] = useState(() => {
    try {
      const saved = localStorage.getItem("currentAcademicYear");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // ── Decode JWT on every token change ─────────────────────────────────────
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
    } catch {
      setUser(null);
    }
  }, [token]);

  // ── FCM hook ──────────────────────────────────────────────────────────────
  // Pass the role so the hook knows which endpoint to call.
  // "PARENT" uses /device-token/parent; everything else uses /device-token/user
  const { deleteCurrentToken } = useFcmToken({
    role: user?.userType ?? null,
    onForegroundMessage: showForegroundNotification,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
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

  const saveCurrentAcademicYear = (yearData) => {
    if (yearData) {
      localStorage.setItem("currentAcademicYear", JSON.stringify(yearData));
    } else {
      localStorage.removeItem("currentAcademicYear");
    }
    setCurrentAcademicYear(yearData);
  };

  /**
   * logout
   *
   * 1. Deletes the FCM token from Firebase so no more pushes arrive on this device.
   * 2. Clears all local state and localStorage.
   */
  const logout = useCallback(async () => {
    // ① Unregister FCM token BEFORE clearing auth state
    //    (the API call needs the JWT still in localStorage)
    await deleteCurrentToken();

    // ② Clear auth
    localStorage.removeItem("token");
    localStorage.removeItem("school");
    localStorage.removeItem("profile");
    localStorage.removeItem("currentAcademicYear");
    setToken(null);
    setUser(null);
    setSchoolInfo(null);
    setProfile(null);
    setCurrentAcademicYear(null);
  }, [deleteCurrentToken]);

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