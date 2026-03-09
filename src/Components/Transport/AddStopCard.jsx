import { useState, useEffect } from "react";
import { X, MapPin, Save, Loader2, Hash, Clock, Navigation, Pencil } from "lucide-react";
import { addRouteStop, updateRouteStop } from "../../Api/TransportAPI";

// ─── Empty form ───────────────────────────────────────────────────
const EMPTY_FORM = {
  stopName:        "",
  stopOrder:       "",
  pickupTime:      "",
  dropTime:        "",
  locationAddress: "",
  landmark:        "",
};

// ─── Helpers ──────────────────────────────────────────────────────
function toTimeInput(t) {
  // "07:00:00" → "07:00"
  if (!t) return "";
  return String(t).slice(0, 5);
}

function stopToForm(s) {
  return {
    stopName:        s.stopName        || "",
    stopOrder:       s.stopOrder       ? String(s.stopOrder) : "",
    pickupTime:      toTimeInput(s.pickupTime),
    dropTime:        toTimeInput(s.dropTime),
    locationAddress: s.locationAddress || "",
    landmark:        s.landmark        || "",
  };
}

// ─── Field wrapper ────────────────────────────────────────────────
function Field({ label, required, icon: Icon, error, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700 flex items-center gap-1.5">
        {Icon && <Icon className="w-4 h-4 text-gray-400" />}
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

// ─── Main ─────────────────────────────────────────────────────────
// Props:
//   isOpen    — boolean
//   onClose   — fn()
//   onSaved   — fn(isEditMode)
//   editData  — stop object | null
//   routeId   — number (required)
//   routeName — string display label
export default function AddStopCard({ isOpen, onClose, onSaved, editData, routeId, routeName = "" }) {
  const isEditMode = Boolean(editData);

  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");

  // Populate form on open
  useEffect(() => {
    if (isOpen) {
      setForm(isEditMode ? stopToForm(editData) : EMPTY_FORM);
      setErrors({});
      setApiError("");
    }
  }, [isOpen, isEditMode, editData]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
    setApiError("");
  };

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.stopName.trim())        e.stopName        = "Stop name is required";
    if (!form.stopOrder)              e.stopOrder        = "Stop order is required";
    else if (Number(form.stopOrder) < 1) e.stopOrder    = "Must be at least 1";
    if (!form.pickupTime)             e.pickupTime       = "Pickup time is required";
    if (!form.dropTime)               e.dropTime         = "Drop time is required";
    if (!form.locationAddress.trim()) e.locationAddress  = "Location address is required";
    if (!form.landmark.trim())        e.landmark         = "Landmark is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!validate()) return;
    if (!routeId) {
      setApiError("No route selected. Please select a route first.");
      return;
    }
    setSaving(true);
    setApiError("");

    const payload = {
      stopName:        form.stopName.trim(),
      stopOrder:       Number(form.stopOrder),
      pickupTime:      form.pickupTime ? `${form.pickupTime}:00` : null,
      dropTime:        form.dropTime   ? `${form.dropTime}:00`   : null,
      locationAddress: form.locationAddress.trim(),
      landmark:        form.landmark.trim(),
    };

    try {
      if (isEditMode) {
        await updateRouteStop(routeId, editData.id, payload);
      } else {
        await addRouteStop(routeId, payload);
      }
      onSaved?.(isEditMode);
    } catch (err) {
      console.error(err);
      setApiError(
        isEditMode
          ? "Failed to update stop. Please try again."
          : "Failed to add stop. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-stop-modal">
        <div className="max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                {isEditMode
                  ? <Pencil className="w-4 h-4 text-red-500" />
                  : <MapPin className="w-4 h-4 text-red-500" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {isEditMode ? "Edit Stop" : "Add New Stop"}
                </h2>
                {routeName && <p className="text-xs text-gray-400 mt-0.5">{routeName}</p>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {apiError}
              </div>
            )}

            {/* Stop Name + Stop Order */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Stop Name" required icon={MapPin} error={errors.stopName}>
                <input
                  type="text"
                  placeholder="e.g. Green Park Colony"
                  value={form.stopName}
                  onChange={(e) => set("stopName", e.target.value)}
                  className={`${inputCls} ${errors.stopName ? errCls : ""}`}
                />
              </Field>
              <Field label="Stop Order" required icon={Hash} error={errors.stopOrder}>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 5"
                  value={form.stopOrder}
                  onChange={(e) => set("stopOrder", e.target.value)}
                  className={`${inputCls} ${errors.stopOrder ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Pickup Time + Drop Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Pickup Time" required icon={Clock} error={errors.pickupTime}>
                <input
                  type="time"
                  value={form.pickupTime}
                  onChange={(e) => set("pickupTime", e.target.value)}
                  className={`${inputCls} ${errors.pickupTime ? errCls : ""}`}
                />
              </Field>
              <Field label="Drop Time" required icon={Clock} error={errors.dropTime}>
                <input
                  type="time"
                  value={form.dropTime}
                  onChange={(e) => set("dropTime", e.target.value)}
                  className={`${inputCls} ${errors.dropTime ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Location Address */}
            <Field label="Location Address" required icon={Navigation} error={errors.locationAddress}>
              <input
                type="text"
                placeholder="Full address"
                value={form.locationAddress}
                onChange={(e) => set("locationAddress", e.target.value)}
                className={`${inputCls} ${errors.locationAddress ? errCls : ""}`}
              />
            </Field>

            {/* Landmark */}
            <Field label="Landmark" required icon={MapPin} error={errors.landmark}>
              <input
                type="text"
                placeholder="e.g. Near HDFC Bank"
                value={form.landmark}
                onChange={(e) => set("landmark", e.target.value)}
                className={`${inputCls} ${errors.landmark ? errCls : ""}`}
              />
            </Field>

          </div>

          {/* Footer */}
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
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating…" : "Adding…"}</>
              ) : (
                <><Save className="w-4 h-4" /> {isEditMode ? "Update Stop" : "Add Stop"}</>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes stopModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-stop-modal { animation: stopModalIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}