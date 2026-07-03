import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle, X, AlertCircle, Inbox,
  ChevronLeft, ChevronRight, Clock, FileText, Calendar,
} from 'lucide-react';
import CardComponent from '../../../Components/CommonComp/CardComponent';
import CardLoader from '../../../Components/CommonComp/CardLoader';
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
} from '../../../Api/Communication/CircularApi';
import COMMUNICATION_CONSTS from '../../../Constants/StringConstants/CommunicationConstants';

// ─── Toast ─────────────────────────────────────────────────────────────────────
const useToast = () => {
  const [toasts, setToasts] = useState([]);
  const show = useCallback((type, title, message) => {
    const id = Date.now();
    setToasts((p) => [...p, { id, type, title, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), COMMUNICATION_CONSTS.APPROVAL_TOAST_DURATION_MS);
  }, []);
  const dismiss = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), []);
  return { toasts, show, dismiss };
};

const ToastList = ({ toasts, dismiss }) => (
  <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
    {toasts.map((t) => (
      <div
        key={t.id}
        className="bg-white border border-gray-200 rounded-xl shadow-lg px-4 py-3 flex items-start gap-3 min-w-[280px] max-w-sm pointer-events-auto"
        style={{ animation: 'slideIn .2s ease-out' }}
      >
        {t.type === 'success'
          ? <CheckCircle size={15} className="text-emerald-500 flex-shrink-0 mt-0.5" />
          : <AlertCircle size={15} className="text-red-500 flex-shrink-0 mt-0.5" />}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900">{t.title}</p>
          {t.message && <p className="text-xs text-gray-500 mt-0.5">{t.message}</p>}
        </div>
        <button onClick={() => dismiss(t.id)} className="text-gray-400 hover:text-gray-600 shrink-0">
          <X size={13} />
        </button>
        <style>{`@keyframes slideIn{from{opacity:0;transform:translateX(12px)}to{opacity:1;transform:none}}`}</style>
      </div>
    ))}
  </div>
);

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
    <div className="flex justify-between gap-3">
      <div className="space-y-2 flex-1">
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-100 rounded w-1/3" />
      </div>
      <div className="h-5 w-24 bg-gray-100 rounded-full self-start" />
    </div>
    <div className="space-y-2 mt-3">
      <div className="h-3 bg-gray-100 rounded w-full" />
      <div className="h-3 bg-gray-100 rounded w-3/4" />
    </div>
    <div className="h-8 bg-amber-50 rounded-lg mt-3" />
  </div>
);

// ─── Helpers ───────────────────────────────────────────────────────────────────
const extractArray = (json) => {
  if (!json) return [];
  if (Array.isArray(json.data)) return json.data;
  if (Array.isArray(json.content)) return json.content;
  if (Array.isArray(json.data?.content)) return json.data.content;
  if (Array.isArray(json)) return json;
  return [];
};

