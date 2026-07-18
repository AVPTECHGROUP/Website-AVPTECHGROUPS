import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getSchools = async ({ page, size, search, isActive, board } = {}) => {
  const params = new URLSearchParams();
  if (page !== undefined) params.append("page", page);
  if (size !== undefined) params.append("size", size);
  if (search) params.append("search", search.trim());
  if (isActive !== undefined) params.append("isActive", isActive);
  if (board) params.append("board", board);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS}${params.toString() ? `?${params.toString()}` : ""}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch schools");

  return await res.json();
};

export const createSchool = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to create school");
  return await res.json();
};

export const getSchoolById = async (id) => {
  if (!id) throw new Error("School ID is required");
  const res = await authFetch(API_ENDPOINTS.schoolById(id), { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch school");
  return await res.json();
};

export const updateSchool = async (id, payload) => {
  if (!id) throw new Error("School ID is required");
  const res = await authFetch(API_ENDPOINTS.schoolById(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text() || "Failed to update school");
  return await res.json();
};

export const activateSchool = async (id) => {
  if (!id) throw new Error("School ID is required");
  const res = await authFetch(API_ENDPOINTS.schoolActivate(id), { method: "PATCH" });

  if (!res.ok) throw new Error(await res.text() || "Failed to activate school");
  return await res.json();
};

export const deactivateSchool = async (id) => {
  const res = await authFetch(API_ENDPOINTS.schoolDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error(await res.text() || "Failed to deactivate school");
  return await res.json();
};

export const getAttendanceConfig = async (schoolId) => {
  if (!schoolId) throw new Error("School ID is required");
  const res = await authFetch(API_ENDPOINTS.schoolAttendanceConfig(schoolId), { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch attendance config");
  return await res.json();
};

export const updateAttendanceConfig = async (schoolId, payload) => {
  if (!schoolId) throw new Error("School ID is required");
  const res = await authFetch(API_ENDPOINTS.schoolAttendanceConfig(schoolId), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error(await res.text() || "Failed to update attendance config");
  return await res.json();
};

export const uploadSchoolLogo = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authFetch(API_ENDPOINTS.schoolLogo(id), { method: "PATCH", body: formData });
  if (!res.ok) throw new Error(await res.text() || "Failed to upload logo");
  return await res.json();
};

export const getActiveSchools = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_ACTIVE, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch active schools");
  return await res.json();
};

export const getMySchools = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size !== undefined) params.append("size", filters.size);
  if (filters.search) params.append("search", filters.search.trim());
  if (filters.board) params.append("board", filters.board);
  if (filters.isActive !== undefined) params.append("isActive", filters.isActive);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS_MY}${params.toString() ? `?${params.toString()}` : ""}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch my schools");

  return await res.json();
};

export const getMyStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_MY_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stats");
  return await res.json();
};

export const getSchoolsStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch schools stats");
  return await res.json();
};