// context/UserContext.jsx
import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { jwtDecode } from "../utils/GetCurrUserDetails";
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

// ── Decode JWT synchronously — no side effects, safe to call during render ────
function decodeToken(token) {
  if (!token) return null;
  const payload = jwtDecode(token);
  if (!payload) return null;
  return {
    id:          payload.userId,
    userType:    payload.roles?.[0] ?? null,
    email:       payload.sub,
    permissions: payload.permissions ?? [],
    schoolId:    payload.schoolId ?? null,
  };
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
    localStorage.removeItem("user");
    localStorage.removeItem("school");
    localStorage.removeItem("profile");
    localStorage.removeItem("currentAcademicYear");
    setToken(null);
    setUser(null);
    setSchoolInfo(null);
    setProfile(null);
    setCurrentAcademicYear(null);
  }, [deleteCurrentToken]);

  // ── Theme Switcher ──
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const value = useMemo(() => ({
    user, setUser,
    token, saveToken,
    logout,
    schoolInfo, saveSchool,
    profile, saveProfile,
    currentAcademicYear, saveCurrentAcademicYear,
    theme, toggleTheme,
  }), [
    user, token, schoolInfo, profile, currentAcademicYear, theme, toggleTheme,
    saveToken, logout, saveSchool, saveProfile, saveCurrentAcademicYear,
  ]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);