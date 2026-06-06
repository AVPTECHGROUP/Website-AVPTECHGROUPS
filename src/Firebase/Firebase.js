// Firebase/Firebase.js
import * as devConfig  from "./Firebase.dev";
import * as prodConfig from "./Firebase.prod";

const isProd = import.meta.env.MODE === "production";

const config = isProd ? prodConfig : devConfig;

export const vapidKey          = config.vapidKey;
export const serviceWorkerPath = config.serviceWorkerPath;
export const firebaseConfig    = config.firebaseConfig;

export default config;