import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api";


export const attendanceEnroll = async ({ userId, userType, images }) => {
  try {
    if (!userId || !userType) {
      throw new Error("User ID and User Type are required");
    }

    if (!images || images.length !== 5) {
      throw new Error("Exactly 5 images are required");
    }

    const formData = new FormData();
    images.forEach(img => formData.append("images", img));

    const res = await authFetch(
      `${BASE_URL}/attendance/enroll?user_id=${userId}&user_type=${userType}`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data?.message || "Enrollment failed");
    }

    return data;
  } catch (error) {
    console.error("Attendance Enroll Error:", error);
    throw error;
  }
};

// Marked User Attendance
export const markAttendanceByFace = async ({
  imageFile,
  gpsLatitude = "28.6139",
  gpsLongitude = "77.209",
}) => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const url = `${BASE_URL}/attendance/mark?gps_latitude=${gpsLatitude}&gps_longitude=${gpsLongitude}`;

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

// Manual Attendance Request api--->
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

// Approve or Reject manual attendance--->
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

//All Attendance details list
export const allAttendanceDetails = async ({
  attendanceDate,
  role,
  status,
  page = 0,
  size = 10,
  sort = 'id'
} = {}) => {
  try {
    const params = new URLSearchParams()

    if (attendanceDate) params.append('attendance_date', attendanceDate)
    if (role && role !== 'ALL') params.append('user_type', role)
    if (status && status !== 'ALL') params.append('status', status)

    params.append('page', page)
    params.append('size', size)
    params.append('sort', sort)

    const res = await authFetch(
      `${BASE_URL}/attendance/admin/all?${params.toString()}`,
      {
        method: 'GET',
      }
    )

    if (!res.ok) {
      throw new Error('Failed to load attendance details')
    }

    return await res.json()
  } catch (error) {
    console.error('Attendance Details Error:', error)
    throw error
  }
}