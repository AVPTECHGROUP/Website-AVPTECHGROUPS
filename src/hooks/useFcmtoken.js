// hooks/useFcmtoken.js
import { useEffect, useRef, useCallback } from "react";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, getToken, onMessage, deleteToken } from "firebase/messaging";
import { vapidKey, serviceWorkerPath, firebaseConfig as fbConfig } from "../Firebase/Firebase";
import { registerUserDeviceToken, registerParentDeviceToken } from "../Api/Notification";

export function useFcmToken({ role, onForegroundMessage } = {}) {
  const messagingRef          = useRef(null);
  const tokenRef              = useRef(null);
  const registeredRef         = useRef(false);
  const onForegroundMessageRef = useRef(onForegroundMessage); // ✅ stable ref for callback

  // ── Keep the callback ref in sync without re-subscribing onMessage ────────
  useEffect(() => {
    onForegroundMessageRef.current = onForegroundMessage;
  }, [onForegroundMessage]);

  const getMessagingInstance = useCallback(() => {
    if (messagingRef.current) return messagingRef.current;
    try {
      const app = getApps().length ? getApp() : initializeApp(fbConfig);
      messagingRef.current = getMessaging(app);
      return messagingRef.current;
    } catch (err) {
      console.error("[FCM] Failed to get messaging instance:", err);
      return null;
    }
  }, []);

  const registerToken = useCallback(async () => {
    if (!role) return;

    // ✅ Bail out if already registered in this session
    if (registeredRef.current) {
      console.log("[FCM] Token already registered, skipping.");
      return;
    }

    console.log("[FCM] registerToken called, role:", role);

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

      // ✅ Only register SW if not already registered
      let swReg = await navigator.serviceWorker.getRegistration(serviceWorkerPath);
      if (!swReg) {
        await navigator.serviceWorker.register(serviceWorkerPath);
      }
      swReg = await navigator.serviceWorker.ready;

      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swReg,
      });

      if (!token) {
        console.warn("[FCM] No token received");
        return;
      }

      console.log("[FCM] Token received:", token);
      tokenRef.current      = token;
      registeredRef.current = true; // ✅ mark as done

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
      tokenRef.current      = null;
      registeredRef.current = false; // ✅ allow re-registration after logout
      console.info("[FCM] Token deleted on logout");
    } catch (err) {
      console.error("[FCM] Failed to delete token:", err);
    }
  }, [getMessagingInstance]);

  // ── Foreground message listener ───────────────────────────────────────────
  // ✅ onForegroundMessage is NOT in the dep array — uses ref instead
  // This means onMessage subscribes exactly ONCE per role, never re-subscribes
  useEffect(() => {
    const messaging = getMessagingInstance();
    if (!messaging || !role) return;
    const unsubscribe = onMessage(messaging, (payload) => {
      console.info("[FCM] Foreground message:", payload);
      onForegroundMessageRef.current?.(payload);
    });
    return unsubscribe;
  }, [role, getMessagingInstance]); // ← no onForegroundMessage here

  // ── Register token when role becomes available ────────────────────────────
  useEffect(() => {
    if (role) {
      registerToken();
    }
  }, [role, registerToken]);

  return { deleteCurrentToken };
}