const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// Get Stock List
export const getStockList = async (page = 0, size = 20, searchTerm = "", status = "") => {
    try {
        const token=localStorage.getItem("token");
        const params = new URLSearchParams({ page, size });
        if (searchTerm) params.append("searchTerm", searchTerm);
        if (status) params.append("status", status);

        const res = await fetch(`${BASE_URL}/stock/stores?${params}`, {
            method: "GET",
            headers: { Accept: "application/json", Authorization:`Bearer ${token}`, },
        });

        if (!res.ok) throw new Error("Get Stock List Failed");

        const result = await res.json();
        return {
            stores: result.data,
            pagination: result.pagination,
        };

    } catch (error) {
        console.error("getStockList error:", error.message);
        throw error;
    }
};

// Create new Store
export const createStore = async (storeData) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/stock/stores`, {
            method: "POST",
            headers: { "Content-Type": "application/json" ,
                Accept:"application/json",
                Authorization:`Bearer ${token},`

            },
            body: JSON.stringify(storeData),
        });

        const data = await res.json();
        console.log("CREATE STORE RESPONSE:", data);

        if (!res.ok) throw new Error(data?.message || "Create new store failed");
        return data;
    } catch (error) {
        console.error("createStore error:", error.message);
        throw error;
    }
};

// Update Store Data
export const updateStore = async (id, storeData) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/stock/stores/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization:`Bearer ${token}`,
            },
            body: JSON.stringify(storeData),
        });

        if (!res.ok) throw new Error("Failed to update store");
        return await res.json();
    } catch (error) {
        console.error("UpdateStore error:", error.message);
        throw error;
    }
};

// Activate Store
export const activateStore = async (id) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/stock/stores/${id}/activate`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization:`Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to activate store");
        return await res.json();
    } catch (error) {
        console.error("ActivateStore error:", error.message);
        throw error;
    }
};

// Deactivate Store
export const deactivateStore = async (id) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/stock/stores/${id}/deactivate`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
                Authorization:`Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Failed to deactivate store");
        return await res.json();
    } catch (error) {
        console.error("DeactivateStore error:", error.message);
        throw error;
    }
};