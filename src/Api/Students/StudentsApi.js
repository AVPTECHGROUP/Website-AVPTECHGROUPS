import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// ==================== READ OPERATIONS ====================

/**
 * Fetch a paginated list of all students.
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
 * Fetch active or filtered students belonging to a specific section.
 */
export const getStudentsBySection = async (sectionId, status = "ACTIVE") => {
  try {
    const url = API_ENDPOINTS.studentsBySection
      ? API_ENDPOINTS.studentsBySection(sectionId, status)
      : `${API_ENDPOINTS.STUDENTS}/section/${sectionId}?status=${status}`;

    const res = await authFetch(url, { method: "GET" });
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || data?.error || "Failed to fetch students by section");
    return data?.data || data;
  } catch (error) {
    console.error("getStudentsBySection error:", error.message);
    throw error;
  }
};

/**
 * Search and filter students using POST payload.
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
 * Create a new student record.
 */
export const createStudents = async (studentData, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(studentData)], { type: "application/json" }));

    if (imageFile) {
      formData.append("image", imageFile);
    }

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
 * Update an existing student record.
 */
export const updateStudent = async (id, updatedStudent, imageFile) => {
  try {
    const formData = new FormData();
    formData.append("data", new Blob([JSON.stringify(updatedStudent)], { type: "application/json" }));

    if (imageFile) {
      formData.append("image", imageFile);
    }

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

// ==================== DOCUMENTS & PHOTOS OPERATIONS ====================

/**
 * Fetch all uploaded documents for a student.
 */
export const getStudentDocuments = async (id) => {
  try {
    const res = await authFetch(API_ENDPOINTS.STUDENT_DOCUMENTS(id), {
      method: "GET",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to fetch student documents");

    return data?.data || [];
  } catch (error) {
    console.error("getStudentDocuments error:", error.message);
    throw error;
  }
};

/**
 * Upload a student document.
 * Supported docTypes: STUDENT_AADHAAR, FATHER_AADHAAR, MOTHER_AADHAAR, BIRTH_CERTIFICATE
 */
export const uploadStudentDocument = async (id, docType, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch(
      API_ENDPOINTS.UPLOAD_STUDENT_DOCUMENT(id, docType),
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to upload document");

    return data;
  } catch (error) {
    console.error("uploadStudentDocument error:", error.message);
    throw error;
  }
};

/**
 * Upload Father/Mother/Guardian photo.
 * Supported photoTypes: FATHER, MOTHER, GUARDIAN
 */
export const uploadParentPhoto = async (id, photoType, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const res = await authFetch(
      API_ENDPOINTS.UPLOAD_PARENT_PHOTO(id, photoType),
      {
        method: "PATCH",
        body: formData,
      }
    );

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to upload parent photo");

    return data;
  } catch (error) {
    console.error("uploadParentPhoto error:", error.message);
    throw error;
  }
};