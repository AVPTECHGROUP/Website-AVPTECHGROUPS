import { useState, useEffect } from "react";
import { X, Users, Loader2, AlertCircle } from "lucide-react";
import { addTransportStaff, updateTransportStaff } from "../../Api/Transport/TransportAPI";
import { toast } from "react-toastify";

const toDateInput = (dateStr) => {
  if (!dateStr) return "";
  return dateStr.split("T")[0];
};

const EMPTY_FORM = {
  fullName: "",
  staffRole: "DRIVER",
  contactNumber: "",
  alternateContact: "",
  licenseNumber: "",
  licenseExpiryDate: "",
  address: "",
  aadharNumber: "",
  joiningDate: "",
  remarks: "",
};

function staffToForm(s) {
  return {
    fullName: s.fullName || "",
    staffRole: s.staffRole || "DRIVER",
    contactNumber: s.contactNumber || "",
    alternateContact: s.alternateContact || "",
    licenseNumber: s.licenseNumber || "",
    licenseExpiryDate: toDateInput(s.licenseExpiryDate),
    address: s.address || "",
    aadharNumber: s.aadharNumber || "",
    joiningDate: toDateInput(s.joiningDate),
    remarks: s.remarks || "",
  };
}

// ─── Field Component ──────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <span className="text-xs font-medium text-red-500 flex items-center gap-1 mt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          {error}
        </span>
      )}
    </div>
  );
}

const baseInputCls = "w-full px-3.5 py-2.5 text-sm border rounded-xl bg-gray-50 focus:outline-none focus:ring-2 placeholder-gray-400 transition-all";
const getInputCls = (hasError) =>
  hasError
    ? `${baseInputCls} border-red-300 bg-red-50/20 focus:ring-red-200 focus:border-red-400`
    : `${baseInputCls} border-gray-200 focus:ring-blue-200 focus:border-blue-300`;

const disabledCls = "w-full px-3.5 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-100 text-gray-400 cursor-not-allowed";

