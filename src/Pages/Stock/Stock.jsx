import React, { useState, useEffect, useCallback } from "react";
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
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import { useNavigate } from "react-router-dom";
import {
    getActiveStores,
    getLowStockItems,
    getStockMovementHistory,
    getItemsList,
} from "../../Api/StockApi";
import { getStockList } from "../../Api/StoreApi";

// ─── Shared helpers (same as Movement.jsx) ────────────────────────────────────
const mvTypeMeta = {
    IN:       { dot: "bg-green-500", badge: "text-green-700 bg-green-50 border border-green-200",  label: "IN"       },
    OUT:      { dot: "bg-red-500",   badge: "text-red-600 bg-red-50 border border-red-200",         label: "OUT"      },
    TRANSFER: { dot: "bg-blue-500",  badge: "text-blue-700 bg-blue-50 border border-blue-200",      label: "TRANSFER" },
};
const mvQtyColor  = { IN: "text-green-600", OUT: "text-red-500",  TRANSFER: "text-blue-600" };
const mvQtyPrefix = { IN: "+",              OUT: "-",              TRANSFER: "±"             };

const formatDateTime = (iso) => {
    if (!iso) return { date: "—", time: "—" };
    const d = new Date(iso);
    return {
        date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
        time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true }),
    };
};

const mapMv = (m) => {
    const { date, time } = formatDateTime(m.createdAt);
    const type  = m.movementType || "IN";
    let   store = m.storeName    || "—";
    if (type === "TRANSFER" && m.destinationStoreName) {
        store = `${m.storeName} → ${m.destinationStoreName}`;
    }
    return {
        id: m.id, date, time,
        item:   m.itemName || "—",
        itemId: m.itemCode || `ITM-${m.itemId}`,
        type, store,
        qty:    m.quantity,
        before: m.quantityBefore,
        after:  m.quantityAfter,
        ref:    m.referenceNumber || m.transferReference || "—",
        by:     m.performedByName || "—",
    };
};

