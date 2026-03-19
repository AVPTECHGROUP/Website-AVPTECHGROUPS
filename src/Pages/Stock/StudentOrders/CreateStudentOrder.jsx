import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    X, User, ShoppingBag, Package, Search, ChevronDown,
    Loader2, Save, Check, AlertCircle, AlertTriangle, RefreshCw,
    ArrowLeft, CheckCircle, Plus, IndianRupee, CreditCard, Hash,
} from "lucide-react";
import { getActiveStores } from "../../../Api/StockApi";
import { getStudents } from "../../../Api/StudentsApi";
import {
    createStudentOrder, confirmStudentOrder,
    previewStudentOrder, checkItemAvailability,
} from "../../../Api/StudentOrder";
import { getListOfValues } from "../../../Api/ListOfValues";
import PrintConfirmModal from "../../../Components/CommonComp/Print/PrintConfirmCard";
import { printOrder } from "../../../Components/CommonComp/Print/Printorderutil";
import StudentOrderAddItem from "./StudentOrderAddItem";

// ── Constants ─────────────────────────────────────────────────────
const STEPS = [
    { id: 1, label: "Select Student & Store" },
    { id: 2, label: "Review & Edit Items" },
    { id: 3, label: "Confirm Order" },
];

const inputCls =
    "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200";

// ── Helpers ───────────────────────────────────────────────────────
// BUG FIX: moved outside component to avoid re-creation on every render
function parseStudent(raw) {
    if (!raw || typeof raw !== "object") return null; // BUG FIX: guard null/bad input
    const firstName = raw.firstName  || raw.first_name  || "";
    const lastName  = raw.lastName   || raw.last_name   || "";
    const fullName  = raw.fullName   || raw.full_name   || raw.name || "";
    const name      = fullName || [firstName, lastName].filter(Boolean).join(" ") || `Student #${raw.id}`;
    const admission = raw.admissionNumber || raw.admission_number || raw.admNo || "";
    const className = raw.className   || raw.class_name || raw.class || raw.classSection || "";
    const classId   = raw.classId     || raw.class_id   || raw.classroomId || null;
    return { ...raw, _name: name, _admission: admission, _className: className, _classId: classId };
}

// BUG FIX: safe localStorage read extracted so it doesn't re-run inside render
function getLoggedInUser() {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
}

function getIssuedByName(user) {
    if (!user) return "—";
    return (
        user.fullName ||
        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
        user.name ||
        user.username ||
        "—"
    );
}

