const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/v1";

// ==================== AUTHENTICATION ENDPOINTS ====================

// Login API
export const loginAPI = async (credentials) => {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await res.json();

    // Check if the response was not successful
    if (!res.ok || data.success === false) {
      const errorMessage = data.message || 'Invalid email or password';
      throw new Error(errorMessage);
    }

    // Save token directly to localStorage — UserContext syncs automatically via its useEffect
    if (data.token) {
      localStorage.setItem("token", data.token);
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

// Logout API
export const logoutAPI = async () => {
  const token = localStorage.getItem("token");

  try {
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    // Always clear storage even if API fails
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Verify Token
export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      throw new Error('No token found');
    }

    const res = await fetch(`${BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

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

// Refresh Token
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');

    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Authorization': `Bearer ${token}`
      }
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