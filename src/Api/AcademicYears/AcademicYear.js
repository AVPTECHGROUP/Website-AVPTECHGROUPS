import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

/**
 * Fetches all academic years.
 * @returns {Promise<Array>} List of academic years
 */
export const getAcademicYears = async () => {
    try {
        const res = await authFetch(API_ENDPOINTS.ACADEMIC_YEARS, { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch academic years");

        const data = await res.json();
        return data.data || [];
    } catch (error) {
        console.error("getAcademicYears error:", error.message);
        throw error;
    }
};

/**
 * Fetches the current active academic year.
 * @returns {Promise<Object>} Current academic year object
 */
export const getCurrentAcademicYear = async () => {
    try {
        const res = await authFetch(API_ENDPOINTS.CURRENT_ACADEMIC_YEAR, { method: "GET" });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch current academic year");
        }

        const raw = await res.json();
        // Resolve nested data structures if necessary
        const ay = raw?.data?.academicYear || raw?.data || raw?.academicYear || raw;
        return ay || {};
    } catch (error) {
        console.error("getCurrentAcademicYear error:", error.message);
        throw error;
    }
};

/**
 * Fetches a specific academic year by ID.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const getAcademicYearById = async (id) => {
    try {
        const res = await authFetch(API_ENDPOINTS.academicYearById(id), { method: "GET" });
        if (!res.ok) throw new Error("Failed to fetch academic year");
        return await res.json();
    } catch (error) {
        console.error("getAcademicYearById error:", error.message);
        throw error;
    }
};

/**
 * Creates a new academic year.
 * @param {Object} payload 
 * @returns {Promise<Object>}
 */
export const createAcademicYear = async (payload) => {
    try {
        const res = await authFetch(API_ENDPOINTS.ACADEMIC_YEARS, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to create academic year");
        return data;
    } catch (error) {
        console.error("createAcademicYear error:", error.message);
        throw error;
    }
};

/**
 * Sets a specific academic year as the current active one.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const setCurrentAcademicYear = async (id) => {
    try {
        const res = await authFetch(API_ENDPOINTS.setCurrentAcademicYear(id), { method: "PUT" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to set current academic year");
        return data;
    } catch (error) {
        console.error("setCurrentAcademicYear error:", error.message);
        throw error;
    }
};

/**
 * Closes an existing academic year.
 * @param {string|number} id 
 * @returns {Promise<Object>}
 */
export const closeAcademicYear = async (id) => {
    try {
        const res = await authFetch(API_ENDPOINTS.closeAcademicYear(id), { method: "PUT" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.message || "Failed to close academic year");
        return data;
    } catch (error) {
        console.error("closeAcademicYear error:", error.message);
        throw error;
    }
};