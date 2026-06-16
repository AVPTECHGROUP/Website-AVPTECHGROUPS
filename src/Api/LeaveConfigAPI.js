import { authFetch } from '../Authfetch/Authfetch';

const BASE_URL = `${import.meta.env.VITE_API_BASE}/leave/config`;

// ==================== LEAVE CONFIG ENDPOINTS ====================

// 1. Get all leave configurations
// isActive: undefined = all | true = active only | false = inactive only
export const getAllLeaveConfigs = async (isActive = true) => {
  try {
    const params = new URLSearchParams();
    if (isActive !== undefined) params.append('isActive', isActive);
    const url = params.toString()
      ? `${BASE_URL}?${params.toString()}`
      : BASE_URL;
    const res = await authFetch(url, { method: 'GET' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to fetch leave configurations');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getAllLeaveConfigs error:', error.message);
    throw error;
  }
};

// 2. Get single leave configuration by ID
export const getLeaveConfigById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/${id}`, { method: 'GET' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to fetch leave configuration');
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('getLeaveConfigById error:', error.message);
    throw error;
  }
};

// 3. Create a new leave configuration
export const createLeaveConfig = async (payload) => {
  try {
    const res = await authFetch(BASE_URL, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Failed to create leave configuration'
      );
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('createLeaveConfig error:', error.message);
    throw error;
  }
};

// 4. Update an existing leave configuration
export const updateLeaveConfig = async (id, payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Failed to update leave configuration'
      );
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('updateLeaveConfig error:', error.message);
    throw error;
  }
};

// 5. Disable (soft delete) a leave configuration
export const deleteLeaveConfig = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Failed to disable leave configuration'
      );
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('deleteLeaveConfig error:', error.message);
    throw error;
  }
};

// 6. Seed default leave configurations
export const seedLeaveConfigs = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/seed`, { method: 'POST' });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message || 'Failed to seed leave configurations'
      );
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('seedLeaveConfigs error:', error.message);
    throw error;
  }
};
