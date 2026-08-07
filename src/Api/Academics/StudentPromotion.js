import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/** Extracts backend error messages reliably */
const extractError = async (res, fallback) => {
    try {
        const body = await res.clone().json();
        return body?.message || body?.error || fallback;
    } catch {
        try {
            return (await res.text()) || fallback;
        } catch {
            return fallback;
        }
    }
};

// ==================== Student Promotion ====================

export const getEligibleStudentsForPromotion = async (classId, sectionId = null) => {
    const queryParams = new URLSearchParams({ classId });
    if (sectionId) {
        queryParams.append("sectionId", sectionId);
    }

    const res = await authFetch(`${API_ENDPOINTS.STUDENT_PROMOTION_ELIGIBLE}?${queryParams.toString()}`, {
        method: "GET"
    });

    if (!res.ok) throw new Error(await extractError(res, "Failed to load eligible students"));

    const data = await res.json();
    return data?.data || [];
};

export const previewStudentPromotion = async (promotionData) => {
    const res = await authFetch(API_ENDPOINTS.STUDENT_PROMOTION_PREVIEW, {
        method: "POST",
        body: JSON.stringify(promotionData),
    });

    if (!res.ok) throw new Error(await extractError(res, "Failed to preview promotion"));

    const data = await res.json();
    return data?.data || {};
};

export const executeStudentPromotion = async (promotionData) => {
    const res = await authFetch(API_ENDPOINTS.STUDENT_PROMOTION_EXECUTE, {
        method: "POST",
        body: JSON.stringify(promotionData),
    });

    if (!res.ok) throw new Error(await extractError(res, "Failed to execute promotion"));

    const data = await res.json();
    return data?.data || {};
};

export const getStudentPromotionHistory = async (studentId) => {
    const res = await authFetch(API_ENDPOINTS.studentPromotionHistory(studentId), {
        method: "GET"
    });

    if (!res.ok) throw new Error(await extractError(res, "Failed to fetch student promotion history"));

    const data = await res.json();
    return data?.data || [];
};