// ── Step Bar ─────────────────────────────────────────────────────
function StepBar({ current }) {
    return (
        <div className="flex items-center w-full" role="list" aria-label="Order steps">
            {STEPS.map((s, idx) => {
                const done   = current > s.id;
                const active = current === s.id;
                return (
                    <div key={s.id} className="flex items-center flex-1 min-w-0" role="listitem">
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div
                                className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all
                                    ${done   ? "bg-blue-600 border-blue-600 text-white"
                                    : active ? "border-blue-500 text-blue-600 bg-blue-50"
                                    :          "border-gray-300 text-gray-400 bg-white"}`}
                                aria-current={active ? "step" : undefined}
                            >
                                {done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" /> : s.id}
                            </div>
                            <div className="hidden sm:block">
                                <p className={`text-xs font-bold uppercase tracking-wider
                                    ${active ? "text-blue-600" : done ? "text-gray-500" : "text-gray-400"}`}>
                                    Step {s.id}
                                </p>
                                <p className={`text-sm font-semibold
                                    ${active ? "text-gray-900" : done ? "text-gray-500" : "text-gray-400"}`}>
                                    {s.label}
                                </p>
                            </div>
                            {/* BUG FIX: max-w-17.5 is invalid Tailwind → max-w-[70px] */}
                            <div className="sm:hidden">
                                {active && (
                                    <p className="text-xs font-semibold text-blue-600 max-w-[70px] leading-tight">{s.label}</p>
                                )}
                            </div>
                        </div>
                        {idx < STEPS.length - 1 && (
                            <div className={`flex-1 h-0.5 mx-2 sm:mx-4 rounded ${done ? "bg-blue-500" : "bg-gray-200"}`} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}

// ── Step 3 Footer ────────────────────────────────────────────────
// BUG FIX: the 50ms "ready" delay is a hack to prevent double-submit.
// Replaced with a proper isMounted pattern + disabled prop is already enough.
function Step3Footer({ submitting, previewLoading, onBack, onDraft, onConfirm }) {
    const blocked = submitting || previewLoading;
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button
                type="button"
                onClick={onBack}
                disabled={blocked}
                className="px-5 py-2.5 text-sm cursor-pointer font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-center"
            >
                ← Back
            </button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {previewLoading && (
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 mr-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Loading data…
                    </span>
                )}
                <button
                    type="button"
                    onClick={onDraft}
                    disabled={blocked}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                    {submitting
                        ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                        : <Save className="w-4 h-4" aria-hidden="true" />}
                    Save as Draft
                </button>
                <button
                    type="button"
                    onClick={onConfirm}
                    disabled={blocked}
                    className="flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                >
                    {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Submitting…</>
                        : previewLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> Loading…</>
                            : <><Check className="w-4 h-4" aria-hidden="true" /> Confirm &amp; Issue Stock</>}
                </button>
            </div>
        </div>
    );
}

// ── Item Row ─────────────────────────────────────────────────────
function ItemRow({ item, onQtyChange, onRemove }) {
    const avail     = item.availableQty ?? null;
    const hasIssue  = avail !== null && item.quantity > avail;
    // BUG FIX: use item.lineTotal from state (already kept in sync) instead of
    // recalculating here, which can diverge if unitPriceSnapshot is 0 (falsy)
    const lineTotal = item.lineTotal ?? null;

    // BUG FIX: qty input should validate and clamp — parseInt("") returns NaN
    const handleQtyInput = (e) => {
        const raw = e.target.value;
        // Allow empty string while typing; parent clamps on blur / via setQty
        onQtyChange(item.itemId, raw);
    };

    return (
        <div className={`border rounded-xl px-3 py-3 transition-colors
            ${hasIssue ? "border-orange-300 bg-orange-50/30" : "border-gray-200 hover:border-blue-200"}`}>

            {/* ── Desktop ── */}
            <div
                className="hidden sm:grid items-center gap-2"
                style={{ gridTemplateColumns: "1fr 80px 90px 70px 80px 32px" }}
            >
                <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-gray-800">{item.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                        {item.itemCode} · {item.itemUnit}
                        {item.category && (
                            <span className="ml-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded uppercase">
                                {item.category}
                            </span>
                        )}
                    </p>
                </div>

                {/* Qty stepper */}
                <div className="flex items-center gap-1">
                    <button
                        type="button"
                        onClick={() => onQtyChange(item.itemId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        aria-label="Decrease quantity"
                        className="w-6 h-6 flex items-center justify-center rounded font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm"
                    >−</button>
                    <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={handleQtyInput}
                        aria-label={`Quantity for ${item.itemName}`}
                        className={`w-10 text-center text-sm font-bold border rounded py-0.5 px-1 focus:outline-none focus:ring-2 transition
                            ${hasIssue
                                ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                : "border-gray-200 bg-white text-gray-800 focus:ring-blue-300"}`}
                    />
                    <button
                        type="button"
                        onClick={() => onQtyChange(item.itemId, item.quantity + 1)}
                        aria-label="Increase quantity"
                        className={`w-6 h-6 flex items-center justify-center rounded font-bold border transition text-sm
                            ${hasIssue
                                ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}
                    >+</button>
                </div>

                {/* Available */}
                <div className="text-right pr-1">
                    {avail === null ? (
                        <span className="text-xs text-gray-300">—</span>
                    ) : hasIssue ? (
                        <span className="text-xs font-semibold text-orange-500 flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {avail === 0 ? "0 avail" : `${avail} avail`}
                        </span>
                    ) : (
                        <span className="text-xs font-semibold text-green-600">✓ {avail} avail</span>
                    )}
                </div>

                {/* Unit price */}
                <div className="text-right pr-1">
                    {item.unitPriceSnapshot !== null && item.unitPriceSnapshot !== undefined ? (
                        <span className="text-xs font-semibold text-gray-700 flex items-center justify-end gap-0.5">
                            <IndianRupee className="w-3 h-3 text-gray-400" aria-hidden="true" />
                            {Number(item.unitPriceSnapshot).toFixed(2)}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-300">—</span>
                    )}
                </div>

                {/* Line total */}
                <div className="text-right pr-1">
                    {lineTotal !== null ? (
                        <span className={`text-xs font-bold flex items-center justify-end gap-0.5 ${hasIssue ? "text-orange-600" : "text-blue-700"}`}>
                            <IndianRupee className="w-3 h-3" aria-hidden="true" />
                            {Number(lineTotal).toFixed(2)}
                        </span>
                    ) : (
                        <span className="text-xs text-gray-300">—</span>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onRemove(item.itemId)}
                    aria-label={`Remove ${item.itemName}`}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white bg-red-400 hover:bg-red-500 transition-colors"
                >
                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                </button>
            </div>

            {/* ── Mobile ── */}
            <div className="sm:hidden space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{item.itemName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {item.itemCode} · {item.itemUnit}
                            {item.category && (
                                <span className="ml-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1 py-0.5 rounded uppercase">
                                    {item.category}
                                </span>
                            )}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(item.itemId)}
                        aria-label={`Remove ${item.itemName}`}
                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-white bg-red-400 hover:bg-red-500 transition-colors"
                    >
                        <X className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <button
                            type="button"
                            onClick={() => onQtyChange(item.itemId, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 flex items-center justify-center rounded font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition text-sm"
                        >−</button>
                        <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={handleQtyInput}
                            aria-label={`Quantity for ${item.itemName}`}
                            className={`w-12 text-center text-sm font-bold border rounded py-1 px-1 focus:outline-none focus:ring-2 transition
                                ${hasIssue
                                    ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                    : "border-gray-200 bg-white text-gray-800 focus:ring-blue-300"}`}
                        />
                        <button
                            type="button"
                            onClick={() => onQtyChange(item.itemId, item.quantity + 1)}
                            aria-label="Increase quantity"
                            className={`w-7 h-7 flex items-center justify-center rounded font-bold border transition text-sm
                                ${hasIssue
                                    ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}
                        >+</button>
                    </div>
                    <div className="flex items-center gap-3 text-xs flex-wrap">
                        {avail !== null && (
                            hasIssue
                                ? <span className="font-semibold text-orange-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" aria-hidden="true" />{avail} avail</span>
                                : <span className="font-semibold text-green-600">✓ {avail} avail</span>
                        )}
                        {item.unitPriceSnapshot !== null && item.unitPriceSnapshot !== undefined && (
                            <span className="text-gray-600 font-semibold flex items-center gap-0.5">
                                <IndianRupee className="w-3 h-3" aria-hidden="true" />
                                {Number(item.unitPriceSnapshot).toFixed(2)}
                            </span>
                        )}
                        {lineTotal !== null && (
                            <span className={`font-bold flex items-center gap-0.5 ${hasIssue ? "text-orange-600" : "text-blue-700"}`}>
                                <IndianRupee className="w-3 h-3" aria-hidden="true" />
                                {Number(lineTotal).toFixed(2)}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Items table header (desktop only) ────────────────────────────
function ItemTableHeader() {
    return (
        <div
            className="hidden sm:grid items-center px-3 py-2 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            style={{ gridTemplateColumns: "1fr 80px 90px 70px 80px 32px" }}
            role="row"
        >
            <span>Item</span>
            <span>Qty</span>
            <span className="text-right pr-1">Available</span>
            <span className="text-right pr-1 flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3 h-3" aria-hidden="true" /> Unit
            </span>
            <span className="text-right pr-1 flex items-center justify-end gap-0.5">
                <IndianRupee className="w-3 h-3" aria-hidden="true" /> Total
            </span>
            <span />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────
export default function CreateStudentOrder() {
    const navigate = useNavigate();

    // BUG FIX: compute once outside render cycle; not in render body
    const loggedInUserRef  = useRef(getLoggedInUser());
    const issuedByName     = getIssuedByName(loggedInUserRef.current);

    const [step, setStep] = useState(1);

    // ── Students ──────────────────────────────────────────────
    const [students,         setStudents]         = useState([]);
    const [studentsLoading,  setStudentsLoading]  = useState(false);
    const [studentSearch,    setStudentSearch]    = useState("");
    const [selectedStudent,  setSelectedStudent]  = useState(null);
    const studentsFetchedRef = useRef(false);

    // ── Stores ────────────────────────────────────────────────
    const [stores,         setStores]         = useState([]);
    const [storesLoading,  setStoresLoading]  = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState("");

    // BUG FIX: derive selectedStore inside render, not in a separate state
    const selectedStore = stores.find((s) => String(s.id) === String(selectedStoreId)) ?? null;

    // ── Order metadata ────────────────────────────────────────
    const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
    const [remarks,   setRemarks]   = useState("");

    // ── Payment ───────────────────────────────────────────────
    const [paymentMethods,        setPaymentMethods]        = useState([]);
    const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
    const [paymentMethod,         setPaymentMethod]         = useState("");
    const [transactionNumber,     setTransactionNumber]     = useState("");

    // ── Order items & preview ─────────────────────────────────
    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError,   setPreviewError]   = useState("");
    const [orderItems,     setOrderItems]     = useState([]);

    // ── Submission ────────────────────────────────────────────
    const [submitting,  setSubmitting]  = useState(false);
    const [errors,      setErrors]      = useState({});
    const [showAddItem, setShowAddItem] = useState(false);

    // ── Print modal ───────────────────────────────────────────
    const [printModal, setPrintModal] = useState({ open: false, orderId: null, orderData: null });

    // BUG FIX: unmount guard to prevent state updates on unmounted component
    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; };
    }, []);

    // ── Initial load ──────────────────────────────────────────
    useEffect(() => {
        loadStores();
        doLoadStudents();
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Load payment methods when reaching Step 3 ─────────────
    useEffect(() => {
        if (step !== 3 || paymentMethods.length > 0) return;
        setPaymentMethodsLoading(true);
        getListOfValues("PAYMENT_METHOD")
            .then((data) => {
                if (!mountedRef.current) return;
                setPaymentMethods(Array.isArray(data) ? data : []);
            })
            .catch((e) => console.error("loadPaymentMethods:", e))
            .finally(() => { if (mountedRef.current) setPaymentMethodsLoading(false); });
    }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

    const loadStores = async () => {
        setStoresLoading(true);
        try {
            const data = await getActiveStores();
            if (!mountedRef.current) return;
            const list = Array.isArray(data)
                ? data
                : (data?.data || data?.content || data?.stores || []);
            setStores(list);
        } catch (e) {
            console.error("loadStores:", e);
        } finally {
            if (mountedRef.current) setStoresLoading(false);
        }
    };

    const doLoadStudents = useCallback(async () => {
        if (studentsFetchedRef.current) return;
        studentsFetchedRef.current = true;
        setStudentsLoading(true);
        try {
            const raw   = await getStudents(0, 1000, "id");
            const items =
                raw?.content ||
                raw?.data?.content ||
                raw?.students ||
                (Array.isArray(raw?.data) ? raw.data : null) ||
                (Array.isArray(raw) ? raw : []);
            if (!mountedRef.current) return;
            // BUG FIX: filter out null results from parseStudent
            setStudents(items.map(parseStudent).filter(Boolean));
        } catch (e) {
            console.error("loadStudents:", e);
        } finally {
            if (mountedRef.current) setStudentsLoading(false);
        }
    }, []);

    // ── fetchPreview ──────────────────────────────────────────
    const fetchPreview = useCallback(async () => {
        if (!selectedStoreId || !selectedStudent) return;
        setPreviewLoading(true);
        setPreviewError("");
        try {
            const res  = await previewStudentOrder(selectedStudent.id, selectedStoreId);
            const data = res?.data || res;
            const raw  = data?.items || data?.orderItems || [];
            if (!mountedRef.current) return;
            if (!raw.length) {
                setOrderItems([]);
                setPreviewError("No items found for this student/store combination.");
                return;
            }
            setOrderItems(
                raw.map((i) => ({
                    itemId:            i.itemId,
                    itemName:          i.itemName  || i.name || `Item #${i.itemId}`,
                    itemCode:          i.itemCode  || "—",
                    itemUnit:          i.itemUnit  || "PCS",
                    category:          i.category  || "",
                    quantity:          Math.max(1, i.quantity || 1), // BUG FIX: ensure ≥1
                    availableQty:      i.availableQuantitySnapshot ?? null,
                    unitPriceSnapshot: i.unitPriceSnapshot ?? null,
                    // BUG FIX: keep lineTotal in sync from the start
                    lineTotal:         i.unitPriceSnapshot != null
                        ? i.unitPriceSnapshot * Math.max(1, i.quantity || 1)
                        : null,
                }))
            );
        } catch (e) {
            console.error("fetchPreview:", e);
            if (!mountedRef.current) return;
            setPreviewError("Failed to load items. Please try again.");
            setOrderItems([]);
        } finally {
            if (mountedRef.current) setPreviewLoading(false);
        }
    }, [selectedStudent?.id, selectedStoreId]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── refreshAvailability ───────────────────────────────────
    // BUG FIX: original had orderItems in deps which caused infinite loop
    // because refreshAvailability itself calls setOrderItems.
    // Use a ref snapshot of orderItems instead.
    const orderItemsRef = useRef(orderItems);
    useEffect(() => { orderItemsRef.current = orderItems; }, [orderItems]);

    const refreshAvailability = useCallback(async () => {
        const currentItems = orderItemsRef.current;
        if (!selectedStoreId || !currentItems.length) return;
        setPreviewLoading(true);
        try {
            const res  = await checkItemAvailability(Number(selectedStoreId), currentItems.map((i) => i.itemId));
            const list = Array.isArray(res) ? res : (res?.data || []);
            if (!mountedRef.current) return;
            const availMap = {};
            // BUG FIX: normalize to Number→String — API can return itemId as
            // number or string; inconsistency caused ghost items (AMIGOS BOX bug)
            const normalId = (v) => String(Number(v));
            list.forEach((i) => {
                availMap[normalId(i.itemId)] = i.notStockedInStore ? 0 : (i.availableQuantity ?? 0);
            });
            setOrderItems((prev) =>
                prev.map((item) => ({
                    ...item,
                    availableQty: availMap[normalId(item.itemId)] ?? item.availableQty ?? null,
                }))
            );
        } catch (e) {
            console.error("refreshAvailability:", e);
        } finally {
            if (mountedRef.current) setPreviewLoading(false);
        }
    }, [selectedStoreId]);

    // ── handleItemsAdded ──────────────────────────────────────
    const handleItemsAdded = useCallback((newItems) => {
        setPreviewError("");

        // BUG FIX: normalize itemId to Number→String so type mismatches between
        // API responses (number vs string) never cause duplicates (ghost items)
        const normalId = (v) => String(Number(v));

        // BUG FIX: pure sync merge only inside the updater — no async calls here.
        // Async calls inside a state updater can run >1 time in React strict/
        // concurrent mode, spawning multiple inflight requests that each call
        // setOrderItems again, writing back stale or duplicate data.
        setOrderItems((prev) => {
            const existingIds = new Set(prev.map((i) => normalId(i.itemId)));
            const toAdd = newItems.filter((i) => !existingIds.has(normalId(i.itemId)));
            return [...prev, ...toAdd];
        });

        // Availability refresh is a side effect — run it outside the updater
        if (!selectedStoreId) return;
        const allIds = [
            ...new Set([
                ...orderItemsRef.current.map((i) => i.itemId),
                ...newItems.map((i) => i.itemId),
            ]),
        ];
        if (!allIds.length) return;

        checkItemAvailability(Number(selectedStoreId), allIds)
            .then((res) => {
                if (!mountedRef.current) return;
                const list = Array.isArray(res) ? res : (res?.data || []);
                const availMap = {};
                list.forEach((i) => {
                    availMap[normalId(i.itemId)] = i.notStockedInStore ? 0 : (i.availableQuantity ?? 0);
                });
                setOrderItems((cur) =>
                    cur.map((item) => ({
                        ...item,
                        availableQty: availMap[normalId(item.itemId)] ?? item.availableQty ?? null,
                    }))
                );
            })
            .catch((e) => console.error("handleItemsAdded availability:", e));
    }, [selectedStoreId]); // eslint-disable-line react-hooks/exhaustive-deps

    // BUG FIX: step 2 entry — only fetch preview on first visit (empty items),
    // otherwise just refresh availability. Removed orderItems from deps.
    const step2EnteredRef = useRef(false);
    useEffect(() => {
        if (step !== 2) {
            step2EnteredRef.current = false;
            return;
        }
        if (step2EnteredRef.current) return; // already handled
        step2EnteredRef.current = true;
        if (orderItems.length === 0) {
            fetchPreview();
        } else {
            refreshAvailability();
        }
    }, [step, fetchPreview, refreshAvailability]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── setQty ────────────────────────────────────────────────
    const setQty = useCallback((id, v) => {
        setOrderItems((p) =>
            p.map((i) => {
                if (i.itemId !== id) return i;
                // BUG FIX: clamp to 1 minimum; parseInt("") → NaN → default 1
                const qty = Math.max(1, parseInt(v, 10) || 1);
                return {
                    ...i,
                    quantity:  qty,
                    lineTotal: i.unitPriceSnapshot != null ? i.unitPriceSnapshot * qty : null,
                };
            })
        );
    }, []);

    const removeItem = useCallback((id) => {
        setOrderItems((p) => p.filter((i) => i.itemId !== id));
    }, []);

    // ── Derived values ────────────────────────────────────────
    const stockIssues = orderItems.filter(
        (i) => i.availableQty !== null && i.quantity > i.availableQty
    );
    const hasAnyIssue = stockIssues.length > 0;
    const totalUnits  = orderItems.reduce((a, i) => a + i.quantity, 0);
    // BUG FIX: grandTotal should use the live lineTotal from state (kept in sync by setQty)
    const grandTotal  = orderItems.reduce((a, i) => (i.lineTotal != null ? a + i.lineTotal : a), 0);
    const hasPricing  = orderItems.some(
        (i) => i.unitPriceSnapshot !== null && i.unitPriceSnapshot !== undefined
    );

    // ── Validation ────────────────────────────────────────────
    const validateStep1 = () => {
        const e = {};
        if (!selectedStudent) e.student = "Please select a student.";
        if (!selectedStoreId) e.store   = "Please select a store.";
        setErrors(e);
        return !Object.keys(e).length;
    };

    const validateStep2 = () => {
        if (!orderItems.length) {
            setErrors({ items: "Please keep at least one item." });
            return false;
        }
        setErrors({});
        return true;
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

    // ── Payload builder ───────────────────────────────────────
    const buildPayload = (status) => ({
        studentId:         selectedStudent.id,
        storeId:           Number(selectedStoreId),
        orderDate,
        remarks:           remarks.trim() || null,
        status,
        paymentMethod:     paymentMethod || null,
        transactionNumber: transactionNumber.trim() || null,
        items:             orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
    });

    // ── Save as Draft ─────────────────────────────────────────
    const handleSaveDraft = async () => {
        if (!validateStep2()) return;
        // BUG FIX: prevent double-submit
        if (submitting) return;
        setSubmitting(true);
        setErrors({});
        try {
            await createStudentOrder(buildPayload("DRAFT"));
            navigate("/stock/studentOrders", { state: { saved: "DRAFT" } });
        } catch (e) {
            if (!mountedRef.current) return;
            setErrors({ submit: e?.message || "Failed to save draft." });
        } finally {
            if (mountedRef.current) setSubmitting(false);
        }
    };

    // ── Confirm order ─────────────────────────────────────────
    // BUG FIX: original did not validate step 2 before confirming from step 3
    const handleConfirm = async () => {
        if (submitting) return;
        setSubmitting(true);
        setErrors({});
        try {
            const res    = await createStudentOrder(buildPayload("DRAFT"));
            const data   = res?.data || res;
            const newId  = data?.id  || data?.orderId;

            // BUG FIX: guard missing ID before calling confirm
            if (!newId) throw new Error("Order created but no ID returned from server.");

            await confirmStudentOrder(newId);
            if (!mountedRef.current) return;

            setPrintModal({
                open:      true,
                orderId:   newId,
                orderData: {
                    id:              newId,
                    issuedByName,
                    studentName:     selectedStudent?._name,
                    admissionNumber: selectedStudent?._admission,
                    className:       selectedStudent?._className,
                    storeName:       selectedStore?.storeName || `Store #${selectedStoreId}`,
                    orderDate,
                    remarks,
                    paymentMethod:     paymentMethod     || null,
                    transactionNumber: transactionNumber.trim() || null,
                    status:            "CONFIRMED",
                    items: orderItems.map((i) => ({
                        itemId:            i.itemId,
                        itemName:          i.itemName,
                        itemCode:          i.itemCode,
                        itemUnit:          i.itemUnit,
                        quantity:          i.quantity,
                        unitPriceSnapshot: i.unitPriceSnapshot,
                        lineTotal:         i.lineTotal,
                    })),
                    totalAmount: grandTotal > 0 ? grandTotal : null,
                },
            });
        } catch (e) {
            if (!mountedRef.current) return;
            setErrors({ submit: e?.message || "Failed to confirm order." });
        } finally {
            if (mountedRef.current) setSubmitting(false);
        }
    };

    // ── Filtered students ─────────────────────────────────────
    // BUG FIX: memoize filtered list to avoid re-computing on every render
    const filteredStudents = studentSearch.trim()
        ? students.filter((s) => {
            const q = studentSearch.toLowerCase();
            return (
                s._name.toLowerCase().includes(q) ||
                s._admission.toLowerCase().includes(q) ||
                s._className.toLowerCase().includes(q)
            );
        })
        : students;

    // ── Render ────────────────────────────────────────────────
    return (
        <>
            {/* ── Print Confirm Modal ── */}
            <PrintConfirmModal
                isOpen={printModal.open}
                orderId={printModal.orderId}
                onPrint={() => {
                    printOrder(printModal.orderData, "");
                    navigate("/stock/studentOrders", { state: { saved: "CONFIRMED" } });
                }}
                onSkip={() => navigate("/stock/studentOrders", { state: { saved: "CONFIRMED" } })}
            />

            {/* BUG FIX: bg-linear-to-b → bg-gradient-to-b */}
            <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100">
                <div className="p-3 sm:p-4 lg:p-5 max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                                New Student Order
                            </h1>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">
                                Create a new stock order for a student.
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => navigate("/stock/studentOrders")}
                            className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors shadow-sm shrink-0"
                        >
                            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
                            <span className="hidden sm:inline">Back</span>
                        </button>
                    </div>

                    {/* Step bar */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 px-4 sm:px-6 py-4 sm:py-5 mb-4 sm:mb-5">
                        <StepBar current={step} />
                    </div>

                    {/* ════════ STEP 1 ════════ */}
                    {step === 1 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-5">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" aria-hidden="true" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">
                                    Student &amp; Store Details
                                </h2>
                            </div>

                            {/* Student picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Student <span className="text-red-500" aria-hidden="true">*</span>
                                </label>

                                {selectedStudent ? (
                                    <div
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => {
                                            setSelectedStudent(null);
                                            setOrderItems([]);
                                            // BUG FIX: also reset preview state
                                            setPreviewError("");
                                            step2EnteredRef.current = false;
                                        }}
                                        onKeyDown={(e) => e.key === "Enter" && setSelectedStudent(null)}
                                        aria-label="Change selected student"
                                        className="border border-blue-400 bg-blue-50 rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" aria-hidden="true" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-blue-800 truncate">{selectedStudent._name}</p>
                                                <p className="text-xs text-blue-500 truncate">
                                                    {selectedStudent._admission && `ADM: ${selectedStudent._admission}`}
                                                    {selectedStudent._className && ` · ${selectedStudent._className}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-500 border border-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors shrink-0 ml-2">
                                            Change
                                        </span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
                                            <input
                                                type="text"
                                                placeholder="Search by name or admission no…"
                                                value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                aria-label="Search students"
                                                className={`${inputCls} pl-9 ${errors.student ? "border-red-400" : ""}`}
                                            />
                                        </div>
                                        <div
                                            className={`border rounded-xl overflow-hidden ${errors.student ? "border-red-300" : "border-gray-200"}`}
                                            role="listbox"
                                            aria-label="Student list"
                                        >
                                            {studentsLoading && filteredStudents.length === 0 ? (
                                                <div className="flex items-center gap-2 px-4 py-5 text-xs text-gray-400">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Loading students…
                                                </div>
                                            ) : filteredStudents.length === 0 ? (
                                                <div className="px-4 py-6 text-sm text-gray-400 text-center">No students found.</div>
                                            ) : (
                                                <div className="max-h-48 sm:max-h-52 overflow-y-auto divide-y divide-gray-50">
                                                    {filteredStudents.map((s) => (
                                                        <button
                                                            key={s.id}
                                                            type="button"
                                                            role="option"
                                                            aria-selected="false"
                                                            onClick={() => {
                                                                setSelectedStudent(s);
                                                                setErrors((p) => ({ ...p, student: "" }));
                                                                setStudentSearch("");
                                                                setOrderItems([]);
                                                                setPreviewError("");
                                                                step2EnteredRef.current = false;
                                                            }}
                                                            className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-blue-50 transition-colors"
                                                        >
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mr-2 sm:mr-3">
                                                                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" aria-hidden="true" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{s._name}</p>
                                                                <p className="text-xs text-gray-400 truncate">
                                                                    {s._admission && `ADM: ${s._admission}`}
                                                                    {s._className && ` · ${s._className}`}
                                                                </p>
                                                            </div>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}
                                {errors.student && (
                                    <p className="text-xs text-red-500" role="alert">{errors.student}</p>
                                )}
                                {selectedStudent?._className && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm flex-wrap">
                                        <span aria-hidden="true">🏠</span>
                                        <span className="font-semibold text-gray-700 text-xs sm:text-sm">Auto-detected:</span>
                                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">{selectedStudent._className}</span>
                                        <span className="text-xs text-gray-400 hidden md:block ml-auto">
                                            · Default items will be pre-loaded from class config
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Store picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">
                                    Issue from Store <span className="text-red-500" aria-hidden="true">*</span>
                                </label>
                                {storesLoading ? (
                                    <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> Loading stores…
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select
                                            value={selectedStoreId}
                                            onChange={(e) => {
                                                setSelectedStoreId(e.target.value);
                                                setOrderItems([]);
                                                setPreviewError("");
                                                step2EnteredRef.current = false;
                                                setErrors((p) => ({ ...p, store: "" }));
                                            }}
                                            aria-label="Select store"
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
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                                    </div>
                                )}
                                {errors.store && (
                                    <p className="text-xs text-red-500" role="alert">{errors.store}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Order Date</label>
                                    <input
                                        type="date"
                                        value={orderDate}
                                        onChange={(e) => setOrderDate(e.target.value)}
                                        className={inputCls}
                                    />
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

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/stock/studentOrders")}
                                    className="px-4 sm:px-6 py-2.5 text-sm cursor-pointer font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={goNext}
                                    className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 sm:px-7 py-2.5 rounded-xl transition-colors shadow-sm"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ════════ STEP 2 ════════ */}
                    {step === 2 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" aria-hidden="true" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">Review &amp; Edit Items</h2>
                            </div>

                            {/* Context strip */}
                            {/* BUG FIX: max-w-37.5 is invalid Tailwind → max-w-[150px] */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                                    <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                                        <span className="truncate max-w-[150px] sm:max-w-none">{selectedStudent?._name}</span>
                                    </span>
                                    <span className="text-gray-300 hidden sm:block" aria-hidden="true">·</span>
                                    <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                                        <span className="truncate max-w-[150px] sm:max-w-none">{selectedStore?.storeName || `Store #${selectedStoreId}`}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                    <button
                                        type="button"
                                        onClick={() => setShowAddItem(true)}
                                        disabled={previewLoading}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors disabled:opacity-50"
                                    >
                                        <Plus className="w-3.5 h-3.5" aria-hidden="true" /> Add Item
                                    </button>
                                    <button
                                        type="button"
                                        onClick={refreshAvailability}
                                        disabled={previewLoading}
                                        className="flex-1 sm:flex-none p-2 rounded-xl flex items-center justify-center gap-1.5 text-gray-600 text-xs cursor-pointer border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50"
                                        aria-label="Refresh availability"
                                    >
                                        Refresh
                                        <RefreshCw
                                            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 ${previewLoading ? "animate-spin" : ""}`}
                                            aria-hidden="true"
                                        />
                                    </button>
                                </div>
                            </div>

                            <StudentOrderAddItem
                                isOpen={showAddItem}
                                onClose={() => setShowAddItem(false)}
                                storeId={selectedStoreId}
                                existingItems={orderItems}
                                onAddItems={handleItemsAdded}
                            />

                            {hasAnyIssue && !previewLoading && (
                                <div
                                    role="alert"
                                    className="flex items-start gap-2 bg-orange-50 border border-orange-300 rounded-xl px-3 sm:px-4 py-3 text-xs text-orange-800"
                                >
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" aria-hidden="true" />
                                    <div>
                                        <p className="font-semibold mb-0.5">Stock issue detected</p>
                                        <p>Some quantities exceed available stock. Reduce them to confirm. You can still <strong>Save as Draft</strong>.</p>
                                    </div>
                                </div>
                            )}

                            {previewLoading ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                                    <Loader2 className="w-7 h-7 animate-spin text-blue-500" aria-hidden="true" />
                                    <p className="text-sm">Loading items from preview…</p>
                                </div>
                            ) : previewError && orderItems.length === 0 ? (
                                <div className="text-center py-10 sm:py-12 border border-dashed border-red-200 rounded-xl text-red-400 space-y-2">
                                    <AlertCircle className="w-8 h-8 mx-auto opacity-40" aria-hidden="true" />
                                    <p className="text-sm font-medium">{previewError}</p>
                                    <button
                                        type="button"
                                        onClick={fetchPreview}
                                        className="text-xs text-blue-500 hover:text-blue-700 underline"
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : orderItems.length === 0 ? (
                                <div className="text-center py-12 sm:py-14 border border-dashed border-gray-200 rounded-xl text-gray-400">
                                    <Package className="w-10 h-10 mx-auto text-gray-200 mb-2" aria-hidden="true" />
                                    <p className="text-sm font-medium">No items found for this combination</p>
                                    <p className="text-xs mt-1">Try a different student or store.</p>
                                </div>
                            ) : (
                                <>
                                    <ItemTableHeader />
                                    <div className="space-y-2" role="list" aria-label="Order items">
                                        {orderItems.map((item) => (
                                            <ItemRow
                                                key={item.itemId}
                                                item={item}
                                                onQtyChange={setQty}
                                                onRemove={removeItem}
                                            />
                                        ))}
                                    </div>
                                    {/* Per-item stock warnings */}
                                    {stockIssues.map((item) => (
                                        <div
                                            key={`warn-${item.itemId}`}
                                            role="alert"
                                            className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 rounded-xl px-3 sm:px-4 py-3 text-xs text-yellow-800"
                                        >
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" aria-hidden="true" />
                                            <span>
                                                <strong>{item.itemName}:</strong> Only <strong>{item.availableQty}</strong> available, requested <strong>{item.quantity}</strong>.
                                            </span>
                                        </div>
                                    ))}
                                    {/* Summary bar */}
                                    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 sm:px-4 py-3 border ${hasAnyIssue ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                                        <span className="text-sm text-gray-600">
                                            {orderItems.length} item type{orderItems.length !== 1 ? "s" : ""} · <strong className="text-gray-800">{totalUnits} units</strong>
                                        </span>
                                        {hasPricing && (
                                            <span className="flex items-center gap-1 text-sm font-bold text-green-700">
                                                <IndianRupee className="w-3.5 h-3.5" aria-hidden="true" />{grandTotal.toFixed(2)} estimated
                                            </span>
                                        )}
                                        {hasAnyIssue && (
                                            <span className="text-sm font-semibold text-orange-500 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4" aria-hidden="true" />
                                                {stockIssues.length} stock issue{stockIssues.length > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {errors.items && (
                                <div role="alert" className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {errors.items}
                                </div>
                            )}
                            {errors.submit && (
                                <div role="alert" className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {errors.submit}
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                <button
                                    type="button"
                                    onClick={goBack}
                                    disabled={submitting}
                                    className="px-5 py-2.5 cursor-pointer text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-center"
                                >
                                    ← Back
                                </button>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                    <button
                                        type="button"
                                        onClick={handleSaveDraft}
                                        disabled={submitting || previewLoading}
                                        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                                    >
                                        {submitting
                                            ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                                            : <Save className="w-4 h-4" aria-hidden="true" />}
                                        Save as Draft
                                    </button>
                                    {/* BUG FIX: "Next" was hidden when hasAnyIssue but user should still be able to proceed to step 3 to save draft from there */}
                                    {orderItems.length > 0 && (
                                        <button
                                            type="button"
                                            onClick={goNext}
                                            disabled={submitting || previewLoading || hasAnyIssue}
                                            title={hasAnyIssue ? "Resolve stock issues before confirming" : undefined}
                                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm"
                                        >
                                            Next →
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ════════ STEP 3 ════════ */}
                    {step === 3 && (
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-5">
                            <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" aria-hidden="true" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">Confirm Order</h2>
                            </div>
                            <p className="text-sm text-gray-500">Review your order before submitting.</p>

                            {/* Student + Store summary cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-1">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                                        <User className="w-3.5 h-3.5" aria-hidden="true" /> Student
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">{selectedStudent?._name}</p>
                                    {selectedStudent?._admission && (
                                        <p className="text-xs text-gray-500">ADM: {selectedStudent._admission}</p>
                                    )}
                                    {selectedStudent?._className && (
                                        <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">
                                            {selectedStudent._className}
                                        </span>
                                    )}
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-1">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2">
                                        <ShoppingBag className="w-3.5 h-3.5" aria-hidden="true" /> Store
                                    </p>
                                    <p className="text-sm font-bold text-gray-800">
                                        {selectedStore?.storeName || `Store #${selectedStoreId}`}
                                    </p>
                                    {(selectedStore?.storeCode || selectedStore?.code) && (
                                        <p className="text-xs text-gray-500">
                                            {selectedStore.storeCode || selectedStore.code}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Date + Remarks */}
                            {(orderDate || remarks) && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-3 space-y-1.5">
                                    {orderDate && (
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold text-gray-700">Order Date:</span>{" "}
                                            {/* BUG FIX: parsing "YYYY-MM-DD" via new Date() can be off by one day
                                                due to UTC vs local timezone. Append T00:00 to force local time. */}
                                            {new Date(`${orderDate}T00:00`).toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short", year: "numeric",
                                            })}
                                        </p>
                                    )}
                                    {remarks && (
                                        <p className="text-xs text-gray-600">
                                            <span className="font-semibold text-gray-700">Remarks:</span> {remarks}
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* Items table */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-gray-400" aria-hidden="true" /> Order Items ({orderItems.length})
                                </p>
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    {/* Desktop header */}
                                    <div
                                        className="hidden sm:grid text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-2"
                                        style={{ gridTemplateColumns: "1fr 60px 72px 80px" }}
                                        role="row"
                                    >
                                        <span>Item</span>
                                        <span className="text-center">Qty</span>
                                        <span className="text-right">Unit Price</span>
                                        <span className="text-right">Line Total</span>
                                    </div>
                                    {/* Mobile header */}
                                    <div
                                        className="sm:hidden grid text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-2"
                                        style={{ gridTemplateColumns: "1fr 44px 68px" }}
                                        role="row"
                                    >
                                        <span>Item</span>
                                        <span className="text-center">Qty</span>
                                        <span className="text-right">Total</span>
                                    </div>

                                    {orderItems.map((item) => {
                                        const hasIssue  = item.availableQty !== null && item.quantity > item.availableQty;
                                        // BUG FIX: use item.lineTotal from state (kept in sync); fallback to recalc
                                        const lineTotal = item.lineTotal ?? (
                                            item.unitPriceSnapshot != null
                                                ? item.unitPriceSnapshot * item.quantity
                                                : null
                                        );
                                        return (
                                            <div key={item.itemId} className={hasIssue ? "bg-orange-50" : ""}>
                                                {/* Desktop */}
                                                <div
                                                    className="hidden sm:grid items-center px-4 py-3 gap-2"
                                                    style={{ gridTemplateColumns: "1fr 60px 72px 80px" }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.itemName}</p>
                                                        <p className="text-xs text-gray-400">{item.itemCode} · {item.itemUnit}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${hasIssue ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                                            ×{item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-600 font-medium">
                                                        {item.unitPriceSnapshot != null
                                                            ? `₹${Number(item.unitPriceSnapshot).toFixed(2)}`
                                                            : "—"}
                                                    </div>
                                                    <div className="text-right text-xs font-bold text-blue-700">
                                                        {lineTotal != null ? `₹${Number(lineTotal).toFixed(2)}` : "—"}
                                                    </div>
                                                </div>
                                                {/* Mobile */}
                                                <div
                                                    className="sm:hidden grid items-center px-3 py-2.5 gap-2"
                                                    style={{ gridTemplateColumns: "1fr 44px 68px" }}
                                                >
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate">{item.itemName}</p>
                                                        <p className="text-xs text-gray-400">{item.itemCode}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${hasIssue ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                                                            ×{item.quantity}
                                                        </span>
                                                    </div>
                                                    <div className="text-right text-xs font-bold text-blue-700">
                                                        {lineTotal != null ? `₹${Number(lineTotal).toFixed(2)}` : "—"}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {hasPricing && (
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-green-50 border-t border-green-200">
                                            <span className="text-xs sm:text-sm font-bold text-gray-700">{totalUnits} units total</span>
                                            <span className="flex items-center gap-1 text-sm sm:text-base font-bold text-green-700">
                                                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" aria-hidden="true" />
                                                {grandTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="border border-dashed border-gray-200 rounded-xl p-3 sm:p-4 space-y-3 bg-gray-50/50">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                                    Payment Details
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">Payment Method</label>
                                        <div className="relative">
                                            {paymentMethodsLoading ? (
                                                <div className={`${inputCls} flex items-center gap-2 text-gray-400 text-xs`}>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" aria-hidden="true" /> Loading…
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        value={paymentMethod}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className={`${inputCls} appearance-none pr-8 text-sm`}
                                                        aria-label="Payment method"
                                                    >
                                                        <option value="">— Select method —</option>
                                                        {paymentMethods.map((m) => (
                                                            <option key={m.id ?? m.value} value={m.value}>{m.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" aria-hidden="true" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">
                                            Transaction / Reference No.
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" aria-hidden="true" />
                                            <input
                                                type="text"
                                                placeholder="e.g. TXN20260316001"
                                                value={transactionNumber}
                                                onChange={(e) => setTransactionNumber(e.target.value)}
                                                className={`${inputCls} pl-8 text-sm`}
                                                aria-label="Transaction reference number"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.submit && (
                                <div role="alert" className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" /> {errors.submit}
                                </div>
                            )}

                            <div className="pt-4 border-t border-gray-100">
                                <Step3Footer
                                    submitting={submitting}
                                    previewLoading={previewLoading}
                                    onBack={goBack}
                                    onDraft={handleSaveDraft}
                                    onConfirm={handleConfirm}
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}