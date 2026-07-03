import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    X, User, ShoppingBag, Package, Search, ChevronDown,
    Loader2, Save, Check, AlertCircle, AlertTriangle, RefreshCw,
    ArrowLeft, CheckCircle, Plus, IndianRupee, CreditCard, Hash,
} from "lucide-react";
import {getActiveStores} from "../../../Api/Stock/StoreApi";
import { getStudents } from "../../../Api/Students/StudentsApi";
import {
    createStudentOrder, confirmStudentOrder,
    previewStudentOrder, checkItemAvailability,
} from "../../../Api/Stock/StudentOrder";
import { getListOfValues } from "../../../Api/Lov/ListOfValues";
import PrintConfirmModal from "../../../Components/CommonComp/Print/PrintConfirmCard";
import { printOrder } from "../../../Components/CommonComp/Print/Printorderutil";
import StudentOrderAddItem from "./StudentOrderAddItem";
import { STOCK_SHARED_CONSTS, CREATE_STUDENT_ORDER_CONSTS } from "../../../Constants/StringConstants/StockAndOrdersConstants";

const STEPS = [
    { id: 1, label: CREATE_STUDENT_ORDER_CONSTS.STEPS.SELECT_STUDENT_STORE },
    { id: 2, label: CREATE_STUDENT_ORDER_CONSTS.STEPS.REVIEW_ITEMS },
    { id: 3, label: CREATE_STUDENT_ORDER_CONSTS.STEPS.CONFIRM_ORDER },
];

const inputCls =
    "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200";

function parseStudent(raw) {
    const firstName = raw.firstName || raw.first_name || "";
    const lastName = raw.lastName || raw.last_name || "";
    const fullName = raw.fullName || raw.full_name || raw.name || "";
    const name = fullName || [firstName, lastName].filter(Boolean).join(" ") || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STUDENT_ID(raw.id);
    const admission = raw.admissionNumber || raw.admission_number || raw.admNo || "";
    const className = raw.className || raw.class_name || raw.class || raw.classSection || "";
    const classId = raw.classId || raw.class_id || raw.classroomId || null;
    return { ...raw, _name: name, _admission: admission, _className: className, _classId: classId };
}

