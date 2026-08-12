export function jwtDecode(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
        atob(base64)
            .split('')
            .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
            .join('')
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const clearSessionAndRedirect = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getCurrUserDetails = () => {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const decoded = jwtDecode(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!decoded || decoded.exp < currentTime) {
      clearSessionAndRedirect();
      return null;
    }

    return decoded;
  } catch (error) {
    clearSessionAndRedirect();
    return null;
  }
};

// ── Generic helpers built on the decoded token ───────────────────────────
// Matches the same field precedence your Sidebar.jsx already uses:
// userType first, then a roles[] array, then a plain role field as a last resort.

export const getUserRole = (user = getCurrUserDetails()) => {
  if (!user) return null;
  const role =
      user.userType ||
      (Array.isArray(user.roles) ? user.roles[0] : null) ||
      user.role ||
      null;
  return role ? String(role).toUpperCase() : null;
};

export const getUserId = (user = getCurrUserDetails()) => {
  return user?.userId ?? user?.id ?? user?.sub ?? null;
};