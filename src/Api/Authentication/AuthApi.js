import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/** Login and cache session */
export const loginAPI = async (credentials) => {
  try {
    const res = await fetch(API_ENDPOINTS.AUTH_LOGIN, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      throw new Error(data.message || 'Invalid email or password');
    }

    if (data.data?.token) localStorage.setItem("token", data.data.token);
    if (data.data?.user) localStorage.setItem("user", JSON.stringify(data.data.user));
    if (data.data?.user?.profile) localStorage.setItem("profile", JSON.stringify(data.data.user.profile));

    return data;
  } catch (error) {
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

/** Clear session and logout */
export const logoutAPI = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.AUTH_LOGOUT, { method: "POST" });
    if (!res.ok) throw new Error(await res.text() || "Logout failed");
    return { success: true };
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }
};

/** Verify active token */
export const verifyToken = async () => {
  const res = await authFetch(API_ENDPOINTS.AUTH_VERIFY);
  if (!res.ok) throw new Error('Token verification failed');
  return await res.json();
};

/** Refresh expired token */
export const refreshToken = async () => {
  const res = await authFetch(API_ENDPOINTS.AUTH_REFRESH, { method: 'POST' });
  if (!res.ok) throw new Error('Token refresh failed');

  const data = await res.json();
  if (data.token) localStorage.setItem('token', data.token);
  return data;
};