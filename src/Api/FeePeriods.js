import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

/**
 * Get Fee Periods by Academic Year
 * GET /v1/fee/periods?academicYearId={id}
 */
export const getFeePeriods = async (academicYearId) => {
  try {
    if (!academicYearId) {
      throw new Error("Academic Year ID is required");
    }

    const url = `${BASE_URL}/fee/periods?academicYearId=${academicYearId}`;
    console.log('🌐 Fetching periods:', url);

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Periods API failed:', errorText);
      throw new Error(errorText || "Failed to fetch fee periods");
    }

    const data = await res.json();
    console.log('✅ Periods response:', data);

    // API returns { success, message, data: [...] }
    return data.data || [];
  } catch (error) {
    console.error("❌ getFeePeriods error:", error.message);
    throw error;
  }
};

export const createFeePeriod = async (payload) => {
  try {
    console.log('📤 Creating period:', payload);

    const res = await authFetch(`${BASE_URL}/fee/periods`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create fee period");
    }

    console.log('✅ Period created:', data);
    return data;
  } catch (error) {
    console.error("❌ createFeePeriod error:", error.message);
    throw error;
  }
};

export const getFeePeriodById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/periods/${id}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch fee period");
    }

    const data = await res.json();
    return data.data || {};
  } catch (error) {
    console.error("❌ getFeePeriodById error:", error.message);
    throw error;
  }
};

export const updateFeePeriod = async (id, payload) => {
  try {
    console.log('📤 Updating period:', id, payload);

    const res = await authFetch(`${BASE_URL}/fee/periods/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to update fee period");
    }

    console.log('✅ Period updated:', data);
    return data;
  } catch (error) {
    console.error("❌ updateFeePeriod error:", error.message);
    throw error;
  }
};

export const deleteFeePeriod = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/periods/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to delete fee period");
    }

    // Handle both cases (with or without body)
    let data = null;
    try {
      data = await res.json();
    } catch {
      data = { success: true };
    }

    console.log('✅ Period deleted:', id);
    return data;
  } catch (error) {
    console.error("❌ deleteFeePeriod error:", error.message);
    throw error;
  }
};

export const getAcademicYears = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/periods/academic-years`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch academic years");
    }

    const data = await res.json();
    return data.data || [];
  } catch (error) {
    console.error("❌ getAcademicYears error:", error.message);
    throw error;
  }
};

export const createAcademicYear = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/fee/periods/academic-years`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create academic year");
    }

    return data;
  } catch (error) {
    console.error("❌ createAcademicYear error:", error.message);
    throw error;
  }
};