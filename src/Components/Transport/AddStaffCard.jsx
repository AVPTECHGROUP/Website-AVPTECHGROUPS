import { useState, useEffect } from "react";
import { X, Users, Save, Loader2, User, Phone, CreditCard, Calendar, MapPin, Hash } from "lucide-react";

const EMPTY_FORM = {
  fullName: "",
  role: "DRIVER",
  contactNumber: "",
  alternateContact: "",
  licenseNumber: "",
  licenseExpiry: "",
  joiningDate: "",
  aadhaarNumber: "",
  address: "",
};

// ─── Field ────────────────────────────────────────────────────────
function Field({ label, required, icon: Icon, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const baseCls =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 transition " +
  "border-gray-200 focus:ring-blue-300 focus:border-blue-400";

const errCls = "border-red-400 focus:ring-red-200 focus:border-red-400";

// ─── Main ─────────────────────────────────────────────────────────
export default function AddStaffCard({ isOpen, onClose, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      setForm(EMPTY_FORM);
      setErrors({});
    }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())      e.fullName      = "Full name is required";
    if (!form.contactNumber.trim()) e.contactNumber = "Contact number is required";
    else if (!/^\d{10}$/.test(form.contactNumber.trim())) e.contactNumber = "Enter valid 10-digit number";
    if (form.role === "DRIVER") {
      if (!form.licenseNumber.trim()) e.licenseNumber = "License number is required for driver";
      if (!form.licenseExpiry)        e.licenseExpiry = "License expiry date is required";
    }
    if (!form.joiningDate)   e.joiningDate   = "Joining date is required";
    if (!form.aadhaarNumber.trim()) e.aadhaarNumber = "Aadhaar number is required";
    else if (!/^\d{12}$/.test(form.aadhaarNumber.replace(/\s/g, ""))) e.aadhaarNumber = "Enter valid 12-digit Aadhaar";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSave?.({ ...form });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-staff-in">
        <style>{`
          @keyframes staffModalIn {
            from { opacity: 0; transform: scale(0.95) translateY(12px); }
            to   { opacity: 1; transform: scale(1) translateY(0); }
          }
          .animate-staff-in { animation: staffModalIn 0.2s ease-out forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <Users className="w-4 h-4 text-teal-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Add Driver / Attendant</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Row 1: Full Name + Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full Name" required icon={User}>
              <input
                type="text"
                placeholder="e.g. Rajesh Sharma"
                value={form.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                className={`${baseCls} ${errors.fullName ? errCls : ""}`}
              />
              {errors.fullName && <p className="text-xs text-red-500 mt-0.5">{errors.fullName}</p>}
            </Field>

            <Field label="Role" required icon={Users}>
              <div className="relative">
                <select
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                  className={`${baseCls} appearance-none pr-9 cursor-pointer`}
                >
                  <option value="DRIVER">DRIVER</option>
                  <option value="ATTENDANT">ATTENDANT</option>
                </select>
                <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
              </div>
            </Field>
          </div>

          {/* Row 2: Contact + Alternate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Number" required icon={Phone}>
              <input
                type="tel"
                placeholder="9876543210"
                value={form.contactNumber}
                onChange={(e) => set("contactNumber", e.target.value)}
                className={`${baseCls} ${errors.contactNumber ? errCls : ""}`}
              />
              {errors.contactNumber && <p className="text-xs text-red-500 mt-0.5">{errors.contactNumber}</p>}
            </Field>

            <Field label="Alternate Contact" icon={Phone}>
              <input
                type="tel"
                placeholder="Optional"
                value={form.alternateContact}
                onChange={(e) => set("alternateContact", e.target.value)}
                className={baseCls}
              />
            </Field>
          </div>

          {/* Row 3: License No + License Expiry (Driver only) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="License Number (Driver only)" required={form.role === "DRIVER"} icon={CreditCard}>
              <input
                type="text"
                placeholder="MH12XXXXXXXX"
                value={form.licenseNumber}
                disabled={form.role === "ATTENDANT"}
                onChange={(e) => set("licenseNumber", e.target.value)}
                className={`${baseCls} ${errors.licenseNumber ? errCls : ""} ${form.role === "ATTENDANT" ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
              />
              {errors.licenseNumber && <p className="text-xs text-red-500 mt-0.5">{errors.licenseNumber}</p>}
            </Field>

            <Field label="License Expiry Date" required={form.role === "DRIVER"} icon={Calendar}>
              <input
                type="date"
                value={form.licenseExpiry}
                disabled={form.role === "ATTENDANT"}
                onChange={(e) => set("licenseExpiry", e.target.value)}
                className={`${baseCls} ${errors.licenseExpiry ? errCls : ""} ${form.role === "ATTENDANT" ? "opacity-50 cursor-not-allowed bg-gray-50" : ""}`}
              />
              {errors.licenseExpiry && <p className="text-xs text-red-500 mt-0.5">{errors.licenseExpiry}</p>}
            </Field>
          </div>

          {/* Row 4: Joining Date + Aadhaar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Joining Date" required icon={Calendar}>
              <input
                type="date"
                value={form.joiningDate}
                onChange={(e) => set("joiningDate", e.target.value)}
                className={`${baseCls} ${errors.joiningDate ? errCls : ""}`}
              />
              {errors.joiningDate && <p className="text-xs text-red-500 mt-0.5">{errors.joiningDate}</p>}
            </Field>

            <Field label="Aadhaar Number" required icon={Hash}>
              <input
                type="text"
                placeholder="XXXX XXXX XXXX"
                maxLength={14}
                value={form.aadhaarNumber}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, "").slice(0, 12);
                  const formatted = raw.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
                  set("aadhaarNumber", formatted);
                }}
                className={`${baseCls} ${errors.aadhaarNumber ? errCls : ""}`}
              />
              {errors.aadhaarNumber && <p className="text-xs text-red-500 mt-0.5">{errors.aadhaarNumber}</p>}
            </Field>
          </div>

          {/* Address */}
          <Field label="Address" required icon={MapPin}>
            <textarea
              rows={3}
              placeholder="Full address..."
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
              className={`${baseCls} resize-none ${errors.address ? errCls : ""}`}
            />
            {errors.address && <p className="text-xs text-red-500 mt-0.5">{errors.address}</p>}
          </Field>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Staff
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}