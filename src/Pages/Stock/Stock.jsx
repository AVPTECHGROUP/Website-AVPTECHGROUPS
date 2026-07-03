import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    Store,
    Package,
    AlertTriangle,
    ArrowLeftRight,
    Plus,
    TrendingDown,
    BarChart3,
    Clock,
    Inbox,
    Filter,
    Loader2,
    ChevronLeft,
    ChevronRight,
    X,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import { useNavigate } from "react-router-dom";
import {
    getLowStockItems,
    getStockMovementHistory,
    getStockItemsStats,
} from "../../Api/Stock/StockApi";
import { getStockList, getActiveStores } from "../../Api/Stock/StoreApi";
import { STOCK_SHARED_CONSTS, STOCK_DASHBOARD_CONSTS,MOVEMENT_CONSTS } from "../../Constants/StringConstants/StockAndOrdersConstants";

const MV_PAGE_SIZE = STOCK_DASHBOARD_CONSTS.CONFIG.MV_PAGE_SIZE;

// ─── Shared helpers ───────────────────────────────────────────────────────────
const mvTypeMeta = {
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: { dot: "bg-green-500", badge: "text-green-700 bg-green-50 border border-green-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN },
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: { dot: "bg-red-500", badge: "text-red-600 bg-red-50 border border-red-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT },
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: { dot: "bg-blue-500", badge: "text-blue-700 bg-blue-50 border border-blue-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER },
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: { dot: "bg-orange-500", badge: "text-orange-700 bg-orange-50 border border-orange-200", label: STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER },
};
const mvQtyColor = {
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: "text-green-600",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: "text-red-500",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: "text-blue-600",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: "text-orange-600"
};
const mvQtyPrefix = {
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN]: "+",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT]: "-",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER]: "±",
    [STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER]: "-"
};

