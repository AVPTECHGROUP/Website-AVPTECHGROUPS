import { getCurrUserDetails } from "../utils/getCurrUserDetails";

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // Check token validity before every request
  const decoded = getCurrUserDetails();
  if (!decoded) {
    clearSessionAndRedirect();
    return;
  }

  const isFormData = options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      // Only set Accept and Authorization by default
      // Do NOT set Content-Type for FormData — browser handles it automatically
      ...(!isFormData && { "Content-Type": "application/json" }),
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      // Allow callers to override or add headers
      ...options.headers,
    },
  });

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    clearSessionAndRedirect();
    return;
  }

  return response;
};