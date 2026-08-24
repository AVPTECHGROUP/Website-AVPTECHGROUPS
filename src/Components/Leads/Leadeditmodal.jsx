import { useEffect, useState } from "react";
import { X, CheckCircle2 } from "lucide-react";
import LeadStatusBadge from "./LeadsStatusbadge.jsx";
import {
    LEAD_STATUS,
    LEAD_STATUS_LABELS,
    NEXT_STATUS_OPTIONS,
} from "../../Constants/StringConstants/LeadsConstants.js";
import { toDateInput, toDateTimeLocalInput } from "./Leadformatters.js";
import { updateLead } from "../../Api/Demoleads/Demoleads.js";

const emptyForm = {
    status: LEAD_STATUS.NEW,
    assignedTo: "",
    demoScheduledAt: "",
    followUpDate: "",
    notes: "",
    convertedSchoolId: "",
};

// Everything that talks to the API for a lead (status change, assignment,
// scheduling, converted-school linkage, notes) is handled here via
// updateLead(). LeadViewModal is read-only and never calls this.
const LeadEditModal = ({ lead, onClose, onUpdated }) => {
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!lead) return;
        setForm({
            status: lead.status ?? LEAD_STATUS.NEW,
            assignedTo: lead.assignedTo ?? "",
            demoScheduledAt: toDateTimeLocalInput(lead.demoScheduledAt),
            followUpDate: toDateInput(lead.followUpDate),
            notes: lead.notes ?? "",
            convertedSchoolId: lead.convertedSchoolId ?? "",
        });
        setError("");
        setSuccess(false);
    }, [lead]);

    if (!lead) return null;

    const nextStatusOptions = NEXT_STATUS_OPTIONS[lead.status] ?? [lead.status];

    const handleChange = (field) => (e) => {
        setForm((f) => ({ ...f, [field]: e.target.value }));
        setSuccess(false);
    };

    const handleSave = async () => {
        setError("");

        if (form.status === LEAD_STATUS.CONVERTED && form.convertedSchoolId === "") {
            setError("Converted school ID is required when marking a lead as Converted.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                status: form.status,
                assignedTo: form.assignedTo || null,
                demoScheduledAt: form.demoScheduledAt
                    ? new Date(form.demoScheduledAt).toISOString()
                    : null,
                followUpDate: form.followUpDate || null,
                notes: form.notes || null,
                convertedSchoolId:
                    form.status === LEAD_STATUS.CONVERTED && form.convertedSchoolId !== ""
                        ? Number(form.convertedSchoolId)
                        : null,
            };
            const updated = await updateLead(lead.id, payload);
            setSuccess(true);
            onUpdated?.(updated ?? { ...lead, ...payload });
        } catch (err) {
            setError(err.message || "Something went wrong while saving.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
                <div className="flex items-start justify-between border-b border-slate-100 px-6 py-4">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Edit Lead</h2>
                        <p className="text-sm text-slate-500">{lead.fullName} · Lead #{lead.id}</p>
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
                        <span className="text-sm text-slate-500">Current status:</span>
                        <LeadStatusBadge status={lead.status} />
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Update status</label>
                            <select
                                value={form.status}
                                onChange={handleChange("status")}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                                {nextStatusOptions.map((s) => (
                                    <option key={s} value={s}>
                                        {LEAD_STATUS_LABELS[s]}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Assigned to</label>
                            <input
                                type="text"
                                value={form.assignedTo}
                                onChange={handleChange("assignedTo")}
                                placeholder="Team member name"
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Demo scheduled at</label>
                            <input
                                type="datetime-local"
                                value={form.demoScheduledAt}
                                onChange={handleChange("demoScheduledAt")}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-slate-500">Follow-up date</label>
                            <input
                                type="date"
                                value={form.followUpDate}
                                onChange={handleChange("followUpDate")}
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>

                        {form.status === LEAD_STATUS.CONVERTED && (
                            <div className="sm:col-span-2">
                                <label className="mb-1 block text-xs font-medium text-slate-500">
                                    Converted school ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    required
                                    value={form.convertedSchoolId}
                                    onChange={handleChange("convertedSchoolId")}
                                    placeholder="School ID in SchoolSpine"
                                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
                                        error && form.convertedSchoolId === ""
                                            ? "border-red-300 focus:border-red-400 focus:ring-red-100"
                                            : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                                    }`}
                                />
                            </div>
                        )}

                        <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-slate-500">Notes</label>
                            <textarea
                                value={form.notes}
                                onChange={handleChange("notes")}
                                rows={3}
                                placeholder="Internal notes about this lead..."
                                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    {error && (
                        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
                    )}
                    {success && !error && (
                        <p className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                            <CheckCircle2 className="h-4 w-4" /> Lead updated successfully.
                        </p>
                    )}
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
                        onClick={handleSave}
                        disabled={saving}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                    >
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LeadEditModal;