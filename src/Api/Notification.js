import { authFetch } from "../Authfetch/Authfetch";
const BASE_URL = import.meta.env.VITE_API_BASE_V1;


export const registerUserDeviceToken = async (deviceToken) => {
  const response = await authFetch(
    `${BASE_URL}/notifications/device-token/user`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fcmToken: deviceToken,
        deviceType: "WEB",  
        // deviceType:"ANDROID"      // staff/teacher are always WEB
      }),
    }
  );
  if (!response.ok) throw new Error("Failed to register device token");
  return response.json();
};

export const registerParentDeviceToken = async (deviceToken) => {
  const response = await authFetch(
    `${BASE_URL}/notifications/device-token/parent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fcmToken: deviceToken,
        deviceType: "ANDROID",    // parent mobile default
      }),
    }
  );
  if (!response.ok) throw new Error("Failed to register device token");
  return response.json();
};

export const getNotifications = async ({
  page = 0,
  size = 10,
  sort = "Id",
} = {}) => {
  const response = await authFetch(
    `${BASE_URL}/notifications?page=${page}&size=${size}&sort=${sort}`,
    {
      method: "GET",
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch notifications");
  }

  return response.json();
};

