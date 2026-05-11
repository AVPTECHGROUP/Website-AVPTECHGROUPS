import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

/**
 * Get Fee Dashboard Data
 * GET /v1/fee/dashboard?academicYearId={id}
 */
export const getFeeDashboard = async (academicYearId) => {
  try {
    if (!academicYearId) {
      throw new Error("Academic Year ID is required");
    }

    const url = `${BASE_URL}/fee/dashboard?academicYearId=${academicYearId}`;
    console.log('🌐 Fetching dashboard:', url);

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Dashboard API failed:', errorText);
      throw new Error(errorText || "Failed to fetch fee dashboard");
    }

    const data = await res.json();
    console.log('✅ Dashboard response:', data);

    // API returns { success, message, data: {...} }
    // Extract and return the data object directly
    return data.data || {};
  } catch (error) {
    console.error("❌ getFeeDashboard error:", error.message);
    throw error;
  }
};