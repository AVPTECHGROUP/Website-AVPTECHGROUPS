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

// Paginated + Search + Category + Status filter

export const getStockItems = async (
  { searchTerm = "", category = "", status = "" } = {},
  page = 0,
  size = 20
) => {
  try {

    let query = `page=${page}&size=${size}`;

    if (searchTerm) {
      query += `&searchTerm=${encodeURIComponent(searchTerm)}`;
    }

    if (category) {
      query += `&category=${encodeURIComponent(category)}`;
    }

    if (status) {
      query += `&status=${status}`;
    }

    const res = await authFetch(`${BASE_URL}/stock/items?${query}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch stock items");
    }

    const data = await res.json();

    return {
      items: data.data || [],
      pagination: data.pagination || {},
    };

  } catch (error) {
    console.error("getStockItems error:", error.message);
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json(); // 👈 response read karo

    if (!res.ok) {
      throw new Error(data?.message || "Failed to transfer stock");
    }

    return data;
  } catch (error) {
    console.error("transferStock error:", error);
    throw error;
  }
};
// Get Stock Movement History (Audit Trail)

export const getStockMovementHistory = async (
  filters = {},
  page = 0,
  size = 20
) => {
  try {

    const res = await authFetch(
      `${BASE_URL}/stock/movements/history?page=${page}&size=${size}`,
      {
        method: "POST",
        body: JSON.stringify(filters),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch stock movement history");
    }

    const data = await res.json();

    return {
      movements: data.data || [],
      pagination: data.pagination || {},
    };

  } catch (error) {
    console.error("getStockMovementHistory error:", error.message);
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
// List stock aggregated by item across all active stores (POST)

export const getStockOverview = async (
  filters = {},
  page = 0,
  size = 10,
  sort = "id,desc"
) => {
  try {

    const res = await authFetch(`${BASE_URL}/stock/overview`, {
      method: "POST",
      body: JSON.stringify({
        filter: filters,
        pageable: {
          page: page,
          size: size,
          sort: [sort]
        },
        filterOrDefault: filters
      })
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch stock overview");
    }

    const data = await res.json();

    return {
      items: data.data || [],
      pagination: data.pagination || {}
    };

  } catch (error) {
    console.error("getStockOverview error:", error.message);
    throw error;
  }
};

// get overall stats...

export const getStockOverviewStats = async (storeId = null) => {
  try {

    let url = `${BASE_URL}/stock/overview/stats`;

    if (storeId) {
      url += `?storeId=${storeId}`;
    }

    const res = await authFetch(url, {
      method: "GET"
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch stock overview stats");
    }

    const data = await res.json();

    return data.data || {};

  } catch (error) {
    console.error("getStockOverviewStats error:", error.message);
    throw error;
  }
};

// Total Items | Active | Inactive | Categories | Low Stock Alerts
// ===============================

export const getStockItemsStats = async () => {
  try {

    const res = await authFetch(`${BASE_URL}/stock/items/stats`, {
      method: "GET"
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch stock items stats");
    }

    const data = await res.json();

    return data.data || {};

  } catch (error) {
    console.error("getStockItemsStats error:", error.message);
    throw error;
  }
};
