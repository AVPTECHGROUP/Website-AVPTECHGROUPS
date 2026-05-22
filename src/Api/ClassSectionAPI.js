import { authFetch } from '../Authfetch/Authfetch';

const BASE = `${import.meta.env.VITE_API_BASE_V1}`;
const CLASS_URL = `${BASE}/classes`;
const SECTION_URL = `${BASE}/sections`;

// ─── Helper ──────────────────────────────────────────────────────────────────
const handle = async (res) => {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      msg = body?.message || msg;
    } catch { /* non-JSON error body */ }
    throw new Error(msg);
  }
  return res.json();
};

// ─── Classes ─────────────────────────────────────────────────────────────────

/** GET /v1/classes/school/{schoolId}?search=&gradeLevel=&status= */
export const getAllClasses = async (schoolId, { search, gradeLevel, status } = {}) => {
  const params = new URLSearchParams();
  if (search)      params.append('search',     search);
  if (gradeLevel !== undefined && gradeLevel !== '') params.append('gradeLevel', gradeLevel);
  if (status)      params.append('status',     status);
  const qs = params.toString();
  const url = `${CLASS_URL}/school/${schoolId}${qs ? `?${qs}` : ''}`;
  return handle(await authFetch(url, { method: 'GET' }));
};

/** GET /v1/classes/school/{schoolId}/active */
export const getActiveClasses = async (schoolId) =>
  handle(await authFetch(`${CLASS_URL}/school/${schoolId}/active`, { method: 'GET' }));

/** GET /v1/classes/{id} */
export const getClassById = async (id) =>
  handle(await authFetch(`${CLASS_URL}/${id}`, { method: 'GET' }));

/** POST /v1/classes */
export const createClass = async (payload) =>
  handle(await authFetch(CLASS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

/** PUT /v1/classes/{id} */
export const updateClass = async (id, payload) =>
  handle(await authFetch(`${CLASS_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

/** DELETE /v1/classes/{id} */
export const deleteClass = async (id) =>
  handle(await authFetch(`${CLASS_URL}/${id}`, { method: 'DELETE' }));

// ─── Sections ────────────────────────────────────────────────────────────────

/** GET /v1/sections/class/{classId}?status= */
export const getSectionsByClass = async (classId, status) => {
  const qs = status ? `?status=${status}` : '';
  return handle(await authFetch(`${SECTION_URL}/class/${classId}${qs}`, { method: 'GET' }));
};

/** GET /v1/sections/class/{classId}/active */
export const getActiveSections = async (classId) =>
  handle(await authFetch(`${SECTION_URL}/class/${classId}/active`, { method: 'GET' }));

/** GET /v1/sections/{id} */
export const getSectionById = async (id) =>
  handle(await authFetch(`${SECTION_URL}/${id}`, { method: 'GET' }));

/** POST /v1/sections */
export const createSection = async (payload) =>
  handle(await authFetch(SECTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

/** PUT /v1/sections/{id} */
export const updateSection = async (id, payload) =>
  handle(await authFetch(`${SECTION_URL}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }));

/** DELETE /v1/sections/{id} */
export const deleteSection = async (id) =>
  handle(await authFetch(`${SECTION_URL}/${id}`, { method: 'DELETE' }));

// ─── Supporting ──────────────────────────────────────────────────────────────

/** GET /v1/users/teachers — lightweight list for Class Teacher dropdown */
export const getTeachersDropdown = async () =>
  handle(await authFetch(`${BASE}/users/teachers`, { method: 'GET' }));
