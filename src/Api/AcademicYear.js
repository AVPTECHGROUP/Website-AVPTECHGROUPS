import { authFetch } from "../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../Constants/Endpoints";

// ==============================
// Get All Academic Years
// ==============================
export const getAcademicYears = async () => {
    try {
        const res = await authFetch(
            API_ENDPOINTS.ACADEMIC_YEARS,
            {
                method: "GET",
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch academic years");
        }

        const data = await res.json();

        return {
            years: data.data || [],
        };
    } catch (error) {
        console.error("getAcademicYears error:", error);
        throw error;
    }
};

// ==============================
// Get Current Academic Year
// ==============================
export const getCurrentAcademicYear = async () => {
    try {
        const res = await authFetch(
            API_ENDPOINTS.CURRENT_ACADEMIC_YEAR,
            {
                method: "GET",
            }
        );

        if (!res.ok) {
            const errorText = await res.text();

            throw new Error(
                errorText || "Failed to fetch current academic year"
            );
        }

        const raw = await res.json();

        console.log(
            "📦 getCurrentAcademicYear raw response:",
            raw
        );

        const ay =
            raw?.data?.academicYear ||
            raw?.data ||
            raw?.academicYear ||
            raw;

        console.log(
            "✅ Resolved academic year:",
            ay
        );

        return ay || {};
    } catch (error) {
        console.error(
            "❌ getCurrentAcademicYear error:",
            error.message
        );
        throw error;
    }
};

// ==============================
// Get Academic Year By ID
// ==============================
export const getAcademicYearById = async (id) => {
    try {
        const res = await authFetch(
            API_ENDPOINTS.academicYearById(id),
            {
                method: "GET",
            }
        );

        if (!res.ok) {
            throw new Error("Failed to fetch academic year");
        }

        return await res.json();
    } catch (error) {
        console.error(
            "getAcademicYearById error:",
            error
        );
        throw error;
    }
};

// ==============================
// Create Academic Year
// ==============================
export const createAcademicYear = async (
    payload
) => {
    try {
        const res = await authFetch(
            API_ENDPOINTS.ACADEMIC_YEARS,
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(
                data?.message ||
                "Failed to create academic year"
            );
        }

        return data;
    } catch (error) {
        console.error(
            "createAcademicYear error:",
            error
        );
        throw error;
    }
};

// ==============================
// Set Current Academic Year
// ==============================
export const setCurrentAcademicYear =
    async (id) => {
        try {
            const res = await authFetch(
                API_ENDPOINTS.setCurrentAcademicYear(
                    id
                ),
                {
                    method: "PUT",
                }
            );

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data?.message ||
                    "Failed to set current academic year"
                );
            }

            return data;
        } catch (error) {
            console.error(
                "setCurrentAcademicYear error:",
                error
            );
            throw error;
        }
    };

// ==============================
// Close Academic Year
// ==============================
export const closeAcademicYear = async (
    id
) => {
    try {
        const res = await authFetch(
            API_ENDPOINTS.closeAcademicYear(id),
            {
                method: "PUT",
            }
        );

        const data = await res.json();

        if (!res.ok) {
            throw new Error(
                data?.message ||
                "Failed to close academic year"
            );
        }

        return data;
    } catch (error) {
        console.error(
            "closeAcademicYear error:",
            error
        );
        throw error;
    }
};