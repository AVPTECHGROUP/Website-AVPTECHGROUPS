import { useState, useEffect, useCallback } from "react";
import {
  Map, Search, ChevronDown, Plus, Pencil, ToggleLeft, ToggleRight,
  Trash2, Clock, MapPin, Bus, User, Users, CheckCircle, XCircle as XCircleIcon,
  Loader2, RefreshCw,
} from "lucide-react";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import AddStopCard        from "../../Components/Transport/AddStopCard";
import CreateRouteCard    from "../../Components/Transport/CreateRouteCard";
import {
  getRoutes,
  activateRoute,
  deactivateRoute,
  getRouteStops,
  deleteRouteStop,
  getActiveRoutes,
} from "../../Api/Transport/TransportAPI";

let _setToasts = null;
const toast = {
  success: (msg) => _setToasts?.((p) => [...p, { id: Date.now() + Math.random(), type: "success", msg }]),
  error:   (msg) => _setToasts?.((p) => [...p, { id: Date.now() + Math.random(), type: "error",   msg }]),
};
function ToastContainer() {
  const [toasts, setToasts] = useState([]);
  _setToasts = setToasts;
  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  useEffect(() => {
    if (!toasts.length) return;
    const t = setTimeout(() => remove(toasts[0].id), 3500);
    return () => clearTimeout(t);
  }, [toasts]);
  return (
    <div className="fixed bottom-5 right-5 z-9999 flex flex-col gap-2 items-end pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className={`flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium pointer-events-auto min-w-55 max-w-xs bg-white
          ${t.type === "success" ? "border border-green-200 text-green-800" : "border border-red-200 text-red-700"}`}>
          {t.type === "success"
            ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
            : <XCircleIcon className="w-4 h-4 text-red-500 shrink-0" />}
          <span className="flex-1">{t.msg}</span>
          <button onClick={() => remove(t.id)} className="text-gray-400 hover:text-gray-600 ml-1 text-xs">✕</button>
        </div>
      ))}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return "—";
  return String(t).slice(0, 5); // "07:00:00" → "07:00"
}

const typeLabel = { BUS: "BUS", MINI_BUS: "MINI BUS", VAN: "VAN" };

function UtilBar({ allocated, capacity }) {
  const pct   = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="w-28 h-2 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-xs text-gray-500 font-medium">{allocated}/{capacity} ({pct}%)</span>
    </div>
  );
}

// ─── Constants ────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "",         label: "All Status" },
  { value: "ACTIVE",   label: "Active"     },
  { value: "INACTIVE", label: "Inactive"   },
];

// ─── Main ─────────────────────────────────────────────────────────
export default function Routes_Manage() {

  // ── Routes list state ──
  const [allRoutes, setAllRoutes]         = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [togglingId, setTogglingId]       = useState(null);

  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Route modal ──
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [editRoute, setEditRoute]             = useState(null); // null=add, object=edit

  // ── Stops panel state ──
  const [activeRoutes, setActiveRoutes]       = useState([]);   // for dropdown
  const [selectedRouteId, setSelectedRouteId] = useState("");   // string id from dropdown
  const [selectedRouteObj, setSelectedRouteObj] = useState(null); // full route object
  const [stops, setStops]                     = useState([]);
  const [loadingStops, setLoadingStops]       = useState(false);
  const [deletingStopId, setDeletingStopId]   = useState(null);

  // ── Stop modal ──
  const [showAddStop, setShowAddStop] = useState(false);
  const [editStop, setEditStop]       = useState(null); // null=add, object=edit

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchInput), 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch routes ──
  const fetchRoutes = useCallback(async () => {
    setLoadingRoutes(true);
    try {
      const res = await getRoutes({ page: 0, size: 200, searchTerm: search, status: statusFilter });
      setAllRoutes(res.routes || []);
    } catch {
      toast.error("Failed to load routes.");
    } finally {
      setLoadingRoutes(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchRoutes(); }, [fetchRoutes]);

  // ── Fetch active routes for stops-panel dropdown ──
  const fetchActiveRoutes = useCallback(async () => {
    try {
      const data = await getActiveRoutes();
      setActiveRoutes(data || []);
      // Auto-select first if nothing selected
      if (!selectedRouteId && data.length > 0) {
        setSelectedRouteId(String(data[0].id));
        setSelectedRouteObj(data[0]);
      }
    } catch {
      /* silent */
    }
  }, []);

  useEffect(() => { fetchActiveRoutes(); }, [fetchActiveRoutes]);

  // ── Fetch stops when dropdown route changes ──
  const fetchStops = useCallback(async (routeId) => {
    if (!routeId) return;
    setLoadingStops(true);
    setStops([]);
    try {
      const data = await getRouteStops(routeId);
      setStops(data || []);
    } catch {
      toast.error("Failed to load stops.");
    } finally {
      setLoadingStops(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchStops(selectedRouteId);
    else setStops([]);
  }, [selectedRouteId, fetchStops]);

  // ── Handle route dropdown change ──
  const handleRouteDropdownChange = (e) => {
    const id = e.target.value;
    setSelectedRouteId(id);
    const obj = activeRoutes.find((r) => String(r.id) === id) || null;
    setSelectedRouteObj(obj);
  };

  // ── Activate / Deactivate route ──
  const handleRouteAction = async (route, value) => {
    if (value === "edit") {
      setEditRoute(route);
      setShowCreateRoute(true);
      return;
    }
    if (value === "toggle") {
      const isActive = route.status === "ACTIVE";
      setTogglingId(route.id);
      try {
        isActive ? await deactivateRoute(route.id) : await activateRoute(route.id);
        toast.success(isActive
          ? `${route.routeName} deactivated.`
          : `${route.routeName} activated.`
        );
        await fetchRoutes();
        await fetchActiveRoutes();
      } catch {
        toast.error(`Failed to ${isActive ? "deactivate" : "activate"} route.`);
      } finally {
        setTogglingId(null);
      }
    }
  };

  // ── Route saved (add / edit) ──
  const handleRouteSaved = async (isEdit) => {
    setShowCreateRoute(false);
    setEditRoute(null);
    toast.success(isEdit ? "Route updated successfully." : "Route created successfully.");
    await fetchRoutes();
    await fetchActiveRoutes();
  };

  // ── Delete stop ──
  const handleDeleteStop = async (stopId) => {
    if (!selectedRouteId) return;
    setDeletingStopId(stopId);
    try {
      await deleteRouteStop(selectedRouteId, stopId);
      toast.success("Stop deleted successfully.");
      await fetchStops(selectedRouteId);
    } catch {
      toast.error("Failed to delete stop.");
    } finally {
      setDeletingStopId(null);
    }
  };

  // ── Stop action (edit / delete) ──
  const handleStopAction = (stop, value) => {
    if (value === "edit") {
      setEditStop(stop);
      setShowAddStop(true);
    }
    if (value === "delete") {
      handleDeleteStop(stop.id);
    }
  };

  // ── Stop saved ──
  const handleStopSaved = async (isEdit) => {
    setShowAddStop(false);
    setEditStop(null);
    toast.success(isEdit ? "Stop updated successfully." : "Stop added successfully.");
    if (selectedRouteId) await fetchStops(selectedRouteId);
  };

  return (
    <>
      <ToastContainer />

      <div className="min-h-screen bg-[#f0f2f8] font-sans">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" />
            Routes Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Create and manage transport routes, assign vehicles and drivers, and configure stops with pickup &amp; drop timings.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

            {/* ══════════════════════════════════════════════════════
                LEFT — Routes List
            ══════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  <div>
                    <h2 className="font-bold text-gray-900 text-base">Routes</h2>
                    <p className="text-xs text-gray-400">{allRoutes.length} route{allRoutes.length !== 1 ? "s" : ""} found</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditRoute(null); setShowCreateRoute(true); }}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> New Route
                </button>
              </div>

              {/* Filters */}
              <div className="px-5 py-3 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search route name or code…"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                  />
                </div>
                <div className="relative shrink-0">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer min-w-32.5"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Route Cards */}
              <div className="p-4 space-y-3 max-h-150 overflow-y-auto">
                {loadingRoutes ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-4 animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                        <div className="h-3 bg-gray-100 rounded w-1/3 mb-3" />
                        <div className="h-3 bg-gray-100 rounded w-full" />
                      </div>
                    ))}
                  </div>
                ) : allRoutes.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Map className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-sm">No routes found</p>
                    <p className="text-xs mt-1">Try adjusting your search or filters</p>
                  </div>
                ) : (
                  allRoutes.map((route) => {
                    const isBusy = togglingId === route.id;
                    return (
                      <div
                        key={route.id}
                        className="rounded-xl border-2 border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/40 transition-all p-4"
                      >
                        {/* Top row */}
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 text-sm leading-tight">{route.routeName}</p>
                            <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                              {route.routeCode}
                            </span>
                          </div>
                          {isBusy ? (
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">Wait…</span>
                          ) : (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                              route.status === "ACTIVE"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : "bg-gray-100 text-gray-500 border border-gray-200"
                            }`}>
                              {route.status}
                            </span>
                          )}
                        </div>

                        {/* Info chips */}
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mb-2">
                          <span className="flex items-center gap-1">
                            <Bus className="w-3.5 h-3.5 text-blue-400" />
                            {route.vehicleNumber}
                            {route.vehicleType && (
                              <span className="text-gray-400">({typeLabel[route.vehicleType] || route.vehicleType})</span>
                            )}
                          </span>
                          <span className="flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-orange-400" />
                            {route.driverName || "—"}
                          </span>
                          {route.attendantName && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3.5 h-3.5 text-teal-400" />
                              {route.attendantName}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {fmtTime(route.startTime)} – {fmtTime(route.returnTime)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
                            {route.totalStops} stop{route.totalStops !== 1 ? "s" : ""}
                          </span>
                        </div>

                        {/* Utilisation bar */}
                        <UtilBar allocated={route.allocatedStudents} capacity={route.vehicleCapacity} />

                        {/* Actions */}
                        <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                          <ActionDropDownComp
                            onAction={(val) => handleRouteAction(route, val)}
                            actionOptions={[
                              {
                                label: "Edit", value: "edit", icon: Pencil,
                                bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50",
                              },
                              {
                                label: route.status === "ACTIVE" ? "Deactivate" : "Activate",
                                value: "toggle",
                                icon: route.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                                bg: "bg-white",
                                text: route.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                                hover: route.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                                disabled: isBusy,
                              },
                            ]}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                RIGHT — Stops Panel
            ══════════════════════════════════════════════════════ */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

              {/* Header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500 shrink-0" />
                    <h2 className="font-bold text-gray-900 text-base">Route Stops</h2>
                  </div>
                  {selectedRouteId && (
                    <button
                      onClick={() => { setEditStop(null); setShowAddStop(true); }}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" /> Add Stop
                    </button>
                  )}
                </div>

                {/* Route dropdown */}
                <div className="relative">
                  <select
                    value={selectedRouteId}
                    onChange={handleRouteDropdownChange}
                    className="appearance-none w-full pl-4 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer font-medium text-gray-700"
                  >
                    <option value="">— Select a Route to view Stops —</option>
                    {activeRoutes.map((r) => (
                      <option key={r.id} value={String(r.id)}>
                        {r.routeName} ({r.routeCode})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>

                {/* Selected route summary chips */}
                {selectedRouteObj && (
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-2.5">
                    <span className="flex items-center gap-1">
                      <Bus className="w-3.5 h-3.5 text-blue-400" />
                      {selectedRouteObj.vehicleNumber}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-orange-400" />
                      {selectedRouteObj.driverName || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {fmtTime(selectedRouteObj.startTime)} – {fmtTime(selectedRouteObj.returnTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-400" />
                      {stops.length} stop{stops.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Timeline Stops ── */}
              <div className="px-5 py-5 max-h-150 overflow-y-auto">
                {!selectedRouteId ? (
                  <div className="text-center py-16 text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium">Select a route to view stops</p>
                    <p className="text-xs mt-1">Use the dropdown above to pick a route</p>
                  </div>
                ) : loadingStops ? (
                  <div className="space-y-4 pt-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-4 animate-pulse">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-3.5 bg-gray-200 rounded w-1/2" />
                          <div className="h-3 bg-gray-100 rounded w-2/3" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : stops.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-sm">No stops yet</p>
                    <p className="text-xs mt-1">Click "+ Add Stop" to add the first stop</p>
                  </div>
                ) : (
                  <div className="relative">
                    {[...stops]
                      .sort((a, b) => a.stopOrder - b.stopOrder)
                      .map((stop, idx, arr) => {
                        const isLast   = idx === arr.length - 1;
                        const isDeleting = deletingStopId === stop.id;
                        return (
                          <div key={stop.id} className="flex gap-4">
                            {/* Timeline column */}
                            <div className="flex flex-col items-center shrink-0" style={{ width: 34 }}>
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 border-2 shrink-0
                                ${isDeleting
                                  ? "bg-gray-200 border-gray-300 text-gray-400 animate-pulse"
                                  : isLast
                                    ? "bg-red-500 border-red-500 text-white"
                                    : "bg-white border-blue-500 text-blue-600"
                                }`}
                              >
                                {stop.stopOrder}
                              </div>
                              {!isLast && (
                                <div className="w-px bg-gray-200 flex-1 my-1" style={{ minHeight: 36 }} />
                              )}
                            </div>

                            {/* Stop content */}
                            <div className={`flex-1 flex items-start justify-between gap-3 ${isLast ? "pb-0" : "pb-5"}`}>
                              <div className="flex-1 min-w-0">
                                <p className={`font-bold text-sm leading-tight ${isDeleting ? "text-gray-400" : "text-gray-900"}`}>
                                  {stop.stopName}
                                </p>
                                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1 flex-wrap">
                                  <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                                  <span>Pickup: {fmtTime(stop.pickupTime)}</span>
                                  <span className="text-gray-300 mx-1">|</span>
                                  <span>Drop: {fmtTime(stop.dropTime)}</span>
                                </div>
                                <div className="flex items-start gap-1 mt-0.5">
                                  <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                  <p className="text-xs text-gray-400 leading-relaxed">
                                    {stop.locationAddress}
                                    {stop.landmark && ` · ${stop.landmark}`}
                                  </p>
                                </div>
                              </div>
                              <div className="shrink-0 mt-0.5">
                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                ) : (
                                  <ActionDropDownComp
                                    onAction={(val) => handleStopAction(stop, val)}
                                    actionOptions={[
                                      { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                                      { label: "Delete", value: "delete", icon: Trash2, bg: "bg-white", text: "text-red-600", hover: "hover:bg-red-50" },
                                    ]}
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                        );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ── Modals ── */}
      <CreateRouteCard
        isOpen={showCreateRoute}
        onClose={() => { setShowCreateRoute(false); setEditRoute(null); }}
        onSaved={handleRouteSaved}
        editData={editRoute}
      />
      <AddStopCard
        isOpen={showAddStop}
        onClose={() => { setShowAddStop(false); setEditStop(null); }}
        onSaved={handleStopSaved}
        editData={editStop}
        routeId={selectedRouteId ? Number(selectedRouteId) : null}
        routeName={selectedRouteObj ? `${selectedRouteObj.routeName} (${selectedRouteObj.routeCode})` : ""}
      />
    </>
  );
}