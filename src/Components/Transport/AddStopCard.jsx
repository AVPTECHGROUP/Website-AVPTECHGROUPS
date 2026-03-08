import { useState, useEffect } from "react";
import { X, MapPin, Save, Loader2, Hash, Clock, Navigation } from "lucide-react";

const EMPTY_FORM = {
  stopName: "",
  stopOrder: "",
  pickupTime: "",
  dropTime: "",
  locationAddress: "",
  landmark: "",
};

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

const base =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 transition border-gray-200 focus:ring-blue-300 focus:border-blue-400";
const err = "border-red-400 focus:ring-red-200 focus:border-red-400";

export default function AddStopCard({ isOpen, onClose, onSave, routeName = "" }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) { setForm(EMPTY_FORM); setErrors({}); }
  }, [isOpen]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v }));
    setErrors((p) => ({ ...p, [k]: "" }));
  };

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

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1500));
    onSave?.({ ...form, stopOrder: Number(form.stopOrder) });
    setSaving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-stop-in">
        <style>{`
          @keyframes stopIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .animate-stop-in { animation: stopIn 0.2s ease-out forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
              <MapPin className="w-4 h-4 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">Add Stop</h2>
              {routeName && <p className="text-xs text-gray-400 mt-0.5">{routeName}</p>}
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Stop Name + Stop Order */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stop Name" required icon={MapPin}>
              <input type="text" placeholder="e.g. Green Park Colony"
                value={form.stopName} onChange={(e) => set("stopName", e.target.value)}
                className={`${base} ${errors.stopName ? err : ""}`} />
              {errors.stopName && <p className="text-xs text-red-500 mt-0.5">{errors.stopName}</p>}
            </Field>
            <Field label="Stop Order" required icon={Hash}>
              <input type="number" min="1" placeholder="e.g. 5"
                value={form.stopOrder} onChange={(e) => set("stopOrder", e.target.value)}
                className={`${base} ${errors.stopOrder ? err : ""}`} />
              {errors.stopOrder && <p className="text-xs text-red-500 mt-0.5">{errors.stopOrder}</p>}
            </Field>
          </div>

          {/* Pickup Time + Drop Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Pickup Time" required icon={Clock}>
              <input type="time" value={form.pickupTime} onChange={(e) => set("pickupTime", e.target.value)}
                className={`${base} ${errors.pickupTime ? err : ""}`} />
              {errors.pickupTime && <p className="text-xs text-red-500 mt-0.5">{errors.pickupTime}</p>}
            </Field>
            <Field label="Drop Time" required icon={Clock}>
              <input type="time" value={form.dropTime} onChange={(e) => set("dropTime", e.target.value)}
                className={`${base} ${errors.dropTime ? err : ""}`} />
              {errors.dropTime && <p className="text-xs text-red-500 mt-0.5">{errors.dropTime}</p>}
            </Field>
          </div>

          {/* Location Address + Landmark */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Location Address" required icon={Navigation}>
              <input type="text" placeholder="Full address"
                value={form.locationAddress} onChange={(e) => set("locationAddress", e.target.value)}
                className={`${base} ${errors.locationAddress ? err : ""}`} />
              {errors.locationAddress && <p className="text-xs text-red-500 mt-0.5">{errors.locationAddress}</p>}
            </Field>
            <Field label="Landmark" required icon={MapPin}>
              <input type="text" placeholder="Near..."
                value={form.landmark} onChange={(e) => set("landmark", e.target.value)}
                className={`${base} ${errors.landmark ? err : ""}`} />
              {errors.landmark && <p className="text-xs text-red-500 mt-0.5">{errors.landmark}</p>}
            </Field>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <button onClick={onClose} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Adding Stop…</> : <><Save className="w-4 h-4" /> Add Stop</>}
          </button>
        </div>
      </div>
    </div>
  );
}