import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== READ OPERATIONS ====================

/**
 * Fetch a paginated list of all students.
 * @param {number} page - The page number (0-indexed)
 * @param {number} size - The number of records per page
 * @param {string} sort - The sorting parameter (e.g., 'id')
 * @returns {Promise<Object>} Paginated student data
 */
export const getStudents = async (page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${API_ENDPOINTS.STUDENTS_PAGINATED}?page=${page}&size=${size}&sort=${sort}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error(await res.text() || "Failed to fetch students");
    return await res.json();
  } catch (error) {
    console.error("getStudents error:", error.message);
    throw error;
  }
};

/**
 * Fetch a single student record by their unique ID.
 * @param {string|number} id - The student ID
 * @returns {Promise<Object>} Student details object
 */
export const getStudentById = async (id) => {
  try {
    const res = await authFetch(API_ENDPOINTS.studentById(id), { method: "GET" });
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch student");
    return data?.data;
  } catch (error) {
    console.error("getStudentById error:", error.message);
    throw error;
  }
};

/**
 * Fetch all ACTIVE students belonging to a specific class.
 * @param {string|number} id - The class ID
 * @returns {Promise<Array>} List of active students in the class
 */
export const getStudentByClass = async (id) => {
  try {
    const res = await authFetch(`${API_ENDPOINTS.studentByClass(id)}?status=ACTIVE`, { method: "GET" });
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch student by class");
    return data?.data;
  } catch (error) {
    console.error("getStudentByClass error:", error.message);
    throw error;
  }
};

/**
 * Fetch students filtered by section ID and an optional status.
 * @param {string|number} sectionId - The section ID
 * @param {string} status - Student status filter (defaults to "ACTIVE")
 * @returns {Promise<Array>} List of students matching the section and status
 */
export const getStudentsBySection = async (sectionId, status = "ACTIVE") => {
  try {
    if (!sectionId) throw new Error("sectionId is required");

    const query = status ? `?status=${status}` : "";
    const res = await authFetch(`${API_ENDPOINTS.studentBySection(sectionId)}${query}`, { method: "GET" });

    if (!res.ok) throw new Error(await res.text() || "Failed to fetch students by section");

    const data = await res.json();
    return data?.data || [];
  } catch (error) {
    console.error("getStudentsBySection error:", error.message);
    throw error;
  }
};

/**
 * Search and filter students using an advanced POST payload.
 * @param {Object} filters - Search filter criteria
 * @param {number} page - Page number
 * @param {number} size - Records per page
 * @param {Array|string} sort - Sort configuration
 * @returns {Promise<Object>} Paginated search results
 */
export const searchStudents = async (filters = {}, page = 0, size = 10, sort = ['id']) => {
  try {
    const pageable = encodeURIComponent(JSON.stringify({ page, size, sort }));

    const res = await authFetch(`${API_ENDPOINTS.STUDENTS_SEARCH}?pageable=${pageable}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(filters),
    });

    if (!res.ok) throw new Error(await res.text() || 'Failed to Search Students...');
    return await res.json();
  } catch (error) {
    console.error('searchStudents error:', error.message);
    throw error;
  }
};

// ==================== WRITE OPERATIONS ====================

/**
 * Create a new student record, supporting optional profile image uploads.
 * @param {Object} studentData - The student's biographical/academic data
 * @param {File} [imageFile] - Optional image file for the student's avatar
 * @returns {Promise<Object>} The created student response
 */
export const createStudents = async (studentData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(studentData)], { type: "application/json" }));

    if (imageFile) formData.append("image", imageFile);

    const res = await authFetch(API_ENDPOINTS.STUDENTS, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to create student");

    return data;
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error.message);
    throw error;
  }
};

/**
 * Update an existing student record, supporting optional image replacement.
 * @param {string|number} id - The student ID to update
 * @param {Object} updatedStudent - The modified student payload
 * @param {File} [imageFile] - Optional new image file
 * @returns {Promise<Object>} The updated student response
 */
export const updateStudent = async (id, updatedStudent, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(updatedStudent)], { type: "application/json" }));

    if (imageFile) formData.append("image", imageFile);

    const res = await authFetch(API_ENDPOINTS.studentById(id), {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to update student");

    return data;
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error.message);
    throw error;
  }
};