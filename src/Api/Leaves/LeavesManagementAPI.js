import { authFetch } from "../../Authfetch/Authfetch";
import {API_ENDPOINTS} from "../../Constants/Endpoints";

export const getALLLeavesStatistics = async () => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_ADMIN_STATS, { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch statistics");
  return await res.json();
};

export const getAllLeaveRequest = async (page = 0, size = 10, sort = 'id', statusVal = '', leavetypeVal = '', userNameVal = '', fromDateVal = "", toDateVal = "") => {
  const formatDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
  };

  const params = new URLSearchParams({ page, size, sort });

  const isValidFilter = (val) => {
    if (!val) return false;
    const normalized = val.toString().toLowerCase().trim();
    return !['all', 'all status', 'all statu', 'select'].includes(normalized);
  };

  if (isValidFilter(statusVal)) params.append('status', statusVal);
  if (isValidFilter(leavetypeVal)) params.append('leaveType', leavetypeVal);
  if (isValidFilter(userNameVal)) params.append('userName', userNameVal);

  const formattedFrom = formatDate(fromDateVal);
  const formattedTo = formatDate(toDateVal);
  if (formattedFrom) params.append('fromDate', formattedFrom);
  if (formattedTo) params.append('toDate', formattedTo);

  const res = await authFetch(`${API_ENDPOINTS.LEAVE_ADMIN_ALL}?${params.toString()}`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch leave requests");
  return await res.json();
};

export const approoveRejLeaveReq = async (leaveId, remarksVal = 'As per the policy', actionVal = 'APPROVED') => {
  const res = await authFetch(API_ENDPOINTS.leaveAdminReview(leaveId), {
    method: 'PATCH',
    body: JSON.stringify({ action: actionVal, remarks: remarksVal }),
  });
  if (!res.ok) throw new Error('Failed to Review Leave Request');
  return await res.json();
};

export const CancelUserlLeaveReq = async (leaveId, userId) => {
  const res = await authFetch(`${API_ENDPOINTS.leaveCancel(leaveId)}?userId=${userId}`, { method: 'PATCH' });
  if (!res.ok) throw new Error('Failed to Cancel Leave Request');
  return await res.json();
};

export const createLeaveRequest = async (user) => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_APPLY, {
    method: "POST",
    body: JSON.stringify(user),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};

  if (!res.ok) {
    const error = new Error(data.message || "Failed to create leave request");
    error.response = { data, status: res.status, statusText: res.statusText };
    throw error;
  }
  return data;
};

export const getUsersLeaveBalance = async (userId) => {
  const res = await authFetch(API_ENDPOINTS.leaveUserBalance(userId), { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch leave balance");
  return await res.json();
};

export const getUserLeaveRequest = async (userId) => {
  try {
    const res = await authFetch(API_ENDPOINTS.leaveUserRequests(userId), { method: "GET" });
    if (!res.ok) throw new Error((await res.json()).message || `Request failed with status ${res.status}`);
    return await res.json();
  } catch (error) {
    if (error.name === "TypeError" && error.message === "Failed to fetch") {
      throw new Error("Network error — please check your internet connection");
    }
    throw error;
  }
};