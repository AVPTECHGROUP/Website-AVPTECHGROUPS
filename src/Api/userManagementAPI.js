import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// ==================== Manage Users ENDPOINTS ====================

export const getUsersStatistics = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/users/statistics`, {
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

// List All Users with pagination
export const getAllUsers = async (page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${BASE_URL}/users?page=${page}&size=${size}&sort=${sort}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch Users");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get Users error:", error.message);
    throw error;
  }
};

// Search Users
export const searchUsers = async (searchTerm, page, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${BASE_URL}/users/search?searchTerm=${searchTerm}&page=${page}&size=${size}&sort=${sort}`, {
      method: 'GET',
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to Search Users...');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('search users error:', error.message);
    throw error;
  }
};

// Filter user by role status and search
export const allUserFilter = async (filters = {}, page, size = 10, sort = 'firstName,asc') => {
  try {
    const res = await authFetch(`${BASE_URL}/users/filter`, {
      method: 'POST',
      body: JSON.stringify(
        { filter: filters, pageable: { page: page, size: size, sort: [sort] } }
      ),
    });
    if (!res.ok) {
      const errorText = await res.text();
      const data = errorText ? JSON.parse(errorText) : {};
      throw new Error(data.message || 'Failed to Search Users...');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('search User error:', error.message);
    throw error;
  }
};

// Filter users by role
export const filterUserByRole = async (userRole, page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${BASE_URL}/users/by-role/${userRole}?page=${page}&size=${size}&sort=${sort}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch Users by role");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get Users by role error:", error.message);
    throw error;
  }
};

// Filter users by status
export const filterUserByStatus = async (userStatus, page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${BASE_URL}/users/by-status/${userStatus}?page=${page}&size=${size}&sort=${sort}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch Users by status");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get Users by status error:", error.message);
    throw error;
  }
};

// Creating new user
export const createUser = async (user) => {
  const res = await authFetch(`${BASE_URL}/users`, {
    method: "POST",
    body: JSON.stringify(user),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  console.log("CREATE USER RESPONSE:", data);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to create User");
  }

  return data;
};

// Activate user
export const activateUserStatus = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/users/${id}/activate`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to Activate User');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Activate Status error:', error.message);
    throw error;
  }
}

// Deactivate user
export const deactivateUserStatus = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/users/${id}/deactivate`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to Deactivate User');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Deactivate error:', error.message);
    throw error;
  }
}

// Reset user password
export const resetUserPassword = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/users/${id}/reset-password`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to Reset password');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Reset password error:', error.message);
    throw error;
  }
}

// update password by id
export const updateUserPassword = async (id, password, confirmPassword) => {
  const payload = {
    "newPassword": `${password}`,
    "confirmPassword": `${confirmPassword}`
  }
  const res = await authFetch(`${BASE_URL}/users/${id}/set-password`, {
    method: "PUT",
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  console.log("user password reset:", data);

  if (!res.ok) {
    throw new Error(data?.message || "Failed to update User password");
  }

  return data;
};

// Get all roles
export const getAllUserRoles = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/roles`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch Users by roles");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get roles error:", error.message);
    throw error;
  }
};

// Get User by Id
export const getUserById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/users/${id}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch User");
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error("get User by Id error:", error.message);
    throw error;
  }
};

// Update user by id
export const updateUserById = async (id, updatedUser) => {
  try {
    const res = await authFetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedUser),
    });
    if (!res.ok) throw new Error('Failed to update User');
    return res.json();
  } catch (error) {
    console.error("Update user error:", error.message);
    throw error;
  }
};

//  Get Users Summary List
export const getUsersSummary = async ({
  search,
  role,
  page = 0,
  size = 200,
  sort = "firstName,asc",
} = {}) => {
  try {
    const params = new URLSearchParams();

    if (search) params.append("search", search);
    if (role) params.append("role", role);

    params.append("page", page);
    params.append("size", size);
    params.append("sort", sort);

    const res = await authFetch(
      `${BASE_URL}/users/summary?${params.toString()}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch users summary");
    }

    const data = await res.json();

    return data;

  } catch (error) {
    console.error("getUsersSummary error:", error.message);
    throw error;
  }
};