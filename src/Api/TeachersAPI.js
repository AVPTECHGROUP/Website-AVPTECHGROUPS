import { authFetch } from "../Authfetch/Authfetch";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// ==================== TEACHER ENDPOINTS ====================

export const getTeacherStatistics = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/statistics`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch statistics");
    return await res.json();
  } catch (error) {
    console.error("get statistics error:", error.message);
    throw error;
  }
};

export const getTeachers = async (page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(
      `${BASE_URL}/teachers/paginated?page=${page}&size=${size}&sort=${sort}`,
      { method: "GET" }
    );
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch teachers");
    return await res.json();
  } catch (error) {
    console.error("getTeachers error:", error.message);
    throw error;
  }
};

export const createTeachers = async (teacher, imageFile) => {
  const formData = new FormData();

  // JSON part
  formData.append(
    "data",
    new Blob([JSON.stringify(teacher)], { type: "application/json" })
  );

  // Image part (optional)
  if (imageFile) {
    formData.append("image", imageFile);
  }

  const res = await authFetch(`${BASE_URL}/teachers`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!res.ok) throw new Error(data?.message || "Failed to create Teacher");

  return data;
};
export const getTeacherById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${id}`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch Teacher");

    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("getTeachersByID error:", error.message);
    throw error;
  }
};

export const updateTeacher = async (id, updatedTeacher, imageFile) => {
  try {
    const formData = new FormData();

    // JSON part
    formData.append(
      "data",
      new Blob([JSON.stringify(updatedTeacher)], {
        type: "application/json",
      })
    );

    // Image part (optional)
    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await authFetch(`${BASE_URL}/teachers/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Failed to update Teacher");

    return data;
  } catch (error) {
    console.error("UpdateTeachers error:", error.message);
    throw error;
  }
};

export const searchTeachers = async (filters = {}, page, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(
      `${BASE_URL}/teachers/search/paginated?page=${page}&size=${size}&sort=${sort}`,
      { method: 'POST', body: JSON.stringify(filters) }
    );
    if (!res.ok) throw new Error((await res.text()) || 'Failed to Search Teachers...');
    return await res.json();
  } catch (error) {
    console.error('searchTeachers error:', error.message);
    throw error;
  }
};

export const getTeacherSalary = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${id}/salary-structure`);
    if (!res.ok) throw new Error('Failed to get the teachers salary.');
    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error('getTeacherSalary error:', error.message);
    throw error;
  }
};

export const upsertTeacherSalary = async (teacherId, salaryData) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/teachers/${teacherId}/salary-structure`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(salaryData),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to save salary structure");
    }

    return data;
  } catch (error) {
    console.error("upsertTeacherSalary error:", error.message);
    throw error;
  }
};

export const activateStatus = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${id}/activate`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to Activate Teacher');
    return await res.json();
  } catch (error) {
    console.error('Activate Status error:', error.message);
    throw error;
  }
};

export const deactivateStatus = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${id}/deactivate`, { method: 'PATCH' });
    if (!res.ok) throw new Error('Failed to Deactivate Teacher');
    return await res.json();
  } catch (error) {
    console.error('Deactivate error:', error.message);
    throw error;
  }
};

// ==================== ASSIGNMENTS API ====================

export const getTeacherAssignment = async (teacherId) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${teacherId}/assignments`);
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("getTeacherAssignment error:", error.message);
    throw error;
  }
};

export const createTeacherAssignment = async (teacherId, assignmentData) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${teacherId}/assignments`, { method: 'POST', body: JSON.stringify(assignmentData) });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
  } catch (error) {
    console.error('createTeacherAssignment error:', error.message);
    throw error;
  }
};

export const getTeachersActiveAssignments = async (teacherId) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/${teacherId}/assignments/active`, { method: "GET" });
    if (!res.ok) throw new Error('Failed to fetch assignments');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("get teachers current assignment error:", error.message);
    throw error;
  }
};

export const updateTeacherAssignment = async (assignmentId, updatedAssignment) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/assignments/${assignmentId}`, { method: 'PUT', body: JSON.stringify(updatedAssignment) });
    if (!res.ok) throw new Error((await res.text()) || 'Failed to update assignment');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateTeacherAssignment error:', error.message);
    throw error;
  }
};

export const deleteTeacherAssignment = async (assignmentId) => {
  try {
    const res = await authFetch(`${BASE_URL}/teachers/assignments/${assignmentId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.text()) || 'Failed to delete assignment');
    return { success: true };
  } catch (error) {
    console.error('deleteTeacherAssignment error:', error.message);
    throw error;
  }
};

// ==================== CLASSES API ====================

