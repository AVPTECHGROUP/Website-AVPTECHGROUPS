import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Store,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Plus,
    Minus,
    RefreshCw,
    Inbox,
    X,
    Loader2,
    SearchIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import ListLoader from "../../Components/CommonComp/ListLoader";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import TransferStock from "../../Components/Stock/TransferStock";
import { getStockOverview } from "../../Api/Stock/StockApi";
import { getActiveStores } from "../../Api/Stock/StoreApi";
import { getListOfValues } from "../../Api/Lov/ListOfValues";
import { STOCK_SHARED_CONSTS, TRANSACTIONS_CONSTS } from "../../Constants/StringConstants/StockAndOrdersConstants";

const SEARCH_DEBOUNCE_MS = TRANSACTIONS_CONSTS.CONFIG.SEARCH_DEBOUNCE_MS;
const ALL_STORES_ID = "";

const STATUS_OPTIONS = [
    { label: STOCK_SHARED_CONSTS.STATUS.ALL, val: "" },
    { label: TRANSACTIONS_CONSTS.STOCK_LEVEL.OK, val: TRANSACTIONS_CONSTS.STOCK_LEVEL.OK_API },
    { label: TRANSACTIONS_CONSTS.STOCK_LEVEL.LOW, val: TRANSACTIONS_CONSTS.STOCK_LEVEL.LOW_API },
    { label: TRANSACTIONS_CONSTS.STOCK_LEVEL.CRITICAL, val: TRANSACTIONS_CONSTS.STOCK_LEVEL.CRITICAL_API },
];

const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-blue-100 text-blue-700",
    UNIFORM: "bg-orange-100 text-orange-700",
    BOOKS: "bg-yellow-100 text-yellow-700",
    FURNITURE: "bg-amber-100 text-amber-700",
    ELECTRONICS: "bg-cyan-100 text-cyan-700",
    CLEANING: "bg-teal-100 text-teal-700",
    OTHER: "bg-gray-100 text-gray-500",
};

const stockStatusStyle = {
    [TRANSACTIONS_CONSTS.STOCK_LEVEL.OK_API]: "text-green-700 font-semibold",
    [TRANSACTIONS_CONSTS.STOCK_LEVEL.LOW_API]: "text-orange-500 font-semibold",
    [TRANSACTIONS_CONSTS.STOCK_LEVEL.CRITICAL_API]: "text-red-600 font-semibold",
};

const stockBarColor = (status) => {
    if (status === TRANSACTIONS_CONSTS.STOCK_LEVEL.CRITICAL_API) return "bg-red-500";
    if (status === TRANSACTIONS_CONSTS.STOCK_LEVEL.LOW_API) return "bg-orange-400";
    return "bg-blue-500";
};

const parseStoreNames = (str) =>
    str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];

// ── Inline Action Buttons (desktop table) ─────────────────────────────────────
const InlineActions = ({ onAction }) => (
    <div className="flex items-center gap-1">
        <button
            onClick={() => onAction("in")}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
        >
            <Plus className="w-3 h-3" />
            <span className="hidden lg:inline">IN</span>
        </button>
        <button
            onClick={() => onAction("out")}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
        >
            <Minus className="w-3 h-3" />
            <span className="hidden lg:inline">OUT</span>
        </button>
        <button
            onClick={() => onAction("transfer")}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
        >
            <ArrowLeftRight className="w-3 h-3" />
            <span className="hidden lg:inline">{TRANSACTIONS_CONSTS.STOCK_MODAL.TRANSFER_TITLE}</span>
        </button>
    </div>
);

