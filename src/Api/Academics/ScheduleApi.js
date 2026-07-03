import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ─── Timetable Config ───
export const getTimetableConfig = async (academicYearId = null) => {
    const query = academicYearId ? `?academicYearId=${academicYearId}` : "";
    const res = await authFetch(`${API_ENDPOINTS.TIMETABLE_CONFIG}${query}`, { method: "GET" });

    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch config");
    return (await res.json())?.data;
};

export const saveTimetableConfig = async (configData) => {
    const res = await authFetch(API_ENDPOINTS.TIMETABLE_CONFIG, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(configData),
    });

    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to save config");
    return (await res.json())?.data;
};

// ─── Timetables ───
export const getTimetables = async (page = 0, size = 10, sort = "id", academicYearId = null) => {
    const params = new URLSearchParams({ page, size, sort });
    if (academicYearId) params.append("academicYearId", academicYearId);

    const res = await authFetch(`${API_ENDPOINTS.TIMETABLE}?${params.toString()}`, { method: "GET" });
    if (!res.ok) throw new Error(await res.text() || "Failed to fetch timetables");
    return await res.json();
};

export const createTimetable = async (timetableData) => {
    const res = await authFetch(API_ENDPOINTS.TIMETABLE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timetableData),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to create timetable");
    return (await res.json())?.data;
};

export const getTimetableById = async (id) => {
    const res = await authFetch(API_ENDPOINTS.timetableById(id), { method: "GET" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch timetable");
    return (await res.json())?.data;
};

export const updateTimetable = async (id, timetableData) => {
    const res = await authFetch(API_ENDPOINTS.timetableById(id), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(timetableData),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to update timetable");
    return (await res.json())?.data;
};

export const deleteTimetable = async (id) => {
    const res = await authFetch(API_ENDPOINTS.timetableById(id), { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to delete timetable");
    return await res.json();
};

export const publishTimetable = async (id) => {
    const res = await authFetch(API_ENDPOINTS.timetablePublish(id), { method: "PUT" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to publish timetable");
    return (await res.json())?.data;
};

// ─── Timetable Slots ───
export const getTimetableSlots = async (timetableId) => {
    const res = await authFetch(API_ENDPOINTS.timetableSlots(timetableId), { method: "GET" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch slots");
    return (await res.json())?.data || [];
};

export const saveSlot = async (timetableId, slotData) => {
    const res = await authFetch(API_ENDPOINTS.timetableSlots(timetableId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotData),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to save slot");
    return (await res.json())?.data;
};

export const deleteSlot = async (timetableId, day, period) => {
    const res = await authFetch(API_ENDPOINTS.timetableSlotByDayPeriod(timetableId, day, period), { method: "DELETE" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to delete slot");
    return await res.json();
};

export const getAvailableTeachersForSlot = async (timetableId, day, period, subjectId) => {
    const res = await authFetch(`${API_ENDPOINTS.timetableSlotTeachers(timetableId, day, period)}?subjectId=${subjectId}`, { method: "GET" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch available teachers");
    return (await res.json())?.data;
};

export const autoFillSlots = async (timetableId) => {
    const res = await authFetch(API_ENDPOINTS.timetableAutoFill(timetableId), { method: "POST" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to auto-fill slots");
    return (await res.json())?.data;
};

export const bulkSaveSlots = async (timetableId, slots = []) => {
    const res = await authFetch(API_ENDPOINTS.timetableBulkSave(timetableId), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slots }),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to bulk save slots");
    return (await res.json())?.data || [];
};

// ─── Timetable Substitutions ───
export const getSubstitutions = async (timetableId) => {
    const res = await authFetch(API_ENDPOINTS.timetableSubstitutions(timetableId), { method: "GET" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch substitutions");
    return (await res.json())?.data ?? [];
};

export const createSubstitution = async (timetableId, payload) => {
    const res = await authFetch(API_ENDPOINTS.timetableSubstitutions(timetableId), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to create substitution");
    return (await res.json())?.data ?? null;
};

export const updateSubstitutionStatus = async (timetableId, substitutionId, status) => {
    const allowedStatuses = ["PENDING", "CONFIRMED", "CANCELLED"];
    if (!allowedStatuses.includes(status)) throw new Error(`Invalid status. Allowed: ${allowedStatuses.join(", ")}`);

    const res = await authFetch(`${API_ENDPOINTS.timetableSubstitutionStatus(timetableId, substitutionId)}?status=${encodeURIComponent(status)}`, { method: "PUT" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to update substitution status");
    return (await res.json())?.data ?? null;
};

// ─── Teacher Daily Schedule ───
export const getTeacherSchedule = async (teacherId, date = null) => {
    const params = new URLSearchParams({ teacherId });
    if (date) params.append("date", date);

    const res = await authFetch(`${API_ENDPOINTS.TIMETABLE_TEACHER_SCHEDULE}?${params.toString()}`, { method: "GET" });
    if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || "Failed to fetch teacher schedule");
    return (await res.json())?.data;
};