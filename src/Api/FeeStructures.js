import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

/**
 * Get Fee Structures by Period (or all if no periodId provided)
 * GET /v1/fee/structures?periodId={id}
 */
export const getFeeStructures = async (periodId) => {
  try {
    // ✅ Only add periodId query param if it has a valid value
    const url = periodId 
      ? `${BASE_URL}/fee/structures?periodId=${periodId}`
      : `${BASE_URL}/fee/structures`;
    
    console.log('🌐 Fetching fee structures:', url);

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ getFeeStructures failed:', errorText);
      throw new Error(errorText || "Failed to fetch fee structures");
    }

    const data = await res.json();
    console.log('✅ Fee structures response:', data);

    return data.data || [];
  } catch (error) {
    console.error("❌ getFeeStructures error:", error.message);
    throw error;
  }
};

export const createFeeStructure = async (payload) => {
  try {
    console.log('📤 Creating fee structure:', payload);

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

    console.log('✅ Fee structure created:', data);
    return data;
  } catch (error) {
    console.error("❌ createFeeStructure error:", error.message);
    throw error;
  }
};

export const getFeeStructureById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/structures/${id}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee structure");
    }

    const data = await res.json();
    return data.data || {};
  } catch (error) {
    console.error("❌ getFeeStructureById error:", error.message);
    throw error;
  }
};

export const updateFeeStructure = async (id, payload) => {
  try {
    console.log('📤 Updating fee structure:', id, payload);

    const res = await authFetch(`${BASE_URL}/fee/structures/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to update fee structure");
    }

    console.log('✅ Fee structure updated:', data);
    return data;
  } catch (error) {
    console.error("❌ updateFeeStructure error:", error.message);
    throw error;
  }
};

export const deleteFeeStructure = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/structures/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete fee structure");
    }

    // Handle both cases (with or without body)
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { success: true };
    }

    console.log('✅ Fee structure deleted:', id);
    return data;
  } catch (error) {
    console.error("❌ deleteFeeStructure error:", error.message);
    throw error;
  }
};