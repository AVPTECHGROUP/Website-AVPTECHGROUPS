import { useState, useEffect, useCallback } from "react";
import {
  Map, Search, ChevronDown, Plus, Pencil, ToggleLeft, ToggleRight,
  Trash2, Clock, MapPin, Bus, User, Users, CheckCircle, XCircle as XCircleIcon,
  Loader2, RefreshCw,
} from "lucide-react";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import AddStopCard from "../../Components/Transport/AddStopCard";
import CreateRouteCard from "../../Components/Transport/CreateRouteCard";
import {
  getRoutes,
  activateRoute,
  deactivateRoute,
  getRouteStops,
  deleteRouteStop,
  getActiveRoutes,
} from "../../Api/Transport/TransportAPI";
import {
  STATUS,
  ACTION_TYPES,
  STATUS_OPTIONS,
  VEHICLE_TYPE_LABELS,
  TOAST_MESSAGES,
  ROUTES_UI_TEXT,
  COMMON_UI_TEXT,
  ACTION_MESSAGES
} from "../../Constants/StringConstants/TransportConstants";
import { toast } from "react-toastify";

// ─── Helpers ──────────────────────────────────────────────────────
function fmtTime(t) {
  if (!t) return "—";
  return String(t).slice(0, 5); // "07:00:00" → "07:00"
}

