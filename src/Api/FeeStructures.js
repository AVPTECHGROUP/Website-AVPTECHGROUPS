import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Get Fee Structures by Period
export const getFeeStructures = async (periodId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/structures?periodId=${periodId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee structures");
    }

    const data = await res.json();

    return data.data || [];
  } catch (error) {
    console.error("getFeeStructures error:", error.message);
    throw error;
  }
};

export const createFeeStructure = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/structures`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create fee structure");
    }

    return data;
  } catch (error) {
    console.error("createFeeStructure error:", error.message);
    throw error;
  }
};

export const getFeeStructureById = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/structures/${id}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee structure");
    }

    const data = await res.json();

    return data.data || {};
  } catch (error) {
    console.error("getFeeStructureById error:", error.message);
    throw error;
  }
};

export const updateFeeStructure = async (id, payload) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/structures/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to update fee structure");
    }

    return data;
  } catch (error) {
    console.error("updateFeeStructure error:", error.message);
    throw error;
  }
};

export const deleteFeeStructure = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/fee/structures/${id}`,
      {
        method: "DELETE",
      }
    );

    // some APIs return empty response (204)
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete fee structure");
    }

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { success: true };
    }

    return data;

  } catch (error) {
    console.error("deleteFeeStructure error:", error.message);
    throw error;
  }
};
