//base url
const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/holidays";

//fetch all statistics for holiday
export const fetchAllHolidayStatistics = async (year = '') => {
    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/statistics?year=${year}`,{
                 method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`}  
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

//get next holiday 
export const getNextHoliday = async () => {
    try {
        const token =localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/next`,{
                 method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`} } );
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
    const token = localStorage.getItem("token");

    // Build query parameters
    const params = new URLSearchParams();

    // Add filters only if value exists
    if (year) params.append("year", year);
    if (holidayType) params.append("holidayType", holidayType);
    if (fromDate) params.append("fromDate", fromDate);
    if (toDate) params.append("toDate", toDate);
    if (searchTerm) params.append("searchTerm", searchTerm);

    // Pagination
    params.append("page", page);
    params.append("size", size);
    params.append("sort", sort);

    const url = `${BASE_URL}?${params.toString()}`;

    const res = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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
    try{
        const token = localStorage.getItem("token");
    
    const res = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization:`Bearer ${token}`,
        },
        body: JSON.stringify(new_Holiday),
    });

    const text = await res.text();
    console.log("CREATE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
        throw new Error(text || "Failed to create holiday");
    }
    return text ? JSON.parse(text) : {};
    }
    catch (error) {
    console.error("Create Holiday Error:", error);
    throw error;
  }
};

//Delete holiday
export const deleteHoliday = async (holiday_id) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${BASE_URL}/${holiday_id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
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

// Get Holiday by Id - FIXED FUNCTION NAME
export const getHolidayById = async (id) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/${id}`,{
            method:"GeT",
             headers: {
            "Content-Type": "application/json",
            accept: "application/json",
            Authorization:`Bearer ${token}`,
        },
        });
        if (!res.ok) throw new Error("Failed to fetch holiday");
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("get holiday by id error:", error.message);
        throw error;
    }
};

// update holiday
export const updateHoliday = async (holidayid, holidayData) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${BASE_URL}/${holidayid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization:`Bearer ${token}`,
        },
        body: JSON.stringify(holidayData),
    });

    const text = await res.text();
    console.log("UPDATE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
        throw new Error(text || "Failed to update holiday");
    }
    return text ? JSON.parse(text) : {};
};