import { authFetch } from '../../Authfetch/Authfetch';
import { API_ENDPOINTS } from '../../Constants/Endpoints';

export const getAllLeaveConfigs = async (isActive) => {
  const params = new URLSearchParams();
  if (isActive !== undefined) params.append('isActive', isActive);

  const url = params.toString() ? `${API_ENDPOINTS.LEAVE_CONFIG}?${params.toString()}` : API_ENDPOINTS.LEAVE_CONFIG;
  const res = await authFetch(url, { method: 'GET' });

  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch leave configurations');
  return await res.json();
};

export const getLeaveConfigById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.leaveConfigById(id), { method: 'GET' });
  if (!res.ok) throw new Error(await res.text() || 'Failed to fetch leave configuration');
  return await res.json();
};

export const createLeaveConfig = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_CONFIG, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to create configuration');
  return await res.json();
};

export const updateLeaveConfig = async (id, payload) => {
  const res = await authFetch(API_ENDPOINTS.leaveConfigById(id), {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to update configuration');
  return await res.json();
};

export const deleteLeaveConfig = async (id) => {
  const res = await authFetch(API_ENDPOINTS.leaveConfigById(id), { method: 'DELETE' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to disable configuration');
  return await res.json();
};

export const seedLeaveConfigs = async () => {
  const res = await authFetch(API_ENDPOINTS.LEAVE_CONFIG_SEED, { method: 'POST' });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).message || 'Failed to seed configurations');
  return await res.json();
};