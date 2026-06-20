import fs from "fs";
import path from "path";

const mode = process.argv[2]; // "dev" or "prod"
if (!["dev", "prod"].includes(mode)) {
  console.error("Usage: node scripts/generate-fcm-sw.mjs <dev|prod>");
  process.exit(1);
}

const required = [
  "VITE_FIREBASE_API_KEY",
  "VITE_FIREBASE_AUTH_DOMAIN",
  "VITE_FIREBASE_PROJECT_ID",
  "VITE_FIREBASE_STORAGE_BUCKET",
  "VITE_FIREBASE_MESSAGING_SENDER_ID",
  "VITE_FIREBASE_APP_ID",
];

const values = {};
const missing = [];

for (const key of required) {
  const val = process.env[key];
  if (!val || val.trim() === "") {
    missing.push(key);
  } else {
    values[key] = val.trim();
  }
}

if (missing.length > 0) {
  console.error(`[generate-fcm-sw] Missing or empty env vars for mode "${mode}":`);
  missing.forEach((k) => console.error(`  - ${k}`));
  process.exit(1);
}

const templatePath = path.resolve("public/firebase-messaging-sw.template.js");
const outputPath   = path.resolve(`public/firebase-messaging-sw-${mode}.js`);

let content = fs.readFileSync(templatePath, "utf-8");
content = content
  .replaceAll("__FIREBASE_API_KEY__", values.VITE_FIREBASE_API_KEY)
  .replaceAll("__FIREBASE_AUTH_DOMAIN__", values.VITE_FIREBASE_AUTH_DOMAIN)
  .replaceAll("__FIREBASE_PROJECT_ID__", values.VITE_FIREBASE_PROJECT_ID)
  .replaceAll("__FIREBASE_STORAGE_BUCKET__", values.VITE_FIREBASE_STORAGE_BUCKET)
  .replaceAll("__FIREBASE_MESSAGING_SENDER_ID__", values.VITE_FIREBASE_MESSAGING_SENDER_ID)
  .replaceAll("__FIREBASE_APP_ID__", values.VITE_FIREBASE_APP_ID);

fs.writeFileSync(outputPath, content);
console.log(`[generate-fcm-sw] Generated ${outputPath} for mode "${mode}"`);