function UtilBar({ allocated, capacity }) {
  const pct = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0;
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

// ─── Main ─────────────────────────────────────────────────────────
export default function Routes_Manage() {

  // ── Routes list state ──
  const [allRoutes, setAllRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // ── Route modal ──
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [editRoute, setEditRoute] = useState(null);

  // ── Stops panel state ──
  const [activeRoutes, setActiveRoutes] = useState([]);   // for dropdown
  const [selectedRouteId, setSelectedRouteId] = useState("");   // string id from dropdown
  const [selectedRouteObj, setSelectedRouteObj] = useState(null); // full route object
  const [stops, setStops] = useState([]);
  const [loadingStops, setLoadingStops] = useState(false);
  const [deletingStopId, setDeletingStopId] = useState(null);

  // ── Stop modal ──
  const [showAddStop, setShowAddStop] = useState(false);
  const [editStop, setEditStop] = useState(null);

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
      toast.error(TOAST_MESSAGES.ROUTES_LOAD_FAIL);
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
  }, [selectedRouteId]);

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
      toast.error(TOAST_MESSAGES.STOPS_LOAD_FAIL);
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
    if (value === ACTION_TYPES.EDIT) {
      setEditRoute(route);
      setShowCreateRoute(true);
      return;
    }
    if (value === ACTION_TYPES.TOGGLE) {
      const isActive = route.status === STATUS.ACTIVE;
      setTogglingId(route.id);
      try {
        isActive ? await deactivateRoute(route.id) : await activateRoute(route.id);
        toast.success(isActive
          ? `${route.routeName} ${ACTION_MESSAGES.DEACTIVATED}`
          : `${route.routeName} ${ACTION_MESSAGES.ACTIVATED}`
        );
        await fetchRoutes();
        await fetchActiveRoutes();
      } catch {
        toast.error(`${isActive ? ACTION_MESSAGES.FAILED_DEACTIVATE : ACTION_MESSAGES.FAILED_ACTIVATE} route.`);
      } finally {
        setTogglingId(null);
      }
    }
  };

  // ── Route saved (add / edit) ──
  const handleRouteSaved = async (isEdit) => {
    setShowCreateRoute(false);
    setEditRoute(null);
    toast.success(isEdit ? TOAST_MESSAGES.ROUTE_UPDATE_SUCCESS : TOAST_MESSAGES.ROUTE_CREATE_SUCCESS);
    await fetchRoutes();
    await fetchActiveRoutes();
  };

  // ── Delete stop ──
  const handleDeleteStop = async (stopId) => {
    if (!selectedRouteId) return;
    setDeletingStopId(stopId);
    try {
      await deleteRouteStop(selectedRouteId, stopId);
      toast.success(TOAST_MESSAGES.STOP_DELETE_SUCCESS);
      // Trigger instant dynamic list updates 
      await fetchStops(selectedRouteId);
      await fetchRoutes();
    } catch {
      toast.error(TOAST_MESSAGES.STOP_DELETE_FAIL);
    } finally {
      setDeletingStopId(null);
    }
  };

  // ── Stop action (edit / delete) ──
  const handleStopAction = (stop, value) => {
    if (value === ACTION_TYPES.EDIT) {
      setEditStop(stop);
      setShowAddStop(true);
    }
    if (value === ACTION_TYPES.DELETE) {
      handleDeleteStop(stop.id);
    }
  };

  // ── Stop saved ──
  const handleStopSaved = async (isEdit) => {
    setShowAddStop(false);
    setEditStop(null);

    if (isEdit) {
      toast.success("Stop updated successfully!");
    } else {
      toast.success("Stop added successfully!");
    }

    if (selectedRouteId) {
      // Reload Route Stops section
      await fetchStops(selectedRouteId);

      // Reload Route list (updates totalStops count)
      await fetchRoutes();

      // Reload active routes (updates dropdown summary if needed)
      await fetchActiveRoutes();
    }
  };
  return (
    <>

      <div className="min-h-screen bg-[#f0f2f8] font-sans">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Map className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" />
            {ROUTES_UI_TEXT.PAGE_TITLE}
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            {ROUTES_UI_TEXT.PAGE_SUBTITLE}
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
                    <h2 className="font-bold text-gray-900 text-base">{ROUTES_UI_TEXT.SECTION_ROUTES}</h2>
                    <p className="text-xs text-gray-400">{allRoutes.length} {allRoutes.length !== 1 ? ROUTES_UI_TEXT.LBL_ROUTES : ROUTES_UI_TEXT.LBL_ROUTE} {COMMON_UI_TEXT.FOUND}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setEditRoute(null); setShowCreateRoute(true); }}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> {ROUTES_UI_TEXT.BTN_NEW_ROUTE}
                </button>
              </div>

              {/* Filters */}
              <div className="px-5 py-3 border-b border-gray-50 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={ROUTES_UI_TEXT.SEARCH_PLACEHOLDER}
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
                    <p className="font-medium text-sm">{ROUTES_UI_TEXT.EMPTY_ROUTES_TITLE}</p>
                    <p className="text-xs mt-1">{ROUTES_UI_TEXT.EMPTY_ROUTES_SUBTITLE}</p>
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
                            <span className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0 bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">{COMMON_UI_TEXT.WAIT}</span>
                          ) : (
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${route.status === STATUS.ACTIVE
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
                              <span className="text-gray-400">({VEHICLE_TYPE_LABELS[route.vehicleType] || route.vehicleType})</span>
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
                            {route.totalActiveStops} {route.totalActiveStops !== 1 ? ROUTES_UI_TEXT.LBL_STOPS : ROUTES_UI_TEXT.LBL_STOP}
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
                                label: COMMON_UI_TEXT.EDIT, value: ACTION_TYPES.EDIT, icon: Pencil,
                                bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50",
                              },
                              {
                                label: route.status === STATUS.ACTIVE ? COMMON_UI_TEXT.DEACTIVATE : COMMON_UI_TEXT.ACTIVATE,
                                value: ACTION_TYPES.TOGGLE,
                                icon: route.status === STATUS.ACTIVE ? ToggleLeft : ToggleRight,
                                bg: "bg-white",
                                text: route.status === STATUS.ACTIVE ? "text-orange-600" : "text-green-600",
                                hover: route.status === STATUS.ACTIVE ? "hover:bg-orange-50" : "hover:bg-green-50",
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
                    <h2 className="font-bold text-gray-900 text-base">{ROUTES_UI_TEXT.SECTION_STOPS}</h2>
                  </div>
                  {selectedRouteId && (
                    <button
                      onClick={() => { setEditStop(null); setShowAddStop(true); }}
                      className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm shrink-0"
                    >
                      <Plus className="w-4 h-4" /> {ROUTES_UI_TEXT.BTN_ADD_STOP}
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
                    <option value="">{ROUTES_UI_TEXT.SELECT_ROUTE_OPT}</option>
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
                      {stops.length} {stops.length !== 1 ? ROUTES_UI_TEXT.LBL_STOPS : ROUTES_UI_TEXT.LBL_STOP}
                    </span>
                  </div>
                )}
              </div>

              {/* ── Timeline Stops ── */}
              <div className="px-5 py-5 max-h-150 overflow-y-auto">
                {!selectedRouteId ? (
                  <div className="text-center py-16 text-gray-400">
                    <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium">{ROUTES_UI_TEXT.SELECT_ROUTE_TITLE}</p>
                    <p className="text-xs mt-1">{ROUTES_UI_TEXT.SELECT_ROUTE_SUBTITLE}</p>
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
                    <p className="font-medium text-sm">{ROUTES_UI_TEXT.EMPTY_STOPS_TITLE}</p>
                    <p className="text-xs mt-1">{ROUTES_UI_TEXT.EMPTY_STOPS_SUBTITLE}</p>
                  </div>
                ) : (
                  <div className="relative">
                    {[...stops]
                      .sort((a, b) => a.stopOrder - b.stopOrder)
                      .map((stop, idx, arr) => {
                        const isLast = idx === arr.length - 1;
                        const isDeleting = deletingStopId === stop.id;
                        return (
                          <div key={stop.id} className="flex gap-4 items-start">
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
                                <div className="w-px bg-gray-200 flex-1 my-1" style={{ minHeight: 48 }} />
                              )}
                            </div>

                            {/* Stop Content: Optimized for flexible layouts and laptop displays */}
                            <div className={`flex-1 flex flex-col xl:flex-row xl:items-start justify-between gap-4 ${isLast ? "pb-0" : "pb-6"}`}>

                              {/* Left detail card content panel block */}
                              <div className="flex-1 min-w-0 space-y-1.5">
                                <p className={`font-bold text-gray-900 text-sm sm:text-base tracking-tight leading-snug break-words ${isDeleting ? "text-gray-400" : ""}`}>
                                  {stop.stopName}
                                </p>

                                {/* Timeline details */}
                                <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-wrap pt-0.5">
                                  <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                                    Pickup: {fmtTime(stop.pickupTime)}
                                  </span>
                                  <span className="text-gray-300">|</span>
                                  <span className="font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded whitespace-nowrap">
                                    Drop: {fmtTime(stop.dropTime)}
                                  </span>
                                </div>

                                {/* Address description details mapping block container */}
                                <div className="flex items-start gap-1 pt-1">
                                  <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                                  <p className="text-xs text-gray-500 font-medium leading-relaxed break-words max-w-full">
                                    {stop.locationAddress}
                                    {stop.landmark && <span className="text-gray-400 font-normal"> · {stop.landmark}</span>}
                                  </p>
                                </div>
                              </div>

                              {/* Right side alignment: Fee tag badges alongside operations dropdown configurations */}
                              <div className="flex items-center justify-between xl:justify-end gap-3 shrink-0 mt-1 xl:mt-0 pt-0.5 border-t border-gray-100 xl:border-none w-full xl:w-auto">
                                {stop.monthlyFee && Number(stop.monthlyFee) > 0 ? (
                                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                                    ₹{Number(stop.monthlyFee).toLocaleString("en-IN")}/mo
                                  </span>
                                ) : (
                                  <span className="text-[11px] font-semibold text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-full whitespace-nowrap">
                                    No fee · uses fee plan
                                  </span>
                                )}

                                {isDeleting ? (
                                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                ) : (
                                  <ActionDropDownComp
                                    onAction={(val) => handleStopAction(stop, val)}
                                    actionOptions={[
                                      { label: COMMON_UI_TEXT.EDIT, value: ACTION_TYPES.EDIT, icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                                      { label: COMMON_UI_TEXT.DELETE, value: ACTION_TYPES.DELETE, icon: Trash2, bg: "bg-white", text: "text-red-600", hover: "hover:bg-red-50" },
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