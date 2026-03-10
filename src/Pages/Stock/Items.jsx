import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
    Package, PackageCheck, PackageX, Layers, Plus, Search,
    ChevronLeft, ChevronRight, Eye, Edit, CheckCircle, XCircle,
    SlidersHorizontal, X,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import NewItem from "../../Components/Stock/NewItem";
import ViewItem from "../../Components/Stock/ViewItem";
import { getItemsList, activateItem, deactivateItem, createItem, updateItem } from "../../Api/StockApi";
import { toast } from "react-toastify";

const ROWS_PER_PAGE = 5;

const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB:        "bg-purple-100 text-purple-700",
    SPORTS:     "bg-blue-100 text-blue-700",
    UNIFORM:    "bg-orange-100 text-orange-700",
    BOOKS:      "bg-yellow-100 text-yellow-700",
    FURNITURE:  "bg-amber-100 text-amber-700",
};

const stockBarColor = (qty, min) => {
    if (!qty || qty === 0) return "bg-red-500";
    if (qty <= min / 2)    return "bg-red-500";
    if (qty < min)         return "bg-orange-400";
    return "bg-blue-500";
};

const STATUS_OPTIONS = [
    { label: "All Status", api: ""         },
    { label: "Active",     api: "ACTIVE"   },
    { label: "Inactive",   api: "INACTIVE" },
];

