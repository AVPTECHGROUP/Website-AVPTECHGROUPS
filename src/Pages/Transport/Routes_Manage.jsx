import { useState } from "react";
import {
  Map, Search, ChevronDown, Plus, Pencil, ToggleLeft, ToggleRight,
  Trash2, Clock, MapPin, Bus, User, CheckCircle2,
} from "lucide-react";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import AddStopCard from "../../Components/Transport/AddStopCard";
import CreateRouteCard from "../../Components/Transport/CreateRouteCard";

const initialRoutes = [
  {
    id: 1, name: "Stops-Route A", code: "RT-001",
    vehicle: "MH12AB1234", vehicleType: "BUS",
    driver: "Ramesh Kumar",
    timeStart: "07:00", timeEnd: "14:30",
    allocated: 38, capacity: 40,
    status: "ACTIVE",
    stops: [
      { id: 1, order: 1, name: "Main Gate",          pickup: "07:00", drop: "14:30", address: "School Main Gate, ABC Nagar", landmark: "Near ABC Bank" },
      { id: 2, order: 2, name: "Sunrise Colony",     pickup: "07:15", drop: "14:15", address: "Sunrise Colony Gate, Sector 4", landmark: "Sunrise Apartments" },
      { id: 3, order: 3, name: "Model Colony Chowk", pickup: "07:30", drop: "14:00", address: "Model Colony, Pune", landmark: "D-Mart Junction" },
      { id: 4, order: 4, name: "Aundh Road",         pickup: "07:45", drop: "13:45", address: "Aundh Road, Stop 7", landmark: "HDFC Bank ATM" },
    ],
  },
  {
    id: 2, name: "Route B – South Zone", code: "RT-002",
    vehicle: "MH12CD5678", vehicleType: "MINI BUS",
    driver: "Suresh Patil",
    timeStart: "07:15", timeEnd: "14:45",
    allocated: 20, capacity: 20,
    status: "ACTIVE",
    stops: [
      { id: 5, order: 1, name: "City Centre",    pickup: "07:15", drop: "14:45", address: "City Centre Bus Stop", landmark: "Near City Mall" },
      { id: 6, order: 2, name: "South Market",   pickup: "07:30", drop: "14:30", address: "South Market Gate", landmark: "Near Bank of India" },
      { id: 7, order: 3, name: "Railway Colony", pickup: "07:45", drop: "14:15", address: "Railway Colony Stop 3", landmark: "Railway Gate No. 4" },
    ],
  },
];

const STATUS_OPTIONS = ["All Status", "ACTIVE", "INACTIVE"];

function UtilBar({ allocated, capacity }) {
  const pct   = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0;
  const color = pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : "bg-blue-500";
  return (
    <div className="flex items-center gap-2 mt-2">
      <div className="w-32 h-2.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 font-medium">{allocated}/{capacity} ({pct}%)</span>
    </div>
  );
}

