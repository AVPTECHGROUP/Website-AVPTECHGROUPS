import React, { useEffect, useState, useCallback } from "react";
import {
    School, Package, BookOpen, Plus, Edit, Trash2,
    ChevronRight, LayoutGrid,
    Loader2,
} from "lucide-react";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import CardLoader from "../../../Components/CommonComp/CardLoader";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import AddItemClassConfig from "./AddItemClassConfig";
import {
    getClassItemConfigStats,
    getClassItemConfigs,
    deleteClassItemConfig,
} from "../../../Api/Stock/StudentStoreApi";
import { getClasses } from "../../../Api/Teachers/TeachersAPI";
import { toast } from "react-toastify";
import { saveClassItemConfigsBulk } from "../../../Api/Stock/StudentOrder";
import { STOCK_SHARED_CONSTS, CLASS_CONFIG_CONSTS } from "../../../Constants/StringConstants/StockAndOrdersConstants";

const categoryColors = {
    BOOKS: "bg-blue-100 text-blue-700",
    STATIONERY: "bg-gray-100 text-gray-700",
    LAB: "bg-purple-100 text-purple-700",
    SPORTS: "bg-green-100 text-green-700",
};

const actionOptions = [
    { value: "edit", label: CLASS_CONFIG_CONSTS.ACTIONS.EDIT, icon: Edit, text: "text-blue-600", bg: "bg-white", hover: "hover:bg-blue-50" },
    { value: "delete", label: CLASS_CONFIG_CONSTS.ACTIONS.DELETE, icon: Trash2, text: "text-red-600", bg: "bg-white", hover: "hover:bg-red-50" },
];

