import { authFetch } from "../../Authfetch/Authfetch";
import { getCurrUserDetails } from "../../utils/getCurrUserDetails";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// ==================== TEACHER CORE OPERATIONS ====================

/** Fetches overall statistics for teachers */
export const getTeacherStatistics = async () => {
  const res = await authFetch(API_ENDPOINTS.TEACHERS_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch statistics");
  return await res.json();
};

/** Fetches a paginated list of teachers */
export const getTeachers = async (page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.TEACHERS_PAGINATED}?page=${page}&size=${size}&sort=${sort}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch teachers");
  return await res.json();
};

/** Creates a new teacher record, optionally handling image uploads */
export const createTeachers = async (teacher, imageFile) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(teacher)], { type: "application/json" }));
  if (imageFile) formData.append("image", imageFile);

  const res = await authFetch(API_ENDPOINTS.TEACHERS, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create Teacher");
  return data;
};

/** Fetches teacher details by ID */
export const getTeacherById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.teacherById(id), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch Teacher");
  const data = await res.json();
  return data.data || data;
};

/** Updates an existing teacher, handling optional image updates */
export const updateTeacher = async (id, updatedTeacher, imageFile) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(updatedTeacher)], { type: "application/json" }));
  if (imageFile) formData.append("image", imageFile);

  const res = await authFetch(API_ENDPOINTS.teacherById(id), { method: "PUT", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update Teacher");
  return data;
};

/** Searches teachers via a POST filter payload */
export const searchTeachers = async (filters = {}, page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.TEACHERS_SEARCH}?page=${page}&size=${size}&sort=${sort}`, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(filters)
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to Search Teachers...');
  return await res.json();
};

/** Activates a teacher profile */
export const activateStatus = async (id) => {
  const res = await authFetch(API_ENDPOINTS.teacherActivate(id), { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to Activate Teacher');
  return await res.json();
};

/** Deactivates a teacher profile */
export const deactivateStatus = async (id) => {
  const res = await authFetch(API_ENDPOINTS.teacherDeactivate(id), { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to Deactivate Teacher');
  return await res.json();
};

// ==================== SALARY & ASSIGNMENTS ====================

/** Retrieves the current salary structure for a teacher */
export const getTeacherSalary = async (id) => {
  const res = await authFetch(API_ENDPOINTS.teacherSalary(id), { method: "GET" });
  if (!res.ok) throw new Error('Failed to get the teachers salary.');
  return (await res.json()).data;
};

/** Saves or updates a teacher's salary structure */
export const upsertTeacherSalary = async (teacherId, salaryData) => {
  const res = await authFetch(API_ENDPOINTS.teacherSalary(teacherId), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(salaryData),
  });
  const data = await res.json();
  if (!res.ok) {
    const error = new Error(data.message || "Failed to save salary structure");
    error.errorData = data;
    throw error;
  }
  return data;
};

/** Retrieves all assignments tied to a specific teacher */
export const getTeacherAssignment = async (teacherId) => {
  const res = await authFetch(API_ENDPOINTS.teacherAssignments(teacherId), { method: "GET" });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  const data = await res.json();
  return data.data || data;
};

/** Creates a new assignment for a teacher */
export const createTeacherAssignment = async (teacherId, assignmentData) => {
  const res = await authFetch(API_ENDPOINTS.teacherAssignments(teacherId), {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(assignmentData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

/** Gets only the active assignments for a teacher */
export const getTeachersActiveAssignments = async (teacherId) => {
  const res = await authFetch(API_ENDPOINTS.teacherActiveAssignments(teacherId), { method: "GET" });
  if (!res.ok) throw new Error('Failed to fetch assignments');
  const data = await res.json();
  return data.data || data;
};

/** Updates a specific teacher assignment */
export const updateTeacherAssignment = async (assignmentId, updatedAssignment) => {
  const res = await authFetch(API_ENDPOINTS.teacherAssignmentById(assignmentId), {
    method: 'PUT',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedAssignment)
  });
  if (!res.ok) throw new Error(await res.text() || 'Failed to update assignment');
  const data = await res.json();
  return data.data || data;
};

/** Deletes a teacher assignment */
export const deleteTeacherAssignment = async (assignmentId) => {
  const res = await authFetch(API_ENDPOINTS.teacherAssignmentById(assignmentId), { method: 'DELETE' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to delete assignment');
  return { success: true };
};

// ==================== ORGANIZATION UTILS ====================

/** Retrieve classes based on logged-in user's school context */
export const getClasses = async () => {
  const decoded = getCurrUserDetails();
  if (!decoded?.schoolId) return [];
  const res = await authFetch(API_ENDPOINTS.classesBySchool(decoded.schoolId));
  if (!res.ok) throw new Error('Failed to fetch classes');
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

/** Retrieve active classes for current school context */
export const getActiveClasses = async () => {
  const decoded = getCurrUserDetails();
  if (!decoded?.schoolId) return [];
  const res = await authFetch(API_ENDPOINTS.activeClassesBySchool(decoded.schoolId));
  if (!res.ok) throw new Error("Failed to fetch active classes");
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

/** Fetch sections associated with a specific class */
export const getSectionsByClass = async (classId) => {
  const res = await authFetch(API_ENDPOINTS.sectionsByClass(classId));
  if (!res.ok) throw new Error('Failed to fetch sections');
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

/** Fetch subject mappings for a specific class */
export const getSectionSubjectsByClass = async (classId) => {
  const res = await authFetch(API_ENDPOINTS.sectionSubjectsByClass(classId));
  if (!res.ok) throw new Error('Failed to fetch class subject mappings');
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : [];
};

/** Lightweight list for Teacher dropdowns */
export const getTeacherLookup = async () => {
  const res = await authFetch(API_ENDPOINTS.TEACHERS_LOOKUP);
  if (!res.ok) throw new Error("Failed to fetch teacher lookup");
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
};

export const getAllSections = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.SECTIONS, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch sections");
    return await res.json();
  } catch (error) {
    console.error("getAllSections error:", error.message);
    throw error;
  }
};

/** Fetch a single subject by its ID */
export const getSubjectById = async (subjectId) => {
  const res = await authFetch(API_ENDPOINTS.subjectById(subjectId));
  if (!res.ok) throw new Error('Failed to fetch subject');
  const data = await res.json();
  return data.data || data;
};


/** Fetch only active sections for a specific class */
export const getActiveSectionsByClass = async (classId) => {
  if (!classId) return [];
  const res = await authFetch(API_ENDPOINTS.activeSectionsByClass(classId), { method: "GET" });
  if (!res.ok) throw new Error((await res.text()) || "Failed to fetch active sections");
  const data = await res.json();
  return Array.isArray(data?.data) ? data.data : [];
};