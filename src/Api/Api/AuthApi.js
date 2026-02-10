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
      // Extract error message from the response
      const errorMessage = data.message || 'Invalid email or password';
      throw new Error(errorMessage);
    }

    // Return successful response
    return data;
  } catch (error) {
    console.error('loginAPI error:', error.message);
    // Re-throw with a user-friendly message
    if (error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please check your internet connection.');
    }
    throw error;
  }
};

// Logout API (if needed)
export const logoutAPI = async () => {
  try {
    const token = localStorage.getItem('token');
    
    const res = await fetch(`${BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Logout failed');
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    return { success: true };
  } catch (error) {
    console.error('logoutAPI error:', error.message);
    throw error;
  }
};

// Verify Token (optional - for checking if user is authenticated)
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

// Refresh Token (if your API supports it)
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
    
    // Update token in localStorage
    if (data.token) {
      localStorage.setItem('token', data.token);
    }

    return data;
  } catch (error) {
    console.error('refreshToken error:', error.message);
    throw error;
  }
};