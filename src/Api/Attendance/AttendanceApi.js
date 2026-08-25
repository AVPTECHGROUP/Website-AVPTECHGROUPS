import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/** Enroll user face with 5 images */
export const enrollUserFaces = async ({ userId, userType, classId, sectionId, images }) => {
  if (!images || images.length !== 5) {
    throw new Error("Exactly 5 images are required for enrollment");
  }

  const formData = new FormData();
  images.forEach((img) => formData.append("images", img));

  const query = new URLSearchParams({
    user_id: userId,
    ...(userType && { user_type: userType }),
    ...(userType === "STUDENT" && { class_id: classId, section_id: sectionId }),
  }).toString();

  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_ENROLL}?${query}`, {
    method: "POST",
    body: formData,
  });

  const rawText = await res.text();
  let data;
  try {
    data = JSON.parse(rawText);
  } catch {
    throw new Error(`Server returned non-JSON response`);
  }

  if (!res.ok) throw new Error(data?.message || data?.error || "Face enrollment failed");
  return data;
};

/** Mark attendance via staff face */
export const markAttendanceByStafffFace = async ({ imageFile, gpsLatitude = "", gpsLongitude = "" }) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const queryParams = new URLSearchParams();
  if (gpsLatitude) queryParams.append("gps_latitude", gpsLatitude);
  if (gpsLongitude) queryParams.append("gps_longitude", gpsLongitude);

  const queryString = queryParams.toString();
  const url = queryString ? `${API_ENDPOINTS.ATTENDANCE_MARK}?${queryString}` : API_ENDPOINTS.ATTENDANCE_MARK;
  const res = await authFetch(url, { method: "POST", body: formData });

  if (!res.ok) throw new Error(await res.text() || "Face verification failed");
  return await res.json();
};

/** Mark attendance via student face */
export const markAttendanceByFace = async ({ imageFile, user_type, class_id, section_id, gpsLatitude = "", gpsLongitude = "" }) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const queryParams = new URLSearchParams({
    ...(user_type && { user_type }),
    ...(class_id && { class_id }),
    ...(section_id && { section_id }),
  });
  if (gpsLatitude) queryParams.append("gps_latitude", gpsLatitude);
  if (gpsLongitude) queryParams.append("gps_longitude", gpsLongitude);

  const url = `${API_ENDPOINTS.ATTENDANCE_MARK}?${queryParams.toString()}`;
  const res = await authFetch(url, { method: "POST", body: formData });

  if (!res.ok) throw new Error(await res.text() || "Face verification failed");
  return await res.json();
};

/** Request manual attendance review */
export const requestManualAttendance = async ({
  gpsLatitude = "",
  gpsLongitude = "",
  ...payload
}) => {
  if (!payload.userId || !payload.userType || !payload.userName) throw new Error("User details required");
  if (!payload.remarks) throw new Error("Remarks are required");

  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_MANUAL_REVIEW, {
    method: "POST",
    body: JSON.stringify({ ...payload, gpsLatitude, gpsLongitude }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Manual attendance failed");
  return data;
};

/** Get pending approvals */
export const pendingApprovals = async () => {
  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_PENDING, { method: "GET" });
  if (!res.ok) throw new Error("Failed to get pending approvals");
  return (await res.json()).data;
};

/** Approve or reject manual attendance */
export const approveManualAttendance = async ({ attendanceId, ...payload }) => {
  const res = await authFetch(API_ENDPOINTS.attendanceApprove(attendanceId), {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Manual attendance failed");
  return data;
};

/** Get attendance statistics by date */
export const attendanceStatistics = async (date) => {
  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_STATS}?date=${date}`, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch Attendance Statistics");
  return (await res.json()).data;
};

/** Get daily attendance roster */
export const getAttendanceRoster = async (classId, sectionId, date = null) => {
  if (!classId || !sectionId) throw new Error("classId and sectionId are required");

  const query = new URLSearchParams({ class_id: classId, section_id: sectionId, ...(date && { date }) }).toString();
  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_ROSTER}?${query}`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch attendance roster");
  return (await res.json())?.data || {};
};

/** Manually mark attendance */
export const manualMarkAttendance = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_MANUAL_MARK, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to mark attendance");
  return data;
};

/** Unmark attendance (hard delete) */
export const unmarkAttendance = async (attendanceId, reason) => {
  if (!attendanceId) throw new Error("attendanceId is required");

  const res = await authFetch(API_ENDPOINTS.attendanceUnmark(attendanceId), {
    method: "DELETE",
    body: JSON.stringify({ reason }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to unmark attendance");
  return data;
};

/** Process group photo attendance */
export const groupMarkAttendance = async ({
  classId,
  sectionId,
  image,
  gps_latitude,
  gps_longitude,
  gpsLatitude,
  gpsLongitude,
}) => {
  const formData = new FormData();
  formData.append("image", image);

  const lat = gps_latitude || gpsLatitude || "";
  const lng = gps_longitude || gpsLongitude || "";

  const queryParams = new URLSearchParams({
    class_id: classId,
    section_id: sectionId,
  });

  if (lat) queryParams.append("gps_latitude", lat);
  if (lng) queryParams.append("gps_longitude", lng);

  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_GROUP_MARK}?${queryParams.toString()}`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text() || "Failed to process group photo");
  return await res.json();
};

