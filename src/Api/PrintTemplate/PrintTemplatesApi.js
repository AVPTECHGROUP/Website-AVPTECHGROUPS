import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// ─── Print Templates ───────────────────────────────────────────────────────

export const getPrintTemplates = async (type = null) => {
    const query = type ? `?type=${encodeURIComponent(type)}` : "";

    const res = await authFetch(`${API_ENDPOINTS.PRINT_TEMPLATES}${query}`, {
        method: "GET",
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to fetch print templates"
        );

    return (await res.json())?.data || [];
};

export const createPrintTemplate = async (templateData) => {
    const res = await authFetch(API_ENDPOINTS.PRINT_TEMPLATES, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to create print template"
        );

    return (await res.json())?.data;
};

export const getPrintTemplateById = async (id) => {
    const res = await authFetch(API_ENDPOINTS.printTemplateById(id), {
        method: "GET",
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to fetch print template"
        );

    return (await res.json())?.data;
};

export const updatePrintTemplate = async (id, templateData) => {
    const res = await authFetch(API_ENDPOINTS.printTemplateById(id), {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(templateData),
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to update print template"
        );

    return (await res.json())?.data;
};

export const deletePrintTemplate = async (id) => {
    const res = await authFetch(API_ENDPOINTS.printTemplateById(id), {
        method: "DELETE",
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to delete print template"
        );

    return await res.json();
};

export const setDefaultPrintTemplate = async (id) => {
    const res = await authFetch(API_ENDPOINTS.printTemplateSetDefault(id), {
        method: "PATCH",
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to set default print template"
        );

    return (await res.json())?.data;
};

export const getDefaultPrintTemplate = async (type) => {
    const res = await authFetch(API_ENDPOINTS.printTemplateDefault(type), {
        method: "GET",
    });

    if (!res.ok)
        throw new Error(
            (await res.json().catch(() => ({}))).message ||
            "Failed to fetch default print template"
        );

    return (await res.json())?.data;
};
