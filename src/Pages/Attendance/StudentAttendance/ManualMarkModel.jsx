import { useState } from "react";
import { PenLine, X, ChevronDown, CheckCircle2 } from "lucide-react";
import {
    MANUAL_MARK_TITLE, MANUAL_MARK_INFO,
    STUDENT_SELECT_PLACEHOLDER, STUDENT_LABEL,
    STATUS_FIELD_LABEL, TIME_LABEL,
    REMARKS_LABEL, REMARKS_PLACEHOLDER,
    DEFAULT_MARK_STATUS, DEFAULT_MARK_TIME,
    BTN_CANCEL, BTN_MARK_ATTENDANCE, MODAL_STATUS_OPTIONS, UI_STRINGS
} from "../../../Constants/StringConstants/AttendanceConstants";

export default function ManualMarkModal({ students, onClose, onConfirm }) {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [status, setStatus] = useState(DEFAULT_MARK_STATUS);
    const [time, setTime] = useState(DEFAULT_MARK_TIME);
    const [remarks, setRemarks] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <PenLine className="w-5 h-5 text-orange-500" />
                        <h2 className="font-bold text-gray-800 text-base">{MANUAL_MARK_TITLE}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-white text-xs font-bold">i</span>
                        </div>
                        <p className="text-sm text-blue-700">{MANUAL_MARK_INFO}</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{STUDENT_LABEL}</label>
                        <div className="relative">
                            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                                <option value="">{STUDENT_SELECT_PLACEHOLDER}</option>
                                {students.map((s) => <option key={s.id} value={s.id}>{s.name} {UI_STRINGS.COMMON.PAREN_ROLL} {s.rollNo})</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{STATUS_FIELD_LABEL}</label>
                            <div className="relative">
                                <select value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                                    {MODAL_STATUS_OPTIONS.map((opt) => (
                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{TIME_LABEL}</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">{REMARKS_LABEL}</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                            placeholder={REMARKS_PLACEHOLDER}
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">{BTN_CANCEL}</button>
                    <button onClick={() => onConfirm({ studentId: selectedStudent, status, time, remarks })}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {BTN_MARK_ATTENDANCE}
                    </button>
                </div>
            </div>
        </div>
    );
}