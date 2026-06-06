import React, { useState, useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * RejectModal
 *
 * Props:
 *  - isOpen      {boolean}   Whether the modal is visible (parent also gates mounting)
 *  - type        {string}    'circular' | 'event' — used only for the heading label
 *  - isLoading   {boolean}   True while the reject API call is in-flight
 *  - onSubmit    {Function}  Called with (reason: string) when user confirms
 *  - onClose     {Function}  Called when the user cancels / closes
 */
const RejectModal = ({ isOpen, type, onSubmit, onClose, isLoading }) => {
  const [reason, setReason] = useState('');

  // Clear reason each time the modal opens fresh
  useEffect(() => {
    if (isOpen) setReason('');
  }, [isOpen]);

  if (!isOpen) return null;

  const typeLabel = type === 'circular' ? 'Circular' : 'Event';

  const handleConfirm = () => {
    // reason is optional — pass whatever the admin typed (may be empty)
    onSubmit(reason.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 px-6 py-5 border-b border-red-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Reject {typeLabel}
              </h2>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ───────────────────────────────────────────────────────── */}
        <div className="p-6 space-y-4">
          <div>
            <label
              htmlFor="reject-reason"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Reason for Rejection
              <span className="ml-1 font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="reject-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={`Provide a brief reason for rejecting this ${typeLabel.toLowerCase()}. The creator will be notified.`}
              disabled={isLoading}
              rows={4}
              maxLength={500}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all disabled:bg-gray-50 disabled:text-gray-500 text-sm resize-none"
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {reason.length} / 500
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            <p className="text-xs text-red-800">
              <strong>Note:</strong> The creator will be notified about this rejection along with the reason provided.
            </p>
          </div>
        </div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 font-semibold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[140px]"
          >
            {isLoading ? (
              <>
                <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Rejecting…
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                Confirm Rejection
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default RejectModal;