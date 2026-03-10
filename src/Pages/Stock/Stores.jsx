import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Store, CheckCircle, XCircle, Plus, Search,
  ChevronLeft, ChevronRight, Edit, Package, Power, MinusCircle, AlertTriangle, Layers,
  SlidersHorizontal, X,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import NewStore from "../../Components/Stock/NewStore";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import { getStockList, createStore, updateStore, activateStore, deactivateStore, getStoreStats } from "../../Api/StoreApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ROWS_PER_PAGE = 10;

export default function Stores() {
  // ── Filters & pagination ───────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page,         setPage]         = useState(1);
  const [showFilters,  setShowFilters]  = useState(false);

  // ── Data ───────────────────────────────────────────────────────
  const [storesData,  setStoresData]  = useState([]);
  const [totalStores, setTotalStores] = useState(0);
  const [stats,       setStats]       = useState(null);   // from getStoreStats

  // ── Loading / action state ─────────────────────────────────────
  const [tableLoading, setTableLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [togglingId,   setTogglingId]   = useState(null);

  // ── Modals ─────────────────────────────────────────────────────
  const [isNewStoreOpen, setIsNewStoreOpen] = useState(false);
  const [editStoreData,  setEditStoreData]  = useState(null);

  const navigate = useNavigate();

  // ── Fetch stats once (single call replaces 3 calls) ───────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getStoreStats(); // { totalStores, activeStores, inactiveStores, totalItems, lowStockAlerts }
      setStats(data);
    } catch (err) {
      console.error("Error fetching store stats:", err);
      toast.error("Failed to load store stats");
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Fetch paginated table data ─────────────────────────────────
  const fetchStores = useCallback(async () => {
    try {
      setTableLoading(true);
      const apiStatus =
        statusFilter === "Active"   ? "ACTIVE"   :
        statusFilter === "Inactive" ? "INACTIVE" : "";

      const res = await getStockList(page - 1, ROWS_PER_PAGE, search, apiStatus);
      setStoresData(res.stores || []);
      setTotalStores(res.pagination?.totalElements || 0);
    } catch (err) {
      console.error("Error fetching stores:", err);
      toast.error("Failed to load stores");
    } finally {
      setTableLoading(false);
    }
  }, [page, search, statusFilter]);

  // Mount: fetch stats once; fetch table whenever filters/page change
  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchStores(); }, [fetchStores]);

  // ── Derived ────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(totalStores / ROWS_PER_PAGE));

  const statCards = useMemo(() => [
    { key: "Total Stores",    val: stats?.totalStores    ?? 0, icon: Store,         txColor: "text-blue-600",   bgColor: "bg-blue-50"   },
    { key: "Active Stores",   val: stats?.activeStores   ?? 0, icon: CheckCircle,   txColor: "text-green-600",  bgColor: "bg-green-50"  },
    { key: "Inactive Stores", val: stats?.inactiveStores ?? 0, icon: XCircle,       txColor: "text-red-500",    bgColor: "bg-red-50"    },
    { key: "Total Items",     val: stats?.totalItems     ?? 0, icon: Layers,        txColor: "text-purple-600", bgColor: "bg-purple-50" },
    { key: "Low Stock",       val: stats?.lowStockAlerts ?? 0, icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
  ], [stats]);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 3)               return [1, 2, 3, 4, 5];
    if (page >= totalPages - 2)  return [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  const activeFilterCount = [
    search.trim() !== "",
    statusFilter !== "All Status",
  ].filter(Boolean).length;

  // ── Helpers ────────────────────────────────────────────────────
  const resetPage = () => setPage(1);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All Status");
    resetPage();
  };

  // ── Actions ────────────────────────────────────────────────────
  const getActionOptions = (store) => [
    { value: "edit",  label: "Edit",  icon: Edit,    text: "text-blue-600",   bg: "bg-blue-50",   hover: "hover:bg-blue-100"   },
    { value: "stock", label: "Stock", icon: Package, text: "text-orange-600", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
    {
      value:    "toggleStatus",
      label:    togglingId === store.id
                  ? (store.status === "ACTIVE" ? "Deactivating…" : "Activating…")
                  : (store.status === "ACTIVE" ? "Deactivate"    : "Activate"),
      icon:     store.status === "ACTIVE" ? MinusCircle : Power,
      text:     store.status === "ACTIVE" ? "text-red-600"      : "text-green-600",
      bg:       store.status === "ACTIVE" ? "bg-red-50"         : "bg-green-50",
      hover:    store.status === "ACTIVE" ? "hover:bg-red-100"  : "hover:bg-green-100",
      disabled: togglingId === store.id,
    },
  ];

  const callAllActions = async (optVal, store) => {
    if (optVal === "edit") {
      setEditStoreData(store);
      setIsNewStoreOpen(true);

    } else if (optVal === "stock") {
      navigate("/stock/transactions");

    } else if (optVal === "toggleStatus") {
      if (togglingId) return;
      try {
        setTogglingId(store.id);
        if (store.status === "ACTIVE") {
          await deactivateStore(store.id);
          toast.success("Store deactivated successfully");
        } else {
          await activateStore(store.id);
          toast.success("Store activated successfully");
        }
        // Refresh table + stats together (2 calls, down from previous 4)
        await Promise.all([fetchStores(), fetchStats()]);
      } catch (err) {
        toast.error("Failed to update store status");
        console.error(err);
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleSave = async (payload) => {
    try {
      if (editStoreData) {
        await updateStore(editStoreData.id, payload);
        toast.success("Store updated successfully");
      } else {
        await createStore(payload);
        toast.success("Store created successfully");
      }
      setIsNewStoreOpen(false);
      setEditStoreData(null);
      await Promise.all([fetchStores(), fetchStats()]);
    } catch (err) {
      toast.error(editStoreData ? "Failed to update store" : "Failed to create store");
      throw err;
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50 p-3 md:p-5 xl:p-8 font-sans">

      {/* Page Header */}
      <div className="mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl xl:text-3xl font-bold text-gray-800">Stores</h1>
        <p className="text-gray-500 text-xs md:text-sm mt-1">
          Manage store locations, codes and activation status.
        </p>
      </div>

      {/* Stats — 2-col mobile, 3-col md, 5-col xl */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
        {statsLoading
          ? Array.from({ length: 5 }).map((_, i) => <CardLoader key={i} />)
          : statCards.map((s) => (
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

      {/* Main Panel */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Panel Header */}
        <div className="flex items-center justify-between gap-3 px-4 md:px-5 py-3 md:py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 min-w-0">
            <Store className="w-5 h-5 text-blue-500 shrink-0" />
            <h2 className="font-semibold text-gray-800 text-base md:text-lg truncate">Stores</h2>
          </div>
          <button
            onClick={() => { setEditStoreData(null); setIsNewStoreOpen(true); }}
            className="flex items-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs md:text-sm font-semibold px-3 md:px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
            New Store
          </button>
        </div>

        <NewStore
          isOpen={isNewStoreOpen}
          onClose={() => { setIsNewStoreOpen(false); setEditStoreData(null); }}
          initialData={editStoreData}
          onSave={handleSave}
        />

        {/* ── Filters ──────────────────────────────────────────────
            < md  : search + toggle; selects collapse in drawer
            md–xl : search full-width top, status select below
            xl+   : all in one row
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
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700 w-40"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
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
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
              className="flex-1 min-w-0 text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-700"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
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
                <th className="px-3 lg:px-5 py-3 text-left">Store Name</th>
                <th className="px-3 lg:px-4 py-3 text-left">Code</th>
                <th className="px-3 lg:px-4 py-3 text-left">Location</th>
                <th className="px-3 lg:px-4 py-3 text-left">Status</th>
                <th className="px-3 lg:px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tableLoading ? (
                <ListLoader rows={ROWS_PER_PAGE} avatar={false} />
              ) : storesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">
                    No stores found.
                  </td>
                </tr>
              ) : (
                storesData.map((store, idx) => (
                  <tr key={store.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-3 lg:px-5 py-3 text-sm text-gray-500">
                      {(page - 1) * ROWS_PER_PAGE + idx + 1}
                    </td>
                    <td className="px-3 lg:px-5 py-3 max-w-[140px] lg:max-w-[220px]">
                      <p className="font-semibold text-gray-800 text-sm truncate">{store.storeName}</p>
                      <p className="text-xs text-gray-400 truncate">{store.description}</p>
                    </td>
                    <td className="px-3 lg:px-4 py-3">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100 whitespace-nowrap">
                        {store.storeCode}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-sm text-gray-600 max-w-[120px] lg:max-w-[200px] truncate">
                      {store.location}
                    </td>
                    <td className="px-3 lg:px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${
                        store.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}>
                        {store.status === "ACTIVE" ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-3 lg:px-4 py-3 text-center">
                      <ActionDropDownComp
                        actionOptions={getActionOptions(store)}
                        onAction={(optVal) => callAllActions(optVal, store)}
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
          {tableLoading ? (
            <div className="px-4 py-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
            </div>
          ) : storesData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-12">No stores found.</p>
          ) : (
            storesData.map((store, idx) => (
              <div key={store.id} className="px-4 py-4 space-y-2.5 hover:bg-gray-50/70 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-xs text-gray-400 mt-0.5 shrink-0">
                      {(page - 1) * ROWS_PER_PAGE + idx + 1}.
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{store.storeName}</p>
                      <p className="text-xs text-gray-400 truncate">{store.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${
                    store.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                  }`}>
                    {store.status === "ACTIVE" ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-100">
                    {store.storeCode}
                  </span>
                  <span>{store.location}</span>
                </div>
                <div className="pt-0.5">
                  <ActionDropDownComp
                    actionOptions={getActionOptions(store)}
                    onAction={(optVal) => callAllActions(optVal, store)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── Pagination ── */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 px-4 md:px-5 py-4 border-t border-gray-100">
          <p className="text-xs md:text-sm text-gray-400 text-center sm:text-left">
            {totalStores === 0
              ? "No stores"
              : `Showing ${(page - 1) * ROWS_PER_PAGE + 1}–${Math.min(page * ROWS_PER_PAGE, totalStores)} of ${totalStores} stores`}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {pageNumbers.map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                  page === n
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || totalPages === 0}
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