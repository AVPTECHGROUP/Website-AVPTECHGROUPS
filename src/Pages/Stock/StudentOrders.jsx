import { useState, useEffect, useCallback } from "react";
import {
  ShoppingBag, Search, ChevronDown, Plus, SlidersHorizontal,
  CheckCircle, XCircle as XCircleIcon, Calendar,
  ClipboardList, Eye, Pencil, CheckCheck, Ban, AlertTriangle, Loader2,
} from "lucide-react";
import CardComponent     from "../../Components/CommonComp/CardComponent";
import CardLoader        from "../../Components/CommonComp/CardLoader";
import ListLoader        from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import CreateStudentOrder from "../../Components/Stock/CreateStudentOrder";
import ViewStudentOrder   from "../../Components/Stock/ViewOrder";
import {
  getOrderStats,
  getStudentOrders,
  confirmStudentOrder,
  cancelStudentOrder,
} from "../../Api/StudentOrder";

// ─── Constants ───────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "",          label: "All Status"  },
  { value: "DRAFT",     label: "Draft"       },
  { value: "CONFIRMED", label: "Confirmed"   },
  { value: "CANCELLED", label: "Cancelled"   },
];

const ITEMS_PER_PAGE = 10;

const statusColors = {
  DRAFT:      "bg-gray-100   text-gray-600    border border-gray-300",
  PENDING:    "bg-yellow-100 text-yellow-700  border border-yellow-200",
  CONFIRMED:  "bg-blue-100   text-blue-700    border border-blue-200",
  APPROVED:   "bg-blue-100   text-blue-700    border border-blue-200",
  DISPATCHED: "bg-purple-100 text-purple-700  border border-purple-200",
  DELIVERED:  "bg-green-100  text-green-700   border border-green-200",
  CANCELLED:  "bg-red-100    text-red-600     border border-red-200",
};

