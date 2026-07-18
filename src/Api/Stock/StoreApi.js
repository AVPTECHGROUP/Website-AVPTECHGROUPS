import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== STORE MANAGEMENT ====================

/** Get paginated list of stores with optional filters */
export const getStockList = async (page = 0, size = 20, searchTerm = "", status = "") => {
  const params = new URLSearchParams({ page, size });
  if (searchTerm) params.append("searchTerm", searchTerm);
  if (status) params.append("status", status);

  const res = await authFetch(`${API_ENDPOINTS.STORES}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Get Stock List Failed");

  const result = await res.json();
  return { stores: result.data, pagination: result.pagination };
};

/** Get high-level stats for all stores */
export const getStoreStats = async () => {
  const res = await authFetch(API_ENDPOINTS.STORES_STATS, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch store stats");
  return (await res.json()).data;
};

/** Create a new store location */
export const createStore = async (storeData) => {
  const res = await authFetch(API_ENDPOINTS.STORES, {
    method: "POST",
    body: JSON.stringify(storeData),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Create new store failed");
  return await res.json();
};

/** Update existing store info */
export const updateStore = async (id, storeData) => {
  const res = await authFetch(API_ENDPOINTS.storeById(id), {
    method: "PUT",
    body: JSON.stringify(storeData),
  });
  if (!res.ok) throw new Error("Failed to update store");
  return await res.json();
};

export const activateStore = async (id) => {
  const res = await authFetch(API_ENDPOINTS.storeActivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to activate store");
  return await res.json();
};

export const deactivateStore = async (id) => {
  const res = await authFetch(API_ENDPOINTS.storeDeactivate(id), { method: "PATCH" });
  if (!res.ok) throw new Error("Failed to deactivate store");
  return await res.json();
};

// ==================== STORE OPERATIONS ====================

/** Fetch currently available stock quantities for a specific store */
export const getStoreStock = async (storeId) => {
  const res = await authFetch(API_ENDPOINTS.storeStock(storeId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch store stock");
  return (await res.json()).data;
};

/** Fetch active stores (commonly used for dropdowns) */
export const getActiveStores = async () => {
  const res = await authFetch(API_ENDPOINTS.STORES_ACTIVE, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch active stores");
  return await res.json();
};