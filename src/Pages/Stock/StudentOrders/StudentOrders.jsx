import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  CheckCircle,
  XCircle as XCircleIcon,
  ClipboardList,
  Eye,
  Pencil,
  Ban,
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  SearchIcon,
  IndianRupee,
} from "lucide-react";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import ViewStudentOrder from "./ViewOrder";
import {
  getOrderStats,
  getStudentOrders,
  cancelStudentOrder,
} from "../../../Api/StudentOrder";
import { toast } from "react-toastify";

// ── Constants ─────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const ROWS_OPTIONS = [10, 25, 50];

const statusColors = {
  DRAFT:      "bg-gray-100   text-gray-600   border border-gray-300",
  PENDING:    "bg-yellow-100 text-yellow-700  border border-yellow-200",
  CONFIRMED:  "bg-blue-100   text-blue-700    border border-blue-200",
  APPROVED:   "bg-blue-100   text-blue-700    border border-blue-200",
  DISPATCHED: "bg-purple-100 text-purple-700  border border-purple-200",
  DELIVERED:  "bg-green-100  text-green-700   border border-green-200",
  CANCELLED:  "bg-red-100    text-red-600     border border-red-200",
};

const DEFAULT_STATS = { draftOrders: 0, confirmedOrders: 0, cancelledOrders: 0 };

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  const parsed = new Date(d);
  if (isNaN(parsed.getTime())) return "—"; // BUG FIX: guard invalid dates
  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function fmtAmount(val) {
  if (val === null || val === undefined || val === "") return "—";
  const num = Number(val);
  if (isNaN(num)) return "—"; // BUG FIX: guard NaN amounts
  return num.toFixed(2);
}

// BUG FIX: normalise status to avoid undefined key lookups
function getStatusColor(status) {
  return (
    statusColors[(status || "").toUpperCase()] ||
    "bg-gray-100 text-gray-600 border border-gray-200"
  );
}

function buildActionOptions(status) {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return [
      { value: "edit",   label: "Edit",   icon: Pencil, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
      { value: "view",   label: "View",   icon: Eye,    text: "text-gray-600", bg: "bg-gray-50", hover: "hover:bg-gray-100" },
      { value: "cancel", label: "Cancel", icon: Ban,    text: "text-red-500",  bg: "bg-red-50",  hover: "hover:bg-red-100" },
    ];
  }
  return [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];
}

// BUG FIX: extract pagination pages to avoid creating huge [...Array(n)] for
// large page counts — renders only a sensible window of page buttons.
function getPaginationRange(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const delta = 2;
  const range = [];
  const left  = Math.max(2, current - delta);
  const right = Math.min(total - 1, current + delta);

  range.push(1);
  if (left > 2) range.push("...");
  for (let i = left; i <= right; i++) range.push(i);
  if (right < total - 1) range.push("...");
  range.push(total);
  return range;
}

