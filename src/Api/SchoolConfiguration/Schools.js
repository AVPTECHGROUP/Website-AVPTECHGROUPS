import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/** Fetch paginated schools list with filters */
export const getSchools = async (page = 0, size = 20, search = "", isActive, board = "") => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (board) params.append("board", board);
  if (isActive !== undefined) params.append("isActive", isActive);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch schools");
  return await res.json();
};

/** Get global school statistics */
export const getSchoolStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_STATS, { method: "GET" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch school stats");
  return (await res.json()).data;
};

/** Authenticate and switch active school context */
export const switchSchool = async (schoolId) => {
  const res = await authFetch(API_ENDPOINTS.SWITCH_SCHOOL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to switch school");

  if (data?.data?.token) {
    localStorage.setItem("token", data.data.token);
    localStorage.setItem(
      "school",
      JSON.stringify({
        schoolId: data.data.schoolId,
        schoolName: data.data.schoolName,
        schoolCode: data.data.schoolCode,
      })
    );
  }

  return data.data;
};

/** Fetch schools for current user context */
export const getMySchools = async (page = 0, size = 12, search = "", board = "", isActive) => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (board) params.append("board", board);
  if (isActive !== undefined) params.append("isActive", isActive);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS_MY}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch my schools");
  return await res.json();
};

/** Get statistics for current user's assigned schools */
export const getMySchoolStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_MY_STATS, { method: "GET" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch my school stats");
  return (await res.json()).data;
};

/**
 * Create a new school (GLOBAL_ADMIN only)
 * POST /api/v1/schools
 */
export const createSchool = async (schoolData) => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create school");
  return data;
};

/**
 * Get school details by ID
 * GET /api/v1/schools/{id}
 */
export const getSchoolById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.schoolById(id), { method: "GET" });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to fetch school details");
  return data;
};

/**
 * Update school details by ID (GLOBAL_ADMIN or SUPER_ADMIN for their own school)
 * PUT /api/v1/schools/{id}
 */
export const updateSchool = async (id, schoolData) => {
  const res = await authFetch(API_ENDPOINTS.schoolById(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(schoolData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update school");
  return data;
};

/**
 * Activate a school (GLOBAL_ADMIN only)
 * PATCH /api/v1/schools/{id}/activate
 */
export const activateSchool = async (id) => {
  const res = await authFetch(API_ENDPOINTS.schoolActivate(id), {
    method: "PATCH",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to activate school");
  return data;
};

/**
 * Deactivate a school (GLOBAL_ADMIN only)
 * PATCH /api/v1/schools/{id}/deactivate
 */
export const deactivateSchool = async (id) => {
  const res = await authFetch(API_ENDPOINTS.schoolDeactivate(id), {
    method: "PATCH",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to deactivate school");
  return data;
};