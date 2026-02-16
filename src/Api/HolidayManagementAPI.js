//base url
const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/holidays";

//fetch all statistics for holiday
export const fetchAllHolidayStatistics = async (year = '') => {
    try {
        const res = await fetch(`${BASE_URL}/statistics?year=${year}`);
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
        const res = await fetch(`${BASE_URL}/next`);
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
export const getAllHolidays = async (year = '', holidayType = '', fromDate = '', toDate = '', searchTerm = '', page = 0, size = 10, sort = 'holidayDate') => {
    try {
        // Build query parameters
        const params = new URLSearchParams();

        // Add optional filters only if valid
        if (year || year != '') params.append('year', year);
        if (holidayType || holidayType != '') params.append('holidayType', holidayType);
        if (fromDate || fromDate != '') params.append('fromDate', fromDate);
        if (toDate || toDate != '') params.append('toDate', toDate);
        if (searchTerm || searchTerm != '') params.append('searchTerm', searchTerm);

        // Always include pagination and sort
        params.append('page', page);
        params.append('size', size);
        params.append('sort', sort);

        // Build final URL
        const url = `${BASE_URL}?${params.toString()}`;

        const res = await fetch(url);

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
    const res = await fetch(`${BASE_URL}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
        },
        body: JSON.stringify(new_Holiday),
    });

    const text = await res.text();
    console.log("CREATE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
        throw new Error(text || "Failed to create holiday");
    }
    return text ? JSON.parse(text) : {};
};

//Delete holiday
export const deleteHoliday = async (holiday_id) => {
    const res = await fetch(`${BASE_URL}/${holiday_id}`, {
        method: "DELETE",
    });

    const text = await res.text();
    console.log("DELETE HOLIDAY RESPONSE:", text);

    if (!res.ok) {
        throw new Error(text || "Failed to delete holiday");
    }
    return text ? JSON.parse(text) : {};
};

// Get Holiday by Id - FIXED FUNCTION NAME
export const getHolidayById = async (id) => {
    try {
        const res = await fetch(`${BASE_URL}/${id}`);
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
    const res = await fetch(`${BASE_URL}/${holidayid}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            accept: "application/json",
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