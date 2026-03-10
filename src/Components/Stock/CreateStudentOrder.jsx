import { useState, useEffect, useCallback, useRef } from "react";
import {
  X, User, ShoppingBag, Package, Search, ChevronDown,
  Loader2, Save, Check, Plus, AlertCircle, AlertTriangle, Info, RefreshCw,
} from "lucide-react";
import { getActiveStores } from "../../Api/StockApi";
import { getStudents }     from "../../Api/StudentsApi";
import {
  createStudentOrder,
  updateStudentOrder,
  confirmStudentOrder,
  cancelStudentOrder,
  previewStudentOrder,
  getStudentOrderById,
} from "../../Api/StudentOrder";

// ─── Steps ────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Select Student & Store" },
  { id: 2, label: "Review & Edit Items"    },
  { id: 3, label: "Confirm Order"          },
];

const inputCls =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200";

// ─── Parse raw student → normalised ──────────────────────────────
function parseStudent(raw) {
  const firstName = raw.firstName || raw.first_name || "";
  const lastName  = raw.lastName  || raw.last_name  || "";
  const fullName  = raw.fullName  || raw.full_name  || raw.name || "";
  const name      = fullName || [firstName, lastName].filter(Boolean).join(" ") || `Student #${raw.id}`;
  const admission = raw.admissionNumber || raw.admission_number || raw.admNo || "";
  const className = raw.className || raw.class_name || raw.class || raw.classSection || "";
  const classId   = raw.classId   || raw.class_id   || raw.classroomId || null;
  return { ...raw, _name: name, _admission: admission, _className: className, _classId: classId };
}