const formatDateTime = (iso) => {
    if (!iso) return { date: "—", time: "—" };
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString(STOCK_SHARED_CONSTS.LOCALE.DATE_GB, { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString(STOCK_SHARED_CONSTS.LOCALE.DATE_GB, { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
};

const mapMv = (m) => {
    const { date, time } = formatDateTime(m.createdAt);
    const type = m.movementType || STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN;
    let store = m.storeName || "—";
    if (type === STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER && m.destinationStoreName) {
        store = STOCK_DASHBOARD_CONSTS.STORE_TRANSFER_ROUTE(m.storeName, m.destinationStoreName);
    }
    return {
        id: m.id, date, time,
        item: m.itemName || "—",
        itemId: m.itemCode || STOCK_DASHBOARD_CONSTS.ITEM_ID_PREFIX(m.itemId),
        type, store,
        qty: m.quantity,
        before: m.quantityBefore,
        after: m.quantityAfter,
        ref: m.referenceNumber || m.transferReference || "—",
    };
};

// ─── Other badge helpers ──────────────────────────────────────────────────────
const statusBadge = (available, min) => {
    const isCritical = available <= min / 2;
    if (isCritical)
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">{STOCK_DASHBOARD_CONSTS.STOCK_LEVEL.CRITICAL}</span>;
    return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">{STOCK_DASHBOARD_CONSTS.STOCK_LEVEL.LOW}</span>;
};

const stockBarColor = (available, min) =>
    available <= min / 2 ? "bg-red-500" : "bg-orange-400";

const BAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-orange-400", "bg-teal-500", "bg-pink-500", "bg-indigo-500"];


// ─── Recent Movements Mini-Table ──────────────────────────────────────────────
function RecentMovementsTable({ stores }) {
    const [loading, setLoading] = useState(false);
    const [movements, setMovements] = useState([]);
    const [pagination, setPagination] = useState({});
    const [page, setPage] = useState(0);

    // Filters
    const [typeFilter, setTypeFilter] = useState("");
    const [storeId, setStoreId] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const didMountFetch = useRef(false);

    const navigate = useNavigate();

    const fetchMovements = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const filters = {};
            if (storeId) filters.storeId = Number(storeId);
            if (typeFilter) filters.movementType = typeFilter;
            if (dateFrom) filters.fromDate = `${dateFrom}T00:00:00.000Z`;
            if (dateTo) filters.toDate = `${dateTo}T23:59:59.999Z`;

            const { movements: raw, pagination: pg } = await getStockMovementHistory(
                filters,
                pageNum,
                MV_PAGE_SIZE
            );
            setMovements(raw.map(mapMv));
            setPagination(pg);
            setPage(pageNum);
        } catch {
            setMovements([]);
            setPagination({});
        } finally { setLoading(false); }
    }, [storeId, typeFilter, dateFrom, dateTo]);

    useEffect(() => {
        if (didMountFetch.current) return;
        didMountFetch.current = true;
        fetchMovements(0);
    }, [fetchMovements]);

    const [dateError, setDateError] = useState("");

    const handleApply = () => {
        if (dateFrom && dateTo && dateTo < dateFrom) {
            setDateError(STOCK_DASHBOARD_CONSTS.TEXT.DATE_ERROR);
            return;
        }
        setDateError("");
        fetchMovements(0);
    };

    const handleDateFrom = (val) => {
        setDateFrom(val);
        if (dateTo && val && dateTo < val) {
            setDateError(STOCK_DASHBOARD_CONSTS.TEXT.DATE_ERROR);
        } else {
            setDateError("");
        }
    };

    const handleDateTo = (val) => {
        setDateTo(val);
        if (dateFrom && val && val < dateFrom) {
            setDateError(STOCK_DASHBOARD_CONSTS.TEXT.DATE_ERROR);
        } else {
            setDateError("");
        }
    };

    // ── Clear all filters and refetch ──
    const hasActiveFilters = typeFilter || storeId || dateFrom || dateTo;

    const clearFilters = useCallback(async () => {
        setTypeFilter("");
        setStoreId("");
        setDateFrom("");
        setDateTo("");
        setDateError("");
        // Fetch with empty filters directly (state updates are async)
        setLoading(true);
        try {
            const { movements: raw, pagination: pg } = await getStockMovementHistory({}, 0, MV_PAGE_SIZE);
            setMovements(raw.map(mapMv));
            setPagination(pg);
            setPage(0);
        } catch {
            setMovements([]);
            setPagination({});
        } finally { setLoading(false); }
    }, []);

    const totalPages = pagination.totalPages ?? 1;
    const currentPage = pagination.currentPage ?? page;
    const totalEl = pagination.totalElements ?? movements.length;

    const pageNums = (() => {
        const arr = [], s = Math.max(0, currentPage - 1), e = Math.min(totalPages - 1, currentPage + 1);
        for (let i = s; i <= e; i++) arr.push(i);
        return arr;
    })();

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

            {/* ── Card header ── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                    <h2 className="font-semibold text-gray-800">{STOCK_DASHBOARD_CONSTS.TEXT.RECENT_MOVEMENTS}</h2>
                </div>
                <button
                    onClick={() => navigate("/stock/transactions")}
                    className="text-sm text-blue-600 cursor-pointer font-medium hover:underline whitespace-nowrap"
                >
                    View All →
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50 space-y-2">
                {/* Row 1: Type + Store */}
                <div className="flex gap-2">
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="flex-1 min-w-0 cursor-pointer text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                    >
                        <option value="">{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ALL_TYPES}</option>
                        <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN}</option>
                        <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.OUT}</option>
                        <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.TRANSFER}</option>
                        <option value={STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}>{STOCK_SHARED_CONSTS.MOVEMENT_TYPE.ORDER}</option>
                    </select>

                    <select
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="flex-1 min-w-0 cursor-pointer text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                    >
                        <option value="">{MOVEMENT_CONSTS.TEXT.ALL_STORES}</option>
                        {stores.map((s) => (
                            <option key={s.id ?? s.storeId} value={String(s.id ?? s.storeId)}>
                                {s.storeName ?? s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Row 2: From date + To date + Apply + Clear */}
                <div className="flex gap-2 items-end">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1 pl-0.5">{MOVEMENT_CONSTS.TEXT.FROM}</p>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => handleDateFrom(e.target.value)}
                            className={`w-full text-xs border cursor-pointer rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 text-gray-800 ${dateFrom && dateTo && dateTo < dateFrom ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`}
                            style={{ colorScheme: "light" }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 text-center mb-1 pl-0.5">{MOVEMENT_CONSTS.TEXT.TO}</p>
                        <input
                            type="date"
                            value={dateTo}
                            min={dateFrom || undefined}
                            onChange={(e) => handleDateTo(e.target.value)}
                            className={`w-full text-xs border cursor-pointer rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 text-gray-800 ${dateFrom && dateTo && dateTo < dateFrom ? "border-red-400 focus:ring-red-300" : "border-gray-200 focus:ring-blue-300"}`}
                            style={{ colorScheme: "light" }}
                        />
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="shrink-0 bg-blue-600 cursor-pointer hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
                        Apply
                    </button>

                    {/* Clear Filters — only visible when a filter is active */}
                    {hasActiveFilters && (
                        <button
                            onClick={clearFilters}
                            disabled={loading}
                            title={STOCK_DASHBOARD_CONSTS.TEXT.CLEAR_ALL_FILTERS}
                            className="shrink-0 cursor-pointer border border-gray-200 hover:border-red-300 hover:bg-red-50 hover:text-red-600 text-gray-500 text-xs font-semibold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
                        >
                            <X className="w-3 h-3" />
                            Clear
                        </button>
                    )}
                </div>

                {/* Date validation error */}
                {dateError && (
                    <div className="flex items-center gap-1.5 text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <p className="text-xs font-medium">{dateError}</p>
                    </div>
                )}
            </div>

            {/* ── Table ── */}
            <div className="flex-1" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="w-full" style={{ minWidth: "560px" }}>
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            {[
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.DATE_TIME,
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.ITEM,
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.TYPE,
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.STORE,
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.QTY,
                                STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.BEFORE_AFTER
                            ].map((header) => (
                                <th key={header} className="px-4 py-2.5 text-left whitespace-nowrap">{header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <ListLoader rows={5} avatar={false} />
                        ) : movements.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Inbox className="w-7 h-7 opacity-30" />
                                        <p className="text-sm font-medium">{STOCK_DASHBOARD_CONSTS.TEXT.NO_MOVEMENTS_FOUND}</p>
                                        <p className="text-xs">{STOCK_DASHBOARD_CONSTS.TEXT.TRY_ADJUSTING_FILTERS}</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movements.map((m) => {
                                const meta = mvTypeMeta[m.type] || mvTypeMeta[STOCK_SHARED_CONSTS.MOVEMENT_TYPE.IN];
                                return (
                                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-xs font-semibold text-gray-700">{m.date}</p>
                                            <p className="text-xs text-gray-400">{m.time}</p>
                                        </td>
                                        <td className="px-4 py-3 max-w-32.5">
                                            <p className="text-xs font-semibold text-gray-800 truncate" title={m.item}>{m.item}</p>
                                            <p className="text-xs text-gray-400">{m.itemId}</p>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${meta.badge}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 max-w-30">
                                            <span className="text-xs text-gray-600 truncate block" title={m.store}>{m.store}</span>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs font-bold ${mvQtyColor[m.type] ?? "text-gray-700"}`}>
                                                {mvQtyPrefix[m.type] ?? ""}{m.qty}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center text-xs text-gray-600 whitespace-nowrap">
                                            {m.before} → {m.after}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {movements.length > 0 && totalPages > 1 && (
                <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => fetchMovements(currentPage - 1)}
                            disabled={currentPage === 0 || loading}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                        {pageNums.map((p) => (
                            <button
                                key={p}
                                onClick={() => fetchMovements(p)}
                                disabled={loading}
                                className={`w-7 h-7 flex cursor-pointer items-center justify-center rounded-lg text-xs font-semibold transition ${p === currentPage
                                    ? "bg-blue-600 text-white"
                                    : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                                    }`}
                            >
                                {p + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => fetchMovements(currentPage + 1)}
                            disabled={currentPage >= totalPages - 1 || loading}
                            className="w-7 h-7 flex cursor-pointer items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <p className="text-xs text-gray-400">
                        {totalEl} movement{totalEl !== 1 ? "s" : ""}
                    </p>
                </div>
            )}
        </div>
    );
}

// ─── Main Stock Component ─────────────────────────────────────────────────────
export default function Stock() {
    const navigate = useNavigate();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedLowStockItem, setSelectedLowStockItem] = useState(null);

    const [totalStores, setTotalStores] = useState(null);
    const [totalItems, setTotalItems] = useState(null);
    const [totalMovements, setTotalMovements] = useState(null);

    const [stores, setStores] = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    const [loadingStats, setLoadingStats] = useState(true);
    const [loadingStores, setLoadingStores] = useState(true);
    const [loadingLowStock, setLoadingLowStock] = useState(true);

    // Stats — getStockList for store count, getStockItemsStats for item count
    useEffect(() => {
        (async () => {
            setLoadingStats(true);
            try {
                const [storeRes, itemStats] = await Promise.all([
                    getStockList(0, 1),
                    getStockItemsStats(),
                ]);
                setTotalStores(storeRes.pagination?.totalElements ?? storeRes.stores?.length ?? 0);
                setTotalItems(itemStats?.totalItems ?? 0);
            } catch { setTotalStores(0); setTotalItems(0); }
            finally { setLoadingStats(false); }
        })();
    }, []);

    // Stores (for filter dropdown inside RecentMovementsTable)
    useEffect(() => {
        (async () => {
            setLoadingStores(true);
            try {
                const res = await getActiveStores();
                setStores(res.data || res || []);
            } catch { setStores([]); }
            finally { setLoadingStores(false); }
        })();
    }, []);

    // Low stock
    useEffect(() => {
        (async () => {
            setLoadingLowStock(true);
            try {
                const { items } = await getLowStockItems();
                setLowStockItems(items);
            } catch { setLowStockItems([]); }
            finally { setLoadingLowStock(false); }
        })();
    }, []);

    // Total movements count — POST with empty filters, page 0, size 1
    useEffect(() => {
        (async () => {
            try {
                const { pagination } = await getStockMovementHistory({}, 0, 1);
                setTotalMovements(pagination?.totalElements ?? 0);
            } catch { setTotalMovements(0); }
        })();
    }, []);

    const lowStockCount = lowStockItems.length;

    const storeStockMap = {};
    lowStockItems.forEach((item) => {
        const key = item.storeName || STOCK_DASHBOARD_CONSTS.STORE_FALLBACK(item.storeId);
        if (!storeStockMap[key]) storeStockMap[key] = { atRisk: 0, qty: 0 };
        storeStockMap[key].atRisk += 1;
        storeStockMap[key].qty += item.quantity;
    });

    const storeSummaryRows = stores.map((s, i) => {
        const name = s.storeName ?? s.name;
        const info = storeStockMap[name] || { atRisk: 0, qty: 0 };
        return { name, atRisk: info.atRisk, qty: info.qty, color: BAR_COLORS[i % BAR_COLORS.length] };
    });

    const maxQty = Math.max(...storeSummaryRows.map((s) => s.qty), 1);

    const stats = [
        { key: STOCK_DASHBOARD_CONSTS.STATS.TOTAL_STORES, val: loadingStats ? "..." : (totalStores ?? 0), icon: Store, txColor: "text-blue-600", bgColor: "bg-blue-50" },
        { key: STOCK_DASHBOARD_CONSTS.STATS.TOTAL_ITEMS, val: loadingStats ? "..." : (totalItems ?? 0), icon: Package, txColor: "text-purple-600", bgColor: "bg-purple-50" },
        { key: STOCK_DASHBOARD_CONSTS.STATS.LOW_STOCK_ALERTS, val: loadingLowStock ? "..." : lowStockCount, icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: STOCK_DASHBOARD_CONSTS.STATS.TOTAL_MOVEMENTS, val: totalMovements === null ? "..." : totalMovements, icon: ArrowLeftRight, txColor: "text-green-600", bgColor: "bg-green-50" },
    ];

    const overallLoading = loadingStats && loadingStores && loadingLowStock;

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{STOCK_DASHBOARD_CONSTS.TEXT.TITLE}</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {STOCK_DASHBOARD_CONSTS.TEXT.SUBTITLE}
                </p>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
                {overallLoading
                    ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
                    : stats.map((s) => (
                        <CardComponent key={s.key} IconName={s.icon} keyName={s.key} val={s.val}
                            iconTxColor={s.txColor} iconBgColor={s.bgColor} />
                    ))}
            </div>

            {/* Low Stock Alert Banner */}
            {!loadingLowStock && lowStockCount > 0 && (
                <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-sm text-amber-800">
                        {STOCK_DASHBOARD_CONSTS.TEXT.LOW_STOCK_BANNER(lowStockCount)}
                    </p>
                    <button
                        onClick={() => navigate("/stock/transactions")}
                        className="ml-auto text-sm text-blue-600 cursor-pointer font-semibold hover:underline whitespace-nowrap"
                    >
                        {STOCK_DASHBOARD_CONSTS.TEXT.VIEW_LOW_STOCK}
                    </button>
                </div>
            )}

            {/* ── Middle Row ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <RecentMovementsTable stores={stores} />

                {/* Store-wise Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <h2 className="font-semibold text-gray-800">{STOCK_DASHBOARD_CONSTS.TEXT.STORE_WISE_SUMMARY}</h2>
                    </div>
                    <div className="px-5 py-4 space-y-5">
                        {loadingStores || loadingLowStock ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="shimmerList rounded h-4 w-1/2" />
                                    <div className="shimmerList rounded-full h-3 w-full" />
                                </div>
                            ))
                        ) : storeSummaryRows.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-8 text-gray-400">
                                <Store className="w-7 h-7 opacity-30" />
                                <p className="text-sm">{STOCK_DASHBOARD_CONSTS.TEXT.NO_STORES_FOUND}</p>
                            </div>
                        ) : (
                            storeSummaryRows.map((s) => (
                                <div key={s.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-700 truncate max-w-40">{s.name}</span>
                                        </div>
                                        <div className="text-right">
                                            {s.atRisk > 0 ? (
                                                <span className="text-xs font-semibold text-orange-500">
                                                    {STOCK_DASHBOARD_CONSTS.TEXT.LOW_STOCK_ITEM_COUNT(s.atRisk)}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-green-600">{STOCK_DASHBOARD_CONSTS.TEXT.HEALTHY}</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        {s.atRisk > 0 ? (
                                            <div
                                                className={`${s.color} h-3 rounded-full transition-all duration-700`}
                                                style={{ width: `${Math.max((s.qty / maxQty) * 100, 8)}%` }}
                                            />
                                        ) : (
                                            <div className="bg-green-400 h-3 rounded-full w-full transition-all duration-700" />
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* ── Low Stock Items Table ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <h2 className="font-semibold text-gray-800">{STOCK_DASHBOARD_CONSTS.TEXT.LOW_STOCK_ITEMS}</h2>
                    </div>
                    {!loadingLowStock && lowStockCount > 0 && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                            {STOCK_DASHBOARD_CONSTS.TEXT.NEED_ATTENTION(lowStockCount)}
                        </span>
                    )}
                </div>

                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full min-w-175">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                {[
                                    STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.ITEM,
                                    STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.STORE,
                                    STOCK_DASHBOARD_CONSTS.TEXT.AVAILABLE,
                                    STOCK_DASHBOARD_CONSTS.TEXT.MIN_LEVEL,
                                    STOCK_DASHBOARD_CONSTS.TABLE_HEADERS.STATUS,
                                    STOCK_DASHBOARD_CONSTS.TEXT.ACTION
                                ].map((header) => (
                                    <th key={header} className="px-5 py-3 text-left">{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loadingLowStock ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-32 mb-1.5" /><div className="h-2.5 bg-gray-100 rounded w-16" /></td>
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-20" /></td>
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-8" /></td>
                                        <td className="px-5 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                                        <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-20" /></td>
                                    </tr>
                                ))
                            ) : lowStockItems.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-14 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <TrendingDown className="w-8 h-8 opacity-30" />
                                            <p className="text-sm font-medium">{STOCK_DASHBOARD_CONSTS.TEXT.NO_LOW_STOCK_ITEMS}</p>
                                            <p className="text-xs">{STOCK_DASHBOARD_CONSTS.TEXT.ALL_ABOVE_MIN}</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                lowStockItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
                                            <p className="text-xs text-gray-400">{item.itemCode}</p>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.storeName}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-800 w-5">{item.quantity}</span>
                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`${stockBarColor(item.quantity, item.minimumStockLevel)} h-2 rounded-full`}
                                                        style={{ width: `${Math.min((item.quantity / item.minimumStockLevel) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.minimumStockLevel}</td>
                                        <td className="px-5 py-4">{statusBadge(item.quantity, item.minimumStockLevel)}</td>
                                        <td className="px-5 py-4">
                                            <button
                                                onClick={() => { setSelectedLowStockItem(item); setIsModalOpen(true); }}
                                                className="flex cursor-pointer items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                {STOCK_DASHBOARD_CONSTS.TEXT.ADD_STOCK_INWARD.split(" ")[0] + " Stock"}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards for low stock */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {loadingLowStock ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : lowStockItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400 py-12">
                            <TrendingDown className="w-8 h-8 opacity-30" />
                            <p className="text-sm font-medium">{STOCK_DASHBOARD_CONSTS.TEXT.NO_LOW_STOCK_ITEMS}</p>
                        </div>
                    ) : (
                        lowStockItems.map((item) => (
                            <div key={item.id} className="px-4 py-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
                                        <p className="text-xs text-gray-400">{item.itemCode}</p>
                                    </div>
                                    {statusBadge(item.quantity, item.minimumStockLevel)}
                                </div>
                                <div className="text-xs text-gray-500">{item.storeName}</div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        {STOCK_DASHBOARD_CONSTS.TEXT.AVAILABLE}: <strong>{item.quantity}</strong> {STOCK_DASHBOARD_CONSTS.TEXT.MIN_SUFFIX} <strong>{item.minimumStockLevel}</strong>
                                    </span>
                                    <button
                                        onClick={() => { setSelectedLowStockItem(item); setIsModalOpen(true); }}
                                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        {STOCK_DASHBOARD_CONSTS.TEXT.ADD_STOCK_INWARD.split(" ")[0] + " Stock"}
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <StockManagementCard
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setSelectedLowStockItem(null); }}
                heading={STOCK_DASHBOARD_CONSTS.TEXT.ADD_STOCK_INWARD}
                previewLabelText={STOCK_DASHBOARD_CONSTS.TEXT.CURRENT_STOCK_LABEL}
                previewBgColor="bg-green-50"
                previewBorderColor="border-green-200"
                previewTextColor="text-green-700"
                confirmBtnText={STOCK_DASHBOARD_CONSTS.TEXT.CONFIRM_STOCK_IN}
                confirmBtnBgColor="bg-green-600"
                confirmBtnHoverColor="hover:bg-green-700"
                selectedItem={selectedLowStockItem}
                onConfirm={(data) => { console.log(`${STOCK_DASHBOARD_CONSTS.TEXT.SUBMITTED_LABEL}`, data); setIsModalOpen(false); setSelectedLowStockItem(null); }}
            />
        </div>
    );
}