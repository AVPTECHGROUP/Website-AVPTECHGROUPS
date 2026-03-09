import React, { useEffect, useState, useCallback } from "react";
import { Store, CheckCircle, XCircle, Plus, Search, ChevronLeft, ChevronRight, Edit, Package, Power, MinusCircle } from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader from "../../Components/CommonComp/CardLoader";
import ListLoader from "../../Components/CommonComp/ListLoader";
import NewStore from "../../Components/Stock/NewStore";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import { getStockList, createStore, updateStore, activateStore, deactivateStore } from "../../Api/StoreApi";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ROWS_PER_PAGE = 10;

export default function Stores() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);
  const [isNewStoreOpen, setIsNewStoreOpen] = useState(false);
  const [editStoreData, setEditStoreData] = useState(null);
  const [storesData, setStoresData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalStores, setTotalStores] = useState(0);
  const [totalActive, setTotalActive] = useState(0);
  const [totalInactive, setTotalInactive] = useState(0);
  const [statsLoading, setStatsLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const navigate = useNavigate();

  const fetchStockList = useCallback(async () => {
    try {
      setLoading(true);
      const apiStatus =
        statusFilter === "Active" ? "ACTIVE" :
        statusFilter === "Inactive" ? "INACTIVE" : "";

      const res = await getStockList(page - 1, ROWS_PER_PAGE, search, apiStatus);
      setStoresData(res.stores || []);
      setTotalStores(res.pagination?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching stores:", error);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const [allRes, activeRes, inactiveRes] = await Promise.all([
        getStockList(0, 1, "", ""),           // status param add nahi hoga = sab milenge
        getStockList(0, 1, "", "ACTIVE"),     // sirf ACTIVE
        getStockList(0, 1, "", "INACTIVE"),   // sirf INACTIVE
      ]);
      setTotalStores(allRes.pagination?.totalElements || 0);
      setTotalActive(activeRes.pagination?.totalElements || 0);
      setTotalInactive(inactiveRes.pagination?.totalElements || 0);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStockList(); }, [fetchStockList]);
  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };
  const handleStatusChange = (e) => { setStatusFilter(e.target.value); setPage(1); };

  const totalPages = Math.ceil(totalStores / ROWS_PER_PAGE);

  const stats = [
    { key: "Total Stores",    val: statsLoading ? "..." : totalStores,   icon: Store,        txColor: "text-blue-600",  bgColor: "bg-blue-50"  },
    { key: "Active Stores",   val: statsLoading ? "..." : totalActive,   icon: CheckCircle,  txColor: "text-green-600", bgColor: "bg-green-50" },
    { key: "Inactive Stores", val: statsLoading ? "..." : totalInactive, icon: XCircle,      txColor: "text-red-500",   bgColor: "bg-red-50"   },
  ];

  const getActionOptions = (store) => [
    {
      value: "edit",
      label: "Edit",
      icon: Edit,
      text: "text-blue-600",
      bg: "bg-blue-50",
      hover: "hover:bg-blue-100",
    },
    {
      value: "stock",
      label: "Stock",
      icon: Package,
      text: "text-orange-600",
      bg: "bg-orange-50",
      hover: "hover:bg-orange-100",
    },
    {
      value: "toggleStatus",
      label: togglingId === store.id
        ? (store.status === "ACTIVE" ? "Deactivating..." : "Activating...")
        : (store.status === "ACTIVE" ? "Deactivate" : "Activate"),
      icon: store.status === "ACTIVE" ? MinusCircle : Power,
      text:  store.status === "ACTIVE" ? "text-red-600"    : "text-green-600",
      bg:    store.status === "ACTIVE" ? "bg-red-50"       : "bg-green-50",
      hover: store.status === "ACTIVE" ? "hover:bg-red-100": "hover:bg-green-100",
      disabled: togglingId === store.id,
    },
  ];

  const callAllActions = async (optVal, store) => {
    try {
      if (optVal === "edit") {
        setEditStoreData(store);
        setIsNewStoreOpen(true);

      } else if (optVal === "stock") {
        navigate('/stock/transactions');

      } else if (optVal === "toggleStatus") {
        if (togglingId) return;
        setTogglingId(store.id);

        if (store.status === "ACTIVE") {
          await deactivateStore(store.id);
          toast.success("Store deactivated successfully");
        } else {
          await activateStore(store.id);
          toast.success("Store activated successfully");
        }
        await Promise.all([fetchStockList(), fetchStats()]);
      }

    } catch (error) {
      toast.error("Failed to update store status");
      console.error(error);
    } finally {
      setTogglingId(null);
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
      await Promise.all([fetchStockList(), fetchStats()]);
    } catch (error) {
      toast.error(editStoreData ? "Failed to update store" : "Failed to create store");
      throw error; // NewStore ke isSaving finally mein jaaye
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Stores</h1>
        <p className="text-gray-500 text-sm mt-1">Manage store locations, codes and activation status.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {statsLoading
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-500" />
            <h2 className="font-semibold text-gray-800 text-lg">Stores</h2>
          </div>
          <button
            onClick={() => { setEditStoreData(null); setIsNewStoreOpen(true); }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors w-fit"
          >
            <Plus className="w-4 h-4" />
            New Store
          </button>
          <NewStore
            isOpen={isNewStoreOpen}
            onClose={() => setIsNewStoreOpen(false)}
            initialData={editStoreData}
            onSave={handleSave}
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 px-5 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition"
            />
          </div>
          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="text-sm border border-gray-200 rounded-lg px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition text-gray-700 w-fit"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
        </div>

        {/* Table Desktop */}
        <div className="overflow-x-auto hidden sm:block">
          <table className="w-full min-w-160">
            <thead>
              <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                <th className="px-5 py-3 text-left w-10">#</th>
                <th className="px-5 py-3 text-left">Store Name</th>
                <th className="px-5 py-3 text-left">Code</th>
                <th className="px-5 py-3 text-left">Location</th>
                <th className="px-5 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <ListLoader rows={ROWS_PER_PAGE} avatar={false} />
              ) : storesData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-gray-400 text-sm">
                    No stores found.
                  </td>
                </tr>
              ) : (
                storesData.map((store, idx) => (
                  <tr key={store.id} className="hover:bg-blue-50/40 transition-colors">
                    <td className="px-5 py-4 text-sm text-gray-500">{(page - 1) * ROWS_PER_PAGE + idx + 1}</td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-800 text-sm">{store.storeName}</p>
                      <p className="text-xs text-gray-400">{store.description}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2 py-1 text-nowrap bg-blue-50 text-blue-700 text-xs font-semibold rounded border border-blue-100">
                        {store.storeCode}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{store.location}</td>
                    <td className="px-5 py-4">
                      {store.status === "ACTIVE" ? (
                        <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">Active</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-red-100 text-red-500 text-xs font-semibold">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
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

        {/* Mobile Cards */}
        <div className="sm:hidden divide-y divide-gray-100">
          {loading ? (
            <div className="px-4 py-4 space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <CardLoader key={i} />)}
            </div>
          ) : storesData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-10">No stores found.</p>
          ) : (
            storesData.map((store) => (
              <div key={store.id} className="px-4 py-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{store.storeName}</p>
                    <p className="text-xs text-gray-400">{store.description}</p>
                  </div>
                  {store.status === "ACTIVE" ? (
                    <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold shrink-0">Active</span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-500 text-xs font-semibold shrink-0">Inactive</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-semibold rounded border border-blue-100">{store.storeCode}</span>
                  <span>{store.location}</span>
                </div>
                <div className="pt-1">
                  <ActionDropDownComp
                    actionOptions={getActionOptions(store)}
                    onAction={(optVal) => callAllActions(optVal, store)}
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
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-semibold transition ${
                  page === i + 1
                    ? "bg-blue-600 text-white"
                    : "border border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                }`}
              >
                {i + 1}
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
          <p className="text-sm text-gray-400">
            Showing{" "}
            {totalStores === 0 ? 0 : (page - 1) * ROWS_PER_PAGE + 1}–
            {Math.min(page * ROWS_PER_PAGE, totalStores)} of {totalStores} stores
          </p>
        </div>
      </div>
    </div>
  );
}