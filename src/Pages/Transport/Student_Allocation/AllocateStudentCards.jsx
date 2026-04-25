import { useState, useEffect, useRef } from "react";
import { X, GraduationCap, Save, Loader2, Info, ChevronDown, Search, XIcon } from "lucide-react";
import { addTransportAllocation, getActiveRoutes, getTransportFeePlans } from "../../../Api/TransportAPI";
import { getStudents } from "../../../Api/StudentsApi";

// ─── Constants ────────────────────────────────────────────────────
const PICKUP_TYPES = [
  { value: "BOTH",        label: "BOTH" },
  { value: "PICKUP_ONLY", label: "PICKUP ONLY" },
  { value: "DROP_ONLY",   label: "DROP ONLY" },
];

const EMPTY = {
  studentId:      "",
  routeId:        "",
  stopId:         "",
  pickupDropType: "BOTH",
  effectiveFrom:  "",
  effectiveTo:    "",
  feePlanId:      "",
  remarks:        "",
};

// ─── Styles ───────────────────────────────────────────────────────
const inputBase =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white " +
  "focus:outline-none focus:ring-2 transition border-gray-200 focus:ring-blue-300 focus:border-blue-400";
const errCls = "border-red-400 focus:ring-red-200 focus:border-red-400";
const disCls = "opacity-50 cursor-not-allowed bg-gray-50";

