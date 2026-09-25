import React from 'react';
import { CheckCircle, XCircle, Clock, Calendar, Globe, User, AlertTriangle } from 'lucide-react';

/**
 * EventCard
 *
 * Props:
 *  - item         {object}   Raw event object from the API
 *  - onApprove    {Function} Called with no args — parent owns id/type
 *  - onReject     {Function} Called with no args — parent owns id/type
 *  - isApproving  {boolean}
 *  - isRejecting  {boolean}
 */
const EventCard = ({ item, onApprove, onReject, isApproving, isRejecting }) => {
  const formatDate = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch { return ''; }
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    try {
      return new Date(date).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch { return ''; }
  };

  // Creator display name — handle both string and object shapes
  const creatorName = item.createdBy
    ? typeof item.createdBy === 'string'
      ? item.createdBy
      : [item.createdBy.firstName, item.createdBy.lastName].filter(Boolean).join(' ') ||
        item.createdBy.name ||
        item.createdBy.username ||
        null
    : null;

  const creatorRole = item.createdBy?.role || item.createdBy?.designation || null;

  const scope = item.scope || item.visibility || null;

  // Attendees list — use whatever field the API sends
  const attendees = item.classes || item.recipients || item.targetAudience || [];

  // Build the warning note dynamically from API data
  const warningNote = [
    scope ? `${scope} event.` : null,
    attendees.length > 0
      ? `Approving will send FCM push notifications to: ${attendees.map((a) => a.name || a.label || a).join(', ')}.`
      : 'Approving will send FCM push notifications to relevant parents and teachers.',
  ]
    .filter(Boolean)
    .join(' ');

  const isBusy = isApproving || isRejecting;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 p-2.5 rounded-lg flex-shrink-0">
              <Calendar size={20} className="text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-snug">
                {item.title || item.eventTitle || '(Untitled)'}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Calendar size={14} /> Event
                </span>
                {scope && (
                  <span className="flex items-center gap-1">
                    <Globe size={14} /> {scope}
                  </span>
                )}
                {creatorName && (
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {creatorName}{creatorRole ? ` (${creatorRole})` : ''}
                  </span>
                )}
                {formatDate(item.createdAt || item.createdDate) && (
                  <span className="flex items-center gap-1">
                    <Clock size={14} />
                    {formatDate(item.createdAt || item.createdDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1.5 rounded-full text-xs font-semibold flex-shrink-0">
            <Clock size={12} />
            {item.status?.replace(/_/g, ' ') || 'Awaiting Approval'}
          </span>
        </div>
      </div>

      {/* ── Description ─────────────────────────────────────────────────── */}
      {(item.description || item.content) && (
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
            {item.description || item.content}
          </p>

          {(item.eventDate || item.scheduledDate) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm">
                <Calendar size={14} className="text-gray-500" />
                <span className="text-gray-700 font-medium">
                  {formatDateTime(item.eventDate || item.scheduledDate)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Attendees ────────────────────────────────────────────────────── */}
      {attendees.length > 0 && (
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-gray-600 font-medium">Classes / Recipients:</span>
            {attendees.map((a, i) => (
              <span
                key={i}
                className="inline-flex items-center px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold"
              >
                {a.name || a.label || a}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── Approval bar ─────────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-t border-amber-200 px-6 py-4">
        <div className="flex items-start gap-3 mb-4">
          <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-900 text-sm">Admin Approval Required</p>
            <p className="text-amber-800 text-xs mt-1">{warningNote}</p>
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onReject}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-red-300 text-red-700 hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm"
          >
            {isRejecting ? (
              <>
                <span className="w-3 h-3 border-2 border-red-700 border-t-transparent rounded-full animate-spin" />
                Rejecting…
              </>
            ) : (
              <>
                <XCircle size={16} />
                Reject
              </>
            )}
          </button>

          <button
            onClick={onApprove}
            disabled={isBusy}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-sm shadow-sm"
          >
            {isApproving ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Approving…
              </>
            ) : (
              <>
                <CheckCircle size={16} />
                Approve &amp; Notify
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
};

export default EventCard;