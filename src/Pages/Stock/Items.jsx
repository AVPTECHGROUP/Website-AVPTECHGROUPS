import React, { useEffect, useState } from "react";
import {
    Package, PackageCheck, PackageX, Layers, Plus, Search,
    ChevronLeft, ChevronRight, Eye, Edit, CheckCircle, XCircle,
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
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-blue-100 text-blue-700",
    UNIFORM: "bg-orange-100 text-orange-700",
};

const stockBarColor = (qty, min) => {
    if (qty === null || qty === 0) return "bg-red-500";
    if (qty <= min / 2) return "bg-red-500";
    if (qty < min) return "bg-orange-400";
    return "bg-blue-500";
};

export default function Items() {
    const [itemsData, setItemsData] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [togglingId, setTogglingId] = useState(null);
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All Categories");
    const [statusFilter, setStatusFilter] = useState("All Status");
    const [page, setPage] = useState(1);
    const [isNewItemOpen, setIsNewItemOpen] = useState(false);
    const [editItemData, setEditItemData] = useState(null);
    const [viewItemData, setViewItemData] = useState(null);
    const [isViewItemOpen, setIsViewItemOpen] = useState(false);
    const [allStats, setAllStats] = useState({ total: 0, active: 0, lowStock: 0, categories: 0 });

    // Fetch ALL items (no filters, large size) just for stats cards
    const fetchStats = async () => {
        try {
            const res = await getItemsList(0, 1000, "", "", "");
            const all = res.items.map((item) => ({
                category: item.category,
                status: item.status,
                totalStock: item.totalQuantity,
                minLevel: item.minimumStockLevel,
            }));
            setAllStats({
                total: res.pagination.totalElements || all.length,
                active: all.filter((i) => i.status === "ACTIVE").length,
                lowStock: all.filter((i) => i.totalStock < i.minLevel).length,
                categories: new Set(all.map((i) => i.category)).size,
            });
        } catch (err) {
            console.error("Stats fetch error:", err);
        }
    };

    const fetchItems = async () => {
        try {
            setLoading(true);
            const res = await getItemsList(
                page - 1,
                ROWS_PER_PAGE,
                search,
                categoryFilter === "All Categories" ? "" : categoryFilter,
                statusFilter === "All Status" ? "" : statusFilter
            );
            const formattedItems = res.items.map((item) => ({
                id: item.id,
                code: item.itemCode,
                name: item.itemName,
                category: item.category,
                unit: item.unit,
                totalStock: item.totalQuantity,
                minLevel: item.minimumStockLevel,
                description: item.description,
                status: item.status,
                stores: [],
            }));
            setItemsData(formattedItems);
            setPagination(res.pagination);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load items");
        } finally {
            setLoading(false);
        }
    };

    // Stats fetched once on mount and after any create/update/toggle
    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchItems();
    }, [page, search, categoryFilter, statusFilter]);

    const filtered = itemsData.filter((item) => {
        const matchSearch =
            item.name.toLowerCase().includes(search.toLowerCase()) ||
            String(item.id).toLowerCase().includes(search.toLowerCase());
        const matchCat = categoryFilter === "All Categories" || item.category === categoryFilter;
        const matchStatus = statusFilter === "All Status" || item.status === (statusFilter === "Active" ? "ACTIVE" : "INACTIVE");
        return matchSearch && matchCat && matchStatus;
    });

    const totalPages = pagination.totalPages || 1;
    const paginated = filtered;
    const categories = ["All Categories", ...Array.from(new Set(itemsData.map((i) => i.category)))];

    const stats = [
        { key: "Total Items", val: allStats.total, icon: Package, txColor: "text-blue-600", bgColor: "bg-blue-50" },
        { key: "Active Items", val: allStats.active, icon: PackageCheck, txColor: "text-green-600", bgColor: "bg-green-50" },
        { key: "Low Stock", val: allStats.lowStock, icon: PackageX, txColor: "text-red-500", bgColor: "bg-red-50" },
        { key: "Categories", val: allStats.categories, icon: Layers, txColor: "text-purple-600", bgColor: "bg-purple-50" },
    ];

    const getActionOptions = (item) => [
        {
            value: "view",
            label: "View",
            icon: Eye,
            text: "text-blue-600",
            bg: "bg-blue-50",
            hover: "hover:bg-blue-100",
        },
        {
            value: "edit",
            label: "Edit",
            icon: Edit,
            text: "text-orange-600",
            bg: "bg-orange-50",
            hover: "hover:bg-orange-100",
        },
        {
            value: "toggleStatus",
            label: togglingId === item.id
                ? (item.status === "ACTIVE" ? "Deactivating..." : "Activating...")
                : (item.status === "ACTIVE" ? "Deactivate" : "Activate"),
            icon: item.status === "ACTIVE" ? XCircle : CheckCircle,
            text: item.status === "ACTIVE" ? "text-red-600" : "text-green-600",
            bg: item.status === "ACTIVE" ? "bg-red-50" : "bg-green-50",
            hover: item.status === "ACTIVE" ? "hover:bg-red-100" : "hover:bg-green-100",
            disabled: togglingId === item.id,
        },
    ];

    const callAllActions = async (optVal, item) => {
        if (optVal === "view") {
            setViewItemData(item);
            setIsViewItemOpen(true);
        } else if (optVal === "edit") {
            setEditItemData(item);
            setIsNewItemOpen(true);
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
                await fetchItems();
                await fetchStats();
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
                itemCode: payload.itemCode ?? payload.code,
                itemName: payload.itemName ?? payload.name,
                category: payload.category,
                unit: payload.unit,
                minimumStockLevel: payload.minimumStockLevel ?? payload.minLevel,
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
            await fetchItems();
            await fetchStats();
        } catch (err) {
            console.error(err);
            toast.error(editItemData ? "Failed to update item" : "Failed to create item");
            throw err;
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stock Items</h1>
                <p className="text-gray-500 text-sm mt-1">Manage inventory items, categories, stock levels and store distribution.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
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

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold text-gray-800 text-lg">Stock Items</h2>
                    </div>
                    <button
                        onClick={() => { setEditItemData(null); setIsNewItemOpen(true); }}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit"
                    >
                        <Plus className="w-4 h-4" />
                        New Item
                    </button>

                    {/* New Item Modal */}
                    <NewItem
                        isOpen={isNewItemOpen}
                        onClose={() => { setIsNewItemOpen(false); setEditItemData(null); }}
                        initialData={editItemData}
                        onSave={handleSaveItem}
                        saving={saving}
                    />

                    {/* View Item Modal */}
                    <ViewItem
                        isOpen={isViewItemOpen}
                        onClose={() => { setIsViewItemOpen(false); setViewItemData(null); }}
                        item={viewItemData}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
                        />
                    </div>
                    <select
                        value={categoryFilter}
                        onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-fit"
                    >
                        {categories.map((c) => <option key={c}>{c}</option>)}
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-fit"
                    >
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Inactive</option>
                    </select>
                </div>

                {/* Desktop Table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full min-w-200">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-3 text-left w-8">#</th>
                                <th className="px-5 py-3 text-left">Item</th>
                                <th className="px-5 py-3 text-left">Category</th>
                                <th className="px-5 py-3 text-left">Unit</th>
                                <th className="px-5 py-3 text-left">Total Stock</th>
                                <th className="px-5 py-3 text-left">Min Level</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <ListLoader rows={5} avatar={false} />
                            ) : paginated.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-5 py-10 text-center text-gray-400 text-sm">No items found.</td>
                                </tr>
                            ) : (
                                paginated.map((item, idx) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-blue-50/40 transition-colors"
                                    >
                                        <td className="px-5 py-4 text-sm text-gray-400">{(page - 1) * ROWS_PER_PAGE + idx + 1}</td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.code}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                {item.category}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.unit}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-sm font-bold w-6 ${item.totalStock < item.minLevel ? "text-red-500" : item.totalStock < item.minLevel * 1.5 ? "text-orange-500" : "text-gray-800"}`}>
                                                    {item.totalStock}
                                                </span>
                                                <div className="w-20 bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`${stockBarColor(item.totalStock, item.minLevel)} h-2 rounded-full transition-all`}
                                                        style={{ width: `${Math.min((item.totalStock / (item.minLevel * 2)) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.minLevel}</td>
                                        <td className="px-5 py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                                {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
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

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {loading ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : paginated.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">No items found.</p>
                    ) : (
                        paginated.map((item) => (
                            <div
                                key={item.id}
                                className="px-4 py-4 space-y-2 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.code}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${item.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                                        {item.status === "ACTIVE" ? "Active" : "Inactive"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                        {item.category}
                                    </span>
                                    <span className="text-xs text-gray-500">{item.unit}</span>
                                    <span className="text-xs text-gray-500">
                                        Stock: <span className={`font-bold ${item.totalStock < item.minLevel ? "text-red-500" : "text-gray-700"}`}>{item.totalStock}</span>
                                        {" "}/ Min: {item.minLevel}
                                    </span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1.5">
                                    <div
                                        className={`${stockBarColor(item.totalStock, item.minLevel)} h-1.5 rounded-full`}
                                        style={{ width: `${Math.min((item.totalStock / (item.minLevel * 2)) * 100, 100)}%` }}
                                    />
                                </div>
                                <div className="pt-1">
                                    <ActionDropDownComp
                                        actionOptions={getActionOptions(item)}
                                        onAction={(optVal) => callAllActions(optVal, item)}
                                    />
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100">
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setPage(i + 1)}
                                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${page === i + 1 ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"}`}
                            >
                                {i + 1}
                            </button>
                        ))}
                        <button
                            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                    <p className="text-sm text-gray-400">
                        Showing {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, pagination.totalElements || 0)} of {pagination.totalElements || 0} items
                    </p>
                </div>
            </div>
        </div>
    );
}