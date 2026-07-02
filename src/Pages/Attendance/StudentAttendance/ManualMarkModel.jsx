import { useState, useMemo } from "react";
import {
    PenLine, X, CheckCircle2, XCircle, Clock, Search,
    Users, Loader2, CheckCheck, Lock, AlertCircle
} from "lucide-react";

// ─── Status config ─────────────────────────────────────────────────────────────
const STATUS_OPTIONS = [
    {
        value: "PRESENT",
        label: "Present",
        icon: CheckCircle2,
        activeBg: "bg-green-600",
        activeText: "text-white",
        inactiveBg: "bg-white hover:bg-green-50",
        inactiveText: "text-green-700",
        inactiveBorder: "border-green-200",
    },
    {
        value: "ABSENT",
        label: "Absent",
        icon: XCircle,
        activeBg: "bg-red-500",
        activeText: "text-white",
        inactiveBg: "bg-white hover:bg-red-50",
        inactiveText: "text-red-600",
        inactiveBorder: "border-red-200",
    },
    {
        value: "LATE",
        label: "Late",
        icon: Clock,
        activeBg: "bg-yellow-500",
        activeText: "text-white",
        inactiveBg: "bg-white hover:bg-yellow-50",
        inactiveText: "text-yellow-700",
        inactiveBorder: "border-yellow-200",
    },
];

const getInitials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const avatarColor = (initials = "??") => {
    const colors = [
        "bg-blue-100 text-blue-700", "bg-green-100 text-green-700",
        "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700",
        "bg-pink-100 text-pink-700", "bg-teal-100 text-teal-700",
    ];
    return colors[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % colors.length];
};

// ─── Student Row Component ─────────────────────────────────────────────────────
function StudentRow({ student, entry, onChange, isLocked }) {
    const initials = getInitials(student.name);
    const currentStatus = entry?.status || "PRESENT";
    const currentRemarks = entry?.remarks || "";

    return (
        <div className={`group px-4 py-3.5 transition-colors border-b border-gray-100 last:border-b-0 ${isLocked ? "bg-gray-50/50" : "bg-orange-50/30 hover:bg-orange-50/50 animate-pulse-once"}`}>
            <div className="flex items-center gap-3 min-w-0">
                {/* Avatar */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(initials)}`}>
                    {initials}
                </div>

                {/* Name + Roll */}
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">{student.name}</p>
                        {!isLocked && (
                            <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-md font-medium tracking-wide border border-orange-200 uppercase animate-bounce-slow">
                                Editable
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-gray-400">Roll {student.rollNo}</p>
                </div>

                {/* Individual Action Buttons */}
                <div className="flex items-center gap-1 shrink-0">
                    {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = currentStatus === opt.value;
                        return (
                            <button
                                key={opt.value}
                                disabled={isLocked}
                                onClick={() => onChange(student.id, "status", opt.value)}
                                title={isLocked ? "Unmark from main table to edit" : opt.label}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150
                                    ${isLocked ? "cursor-not-allowed opacity-65" : "cursor-pointer"}
                                    ${active
                                        ? `${opt.activeBg} ${opt.activeText} border-transparent shadow-sm`
                                        : `${opt.inactiveBg} ${opt.inactiveText} ${opt.inactiveBorder}`
                                    }`}
                            >
                                <Icon className="w-3.5 h-3.5 shrink-0" />
                                <span className="hidden sm:inline">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Remarks Area */}
            {currentStatus === "LATE" && (
                <div className="mt-2.5 ml-12 pr-1">
                    <textarea
                        value={currentRemarks}
                        disabled={isLocked}
                        onChange={(e) => {
                            const words = e.target.value.trim().split(/\s+/).filter(Boolean);
                            if (words.length > 150 && e.target.value.trim() !== "") return;
                            onChange(student.id, "remarks", e.target.value);
                        }}
                        rows={2}
                        maxLength={900}
                        placeholder={isLocked ? "No remarks captured" : "Reason for late arrival... (max 150 words)"}
                        className={`w-full border border-yellow-200 bg-yellow-50 rounded-lg px-3 py-2 text-xs resize-none focus:outline-none focus:ring-2 focus:ring-yellow-300 text-gray-700`}
                    />
                </div>
            )}
        </div>
    );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────