export default function Routes_Manage() {
  const [routes, setRoutes]             = useState(initialRoutes);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [selectedRoute, setSelectedRoute] = useState(initialRoutes[0]);
  const [showCreateRoute, setShowCreateRoute] = useState(false);
  const [showAddStop, setShowAddStop]         = useState(false);

  const handleRouteAction = (routeId, value) => {
    if (value === "toggle") {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? { ...r, status: r.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
            : r
        )
      );
      setSelectedRoute((prev) =>
        prev?.id === routeId
          ? { ...prev, status: prev.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" }
          : prev
      );
    }
  };

  const handleStopAction = (stopId, value) => {
    if (value === "delete") {
      const updated = routes.map((r) =>
        r.id === selectedRoute?.id
          ? { ...r, stops: r.stops.filter((s) => s.id !== stopId) }
          : r
      );
      setRoutes(updated);
      setSelectedRoute(updated.find((r) => r.id === selectedRoute?.id));
    }
  };

  const handleSaveRoute = (data) => {
    const newRoute = {
      id: routes.length + 1,
      name: data.routeName,
      code: data.routeCode,
      vehicle: data.vehicle.split(" ")[0],
      vehicleType: data.vehicle.match(/\(([^)]+)\)/)?.[1] || "BUS",
      driver: data.driver,
      timeStart: data.startTime,
      timeEnd: data.returnTime,
      allocated: 0, capacity: 40,
      status: "ACTIVE",
      stops: [],
    };
    setRoutes((prev) => [...prev, newRoute]);
  };

  const handleSaveStop = (data) => {
    if (!selectedRoute) return;
    const newStop = {
      id: Date.now(),
      order: data.stopOrder,
      name: data.stopName,
      pickup: data.pickupTime,
      drop: data.dropTime,
      address: data.locationAddress,
      landmark: data.landmark,
    };
    const updated = routes.map((r) =>
      r.id === selectedRoute.id
        ? { ...r, stops: [...r.stops, newStop].sort((a, b) => a.order - b.order) }
        : r
    );
    setRoutes(updated);
    setSelectedRoute(updated.find((r) => r.id === selectedRoute.id));
  };

  const filtered = routes.filter((r) => {
    const q = search.toLowerCase();
    const matchSearch = r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q);
    const matchStatus = statusFilter === "All Status" || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
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

          {/* ── LEFT: Routes List ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h2 className="font-bold text-gray-900 text-base">Routes</h2>
              </div>
              <button
                onClick={() => setShowCreateRoute(true)}
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
                  placeholder="Search route name, code…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none pl-4 pr-9 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer 
                  "
                >
                  {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Route Cards */}
            <div className="p-4 space-y-3 max-h-150 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Map className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">No routes found</p>
                </div>
              ) : (
                filtered.map((route) => {
                  const isSelected = selectedRoute?.id === route.id;
                  return (
                    <div
                      key={route.id}
                      onClick={() => setSelectedRoute(route)}
                      className={`rounded-xl border-2 p-4 cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-100 bg-gray-50 hover:border-blue-200 hover:bg-blue-50/40"
                      }`}
                    >
                      {/* Route top row */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{route.name}</p>
                          <span className="text-xs font-medium bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                            {route.code}
                          </span>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                          route.status === "ACTIVE"
                            ? "bg-green-100 text-green-700 border border-green-200"
                            : "bg-gray-100 text-gray-500 border border-gray-200"
                        }`}>
                          {route.status}
                        </span>
                      </div>

                      {/* Info row */}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                        <span className="flex items-center gap-1"><Bus className="w-3.5 h-3.5 text-blue-400" />{route.vehicle}</span>
                        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5 text-orange-400" />{route.driver}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gray-400" />{route.timeStart}–{route.timeEnd}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-red-400" />{route.stops.length} stops</span>
                      </div>

                      {/* Util bar */}
                      <UtilBar allocated={route.allocated} capacity={route.capacity} />

                      {/* Actions */}
                      <div className="mt-3" onClick={(e) => e.stopPropagation()}>
                        <ActionDropDownComp
                          onAction={(val) => handleRouteAction(route.id, val)}
                          actionOptions={[
                            { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                            {
                              label: route.status === "ACTIVE" ? "Deactivate" : "Activate",
                              value: "toggle",
                              icon: route.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                              bg: "bg-white",
                              text: route.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                              hover: route.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
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

          {/* ── RIGHT: Stops Panel ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" />
                <div className="flex items-center gap-3">
                  <h2 className="font-medium text-gray-900 text-base">
                    {selectedRoute ? selectedRoute.name : "Stops"}
                  </h2>
                  {selectedRoute && (
                    <p className="text-xs lg:text-sm font-medium mt-0.5">{selectedRoute.code}</p>
                  )}
                </div>
              </div>
              {selectedRoute && (
                <button
                  onClick={() => setShowAddStop(true)}
                  className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Add Stop
                </button>
              )}
            </div>

            {/* ── Timeline Stops ── */}
            <div className="px-5 py-5 max-h-150 overflow-y-auto">
              {!selectedRoute ? (
                <div className="text-center py-16 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium">Select a route to view stops</p>
                  <p className="text-xs mt-1">Click on any route card on the left</p>
                </div>
              ) : selectedRoute.stops.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MapPin className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">No stops yet</p>
                  <p className="text-xs mt-1">Click "+ Add Stop" to add the first stop</p>
                </div>
              ) : (
                <div className="relative">
                  {selectedRoute.stops.map((stop, idx) => {
                    const isLast = idx === selectedRoute.stops.length - 1;
                    return (
                      <div key={stop.id} className="flex gap-4">

                        {/* ── Timeline column ── */}
                        <div className="flex flex-col items-center shrink-0" style={{ width: 34 }}>
                          {/* Number badge */}
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 border-2 shrink-0
                              ${isLast
                                ? "bg-red-500 border-red-500 text-white"
                                : "bg-white border-blue-500 text-blue-600"
                              }`}
                          >
                            {stop.order}
                          </div>
                          {/* Connector line */}
                          {!isLast && (
                            <div className="w-px bg-gray-200 flex-1 my-1" style={{ minHeight: 36 }} />
                          )}
                        </div>

                        {/* ── Stop content ── */}
                        <div className={`flex-1 flex items-start justify-between gap-3 ${isLast ? "pb-0" : "pb-5"}`}>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-900 text-sm leading-tight">{stop.name}</p>
                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                              <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                              <span>Pickup: {stop.pickup}</span>
                              <span className="text-gray-300 mx-1">|</span>
                              <span>Drop: {stop.drop}</span>
                            </div>
                            <div className="flex items-start gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                              <p className="text-xs text-gray-400 leading-relaxed">
                                {stop.address} · {stop.landmark}
                              </p>
                            </div>
                          </div>

                          {/* ── Actions ── */}
                          <div className="shrink-0 mt-0.5">
                            <ActionDropDownComp
                              onAction={(val) => handleStopAction(stop.id, val)}
                              actionOptions={[
                                { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                                { label: "Delete", value: "delete", icon: Trash2, bg: "bg-white", text: "text-red-600", hover: "hover:bg-red-50" },
                              ]}
                            />
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

      {/* ── Modals ── */}
      <CreateRouteCard
        isOpen={showCreateRoute}
        onClose={() => setShowCreateRoute(false)}
        onSave={handleSaveRoute}
      />
      <AddStopCard
        isOpen={showAddStop}
        onClose={() => setShowAddStop(false)}
        onSave={handleSaveStop}
        routeName={selectedRoute ? `${selectedRoute.name} (${selectedRoute.code})` : ""}
      />
    </div>
  );
}