// ─── Field wrapper ────────────────────────────────────────────────
function Field({ label, required, children }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Custom Scrollable SelectInput ────────────────────────────────
function SelectInput({ value, onChange, options = [], placeholder = "— Select —", hasError = false, disabled = false, loading = false }) {
  const [open,    setOpen]    = useState(false);
  const [query,   setQuery]   = useState("");
  const [focused, setFocused] = useState(-1);

  const containerRef = useRef(null);
  const searchRef    = useRef(null);
  const listRef      = useRef(null);

  const showSearch = options.length > 6;
  const filtered   = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";
  const isDisabled    = disabled || loading;

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery("");
        setFocused(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Auto-focus search & scroll selected into view
  useEffect(() => {
    if (!open) return;
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 30);
    const idx = filtered.findIndex((o) => String(o.value) === String(value));
    setFocused(idx >= 0 ? idx : -1);
  }, [open]); // eslint-disable-line

  // Scroll focused item
  useEffect(() => {
    if (focused >= 0 && listRef.current) {
      listRef.current.children[focused]?.scrollIntoView({ block: "nearest" });
    }
  }, [focused]);

  const select = (v) => {
    onChange?.({ target: { value: v } });
    setOpen(false);
    setQuery("");
    setFocused(-1);
  };

  const handleKeyDown = (e) => {
    if (!open) {
      if (["Enter", " ", "ArrowDown"].includes(e.key)) { e.preventDefault(); setOpen(true); }
      return;
    }
    if (e.key === "Escape")    { setOpen(false); setQuery(""); setFocused(-1); }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp")   { e.preventDefault(); setFocused((f) => Math.max(f - 1, -1)); }
    if (e.key === "Enter" && focused >= 0) { e.preventDefault(); select(filtered[focused].value); }
  };

  return (
    <div ref={containerRef} className="relative" onKeyDown={handleKeyDown}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => !isDisabled && setOpen((o) => !o)}
        disabled={isDisabled}
        className={[
          inputBase,
          "flex items-center justify-between gap-2 text-left",
          hasError ? errCls : "",
          isDisabled ? disCls : "cursor-pointer",
          open ? "ring-2 ring-blue-300 border-blue-400" : "",
        ].filter(Boolean).join(" ")}
      >
        <span className={`truncate flex-1 ${!value ? "text-gray-400" : "text-gray-700"}`}>
          {loading ? "Loading…" : (selectedLabel || placeholder)}
        </span>
        {loading
          ? <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
          : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {/* Dropdown panel — rendered in a portal-like absolute, z-[9999] ensures it floats above modal body */}
      {open && !isDisabled && (
        <div className="absolute left-0 right-0 z-9999 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ animation: "dropIn 0.14s ease-out forwards", transformOrigin: "top" }}>
          <style>{`
            @keyframes dropIn {
              from { opacity:0; transform: translateY(-6px) scaleY(0.95); }
              to   { opacity:1; transform: translateY(0)    scaleY(1);    }
            }
          `}</style>

          {/* Search */}
          {showSearch && (
            <div className="px-2.5 pt-2.5 pb-1.5 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  ref={searchRef}
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setFocused(-1); }}
                  placeholder="Search…"
                  className="w-full pl-8 pr-7 py-1.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-400 placeholder-gray-400"
                />
                {query && (
                  <button type="button" onClick={() => { setQuery(""); searchRef.current?.focus(); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <XIcon className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* List */}
          <ul ref={listRef} className="overflow-y-auto overscroll-contain" style={{ maxHeight: "220px" }} role="listbox">
            {/* Placeholder option */}
            {!query && (
              <li onClick={() => select("")}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${!value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-400 hover:bg-gray-50"}`}>
                {placeholder}
              </li>
            )}

            {filtered.length === 0
              ? <li className="px-3 py-6 text-xs text-center text-gray-400">No results found</li>
              : filtered.map((o, i) => {
                  const isSel = String(o.value) === String(value);
                  const isFoc = i === focused;
                  return (
                    <li key={o.value} onClick={() => select(o.value)} onMouseEnter={() => setFocused(i)}
                      role="option" aria-selected={isSel}
                      className={[
                        "px-3 py-2.5 text-sm cursor-pointer transition-colors",
                        isSel              ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700",
                        isFoc && !isSel    ? "bg-gray-100" : "",
                        !isSel && !isFoc   ? "hover:bg-gray-50" : "",
                      ].join(" ")}>
                      {o.label}
                    </li>
                  );
                })
            }
          </ul>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400 text-right">
              {filtered.length} option{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function AllocateStudentCard({ isOpen, onClose, onSave }) {
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [errors,   setErrors]   = useState({});
  const [apiError, setApiError] = useState("");

  const [students,  setStudents]  = useState([]);
  const [routes,    setRoutes]    = useState([]);
  const [feePlans,  setFeePlans]  = useState([]);
  const [stops,     setStops]     = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingRoutes,   setLoadingRoutes]   = useState(false);
  const [loadingFeePlans, setLoadingFeePlans] = useState(false);

  // Fetch on open
  useEffect(() => {
    if (!isOpen) return;
    setForm(EMPTY);
    setErrors({});
    setApiError("");
    setStops([]);

    const fetchAll = async () => {
      setLoadingStudents(true);
      setLoadingRoutes(true);
      setLoadingFeePlans(true);

      const [studRes, routeRes, feeRes] = await Promise.allSettled([
        getStudents(0, 200, "id"),
        getActiveRoutes(),
        getTransportFeePlans(),
      ]);

      if (studRes.status === "fulfilled") {
        const list = studRes.value?.data || studRes.value || [];
        setStudents(list.map((s) => ({
          value: s.id,
          label: `${s.admissionNumber ? `[${s.admissionNumber}] ` : ""}${s.fullName || `${s.firstName} ${s.lastName}`}${s.className ? ` — ${s.className}${s.sectionName ? " " + s.sectionName : ""}` : ""}`,
        })));
      }
      setLoadingStudents(false);

      if (routeRes.status === "fulfilled") setRoutes(routeRes.value || []);
      setLoadingRoutes(false);

      if (feeRes.status === "fulfilled") {
        setFeePlans((feeRes.value || []).map((f) => ({
          value: f.id,
          label: `${f.planName} — ₹${f.feeAmount} / ${f.frequency}`,
        })));
      }
      setLoadingFeePlans(false);
    };

    fetchAll();
  }, [isOpen]);

  // Derive stops from selected route
  useEffect(() => {
    if (!form.routeId) { setStops([]); return; }
    const route = routes.find((r) => String(r.id) === String(form.routeId));
    setStops((route?.stops || []).map((s) => ({
      value: s.id,
      label: `${s.stopName}${s.locationAddress ? ` — ${s.locationAddress}` : ""}`,
    })));
  }, [form.routeId, routes]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v, ...(k === "routeId" ? { stopId: "" } : {}) }));
    setErrors((p) => ({ ...p, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.studentId)      e.studentId      = "Please select a student";
    if (!form.routeId)        e.routeId        = "Please select a route";
    if (!form.stopId)         e.stopId         = "Please select a stop";
    if (!form.pickupDropType) e.pickupDropType = "Please select pickup/drop type";
    if (!form.effectiveFrom)  e.effectiveFrom  = "Effective from date is required";
    if (!form.feePlanId)      e.feePlanId      = "Please select a fee plan";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await addTransportAllocation({
        studentId:      Number(form.studentId),
        routeId:        Number(form.routeId),
        stopId:         Number(form.stopId),
        pickupDropType: form.pickupDropType,
        effectiveFrom:  form.effectiveFrom,
        effectiveTo:    form.effectiveTo || null,
        feePlanId:      Number(form.feePlanId),
        remarks:        form.remarks || null,
      });
      onSave?.();
      onClose();
    } catch (err) {
      setApiError(err?.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const routeOptions = routes.map((r) => ({ value: r.id, label: `${r.routeCode} – ${r.routeName}` }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={!saving ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[92vh]"
        style={{ animation: "allocIn 0.22s ease-out forwards" }}>
        <style>{`
          @keyframes allocIn {
            from { opacity:0; transform:scale(0.96) translateY(14px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Allocate Student to Transport</h2>
              <p className="text-xs text-gray-400 mt-0.5">Assign a student to a route, stop and fee plan</p>
            </div>
          </div>
          <button onClick={!saving ? onClose : undefined} disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body — overflow visible so dropdowns can escape */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ overflowX: "visible" }}>

          {/* Info banner */}
          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <span>Vehicle capacity is validated automatically. A student can only have one active transport allocation.</span>
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Student | Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Student" required>
              <SelectInput value={form.studentId} onChange={(e) => set("studentId", e.target.value)}
                options={students} placeholder="— Select Student —"
                hasError={!!errors.studentId} loading={loadingStudents} />
              {errors.studentId && <p className="text-xs text-red-500 mt-0.5">{errors.studentId}</p>}
            </Field>
            <Field label="Route" required>
              <SelectInput value={form.routeId} onChange={(e) => set("routeId", e.target.value)}
                options={routeOptions} placeholder="— Select Route —"
                hasError={!!errors.routeId} loading={loadingRoutes} />
              {errors.routeId && <p className="text-xs text-red-500 mt-0.5">{errors.routeId}</p>}
            </Field>
          </div>

          {/* Stop | Pickup/Drop Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Stop" required>
              <SelectInput value={form.stopId} onChange={(e) => set("stopId", e.target.value)}
                options={stops}
                placeholder={form.routeId ? "— Select Stop —" : "— Select Route first —"}
                hasError={!!errors.stopId} disabled={!form.routeId} />
              {errors.stopId && <p className="text-xs text-red-500 mt-0.5">{errors.stopId}</p>}
            </Field>
            <Field label="Pickup / Drop Type" required>
              <SelectInput value={form.pickupDropType} onChange={(e) => set("pickupDropType", e.target.value)}
                options={PICKUP_TYPES} placeholder="— Select Type —"
                hasError={!!errors.pickupDropType} />
              {errors.pickupDropType && <p className="text-xs text-red-500 mt-0.5">{errors.pickupDropType}</p>}
            </Field>
          </div>

          {/* Effective From | Effective To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Effective From" required>
              <input type="date" value={form.effectiveFrom}
                onChange={(e) => set("effectiveFrom", e.target.value)}
                className={`${inputBase} ${errors.effectiveFrom ? errCls : ""}`} />
              {errors.effectiveFrom && <p className="text-xs text-red-500 mt-0.5">{errors.effectiveFrom}</p>}
            </Field>
            <Field label="Effective To">
              <input type="date" value={form.effectiveTo}
                onChange={(e) => set("effectiveTo", e.target.value)}
                className={inputBase} />
            </Field>
          </div>

          {/* Fee Plan | Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Fee Plan" required>
              <SelectInput value={form.feePlanId} onChange={(e) => set("feePlanId", e.target.value)}
                options={feePlans} placeholder="— Select Fee Plan —"
                hasError={!!errors.feePlanId} loading={loadingFeePlans} />
              {errors.feePlanId && <p className="text-xs text-red-500 mt-0.5">{errors.feePlanId}</p>}
            </Field>
            <Field label="Remarks">
              <input type="text" placeholder="Optional" value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)} className={inputBase} />
            </Field>
          </div>

          {/* Bottom padding so last dropdown isn't clipped */}
          <div className="h-2" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0 rounded-b-2xl">
          <button onClick={!saving ? onClose : undefined} disabled={saving}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors shadow-sm">
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Allocating…</>
              : <><Save className="w-4 h-4" /> Allocate</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}