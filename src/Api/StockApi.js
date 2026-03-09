import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// Get Items List (with pagination, search, filters)
export const getItemsList = async (page = 0, size = 20, searchTerm = "", category = "", status = "") => {
  try {
    const params = new URLSearchParams({ page, size, searchTerm, category, status });
    const res = await authFetch(`${BASE_URL}/stock/items?${params}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch items");

    const data = await res.json();
    return {
      items: data.data || [],
      pagination: data.pagination || {}
    };
  } catch (error) {
    console.error("getItemsList error:", error);
    throw error;
  }
};

// Create Item
export const createItem = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to create item");
    return await res.json();
  } catch (error) {
    console.error("createItem error:", error);
    throw error;
  }
};

// Get Item By ID
export const getItemById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items/${id}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch item");
    return await res.json();
  } catch (error) {
    console.error("getItemById error:", error);
    throw error;
  }
};

// Update Item
export const updateItem = async (id, payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to update item");
    return await res.json();
  } catch (error) {
    console.error("updateItem error:", error);
    throw error;
  }
};

// Activate Item
export const activateItem = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items/${id}/activate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to activate item");
    return await res.json();
  } catch (error) {
    console.error("activateItem error:", error);
    throw error;
  }
};

// Deactivate Item
export const deactivateItem = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items/${id}/deactivate`, {
      method: "PATCH",
    });
    if (!res.ok) throw new Error("Failed to deactivate item");
    return await res.json();
  } catch (error) {
    console.error("deactivateItem error:", error);
    throw error;
  }
};

// Get All Active Stores (for dropdown)
export const getActiveStores = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/stores/active`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch active stores");
    return await res.json();
  } catch (error) {
    console.error("getActiveStores error:", error.message);
    throw error;
  }
};

// Add Stock (Inward)
export const addStockInward = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/inward`, {
      method: "POST",
      body: JSON.stringify(payload)    // ✅ fixed: was `Bearer ${token},` with trailing comma
    });
    if (!res.ok) throw new Error("Failed to add inward stock");
    return await res.json();
  } catch (error) {
    console.error("addStockInward error:", error);
    throw error;
  }
};

// Remove Stock (Outward)
export const removeStockOutward = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/outward`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to remove stock");
    return await res.json();
  } catch (error) {
    console.error("removeStockOutward error:", error);
    throw error;
  }
};

// Transfer Stock Between Stores
export const transferStock = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/transfer`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error("Failed to transfer stock");
    return await res.json();
  } catch (error) {
    console.error("transferStock error:", error);
    throw error;
  }
};

// Get Stock Movement History (Audit Trail)
export const getStockMovementHistory = async (
  page = 0,
  size = 20,
  itemId = "",
  storeId = "",
  movementType = "",
  fromDate = "",
  toDate = "",
  searchTerm = ""
) => {
  try {
    const params = new URLSearchParams({ page, size });
    const res = await authFetch(`${BASE_URL}/stock/movements/history?${params}`, {
      method: "POST",
      body: JSON.stringify({ itemId, storeId, movementType, fromDate, toDate, searchTerm })
    });
    if (!res.ok) throw new Error("Failed to fetch stock movement history");

    const data = await res.json();
    return {
      movements: data.data || [],
      pagination: data.pagination || {}
    };
  } catch (error) {
    console.error("getStockMovementHistory error:", error);
    throw error;
  }
};

// Get Low Stock Items (optional store filter)
export const getLowStockItems = async (storeId = "") => {
  try {
    const url = storeId
      ? `${BASE_URL}/stock/low-stock?storeId=${storeId}`
      : `${BASE_URL}/stock/low-stock`;

    const res = await authFetch(url, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch low stock items");

    const data = await res.json();
    return { items: data.data || [] };
  } catch (error) {
    console.error("getLowStockItems error:", error);
    throw error;
  }
};

// Get Item Stock Overview (all stores)
export const getItemStockOverview = async (itemId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/items/${itemId}/overview`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch item stock overview");

    const data = await res.json();
    return {
      item: data.data || {},
      storeBreakdown: data.data?.storeBreakdown || []
    };
  } catch (error) {
    console.error("getItemStockOverview error:", error);
    throw error;
  }
};