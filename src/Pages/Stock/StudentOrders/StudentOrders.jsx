import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  CheckCircle, XCircle as XCircleIcon,
  ClipboardList, Eye, Pencil, Ban, AlertTriangle, Loader2,
  ChevronLeft, ChevronRight, SearchIcon, IndianRupee,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import ViewStudentOrder from "./ViewOrder";
import { useDecodedUser } from "../../../ContextAPI/UserContext";
import { getOrderStats, getStudentOrders, cancelStudentOrder } from "../../../Api/Stock/StudentOrder";
import { getClasses } from "../../../Api/Teachers/TeachersAPI";

import { toast } from "react-toastify";
import { STOCK_SHARED_CONSTS, STUDENT_ORDERS_CONSTS } from "../../../Constants/StringConstants/StockAndOrdersConstants";

const STATUS_OPTIONS = [
  { value: "", label: STUDENT_ORDERS_CONSTS.TEXT.ALL_STATUS },
  { value: STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API, label: STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_LABEL },
  { value: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API, label: STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_LABEL },
  { value: STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_API, label: STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_LABEL },
];

const statusColors = {
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API]: "bg-gray-100   text-gray-600   border border-gray-300",
  PENDING: "bg-yellow-100 text-yellow-700  border border-yellow-200",
  [STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API]: "bg-blue-100   text-blue-700    border border-blue-200",
  APPROVED: "bg-blue-100   text-blue-700    border border-blue-200",
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DISPATCHED_API]: "bg-purple-100 text-purple-700  border border-purple-200",
  [STOCK_SHARED_CONSTS.ORDER_STATUS.DELIVERED_API]: "bg-green-100  text-green-700   border border-green-200",
  [STOCK_SHARED_CONSTS.ORDER_STATUS.CANCELLED_API]: "bg-red-100    text-red-600     border border-red-200",
};

const CANCEL_CONFIRMED_ROLES = [
  STUDENT_ORDERS_CONSTS.ROLES.SUPER_ADMIN,
  STUDENT_ORDERS_CONSTS.ROLES.GLOBAL_ADMIN,
  STUDENT_ORDERS_CONSTS.ROLES.STORE_ACCOUNTANT
];

