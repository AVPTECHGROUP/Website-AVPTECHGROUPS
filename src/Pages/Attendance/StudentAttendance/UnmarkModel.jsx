import { useState } from "react";
import { Trash2, X, AlertTriangle } from "lucide-react";
import {
  UNMARK_TITLE, UNMARK_NOT_MARKED_LABEL,
  REASON_LABEL, REASON_PLACEHOLDER,
  BTN_CANCEL, BTN_CONFIRM_UNMARK, UI_STRINGS
} from "../../../Constants/StringConstants/AttendanceConstants";

export default function UnmarkModal({ student, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trash2 className="w-5 h-5 text-red-500" />
            <h2 className="font-bold text-gray-800 text-base">{UNMARK_TITLE}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              {UI_STRINGS.UNMARK.WARNING_1}
              <span className="font-bold">{student?.name}</span>{UI_STRINGS.UNMARK.WARNING_2}
              <span className="font-bold">{UNMARK_NOT_MARKED_LABEL}</span>{UI_STRINGS.UNMARK.WARNING_3}
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REASON_LABEL}</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder={REASON_PLACEHOLDER}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-200"
            />
          </div>
        </div>
        <div className="flex gap-3 px-5 pb-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">{BTN_CANCEL}</button>
          <button onClick={() => onConfirm(student, reason)} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
            <Trash2 className="w-4 h-4" /> {BTN_CONFIRM_UNMARK}
          </button>
        </div>
      </div>
    </div>
  );
}