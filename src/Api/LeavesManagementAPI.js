import { authFetch } from "../Authfetch/Authfetch";

const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/leave";

// ==================== LEAVES ENDPOINTS ====================
const leaveStatistics = `/admin/statistics`;
const getAllLeaveReq = `/admin/all`;

// List all statistics
export const getALLLeavesStatistics = async () => {
  try {
    const res = await authFetch(`${BASE_URL + leaveStatistics}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch statistics");
    }
    const data = await res.json();
    return data;
  } catch (error) {                                               // ✅ fixed: was catch (e) but used error
    console.error("get statistics error:", error.message);
    throw error;
  }
}

// List All Leave Request with pagination
export const getAllLeaveRequest = async (page = 0, size = 10, sort = 'id', statusVal = '', leavetypeVal = '', userNameVal = '', fromDateVal = "", toDateVal = "") => {
  try {
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    };

    const formattedFromDate = formatDate(fromDateVal);
    const formattedToDate = formatDate(toDateVal);

    const params = new URLSearchParams();

    const isValidFilter = (value) => {
      if (!value) return false;
      const normalized = value.toString().toLowerCase().trim();
      return normalized !== 'all' && normalized !== 'all status' && normalized !== 'all statu' && normalized !== 'select';
    };

    if (isValidFilter(statusVal)) params.append('status', statusVal);
    if (isValidFilter(leavetypeVal)) params.append('leaveType', leavetypeVal);
    if (isValidFilter(userNameVal)) params.append('userName', userNameVal);
    if (formattedFromDate) params.append('fromDate', formattedFromDate);
    if (formattedToDate) params.append('toDate', formattedToDate);

    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    const url = `${BASE_URL}${getAllLeaveReq}?${params.toString()}`;

    const res = await authFetch(url, {
      method: "GET",
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch all leave request");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Leave request fetch error:", error.message);
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";
    throw new Error(message);
  }
};

// Approve/Reject leave
export const approoveRejLeaveReq = async (leaveId, remarksVal = 'As per the policy', actionVal = 'APPROVED') => {
  try {
    const res = await authFetch(`${BASE_URL}/admin/${leaveId}/review`, {
      method: 'PATCH',
      // ✅ fixed: was "application-Type" which is invalid, Content-Type is set by authFetch
      body: JSON.stringify({
        action: actionVal,
        remarks: remarksVal
      }),
    });
    if (!res.ok) throw new Error('Failed to Approve Leave Request');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to approove/reject leave error:', error.message);
    throw error;
  }
}

// Cancel user leave request
export const CancelUserlLeaveReq = async (leaveId, userId) => {
  try {
    const res = await authFetch(`${BASE_URL}/${leaveId}/cancel?userId=${userId}`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to Reject Leave Request');
    const data = await res.json();
    return data;
  } catch (error) {
    console.error('Failed to Cancell leave req error:', error.message);
    throw error;
  }
}

// New leave request apply for user
export const createLeaveRequest = async (user) => {
  const res = await authFetch(`${BASE_URL}/apply`, {
    method: "POST",
    body: JSON.stringify(user),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const error = new Error(data.message || "Failed to create leave request");
    error.response = {
      data: data,
      status: res.status,
      statusText: res.statusText
    };
    throw error;
  }

  return data;
};

// User leave balance statistics
export const getUsersLeaveBalance = async (userId) => {
  try {
    const res = await authFetch(`${BASE_URL}/user/${userId}/balance`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch leave balance statistics");
    }
    const data = await res.json();
    return data;
  } catch (error) {                                               // ✅ fixed: was catch (e) but used error
    console.error("get user leave balance statistics error:", error.message);
    throw error;
  }
}

// List all requests for specific user
export const getUserLeaveRequest = async (userId) => {
  try {
    const res = await authFetch(`${BASE_URL}/user/${userId}`, {
      method: "GET",
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Request failed with status ${res.status}`);
    }
    const data = await res.json();
    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Network error — please check your internet connection");
    }
    throw error;
  }
}