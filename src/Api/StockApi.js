const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// Get Items List (with pagination, search, filters)
export const getItemsList = async (page = 0, size = 20, searchTerm = "", category = "", status = "") => {
    try {
        const params = new URLSearchParams({
            page,
            size,
            searchTerm,
            category,
            status
        });
        const res = await fetch(`${BASE_URL}/stock/items?${params}`, {
            method: "GET",
            headers: {
                accept: "application/json"
            }
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
        const res = await fetch(`${BASE_URL}/stock/items`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                accept: "application/json"
            },
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
    const res = await fetch(`${BASE_URL}/stock/items/${id}`, {
      method: "GET",
      headers: {
        accept: "application/json"
      }
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
    const res = await fetch(`${BASE_URL}/stock/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
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
    const res = await fetch(`${BASE_URL}/stock/items/${id}/activate`, {
      method: "PATCH",
      headers: {
        accept: "application/json"
      }
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
    const res = await fetch(`${BASE_URL}/stock/items/${id}/deactivate`, {
      method: "PATCH",
      headers: {
        accept: "application/json"
      }
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
    const res = await fetch(`${BASE_URL}/stock/stores/active`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
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
    const res = await fetch(`${BASE_URL}/stock/inward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(payload)
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
    const res = await fetch(`${BASE_URL}/stock/outward`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
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
    const res = await fetch(`${BASE_URL}/stock/transfer`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to transfer stock");

    return await res.json();

  } catch (error) {
    console.error("transferStock error:", error);
    throw error;
  }
};