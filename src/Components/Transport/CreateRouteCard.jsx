import { useState, useEffect } from "react";
import { X, Map, Save, Loader2, Hash, Clock, AlignLeft, Bus, User, Users, Pencil } from "lucide-react";
import { addRoute, updateRoute, getActiveVehicles, getTransportStaff } from "../../Api/TransportAPI";

// ─── Empty form ───────────────────────────────────────────────────
const EMPTY_FORM = {
  routeName:   "",
  routeCode:   "",
  vehicleId:   "",
  driverId:    "",
  attendantId: "",
  startTime:   "",
  returnTime:  "",
  description: "",
};

// ─── Helpers ──────────────────────────────────────────────────────
function toTimeInput(t) {
  // "07:00:00" → "07:00"
  if (!t) return "";
  return String(t).slice(0, 5);
}

function routeToForm(r) {
  return {
    routeName:   r.routeName   || "",
    routeCode:   r.routeCode   || "",
    vehicleId:   r.vehicleId   ? String(r.vehicleId)   : "",
    driverId:    r.driverId    ? String(r.driverId)    : "",
    attendantId: r.attendantId ? String(r.attendantId) : "",
    startTime:   toTimeInput(r.startTime),
    returnTime:  toTimeInput(r.returnTime),
    description: r.description || "",
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
//   editData  — route object | null
export default function CreateRouteCard({ isOpen, onClose, onSaved, editData }) {
  const isEditMode = Boolean(editData);

  const [form, setForm]         = useState(EMPTY_FORM);
  const [saving, setSaving]     = useState(false);
  const [errors, setErrors]     = useState({});
  const [apiError, setApiError] = useState("");

  // Dropdown data
  const [vehicles,   setVehicles]   = useState([]);
  const [drivers,    setDrivers]    = useState([]);
  const [attendants, setAttendants] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(false);

  // Populate form + fetch dropdowns on open
  useEffect(() => {
    if (!isOpen) return;
    setForm(isEditMode ? routeToForm(editData) : EMPTY_FORM);
    setErrors({});
    setApiError("");

    const loadDropdowns = async () => {
      setLoadingDropdowns(true);
      try {
        const [v, staffRes] = await Promise.all([
          getActiveVehicles(),
          Promise.all([
            import("../../Api/TransportAPI").then((m) => m.getTransportStaff({ size: 200, role: "DRIVER",    status: "ACTIVE" })),
            import("../../Api/TransportAPI").then((m) => m.getTransportStaff({ size: 200, role: "ATTENDANT", status: "ACTIVE" })),
          ]),
        ]);
        setVehicles(v || []);
        setDrivers(staffRes[0]?.staff || []);
        setAttendants(staffRes[1]?.staff || []);
      } catch {
        /* silent — user can still type IDs */
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, [isOpen, isEditMode, editData]);

  // Lock scroll
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

  // ── Validate ──
  const validate = () => {
    const e = {};
    if (!form.routeName.trim()) e.routeName  = "Route name is required";
    if (!form.routeCode.trim()) e.routeCode  = "Route code is required";
    if (!form.vehicleId)        e.vehicleId  = "Please assign a vehicle";
    if (!form.driverId)         e.driverId   = "Please assign a driver";
    if (!form.startTime)        e.startTime  = "Start time is required";
    if (!form.returnTime)       e.returnTime = "Return time is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Save ──
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");

    const payload = {
      routeName:   form.routeName.trim(),
      routeCode:   form.routeCode.trim().toUpperCase(),
      description: form.description.trim() || null,
      vehicleId:   Number(form.vehicleId),
      driverId:    Number(form.driverId),
      attendantId: form.attendantId ? Number(form.attendantId) : null,
      startTime:   form.startTime   ? `${form.startTime}:00` : null,
      returnTime:  form.returnTime  ? `${form.returnTime}:00` : null,
    };

    try {
      if (isEditMode) {
        await updateRoute(editData.id, payload);
      } else {
        await addRoute(payload);
      }
      onSaved?.(isEditMode);
    } catch (err) {
      console.error(err);
      setApiError(
        isEditMode
          ? "Failed to update route. Please try again."
          : "Failed to create route. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  // ── Select helper ──
  const SelectField = ({ fieldKey, label, required, icon: Icon, placeholder, options, valueKey, labelFn }) => (
    <Field label={label} required={required} icon={Icon} error={errors[fieldKey]}>
      <div className="relative">
        {loadingDropdowns ? (
          <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Loading…</span>
          </div>
        ) : (
          <>
            <select
              value={form[fieldKey]}
              onChange={(e) => set(fieldKey, e.target.value)}
              className={`${inputCls} appearance-none pr-9 cursor-pointer ${errors[fieldKey] ? errCls : ""}`}
            >
              <option value="">{placeholder}</option>
              {options.map((o) => (
                <option key={o[valueKey]} value={String(o[valueKey])}>
                  {labelFn(o)}
                </option>
              ))}
            </select>
            <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </>
        )}
      </div>
    </Field>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-route-modal">
        <div className="max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                {isEditMode
                  ? <Pencil className="w-4 h-4 text-blue-600" />
                  : <Map className="w-4 h-4 text-blue-600" />}
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-800">
                  {isEditMode ? "Edit Route" : "Create New Route"}
                </h2>
                {isEditMode && (
                  <p className="text-xs text-gray-400">{editData.routeName}</p>
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

          {/* Body */}
          <div className="px-6 py-5 space-y-4">

            {apiError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {apiError}
              </div>
            )}

            {/* Route Name + Route Code */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Route Name" required icon={Map} error={errors.routeName}>
                <input
                  type="text"
                  placeholder="e.g. Route C – East Zone"
                  value={form.routeName}
                  onChange={(e) => set("routeName", e.target.value)}
                  className={`${inputCls} ${errors.routeName ? errCls : ""}`}
                />
              </Field>
              <Field label="Route Code" required icon={Hash} error={errors.routeCode}>
                <input
                  type="text"
                  placeholder="e.g. RT-003"
                  value={form.routeCode}
                  onChange={(e) => set("routeCode", e.target.value)}
                  className={`${inputCls} ${errors.routeCode ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Vehicle + Driver */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                fieldKey="vehicleId" label="Assign Vehicle" required icon={Bus}
                placeholder="— Select Vehicle —"
                options={vehicles} valueKey="id"
                labelFn={(v) => `${v.vehicleNumber} (${v.vehicleType?.replace("_", " ") || ""})`}
              />
              <SelectField
                fieldKey="driverId" label="Assign Driver" required icon={User}
                placeholder="— Select Driver —"
                options={drivers} valueKey="id"
                labelFn={(d) => d.fullName}
              />
            </div>

            {/* Attendant + Start Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SelectField
                fieldKey="attendantId" label="Assign Attendant" icon={Users}
                placeholder="— Select Attendant (optional) —"
                options={attendants} valueKey="id"
                labelFn={(a) => a.fullName}
              />
              <Field label="Start Time (Pickup)" required icon={Clock} error={errors.startTime}>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => set("startTime", e.target.value)}
                  className={`${inputCls} ${errors.startTime ? errCls : ""}`}
                />
              </Field>
            </div>

            {/* Return Time + Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Return Time (Drop)" required icon={Clock} error={errors.returnTime}>
                <input
                  type="time"
                  value={form.returnTime}
                  onChange={(e) => set("returnTime", e.target.value)}
                  className={`${inputCls} ${errors.returnTime ? errCls : ""}`}
                />
              </Field>
              <Field label="Description" icon={AlignLeft}>
                <input
                  type="text"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  className={inputCls}
                />
              </Field>
            </div>

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
                <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating…" : "Creating…"}</>
              ) : (
                <><Save className="w-4 h-4" /> {isEditMode ? "Update Route" : "Create Route"}</>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes routeModalIn {
          from { opacity: 0; transform: scale(0.95) translateY(12px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-route-modal { animation: routeModalIn 0.2s ease-out forwards; }
      `}</style>
    </div>
  );
}