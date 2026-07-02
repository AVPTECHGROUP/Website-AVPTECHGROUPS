// context/UserContext.jsx
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";

import { jwtDecode } from "../utils/GetCurrUserDetails";
import { useFcmToken } from "../hooks/useFcmtoken";

export const UserContext = createContext();

function showForegroundNotification(payload) {
  const title = payload?.notification?.title ?? "New Notification";
  const body = payload?.notification?.body ?? "";

  if (Notification.permission !== "granted") return;

  navigator.serviceWorker.ready.then((reg) => {
    reg.showNotification(title, {
      body,
      icon: "/logo.png",
    });
  });
}

// Decode JWT synchronously
function decodeToken(token) {
  if (!token) return null;

  const payload = jwtDecode(token);
  if (!payload) return null;

  return {
    id: payload.userId,
    userType: payload.roles?.[0] ?? null,
    email: payload.sub,
    permissions: payload.permissions ?? [],
    schoolId: payload.schoolId ?? null,
  };
}

export const UserProvider = ({ children }) => {
  // Auth state
  const [token, setToken] = useState(() =>
    localStorage.getItem("token")
  );

  const [user, setUser] = useState(() =>
    decodeToken(localStorage.getItem("token"))
  );

  // School state
  const [schoolInfo, setSchoolInfo] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("school")) || null;
    } catch {
      return null;
    }
  });

  // Profile state
  const [profile, setProfile] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("profile")) || null;
    } catch {
      return null;
    }
  });

  // Academic year state
  const [currentAcademicYear, setCurrentAcademicYear] =
    useState(() => {
      try {
        const saved = localStorage.getItem(
          "currentAcademicYear"
        );
        return saved ? JSON.parse(saved) : null;
      } catch {
        return null;
      }
    });

  // Theme state
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark";
  });

  // Re-decode token when token changes
  useEffect(() => {
    setUser(decodeToken(token));
  }, [token]);

  // Theme effect
  useEffect(() => {
    const root = document.documentElement;

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }

    localStorage.setItem("theme", theme);
  }, [theme]);

  // Resolve school ID
  const schoolId = useMemo(
    () => schoolInfo?.id ?? user?.schoolId ?? null,
    [schoolInfo, user]
  );

  // FCM setup
  const { deleteCurrentToken } = useFcmToken({
    role: user?.userType ?? null,
    onForegroundMessage: showForegroundNotification,
  });

  // Save token
  const saveToken = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  }, []);

  // Save profile
  const saveProfile = useCallback((profileData) => {
    if (profileData) {
      localStorage.setItem(
        "profile",
        JSON.stringify(profileData)
      );
    } else {
      localStorage.removeItem("profile");
    }

    setProfile(profileData);
  }, []);

  // Save school
  const saveSchool = useCallback((school) => {
    if (school) {
      localStorage.setItem(
        "school",
        JSON.stringify(school)
      );
    } else {
      localStorage.removeItem("school");
    }

    setSchoolInfo(school);
  }, []);

  // Save academic year
  const saveCurrentAcademicYear = useCallback(
    (yearData) => {
      if (yearData) {
        localStorage.setItem(
          "currentAcademicYear",
          JSON.stringify(yearData)
        );
      } else {
        localStorage.removeItem(
          "currentAcademicYear"
        );
      }

      setCurrentAcademicYear(yearData);
    },
    []
  );

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme((prev) =>
      prev === "dark" ? "light" : "dark"
    );
  }, []);

  // Logout
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

  // Context value
  const value = useMemo(
    () => ({
      user,
      setUser,

      token,
      saveToken,

      logout,

      schoolInfo,
      saveSchool,
      schoolId,

      profile,
      saveProfile,

      currentAcademicYear,
      saveCurrentAcademicYear,

      theme,
      toggleTheme,
    }),
    [
      user,
      token,
      schoolInfo,
      schoolId,
      profile,
      currentAcademicYear,
      theme,
      saveToken,
      logout,
      saveSchool,
      saveProfile,
      saveCurrentAcademicYear,
      toggleTheme,
    ]
  );

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export const useDecodedUser = () => useContext(UserContext);