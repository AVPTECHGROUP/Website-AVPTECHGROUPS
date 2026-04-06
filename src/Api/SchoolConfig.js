import { authFetch } from "../Authfetch/Authfetch";


const BASE_URL = import.meta.env.VITE_API_BASE_DOUBLE_V1;

export const getSchools = async ({
  page,
  size,
  search,
  isActive,
  board,
} = {}) => {
  try {
    const params = new URLSearchParams();

    if (page !== undefined) params.append("page", page);
    if (size !== undefined) params.append("size", size);
    if (search) params.append("search", search.trim());
    if (isActive !== undefined) params.append("isActive", isActive);
    if (board) params.append("board", board);

    const url = `${BASE_URL}/schools${params.toString() ? `?${params.toString()}` : ""}`;

    console.log("API URL:", url); // debug

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to fetch schools");
    }

    return await res.json();
  } catch (error) {
    console.error("Get Schools Error:", error.message);
    throw error;
  }
};

export const createSchool = async (payload) => {
  try {
    const res = await authFetch(`${BASE_URL}/schools`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to create school");
    }

    return await res.json();
  } catch (error) {
    console.error("Create School Error:", error.message);
    throw error;
  }
};

export const getSchoolById = async (id) => {
  try {
    if (!id) throw new Error("School ID is required");

    const res = await authFetch(`${BASE_URL}/schools/${id}`, {
      method: "GET",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to fetch school");
    }

    return await res.json();
  } catch (error) {
    console.error("Get School By ID Error:", error.message);
    throw error;
  }
};

export const updateSchool = async (id, payload) => {
  try {
    if (!id) throw new Error("School ID is required");

    const res = await authFetch(`${BASE_URL}/schools/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to update school");
    }

    return await res.json();
  } catch (error) {
    console.error("Update School Error:", error.message);
    throw error;
  }
};

export const activateSchool = async (id) => {
  try {
    if (!id) throw new Error("School ID is required");

    const res = await authFetch(`${BASE_URL}/schools/${id}/activate`, {
      method: "PATCH",
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to activate school");
    }

    return await res.json(); // or res.text() depending on backend
  } catch (error) {
    console.error("Activate School Error:", error.message);
    throw error;
  }
};

export const getAttendanceConfig = async (schoolId) => {
  try {
    if (!schoolId) throw new Error("School ID is required");

    const res = await authFetch(
      `${BASE_URL}/schools/${schoolId}/attendance-config`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to fetch attendance config");
    }

    return await res.json();
  } catch (error) {
    console.error("Get Attendance Config Error:", error.message);
    throw error;
  }
};

export const updateAttendanceConfig = async (schoolId, payload) => {
  try {
    if (!schoolId) throw new Error("School ID is required");

    const res = await authFetch(
      `${BASE_URL}/schools/${schoolId}/attendance-config`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Failed to update attendance config");
    }

    return await res.json();
  } catch (error) {
    console.error("Update Attendance Config Error:", error.message);
    throw error;
  }
};

export const deactivateSchool = async (id) => {
  const res = await authFetch(`${BASE_URL}/schools/${id}/deactivate`, {
    method: "PATCH",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to deactivate school");
  }

  return await res.json();
};

export const uploadSchoolLogo = async (id, file) => {
  const formData = new FormData();
  formData.append("file", file); // change key if backend expects different

  const res = await authFetch(`${BASE_URL}/schools/${id}/logo`, {
    method: "PATCH",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to upload logo");
  }

  return await res.json();
};

export const getActiveSchools = async () => {
  const res = await authFetch(`${BASE_URL}/schools/active`, {
    method: "GET",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch active schools");
  }

  return await res.json();
};

export const getMySchools = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.page !== undefined) params.append("page", filters.page);
  if (filters.size !== undefined) params.append("size", filters.size);
  if (filters.search) params.append("search", filters.search.trim());
  if (filters.board) params.append("board", filters.board);
  if (filters.isActive !== undefined) params.append("isActive", filters.isActive);

  const url = `${BASE_URL}/schools/my-schools${params.toString() ? `?${params.toString()}` : ""
    }`;

  const res = await authFetch(url, {
    method: "GET",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch my schools");
  }

  return await res.json();
};

export const getMyStats = async () => {
  const res = await authFetch(`${BASE_URL}/schools/my-stats`, {
    method: "GET",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch stats");
  }

  return await res.json();
};

export const getSchoolsStats = async () => {
  const res = await authFetch(`${BASE_URL}/schools/stats`, {
    method: "GET",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || "Failed to fetch schools stats");
  }

  return await res.json();
};