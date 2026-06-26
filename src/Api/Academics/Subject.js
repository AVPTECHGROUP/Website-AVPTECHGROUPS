import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/**
 * Fetches subjects using filters, pagination, and sorting parameters.
 * @param {Object} params - Filter options (search, status, category, page, size, sort)
 * @returns {Promise<Object>} Object containing subjects array and pagination info
 */
export const getSubjectsWithFilters = async (params = {}) => {
  try {
    const { search = "", status = "ALL", category = "ALL", page = 0, size = 10, sort = "id" } = params;

    const queryParams = new URLSearchParams({ page, size, sort });
    if (search) queryParams.append("search", search);
    if (status !== "ALL") queryParams.append("status", status);
    if (category !== "ALL") queryParams.append("category", category);

    const res = await authFetch(`${API_ENDPOINTS.SUBJECTS_PAGINATED}?${queryParams.toString()}`, { method: "GET" });
    if (!res.ok) throw new Error(await res.text() || "Failed to fetch subjects");

    const response = await res.json();
    return { subjects: response?.data || [], pagination: response?.pagination || {} };
  } catch (error) {
    console.error("getSubjectsWithFilters error:", error.message);
    throw error;
  }
};

/**
 * Creates a new subject within the system.
 * @param {Object} subjectData - The subject payload data
 * @returns {Promise<Object>} The created subject response
 */
export const createSubject = async (subjectData) => {
  try {
    const res = await authFetch(API_ENDPOINTS.SUBJECTS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectData),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.errors?.join(", ") || "Failed to create subject");
    return data?.data || data;
  } catch (error) {
    console.error("createSubject error:", error.message);
    throw error;
  }
};

/**
 * Updates an existing subject by its ID.
 * @param {string|number} id - Subject ID
 * @param {Object} subjectData - Updated subject fields
 * @returns {Promise<Object>} The updated subject response
 */
export const updateSubject = async (id, subjectData) => {
  try {
    const res = await authFetch(API_ENDPOINTS.subjectById(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(subjectData),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.message || data?.errors?.join(", ") || "Failed to update subject");
    return data?.data || data;
  } catch (error) {
    console.error("updateSubject error:", error.message);
    throw error;
  }
};

/**
 * Deletes a subject from the system.
 * @param {string|number} id - Subject ID
 * @returns {Promise<Object>} Success response
 */
export const deleteSubject = async (id) => {
  try {
    const res = await authFetch(API_ENDPOINTS.subjectById(id), { method: "DELETE" });
    if (!res.ok) throw new Error(await res.text() || "Failed to delete subject");
    const data = await res.json();
    return data?.data || data;
  } catch (error) {
    console.error("deleteSubject error:", error.message);
    throw error;
  }
};