export default function ClassConfig() {
    // ── Classes list ──
    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [selectedClass, setSelectedClass] = useState(null);

    // ── Config items for selected class ──
    const [configItems, setConfigItems] = useState([]);
    const [loadingItems, setLoadingItems] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // ── Stats ──
    const [statsData, setStatsData] = useState({
        classesConfigured: 0,
        totalConfigEntries: 0,
        totalActiveItems: 0,
    });
    const [loadingStats, setLoadingStats] = useState(true);

    // ── Modal ──
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRow, setEditRow] = useState(null);

    // ── Fetch classes ──
    useEffect(() => {
        const load = async () => {
            setLoadingClasses(true);
            try {
                const data = await getClasses();
                console.log("API called", data);
                setClasses(data || []);
                if (data?.length > 0) setSelectedClass(data[0]);
            } catch {
                toast.error(CLASS_CONFIG_CONSTS.MESSAGES.LOAD_CLASSES_FAILED);
            } finally {
                setLoadingClasses(false);
            }
        };
        load();
    }, []);

    const fetchStats = useCallback(async () => {
        setLoadingStats(true);
        try {
            const data = await getClassItemConfigStats();
            setStatsData(data);
        } catch { /* silent */ }
        finally { setLoadingStats(false); }
    }, []);

    useEffect(() => { fetchStats(); }, [fetchStats]);

    const fetchItems = useCallback(async (classId) => {
        if (!classId) return;
        setLoadingItems(true);
        setConfigItems([]);
        try {
            const data = await getClassItemConfigs(classId);
            setConfigItems(Array.isArray(data) ? data : []);
        } catch {
            toast.error(CLASS_CONFIG_CONSTS.MESSAGES.LOAD_ITEMS_FAILED);
        } finally {
            setLoadingItems(false);
        }
    }, []);

    useEffect(() => {
        if (selectedClass?.id) fetchItems(selectedClass.id);
    }, [selectedClass, fetchItems]);

    // ── Handle class selection ──
    const handleSelectClass = (cls) => setSelectedClass(cls);

    // ── Delete config item ──
    const handleAction = async (optVal, row) => {
        if (optVal === "edit") {
            setEditRow(row);
            setIsModalOpen(true);
        }
        if (optVal === "delete") {
            setDeletingId(row.id);
            try {
                await deleteClassItemConfig(row.id);
                toast.success(CLASS_CONFIG_CONSTS.MESSAGES.ITEM_REMOVED(row.itemName, selectedClass?.name));
                await fetchItems(selectedClass.id);
                await fetchStats();
            } catch {
                toast.error(CLASS_CONFIG_CONSTS.MESSAGES.DELETE_FAILED);
            } finally {
                setDeletingId(null);
            }
        }
    };

    // ── Save — bulk upsert (add OR edit both use same endpoint) ──
    // Receives: { items: [{ itemId, defaultQuantity, remarks }] }
    const handleSave = async (payload) => {
        const items = payload?.items;
        if (!items || items.length === 0) {
            toast.error(CLASS_CONFIG_CONSTS.MESSAGES.NO_ITEMS_TO_SAVE);
            return;
        }
        try {
            const bulkPayload = {
                classId: selectedClass.id,
                remarks: payload.remarks || null,   // shared remarks from step 3
                items,
            };
            console.log("[ClassConfig] saveClassItemConfigsBulk payload →", JSON.stringify(bulkPayload));
            await saveClassItemConfigsBulk(bulkPayload);

            const count = items.length;
            toast.success(
                editRow
                    ? CLASS_CONFIG_CONSTS.MESSAGES.ITEM_UPDATED(editRow.itemName)
                    : CLASS_CONFIG_CONSTS.MESSAGES.ITEMS_ADDED(count, selectedClass?.name)
            );

            setEditRow(null);
            setIsModalOpen(false);
            await fetchItems(selectedClass.id);
            await fetchStats();
        } catch {
            toast.error(editRow ? CLASS_CONFIG_CONSTS.MESSAGES.UPDATE_FAILED : CLASS_CONFIG_CONSTS.MESSAGES.ADD_FAILED);
        }
    };

    // ── Derived values ──
    const totalItems = configItems.length;
    const totalUnits = configItems.reduce((acc, i) => acc + (i.defaultQuantity || 0), 0);

    const stats = [
        {
            key: CLASS_CONFIG_CONSTS.STATS.CLASSES_CONFIGURED,
            val: statsData.classesConfigured,
            icon: School,
            txColor: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            key: CLASS_CONFIG_CONSTS.STATS.TOTAL_CONFIG_ENTRIES,
            val: statsData.totalConfigEntries,
            icon: LayoutGrid,
            txColor: "text-orange-500",
            bgColor: "bg-orange-50",
        },
        {
            key: CLASS_CONFIG_CONSTS.STATS.ITEMS_AVAILABLE,
            val: statsData.totalActiveItems,
            icon: Package,
            txColor: "text-yellow-600",
            bgColor: "bg-yellow-50",
        },
    ];

    return (
        <>
            <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

                {/* ── Add / Edit Modal ── */}
                <AddItemClassConfig
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditRow(null); }}
                    onSave={handleSave}
                    editData={editRow}
                    existingItems={configItems}
                    className={selectedClass?.name ?? ""}
                />

                {/* ── Page Header ── */}
                <div className="mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{CLASS_CONFIG_CONSTS.TEXT.TITLE}</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {CLASS_CONFIG_CONSTS.TEXT.SUBTITLE}
                    </p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                    {loadingStats
                        ? Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)
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

                {/* ── Main Grid ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* ── LEFT: Classes List ── */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <School className="w-5 h-5 text-blue-500" />
                                <h2 className="font-semibold text-gray-800">{CLASS_CONFIG_CONSTS.TEXT.CLASSES_PANEL_TITLE}</h2>
                            </div>
                            <span className="text-xs text-gray-400">{classes.length} classes</span>
                        </div>
                        <div className="divide-y divide-gray-100 max-h-130 overflow-y-auto">
                            {loadingClasses ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <div key={i} className="px-4 py-3 flex items-center justify-between animate-pulse">
                                        <div className="h-3.5 bg-gray-200 rounded w-24" />
                                        <div className="h-4 bg-gray-100 rounded w-12" />
                                    </div>
                                ))
                            ) : classes.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-400 text-sm">{CLASS_CONFIG_CONSTS.TEXT.NO_CLASSES_FOUND}</div>
                            ) : (
                                classes.map((cls) => {
                                    const isSelected = selectedClass?.id === cls.id;
                                    return (
                                        <button
                                            key={cls.id}
                                            onClick={() => handleSelectClass(cls)}
                                            className={`w-full flex items-center cursor-pointer justify-between px-4 py-3 text-left transition-colors
                                                ${isSelected
                                                    ? "bg-blue-50 border-l-4 border-blue-500"
                                                    : "hover:bg-gray-50 border-l-4 border-transparent"
                                                }`}
                                        >
                                            <div className="min-w-0">
                                                <span className={`text-sm font-semibold ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                                                    {cls.name}
                                                </span>
                                                {cls.description && (
                                                    <p className="text-xs text-gray-400 truncate max-w-32.5">{cls.description}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {isSelected && !loadingItems && (
                                                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                                                        {configItems.length} items
                                                    </span>
                                                )}
                                                <ChevronRight className={`w-4 h-4 ${isSelected ? "text-blue-500" : "text-gray-300"}`} />
                                            </div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* ── RIGHT: Config Table ── */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
                            <div className="flex items-center gap-2 min-w-0">
                                <BookOpen className="w-5 h-5 text-blue-500 shrink-0" />
                                <div className="min-w-0">
                                    <h2 className="font-semibold text-gray-800 truncate">
                                        {selectedClass ? CLASS_CONFIG_CONSTS.TEXT.DEFAULT_CONFIG_TITLE(selectedClass.name) : CLASS_CONFIG_CONSTS.TEXT.DEFAULT_CONFIG_TITLE_FALLBACK}
                                    </h2>
                                    {selectedClass?.description && (
                                        <p className="text-xs text-gray-400 truncate">{selectedClass.description}</p>
                                    )}
                                </div>
                            </div>
                            <button
                                disabled={!selectedClass}
                                onClick={() => { setEditRow(null); setIsModalOpen(true); }}
                                className="flex items-center gap-2 cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit shrink-0"
                            >
                                <Plus className="w-4 h-4" />
                                Add Items
                            </button>
                        </div>

                        {/* ── Desktop Table ── */}
                        <div className="overflow-x-auto hidden sm:block">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                        <th className="px-5 py-3 text-left">{CLASS_CONFIG_CONSTS.TABLE_HEADERS.ITEM}</th>
                                        <th className="px-5 py-3 text-left">{CLASS_CONFIG_CONSTS.TABLE_HEADERS.CATEGORY}</th>
                                        <th className="px-5 py-3 text-center text-nowrap">{CLASS_CONFIG_CONSTS.TABLE_HEADERS.DEFAULT_QUANTITY}</th>
                                        <th className="px-5 py-3 text-center">{CLASS_CONFIG_CONSTS.TABLE_HEADERS.REMARKS}</th>
                                        <th className="px-5 py-3 text-center">{CLASS_CONFIG_CONSTS.TABLE_HEADERS.ACTIONS}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {loadingItems ? (
                                        <ListLoader rows={5} avatar={false} />
                                    ) : configItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-5 py-14 text-center">
                                                <div className="flex flex-col items-center gap-2">
                                                    <Package className="w-10 h-10 text-gray-200" />
                                                    <p className="text-sm text-gray-400">{CLASS_CONFIG_CONSTS.TEXT.NO_ITEMS_FOR_CLASS}</p>
                                                    <button
                                                        onClick={() => { setEditRow(null); setIsModalOpen(true); }}
                                                        className="mt-1 text-sm cursor-pointer text-blue-600 font-semibold hover:underline"
                                                    >
                                                        {CLASS_CONFIG_CONSTS.TEXT.ADD_FIRST_ITEM}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        configItems.map((row) => {
                                            const isDeleting = deletingId === row.id;
                                            return (
                                                <tr
                                                    key={row.id}
                                                    className={`hover:bg-blue-50/40 transition-colors ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                                                >
                                                    <td className="px-5 py-4">
                                                        <p className="font-semibold text-gray-800 text-sm">{row.itemName}</p>
                                                        <p className="text-xs text-gray-400">{row.itemCode} · {row.itemUnit}</p>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${categoryColors[row.itemCategory] ?? "bg-gray-100 text-gray-600"}`}>
                                                            {row.itemCategory}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-center">
                                                        <span className="text-sm font-bold text-gray-800">{row.defaultQuantity}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        <span className="text-xs text-gray-500">{row.remarks || "—"}</span>
                                                    </td>
                                                    <td className="px-5 py-4">
                                                        {isDeleting ? (
                                                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                        ) : (
                                                            <ActionDropDownComp
                                                                actionOptions={actionOptions}
                                                                onAction={(optVal) => handleAction(optVal, row)}
                                                            />
                                                        )}
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
                            {loadingItems ? (
                                <div className="px-4 py-4 space-y-3">
                                    {Array.from({ length: 4 }).map((_, i) => <CardLoader key={i} />)}
                                </div>
                            ) : configItems.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-12">
                                    <Package className="w-10 h-10 text-gray-200" />
                                    <p className="text-sm text-gray-400">{CLASS_CONFIG_CONSTS.TEXT.NO_ITEMS_CONFIGURED}</p>
                                    <button
                                        onClick={() => { setEditRow(null); setIsModalOpen(true); }}
                                        className="mt-1 text-sm text-blue-600 cursor-pointer font-semibold hover:underline"
                                    >
                                        {CLASS_CONFIG_CONSTS.TEXT.ADD_FIRST_ITEM}
                                    </button>
                                </div>
                            ) : (
                                configItems.map((row) => {
                                    const isDeleting = deletingId === row.id;
                                    return (
                                        <div
                                            key={row.id}
                                            className={`px-4 py-4 space-y-2 ${isDeleting ? "opacity-40 pointer-events-none" : ""}`}
                                        >
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="min-w-0">
                                                    <p className="font-semibold text-gray-800 text-sm">{row.itemName}</p>
                                                    <p className="text-xs text-gray-400">{row.itemCode} · {row.itemUnit}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-semibold shrink-0 ${categoryColors[row.itemCategory] ?? "bg-gray-100 text-gray-600"}`}>
                                                    {row.itemCategory}
                                                </span>
                                            </div>
                                            {row.remarks && (
                                                <p className="text-xs text-gray-400 italic">{row.remarks}</p>
                                            )}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-500">
                                                    Default Qty: <span className="font-bold text-gray-800">{row.defaultQuantity}</span>
                                                </span>
                                                {isDeleting ? (
                                                    <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                                ) : (
                                                    <ActionDropDownComp
                                                        actionOptions={actionOptions}
                                                        onAction={(optVal) => handleAction(optVal, row)}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* ── Footer totals ── */}
                        {configItems.length > 0 && !loadingItems && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
                                <span className="text-sm text-gray-500">
                                    Total items: <span className="font-bold text-gray-700">{totalItems}</span>
                                </span>
                                <span className="text-sm text-gray-500">
                                    <span className="font-bold text-gray-700">{totalUnits}</span> units
                                </span>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </>
    );
}