import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = import.meta.env.VITE_API_BASE;

// Enroll Face (Upload 5 Images)
export const enrollUserFaces = async ({
  userId,
  userType,
  classId,
  sectionId,
  images, // array of 5 files
}) => {
  try {
    // 🔹 Validation (important)
    if (!images || images.length !== 5) {
      throw new Error("Exactly 5 images are required for enrollment");
    }

    const formData = new FormData();

    // append all 5 images
    images.forEach((img) => {
      formData.append("images", img);
    });

    // query params
    const query = new URLSearchParams({
      user_id: userId,
      ...(userType && { user_type: userType }),
      ...(userType === "STUDENT" && { class_id: classId }),
      ...(userType === "STUDENT" && { section_id: sectionId }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/enroll?${query}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const rawText = await res.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      throw new Error(`Server returned non-JSON response: ${rawText.slice(0, 200)}`);
    }

    if (!res.ok) {
      const errMsg =
        data?.message ||
        data?.error ||
        "Face enrollment failed";
      throw new Error(errMsg);
    }

    return data;
  } catch (error) {
    console.error("enrollUserFaces error:", error.message);
    throw error;
  }
};


export const markAttendanceByStafffFace = async ({
  imageFile,
  gpsLatitude = "28.6139",
  gpsLongitude = "77.209",
}) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    // ✅ URL me bhejna hai toh yahan daal
    const url = `${BASE_URL}/attendance/mark?gps_latitude=${gpsLatitude}&gps_longitude=${gpsLongitude}`;

    console.log("Calling API:", url);

    const res = await authFetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Face verification failed");
    }

    return await res.json();

  } catch (error) {
    console.error("Attendance Mark Error:", error);
    throw error;
  }
};

export const markAttendanceByFace = async ({
  imageFile,
  user_type,
  class_id,
  section_id,
  gpsLatitude = "28.6139",
  gpsLongitude = "77.209",
}) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const url = `${BASE_URL}/attendance/mark?user_type=${user_type}&class_id=${class_id}&section_id=${section_id}&gps_latitude=${gpsLatitude}&gps_longitude=${gpsLongitude}`;

    const res = await authFetch(url, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "Face verification failed");
    }

    return await res.json();

  } catch (error) {
    console.error("Attendance Mark Error:", error);
    throw error;
  }
};

// Manual Attendance Request
export const requestManualAttendance = async ({
  userId,
  userType,
  userName,
  gpsLatitude = 28.6139,
  gpsLongitude = 77.209,
  remarks
}) => {
  try {
    if (!userId || !userType || !userName) {
      throw new Error("User ID and User Type are required");
    }

    if (!remarks) {
      throw new Error("Remarks are required");
    }

    const res = await authFetch(`${BASE_URL}/attendance/manual-review`, {
      method: "POST",
      body: JSON.stringify({
        userId,
        userType,
        userName,
        gpsLatitude,
        gpsLongitude,
        remarks,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Manual attendance failed");
    }

    return data;
  } catch (error) {
    console.error("Manual Attendance Error:", error);
    throw error;
  }
};

// Pending Approvals Request
export const pendingApprovals = async () => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/pending-approvals`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to get pending approvals");
    }

    const data = await res.json();

    return data.data;
  } catch (error) {
    console.error("Pending Approval Error:", error);
    throw error;
  }
};

// Approve or Reject manual attendance
export const approveManualAttendance = async ({
  attendanceId,
  approved,
  remarks,
  overrideStatus,
}) => {
  try {
    const res = await authFetch(`${BASE_URL}/attendance/${attendanceId}/approve`,
      {
        method: "POST",
        body: JSON.stringify({
          approved,
          remarks,
          overrideStatus,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Manual attendance failed");
    }
    return data;
  } catch (error) {
    console.error("Manual Attendance Error:", error);
    throw error;
  }
};

// Attendance Statistics
export const attendanceStatistics = async (date) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/admin/statistics?date=${date}`,
      {
        method: "GET",
      }
    );
    if (!res.ok) {
      throw new Error("Failed to fetch Attendance Statistics");
    }
    const response = await res.json();
    return response.data;
  } catch (error) {
    console.error("Attendance Statistics Error:", error);
    throw error;
  }
};

