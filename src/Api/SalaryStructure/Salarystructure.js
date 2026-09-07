import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// The /salary-structures/all (and /salary-structures) list endpoints return
// userType upper case, e.g. "TEACHER" — but the by-user endpoints
// (GET/POST/PUT/DELETE .../users/{userId}?userType=...) expect title case,
// e.g. "Teacher", and 404 on "TEACHER". Every by-user call below runs the
// userType through this before building the query string so callers can just
// pass whatever casing they got from the list endpoint.
const toUserTypeParam = (userType) =>
    typeof userType === "string" && userType.length > 0
        ? userType.charAt(0).toUpperCase() + userType.slice(1).toLowerCase()
        : userType;

export const getSalaryStructures = async (
    page = 0,
    size = 10,
    sort = ""
) => {
    const params = new URLSearchParams({
        page,
        size,
        sort,
    });

    const res = await authFetch(
        `${API_ENDPOINTS.SALARY_STRUCTURES}?${params.toString()}`,
        {
            method: "GET",
        }
    );

    if (!res.ok) {
        throw new Error(
            (await res.text()) || "Failed to fetch salary structures"
        );
    }

    return await res.json();
};

export const getAllSalaryStructures = async (
    page = 0,
    size = 10,
    sort = ""
) => {
    const params = new URLSearchParams({
        page,
        size,
        sort,
    });

    const res = await authFetch(
        `${API_ENDPOINTS.SALARY_STRUCTURES_ALL}?${params.toString()}`,
        {
            method: "GET",
        }
    );

    if (!res.ok) {
        throw new Error(
            (await res.text()) || "Failed to fetch all salary structures"
        );
    }

    return await res.json();
};

export const createSalaryStructuresBulk = async (salaryStructures) => {
    const res = await authFetch(API_ENDPOINTS.SALARY_STRUCTURES_BULK, {
        method: "POST",
        body: JSON.stringify(salaryStructures),
    });

    const text = await res.text();

    if (!res.ok) {
        throw new Error(
            text || "Failed to create salary structures in bulk"
        );
    }

    return text ? JSON.parse(text) : {};
};

export const getSalaryStructureByUser = async (
    userId,
    userType
) => {
    const params = new URLSearchParams({
        userType: toUserTypeParam(userType),
    });

    const res = await authFetch(
        `${API_ENDPOINTS.salaryStructureByUser(userId)}?${params.toString()}`,
        {
            method: "GET",
        }
    );

    if (!res.ok) {
        throw new Error(
            (await res.text()) || "Failed to fetch salary structure"
        );
    }

    return await res.json();
};

export const updateSalaryStructureByUser = async (
    userId,
    userType,
    salaryStructureData
) => {
    const params = new URLSearchParams({
        userType: toUserTypeParam(userType),
    });

    const res = await authFetch(
        `${API_ENDPOINTS.salaryStructureByUser(userId)}?${params.toString()}`,
        {
            method: "PUT",
            body: JSON.stringify(salaryStructureData),
        }
    );

    const text = await res.text();

    if (!res.ok) {
        throw new Error(
            text || "Failed to update salary structure"
        );
    }

    return text ? JSON.parse(text) : {};
};

export const createSalaryStructureByUser = async (
    userId,
    userType,
    salaryStructureData
) => {
    const params = new URLSearchParams({
        userType: toUserTypeParam(userType),
    });

    const res = await authFetch(
        `${API_ENDPOINTS.salaryStructureByUser(userId)}?${params.toString()}`,
        {
            method: "POST",
            body: JSON.stringify(salaryStructureData),
        }
    );

    const text = await res.text();

    if (!res.ok) {
        throw new Error(
            text || "Failed to create salary structure"
        );
    }

    return text ? JSON.parse(text) : {};
};

export const deleteSalaryStructureByUser = async (
    userId,
    userType
) => {
    const params = new URLSearchParams({
        userType: toUserTypeParam(userType),
    });

    const res = await authFetch(
        `${API_ENDPOINTS.salaryStructureByUser(userId)}?${params.toString()}`,
        {
            method: "DELETE",
        }
    );

    const text = await res.text();

    if (!res.ok) {
        throw new Error(
            text || "Failed to delete salary structure"
        );
    }

    return text ? JSON.parse(text) : {};
};