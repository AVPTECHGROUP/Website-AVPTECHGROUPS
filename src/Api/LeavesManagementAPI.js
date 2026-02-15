const BASE_URL = "https://ssdev-btgphuazhza9edcu.canadacentral-01.azurewebsites.net/api/leave";

// ==================== LEAVES ENDPOINTS ====================
const leaveStatistics = `/admin/statistics`;
const getAllLeaveReq = `/admin/all`;

//List all statistics
export const getALLLeavesStatistics = async () => {
  try {
    const res = await fetch(`${BASE_URL + leaveStatistics}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch statistics");
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("get statistics error:", error.message);
    throw error;
  }
}

// List All Leave Request with pagination 
export const getAllLeaveRequest = async (page = 0, size = 10, sort = 'id', statusVal = '', leavetypeVal = '', userNameVal = '', fromDateVal = "", toDateVal = "") => {
  try {
    // Format date to yyyy-mm-dd
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      if (isNaN(d.getTime())) return null;
      return d.toISOString().split('T')[0];
    };

    // Format dates
    const formattedFromDate = formatDate(fromDateVal);
    const formattedToDate = formatDate(toDateVal);

    // Build query parameters
    const params = new URLSearchParams();

    // Helper to check if value should be included (not empty, not "All Status" placeholders)
    const isValidFilter = (value) => {
      if (!value) return false;
      const normalized = value.toString().toLowerCase().trim();
      return normalized !== 'all' && normalized !== 'all status' && normalized !== 'all statu' && normalized !== 'select';
    };

    // Add optional filters only if valid
    if (isValidFilter(statusVal)) params.append('status', statusVal);

    if (isValidFilter(leavetypeVal)) params.append('leaveType', leavetypeVal);

    if (isValidFilter(userNameVal)) params.append('userName', userNameVal);

    if (formattedFromDate) params.append('fromDate', formattedFromDate);

    if (formattedToDate) params.append('toDate', formattedToDate);

    // Always include pagination and sort
    params.append('page', page);
    params.append('size', size);
    params.append('sort', sort);

    // Build final URL
    const url = `${BASE_URL}${getAllLeaveReq}?${params.toString()}`;

    const res = await fetch(url);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch all leave request");
    }

    const data = await res.json();
    return data;

  } catch (error) {
    console.error("Leave request fetch error:", error.message);
    throw error;
  }
};

//for approove leave 
export const approoveRejLeaveReq = async (leaveId, remarksVal = 'As per the policy', actionVal = 'APPROVED') => {
  try {
    const res = await fetch(`${BASE_URL}/admin/${leaveId}/review`, {
      method: 'PATCH',
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(
        {
          action: actionVal,
          remarks: remarksVal
        }
      ),
    })
    if (!res.ok) throw new Error('Failed to Approve Leave Request');
    const data = await res.json()
    return data;
  } catch (error) {
    console.error('Failed to approove/reject leave error:', error.message);
    throw error;
  }
}

//for reject leave 
export const CancelUserlLeaveReq = async (leaveId, userId) => {
  try {
    const res = await fetch(`${BASE_URL}/${leaveId}/cancel?userId=${userId}`, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json'
      }
    })
    if (!res.ok) throw new Error('Failed to Reject Leave Request');
    const data = await res.json()
    return data;
  } catch (error) {
    console.error('Failed to Cancell leave req error:', error.message);
    throw error;
  }
}
// new leave request apply for user
export const createLeaveRequest = async (user) => {
  const res = await fetch(`${BASE_URL}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify(user),
  });

  const text = await res.text();
  console.log("User leave request created successfully:", text);

  if (!res.ok) {
    throw new Error(text || "Failed to create leave request");
  }

  return text ? JSON.parse(text) : {};
};

// user balance statistics
//List all statistics
export const getUsersLeaveBalance = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL + `/user/${userId}/balance`}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch leave balance statistics");
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("get user leave balance statistics error:", error.message);
    throw error;
  }
}


//List all request for specific user
export const getUserLeaveRequest = async (userId) => {
  try {
    const res = await fetch(`${BASE_URL + `/user/${userId}`}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || "Failed to fetch leave req statistics");
    }
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("get user leave balance req error:", error.message);
    throw error;
  }
}
