import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Get Dashboard Analytics
export const getDashboardAnalytics = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/dashboard/stats`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error(`Dashboard API Failed: ${res.status}`);
    }
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Dashboard Analytics Error:", error);
    throw error;
  }
};

// Get Upcoming Holidays
export const getUpcomingHolidays = async (limit = 5) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/dashboard/upcoming-holidays?limit=${limit}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      throw new Error(`Upcoming Holidays API Failed: ${res.status}`);
    }

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("Upcoming Holidays Error:", error);
    throw error;
  }
};