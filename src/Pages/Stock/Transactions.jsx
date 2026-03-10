import React, { useState, useEffect, useCallback } from "react";
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    ArrowLeftRight,
    Store,
    Package,
    TrendingDown,
    Activity,
    ChevronDown,
    Plus,
    Minus,
    Repeat2,
    RefreshCw,
    Inbox,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import TransferStock from "../../Components/Stock/TransferStock";
import { getActiveStores, getItemsList, getItemStockOverview } from "../../Api/StockApi";

const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-blue-100 text-blue-700",
    UNIFORM: "bg-orange-100 text-orange-700",
    BOOKS: "bg-yellow-100 text-yellow-700",
    FURNITURE: "bg-amber-100 text-amber-700",
};

const getAlert = (qty, min) => {
    if (qty <= min / 2) return { label: "Critical", cls: "bg-red-100 text-red-600 border border-red-200" };
    if (qty < min) return { label: "Low", cls: "bg-orange-100 text-orange-600 border border-orange-200" };
    return { label: "OK", cls: "bg-green-100 text-green-700 border border-green-200" };
};

const stockBarColor = (qty, min) => {
    if (qty <= min / 2) return "bg-red-500";
    if (qty < min) return "bg-orange-400";
    return "bg-blue-500";
};

const ALL_STORES_ID = "ALL";

