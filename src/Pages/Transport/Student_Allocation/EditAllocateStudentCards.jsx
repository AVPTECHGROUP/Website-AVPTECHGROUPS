import { useState, useEffect, useRef } from "react";
import { X, Pencil, Save, Loader2, Info, ChevronDown, Search, X as XIcon } from "lucide-react";
import { updateTransportAllocation, getActiveRoutes, getTransportFeePlans } from "../../../Api/Transport/TransportAPI";
import {
  PICKUP_TYPES_OPTIONS,
  SHARED_INPUT_STYLES,
  VALIDATION_MESSAGES,
  ALLOCATION_UI_TEXT
} from "../../../Constants/StringConstants/TransportConstants"; // Adjust import path as needed

// ─── Styles ───────────────────────────────────────────────────────
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
function SelectInput({ value, onChange, options = [], placeholder = ALLOCATION_UI_TEXT.PH_SELECT_DEFAULT, hasError = false, disabled = false, loading = false }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(-1);

  const containerRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const showSearch = options.length > 6;
  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;
  const selectedLabel = options.find((o) => String(o.value) === String(value))?.label ?? "";
  const isDisabled = disabled || loading;

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

  // Auto-focus search & highlight selected
  useEffect(() => {
    if (!open) return;
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 30);
    const idx = filtered.findIndex((o) => String(o.value) === String(value));
    setFocused(idx >= 0 ? idx : -1);
  }, [open, showSearch, value, filtered]);

  // Scroll focused item into view
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
    if (e.key === "Escape") { setOpen(false); setQuery(""); setFocused(-1); }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocused((f) => Math.min(f + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocused((f) => Math.max(f - 1, -1)); }
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
          SHARED_INPUT_STYLES.base,
          "flex items-center justify-between gap-2 text-left",
          hasError ? SHARED_INPUT_STYLES.errCls : "",
          isDisabled ? disCls : "cursor-pointer",
          open ? "ring-2 ring-blue-300 border-blue-400" : "",
        ].filter(Boolean).join(" ")}
      >
        <span className={`truncate flex-1 ${!value ? "text-gray-400" : "text-gray-700"}`}>
          {loading ? ALLOCATION_UI_TEXT.LBL_LOADING : (selectedLabel || placeholder)}
        </span>
        {loading
          ? <Loader2 className="w-3.5 h-3.5 text-gray-400 animate-spin shrink-0" />
          : <ChevronDown className={`w-3.5 h-3.5 text-gray-400 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`} />
        }
      </button>

      {/* Dropdown panel */}
      {open && !isDisabled && (
        <div
          className="absolute left-0 right-0 z-9999 mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ animation: "dropIn 0.14s ease-out forwards", transformOrigin: "top" }}
        >
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
                  placeholder={ALLOCATION_UI_TEXT.PH_SELECT_SEARCH}
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
            {!query && (
              <li onClick={() => select("")}
                className={`px-3 py-2.5 text-sm cursor-pointer transition-colors ${!value ? "bg-blue-50 text-blue-600 font-medium" : "text-gray-400 hover:bg-gray-50"}`}>
                {placeholder}
              </li>
            )}
            {filtered.length === 0
              ? <li className="px-3 py-6 text-xs text-center text-gray-400">{ALLOCATION_UI_TEXT.NO_RESULTS}</li>
              : filtered.map((o, i) => {
                const isSel = String(o.value) === String(value);
                const isFoc = i === focused;
                return (
                  <li key={o.value} onClick={() => select(o.value)} onMouseEnter={() => setFocused(i)}
                    role="option" aria-selected={isSel}
                    className={[
                      "px-3 py-2.5 text-sm cursor-pointer transition-colors",
                      isSel ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-700",
                      isFoc && !isSel ? "bg-gray-100" : "",
                      !isSel && !isFoc ? "hover:bg-gray-50" : "",
                    ].join(" ")}>
                    {o.label}
                  </li>
                );
              })
            }
          </ul>

          {filtered.length > 0 && (
            <div className="px-3 py-1.5 border-t border-gray-100 text-xs text-gray-400 text-right">
              {filtered.length} {filtered.length !== 1 ? ALLOCATION_UI_TEXT.OPTION_PLURAL : ALLOCATION_UI_TEXT.OPTION_SINGULAR}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────
export default function EditAllocateStudentCards({ isOpen, onClose, onUpdate, editData }) {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [routes, setRoutes] = useState([]);
  const [feePlans, setFeePlans] = useState([]);
  const [stops, setStops] = useState([]);

  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [loadingFeePlans, setLoadingFeePlans] = useState(false);

  // Populate + fetch on open
  useEffect(() => {
    if (!isOpen || !editData) return;
    setErrors({});
    setApiError("");
    setForm({
      studentId: editData.studentId ?? "",
      routeId: editData.routeId ?? "",
      stopId: editData.stopId ?? "",
      pickupDropType: editData.pickupDropType ?? "BOTH",
      effectiveFrom: editData.effectiveFrom ?? "",
      effectiveTo: editData.effectiveTo ?? "",
      feePlanId: editData.feePlanId ?? "",
      remarks: editData.remarks ?? "",
    });

    const fetchDropdowns = async () => {
      setLoadingRoutes(true);
      setLoadingFeePlans(true);

      const [routeRes, feeRes] = await Promise.allSettled([
        getActiveRoutes(),
        getTransportFeePlans(),
      ]);

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

    fetchDropdowns();
  }, [isOpen, editData]);

  // Derive stops when route changes
  useEffect(() => {
    if (!form.routeId || routes.length === 0) return;
    const route = routes.find((r) => String(r.id) === String(form.routeId));
    setStops((route?.stops || []).map((s) => ({
      value: s.id,
      label: `${s.stopName}${s.locationAddress ? ` — ${s.locationAddress}` : ""}`,
    })));
  }, [form.routeId, routes]);

  // Also set stops on initial load
  useEffect(() => {
    if (routes.length > 0 && editData?.routeId) {
      const route = routes.find((r) => String(r.id) === String(editData.routeId));
      setStops((route?.stops || []).map((s) => ({
        value: s.id,
        label: `${s.stopName}${s.locationAddress ? ` — ${s.locationAddress}` : ""}`,
      })));
    }
  }, [routes, editData]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen || !editData) return null;

  const set = (k, v) => {
    setForm((p) => ({ ...p, [k]: v, ...(k === "routeId" ? { stopId: "" } : {}) }));
    setErrors((p) => ({ ...p, [k]: "" }));
    setApiError("");
  };

  const validate = () => {
    const e = {};
    if (!form.routeId) e.routeId = VALIDATION_MESSAGES.REQ_ROUTE;
    if (!form.stopId) e.stopId = VALIDATION_MESSAGES.REQ_STOP;
    if (!form.pickupDropType) e.pickupDropType = VALIDATION_MESSAGES.REQ_PICKUP_DROP;
    if (!form.effectiveFrom) e.effectiveFrom = VALIDATION_MESSAGES.REQ_EFFECTIVE_FROM;
    if (!form.feePlanId) e.feePlanId = VALIDATION_MESSAGES.REQ_FEE_PLAN;

    if (form.effectiveFrom && form.effectiveTo) {
      const fromDate = new Date(form.effectiveFrom).setHours(0, 0, 0, 0);
      const toDate = new Date(form.effectiveTo).setHours(0, 0, 0, 0);
      if (toDate < fromDate) {
        e.effectiveTo = VALIDATION_MESSAGES.ERR_EFFECTIVE_TO_DATE;
      }
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    setApiError("");
    try {
      await updateTransportAllocation(editData.id, {
        studentId: Number(form.studentId),
        routeId: Number(form.routeId),
        stopId: Number(form.stopId),
        pickupDropType: form.pickupDropType,
        effectiveFrom: form.effectiveFrom,
        effectiveTo: form.effectiveTo || null,
        feePlanId: Number(form.feePlanId),
        remarks: form.remarks || null,
      });
      onUpdate?.();
      onClose();
    } catch (err) {
      setApiError(err?.message || VALIDATION_MESSAGES.ERR_GENERIC);
    } finally {
      setSaving(false);
    }
  };

  const routeOptions = routes.map((r) => ({ value: r.id, label: `${r.routeCode} – ${r.routeName}` }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" onClick={!saving ? onClose : undefined} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-10 flex flex-col max-h-[92vh]"
        style={{ animation: "editIn 0.22s ease-out forwards" }}>
        <style>{`
          @keyframes editIn {
            from { opacity:0; transform:scale(0.96) translateY(14px); }
            to   { opacity:1; transform:scale(1) translateY(0); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <Pencil className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">{ALLOCATION_UI_TEXT.EDIT_MODAL_TITLE}</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {ALLOCATION_UI_TEXT.EDIT_MODAL_SUBTITLE_PREFIX} <span className="font-semibold text-gray-600">{editData.studentName}</span>
              </p>
            </div>
          </div>
          <button onClick={!saving ? onClose : undefined} disabled={saving}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5" style={{ overflowX: "visible" }}>

          {/* Amber info */}
          <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
            <span>{ALLOCATION_UI_TEXT.INFO_BANNER_EDIT}</span>
          </div>

          {/* API error */}
          {apiError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-xs text-red-700">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
              <span>{apiError}</span>
            </div>
          )}

          {/* Student (read-only) | Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_STUDENT}>
              <div className={`${SHARED_INPUT_STYLES.base} ${disCls} flex flex-col justify-center min-h-10.5`}>
                <span className="font-semibold text-gray-700">{editData.studentName}</span>
                {editData.admissionNumber && (
                  <span className="text-xs text-gray-400 mt-0.5">{ALLOCATION_UI_TEXT.LBL_ADM} {editData.admissionNumber}</span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{ALLOCATION_UI_TEXT.LBL_READONLY_STUDENT}</p>
            </Field>
            <Field label={ALLOCATION_UI_TEXT.LBL_ROUTE} required>
              <SelectInput value={form.routeId} onChange={(e) => set("routeId", e.target.value)}
                options={routeOptions} placeholder={ALLOCATION_UI_TEXT.PH_ROUTE}
                hasError={!!errors.routeId} loading={loadingRoutes} />
              {errors.routeId && <p className="text-xs text-red-500 mt-0.5">{errors.routeId}</p>}
            </Field>
          </div>

          {/* Stop | Pickup/Drop Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_STOP} required>
              <SelectInput value={form.stopId} onChange={(e) => set("stopId", e.target.value)}
                options={stops}
                placeholder={form.routeId ? ALLOCATION_UI_TEXT.PH_STOP : ALLOCATION_UI_TEXT.PH_STOP_DISABLED}
                hasError={!!errors.stopId} disabled={!form.routeId} />
              {errors.stopId && <p className="text-xs text-red-500 mt-0.5">{errors.stopId}</p>}
            </Field>
            <Field label={ALLOCATION_UI_TEXT.LBL_PICKUP_DROP} required>
              <SelectInput value={form.pickupDropType} onChange={(e) => set("pickupDropType", e.target.value)}
                options={PICKUP_TYPES_OPTIONS} placeholder={ALLOCATION_UI_TEXT.PH_TYPE}
                hasError={!!errors.pickupDropType} />
              {errors.pickupDropType && <p className="text-xs text-red-500 mt-0.5">{errors.pickupDropType}</p>}
            </Field>
          </div>

          {/* Effective From | Effective To */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_EFFECTIVE_FROM} required>
              <input type="date" value={form.effectiveFrom}
                onChange={(e) => set("effectiveFrom", e.target.value)}
                className={`${SHARED_INPUT_STYLES.base} ${errors.effectiveFrom ? SHARED_INPUT_STYLES.errCls : ""}`} />
              {errors.effectiveFrom && <p className="text-xs text-red-500 mt-0.5">{errors.effectiveFrom}</p>}
            </Field>
            <Field label={ALLOCATION_UI_TEXT.LBL_EFFECTIVE_TO}>
              <input type="date" value={form.effectiveTo ?? ""}
                onChange={(e) => set("effectiveTo", e.target.value)}
                className={`${SHARED_INPUT_STYLES.base} ${errors.effectiveTo ? SHARED_INPUT_STYLES.errCls : ""}`} />
              {errors.effectiveTo && <p className="text-xs text-red-500 mt-0.5">{errors.effectiveTo}</p>}
            </Field>
          </div>

          {/* Fee Plan | Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_FEE_PLAN} required>
              <SelectInput value={form.feePlanId} onChange={(e) => set("feePlanId", e.target.value)}
                options={feePlans} placeholder={ALLOCATION_UI_TEXT.PH_FEE_PLAN}
                hasError={!!errors.feePlanId} loading={loadingFeePlans} />
              {errors.feePlanId && <p className="text-xs text-red-500 mt-0.5">{errors.feePlanId}</p>}
            </Field>
            <Field label={ALLOCATION_UI_TEXT.LBL_REMARKS}>
              <input type="text" placeholder={ALLOCATION_UI_TEXT.PH_OPTIONAL} value={form.remarks ?? ""}
                onChange={(e) => set("remarks", e.target.value)} className={SHARED_INPUT_STYLES.base} />
            </Field>
          </div>

          {/* Bottom padding */}
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
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {ALLOCATION_UI_TEXT.BTN_UPDATING}</>
              : <><Save className="w-4 h-4" /> {ALLOCATION_UI_TEXT.BTN_UPDATE_SAVE}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}