import { getToken, onMessage } from "firebase/messaging";
import { getFirebaseMessaging, config } from "./firebase";
import { authFetch } from "../assets/Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

const FCM_TOKEN_KEY = "fcm_token";

let swRegistration = null;

/**
 * Register Service Worker
 */
const registerServiceWorker = async () => {
  try {
    if (swRegistration) return swRegistration;

    swRegistration = await navigator.serviceWorker.register(
      config.serviceWorkerPath,
      { scope: "/" }
    );

    console.log("[FCM] SW registered:", swRegistration.scope);

    await navigator.serviceWorker.ready;

    return swRegistration;
  } catch (error) {
    console.error("[FCM] SW registration failed:", error);
    return null;
  }
};

/**
 * Request Push Permission & Register FCM Token
 */
export const requestPushPermission = async () => {
  try {
    if (!("Notification" in window)) {
      console.warn("[FCM] Notifications not supported.");
      return null;
    }

    if (!("serviceWorker" in navigator)) {
      console.warn("[FCM] Service workers not supported.");
      return null;
    }

    if (Notification.permission === "denied") {
      console.warn("[FCM] Notification permission denied.");
      return null;
    }

    let permission = Notification.permission;

    if (permission !== "granted") {
      permission = await Notification.requestPermission();
    }

    if (permission !== "granted") {
      console.warn("[FCM] Notification permission not granted.");
      return null;
    }

    const messaging = await getFirebaseMessaging();

    if (!messaging) {
      console.warn("[FCM] Firebase messaging unavailable.");
      return null;
    }

    const registration = await registerServiceWorker();

    if (!registration) {
      console.error("[FCM] SW registration unavailable.");
      return null;
    }

    if (!config.vapidKey) {
      console.error("[FCM] Missing VAPID key.");
      return null;
    }

    const fcmToken = await getToken(messaging, {
      vapidKey: config.vapidKey,
      serviceWorkerRegistration: registration,
    });

    if (!fcmToken) {
      console.warn("[FCM] Failed to get token.");
      return null;
    }

    console.log("[FCM] Token generated:", fcmToken);

    const existingToken = localStorage.getItem(FCM_TOKEN_KEY);

    if (existingToken !== fcmToken) {
      await authFetch(`${BASE_URL}/device-tokens`, {
        method: "POST",
        body: JSON.stringify({
          fcmToken,
          platform: "WEB",
        }),
      });

      localStorage.setItem(FCM_TOKEN_KEY, fcmToken);

      console.log("[FCM] Token synced to backend.");
    } else {
      console.log("[FCM] Token already synced.");
    }

    return fcmToken;
  } catch (error) {
    console.error("[FCM] Permission flow error:", error);
    return null;
  }
};

/**
 * Foreground Notifications
 */
export const onForegroundMessage = async (callback) => {
  try {
    const messaging = await getFirebaseMessaging();

    if (!messaging) return () => {};

    return onMessage(messaging, (payload) => {
      console.log("[FCM] Foreground message:", payload);
      callback?.(payload);
    });
  } catch (error) {
    console.error("[FCM] Foreground listener error:", error);
    return () => {};
  }
};

/**
 * Remove Token From Backend
 */
export const deregisterPush = async () => {
  try {
    const token = localStorage.getItem(FCM_TOKEN_KEY);

    if (!token) return;

    await authFetch(
      `${BASE_URL}/device-tokens/${encodeURIComponent(token)}`,
      { method: "DELETE" }
    );

    localStorage.removeItem(FCM_TOKEN_KEY);

    console.log("[FCM] Token deregistered.");
  } catch (error) {
    console.warn("[FCM] Deregister failed:", error);
  }
};

/**
 * Notifications API
 */
export const getNotifications = async (page = 0, size = 20) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/notifications?page=${page}&size=${size}`
    );

    if (!res?.ok) return { content: [], totalElements: 0 };

    const data = await res.json();

    return data.data || data;
  } catch (error) {
    console.error("[FCM] getNotifications error:", error);
    return { content: [], totalElements: 0 };
  }
};

export const getUnreadCount = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/notifications/unread-count`);

    if (!res?.ok) return 0;

    const data = await res.json();

    return data.data ?? data.count ?? 0;
  } catch (error) {
    console.error("[FCM] getUnreadCount error:", error);
    return 0;
  }
};

export const markRead = async (id) => {
  try {
    await authFetch(`${BASE_URL}/notifications/${id}/read`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("[FCM] markRead error:", error);
  }
};

export const markAllRead = async () => {
  try {
    await authFetch(`${BASE_URL}/notifications/read-all`, {
      method: "PUT",
    });
  } catch (error) {
    console.error("[FCM] markAllRead error:", error);
  }
};

export const dismissNotification = async (id) => {
  try {
    await authFetch(`${BASE_URL}/notifications/${id}`, {
      method: "DELETE",
    });
  } catch (error) {
    console.error("[FCM] dismissNotification error:", error);
  }
};

/**
 * Notification Type → Route Mapping
 */
export const routeForType = (type) => {
  switch (type) {
    case "FEE_PAYMENT_RECEIVED":
      return "/feemanagement";

    case "FEE_OVERDUE":
      return "/feemanagement/collections";

    case "STUDENT_ENROLLED":
      return "/students";

    case "ATTENDANCE_ALERT":
      return "/attendance";

    case "ANNOUNCEMENT":
      return "/dashboard";

    default:
      return "/dashboard";
  }
};