import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE_DOUBLE_V1;


// Listing of Students
export const getStudents = async (page = 0, size = 10, sort = 'id') => {
  try {
    const res = await authFetch(`${BASE_URL}/students/paginated?page=${page}&size=${size}&sort=${sort}`, {
      method: "GET",
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
// Create Students
export const createStudents = async (studentData, imageFile) => {
  try {
    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(studentData)], {
        type: "application/json",
      })
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await authFetch(`${BASE_URL}/students`, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to create student");
    }

    return data;
  } catch (error) {
    console.error("CREATE STUDENT ERROR:", error.message);
    throw error;
  }
};

// Get Student by Id
export const getStudentById = async (id) => {
  try {
    const res = await authFetch(`${BASE_URL}/students/${id}`, {
      method: "GET",
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(
        data?.message || data?.error || "Failed to fetch student"
      );
    }
    return data?.data; 
  } catch (error) {
    console.error("getStudentById error:", error.message);
    throw error;
  }
};

export const getStudentByClass = async (id) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/students/class/${id}?status=ACTIVE`,
      {
        method: "GET",
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message || data?.error || "Failed to fetch student"
      );
    }

    return data?.data;
  } catch (error) {
    console.error("getStudentByClass error:", error.message);
    throw error;
  }
};

export const updateStudent = async (id, updatedStudent, imageFile) => {
  try {
    const formData = new FormData();

    formData.append(
      "data",
      new Blob([JSON.stringify(updatedStudent)], {
        type: "application/json",
      })
    );

    if (imageFile) {
      formData.append("image", imageFile);
    }

    const res = await authFetch(`${BASE_URL}/students/${id}`, {
      method: "PUT",
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to update student");
    }

    return data;
  } catch (error) {
    console.error("UPDATE STUDENT ERROR:", error.message);
    throw error;
  }
};

export const searchStudents = async (
  filters = {},
  page = 0,
  size = 10,
  sort = ['id']
) => {
  try {
    const pageable = encodeURIComponent(
      JSON.stringify({
        page,
        size,
        sort,
      })
    );

    const res = await authFetch(
      `${BASE_URL}/students/search/paginated?pageable=${pageable}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      }
    );

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

// Get Students by Section (with optional status filter)
export const getStudentsBySection = async (sectionId, status = "ACTIVE") => {
  try {
    if (!sectionId) {
      throw new Error("sectionId is required");
    }

    const query = status ? `?status=${status}` : "";

    const res = await authFetch(
      `${BASE_URL}/students/section/${sectionId}${query}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch students by section");
    }

    const data = await res.json();

    // return only data array (consistent with your other APIs)
    return data?.data || [];
  } catch (error) {
    console.error("getStudentsBySection error:", error.message);
    throw error;
  }
};