// ─── Modal ────────────────────────────────────────────────────────
export default function AddStaffCard({ isOpen, onClose, onSaved, editData }) {
  const isEditMode = Boolean(editData);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState("");

  // Populate form on open / editData change
  useEffect(() => {
    if (isOpen) {
      setForm(isEditMode ? staffToForm(editData) : EMPTY_FORM);
      setErrors({});
      setApiError("");
    }
  }, [isOpen, editData]);

  if (!isOpen) return null;

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Sanitize numeric keystrokes on entry level
  const setNumeric = (field) => (e) => {
    const cleanDigits = e.target.value.replace(/\D/g, "");
    setForm((prev) => ({ ...prev, [field]: cleanDigits }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async () => {
    const contactClean = form.contactNumber.trim();
    const altContactClean = form.alternateContact.trim();
    const aadharClean = form.aadharNumber.trim();
    const newErrors = {};

    // ─── Core Form Field Validations ───
    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required.";
    }

    if (!form.staffRole) {
      newErrors.staffRole = "Staff role is required.";
    }

    if (!contactClean) {
      newErrors.contactNumber = "Contact number is required.";
    } else if (!/^\d{10}$/.test(contactClean)) {
      newErrors.contactNumber = "Contact number must be exactly 10 digits.";
    }

    // Driver-specific validation
    if (form.staffRole === "DRIVER") {
      if (!form.licenseNumber.trim()) {
        newErrors.licenseNumber = "License number is required.";
      }

      if (!form.licenseExpiryDate) {
        newErrors.licenseExpiryDate = "License expiry date is required.";
      }
    }

    // Joining Date
    if (!form.joiningDate) {
      newErrors.joiningDate = "Joining date is required.";
    }

    // Aadhar Validation
    if (!aadharClean) {
      newErrors.aadharNumber = "Aadhar number is required.";
    } else if (!/^\d{12}$/.test(aadharClean)) {
      newErrors.aadharNumber = "Aadhar number must be exactly 12 digits.";
    }

    // Address
    if (!form.address.trim()) {
      newErrors.address = "Address is required.";
    }

    // Optional Alternate Contact
    if (altContactClean && !/^\d{10}$/.test(altContactClean)) {
      newErrors.alternateContact = "Alternate contact number must be exactly 10 digits.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setApiError("");
    setSaving(true);

    const payload = {
      fullName: form.fullName.trim(),
      staffRole: form.staffRole,
      contactNumber: contactClean,
      alternateContact: altContactClean || undefined,
      licenseNumber: form.licenseNumber.trim() || undefined,
      licenseExpiryDate: form.licenseExpiryDate || undefined,
      address: form.address.trim() || undefined,
      aadharNumber: aadharClean || undefined,
      joiningDate: form.joiningDate || undefined,
      remarks: form.remarks.trim() || undefined,
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
      const msg = e?.message || "Something went wrong. Please try again.";
      setApiError(msg);
      toast.error(msg);
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

        {/* Sticky Header */}
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

        {/* Scrollable Body */}
        <div className="overflow-y-auto flex-1 px-5 sm:px-6 py-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Full Name */}
            <Field label="Full Name" required error={errors.fullName}>
              <input
                type="text" placeholder="e.g. Ramesh Kumar"
                value={form.fullName} onChange={set("fullName")}
                className={getInputCls(errors.fullName)}
              />
            </Field>

            {/* Staff Role */}
            <Field label="Staff Role" required error={errors.staffRole}>
              <select
                value={form.staffRole} onChange={set("staffRole")}
                disabled={isEditMode}
                className={isEditMode ? disabledCls : `${getInputCls(errors.staffRole)} cursor-pointer`}
              >
                <option value="DRIVER">Driver</option>
                <option value="ATTENDANT">Attendant</option>
              </select>
            </Field>

            {/* Contact Number */}
            <Field label="Contact Number" required error={errors.contactNumber}>
              <input
                type="tel" placeholder="10-digit mobile number"
                maxLength={10} value={form.contactNumber} onChange={setNumeric("contactNumber")}
                className={getInputCls(errors.contactNumber)}
              />
            </Field>

            {/* Alternate Contact */}
            <Field label="Alternate Contact" error={errors.alternateContact}>
              <input
                type="tel" placeholder="Optional"
                maxLength={10} value={form.alternateContact} onChange={setNumeric("alternateContact")}
                className={getInputCls(errors.alternateContact)}
              />
            </Field>

            {/* License Number — only for DRIVER */}
            {form.staffRole === "DRIVER" && (
              <Field label="License Number" required error={errors.licenseNumber}>
                <input
                  type="text" placeholder="e.g. MH1220120001"
                  value={form.licenseNumber} onChange={set("licenseNumber")}
                  className={getInputCls(errors.licenseNumber)}
                />
              </Field>
            )}

            {/* License Expiry — only for DRIVER */}
            {form.staffRole === "DRIVER" && (
              <Field label="License Expiry Date" required error={errors.licenseExpiryDate}>
                <input
                  type="date"
                  value={form.licenseExpiryDate} onChange={set("licenseExpiryDate")}
                  className={getInputCls(errors.licenseExpiryDate)}
                />
              </Field>
            )}

            {/* Joining Date */}
            <Field label="Joining Date" required error={errors.joiningDate}>
              <input
                type="date"
                value={form.joiningDate} onChange={set("joiningDate")}
                className={getInputCls(errors.joiningDate)}
              />
            </Field>

            {/* Aadhar Number */}
            <Field label="Aadhar Number" required error={errors.aadharNumber}>
              <input
                type="text" placeholder="12-digit Aadhar"
                maxLength={12} value={form.aadharNumber} onChange={setNumeric("aadharNumber")}
                className={getInputCls(errors.aadharNumber)}
              />
            </Field>

            {/* Address — full width */}
            <div className="sm:col-span-2">
              <Field label="Address" required error={errors.address}>
                <textarea
                  rows={2} placeholder="Residential address…"
                  value={form.address} onChange={set("address")}
                  className={`${getInputCls(errors.address)} resize-none`}
                />
              </Field>
            </div>

            {/* Remarks — full width */}
            <div className="sm:col-span-2">
              <Field label="Remarks" error={errors.remarks}>
                <textarea
                  rows={2} placeholder="Any additional notes…"
                  value={form.remarks} onChange={set("remarks")}
                  className={`${getInputCls(errors.remarks)} resize-none`}
                />
              </Field>
            </div>

          </div>

          {/* Backend API Error Box (Server/Network level failures only) */}
          {apiError && (
            <div className="mt-4 flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {apiError}
            </div>
          )}
        </div>

        {/* Sticky Footer */}
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