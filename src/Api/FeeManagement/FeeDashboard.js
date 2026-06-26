import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getActivePeriods = async (academicYearId) => {
  if (!academicYearId) throw new Error("Academic Year ID is required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_DASHBOARD_PERIODS}?academicYearId=${academicYearId}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch active periods");

  return (await res.json()).data || [];
};

export const getClassSummary = async (academicYearId, periodId) => {
  if (!academicYearId || !periodId) throw new Error("Academic Year ID and Period ID are required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_DASHBOARD_CLASS_SUMMARY}?academicYearId=${academicYearId}&periodId=${periodId}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch class summary");

  return (await res.json()).data || [];
};

export const getOverdueAlerts = async (academicYearId, limit = 5) => {
  if (!academicYearId) throw new Error("Academic Year ID is required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_DASHBOARD_ALERTS}?academicYearId=${academicYearId}&limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch overdue alerts");

  return (await res.json()).data || [];
};

export const getRecentPayments = async (academicYearId, limit = 5) => {
  if (!academicYearId) throw new Error("Academic Year ID is required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_DASHBOARD_PAYMENTS}?academicYearId=${academicYearId}&limit=${limit}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch recent payments");

  return (await res.json()).data || [];
};

export const getFeeDashboardStats = async (academicYearId) => {
  if (!academicYearId) throw new Error("Academic Year ID is required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_DASHBOARD_STATS}?academicYearId=${academicYearId}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch dashboard stats");

  return (await res.json()).data || {};
};