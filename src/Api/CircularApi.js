import { CircularsAPI, SchoolEventsAPI, NotificationsAPI } from './api';

// ─── Circulars ────────────────────────────────────────────────────────────────

export const fetchCirculars = async (params = {}) => {
  try {
    const res = await CircularsAPI.getAll(params);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load circulars' };
  }
};

export const fetchCircularById = async (id) => {
  try {
    const res = await CircularsAPI.getById(id);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load circular' };
  }
};

export const createCircular = async (body) => {
  try {
    const res = await CircularsAPI.create(body);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Failed to create circular' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to create circular' };
  }
};

export const uploadCircularAttachment = async (id, formData) => {
  try {
    const res = await CircularsAPI.uploadAttachment(id, formData);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Upload failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Upload failed' };
  }
};

export const approveCircular = async (id) => {
  try {
    const res = await CircularsAPI.approve(id);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Approval failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Approval failed' };
  }
};

export const rejectCircular = async (id, reason = '') => {
  try {
    const res = await CircularsAPI.reject(id, reason);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Rejection failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Rejection failed' };
  }
};

export const deleteCircular = async (id) => {
  try {
    const res = await CircularsAPI.delete(id);
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Delete failed' };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message || 'Delete failed' };
  }
};

export const fetchPendingCirculars = async () => {
  try {
    const res = await CircularsAPI.getPendingApproval();
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load pending circulars' };
  }
};

// ─── School Events ────────────────────────────────────────────────────────────

export const fetchEvents = async (params = {}) => {
  try {
    const res = await SchoolEventsAPI.getAll(params);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load events' };
  }
};

export const fetchEventById = async (id) => {
  try {
    const res = await SchoolEventsAPI.getById(id);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load event' };
  }
};

export const createEvent = async (body) => {
  try {
    const res = await SchoolEventsAPI.create(body);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Failed to create event' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to create event' };
  }
};

export const uploadEventAttachment = async (id, formData) => {
  try {
    const res = await SchoolEventsAPI.uploadAttachment(id, formData);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Upload failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Upload failed' };
  }
};

export const approveEvent = async (id) => {
  try {
    const res = await SchoolEventsAPI.approve(id);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Approval failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Approval failed' };
  }
};

export const cancelEvent = async (id) => {
  try {
    const res = await SchoolEventsAPI.cancel(id);
    if (!res.ok) {
      const data = await res.json();
      return { success: false, error: data.message || 'Cancel failed' };
    }
    return { success: true, error: null };
  } catch (err) {
    return { success: false, error: err.message || 'Cancel failed' };
  }
};

export const fetchPendingEvents = async () => {
  try {
    const res = await SchoolEventsAPI.getPendingApproval();
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load pending events' };
  }
};

// ─── Notifications ────────────────────────────────────────────────────────────

export const fetchNotifications = async (params = {}) => {
  try {
    const res = await NotificationsAPI.getAll(params);
    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Failed to load notifications' };
  }
};

export const registerUserFcmToken = async (body) => {
  try {
    const res = await NotificationsAPI.registerUserToken(body);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Token registration failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Token registration failed' };
  }
};

export const registerParentFcmToken = async (body) => {
  try {
    const res = await NotificationsAPI.registerParentToken(body);
    const data = await res.json();
    if (!res.ok) return { data: null, error: data.message || 'Token registration failed' };
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || 'Token registration failed' };
  }
};