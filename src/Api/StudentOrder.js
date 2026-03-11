const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/v1";

//Get Order Stats

export const getOrderStats = async () => {
  const response = await fetch(`${BASE_URL}/stock/orders/stats`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    throw new Error("Failed to fetch order stats");
  }
  return response.json();
};

//    GET STUDENT ORDERS (Paginated + Filters)

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

    const res = await fetch(`${BASE_URL}/stock/orders?${params}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
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

//    CREATE STUDENT ORDER (DRAFT)

export const createStudentOrder = async (orderData) => {
  try {

    const res = await fetch(`${BASE_URL}/stock/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    if (!res.ok) throw new Error("Failed to create order");

    return await res.json();

  } catch (error) {
    console.error("createStudentOrder error:", error);
    throw error;
  }
};


//    GET SINGLE ORDER

export const getStudentOrderById = async (orderId) => {
  try {

    const res = await fetch(`${BASE_URL}/stock/orders/${orderId}`, {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) throw new Error("Failed to fetch order");

    return await res.json();

  } catch (error) {
    console.error("getStudentOrderById error:", error);
    throw error;
  }
};

//    UPDATE DRAFT ORDER
export const updateStudentOrder = async (orderId, orderData) => {
  try {
    const res = await fetch(`${BASE_URL}/stock/orders/${orderId}`, {
      method: "PUT",
      headers: { 
        "Content-Type": "application/json",
        "accept": "application/json",
      },
      body: JSON.stringify(orderData),
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData?.message || `Failed to update order (${res.status})`);
    }
    return await res.json();
  } catch (error) {
    console.error("updateStudentOrder error:", error);
    throw error;
  }
};

//    CONFIRM ORDER (Deduct Stock)

export const confirmStudentOrder = async (orderId) => {
  try {

    const res = await fetch(
      `${BASE_URL}/stock/orders/${orderId}/confirm`,
      {
        method: "POST",
      }
    );

    if (!res.ok) throw new Error("Failed to confirm order");

    return await res.json();

  } catch (error) {
    console.error("confirmStudentOrder error:", error);
    throw error;
  }
};

//    CANCEL ORDER
export const cancelStudentOrder = async (
  orderId,
  reason = "Cancelled by admin"
) => {
  try {

    const params = new URLSearchParams({
      reason,
    });

    const res = await fetch(
      `${BASE_URL}/stock/orders/${orderId}/cancel?${params}`,
      {
        method: "POST",
      }
    );

    if (!res.ok) throw new Error("Failed to cancel order");

    return await res.json();

  } catch (error) {
    console.error("cancelStudentOrder error:", error);
    throw error;
  }
};

  //  PREVIEW STUDENT ORDER

export const previewStudentOrder = async (studentId, storeId) => {
  try {

    const params = new URLSearchParams({
      studentId,
      storeId,
    });

    const res = await fetch(
      `${BASE_URL}/stock/orders/preview?${params}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to preview student order");
    }

    const data = await res.json();

    return data;

  } catch (error) {
    console.error("previewStudentOrder error:", error);
    throw error;
  }
};


// Check Store Availabitlity--

export const checkItemAvailability = async (storeId, itemIds) => {
  const response = await fetch(
    `${BASE_URL}/stock/stores/${storeId}/items/availability`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(itemIds),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check stock availability");
  }

  return response.json();
};