import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

/**
 * Helper function to build clean query parameters
 * Filters out undefined, null, and empty string values
 */
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    // Only add parameter if it has a real value
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  
  return searchParams.toString();
};

/**
 * Create single fee collection
 * POST /v1/fee/collections
 */
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
    console.error("❌ createFeeCollection error:", error.message);
    throw error;
  }
};

/**
 * Create bulk fee collections
 * POST /v1/fee/collections/bulk
 */
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
    console.error("❌ createBulkFeeCollection error:", error.message);
    throw error;
  }
};

/**
 * Get fee collection history with filters
 * GET /v1/fee/collections/history
 */
export const getFeeCollectionHistory = async ({
  fromDate,
  toDate,
  classId,
  periodId,
  mode,
  page = 0,
  size = 10,
} = {}) => {
  try {

    const queryString = buildQueryParams({
      fromDate,
      toDate,
      classId,
      periodId,
      mode,
      page,
      size,
    });

    const url = `${BASE_URL}/fee/collections/history${
      queryString ? "?" + queryString : ""
    }`;

    console.log("🌐 Fetching history:", url);

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee collection history");
    }

    const data = await res.json();

    return {
      records: data?.data?.content || [],
      pagination: {
        totalPages: data?.data?.totalPages || 0,
        totalElements: data?.data?.totalElements || 0,
        size: data?.data?.size || size,
        number: data?.data?.number || page,
      }
    };

  } catch (error) {
    console.error("❌ getFeeCollectionHistory error:", error.message);
    throw error;
  }
};

/**
 * Get outstanding fees with optional filters
 * GET /v1/fee/collections/outstanding
 */
export const getOutstandingFees = async ({ classId, periodId } = {}) => {
  try {
    // Build query string with only defined values
    const queryString = buildQueryParams({
      classId,
      periodId
    });

    const url = `${BASE_URL}/fee/collections/outstanding${queryString ? '?' + queryString : ''}`;
    console.log('🌐 Fetching outstanding:', url);

    const res = await authFetch(url, {
      method: "GET",
    });

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
    console.error("❌ getOutstandingFees error:", error.message);
    throw error;
  }
};

/**
 * Get fee receipt by ID
 * GET /v1/fee/collections/receipt/:id
 */
export const getFeeReceiptById = async (id) => {
  try {
    if (!id) {
      throw new Error("Receipt ID is required");
    }

    const url = `${BASE_URL}/fee/collections/receipt/${id}`;
    console.log('🌐 Fetching receipt:', url);

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee receipt");
    }

    const data = await res.json();
    return data.data || {};

  } catch (error) {
    console.error("❌ getFeeReceiptById error:", error.message);
    throw error;
  }
};