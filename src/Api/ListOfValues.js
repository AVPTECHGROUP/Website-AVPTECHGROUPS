import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE;
const LOV_BASE_URL = `${BASE_URL}/common/lov`;

// Get list of values by LOV type
export const getListOfValues = async (lovType = "") => {
  try {
    const res = await authFetch(`${LOV_BASE_URL}/${lovType}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch LOV values");
    }

    const data = await res.json();

    return data?.data || [];
  } catch (error) {
    console.error("getListOfValues error:", error.message);
    throw error;
  }
};