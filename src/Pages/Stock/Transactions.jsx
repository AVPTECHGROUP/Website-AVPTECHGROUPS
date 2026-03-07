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
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import TransferStock from "../../Components/Stock/TransferStock";
import { getActiveStores, getItemsList } from "../../Api/StockApi";

// ─── helpers ────────────────────────────────────────────────────────────────

const categoryColors = {
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB:        "bg-purple-100 text-purple-700",
    SPORTS:     "bg-blue-100 text-blue-700",
    UNIFORM:    "bg-orange-100 text-orange-700",
    BOOKS:      "bg-yellow-100 text-yellow-700",
    FURNITURE:  "bg-amber-100 text-amber-700",
};

const getAlert = (qty, min) => {
    if (qty <= min / 2) return { label: "Critical", cls: "bg-red-100 text-red-600 border border-red-200" };
    if (qty < min)      return { label: "Low",      cls: "bg-orange-100 text-orange-600 border border-orange-200" };
    return                     { label: "OK",       cls: "bg-green-100 text-green-700 border border-green-200" };
};

const stockBarColor = (qty, min) => {
    if (qty <= min / 2) return "bg-red-500";
    if (qty < min)      return "bg-orange-400";
    return "bg-blue-500";
};

// ─── component ──────────────────────────────────────────────────────────────

export default function Transactions() {

    // ── stores dropdown state ──
    const [stores, setStores]               = useState([]);
    const [storesLoading, setStoresLoading] = useState(false);
    const [storesError, setStoresError]     = useState("");
    const [selectedStore, setSelectedStore] = useState(null); // full store object

    // ── table items state ──
    const [items, setItems]               = useState([]);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [itemsError, setItemsError]     = useState("");

    // ── modals ──
    const [isModalOpen, setIsModalOpen]       = useState(false);
    const [modalType, setModalType]           = useState("in");
    const [isTransferOpen, setIsTransferOpen] = useState(false);

    // ── fetch stores on mount ─────────────────────────────────────────────
    useEffect(() => {
        setStoresLoading(true);
        setStoresError("");
        getActiveStores()
            .then((res) => {
                const list = res?.data ?? [];
                setStores(list);
                if (list.length > 0) setSelectedStore(list[0]);
            })
            .catch(() => setStoresError("Failed to load stores."))
            .finally(() => setStoresLoading(false));
    }, []);

    // ── fetch items whenever selected store changes ───────────────────────
    // NOTE: When your backend exposes GET /stock/stores/:id/items,
    // replace getItemsList() below with that per-store endpoint.
    const fetchItems = useCallback(() => {
        if (!selectedStore) return;
        setItemsLoading(true);
        setItemsError("");
        getItemsList(0, 100, "", "", "ACTIVE")
            .then(({ items: data }) => setItems(data))
            .catch(() => setItemsError("Failed to load stock data."))
            .finally(() => setItemsLoading(false));
    }, [selectedStore]);

    useEffect(() => { fetchItems(); }, [fetchItems]);

    // ── derived stats ─────────────────────────────────────────────────────
    const totalItems = items.length;
    const okItems    = items.filter((i) => i.totalQuantity >= i.minimumStockLevel).length;
    const lowItems   = items.filter((i) => i.totalQuantity < i.minimumStockLevel && i.totalQuantity > i.minimumStockLevel / 2).length;
    const critItems  = items.filter((i) => i.totalQuantity <= i.minimumStockLevel / 2).length;

    const stats = [
        { key: "Total Items",    val: totalItems, icon: Package,         txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
        { key: "OK Stock",       val: okItems,    icon: Activity,        txColor: "text-green-600",  bgColor: "bg-green-50"  },
        { key: "Low Stock",      val: lowItems,   icon: TrendingDown,    txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: "Critical Stock", val: critItems,  icon: ArrowDownToLine, txColor: "text-red-500",    bgColor: "bg-red-50"    },
    ];

    // ── modal helpers ─────────────────────────────────────────────────────
    const openModal = (type) => {
        if (type === "transfer") { setIsTransferOpen(true); return; }
        setModalType(type);
        setIsModalOpen(true);
    };

    const handleStockConfirm = (data) => {
        console.log(`Stock ${modalType.toUpperCase()} confirmed:`, data);
        fetchItems(); // refresh table after stock change
    };

    const handleTransferConfirm = (data) => {
        console.log("Transfer confirmed:", data);
        fetchItems(); // refresh table after transfer
    };

    // ── static config ─────────────────────────────────────────────────────
    const actionOptions = [
        { value: "in",       label: "IN",      icon: Plus,    text: "text-white",    bg: "bg-green-600", hover: "hover:bg-green-700" },
        { value: "out",      label: "OUT",      icon: Minus,   text: "text-white",    bg: "bg-red-500",   hover: "hover:bg-red-600"   },
        { value: "transfer", label: "Transfer", icon: Repeat2, text: "text-blue-700", bg: "bg-blue-50",   hover: "hover:bg-blue-100"  },
    ];

    const transactionCards = [
        { icon: <ArrowDownToLine className="w-8 h-8 text-green-600" />, bg: "bg-green-50", border: "border-green-200", title: "Stock IN",  titleColor: "text-green-600", sub: "Add stock to a store",      type: "in"       },
        { icon: <ArrowUpFromLine  className="w-8 h-8 text-red-500"   />, bg: "bg-red-50",   border: "border-red-200",   title: "Stock OUT", titleColor: "text-red-500",   sub: "Remove stock from a store", type: "out"      },
        { icon: <ArrowLeftRight   className="w-8 h-8 text-blue-600"  />, bg: "bg-blue-50",  border: "border-blue-200",  title: "Transfer",  titleColor: "text-blue-600",  sub: "Move between stores",       type: "transfer" },
    ];

    // ─────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

            {/* Modals */}
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
            />

            {/* Page header */}
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Transactions</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Manage stock movements — add, remove or transfer inventory across stores.
                </p>
            </div>

            {/* Top action cards */}
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

            {/* Stats cards */}
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

            {/* Store Stock Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                {/* Table toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Store className="w-5 h-5 text-blue-500" />
                        <h2 className="font-semibold text-gray-800 text-lg">Store Stock View</h2>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Refresh */}
                        <button
                            onClick={fetchItems}
                            disabled={itemsLoading}
                            title="Refresh stock data"
                            className="p-2 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 text-gray-500 ${itemsLoading ? "animate-spin" : ""}`} />
                        </button>

                        {/* Store dropdown — API-driven */}
                        <div className="relative">
                            <Store className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none z-10" />

                            {storesLoading ? (
                                <div className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-400 min-w-48">
                                    Loading stores…
                                </div>
                            ) : storesError ? (
                                <div className="pl-9 pr-4 py-2 text-sm border border-red-200 rounded-lg bg-red-50 text-red-500 min-w-48">
                                    {storesError}
                                </div>
                            ) : (
                                <>
                                    <select
                                        value={selectedStore?.id ?? ""}
                                        onChange={(e) => {
                                            const found = stores.find((s) => String(s.id) === e.target.value);
                                            if (found) setSelectedStore(found);
                                        }}
                                        className="pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 appearance-none min-w-48"
                                    >
                                        {stores.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.storeName.trim()}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Selected store info badge */}
                {selectedStore && (
                    <div className="px-5 py-2 bg-blue-50 border-b border-blue-100 flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                            {selectedStore.storeCode?.trim()}
                        </span>
                        <span className="text-xs text-blue-600">{selectedStore.location?.trim()}</span>
                        {selectedStore.description && (
                            <span className="text-xs text-blue-400 hidden sm:inline">
                                — {selectedStore.description}
                            </span>
                        )}
                    </div>
                )}

                {/* Items error banner */}
                {itemsError && (
                    <div className="px-5 py-3 bg-red-50 border-b border-red-100 text-sm text-red-600 flex items-center gap-2">
                        <span>{itemsError}</span>
                        <button onClick={fetchItems} className="underline font-semibold hover:text-red-700">
                            Retry
                        </button>
                    </div>
                )}

                {/* ── Desktop Table ── */}
                <div className="overflow-x-auto hidden sm:block">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                <th className="px-5 py-3 text-left">Item</th>
                                <th className="px-5 py-3 text-left">Category</th>
                                <th className="px-5 py-3 text-left">Unit</th>
                                <th className="px-5 py-3 text-left">Available Qty</th>
                                <th className="px-5 py-3 text-left">Min Level</th>
                                <th className="px-5 py-3 text-left">Alert</th>
                                <th className="px-5 py-3 text-left">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {itemsLoading ? (
                                <ListLoader rows={5} avatar={false} />
                            ) : items.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">
                                        No items found for this store.
                                    </td>
                                </tr>
                            ) : (
                                items.map((item) => {
                                    const qty   = item.totalQuantity ?? 0;
                                    const min   = item.minimumStockLevel ?? 0;
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
                                                            style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 0, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
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

                {/* ── Mobile Cards ── */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {itemsLoading ? (
                        <div className="px-4 py-4 space-y-3">
                            {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
                        </div>
                    ) : items.length === 0 ? (
                        <p className="text-center text-gray-400 text-sm py-10">No items found for this store.</p>
                    ) : (
                        items.map((item) => {
                            const qty   = item.totalQuantity ?? 0;
                            const min   = item.minimumStockLevel ?? 0;
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
                                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                                        <div
                                            className={`${stockBarColor(qty, min)} h-1.5 rounded-full`}
                                            style={{ width: `${Math.min(min > 0 ? (qty / (min * 2)) * 100 : 0, 100)}%` }}
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