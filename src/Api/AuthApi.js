import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login API — uses plain fetch because there is no token yet at login time
export const loginAPI = async (credentials) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();

    if (!res.ok || data.success === false) {
      const errorMessage = data.message || 'Invalid email or password';
      throw new Error(errorMessage);
    }

    // Save token
    if (data.data?.token) {
      localStorage.setItem("token", data.data.token);
    }

    // Save logged in user
    if (data.data?.user) {
      localStorage.setItem("user", JSON.stringify(data.data.user));
    }

    // ✅ Save profile separately so useDecodedUser().profile works everywhere
    if (data.data?.user?.profile) {
      localStorage.setItem("profile", JSON.stringify(data.data.user.profile));
    }

    return data;

  } catch (error) {
    console.error('loginAPI error:', error.message);
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Logout API — uses authFetch (token required)
export const logoutAPI = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Logout failed");
    }

    return { success: true };

  } catch (error) {
    console.error("logoutAPI error:", error.message);
    throw error;

  } finally {
    // ✅ Also clear profile on logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
  }
};

// Verify Token — uses authFetch (token required)
export const verifyToken = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/auth/verify`);

    if (!res.ok) {
      throw new Error('Token verification failed');
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error('verifyToken error:', error.message);
    throw error;
  }
};

// Refresh Token — uses authFetch (token required)
export const refreshToken = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
    });

    if (!res.ok) {
      throw new Error('Token refresh failed');
    }

    const data = await res.json();

    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('refreshToken error:', error.message);
    throw error;
  }
};