import { authFetch } from "../Authfetch/Authfetch";

// DOUBLE_V1 = for schools endpoints  e.g. /api/v1/v1/...  — keep as-is whatever your env has
// BASE_URL_AUTH = for auth endpoints e.g. /api/v1/auth/...
const BASE_URL      = import.meta.env.VITE_API_BASE_DOUBLE_V1; // schools
const BASE_URL_AUTH = import.meta.env.VITE_API_BASE_V1;        // auth (switch-school lives here)

// ✅ Get All Schools (Paginated + Filters)
export const getSchools = async (
  page = 0,
  size = 20,
  search = "",
  isActive,
  board = ""
) => {
  try {
    let url = `${BASE_URL}/schools?page=${page}&size=${size}`;
    if (search)             url += `&search=${encodeURIComponent(search)}`;
    if (board)              url += `&board=${encodeURIComponent(board)}`;
    if (isActive !== undefined) url += `&isActive=${isActive}`;

    const res = await authFetch(url, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch schools");
    return await res.json();
  } catch (error) {
    console.error("getSchools error:", error.message);
    throw error;
  }
};

// ✅ Get School Statistics
export const getSchoolStats = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/schools/stats`, { method: "GET" });
    if (!res.ok) throw new Error((await res.text()) || "Failed to fetch school stats");
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("getSchoolStats error:", error.message);
    throw error;
  }
};

// ✅ Switch School — POST /v1/auth/switch-school
// Returns: { token, tokenType, expiresIn, schoolId, schoolName, schoolCode }
export const switchSchool = async (schoolId) => {
  try {
    const res = await authFetch(`${BASE_URL_AUTH}/auth/switch-school`, {
      method: "POST",
      body: JSON.stringify({ schoolId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Failed to switch school");

    // ✅ Replace old token with new scoped token
    if (data?.data?.token) {
      localStorage.setItem("token", data.data.token);

      // ✅ Save school info so Sidebar can read schoolName
      localStorage.setItem("school", JSON.stringify({
        schoolId:   data.data.schoolId,
        schoolName: data.data.schoolName,
        schoolCode: data.data.schoolCode,
      }));
    }

    return data.data; // { token, schoolId, schoolName, schoolCode, ... }
  } catch (error) {
    console.error("switchSchool error:", error.message);
    throw error;
  }
};