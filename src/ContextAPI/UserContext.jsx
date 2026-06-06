// context/UserContext.jsx
import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";
import { useFcmToken } from "../hooks/useFcmtoken";

export const UserContext = createContext();

// ✅ Defined outside component — stable reference, never recreated
function showForegroundNotification(payload) {
  const title = payload?.notification?.title ?? "New Notification";
  const body  = payload?.notification?.body  ?? "";
  if (Notification.permission !== "granted") return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, { body, icon: "/logo.png" });
  });
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
  // showForegroundNotification is module-level so its reference never changes —
  // no useCallback needed, no re-subscription risk
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

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    // ① Unregister FCM token BEFORE clearing auth state
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