import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Get Stock List
export const getStockList = async (page = 0, size = 20, searchTerm = "", status = "") => {
  try {
    const params = new URLSearchParams({ page, size });
    if (searchTerm) params.append("searchTerm", searchTerm);
    if (status) params.append("status", status);

    const res = await authFetch(`${BASE_URL}/stock/stores?${params}`, {
      method: "GET",
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

// Get Store Stats
export const getStoreStats = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/stores/stats`, {
      method: "GET",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch store stats");
    }

    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("getStoreStats error:", error);
    throw error;
  }
};

// Create new Store
export const createStore = async (storeData) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/stores`, {
      method: "POST",
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
    const res = await authFetch(`${BASE_URL}/stock/stores/${id}`, {
      method: "PUT",
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
    const res = await authFetch(`${BASE_URL}/stock/stores/${id}/activate`, {
      method: "PATCH",
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
    const res = await authFetch(`${BASE_URL}/stock/stores/${id}/deactivate`, {
      method: "PATCH",
    });

    if (!res.ok) throw new Error("Failed to deactivate store");
    return await res.json();
  } catch (error) {
    console.error("DeactivateStore error:", error.message);
    throw error;
  }
};

// Get Stock Levels for a Specific Store
export const getStoreStock = async (storeId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/stores/${storeId}/stock`, {
      method: "GET",
    });

    if (!res.ok) throw new Error("Failed to fetch store stock");

    const result = await res.json();
    return result.data;
  } catch (error) {
    console.error("getStoreStock error:", error.message);
    throw error;
  }
};