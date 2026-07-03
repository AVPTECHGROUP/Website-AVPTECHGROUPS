import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Store, CheckCircle, XCircle, Plus, Search,
  ChevronLeft, ChevronRight, Edit, Package, Power, MinusCircle,
  AlertTriangle, Layers, SearchIcon,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import NewStore from "../../Components/Stock/NewStore";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import { getStockList, createStore, updateStore, activateStore, deactivateStore, getStoreStats } from "../../Api/Stock/StoreApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Stores() {
  // ── Filters & pagination ───────────────────────────────────────
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Active");
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Data ───────────────────────────────────────────────────────
  const [storesData, setStoresData] = useState([]);
  const [totalStores, setTotalStores] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [stats, setStats] = useState(null);

  // ── Loading / action state ─────────────────────────────────────
  const [tableLoading, setTableLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [noStoreFound, setNoStoreFound] = useState(false);
  const [error, setError] = useState(null);

  // ── Modals ─────────────────────────────────────────────────────
  const [isNewStoreOpen, setIsNewStoreOpen] = useState(false);
  const [editStoreData, setEditStoreData] = useState(null);

  const navigate = useNavigate();

  // ── Debounce search ────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 600);
    return () => clearTimeout(timer);
  }, [search]);

  // ── Fetch stats ────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const data = await getStoreStats();
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
      setError(null);
      setNoStoreFound(false);

      const apiStatus =

        statusFilter === "All Status" ? "" :
          statusFilter === "Active" ? "ACTIVE" : "INACTIVE";

      const res = await getStockList(page - 1, rowsPerPage, debouncedSearch, apiStatus);
      const stores = res.stores || [];

      setStoresData(stores);
      setTotalStores(res.pagination?.totalElements || 0);
      setTotalPages(res.pagination?.totalPages || 0);
      setNoStoreFound(stores.length === 0);
    } catch (err) {
      console.error("Error fetching stores:", err);
      setError(err.message || "Something went wrong");
      setStoresData([]);
      toast.error("Failed to load stores");
    } finally {
      setTableLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearch, statusFilter]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchStores(); }, [fetchStores]);

  // ── Derived ────────────────────────────────────────────────────
  const statCards = useMemo(() => [
    { key: "Total Stores", val: stats?.totalStores ?? 0, icon: Store, txColor: "text-blue-600", bgColor: "bg-blue-50" },
    { key: "Active Stores", val: stats?.activeStores ?? 0, icon: CheckCircle, txColor: "text-green-600", bgColor: "bg-green-50" },
    { key: "Inactive Stores", val: stats?.inactiveStores ?? 0, icon: XCircle, txColor: "text-red-500", bgColor: "bg-red-50" },
    { key: "Total Items", val: stats?.totalItems ?? 0, icon: Layers, txColor: "text-purple-600", bgColor: "bg-purple-50" },
    { key: "Low Stock", val: stats?.lowStockAlerts ?? 0, icon: AlertTriangle, txColor: "text-orange-500", bgColor: "bg-orange-50" },
  ], [stats]);

  const resetPage = () => setPage(1);

  // ── Action options per row ─────────────────────────────────────
  const getActionOptions = (store) => [
    { value: "edit", label: "Edit", icon: Edit, text: "text-blue-600", bg: "bg-blue-50", hover: "hover:bg-blue-100" },
    { value: "stock", label: "Stock", icon: Package, text: "text-orange-600", bg: "bg-orange-50", hover: "hover:bg-orange-100" },
    {
      value: "toggleStatus",
      label: togglingId === store.id
        ? (store.status === "ACTIVE" ? "Deactivating…" : "Activating…")
        : (store.status === "ACTIVE" ? "Inactive" : "Activate"),
      icon: store.status === "ACTIVE" ? MinusCircle : Power,
      text: store.status === "ACTIVE" ? "text-red-600" : "text-green-600",
      bg: store.status === "ACTIVE" ? "bg-red-50" : "bg-green-50",
      hover: store.status === "ACTIVE" ? "hover:bg-red-100" : "hover:bg-green-100",
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

  const tdStyle = "px-2 py-2 text-left text-gray-700 text-sm";

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-linear-to-b from-sky-50 to-sky-100">
      <div className="p-2 sm:p-5 lg:p-4">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Stores</h2>
            <p className="text-gray-500 mt-1 font-medium text-sm sm:text-base">
              Manage store locations, codes and activation status.
            </p>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 text-sm mt-5">
          {statsLoading
            ? statCards.map((_, i) => <CardLoader key={i} />)
            : statCards.map((s) => (
              <CardComponent
                key={s.key}
                IconName={s.icon}
                keyName={s.key.toUpperCase()}
                val={s.val}
                iconTxColor={s.txColor}
                iconBgColor={s.bgColor}
              />
            ))}
        </div>

        {/* ── Main Panel ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mt-4">

          {/* Panel Header: icon + title + New Store button */}
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

          {/* Filters */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
            <div className="flex flex-1 items-center gap-2 border rounded-lg border-gray-200 bg-gray-50 px-3 py-2 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
              <SearchIcon className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                placeholder="Search by name or code…"
                className="text-sm focus:outline-none text-gray-600 w-full bg-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); resetPage(); }}
              className="px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-gray-700 w-40 shrink-0"
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          {/* ── MOBILE / TABLET CARDS (below lg) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden px-4 py-4">
            {tableLoading ? (
              <div className="text-center py-8 col-span-2">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2" />
                  <span className="text-gray-600">Loading stores…</span>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8 col-span-2">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Stores</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  Retry
                </button>
              </div>
            ) : noStoreFound ? (
              <div className="text-center py-8 col-span-2">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Store className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No Stores Found</h3>
                <p className="text-gray-600">There are no stores to display.</p>
              </div>
            ) : (
              storesData.map((store, idx) => (
                <div key={store.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="text-xs text-gray-400 mt-0.5 shrink-0">
                        {(page - 1) * rowsPerPage + idx + 1}.
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{store.storeName}</p>
                        <p className="text-xs text-gray-400 truncate">{store.description}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold shrink-0 ${store.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                      }`}>
                      {store.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-gray-600">Code:</span>
                      <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-100 text-xs">{store.storeCode}</span>
                    </p>
                    <p>
                      <span className="font-medium text-gray-600">Location:</span>
                      <span className="text-gray-800 ml-2">{store.location}</span>
                    </p>
                    <div className="flex justify-start items-center pt-1">
                      <ActionDropDownComp
                        actionOptions={getActionOptions(store)}
                        onAction={(optVal) => callAllActions(optVal, store)}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* ── DESKTOP TABLE (lg and above) ── */}
          <div className="hidden lg:block bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10 w-10">#</th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Store Name</th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Code</th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Location</th>
                    <th className="px-2 py-3 text-left text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Status</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-gray-500 uppercase sticky top-0 bg-gray-50 z-10">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 font-normal">
                  {tableLoading ? (
                    <ListLoader colSpanSet={6} />
                  ) : error ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <XCircle className="w-6 h-6 text-red-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Error Loading Stores</h3>
                        <p className="text-gray-600 mb-4">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Retry
                        </button>
                      </td>
                    </tr>
                  ) : noStoreFound ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-1">
                          <Store className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-bold text-gray-700 mb-2">No Stores Found</h3>
                      </td>
                    </tr>
                  ) : (
                    storesData.map((store, idx) => (
                      <tr key={store.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className={tdStyle}>
                          {(page - 1) * rowsPerPage + idx + 1}
                        </td>
                        <td className={tdStyle}>
                          <p className="font-medium text-black truncate max-w-50">{store.storeName}</p>
                          <p className="text-xs text-gray-400 truncate max-w-50">{store.description}</p>
                        </td>
                        <td className={tdStyle}>
                          <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100 whitespace-nowrap">
                            {store.storeCode}
                          </span>
                        </td>
                        <td className={tdStyle}>
                          <span className="text-gray-600">{store.location}</span>
                        </td>
                        <td className={tdStyle}>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-sm text-xs font-medium ${store.status === "ACTIVE"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                            }`}>
                            {store.status === "ACTIVE" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className={tdStyle}>
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

            {/* Desktop Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <span className="text-sm text-gray-700">
                  {totalStores === 0
                    ? "No stores"
                    : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalStores)} of ${totalStores}`}
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
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || tableLoading}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => setPage(idx + 1)}
                    className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                      }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0 || tableLoading}
                  className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Pagination */}
          <div className="lg:hidden border-t border-gray-200 px-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="text-center text-sm text-gray-700">
                {totalStores === 0
                  ? "No stores"
                  : `Showing ${(page - 1) * rowsPerPage + 1} to ${Math.min(page * rowsPerPage, totalStores)} of ${totalStores}`}
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className="text-sm text-gray-700">Rows:</span>
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
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1 || tableLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {totalPages <= 5 ? (
                    [...Array(totalPages)].map((_, idx) => (
                      <button
                        key={idx + 1}
                        onClick={() => setPage(idx + 1)}
                        className={`px-3 py-1 rounded transition-all ${page === idx + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"
                          }`}
                      >
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
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || totalPages === 0 || tableLoading}
                  className="px-4 py-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
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