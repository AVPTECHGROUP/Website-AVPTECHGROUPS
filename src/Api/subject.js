import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;
const SUBJECT_BASE = `${BASE_URL}/subjects`;

/**
 * Get subjects with filters, pagination, and sorting
 * @param {Object} params - Filter parameters
 * @param {string} params.search - Search query by name/code
 * @param {string} params.status - Filter: ALL, ACTIVE, INACTIVE
 * @param {string} params.category - Filter by category value
 * @param {number} params.page - Page number (0-indexed)
 * @param {number} params.size - Page size
 * @param {string} params.sort - Sort column
 */
export const getSubjectsWithFilters = async (params = {}) => {
  try {
    const {
      search = "",
      status = "ALL",
      category = "ALL",
      page = 0,
      size = 10,
      sort = "id",
    } = params;

    const queryParams = new URLSearchParams();
    if (search) queryParams.append("search", search);
    if (status !== "ALL") queryParams.append("status", status);
    if (category !== "ALL") queryParams.append("category", category);
    queryParams.append("page", page);
    queryParams.append("size", size);
    queryParams.append("sort", sort);

    const url = `${SUBJECT_BASE}/paginated?${queryParams.toString()}`;
    console.log("Fetching subjects from:", url);

    const res = await authFetch(url, { method: "GET" });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch subjects");
    }

    const response = await res.json();
    return {
      subjects: response?.data || [],
      pagination: response?.pagination || {},
    };
  } catch (error) {
    console.error("getSubjectsWithFilters error:", error.message);
    throw error;
  }
};

/**
 * Create a new subject
 */
export const createSubject = async (subjectData) => {
  try {
    console.log("Creating subject:", JSON.stringify(subjectData, null, 2));

    const res = await authFetch(SUBJECT_BASE, {
      method: "POST",
      body: JSON.stringify(subjectData),
    });

    const rawText = await res.text();
    console.log("Create subject response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Invalid JSON response: ${rawText.slice(0, 200)}`);
    }

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        data?.errors?.join(", ") ||
        `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data?.data || data;
  } catch (error) {
    console.error("createSubject error:", error.message);
    throw error;
  }
};

/**
 * Update an existing subject
 */
export const updateSubject = async (id, subjectData) => {
  try {
    console.log("Updating subject:", id, JSON.stringify(subjectData, null, 2));

    const res = await authFetch(`${SUBJECT_BASE}/${id}`, {
      method: "PUT",
      body: JSON.stringify(subjectData),
    });

    const rawText = await res.text();
    console.log("Update subject response:", rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Invalid JSON response: ${rawText.slice(0, 200)}`);
    }

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        data?.errors?.join(", ") ||
        `Request failed with status ${res.status}`;
      throw new Error(errMsg);
    }

    return data?.data || data;
  } catch (error) {
    console.error("updateSubject error:", error.message);
    throw error;
  }
};

/**
 * Delete a subject
 */
export const deleteSubject = async (id) => {
  try {
    const res = await authFetch(`${SUBJECT_BASE}/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete subject");
    }

    const data = await res.json();
    return data?.data || data;
  } catch (error) {
    console.error("deleteSubject error:", error.message);
    throw error;
  }
};