// ─── StepBar ─────────────────────────────────────────────────────
function StepBar({ current }) {
  return (
    <div className="flex items-center px-6 py-4 border-b border-gray-100 bg-white">
      {STEPS.map((s, idx) => {
        const done   = current > s.id;
        const active = current === s.id;
        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
                ${done   ? "bg-blue-600 border-blue-600 text-white"
                : active ? "border-blue-500 text-blue-600 bg-blue-50"
                :          "border-gray-300 text-gray-400 bg-white"}`}>
                {done ? <Check className="w-3.5 h-3.5" /> : s.id}
              </div>
              <span className={`text-xs font-semibold hidden sm:block whitespace-nowrap
                ${active ? "text-blue-700" : done ? "text-gray-500" : "text-gray-400"}`}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-3 rounded ${done ? "bg-blue-500" : "bg-gray-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step3Footer — separate component so it mounts fresh, its buttons
// can NEVER receive stray click/pointerup events from the previous step. ──────
function Step3Footer({ submitting, previewLoading, onBack, onDraft, onConfirm }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setReady(true), 50);
    return () => clearTimeout(id);
  }, []);

  const blocked = submitting || !ready || previewLoading;

  return (
    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
      <button type="button" onClick={onBack} disabled={submitting || previewLoading}
        className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
        ← Back
      </button>
      <div className="flex items-center gap-2">
        {/* while preview is still loading show a subtle "loading data…" label */}
        {previewLoading && (
          <span className="flex items-center gap-1.5 text-xs text-gray-400 mr-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading data…
          </span>
        )}
        <button type="button" onClick={() => !blocked && onDraft()}
          disabled={blocked}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save as Draft
        </button>
        <button type="button" onClick={() => !blocked && onConfirm()}
          disabled={blocked}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          {submitting
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
            : previewLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
            : <><Check className="w-4 h-4" /> Confirm &amp; Issue Stock</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
// Props:
//   isOpen        — boolean
//   onClose       — fn()
//   onSaved       — fn(status: "DRAFT"|"CONFIRMED")
//   editOrderId   — number | null   → when set, wizard loads that order for editing
export default function CreateStudentOrder({ isOpen, onClose, onSaved, editOrderId = null }) {
  const isEditMode = !!editOrderId;

  const [step, setStep] = useState(1);

  // ── Step 1 — Students ────────────────────────────────────────
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch,   setStudentSearch]   = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  // Guard: only fetch students once per modal open
  const studentsFetchedRef = useRef(false);

  // ── Step 1 — Stores ──────────────────────────────────────────
  const [stores,          setStores]          = useState([]);
  const [storesLoading,   setStoresLoading]   = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const selectedStore = stores.find((s) => String(s.id) === String(selectedStoreId)) || null;

  // ── Step 1 — Date & Remarks ──────────────────────────────────
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks,   setRemarks]   = useState("");

  // ── Step 2 — Preview items ───────────────────────────────────
  // Each item: { itemId, itemName, itemCode, itemUnit, category, quantity, availableQty }
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError,   setPreviewError]   = useState("");
  const [orderItems,     setOrderItems]     = useState([]);

  // ── Edit mode loading ────────────────────────────────────────
  const [editLoading, setEditLoading] = useState(false);

  // ── Submit ───────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  // ─── Hard reset ───────────────────────────────────────────────
  const hardReset = useCallback(() => {
    setStep(1);
    setStudents([]); setStudentSearch("");
    setSelectedStudent(null);
    setSelectedStoreId(""); setOrderItems([]);
    setOrderDate(new Date().toISOString().split("T")[0]);
    setRemarks(""); setErrors({}); setSubmitting(false);
    setPreviewLoading(false); setPreviewError(""); setEditLoading(false);
    studentsFetchedRef.current = false;
  }, []);

  // ─── On open/close ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    hardReset();
    loadStores();

    if (isEditMode) {
      // Edit mode: load existing order to prefill
      loadEditOrder(editOrderId);
    } else {
      // Create mode: load students once
      doLoadStudents();
    }

    return () => { document.body.style.overflow = ""; };
  }, [isOpen]); // eslint-disable-line

  // ─── Load existing order for edit ────────────────────────────
  const loadEditOrder = async (orderId) => {
    setEditLoading(true);
    try {
      const res  = await getStudentOrderById(orderId);
      const data = res?.data || res;

      // Prefill step 1 fields
      setOrderDate(data.orderDate ? data.orderDate.split("T")[0] : new Date().toISOString().split("T")[0]);
      setRemarks(data.remarks || "");
      setSelectedStoreId(String(data.storeId || ""));

      // Build synthetic student object from flat API fields
      if (data.studentId) {
        setSelectedStudent({
          id:         data.studentId,
          _name:      data.studentName || `Student #${data.studentId}`,
          _admission: data.admissionNumber || "",
          _className: data.className || "",
          _classId:   data.classId   || null,
        });
      }

      // Prefill items from order — will be refreshed with live availability on step 2
      if (data.items?.length) {
        setOrderItems(data.items.map((i) => ({
          itemId:       i.itemId,
          itemName:     i.itemName,
          itemCode:     i.itemCode || "—",
          itemUnit:     i.itemUnit || "PCS",
          category:     i.category || "",
          quantity:     i.quantity || 1,
          availableQty: i.availableQuantitySnapshot ?? null,
        })));
      }

      // Load full students list in background for student picker
      doLoadStudents();
    } catch (e) {
      console.error("loadEditOrder:", e);
    } finally {
      setEditLoading(false);
    }
  };

  // ─── Load active stores ───────────────────────────────────────
  const loadStores = async () => {
    setStoresLoading(true);
    try {
      const data = await getActiveStores();
      const list = Array.isArray(data) ? data : (data.data || data.content || data.stores || []);
      setStores(list);
    } catch (e) { console.error("loadStores:", e); }
    finally { setStoresLoading(false); }
  };

  // ─── Load ALL students ONCE — search is purely client-side ─────
  // No API call on search. We fetch page=0 size=500 once and filter locally.
  const doLoadStudents = useCallback(async () => {
    if (studentsFetchedRef.current) return; // already loaded
    studentsFetchedRef.current = true;
    setStudentsLoading(true);
    try {
      const raw = await getStudents(0, 500, "id");
      const items =
        raw?.content || raw?.data?.content || raw?.students ||
        (Array.isArray(raw?.data) ? raw.data : null) ||
        (Array.isArray(raw) ? raw : []);
      setStudents(items.map(parseStudent));
    } catch (e) { console.error("loadStudents:", e); }
    finally { setStudentsLoading(false); }
  }, []); // eslint-disable-line

  // ─── Preview API: fetch items for selected student + store ────
  const fetchPreview = useCallback(async () => {
    if (!selectedStudent?.id || !selectedStoreId) return;
    setPreviewLoading(true);
    setPreviewError("");
    try {
      const res  = await previewStudentOrder(selectedStudent.id, selectedStoreId);
      const data = res?.data || res;

      // API shape: { items: [{ itemId, itemName, itemCode, itemUnit, category, quantity, availableQuantitySnapshot }] }
      const rawItems = data?.items || data?.orderItems || [];

      if (!rawItems.length) {
        setOrderItems([]);
        setPreviewError("No items found for this student/store combination.");
        return;
      }

      setOrderItems(rawItems.map((i) => ({
        itemId:       i.itemId,
        itemName:     i.itemName     || i.name || `Item #${i.itemId}`,
        itemCode:     i.itemCode     || i.code || "—",
        itemUnit:     i.itemUnit     || i.unit || "PCS",
        category:     i.category     || "",
        quantity:     i.quantity     || 1,
        availableQty: i.availableQuantitySnapshot ?? i.availableQty ?? null,
      })));
    } catch (e) {
      console.error("fetchPreview:", e);
      setPreviewError("Failed to load items for this student/store. Please try again.");
      setOrderItems([]);
    } finally {
      setPreviewLoading(false);
    }
  }, [selectedStudent?.id, selectedStoreId]); // eslint-disable-line

  // Fire preview when step 2 is reached
  useEffect(() => {
    if (step === 2) fetchPreview();
  }, [step]); // eslint-disable-line

  if (!isOpen) return null;

  // ─── Derived: stock analysis ──────────────────────────────────
  // Any item where quantity > availableQty is a "stock issue" (includes availableQty===0)
  const stockIssues  = orderItems.filter((i) => i.availableQty !== null && i.quantity > i.availableQty);
  const hasAnyIssue  = stockIssues.length > 0;
  // Keep outOfStockItems as alias for warning box rendering
  const outOfStockItems = [];
  const totalUnits      = orderItems.reduce((a, i) => a + i.quantity, 0);

  // ── Qty helpers ───────────────────────────────────────────────
  const setQty     = (id, v) => setOrderItems((p) => p.map((i) => i.itemId === id ? { ...i, quantity: Math.max(1, parseInt(v) || 1) } : i));
  const removeItem = (id)    => setOrderItems((p) => p.filter((i) => i.itemId !== id));

  // ─── Footer button logic ──────────────────────────────────────
  // Step 2:
  //   hasAnyIssue → show only "Save as Draft"  (no Next/Confirm)
  //   all ok      → show "Save as Draft" + "Next →"
  // Step 3:
  //   always show "Save as Draft" + "Confirm & Issue Stock"

  // ─── Validation ───────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!selectedStudent) e.student = "Please select a student.";
    if (!selectedStoreId) e.store   = "Please select a store.";
    setErrors(e);
    return !Object.keys(e).length;
  };
  const validateStep2 = () => {
    if (!orderItems.length) { setErrors({ items: "Please keep at least one item." }); return false; }
    setErrors({}); return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({});
    setStep((s) => Math.min(3, s + 1));
  };

  const goBack = () => {
    setErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

    // ─── Save as Draft ────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!validateStep2()) return;
    setSubmitting(true); setErrors({});
    const payload = {
      studentId: selectedStudent.id,
      storeId:   Number(selectedStoreId),
      orderDate,
      remarks:   remarks.trim() || null,
      status:    "DRAFT",
      items:     orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
    };
    try {
      if (isEditMode && editOrderId) {
        await updateStudentOrder(editOrderId, payload);
      } else {
        await createStudentOrder(payload);
      }
      onSaved?.("DRAFT");
    } catch (e) {
      setErrors({ submit: e.message || "Failed to save draft. Please try again." });
    } finally { setSubmitting(false); }
  };

  // ─── Confirm & Issue Stock ────────────────────────────────────
  // Edit mode  → PUT (sync current items to DB) → confirmStudentOrder(editOrderId)
  // Create mode → POST as DRAFT → get newId    → confirmStudentOrder(newId)
  // Same confirm function, same flow — bilkul add jaisa
  const handleConfirm = async () => {
    setSubmitting(true); setErrors({});
    const payload = {
      studentId: selectedStudent.id,
      storeId:   Number(selectedStoreId),
      orderDate,
      remarks:   remarks.trim() || null,
      status:    "DRAFT",
      items:     orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
    };
    try {
      if (isEditMode && editOrderId) {
        // Edit mode: PUT (sync items) → then confirm same order
        // No new order created — purana editOrderId hi confirm hoga
        await updateStudentOrder(editOrderId, payload);
        await confirmStudentOrder(editOrderId);
      } else {
        // Create mode: POST as DRAFT → get newId → confirm
        const res   = await createStudentOrder(payload);
        const data  = res?.data || res;
        const newId = data?.id || data?.orderId;
        if (!newId) throw new Error("Order creation failed — no ID returned.");
        await confirmStudentOrder(newId);
      }
      onSaved?.("CONFIRMED");
    } catch (e) {
      setErrors({ submit: e.message || "Failed to confirm order. Please try again." });
    } finally { setSubmitting(false); }
  };

  // ─── Filtered students (client-side search) ───────────────────
  const filteredStudents = studentSearch.trim()
    ? students.filter((s) => {
        const q = studentSearch.toLowerCase();
        return (
          s._name.toLowerCase().includes(q)     ||
          s._admission.toLowerCase().includes(q) ||
          s._className.toLowerCase().includes(q)
        );
      })
    : students;

  // ─────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl z-10 flex flex-col max-h-[92vh] cso-anim">
        <style>{`
          @keyframes csoIn { from{opacity:0;transform:scale(.94) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)} }
          .cso-anim { animation: csoIn .22s ease-out forwards; }
        `}</style>

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-gray-800">
              {isEditMode ? "Edit Student Order" : "Create Student Order"}
            </h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Bar ── */}
        <div className="shrink-0"><StepBar current={step} /></div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* Edit mode loading skeleton */}
          {editLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="h-10 bg-gray-100 rounded-xl" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : (
            <>

              {/* ════════ STEP 1: Select Student & Store ════════ */}
              {step === 1 && (
                <>
                  {/* Student picker */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Student <span className="text-red-500">*</span>
                    </label>

                    {selectedStudent ? (
                      /* Selected pill */
                      <div
                        onClick={() => setSelectedStudent(null)}
                        className="border border-blue-400 bg-blue-50 rounded-lg px-3 py-2.5 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-blue-500 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-blue-800">{selectedStudent._name}</p>
                            <p className="text-xs text-blue-400">
                              {selectedStudent._admission && `ADM: ${selectedStudent._admission}`}
                              {selectedStudent._className  && ` · ${selectedStudent._className}`}
                            </p>
                          </div>
                        </div>
                        <span className="text-xs text-blue-400 hover:text-blue-600 shrink-0">Change</span>
                      </div>
                    ) : (
                      <>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search by name or admission no…"
                            value={studentSearch}
                            onChange={(e) => setStudentSearch(e.target.value)}
                            className={`${inputCls} pl-8 ${errors.student ? "border-red-400" : ""}`}
                          />
                        </div>
                        <div className={`border rounded-xl overflow-hidden ${errors.student ? "border-red-300" : "border-gray-200"}`}>
                          {studentsLoading && filteredStudents.length === 0 ? (
                            <div className="flex items-center gap-2 px-4 py-4 text-xs text-gray-400">
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading students…
                            </div>
                          ) : filteredStudents.length === 0 ? (
                            <div className="px-4 py-5 text-xs text-gray-400 text-center">No students found.</div>
                          ) : (
                            <div className="max-h-48 overflow-y-auto divide-y divide-gray-50">
                              {filteredStudents.map((s) => (
                                <button
                                  key={s.id} type="button"
                                  onClick={() => { setSelectedStudent(s); setErrors((p) => ({ ...p, student: "" })); setStudentSearch(""); }}
                                  className="w-full flex items-center px-4 py-2.5 text-left hover:bg-blue-50 transition-colors"
                                >
                                  <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-800 truncate">{s._name}</p>
                                    <p className="text-xs text-gray-400 truncate">
                                      {s._admission && `ADM: ${s._admission}`}
                                      {s._className  && ` · ${s._className}`}
                                    </p>
                                  </div>
                                </button>
                              ))}

                            </div>
                          )}
                        </div>
                      </>
                    )}
                    {errors.student && <p className="text-xs text-red-500">{errors.student}</p>}

                    {/* Class banner */}
                    {selectedStudent?._className && (
                      <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm flex-wrap">
                        <span className="text-green-600">🏠</span>
                        <span className="font-semibold text-gray-700">Auto-detected:</span>
                        <span className="text-blue-600 font-semibold">{selectedStudent._className}</span>
                        <span className="text-xs text-gray-400 hidden sm:block ml-auto shrink-0">· Default items pre-loaded from class config</span>
                      </div>
                    )}
                  </div>

                  {/* Store dropdown */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Issue from Store <span className="text-red-500">*</span>
                    </label>
                    {storesLoading ? (
                      <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading stores…
                      </div>
                    ) : (
                      <div className="relative">
                        <select
                          value={selectedStoreId}
                          onChange={(e) => { setSelectedStoreId(e.target.value); setOrderItems([]); setErrors((p) => ({ ...p, store: "" })); }}
                          className={`${inputCls} appearance-none pr-8 ${errors.store ? "border-red-400" : ""}`}
                        >
                          <option value="">-- Select a store --</option>
                          {stores.map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.storeName || s.name || `Store #${s.id}`}
                              {(s.storeCode || s.code) ? ` (${s.storeCode || s.code})` : ""}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    )}
                    {selectedStoreId && (
                      <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span>
                          Next step calls{" "}
                          <code className="font-mono bg-blue-100 px-1 rounded">GET /orders/preview?studentId=&amp;storeId=</code>
                          {" "}to load live item availability for this store.
                        </span>
                      </div>
                    )}
                    {errors.store && <p className="text-xs text-red-500">{errors.store}</p>}
                  </div>

                  {/* Order Date + Remarks */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">Order Date</label>
                      <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className={inputCls} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-semibold text-gray-700">
                        Remarks <span className="text-gray-400 font-normal text-xs">(optional)</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. AY 2025-26 opening kit"
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ════════ STEP 2: Review & Edit Items ════════ */}
              {step === 2 && (
                <>
                  {/* Context strip */}
                  <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap gap-y-1">
                      <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                        <User className="w-3.5 h-3.5 text-blue-400" />
                        {selectedStudent?._name}
                      </span>
                      <span className="text-gray-300">·</span>
                      <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400" />
                        {selectedStore?.storeName || `Store #${selectedStoreId}`}
                      </span>
                    </div>
                    <button
                      onClick={fetchPreview}
                      disabled={previewLoading}
                      title="Refresh items"
                      className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 text-gray-400 ${previewLoading ? "animate-spin" : ""}`} />
                    </button>
                  </div>

                  {/* Stock issue banner — only when stock issues exist */}
                  {hasAnyIssue && !previewLoading && (
                    <div className="flex items-start gap-2 bg-orange-50 border border-orange-300 rounded-xl px-4 py-3 text-xs text-orange-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                      <div>
                        <p className="font-semibold mb-0.5">Stock issue detected</p>
                        <p>
                          Some item quantities exceed available stock. Reduce them to proceed to Confirm. You can still <strong>Save as Draft</strong> with current quantities.
                        </p>
                      </div>
                    </div>
                  )}

                  {previewLoading ? (
                    <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                      <p className="text-sm">Loading items from preview…</p>
                    </div>
                  ) : previewError ? (
                    <div className="text-center py-10 border border-dashed border-red-200 rounded-xl text-red-400 space-y-2">
                      <AlertCircle className="w-8 h-8 mx-auto opacity-40" />
                      <p className="text-sm font-medium">{previewError}</p>
                      <button onClick={fetchPreview} className="text-xs text-blue-500 hover:text-blue-700 underline">
                        Retry
                      </button>
                    </div>
                  ) : orderItems.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400">
                      <Package className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                      <p className="text-sm font-medium">No items found for this combination</p>
                      <p className="text-xs mt-1">Try a different student or store.</p>
                    </div>
                  ) : (
                    <>
                      {/* Column headers */}
                      <div className="grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                        <span className="col-span-4">ITEM</span>
                        <span className="col-span-2">CATEGORY</span>
                        <span className="col-span-3 text-center">QTY</span>
                        <span className="col-span-2 text-right leading-tight">AVAILABLE</span>
                        <span className="col-span-1" />
                      </div>

                      {/* Item rows */}
                      <div className="space-y-2">
                        {orderItems.map((item) => {
                          const avail    = item.availableQty ?? null;
                          const hasIssue = avail !== null && item.quantity > avail;
                          return (
                            <div
                              key={item.itemId}
                              className={`grid grid-cols-12 items-center border rounded-xl px-4 py-3 transition-colors
                                ${hasIssue
                                  ? "border-orange-300 bg-orange-50/30"
                                  : "border-gray-200   hover:border-blue-200"}`}
                            >
                              {/* Name + code */}
                              <div className="col-span-4 min-w-0">
                                <p className="text-sm font-bold truncate text-gray-800">{item.itemName}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.itemCode} · {item.itemUnit}</p>
                              </div>

                              {/* Category */}
                              <div className="col-span-2">
                                {item.category ? (
                                  <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded uppercase tracking-wide">
                                    {item.category}
                                  </span>
                                ) : <span className="text-xs text-gray-300">—</span>}
                              </div>

                              {/* Qty stepper: − | number | + — always editable */}
                              <div className="col-span-3 flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => setQty(item.itemId, item.quantity - 1)}
                                  disabled={item.quantity <= 1}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg font-bold text-base border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                >−</button>
                                <input
                                  type="number" min="1"
                                  value={item.quantity}
                                  onChange={(e) => setQty(item.itemId, e.target.value)}
                                  className={`w-12 text-center text-sm font-bold border rounded-lg py-1 px-1 focus:outline-none focus:ring-2 transition
                                    ${hasIssue
                                      ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                      : "border-gray-200   bg-white     text-gray-800  focus:ring-blue-300"}`}
                                />
                                <button
                                  type="button"
                                  onClick={() => setQty(item.itemId, item.quantity + 1)}
                                  className={`w-7 h-7 flex items-center justify-center rounded-lg font-bold text-base border transition
                                    ${hasIssue
                                      ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                      : "border-gray-200   bg-white     text-gray-600  hover:bg-gray-100"}`}
                                >+</button>
                              </div>

                              {/* Available */}
                              <div className="col-span-2 text-right">
                                {hasIssue ? (
                                  <span className="text-xs font-semibold text-orange-500 flex items-center justify-end gap-1">
                                    <AlertTriangle className="w-3 h-3 shrink-0" />
                                    {avail === 0 ? "0 avail" : `${avail} avail`}
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-green-600">
                                    ✓ {avail ?? "?"} avail
                                  </span>
                                )}
                              </div>

                              {/* Remove */}
                              <div className="col-span-1 flex justify-end">
                                <button
                                  type="button"
                                  onClick={() => removeItem(item.itemId)}
                                  className="w-7 h-7 flex items-center justify-center rounded-lg text-white bg-red-400 hover:bg-red-500 transition-colors"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Warning boxes — one per item where qty > available */}
                      {stockIssues.map((item) => (
                        <div key={`warn-${item.itemId}`} className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2.5 text-xs text-yellow-800">
                          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                          <span>
                            <strong>{item.itemName}:</strong> Only <strong>{item.availableQty}</strong> item{item.availableQty !== 1 ? "s" : ""} available in this store, but you requested <strong>{item.quantity}</strong>. Reduce quantity to confirm.
                          </span>
                        </div>
                      ))}

                      {/* Summary bar */}
                      <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${hasAnyIssue ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                        <span className="text-sm text-gray-600">
                          Total items: <strong className="text-gray-800">{orderItems.length} types</strong>
                        </span>
                        <span className="text-sm text-gray-600">
                          Total units: <strong className="text-gray-800">{totalUnits}</strong>
                        </span>
                        {hasAnyIssue && (
                          <span className="text-sm font-semibold text-orange-500 flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4" />
                            {stockIssues.length + outOfStockItems.length} stock issue{(stockIssues.length + outOfStockItems.length) > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </>
                  )}

                  {errors.items  && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.items}</div>}
                  {errors.submit && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.submit}</div>}
                </>
              )}

              {/* ════════ STEP 3: Confirm Order ════════ */}
              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Review your order before submitting.</p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                        <User className="w-3.5 h-3.5" /> Student
                      </p>
                      <p className="text-sm font-bold text-gray-800">{selectedStudent?._name}</p>
                      {selectedStudent?._admission && <p className="text-xs text-gray-500">ADM: {selectedStudent._admission}</p>}
                      {selectedStudent?._className && (
                        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">
                          {selectedStudent._className}
                        </span>
                      )}
                    </div>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                        <ShoppingBag className="w-3.5 h-3.5" /> Store
                      </p>
                      <p className="text-sm font-bold text-gray-800">
                        {selectedStore?.storeName || selectedStore?.name || `Store #${selectedStoreId}`}
                      </p>
                      {(selectedStore?.storeCode || selectedStore?.code) && (
                        <p className="text-xs text-gray-500">{selectedStore.storeCode || selectedStore.code}</p>
                      )}
                    </div>
                  </div>

                  {(orderDate || remarks) && (
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 space-y-1.5">
                      {orderDate && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-700">Order Date:</span>{" "}
                          {new Date(orderDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        </p>
                      )}
                      {remarks && (
                        <p className="text-xs text-gray-600">
                          <span className="font-semibold text-gray-700">Remarks:</span> {remarks}
                        </p>
                      )}
                    </div>
                  )}

                  <div>
                    <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-gray-400" /> Order Items ({orderItems.length})
                    </p>
                    <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                      {orderItems.map((item) => {
                        const hasIssue = item.availableQty !== null && item.quantity > item.availableQty;
                        return (
                          <div key={item.itemId} className={`flex items-center justify-between px-4 py-3 ${hasIssue ? "bg-orange-50" : ""}`}>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-gray-800 truncate">{item.itemName}</p>
                              <p className="text-xs text-gray-400">{item.itemCode} · {item.itemUnit}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              {hasIssue && <AlertTriangle className="w-3.5 h-3.5 text-orange-500" />}
                              <span className={`text-sm font-bold px-3 py-1 rounded-lg border ${hasIssue ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                × {item.quantity}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2 px-1">
                      <span>{orderItems.length} type{orderItems.length !== 1 ? "s" : ""}</span>
                      <span className="font-semibold text-gray-700">{totalUnits} total units</span>
                    </div>
                  </div>

                  {errors.submit && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.submit}
                    </div>
                  )}
                </div>
              )}

            </>
          )}
        </div>

        {/* ── Footer ── */}
        {/* step 1 footer */}
        {step === 1 && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
            <button type="button" onClick={onClose} disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="button" onClick={goNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors">
              Next →
            </button>
          </div>
        )}

        {/* step 2 footer — completely separate DOM node, never shares position with step 3 */}
        {step === 2 && (
          <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
            <button type="button" onClick={goBack} disabled={submitting}
              className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
              ← Back
            </button>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => handleSaveDraft()}
                disabled={submitting || previewLoading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save as Draft
              </button>
              {!hasAnyIssue && orderItems.length > 0 && (
                <button type="button" onClick={goNext}
                  disabled={submitting || previewLoading}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
                  Next →
                </button>
              )}
            </div>
          </div>
        )}

        {/* step 3 footer — only mounted after user is on step 3, guarded by step3ready */}
        {step === 3 && (
          <Step3Footer
            submitting={submitting}
            previewLoading={previewLoading}
            onBack={goBack}
            onDraft={handleSaveDraft}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}