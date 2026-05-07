import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_DOUBLE_V1;

// ─────────────────────────────────────────────
// TIMETABLE CONFIG
// ─────────────────────────────────────────────

// Get timetable config for an academic year (defaults to current year)
export const getTimetableConfig = async (academicYearId = null) => {
    try {
        const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
        const res = await authFetch(`${BASE_URL}/timetable/config${query}`, {
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to fetch timetable config");
        }
        return data?.data;
    } catch (error) {
        console.error("getTimetableConfig error:", error.message);
        throw error;
    }
};

// Create or update timetable configuration
export const saveTimetableConfig = async (configData) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/config`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(configData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to save timetable config");
        }
        return data?.data;
    } catch (error) {
        console.error("saveTimetableConfig error:", error.message);
        throw error;
    }
};

// ─────────────────────────────────────────────
// TIMETABLES
// ─────────────────────────────────────────────

// List timetables (paginated, optionally filtered by academic year)
export const getTimetables = async (
    page = 0,
    size = 10,
    sort = "id",
    academicYearId = null
) => {
    try {
        const params = new URLSearchParams({ page, size, sort });
        if (academicYearId) params.append("academicYearId", academicYearId);

        const res = await authFetch(`${BASE_URL}/timetable?${params.toString()}`, {
            method: "GET",
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch timetables");
        }
        return await res.json();
    } catch (error) {
        console.error("getTimetables error:", error.message);
        throw error;
    }
};

// Create a new timetable (DRAFT)
export const createTimetable = async (timetableData) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timetableData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to create timetable");
        }
        return data?.data;
    } catch (error) {
        console.error("createTimetable error:", error.message);
        throw error;
    }
};

// Get timetable by ID
export const getTimetableById = async (id) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${id}`, {
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to fetch timetable");
        }
        return data?.data;
    } catch (error) {
        console.error("getTimetableById error:", error.message);
        throw error;
    }
};

// Update timetable notes
export const updateTimetable = async (id, timetableData) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(timetableData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to update timetable");
        }
        return data?.data;
    } catch (error) {
        console.error("updateTimetable error:", error.message);
        throw error;
    }
};

// Delete a timetable and all its slots
export const deleteTimetable = async (id) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${id}`, {
            method: "DELETE",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to delete timetable");
        }
        return data;
    } catch (error) {
        console.error("deleteTimetable error:", error.message);
        throw error;
    }
};

// Publish a DRAFT timetable
export const publishTimetable = async (id) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${id}/publish`, {
            method: "PUT",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to publish timetable");
        }
        return data?.data;
    } catch (error) {
        console.error("publishTimetable error:", error.message);
        throw error;
    }
};

// ─────────────────────────────────────────────
// TIMETABLE SLOTS
// ─────────────────────────────────────────────

// Get all slots for a timetable (full grid)
export const getTimetableSlots = async (timetableId) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${timetableId}/slots`, {
            method: "GET",
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to fetch timetable slots");
        }
        return data?.data || [];
    } catch (error) {
        console.error("getTimetableSlots error:", error.message);
        throw error;
    }
};

// Add or update a single slot (with teacher conflict check)
export const saveSlot = async (timetableId, slotData) => {
    try {
        const res = await authFetch(`${BASE_URL}/timetable/${timetableId}/slots`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(slotData),
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to save slot");
        }
        return data?.data;
    } catch (error) {
        console.error("saveSlot error:", error.message);
        throw error;
    }
};

// Remove a single slot by day and period number
export const deleteSlot = async (timetableId, day, period) => {
    try {
        const res = await authFetch(
            `${BASE_URL}/timetable/${timetableId}/slots/${day}/${period}`,
            { method: "DELETE" }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to delete slot");
        }
        return data;
    } catch (error) {
        console.error("deleteSlot error:", error.message);
        throw error;
    }
};

// Get available and busy teachers for a specific day+period cell
export const getAvailableTeachersForSlot = async (
    timetableId,
    day,
    period,
    subjectId
) => {
    try {
        const res = await authFetch(
            `${BASE_URL}/timetable/${timetableId}/slots/${day}/${period}/teachers?subjectId=${subjectId}`,
            { method: "GET" }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to fetch available teachers");
        }
        return data?.data;
    } catch (error) {
        console.error("getAvailableTeachersForSlot error:", error.message);
        throw error;
    }
};

// Auto-fill empty slots using coverage-ratio algorithm
export const autoFillSlots = async (timetableId) => {
    try {
        const res = await authFetch(
            `${BASE_URL}/timetable/${timetableId}/slots/auto-fill`,
            { method: "POST" }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to auto-fill slots");
        }
        return data?.data;
    } catch (error) {
        console.error("autoFillSlots error:", error.message);
        throw error;
    }
};

// Bulk-save all slots (replaces existing, validates all conflicts)
export const bulkSaveSlots = async (timetableId, slots = []) => {
    try {
        const res = await authFetch(
            `${BASE_URL}/timetable/${timetableId}/slots/bulk`,
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ slots }),
            }
        );
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.message || "Failed to bulk save slots");
        }
        return data?.data || [];
    } catch (error) {
        console.error("bulkSaveSlots error:", error.message);
        throw error;
    }
};