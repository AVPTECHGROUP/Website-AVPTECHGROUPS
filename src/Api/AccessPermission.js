import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// ==================== Permission Management ENDPOINTS ====================

// GET /roles/stats
export const getPermissionAccessStat = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/stats`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch statistics");
    return await res.json();
  } catch (error) {
    console.error("get statistics error:", error.message);
    throw error;
  }
};

// GET /roles/summary  — all roles without permissions
export const getAllRolesSummary = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/summary`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch roles summary");
    return await res.json();
  } catch (error) {
    console.error("get role summary error:", error.message);
    throw error;
  }
};

// GET /roles/:roleId  — single role with its assigned permissions
export const getSpecificRolePermissions = async (roleId) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/${roleId}`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch role permissions");
    return await res.json();
  } catch (error) {
    console.error("get role permissions error:", error.message);
    throw error;
  }
};

// GET /roles/permissions/modules  — module names for filter chips
export const filterModuleChips = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/permissions/modules`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch module filter chips");
    return await res.json();
  } catch (error) {
    console.error("get module chips error:", error.message);
    throw error;
  }
};

// GET /roles/permissions/grouped
// Response: { data: { MODULE_NAME: [{ id, name, displayName, action, module, ... }] } }
export const getAllPermissions = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/permissions/grouped`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch grouped permissions");
    return await res.json();
  } catch (error) {
    console.error("get all permissions error:", error.message);
    throw error;
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// WRITE OPERATIONS — uncomment the real fetch blocks when API is ready
// ─────────────────────────────────────────────────────────────────────────────

/**
 * POST /roles  — create a new role
 * Payload: {
 *   name: string,           // UPPERCASE_SNAKE_CASE, no spaces e.g. STORE_ACCOUNTANT
 *   displayName: string,
 *   description: string,
 *   isSystemRole: boolean,
 *   permissionIds: number[]
 * }
 */
export const createRole = async (payload) => {

  try {
    const res = await authFetch(`${BASE_URL}/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to create role");
    return await res.json();
  } catch (error) {
    console.error("create role error:", error.message);
    throw error;
  }
  //console.warn("createRole — API not wired yet. Payload:", payload);
  return { success: true, data: { ...payload, id: Date.now() } };
};

/**
 * PUT /roles/:roleId  — edit role details + permissions
 * Only roleId needed in path. name is NOT sent (immutable after creation).
 * Payload: {
 *   displayName: string,
 *   description: string,
 *   isSystemRole: boolean,
 *   permissionIds: number[]
 * }
 */
export const updateRole = async (roleId, payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/${roleId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to update role");
    return await res.json();
  } catch (error) {
    console.error("update role error:", error.message);
    throw error;
  }
 // console.warn("updateRole — API not wired yet. roleId:", roleId, "Payload:", payload);
  return { success: true, data: { id: roleId, ...payload } };
};

/**
 * PUT /roles/:roleId  — save permission matrix changes
 * Only roleId needed in path.
 * Payload: { permissionIds: number[] }
 * Note: adjust to PATCH /roles/:roleId/permissions if your backend has a separate endpoint.
 */
export const updateRolePermissions = async (roleId, permissionIds) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/${roleId}/permissions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(permissionIds ),
    });
    if (!res.ok) throw new Error((await res.text()) || "Failed to update role permissions");
    return await res.json();
  } catch (error) {
    console.error("update role permissions error:", error.message);
    throw error;
  }
  //console.warn("updateRolePermissions — API not wired yet. roleId:", roleId, "permissionIds:", permissionIds);
  return { success: true };
};

/**
 * DELETE /roles/:roleId  — delete a custom role
 * Only roleId is needed. No request body.
 */
export const deleteRole = async (roleId) => {
  try {
    const res = await authFetch(`${BASE_URL}/roles/${roleId}`, { method: "DELETE" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to delete role");
    return await res.json();
  } catch (error) {
    console.error("delete role error:", error.message);
    throw error;
  }
  //console.warn("deleteRole — API not wired yet. roleId:", roleId);
  return { success: true };
};