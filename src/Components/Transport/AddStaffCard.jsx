import { useState, useEffect } from "react";
import { X, Users, Loader2, AlertCircle } from "lucide-react";
import { addTransportStaff, updateTransportStaff } from "../../Api/TransportAPI";

const toDateInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0]; 
};

const EMPTY_FORM = {
  fullName:          "",
  staffRole:         "DRIVER",
  contactNumber:     "",
  alternateContact:  "",
  licenseNumber:     "",
  licenseExpiryDate: "",
  address:           "",
  aadharNumber:      "",
  joiningDate:       "",
  remarks:           "",
};

function staffToForm(s) {
  return {
    fullName:          s.fullName          || "",
    staffRole:         s.staffRole         || "DRIVER",
    contactNumber:     s.contactNumber     || "",
    alternateContact:  s.alternateContact  || "",
    licenseNumber:     s.licenseNumber     || "",
    licenseExpiryDate: toDateInput(s.licenseExpiryDate),
    address:           s.address           || "",
    aadharNumber:      s.aadharNumber      || "",
    joiningDate:       toDateInput(s.joiningDate),
    remarks:           s.remarks           || "",
  };
}

// ─── Field Component ──────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-300 placeholder-gray-400 transition-all";
const disabledCls = "w-full px-3.5 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed";

// ─── Modal ────────────────────────────────────────────────────────
export default function AddStaffCard({ isOpen, onClose, onSaved, editData }) {
  const isEditMode = Boolean(editData);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [apiError, setApiError] = useState("");

  // Populate form on open / editData change
  useEffect(() => {
    if (isOpen) {
      setForm(isEditMode ? staffToForm(editData) : EMPTY_FORM);
      setApiError("");
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async () => {
    // Basic validation
    if (!form.fullName.trim())      { setApiError("Full name is required."); return; }
    if (!form.contactNumber.trim()) { setApiError("Contact number is required."); return; }
    if (!form.staffRole)            { setApiError("Staff role is required."); return; }

    setApiError("");
    setSaving(true);

    const payload = {
      fullName:          form.fullName.trim(),
      staffRole:         form.staffRole,
      contactNumber:     form.contactNumber.trim(),
      alternateContact:  form.alternateContact.trim() || undefined,
      licenseNumber:     form.licenseNumber.trim()    || undefined,
      licenseExpiryDate: form.licenseExpiryDate       || undefined,
      address:           form.address.trim()          || undefined,
      aadharNumber:      form.aadharNumber.trim()     || undefined,
      joiningDate:       form.joiningDate             || undefined,
      remarks:           form.remarks.trim()          || undefined,
    };

    try {
      if (isEditMode) {
        await updateTransportStaff(editData.id, payload);
      } else {
        await addTransportStaff(payload);
      }
      onSaved?.(isEditMode);
    } catch (e) {
      console.error(e);
      setApiError(e?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => { if (!saving) onClose(); }}
      />

      {/* Panel */}
      <div className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92dvh] sm:max-h-[88vh]">

        {/* ── Sticky Header ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">
                {isEditMode ? "Edit Staff Member" : "Add New Staff"}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditMode ? `Editing: ${editData?.fullName}` : "Fill in the details below"}
              </p>
            </div>
          </div>
          <button
            onClick={() => { if (!saving) onClose(); }}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full Name */}
            <Field label="Full Name" required>
              <input
                type="text" placeholder="e.g. Ramesh Kumar"
                value={form.fullName} onChange={set("fullName")}
                className={inputCls}
              />
            </Field>

            {/* Staff Role */}
            <Field label="Staff Role" required>
              <select
                value={form.staffRole} onChange={set("staffRole")}
                disabled={isEditMode}
                className={isEditMode ? disabledCls : `${inputCls} cursor-pointer`}
              >
                <option value="DRIVER">Driver</option>
                <option value="ATTENDANT">Attendant</option>
              </select>
            </Field>

            {/* Contact Number */}
            <Field label="Contact Number" required>
              <input
                type="tel" placeholder="10-digit mobile number"
                maxLength={10} value={form.contactNumber} onChange={set("contactNumber")}
                className={inputCls}
              />
            </Field>

            {/* Alternate Contact */}
            <Field label="Alternate Contact">
              <input
                type="tel" placeholder="Optional"
                maxLength={10} value={form.alternateContact} onChange={set("alternateContact")}
                className={inputCls}
              />
            </Field>

            {/* License Number — only for DRIVER */}
            {form.staffRole === "DRIVER" && (
              <Field label="License Number">
                <input
                  type="text" placeholder="e.g. MH1220120001"
                  value={form.licenseNumber} onChange={set("licenseNumber")}
                  className={inputCls}
                />
              </Field>
            )}

            {/* License Expiry — only for DRIVER */}
            {form.staffRole === "DRIVER" && (
              <Field label="License Expiry Date">
                <input
                  type="date"
                  value={form.licenseExpiryDate} onChange={set("licenseExpiryDate")}
                  className={inputCls}
                />
              </Field>
            )}

            {/* Joining Date */}
            <Field label="Joining Date">
              <input
                type="date"
                value={form.joiningDate} onChange={set("joiningDate")}
                className={inputCls}
              />
            </Field>

            {/* Aadhar Number */}
            <Field label="Aadhar Number">
              <input
                type="text" placeholder="12-digit Aadhar"
                maxLength={12} value={form.aadharNumber} onChange={set("aadharNumber")}
                className={inputCls}
              />
            </Field>

            {/* Address — full width */}
            <div className="sm:col-span-2">
              <Field label="Address">
                <textarea
                  rows={2} placeholder="Residential address…"
                  value={form.address} onChange={set("address")}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

            {/* Remarks — full width */}
            <div className="sm:col-span-2">
              <Field label="Remarks">
                <textarea
                  rows={2} placeholder="Any additional notes…"
                  value={form.remarks} onChange={set("remarks")}
                  className={`${inputCls} resize-none`}
                />
              </Field>
            </div>

          </div>

          {/* API Error */}
          {apiError && (
            <div className="mt-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {apiError}
            </div>
          )}
        </div>

        {/* ── Sticky Footer ── */}
        <div className="px-5 sm:px-6 py-4 border-t border-gray-100 flex justify-end gap-3 shrink-0">
          <button
            onClick={() => { if (!saving) onClose(); }}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? "Saving…" : isEditMode ? "Update Staff" : "Add Staff"}
          </button>
        </div>
      </div>
    </div>
  );
}