export default function Items() {
    const [allItems,       setAllItems]       = useState([]);
    const [loading,        setLoading]        = useState(true);
    const [search,         setSearch]         = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter,   setStatusFilter]   = useState("All Status");
    const [page,           setPage]           = useState(1);
    const [showFilters,    setShowFilters]    = useState(false);
    const [saving,         setSaving]         = useState(false);
    const [togglingId,     setTogglingId]     = useState(null);
    const [isNewItemOpen,  setIsNewItemOpen]  = useState(false);
    const [editItemData,   setEditItemData]   = useState(null);
    const [viewItemData,   setViewItemData]   = useState(null);
    const [isViewItemOpen, setIsViewItemOpen] = useState(false);

    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getItemsList(0, 1000, "", "", "");
            setAllItems(
                (res.items ?? []).map((item) => ({
                    id:          item.id,
                    code:        item.itemCode,
                    name:        item.itemName,
                    category:    item.category,
                    unit:        item.unit,
                    totalStock:  item.totalQuantity    ?? 0,
                    minLevel:    item.minimumStockLevel ?? 0,
                    description: item.description      ?? "",
                    status:      item.status,
                    stores:      [],
                }))
            );
        } catch (err) {
            console.error(err);
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchAll(); }, []); // eslint-disable-line

    const stats = useMemo(() => {
        const total      = allItems.length;
        const active     = allItems.filter((i) => i.status === "ACTIVE").length;
        const lowStock   = allItems.filter((i) => i.totalStock < i.minLevel).length;
        const categories = new Set(allItems.map((i) => i.category)).size;
        return [
            { key: "Total Items",  val: total,     icon: Package,      txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
            { key: "Active Items", val: active,     icon: PackageCheck, txColor: "text-green-600",  bgColor: "bg-green-50"  },
            { key: "Low Stock",    val: lowStock,   icon: PackageX,     txColor: "text-red-500",    bgColor: "bg-red-50"    },
            { key: "Categories",   val: categories, icon: Layers,       txColor: "text-purple-600", bgColor: "bg-purple-50" },
        ];
    }, [allItems]);

    const statusApi = STATUS_OPTIONS.find((o) => o.label === statusFilter)?.api ?? "";

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return allItems.filter((item) => {
            const matchSearch = !q || item.name.toLowerCase().includes(q) || item.code.toLowerCase().includes(q);
            const matchCat    = categoryFilter === "All Categories" || item.category === categoryFilter;
            const matchStatus = !statusApi || item.status === statusApi;
            return matchSearch && matchCat && matchStatus;
        });
    }, [allItems, search, categoryFilter, statusApi]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
    const safePage   = Math.min(page, totalPages);
    const paginated  = filtered.slice((safePage - 1) * ROWS_PER_PAGE, safePage * ROWS_PER_PAGE);

    const categoryOptions = useMemo(() =>
        ["All Categories", ...Array.from(new Set(allItems.map((i) => i.category))).sort()],
    [allItems]);

    const resetPage = () => setPage(1);

    const activeFilterCount = [
        search.trim() !== "",
        categoryFilter !== "All Categories",
        statusFilter !== "All Status",
    ].filter(Boolean).length;

    const pageNumbers = useMemo(() => {
        if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (safePage <= 3)   return [1, 2, 3, 4, 5];
        if (safePage >= totalPages - 2) return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [safePage - 2, safePage - 1, safePage, safePage + 1, safePage + 2];
    }, [safePage, totalPages]);

    const getActionOptions = (item) => [
        { value: "view", label: "View", icon: Eye,  text: "text-blue-600",   bg: "bg-blue-50",   hover: "hover:bg-blue-100"   },
        { value: "edit", label: "Edit", icon: Edit, text: "text-orange-600", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
        {
            value:    "toggleStatus",
            label:    togglingId === item.id
                        ? (item.status === "ACTIVE" ? "Deactivating…" : "Activating…")
                        : (item.status === "ACTIVE" ? "Deactivate" : "Activate"),
            icon:     item.status === "ACTIVE" ? XCircle : CheckCircle,
            text:     item.status === "ACTIVE" ? "text-red-600"     : "text-green-600",
            bg:       item.status === "ACTIVE" ? "bg-red-50"        : "bg-green-50",
            hover:    item.status === "ACTIVE" ? "hover:bg-red-100" : "hover:bg-green-100",
            disabled: togglingId === item.id,
        },
    ];

    const callAllActions = async (optVal, item) => {
        if (optVal === "view") {
            setViewItemData(item); setIsViewItemOpen(true);
        } else if (optVal === "edit") {
            setEditItemData(item); setIsNewItemOpen(true);
        } else if (optVal === "toggleStatus") {
            if (togglingId) return;
            try {
                setTogglingId(item.id);
                if (item.status === "ACTIVE") {
                    await deactivateItem(item.id);
                    toast.success("Item deactivated");
                } else {
                    await activateItem(item.id);
                    toast.success("Item activated");
                }
                await fetchAll();
            } finally {
                setTogglingId(null);
            }
        }
    };

    const handleSaveItem = async (payload) => {
        if (saving) return;
        try {
            setSaving(true);
            const mappedPayload = {
                itemCode:          payload.itemCode        ?? payload.code,
                itemName:          payload.itemName        ?? payload.name,
                category:          payload.category,
                unit:              payload.unit,
                minimumStockLevel: payload.minimumStockLevel ?? payload.minLevel,
                description:       payload.description     ?? "",
                status:            payload.status          ?? "ACTIVE",
            };
            if (editItemData) {
                await updateItem(editItemData.id, mappedPayload);
                toast.success("Item updated successfully");
            } else {
                await createItem(mappedPayload);
                toast.success("Item created successfully");
            }
            setIsNewItemOpen(false);
            setEditItemData(null);
            await fetchAll();
        } catch (err) {
            console.error(err);
            toast.error(editItemData ? "Failed to update item" : "Failed to create item");
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const clearFilters = () => {
        setCategoryFilter("All Categories");
        setStatusFilter("All Status");
        setSearch("");
        resetPage();
    };

    return (
        <div className="min-h-screen bg-blue-50 p-3 md:p-5 xl:p-8 font-sans">

            {/* ── Page Header ── */}
            <div className="mb-4 md:mb-6">
                <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-800">Stock Items</h1>
                <p className="text-gray-500 text-xs md:text-sm mt-1">
                    Manage inventory items, categories, stock levels and store distribution.
                </p>
            </div>

            {/* ── Stats: 2-col mobile, 4-col md+ ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)
                    : stats.map((s) => (
                        <CardComponent
                            key={s.key}
                            IconName={s.icon}
                            keyName={s.key}
                            val={s.val}
                            iconTxColor={s.txColor}
                            iconBgColor={s.bgColor}
                        />
                    ))}
            </div>

            {/* ── Main Panel ── */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Panel header */}
                <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2 min-w-0">
                        <Package className="w-5 h-5 text-blue-500 shrink-0" />
                        <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">Stock Items</h2>
                    </div>
                    <button
                        onClick={() => { setEditItemData(null); setIsNewItemOpen(true); }}
                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors shrink-0"
                    >
                        <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        New Item
                    </button>
                </div>

                <NewItem
                    isOpen={isNewItemOpen}
                    onClose={() => { setIsNewItemOpen(false); setEditItemData(null); }}
                    initialData={editItemData}
                    onSave={handleSaveItem}
                    saving={saving}
                />
                <ViewItem
                    isOpen={isViewItemOpen}
                    onClose={() => { setIsViewItemOpen(false); setViewItemData(null); }}
                    item={viewItemData}
                />

                {/* ── Filters ──────────────────────────────────────────────
                    < md  : search bar + collapse toggle; selects in drawer
                    md–xl : search full width on top, selects row below
                    xl+   : all three controls in one row
                ── */}

                {/* xl+ single row */}
                <div className="hidden xl:flex items-center gap-3 px-5 py-3 border-b border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or code…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-44"
                    >
                        {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-36"
                    >
                        {STATUS_OPTIONS.map((o) => (
                            <option key={o.label} value={o.label}>{o.label}</option>
                        ))}
                    </select>
                    {activeFilterCount > 0 && (
                        <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap">
                            <X className="w-3 h-3" /> Clear
                        </button>
                    )}
                </div>

                {/* md–xl two rows */}
                <div className="hidden md:flex xl:hidden flex-col gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search by name or code…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                        >
                            {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.label} value={o.label}>{o.label}</option>
                            ))}
                        </select>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium whitespace-nowrap shrink-0">
                                <X className="w-3 h-3" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                {/* mobile search + toggle */}
                <div className="flex md:hidden gap-2 px-4 py-3 border-b border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search…"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters((v) => !v)}
                        className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition shrink-0
                            ${showFilters ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}
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

                {/* mobile filter drawer */}
                {showFilters && (
                    <div className="flex md:hidden flex-col gap-2 px-4 pb-3 pt-1 border-b border-gray-100 bg-gray-50/60">
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                        >
                            {categoryOptions.map((c) => <option key={c}>{c}</option>)}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.label} value={o.label}>{o.label}</option>
                            ))}
                        </select>
                        {activeFilterCount > 0 && (
                            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-medium self-end">
                                <X className="w-3 h-3" /> Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* ── Table: md+ ── */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-3 lg:px-5 py-3 text-left w-8">#</th>
                                <th className="px-3 lg:px-5 py-3 text-left">Item</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Category</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Unit</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Stock</th>
                                <th className="px-3 lg:px-4 py-3 text-left whitespace-nowrap">Min Lvl</th>
                                <th className="px-3 lg:px-4 py-3 text-left">Status</th>
                                <th className="px-3 lg:px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <ListLoader rows={5} avatar={false} />
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-12 text-center text-gray-400 text-sm">
                                        No items found.
                                    </td>
                                </tr>
                            ) : (
                                paginated.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-3 lg:px-5 py-3 text-sm text-gray-400">
                                            {(safePage - 1) * ROWS_PER_PAGE + idx + 1}
                                        </td>
                                        <td className="px-3 lg:px-5 py-3 max-w-30 md:max-w-40 lg:max-w-55">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5 truncate">{item.code}</p>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {item.unit}
                                        </td>
                                        <td className="px-3 lg:px-4 py-3">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`text-sm font-bold w-7 shrink-0 ${
                                                    item.totalStock < item.minLevel ? "text-red-500"
                                                    : item.totalStock < item.minLevel * 1.5 ? "text-orange-500"
                                                    : "text-gray-800"
                                                }`}>
                                                    {item.totalStock}
                                                </span>
                                                <div className="w-10 md:w-14 lg:w-20 bg-gray-100 rounded-full h-2 shrink-0">
                                                    <div
                                                        className={`${stockBarColor(item.totalStock, item.minLevel)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${Math.min(item.minLevel > 0 ? (item.totalStock / (item.minLevel * 2)) * 100 : 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3 text-sm text-gray-600">
                                            {item.minLevel}
                                        </td>
                                        <td className="px-3 lg:px-4 py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap ${
                                                item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                            }`}>
                                                {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-3 lg:px-4 py-3 text-center">
                                            <ActionDropDownComp
                                                actionOptions={getActionOptions(item)}
                                                onAction={(optVal) => callAllActions(optVal, item)}
                                            />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── Mobile Cards: < md ── */}
                <div className="md:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : paginated.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-12">No items found.</p>
                    ) : (
                        paginated.map((item, idx) => (
                            <div key={item.id} className="px-4 py-4 space-y-2.5 hover:bg-gray-50/70 transition-colors">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-start gap-2 min-w-0">
                                        <span className="text-xs text-gray-400 mt-0.5 shrink-0">
                                            {(safePage - 1) * ROWS_PER_PAGE + idx + 1}.
                                        </span>
                                        <div className="min-w-0">
                                            <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.code}</p>
                                        </div>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                                        item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                                    }`}>
                                        {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                        {item.category}
                                    </span>
                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                                </div>
                                <div className="space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>Stock: <span className={`font-bold ${item.totalStock < item.minLevel ? "text-red-500" : "text-gray-700"}`}>{item.totalStock}</span></span>
                                        <span>Min: <span className="font-medium text-gray-700">{item.minLevel}</span></span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`${stockBarColor(item.totalStock, item.minLevel)} h-1.5 rounded-full`}
                                            style={{ width: `${Math.min(item.minLevel > 0 ? (item.totalStock / (item.minLevel * 2)) * 100 : 100, 100)}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="pt-0.5">
                                    <ActionDropDownComp
                                        actionOptions={getActionOptions(item)}
                                        onAction={(optVal) => callAllActions(optVal, item)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* ── Pagination ── */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-gray-100">
                    <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
                        {filtered.length === 0
                            ? "No items"
                            : `Showing ${(safePage - 1) * ROWS_PER_PAGE + 1}–${Math.min(safePage * ROWS_PER_PAGE, filtered.length)} of ${filtered.length} items`}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={safePage === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {pageNumbers.map((n) => (
                            <button
                                key={n}
                                onClick={() => setPage(n)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                                    safePage === n
                                        ? "bg-blue-600 text-white"
                                        : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                                }`}
                            >
                                {n}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={safePage === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}