import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

import config from "../config/firebase";

const app = initializeApp(config.firebaseConfig);

export const getFirebaseMessaging = async () => {
  const supported = await isSupported();

  if (!supported) {
    console.warn("[FCM] Firebase Messaging not supported in this browser.");
    return null;
  }

  return getMessaging(app);
};

export { config };