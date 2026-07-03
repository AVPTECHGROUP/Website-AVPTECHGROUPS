import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getSchools = async (page = 0, size = 20, search = "", isActive, board = "") => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (board) params.append("board", board);
  if (isActive !== undefined) params.append("isActive", isActive);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch schools");
  return await res.json();
};

export const getSchoolStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch school stats");
  return (await res.json()).data;
};

/** Authenticate and switch active school context */
export const switchSchool = async (schoolId) => {
  const res = await authFetch(API_ENDPOINTS.SWITCH_SCHOOL, {
    method: "POST",
    body: JSON.stringify({ schoolId }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to switch school");

  if (data?.data?.token) {
    localStorage.setItem("token", data.data.token);
    localStorage.setItem("school", JSON.stringify({
      schoolId: data.data.schoolId,
      schoolName: data.data.schoolName,
      schoolCode: data.data.schoolCode,
    }));
  }

  return data.data;
};

export const getMySchools = async (page = 0, size = 12, search = "", board = "", isActive) => {
  const params = new URLSearchParams({ page, size });
  if (search) params.append("search", search);
  if (board) params.append("board", board);
  if (isActive !== undefined) params.append("isActive", isActive);

  const res = await authFetch(`${API_ENDPOINTS.SCHOOLS_MY}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch my schools");
  return await res.json();
};

export const getMySchoolStats = async () => {
  const res = await authFetch(API_ENDPOINTS.SCHOOLS_MY_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch my school stats");
  return (await res.json()).data;
};