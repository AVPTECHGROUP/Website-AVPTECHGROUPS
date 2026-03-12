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
import { getActiveStores, getStockOverview } from "../../Api/StockApi";
import { getListOfValues } from "../../Api/ListOfValues";

const SEARCH_DEBOUNCE_MS = 400;
const ALL_STORES_ID      = "";

const STATUS_OPTIONS = [
    { label: "All Status", val: "" },
    { label: "OK",         val: "OK" },
    { label: "Low",        val: "LOW" },
    { label: "Critical",   val: "CRITICAL" },
];

const categoryColors = {
    STATIONERY:  "bg-gray-100 text-gray-700",
    LAB:         "bg-purple-100 text-purple-700",
    SPORTS:      "bg-blue-100 text-blue-700",
    UNIFORM:     "bg-orange-100 text-orange-700",
    BOOKS:       "bg-yellow-100 text-yellow-700",
    FURNITURE:   "bg-amber-100 text-amber-700",
    ELECTRONICS: "bg-cyan-100 text-cyan-700",
    CLEANING:    "bg-teal-100 text-teal-700",
    OTHER:       "bg-gray-100 text-gray-500",
};

const stockStatusStyle = {
    OK:       "text-green-700 font-semibold",
    LOW:      "text-orange-500 font-semibold",
    CRITICAL: "text-red-600 font-semibold",
};

const stockBarColor = (status) => {
    if (status === "CRITICAL") return "bg-red-500";
    if (status === "LOW")      return "bg-orange-400";
    return "bg-blue-500";
};

const parseStoreNames = (str) =>
    str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];

