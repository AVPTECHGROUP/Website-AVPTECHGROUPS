import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getCurrentAcademicYear = async () => {
  const res = await authFetch(API_ENDPOINTS.CURRENT_ACADEMIC_YEAR, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch current academic year");
  return await res.json();
};

export const getAcademicYearsLov = async () => {
  const res = await authFetch(API_ENDPOINTS.ACADEMIC_YEARS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch academic years");
  return await res.json();
};

export const fetchAllHolidayStatistics = async (year = '') => {
  const res = await authFetch(`${API_ENDPOINTS.HOLIDAYS_STATS}?year=${year}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch holiday statistics");
  return await res.json();
};

export const getNextHoliday = async () => {
  const res = await authFetch(API_ENDPOINTS.HOLIDAYS_NEXT, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to get next holiday");
  return await res.json();
};

export const getAllHolidays = async (year = "", holidayType = "", fromDate = "", toDate = "", searchTerm = "", page = 0, size = 10, sort = "holidayDate") => {
  const params = new URLSearchParams({ page, size, sort });
  if (year) params.append("year", year);
  if (holidayType) params.append("holidayType", holidayType);
  if (fromDate) params.append("fromDate", fromDate);
  if (toDate) params.append("toDate", toDate);
  if (searchTerm) params.append("searchTerm", searchTerm);

  const res = await authFetch(`${API_ENDPOINTS.HOLIDAYS}?${params.toString()}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch all holidays");
  return await res.json();
};

export const createHoliday = async (newHoliday) => {
  const res = await authFetch(API_ENDPOINTS.HOLIDAYS, {
    method: "POST",
    body: JSON.stringify(newHoliday),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to create holiday");
  return text ? JSON.parse(text) : {};
};

export const deleteHoliday = async (id) => {
  const res = await authFetch(API_ENDPOINTS.holidayById(id), { method: "DELETE" });
  const text = await res.text();

  if (!res.ok) throw new Error(text || "Failed to delete holiday");
  return text ? JSON.parse(text) : {};
};

export const getHolidayById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.holidayById(id), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch holiday");
  return await res.json();
};

export const updateHoliday = async (id, holidayData) => {
  const res = await authFetch(API_ENDPOINTS.holidayById(id), {
    method: "PUT",
    body: JSON.stringify(holidayData),
  });

  const text = await res.text();
  if (!res.ok) throw new Error(text || "Failed to update holiday");
  return text ? JSON.parse(text) : {};
};