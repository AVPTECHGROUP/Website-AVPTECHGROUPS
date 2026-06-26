import { authFetch } from '../../Authfetch/Authfetch';
import { API_ENDPOINTS } from '../../Constants/Endpoints';

// ==================== Circulars API ====================
export const CircularsAPI = {
  getAll: (params = {}) =>
    authFetch(`${API_ENDPOINTS.CIRCULARS}?${new URLSearchParams(params)}`),

  getById: (id) => authFetch(API_ENDPOINTS.circularById(id)),

  create: (body) =>
    authFetch(API_ENDPOINTS.CIRCULARS, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadAttachment: (id, fd) =>
    authFetch(API_ENDPOINTS.circularAttachments(id), {
      method: 'POST',
      body: fd,
    }),

  approve: (id) =>
    authFetch(API_ENDPOINTS.circularApprove(id), { method: 'PATCH' }),

  reject: (id, reason) =>
    authFetch(API_ENDPOINTS.circularReject(id), {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  delete: (id) =>
    authFetch(API_ENDPOINTS.circularById(id), { method: 'DELETE' }),

  getPendingApproval: () => authFetch(API_ENDPOINTS.CIRCULARS_PENDING),
};

// ==================== School Events API ====================
export const SchoolEventsAPI = {
  getAll: (params = {}) =>
    authFetch(`${API_ENDPOINTS.SCHOOL_EVENTS}?${new URLSearchParams(params)}`),

  getById: (id) => authFetch(API_ENDPOINTS.eventById(id)),

  create: (body) =>
    authFetch(API_ENDPOINTS.SCHOOL_EVENTS, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadAttachment: (id, fd) =>
    authFetch(API_ENDPOINTS.eventAttachments(id), {
      method: 'POST',
      body: fd,
    }),

  approve: (id) =>
    authFetch(API_ENDPOINTS.eventApprove(id), { method: 'PATCH' }),

  cancel: (id) =>
    authFetch(API_ENDPOINTS.eventById(id), { method: 'DELETE' }),

  getPendingApproval: () => authFetch(API_ENDPOINTS.EVENTS_PENDING),
};

// ==================== Notifications API ====================
export const NotificationsAPI = {
  getAll: (params = {}) =>
    authFetch(`${API_ENDPOINTS.NOTIFICATIONS}?${new URLSearchParams(params)}`),

  registerUserToken: (body) =>
    authFetch(API_ENDPOINTS.USER_DEVICE_TOKEN, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  registerParentToken: (body) =>
    authFetch(API_ENDPOINTS.PARENT_DEVICE_TOKEN, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};