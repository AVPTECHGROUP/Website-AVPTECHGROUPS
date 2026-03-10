import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Store,
    Package,
    TrendingDown,
    Activity,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    Repeat2,
    RefreshCw,
    Inbox,
    Search,
    SlidersHorizontal,
    X,
    Loader2,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import TransferStock from "../../Components/Stock/TransferStock";
import {
    getActiveStores,
    getStockOverview,
    getStockOverviewStats,
} from "../../Api/StockApi";

// ── Constants ──────────────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 10;
const SEARCH_DEBOUNCE_MS = 400;
const ALL_STORES_ID = "";   // empty string = no storeId filter

const CATEGORY_OPTIONS = [
    { label: "All Categories", val: "" },
    { label: "STATIONERY", val: "STATIONERY" },
    { label: "LAB", val: "LAB" },
    { label: "SPORTS", val: "SPORTS" },
    { label: "UNIFORM", val: "UNIFORM" },
    { label: "BOOKS", val: "BOOKS" },
    { label: "FURNITURE", val: "FURNITURE" },
];

const STATUS_OPTIONS = [
    { label: "All Status", val: "" },
    { label: "OK", val: "OK" },
    { label: "Low", val: "LOW" },
    { label: "Critical", val: "CRITICAL" },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-blue-100 text-blue-700",
    UNIFORM: "bg-orange-100 text-orange-700",
    BOOKS: "bg-yellow-100 text-yellow-700",
    FURNITURE: "bg-amber-100 text-amber-700",
};

const stockStatusStyle = {
    OK: "bg-green-100 text-green-700 border border-green-200",
    LOW: "bg-orange-100 text-orange-600 border border-orange-200",
    CRITICAL: "bg-red-100 text-red-600 border border-red-200",
};

const stockBarColor = (status) => {
    if (status === "CRITICAL") return "bg-red-500";
    if (status === "LOW") return "bg-orange-400";
    return "bg-blue-500";
};

// "Store A, Store B" → ["Store A", "Store B"]
const parseStoreNames = (str) =>
    str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];

