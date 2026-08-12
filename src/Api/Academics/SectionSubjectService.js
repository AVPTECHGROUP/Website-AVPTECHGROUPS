import { authFetch } from "../../Authfetch/Authfetch";
import { toast } from "react-toastify";
import { getCurrUserDetails } from "../../utils/getCurrUserDetails/GetCurrUserDetails";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/** * Safely extracts an array from various common API response wrappers.
 */
const toArray = (json) => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.records)) return json.data.records;
  if (Array.isArray(json?.records)) return json.records;
  if (Array.isArray(json?.items)) return json.items;
  return [];
};

class SectionSubjectService {
  /**
   * Internal request handler with automated toast notifications.
   * @param {boolean} silent - If true, suppresses success toasts (useful for GET requests).
   */
  async #req(method, url, body = null, silent = false) {
    const res = await authFetch(url, {
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

  /**
   * Tries a primary URL, falls back to a secondary URL if the first fails.
   */
  async #reqWithFallback(method, primaryUrl, fallbackUrl = null, body = null, silent = true) {
    try {
      return await this.#req(method, primaryUrl, body, silent);
    } catch (err) {
      if (!fallbackUrl) throw err;
      return this.#req(method, fallbackUrl, body, silent);
    }
  }

  // ==================== READ OPERATIONS ====================

  /** Fetches all classes available to the current user's school. */
  async getAllClasses() {
    try {
      const { schoolId } = getCurrUserDetails() ?? {};
      const url = schoolId ? API_ENDPOINTS.classesBySchool(schoolId) : API_ENDPOINTS.CLASSES;
      const json = await this.#reqWithFallback("GET", url, null, null, true);
      return toArray(json);
    } catch { return []; }
  }

  /** Fetches only active classes for the current school. */
  async getActiveClasses() {
    try {
      const { schoolId } = getCurrUserDetails() ?? {};
      if (!schoolId) return [];

      const json = await this.#req("GET", API_ENDPOINTS.activeClassesBySchool(schoolId), null, true);
      return toArray(json);
    } catch { return []; }
  }

  /** Fetches sections belonging to a specific class. */
  async getSectionsByClass(classId) {
    try {
      const json = await this.#reqWithFallback(
        "GET",
        API_ENDPOINTS.sectionsByClass(classId),
        `${API_ENDPOINTS.classById(classId)}/sections`, // Legacy fallback
        null,
        true
      );
      return toArray(json);
    } catch { return []; }
  }

  /** Fetches all subjects in the system. */
  async getAllSubjects() {
    try {
      // Assuming SUBJECT_BASE is used here natively
      const json = await this.#req("GET", `${import.meta.env.VITE_API_BASE_V1}/subjects`, null, true);
      return toArray(json);
    } catch { return []; }
  }

  /** Fetches all subjects explicitly assigned to a section. */
  async getSubjectsBySection(sectionId) {
    try {
      const json = await this.#req("GET", API_ENDPOINTS.sectionSubjectsBySection(sectionId), null, true);
      return toArray(json);
    } catch { return []; }
  }

  /** Fetches only the ACTIVE subjects assigned to a section. */
  async getActiveSubjectsBySection(sectionId) {
    try {
      const json = await this.#reqWithFallback(
        "GET",
        API_ENDPOINTS.activeSectionSubjects(sectionId),
        `${API_ENDPOINTS.sectionById(sectionId)}/subjects`, // Legacy fallback
        null,
        true
      );
      return toArray(json);
    } catch { return []; }
  }

  // ==================== WRITE OPERATIONS ====================

  /**
   * Assigns multiple subjects to a section.
   * @param {Object} payload - { sectionId, subjects: [{ subjectId, weeklyHours, isMandatory, status }] }
   */
  async assignSubjects(payload) {
    try { return await this.#req("POST", API_ENDPOINTS.SECTION_SUBJECTS_ASSIGN, payload); }
    catch { return null; }
  }

  /** Updates an existing section-subject assignment configuration. */
  async updateAssignment(id, payload) {
    try { return await this.#req("PUT", API_ENDPOINTS.sectionSubjectById(id), payload); }
    catch { return null; }
  }

  /** Removes a specific subject from a section. */
  async removeSubject(sectionId, subjectId) {
    try { return await this.#req("DELETE", API_ENDPOINTS.sectionSubjectRemove(sectionId, subjectId)); }
    catch { return null; }
  }

  /** Clears all subjects from a section. */
  async removeAllSubjects(sectionId) {
    try { return await this.#req("DELETE", API_ENDPOINTS.sectionSubjectsBySection(sectionId)); }
    catch { return null; }
  }
}

export default new SectionSubjectService();