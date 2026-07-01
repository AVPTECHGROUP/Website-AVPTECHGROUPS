import { useState, useEffect } from "react";
import { X, Bus, Save, Loader2, Pencil } from "lucide-react";
import { addVehicle, updateVehicle } from "../../Api/TransportAPI";

const EMPTY_FORM = {
  vehicleNumber:     "",
  vehicleType:       "BUS",
  capacity:          "",
  makeModel:         "",
  yearOfManufacture: "",
  gpsEnabled:        "Yes",
  insuranceExpiryDate:   "",
  fitnessCertExpiryDate: "",
  remarks:           "",
};

// ─── Field wrapper ────────────────────────────────────────────────
function Field({ label, required, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1">
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 transition border-gray-200 focus:ring-blue-300 focus:border-blue-400";

const errCls = "border-red-400 focus:ring-red-200 focus:border-red-400";

// ─── Helpers ──────────────────────────────────────────────────────
// Convert "2026-03-28T00:00:00" → "2026-03-28" for date input
function toDateInput(val) {
  if (!val) return "";
  return val.split("T")[0];
}

// Build form state from an existing vehicle (edit mode)
function vehicleToForm(v) {
  return {
    vehicleNumber:         v.vehicleNumber    || "",
    vehicleType:           v.vehicleType      || "BUS",
    capacity:              v.capacity         ? String(v.capacity) : "",
    makeModel:             v.makeModel        || "",
    yearOfManufacture:     v.yearOfManufacture ? String(v.yearOfManufacture) : "",
    gpsEnabled:            v.gpsEnabled       ? "Yes" : "No",
    insuranceExpiryDate:   toDateInput(v.insuranceExpiryDate),
    fitnessCertExpiryDate: toDateInput(v.fitnessCertExpiryDate),
    remarks:               v.remarks          || "",
  };
}

// ─── Main Modal ───────────────────────────────────────────────────
// Props:
//   isOpen   — boolean
//   onClose  — fn()
//   onSaved  — fn() called after successful save so parent can refetch
//   editData — vehicle object (edit mode) or null (add mode)
export default function AddVehicleCard({ isOpen, onClose, onSaved, editData }) {
  const isEditMode = Boolean(editData);

  const [form, setForm]       = useState(EMPTY_FORM);
  const [saving, setSaving]   = useState(false);
  const [errors, setErrors]   = useState({});
  const [apiError, setApiError] = useState("");

  // Populate form when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(isEditMode ? vehicleToForm(editData) : EMPTY_FORM);
      setErrors({});
      setApiError("");
    }
  }, [isOpen, editData, isEditMode]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (key, val) => {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((p) => ({ ...p, [key]: "" }));
    setApiError("");
  };

  // ── Validation ──
  const validate = () => {
    const e = {};
    if (!form.vehicleNumber.trim())    e.vehicleNumber     = "Vehicle number is required";
    if (!form.capacity)                e.capacity          = "Capacity is required";
    if (Number(form.capacity) < 1)     e.capacity          = "Capacity must be at least 1";
    if (!form.makeModel.trim())        e.makeModel         = "Make & model is required";
    if (!form.yearOfManufacture)       e.yearOfManufacture = "Year is required";
    if (!form.insuranceExpiryDate)     e.insuranceExpiryDate   = "Insurance expiry is required";
    if (!form.fitnessCertExpiryDate)   e.fitnessCertExpiryDate = "Fitness expiry is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");

    const payload = {
      vehicleNumber:         form.vehicleNumber.trim().toUpperCase(),
      vehicleType:           form.vehicleType,
      capacity:              Number(form.capacity),
      gpsEnabled:            form.gpsEnabled === "Yes",
      makeModel:             form.makeModel.trim(),
      yearOfManufacture:     Number(form.yearOfManufacture),
      insuranceExpiryDate:   form.insuranceExpiryDate   || null,
      fitnessCertExpiryDate: form.fitnessCertExpiryDate || null,
      remarks:               form.remarks.trim() || null,
    };

    try {
      if (isEditMode) {
        await updateVehicle(editData.id, payload);
      } else {
        await addVehicle(payload);
      }
      onSaved?.(isEditMode);
    } catch (err) {
      console.error(err);
      setApiError(isEditMode ? "Failed to update vehicle. Please try again." : "Failed to add vehicle. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-modal">
        <div className="max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                {isEditMode
                  ? <Pencil className="w-4 h-4 text-blue-600" />
                  : <Bus className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {isEditMode ? "Edit Vehicle" : "Add New Vehicle"}
                </h2>
                {isEditMode && (
                  <p className="text-xs text-gray-400">{editData.vehicleNumber}</p>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ── Form Body ── */}
          <div className="px-6 py-5 space-y-4">

            {/* API error banner */}
            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {apiError}
              </div>
            )}

            {/* Row 1: Vehicle No + Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Vehicle Number" required error={errors.vehicleNumber}>
                <input
                  type="text"
                  placeholder="e.g. MH12XY9999"
                  value={form.vehicleNumber}
                  onChange={(e) => set("vehicleNumber", e.target.value)}
                 className={`${inputCls} ${errors.vehicleNumber ? errCls : ""}`}
                />
              </Field>

              <Field label="Vehicle Type" required>
                <div className="relative">
                  <select
                    value={form.vehicleType}
                    onChange={(e) => set("vehicleType", e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="BUS">BUS</option>
                    <option value="MINI_BUS">MINI BUS</option>
                    <option value="VAN">VAN</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </Field>
            </div>

            {/* Row 2: Capacity + Make & Model */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Capacity (seats)" required error={errors.capacity}>
                <input
                  type="number"
                  placeholder="e.g. 40"
                  min="1"
                  value={form.capacity}
                  onChange={(e) => set("capacity", e.target.value)}
                  className={`${inputCls} ${errors.capacity ? errCls : ""}`}
                />
              </Field>

              <Field label="Make & Model" required error={errors.makeModel}>
                <input
                  type="text"
                  placeholder="e.g. Tata Starbus"
                  value={form.makeModel}
                  onChange={(e) => set("makeModel", e.target.value)}
                  className={`${inputCls} ${errors.makeModel ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Row 3: Year + GPS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Year of Manufacture" required error={errors.yearOfManufacture}>
                <input
                  type="number"
                  placeholder="e.g. 2022"
                  min="1990"
                  max={new Date().getFullYear()}
                  value={form.yearOfManufacture}
                  onChange={(e) => set("yearOfManufacture", e.target.value)}
                  className={`${inputCls} ${errors.yearOfManufacture ? errCls : ""}`}
                />
              </Field>

              <Field label="GPS Enabled" required>
                <div className="relative">
                  <select
                    value={form.gpsEnabled}
                    onChange={(e) => set("gpsEnabled", e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}
                  >
                    <option value="Yes">Yes</option>
                    <option value="No">No</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </Field>
            </div>

            {/* Row 4: Insurance + Fitness Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Insurance Expiry Date" required error={errors.insuranceExpiryDate}>
                <input
                  type="date"
                  value={form.insuranceExpiryDate}
                  onChange={(e) => set("insuranceExpiryDate", e.target.value)}
                  className={`${inputCls} ${errors.insuranceExpiryDate ? errCls : ""}`}
                />
              </Field>

              <Field label="Fitness Certificate Expiry" required error={errors.fitnessCertExpiryDate}>
                <input
                  type="date"
                  value={form.fitnessCertExpiryDate}
                  onChange={(e) => set("fitnessCertExpiryDate", e.target.value)}
                  className={`${inputCls} ${errors.fitnessCertExpiryDate ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Remarks */}
            <Field label="Remarks">
              <textarea
                placeholder="Optional notes about this vehicle…"
                value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </Field>
          </div>

          {/* ── Footer ── */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
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
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-blue-400 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors disabled:cursor-not-allowed"
            >
              {saving ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating…" : "Saving…"}</>
              ) : (
                <><Save className="w-4 h-4" /> {isEditMode ? "Update Vehicle" : "Save Vehicle"}</>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes modal-in {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .animate-modal { animation: modal-in 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}