// ✅ FIXED: schoolId ab JWT token se aata hai (getCurrUserDetails)
// Switch school ke baad naye token mein schoolId embedded hota hai
// e.g. school 1 select → token mein schoolId: 1
//      school 2 select → token mein schoolId: 2
export const getClasses = async () => {
  try {
    const decoded = getCurrUserDetails();       // JWT token decode
    const schoolId = decoded?.schoolId ?? null;  // schoolId from token

    if (!schoolId) {
      console.warn("getClasses: schoolId not found in token. Switch school first.");
      return [];
    }

    console.log("getClasses: using schoolId from token →", schoolId);

    const res = await authFetch(`${BASE_URL}/classes/school/${schoolId}`);
    if (!res.ok) throw new Error('Failed to fetch classes');

    const data = await res.json();
    console.log("Classes API response:", data);

    if (data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;

    console.warn("Unexpected classes response format:", data);
    return [];
  } catch (error) {
    console.error('getClasses error:', error.message);
    throw error;
  }
};

export const getClassById = async (classId) => {
  try {
    const res = await authFetch(`${BASE_URL}/classes/${classId}`);
    if (!res.ok) throw new Error('Failed to fetch class');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getClassById error:', error.message);
    throw error;
  }
};

export const createClass = async (classData) => {
  try {
    const res = await authFetch(`${BASE_URL}/classes`, { method: 'POST', body: JSON.stringify(classData) });
    if (!res.ok) throw new Error('Failed to create class');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createClass error:', error.message);
    throw error;
  }
};

export const updateClass = async (classId, classData) => {
  try {
    const res = await authFetch(`${BASE_URL}/classes/${classId}`, { method: 'PUT', body: JSON.stringify(classData) });
    if (!res.ok) throw new Error('Failed to update class');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateClass error:', error.message);
    throw error;
  }
};

// ==================== SECTIONS API ====================

export const getSectionsByClass = async (classId) => {
  try {
    const res = await authFetch(`${BASE_URL}/sections/class/${classId}`);
    if (!res.ok) throw new Error('Failed to fetch sections');
    const data = await res.json();
    if (data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    console.warn("Unexpected sections response format:", data);
    return [];
  } catch (error) {
    console.error('getSectionsByClass error:', error.message);
    throw error;
  }
};

export const getSectionSubjectsByClass = async (classId) => {
  try {
    const res = await authFetch(`${BASE_URL}/section-subjects/class/${classId}`);

    if (!res.ok) throw new Error('Failed to fetch class subject mappings');

    const data = await res.json();

    if (data.data && Array.isArray(data.data)) {
      return data.data; // Isme 'id' field hi 'sectionSubjectId' hai
    }

    return [];
  } catch (error) {
    console.error('getSectionSubjectsByClass error:', error.message);
    throw error;
  }
};

export const getSectionById = async (sectionId) => {
  try {
    const res = await authFetch(`${BASE_URL}/sections/${sectionId}`);
    if (!res.ok) throw new Error('Failed to fetch section');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getSectionById error:', error.message);
    throw error;
  }
};

export const createSection = async (sectionData) => {
  try {
    const res = await authFetch(`${BASE_URL}/sections`, { method: 'POST', body: JSON.stringify(sectionData) });
    if (!res.ok) throw new Error('Failed to create section');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createSection error:', error.message);
    throw error;
  }
};

export const updateSection = async (sectionId, sectionData) => {
  try {
    const res = await authFetch(`${BASE_URL}/sections/${sectionId}`, { method: 'PUT', body: JSON.stringify(sectionData) });
    if (!res.ok) throw new Error('Failed to update section');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateSection error:', error.message);
    throw error;
  }
};

export const getAllSections = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/sections`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch sections");
    return await res.json();
  } catch (error) {
    console.error("getAllSections error:", error.message);
    throw error;
  }
};

// ==================== SUBJECTS API ====================

export const getSubjectsBySection = async (sectionId) => {
  try {
    const res = await authFetch(`${BASE_URL}/section-subjects/section/${sectionId}`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    const data = await res.json();
    if (data?.data && Array.isArray(data.data)) {
      return data.data.map(mapping => ({
        id: mapping.subjectId,
        name: mapping.subjectName,
        code: mapping.subjectCode,
      }));
    }
    return [];
  } catch (error) {
    console.error('getSubjectsBySection error:', error.message);
    throw error;
  }
};

export const getAllSubjects = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/subjects`);
    if (!res.ok) throw new Error('Failed to fetch subjects');
    const data = await res.json();
    if (data.data && Array.isArray(data.data)) return data.data;
    if (Array.isArray(data)) return data;
    console.warn("Unexpected all subjects response format:", data);
    return [];
  } catch (error) {
    console.error('getAllSubjects error:', error.message);
    throw error;
  }
};

export const getSubjectById = async (subjectId) => {
  try {
    const res = await authFetch(`${BASE_URL}/subjects/${subjectId}`);
    if (!res.ok) throw new Error('Failed to fetch subject');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('getSubjectById error:', error.message);
    throw error;
  }
};

export const createSubject = async (subjectData) => {
  try {
    const res = await authFetch(`${BASE_URL}/subjects`, { method: 'POST', body: JSON.stringify(subjectData) });
    if (!res.ok) throw new Error('Failed to create subject');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('createSubject error:', error.message);
    throw error;
  }
};

export const updateSubject = async (subjectId, subjectData) => {
  try {
    const res = await authFetch(`${BASE_URL}/subjects/${subjectId}`, { method: 'PUT', body: JSON.stringify(subjectData) });
    if (!res.ok) throw new Error('Failed to update subject');
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error('updateSubject error:', error.message);
    throw error;
  }
};