// ─── Other badge helpers (unchanged from original) ───────────────────────────
const categoryBadge = (cat) => {
    const map = {
        SPORTS: "bg-blue-100 text-blue-700",
        LAB: "bg-purple-100 text-purple-700",
        STATIONERY: "bg-gray-100 text-gray-700",
        UNIFORM: "bg-yellow-100 text-yellow-700",
        BOOKS: "bg-teal-100 text-teal-700",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[cat] ?? "bg-gray-100 text-gray-600"}`}>
            {cat}
        </span>
    );
};

const statusBadge = (available, min) => {
    const isCritical = available <= min / 2;
    if (isCritical)
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">Critical</span>;
    return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">Low</span>;
};

const stockBarColor = (available, min) =>
    available <= min / 2 ? "bg-red-500" : "bg-orange-400";

const BAR_COLORS = ["bg-blue-500", "bg-purple-500", "bg-orange-400", "bg-teal-500", "bg-pink-500", "bg-indigo-500"];

const MV_PAGE_SIZE = 5;

// ─── Recent Movements Mini-Table ─────────────────────────────────────────────
function RecentMovementsTable({ stores }) {
    const [loading,    setLoading]    = useState(false);
    const [movements,  setMovements]  = useState([]);
    const [pagination, setPagination] = useState({});
    const [page,       setPage]       = useState(0);

    // Filters
    const [typeFilter, setTypeFilter] = useState("");
    const [storeId,    setStoreId]    = useState("");
    const [dateFrom,   setDateFrom]   = useState("");
    const [dateTo,     setDateTo]     = useState("");

    const navigate = useNavigate();

    const fetchMovements = useCallback(async (pageNum = 0) => {
        setLoading(true);
        try {
            const fromISO = dateFrom ? `${dateFrom}T00:00:00.000Z` : "";
            const toISO   = dateTo   ? `${dateTo}T23:59:59.999Z`   : "";
            const { movements: raw, pagination: pg } = await getStockMovementHistory(
                pageNum, MV_PAGE_SIZE, "", storeId, typeFilter, fromISO, toISO, ""
            );
            setMovements(raw.map(mapMv));
            setPagination(pg);
            setPage(pageNum);
        } catch {
            setMovements([]);
            setPagination({});
        } finally { setLoading(false); }
    }, [storeId, typeFilter, dateFrom, dateTo]);

    // Load on mount with no filters (show latest 5)
    useEffect(() => { fetchMovements(0); }, []); // eslint-disable-line

    const handleApply = () => { fetchMovements(0); };

    const totalPages  = pagination.totalPages  ?? 1;
    const currentPage = pagination.currentPage ?? page;
    const totalEl     = pagination.totalElements ?? movements.length;

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
                    <h2 className="font-semibold text-gray-800">Recent Movements</h2>
                </div>
                <button
                    onClick={() => navigate("/stock/transactions")}
                    className="text-sm text-blue-600 font-medium hover:underline whitespace-nowrap"
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
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                    >
                        <option value="">All Types</option>
                        <option value="IN">IN</option>
                        <option value="OUT">OUT</option>
                        <option value="TRANSFER">TRANSFER</option>
                    </select>

                    <select
                        value={storeId}
                        onChange={(e) => setStoreId(e.target.value)}
                        className="flex-1 min-w-0 text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                    >
                        <option value="">All Stores</option>
                        {stores.map((s) => (
                            <option key={s.id ?? s.storeId} value={String(s.id ?? s.storeId)}>
                                {s.storeName ?? s.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Row 2: From date + To date + Apply */}
                <div className="flex gap-2 items-end">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1 pl-0.5">From</p>
                        <input
                            type="date"
                            value={dateFrom}
                            onChange={(e) => setDateFrom(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                            style={{ colorScheme: "light" }}
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-400 mb-1 pl-0.5">To</p>
                        <input
                            type="date"
                            value={dateTo}
                            onChange={(e) => setDateTo(e.target.value)}
                            className="w-full text-xs border border-gray-200 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800"
                            style={{ colorScheme: "light" }}
                        />
                    </div>
                    <button
                        onClick={handleApply}
                        disabled={loading}
                        className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-60 whitespace-nowrap"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Filter className="w-3 h-3" />}
                        Apply
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="flex-1" style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
                <table className="w-full" style={{ minWidth: "560px" }}>
                    <thead>
                        <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Date & Time</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Item</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Type</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Store</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Qty</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">Before → After</th>
                            <th className="px-4 py-2.5 text-left whitespace-nowrap">By</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            <ListLoader rows={5} avatar={false} />
                        ) : movements.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-12 text-center">
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Inbox className="w-7 h-7 opacity-30" />
                                        <p className="text-sm font-medium">No movements found</p>
                                        <p className="text-xs">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            movements.map((m) => {
                                const meta = mvTypeMeta[m.type] || mvTypeMeta["IN"];
                                return (
                                    <tr key={m.id} className="hover:bg-blue-50/40 transition-colors">
                                        {/* Date & Time */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <p className="text-xs font-semibold text-gray-700">{m.date}</p>
                                            <p className="text-xs text-gray-400">{m.time}</p>
                                        </td>
                                        {/* Item */}
                                        <td className="px-4 py-3 max-w-32.5">
                                            <p className="text-xs font-semibold text-gray-800 truncate" title={m.item}>{m.item}</p>
                                            <p className="text-xs text-gray-400">{m.itemId}</p>
                                        </td>
                                        {/* Type badge */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <div className="flex items-center gap-1">
                                                <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} shrink-0`} />
                                                <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${meta.badge}`}>
                                                    {meta.label}
                                                </span>
                                            </div>
                                        </td>
                                        {/* Store */}
                                        <td className="px-4 py-3 max-w-30">
                                            <span className="text-xs text-gray-600 truncate block" title={m.store}>{m.store}</span>
                                        </td>
                                        {/* Qty */}
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`text-xs font-bold ${mvQtyColor[m.type]}`}>
                                                {mvQtyPrefix[m.type]}{m.qty}
                                            </span>
                                        </td>
                                        {/* Before → After */}
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">
                                            {m.before} → {m.after}
                                        </td>
                                        {/* By */}
                                        <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">{m.by}</td>
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
                                className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-semibold transition ${
                                    p === currentPage
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
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
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

    const [totalStores,   setTotalStores]   = useState(null);
    const [totalItems,    setTotalItems]    = useState(null);
    const [totalMovements,setTotalMovements]= useState(null);

    const [stores,        setStores]        = useState([]);
    const [lowStockItems, setLowStockItems] = useState([]);

    const [loadingStats,    setLoadingStats]    = useState(true);
    const [loadingStores,   setLoadingStores]   = useState(true);
    const [loadingLowStock, setLoadingLowStock] = useState(true);

    // Stats
    useEffect(() => {
        (async () => {
            setLoadingStats(true);
            try {
                const [storeRes, itemRes] = await Promise.all([getStockList(0, 1), getItemsList(0, 1)]);
                setTotalStores(storeRes.pagination?.totalElements ?? storeRes.stores?.length ?? 0);
                setTotalItems(itemRes.pagination?.totalElements ?? itemRes.items?.length ?? 0);
            } catch { setTotalStores(0); setTotalItems(0); }
            finally  { setLoadingStats(false); }
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
            finally  { setLoadingStores(false); }
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
            finally  { setLoadingLowStock(false); }
        })();
    }, []);

    // Total movements count
    useEffect(() => {
        (async () => {
            try {
                const { pagination } = await getStockMovementHistory(0, 1);
                setTotalMovements(pagination?.totalElements ?? 0);
            } catch { setTotalMovements(0); }
        })();
    }, []);

    const lowStockCount = lowStockItems.length;

    const storeStockMap = {};
    lowStockItems.forEach((item) => {
        const key = item.storeName || `Store ${item.storeId}`;
        if (!storeStockMap[key]) storeStockMap[key] = { atRisk: 0, qty: 0 };
        storeStockMap[key].atRisk += 1;
        storeStockMap[key].qty    += item.quantity;
    });

    const storeSummaryRows = stores.map((s, i) => {
        const name = s.storeName ?? s.name;
        const info = storeStockMap[name] || { atRisk: 0, qty: 0 };
        return { name, atRisk: info.atRisk, qty: info.qty, color: BAR_COLORS[i % BAR_COLORS.length] };
    });

    const maxQty = Math.max(...storeSummaryRows.map((s) => s.qty), 1);

    const stats = [
        { key: "Total Stores",    val: loadingStats    ? "..." : (totalStores    ?? 0), icon: Store,         txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
        { key: "Total Items",     val: loadingStats    ? "..." : (totalItems     ?? 0), icon: Package,       txColor: "text-purple-600", bgColor: "bg-purple-50" },
        { key: "Low Stock Alerts",val: loadingLowStock ? "..." : lowStockCount,         icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: "Total Movements", val: totalMovements  === null ? "..." : totalMovements, icon: ArrowLeftRight, txColor: "text-green-600", bgColor: "bg-green-50" },
    ];

    const overallLoading = loadingStats && loadingStores && loadingLowStock;

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stock Management</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Monitor inventory, movements and low-stock alerts across all stores.
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
                        <span className="font-bold">{lowStockCount} item{lowStockCount !== 1 ? "s" : ""}</span>{" "}
                        {lowStockCount === 1 ? "is" : "are"} at or below minimum stock level across your stores.
                    </p>
                    <button
                        onClick={() => navigate("/stock/transactions")}
                        className="ml-auto text-sm text-blue-600 font-semibold hover:underline whitespace-nowrap"
                    >
                        View Low Stock →
                    </button>
                </div>
            )}

            {/* ── Middle Row: Recent Movements (new) + Store Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

                {/* ── Recent Movements — rebuilt as Movement.jsx mini-table ── */}
                <RecentMovementsTable stores={stores} />

                {/* Store-wise Summary (unchanged) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <h2 className="font-semibold text-gray-800">Store-wise Stock Summary</h2>
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
                                <p className="text-sm">No stores found</p>
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
                                                    {s.atRisk} low-stock item{s.atRisk !== 1 ? "s" : ""}
                                                </span>
                                            ) : (
                                                <span className="text-xs font-semibold text-green-600">✓ Healthy</span>
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
                        {!loadingStores && !loadingLowStock && storeSummaryRows.length > 0 && (
                            <p className="text-xs text-gray-400 pt-1">
                                Bar represents low-stock quantity per store. Green = no alerts.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Low Stock Items Table (unchanged) ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <TrendingDown className="w-5 h-5 text-red-500" />
                        <h2 className="font-semibold text-gray-800">Low Stock Items</h2>
                    </div>
                    {!loadingLowStock && lowStockCount > 0 && (
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                            {lowStockCount} item{lowStockCount !== 1 ? "s" : ""} need attention
                        </span>
                    )}
                </div>

                {/* Desktop table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full min-w-175">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-3 text-left">Item</th>
                                <th className="px-5 py-3 text-left">Store</th>
                                <th className="px-5 py-3 text-left">Available</th>
                                <th className="px-5 py-3 text-left">Min Level</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Action</th>
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
                                            <p className="text-sm font-medium">No low-stock items found</p>
                                            <p className="text-xs">All items are above minimum stock levels</p>
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
                                                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Stock
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
                            <p className="text-sm font-medium">No low-stock items found</p>
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
                                        Available: <strong>{item.quantity}</strong> / Min: <strong>{item.minimumStockLevel}</strong>
                                    </span>
                                    <button
                                        onClick={() => { setSelectedLowStockItem(item); setIsModalOpen(true); }}
                                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Plus className="w-3 h-3" />
                                        Add Stock
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
                heading="Add Stock (Inward)"
                previewLabelText="Current stock:"
                previewBgColor="bg-green-50"
                previewBorderColor="border-green-200"
                previewTextColor="text-green-700"
                confirmBtnText="Confirm Stock IN"
                confirmBtnBgColor="bg-green-600"
                confirmBtnHoverColor="hover:bg-green-700"
                selectedItem={selectedLowStockItem}
                onConfirm={(data) => { console.log("Submitted:", data); setIsModalOpen(false); setSelectedLowStockItem(null); }}
            />
        </div>
    );
}