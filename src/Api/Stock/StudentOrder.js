import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== ORDER MANAGEMENT ====================

/** Retrieve high-level statistics regarding all student orders */
export const getOrderStats = async () => {
  const response = await authFetch(API_ENDPOINTS.ORDERS_STATS, { method: "GET" });
  if (!response.ok) throw new Error("Failed to fetch order stats");
  return response.json();
};

/** Fetch orders with pagination and comprehensive filtering options */
export const getStudentOrders = async ({
  page = 0, size = 20, studentId, classId, storeId, itemId, status, fromDate, toDate, searchTerm
} = {}) => {
  const params = new URLSearchParams({ page, size });

  if (studentId) params.append("studentId", studentId);
  if (classId) params.append("classId", classId);
  if (storeId) params.append("storeId", storeId);
  if (itemId) params.append("itemId", itemId);
  if (status) params.append("status", status);
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);
  if (searchTerm) params.append("searchTerm", searchTerm);

  const res = await authFetch(`${API_ENDPOINTS.ORDERS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch student orders");

  const data = await res.json();
  return {
    orders: data.content || [],
    pagination: {
      page: data.number,
      size: data.size,
      totalPages: data.totalPages,
      totalElements: data.totalElements,
    },
  };
};

/** Initialize a new order */
export const createStudentOrder = async (orderData) => {
  const res = await authFetch(API_ENDPOINTS.ORDERS, {
    method: "POST",
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to create order");
  return await res.json();
};

/** Fetch deep details of a specific order */
export const getStudentOrderById = async (orderId) => {
  const res = await authFetch(API_ENDPOINTS.orderById(orderId), { method: "GET" });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to fetch order");
  return await res.json();
};

/** Update an order that is still in draft state */
export const updateStudentOrder = async (orderId, orderData) => {
  const res = await authFetch(API_ENDPOINTS.orderById(orderId), {
    method: "PUT",
    body: JSON.stringify(orderData),
  });
  if (!res.ok) throw new Error((await res.json())?.message || `Failed to update order (${res.status})`);
  return await res.json();
};

/** Finalize an order and lock it for fulfillment */
export const confirmStudentOrder = async (orderId) => {
  const res = await authFetch(API_ENDPOINTS.orderConfirm(orderId), { method: "POST" });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to confirm order");
  return await res.json();
};

/** Abort an order */
export const cancelStudentOrder = async (orderId, reason = "Cancelled by admin") => {
  const params = new URLSearchParams({ reason });
  const res = await authFetch(`${API_ENDPOINTS.orderCancel(orderId)}?${params.toString()}`, { method: "POST" });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to cancel order");
  return await res.json();
};

// ==================== CART / PRE-ORDER UTILS ====================

/** Evaluate a student's cart against rules before ordering */
export const previewStudentOrder = async (studentId, storeId) => {
  const params = new URLSearchParams({ studentId, storeId });
  const res = await authFetch(`${API_ENDPOINTS.ORDERS_PREVIEW}?${params.toString()}`, {
    method: "GET",
    headers: { accept: "application/json" },
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to preview student order");
  return await res.json();
};

/** Check backend if specific items have sufficient stock in a store */
export const checkItemAvailability = async (storeId, itemIds) => {
  const res = await authFetch(API_ENDPOINTS.storeItemsAvailability(storeId), {
    method: "POST",
    body: JSON.stringify(itemIds),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to check stock availability");
  return await res.json();
};

/** Configure which items are allowed/mandatory for a specific class */
export const saveClassItemConfigsBulk = async ({ classId, remarks, items }) => {
  const res = await authFetch(API_ENDPOINTS.CLASS_ITEM_CONFIGS, {
    method: "POST",
    body: JSON.stringify({ classId, remarks, items }),
  });
  if (!res.ok) throw new Error((await res.json())?.message || "Failed to save class item configs");
  return await res.json();
};