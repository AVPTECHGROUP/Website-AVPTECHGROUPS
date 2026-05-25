importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey:            "AIzaSyDjjptCB7jYkkzbzX2dJidnBtGMByYnhlg",
  authDomain:        "schoolspine-dev.firebaseapp.com",
  projectId:         "schoolspine-dev",
  storageBucket:     "schoolspine-dev.firebasestorage.app",
  messagingSenderId: "921081546231",
  appId:             "1:921081546231:web:4c816be1902db0f4bb1af2",
  
});

const messaging = firebase.messaging();

// Background / closed tab notifications
messaging.onBackgroundMessage((payload) => {
  const { title, body } = payload.notification || {};
  const clickAction =
    payload.fcmOptions?.link ||
    payload.data?.click_action ||
    "/";

  self.registration.showNotification(title || "SchoolSpine Notification", {
    body:  body || "",
    icon:  "/logo.png",   // place your logo in /public/logo.png
    badge: "/badge.png",  // optional 72x72 monochrome badge
    data:  { clickAction },
  });
});

// Navigate to the relevant page when user clicks the notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.clickAction || "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});