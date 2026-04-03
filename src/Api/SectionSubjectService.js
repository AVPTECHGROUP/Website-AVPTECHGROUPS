// ─────────────────────────────────────────────────────────────────────────────
//  SectionSubjectService.js
// ─────────────────────────────────────────────────────────────────────────────

import { authFetch }        from "../Authfetch/Authfetch";
import { toast }            from "react-toastify";
import { getCurrUserDetails } from "../utils/getCurrUserDetails";

const BASE            = import.meta.env.VITE_API_BASE_V1;
const SECTION_SUBJ    = `${BASE}/section-subjects`;

// Extracts an array from any common API response shape
const toArray = (json) => {
  if (Array.isArray(json))                return json;
  if (Array.isArray(json?.data))          return json.data;
  if (Array.isArray(json?.data?.records)) return json.data.records;
  if (Array.isArray(json?.records))       return json.records;
  if (Array.isArray(json?.items))         return json.items;
  return [];
};

class SectionSubjectService {
  // silent=true  → no success toast (used for GETs)
  // silent=false → toast.success on success, toast.error on failure
  async #req(method, url, body = null, silent = false) {
    const res  = await authFetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      ...(body && { body: JSON.stringify(body) }),
    });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = json?.message || `Request failed (HTTP ${res.status})`;
      toast.error(msg);
      throw new Error(msg);
    }

    if (!silent && json?.message) toast.success(json.message);
    return json;
  }

  // ── Dropdowns ─────────────────────────────────────────────────────────────

  async getAllClasses() {
    try {
      const { schoolId } = getCurrUserDetails() ?? {};
      const json = await this.#req("GET", `${BASE}/classes/school/${schoolId}`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  async getSectionsByClass(classId) {
    try {
      const json = await this.#req("GET", `${BASE}/sections/class/${classId}`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  async getAllSubjects() {
    try {
      const json = await this.#req("GET", `${BASE}/subjects`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  // ── Section-Subject reads ─────────────────────────────────────────────────

  async getSubjectsBySection(sectionId) {
    try {
      const json = await this.#req("GET", `${SECTION_SUBJ}/section/${sectionId}`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  async getActiveSubjectsBySection(sectionId) {
    try {
      const json = await this.#req("GET", `${SECTION_SUBJ}/section/${sectionId}/active`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  // POST /assign  payload: { sectionId, subjects: [{ subjectId, weeklyHours, isMandatory, status }] }
  async assignSubjects(payload) {
    try   { return await this.#req("POST", `${SECTION_SUBJ}/assign`, payload); }
    catch { return null; }
  }

  // PUT /{id}  payload: { subjectId, weeklyHours, isMandatory, status: 'ACTIVE'|'INACTIVE' }
  async updateAssignment(id, payload) {
    try   { return await this.#req("PUT", `${SECTION_SUBJ}/${id}`, payload); }
    catch { return null; }
  }

  // DELETE /section/{sId}/subject/{subId}
  async removeSubject(sectionId, subjectId) {
    try   { return await this.#req("DELETE", `${SECTION_SUBJ}/section/${sectionId}/subject/${subjectId}`); }
    catch { return null; }
  }

  // DELETE /section/{sectionId}
  async removeAllSubjects(sectionId) {
    try   { return await this.#req("DELETE", `${SECTION_SUBJ}/section/${sectionId}`); }
    catch { return null; }
  }
}

export default new SectionSubjectService();