// ─── Toast ───────────────────────────────────────────────────────
let _setToasts = null;
export const toast = {
  success: (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "success", msg }]),
  error:   (msg) => _setToasts?.((p) => [...p, { id: Date.now(), type: "error",   msg }]),
};
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;
  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => remove(toasts[toasts.length - 1].id), 3500);
    return () => clearTimeout(t);
  }, [toasts]);
  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-[220px] max-w-xs bg-white border
            ${t.type === "success" ? "border-green-200 text-green-800" : "border-red-200 text-red-700"}`}
        >
          {t.type === "success"
            ? <CheckCircle  className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircleIcon  className="w-4 h-4 text-red-500   shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 text-xs ml-1">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Cancel Confirmation Modal ────────────────────────────────────
function CancelConfirmModal({ order, onConfirm, onClose, loading }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4 ccm-anim">
        <style>{`
          @keyframes ccmIn { from{opacity:0;transform:scale(.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
          .ccm-anim { animation: ccmIn .18s ease-out forwards; }
        `}</style>

        {/* Icon + heading */}
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Cancel Order?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-gray-700">
                Order #{order.id}
              </span>{" "}
              for <span className="font-semibold text-gray-700">
                {order.studentName || order.student?.name || "this student"}
              </span>?
              <br />
              <span className="text-red-500 text-xs mt-1 block">This action cannot be undone.</span>
            </p>
          </div>
        </div>

        {/* Buttons */}
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
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
              : <><Ban className="w-4 h-4" /> Yes, Cancel</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Build ActionDropDown options per order status ────────────────
function buildActionOptions(status) {
  const s = (status || "").toUpperCase();

  if (s === "DRAFT") {
    return [
      { value: "view",    label: "View",    icon: Eye,       text: "text-blue-600",  bg: "bg-blue-50",  hover: "hover:bg-blue-100"  },
      { value: "confirm", label: "Confirm", icon: CheckCheck, text: "text-green-700", bg: "bg-green-50", hover: "hover:bg-green-100" },
      { value: "cancel",  label: "Cancel",  icon: Ban,        text: "text-red-500",   bg: "bg-red-50",   hover: "hover:bg-red-100"   },
    ];
  }
  if (s === "CANCELLED") {
    return [
      { value: "view", label: "View", icon: Eye, text: "text-gray-600", bg: "bg-gray-50", hover: "hover:bg-gray-100" },
    ];
  }
  // CONFIRMED / DELIVERED / DISPATCHED / etc.
  return [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];
}

// ─── Main ─────────────────────────────────────────────────────────
export default function StudentOrders() {
  const [orders,       setOrders]       = useState([]);
  const [pagination,   setPagination]   = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page,         setPage]         = useState(0);

  const [stats, setStats] = useState({ draftOrders: 0, confirmedOrders: 0, cancelledOrders: 0 });

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [fromDate,     setFromDate]     = useState("");
  const [toDate,       setToDate]       = useState("");

  // Modals
  const [showCreate,   setShowCreate]   = useState(false);
  const [viewOrder,    setViewOrder]    = useState(null);
  const [editOrder,    setEditOrder]    = useState(null);

  // Cancel modal state
  const [cancelTarget,  setCancelTarget]  = useState(null);   // order to cancel
  const [cancelling,    setCancelling]    = useState(false);

  // Per-row confirm loading (keyed by order.id)
  const [confirmingIds, setConfirmingIds] = useState(new Set());

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { setPage(0); }, [statusFilter, fromDate, toDate]);

  // ── Fetch stats ──
  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    getOrderStats()
      .then((data) => {
        const s = data?.data || data || {};
        setStats({
          draftOrders:     s.draftOrders     ?? s.draft     ?? 0,
          confirmedOrders: s.confirmedOrders ?? s.confirmed ?? 0,
          cancelledOrders: s.cancelledOrders ?? s.cancelled ?? 0,
        });
      })
      .catch((e) => console.error("getOrderStats:", e))
      .finally(() => setStatsLoading(false));
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  // ── Fetch orders ──
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getStudentOrders({
        page, size: ITEMS_PER_PAGE,
        searchTerm: search, status: statusFilter,
        fromDate: fromDate || undefined, toDate: toDate || undefined,
      });
      setOrders(res.orders || []);
      setPagination(res.pagination || null);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load student orders.");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, fromDate, toDate]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalItems = pagination?.totalElements ?? orders.length;
  const totalPages = pagination?.totalPages    ?? Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const pageNumbers = () => {
    const pages = [];
    for (let i = Math.max(0, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    return pages;
  };

  // ── After order created / saved ──
  const handleOrderSaved = (status) => {
    setShowCreate(false);
    toast.success(status === "DRAFT" ? "Order saved as draft." : "Order confirmed & stock issued.");
    fetchOrders(); fetchStats();
  };

  // ── Confirm a DRAFT order ──
  const handleConfirmOrder = async (order) => {
    setConfirmingIds((prev) => new Set(prev).add(order.id));
    try {
      await confirmStudentOrder(order.id);
      toast.success(`Order #${order.id} confirmed & stock issued.`);
      fetchOrders(); fetchStats();
    } catch (e) {
      toast.error(`Failed to confirm: ${e.message}`);
    } finally {
      setConfirmingIds((prev) => { const s = new Set(prev); s.delete(order.id); return s; });
    }
  };

  // ── Cancel an order — open modal first ──
  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelStudentOrder(cancelTarget.id, "Cancelled by admin");
      toast.success(`Order #${cancelTarget.id} cancelled.`);
      setCancelTarget(null);
      fetchOrders(); fetchStats();
    } catch (e) {
      toast.error(`Failed to cancel: ${e.message}`);
    } finally {
      setCancelling(false);
    }
  };

  // ── ActionDropDown dispatcher ──
  const handleAction = (actionVal, order) => {
    if (actionVal === "view")    setViewOrder(order);
    if (actionVal === "confirm") handleConfirmOrder(order);
    if (actionVal === "cancel")  setCancelTarget(order);
  };

  // ─── Stat cards ───────────────────────────────────────────────
  const statCards = [
    { key: "draft",     label: "Draft Orders",    val: stats.draftOrders,     iconTxColor: "text-orange-500", iconBgColor: "bg-orange-100", Icon: ClipboardList },
    { key: "confirmed", label: "Confirmed Orders", val: stats.confirmedOrders, iconTxColor: "text-green-600",  iconBgColor: "bg-green-100",  Icon: CheckCircle   },
    { key: "cancelled", label: "Cancelled Orders", val: stats.cancelledOrders, iconTxColor: "text-red-500",    iconBgColor: "bg-red-100",    Icon: XCircleIcon   },
  ];

  return (
    <>
      <ToastContainer />

      {/* ── Cancel Confirmation Modal ── */}
      <CancelConfirmModal
        order={cancelTarget}
        onClose={() => { if (!cancelling) setCancelTarget(null); }}
        onConfirm={handleCancelOrder}
        loading={cancelling}
      />

      <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

        {/* ── Page Header ── */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Student Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage stock orders for students — track from draft through confirmed.
          </p>
        </div>

        {/* ── Stat Cards + New Order card ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {statsLoading
            ? Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)
            : statCards.map((card) => (
              <CardComponent
                key={card.key}
                IconName={card.Icon}
                keyName={card.label}
                val={card.val}
                iconTxColor={card.iconTxColor}
                iconBgColor={card.iconBgColor}
              />
            ))
          }
          {/* New Order action card */}
          <button
            onClick={() => setShowCreate(true)}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-4 hover:shadow-md hover:border-blue-300 transition-all group text-left"
          >
            <div className="w-11 h-11 rounded-xl bg-blue-100 flex items-center justify-center shrink-0 group-hover:bg-blue-200 transition-colors">
              <Plus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-base font-bold text-blue-600">New Order</p>
              <p className="text-xs text-gray-500 leading-tight mt-0.5">Create student order</p>
              <p className="text-xs text-blue-400 mt-0.5">opens New Order wizard</p>
            </div>
          </button>
        </div>

        {/* ── Table Card ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Toolbar */}
          <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800 text-lg">Student Orders</h2>
              <span className="text-xs text-gray-400 font-normal ml-1">
                {totalItems} record{totalItems !== 1 ? "s" : ""}
              </span>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit"
            >
              <Plus className="w-4 h-4" /> New Order
            </button>
          </div>

          {/* Filters */}
          <div className="px-5 py-4 border-b border-gray-100 space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by student name or order ID…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 transition"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none w-full sm:min-w-[150px] pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                >
                  {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-center">
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs font-semibold text-gray-500 shrink-0">From</span>
                <input
                  type="date" value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="text-xs font-semibold text-gray-500 shrink-0">To</span>
                <input
                  type="date" value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
              </div>
              {(fromDate || toDate) && (
                <button
                  onClick={() => { setFromDate(""); setToDate(""); }}
                  className="text-xs text-red-500 hover:text-red-700 font-semibold shrink-0"
                >
                  Clear dates
                </button>
              )}
            </div>
          </div>

          {/* ── Desktop Table ── */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 text-left">#</th>
                  <th className="px-5 py-3 text-left">Student</th>
                  <th className="px-5 py-3 text-left">Class</th>
                  <th className="px-5 py-3 text-left">Store</th>
                  <th className="px-5 py-3 text-left">Items</th>
                  <th className="px-5 py-3 text-left">Order Date</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <ListLoader rows={6} avatar={true} />
                ) : orders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center">
                      <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">No orders found.</p>
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => {
                    const sc          = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                    const studentName = order.studentName || order.student?.name || order.student?.fullName || "—";
                    const admNumber   = order.admissionNumber || order.student?.admissionNumber || "—";
                    const orderClass  = order.className || order.class || order.student?.className || "—";
                    const storeName   = order.storeName || order.store?.storeName || order.store?.name || "—";
                    const items       = order.items || order.orderItems || [];
                    const orderDate   = order.orderDate || order.createdAt || order.date;
                    const isConfirming = confirmingIds.has(order.id);

                    // Build action options — disable confirm option while API is running
                    const rawOptions = buildActionOptions(order.status);
                    const actionOptions = rawOptions.map((opt) =>
                      opt.value === "confirm" && isConfirming
                        ? { ...opt, label: "Confirming…", disabled: true }
                        : opt
                    );

                    return (
                      <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="px-5 py-4 text-xs text-gray-400 font-medium">
                          {page * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-sm font-bold text-gray-800">{studentName}</p>
                          <p className="text-xs text-gray-400">{admNumber}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{orderClass}</td>
                        <td className="px-5 py-4 text-sm text-gray-600">{storeName}</td>
                        <td className="px-5 py-4">
                          {items.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {items.slice(0, 2).map((it, i) => (
                                <span
                                  key={i}
                                  className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap"
                                >
                                  {it.itemName || it.name} ×{it.quantity || it.qty}
                                </span>
                              ))}
                              {items.length > 2 && (
                                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                  +{items.length - 2} more
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{fmtDate(orderDate)}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${sc}`}>
                            {order.status || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <ActionDropDownComp
                            actionOptions={actionOptions}
                            onAction={(val) => handleAction(val, order)}
                          />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* ── Mobile Cards ── */}
          <div className="sm:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="px-4 py-4 space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
              </div>
            ) : orders.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-10">No orders found.</p>
            ) : (
              orders.map((order) => {
                const sc          = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                const studentName = order.studentName || order.student?.name || "—";
                const orderClass  = order.className || order.student?.className || "—";
                const storeName   = order.storeName || order.store?.storeName || "—";
                const items       = order.items || order.orderItems || [];
                const isConfirming = confirmingIds.has(order.id);
                const rawOptions  = buildActionOptions(order.status);
                const actionOptions = rawOptions.map((opt) =>
                  opt.value === "confirm" && isConfirming
                    ? { ...opt, label: "Confirming…", disabled: true }
                    : opt
                );
                return (
                  <div key={order.id} className="px-4 py-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-gray-800 text-sm">{studentName}</p>
                        <p className="text-xs text-gray-400">
                          {orderClass} · {fmtDate(order.orderDate || order.createdAt)}
                        </p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold shrink-0 ${sc}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{storeName} · {items.length} items</p>
                    <div className="pt-1">
                      <ActionDropDownComp
                        actionOptions={actionOptions}
                        onAction={(val) => handleAction(val, order)}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ── Pagination ── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
            <p className="text-sm text-gray-400">
              Showing {totalItems === 0 ? 0 : page * ITEMS_PER_PAGE + 1}–
              {Math.min((page + 1) * ITEMS_PER_PAGE, totalItems)} of {totalItems} orders
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>
              {pageNumbers().map((n) => (
                <button
                  key={n} onClick={() => setPage(n)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition
                    ${page === n ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"}`}
                >
                  {n + 1}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* ── Modals ── */}
        <CreateStudentOrder
          isOpen={showCreate}
          onClose={() => setShowCreate(false)}
          onSaved={handleOrderSaved}
        />
        <ViewStudentOrder
          isOpen={!!viewOrder}
          onClose={() => setViewOrder(null)}
          order={viewOrder}
        />
        {editOrder && (
          <CreateStudentOrder
            isOpen={!!editOrder}
            onClose={() => setEditOrder(null)}
            onSaved={() => { setEditOrder(null); fetchOrders(); fetchStats(); }}
          />
        )}
      </div>
    </>
  );
}