function CancelConfirmModal({ order, onConfirm, onClose, loading }) {
  const [confirmInput, setConfirmInput] = useState("");

  if (!order) return null;

  const isConfirmed = order.status === STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API;
  const isMatch = confirmInput === String(order.id);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm z-10 p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>

          <div>
            <h3 className="text-base font-bold text-gray-800">{STUDENT_ORDERS_CONSTS.CANCEL_MODAL.TITLE}</h3>
            <p className="text-sm text-gray-500 mt-1">
              Are you sure you want to cancel{" "}
              <span className="font-semibold text-gray-700">
                Order #{order.id}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-gray-700">
                {order.studentName || STUDENT_ORDERS_CONSTS.TEXT.THIS_STUDENT}
              </span>?
            </p>

            {isConfirmed && (
              <p className="text-xs text-red-500 mt-2">
                ⚠ Type order number to confirm cancellation
              </p>
            )}
          </div>
        </div>

        {isConfirmed && (
          <input
            type="text"
            placeholder={STUDENT_ORDERS_CONSTS.TEXT.TYPE_ORDER_ID_PLACEHOLDER}
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
          />
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border rounded-lg text-gray-600 cursor-pointer"
          >
            {STUDENT_ORDERS_CONSTS.CANCEL_MODAL.KEEP_ORDER}
          </button>

          <button
            onClick={() => onConfirm()}
            disabled={loading || (isConfirmed && !isMatch)}
            className="px-4 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? STUDENT_ORDERS_CONSTS.CANCEL_MODAL.CANCELLING : STUDENT_ORDERS_CONSTS.CANCEL_MODAL.CONFIRM_BTN}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────
function fmtDate(d) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(STOCK_SHARED_CONSTS.LOCALE.DATE_IN, { day: "2-digit", month: "short", year: "numeric" });
}

// ── Smart Pagination Helper ───────────────────────────────────────
function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages = [];
  pages.push(1);
  if (currentPage > 3) pages.push("...");
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (currentPage < totalPages - 2) pages.push("...");
  pages.push(totalPages);
  return pages;
}

function buildActionOptions(status, userRole) {
  const s = (status || "").toUpperCase();
  const normalize = (v) => (v || "").toLowerCase().replace(/[\s_]/g, "");
  const normalizedUserRole = normalize(userRole);
  const normalizedAllowed = CANCEL_CONFIRMED_ROLES.map(normalize);
  const canCancelConfirmed = normalizedAllowed.includes(normalizedUserRole);

  if (s === STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API) {
    return [
      { value: "edit", label: STOCK_SHARED_CONSTS.COMMON.EDIT, icon: Pencil, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
      { value: "view", label: STOCK_SHARED_CONSTS.COMMON.VIEW, icon: Eye, text: "text-gray-600", bg: "bg-gray-50", hover: "hover:bg-gray-100" },
      { value: "cancel", label: STOCK_SHARED_CONSTS.COMMON.CANCEL, icon: Ban, text: "text-red-500", bg: "bg-red-50", hover: "hover:bg-red-100" },
    ];
  }

  if (s === STOCK_SHARED_CONSTS.ORDER_STATUS.CONFIRMED_API) {
    return [
      { value: "view", label: STOCK_SHARED_CONSTS.COMMON.VIEW, icon: Eye, text: "text-gray-600", bg: "bg-gray-50", hover: "hover:bg-gray-100" },
      ...(canCancelConfirmed ? [{ value: "cancel", label: STOCK_SHARED_CONSTS.COMMON.CANCEL, icon: Ban, text: "text-red-500", bg: "bg-red-50", hover: "hover:bg-red-100" }] : []),
    ];
  }

  return [
    { value: "view", label: STOCK_SHARED_CONSTS.COMMON.VIEW, icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
  ];
}

// ── Shared Page Buttons ───────────────────────────────────────────
function PageButtons({ page, totalPages, onPageChange }) {
  return (
    <>
      {getPageNumbers(page, totalPages).map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 py-1 text-gray-400 select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`px-3 py-1 rounded transition-all cursor-pointer ${page === p ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
          >
            {p}
          </button>
        )
      )}
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────
export default function StudentOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useDecodedUser();

  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const [stats, setStats] = useState({ draftOrders: 0, confirmedOrders: 0, cancelledOrders: 0 });
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [classes, setClasses] = useState([]);
  const [classesFilter, setClassesFilter] = useState("");
  const [classesLoading, setClassesLoading] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [noOrderFound, setNoOrderFound] = useState(false);

  const [viewOrder, setViewOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const resetPage = () => setPage(1);

  useEffect(() => {
    if (location.state?.saved) {
      const status = location.state.saved;
      toast.success(status === STOCK_SHARED_CONSTS.ORDER_STATUS.DRAFT_API ? STUDENT_ORDERS_CONSTS.MESSAGES.SAVED_AS_DRAFT : STUDENT_ORDERS_CONSTS.MESSAGES.CONFIRMED_STOCK_ISSUED);
      window.history.replaceState({}, document.title);
      fetchOrders();
      fetchStats();
    }
  }, []); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); resetPage(); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => { resetPage(); }, [statusFilter, classesFilter]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setClassesLoading(true);
        const res = await getClasses();
        setClasses(res || []);
      } catch (err) {
        console.error(STUDENT_ORDERS_CONSTS.MESSAGES.LOAD_CLASSES_FAILED, err);
      } finally {
        setClassesLoading(false);
      }
    };
    fetchClasses();
  }, []);

  const fetchStats = useCallback(() => {
    setStatsLoading(true);
    getOrderStats()
      .then((data) => {
        const s = data?.data || data || {};
        setStats({
          draftOrders: s.draftOrders ?? s.draft ?? 0,
          confirmedOrders: s.confirmedOrders ?? s.confirmed ?? 0,
          cancelledOrders: s.cancelledOrders ?? s.cancelled ?? 0,
        });
      })
      .catch((e) => console.error("getOrderStats:", e))
      .finally(() => setStatsLoading(false));
  }, []);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setNoOrderFound(false);
    try {
      const res = await getStudentOrders({
        page: page - 1,
        size: rowsPerPage,
        searchTerm: search,
        status: statusFilter,
        classId: classesFilter || undefined,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sort: STUDENT_ORDERS_CONSTS.SORT.DEFAULT,
      });
      const list = res.orders || [];
      setOrders(list);
      setPagination(res.pagination || null);
      setNoOrderFound(list.length === 0);
    } catch (e) {
      console.error(e);
      toast.error(STUDENT_ORDERS_CONSTS.MESSAGES.LOAD_ORDERS_FAILED);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search, statusFilter, classesFilter, fromDate, toDate]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const totalItems = pagination?.totalElements ?? orders.length;
  const totalPages = pagination?.totalPages ?? Math.max(1, Math.ceil(totalItems / rowsPerPage));

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    setCancelling(true);
    try {
      await cancelStudentOrder(cancelTarget.id, STUDENT_ORDERS_CONSTS.CANCEL_MODAL.DEFAULT_REASON);
      toast.success(STUDENT_ORDERS_CONSTS.MESSAGES.ORDER_CANCELLED(cancelTarget.id));
      setCancelTarget(null);
      fetchOrders();
      fetchStats();
    } catch (e) {
      toast.error(STUDENT_ORDERS_CONSTS.MESSAGES.CANCEL_FAILED(e.message));
    } finally {
      setCancelling(false);
    }
  };

  const handleAction = (val, order) => {
    if (val === "view") setViewOrder(order);
    if (val === "edit") navigate(STUDENT_ORDERS_CONSTS.ROUTES.EDIT_ORDER(order.id));
    if (val === "cancel") setCancelTarget(order);
  };

  const statCards = [
    { key: "draft", label: STUDENT_ORDERS_CONSTS.STATS.DRAFT_ORDERS, val: stats.draftOrders, iconTxColor: "text-orange-500", iconBgColor: "bg-orange-100", Icon: ClipboardList },
    { key: "confirmed", label: STUDENT_ORDERS_CONSTS.STATS.CONFIRMED_ORDERS, val: stats.confirmedOrders, iconTxColor: "text-green-600", iconBgColor: "bg-green-100", Icon: CheckCircle },
    { key: "cancelled", label: STUDENT_ORDERS_CONSTS.STATS.CANCELLED_ORDERS, val: stats.cancelledOrders, iconTxColor: "text-red-500", iconBgColor: "bg-red-100", Icon: XCircleIcon },
  ];

  const tdStyle = "px-2 py-2 text-left text-gray-700 text-sm";

  return (
    <>
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
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">{STUDENT_ORDERS_CONSTS.TEXT.TITLE}</h2>
              <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                {STUDENT_ORDERS_CONSTS.TEXT.SUBTITLE}
              </p>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-5">
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
                <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">{STUDENT_ORDERS_CONSTS.TEXT.TITLE}</h2>
              </div>
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
                  placeholder={STUDENT_ORDERS_CONSTS.TEXT.SEARCH_ORDER_PH}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0 cursor-pointer"
              >
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select
                value={classesFilter}
                onChange={(e) => {
                  setClassesFilter(e.target.value);
                  resetPage();
                }}
                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0 cursor-pointer">
                <option value="">
                  {classesLoading ? STUDENT_ORDERS_CONSTS.TEXT.LOADING_ELLIPSIS : STUDENT_ORDERS_CONSTS.TEXT.ALL_CLASSES}
                </option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">{STUDENT_ORDERS_CONSTS.TEXT.FROM}</label>
                  <input
                    type="date"
                    value={fromDate}
                    max={toDate || undefined}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  />
                </div>

                <div className="flex flex-col">
                  <label className="text-xs text-gray-500 mb-1">{STUDENT_ORDERS_CONSTS.TEXT.TO}</label>
                  <input
                    type="date"
                    value={toDate}
                    min={fromDate || undefined}
                    onChange={(e) => {
                      setToDate(e.target.value);
                      setPage(1);
                    }}
                    className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* ── MOBILE / TABLET / LAPTOP CARDS (below 1280px) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden px-4 py-4">
              {loading ? (
                <div className="text-center py-8 col-span-2">
                  <div className="flex flex-col items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                    <span className="text-gray-600">{STUDENT_ORDERS_CONSTS.TEXT.LOADING}</span>
                  </div>
                </div>
              ) : noOrderFound ? (
                <div className="text-center py-8 col-span-2">
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{STUDENT_ORDERS_CONSTS.TEXT.EMPTY_TITLE}</h3>
                  <p className="text-gray-500 text-sm">{STUDENT_ORDERS_CONSTS.TEXT.EMPTY_SUB}</p>
                </div>
              ) : (
                orders.map((order, idx) => {
                  const sc = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                  const studentName = order.studentName || order.student?.name || "—";
                  const orderClass = order.className || order.student?.className || "—";
                  const storeName = order.storeName || order.store?.storeName || "—";
                  const itemsList = order.items || order.orderItems || [];
                  const totalAmt = order.totalAmount;
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
                        <p><span className="font-medium text-gray-500">{STUDENT_ORDERS_CONSTS.TEXT.CLASS_LABEL}</span><span className="ml-2 text-gray-700">{orderClass}</span></p>
                        <p><span className="font-medium text-gray-500">{STUDENT_ORDERS_CONSTS.TEXT.STORE_LABEL}</span><span className="ml-2 text-gray-700">{storeName}</span></p>
                        <p><span className="font-medium text-gray-500">{STUDENT_ORDERS_CONSTS.TEXT.DATE_LABEL}</span><span className="ml-2 text-gray-700">{fmtDate(order.orderDate || order.createdAt)}</span></p>
                        <p><span className="font-medium text-gray-500">{STUDENT_ORDERS_CONSTS.TEXT.ITEMS_LABEL}</span><span className="ml-2 text-gray-700">{itemsList.length}</span></p>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5 text-green-600 shrink-0" />
                          <span className="font-bold text-green-700 text-sm">{STUDENT_ORDERS_CONSTS.CURRENCY.AMOUNT(totalAmt)}</span>
                        </div>
                        <div className="flex justify-start items-center pt-1">
                          <ActionDropDownComp
                            actionOptions={buildActionOptions(order.status, user?.userType)}
                            onAction={(val) => handleAction(val, order)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* ── WIDESCREEN DESKTOP TABLE (1280px and above) ── */}
            <div className="hidden xl:block bg-white rounded-xl border border-gray-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-225">
                  <thead className="border-b border-gray-200">
                    <tr>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 w-10">#</th>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.STUDENT}</th>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.CLASS}</th>
                      <th className="px-2 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.STORE}</th>
                      <th className="px-2 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.ITEMS}</th>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 whitespace-nowrap">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.ORDER_DATE}</th>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 whitespace-nowrap">
                        <span className="flex items-center gap-1">
                          <IndianRupee className="w-3.5 h-3.5" />
                          Total
                        </span>
                      </th>
                      <th className="px-2 py-3 text-left   text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.STATUS}</th>
                      <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">{STUDENT_ORDERS_CONSTS.TABLE_HEADERS.ACTIONS}</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200 font-normal">
                    {loading ? (
                      <ListLoader colSpanSet={9} />
                    ) : noOrderFound ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-10 text-center">
                          <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-2" />
                          <h3 className="text-sm font-bold text-gray-700 mb-1">{STUDENT_ORDERS_CONSTS.TEXT.EMPTY_TITLE}</h3>
                          <p className="text-xs text-gray-400">{STUDENT_ORDERS_CONSTS.TEXT.EMPTY_SUB}</p>
                        </td>
                      </tr>
                    ) : (
                      orders.map((order, idx) => {
                        const sc = statusColors[order.status] || "bg-gray-100 text-gray-600 border border-gray-200";
                        const studentName = order.studentName || order.student?.name || order.student?.fullName || "—";
                        const admNumber = order.admissionNumber || order.student?.admissionNumber || "—";
                        const orderClass = order.className || order.class || order.student?.className || "—";
                        const storeName = order.storeName || order.store?.storeName || order.store?.name || "—";
                        const itemsList = order.items || order.orderItems || [];
                        const orderDate = order.orderDate || order.createdAt || order.date;
                        const totalAmt = order.totalAmount;
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
                              {itemsList.length > 0 ? (
                                <div className="flex flex-wrap flex-col items-center gap-1">
                                  {itemsList.slice(0, 2).map((it, i) => (
                                    <span key={i} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded-full font-medium whitespace-nowrap">
                                      {it.itemName || it.name} ×{it.quantity || it.qty}
                                    </span>
                                  ))}
                                  {itemsList.length > 2 && (
                                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                                      +{itemsList.length - 2} more
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
                              <div className="flex items-center gap-1">
                                <IndianRupee className="w-3.5 h-3.5 text-green-600 shrink-0" />
                                <span className="font-semibold text-green-700 whitespace-nowrap">
                                  {totalAmt !== null && totalAmt !== undefined ? Number(totalAmt).toFixed(2) : "—"}
                                </span>
                              </div>
                            </td>
                            <td className={tdStyle}>
                              <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium ${sc}`}>
                                {order.status || "—"}
                              </span>
                            </td>
                            <td className={tdStyle}>
                              <ActionDropDownComp
                                actionOptions={buildActionOptions(order.status, user?.userType)}
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
                      ? STUDENT_ORDERS_CONSTS.TEXT.NO_ORDERS
                      : STOCK_SHARED_CONSTS.COMMON.SHOWING_RANGE((page - 1) * rowsPerPage + 1, Math.min(page * rowsPerPage, totalItems), totalItems)}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700">{STOCK_SHARED_CONSTS.COMMON.ROWS_PER_PAGE}</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                      className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <PageButtons page={page} totalPages={totalPages} onPageChange={setPage} />
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0 || loading}
                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* ── Mobile / Tablet / Laptop Pagination ── */}
            <div className="xl:hidden border-t border-gray-200 px-4 py-4">
              <div className="flex flex-col gap-4">
                <div className="text-center text-sm text-gray-700">
                  {totalItems === 0
                    ? STUDENT_ORDERS_CONSTS.TEXT.NO_ORDERS
                    : STOCK_SHARED_CONSTS.COMMON.SHOWING_RANGE((page - 1) * rowsPerPage + 1, Math.min(page * rowsPerPage, totalItems), totalItems)}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-gray-700">{STOCK_SHARED_CONSTS.COMMON.ROWS_SHORT}</span>
                  <select
                    value={rowsPerPage}
                    onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className="flex items-center justify-center gap-1 flex-wrap">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <PageButtons page={page} totalPages={totalPages} onPageChange={setPage} />
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages || totalPages === 0 || loading}
                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center text-sm text-gray-600">Page {page} of {totalPages}</div>
              </div>
            </div>

          </div>

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