import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Get Fee Dashboard Data
export const getFeeDashboard = async (academicYearId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/dashboard?academicYearId=${academicYearId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee dashboard");
    }

    const data = await res.json();

    return data.data || {};
  } catch (error) {
    console.error("getFeeDashboard error:", error.message);
    throw error;
  }
};