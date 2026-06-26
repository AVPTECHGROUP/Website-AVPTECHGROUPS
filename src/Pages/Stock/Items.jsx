import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
    Package, PackageCheck, PackageX, Layers, Plus,
    ChevronLeft, ChevronRight, Eye, Edit, SearchIcon,
    Power, MinusCircle,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import NewItem from "../../Components/Stock/NewItem";
import ViewItem from "../../Components/Stock/ViewItem";
import {
    getStockItems, getStockItemsStats,
    activateItem, deactivateItem, createItem, updateItem,
} from "../../Api/Stock/StockApi";
import { getListOfValues } from "../../Api/Lov/ListOfValues";
import { toast } from "react-toastify";

// ── Constants ────────────────────────────────────────────────────
const SEARCH_DEBOUNCE_MS = 400;

const STATUS_OPTIONS = [
    { label: "All Status", api: "" },
    { label: "Active", api: "ACTIVE" },
    { label: "Inactive", api: "INACTIVE" },
];

const categoryColors = {
    STATIONERY: "bg-gray-100   text-gray-700",
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-blue-100   text-blue-700",
    UNIFORM: "bg-orange-100 text-orange-700",
    BOOKS: "bg-yellow-100 text-yellow-700",
    FURNITURE: "bg-amber-100  text-amber-700",
    ELECTRONICS: "bg-cyan-100   text-cyan-700",
    CLEANING: "bg-teal-100   text-teal-700",
    OTHER: "bg-gray-100   text-gray-500",
};

const stockBarColor = (qty, min) => {
    if (!qty || qty === 0) return "bg-red-500";
    if (qty <= min / 2) return "bg-red-500";
    if (qty < min) return "bg-orange-400";
    return "bg-blue-500";
};