// ─── Pagination ────────────────────────────────────────────────────────────────
const Pagination = ({ page, totalPages, rowsPerPage, onPageChange, onRowsChange, totalItems }) => {
  const start = totalItems === 0 ? 0 : (page - 1) * rowsPerPage + 1;
  const end = Math.min(page * rowsPerPage, totalItems);

  const pageNums = Array.from({ length: totalPages }, (_, i) => i + 1)
    .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
    .reduce((acc, p, idx, arr) => {
      if (idx > 0 && p - arr[idx - 1] > 1) acc.push('…');
      acc.push(p);
      return acc;
    }, []);

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 mt-3">
      <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
        <span>{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.SHOWING_LABEL(
          <span className="font-semibold text-gray-700">{start}</span>,
          <span className="font-semibold text-gray-700">{end}</span>,
          <span className="font-semibold text-gray-700">{totalItems}</span>
        )}</span>
        <span className="text-gray-300 hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5">
          <span className="text-gray-400">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.ROWS_PER_PAGE_LABEL}</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { onRowsChange(Number(e.target.value)); onPageChange(1); }}
            className="border border-gray-200 rounded-lg px-2 py-1 text-xs font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-100 bg-white"
          >
            {COMMUNICATION_CONSTS.PAGINATION.APPROVAL_QUEUE_ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={13} /> {COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.PREV}
        </button>
        {pageNums.map((p, idx) =>
          p === '…' ? (
            <span key={`el-${idx}`} className="px-1.5 text-gray-400 text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold transition ${p === page ? 'bg-[#1e293b] text-white shadow-sm' : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages || totalPages === 0}
          className="flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          {COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.NEXT} <ChevronRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
const ApprovalQueue = () => {
  const [activeTab, setActiveTab] = useState(COMMUNICATION_CONSTS.APPROVAL_QUEUE_TABS[0].key);
  const [circulars, setCirculars] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actingId, setActingId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(COMMUNICATION_CONSTS.PAGINATION.APPROVAL_QUEUE_DEFAULT_ROWS);
  const { toasts, show: showToast, dismiss } = useToast();

  // ── Fetch ───────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cirRes, evtRes] = await Promise.all([fetchPendingCirculars(), fetchPendingEvents()]);
      if (cirRes.error) throw new Error(cirRes.error);
      if (evtRes.error) throw new Error(evtRes.error);
      setCirculars(extractArray(cirRes.data));
      setEvents(extractArray(evtRes.data));
    } catch {
      setError(COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.LOAD_ERROR);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setPage(1); }, [activeTab, rowsPerPage]);

  // ── Approve ─────────────────────────────────────────────────────────────────
  const handleApprove = async (id, type) => {
    setActingId({ id, action: 'approve' });
    try {
      const res = type === 'circular' ? await approveCircular(id) : await approveEvent(id);
      if (res.error) throw new Error(res.error);
      showToast('success', COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.APPROVED_TITLE, COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.APPROVED_MESSAGE);
      load();
    } catch {
      showToast('error', COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.APPROVE_FAILED_TITLE, COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.APPROVE_FAILED_MESSAGE);
    } finally {
      setActingId(null);
    }
  };

  // ── Reject ──────────────────────────────────────────────────────────────────
  const handleRejectSubmit = async (reason) => {
    if (!rejectTarget) return;
    const { id, type } = rejectTarget;
    setActingId({ id, action: 'reject' });
    try {
      const res = type === 'circular' ? await rejectCircular(id, reason) : await rejectEvent(id, reason);
      if (res.error) throw new Error(res.error);
      showToast('success', COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.REJECTED_TITLE, COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.REJECTED_MESSAGE);
      setRejectTarget(null);
      load();
    } catch {
      showToast('error', COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.REJECT_FAILED_TITLE, COMMUNICATION_CONSTS.APPROVAL_QUEUE_TOAST.REJECT_FAILED_MESSAGE);
    } finally {
      setActingId(null);
    }
  };

  // ── Tab data ────────────────────────────────────────────────────────────────
  const all = [
    ...circulars.map((c) => ({ ...c, _type: 'circular' })),
    ...events.map((e) => ({ ...e, _type: 'event' })),
  ];

  const tabs = COMMUNICATION_CONSTS.APPROVAL_QUEUE_TABS.map((t) => {
    if (t.key === 'all') return { ...t, items: all };
    if (t.key === 'circulars') return { ...t, items: circulars.map((c) => ({ ...c, _type: 'circular' })) };
    if (t.key === 'events') return { ...t, items: events.map((e) => ({ ...e, _type: 'event' })) };
    return { ...t, items: [] };
  });

  const activeItems = tabs.find((t) => t.key === activeTab)?.items ?? [];
  const totalItems = activeItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const pagedItems = activeItems.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#f0f4f9] p-4 md:p-6">
      <ToastList toasts={toasts} dismiss={dismiss} />

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.TITLE}</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.SUBTITLE}</p>
      </div>

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => <CardLoader key={i} />)
        ) : (
          <>
            <CardComponent
              IconName={Clock}
              keyName={COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.STAT_TOTAL_PENDING}
              val={all.length}
              iconTxColor="text-blue-600"
              iconBgColor="bg-blue-50"
            />
            <CardComponent
              IconName={FileText}
              keyName={COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.STAT_CIRCULARS}
              val={circulars.length}
              iconTxColor="text-amber-500"
              iconBgColor="bg-amber-50"
            />
            <CardComponent
              IconName={Calendar}
              keyName={COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.STAT_EVENTS}
              val={events.length}
              iconTxColor="text-violet-600"
              iconBgColor="bg-violet-50"
            />
          </>
        )}
      </div>

      {/* ── Error banner ──────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex items-center gap-3 mb-4">
          <AlertCircle size={15} className="text-red-500 shrink-0" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button onClick={load} className="text-red-600 hover:text-red-800 font-semibold text-sm shrink-0">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.RETRY}</button>
        </div>
      )}

      {/* ── Main white card ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

        {/* Tabs */}
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`inline-flex items-center gap-2 px-4 sm:px-5 py-3 text-[12.5px] font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === t.key
                  ? 'border-[#2563EB] text-[#2563EB]'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              {t.label}
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === t.key ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'
                }`}>
                {loading ? '—' : t.items.length}
              </span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="space-y-3"><Skeleton /><Skeleton /><Skeleton /></div>
          ) : activeItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-14 text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <Inbox size={22} className="text-gray-300" />
              </div>
              <p className="text-gray-600 font-semibold text-sm">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.EMPTY_TITLE}</p>
              <p className="text-gray-400 text-xs mt-1">{COMMUNICATION_CONSTS.APPROVAL_QUEUE_TEXT.EMPTY_SUBTITLE}</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {pagedItems.map((item) =>
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
              <Pagination
                page={page}
                totalPages={totalPages}
                rowsPerPage={rowsPerPage}
                onPageChange={setPage}
                onRowsChange={setRowsPerPage}
                totalItems={totalItems}
              />
            </>
          )}
        </div>
      </div>

      {/* Reject modal */}
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