// ── Mobile / Card Action Buttons ──────────────────────────────────────────────
const MobileActions = ({ onAction }) => (
    <div className="flex items-center gap-1.5 pt-1 flex-wrap">
        <button onClick={() => onAction("in")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition cursor-pointer">
            <Plus className="w-3 h-3" /> IN
        </button>
        <button onClick={() => onAction("out")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-xs font-bold transition cursor-pointer">
            <Minus className="w-3 h-3" /> OUT
        </button>
        <button onClick={() => onAction("transfer")}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold transition cursor-pointer">
            <ArrowLeftRight className="w-3 h-3" /> {TRANSACTIONS_CONSTS.STOCK_MODAL.TRANSFER_TITLE}
        </button>
    </div>
);

// ── Stocked In Cell ───────────────────────────────────────────────────────────
const StockedInCell = ({ storeNames }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    if (!storeNames || storeNames.length === 0)
        return <span className="text-xs text-gray-400">—</span>;

    const first = storeNames[0];
    const rest = storeNames.slice(1);

    return (
        <div className="flex items-center gap-1.5 flex-wrap" ref={ref}>
            <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-gray-700 border border-gray-300 whitespace-nowrap max-w-25 truncate">
                {first}
            </span>
            {rest.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition cursor-pointer whitespace-nowrap"
                    >
                        +{rest.length}
                    </button>
                    {open && (
                        <div className="absolute left-0 top-6 z-50 bg-white border border-gray-200 rounded-xl shadow-lg p-2 min-w-max flex flex-col gap-1">
                            {storeNames.map((name) => (
                                <span key={name} className="px-3 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 whitespace-nowrap">
                                    {name}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function Transactions() {

    // ── Stores dropdown ────────────────────────────────────────
    const [stores, setStores] = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);

    // ── Categories from LOV API ────────────────────────────────
    const [categoryOptions, setCategoryOptions] = useState([{ label: STOCK_SHARED_CONSTS.ITEM_CATEGORY.ALL, val: "" }]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // ── Filter state ───────────────────────────────────────────
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState(ALL_STORES_ID);
    const [categoryFilter, setCategoryFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const debounceRef = useRef(null);

    // ── Table data ─────────────────────────────────────────────
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError, setItemsError] = useState("");
    const [noItemFound, setNoItemFound] = useState(false);

    // ── Modals ─────────────────────────────────────────────────
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("in");
    const [isTransferOpen, setIsTransferOpen] = useState(false);
    const [preselectedItem, setPreselectedItem] = useState(null);

    // ── Load stores once ───────────────────────────────────────
    useEffect(() => {
        setStoresLoading(true);
        getActiveStores()
            .then((res) => setStores(res?.data ?? []))
            .catch(() => toast.error(TRANSACTIONS_CONSTS.MESSAGES.LOAD_STORES_FAILED))
            .finally(() => setStoresLoading(false));
    }, []);

    // ── Load ITEM_CATEGORY from LOV API once ───────────────────
    useEffect(() => {
        setCategoriesLoading(true);
        getListOfValues(STOCK_SHARED_CONSTS.ITEM_CATEGORY.LOV_KEY)
            .then((data) => {
                setCategoryOptions([
                    { label: STOCK_SHARED_CONSTS.ITEM_CATEGORY.ALL, val: "" },
                    ...data.map((item) => ({ label: item.label, val: item.value })),
                ]);
            })
            .catch(() => {
                setCategoryOptions([
                    { label: STOCK_SHARED_CONSTS.ITEM_CATEGORY.ALL, val: "" },
                    ...STOCK_SHARED_CONSTS.ITEM_CATEGORY.OPTIONS.map(opt => ({ label: opt.label, val: opt.api }))
                ]);
            })
            .finally(() => setCategoriesLoading(false));
    }, []);

    // ── Debounce search ────────────────────────────────────────
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // ── Fetch items ────────────────────────────────────────────
    const fetchItems = useCallback(async () => {
        setItemsLoading(true);
        setItemsError("");
        setNoItemFound(false);
        try {
            const filters = {};
            if (debouncedSearch) filters.searchTerm = debouncedSearch;
            if (categoryFilter) filters.category = categoryFilter;
            if (selectedStoreId) filters.storeId = Number(selectedStoreId);
            if (statusFilter) filters.stockStatus = statusFilter;

            const { items: raw, pagination: pg } = await getStockOverview(
                filters, page - 1, rowsPerPage, TRANSACTIONS_CONSTS.SORT.DEFAULT
            );

            const mapped = (raw ?? []).map((item) => ({
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
                stockStatus: item.stockStatus ?? TRANSACTIONS_CONSTS.STOCK_LEVEL.OK_API,
                stores: item.stores ?? [],
            }));

            setItems(mapped);
            setTotalItems(pg?.totalElements ?? 0);
            setTotalPages(pg?.totalPages ?? 0);
            setNoItemFound(mapped.length === 0);
        } catch {
            setItemsError(TRANSACTIONS_CONSTS.MESSAGES.LOAD_STOCK_FAILED);
            setItems([]);
            toast.error(TRANSACTIONS_CONSTS.MESSAGES.LOAD_STOCK_FAILED_RETRY);
        } finally {
            setItemsLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearch, categoryFilter, selectedStoreId, statusFilter]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    const handleStockChange = useCallback(() => { fetchItems(); }, [fetchItems]);

    // ── Helpers ────────────────────────────────────────────────
    const resetPage = () => setPage(1);

    const clearFilters = () => {
        setSearch(""); setCategoryFilter(""); setStatusFilter(""); resetPage();
        toast.info(TRANSACTIONS_CONSTS.MESSAGES.FILTERS_CLEARED);
    };

    const activeFilterCount = [
        search.trim() !== "",
        categoryFilter !== "",
        statusFilter !== "",
    ].filter(Boolean).length;

    const isAllStores = selectedStoreId === ALL_STORES_ID;
    const selectedStore = stores.find((s) => String(s.id) === selectedStoreId) ?? null;

    const openModal = (type, item = null) => {
        setPreselectedItem(item);
        if (type === "transfer") { setIsTransferOpen(true); return; }
        setModalType(type);
        setIsModalOpen(true);
    };

    const closeStockModal = () => { setIsModalOpen(false); setPreselectedItem(null); };
    const closeTransferModal = () => { setIsTransferOpen(false); setPreselectedItem(null); };

    const transactionCards = [
        { icon: <ArrowDownToLine className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-green-600" />, bg: "bg-green-50", border: "border-green-200", title: TRANSACTIONS_CONSTS.STOCK_MODAL.STOCK_IN_TITLE, titleColor: "text-green-600", sub: TRANSACTIONS_CONSTS.STOCK_MODAL.STOCK_IN_DESC, type: "in" },
        { icon: <ArrowUpFromLine className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-red-500" />, bg: "bg-red-50", border: "border-red-200", title: TRANSACTIONS_CONSTS.STOCK_MODAL.STOCK_OUT_TITLE, titleColor: "text-red-500", sub: TRANSACTIONS_CONSTS.STOCK_MODAL.STOCK_OUT_DESC, type: "out" },
        { icon: <ArrowLeftRight className="w-6 h-6 sm:w-7 sm:h-7 xl:w-8 xl:h-8 text-blue-600" />, bg: "bg-blue-50", border: "border-blue-200", title: TRANSACTIONS_CONSTS.STOCK_MODAL.TRANSFER_TITLE, titleColor: "text-blue-600", sub: TRANSACTIONS_CONSTS.STOCK_MODAL.TRANSFER_DESC, type: "transfer" },
    ];

    const colSpan = isAllStores ? 9 : 8;

    const handleStockConfirm = (data) => {
        console.log(TRANSACTIONS_CONSTS.STOCK_MODAL.MODAL_HEADER(modalType), data);
        handleStockChange();
        toast.success(modalType === "in" ? TRANSACTIONS_CONSTS.MESSAGES.STOCK_ADDED : TRANSACTIONS_CONSTS.MESSAGES.STOCK_REMOVED);
    };

    const handleTransferConfirm = (data) => {
        console.log(TRANSACTIONS_CONSTS.STOCK_MODAL.TRANSFER_HEADER, data);
        handleStockChange();
        toast.success(TRANSACTIONS_CONSTS.MESSAGES.STOCK_TRANSFERRED);
    };

    const handleRefresh = () => {
        handleStockChange();
        toast.info(TRANSACTIONS_CONSTS.MESSAGES.STOCK_REFRESHED);
    };

    // ── Pagination renderer (shared) ──────────────────────────
    const PaginationButtons = () => (
        <div className="flex items-center gap-1 flex-wrap justify-center">
            <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || itemsLoading}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
            </button>

            {totalPages <= 7 ? (
                [...Array(totalPages)].map((_, i) => (
                    <button key={i + 1} onClick={() => setPage(i + 1)}
                        className={`w-8 h-8 rounded text-sm font-semibold cursor-pointer transition-all ${page === i + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                        {i + 1}
                    </button>
                ))
            ) : (
                <>
                    <button onClick={() => setPage(1)} className={`w-8 h-8 rounded text-sm font-semibold cursor-pointer transition-all ${page === 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>1</button>
                    {page > 3 && <span className="px-1 text-gray-400 text-sm">…</span>}
                    {[page - 1, page, page + 1].filter(p => p > 1 && p < totalPages).map(p => (
                        <button key={p} onClick={() => setPage(p)} className={`w-8 h-8 rounded text-sm font-semibold cursor-pointer transition-all ${page === p ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{p}</button>
                    ))}
                    {page < totalPages - 2 && <span className="px-1 text-gray-400 text-sm">…</span>}
                    <button onClick={() => setPage(totalPages)} className={`w-8 h-8 rounded text-sm font-semibold cursor-pointer transition-all ${page === totalPages ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{totalPages}</button>
                </>
            )}

            <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0 || itemsLoading}
                className="p-1.5 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
            <div className="p-2 sm:p-3 md:p-4 lg:p-5 xl:p-6 2xl:p-8">

                {/* ── Modals ── */}
                <StockManagementCard
                    isOpen={isModalOpen}
                    onClose={closeStockModal}
                    mode={modalType}
                    onConfirm={handleStockConfirm}
                    preselectedItem={preselectedItem}
                />
                <TransferStock
                    isOpen={isTransferOpen}
                    onClose={closeTransferModal}
                    onConfirm={handleTransferConfirm}
                    stores={stores}
                    preselectedItem={preselectedItem}
                />

                {/* ── Page Header ── */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-5">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 leading-tight">
                            {TRANSACTIONS_CONSTS.TEXT.TITLE}
                        </h2>
                        <p className="text-gray-500 mt-0.5 font-medium text-xs sm:text-sm lg:text-base">
                            {TRANSACTIONS_CONSTS.TEXT.SUBTITLE}
                        </p>
                    </div>
                </div>

                {/* ── Transaction Action Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 md:gap-4 xl:gap-5 mb-4 sm:mb-5">
                    {transactionCards.map((card) => (
                        <button
                            key={card.title}
                            onClick={() => openModal(card.type)}
                            className={`flex items-center gap-3 bg-white border ${card.border} rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 xl:px-6 py-3 sm:py-4 md:py-5 shadow-sm hover:shadow-md transition-all text-left w-full cursor-pointer group active:scale-[0.98]`}
                        >
                            <div className={`w-10 h-10 sm:w-12 sm:h-12 md:w-13 md:h-13 xl:w-14 xl:h-14 ${card.bg} rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                                {card.icon}
                            </div>
                            <div className="min-w-0">
                                <p className={`text-base sm:text-lg md:text-xl font-bold ${card.titleColor} truncate`}>{card.title}</p>
                                <p className="text-[11px] sm:text-xs md:text-sm text-gray-500 mt-0.5 truncate">{card.sub}</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* ── Main Panel ── */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                    {/* Panel Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 px-3 sm:px-4 md:px-5 xl:px-6 py-3 md:py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 sm:gap-2 bg-blue-600 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl shadow-sm shrink-0">
                                <Store className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                <span className="text-xs sm:text-sm md:text-base font-semibold whitespace-nowrap">{TRANSACTIONS_CONSTS.TEXT.TITLE}</span>
                            </div>

                            <div className="relative">
                                {storesLoading ? (
                                    <div className="border-2 border-blue-200 flex items-center bg-blue-50 text-blue-400 text-xs sm:text-sm font-semibold px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl min-w-32 gap-2">
                                        {TRANSACTIONS_CONSTS.TEXT.LOADING} <Loader2 className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                                    </div>
                                ) : (
                                    <>
                                        <select
                                            value={selectedStoreId}
                                            onChange={(e) => { setSelectedStoreId(e.target.value); resetPage(); }}
                                            className="appearance-none border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 focus:bg-white text-blue-800 font-semibold text-xs sm:text-sm pl-3 pr-8 py-1.5 sm:py-2 rounded-lg sm:rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all min-w-32 sm:min-w-40 cursor-pointer"
                                        >
                                            <option value="">{TRANSACTIONS_CONSTS.TEXT.ALL_STORES}</option>
                                            {stores.map((s) => (
                                                <option key={s.id} value={s.id}>{s.storeName.trim()}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500 pointer-events-none" />
                                    </>
                                )}
                            </div>
                        </div>

                        <button
                            onClick={handleRefresh}
                            disabled={itemsLoading}
                            className="self-end sm:self-auto flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-gray-700 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 shrink-0 text-xs sm:text-sm cursor-pointer"
                        >
                            Refresh
                            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 ${itemsLoading ? "animate-spin" : ""}`} />
                        </button>
                    </div>

                    {/* Store context strip */}
                    {!isAllStores && selectedStore ? (
                        <div className="px-3 sm:px-4 md:px-5 xl:px-6 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] sm:text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                                {selectedStore.storeCode?.trim()}
                            </span>
                            <span className="text-[11px] sm:text-xs text-blue-600">{selectedStore.location?.trim()}</span>
                            {selectedStore.description && (
                                <span className="text-[11px] sm:text-xs text-blue-400 hidden sm:inline truncate max-w-xs">— {selectedStore.description}</span>
                            )}
                        </div>
                    ) : isAllStores && (
                        <div className="px-3 sm:px-4 md:px-5 xl:px-6 py-2 bg-blue-50 border-b border-blue-100">
                            <span className="text-[11px] sm:text-xs font-semibold text-blue-700">
                                {TRANSACTIONS_CONSTS.TEXT.AGGREGATED_ACROSS_STORES(stores.length)}
                            </span>
                        </div>
                    )}

                    {/* ── Filters ── */}
                    <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 px-3 sm:px-4 md:px-5 xl:px-6 py-2.5 sm:py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition w-full sm:flex-1 sm:min-w-40 md:min-w-48">
                            <SearchIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder={TRANSACTIONS_CONSTS.TEXT.SEARCH_ITEM_NAME_OR_CODE}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-xs sm:text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                            />
                            {search && (
                                <button onClick={() => setSearch("")} className="text-gray-400 hover:text-gray-600 shrink-0 cursor-pointer">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                                    disabled={categoriesLoading}
                                    className="w-full sm:w-36 md:w-40 xl:w-44 px-2.5 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed appearance-none pr-7 cursor-pointer"
                                >
                                    {categoriesLoading
                                        ? <option value="">{TRANSACTIONS_CONSTS.TEXT.LOADING}</option>
                                        : categoryOptions.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)
                                    }
                                </select>
                                {categoriesLoading
                                    ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 animate-spin pointer-events-none" />
                                    : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                                }
                            </div>

                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                                    className="w-full sm:w-28 md:w-32 xl:w-36 px-2.5 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-xs sm:text-sm text-gray-700 cursor-pointer appearance-none pr-7"
                                >
                                    {STATUS_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                            </div>

                            {activeFilterCount > 0 && (
                                <button
                                    onClick={clearFilters}
                                    className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                                >
                                    <X className="w-3 h-3" /> Clear {activeFilterCount > 1 ? TRANSACTIONS_CONSTS.TEXT.ACTIVE_FILTER_COUNT(activeFilterCount) : ""}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* ================================================================
                        CARDS VIEW — Mobile, Tablet & Laptop screens (<1280px)
                        Switches to grid format to fit 1024px monitors easily.
                        ================================================================ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 xl:hidden px-3 sm:px-4 py-3 sm:py-4">
                        {itemsLoading ? (
                            <div className="text-center py-10 col-span-2">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                                    <span className="text-gray-500 text-sm">{TRANSACTIONS_CONSTS.TEXT.LOADING_ITEMS}</span>
                                </div>
                            </div>
                        ) : itemsError ? (
                            <div className="text-center py-10 col-span-2">
                                <p className="text-red-500 text-sm mb-3">{itemsError}</p>
                                <button onClick={() => { fetchItems(); toast.info(TRANSACTIONS_CONSTS.TEXT.RETRYING); }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                                    {STOCK_SHARED_CONSTS.COMMON.RETRY}
                                </button>
                            </div>
                        ) : noItemFound ? (
                            <div className="text-center py-10 col-span-2">
                                <Inbox className="w-8 h-8 opacity-30 mx-auto mb-2 text-gray-400" />
                                <h3 className="text-base font-bold text-gray-900 mb-1">{TRANSACTIONS_CONSTS.TEXT.EMPTY_TITLE}</h3>
                                <p className="text-gray-500 text-sm">{TRANSACTIONS_CONSTS.TEXT.TRY_ADJUSTING_FILTERS}</p>
                            </div>
                        ) : (
                            items.map((item, idx) => {
                                const qty = isAllStores ? item.totalQty : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                                const status = item.stockStatus;
                                return (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between gap-2 mb-2.5">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <span className="text-[11px] text-gray-400 mt-0.5 shrink-0 font-medium">{(page - 1) * rowsPerPage + idx + 1}.</span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm leading-tight line-clamp-2">{item.itemName}</p>
                                                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{item.itemCode}</p>
                                                </div>
                                            </div>
                                            <span className={`text-[11px] shrink-0 mt-0.5 ${stockStatusStyle[status] ?? stockStatusStyle[TRANSACTIONS_CONSTS.STOCK_LEVEL.OK_API]}`}>
                                                {status}
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <div className="flex items-center gap-1.5 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>{item.category}</span>
                                                <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                                            </div>

                                            <div>
                                                <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                                                    <span>{TRANSACTIONS_CONSTS.TEXT.QTY_LABEL} <span className={`font-bold ${item.isBelowMin ? "text-red-500" : "text-gray-700"}`}>{qty}</span></span>
                                                    <span>{TRANSACTIONS_CONSTS.TEXT.MIN_LABEL} <span className="font-medium text-gray-700">{item.minLevel}</span></span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                                    <div
                                                        className={`${stockBarColor(status)} h-1.5 rounded-full`}
                                                        style={{ width: `${Math.min(item.minLevel > 0 ? (qty / (item.minLevel * 2)) * 100 : 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {isAllStores && item.storeNames.length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {item.storeNames.slice(0, 2).map((name) => (
                                                        <span key={name} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-medium bg-white text-gray-700 border border-gray-300 max-w-22.5 truncate">{name}</span>
                                                    ))}
                                                    {item.storeNames.length > 2 && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                                            +{item.storeNames.length - 2}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            <MobileActions onAction={(type) => openModal(type, item)} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ================================================================
                        TABLE VIEW — Wide Desktop screens (>=1280px)
          
                    ======================================================== */}
                    <div className="hidden xl:block overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead className="border-b border-gray-200 bg-gray-50">
                                <tr>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider w-8 md:w-10">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.SNO}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-30 md:min-w-37.5 xl:min-w-45">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.ITEM}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.CATEGORY}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.UNIT}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap min-w-20">
                                        {isAllStores ? TRANSACTIONS_CONSTS.TABLE_HEADERS.TOTAL_QTY : TRANSACTIONS_CONSTS.TABLE_HEADERS.QTY}
                                    </th>
                                    {isAllStores && (
                                        <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-30">
                                            {TRANSACTIONS_CONSTS.TABLE_HEADERS.STOCKED_IN}
                                        </th>
                                    )}
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.MIN}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-left text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.STATUS}
                                    </th>
                                    <th className="px-2 md:px-3 xl:px-4 py-2.5 md:py-3 text-center text-[10px] md:text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        {TRANSACTIONS_CONSTS.TABLE_HEADERS.ACTIONS}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white divide-y divide-gray-100">
                                {itemsLoading ? (
                                    <ListLoader colSpanSet={colSpan} />
                                ) : itemsError ? (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-10 text-center">
                                            <p className="text-red-500 text-sm mb-3">{itemsError}</p>
                                            <button onClick={() => { fetchItems(); toast.info(TRANSACTIONS_CONSTS.TEXT.RETRYING); }}
                                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                                                {STOCK_SHARED_CONSTS.COMMON.RETRY}
                                            </button>
                                        </td>
                                    </tr>
                                ) : noItemFound ? (
                                    <tr>
                                        <td colSpan={colSpan} className="px-4 py-12 text-center">
                                            <Inbox className="w-8 h-8 opacity-30 mx-auto mb-2 text-gray-400" />
                                            <h3 className="text-sm font-bold text-gray-700 mb-1">{TRANSACTIONS_CONSTS.TEXT.EMPTY_TITLE}</h3>
                                            <p className="text-xs text-gray-400">{TRANSACTIONS_CONSTS.TEXT.TRY_ADJUSTING_FILTERS}</p>
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item, idx) => {
                                        const qty = isAllStores ? item.totalQty : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                                        const min = item.minLevel;
                                        const status = item.stockStatus;

                                        return (
                                            <tr key={item.id} className="hover:bg-blue-50/40 transition-colors group">
                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3 text-xs text-gray-500 font-medium">
                                                    {(page - 1) * rowsPerPage + idx + 1}
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                    <p className="font-semibold text-gray-800 text-xs md:text-sm truncate max-w-27.5 md:max-w-35 xl:max-w-50 2xl:max-w-65">{item.itemName}</p>
                                                    <p className="text-[10px] md:text-xs text-gray-400 truncate max-w-27.5 md:max-w-35 xl:max-w-50">{item.itemCode}</p>
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {item.category}
                                                    </span>
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3 text-xs md:text-sm text-gray-600 whitespace-nowrap">
                                                    {item.unit}
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                    <div className="flex items-center gap-1.5 md:gap-2">
                                                        <span className={`text-xs md:text-sm font-bold w-6 md:w-8 shrink-0 ${item.isBelowMin ? "text-red-500" : "text-gray-800"}`}>{qty}</span>
                                                        <div className="w-10 md:w-14 xl:w-16 bg-gray-100 rounded-full h-1.5 shrink-0 hidden sm:block">
                                                            <div
                                                                className={`${stockBarColor(status)} h-1.5 rounded-full transition-all`}
                                                                style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                {isAllStores && (
                                                    <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                        <StockedInCell storeNames={item.storeNames} />
                                                    </td>
                                                )}

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3 text-center text-xs md:text-sm text-gray-600">
                                                    {min}
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                    <span className={`text-[11px] md:text-xs ${stockStatusStyle[status] ?? stockStatusStyle[TRANSACTIONS_CONSTS.STOCK_LEVEL.OK_API]}`}>
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-2 md:px-3 xl:px-4 py-2 md:py-3">
                                                    <InlineActions onAction={(type) => openModal(type, item)} />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Footer Pagination Control Panel ── */}
                    <div className="border-t border-gray-200 px-3 sm:px-4 md:px-5 xl:px-6 py-3 md:py-4">
                        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3">

                            {/* Left side: Item display configuration stats */}
                            <div className="flex flex-col xs:flex-row items-center justify-center xl:justify-start gap-3 text-center xl:text-left">
                                <span className="text-xs sm:text-sm text-gray-700">
                                    {totalItems === 0
                                        ? TRANSACTIONS_CONSTS.TEXT.NO_ITEMS
                                        : STOCK_SHARED_CONSTS.COMMON.SHOWING_RANGE((page - 1) * rowsPerPage + 1, Math.min(page * rowsPerPage, totalItems), totalItems)}
                                </span>
                                <div className="flex items-center gap-2 shrink-0">
                                    <span className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">{STOCK_SHARED_CONSTS.COMMON.ROWS_SHORT}</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                                        className="px-2 py-1 border border-gray-300 rounded text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>

                            {/* Right side: Action item pagination controls */}
                            <div className="flex flex-col items-center gap-1">
                                <PaginationButtons />
                                <span className="text-[11px] text-gray-400">Page {page} of {totalPages || 1}</span>
                            </div>

                        </div>
                    </div>

                </div>{/* ── end white panel ── */}

            </div>
        </div>
    );
}