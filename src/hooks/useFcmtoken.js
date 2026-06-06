// hooks/useFcmToken.js
import { useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import { vapidKey, serviceWorkerPath, firebaseConfig as fbConfig } from "../Firebase/Firebase";
import { registerUserDeviceToken, registerParentDeviceToken } from "../Api/Notification";

export function useFcmToken({ role, onForegroundMessage } = {}) {
  const messagingRef = useRef(null);
  const tokenRef     = useRef(null);

  const getMessagingInstance = useCallback(() => {
    if (messagingRef.current) return messagingRef.current;
    try {
      // initialize if not already done
      const app = getApps().length ? getApp() : initializeApp(fbConfig);
      messagingRef.current = getMessaging(app);
      return messagingRef.current;
    } catch (err) {
      console.error("[FCM] Failed to get messaging instance:", err);
      return null;
    }
  }, []);

  const registerToken = useCallback(async () => {
    console.log("[FCM] registerToken called, role:", role);
    console.log("[FCM] vapidKey:", vapidKey);
    console.log("[FCM] serviceWorkerPath:", serviceWorkerPath);

    if (!role) return;

    const messaging = getMessagingInstance();
    if (!messaging) {
      console.warn("[FCM] No messaging instance");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      console.log("[FCM] Permission:", permission);
      if (permission !== "granted") {
        console.warn("[FCM] Notification permission denied");
        return;
      }

      const swReg = await navigator.serviceWorker.register(serviceWorkerPath);

// wait for the service worker to become active
await navigator.serviceWorker.ready;

const token = await getToken(messaging, {
  vapidKey,
  serviceWorkerRegistration: swReg,
});

      if (!token) {
        console.warn("[FCM] No token received");
        return;
      }

      console.log("[FCM] Token received:", token);
      tokenRef.current = token;

      if (role === "PARENT") {
        await registerParentDeviceToken(token);
      } else {
        await registerUserDeviceToken(token);
      }

      console.info("[FCM] Token registered with backend successfully");
    } catch (err) {
      console.error("[FCM] Token registration failed:", err);
    }
  }, [role, getMessagingInstance]);

  const deleteCurrentToken = useCallback(async () => {
    const messaging = getMessagingInstance();
    if (!messaging || !tokenRef.current) return;
    try {
      await deleteToken(messaging);
      tokenRef.current = null;
      console.info("[FCM] Token deleted on logout");
    } catch (err) {
      console.error("[FCM] Failed to delete token:", err);
    }
  }, [getMessagingInstance]);

  useEffect(() => {
    const messaging = getMessagingInstance();
    if (!messaging || !role) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      console.info("[FCM] Foreground message:", payload);
      if (typeof onForegroundMessage === "function") {
        onForegroundMessage(payload);
      }
    });
    return unsubscribe;
  }, [role, getMessagingInstance, onForegroundMessage]);

  useEffect(() => {
    if (role) {
      registerToken();
    }
  }, [role, registerToken]);

  return { deleteCurrentToken };
}