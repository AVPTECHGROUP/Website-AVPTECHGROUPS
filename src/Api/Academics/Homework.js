import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ─── Helpers ───
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

const unwrapList = (body) => {
  if (Array.isArray(body)) return body;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body?.content)) return body.content;
  if (Array.isArray(body?.data?.content)) return body.data.content;
  if (Array.isArray(body?.result)) return body.result;
  if (Array.isArray(body?.items)) return body.items;
  if (body?.content !== undefined) return body;
  return [];
};

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

const resolveAuthFetch = async (raw) => {
  if (raw && typeof raw.json === "function") {
    if (!raw.ok) throw new Error(await raw.text().catch(() => raw.statusText) || `HTTP ${raw.status}`);
    return await raw.json();
  }
  return raw;
};

// ─── API Methods ───

export const createHomework = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.HOMEWORK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitizePayload(payload)),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to create homework");
  return await res.json();
};

export const getHomeworkById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.homeworkById(id), { method: "GET" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to fetch homework");
  return await res.json();
};

export const updateHomework = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.homeworkById(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sanitizePayload(payload)),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to update homework");
  return await res.json();
};

export const deleteHomework = async (id) => {
  const res = await authFetch(API_ENDPOINTS.homeworkById(id), { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to delete homework");
  return res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
};

export const uploadHomeworkAttachment = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await authFetch(API_ENDPOINTS.homeworkAttachment(id), { method: "POST", body: formData });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to upload attachment");
  return await res.json();
};

export const updateHomeworkStatus = async (id, status) => {
  const res = await authFetch(`${API_ENDPOINTS.homeworkStatus(id)}?status=${encodeURIComponent(status)}`, { method: "PATCH" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to update homework status");
  return res.headers.get("content-type")?.includes("application/json") ? await res.json() : null;
};

export const cancelHomework = (id) => updateHomeworkStatus(id, "CANCELLED");

export const getHomework = async ({ sectionId, subjectId, status, dueAfter, dueBefore, page = 0, size = 50, sort = "id" }) => {
  const query = new URLSearchParams({ page, size, sort });
  if (subjectId) query.set("subjectId", subjectId);
  if (status) query.set("status", status);
  if (dueAfter) query.set("dueAfter", dueAfter);
  if (dueBefore) query.set("dueBefore", dueBefore);

  const raw = await authFetch(`${API_ENDPOINTS.homeworkBySection(sectionId)}?${query.toString()}`, { method: "GET" });
  return unwrapList(await resolveAuthFetch(raw));
};

export const getPublishedHomeworkBySection = async (sectionId, params = {}) => {
  const { subjectId, dueAfter, page = 0, size = 50, sort } = params;
  const query = newSearchParams({ page, size });

  if (subjectId) query.set("subjectId", Number(subjectId));
  if (dueAfter) query.set("dueAfter", dueAfter);
  if (sort) query.set("sort", sort);

  const res = await authFetch(`${API_ENDPOINTS.homeworkPublishedBySection(sectionId)}?${query.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to fetch published homework");
  return unwrapList(await res.json());
};

export const getHomeworkByTeacher = async (teacherId, { page = 0, size = 50, sort } = {}) => {
  const query = new URLSearchParams({ page, size });
  if (sort) query.set("sort", sort);

  const res = await authFetch(`${API_ENDPOINTS.homeworkByTeacher(teacherId)}?${query.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to fetch teacher homework");
  return unwrapList(await res.json());
};

export const getActiveSubjectsBySection = async (sectionId) => {
  const res = await authFetch(API_ENDPOINTS.activeSubjectsBySection(sectionId), { method: "GET" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to fetch active subjects");
  return unwrapList(await res.json());
};

export const getTeacherLookup = async () => {
  const raw = await authFetch(API_ENDPOINTS.TEACHERS_LOOKUP);
  const data = await resolveAuthFetch(raw);

  const unwrapped = unwrapList(data);
  if (unwrapped && unwrapped.length > 0) return unwrapped;

  return deepFindArray(data) || [];
};

export const getTeachers = async () => {
  const res = await authFetch(API_ENDPOINTS.TEACHERS_DROPDOWN, { method: "GET" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText) || "Failed to fetch teachers");
  return unwrapList(await res.json());
};