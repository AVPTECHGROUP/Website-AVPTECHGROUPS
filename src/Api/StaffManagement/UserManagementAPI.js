import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

// ==================== USER MANAGEMENT ====================

/** Fetch overarching user statistics */
export const getUsersStatistics = async () => {
  const res = await authFetch(API_ENDPOINTS.USERS_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch statistics");
  return await res.json();
};

/** List all users via pagination */
export const getAllUsers = async (page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.USERS}?page=${page}&size=${size}&sort=${sort}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch Users");
  return await res.json();
};

/** Search users by term string */
export const searchUsers = async (searchTerm, page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.USERS_SEARCH}?searchTerm=${searchTerm}&page=${page}&size=${size}&sort=${sort}`, { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to Search Users');
  return await res.json();
};

/** Deep filter users by multiple parameters via POST body */
export const allUserFilter = async (filters = {}, page = 0, size = 10, sort = 'firstName,asc') => {
  const res = await authFetch(API_ENDPOINTS.USERS_FILTER, {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filter: filters, pageable: { page, size, sort: [sort] } }),
  });
  if (!res.ok) {
    const errorText = await res.text();
    const data = errorText ? JSON.parse(errorText) : {};
    throw new Error(data.message || 'Failed to Filter Users');
  }
  return await res.json();
};

/** Fetch users assigned to a specific role */
export const filterUserByRole = async (userRole, page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.userByRole(userRole)}?page=${page}&size=${size}&sort=${sort}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch Users by role");
  return await res.json();
};

/** Fetch users currently maintaining a specific status */
export const filterUserByStatus = async (userStatus, page = 0, size = 10, sort = 'id') => {
  const res = await authFetch(`${API_ENDPOINTS.userByStatus(userStatus)}?page=${page}&size=${size}&sort=${sort}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch Users by status");
  return await res.json();
};

/** Create a new user profile with optional image */
export const createUser = async (user, imageFile) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(user)], { type: "application/json" }));
  if (imageFile) formData.append("image", imageFile);

  const res = await authFetch(API_ENDPOINTS.USERS, { method: "POST", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create User");
  return data;
};

/** Re-enable an inactive user */
export const activateUserStatus = async (id) => {
  const res = await authFetch(API_ENDPOINTS.userActivate(id), { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to Activate User');
  return await res.json();
};

/** Disable an active user account */
export const deactivateUserStatus = async (id) => {
  const res = await authFetch(API_ENDPOINTS.userDeactivate(id), { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to Deactivate User');
  return await res.json();
};

/** Force a password reset for a specific user ID */
export const resetUserPassword = async (id) => {
  const res = await authFetch(API_ENDPOINTS.userResetPassword(id), { method: 'POST' });
  if (!res.ok) throw new Error('Failed to Reset password');
  return await res.json();
};

/** Hard update the password payload for a user */
export const updateUserPassword = async (id, password, confirmPassword) => {
  const res = await authFetch(API_ENDPOINTS.userSetPassword(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword: `${password}`, confirmPassword: `${confirmPassword}` })
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) throw new Error(data?.message || "Failed to update User password");
  return data;
};

/** Fetch summary payload specifically formatted for user tables */
export const getUsersSummary = async ({ search, role, page = 0, size = 200, sort = "firstName,asc" } = {}) => {
  const params = new URLSearchParams({ page, size, sort });
  if (search) params.append("search", search);
  if (role) params.append("role", role);

  const res = await authFetch(`${API_ENDPOINTS.USERS_SUMMARY}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch users summary");
  return await res.json();
};

// ==================== ROLES ====================

/** Fetch all system roles mapped to users */
export const getAllUserRoles = async () => {
  const res = await authFetch(API_ENDPOINTS.ROLES, { method: "GET" }); // From standard endpoints
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch roles");
  return await res.json();
};

/** Get lightweight summary of role mappings */
export const getRolesSummary = async () => {
  const res = await authFetch(API_ENDPOINTS.ROLES_SUMMARY, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch roles summary");
  return await res.json();
};

// ==================== UTILS ====================

/** Get user details by specific user ID */
export const getUserById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.userById(id), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch User");
  const data = await res.json();
  return data.data || data;
};

/** Update user profile by ID with optional image */
export const updateUserById = async (id, updatedUser, imageFile) => {
  const formData = new FormData();
  formData.append("data", new Blob([JSON.stringify(updatedUser)], { type: "application/json" }));
  if (imageFile) formData.append("image", imageFile);

  const res = await authFetch(API_ENDPOINTS.userById(id), { method: "PUT", body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to update User");
  return data;
};