// ── Component ────────────────────────────────────────────────────
export default function Items() {

    // ── Table data ─────────────────────────────────────────────
    const [items, setItems] = useState([]);
    const [totalItems, setTotalItems] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // ── Stats ──────────────────────────────────────────────────
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(true);

    // ── Categories from LOV ─────────────────────────────────────
    const [categoryOptions, setCategoryOptions] = useState([]);
    const [catsLoading, setCatsLoading] = useState(true);

    // ── Loading / action state ─────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [noItemFound, setNoItemFound] = useState(false);
    const [error, setError] = useState(null);

    // ── Filters & pagination (1-based display, 0-based API) ────
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");   // "" = All
    const [statusFilter, setStatusFilter] = useState("Active");
    const [page, setPage] = useState(1);    // 1-based
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const debounceRef = useRef(null);

    // ── Modals ─────────────────────────────────────────────────
    const [isNewItemOpen, setIsNewItemOpen] = useState(false);
    const [editItemData, setEditItemData] = useState(null);
    const [viewItemData, setViewItemData] = useState(null);
    const [isViewItemOpen, setIsViewItemOpen] = useState(false);

    // ── Debounce search ────────────────────────────────────────
    useEffect(() => {
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, SEARCH_DEBOUNCE_MS);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // ── Fetch LOV categories on mount ──────────────────────────
    useEffect(() => {
        setCatsLoading(true);
        getListOfValues("ITEM_CATEGORY")
            .then((data) => setCategoryOptions(data.map((d) => ({ label: d.label, value: d.value }))))
            .catch(() => setCategoryOptions([]))
            .finally(() => setCatsLoading(false));
    }, []);

    // ── Fetch stats ────────────────────────────────────────────
    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const data = await getStockItemsStats();
            setStatsData(data);
        } catch (err) {
            console.error(err);
            setStatsData(null);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    // ── Fetch items ────────────────────────────────────────────
    const fetchItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        setNoItemFound(false);
        try {
            const statusVal = STATUS_OPTIONS.find((o) => o.label === statusFilter)?.api ?? "";

            const { items: raw, pagination: pg } = await getStockItems(
                { searchTerm: debouncedSearch, category: categoryFilter, status: statusVal },
                page - 1,
                rowsPerPage,
            );

            const mapped = (raw ?? []).map((item) => ({
                id: item.id,
                code: item.itemCode,
                name: item.itemName,
                category: item.category,
                unit: item.unit,
                price: item.unitPrice ?? 0,       // unitPrice from API
                totalStock: item.totalQuantity ?? 0,
                minLevel: item.minimumStockLevel ?? 0,
                description: item.description ?? "",
                status: item.status,
                isBelowMin: item.isBelowMinimum,
            }));

            setItems(mapped);
            setTotalItems(pg?.totalElements ?? 0);
            setTotalPages(pg?.totalPages ?? 0);
            setNoItemFound(mapped.length === 0);
        } catch (err) {
            console.error(err);
            setError(err.message || "Something went wrong");
            setItems([]);
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    }, [page, rowsPerPage, debouncedSearch, categoryFilter, statusFilter]);

    useEffect(() => { fetchStats(); }, [fetchStats]);
    useEffect(() => { fetchItems(); }, [fetchItems]);

    // ── Stat cards ─────────────────────────────────────────────
    const stats = useMemo(() => [
        { key: "Total Items", val: statsData?.totalItems ?? 0, icon: Package, txColor: "text-blue-600", bgColor: "bg-blue-50" },
        { key: "Active Items", val: statsData?.activeItems ?? 0, icon: PackageCheck, txColor: "text-green-600", bgColor: "bg-green-50" },
        { key: "Inactive", val: statsData?.inactiveItems ?? 0, icon: PackageX, txColor: "text-red-500", bgColor: "bg-red-50" },
        { key: "Active Categories", val: statsData?.categories ?? statsData?.totalCategories ?? 0, icon: Layers, txColor: "text-purple-600", bgColor: "bg-purple-50" },
    ], [statsData]);

    const resetPage = () => setPage(1);

    // ── Action menu ────────────────────────────────────────────
    const getActionOptions = (item) => [
        { value: "view", label: "View", icon: Eye, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
        { value: "edit", label: "Edit", icon: Edit, text: "text-orange-600", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
        {
            value: "toggleStatus",
            label: togglingId === item.id
                ? (item.status === "ACTIVE" ? "Deactivating…" : "Activating…")
                : (item.status === "ACTIVE" ? "Inactive" : "Activate"),
            icon: item.status === "ACTIVE" ? MinusCircle : Power,
            text: item.status === "ACTIVE" ? "text-red-600" : "text-green-600",
            bg: item.status === "ACTIVE" ? "bg-red-50" : "bg-green-50",
            hover: item.status === "ACTIVE" ? "hover:bg-red-100" : "hover:bg-green-100",
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
                await Promise.all([fetchItems(), fetchStats()]);
            } catch {
                toast.error("Failed to update item status");
            } finally {
                setTogglingId(null);
            }
        }
    };

    // ── Save handler — POST / PUT ───────────────────────────────
    const handleSaveItem = async (payload) => {
        if (saving) return;
        try {
            setSaving(true);
            // payload comes from NewItem: { itemCode, itemName, category, unit, unitPrice, minimumStockLevel, status, description }
            const mappedPayload = {
                itemCode: payload.itemCode,
                itemName: payload.itemName,
                category: payload.category,
                unit: payload.unit,
                unitPrice: payload.unitPrice,          // ← sent to API
                minimumStockLevel: payload.minimumStockLevel,
                description: payload.description ?? "",
                status: payload.status ?? "ACTIVE",
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
            await Promise.all([fetchItems(), fetchStats()]);
        } catch (err) {
            console.error(err);
            toast.error(editItemData ? "Failed to update item" : "Failed to create item");
            throw err;
        } finally {
            setSaving(false);
        }
    };

    const tdStyle = "px-2 py-2 text-left text-gray-700 text-sm";

    // ── Render ──────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
            <div className="p-2 sm:p-5 lg:p-4 min-w-0">

                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Stock Items</h2>
                        <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
                            Manage inventory items, categories, stock levels and store distribution.
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 text-sm mt-5">
                    {statsLoading
                        ? stats.map((_, i) => <CardLoader key={i} />)
                        : stats.map((s) => (
                            <CardComponent key={s.key} IconName={s.icon} keyName={s.key.toUpperCase()}
                                val={s.val} iconTxColor={s.txColor} iconBgColor={s.bgColor} />
                        ))}
                </div>

                {/* ── Main Panel ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4 min-w-0">

                    {/* Panel Header */}
                    <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2 min-w-0">
                            <Package className="w-5 h-5 text-blue-500 shrink-0" />
                            <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">Stock Items</h2>
                        </div>
                        <button
                            onClick={() => { setEditItemData(null); setIsNewItemOpen(true); }}
                            className="flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors shrink-0"
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

                    {/* ── Filters ── */}
                    <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-gray-100">
                        <div className="flex flex-1 min-w-48 items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
                            <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by name or code…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={(e) => { setCategoryFilter(e.target.value); resetPage(); }}
                            disabled={catsLoading}
                            className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-44 shrink-0 disabled:opacity-60"
                        >
                            <option value="">{catsLoading ? "Loading…" : "All Categories"}</option>
                            {categoryOptions.map((c) => (
                                <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                        </select>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
                            className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-36 shrink-0"
                        >
                            {STATUS_OPTIONS.map((o) => (
                                <option key={o.label} value={o.label}>{o.label}</option>
                            ))}
                        </select>
                    </div>

                    {/* ── MOBILE / TABLET CARDS (below lg) ── */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:hidden px-4 py-4">
                        {loading ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                                    <span className="text-gray-600">Loading items…</span>
                                </div>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8 col-span-2">
                                <p className="text-red-600 mb-4">{error}</p>
                                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Retry</button>
                            </div>
                        ) : noItemFound ? (
                            <div className="text-center py-8 col-span-2">
                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Package className="w-6 h-6 text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Items Found</h3>
                                <p className="text-gray-600">There are no items to display.</p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                                    <div className="flex items-start justify-between gap-2 mb-3">
                                        <div className="flex items-start gap-2 min-w-0">
                                            <span className="text-xs text-gray-400 mt-0.5 shrink-0">
                                                {(page - 1) * rowsPerPage + idx + 1}.
                                            </span>
                                            <div className="min-w-0">
                                                <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                                                <p className="text-xs text-gray-400 truncate">{item.code}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                            {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                        </span>
                                    </div>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                {item.category}
                                            </span>
                                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.unit}</span>
                                            <span className="text-xs font-semibold text-gray-700 bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                                                ₹{Number(item.price).toFixed(2)}
                                            </span>
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
                                        <div className="flex justify-start items-center pt-1">
                                            <ActionDropDownComp
                                                actionOptions={getActionOptions(item)}
                                                onAction={(optVal) => callAllActions(optVal, item)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── DESKTOP TABLE (lg+) ── */}
                    <div className="hidden xl:block bg-white rounded-xl border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="border-b border-gray-200">
                                    <tr>
                                        {[
                                            ["#", "w-10", "text-left"],
                                            ["Item", "", "text-left"],
                                            ["Category", "", "text-left"],
                                            ["Unit", "", "text-left"],
                                            ["Unit Price", "", "text-left"],
                                            ["Stock", "", "text-left"],
                                            ["Min Lvl", "", "text-left"],
                                            ["Status", "", "text-left"],
                                            ["Actions", "", "text-center"],
                                        ].map(([label, w, align]) => (
                                            <th key={label}
                                                className={`px-2 py-3 text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 ${w} ${align}`}>
                                                {label}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                                    {loading ? (
                                        <ListLoader colSpanSet={9} />
                                    ) : error ? (
                                        <tr><td colSpan={9} className="px-6 py-8 text-center text-red-600">{error}</td></tr>
                                    ) : noItemFound ? (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                                                    <Package className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <h3 className="text-sm font-bold text-gray-700 mb-2">No Items Found</h3>
                                            </td>
                                        </tr>
                                    ) : (
                                        items.map((item, idx) => (
                                            <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">

                                                <td className={tdStyle}>{(page - 1) * rowsPerPage + idx + 1}</td>

                                                <td className={tdStyle}>
                                                    <p className="font-medium text-black truncate max-w-50">{item.name}</p>
                                                    <p className="text-xs text-gray-400 truncate max-w-50">{item.code}</p>
                                                </td>

                                                <td className={tdStyle}>
                                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                        {item.category}
                                                    </span>
                                                </td>

                                                <td className={tdStyle}>
                                                    <span className="text-gray-600 whitespace-nowrap">{item.unit}</span>
                                                </td>

                                                {/* Unit Price */}
                                                <td className={tdStyle}>
                                                    <span className="text-gray-700 font-semibold whitespace-nowrap">
                                                        ₹{Number(item.price).toFixed(2)}
                                                    </span>
                                                </td>

                                                <td className={tdStyle}>
                                                    <div className="flex items-center gap-1.5">
                                                        <span className={`text-sm font-bold w-7 shrink-0 ${item.totalStock < item.minLevel ? "text-red-500"
                                                            : item.totalStock < item.minLevel * 1.5 ? "text-orange-500"
                                                                : "text-gray-800"
                                                            }`}>
                                                            {item.totalStock}
                                                        </span>
                                                        <div className="w-16 bg-gray-100 rounded-full h-2 shrink-0">
                                                            <div
                                                                className={`${stockBarColor(item.totalStock, item.minLevel)} h-2 rounded-full transition-all`}
                                                                style={{ width: `${Math.min(item.minLevel > 0 ? (item.totalStock / (item.minLevel * 2)) * 100 : 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className={tdStyle}>
                                                    <span className="text-gray-600">{item.minLevel}</span>
                                                </td>

                                                <td className={tdStyle}>
                                                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${item.status === "ACTIVE" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                                        }`}>
                                                        {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                                    </span>
                                                </td>

                                                <td className={tdStyle}>
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
                                        className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value={10}>10</option>
                                        <option value={25}>25</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                {(() => {
                                    const pageBtn = (n) => (
                                        <button key={n} onClick={() => setPage(n)}
                                            className={`px-3 py-1 rounded transition-all ${page === n ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                                            {n}
                                        </button>
                                    );
                                    const ellipsis = (key) => (
                                        <span key={key} className="px-2 py-1 text-gray-400">…</span>
                                    );

                                    if (totalPages <= 7) {
                                        return [...Array(totalPages)].map((_, i) => pageBtn(i + 1));
                                    }

                                    const pages = [];
                                    pages.push(pageBtn(1));

                                    if (page > 3) pages.push(ellipsis("left"));

                                    const start = Math.max(2, page - 1);
                                    const end = Math.min(totalPages - 1, page + 1);
                                    for (let n = start; n <= end; n++) pages.push(pageBtn(n));

                                    if (page < totalPages - 2) pages.push(ellipsis("right"));

                                    pages.push(pageBtn(totalPages));
                                    return pages;
                                })()}
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || loading}
                                    className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Mobile Pagination */}
                    <div className="xl:hidden border-t border-gray-200 px-4 py-4">
                        <div className="flex flex-col gap-4">
                            <div className="text-center text-sm text-gray-700">
                                {totalItems === 0
                                    ? "No items"
                                    : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalItems)} of ${totalItems}`}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <span className="text-sm text-gray-700">Rows:</span>
                                <select value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); resetPage(); }}
                                    className="px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                </select>
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || loading}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0 || loading}
                                    className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all">
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