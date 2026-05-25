import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

/**
 * Get Fee Dashboard Data
 * GET /v1/fee/dashboard?academicYearId={id}
 */
// export const getFeeDashboard = async (academicYearId) => {
//   try {
//     if (!academicYearId) {
//       throw new Error("Academic Year ID is required");
//     }

//     const url = `${BASE_URL}/fee/dashboard?academicYearId=${academicYearId}`;
//     console.log('🌐 Fetching dashboard:', url);

//     const res = await authFetch(url, {
//       method: "GET",
//     });

//     if (!res.ok) {
//       const errorText = await res.text();
//       console.error('❌ Dashboard API failed:', errorText);
//       throw new Error(errorText || "Failed to fetch fee dashboard");
//     }

//     const data = await res.json();
//     console.log('✅ Dashboard response:', data);

//     // API returns { success, message, data: {...} }
//     // Extract and return the data object directly
//     return data.data || {};
//   } catch (error) {
//     console.error("❌ getFeeDashboard error:", error.message);
//     throw error;
//   }
// };
/**
 * Get Active Fee Periods
 * GET /v1/fee/dashboard/active-periods?academicYearId={id}
 */
export const getActivePeriods = async (academicYearId) => {
  try {
    if (!academicYearId) {
      throw new Error("Academic Year ID is required");
    }

    const res = await authFetch(
      `${BASE_URL}/fee/dashboard/active-periods?academicYearId=${academicYearId}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch active periods");
    }

    const data = await res.json();

    // Returns { success, data: [...periods] }
    return data.data || [];
  } catch (error) {
    console.error("❌ getActivePeriods error:", error.message);
    throw error;
  }
};

/**
 * Get Class-wise Fee Summary
 * GET /v1/fee/dashboard/class-summary?academicYearId={id}&periodId={id}
 */
export const getClassSummary = async (academicYearId, periodId) => {
  try {
    if (!academicYearId) throw new Error("Academic Year ID is required");
    if (!periodId)       throw new Error("Period ID is required");

    const res = await authFetch(
      `${BASE_URL}/fee/dashboard/class-summary?academicYearId=${academicYearId}&periodId=${periodId}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch class summary");
    }

    const data = await res.json();

    // Returns { success, data: [...classes] }
    return data.data || [];
  } catch (error) {
    console.error("❌ getClassSummary error:", error.message);
    throw error;
  }
};

/**
 * Get Overdue Fee Alerts
 * GET /v1/fee/dashboard/overdue-alerts?academicYearId={id}&limit={n}
 */
export const getOverdueAlerts = async (academicYearId, limit = 5) => {
  try {
    if (!academicYearId) throw new Error("Academic Year ID is required");

    const res = await authFetch(
      `${BASE_URL}/fee/dashboard/overdue-alerts?academicYearId=${academicYearId}&limit=${limit}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch overdue alerts");
    }

    const data = await res.json();

    // Returns { success, data: [...alerts] }
    return data.data || [];
  } catch (error) {
    console.error("❌ getOverdueAlerts error:", error.message);
    throw error;
  }
};

/**
 * Get Recent Fee Payments
 * GET /v1/fee/dashboard/recent-payments?academicYearId={id}&limit={n}
 */
export const getRecentPayments = async (academicYearId, limit = 5) => {
  try {
    if (!academicYearId) throw new Error("Academic Year ID is required");

    const res = await authFetch(
      `${BASE_URL}/fee/dashboard/recent-payments?academicYearId=${academicYearId}&limit=${limit}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch recent payments");
    }

    const data = await res.json();

    // Returns { success, data: [...payments] }
    return data.data || [];
  } catch (error) {
    console.error("❌ getRecentPayments error:", error.message);
    throw error;
  }
};

/**
 * Get Fee Dashboard Stats
 * GET /v1/fee/dashboard/stats?academicYearId={id}
 */
export const getFeeDashboardStats = async (academicYearId) => {
  try {
    if (!academicYearId) throw new Error("Academic Year ID is required");

    const res = await authFetch(
      `${BASE_URL}/fee/dashboard/stats?academicYearId=${academicYearId}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch dashboard stats");
    }

    const data = await res.json();

    // Returns { success, data: { totalBilled, totalCollected, ... } }
    return data.data || {};
  } catch (error) {
    console.error("❌ getFeeDashboardStats error:", error.message);
    throw error;
  }
};