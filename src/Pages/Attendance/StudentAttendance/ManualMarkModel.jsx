import { useState } from "react";
import { PenLine, X, ChevronDown, CheckCircle2 } from "lucide-react";
export default function ManualMarkModal({ students, onClose, onConfirm }) {
    const [selectedStudent, setSelectedStudent] = useState("");
    const [status, setStatus] = useState("Present");
    const [time, setTime] = useState("08:30");
    const [remarks, setRemarks] = useState("");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <PenLine className="w-5 h-5 text-orange-500" />
                        <h2 className="font-bold text-gray-800 text-base">Manual Mark Attendance</h2>
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
                        <p className="text-sm text-blue-700">Use this when a student couldn't be captured in a group photo or face scan (e.g. glasses, bad angle, not yet enrolled).</p>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Student</label>
                        <div className="relative">
                            <select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                                <option value="">— Select student —</option>
                                {students.map((s) => <option key={s.id} value={s.id}>{s.name} (Roll {s.rollNo})</option>)}
                            </select>
                            <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Status</label>
                            <div className="relative">
                                <select value={status} onChange={(e) => setStatus(e.target.value)}
                                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer">
                                    <option value="Present">✅ Present</option>
                                    <option value="Late">🕐 Late</option>
                                    <option value="Absent">❌ Absent</option>
                                </select>
                                <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time</label>
                            <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1.5">Remarks (Optional)</label>
                        <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3}
                            placeholder="e.g. Wearing glasses, couldn't be recognized by face scan..."
                            className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200" />
                    </div>
                </div>
                <div className="flex gap-3 px-5 pb-5">
                    <button onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors">Cancel</button>
                    <button onClick={() => onConfirm({ studentId: selectedStudent, status, time, remarks })}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-2.5 text-sm font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> Mark Attendance
                    </button>
                </div>
            </div>
        </div>
    );
}
