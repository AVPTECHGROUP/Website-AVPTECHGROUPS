const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/api/v1";

// Listing of Students
export const getStudents = async (page = 0, size = 10, sort = 'id') => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/students/paginated?page=${page}&size=${size}&sort=${sort}`, {
            method:"GET",
            headers: {
                Accept: "application/json",
                Authorization:`Bearer ${token}`,
            }
        });
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || "Failed to fetch students");
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error("getStudents error", error.message);
        throw error;
    }
};

// Create new Student
export const createStudents = async (studentData) => {
    try {
        const token=localStorage.getItem("token");
        console.log("Sending to:", `${BASE_URL}/students`);
        console.log("Payload:", JSON.stringify(studentData, null, 2));

        const res = await fetch(`${BASE_URL}/students`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization:`Bearer ${token}`,
            },
            body: JSON.stringify(studentData),
        });

        const rawText = await res.text();
        console.log(" RAW SERVER RESPONSE:", rawText);

        let data;
        try {
            data = JSON.parse(rawText);
        } catch {
            throw new Error(`Server returned non-JSON response: ${rawText.slice(0, 200)}`);
        }

        console.log("PARSED RESPONSE:", data);

        if (!res.ok) {
            const errMsg =
                data?.message ||
                data?.error ||
                data?.errors?.join(", ") ||
                `Request failed with status ${res.status}`;
            throw new Error(errMsg);
        }

        return data;
    } catch (error) {
        console.error(' CREATE STUDENT ERROR:', error.message);
        throw error;
    }
};

// Get Student by Id
export const getStudentById = async (id) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/students/${id}`,{
            method:"GET",
            headers:{
                Accept:"application/json",
                Authorization:`Bearer ${token}`,
            }
        });
        if (!res.ok) throw new Error("Failed to fetch Student");
        const data = await res.json();
        return data.data || data;
    } catch (error) {
        console.error("getStudentsByID error:", error.message);
        throw error;
    }
};

// Updating a Student
export const updateStudent = async (id, updatedStudent) => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/students/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json", Accept: "application/json" ,Authorization:`Bearer ${token}`,},
            body: JSON.stringify(updatedStudent)
        });
        if (!res.ok) throw new Error('Failed to update Student');
        return res.json();
    } catch (error) {
        console.error("UpdateStudent error:", error.message);
        throw error;
    }
};

// Search Student
export const searchStudents = async (filters = {}, page, size = 10, sort = 'id') => {
    try {
        const token=localStorage.getItem("token");
        const res = await fetch(`${BASE_URL}/students/search/paginated?page=${page}&size=${size}&sort=${sort}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Authorization:`Bearer ${token}`,
            },
            body: JSON.stringify(filters)
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Failed to Search Students...');
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('searchStudents error:', error.message);
        throw error;
    }
};