// ── Cancel Confirm Modal ──────────────────────────────────────────
function CancelConfirmModal({ order, onConfirm, onClose, loading }) {
  // BUG FIX: trap focus / prevent body scroll while modal open
  useEffect(() => {
    if (!order) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [order]);

  if (!order) return null;

  // BUG FIX: pressing Escape should close the modal
  const handleKeyDown = (e) => {
    if (e.key === "Escape" && !loading) onClose();
  };

  const studentName =
    order.studentName || order.student?.name || order.student?.fullName || "this student";

  return (
    // BUG FIX: z-index was z-60 (non-standard in default Tailwind)
    // Using inline style ensures it always sits above everything
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 1000 }}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={() => !loading && onClose()}
      />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4 ccm-anim">
        <style>{`
          @keyframes ccmIn {
            from { opacity: 0; transform: scale(.94) translateY(8px); }
            to   { opacity: 1; transform: scale(1)  translateY(0);    }
          }
          .ccm-anim { animation: ccmIn .18s ease-out forwards; }
        `}</style>

        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" aria-hidden="true" />
          </div>
          <div>
            <h3 id="cancel-modal-title" className="text-base font-bold text-gray-800">
              Cancel Order?
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-gray-700">Order #{order.id}</span>{" "}
              for{" "}
              <span className="font-semibold text-gray-700">{studentName}</span>?
            </p>
            <span className="text-red-500 text-xs mt-1 block">
              This action cannot be undone.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
            ) : (
              <><Ban className="w-4 h-4" /> Yes, Cancel</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function StudentOrders() {
  const navigate  = useNavigate();
  const location  = useLocation();

  // ── State ─────────────────────────────────────────────────────
  const [orders,       setOrders]       = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page,         setPage]         = useState(1);
  const [rowsPerPage,  setRowsPerPage]  = useState(10);
  const [stats,        setStats]        = useState(DEFAULT_STATS);
  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [noOrderFound, setNoOrderFound] = useState(false);
  const [viewOrder,    setViewOrder]    = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);

  // BUG FIX: use a ref flag to prevent state updates after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const resetPage = useCallback(() => setPage(1), []);

  // ── Handle return from Create / Edit page ─────────────────────
  // BUG FIX: original ran fetchOrders/fetchStats inline inside useEffect
  // but those functions weren't defined yet at that point in the file.
  // Moved to a separate effect after both callbacks are defined.
  const savedStateRef = useRef(location.state?.saved ?? null);

  // ── Debounced search ──────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(searchInput.trim()); // BUG FIX: trim whitespace
      resetPage();
    }, 400);
    return () => clearTimeout(t);
  }, [searchInput, resetPage]);

  useEffect(() => { resetPage(); }, [statusFilter, resetPage]);

  // ── Fetch stats ───────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const data = await getOrderStats();
      if (!mountedRef.current) return;
      const s = data?.data || data || {};
      setStats({
        draftOrders:     s.draftOrders     ?? s.draft     ?? 0,
        confirmedOrders: s.confirmedOrders ?? s.confirmed ?? 0,
        cancelledOrders: s.cancelledOrders ?? s.cancelled ?? 0,
      });
    } catch (e) {
      if (!mountedRef.current) return;
      console.error("getOrderStats:", e);
      // BUG FIX: keep previous stats on error instead of silently failing
    } finally {
      if (mountedRef.current) setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Fetch orders ──────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setNoOrderFound(false);
    try {
      const res = await getStudentOrders({
        page:       page - 1, // BUG NOTE: backend is 0-indexed, frontend is 1-indexed
        size:       rowsPerPage,
        searchTerm: search,
        status:     statusFilter,
      });
      if (!mountedRef.current) return;
      const list = res?.orders ?? [];
      setOrders(list);
      setPagination(res?.pagination ?? null);
      setNoOrderFound(list.length === 0);
    } catch (e) {
      if (!mountedRef.current) return;
      console.error("getStudentOrders:", e);
      toast.error("Failed to load student orders.");
      setOrders([]);
      setNoOrderFound(true); // BUG FIX: show empty state on error too
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  // ── Handle saved state toast (after create/edit navigation) ───
  // BUG FIX: moved here so fetchOrders & fetchStats are in scope
  useEffect(() => {
    const saved = savedStateRef.current;
    if (!saved) return;
    savedStateRef.current = null;
    // Clear the location state without causing a re-render loop
    window.history.replaceState({}, document.title);
    toast.success(
      saved === "DRAFT"
        ? "Order saved as draft."
        : "Order confirmed & stock issued."
    );
    fetchOrders();
    fetchStats();
  }, [fetchOrders, fetchStats]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived pagination values ─────────────────────────────────
  const totalItems = pagination?.totalElements ?? orders.length;
  // BUG FIX: guard against division by zero / NaN
  const totalPages = pagination?.totalPages
    ?? (rowsPerPage > 0 ? Math.max(1, Math.ceil(totalItems / rowsPerPage)) : 1);

  // BUG FIX: clamp page if data shrinks (e.g. after cancellation reduces total)
  useEffect(() => {
    if (!loading && page > totalPages && totalPages > 0) {
      setPage(totalPages);
    }
  }, [loading, page, totalPages]);

  // ── Cancel handler ────────────────────────────────────────────
  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelStudentOrder(cancelTarget.id, "Cancelled by admin");
      if (!mountedRef.current) return;
      toast.success(`Order #${cancelTarget.id} cancelled.`);
      setCancelTarget(null);
      // BUG FIX: fetch sequentially — stats depend on order counts
      await fetchOrders();
      fetchStats();
    } catch (e) {
      if (!mountedRef.current) return;
      // BUG FIX: e.message may be undefined for network errors
      toast.error(`Failed to cancel order: ${e?.message ?? "Unknown error"}`);
    } finally {
      if (mountedRef.current) setCancelling(false);
    }
  };

  const handleAction = useCallback((val, order) => {
    if (val === "view")   setViewOrder(order);
    if (val === "edit")   navigate(`/stock/studentOrders/editOrder?editId=${order.id}`);
    if (val === "cancel") setCancelTarget(order);
  }, [navigate]);

  // ── Stat card definitions ─────────────────────────────────────
  const statCards = [
    { key: "draft",     label: "Draft Orders",     val: stats.draftOrders,     iconTxColor: "text-orange-500", iconBgColor: "bg-orange-100", Icon: ClipboardList },
    { key: "confirmed", label: "Confirmed Orders",  val: stats.confirmedOrders, iconTxColor: "text-green-600",  iconBgColor: "bg-green-100",  Icon: CheckCircle   },
    { key: "cancelled", label: "Cancelled Orders",  val: stats.cancelledOrders, iconTxColor: "text-red-500",    iconBgColor: "bg-red-100",    Icon: XCircleIcon   },
  ];

  const tdBase = "px-2 py-2 text-left text-gray-700 text-sm";

  // ── Render helpers ────────────────────────────────────────────
  const renderMobileCard = (order, idx) => {
    const sc          = getStatusColor(order.status);
    const studentName = order.studentName || order.student?.name || order.student?.fullName || "—";
    const admNumber   = order.admissionNumber || order.student?.admissionNumber || "—";
    const orderClass  = order.className || order.class || order.student?.className || "—";
    const storeName   = order.storeName || order.store?.storeName || order.store?.name || "—";
    const items       = order.items || order.orderItems || [];
    const orderDate   = order.orderDate || order.createdAt || order.date;
    const totalAmt    = order.totalAmount;

    return (
      <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="text-xs text-gray-400 mt-0.5 shrink-0">
              {(page - 1) * rowsPerPage + idx + 1}.
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-gray-800 text-sm truncate">{studentName}</p>
              <p className="text-xs text-gray-400 truncate">{admNumber}</p>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${sc}`}>
            {order.status || "—"}
          </span>
        </div>

        <div className="space-y-1.5 text-sm">
          <p><span className="font-medium text-gray-500">Class:</span><span className="ml-2 text-gray-700">{orderClass}</span></p>
          <p><span className="font-medium text-gray-500">Store:</span><span className="ml-2 text-gray-700">{storeName}</span></p>
          <p><span className="font-medium text-gray-500">Date:</span><span className="ml-2 text-gray-700">{fmtDate(orderDate)}</span></p>
          <p><span className="font-medium text-gray-500">Items:</span><span className="ml-2 text-gray-700">{items.length}</span></p>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-green-600 shrink-0" aria-hidden="true" />
            <span className="font-bold text-green-700 text-sm">{fmtAmount(totalAmt)}</span>
          </div>
          <div className="flex justify-start items-center pt-1">
            <ActionDropDownComp
              actionOptions={buildActionOptions(order.status)}
              onAction={(val) => handleAction(val, order)}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderDesktopRow = (order, idx) => {
    const sc          = getStatusColor(order.status);
    const studentName = order.studentName || order.student?.name || order.student?.fullName || "—";
    const admNumber   = order.admissionNumber || order.student?.admissionNumber || "—";
    const orderClass  = order.className || order.class || order.student?.className || "—";
    const storeName   = order.storeName || order.store?.storeName || order.store?.name || "—";
    const items       = order.items || order.orderItems || [];
    const orderDate   = order.orderDate || order.createdAt || order.date;
    const totalAmt    = order.totalAmount;

    return (
      <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">

        <td className={tdBase}>{(page - 1) * rowsPerPage + idx + 1}</td>

        <td className={tdBase}>
          <p className="font-medium text-black whitespace-nowrap">{studentName}</p>
          <p className="text-xs text-gray-400">{admNumber}</p>
        </td>

        <td className={tdBase}>
          <span className="text-gray-600 whitespace-nowrap">{orderClass}</span>
        </td>

        <td className={tdBase}>
          <span className="text-gray-600 whitespace-nowrap">{storeName}</span>
        </td>

        {/* BUG FIX: items column was text-center in header but tdBase is text-left; align consistently */}
        <td className={tdBase}>
          {items.length > 0 ? (
            <div className="flex flex-col gap-1">
              {items.slice(0, 2).map((it, i) => (
                <span
                  key={i}
                  className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                >
                  {/* BUG FIX: fallback chain for item name */}
                  {it.itemName || it.name || it.productName || "Item"} ×{it.quantity ?? it.qty ?? 0}
                </span>
              ))}
              {items.length > 2 && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  +{items.length - 2} more
                </span>
              )}
            </div>
          ) : (
            <span className="text-gray-400 text-xs">—</span>
          )}
        </td>

        <td className={tdBase}>
          <span className="text-gray-600 whitespace-nowrap">{fmtDate(orderDate)}</span>
        </td>

        <td className={tdBase}>
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-green-600 shrink-0" aria-hidden="true" />
            <span className="font-semibold text-green-700 whitespace-nowrap">
              {fmtAmount(totalAmt)}
            </span>
          </div>
        </td>

        <td className={tdBase}>
          <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${sc}`}>
            {order.status || "—"}
          </span>
        </td>

        <td className={tdBase}>
          <ActionDropDownComp
            actionOptions={buildActionOptions(order.status)}
            onAction={(val) => handleAction(val, order)}
          />
        </td>
      </tr>
    );
  };

  // ── Pagination component (shared logic) ───────────────────────
  const PaginationButtons = ({ mobile = false }) => {
    const pages = getPaginationRange(page, totalPages);
    const btnBase = "px-3 py-1 rounded transition-all text-sm";

    return (
      <div className={`flex items-center ${mobile ? "justify-center" : ""} gap-1`}>
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1 || loading}
          className={`${mobile ? "px-4 py-2 bg-gray-100 hover:bg-gray-200" : "px-3 py-1 hover:bg-gray-100"} text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {pages.map((p, i) =>
          p === "..." ? (
            <span key={`ellipsis-${i}`} className="px-2 text-gray-400 select-none">…</span>
          ) : (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`${btnBase} ${page === p ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
              aria-current={page === p ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages || totalPages === 0 || loading}
          className={`${mobile ? "px-4 py-2 bg-gray-100 hover:bg-gray-200" : "px-3 py-1 hover:bg-gray-100"} text-gray-600 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all`}
          aria-label="Next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  const RowsPerPageSelect = () => (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-700">Rows per page:</span>
      <select
        value={rowsPerPage}
        onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      >
        {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
      </select>
    </div>
  );

  const PaginationSummary = () => (
    <span className="text-sm text-gray-700">
      {totalItems === 0
        ? "No orders"
        : `Showing ${(page - 1) * rowsPerPage + 1}–${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
    </span>
  );

  // ── JSX ───────────────────────────────────────────────────────
  return (
    <>
      <CancelConfirmModal
        order={cancelTarget}
        onClose={() => { if (!cancelling) setCancelTarget(null); }}
        onConfirm={handleCancelOrder}
        loading={cancelling}
      />

      <div className="min-h-screen bg-gradient-to-b from-sky-50 to-sky-100">
        {/* BUG FIX: bg-linear-to-b is not valid Tailwind; use bg-gradient-to-b */}
        <div className="p-2 sm:p-5 lg:p-4">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Student Orders
              </h1>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                Create and manage stock orders for students — track from draft through confirmed.
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 text-sm mt-5">
            {statsLoading
              ? statCards.map((_, i) => <CardLoader key={i} />)
              : statCards.map((card) => (
                <CardComponent
                  key={card.key}
                  IconName={card.Icon}
                  keyName={card.label.toUpperCase()}
                  val={card.val}
                  iconTxColor={card.iconTxColor}
                  iconBgColor={card.iconBgColor}
                />
              ))}
          </div>

          {/* ── Main Panel ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">

            {/* Panel Header */}
            <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
              <div className="flex items-center gap-2 min-w-0">
                <ShoppingBag className="w-5 h-5 text-blue-500 shrink-0" aria-hidden="true" />
                <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">
                  Student Orders
                </h2>
              </div>
              <button
                onClick={() => navigate("/stock/studentOrders/addOrder")}
                className="flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" aria-hidden="true" />
                New Order
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="flex flex-1 min-w-[180px] items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                {/* BUG FIX: min-w-45 is not a valid Tailwind class; use min-w-[180px] */}
                <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" aria-hidden="true" />
                <input
                  type="text"
                  placeholder="Search by student name or order ID…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                  aria-label="Search orders"
                />
                {/* BUG FIX: clear button for UX */}
                {searchInput && (
                  <button
                    onClick={() => setSearchInput("")}
                    className="text-gray-400 hover:text-gray-600 shrink-0 text-xs"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0"
                aria-label="Filter by status"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>

            {/* ── MOBILE / TABLET CARDS ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden px-4 py-4">
              {loading ? (
                <div className="text-center py-8 col-span-2">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                    <span className="text-gray-600">Loading orders…</span>
                  </div>
                </div>
              ) : noOrderFound ? (
                <div className="text-center py-8 col-span-2">
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" aria-hidden="true" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
                </div>
              ) : (
                orders.map((order, idx) => renderMobileCard(order, idx))
              )}
            </div>

            {/* Mobile Pagination */}
            <div className="lg:hidden border-t border-gray-200 px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="text-center">
                  <PaginationSummary />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-700">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  >
                    {ROWS_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                <PaginationButtons mobile />
                <div className="text-center text-sm text-gray-600">
                  Page {page} of {totalPages}
                </div>
              </div>
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]" role="table">
                  {/* BUG FIX: min-w-225 is not valid Tailwind; use min-w-[900px] */}
                  <thead className="border-b border-gray-200">
                    <tr>
                      {[
                        { label: "#",          cls: "w-10" },
                        { label: "Student",    cls: "" },
                        { label: "Class",      cls: "" },
                        { label: "Store",      cls: "" },
                        { label: "Items",      cls: "" },
                        { label: "Order Date", cls: "whitespace-nowrap" },
                        { label: null,         cls: "whitespace-nowrap", icon: true },
                        { label: "Status",     cls: "" },
                        { label: "Actions",    cls: "" },
                      ].map((col, i) => (
                        <th
                          key={i}
                          className={`px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 ${col.cls}`}
                          scope="col"
                        >
                          {col.icon ? (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="w-3.5 h-3.5" aria-hidden="true" /> Total
                            </span>
                          ) : col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-normal">
                    {loading ? (
                      <ListLoader colSpanSet={9} />
                    ) : noOrderFound ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center">
                          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" aria-hidden="true" />
                          <h3 className="text-sm font-bold text-gray-700 mb-1">No Orders Found</h3>
                          <p className="text-xs text-gray-400">Try adjusting your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, idx) => renderDesktopRow(order, idx))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Desktop Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <PaginationSummary />
                  <RowsPerPageSelect />
                </div>
                <PaginationButtons />
              </div>
            </div>

          </div>{/* end Main Panel */}

          {/* View Modal */}
          <ViewStudentOrder
            isOpen={!!viewOrder}
            onClose={() => setViewOrder(null)}
            order={viewOrder}
          />

        </div>
      </div>
    </>
  );
}