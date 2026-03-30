import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// ==================== Permission management  ENDPOINTS ====================

export const getPermissionAccessStat = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/stats`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch statistics");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get statistics error:", error.message);
    throw error;
  }
}

//for get all roles summary without permissions
export const getAllRolesSummary = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/summary`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch roles summary");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get role fetch summary error:", error.message);
    throw error;
  }
}

//for geting specific role of user 
export const getSpecificRolePermissions = async (roleId) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/${roleId}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch permissions  summary");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get role permission error:", error.message);
    throw error;
  }
}

// for applying filters in module listing
export const filterModuleChips = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/permissions/modules`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch permissions  filter chips  summary");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get role fetch permissions  filter chips error:", error.message);
    throw error;
  }
}

// for applying filters in module listing based on chips tap
export const filterModulesPermissions = async (filterOption) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/permissions/modules/${filterOption}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch permissions  filter chips  summary");
    }s
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get role fetch permissions  filter chips error:", error.message);
    throw error;
  }
}

//for defining the rowMatrix for each module without checkbox state 
export const getRowMatrixModules = async (filterOption) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/permissions/modules/${filterOption}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch permissions  filter chips  summary");
    }s
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get role fetch permissions  filter chips error:", error.message);
    throw error;
  }
}

