import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ============================================================================
// READ OPERATIONS
// ============================================================================

/** Fetches access statistics for roles and permissions. */
export const getPermissionAccessStat = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.PERMISSION_ACCESS_STATISTICS, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch statistics");
    return await res.json();
  } catch (error) {
    console.error("Get statistics error:", error.message);
    throw error;
  }
};

/** Fetches a summary of all roles. */
export const getAllRolesSummary = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.ROLES_SUMMARY, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch roles summary");
    return await res.json();
  } catch (error) {
    console.error("Get role summary error:", error.message);
    throw error;
  }
};

/** Fetches a specific role with its assigned permissions. */
export const getSpecificRolePermissions = async (roleId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.roleById(roleId), { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch role permissions");
    return await res.json();
  } catch (error) {
    console.error(`Get role permissions error (ID: ${roleId}):`, error.message);
    throw error;
  }
};

/** Fetches module names for filter chips. */
export const filterModuleChips = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.MODULE_FILTER_CHIPS, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch module filter chips");
    return await res.json();
  } catch (error) {
    console.error("Get module chips error:", error.message);
    throw error;
  }
};

/** Fetches all permissions grouped by module. */
export const getAllPermissions = async () => {
  try {
    const res = await authFetch(API_ENDPOINTS.ALL_PERMISSIONS_GROUPED, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch grouped permissions");
    return await res.json();
  } catch (error) {
    console.error("Get all permissions error:", error.message);
    throw error;
  }
};

// ============================================================================
// WRITE OPERATIONS
// ============================================================================

export const createRole = async (payload) => {
  try {
    const res = await authFetch(API_ENDPOINTS.ROLES, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to create role");
    return await res.json();
  } catch (error) {
    console.error("Create role error:", error.message);
    throw error;
  }
};

export const updateRole = async (roleId, payload) => {
  try {
    const res = await authFetch(API_ENDPOINTS.roleById(roleId), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to update role");
    return await res.json();
  } catch (error) {
    console.error(`Update role error (ID: ${roleId}):`, error.message);
    throw error;
  }
};

export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const res = await authFetch(API_ENDPOINTS.rolePermissionsById(roleId), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(permissionIds),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to update role permissions");
    return await res.json();
  } catch (error) {
    console.error(`Update role permissions error (ID: ${roleId}):`, error.message);
    throw error;
  }
};

export const deleteRole = async (roleId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.roleById(roleId), { method: "DELETE" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to delete role");
    return await res.json();
  } catch (error) {
    console.error(`Delete role error (ID: ${roleId}):`, error.message);
    throw error;
  }
};