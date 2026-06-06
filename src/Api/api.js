import { authFetch } from '../Authfetch/Authfetch';
const BASE_URL = import.meta.env.VITE_API_BASE_V1;

export const CircularsAPI = {
  getAll: (params = {}) =>
    authFetch(`${BASE_URL}/circulars?${new URLSearchParams(params)}`),

  getById: (id) => authFetch(`${BASE_URL}/circulars/${id}`),

  create: (body) =>
    authFetch(`${BASE_URL}/circulars`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadAttachment: (id, fd) =>
    authFetch(`${BASE_URL}/circulars/${id}/attachments`, {
      method: 'POST',
      body: fd,
    }),

  approve: (id) =>
    authFetch(`${BASE_URL}/circulars/${id}/approve`, {
      method: 'PATCH',
    }),

  reject: (id, reason) =>
    authFetch(`${BASE_URL}/circulars/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  delete: (id) =>
    authFetch(`${BASE_URL}/circulars/${id}`, {
      method: 'DELETE',
    }),

  getPendingApproval: () => authFetch(`${BASE_URL}/circulars/pending-approval`),
};

export const SchoolEventsAPI = {
  getAll: (params = {}) =>
    authFetch(`${BASE_URL}/school-events?${new URLSearchParams(params)}`),

  getById: (id) => authFetch(`${BASE_URL}/school-events/${id}`),

  create: (body) =>
    authFetch(`${BASE_URL}/school-events`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  uploadAttachment: (id, fd) =>
    authFetch(`${BASE_URL}/school-events/${id}/attachments`, {
      method: 'POST',
      body: fd,
    }),

  approve: (id) =>
    authFetch(`${BASE_URL}/school-events/${id}/approve`, {
      method: 'PATCH',
    }),

  cancel: (id) =>
    authFetch(`${BASE_URL}/school-events/${id}`, {
      method: 'DELETE',
    }),

  getPendingApproval: () =>
    authFetch(`${BASE_URL}/school-events/pending-approval`),
};

export const NotificationsAPI = {
  getAll: (params = {}) =>
    authFetch(`${BASE_URL}/notifications?${new URLSearchParams(params)}`),

  registerUserToken: (body) =>
    authFetch(`${BASE_URL}/notifications/device-token/user`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  registerParentToken: (body) =>
    authFetch(`${BASE_URL}/notifications/device-token/parent`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
};
