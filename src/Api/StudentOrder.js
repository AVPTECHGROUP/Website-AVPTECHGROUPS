import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/v1";

// Get Order Stats
export const getOrderStats = async () => {
  const response = await authFetch(`${BASE_URL}/stock/orders/stats`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch order stats");
  }

  return response.json();
};

// GET STUDENT ORDERS (Paginated + Filters)
export const getStudentOrders = async ({
  page = 0,
  size = 20,
  studentId,
  classId,
  storeId,
  itemId,
  status,
  fromDate,
  toDate,
  searchTerm,
} = {}) => {
  try {
    const params = new URLSearchParams({
      page,
      size,
      ...(studentId && { studentId }),
      ...(classId && { classId }),
      ...(storeId && { storeId }),
      ...(itemId && { itemId }),
      ...(status && { status }),
      ...(fromDate && { fromDate }),
      ...(toDate && { toDate }),
      ...(searchTerm && { searchTerm }),
    });

    const res = await authFetch(`${BASE_URL}/stock/orders?${params}`, {
      method: "GET",
    });

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
  } catch (error) {
    console.error("getStudentOrders error:", error);
    throw error;
  }
};

// CREATE STUDENT ORDER
export const createStudentOrder = async (orderData) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/orders`, {
      method: "POST",
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create order");
    }

    return data;
  } catch (error) {
    console.error("createStudentOrder error:", error);
    throw error;
  }
};

// GET SINGLE ORDER
export const getStudentOrderById = async (orderId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/orders/${orderId}`, {
      method: "GET",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to fetch order");
    }

    return data;
  } catch (error) {
    console.error("getStudentOrderById error:", error);
    throw error;
  }
};

// UPDATE DRAFT ORDER
export const updateStudentOrder = async (orderId, orderData) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/orders/${orderId}`, {
      method: "PUT",
      body: JSON.stringify(orderData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || `Failed to update order (${res.status})`);
    }

    return data;
  } catch (error) {
    console.error("updateStudentOrder error:", error);
    throw error;
  }
};

// CONFIRM ORDER
export const confirmStudentOrder = async (orderId) => {
  try {
    const res = await authFetch(`${BASE_URL}/stock/orders/${orderId}/confirm`, {
      method: "POST",
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to confirm order");
    }

    return data;
  } catch (error) {
    console.error("confirmStudentOrder error:", error);
    throw error;
  }
};

// CANCEL ORDER
export const cancelStudentOrder = async (
  orderId,
  reason = "Cancelled by admin"
) => {
  try {
    const params = new URLSearchParams({ reason });

    const res = await authFetch(
      `${BASE_URL}/stock/orders/${orderId}/cancel?${params}`,
      {
        method: "POST",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to cancel order");
    }

    return data;
  } catch (error) {
    console.error("cancelStudentOrder error:", error);
    throw error;
  }
};

// PREVIEW STUDENT ORDER
export const previewStudentOrder = async (studentId, storeId) => {
  try {
    const params = new URLSearchParams({
      studentId,
      storeId,
    });

    const res = await authFetch(
      `${BASE_URL}/stock/orders/preview?${params}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to preview student order");
    }

    return data;
  } catch (error) {
    console.error("previewStudentOrder error:", error);
    throw error;
  }
};

// CHECK ITEM AVAILABILITY
export const checkItemAvailability = async (storeId, itemIds) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/stock/stores/${storeId}/items/availability`,
      {
        method: "POST",
        body: JSON.stringify(itemIds),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to check stock availability");
    }

    return data;
  } catch (error) {
    console.error("checkItemAvailability error:", error);
    throw error;
  }
};