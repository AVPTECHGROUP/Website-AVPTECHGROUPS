import React from 'react';
import { FileText, Globe, Calendar, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

/**
 * CircularCard
 *
 * Actual API shape:
 * {
 *   id, schoolId, title, content, type, status,
 *   rejectionReason, createdById, createdAt, updatedAt,
 *   targets: [{ id, targetType, classId, sectionId }],
 *   attachments: []
 * }
 */
const CircularCard = ({ item, isApproving, isRejecting, onApprove, onReject }) => {
  const fmtDate = (d) => {
    if (!d) return null;
    try {
      return new Date(d).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric',
      });
    } catch { return null; }
  };

  // Creator — API sends createdById (number), no name object at this endpoint
  const creatorDisplay = item.createdBy
    ? typeof item.createdBy === 'string'
      ? item.createdBy
      : [item.createdBy.firstName, item.createdBy.lastName].filter(Boolean).join(' ') ||
        item.createdBy.name || item.createdBy.username || null
    : null;
  // createdById is just an id; only show if we have no richer name
  const creatorLabel = creatorDisplay || (item.createdById ? `User #${item.createdById}` : null);

  // Scope — API field is `type` e.g. "SCHOOL_WIDE"
  const scope = item.scope || item.visibility || item.type || null;
  const scopeDisplay = scope ? scope.replace(/_/g, ' ') : null;

  // Recipients — API field is `targets[].targetType`
  const targets = item.targets || item.recipients || item.targetAudience || item.audience || [];
  const targetLabels = targets.map((t) =>
    t.targetType
      ? t.targetType.replace(/_/g, ' ')
      : t.name || t.label || String(t)
  );

  // Notification note built entirely from API data
  const notifyNote = [
    scopeDisplay ? `${scopeDisplay} circular.` : null,
    targetLabels.length > 0
      ? `Notifications will be sent to: ${targetLabels.join(', ')}.`
      : null,
  ].filter(Boolean).join(' ');

  const isBusy = isApproving || isRejecting;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">

      {/* ── Top strip ─────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText size={17} className="text-blue-600" />
            </div>

            {/* Title + meta */}
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-snug">
                {item.title || item.subject || '(Untitled)'}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                  <FileText size={11} /> Circular
                </span>

                {scopeDisplay && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Globe size={11} /> {scopeDisplay}
                  </span>
                )}

                {creatorLabel && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    {/* no User icon import needed — inline svg keeps bundle small */}
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    {creatorLabel}
                  </span>
                )}

                {fmtDate(item.createdAt || item.createdDate) && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={11} />
                    {fmtDate(item.createdAt || item.createdDate)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Status badge */}
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0">
            <Clock size={11} />
            {item.status?.replace(/_/g, ' ') || 'Awaiting Approval'}
          </span>
        </div>
      </div>

      {/* ── Content preview ───────────────────────────────────────────── */}
      {(item.description || item.content) && (
        <div className="px-6 py-3 border-b border-gray-100">
          <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
            {item.description || item.content}
          </p>
        </div>
      )}

      {/* ── Target audience tags ───────────────────────────────────────── */}
      {targetLabels.length > 0 && (
        <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap gap-2">
          {targetLabels.map((label, i) => (
            <span
              key={i}
              className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-gray-100 text-gray-600 border border-gray-200"
            >
              {label}
            </span>
          ))}
        </div>
      )}

      {/* ── Approval bar ──────────────────────────────────────────────── */}
      <div className="bg-amber-50 border-t border-amber-200 px-6 py-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Admin Approval Required</p>
            {notifyNote && (
              <p className="text-xs text-amber-700 mt-0.5">{notifyNote}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={onReject}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-300 text-red-700 bg-white hover:bg-red-50 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isRejecting
              ? <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
              : <XCircle size={13} />
            }
            Reject
          </button>
          <button
            onClick={onApprove}
            disabled={isBusy}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            {isApproving
              ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              : <CheckCircle size={13} />
            }
            Approve &amp; Notify
          </button>
        </div>
      </div>
    </div>
  );
};

export default CircularCard;