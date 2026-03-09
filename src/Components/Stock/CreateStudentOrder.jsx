import { useState, useEffect, useCallback } from "react";
import {
  X, User, ShoppingBag, Package, Search, ChevronDown,
  Loader2, Save, Check, Plus, AlertCircle, AlertTriangle, Info,
} from "lucide-react";
import { getActiveStores, getItemsList, getItemStockOverview } from "../../Api/StockApi";
import { getStudents } from "../../Api/StudentsApi";
import { createStudentOrder } from "../../Api/StudentOrder";

const STEPS = [
  { id: 1, label: "Select Student & Store" },
  { id: 2, label: "Review & Edit Items"    },
  { id: 3, label: "Confirm Order"          },
];

const inputCls =
  "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200";

// ─── Parse student into normalised shape ──────────────────────────
function parseStudent(raw) {
  const firstName = raw.firstName || raw.first_name || "";
  const lastName  = raw.lastName  || raw.last_name  || "";
  const fullName  = raw.fullName  || raw.full_name  || raw.name || "";
  const name      = fullName || [firstName, lastName].filter(Boolean).join(" ") || `Student #${raw.id}`;
  const admission = raw.admissionNumber || raw.admission_number || raw.admNo || "";
  const className = raw.className  || raw.class_name  || raw.class || raw.classSection || "";
  const classId   = raw.classId    || raw.class_id    || raw.classroomId || null;
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

// ─── Main Component ───────────────────────────────────────────────
export default function CreateStudentOrder({ isOpen, onClose, onSaved }) {
  const [step, setStep] = useState(1);

  // ── Step 1 — Student ──────────────────────────────────────────
  const [students,        setStudents]        = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentSearch,   setStudentSearch]   = useState("");
  const [studentPage,     setStudentPage]     = useState(0);
  const [studentHasMore,  setStudentHasMore]  = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // ── Step 1 — Store ────────────────────────────────────────────
  const [stores,          setStores]          = useState([]);
  const [storesLoading,   setStoresLoading]   = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const selectedStore = stores.find((s) => String(s.id) === String(selectedStoreId)) || null;

  // ── Step 1 — Date & Remarks ───────────────────────────────────
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
  const [remarks,   setRemarks]   = useState("");

  // ── Step 2 — Items loaded from store stock ────────────────────
  // Each item: { itemId, itemName, itemCode, itemUnit, category, quantity, availableQty }
  const [itemsLoading, setItemsLoading] = useState(false);
  const [orderItems,   setOrderItems]   = useState([]);

  // ── Submit ────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [errors,     setErrors]     = useState({});

  // ─── Reset on open ────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen) { document.body.style.overflow = ""; return; }
    document.body.style.overflow = "hidden";
    setStep(1);
    setStudents([]); setStudentSearch(""); setStudentPage(0); setStudentHasMore(false);
    setSelectedStudent(null);
    setStores([]); setSelectedStoreId("");
    setOrderDate(new Date().toISOString().split("T")[0]);
    setRemarks("");
    setOrderItems([]);
    setErrors({}); setSubmitting(false);
    loadStores();
    doLoadStudents(0, true);
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]); // eslint-disable-line

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

  // ─── Load students (paginated) ────────────────────────────────
  const doLoadStudents = useCallback(async (pg, replace) => {
    setStudentsLoading(true);
    try {
      const raw = await getStudents(pg, 20, "id");
      const content =
        raw?.content || raw?.data?.content || raw?.students ||
        (Array.isArray(raw?.data) ? raw.data : null) ||
        (Array.isArray(raw) ? raw : []);
      const parsed    = content.map(parseStudent);
      const totalPg   = raw?.totalPages ?? raw?.data?.totalPages ?? raw?.pagination?.totalPages ?? 1;
      const currentPg = raw?.number     ?? raw?.data?.number     ?? pg;
      setStudents((prev) => replace ? parsed : [...prev, ...parsed]);
      setStudentPage(currentPg);
      setStudentHasMore(currentPg + 1 < totalPg);
    } catch (e) { console.error("loadStudents:", e); }
    finally { setStudentsLoading(false); }
  }, []);

  // ─── Debounce student search ──────────────────────────────────
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => doLoadStudents(0, true), 350);
    return () => clearTimeout(t);
  }, [studentSearch, isOpen, doLoadStudents]);

  const loadStoreItems = useCallback(async () => {
    if (!selectedStoreId) return;
    setItemsLoading(true);
    try {
      const { items: allItems } = await getItemsList(0, 200, "", "", "ACTIVE");
      if (!allItems || allItems.length === 0) { setOrderItems([]); return; }

      const overviewResults = await Promise.allSettled(
        allItems.map((item) => getItemStockOverview(item.id))
      );

      const result = [];
      overviewResults.forEach((res) => {
        if (res.status !== "fulfilled") return;
        const { item: ov, storeBreakdown } = res.value;

        // Only include items stocked in the selected store
        const storeRow = storeBreakdown.find(
          (s) => String(s.storeId) === String(selectedStoreId)
        );
        if (!storeRow) return;

        result.push({
          itemId:       ov.itemId   || ov.id,
          itemName:     ov.itemName || ov.name || `Item #${ov.itemId}`,
          itemCode:     ov.itemCode || ov.code || "—",
          itemUnit:     ov.unit     || "PCS",
          category:     ov.category || "",
          quantity:     1,                         // default ordered qty
          availableQty: storeRow.quantity ?? 0,    // live qty in this store
        });
      });

      setOrderItems(result);
    } catch (e) {
      console.error("loadStoreItems:", e);
      setOrderItems([]);
    } finally {
      setItemsLoading(false);
    }
  }, [selectedStoreId]);

  // Trigger load when step 2 is reached
  useEffect(() => {
    if (step === 2 && selectedStoreId) {
      loadStoreItems();
    }
  }, [step, selectedStoreId, loadStoreItems]);

  if (!isOpen) return null;

  // ─── Qty / item helpers ───────────────────────────────────────
  const setQty     = (id, v) => setOrderItems((p) => p.map((i) => i.itemId === id ? { ...i, quantity: Math.max(1, parseInt(v) || 1) } : i));
  const removeItem = (id)    => setOrderItems((p) => p.filter((i) => i.itemId !== id));
  const totalUnits = orderItems.reduce((a, i) => a + i.quantity, 0);

  const outOfStockItems = orderItems.filter((i) => i.availableQty === 0);
  const stockIssues     = orderItems.filter((i) => i.availableQty > 0 && i.quantity > i.availableQty);
  const hasAnyIssue     = outOfStockItems.length > 0 || stockIssues.length > 0;

  // ─── Validation ───────────────────────────────────────────────
  const validateStep1 = () => {
    const e = {};
    if (!selectedStudent) e.student = "Please select a student.";
    if (!selectedStoreId) e.store   = "Please select a store.";
    setErrors(e); return !Object.keys(e).length;
  };
  const validateStep2 = () => {
    if (!orderItems.length) { setErrors({ items: "Please keep at least one item." }); return false; }
    setErrors({}); return true;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    setErrors({}); setStep((s) => Math.min(3, s + 1));
  };
  const goBack = () => { setErrors({}); setStep((s) => Math.max(1, s - 1)); };

  // ─── Save as Draft ────────────────────────────────────────────
  const handleSaveDraft = async () => {
    if (!validateStep2()) return;
    setSubmitting(true); setErrors({});
    try {
      await createStudentOrder({
        studentId: selectedStudent.id,
        storeId:   Number(selectedStoreId),
        orderDate,
        remarks:   remarks.trim() || null,
        status:    "DRAFT",
        items:     orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      });
      onSaved?.("DRAFT");
    } catch (e) {
      setErrors({ submit: e.message || "Failed to save draft. Please try again." });
    } finally { setSubmitting(false); }
  };

  // ─── Confirm & Issue Stock ────────────────────────────────────
  const handleConfirm = async () => {
    setSubmitting(true); setErrors({});
    try {
      await createStudentOrder({
        studentId: selectedStudent.id,
        storeId:   Number(selectedStoreId),
        orderDate,
        remarks:   remarks.trim() || null,
        status:    "CONFIRMED",
        items:     orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
      });
      onSaved?.("CONFIRMED");
    } catch (e) {
      setErrors({ submit: e.message || "Failed to confirm order. Please try again." });
    } finally { setSubmitting(false); }
  };

  // ─── Filtered students ────────────────────────────────────────
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

  // ─── Footer action buttons (steps 2 & 3) ─────────────────────
  const FooterActions = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={handleSaveDraft}
        disabled={submitting || itemsLoading}
        className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save as Draft
      </button>
      <button
        onClick={step === 2 ? goNext : handleConfirm}
        disabled={submitting || itemsLoading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
      >
        {submitting
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <Check className="w-4 h-4" />
        }
        {step === 2 ? "Next →" : "Confirm & Issue Stock"}
      </button>
    </div>
  );

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
            <h2 className="text-base font-bold text-gray-800">Create Student Order</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Step Bar ── */}
        <div className="shrink-0"><StepBar current={step} /></div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

          {/* ══════════ STEP 1: Select Student & Store ══════════ */}
          {step === 1 && (
            <>
              {/* Student picker */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Student <span className="text-red-500">*</span>
                </label>

                {selectedStudent ? (
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
                        <div className="max-h-44 overflow-y-auto divide-y divide-gray-50">
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
                          {studentHasMore && (
                            <button
                              onClick={() => doLoadStudents(studentPage + 1, false)}
                              disabled={studentsLoading}
                              className="w-full py-2.5 text-xs text-blue-600 font-semibold hover:bg-blue-50 flex items-center justify-center gap-1.5 border-t border-gray-100"
                            >
                              {studentsLoading
                                ? <><Loader2 className="w-3 h-3 animate-spin" /> Loading…</>
                                : <><Plus className="w-3 h-3" /> Load more</>}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                {errors.student && <p className="text-xs text-red-500">{errors.student}</p>}

                {/* Auto-detected class banner */}
                {selectedStudent?._className && (
                  <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 text-sm">
                    <span className="text-green-600">🏠</span>
                    <span className="font-semibold text-gray-700">Auto-detected:</span>
                    <span className="text-blue-600 font-semibold">{selectedStudent._className} (auto-detected)</span>
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
                      Changing the store re-calls{" "}
                      <code className="font-mono bg-blue-100 px-1 rounded">GET /orders/preview?studentId=&amp;storeId=</code>
                      {" "}— available qty updates for the newly selected store.
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

          {/* ══════════ STEP 2: Review & Edit Items ══════════ */}
          {step === 2 && (
            <>
              
              {itemsLoading ? (
                <div className="flex flex-col items-center justify-center gap-3 py-14 text-gray-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  <p className="text-sm">Loading items for this store…</p>
                </div>
              ) : orderItems.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-xl text-gray-400">
                  <Package className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                  <p className="text-sm font-medium">No items found in this store</p>
                  <p className="text-xs mt-1">Add stock via Stock IN first.</p>
                </div>
              ) : (
                <>
                  {/* Column headers */}
                  <div className="grid grid-cols-12 text-xs font-bold text-gray-500 uppercase tracking-wider pb-2 border-b border-gray-200">
                    <span className="col-span-5">ITEM</span>
                    <span className="col-span-2">CATEGORY</span>
                    <span className="col-span-2 text-center">QUANTITY</span>
                    <span className="col-span-2 text-right leading-tight">
                      AVAILABLE<br />
                      <span className="normal-case font-normal text-gray-400 text-[10px]">store_stocks.qty</span>
                    </span>
                    <span className="col-span-1" />
                  </div>

                  {/* Item rows */}
                  <div className="space-y-2">
                    {orderItems.map((item) => {
                      const isOutOfStock = item.availableQty === 0;
                      const hasIssue     = !isOutOfStock && item.quantity > item.availableQty;
                      const isOk         = item.availableQty > 0 && item.quantity <= item.availableQty;

                      return (
                        <div
                          key={item.itemId}
                          className={`grid grid-cols-12 items-center border rounded-xl px-4 py-3 transition-colors
                            ${isOutOfStock ? "border-red-300 bg-red-50/50"
                            : hasIssue    ? "border-orange-300 bg-orange-50/30"
                            :               "border-gray-200 hover:border-blue-200"}`}
                        >
                          {/* Item name + code */}
                          <div className="col-span-5 min-w-0">
                            <p className={`text-sm font-bold truncate ${isOutOfStock ? "text-red-700" : "text-gray-800"}`}>
                              {item.itemName}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.itemCode} · {item.itemUnit}</p>
                          </div>

                          {/* Category badge */}
                          <div className="col-span-2">
                            {item.category ? (
                              <span className="text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded uppercase tracking-wide">
                                {item.category}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </div>

                          {/* Qty input */}
                          <div className="col-span-2 flex justify-center">
                            <input
                              type="number" min="1"
                              value={item.quantity}
                              onChange={(e) => setQty(item.itemId, e.target.value)}
                              disabled={isOutOfStock}
                              className={`w-16 text-center text-sm font-bold border rounded-lg py-1.5 px-2 focus:outline-none focus:ring-2 transition
                                ${isOutOfStock
                                  ? "border-red-300 bg-red-50 text-red-400 cursor-not-allowed"
                                  : hasIssue
                                  ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                  : "border-gray-200 bg-white text-gray-800 focus:ring-blue-300"}`}
                            />
                          </div>

                          {/* Available qty indicator */}
                          <div className="col-span-2 text-right">
                            {isOutOfStock ? (
                              <span className="text-xs font-bold text-red-500 flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> Out of stock
                              </span>
                            ) : hasIssue ? (
                              <span className="text-xs font-semibold text-orange-500 flex items-center justify-end gap-1">
                                <AlertTriangle className="w-3 h-3 shrink-0" /> {item.availableQty} available
                              </span>
                            ) : (
                              <span className="text-xs font-semibold text-green-600">
                                ✓ {item.availableQty} available
                              </span>
                            )}
                          </div>

                          {/* Remove */}
                          <div className="col-span-1 flex justify-end">
                            <button
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

                  {/* Out-of-stock warnings (red) */}
                  {outOfStockItems.map((item) => (
                    <div key={`oos-${item.itemId}`} className="flex items-start gap-2 bg-red-50 border border-red-300 rounded-lg px-4 py-2.5 text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                      <span>
                        <strong>{item.itemName}:</strong> This item is completely out of stock in the selected store. Remove it or choose a different store.
                      </span>
                    </div>
                  ))}

                  {/* Partial stock warnings (yellow) — matching image exactly */}
                  {stockIssues.map((item) => (
                    <div key={`warn-${item.itemId}`} className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 rounded-lg px-4 py-2.5 text-xs text-yellow-800">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                      <div>
                        <strong>{item.itemName}:</strong>{" "}
                        Requested qty ({item.quantity}) exceeds available stock ({item.availableQty}). Please reduce or choose another store.
                      </div>
                    </div>
                  ))}

                  {/* Summary bar */}
                  <div className={`flex items-center justify-between rounded-xl px-4 py-3 border ${hasAnyIssue ? "bg-blue-50 border-blue-200" : "bg-gray-50 border-gray-200"}`}>
                    <span className="text-sm text-gray-600">
                      Total items: <strong className="text-gray-800">{orderItems.length} types</strong>
                    </span>
                    <span className="text-sm text-gray-600">
                      Total units: <strong className="text-gray-800">{totalUnits}</strong>
                    </span>
                    {hasAnyIssue && (
                      <span className="text-sm font-semibold text-orange-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {stockIssues.length + outOfStockItems.length} item{(stockIssues.length + outOfStockItems.length) > 1 ? "s" : ""} has stock issue
                      </span>
                    )}
                  </div>
                </>
              )}

              {errors.items && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.items}
                </div>
              )}
              {errors.submit && (
                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.submit}
                </div>
              )}
            </>
          )}

          {/* ══════════ STEP 3: Confirm Order ══════════ */}
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
                    const hasIssue = item.quantity > item.availableQty;
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
        </div>

        {/* ── Footer ── */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/80 shrink-0">
          <button
            onClick={step === 1 ? onClose : goBack}
            disabled={submitting}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            {step === 1 ? "Cancel" : "← Back"}
          </button>

          {step === 1 ? (
            <button
              onClick={goNext}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Next →
            </button>
          ) : (
            /* Steps 2 & 3: Cancel + Save as Draft + Confirm & Issue Stock */
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveDraft}
                disabled={submitting || itemsLoading}
                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save as Draft
              </button>
              <button
                onClick={step === 2 ? goNext : handleConfirm}
                disabled={submitting || itemsLoading}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                {submitting
                  ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</>
                  : step === 2
                  ? <>Next →</>
                  : <><Check className="w-4 h-4" /> Confirm &amp; Issue Stock</>}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}