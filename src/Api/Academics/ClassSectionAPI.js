import { authFetch } from '../../Authfetch/Authfetch';
import { API_ENDPOINTS } from '../../Constants/Endpoints';

/** Reusable response handler */
const handle = async (res) => {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.message || msg;
    } catch { /* Non-JSON error body */ }
    throw new Error(msg);
  }
  return res.json();
};

// ==================== Classes ====================

export const getAllClasses = async (schoolId, { search, gradeLevel, status } = {}) => {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (gradeLevel !== undefined && gradeLevel !== '') params.append('gradeLevel', gradeLevel);
  if (status) params.append('status', status);

  const qs = params.toString();
  const url = `${API_ENDPOINTS.classesBySchool(schoolId)}${qs ? `?${qs}` : ''}`;
  return handle(await authFetch(url, { method: 'GET' }));
};

export const getActiveClasses = async (schoolId) =>
  handle(await authFetch(API_ENDPOINTS.activeClassesBySchool(schoolId), { method: 'GET' }));

export const getClassById = async (id) =>
  handle(await authFetch(API_ENDPOINTS.classById(id), { method: 'GET' }));

export const createClass = async (payload) =>
  handle(await authFetch(API_ENDPOINTS.CLASSES, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

export const updateClass = async (id, payload) =>
  handle(await authFetch(API_ENDPOINTS.classById(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

export const deleteClass = async (id) =>
  handle(await authFetch(API_ENDPOINTS.classById(id), { method: 'DELETE' }));

// ==================== Sections ====================

export const getSectionsByClass = async (classId, status) => {
  const qs = status ? `?status=${status}` : '';
  return handle(await authFetch(`${API_ENDPOINTS.sectionsByClass(classId)}${qs}`, { method: 'GET' }));
};

export const getActiveSections = async (classId) =>
  handle(await authFetch(API_ENDPOINTS.activeSectionsByClass(classId), { method: 'GET' }));

export const getSectionById = async (id) =>
  handle(await authFetch(API_ENDPOINTS.sectionById(id), { method: 'GET' }));

export const createSection = async (payload) =>
  handle(await authFetch(API_ENDPOINTS.SECTIONS, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

export const updateSection = async (id, payload) =>
  handle(await authFetch(API_ENDPOINTS.sectionById(id), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

export const deleteSection = async (id) =>
  handle(await authFetch(API_ENDPOINTS.sectionById(id), { method: 'DELETE' }));

// ==================== Supporting ====================

/** Lightweight list for Class Teacher dropdown */
export const getTeachersDropdown = async () =>
  handle(await authFetch(API_ENDPOINTS.TEACHERS_DROPDOWN, { method: 'GET' }));