// ── Step Bar ─────────────────────────────────────────────────────
function StepBar({ current }) {
    return (
        <div className="flex items-center w-full">
            {STEPS.map((s, idx) => {
                const done = current > s.id;
                const active = current === s.id;
                return (
                    <div key={s.id} className="flex items-center flex-1 min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border-2 transition-all
                                ${done ? "bg-blue-600 border-blue-600 text-white"
                                    : active ? "border-blue-500 text-blue-600 bg-blue-50"
                                        : "border-gray-300 text-gray-400 bg-white"}`}>
                                {done ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : s.id}
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
                            <div className="sm:hidden">
                                {active && (
                                    <p className="text-xs font-semibold text-blue-600 max-w-17.5 leading-tight">{s.label}</p>
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
function Step3Footer({ submitting, previewLoading, onBack, onDraft, onConfirm }) {
    const [ready, setReady] = useState(false);
    useEffect(() => { const id = setTimeout(() => setReady(true), 50); return () => clearTimeout(id); }, []);
    const blocked = submitting || !ready || previewLoading;
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <button type="button" onClick={onBack} disabled={submitting || previewLoading}
                className="px-5 py-2.5 text-sm cursor-pointer font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-center">
                ← {CREATE_STUDENT_ORDER_CONSTS.TEXT.BACK}
            </button>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {previewLoading && (
                    <span className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 mr-1">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING}
                    </span>
                )}
                <button type="button" onClick={() => !blocked && onDraft()} disabled={blocked}
                    className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm cursor-pointer">
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {CREATE_STUDENT_ORDER_CONSTS.TEXT.SAVE_AS_DRAFT}
                </button>
                <button type="button" onClick={() => !blocked && onConfirm()} disabled={blocked}
                    className="flex items-center justify-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                    {submitting
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.SUBMITTING}</>
                        : previewLoading
                            ? <><Loader2 className="w-4 h-4 animate-spin" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING}</>
                            : <><Check className="w-4 h-4" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.CONFIRM_ISSUE_STOCK}</>}
                </button>
            </div>
        </div>
    );
}

// ── Item Row ─────────────────────────────────────────────────────
function ItemRow({ item, onQtyChange, onRemove }) {
    const avail = item.availableQty ?? null;
    const hasIssue = avail !== null && item.quantity > avail;
    const lineTotal = item.unitPriceSnapshot !== null && item.unitPriceSnapshot !== undefined
        ? item.unitPriceSnapshot * item.quantity : null;

    return (
        <div className={`border rounded-xl px-3 py-3 transition-colors
            ${hasIssue ? "border-orange-300 bg-orange-50/30" : "border-gray-200 hover:border-blue-200"}`}>
            {/* Desktop */}
            <div className="hidden sm:grid items-center gap-2"
                style={{ gridTemplateColumns: "1fr 80px 90px 70px 80px 32px" }}>
                <div className="min-w-0">
                    <p className="text-sm font-bold truncate text-gray-800">{item.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.itemCode} · {item.itemUnit}
                        {item.category && <span className="ml-1.5 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1.5 py-0.5 rounded uppercase">{item.category}</span>}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    <button type="button" onClick={() => onQtyChange(item.itemId, item.quantity - 1)} disabled={item.quantity <= 1}
                        className="w-6 h-6 flex items-center justify-center rounded font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition text-sm cursor-pointer">−</button>
                    <input type="number" min="1" value={item.quantity}
                        onChange={(e) => onQtyChange(item.itemId, e.target.value)}
                        className={`w-10 text-center text-sm font-bold border rounded py-0.5 px-1 focus:outline-none focus:ring-2 transition
                            ${hasIssue ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                : "border-gray-200 bg-white text-gray-800 focus:ring-blue-300"}`} />
                    <button type="button" onClick={() => onQtyChange(item.itemId, item.quantity + 1)}
                        className={`w-6 h-6 flex items-center justify-center rounded font-bold border transition text-sm cursor-pointer
                            ${hasIssue ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}>+</button>
                </div>
                <div className="text-right pr-1">
                    {hasIssue
                        ? <span className="text-xs font-semibold text-orange-500 flex items-center justify-end gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />{CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.AVAIL_COUNT(avail)}
                        </span>
                        : <span className="text-xs font-semibold text-green-600">✓ {avail ?? "?"} avail</span>}
                </div>
                <div className="text-right pr-1">
                    {item.unitPriceSnapshot !== null && item.unitPriceSnapshot !== undefined
                        ? <span className="text-xs font-semibold text-gray-700 flex items-center justify-end gap-0.5">
                            <IndianRupee className="w-3 h-3 text-gray-400" />{Number(item.unitPriceSnapshot).toFixed(2)}
                        </span>
                        : <span className="text-xs text-gray-300">—</span>}
                </div>
                <div className="text-right pr-1">
                    {lineTotal !== null
                        ? <span className={`text-xs font-bold flex items-center justify-end gap-0.5 ${hasIssue ? "text-orange-600" : "text-blue-700"}`}>
                            <IndianRupee className="w-3 h-3" />{Number(lineTotal).toFixed(2)}
                        </span>
                        : <span className="text-xs text-gray-300">—</span>}
                </div>
                <button type="button" onClick={() => onRemove(item.itemId)}
                    className="w-7 h-7 flex items-center justify-center rounded-lg text-white bg-red-400 hover:bg-red-500 transition-colors cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
            {/* Mobile */}
            <div className="sm:hidden space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-gray-800 leading-tight">{item.itemName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{item.itemCode} · {item.itemUnit}
                            {item.category && <span className="ml-1 text-xs font-semibold text-gray-500 bg-gray-100 border border-gray-200 px-1 py-0.5 rounded uppercase">{item.category}</span>}
                        </p>
                    </div>
                    <button type="button" onClick={() => onRemove(item.itemId)}
                        className="w-7 h-7 shrink-0 flex items-center justify-center rounded-lg text-white bg-red-400 hover:bg-red-500 transition-colors cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
                <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">
                        <button type="button" onClick={() => onQtyChange(item.itemId, item.quantity - 1)} disabled={item.quantity <= 1}
                            className="w-7 h-7 flex items-center justify-center rounded font-bold border border-gray-200 bg-white text-gray-600 hover:bg-gray-100 disabled:opacity-40 transition text-sm cursor-pointer">−</button>
                        <input type="number" min="1" value={item.quantity}
                            onChange={(e) => onQtyChange(item.itemId, e.target.value)}
                            className={`w-12 text-center text-sm font-bold border rounded py-1 px-1 focus:outline-none focus:ring-2 transition
                                ${hasIssue ? "border-orange-400 bg-orange-50 text-orange-700 focus:ring-orange-200"
                                    : "border-gray-200 bg-white text-gray-800 focus:ring-blue-300"}`} />
                        <button type="button" onClick={() => onQtyChange(item.itemId, item.quantity + 1)}
                            className={`w-7 h-7 flex items-center justify-center rounded font-bold border transition text-sm cursor-pointer
                                ${hasIssue ? "border-orange-300 bg-orange-50 text-orange-600 hover:bg-orange-100"
                                    : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"}`}>+</button>
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                        {avail !== null && (hasIssue
                            ? <span className="font-semibold text-orange-500 flex items-center gap-0.5"><AlertTriangle className="w-3 h-3" />{avail} avail</span>
                            : <span className="font-semibold text-green-600">✓ {avail} avail</span>)}
                        {item.unitPriceSnapshot !== null && item.unitPriceSnapshot !== undefined && (
                            <span className="text-gray-600 font-semibold flex items-center gap-0.5">
                                <IndianRupee className="w-3 h-3" />{Number(item.unitPriceSnapshot).toFixed(2)}
                            </span>
                        )}
                        {lineTotal !== null && (
                            <span className={`font-bold flex items-center gap-0.5 ${hasIssue ? "text-orange-600" : "text-blue-700"}`}>
                                <IndianRupee className="w-3 h-3" />{Number(lineTotal).toFixed(2)}
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
        <div className="hidden sm:grid items-center px-3 py-2 gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200"
            style={{ gridTemplateColumns: "1fr 80px 90px 70px 80px 32px" }}>
            <span>{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.ITEM}</span>
            <span>{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.QTY}</span>
            <span className="text-right pr-1">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.AVAILABLE}</span>
            <span className="text-right pr-1 flex items-center justify-end gap-0.5"><IndianRupee className="w-3 h-3" /> {CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.UNIT_PRICE.split(' ')[0]}</span>
            <span className="text-right pr-1 flex items-center justify-end gap-0.5"><IndianRupee className="w-3 h-3" /> {CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.TOTAL}</span>
            <span />
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────
export default function CreateStudentOrder() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const loggedInUser = (() => { try { return JSON.parse(localStorage.getItem('user')) } catch { return null } })()
    const issuedByName = loggedInUser?.fullName || [loggedInUser?.firstName, loggedInUser?.lastName].filter(Boolean).join(' ') || loggedInUser?.name || loggedInUser?.username || '—'
    const [students, setStudents] = useState([]);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [studentSearch, setStudentSearch] = useState("");
    const [selectedStudent, setSelectedStudent] = useState(null);
    const studentsFetchedRef = useRef(false);

    const [stores, setStores] = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const selectedStore = stores.find((s) => String(s.id) === String(selectedStoreId)) || null;

    const [orderDate, setOrderDate] = useState(new Date().toISOString().split("T")[0]);
    const [remarks, setRemarks] = useState("");

    // ── Payment fields ────────────────────────────────────────
    const [paymentMethods, setPaymentMethods] = useState([]);
    const [paymentMethodsLoading, setPaymentMethodsLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState("");
    const [transactionNumber, setTransactionNumber] = useState("");

    const [previewLoading, setPreviewLoading] = useState(false);
    const [previewError, setPreviewError] = useState("");
    const [orderItems, setOrderItems] = useState([]);

    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [showAddItem, setShowAddItem] = useState(false);

    // ── Print confirm modal state ─────────────────────────────
    const [printModal, setPrintModal] = useState({ open: false, orderId: null, orderData: null });

    useEffect(() => { loadStores(); doLoadStudents(); }, []); // eslint-disable-line

    // Load payment methods when reaching Step 3
    useEffect(() => {
        if (step !== 3 || paymentMethods.length > 0) return;
        setPaymentMethodsLoading(true);
        getListOfValues(STOCK_SHARED_CONSTS.PAYMENT_METHOD.LOV_KEY)
            .then((data) => setPaymentMethods(data || []))
            .catch((e) => console.error("loadPaymentMethods:", e))
            .finally(() => setPaymentMethodsLoading(false));
    }, [step]); // eslint-disable-line

    const loadStores = async () => {
        setStoresLoading(true);
        try {
            const data = await getActiveStores();
            setStores(Array.isArray(data) ? data : (data.data || data.content || data.stores || []));
        } catch (e) { console.error("loadStores:", e); }
        finally { setStoresLoading(false); }
    };

    const doLoadStudents = useCallback(async () => {
        if (studentsFetchedRef.current) return;
        studentsFetchedRef.current = true;
        setStudentsLoading(true);
        try {
            const raw = await getStudents(0, 1000, "id");
            const items = raw?.content || raw?.data?.content || raw?.students ||
                (Array.isArray(raw?.data) ? raw.data : null) || (Array.isArray(raw) ? raw : []);
            setStudents(items.map(parseStudent));
        } catch (e) { console.error("loadStudents:", e); }
        finally { setStudentsLoading(false); }
    }, []); // eslint-disable-line

    const fetchPreview = useCallback(async () => {
        if (!selectedStoreId || !selectedStudent) return;
        setPreviewLoading(true); setPreviewError("");
        try {
            const res = await previewStudentOrder(selectedStudent.id, selectedStoreId);
            const data = res?.data || res;
            const raw = data?.items || data?.orderItems || [];
            if (!raw.length) {
                setOrderItems([]);
                setPreviewError(CREATE_STUDENT_ORDER_CONSTS.MESSAGES.NO_ITEMS_FOR_STUDENT_STORE);
                return;
            }
            setOrderItems(raw.map((i) => ({
                itemId: i.itemId,
                itemName: i.itemName || i.name || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.ITEM_ID(i.itemId),
                itemCode: i.itemCode || "—",
                itemUnit: i.itemUnit || STOCK_SHARED_CONSTS.UNIT.PCS,
                category: i.category || "",
                quantity: i.quantity || 1,
                availableQty: i.availableQuantitySnapshot ?? null,
                unitPriceSnapshot: i.unitPriceSnapshot ?? null,
                lineTotal: i.lineTotal ?? null,
            })));
        } catch (e) {
            console.error("fetchPreview:", e);
            setPreviewError(CREATE_STUDENT_ORDER_CONSTS.MESSAGES.LOAD_ITEMS_FAILED);
            setOrderItems([]);
        } finally { setPreviewLoading(false); }
    }, [selectedStudent?.id, selectedStoreId]); // eslint-disable-line

    const refreshAvailability = useCallback(async () => {
        if (!selectedStoreId || !orderItems.length) return;
        setPreviewLoading(true);
        try {
            const res = await checkItemAvailability(Number(selectedStoreId), orderItems.map((i) => i.itemId));
            const list = Array.isArray(res) ? res : (res?.data || []);
            const availMap = {};
            list.forEach((i) => { availMap[i.itemId] = i.notStockedInStore ? 0 : (i.availableQuantity ?? 0); });
            setOrderItems((prev) => prev.map((item) => ({
                ...item, availableQty: availMap[item.itemId] ?? item.availableQty ?? null,
            })));
        } catch (e) { console.error("refreshAvailability:", e); }
        finally { setPreviewLoading(false); }
    }, [selectedStoreId, orderItems]); // eslint-disable-line

    const handleItemsAdded = useCallback((newItems) => {
        setPreviewError("");
        setOrderItems((prev) => {
            const existingIds = new Set(prev.map((i) => String(i.itemId)));
            const merged = [...prev, ...newItems.filter((i) => !existingIds.has(String(i.itemId)))];
            if (!selectedStoreId || !merged.length) return merged;
            checkItemAvailability(Number(selectedStoreId), merged.map((i) => i.itemId))
                .then((res) => {
                    const list = Array.isArray(res) ? res : (res?.data || []);
                    const availMap = {};
                    list.forEach((i) => { availMap[i.itemId] = i.notStockedInStore ? 0 : (i.availableQuantity ?? 0); });
                    setOrderItems((cur) => cur.map((item) => ({
                        ...item, availableQty: availMap[item.itemId] ?? item.availableQty ?? null,
                    })));
                })
                .catch((e) => console.error("handleItemsAdded availability:", e));
            return merged;
        });
    }, [selectedStoreId]); // eslint-disable-line

    useEffect(() => {
        if (step !== 2) return;
        if (orderItems.length === 0) fetchPreview(); else refreshAvailability();
    }, [step]); // eslint-disable-line

    const setQty = (id, v) => setOrderItems((p) =>
        p.map((i) => {
            if (i.itemId !== id) return i;
            const qty = Math.max(1, parseInt(v) || 1);
            return { ...i, quantity: qty, lineTotal: i.unitPriceSnapshot != null ? i.unitPriceSnapshot * qty : null };
        })
    );
    const removeItem = (id) => setOrderItems((p) => p.filter((i) => i.itemId !== id));

    const stockIssues = orderItems.filter((i) => i.availableQty !== null && i.quantity > i.availableQty);
    const hasAnyIssue = stockIssues.length > 0;
    const totalUnits = orderItems.reduce((a, i) => a + i.quantity, 0);
    const grandTotal = orderItems.reduce((a, i) => i.lineTotal != null ? a + i.lineTotal : a, 0);
    const hasPricing = orderItems.some((i) => i.unitPriceSnapshot !== null && i.unitPriceSnapshot !== undefined);

    const validateStep1 = () => {
        const e = {};
        if (!selectedStudent) e.student = CREATE_STUDENT_ORDER_CONSTS.MESSAGES.SELECT_STUDENT_REQUIRED;
        if (!selectedStoreId) e.store = CREATE_STUDENT_ORDER_CONSTS.MESSAGES.SELECT_STORE_REQUIRED;
        setErrors(e); return !Object.keys(e).length;
    };
    const validateStep2 = () => {
        if (!orderItems.length) { setErrors({ items: CREATE_STUDENT_ORDER_CONSTS.MESSAGES.KEEP_ONE_ITEM_REQUIRED }); return false; }
        setErrors({}); return true;
    };
    const goNext = () => {
        if (step === 1 && !validateStep1()) return;
        if (step === 2 && !validateStep2()) return;
        setErrors({}); setStep((s) => Math.min(3, s + 1));
    };
    const goBack = () => { setErrors({}); setStep((s) => Math.max(1, s - 1)); };

    const buildPayload = (status) => ({
        studentId: selectedStudent.id,
        storeId: Number(selectedStoreId),
        orderDate,
        remarks: remarks.trim() || null,
        status,
        paymentMethod: paymentMethod || null,
        transactionNumber: transactionNumber.trim() || null,
        items: orderItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })),
    });

    const handleSaveDraft = async () => {
        if (!validateStep2()) return;
        setSubmitting(true); setErrors({});
        try {
            await createStudentOrder(buildPayload(STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API));
            navigate("/stock/studentOrders", { state: { saved: STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API } });
        } catch (e) { setErrors({ submit: e.message || CREATE_STUDENT_ORDER_CONSTS.MESSAGES.SAVE_DRAFT_FAILED }); }
        finally { setSubmitting(false); }
    };

    // ── Confirm: create + confirm, then open print modal ─────
    const handleConfirm = async () => {
        setSubmitting(true); setErrors({});
        try {
            const res = await createStudentOrder(buildPayload(STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API));
            const data = res?.data || res;
            const newId = data?.id || data?.orderId;
            if (newId) await confirmStudentOrder(newId);

            setPrintModal({
                open: true,
                orderId: newId,
                orderData: {
                    id: newId,
                    issuedByName,
                    studentName: selectedStudent?._name,
                    admissionNumber: selectedStudent?._admission,
                    className: selectedStudent?._className,
                    storeName: selectedStore?.storeName || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STORE_ID(selectedStoreId),
                    orderDate, remarks,
                    paymentMethod: paymentMethod || null,
                    transactionNumber: transactionNumber.trim() || null,
                    status: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API,
                    items: orderItems.map((i) => ({
                        itemId: i.itemId, itemName: i.itemName, itemCode: i.itemCode,
                        itemUnit: i.itemUnit, quantity: i.quantity,
                        unitPriceSnapshot: i.unitPriceSnapshot, lineTotal: i.lineTotal,
                    })),
                    totalAmount: grandTotal > 0 ? grandTotal : null,
                },
            });
        } catch (e) { setErrors({ submit: e.message || CREATE_STUDENT_ORDER_CONSTS.MESSAGES.CONFIRM_ORDER_FAILED }); }
        finally { setSubmitting(false); }
    };

    const filteredStudents = studentSearch.trim()
        ? students.filter((s) => {
            const q = studentSearch.toLowerCase();
            return s._name.toLowerCase().includes(q) || s._admission.toLowerCase().includes(q) || s._className.toLowerCase().includes(q);
        }) : students;

    return (
        <>
            {/* ── Print Confirm Modal ── */}
            <PrintConfirmModal
                isOpen={printModal.open}
                orderId={printModal.orderId}
                onPrint={() => {
                    printOrder(printModal.orderData, "");
                    navigate("/stock/studentOrders", { state: { saved: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API } });
                }}
                onSkip={() => navigate("/stock/studentOrders", { state: { saved: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API } })}
            />

            <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
                <div className="p-3 sm:p-4 lg:p-5 max-w-4xl mx-auto">

                    {/* Header */}
                    <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                        <div>
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{CREATE_STUDENT_ORDER_CONSTS.TEXT.TITLE}</h1>
                            <p className="text-gray-500 text-xs sm:text-sm mt-0.5">{CREATE_STUDENT_ORDER_CONSTS.TEXT.SUBTITLE}</p>
                        </div>
                        <button onClick={() => navigate("/stock/studentOrders")}
                            className="flex items-center gap-1.5 cursor-pointer px-3 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium transition-colors shadow-sm shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden sm:inline">{CREATE_STUDENT_ORDER_CONSTS.TEXT.BACK}</span>
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
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">{CREATE_STUDENT_ORDER_CONSTS.TEXT.STUDENT_STORE_DETAILS}</h2>
                            </div>

                            {/* Student picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{CREATE_STUDENT_ORDER_CONSTS.TEXT.STUDENT_LABEL} <span className="text-red-500">*</span></label>
                                {selectedStudent ? (
                                    <div onClick={() => { setSelectedStudent(null); setOrderItems([]); }}
                                        className="border border-blue-400 bg-blue-50 rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between cursor-pointer hover:border-blue-500 transition-colors">
                                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-200 flex items-center justify-center shrink-0">
                                                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-700" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-sm font-bold text-blue-800 truncate">{selectedStudent._name}</p>
                                                <p className="text-xs text-blue-500 truncate">
                                                    {selectedStudent._admission && `${CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.ADMISSION_NO(selectedStudent._admission)}`}
                                                    {selectedStudent._className && `${CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.CLASS_NAME_SUFFIX(selectedStudent._className)}`}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-500 border border-blue-300 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors shrink-0 ml-2">{CREATE_STUDENT_ORDER_CONSTS.TEXT.CHANGE}</span>
                                    </div>
                                ) : (
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input type="text" placeholder={CREATE_STUDENT_ORDER_CONSTS.TEXT.SEARCH_STUDENT_PH} value={studentSearch}
                                                onChange={(e) => setStudentSearch(e.target.value)}
                                                className={`${inputCls} pl-9 ${errors.student ? "border-red-400" : ""}`} />
                                        </div>
                                        <div className={`border rounded-xl overflow-hidden ${errors.student ? "border-red-300" : "border-gray-200"}`}>
                                            {studentsLoading && filteredStudents.length === 0 ? (
                                                <div className="flex items-center gap-2 px-4 py-5 text-xs text-gray-400">
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING}
                                                </div>
                                            ) : filteredStudents.length === 0 ? (
                                                <div className="px-4 py-6 text-sm text-gray-400 text-center">{CREATE_STUDENT_ORDER_CONSTS.TEXT.NO_STUDENTS_FOUND}</div>
                                            ) : (
                                                <div className="max-h-48 sm:max-h-52 overflow-y-auto divide-y divide-gray-50">
                                                    {filteredStudents.map((s) => (
                                                        <button key={s.id} type="button"
                                                            onClick={() => { setSelectedStudent(s); setErrors((p) => ({ ...p, student: "" })); setStudentSearch(""); setOrderItems([]); }}
                                                            className="w-full flex items-center px-3 sm:px-4 py-2.5 sm:py-3 text-left hover:bg-blue-50 transition-colors cursor-pointer">
                                                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mr-2 sm:mr-3">
                                                                <User className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <p className="text-sm font-semibold text-gray-800 truncate">{s._name}</p>
                                                                <p className="text-xs text-gray-400 truncate">
                                                                    {s._admission && `${CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.ADMISSION_NO(s._admission)}`}
                                                                    {s._className && `${CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.CLASS_NAME_SUFFIX(s._className)}`}
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
                                {selectedStudent?._className && (
                                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-sm flex-wrap">
                                        <span>🏠</span>
                                        <span className="font-semibold text-gray-700 text-xs sm:text-sm">{CREATE_STUDENT_ORDER_CONSTS.TEXT.AUTO_DETECTED_LABEL}</span>
                                        <span className="text-blue-600 font-semibold text-xs sm:text-sm">{selectedStudent._className}</span>
                                        <span className="text-xs text-gray-400 hidden md:block ml-auto">{CREATE_STUDENT_ORDER_CONSTS.TEXT.DEFAULT_ITEMS_HINT}</span>
                                    </div>
                                )}
                            </div>

                            {/* Store picker */}
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">{CREATE_STUDENT_ORDER_CONSTS.TEXT.ISSUE_FROM_STORE} <span className="text-red-500">*</span></label>
                                {storesLoading ? (
                                    <div className={`${inputCls} flex items-center gap-2 text-gray-400`}>
                                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING}
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <select value={selectedStoreId}
                                            onChange={(e) => { setSelectedStoreId(e.target.value); setOrderItems([]); setErrors((p) => ({ ...p, store: "" })); }}
                                            className={`${inputCls} appearance-none pr-8 cursor-pointer ${errors.store ? "border-red-400" : ""}`}>
                                            <option value="">{CREATE_STUDENT_ORDER_CONSTS.TEXT.SELECT_STORE_PLACEHOLDER}</option>
                                            {stores.map((s) => (
                                                <option key={s.id} value={s.id}>
                                                    {s.storeName || s.name || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STORE_ID(s.id)}
                                                    {(s.storeCode || s.code) ? `${CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STORE_CODE_SUFFIX(s.storeCode || s.code)}` : ""}
                                                </option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                    </div>
                                )}
                                {errors.store && <p className="text-xs text-red-500">{errors.store}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">{CREATE_STUDENT_ORDER_CONSTS.TEXT.ORDER_DATE}</label>
                                    <input type="date" value={orderDate} onChange={(e) => setOrderDate(e.target.value)} className={`${inputCls} cursor-pointer`} />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">
                                        {CREATE_STUDENT_ORDER_CONSTS.TEXT.PARENTS_LABEL.replace(':', '')}
                                    </label>
                                    <input type="text" placeholder={CREATE_STUDENT_ORDER_CONSTS.TEXT.PARENTS_NAME} value={remarks}
                                        onChange={(e) => setRemarks(e.target.value)} className={inputCls} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                <button type="button" onClick={() => navigate("/stock/studentOrders")}
                                    className="px-4 sm:px-6 py-2.5 text-sm cursor-pointer font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                                    {STOCK_SHARED_CONSTS.COMMON.CANCEL}
                                </button>
                                <button type="button" onClick={goNext}
                                    className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 sm:px-7 py-2.5 rounded-xl transition-colors shadow-sm">
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
                                    <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">{CREATE_STUDENT_ORDER_CONSTS.TEXT.REVIEW_EDIT_ITEMS}</h2>
                            </div>

                            {/* Context strip */}
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-3">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                                    <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                                        <User className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        <span className="truncate max-w-37.5 sm:max-w-none">{selectedStudent?._name}</span>
                                    </span>
                                    <span className="text-gray-300 hidden sm:block">·</span>
                                    <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                                        <ShoppingBag className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                                        <span className="truncate max-w-37.5 sm:max-w-none">{selectedStore?.storeName || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STORE_ID(selectedStoreId)}</span>
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                                    <button type="button" onClick={() => setShowAddItem(true)} disabled={previewLoading}
                                        className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 rounded-xl cursor-pointer transition-colors disabled:opacity-50">
                                        <Plus className="w-3.5 h-3.5" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.TITLE.replace('New Student Order', 'Add Item')}
                                    </button>
                                    <button onClick={refreshAvailability} disabled={previewLoading}
                                        className="flex-1 sm:flex-none p-2 rounded-xl flex items-center justify-center gap-1.5 text-gray-600 text-xs cursor-pointer border border-gray-200 bg-white hover:bg-gray-100 transition disabled:opacity-50">
                                        Refresh
                                        <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 ${previewLoading ? "animate-spin" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            <StudentOrderAddItem isOpen={showAddItem} onClose={() => setShowAddItem(false)}
                                storeId={selectedStoreId} existingItems={orderItems} onAddItems={handleItemsAdded} />

                            {hasAnyIssue && !previewLoading && (
                                <div className="flex items-start gap-2 bg-orange-50 border border-orange-300 rounded-xl px-3 sm:px-4 py-3 text-xs text-orange-800">
                                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-orange-500" />
                                    <div>
                                        <p className="font-semibold mb-0.5">{CREATE_STUDENT_ORDER_CONSTS.TEXT.STOCK_ISSUE_DETECTED}</p>
                                        <p>{CREATE_STUDENT_ORDER_CONSTS.TEXT.STOCK_ISSUE_BODY} <strong>{CREATE_STUDENT_ORDER_CONSTS.TEXT.SAVE_AS_DRAFT}</strong>.</p>
                                    </div>
                                </div>
                            )}

                            {previewLoading ? (
                                <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
                                    <Loader2 className="w-7 h-7 animate-spin text-blue-500" />
                                    <p className="text-sm">{CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING_PREVIEW_ITEMS}</p>
                                </div>
                            ) : previewError && orderItems.length === 0 ? (
                                <div className="text-center py-10 sm:py-12 border border-dashed border-red-200 rounded-xl text-red-400 space-y-2">
                                    <AlertCircle className="w-8 h-8 mx-auto opacity-40" />
                                    <p className="text-sm font-medium">{previewError}</p>
                                    <button onClick={fetchPreview} className="text-xs text-blue-500 hover:text-blue-700 underline cursor-pointer">{STOCK_SHARED_CONSTS.COMMON.RETRY}</button>
                                </div>
                            ) : orderItems.length === 0 ? (
                                <div className="text-center py-12 sm:py-14 border border-dashed border-gray-200 rounded-xl text-gray-400">
                                    <Package className="w-10 h-10 mx-auto text-gray-200 mb-2" />
                                    <p className="text-sm font-medium">{CREATE_STUDENT_ORDER_CONSTS.TEXT.NO_ITEMS_FOR_COMBINATION}</p>
                                    <p className="text-xs mt-1">{CREATE_STUDENT_ORDER_CONSTS.TEXT.TRY_DIFFERENT_STUDENT_STORE}</p>
                                </div>
                            ) : (
                                <>
                                    <ItemTableHeader />
                                    <div className="space-y-2">
                                        {orderItems.map((item) => (
                                            <ItemRow key={item.itemId} item={item} onQtyChange={setQty} onRemove={removeItem} />
                                        ))}
                                    </div>
                                    {stockIssues.map((item) => (
                                        <div key={`warn-${item.itemId}`} className="flex items-start gap-2 bg-yellow-50 border border-yellow-300 rounded-xl px-3 sm:px-4 py-3 text-xs text-yellow-800">
                                            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-yellow-600" />
                                            <span><strong>{item.itemName}:</strong> {CREATE_STUDENT_ORDER_CONSTS.TEXT.ONLY} <strong>{item.availableQty}</strong> {CREATE_STUDENT_ORDER_CONSTS.TEXT.AVAILABLE_REQUESTED} <strong>{item.quantity}</strong>.</span>
                                        </div>
                                    ))}
                                    <div className={`flex flex-wrap items-center justify-between gap-2 rounded-xl px-3 sm:px-4 py-3 border ${hasAnyIssue ? "bg-orange-50 border-orange-200" : "bg-gray-50 border-gray-200"}`}>
                                        <span className="text-sm text-gray-600">{orderItems.length} item type{orderItems.length !== 1 ? "s" : ""} · <strong className="text-gray-800">{totalUnits} units</strong></span>
                                        {hasPricing && (
                                            <span className="flex items-center gap-1 text-sm font-bold text-green-700">
                                                <IndianRupee className="w-3.5 h-3.5" />{grandTotal.toFixed(2)} estimated
                                            </span>
                                        )}
                                        {hasAnyIssue && (
                                            <span className="text-sm font-semibold text-orange-500 flex items-center gap-1.5">
                                                <AlertTriangle className="w-4 h-4" />{stockIssues.length} stock issue{stockIssues.length > 1 ? "s" : ""}
                                            </span>
                                        )}
                                    </div>
                                </>
                            )}

                            {errors.items && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.items}</div>}
                            {errors.submit && <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5"><AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.submit}</div>}

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-gray-100 gap-3">
                                <button type="button" onClick={goBack} disabled={submitting}
                                    className="px-5 py-2.5 cursor-pointer text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors disabled:opacity-50 text-center">
                                    ← {CREATE_STUDENT_ORDER_CONSTS.TEXT.BACK}
                                </button>
                                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                                    <button type="button" onClick={handleSaveDraft} disabled={submitting || previewLoading}
                                        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        {CREATE_STUDENT_ORDER_CONSTS.TEXT.SAVE_AS_DRAFT}
                                    </button>
                                    {!hasAnyIssue && orderItems.length > 0 && (
                                        <button type="button" onClick={goNext} disabled={submitting || previewLoading}
                                            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
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
                                    <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                                </div>
                                <h2 className="font-bold text-gray-800 text-sm sm:text-base">{CREATE_STUDENT_ORDER_CONSTS.STEPS.CONFIRM_ORDER}</h2>
                            </div>
                            <p className="text-sm text-gray-500">{CREATE_STUDENT_ORDER_CONSTS.TEXT.REVIEW_BEFORE_SUBMIT}</p>

                            {/* Student + Store cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-1">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2"><User className="w-3.5 h-3.5" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.STUDENT_LABEL}</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedStudent?._name}</p>
                                    {selectedStudent?._admission && <p className="text-xs text-gray-500">{CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.ADMISSION_NO(selectedStudent._admission).replace('ADM: ', 'ADM: ')}</p>}
                                    {selectedStudent?._className && <span className="inline-block text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">{selectedStudent._className}</span>}
                                </div>
                                <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 space-y-1">
                                    <p className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-2"><ShoppingBag className="w-3.5 h-3.5" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.STORE_LABEL}</p>
                                    <p className="text-sm font-bold text-gray-800">{selectedStore?.storeName || CREATE_STUDENT_ORDER_CONSTS.FALLBACKS.STORE_ID(selectedStoreId)}</p>
                                    {(selectedStore?.storeCode || selectedStore?.code) && <p className="text-xs text-gray-500">{selectedStore.storeCode || selectedStore.code}</p>}
                                </div>
                            </div>

                            {/* Date + Remarks strip */}
                            {(orderDate || remarks) && (
                                <div className="bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-4 py-3 space-y-1.5">
                                    {orderDate && <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">{CREATE_STUDENT_ORDER_CONSTS.TEXT.ORDER_DATE_LABEL}</span> {new Date(orderDate).toLocaleDateString(STOCK_SHARED_CONSTS.LOCALE.DATE_IN, { day: "2-digit", month: "short", year: "numeric" })}</p>}
                                    {remarks && <p className="text-xs text-gray-600"><span className="font-semibold text-gray-700">{CREATE_STUDENT_ORDER_CONSTS.TEXT.PARENTS_LABEL}</span> {remarks}</p>}
                                </div>
                            )}

                            {/* Items table */}
                            <div>
                                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1.5">
                                    <Package className="w-4 h-4 text-gray-400" /> Order Items ({orderItems.length})
                                </p>
                                <div className="border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100">
                                    <div className="hidden sm:grid text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-4 py-2"
                                        style={{ gridTemplateColumns: "1fr 60px 72px 80px" }}>
                                        <span>{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.ITEM}</span><span className="text-center">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.QTY}</span><span className="text-right">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.UNIT_PRICE}</span><span className="text-right">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.LINE_TOTAL}</span>
                                    </div>
                                    <div className="sm:hidden grid text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50 px-3 py-2"
                                        style={{ gridTemplateColumns: "1fr 44px 68px" }}>
                                        <span>{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.ITEM}</span><span className="text-center">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.QTY}</span><span className="text-right">{CREATE_STUDENT_ORDER_CONSTS.TABLE_HEADERS.TOTAL}</span>
                                    </div>
                                    {orderItems.map((item) => {
                                        const hasIssue = item.availableQty !== null && item.quantity > item.availableQty;
                                        const lineTotal = item.unitPriceSnapshot != null ? item.unitPriceSnapshot * item.quantity : null;
                                        return (
                                            <div key={item.itemId} className={hasIssue ? "bg-orange-50" : ""}>
                                                <div className="hidden sm:grid items-center px-4 py-3 gap-2" style={{ gridTemplateColumns: "1fr 60px 72px 80px" }}>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-gray-800 truncate">{item.itemName}</p>
                                                        <p className="text-xs text-gray-400">{item.itemCode} · {item.itemUnit}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-sm font-bold px-2 py-0.5 rounded-lg border ${hasIssue ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>×{item.quantity}</span>
                                                    </div>
                                                    <div className="text-right text-xs text-gray-600 font-medium">{item.unitPriceSnapshot != null ? CREATE_STUDENT_ORDER_CONSTS.CURRENCY.UNIT_PRICE(item.unitPriceSnapshot) : "—"}</div>
                                                    <div className="text-right text-xs font-bold text-blue-700">{lineTotal != null ? CREATE_STUDENT_ORDER_CONSTS.CURRENCY.LINE_TOTAL(lineTotal) : "—"}</div>
                                                </div>
                                                <div className="sm:hidden grid items-center px-3 py-2.5 gap-2" style={{ gridTemplateColumns: "1fr 44px 68px" }}>
                                                    <div className="min-w-0">
                                                        <p className="text-xs font-semibold text-gray-800 truncate">{item.itemName}</p>
                                                        <p className="text-xs text-gray-400">{item.itemCode}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded border ${hasIssue ? "bg-orange-100 text-orange-700 border-orange-300" : "bg-blue-50 text-blue-700 border-blue-200"}`}>×{item.quantity}</span>
                                                    </div>
                                                    <div className="text-right text-xs font-bold text-blue-700">{lineTotal != null ? CREATE_STUDENT_ORDER_CONSTS.CURRENCY.LINE_TOTAL(lineTotal) : "—"}</div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {hasPricing && (
                                        <div className="flex items-center justify-between px-3 sm:px-4 py-3 bg-green-50 border-t border-green-200">
                                            <span className="text-xs sm:text-sm font-bold text-gray-700">{totalUnits} units total</span>
                                            <span className="flex items-center gap-1 text-sm sm:text-base font-bold text-green-700">
                                                <IndianRupee className="w-3.5 h-3.5 sm:w-4 sm:h-4" />{grandTotal.toFixed(2)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>


                            {/* ── Payment Details (optional) ── */}
                            <div className="border border-dashed border-gray-200 rounded-xl p-3 sm:p-4 space-y-3 bg-gray-50/50">
                                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <CreditCard className="w-3.5 h-3.5 text-gray-400" />
                                    {CREATE_STUDENT_ORDER_CONSTS.TEXT.PAYMENT_METHOD}
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {/* Payment Method dropdown */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">{CREATE_STUDENT_ORDER_CONSTS.TEXT.PAYMENT_METHOD}</label>
                                        <div className="relative">
                                            {paymentMethodsLoading ? (
                                                <div className={`${inputCls} flex items-center gap-2 text-gray-400 text-xs`}>
                                                    <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" /> {CREATE_STUDENT_ORDER_CONSTS.TEXT.LOADING}
                                                </div>
                                            ) : (
                                                <>
                                                    <select
                                                        value={paymentMethod}
                                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                                        className={`${inputCls} appearance-none pr-8 text-sm cursor-pointer`}
                                                    >
                                                        <option value="">{CREATE_STUDENT_ORDER_CONSTS.TEXT.SELECT_METHOD_PLACEHOLDER}</option>
                                                        {paymentMethods.map((m) => (
                                                            <option key={m.id} value={m.value}>{m.label}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Transaction Number */}
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-gray-600">{CREATE_STUDENT_ORDER_CONSTS.TEXT.TXN_REF_NO}</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={CREATE_STUDENT_ORDER_CONSTS.TEXT.TXN_REF_PLACEHOLDER}
                                                value={transactionNumber}
                                                onChange={(e) => setTransactionNumber(e.target.value)}
                                                className={`${inputCls} pl-8 text-sm`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {errors.submit && (
                                <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                                    <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.submit}
                                </div>
                            )}
                            <div className="pt-4 border-t border-gray-100">
                                <Step3Footer submitting={submitting} previewLoading={previewLoading}
                                    onBack={goBack} onDraft={handleSaveDraft} onConfirm={handleConfirm} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}