// Get Attendance Roster (Full table for UI)
export const getAttendanceRoster = async (classId, sectionId, date = null) => {
  try {
    if (!classId || !sectionId) {
      throw new Error("classId and sectionId are required");
    }

    const query = new URLSearchParams({
      class_id: classId,
      section_id: sectionId,
      ...(date && { date }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/students/roster?${query}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || "Failed to fetch attendance roster");
    }

    const data = await res.json();
    return data?.data || {};
  } catch (error) {
    console.error("getAttendanceRoster error:", error.message);
    throw error;
  }
};

// Manually mark attendance
export const manualMarkAttendance = async (payload) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/students/manual-mark`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to mark attendance");
    }

    return data;
  } catch (error) {
    console.error("manualMarkAttendance error:", error.message);
    throw error;
  }
};

// Remove attendance record (hard delete)
export const unmarkAttendance = async (attendanceId, reason) => {
  try {
    if (!attendanceId) {
      throw new Error("attendanceId is required");
    }

    const res = await authFetch(
      `${BASE_URL}/attendance/students/${attendanceId}/unmark`,
      {
        method: "DELETE",
        body: JSON.stringify({ reason }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Failed to unmark attendance");
    }

    return data;
  } catch (error) {
    console.error("unmarkAttendance error:", error.message);
    throw error;
  }
};

// ===============================
// 📸 Group Photo Attendance
// ===============================
export const groupMarkAttendance = async ({
  classId,
  sectionId,
  image,
  gps_latitude,
  gps_longitude,
}) => {
  try {
    const formData = new FormData();
    formData.append("image", image);

    const query = new URLSearchParams({
      class_id: classId,
      section_id: sectionId,
      ...(gps_latitude && { gps_latitude }),
      ...(gps_longitude && { gps_longitude }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/students/group-mark?${query}`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to process group photo");
    }

    return await res.json();
  } catch (error) {
    console.error("groupMarkAttendance error:", error.message);
    throw error;
  }
};

