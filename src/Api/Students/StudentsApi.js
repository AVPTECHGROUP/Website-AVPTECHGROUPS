import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// ==================== READ OPERATIONS ====================
// ==================== GET STUDENTS ====================
export const getStudents = async (page = 0, size = 10, sort = "id") => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    const res = await authFetch(
      `${API_ENDPOINTS.STUDENTS_PAGINATED}?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
        "Failed to fetch students"
      );
    }

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


export const searchStudents = async (
  filters = {},
  page = 0,
  size = 10,
  sort = "id"
) => {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      sort,
    });

    const res = await authFetch(
      `${API_ENDPOINTS.STUDENTS_SEARCH}?${params.toString()}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filters),
      }
    );

    if (!res.ok) {
      throw new Error(
        (await res.json().catch(() => ({}))).message ||
        "Failed to search students"
      );
    }

    return await res.json();
  } catch (error) {
    console.error("searchStudents error:", error.message);
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

// ==================== BULK IMPORT ====================

export const createStudentsBulk = async (studentsData) => {
  try {
    const deepClean = (value) => {
      if (value === undefined) return undefined;
      if (value === null) return null;
      if (Array.isArray(value)) return value.map((v) => deepClean(v)).filter((v) => v !== undefined);
      if (typeof value === "object") {
        const out = {};
        Object.entries(value).forEach(([k, v]) => {
          const cleaned = deepClean(v);
          if (cleaned !== undefined) out[k] = cleaned;
        });
        return out;
      }
      return value;
    };

    const cleaned = Array.isArray(studentsData)
      ? studentsData.map((s) => deepClean(s))
      : deepClean(studentsData);

    const payloadArray = Array.isArray(cleaned) ? cleaned : [cleaned];
    const bodyStr = JSON.stringify(payloadArray);

    // Endpoint must hit /api/api/v1/students/bulk as registered in Swagger
    const endpoint = API_ENDPOINTS.STUDENTS_BULK || `${API_ENDPOINTS.STUDENTS}/bulk`;

    const res = await authFetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: bodyStr,
    });

    let json = null;
    let text = null;
    try {
      json = await res.json();
    } catch {
      text = await res.text().catch(() => null);
    }

    if (!res.ok) {
      const serverMsg = json?.message || json?.error || text || res.statusText || "Failed to import students";
      throw new Error(serverMsg);
    }

    return json;
  } catch (error) {
    console.error("createStudentsBulk error:", error.message);
    throw error;
  }
};

// ==================== STUDENT DOCUMENTS ====================

/**
 * Fetch all uploaded documents for a student.
 * @param {string|number} id - Student ID
 * @returns {Promise<Array>}
 */
export const getStudentDocuments = async (id) => {
  try {
    const res = await authFetch(API_ENDPOINTS.STUDENT_DOCUMENTS(id), {
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to fetch student documents");
    }

    return data?.data || [];
  } catch (error) {
    console.error("getStudentDocuments error:", error.message);
    throw error;
  }
};

/**
 * Upload a student document.
 * Supported docTypes:
 * STUDENT_AADHAAR
 * FATHER_AADHAAR
 * MOTHER_AADHAAR
 * BIRTH_CERTIFICATE
 *
 * @param {string|number} id
 * @param {string} docType
 * @param {File} file
 * @returns {Promise<Object>}
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

    if (!res.ok) {
      throw new Error(data?.message || "Failed to upload document");
    }

    return data;
  } catch (error) {
    console.error("uploadStudentDocument error:", error.message);
    throw error;
  }
};

/**
 * Upload Father/Mother/Guardian photo.
 *
 * Supported photoTypes:
 * FATHER
 * MOTHER
 * GUARDIAN
 *
 * @param {string|number} id
 * @param {string} photoType
 * @param {File} file
 * @returns {Promise<Object>}
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

    if (!res.ok) {
      throw new Error(data?.message || "Failed to upload parent photo");
    }

    return data;
  } catch (error) {
    console.error("uploadParentPhoto error:", error.message);
    throw error;
  }
};
