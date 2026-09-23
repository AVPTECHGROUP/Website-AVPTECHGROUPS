import { useState, useCallback } from 'react';
import { authFetch } from '../../Authfetch/Authfetch';

const BASE_URL = import.meta.env.VITE_API_BASE_V1;

// Transform API response to standardized format
const transformCircular = (data) => ({
  id: data.id,
  type: 'circular',
  title: data.title || data.subject,
  description: data.description || data.content,
  content: data.content || data.description,
  scope: data.scope || 'School-Wide',
  createdBy: data.createdBy ? `${data.createdBy.firstName || ''} ${data.createdBy.lastName || ''}`.trim() : 'Unknown',
  createdAt: data.createdAt || data.createdDate,
  recipients: data.recipients || [{ name: 'All Parents' }, { name: 'All Teachers' }],
  status: data.status,
});

const transformEvent = (data) => ({
  id: data.id,
  type: 'event',
  title: data.title || data.eventTitle,
  description: data.description || data.content,
  content: data.content || data.description,
  scope: data.scope || 'School-Wide',
  createdBy: data.createdBy ? `${data.createdBy.firstName || ''} ${data.createdBy.lastName || ''}`.trim() : 'Unknown',
  createdAt: data.createdAt || data.createdDate,
  eventDate: data.eventDate || data.scheduledDate,
  classes: data.classes || [],
  recipients: data.recipients || [],
  status: data.status,
});

export const useApprovalAPI = () => {
  const [allItems, setAllItems] = useState([]);
  const [circulars, setCirculars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);

  const fetchPendingItems = useCallback(async () => {
    setLoading(true);
    try {
      const [circularsRes, eventsRes] = await Promise.all([
        authFetch(`${BASE_URL}/circulars/pending-approval?page=0&size=50`),
        authFetch(`${BASE_URL}/school-events/pending-approval?page=0&size=50`),
      ]);

      const circularsData = await circularsRes.json();
      const eventsData = await eventsRes.json();

      // Handle both paginated and non-paginated responses
      const circularsArray = circularsData.content || circularsData.data?.content || circularsData || [];
      const eventsArray = eventsData.content || eventsData.data?.content || eventsData || [];

      const transformedCirculars = (Array.isArray(circularsArray) ? circularsArray : []).map(transformCircular);
      const transformedEvents = (Array.isArray(eventsArray) ? eventsArray : []).map(transformEvent);

      setCirculars(transformedCirculars);
      setEvents(transformedEvents);
      setAllItems([...transformedCirculars, ...transformedEvents]);
    } catch (error) {
      console.error('Failed to fetch pending items:', error);
      // Silently fail - UI shows "All Caught Up"
      setCirculars([]);
      setEvents([]);
      setAllItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const approveItem = useCallback(async (id, type) => {
    setApprovingId(id);
    try {
      const endpoint = type === 'circular' ? `/circulars/${id}/approve` : `/school-events/${id}/approve`;
      const response = await authFetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
      });

      if (!response.ok) {
        throw new Error('Approval failed');
      }

      return true;
    } catch (error) {
      console.error('Approval error:', error);
      return false;
    } finally {
      setApprovingId(null);
    }
  }, []);

  const rejectItem = useCallback(async (id, type, reason) => {
    setRejectingId(id);
    try {
      const endpoint = type === 'circular' ? `/circulars/${id}/reject` : `/school-events/${id}/reject`;
      const response = await authFetch(`${BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason }),
      });

      if (!response.ok) {
        throw new Error('Rejection failed');
      }

      return true;
    } catch (error) {
      console.error('Rejection error:', error);
      return false;
    } finally {
      setRejectingId(null);
    }
  }, []);

  return {
    allItems,
    circulars,
    events,
    loading,
    approvingId,
    rejectingId,
    fetchPendingItems,
    approveItem,
    rejectItem,
  };
};