/** Remove face enrollment */
export const removeEnrollment = async ({ userId, userType, classId, sectionId }) => {
  const query = new URLSearchParams({ user_type: userType, ...(userType === "STUDENT" && { class_id: classId, section_id: sectionId }) }).toString();
  const res = await authFetch(`${API_ENDPOINTS.attendanceEnrollUser(userId)}?${query}`, { method: "DELETE" });

  if (!res.ok) throw new Error(await res.text() || "Failed to remove enrollment");
  return await res.json();
};

/** Get staff enrollment list */
export const getStaffEnrollment = async (page = 0, size = 10, sort = "id", status) => {
  const query = new URLSearchParams({ page, size, sort, ...(status && { status }) }).toString();
  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_ENROLL_STAFF}?${query}`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch staff enrollment");
  return await res.json();
};

/** Get general enrollment stats */
export const getEnrollmentStats = async () => {
  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_ENROLL_STATS, { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch stats");
  return await res.json();
};

/** Get section enrollment stats */
export const getSectionEnrollmentStats = async (sectionId) => {
  const res = await authFetch(API_ENDPOINTS.attendanceSectionStats(sectionId), { method: "GET" });
  if (!res.ok) throw new Error("Failed to fetch section stats");
  return await res.json();
};

/** Get student enrollment list */
export const getStudentEnrollment = async (sectionId) => {
  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_ENROLL_STUDENTS}?section_id=${sectionId}`, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch student enrollment");
  return await res.json();
};

/** Retrieve comprehensive attendance details */
export const allAttendanceDetails = async ({
  attendanceDate,
  role,
  status,
  userName,
  userId,
  employeeCode,
  isManualReview,
  page = 0,
  size = 10,
  sort = 'id',
} = {}) => {
  const params = new URLSearchParams();

  if (attendanceDate) params.append('attendance_date', attendanceDate);
  if (role && role !== 'ALL') params.append('user_type', role);
  if (status && status !== 'ALL') params.append('status', status);
  if (userName) params.append('user_name', userName);
  if (userId) params.append('user_id', userId);
  if (employeeCode) params.append('employee_code', employeeCode);
  if (isManualReview !== undefined) params.append('is_manual_review', isManualReview);

  params.append('page', page);
  params.append('size', size);
  params.append('sort', sort);

  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_ALL}?${params.toString()}`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to load attendance details');
  return await res.json();
};

/** Export attendance to CSV */
export const exportAttendanceCSV = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key.replace(/([A-Z])/g, "_$1").toLowerCase(), value);
  });

  const res = await authFetch(`${API_ENDPOINTS.ATTENDANCE_EXPORT_CSV}?${params.toString()}`, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to export CSV');

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `attendance_${filters.attendanceDate || 'today'}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
};

/** Get pending approvals count */
export const getPendingApprovalsCount = async () => {
  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_PENDING_COUNT, { method: 'GET' });
  if (!res.ok) throw new Error('Failed to get pending approvals count');
  return (await res.json()).data;
};

/** User attendance by date range */
export const getUserAttendanceByRange = async ({ userId, userType, startDate, endDate }) => {
  if (!userId || !userType || !startDate || !endDate) throw new Error('Missing required fields');

  const params = new URLSearchParams({ user_type: userType, start_date: startDate, end_date: endDate }).toString();
  const res = await authFetch(`${API_ENDPOINTS.attendanceUser(userId)}?${params}`, { method: 'GET' });

  if (!res.ok) throw new Error('Failed to fetch user attendance');
  return (await res.json()).data;
};

/** User monthly attendance */
export const getUserMonthlyAttendance = async ({ userId, userType, year, month }) => {
  if (!userId || !userType || !year || !month) throw new Error('Missing required fields');

  const params = new URLSearchParams({ user_type: userType, year, month }).toString();
  const res = await authFetch(`${API_ENDPOINTS.attendanceUserMonthly(userId)}?${params}`, { method: 'GET' });

  if (!res.ok) throw new Error('Failed to fetch monthly attendance');
  return (await res.json()).data;
};

/** User today's attendance */
export const getUserTodayAttendance = async ({ userId, userType }) => {
  if (!userId || !userType) throw new Error('userId and userType are required');

  const params = new URLSearchParams({ user_type: userType }).toString();
  const res = await authFetch(`${API_ENDPOINTS.attendanceUserToday(userId)}?${params}`, { method: 'GET' });

  if (!res.ok) throw new Error("Failed to fetch today's attendance");
  return (await res.json()).data;
};

/** Bulk manual mark attendance for students */
export const bulkManualMarkAttendance = async (payload) => {
  if (!payload.classId || !payload.sectionId || !payload.students?.length) {
    throw new Error("classId, sectionId and students are required");
  }

  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_MANUAL_MARK_BULK, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to bulk mark attendance");
  return data;
};

/** Bulk manual staff attendance */
export const bulkManualStaffAttendance = async (payload) => {
  if (!payload.attendanceDate || !payload.staff?.length) {
    throw new Error("attendanceDate and staff array are required");
  }

  const res = await authFetch(API_ENDPOINTS.ATTENDANCE_MANUAL_REVIEW_BULK, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to bulk mark staff attendance");
  return data;
};

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
      `${API_ENDPOINTS.ATTENDANCE_SUMMARY_CARD}${query}`,
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