import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Create Fee Collection
export const createFeeCollection = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/collections`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create fee collection");
    }

    return data;
  } catch (error) {
    console.error("createFeeCollection error:", error.message);
    throw error;
  }
};

export const createBulkFeeCollection = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/collections/bulk`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create bulk fee collection");
    }

    return data;
  } catch (error) {
    console.error("createBulkFeeCollection error:", error.message);
    throw error;
  }
};

export const getFeeCollectionHistory = async ({
  fromDate,
  toDate,
  classId,
  periodId,
  mode,
  page = 0,
  size = 10,
  sort = "id"
}) => {
  try {
    const params = new URLSearchParams({
      fromDate,
      toDate,
      classId,
      periodId,
      mode,
      page,
      size,
      sort
    });

    const res = await authFetch(
      `${BASE_URL}/fee/collections/history?${params}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee collection history");
    }

    const data = await res.json();

    return {
      records: data.data || [],
      pagination: data.pagination || {}
    };

  } catch (error) {
    console.error("getFeeCollectionHistory error:", error.message);
    throw error;
  }
};

export const getOutstandingFees = async ({ classId, periodId }) => {
  try {
    const params = new URLSearchParams({
      classId,
      periodId
    });

    const res = await authFetch(
      `${BASE_URL}/fee/collections/outstanding?${params}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch outstanding fees");
    }

    const data = await res.json();

    return {
      records: data.data || [],
      pagination: data.pagination || {}
    };

  } catch (error) {
    console.error("getOutstandingFees error:", error.message);
    throw error;
  }
};

export const getFeeReceiptById = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/collections/receipt/${id}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee receipt");
    }

    const data = await res.json();
    return data.data || {};

  } catch (error) {
    console.error("getFeeReceiptById error:", error.message);
    throw error;
  }
};
