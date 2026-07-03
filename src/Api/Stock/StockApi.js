import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== INVENTORY ITEMS ====================

/** Get a paginated list of items with optional filters */
export const getStockItems = async ({ searchTerm = "", category = "", status = "" } = {}, page = 0, size = 500) => {
  const params = new URLSearchParams({ page, size });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (category) params.append("category", category);
  if (status) params.append("status", status);

  const res = await authFetch(`${API_ENDPOINTS.STOCK_ITEMS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stock items");

  const data = await res.json();
  return { items: data.data || [], pagination: data.pagination || {} };
};

export const createItem = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.STOCK_ITEMS, { method: "POST", body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to create item");
  return await res.json();
};

export const getItemById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.stockItemById(id), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch item");
  return await res.json();
};

export const updateItem = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.stockItemById(id), { method: "PUT", body: JSON.stringify(payload) });
  if (!res.ok) throw new Error("Failed to update item");
  return await res.json();
};

export const activateItem = async (id) => {
  const res = await authFetch(API_ENDPOINTS.stockItemActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate item");
  return await res.json();
};

export const deactivateItem = async (id) => {
  const res = await authFetch(API_ENDPOINTS.stockItemDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate item");
  return await res.json();
};

// ==================== STOCK TRANSACTIONS ====================

/** Process incoming stock */
export const addStockInward = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.STOCK_INWARD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to add inward stock");
  return await res.json();
};

/** Process outgoing stock */
export const removeStockOutward = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.STOCK_OUTWARD, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to remove stock");
  return await res.json();
};

/** Move stock between warehouses/stores */
export const transferStock = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.STOCK_TRANSFER, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to transfer stock");
  return await res.json();
};

// ==================== AUDIT & REPORTING ====================

/** Get the ledger of all stock movement events */
export const getStockMovementHistory = async (filters = {}, page = 0, size = 20) => {
  const res = await authFetch(`${API_ENDPOINTS.STOCK_MOVEMENTS_HISTORY}?page=${page}&size=${size}`, {
    method: "POST",
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stock movement history");

  const data = await res.json();
  return { movements: data.data || [], pagination: data.pagination || {} };
};

/** Identify items nearing depletion */
export const getLowStockItems = async (storeId = "") => {
  const url = storeId ? `${API_ENDPOINTS.STOCK_LOW_STOCK}?storeId=${storeId}` : API_ENDPOINTS.STOCK_LOW_STOCK;
  const res = await authFetch(url, { method: "GET" });

  if (!res.ok) throw new Error("Failed to fetch low stock items");
  return { items: (await res.json()).data || [] };
};

/** See distribution of a single item across all stores */
export const getItemStockOverview = async (itemId) => {
  const res = await authFetch(API_ENDPOINTS.stockItemOverview(itemId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch item stock overview");

  const data = await res.json();
  return { item: data.data || {}, storeBreakdown: data.data?.storeBreakdown || [] };
};

// Get Items List (with pagination, search, filters)
export const getItemsList = async (page = 0, size = 500, searchTerm = "", category = "", status = "") => {
  try {
    const params = new URLSearchParams({ page, size, searchTerm, category, status });
    const res = await authFetch(`${API_ENDPOINTS.STOCK_ITEMS}?${params}`, {
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

/** Fetch aggregated stock status across the network */
export const getStockOverview = async (filters = {}, page = 0, size = 10, sort = "id,desc") => {
  const res = await authFetch(API_ENDPOINTS.STOCK_OVERVIEW, {
    method: "POST",
    body: JSON.stringify({
      filter: filters,
      pageable: { page, size, sort: [sort] },
      filterOrDefault: filters
    })
  });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stock overview");

  const data = await res.json();
  return { items: data.data || [], pagination: data.pagination || {} };
};

// ==================== DASHBOARD STATS ====================

export const getStockOverviewStats = async (storeId = null) => {
  const url = storeId ? `${API_ENDPOINTS.STOCK_OVERVIEW_STATS}?storeId=${storeId}` : API_ENDPOINTS.STOCK_OVERVIEW_STATS;
  const res = await authFetch(url, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stock overview stats");
  return (await res.json()).data || {};
};

export const getStockItemsStats = async () => {
  const res = await authFetch(API_ENDPOINTS.STOCK_ITEMS_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch stock items stats");
  return (await res.json()).data || {};
};

export const getStockMovementStats = async (filters = {}) => {
  const res = await authFetch(API_ENDPOINTS.STOCK_MOVEMENTS_STATS, {
    method: "POST",
    body: JSON.stringify(filters),
  });
  if (!res.ok) throw new Error("Failed to fetch stock movement stats");
  return (await res.json()).data;
};