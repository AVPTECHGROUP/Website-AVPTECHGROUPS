import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getFeePeriods = async (academicYearId) => {
  if (!academicYearId) throw new Error("Academic Year ID is required");

  const res = await authFetch(`${API_ENDPOINTS.FEE_PERIODS}?academicYearId=${academicYearId}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee periods");

  return (await res.json()).data || [];
};

export const createFeePeriod = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.FEE_PERIODS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create fee period");
  return data;
};

export const getFeePeriodById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.feePeriodById(id), { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee period");

  return (await res.json()).data || {};
};

export const updateFeePeriod = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.feePeriodById(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update fee period");
  return data;
};

export const deleteFeePeriod = async (id) => {
  const res = await authFetch(API_ENDPOINTS.feePeriodById(id), { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text() || "Failed to delete fee period");

  try {
    return await res.json();
  } catch {
    return { success: true };
  }
};

export const getAcademicYears = async () => {
  const res = await authFetch(API_ENDPOINTS.FEE_PERIODS_ACADEMIC_YEARS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch academic years");

  return (await res.json()).data || [];
};

export const createAcademicYear = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.FEE_PERIODS_ACADEMIC_YEARS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create academic year");
  return data;
};