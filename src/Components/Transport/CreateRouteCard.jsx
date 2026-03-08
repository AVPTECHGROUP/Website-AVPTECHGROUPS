import { useState, useEffect } from "react";
import { X, Map, Save, Loader2, Hash, Clock, AlignLeft, Bus, User, Users } from "lucide-react";

const VEHICLES   = ["MH12AB1234 (BUS)", "MH12CD5678 (MINI BUS)", "MH12EF9012 (VAN)"];
const DRIVERS    = ["Ramesh Kumar", "Suresh Patil"];
const ATTENDANTS = ["Sunita Jadhav", "Pooja Sharma"];

const EMPTY_FORM = {
  routeName: "",
  routeCode: "",
  vehicle: "",
  driver: "",
  attendant: "",
  startTime: "",
  returnTime: "",
  description: "",
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
const errCls = "border-red-400 focus:ring-red-200 focus:border-red-400";

export default function CreateRouteCard({ isOpen, onClose, onSave }) {
  const [form, setForm]     = useState(EMPTY_FORM);
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
    if (!form.routeName.trim())  e.routeName  = "Route name is required";
    if (!form.routeCode.trim())  e.routeCode  = "Route code is required";
    if (!form.vehicle)           e.vehicle    = "Please assign a vehicle";
    if (!form.driver)            e.driver     = "Please assign a driver";
    if (!form.attendant)         e.attendant  = "Please assign an attendant";
    if (!form.startTime)         e.startTime  = "Start (pickup) time is required";
    if (!form.returnTime)        e.returnTime = "Return (drop) time is required";
    if (!form.description.trim()) e.description = "Description is required";
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

  const SelectField = ({ k, placeholder, options, icon: Icon, label, required }) => (
    <Field label={label} required={required} icon={Icon}>
      <div className="relative">
        <select
          value={form[k]}
          onChange={(e) => set(k, e.target.value)}
          className={`${base} appearance-none pr-9 cursor-pointer ${errors[k] ? errCls : ""}`}
        >
          <option value="">{placeholder}</option>
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
        <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      {errors[k] && <p className="text-xs text-red-500 mt-0.5">{errors[k]}</p>}
    </Field>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/20" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-route-in">
        <style>{`
          @keyframes routeIn {
            from { opacity:0; transform:scale(0.95) translateY(12px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
          .animate-route-in { animation: routeIn 0.2s ease-out forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <Map className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg font-bold text-gray-800">Create Route</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">

          {/* Route Name + Route Code */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Route Name" required icon={Map}>
              <input type="text" placeholder="e.g. Route C – East Zone"
                value={form.routeName} onChange={(e) => set("routeName", e.target.value)}
                className={`${base} ${errors.routeName ? errCls : ""}`} />
              {errors.routeName && <p className="text-xs text-red-500 mt-0.5">{errors.routeName}</p>}
            </Field>
            <Field label="Route Code" required icon={Hash}>
              <input type="text" placeholder="RT-003"
                value={form.routeCode} onChange={(e) => set("routeCode", e.target.value)}
                className={`${base} ${errors.routeCode ? errCls : ""}`} />
              {errors.routeCode && <p className="text-xs text-red-500 mt-0.5">{errors.routeCode}</p>}
            </Field>
          </div>

          {/* Assign Vehicle + Assign Driver */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField k="vehicle" label="Assign Vehicle" required icon={Bus}
              placeholder="— Select Vehicle —" options={VEHICLES} />
            <SelectField k="driver" label="Assign Driver" required icon={User}
              placeholder="— Select Driver —" options={DRIVERS} />
          </div>

          {/* Assign Attendant + Start Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectField k="attendant" label="Assign Attendant" required icon={Users}
              placeholder="— Select Attendant —" options={ATTENDANTS} />
            <Field label="Start Time (Pickup)" required icon={Clock}>
              <input type="time" value={form.startTime} onChange={(e) => set("startTime", e.target.value)}
                className={`${base} ${errors.startTime ? errCls : ""}`} />
              {errors.startTime && <p className="text-xs text-red-500 mt-0.5">{errors.startTime}</p>}
            </Field>
          </div>

          {/* Return Time + Description */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Return Time (Drop)" required icon={Clock}>
              <input type="time" value={form.returnTime} onChange={(e) => set("returnTime", e.target.value)}
                className={`${base} ${errors.returnTime ? errCls : ""}`} />
              {errors.returnTime && <p className="text-xs text-red-500 mt-0.5">{errors.returnTime}</p>}
            </Field>
            <Field label="Description" required icon={AlignLeft}>
              <input type="text" placeholder="Optional description"
                value={form.description} onChange={(e) => set("description", e.target.value)}
                className={`${base} ${errors.description ? errCls : ""}`} />
              {errors.description && <p className="text-xs text-red-500 mt-0.5">{errors.description}</p>}
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
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Route…</> : <><Save className="w-4 h-4" /> Create Route</>}
          </button>
        </div>
      </div>
    </div>
  );
}