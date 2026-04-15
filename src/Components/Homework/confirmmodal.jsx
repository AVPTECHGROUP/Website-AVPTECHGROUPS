// src/Components/Homework/ConfirmModal.jsx
import { AlertTriangle } from "lucide-react";

export default function ConfirmModal({ message, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6 flex flex-col gap-4">

        {/* Icon + heading */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <h2 className="text-[15px] font-semibold text-gray-800">Cancel Homework</h2>
        </div>

        {/* Message */}
        <p className="text-[13px] text-gray-500 leading-relaxed">{message}</p>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-1">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium rounded-lg border border-gray-300
              text-gray-600 bg-white hover:bg-gray-50 transition-colors"
          >
            Keep it
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-[13px] font-semibold rounded-lg
              bg-red-600 hover:bg-red-700 text-white transition-colors"
          >
            Yes, cancel
          </button>
        </div>
      </div>
    </div>
  );
}