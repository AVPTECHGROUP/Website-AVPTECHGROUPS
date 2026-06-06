import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, X, AlertCircle, Inbox } from 'lucide-react';
import CircularCard from '../../../Components/ApprovalQueue/CircularCard';
import EventCard from '../../../Components/ApprovalQueue/EventCard';
import RejectModal from '../../../Components/ApprovalQueue/RejectModal';
import {
  fetchPendingCirculars,
  approveCircular,
  rejectCircular,
  fetchPendingEvents,
  approveEvent,
  rejectEvent,
} from '../../../Api/CircularApi';

// ─── Toast ────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const show = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismiss = useCallback((id) => {
    setToasts((p) => p.filter((t) => t.id !== id));
  }, []);

  return { toasts, show, dismiss };
};

const ToastList = ({ toasts, dismiss }) => {
  const icons = {
    success: <CheckCircle size={15} className="text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle size={15} className="text-red-500 flex-shrink-0" />,
  };

  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-sm pointer-events-auto"
        >
          {icons[t.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{t.title}</p>
            {t.message && <p className="text-xs text-gray-500 mt-0.5">{t.message}</p>}
          </div>
          <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        </div>
      ))}
    </div>
  );
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4 animate-pulse">
    <div className="flex justify-between">
      <div className="space-y-2 flex-1">
        <div className="h-5 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-6 w-28 bg-gray-100 rounded-full" />
    </div>
    <div className="space-y-2">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="h-16 bg-amber-50 rounded-lg" />
  </div>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Safely extract an array from any API response shape:
 *   { success, data: [...], pagination }   ← actual shape from this API
 *   { content: [...] }                     ← Spring Page
 *   { data: { content: [...] } }           ← nested Spring Page
 *   [...]                                  ← bare array
 */
const extractArray = (json) => {
  if (!json) return [];
  // { data: [...] }  — the actual shape returned by this backend
  if (Array.isArray(json.data)) return json.data;
  // { content: [...] }  — Spring Page at root
  if (Array.isArray(json.content)) return json.content;
  // { data: { content: [...] } }  — nested Spring Page
  if (Array.isArray(json.data?.content)) return json.data.content;
  // bare array
  if (Array.isArray(json)) return json;
  return [];
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [circulars, setCirculars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null); // { id, action: 'approve'|'reject' }
  const [rejectTarget, setRejectTarget] = useState(null); // { id, type } | null
  const { toasts, show: showToast, dismiss } = useToast();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Both functions now consistently return { data, error }
      const [cirRes, evtRes] = await Promise.all([
        fetchPendingCirculars(),
        fetchPendingEvents(),
      ]);

      if (cirRes.error) throw new Error(cirRes.error);
      if (evtRes.error) throw new Error(evtRes.error);

      setCirculars(extractArray(cirRes.data));
      setEvents(extractArray(evtRes.data));
    } catch (err) {
      setError('Could not load pending items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Approve ────────────────────────────────────────────────────────────────
  const handleApprove = async (id, type) => {
    setActingId({ id, action: 'approve' });
    try {
      const res = type === 'circular'
        ? await approveCircular(id)
        : await approveEvent(id);

      if (res.error) throw new Error(res.error);

      showToast('success', 'Approved', 'Item approved and notifications sent.');
      load();
    } catch {
      showToast('error', 'Approval Failed', 'Something went wrong. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  // ── Reject ─────────────────────────────────────────────────────────────────
  const handleRejectSubmit = async (reason) => {
    if (!rejectTarget) return;
    const { id, type } = rejectTarget;
    setActingId({ id, action: 'reject' });
    try {
      const res = type === 'circular'
        ? await rejectCircular(id, reason)
        : await rejectEvent(id, reason);

      if (res.error) throw new Error(res.error);

      showToast('success', 'Rejected', 'Item has been rejected.');
      setRejectTarget(null);
      load();
    } catch {
      showToast('error', 'Rejection Failed', 'Something went wrong. Please try again.');
    } finally {
      setActingId(null);
    }
  };

  // ── Tab config ─────────────────────────────────────────────────────────────
  const all = [
    ...circulars.map((c) => ({ ...c, _type: 'circular' })),
    ...events.map((e) => ({ ...e, _type: 'event' })),
  ];

  const tabs = [
    { key: 'all',       label: 'All Pending', items: all },
    { key: 'circulars', label: 'Circulars',   items: circulars.map((c) => ({ ...c, _type: 'circular' })) },
    { key: 'events',    label: 'Events',      items: events.map((e) => ({ ...e, _type: 'event' })) },
  ];

  const activeItems = tabs.find((t) => t.key === activeTab)?.items ?? [];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <ToastList toasts={toasts} dismiss={dismiss} />

      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Approval Queue</h1>
        <p className="text-sm text-gray-400 mt-0.5">Review and approve pending circulars and events</p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <AlertCircle size={15} className="text-red-500 flex-shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button
            onClick={load}
            className="text-red-600 hover:text-red-800 font-semibold text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`inline-flex items-center gap-2 px-4 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors ${
              activeTab === t.key
                ? 'border-[#2563EB] text-[#2563EB]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {t.label}
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                activeTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {loading ? '—' : t.items.length}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-4">
          <Skeleton /><Skeleton /><Skeleton />
        </div>
      ) : activeItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Inbox size={40} className="text-gray-300 mb-3" />
          <p className="text-gray-500 font-semibold">All caught up</p>
          <p className="text-gray-400 text-sm mt-1">No pending items to review</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeItems.map((item) =>
            item._type === 'circular' ? (
              <CircularCard
                key={`c-${item.id}`}
                item={item}
                isApproving={actingId?.id === item.id && actingId?.action === 'approve'}
                isRejecting={actingId?.id === item.id && actingId?.action === 'reject'}
                onApprove={() => handleApprove(item.id, 'circular')}
                onReject={() => setRejectTarget({ id: item.id, type: 'circular' })}
              />
            ) : (
              <EventCard
                key={`e-${item.id}`}
                item={item}
                isApproving={actingId?.id === item.id && actingId?.action === 'approve'}
                isRejecting={actingId?.id === item.id && actingId?.action === 'reject'}
                onApprove={() => handleApprove(item.id, 'event')}
                onReject={() => setRejectTarget({ id: item.id, type: 'event' })}
              />
            )
          )}
        </div>
      )}

      {/*
        RejectModal — rendered conditionally.
        isOpen is derived from rejectTarget being non-null so the modal
        itself no longer needs to guard with if (!isOpen) return null,
        but we still pass it for completeness / animation hooks.
      */}
      {rejectTarget && (
        <RejectModal
          isOpen={!!rejectTarget}
          type={rejectTarget.type}
          isLoading={actingId?.id === rejectTarget.id && actingId?.action === 'reject'}
          onSubmit={handleRejectSubmit}
          onClose={() => setRejectTarget(null)}
        />
      )}
    </div>
  );
};

export default ApprovalQueue;