export default function Transactions() {

    const [stores, setStores] = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);
    const [selectedStoreId, setSelectedStoreId] = useState(ALL_STORES_ID);

    // Raw overview data cached — shape: { item, storeBreakdown }[]
    // Fetched ONCE, filtering done client-side on store change
    const [rawOverview, setRawOverview] = useState([]);
    const [storeItems, setStoreItems] = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError, setItemsError] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState("in");
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // ── Load stores once ──────────────────────────────────────────
    useEffect(() => {
        setStoresLoading(true);
        getActiveStores()
            .then((res) => setStores(res?.data ?? []))
            .catch(() => { })
            .finally(() => setStoresLoading(false));
    }, []);

    // ── Build storeItems from cached rawOverview whenever store filter changes ──
    // This is pure client-side filtering — NO extra API calls
    const applyFilter = useCallback((overview, storeId) => {
        const result = [];
        overview.forEach(({ item: ov, storeBreakdown }) => {
            if (!storeBreakdown?.length) return;

            if (storeId === ALL_STORES_ID) {
                const totalQty = storeBreakdown.reduce((sum, s) => sum + (s.quantity ?? 0), 0);
                const storeNames = storeBreakdown.map((s) => s.storeName).join(", ");
                result.push({
                    id: ov.itemId,
                    itemCode: ov.itemCode,
                    itemName: ov.itemName,
                    category: ov.category,
                    unit: ov.unit,
                    minimumStockLevel: ov.minimumStockLevel,
                    quantity: totalQty,
                    isBelowMinimum: ov.isBelowMinimum,
                    storeNames,
                });
            } else {
                const storeRow = storeBreakdown.find((s) => s.storeId === Number(storeId));
                if (!storeRow) return;
                result.push({
                    id: ov.itemId,
                    itemCode: ov.itemCode,
                    itemName: ov.itemName,
                    category: ov.category,
                    unit: ov.unit,
                    minimumStockLevel: ov.minimumStockLevel,
                    quantity: storeRow.quantity,
                    isBelowMinimum: storeRow.isBelowMinimum,
                    storeNames: null,
                });
            }
        });
        setStoreItems(result);
    }, []);

    // ── Fetch ALL overview data — called only ONCE (or on manual refresh) ──
    const fetchAllOverview = useCallback(async () => {
        setItemsLoading(true);
        setItemsError("");
        setStoreItems([]);
        setRawOverview([]);

        try {
            // Step 1: Get all active items — single call
            const { items: allItems } = await getItemsList(0, 200, "", "", "ACTIVE");
            if (!allItems || allItems.length === 0) return;

            // Step 2: Fetch all overviews in parallel — still N calls but
            // this only happens ONCE. Store changes are handled client-side.
            const overviewResults = await Promise.allSettled(
                allItems.map((item) => getItemStockOverview(item.id))
            );

            // Cache the raw results
            const raw = overviewResults
                .filter((r) => r.status === "fulfilled")
                .map((r) => r.value); // each: { item, storeBreakdown }

            setRawOverview(raw);
            applyFilter(raw, selectedStoreId);
        } catch {
            setItemsError("Failed to load stock data.");
        } finally {
            setItemsLoading(false);
        }
    }, []); // eslint-disable-line — intentionally no deps, called once

    // ── On mount: fetch once ──────────────────────────────────────
    useEffect(() => {
        fetchAllOverview();
    }, []); // eslint-disable-line

    // ── On store filter change: just re-filter, NO API call ───────
    useEffect(() => {
        if (rawOverview.length > 0) {
            applyFilter(rawOverview, selectedStoreId);
        }
    }, [selectedStoreId, rawOverview, applyFilter]);

    // ── After stock IN/OUT/transfer: refresh overview ─────────────
    const handleStockChange = useCallback(() => {
        fetchAllOverview();
    }, [fetchAllOverview]);

    const totalItems = storeItems.length;
    const okItems    = storeItems.filter((i) => i.quantity >= i.minimumStockLevel).length;
    const lowItems   = storeItems.filter((i) => i.quantity < i.minimumStockLevel && i.quantity > i.minimumStockLevel / 2).length;
    const critItems  = storeItems.filter((i) => i.quantity <= i.minimumStockLevel / 2).length;

    const stats = [
        { key: "Total Items",    val: itemsLoading ? "…" : totalItems, icon: Package,       txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
        { key: "OK Stock",       val: itemsLoading ? "…" : okItems,    icon: Activity,      txColor: "text-green-600",  bgColor: "bg-green-50"  },
        { key: "Low Stock",      val: itemsLoading ? "…" : lowItems,   icon: TrendingDown,  txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: "Critical Stock", val: itemsLoading ? "…" : critItems,  icon: ArrowDownToLine, txColor: "text-red-500",  bgColor: "bg-red-50"    },
    ];

    const openModal = (type) => {
        if (type === "transfer") { setIsTransferOpen(true); return; }
        setModalType(type);
        setIsModalOpen(true);
    };

    const actionOptions = [
        { value: "in",       label: "IN",       icon: Plus,   text: "text-white",    bg: "bg-green-600", hover: "hover:bg-green-700"  },
        { value: "out",      label: "OUT",      icon: Minus,  text: "text-white",    bg: "bg-red-500",   hover: "hover:bg-red-600"    },
        { value: "transfer", label: "Transfer", icon: Repeat2, text: "text-blue-700", bg: "bg-blue-50",   hover: "hover:bg-blue-100"   },
    ];

    const transactionCards = [
        { icon: <ArrowDownToLine className="w-8 h-8 text-green-600" />, bg: "bg-green-50", border: "border-green-200", title: "Stock IN",  titleColor: "text-green-600", sub: "Add stock to a store",        type: "in"       },
        { icon: <ArrowUpFromLine className="w-8 h-8 text-red-500"   />, bg: "bg-red-50",   border: "border-red-200",   title: "Stock OUT", titleColor: "text-red-500",   sub: "Remove stock from a store",   type: "out"      },
        { icon: <ArrowLeftRight  className="w-8 h-8 text-blue-600"  />, bg: "bg-blue-50",  border: "border-blue-200",  title: "Transfer",  titleColor: "text-blue-600",  sub: "Move between stores",         type: "transfer" },
    ];

    const selectedStore = stores.find((s) => String(s.id) === selectedStoreId) ?? null;
    const isAllStores   = selectedStoreId === ALL_STORES_ID;

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

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

            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transactions</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage stock movements — add, remove or transfer inventory across stores.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {transactionCards.map((card) => (
                    <button
                        key={card.title}
                        onClick={() => openModal(card.type)}
                        className={`flex items-center gap-4 bg-white border ${card.border} rounded-2xl px-5 py-5 shadow-sm hover:shadow-md transition-all text-left w-full`}
                    >
                        <div className={`w-14 h-14 ${card.bg} rounded-xl flex items-center justify-center shrink-0`}>
                            {card.icon}
                        </div>
                        <div>
                            <p className={`text-xl font-bold ${card.titleColor}`}>{card.title}</p>
                            <p className="text-sm text-gray-500 mt-0.5">{card.sub}</p>
                        </div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {itemsLoading
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

                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-xl shadow-sm shrink-0">
                            <Store className="w-4 h-4" />
                            <span className="text-lg font-semibold whitespace-nowrap">Store Stock View</span>
                        </div>

                        <div className="relative">
                            {storesLoading ? (
                                <div className="border-2 border-blue-200 bg-blue-50 text-blue-400 text-sm font-semibold px-4 py-2 rounded-xl min-w-50">
                                    Loading stores…
                                </div>
                            ) : (
                                <>
                                    <select
                                        value={selectedStoreId}
                                        onChange={(e) => setSelectedStoreId(e.target.value)}
                                        className="appearance-none border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 focus:bg-white text-blue-800 font-semibold text-sm pl-4 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all min-w-50 cursor-pointer"
                                    >
                                        <option value={ALL_STORES_ID}>All Stores</option>
                                        {stores.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.storeName.trim()}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 pointer-events-none" />
                                </>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={fetchAllOverview}
                        disabled={itemsLoading}
                        title="Refresh"
                        className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50 self-end sm:self-auto"
                    >
                        <RefreshCw className={`w-4 h-4 text-gray-500 ${itemsLoading ? "animate-spin" : ""}`} />
                    </button>
                </div>

                {/* Store info strip */}
                {!isAllStores && selectedStore && (
                    <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                            {selectedStore.storeCode?.trim()}
                        </span>
                        <span className="text-xs text-blue-600">{selectedStore.location?.trim()}</span>
                        {selectedStore.description && (
                            <span className="text-xs text-blue-400 hidden sm:inline">— {selectedStore.description}</span>
                        )}
                    </div>
                )}

                {isAllStores && (
                    <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2">
                        <span className="text-xs font-semibold text-blue-700">
                            Showing aggregated stock across all {stores.length} active stores
                        </span>
                    </div>
                )}

                {itemsError && (
                    <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600 flex items-center gap-2">
                        <span>{itemsError}</span>
                        <button onClick={fetchAllOverview} className="underline font-semibold hover:text-red-700">Retry</button>
                    </div>
                )}

                {/* Desktop Table */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full min-w-175">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-3 text-left">Item</th>
                                <th className="px-5 py-3 text-left">Category</th>
                                <th className="px-5 py-3 text-left">Unit</th>
                                <th className="px-5 py-3 text-left">{isAllStores ? "Total Qty" : "Qty in Store"}</th>
                                {isAllStores && <th className="px-5 py-3 text-left">Stocked In</th>}
                                <th className="px-5 py-3 text-left">Min Level</th>
                                <th className="px-5 py-3 text-left">Alert</th>
                                <th className="px-5 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemsLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-5 py-4">
                                            <div className="h-3.5 bg-gray-200 rounded w-36 mb-1.5" />
                                            <div className="h-2.5 bg-gray-100 rounded w-20" />
                                        </td>
                                        <td className="px-5 py-4"><div className="h-5 bg-gray-200 rounded-full w-20" /></td>
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-12" /></td>
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-28" /></td>
                                        {isAllStores && <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-32" /></td>}
                                        <td className="px-5 py-4"><div className="h-3.5 bg-gray-200 rounded w-8" /></td>
                                        <td className="px-5 py-4"><div className="h-5 bg-gray-200 rounded-full w-16" /></td>
                                        <td className="px-5 py-4"><div className="h-7 bg-gray-200 rounded-lg w-20" /></td>
                                    </tr>
                                ))
                            ) : storeItems.length === 0 ? (
                                <tr>
                                    <td colSpan={isAllStores ? 8 : 7} className="px-5 py-14 text-center">
                                        <div className="flex flex-col items-center gap-2 text-gray-400">
                                            <Inbox className="w-8 h-8 opacity-30" />
                                            <p className="text-sm font-medium">No items stocked in this store</p>
                                            <p className="text-xs">Add stock via Stock IN to get started</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                storeItems.map((item) => {
                                    const qty = item.quantity ?? 0;
                                    const min = item.minimumStockLevel ?? 0;
                                    const alert = getAlert(qty, min);
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
                                                <p className="text-xs text-gray-400">{item.itemCode}</p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">{item.unit}</td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className={`text-sm font-bold w-8 ${qty < min ? "text-red-500" : "text-gray-800"}`}>
                                                        {qty}
                                                    </span>
                                                    <div className="w-24 bg-gray-100 rounded-full h-2">
                                                        <div
                                                            className={`${stockBarColor(qty, min)} h-2 rounded-full transition-all`}
                                                            style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                            {isAllStores && (
                                                <td className="px-5 py-4 text-xs text-gray-500 max-w-45">
                                                    <span className="truncate block" title={item.storeNames}>{item.storeNames || "—"}</span>
                                                </td>
                                            )}
                                            <td className="px-5 py-4 text-sm text-gray-600">{min}</td>
                                            <td className="px-5 py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${alert.cls}`}>
                                                    {alert.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
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

                {/* Mobile Cards */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {itemsLoading ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : storeItems.length === 0 ? (
                        <div className="flex flex-col items-center gap-2 text-gray-400 py-12">
                            <Inbox className="w-8 h-8 opacity-30" />
                            <p className="text-sm font-medium">No items stocked in this store</p>
                        </div>
                    ) : (
                        storeItems.map((item) => {
                            const qty = item.quantity ?? 0;
                            const min = item.minimumStockLevel ?? 0;
                            const alert = getAlert(qty, min);
                            return (
                                <div key={item.id} className="px-4 py-4 space-y-2">
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm">{item.itemName}</p>
                                            <p className="text-xs text-gray-400">{item.itemCode}</p>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold shrink-0 ${alert.cls}`}>
                                            {alert.label}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}>
                                            {item.category}
                                        </span>
                                        <span className="text-xs text-gray-500">{item.unit}</span>
                                        <span className="text-xs text-gray-500">
                                            Qty: <span className={`font-bold ${qty < min ? "text-red-500" : "text-gray-700"}`}>{qty}</span> / Min: {min}
                                        </span>
                                    </div>
                                    {isAllStores && item.storeNames && (
                                        <p className="text-xs text-gray-400 truncate">{item.storeNames}</p>
                                    )}
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`${stockBarColor(qty, min)} h-1.5 rounded-full`}
                                            style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 100, 100)}%` }}
                                        />
                                    </div>
                                    <div className="pt-1">
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
            </div>
        </div>
    );
}