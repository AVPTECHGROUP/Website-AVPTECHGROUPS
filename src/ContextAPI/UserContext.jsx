// context/UserContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";
import { useFcmToken } from "../hooks/useFcmtoken";

export const UserContext = createContext();

function showForegroundNotification(payload) {
  const title = payload?.notification?.title ?? "New Notification";
  const body  = payload?.notification?.body  ?? "";
  if (Notification.permission !== "granted") return;
  navigator.serviceWorker.ready.then(reg => {
    reg.showNotification(title, { body, icon: "/logo.png" });
  });
}

// ── Decode JWT synchronously — called at render time, not in useEffect ────────
function decodeToken(rawToken) {
  if (!rawToken) return null;
  try {
    const decoded = getCurrUserDetails();
    if (!decoded) return null;
    return {
      id:          decoded.userId,
      userType:    decoded.roles?.[0] ?? null,
      email:       decoded.sub,
      permissions: decoded.permissions ?? [],
      schoolId:    decoded.schoolId ?? null,
    };
  } catch {
    return null;
  }
}

export const UserProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // ✅ Derive user synchronously from token — never null on first render
  const [user, setUser] = useState(() => decodeToken(localStorage.getItem("token")));

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
    } catch { return null; }
  });

  // ✅ Re-decode whenever token changes (login / logout / school switch)
  useEffect(() => {
    const decoded = decodeToken(token);
    setUser(decoded);
  }, [token]);

  // ── FCM — now fires correctly because user is never null on mount ─────────
  const { deleteCurrentToken } = useFcmToken({
    role: user?.userType ?? null,
    onForegroundMessage: showForegroundNotification,
  });

  // ── Helpers ───────────────────────────────────────────────────────────────
  const saveToken = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  const saveProfile = useCallback((profileData) => {
    if (profileData) {
      localStorage.setItem("profile", JSON.stringify(profileData));
    } else {
      localStorage.removeItem("profile");
    }
    setProfile(profileData);
  }, []);

  const saveSchool = useCallback((school) => {
    if (school) {
      localStorage.setItem("school", JSON.stringify(school));
    } else {
      localStorage.removeItem("school");
    }
    setSchoolInfo(school);
  }, []);

  const saveCurrentAcademicYear = useCallback((yearData) => {
    if (yearData) {
      localStorage.setItem("currentAcademicYear", JSON.stringify(yearData));
    } else {
      localStorage.removeItem("currentAcademicYear");
    }
    setCurrentAcademicYear(yearData);
  }, []);

  // ── Logout ────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await deleteCurrentToken();
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

  const value = useMemo(() => ({
    user, setUser,
    token, saveToken,
    logout,
    schoolInfo, saveSchool,
    profile, saveProfile,
    currentAcademicYear, saveCurrentAcademicYear,
  }), [
    user, token, schoolInfo, profile, currentAcademicYear,
    saveToken, logout, saveSchool, saveProfile, saveCurrentAcademicYear,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);