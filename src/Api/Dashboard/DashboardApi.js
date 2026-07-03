import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/** Get Dashboard Analytics */
export const getDashboardAnalytics = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.DASHBOARD_STATS, { method: "GET" });
    if (!res.ok) throw new Error(`Dashboard API Failed: ${res.status}`);

    return (await res.json()).data;
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    throw error;
  }
};

/** Get Upcoming Holidays */
export const getUpcomingHolidays = async (limit = 5) => {
  try {
    const res = await authFetch(`${API_ENDPOINTS.DASHBOARD_HOLIDAYS}?limit=${limit}`, { method: "GET" });
    if (!res.ok) throw new Error(`Upcoming Holidays API Failed: ${res.status}`);

    return (await res.json()).data;
  } catch (error) {
    console.error("Upcoming Holidays Error:", error);
    throw error;
  }
};