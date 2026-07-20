import { useState, useEffect, useRef } from "react";
import { X, GraduationCap, Save, Loader2, Info, ChevronDown, Search, XIcon } from "lucide-react";
import { toast } from "react-toastify";
import { addTransportAllocation, updateTransportAllocation, getActiveRoutes } from "../../../Api/Transport/TransportAPI";
import { getStudents } from "../../../Api/Students/StudentsApi";
import {
  PICKUP_TYPES_OPTIONS,
  EMPTY_ALLOCATION,
  SHARED_INPUT_STYLES,
  VALIDATION_MESSAGES,
  ALLOCATION_UI_TEXT
} from "../../../Constants/StringConstants/TransportConstants";

// ─── Styles ───────────────────────────────────────────────────────
const disCls = "opacity-50 cursor-allowed bg-gray-50";

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

  useEffect(() => {
    if (!open) return;
    if (showSearch) setTimeout(() => searchRef.current?.focus(), 30);
    const idx = filtered.findIndex((o) => String(o.value) === String(value));
    setFocused(idx >= 0 ? idx : -1);
  }, [open, showSearch, value, filtered]);

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

      {open && !isDisabled && (
        <div className="absolute left-0 right-0 z-[9999] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden"
          style={{ animation: "dropIn 0.14s ease-out forwards", transformOrigin: "top" }}>
          <style>{`
            @keyframes dropIn {
              from { opacity:0; transform: translateY(-6px) scaleY(0.95); }
              to   { opacity:1; transform: translateY(0)    scaleY(1);    }
            }
          `}</style>

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
export default function AllocateStudentCard({ isOpen, onClose, onSave, allocationData = null }) {
  const isEditMode = !!allocationData;

  const [form, setForm] = useState({ ...EMPTY_ALLOCATION, monthlyFee: "", overrideReason: "" });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const [students, setStudents] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingRoutes, setLoadingRoutes] = useState(false);

  // Fetch on open & set initial edit data if present
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    setStops([]);

    if (isEditMode) {
      const initialFee = allocationData.overrideFeeAmount !== null && allocationData.overrideFeeAmount !== undefined
        ? String(allocationData.overrideFeeAmount)
        : allocationData.feeAmount !== null && allocationData.feeAmount !== undefined
          ? String(allocationData.feeAmount)
          : "";

      setForm({
        studentId: allocationData.studentId || "",
        routeId: allocationData.routeId || "",
        stopId: allocationData.stopId || "",
        pickupDropType: allocationData.pickupDropType || "",
        effectiveFrom: allocationData.effectiveFrom || "",
        effectiveTo: allocationData.effectiveTo || "",
        monthlyFee: initialFee,
        overrideReason: allocationData.overrideReason || "",
        remarks: allocationData.remarks || ""
      });
    } else {
      setForm({ ...EMPTY_ALLOCATION, monthlyFee: "", overrideReason: "" });
    }

    const fetchAll = async () => {
      setLoadingStudents(true);
      setLoadingRoutes(true);

      const [studRes, routeRes] = await Promise.allSettled([
        getStudents(0, 3000, "id"),
        getActiveRoutes(),
      ]);

      if (studRes.status === "fulfilled") {
        const list = studRes.value?.data || studRes.value || [];

        // 🔹 Filter for transportRequired = true
        const transportStudents = Array.isArray(list)
          ? list.filter((s) => Boolean(s.transportRequired))
          : [];

        setStudents(transportStudents.map((s) => ({
          value: s.id,
          label: `Roll No. ${s.rollNumber} - ${s.fullName || `${s.firstName} ${s.lastName}`}${s.className ? ` — ${s.className}${s.sectionName ? " " + s.sectionName : ""}` : ""}`,
        })));
      }
      setLoadingStudents(false);

      if (routeRes.status === "fulfilled") setRoutes(routeRes.value || []);
      setLoadingRoutes(false);
    };

    fetchAll();
  }, [isOpen, allocationData, isEditMode]);

  // Derive stops (with monthlyFee) from selected route
  useEffect(() => {
    if (!form.routeId) { setStops([]); return; }
    const route = routes.find((r) => String(r.id) === String(form.routeId));
    setStops((route?.stops || []).map((s) => ({
      value: s.id,
      label: `${s.stopName}${s.locationAddress ? ` — ${s.locationAddress}` : ""}`,
      monthlyFee: s.monthlyFee,
    })));
  }, [form.routeId, routes]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const set = (k, v) => {
    setForm((p) => {
      const next = { ...p, [k]: v };
      if (k === "routeId") {
        next.stopId = "";
        next.monthlyFee = "";
        next.overrideReason = "";
      }
      if (k === "stopId") {
        const stop = stops.find((s) => String(s.value) === String(v));
        next.monthlyFee = stop?.monthlyFee != null ? String(stop.monthlyFee) : "";
        next.overrideReason = "";
      }
      return next;
    });
    setErrors((p) => ({ ...p, [k]: "" }));
  };

  // Determine if the fee differs from the base price structure
  const currentStop = stops.find((s) => String(s.value) === String(form.stopId));
  const defaultFee = currentStop?.monthlyFee != null
    ? String(currentStop.monthlyFee)
    : (isEditMode && allocationData ? String(allocationData.feeAmount) : "");

  const isFeeOverridden = form.stopId && Number(form.monthlyFee) !== Number(defaultFee);

  const validate = () => {
    const e = {};
    if (!form.studentId) e.studentId = VALIDATION_MESSAGES.REQ_STUDENT;
    if (!form.routeId) e.routeId = VALIDATION_MESSAGES.REQ_ROUTE;
    if (!form.stopId) e.stopId = VALIDATION_MESSAGES.REQ_STOP;
    if (!form.pickupDropType) e.pickupDropType = VALIDATION_MESSAGES.REQ_PICKUP_DROP;
    if (!form.effectiveFrom) e.effectiveFrom = VALIDATION_MESSAGES.REQ_EFFECTIVE_FROM;

    if (isFeeOverridden && !form.overrideReason.trim()) {
      e.overrideReason = "Override reason is required when the fee amount is changed.";
    }

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

    // FIXED: Only populate override fields if user has explicitly changed the fee amount
    const payload = {
      studentId: Number(form.studentId),
      routeId: Number(form.routeId),
      stopId: Number(form.stopId),
      pickupDropType: form.pickupDropType,
      effectiveFrom: form.effectiveFrom,
      effectiveTo: form.effectiveTo || null,
      overrideFeeAmount: isFeeOverridden && form.monthlyFee !== "" ? Number(form.monthlyFee) : null,
      overrideReason: isFeeOverridden ? form.overrideReason : null,
      remarks: form.remarks || null,
    };

    try {
      if (isEditMode) {
        await updateTransportAllocation(allocationData.id, payload);
        toast.success("Transport allocation updated successfully!");
      } else {
        await addTransportAllocation(payload);
        toast.success("Transport allocation created successfully!");
      }
      onSave?.();
      onClose();
    } catch (err) {
      const serverMessage = err?.response?.data?.message || err?.message || VALIDATION_MESSAGES.ERR_GENERIC;
      toast.error(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  const routeOptions = routes.map((r) => ({ value: r.id, label: `${r.routeCode} – ${r.routeName}` }));
  const selectedStudentObj = students.find((s) => String(s.value) === String(form.studentId));

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
              <h2 className="text-base font-bold text-gray-900">
                {isEditMode ? "Edit Transport Allocation" : ALLOCATION_UI_TEXT.ADD_MODAL_TITLE}
              </h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {isEditMode && selectedStudentObj ? `Editing allocation for ${selectedStudentObj.label.split(' — ')[0]}` : ALLOCATION_UI_TEXT.ADD_MODAL_SUBTITLE}
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

          <div className="flex items-start gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-xs text-blue-700">
            <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
            <span>{isEditMode ? "Changes to route or stop will take effect immediately. Student cannot be changed after allocation." : ALLOCATION_UI_TEXT.INFO_BANNER_ADD}</span>
          </div>

          {/* Student | Route */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_STUDENT} required={!isEditMode}>
              <SelectInput value={form.studentId} onChange={(e) => set("studentId", e.target.value)}
                options={students} placeholder={ALLOCATION_UI_TEXT.PH_STUDENT}
                hasError={!!errors.studentId} loading={loadingStudents} disabled={isEditMode} />
              {isEditMode && <p className="text-[11px] text-gray-400 mt-1">Student cannot be changed after allocation</p>}
              {errors.studentId && <p className="text-xs text-red-500 mt-0.5">{errors.studentId}</p>}
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
              <input type="date" value={form.effectiveTo}
                min={form.effectiveFrom}
                onChange={(e) => set("effectiveTo", e.target.value)}
                className={`${SHARED_INPUT_STYLES.base} ${errors.effectiveTo ? SHARED_INPUT_STYLES.errCls : ""}`} />
              {errors.effectiveTo && <p className="text-xs text-red-500 mt-0.5">{errors.effectiveTo}</p>}
            </Field>
          </div>

          {/* Monthly Fee (editable, auto from stop) | Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label={ALLOCATION_UI_TEXT.LBL_MONTHLY_FEE || "Monthly Fee"}>
              <input
                type="number"
                min="0"
                value={form.monthlyFee}
                onChange={(e) => set("monthlyFee", e.target.value)}
                placeholder={form.stopId ? "Auto-filled from stop" : "Select a stop first"}
                className={SHARED_INPUT_STYLES.base}
              />
            </Field>
            <Field label={ALLOCATION_UI_TEXT.LBL_REMARKS}>
              <input type="text" placeholder={ALLOCATION_UI_TEXT.PH_OPTIONAL} value={form.remarks}
                onChange={(e) => set("remarks", e.target.value)} className={SHARED_INPUT_STYLES.base} />
            </Field>
          </div>

          {/* Conditional Override Reason Input Row */}
          {isFeeOverridden && (
            <div className="grid grid-cols-1 gap-4">
              <Field label="Override Reason" required>
                <input
                  type="text"
                  placeholder="Explain why the predefined stop fee is being changed..."
                  value={form.overrideReason}
                  onChange={(e) => set("overrideReason", e.target.value)}
                  className={`${SHARED_INPUT_STYLES.base} ${errors.overrideReason ? SHARED_INPUT_STYLES.errCls : ""}`}
                />
                {errors.overrideReason && <p className="text-xs text-red-500 mt-0.5">{errors.overrideReason}</p>}
              </Field>
            </div>
          )}

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
              ? <><Loader2 className="w-4 h-4 animate-spin" /> {isEditMode ? "Updating..." : ALLOCATION_UI_TEXT.BTN_ALLOCATING}</>
              : <><Save className="w-4 h-4" /> {isEditMode ? "Update Allocation" : ALLOCATION_UI_TEXT.BTN_ALLOCATE_SAVE}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}