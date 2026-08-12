import {getCurrUserDetails} from "../utils/getCurrUserDetails/GetCurrUserDetails.js";

const clearSessionAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};

export const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");

  // Check token validity before every request
  const decoded = getCurrUserDetails();
  if (!token || !decoded) {
    clearSessionAndRedirect();
    // Throw instead of returning undefined — callers do res.json()/res.ok
    // on the return value, so silently returning undefined crashes them
    // instead of letting their .catch() fallbacks handle it gracefully.
    throw new Error("SESSION_EXPIRED");
  }

  const isFormData = options.body instanceof FormData;

  let response;
  try {
    response = await fetch(url, {
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
  } catch (networkErr) {
    // fetch() itself throws on network failure/CORS/offline — surface a
    // clear error instead of letting it bubble as a raw TypeError.
    throw new Error("Network error — please check your connection and try again.");
  }

  // Handle 401 Unauthorized globally
  if (response.status === 401) {
    clearSessionAndRedirect();
    throw new Error("SESSION_EXPIRED");
  }

  return response;
};