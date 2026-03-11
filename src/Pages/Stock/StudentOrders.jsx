import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Plus, 
  CheckCircle, XCircle as XCircleIcon,
  ClipboardList, Eye, Pencil, Ban, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, SearchIcon,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import ViewStudentOrder from "../../Components/Stock/ViewOrder";
import { getOrderStats, getStudentOrders, cancelStudentOrder } from "../../Api/StudentOrder";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

const statusColors = {
  DRAFT:      "bg-gray-100   text-gray-600   border border-gray-300",
  PENDING:    "bg-yellow-100 text-yellow-700  border border-yellow-200",
  CONFIRMED:  "bg-blue-100   text-blue-700    border border-blue-200",
  APPROVED:   "bg-blue-100   text-blue-700    border border-blue-200",
  DISPATCHED: "bg-purple-100 text-purple-700  border border-purple-200",
  DELIVERED:  "bg-green-100  text-green-700   border border-green-200",
  CANCELLED:  "bg-red-100    text-red-600     border border-red-200",
};

// ── Toast ─────────────────────────────────────────────────────────
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
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-55 max-w-xs bg-white border
          ${t.type === "success" ? "border-green-200 text-green-800" : "border-red-200 text-red-700"}`}>
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

// ── Cancel Confirm Modal ──────────────────────────────────────────
function CancelConfirmModal({ order, onConfirm, onClose, loading }) {
  if (!order) return null;
  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4 ccm-anim">
        <style>{`
          @keyframes ccmIn { from{opacity:0;transform:scale(.94) translateY(8px)} to{opacity:1;transform:scale(1) translateY(0)} }
          .ccm-anim { animation: ccmIn .18s ease-out forwards; }
        `}</style>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Cancel Order?</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-gray-700">Order #{order.id}</span>{" "}
              for{" "}
              <span className="font-semibold text-gray-700">
                {order.studentName || order.student?.name || "this student"}
              </span>?
              <span className="text-red-500 text-xs mt-1 block">This action cannot be undone.</span>
            </p>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-2">
          <button onClick={onClose} disabled={loading}
            className="px-5 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50">
            Keep Order
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Cancelling…</>
              : <><Ban className="w-4 h-4" /> Yes, Cancel</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function buildActionOptions(status) {
  const s = (status || "").toUpperCase();
  if (s === "DRAFT") {
    return [
      { value: "edit",   label: "Edit",   icon: Pencil,     text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
      { value: "view",   label: "View",   icon: Eye,        text: "text-gray-600", bg: "bg-gray-50", hover: "hover:bg-gray-100" },
      { value: "cancel", label: "Cancel", icon: Ban,        text: "text-red-500",  bg: "bg-red-50",  hover: "hover:bg-red-100"  },
    ];
  }
  return [
    { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];
}

// ── Main Component ────────────────────────────────────────────────
export default function StudentOrders() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const [orders,      setOrders]      = useState([]);
  const [pagination,  setPagination]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [statsLoading,setStatsLoading]= useState(true);
  const [page,        setPage]        = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [stats, setStats] = useState({ draftOrders: 0, confirmedOrders: 0, cancelledOrders: 0 });

  const [searchInput,  setSearchInput]  = useState("");
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [noOrderFound, setNoOrderFound] = useState(false);

  // Modals
  const [viewOrder,    setViewOrder]    = useState(null);

  // Cancel
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling,   setCancelling]   = useState(false);

  const resetPage = () => setPage(1);

  // ── Handle return from Create/Edit page ──────────────────────
  useEffect(() => {
    if (location.state?.saved) {
      const status = location.state.saved;
      toast.success(
        status === "DRAFT"
          ? "Order saved as draft."
          : "Order confirmed & stock issued."
      );
      // Clear the state so toast doesn't re-fire on refresh
      window.history.replaceState({}, document.title);
      fetchOrders();
      fetchStats();
    }
  }, []); // eslint-disable-line

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); resetPage(); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { resetPage(); }, [statusFilter]);

  // Fetch stats
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

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setNoOrderFound(false);
    try {
      const res = await getStudentOrders({
        page: page - 1,
        size: rowsPerPage,
        searchTerm: search,
        status: statusFilter,
      });
      const list = res.orders || [];
      setOrders(list);
      setPagination(res.pagination || null);
      setNoOrderFound(list.length === 0);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load student orders.");
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter]);
  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalItems = pagination?.totalElements ?? orders.length;
  const totalPages = pagination?.totalPages    ?? Math.max(1, Math.ceil(totalItems / rowsPerPage));

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
    } finally { setCancelling(false); }
  };

  const handleAction = (val, order) => {
    if (val === "view")   setViewOrder(order);
    if (val === "edit")   navigate(`/stock/studentOrders/editOrder?editId=${order.id}`);
    if (val === "cancel") setCancelTarget(order);
  };

  const statCards = [
    { key: "draft",     label: "Draft Orders",    val: stats.draftOrders,     iconTxColor: "text-orange-500", iconBgColor: "bg-orange-100", Icon: ClipboardList },
    { key: "confirmed", label: "Confirmed Orders", val: stats.confirmedOrders, iconTxColor: "text-green-600",  iconBgColor: "bg-green-100",  Icon: CheckCircle   },
    { key: "cancelled", label: "Cancelled Orders", val: stats.cancelledOrders, iconTxColor: "text-red-500",    iconBgColor: "bg-red-100",    Icon: XCircleIcon   },
  ];

  const tdStyle = "px-2 py-2 text-left text-gray-700 text-sm";

  return (
    <>
      <ToastContainer />
      <CancelConfirmModal
        order={cancelTarget}
        onClose={() => { if (!cancelling) setCancelTarget(null); }}
        onConfirm={handleCancelOrder}
        loading={cancelling}
      />

      <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
        <div className="p-2 sm:p-5 lg:p-4">

          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Student Orders</h2>
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
                <ShoppingBag className="w-5 h-5 text-blue-500 shrink-0" />
                <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">Student Orders</h2>
              </div>
              {/* ── Navigate to full-page create ── */}
              <button
                onClick={() => navigate("/stock/studentOrders/addOrder")}
                className="flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                New Order
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
              <div className="flex flex-1 min-w-45 items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text"
                  placeholder="Search by student name or order ID…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">No Orders Found</h3>
                  <p className="text-gray-500 text-sm">Try adjusting your filters.</p>
                </div>
              ) : (
                orders.map((order, idx) => {
                  const sc          = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                  const studentName = order.studentName || order.student?.name || "—";
                  const orderClass  = order.className   || order.student?.className || "—";
                  const storeName   = order.storeName   || order.store?.storeName   || "—";
                  const items       = order.items       || order.orderItems         || [];
                  return (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div className="flex items-start gap-2 min-w-0">
                          <span className="text-xs text-gray-400 mt-0.5 shrink-0">{(page - 1) * rowsPerPage + idx + 1}.</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 text-sm truncate">{studentName}</p>
                            <p className="text-xs text-gray-400 truncate">
                              {order.admissionNumber || order.student?.admissionNumber || "—"}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${sc}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p><span className="font-medium text-gray-500">Class:</span><span className="ml-2 text-gray-700">{orderClass}</span></p>
                        <p><span className="font-medium text-gray-500">Store:</span><span className="ml-2 text-gray-700">{storeName}</span></p>
                        <p><span className="font-medium text-gray-500">Date:</span><span className="ml-2 text-gray-700">{fmtDate(order.orderDate || order.createdAt)}</span></p>
                        <p><span className="font-medium text-gray-500">Items:</span><span className="ml-2 text-gray-700">{items.length}</span></p>
                        <div className="flex justify-start items-center pt-1">
                          <ActionDropDownComp
                            actionOptions={buildActionOptions(order.status)}
                            onAction={(val) => handleAction(val, order)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── DESKTOP TABLE ── */}
            <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 w-10">#</th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Student</th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Class</th>
                      <th className="px-2 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Store</th>
                      <th className="px-2 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Items</th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 whitespace-nowrap">Order Date</th>
                      <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Status</th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-normal">
                    {loading ? (
                      <ListLoader colSpanSet={8} />
                    ) : noOrderFound ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-10 text-center">
                          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <h3 className="text-sm font-bold text-gray-700 mb-1">No Orders Found</h3>
                          <p className="text-xs text-gray-400">Try adjusting your filters.</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, idx) => {
                        const sc          = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                        const studentName = order.studentName || order.student?.name || order.student?.fullName || "—";
                        const admNumber   = order.admissionNumber || order.student?.admissionNumber || "—";
                        const orderClass  = order.className  || order.class || order.student?.className || "—";
                        const storeName   = order.storeName  || order.store?.storeName || order.store?.name || "—";
                        const items       = order.items      || order.orderItems || [];
                        const orderDate   = order.orderDate  || order.createdAt || order.date;
                        return (
                          <tr key={order.id} className="hover:bg-blue-50/40 transition-colors">
                            <td className={tdStyle}>{(page - 1) * rowsPerPage + idx + 1}</td>
                            <td className={tdStyle}>
                              <p className="font-medium text-black whitespace-nowrap">{studentName}</p>
                              <p className="text-xs text-gray-400">{admNumber}</p>
                            </td>
                            <td className={tdStyle}>
                              <span className="text-gray-600 whitespace-nowrap">{orderClass}</span>
                            </td>
                            <td className={tdStyle}>
                              <span className="text-gray-600 whitespace-nowrap">{storeName}</span>
                            </td>
                            <td className={tdStyle}>
                              {items.length > 0 ? (
                                <div className="flex flex-wrap flex-col items-center gap-1">
                                  {items.slice(0, 2).map((it, i) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
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
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                            </td>
                            <td className={tdStyle}>
                              <span className="text-gray-600 whitespace-nowrap">{fmtDate(orderDate)}</span>
                            </td>
                            <td className={tdStyle}>
                              <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${sc}`}>
                                {order.status || "—"}
                              </span>
                            </td>
                            <td className={tdStyle}>
                              <ActionDropDownComp
                                actionOptions={buildActionOptions(order.status)}
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

              {/* Desktop Pagination */}
              <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <span className="text-sm text-gray-700">
                    {totalItems === 0
                      ? "No orders"
                      : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">Rows per page:</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setPage(idx + 1)}
                      className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Pagination */}
            <div className="lg:hidden border-t border-gray-200 px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="text-center text-sm text-gray-700">
                  {totalItems === 0
                    ? "No orders"
                    : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-700">Rows:</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    {totalPages <= 5 ? (
                      [...Array(totalPages)].map((_, idx) => (
                        <button key={idx + 1} onClick={() => setPage(idx + 1)}
                          className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                          {idx + 1}
                        </button>
                      ))
                    ) : (
                      <>
                        <button onClick={() => setPage(1)} className={`px-3 py-1 rounded transition-all ${page === 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>1</button>
                        {page > 3 && <span className="px-2 text-gray-400">...</span>}
                        {page > 2 && page < totalPages - 1 && (
                          <button onClick={() => setPage(page)} className="px-3 py-1 rounded bg-blue-500 text-white">{page}</button>
                        )}
                        {page < totalPages - 2 && <span className="px-2 text-gray-400">...</span>}
                        <button onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded transition-all ${page === totalPages ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{totalPages}</button>
                      </>
                    )}
                  </div>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600">Page {page} of {totalPages}</div>
              </div>
            </div>

          </div>

          {/* View Modal (kept as popup — view only, no need for full page) */}
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