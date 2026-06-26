import { authFetch } from "../../Authfetch/Authfetch";

import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const registerUserDeviceToken = async (deviceToken) => {
  const response = await authFetch(API_ENDPOINTS.USER_DEVICE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: deviceToken, deviceType: "WEB" }),
  });

  if (!response.ok) throw new Error("Failed to register device token");
  return response.json();
};

export const registerParentDeviceToken = async (deviceToken) => {
  const response = await authFetch(API_ENDPOINTS.PARENT_DEVICE_TOKEN, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fcmToken: deviceToken, deviceType: "ANDROID" }),
  });

  if (!response.ok) throw new Error("Failed to register device token");
  return response.json();
};

export const getNotifications = async ({ page = 0, size = 10, sort = "Id" } = {}) => {
  const params = new URLSearchParams({ page, size, sort });

  const response = await authFetch(`${API_ENDPOINTS.NOTIFICATIONS}?${params.toString()}`, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch notifications");

  return response.json();
};