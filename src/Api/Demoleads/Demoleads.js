import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

export const getLeadStats = async () => {
    try {
        const res = await authFetch(API_ENDPOINTS.LEAD_STATS, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error(`Lead Stats API Failed: ${res.status}`);
        }

        return (await res.json()).data;
    } catch (error) {
        console.error("Lead Stats Error:", error);
        throw error;
    }
};

export const getLeads = async ({
                                   status,
                                   search,
                                   page = 0,
                                   size = 20,
                               } = {}) => {
    try {
        const params = new URLSearchParams();

        if (status) params.append("status", status);
        if (search) params.append("search", search);

        params.append("page", page);
        params.append("size", size);

        const res = await authFetch(`${API_ENDPOINTS.LEADS}?${params.toString()}`, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error(`Leads API Failed: ${res.status}`);
        }

        return (await res.json()).data;
    } catch (error) {
        console.error("Get Leads Error:", error);
        throw error;
    }
};

export const getLeadById = async (id) => {
    try {
        const res = await authFetch(`${API_ENDPOINTS.LEADS}/${id}`, {
            method: "GET",
        });

        if (!res.ok) {
            throw new Error(`Get Lead API Failed: ${res.status}`);
        }

        return (await res.json()).data;
    } catch (error) {
        console.error("Get Lead By ID Error:", error);
        throw error;
    }
};

export const updateLead = async (id, payload) => {
    try {
        const res = await authFetch(`${API_ENDPOINTS.LEADS}/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            throw new Error(`Update Lead API Failed: ${res.status}`);
        }

        return (await res.json()).data;
    } catch (error) {
        console.error("Update Lead Error:", error);
        throw error;
    }
};