// ── Stocked In Cell — first pill + "+N more" hover popover ────────────────────
const StockedInCell = ({ storeNames }) => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    if (!storeNames || storeNames.length === 0) {
        return <span className="text-xs text-gray-400">—</span>;
    }

    const first = storeNames[0];
    const rest  = storeNames.slice(1);

    return (
        <div className="flex items-center gap-1.5 flex-wrap" ref={ref}>
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-gray-700 border border-gray-300 whitespace-nowrap">
                {first}
            </span>
            {rest.length > 0 && (
                <div className="relative">
                    <button
                        onClick={() => setOpen((o) => !o)}
                        className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100 transition cursor-pointer whitespace-nowrap"
                    >
                        +{rest.length} more
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

// ── Inline Action Buttons ─────────────────────────────────────────────────────
const InlineActions = ({ onAction }) => (
    <div className="flex items-center gap-1.5">
        <button
            onClick={() => onAction("in")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
        >
            <Plus className="w-3 h-3" /> IN
        </button>
        <button
            onClick={() => onAction("out")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-xs font-bold transition cursor-pointer whitespace-nowrap"
        >
            <Minus className="w-3 h-3" /> OUT
        </button>
        <button
            onClick={() => onAction("transfer")}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-blue-50 active:bg-blue-100 text-blue-600 border border-blue-200 text-xs font-semibold transition cursor-pointer whitespace-nowrap"
        >
            <ArrowLeftRight className="w-3 h-3" /> Transfer
        </button>
    </div>
);

// ── Mobile Action Buttons ─────────────────────────────────────────────────────
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
            <ArrowLeftRight className="w-3 h-3" /> Transfer
        </button>
    </div>
);

// ── Component ──────────────────────────────────────────────────────────────────
export default function Transactions() {

    // ── Stores dropdown ────────────────────────────────────────
    const [stores,        setStores]        = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);

    // ── Categories from LOV API ────────────────────────────────
    const [categoryOptions,   setCategoryOptions]   = useState([{ label: "All Categories", val: "" }]);
    const [categoriesLoading, setCategoriesLoading] = useState(false);

    // ── Filter state ───────────────────────────────────────────
    const [search,          setSearch]          = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [selectedStoreId, setSelectedStoreId] = useState(ALL_STORES_ID);
    const [categoryFilter,  setCategoryFilter]  = useState("");
    const [statusFilter,    setStatusFilter]    = useState("");
    const [page,            setPage]            = useState(1);
    const [rowsPerPage,     setRowsPerPage]     = useState(10);
    const debounceRef = useRef(null);

    // ── Table data ─────────────────────────────────────────────
    const [items,        setItems]        = useState([]);
    const [totalItems,   setTotalItems]   = useState(0);
    const [totalPages,   setTotalPages]   = useState(0);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError,   setItemsError]   = useState("");
    const [noItemFound,  setNoItemFound]  = useState(false);

    // ── Modals ─────────────────────────────────────────────────
    const [isModalOpen,    setIsModalOpen]    = useState(false);
    const [modalType,      setModalType]      = useState("in");
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // ── Load stores once ───────────────────────────────────────
    useEffect(() => {
        setStoresLoading(true);
        getActiveStores()
            .then((res) => setStores(res?.data ?? []))
            .catch(() => toast.error("Failed to load stores."))
            .finally(() => setStoresLoading(false));
    }, []);

    // ── Load ITEM_CATEGORY from LOV API once ───────────────────
    useEffect(() => {
        setCategoriesLoading(true);
        getListOfValues("ITEM_CATEGORY")
            .then((data) => {
                setCategoryOptions([
                    { label: "All Categories", val: "" },
                    ...data.map((item) => ({ label: item.label, val: item.value })),
                ]);
            })
            .catch(() => {
                setCategoryOptions([
                    { label: "All Categories", val: ""           },
                    { label: "Books",          val: "BOOKS"      },
                    { label: "Uniform",        val: "UNIFORM"    },
                    { label: "Lab",            val: "LAB"        },
                    { label: "Stationery",     val: "STATIONERY" },
                    { label: "Sports",         val: "SPORTS"     },
                    { label: "Furniture",      val: "FURNITURE"  },
                    { label: "Electronics",    val: "ELECTRONICS"},
                    { label: "Cleaning",       val: "CLEANING"   },
                    { label: "Other",          val: "OTHER"      },
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
            if (debouncedSearch) filters.searchTerm  = debouncedSearch;
            if (categoryFilter)  filters.category    = categoryFilter;
            if (selectedStoreId) filters.storeId     = Number(selectedStoreId);
            if (statusFilter)    filters.stockStatus = statusFilter;

            const { items: raw, pagination: pg } = await getStockOverview(
                filters, page - 1, rowsPerPage, "id,desc"
            );

            const mapped = (raw ?? []).map((item) => ({
                id:          item.itemId,
                itemCode:    item.itemCode,
                itemName:    item.itemName,
                category:    item.category,
                unit:        item.unit,
                minLevel:    item.minimumStockLevel ?? 0,
                totalQty:    item.totalQuantity     ?? 0,
                storeCount:  item.storeCount        ?? 0,
                storeNames:  parseStoreNames(item.stockedInStores),
                isBelowMin:  item.isBelowMinimum,
                stockStatus: item.stockStatus       ?? "OK",
                stores:      item.stores            ?? [],
            }));

            setItems(mapped);
            setTotalItems(pg?.totalElements ?? 0);
            setTotalPages(pg?.totalPages    ?? 0);
            setNoItemFound(mapped.length === 0);
        } catch {
            setItemsError("Failed to load stock data.");
            setItems([]);
            toast.error("Failed to load stock data. Please try again.");
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
        toast.info("Filters cleared.");
    };

    const activeFilterCount = [
        search.trim() !== "",
        categoryFilter !== "",
        statusFilter   !== "",
    ].filter(Boolean).length;

    const isAllStores   = selectedStoreId === ALL_STORES_ID;
    const selectedStore = stores.find((s) => String(s.id) === selectedStoreId) ?? null;

    const openModal = (type) => {
        if (type === "transfer") { setIsTransferOpen(true); return; }
        setModalType(type);
        setIsModalOpen(true);
    };

    const transactionCards = [
        { icon: <ArrowDownToLine className="w-7 h-7 md:w-8 md:h-8 text-green-600" />, bg: "bg-green-50", border: "border-green-200", title: "Stock IN",  titleColor: "text-green-600", sub: "Add stock to a store",      type: "in"       },
        { icon: <ArrowUpFromLine  className="w-7 h-7 md:w-8 md:h-8 text-red-500"   />, bg: "bg-red-50",   border: "border-red-200",   title: "Stock OUT", titleColor: "text-red-500",   sub: "Remove stock from a store", type: "out"      },
        { icon: <ArrowLeftRight   className="w-7 h-7 md:w-8 md:h-8 text-blue-600"  />, bg: "bg-blue-50",  border: "border-blue-200",  title: "Transfer",  titleColor: "text-blue-600",  sub: "Move between stores",       type: "transfer" },
    ];

    const colSpan = isAllStores ? 9 : 8;
    const tdStyle = "px-3 py-3 text-left text-gray-700 text-sm";

    const handleStockConfirm = (data) => {
        console.log(`Stock ${modalType.toUpperCase()}:`, data);
        handleStockChange();
        toast.success(modalType === "in" ? "Stock added successfully!" : "Stock removed successfully!");
    };

    const handleTransferConfirm = (data) => {
        console.log("Transfer:", data);
        handleStockChange();
        toast.success("Stock transferred successfully!");
    };

    const handleRefresh = () => {
        handleStockChange();
        toast.info("Stock data refreshed.");
    };

    // ── Render ─────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
            <div className="p-2 sm:p-5 lg:p-4">

                <StockManagementCard
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    mode={modalType}
                    onConfirm={handleStockConfirm}
                />
                <TransferStock
                    isOpen={isTransferOpen}
                    onClose={() => setIsTransferOpen(false)}
                    onConfirm={handleTransferConfirm}
                    stores={stores}
                />

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Transactions</h2>
                        <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                            Manage stock movements — add, remove or transfer inventory across stores.
                        </p>
                    </div>
                </div>

                {/* Transaction Action Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mt-5 mb-4">
                    {transactionCards.map((card) => (
                        <button key={card.title} onClick={() => openModal(card.type)}
                            className={`flex items-center gap-3 md:gap-4 bg-white border ${card.border} rounded-2xl px-4 md:px-5 py-4 md:py-5 shadow-sm hover:shadow-md transition-all text-left w-full cursor-pointer`}
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

                {/* ── Main Panel ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">

                    {/* Panel Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 md:gap-3 flex-wrap">
                            <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl shadow-sm shrink-0">
                                <Store className="w-4 h-4" />
                                <span className="text-sm md:text-base font-semibold whitespace-nowrap">Store Stock View</span>
                            </div>
                            <div className="relative">
                                {storesLoading ? (
                                    <div className="border-2 border-blue-200 flex items-center bg-blue-50 text-blue-400 text-sm font-semibold px-4 py-2 rounded-xl min-w-40 gap-3">
                                        Loading stores
                                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
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
                            <button
                                onClick={handleRefresh}
                                disabled={itemsLoading}
                                className="p-2 rounded-lg border border-gray-200 flex items-center gap-2 justify-center cursor-pointer text-gray-700 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 shrink-0"
                            >
                                Refresh
                                <RefreshCw className={`w-4 h-4 text-gray-500 ${itemsLoading ? "animate-spin" : ""}`} />
                            </button>
                        </div>
                    </div>

                    {/* Store context strip */}
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

                    {/* Filters */}
                    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 flex-wrap">
                        <div className="flex flex-1 items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition min-w-48">
                            <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search item name or code…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                            />
                        </div>
                        <div className="relative">
                            <select
                                value={categoryFilter}
                                onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                                disabled={categoriesLoading}
                                className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-44 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed appearance-none pr-8 cursor-pointer"
                            >
                                {categoriesLoading
                                    ? <option value="">Loading…</option>
                                    : categoryOptions.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)
                                }
                            </select>
                            {categoriesLoading
                                ? <Loader2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 animate-spin pointer-events-none" />
                                : <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                            }
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0 cursor-pointer"
                        >
                            {STATUS_OPTIONS.map((o) => <option key={o.val} value={o.val}>{o.label}</option>)}
                        </select>
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearFilters}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap shrink-0 cursor-pointer"
                            >
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>

                    {/* ── MOBILE / TABLET CARDS (below lg) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden px-4 py-4">
                        {itemsLoading ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                                    <span className="text-gray-600">Loading items…</span>
                                </div>
                            </div>
                        ) : itemsError ? (
                            <div className="text-center py-8 col-span-2">
                                <p className="text-red-500 text-sm mb-3">{itemsError}</p>
                                <button onClick={() => { fetchItems(); toast.info("Retrying…"); }}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                                    Retry
                                </button>
                            </div>
                        ) : noItemFound ? (
                            <div className="text-center py-8 col-span-2">
                                <Inbox className="w-8 h-8 opacity-30 mx-auto mb-2 text-gray-400" />
                                <h3 className="text-lg font-bold text-gray-900 mb-1">No Items Found</h3>
                                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                            </div>
                        ) : (
                            items.map((item, idx) => {
                                const qty    = isAllStores ? item.totalQty : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                                const status = item.stockStatus;
                                return (
                                    <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                        <div className="flex items-start justify-between gap-2 mb-3">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <span className="text-xs text-gray-400 mt-0.5 shrink-0">{(page - 1) * rowsPerPage + idx + 1}.</span>
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm truncate">{item.itemName}</p>
                                                    <p className="text-xs text-gray-400 truncate">{item.itemCode}</p>
                                                </div>
                                            </div>
                                            <span className={`text-xs shrink-0 ${stockStatusStyle[status] ?? stockStatusStyle.OK}`}>
                                                {status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>{item.category}</span>
                                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs text-gray-500">
                                                    <span>Qty: <span className={`font-bold ${item.isBelowMin ? "text-red-500" : "text-gray-700"}`}>{qty}</span></span>
                                                    <span>Min: <span className="font-medium text-gray-700">{item.minLevel}</span></span>
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
                                                        <span key={name} className="inline-block px-2 py-0.5 rounded-full text-[11px] font-medium bg-white text-gray-700 border border-gray-300">{name}</span>
                                                    ))}
                                                    {item.storeNames.length > 2 && (
                                                        <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                                                            +{item.storeNames.length - 2} more
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <MobileActions onAction={openModal} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── DESKTOP TABLE (lg and above) ── */}
                    <div className="hidden lg:block bg-white rounded-xl border-0">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-225">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 w-10">#</th>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Item</th>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Category</th>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Unit</th>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 whitespace-nowrap">
                                            {isAllStores ? "Total Qty" : "Qty in Store"}
                                        </th>
                                        {isAllStores && (
                                            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Stocked In</th>
                                        )}
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 whitespace-nowrap">Min Level</th>
                                        <th className="px-3 py-3 text-left   text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Status</th>
                                        <th className="px-3 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100 font-normal">
                                    {itemsLoading ? (
                                        <ListLoader colSpanSet={colSpan} />
                                    ) : itemsError ? (
                                        <tr>
                                            <td colSpan={colSpan} className="px-6 py-8 text-center">
                                                <p className="text-red-500 text-sm mb-3">{itemsError}</p>
                                                <button onClick={() => { fetchItems(); toast.info("Retrying…"); }}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer">
                                                    Retry
                                                </button>
                                            </td>
                                        </tr>
                                    ) : noItemFound ? (
                                        <tr>
                                            <td colSpan={colSpan} className="px-6 py-10 text-center">
                                                <Inbox className="w-8 h-8 opacity-30 mx-auto mb-2 text-gray-400" />
                                                <h3 className="text-sm font-bold text-gray-700 mb-1">No Items Found</h3>
                                                <p className="text-xs text-gray-400">Try adjusting your filters</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, idx) => {
                                            const qty    = isAllStores ? item.totalQty : (item.stores.find((s) => String(s.storeId) === selectedStoreId)?.quantity ?? item.totalQty);
                                            const min    = item.minLevel;
                                            const status = item.stockStatus;
                                            return (
                                                <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">

                                                    {/* # */}
                                                    <td className={tdStyle}>{(page - 1) * rowsPerPage + idx + 1}</td>

                                                    {/* Item */}
                                                    <td className={tdStyle}>
                                                        <p className="font-semibold text-gray-800 truncate max-w-40">{item.itemName}</p>
                                                        <p className="text-xs text-gray-400 truncate max-w-40">{item.itemCode}</p>
                                                    </td>

                                                    {/* Category */}
                                                    <td className={tdStyle}>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                            {item.category}
                                                        </span>
                                                    </td>

                                                    {/* Unit */}
                                                    <td className={tdStyle}>
                                                        <span className="text-gray-600 whitespace-nowrap">{item.unit}</span>
                                                    </td>

                                                    {/* Qty + mini bar */}
                                                    <td className={tdStyle}>
                                                        <div className="flex items-center gap-2">
                                                            <span className={`text-sm font-bold w-8 shrink-0 ${item.isBelowMin ? "text-red-500" : "text-gray-800"}`}>{qty}</span>
                                                            <div className="w-14 bg-gray-100 rounded-full h-2 shrink-0">
                                                                <div
                                                                    className={`${stockBarColor(status)} h-2 rounded-full transition-all`}
                                                                    style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Stocked In — compact with popover */}
                                                    {isAllStores && (
                                                        <td className={tdStyle}>
                                                            <StockedInCell storeNames={item.storeNames} />
                                                        </td>
                                                    )}

                                                    {/* Min Level */}
                                                    <td className="px-3 py-3 text-center text-sm text-gray-600">
                                                        {min}
                                                    </td>

                                                    {/* Status */}
                                                    <td className={tdStyle}>
                                                        <span className={`text-xs ${stockStatusStyle[status] ?? stockStatusStyle.OK}`}>
                                                            {status}
                                                        </span>
                                                    </td>

                                                    {/* Actions — inline buttons */}
                                                    <td className="px-3 py-3">
                                                        <InlineActions onAction={openModal} />
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
                                        ? "No items"
                                        : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
                                </span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-700">Rows per page:</span>
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
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || itemsLoading}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {[...Array(totalPages)].map((_, i) => (
                                    <button key={i + 1} onClick={() => setPage(i + 1)}
                                        className={`px-3 py-1 rounded transition-all text-sm font-semibold cursor-pointer ${page === i + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                                        {i + 1}
                                    </button>
                                ))}
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || itemsLoading}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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
                                    ? "No items"
                                    : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-700">Rows:</span>
                                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || itemsLoading}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <div className="flex items-center gap-1">
                                    {totalPages <= 5 ? (
                                        [...Array(totalPages)].map((_, i) => (
                                            <button key={i + 1} onClick={() => setPage(i + 1)}
                                                className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === i + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                                                {i + 1}
                                            </button>
                                        ))
                                    ) : (
                                        <>
                                            <button onClick={() => setPage(1)} className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>1</button>
                                            {page > 3 && <span className="px-2 text-gray-400">…</span>}
                                            {page > 2 && page < totalPages - 1 && (
                                                <button onClick={() => setPage(page)} className="px-3 py-1 rounded cursor-pointer bg-blue-500 text-white text-sm font-semibold">{page}</button>
                                            )}
                                            {page < totalPages - 2 && <span className="px-2 text-gray-400">…</span>}
                                            <button onClick={() => setPage(totalPages)} className={`px-3 py-1 rounded cursor-pointer transition-all text-sm font-semibold ${page === totalPages ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>{totalPages}</button>
                                        </>
                                    )}
                                </div>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || itemsLoading}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center text-sm text-gray-600">Page {page} of {totalPages}</div>
                        </div>
                    </div>

                </div>{/* ── end white panel ── */}

            </div>
        </div>
    );
}