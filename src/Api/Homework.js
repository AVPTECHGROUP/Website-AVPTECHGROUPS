import { authFetch } from "../Authfetch/Authfetch";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";
const BASE_URL = import.meta.env.VITE_API_BASE_V1;
const HOMEWORK_BASE_URL = `${BASE_URL}/homework`;
const BASE = import.meta.env.VITE_API_BASE_V1;

// ─────────────────────────────────────────────────────────────────────────────
//  Helper — coerce known ID fields from string → number so Java doesn't 500.
// ─────────────────────────────────────────────────────────────────────────────
const ID_FIELDS = ["subjectId", "sectionId", "teacherId", "classId", "homeworkId"];

const sanitizePayload = (payload) => {
  if (!payload || typeof payload !== "object") return payload;
  const out = { ...payload };
  for (const key of ID_FIELDS) {
    if (out[key] !== undefined && out[key] !== null && out[key] !== "") {
      const n = Number(out[key]);
      if (!Number.isNaN(n)) out[key] = n;
    }
    if (out[key] === "" || out[key] === undefined) delete out[key];
  }
  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
//  Shared response-body unwrapper
// ─────────────────────────────────────────────────────────────────────────────
const unwrapList = (body, label) => {
  if (Array.isArray(body))                return body;
  if (Array.isArray(body?.data))          return body.data;
  if (Array.isArray(body?.content))       return body.content;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.result))        return body.result;
  if (Array.isArray(body?.items))         return body.items;
  if (body?.content !== undefined)        return body;
  console.warn(`[${label}] Unrecognised response shape`, body);
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
//  Deep unwrap — finds the first array anywhere in the response object.
//  Used as a last-resort fallback when the shape is completely unknown.
// ─────────────────────────────────────────────────────────────────────────────
const deepFindArray = (obj, depth = 0) => {
  if (depth > 4) return null;
  if (Array.isArray(obj)) return obj;
  if (obj && typeof obj === "object") {
    for (const val of Object.values(obj)) {
      const found = deepFindArray(val, depth + 1);
      if (found) return found;
    }
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  authFetch normaliser — authFetch may return a real Response object OR an
//  already-parsed body depending on the interceptor version.  This helper
//  always returns the parsed JSON body and throws on HTTP errors.
// ─────────────────────────────────────────────────────────────────────────────
const resolveAuthFetch = async (raw) => {
  if (raw && typeof raw.json === "function") {
    // It's a real Response object
    if (!raw.ok) {
      const text = await raw.text().catch(() => raw.statusText);
      throw new Error(text || `HTTP ${raw.status}`);
    }
    return await raw.json();
  }
  // Already parsed
  return raw;
};

// ─────────────────────────────────────────────────────────────────────────────
//  1. Create homework   POST /api/v1/homework
// ─────────────────────────────────────────────────────────────────────────────
export const createHomework = async (payload) => {
  const res = await authFetch(HOMEWORK_BASE_URL, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(sanitizePayload(payload)),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to create homework (${res.status})`);
  }

  return await res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
//  2. Get homework by ID   GET /api/v1/homework/:id
// ─────────────────────────────────────────────────────────────────────────────
export const getHomeworkById = async (id) => {
  const res = await authFetch(`${HOMEWORK_BASE_URL}/${id}`, { method: "GET" });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to fetch homework (${res.status})`);
  }

  return await res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
//  3. Update homework   PUT /api/v1/homework/:id
// ─────────────────────────────────────────────────────────────────────────────
export const updateHomework = async (id, payload) => {
  const res = await authFetch(`${HOMEWORK_BASE_URL}/${id}`, {
    method:  "PUT",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(sanitizePayload(payload)),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to update homework (${res.status})`);
  }

  return await res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
//  4. Delete homework   DELETE /api/v1/homework/:id
// ─────────────────────────────────────────────────────────────────────────────
export const deleteHomework = async (id) => {
  const res = await authFetch(`${HOMEWORK_BASE_URL}/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to delete homework (${res.status})`);
  }

  const ct = res.headers.get("content-type");
  return ct?.includes("application/json") ? await res.json() : null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  5. Upload attachment   POST /api/v1/homework/:id/attachment
// ─────────────────────────────────────────────────────────────────────────────
export const uploadHomeworkAttachment = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authFetch(`${HOMEWORK_BASE_URL}/${id}/attachment`, {
    method: "POST",
    body:   formData,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to upload attachment (${res.status})`);
  }

  return await res.json();
};

// ─────────────────────────────────────────────────────────────────────────────
//  6. Update homework status   PATCH /api/v1/homework/:id/status?status=
// ─────────────────────────────────────────────────────────────────────────────
export const updateHomeworkStatus = async (id, status) => {
  const res = await authFetch(
      `${HOMEWORK_BASE_URL}/${id}/status?status=${encodeURIComponent(status)}`,
      { method: "PATCH" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to update homework status (${res.status})`);
  }

  const ct = res.headers.get("content-type");
  return ct?.includes("application/json") ? await res.json() : null;
};

// ─────────────────────────────────────────────────────────────────────────────
//  7. Cancel homework   PATCH /api/v1/homework/:id/status?status=CANCELLED
// ─────────────────────────────────────────────────────────────────────────────
export const cancelHomework = (id) => updateHomeworkStatus(id, "CANCELLED");

// ─────────────────────────────────────────────────────────────────────────────
//  8. Get homework for a section
//     GET /api/v1/homework/section/:sectionId?subjectId=&status=&dueAfter=&dueBefore=&page=&size=&sort=
// ─────────────────────────────────────────────────────────────────────────────
export const getHomework = async ({
  sectionId,
  subjectId,
  status,
  dueAfter,
  dueBefore,
  page = 0,
  size = 50,
  sort = "id",
}) => {
  const query = new URLSearchParams({ page, size, sort });

  if (subjectId) query.set("subjectId", subjectId);
  if (status)    query.set("status",    status);
  if (dueAfter)  query.set("dueAfter",  dueAfter);
  if (dueBefore) query.set("dueBefore", dueBefore);

  const raw = await authFetch(
    `${HOMEWORK_BASE_URL}/section/${sectionId}?${query.toString()}`,
    { method: "GET" }
  );

  let body;
  if (raw && typeof raw.json === "function") {
    if (!raw.ok) {
      const text = await raw.text().catch(() => raw.statusText);
      throw new Error(text || `Failed (${raw.status})`);
    }
    body = await raw.json();
  } else {
    body = raw;
  }

  if (Array.isArray(body))           return body;
  if (Array.isArray(body?.data))     return body.data;
  if (Array.isArray(body?.content))  return body.content;

  console.warn("[getHomework] Unexpected shape:", body);
  return [];
};

// ─────────────────────────────────────────────────────────────────────────────
//  9. Get published homework for a section
//     GET /api/v1/homework/section/:sectionId/published
// ─────────────────────────────────────────────────────────────────────────────
export const getPublishedHomeworkBySection = async (sectionId, params = {}) => {
  const { subjectId, dueAfter, page = 0, size = 50, sort } = params;

  const query = new URLSearchParams({ page, size });
  if (subjectId) query.set("subjectId", Number(subjectId));
  if (dueAfter)  query.set("dueAfter", dueAfter);
  if (sort)      query.set("sort", sort);

  const res = await authFetch(
      `${HOMEWORK_BASE_URL}/section/${sectionId}/published?${query.toString()}`,
      { method: "GET" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to fetch published homework (${res.status})`);
  }

  return unwrapList(await res.json(), "getPublishedHomeworkBySection");
};

// ─────────────────────────────────────────────────────────────────────────────
//  10. Get homework by teacher   GET /api/v1/homework/teacher/:teacherId
// ─────────────────────────────────────────────────────────────────────────────
export const getHomeworkByTeacher = async (teacherId, params = {}) => {
  const { page = 0, size = 50, sort } = params;

  const query = new URLSearchParams({ page, size });
  if (sort) query.set("sort", sort);

  const res = await authFetch(
      `${HOMEWORK_BASE_URL}/teacher/${teacherId}?${query.toString()}`,
      { method: "GET" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to fetch homework by teacher (${res.status})`);
  }

  return unwrapList(await res.json(), "getHomeworkByTeacher");
};

// ─────────────────────────────────────────────────────────────────────────────
//  11. Get active subjects by section
//      GET /api/v1/section-subjects/section/:sectionId/active
// ─────────────────────────────────────────────────────────────────────────────
export const getActiveSubjectsBySection = async (sectionId) => {
  const res = await authFetch(
    `${BASE}/section-subjects/section/${sectionId}/active`,
    { method: "GET" }
  );

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to fetch active subjects (${res.status})`);
  }

  return unwrapList(await res.json(), "getActiveSubjectsBySection");
};

// ─────────────────────────────────────────────────────────────────────────────
//  12. Teacher lookup   GET /api/v1/teachers/lookup
//
//  authFetch can return a real Response OR an already-parsed body.
//  We handle both cases and try every known response shape before falling back
//  to a deep search for any array in the payload.
// ─────────────────────────────────────────────────────────────────────────────
export const getTeacherLookup = async () => {
  let data;

  try {
    const raw = await authFetch(`${BASE_URL}/teachers/lookup`);
    data = await resolveAuthFetch(raw);
  } catch (err) {
    // If authFetch itself threw, bubble the error
    console.error("[getTeacherLookup] authFetch error:", err.message);
    throw err;
  }

  console.log("[getTeacherLookup] raw response:", data);

  // ── Try every known envelope shape ──────────────────────────────────────
  if (Array.isArray(data))                return data;
  if (Array.isArray(data?.data))          return data.data;
  if (Array.isArray(data?.teachers))      return data.teachers;
  if (Array.isArray(data?.result))        return data.result;
  if (Array.isArray(data?.content))       return data.content;
  if (Array.isArray(data?.items))         return data.items;
  if (Array.isArray(data?.data?.content)) return data.data.content;

  // ── Last resort: find the first array anywhere in the response ───────────
  const found = deepFindArray(data);
  if (found) {
    console.warn("[getTeacherLookup] Used deepFindArray fallback, shape:", data);
    return found;
  }

  console.warn("[getTeacherLookup] No array found in response:", data);
  return [];
};

// Keep old getTeachers for any other consumers
export const getTeachers = async () => {
  const res = await authFetch(`${BASE_URL}/users/teachers`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `Failed to fetch teachers (${res.status})`);
  }
  const data = await res.json();
  if (Array.isArray(data))       return data;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};