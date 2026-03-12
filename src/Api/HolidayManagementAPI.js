import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = `${import.meta.env.VITE_API_BASE_DOUBLE}/holidays`;

// Fetch all statistics for holiday
export const fetchAllHolidayStatistics = async (year = '') => {
  try {
    const res = await authFetch(`${BASE_URL}/statistics?year=${year}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch holiday statistics");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get holiday statistics error:", error.message);
    throw error;
  }
}

// Get next holiday
export const getNextHoliday = async () => {
  try {
    const res = await authFetch(`${BASE_URL}/next`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to get next holiday");
    }
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get next holiday error:", error.message);
    throw error;
  }
}

// List All Holidays with pagination
export const getAllHolidays = async (
  year = "",
  holidayType = "",
  fromDate = "",
  toDate = "",
  searchTerm = "",
  page = 0,
  size = 10,
  sort = "holidayDate"
) => {
  try {
    const params = new URLSearchParams();

    if (year) params.append("year", year);
    if (holidayType) params.append("holidayType", holidayType);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (searchTerm) params.append("searchTerm", searchTerm);

    params.append("page", page);
    params.append("size", size);
    params.append("sort", sort);

    const res = await authFetch(`${BASE_URL}?${params.toString()}`, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch all holidays");
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Holiday fetch request error:", error.message);
    throw error;
  }
};

// Creating a Holiday
export const createHoliday = async (new_Holiday) => {
  try {
    const res = await authFetch(`${BASE_URL}`, {
      method: "POST",
      body: JSON.stringify(new_Holiday),
    });

    const text = await res.text();
    console.log("CREATE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
      throw new Error(text || "Failed to create holiday");
    }
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Create Holiday Error:", error);
    throw error;
  }
};

// Delete holiday
export const deleteHoliday = async (holiday_id) => {
  try {
    const res = await authFetch(`${BASE_URL}/${holiday_id}`, {
      method: "DELETE",
    });

    const text = await res.text();
    console.log("DELETE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
      throw new Error(text || "Failed to delete holiday");
    }

    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Delete Holiday Error:", error);
    throw error;
  }
};

// Get Holiday by Id
export const getHolidayById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/${id}`, {
      method: "GET",
    });
    if (!res.ok) throw new Error("Failed to fetch holiday");
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("get holiday by id error:", error.message);
    throw error;
  }
};

// Update holiday
export const updateHoliday = async (holidayid, holidayData) => {
  try {
    const res = await authFetch(`${BASE_URL}/${holidayid}`, {
      method: "PUT",
      body: JSON.stringify(holidayData),
    });

    const text = await res.text();
    console.log("UPDATE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
      throw new Error(text || "Failed to update holiday");
    }
    return text ? JSON.parse(text) : {};
  } catch (error) {
    console.error("Update Holiday Error:", error);
    throw error;
  }
};