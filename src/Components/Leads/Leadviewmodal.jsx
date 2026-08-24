import { X, Phone, School, Users, CalendarClock, Clock3, StickyNote, Pencil, Hash } from "lucide-react";
import LeadStatusBadge from "./LeadsStatusbadge.jsx";
import { STUDENT_STRENGTH_LABELS } from "../../Constants/StringConstants/LeadsConstants.js";
import { formatDateTime } from "./Leadformatters.js";

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div className="min-w-0">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="truncate text-sm font-medium text-slate-700">{value || "—"}</p>
        </div>
    </div>
);

// Read-only — no API calls here. Anything that changes the lead (status,
// assignment, scheduling, notes) lives in LeadEditModal instead.
const LeadViewModal = ({ lead, onClose, onEdit }) => {
    if (!lead) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">{lead.fullName}</h2>
                        <p className="text-sm text-slate-500">Lead #{lead.id}</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-6 px-6 py-5">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-500">Status:</span>
                        <LeadStatusBadge status={lead.status} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <InfoRow icon={School} label="School" value={lead.schoolName} />
                        <InfoRow icon={Phone} label="Phone" value={lead.phoneNumber} />
                        <InfoRow
                            icon={Users}
                            label="Student Strength"
                            value={STUDENT_STRENGTH_LABELS[lead.studentStrength] ?? lead.studentStrength}
                        />
                        <InfoRow icon={CalendarClock} label="Created" value={formatDateTime(lead.createdAt)} />
                        <InfoRow icon={Users} label="Assigned To" value={lead.assignedTo} />
                        <InfoRow icon={Clock3} label="Demo Scheduled" value={formatDateTime(lead.demoScheduledAt)} />
                        <InfoRow icon={CalendarClock} label="Follow-up Date" value={formatDateTime(lead.followUpDate)} />
                        {lead.status === "CONVERTED" && (
                            <InfoRow icon={Hash} label="Converted School ID" value={lead.convertedSchoolId} />
                        )}
                    </div>

                    <div>
                        <InfoRow icon={StickyNote} label="Notes" value={lead.notes} />
                    </div>
                </div>

                <div className="flex justify-end gap-2 border-t border-slate-100 px-6 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                        Close
                    </button>
                    <button
                        type="button"
                        onClick={() => onEdit?.(lead)}
                        className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                        <Pencil className="h-4 w-4" /> Edit
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadViewModal;