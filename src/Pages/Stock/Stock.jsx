import React, { useState } from "react";
import {
    Store,
    Package,
    AlertTriangle,
    ArrowLeftRight,
    Plus,
    TrendingDown,
    BarChart3,
    Clock,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import StockManagementCard from "../../Components/Stock/StockManagementCard";
import { useNavigate } from "react-router-dom";


// Sample Data
const recentMovements = [
    { item: "A4 Copy Paper", type: "IN", qty: "+50", store: "Main Store", time: "10 min ago" },
    { item: "Cricket Ball", type: "OUT", qty: "-4", store: "Sports Store", time: "1 hr ago" },
    { item: "Safety Goggles", type: "TRANSFER", qty: "5", store: "Main → Lab", time: "2 hr ago" },
    { item: "Whiteboard Marker", type: "OUT", qty: "-2", store: "Main Store", time: "3 hr ago" },
    { item: "Geometry Box", type: "IN", qty: "+30", store: "Main Store", time: "Yesterday" },
];

const storeSummary = [
    { name: "Main Store", units: 1240, max: 1240, color: "bg-blue-500" },
    { name: "Science Lab Store", units: 380, max: 1240, color: "bg-purple-500" },
    { name: "Sports Store", units: 95, max: 1240, color: "bg-orange-400" },
];

const lowStockItems = [
    { id: "ITM-004", name: "Cricket Ball", category: "SPORTS", store: "Sports Store", available: 2, min: 4, status: "Critical" },
    { id: "ITM-007", name: "Bunsen Burner", category: "LAB", store: "Science Lab Store", available: 1, min: 2, status: "Low" },
    { id: "ITM-002", name: "Whiteboard Marker", category: "STATIONERY", store: "Main Store", available: 8, min: 10, status: "Low" },
    { id: "ITM-011", name: "Safety Goggles", category: "LAB", store: "Science Lab Store", available: 3, min: 5, status: "Low" },
    { id: "ITM-019", name: "Shuttlecock", category: "SPORTS", store: "Sports Store", available: 5, min: 8, status: "Low" },
];

// Helpers
const typeBadge = (type) => {
    if (type === "IN")
        return (
            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold tracking-wide">
                IN
            </span>
        );
    if (type === "OUT")
        return (
            <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 text-xs font-semibold tracking-wide">
                OUT
            </span>
        );
    return (
        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide">
            TRANSFER
        </span>
    );
};

const categoryBadge = (cat) => {
    const map = {
        SPORTS: "bg-blue-100 text-blue-700",
        LAB: "bg-purple-100 text-purple-700",
        STATIONERY: "bg-gray-100 text-gray-700",
    };
    return (
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${map[cat] ?? "bg-gray-100 text-gray-600"}`}>
            {cat}
        </span>
    );
};

const statusBadge = (status) => {
    if (status === "Critical")
        return <span className="px-3 py-1 rounded-full bg-red-100 text-red-600 text-xs font-semibold">Critical</span>;
    return <span className="px-3 py-1 rounded-full bg-orange-100 text-orange-600 text-xs font-semibold">Low</span>;
};

const stockBarColor = (available, min) =>
    available <= min / 2 ? "bg-red-500" : "bg-orange-400";

export default function Stock() {
    const [loading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const navigate = useNavigate()

    const stats = [
        { key: "Total Stores", val: 3, icon: Store, txColor: "text-blue-600", bgColor: "bg-blue-50" },
        { key: "Total Items", val: 24, icon: Package, txColor: "text-purple-600", bgColor: "bg-purple-50" },
        { key: "Low Stock Alerts", val: 5, icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
        { key: "Movements This Month", val: 142, icon: ArrowLeftRight, txColor: "text-green-600", bgColor: "bg-green-50" },
    ];

    return (
        <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">
            <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stock Management</h1>
                <p className="text-gray-500 text-sm mt-1">Monitor inventory, movements and low-stock alerts across all stores.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
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

            {/* ── Low Stock Alert Banner ── */}
            <div className="mb-6 flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <p className="text-sm text-amber-800">
                    <span className="font-bold">5 items</span> are at or below minimum stock level across your stores.
                </p>
                <button onClick={() => navigate('/stock/transactions')} className="ml-auto text-sm text-blue-600 font-semibold hover:underline whitespace-nowrap">
                    View Low Stock →
                </button>
            </div>

            {/* ── Middle Row: Movements + Store Summary ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Recent Movements */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-500" />
                            <h2 className="font-semibold text-gray-800">Recent Movements</h2>
                        </div>
                        <button className="text-sm text-blue-600 font-medium hover:underline">View All →</button>
                    </div>

                    {/* Table header */}
                    <div className="hidden sm:grid grid-cols-5 px-5 py-2 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <span className="col-span-2">Item</span>
                        <span>Type</span>
                        <span>Qty</span>
                        <span>Store</span>
                    </div>

                    {loading ? (
                        <ListLoader rows={5} avatar={false} />
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentMovements.map((m, i) => (
                                <div
                                    key={i}
                                    className="grid grid-cols-2 sm:grid-cols-5 items-center px-5 py-3 hover:bg-blue-50/40 transition-colors"
                                >
                                    <div className="col-span-2 sm:col-span-2">
                                        <p className="text-sm font-semibold text-gray-800">{m.item}</p>
                                        <p className="text-xs text-gray-400 sm:hidden">{m.store} · {m.time}</p>
                                    </div>
                                    <div className="hidden sm:block">{typeBadge(m.type)}</div>
                                    <div className="hidden sm:block text-sm font-bold text-gray-700">{m.qty}</div>
                                    <div className="hidden sm:block">
                                        <p className="text-sm text-gray-600">{m.store}</p>
                                        <p className="text-xs text-gray-400">{m.time}</p>
                                    </div>
                                    <div className="sm:hidden flex items-center justify-end gap-2">
                                        {typeBadge(m.type)}
                                        <span className="text-sm font-bold text-gray-700">{m.qty}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Store-wise Summary */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
                        <BarChart3 className="w-5 h-5 text-purple-500" />
                        <h2 className="font-semibold text-gray-800">Store-wise Stock Summary</h2>
                    </div>
                    <div className="px-5 py-4 space-y-6">
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="shimmerList rounded h-4 w-1/2" />
                                    <div className="shimmerList rounded-full h-3 w-full" />
                                </div>
                            ))
                        ) : (
                            storeSummary.map((s) => (
                                <div key={s.name}>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm font-semibold text-gray-700">{s.name}</span>
                                        </div>
                                        <span className="text-sm font-bold text-gray-800">{s.units.toLocaleString()} units</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3">
                                        <div
                                            className={`${s.color} h-3 rounded-full transition-all duration-700`}
                                            style={{ width: `${(s.units / s.max) * 100}%` }}
                                        />
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
                        <h2 className="font-semibold text-gray-800">Low Stock Items</h2>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
                        {lowStockItems.length} items need attention
                    </span>
                </div>

                {/* Desktop table */}
                <div className="overflow-x-auto">
                    <table className="w-full min-w-160">
                        <thead>
                            <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                <th className="px-5 py-3 text-left">Item</th>
                                <th className="px-5 py-3 text-left">Category</th>
                                <th className="px-5 py-3 text-left">Store</th>
                                <th className="px-5 py-3 text-left">Available</th>
                                <th className="px-5 py-3 text-left">Min Level</th>
                                <th className="px-5 py-3 text-left">Status</th>
                                <th className="px-5 py-3 text-left">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={7}>
                                        <ListLoader rows={3} avatar={false} />
                                    </td>
                                </tr>
                            ) : (
                                lowStockItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-blue-50/40 transition-colors">
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.id}</p>
                                        </td>
                                        <td className="px-5 py-4">{categoryBadge(item.category)}</td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.store}</td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-bold text-gray-800 w-5">{item.available}</span>
                                                <div className="w-24 bg-gray-100 rounded-full h-2">
                                                    <div
                                                        className={`${stockBarColor(item.available, item.min)} h-2 rounded-full`}
                                                        style={{ width: `${Math.min((item.available / item.min) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-sm text-gray-600">{item.min}</td>
                                        <td className="px-5 py-4">{statusBadge(item.status)}</td>
                                        <td className="px-5 py-4">
                                            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
                                                <Plus className="w-3.5 h-3.5" />
                                                Add Stock
                                            </button>
                                        </td>
                                        <StockManagementCard
                                            isOpen={isModalOpen}
                                            onClose={() => setIsModalOpen(false)}
                                            heading="Add Stock (Inward)"
                                            previewLabelText="Current stock:"
                                            previewBgColor="bg-green-50"
                                            previewBorderColor="border-green-200"
                                            previewTextColor="text-green-700"
                                            confirmBtnText="Confirm Stock IN"
                                            confirmBtnBgColor="bg-green-600"
                                            confirmBtnHoverColor="hover:bg-green-700"
                                            onConfirm={(data) => console.log("Submitted:", data)}
                                        />
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards for low stock */}
                <div className="sm:hidden divide-y divide-gray-100">
                    {!loading &&
                        lowStockItems.map((item) => (
                            <div key={item.id} className="px-4 py-4 space-y-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{item.name}</p>
                                        <p className="text-xs text-gray-400">{item.id}</p>
                                    </div>
                                    {statusBadge(item.status)}
                                </div>
                                <div className="flex gap-2 text-xs text-gray-500">
                                    {categoryBadge(item.category)}
                                    <span>{item.store}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Available: <strong>{item.available}</strong> / Min: <strong>{item.min}</strong>
                                    </span>
                                    <button className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                                        <Plus className="w-3 h-3" />
                                        Add Stock
                                    </button>
                                </div>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}