export default function ManualMarkModal({
    students, selectedClass, selectedSection, date, onClose, onConfirm,
}) {
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);

    // Identify if any baseline attendance records exist in DB
    const hasExistingAttendance = useMemo(() => {
        return students.some((s) => s.status && s.status !== "Not Marked");
    }, [students]);

    // Check if ALL students are fully locked out
    const isAllLocked = useMemo(() => {
        return students.length > 0 && students.every((s) => s.status && s.status !== "Not Marked");
    }, [students]);

    // Track state mapping from current synchronized store 
    const [entries, setEntries] = useState(() => {
        const map = {};
        students.forEach((s) => {
            let initialStatus = "PRESENT";
            if (s.status) {
                if (s.status.includes("Present")) initialStatus = "PRESENT";
                else if (s.status === "Late") initialStatus = "LATE";
                else if (s.status === "Absent") initialStatus = "ABSENT";
            }
            map[s.id] = { status: initialStatus, remarks: s.remarks || "" };
        });
        return map;
    });

    const filtered = useMemo(() =>
        students.filter((s) =>
            s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search)
        ), [students, search]
    );

    const handleChange = (studentId, field, value) => {
        const targetStudent = students.find(s => s.id === studentId);
        if (targetStudent && targetStudent.status && targetStudent.status !== "Not Marked") return; // Protection block
        
        setEntries((prev) => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value },
        }));
    };

    const bulkSet = (status) => {
        if (hasExistingAttendance) return; // Restrict updates during partial edits
        setEntries((prev) => {
            const next = { ...prev };
            filtered.forEach((s) => {
                next[s.id] = { ...next[s.id], status };
            });
            return next;
        });
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const payload = {
                classId: selectedClass?.id,
                sectionId: selectedSection?.id,
                attendanceDate: date,
                students: students.map((s) => ({
                    studentId: parseInt(s.id),
                    status: entries[s.id]?.status || "PRESENT",
                    checkInTime: new Date().toTimeString().slice(0, 5),
                    remarks: entries[s.id]?.remarks || "",
                })),
            };
            await onConfirm(payload);
            onClose(); // Automatically synchronize layout via layout trigger hooks
        } catch (err) {
            alert(err.message || "Failed to submit updates");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-3 py-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[92vh] overflow-hidden relative">
                
                {/* Loader Screen Layer */}
                {submitting && (
                    <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="font-bold text-gray-800 text-sm">Updating Attendance Registers...</p>
                    </div>
                )}

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center"><PenLine className="w-4 h-4 text-orange-600" /></div>
                        <div>
                            <h2 className="font-bold text-gray-900 text-base leading-tight">Manual Attendance Panel</h2>
                            <p className="text-xs text-gray-400">{selectedClass?.name} · {selectedSection?.name}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 cursor-pointer"><X className="w-4 h-4 text-gray-500" /></button>
                </div>

                {/* Dynamic Status Notifications */}
                {isAllLocked ? (
                    <div className="mx-5 mt-4 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shrink-0">
                        <Lock className="w-4 h-4 text-amber-600 shrink-0" />
                        <p className="text-xs text-amber-800 font-medium">All student positions are locked. Unmark a record from the roster screen to modify.</p>
                    </div>
                ) : hasExistingAttendance ? (
                    <div className="mx-5 mt-4 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shrink-0">
                        <AlertCircle className="w-4 h-4 text-orange-600 shrink-0" />
                        <p className="text-xs text-orange-800 font-medium">Partial Editing Enabled: Unmarked rows have been highlighted and unlocked for input.</p>
                    </div>
                ) : (
                    <div className="mx-5 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 flex gap-2.5 shrink-0">
                        <p className="text-xs text-blue-700 leading-relaxed">All students are ready to be marked. Use individual controls or bulk selection adjustments.</p>
                    </div>
                )}

                {/* Bulk Actions (Conditional Rendering) */}
                {!hasExistingAttendance && (
                    <div className="px-5 pt-3 pb-1 flex justify-end gap-1.5 shrink-0">
                        {STATUS_OPTIONS.map((opt) => (
                            <button key={opt.value} onClick={() => bulkSet(opt.value)} className="text-xs font-semibold px-2.5 py-1 border rounded-lg bg-white text-gray-600 hover:bg-gray-50">
                                All {opt.label}
                            </button>
                        ))}
                    </div>
                )}

                {/* Search Inputs */}
                <div className="px-5 py-3 shrink-0">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search unmarked rows or roll numbers..." className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50" />
                    </div>
                </div>

                {/* Core List Map */}
                <div className="flex-1 overflow-y-auto min-h-0 border border-gray-100 mx-5 rounded-xl">
                    {filtered.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-sm">No match profiles located.</div>
                    ) : (
                        filtered.map((s) => {
                            const isLocked = s.status && s.status !== "Not Marked";
                            return (
                                <StudentRow
                                    key={s.id}
                                    student={s}
                                    entry={entries[s.id]}
                                    onChange={handleChange}
                                    isLocked={isLocked}
                                />
                            );
                        })
                    )}
                </div>

                {/* Modal Footer Controls */}
                <div className="px-5 py-4 border-t border-gray-100 flex gap-3 shrink-0 bg-white rounded-b-2xl">
                    <button onClick={onClose} className="border border-gray-200 rounded-xl py-2.5 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || isAllLocked || students.length === 0}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl py-2.5 text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
                    >
                        {isAllLocked ? (
                            <><Lock className="w-4 h-4" /> Attendance Registry Locked</>
                        ) : (
                            <><CheckCheck className="w-4 h-4" /> Mark Attendance</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}