//  Remove Face Enrollment
export const removeEnrollment = async ({
  userId,
  userType,
  classId,
  sectionId,
}) => {
  try {
    const query = new URLSearchParams({
      user_type: userType,
      ...(userType === "STUDENT" && { class_id: classId }),
      ...(userType === "STUDENT" && { section_id: sectionId }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/enrollment/${userId}?${query}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to remove enrollment");
    }

    return await res.json();
  } catch (error) {
    console.error("removeEnrollment error:", error.message);
    throw error;
  }
};

//  Staff Enrollment List
export const getStaffEnrollment = async (
  page = 0,
  size = 10,
  sort = "id",
  status
) => {
  try {
    const query = new URLSearchParams({
      page,
      size,
      sort,
      ...(status && { status }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/enrollment/staff?${query}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch staff enrollment");
    }

    return await res.json();
  } catch (error) {
    console.error("getStaffEnrollment error:", error.message);
    throw error;
  }
};

// ===============================
// 📊 Enrollment Stats
// ===============================
export const getEnrollmentStats = async () => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/enrollment/stats`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch stats");

    return await res.json();
  } catch (error) {
    console.error("getEnrollmentStats error:", error.message);
    throw error;
  }
};

// ===============================
// 📊 Section Stats
// ===============================
export const getSectionEnrollmentStats = async (sectionId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/enrollment/stats/section/${sectionId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) throw new Error("Failed to fetch section stats");

    return await res.json();
  } catch (error) {
    console.error("getSectionEnrollmentStats error:", error.message);
    throw error;
  }
};

// ===============================
// 🎓 Student Enrollment List
// ===============================
export const getStudentEnrollment = async (sectionId) => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/enrollment/students?section_id=${sectionId}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch student enrollment");
    }

    return await res.json();
  } catch (error) {
    console.error("getStudentEnrollment error:", error.message);
    throw error;
  }
};

export const allAttendanceDetails = async ({
  attendanceDate,
  role,
  status,
  userName,        // ✅ new
  userId,          // ✅ new
  employeeCode,    // ✅ new
  isManualReview,  // ✅ new
  page = 0,
  size = 10,
  sort = 'id'
} = {}) => {
  try {
    const params = new URLSearchParams()

    if (attendanceDate) params.append('attendance_date', attendanceDate)
    if (role && role !== 'ALL') params.append('user_type', role)
    if (status && status !== 'ALL') params.append('status', status)
    if (userName) params.append('user_name', userName)           // ✅ new
    if (userId) params.append('user_id', userId)                 // ✅ new
    if (employeeCode) params.append('employee_code', employeeCode) // ✅ new
    if (isManualReview !== undefined) params.append('is_manual_review', isManualReview) // ✅ new

    params.append('page', page)
    params.append('size', size)
    params.append('sort', sort)

    const res = await authFetch(
      `${BASE_URL}/attendance/admin/all?${params.toString()}`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error('Failed to load attendance details')

    return await res.json()
  } catch (error) {
    console.error('Attendance Details Error:', error)
    throw error
  }
}

// ===============================
// 📥 Export Attendance CSV      ✅ new
// ===============================
export const exportAttendanceCSV = async ({
  attendanceDate,
  userType,
  status,
  userName,
} = {}) => {
  try {
    const params = new URLSearchParams()
    if (attendanceDate) params.append('attendance_date', attendanceDate)
    if (userType) params.append('user_type', userType)
    if (status) params.append('status', status)
    if (userName) params.append('user_name', userName)

    const res = await authFetch(
      `${BASE_URL}/attendance/admin/export-csv?${params.toString()}`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error('Failed to export CSV')

    // Return blob for download
    const blob = await res.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `attendance_${attendanceDate || 'today'}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  } catch (error) {
    console.error('exportAttendanceCSV error:', error)
    throw error
  }
}

// ===============================
// 🔢 Pending Approvals Count    ✅ new
// ===============================
export const getPendingApprovalsCount = async () => {
  try {
    const res = await authFetch(
      `${BASE_URL}/attendance/pending-approvals/count`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error('Failed to get pending approvals count')

    const data = await res.json()
    return data.data  // returns number
  } catch (error) {
    console.error('getPendingApprovalsCount error:', error)
    throw error
  }
}

// ===============================
// 📅 User Attendance by Date Range  ✅ new
// ===============================
export const getUserAttendanceByRange = async ({
  userId,
  userType,
  startDate,
  endDate,
}) => {
  try {
    if (!userId || !userType || !startDate || !endDate) {
      throw new Error('userId, userType, startDate, endDate are required')
    }

    const params = new URLSearchParams({
      user_type: userType,
      start_date: startDate,
      end_date: endDate,
    }).toString()

    const res = await authFetch(
      `${BASE_URL}/attendance/user/${userId}?${params}`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error('Failed to fetch user attendance')

    const data = await res.json()
    return data.data
  } catch (error) {
    console.error('getUserAttendanceByRange error:', error)
    throw error
  }
}

// ===============================
// 📆 User Monthly Attendance    ✅ new
// ===============================
export const getUserMonthlyAttendance = async ({
  userId,
  userType,
  year,
  month,
}) => {
  try {
    if (!userId || !userType || !year || !month) {
      throw new Error('userId, userType, year, month are required')
    }

    const params = new URLSearchParams({
      user_type: userType,
      year,
      month,
    }).toString()

    const res = await authFetch(
      `${BASE_URL}/attendance/user/${userId}/monthly?${params}`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error('Failed to fetch monthly attendance')

    const data = await res.json()
    return data.data
  } catch (error) {
    console.error('getUserMonthlyAttendance error:', error)
    throw error
  }
}

// ===============================
// 📍 User Today's Attendance    ✅ new
// ===============================
export const getUserTodayAttendance = async ({ userId, userType }) => {
  try {
    if (!userId || !userType) {
      throw new Error('userId and userType are required')
    }

    const params = new URLSearchParams({ user_type: userType }).toString()

    const res = await authFetch(
      `${BASE_URL}/attendance/user/${userId}/today?${params}`,
      { method: 'GET' }
    )

    if (!res.ok) throw new Error("Failed to fetch today's attendance")

    const data = await res.json()
    return data.data
  } catch (error) {
    console.error("getUserTodayAttendance error:", error)
    throw error
  }
}

// ===============================
// 👨‍🎓 Bulk Manual Mark Attendance
// ===============================
export const bulkManualMarkAttendance = async (payload) => {
  try {
    if (!payload.classId || !payload.sectionId || !payload.students?.length) {
      throw new Error(
        "classId, sectionId and students are required"
      );
    }

    const res = await authFetch(
      `${BASE_URL}/attendance/students/manual-mark/bulk`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message || "Failed to bulk mark attendance"
      );
    }

    return data;

  } catch (error) {
    console.error(
      "bulkManualMarkAttendance error:",
      error.message
    );
    throw error;
  }
};
//  Bulk Manual Staff Attendance
export const bulkManualStaffAttendance = async (payload) => {
  try {
    if (
      !payload.attendanceDate ||
      !payload.staff?.length
    ) {
      throw new Error(
        "attendanceDate and staff array are required"
      );
    }

    const res = await authFetch(
      `${BASE_URL}/attendance/manual-review/bulk`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        data?.message || "Failed to bulk mark staff attendance"
      );
    }

    return data;

  } catch (error) {
    console.error(
      "bulkManualStaffAttendance error:",
      error.message
    );
    throw error;
  }
};
// shivam->
// Attendance Summary
export const getAttendanceSummary = async ({
  classId,
  sectionId,
  date,
  year,
  month,
  atRiskThreshold,
}) => {
  try {
    if (!classId || !sectionId) {
      throw new Error("classId and sectionId are required");
    }

    const query = new URLSearchParams({
      class_id: classId,
      section_id: sectionId,
      ...(date && { date }),
      ...(year && { year }),
      ...(month && { month }),
      ...(atRiskThreshold && {
        at_risk_threshold: atRiskThreshold,
      }),
    }).toString();

    const res = await authFetch(
      `${BASE_URL}/attendance/students/summary?${query}`,
      {
        method: "GET",
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(
        errText || "Failed to fetch attendance summary"
      );
    }

    const data = await res.json();
    return data?.data || {};
  } catch (error) {
    console.error(
      "getAttendanceSummary error:",
      error.message
    );
    throw error;
  }
};