// ── Component ──────────────────────────────────────────────────────────────────
export default function Transactions() {

    // ── Stores dropdown ────────────────────────────────────────
    const [stores, setStores] = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);

    // ── Filter state ───────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState(ALL_STORES_ID);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(0);   // 0-based
    const [showFilters, setShowFilters] = useState(false);
    const debounceRef = useRef(null);

    // ── Table data ─────────────────────────────────────────────
    const [items, setItems] = useState([]);
    const [pagination, setPagination] = useState({});
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError, setItemsError] = useState("");

    // ── Stats ──────────────────────────────────────────────────
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);

    // ── Modals ─────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("in");
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // ── Pagination derived ─────────────────────────────────────
    const totalPages = pagination.totalPages ?? 1;
    const currentPage = pagination.currentPage ?? page;
    const totalElements = pagination.totalElements ?? 0;
    const startItem = totalElements === 0 ? 0 : currentPage * ROWS_PER_PAGE + 1;
    const endItem = Math.min((currentPage + 1) * ROWS_PER_PAGE, totalElements);

    const pageNumbers = (() => {
        const arr = [], s = Math.max(0, currentPage - 2), e = Math.min(totalPages - 1, currentPage + 2);
        for (let i = s; i <= e; i++) arr.push(i);
        return arr;
    })();

    // ── Load stores once ───────────────────────────────────────
    useEffect(() => {
        setStoresLoading(true);
        getActiveStores()
            .then((res) => setStores(res?.data ?? []))
            .catch(() => { })
            .finally(() => setStoresLoading(false));
    }, []);

    // ── Debounce search → reset page ──────────────────────────
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(0);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // ── Fetch stats — scoped to selected store ─────────────────
    // ONE effect only — fires on mount (empty storeId = all) + on store change
    const fetchStats = useCallback(async (storeId) => {
        setStatsLoading(true);
        try {
            const scopedId = storeId ? Number(storeId) : null;
            const data = await getStockOverviewStats(scopedId);
            setStatsData(data);
        } catch {
            setStatsData(null);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchStats(selectedStoreId);
    }, [selectedStoreId, fetchStats]);

    // ── Fetch overview — POST with server-side filters + page ──
    const fetchItems = useCallback(async () => {
        setItemsLoading(true);
        setItemsError("");
        try {
            // Build filter object — only include non-empty values
            const filters = {};
            if (debouncedSearch) filters.searchTerm = debouncedSearch;
            if (categoryFilter) filters.category = categoryFilter;
            if (selectedStoreId) filters.storeId = Number(selectedStoreId);
            if (statusFilter) filters.stockStatus = statusFilter;

            const { items: raw, pagination: pg } = await getStockOverview(
                filters,
                page,
                ROWS_PER_PAGE,
                "id,desc"
            );

            setItems(
                (raw ?? []).map((item) => ({
                    id: item.itemId,
                    itemCode: item.itemCode,
                    itemName: item.itemName,
                    category: item.category,
                    unit: item.unit,
                    minLevel: item.minimumStockLevel ?? 0,
                    totalQty: item.totalQuantity ?? 0,
                    storeCount: item.storeCount ?? 0,
                    storeNames: parseStoreNames(item.stockedInStores),
                    isBelowMin: item.isBelowMinimum,
                    stockStatus: item.stockStatus ?? "OK",   // "OK" | "LOW" | "CRITICAL"
                    stores: item.stores ?? [],
                }))
            );
            setPagination(pg ?? {});
        } catch {
            setItemsError("Failed to load stock data.");
            setItems([]);
            setPagination({});
        } finally {
            setItemsLoading(false);
        }
    }, [page, debouncedSearch, categoryFilter, selectedStoreId, statusFilter]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    // ── After stock action: refresh both ──────────────────────
    const handleStockChange = useCallback(() => {
        fetchItems();
        fetchStats(selectedStoreId);
    }, [fetchItems, fetchStats, selectedStoreId]);

    // ── Reset helpers ──────────────────────────────────────────
    const resetPage = () => setPage(0);

    const clearFilters = () => {
        setSearch(""); setCategoryFilter(""); setStatusFilter(""); resetPage();
    };

    const activeFilterCount = [
        search.trim() !== "",
        categoryFilter !== "",
        statusFilter !== "",
    ].filter(Boolean).length;

    const isAllStores = selectedStoreId === ALL_STORES_ID;
    const selectedStore = stores.find((s) => String(s.id) === selectedStoreId) ?? null;

    // ── Stats cards ────────────────────────────────────────────
    const stats = [
        { key: "Total Items", icon: Package, val: statsLoading ? "…" : (statsData?.totalItems ?? 0), txColor: "text-blue-600", bgColor: "bg-blue-50" },
        { key: "OK Stock", icon: Activity, val: statsLoading ? "…" : (statsData?.okStock ?? 0), txColor: "text-green-600", bgColor: "bg-green-50" },
        { key: "Low Stock", icon: TrendingDown, val: statsLoading ? "…" : (statsData?.lowStock ?? 0), txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: "Critical Stock", icon: ArrowDownToLine, val: statsLoading ? "…" : (statsData?.criticalStock ?? 0), txColor: "text-red-500", bgColor: "bg-red-50" },
    ];

    const openModal = (type) => {
        if (type === "transfer") { setIsTransferOpen(true); return; }
        setModalType(type);
        setIsModalOpen(true);
    };

    const actionOptions = [
        { value: "in", label: "IN", icon: Plus, text: "text-white", bg: "bg-green-600", hover: "hover:bg-green-700" },
        { value: "out", label: "OUT", icon: Minus, text: "text-white", bg: "bg-red-500", hover: "hover:bg-red-600" },
        { value: "transfer", label: "Transfer", icon: Repeat2, text: "text-blue-700", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
    ];

    const transactionCards = [
        { icon: <ArrowDownToLine className="w-7 h-7 md:w-8 md:h-8 text-green-600" />, bg: "bg-green-50", border: "border-green-200", title: "Stock IN", titleColor: "text-green-600", sub: "Add stock to a store", type: "in" },
        { icon: <ArrowUpFromLine className="w-7 h-7 md:w-8 md:h-8 text-red-500" />, bg: "bg-red-50", border: "border-red-200", title: "Stock OUT", titleColor: "text-red-500", sub: "Remove stock from a store", type: "out" },
        { icon: <ArrowLeftRight className="w-7 h-7 md:w-8 md:h-8 text-blue-600" />, bg: "bg-blue-50", border: "border-blue-200", title: "Transfer", titleColor: "text-blue-600", sub: "Move between stores", type: "transfer" },
    ];

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-blue-50 p-3 md:p-5 xl:p-8 font-sans">

            <StockManagementCard
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                mode={modalType}
                onConfirm={(data) => { console.log(`Stock ${modalType.toUpperCase()}:`, data); handleStockChange(); }}
            />
            <TransferStock
                isOpen={isTransferOpen}
                onClose={() => setIsTransferOpen(false)}
                onConfirm={(data) => { console.log("Transfer:", data); handleStockChange(); }}
                stores={stores}
            />

            {/* ── Page Header ── */}
            <div className="mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-800">Transactions</h1>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                    Manage stock movements — add, remove or transfer inventory across stores.
                </p>
            </div>

            {/* ── Transaction Action Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
                {transactionCards.map((card) => (
                    <button key={card.title} onClick={() => openModal(card.type)}
                        className={`flex items-center gap-3 md:gap-4 bg-white border ${card.border} rounded-2xl px-4 md:px-5 py-4 md:py-5 shadow-sm hover:shadow-md transition-all text-left w-full`}
                    >
                        <div className={`w-12 h-12 md:w-14 md:h-14 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className={`text-lg md:text-xl font-bold ${card.titleColor}`}>{card.title}</p>
                            <p className="text-xs md:text-sm text-gray-500 mt-0.5">{card.sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            {/* ── Stats Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {statsLoading
                    ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
                    : stats.map((s) => (
                        <CardComponent key={s.key} IconName={s.icon} keyName={s.key} val={s.val}
                            iconTxColor={s.txColor} iconBgColor={s.bgColor} />
                    ))}
            </div>

            {/* ── Main Panel ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* ── Toolbar: store selector + refresh ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl shadow-sm shrink-0">
                            <Store className="w-4 h-4" />
                            <span className="text-sm md:text-base font-semibold whitespace-nowrap">Store Stock View</span>
                        </div>
                        <div className="relative">
                            {storesLoading ? (
                                <div className="border-2 border-blue-200 bg-blue-50 text-blue-400 text-sm font-semibold px-4 py-2 rounded-xl min-w-40">
                                    Loading stores…
                                </div>
                            ) : (
                                <>
                                    <select
                                        value={selectedStoreId}
                                        onChange={(e) => { setSelectedStoreId(e.target.value); resetPage(); }}
                                        className="appearance-none border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 focus:bg-white text-blue-800 font-semibold text-sm pl-4 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all min-w-40 cursor-pointer"
                                    >
                                        <option value="">All Stores</option>
                                        {stores.map((s) => (
                                            <option key={s.id} value={s.id}>{s.storeName.trim()}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        {itemsLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
                        <button
                            onClick={handleStockChange}
                            disabled={itemsLoading}
                            title="Refresh"
                            className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 shrink-0"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${itemsLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>
                </div>

                {/* ── Store context strip ── */}
                {!isAllStores && selectedStore ? (
                    <div className="px-4 md:px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                            {selectedStore.storeCode?.trim()}
                        </span>
                        <span className="text-xs text-blue-600">{selectedStore.location?.trim()}</span>
                        {selectedStore.description && (
                            <span className="text-xs text-blue-400 hidden sm:inline">— {selectedStore.description}</span>
                        )}
                    </div>
                ) : isAllStores && (
                    <div className="px-4 md:px-5 py-2 bg-blue-50 border-b border-blue-100">
                        <span className="text-xs font-semibold text-blue-700">
                            Aggregated stock across all {stores.length} active stores
                        </span>
                    </div>
                )}

                {/* ── Filters ──────────────────────────────────────────────
                    xl+   : single row  [search flex-1 | category | status]
                    md–xl : search full width + selects row
                    < md  : search + toggle button; selects in drawer
                ── */}

                {/* xl+ — single row */}
                <div className="hidden xl:flex items-center gap-3 px-5 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Search item name or code…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                    </div>
                    <select value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-44">
                        {CATEGORY_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    <select value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-36">
                        {STATUS_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                    </select>
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>

                {/* md–xl — two rows */}
                <div className="hidden md:flex xl:hidden flex-col gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Search item name or code…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                    </div>
                    <div className="flex items-center gap-2">
                        <select value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700">
                            {CATEGORY_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        <select value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700">
                            {STATUS_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap shrink-0">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* mobile — search + toggle */}
                <div className="flex md:hidden gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input type="text" placeholder="Search…" value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition" />
                    </div>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition shrink-0
                            ${showFilters ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}
                    >
                        <SlidersHorizontal className="w-4 h-4" />
                        Filters
                        {activeFilterCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold border-2 border-white">
                                {activeFilterCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* mobile — collapsible drawer */}
                {showFilters && (
                    <div className="flex md:hidden flex-col gap-2 px-4 pb-3 pt-1 border-b border-gray-100 bg-gray-50/60">
                        <select value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700">
                            {CATEGORY_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        <select value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700">
                            {STATUS_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium self-end">
                                <X className="w-3 h-3" /> Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* Error banner */}
                {itemsError && (
                    <div className="mx-4 md:mx-5 mt-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-center justify-between">
                        <span>{itemsError}</span>
                        <button onClick={fetchItems} className="underline font-semibold hover:text-red-700 shrink-0">Retry</button>
                    </div>
                )}

                {/* ── Desktop Table: md+ ── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-3 lg:px-5 py-3 text-left">#</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Item</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Category</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Unit</th>
                                <th className="px-4 lg:px-4 py-3 text-center whitespace-nowrap">
                                    {isAllStores ? "Total Quantity" : "Quantity in Store"}
                                </th>
                                {isAllStores && (
                                    <th className="px-3 lg:px-4 py-3 text-center">Stocked In</th>
                                )}
                                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">Min Lvl</th>
                                <th className="px-3 lg:px-4 py-3 text-center">Status</th>
                                <th className="px-3 lg:px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemsLoading ? (
                                <ListLoader rows={8} avatar={false} />
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={isAllStores ? 9 : 8} className="px-5 py-14 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Inbox className="w-8 h-8 opacity-30" />
                                            <p className="text-sm font-medium">No items found</p>
                                            <p className="text-xs">Try adjusting your filters</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                items.map((item, idx) => {
                                    const qty = isAllStores
                                        ? item.totalQty
                                        : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                                    const min = item.minLevel;
                                    const status = item.stockStatus;

                                    const newLocal = "px-3 lg:px-4 py-3 max-w-32.5 lg:max-w-50";
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">

                                            {/* # */}
                                            <td className="px-3 lg:px-5 py-3 text-sm text-gray-400">
                                                {currentPage * ROWS_PER_PAGE + idx + 1}
                                            </td>

                                            {/* Item */}
                                            <td className={newLocal}>
                                                <p className="font-semibold text-gray-800 text-sm truncate">{item.itemName}</p>
                                                <p className="text-xs text-gray-400 mt-0.5">{item.itemCode}</p>
                                            </td>

                                            {/* Category */}
                                            <td className="px-3 lg:px-4 py-3">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {item.category}
                                                </span>
                                            </td>

                                            {/* Unit */}
                                            <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                                {item.unit}
                                            </td>

                                            {/* Qty + bar */}
                                            <td className="px-3 lg:px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <span className={`text-sm font-bold w-8 shrink-0 ${item.isBelowMin ? "text-red-500" : "text-gray-800"}`}>
                                                        {qty}
                                                    </span>
                                                    <div className="w-14 lg:w-20 bg-gray-100 rounded-full h-2 shrink-0">
                                                        <div
                                                            className={`${stockBarColor(status)} h-2 rounded-full transition-all`}
                                                            style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Stocked In — full name badges */}
                                            {isAllStores && (
                                                <td className="px-3 lg:px-4 py-3 max-w-45 lg:max-w-65">
                                                    <div className="flex flex-wrap gap-1 items-center justify-center">
                                                        {item.storeNames.length === 0 ? (
                                                            <span className="text-xs text-gray-400">—</span>
                                                        ) : (
                                                            item.storeNames.map((name) => (
                                                                <span key={name} title={name}
                                                                    className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap">
                                                                    {name}
                                                                </span>
                                                            ))
                                                        )}
                                                    </div>
                                                </td>
                                            )}

                                            {/* Min Level */}
                                            <td className="px-3 lg:px-4 py-3 text-sm text-center text-gray-600">{min}</td>

                                            {/* Status badge */}
                                            <td className="px-3 lg:px-4 py-3 text-center">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${stockStatusStyle[status] ?? stockStatusStyle.OK}`}>
                                                    {status}
                                                </span>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-3 lg:px-4 py-3">
                                                <ActionDropDownComp
                                                    actionOptions={actionOptions}
                                                    onAction={(optVal) => openModal(optVal)}
                                                />
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards: < md ── */}
                <div className="md:hidden divide-y divide-gray-100">
                    {itemsLoading ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : items.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400 py-12">
                            <Inbox className="w-8 h-8 opacity-30" />
                            <p className="text-sm font-medium">No items found</p>
                            <p className="text-xs">Try adjusting your filters</p>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const qty = isAllStores
                                ? item.totalQty
                                : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                            const min = item.minLevel;
                            const status = item.stockStatus;

                            return (
                                <div key={item.id} className="px-4 py-4 space-y-2.5">

                                    {/* Name + status */}
                                    <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <span className="text-xs text-gray-400 shrink-0">{currentPage * ROWS_PER_PAGE + idx + 1}.</span>
                                                <p className="font-semibold text-gray-800 text-sm truncate">{item.itemName}</p>
                                            </div>
                                            <p className="text-xs text-gray-400 mt-0.5">{item.itemCode}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${stockStatusStyle[status] ?? stockStatusStyle.OK}`}>
                                            {status}
                                        </span>
                                    </div>

                                    {/* Category + unit */}
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                                    </div>

                                    {/* Qty bar */}
                                    <div className="space-y-1">
                                        <div className="flex justify-between text-xs text-gray-500">
                                            <span>Qty: <span className={`font-bold ${item.isBelowMin ? "text-red-500" : "text-gray-700"}`}>{qty}</span></span>
                                            <span>Min: <span className="font-medium text-gray-700">{min}</span></span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-1.5">
                                            <div
                                                className={`${stockBarColor(status)} h-1.5 rounded-full`}
                                                style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Stocked-in badges — all stores only */}
                                    {isAllStores && item.storeNames.length > 0 && (
                                        <div className="flex flex-wrap gap-1">
                                            {item.storeNames.map((name) => (
                                                <span key={name}
                                                    className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                                    {name}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="pt-0.5">
                                        <ActionDropDownComp
                                            actionOptions={actionOptions}
                                            onAction={(optVal) => openModal(optVal)}
                                        />
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* ── Pagination ── */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-gray-100">
                    <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
                        {totalElements === 0
                            ? "No items"
                            : `Showing ${startItem}–${endItem} of ${totalElements} items`}
                    </p>
                    {totalPages > 1 && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage((p) => Math.max(0, p - 1))}
                                disabled={currentPage === 0 || itemsLoading}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            {pageNumbers.map((n) => (
                                <button key={n} onClick={() => setPage(n)} disabled={itemsLoading}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${currentPage === n ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                                        }`}>
                                    {n + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                                disabled={currentPage >= totalPages - 1 || itemsLoading}
                                className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}