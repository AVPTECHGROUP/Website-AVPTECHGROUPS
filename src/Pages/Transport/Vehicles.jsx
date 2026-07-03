import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bus, Search, ChevronDown, AlertTriangle, CheckCircle2,
  XCircle, Pencil, ToggleLeft, ToggleRight, Plus, SlidersHorizontal,
  CheckCircle, XCircle as XCircleIcon,
} from "lucide-react";
import AddVehicleCard     from "../../Components/Transport/AddVehicleCard";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import ListLoader         from "../../Components/CommonComp/ListLoader";
import {
  getVehicles,
  getActiveVehicles,
  getVehicleCapacityReport,
  activateVehicle,
  deactivateVehicle,
} from "../../Api/Transport/TransportAPI";
import { toast } from "react-toastify";

// ─── Constants ────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { value: "",         label: "All Status" },
  { value: "ACTIVE",   label: "Active"     },
  { value: "INACTIVE", label: "Inactive"   },
];

const TYPE_OPTIONS_BASE = [{ value: "", label: "All Types" }];
const ITEMS_PER_PAGE    = 10;

const typeColors = {
  BUS:      "bg-blue-100 text-blue-700",
  MINI_BUS: "bg-purple-100 text-purple-700",
  VAN:      "bg-orange-100 text-orange-700",
};
const typeLabel = { BUS: "BUS", MINI_BUS: "MINI BUS", VAN: "VAN" };

// Desktop table column definitions — keeps header + body cells in sync
// and makes it easy to hide/show columns at specific breakpoints.
const TABLE_COLUMNS = [
  { label: "#",            extra: "px-4 sm:px-6 w-8" },
  { label: "Vehicle",       extra: "px-3 sm:px-4" },
  { label: "Type",          extra: "px-3 sm:px-4" },
  { label: "Capacity",      extra: "px-3 sm:px-4" },
  { label: "GPS",           extra: "px-3 sm:px-4" },
  { label: "Make / Model",  extra: "px-3 sm:px-4 hidden 2xl:table-cell" },
  { label: "Compliance",    extra: "px-3 sm:px-4" },
  { label: "Status",        extra: "px-3 sm:px-4" },
  { label: "Actions",       extra: "px-3 sm:px-4 text-center" },
];

// ─── Helpers ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function isExpiringSoon(dateStr, days = 30) {
  if (!dateStr) return false;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}

// ─── Mobile / Tablet Vehicle Card ──────────────────────────────────
function VehicleCard({ v, capacityMap, onAction }) {
  const cap     = capacityMap[v.id] || {};
  const insDate = v.insuranceExpiryDate   || cap.insuranceExpiryDate;
  const fitDate = v.fitnessCertExpiryDate || cap.fitnessCertExpiryDate;
  const insWarn = isExpiringSoon(insDate);
  const fitWarn = isExpiringSoon(fitDate);

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-bold text-gray-900 text-sm">{v.vehicleNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">{v.makeModel} · {v.yearOfManufacture}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[v.vehicleType] || "bg-gray-100 text-gray-600"}`}>
            {typeLabel[v.vehicleType] || v.vehicleType}
          </span>
          {v.status === "ACTIVE"
            ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
              </span>
            : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
              </span>
          }
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">Capacity</p>
          <p className="font-bold text-gray-700">{v.capacity} seats</p>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">GPS</p>
          {v.gpsEnabled
            ? <span className="inline-flex items-center gap-1 text-green-600 font-semibold"><CheckCircle2 className="w-3.5 h-3.5" /> Enabled</span>
            : <span className="inline-flex items-center gap-1 text-red-500 font-semibold"><XCircle className="w-3.5 h-3.5" /> Disabled</span>
          }
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">Insurance Expiry</p>
          <span className={`inline-flex items-center gap-1 font-semibold ${insWarn ? "text-orange-600" : "text-gray-700"}`}>
            {insWarn && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
            {fmtDate(insDate)}
          </span>
        </div>
        <div className="bg-gray-50 rounded-lg px-3 py-2">
          <p className="text-gray-400 font-medium mb-0.5">Fitness Expiry</p>
          <span className={`inline-flex items-center gap-1 font-semibold ${fitWarn ? "text-orange-600" : "text-gray-700"}`}>
            {fitWarn && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
            {fmtDate(fitDate)}
          </span>
        </div>
      </div>

      <ActionDropDownComp
        onAction={(val) => onAction(v, val)}
        actionOptions={[
          { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
          {
            label: v.status === "ACTIVE" ? "Deactivate" : "Activate",
            value: "toggle",
            icon: v.status === "ACTIVE" ? ToggleLeft : ToggleRight,
            bg: "bg-white",
            text: v.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
            hover: v.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
          },
        ]}
      />
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────
export default function Vehicles() {
  // ── All vehicles (fetched once, no type param sent) ──
  const [allVehicles, setAllVehicles]   = useState([]);   // raw API data, unfiltered
  const [pagination, setPagination]     = useState(null);
  const [capacityMap, setCapacityMap]   = useState({});
  const [typeOptions, setTypeOptions]   = useState(TYPE_OPTIONS_BASE);

  const [loading, setLoading]           = useState(true);
  const [togglingId, setTogglingId]     = useState(null);

  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [typeFilter, setTypeFilter]     = useState("");    // "" | "BUS" | "MINI_BUS" | "VAN"
  const [statusFilter, setStatusFilter] = useState("");    // "" | "ACTIVE" | "INACTIVE"
  const [page, setPage]                 = useState(0);

  const [showModal, setShowModal]       = useState(false);
  const [editVehicle, setEditVehicle]   = useState(null);

  // ── Debounce search ──
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  // ── Fetch all vehicles from API (status filter sent to server, type filtered FE) ──
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch a large page so we can do FE type filtering on the full dataset.
      // Status filter is reliable server-side so we pass it directly.
      const res = await getVehicles({
        page:       0,
        size:       500,           // fetch all, FE handles type + search + pagination
        searchTerm: search,
        type:       "",            // do NOT send type to API — handle on FE
        status:     statusFilter,  // status IS reliable server-side
      });
      setAllVehicles(res.vehicles || []);
    } catch (e) {
      console.error(e);
      toast.error("Failed to load vehicles.");
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchVehicles(); }, [fetchVehicles]);

  // ── Fetch capacity report (insurance / fitness expiry dates) ──
  const fetchCapacity = useCallback(() => {
    getVehicleCapacityReport({ expiringSoonDays: 30 })
      .then((data) => {
        const map = {};
        data.forEach((row) => { map[row.vehicleId] = row; });
        setCapacityMap(map);
      })
      .catch(console.error);
  }, []);

  useEffect(() => { fetchCapacity(); }, [fetchCapacity]);

  // ── Build type dropdown from active vehicles ──
  useEffect(() => {
    getActiveVehicles()
      .then((data) => {
        const seen = new Set(data.map((v) => v.vehicleType));
        setTypeOptions([
          { value: "", label: "All Types" },
          ...Array.from(seen).map((val) => ({
            value: val,
            label: typeLabel[val] || val,
          })),
        ]);
      })
      .catch(console.error);
  }, []);

  // ── Frontend type filter + pagination ──
  const filtered = typeFilter
    ? allVehicles.filter((v) => v.vehicleType === typeFilter)
    : allVehicles;

  const totalItems  = filtered.length;
  const totalPages  = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  const safePage    = Math.min(page, totalPages - 1);
  const paginated   = filtered.slice(safePage * ITEMS_PER_PAGE, (safePage + 1) * ITEMS_PER_PAGE);
  const currentPage = safePage;

  // Reset to page 0 when type filter changes
  useEffect(() => { setPage(0); }, [typeFilter]);

  const pageNumbers = () => {
    const pages = [];
    for (let i = Math.max(0, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) pages.push(i);
    return pages;
  };

  // ── Toggle activate / deactivate ──
  const handleAction = async (vehicle, value) => {
    if (value === "edit") {
      setEditVehicle(vehicle);
      setShowModal(true);
      return;
    }
    if (value === "toggle") {
      const isActive = vehicle.status === "ACTIVE";
      setTogglingId(vehicle.id);
      try {
        isActive
          ? await deactivateVehicle(vehicle.id)
          : await activateVehicle(vehicle.id);
        toast.success(
          isActive
            ? `${vehicle.vehicleNumber} deactivated successfully.`
            : `${vehicle.vehicleNumber} activated successfully.`
        );
        await fetchVehicles();
      } catch (e) {
        console.error(e);
        toast.error(`Failed to ${isActive ? "deactivate" : "activate"} ${vehicle.vehicleNumber}.`);
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleSaved = async (isEdit) => {
    setShowModal(false);
    setEditVehicle(null);
    toast.success(isEdit ? "Vehicle updated successfully." : "Vehicle added successfully.");
    await fetchVehicles();
    fetchCapacity();
  };

  return (
    <>

      <div className="min-h-screen bg-[#f0f2f8] font-sans">

        {/* ── Page Header ── */}
        <div className="px-4 sm:px-6 lg:px-6 2xl:px-8 pt-6 sm:pt-8 pb-2">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Bus className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 shrink-0" />
            Vehicle Management
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
            Manage your entire fleet — add vehicles, track GPS status, monitor
            insurance &amp; fitness expiry, and toggle active status in one place.
          </p>
        </div>

        <div className="px-4 sm:px-6 lg:px-6 2xl:px-8 py-4 sm:py-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

            {/* ── Table Header ── */}
            <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                  Manage Vehicles
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {totalItems} vehicle{totalItems !== 1 ? "s" : ""} found
                </p>
              </div>
              <button
                onClick={() => { setEditVehicle(null); setShowModal(true); }}
                className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" /> Add Vehicle
              </button>
            </div>

            {/* ── Filters ── */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by vehicle number or model…"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 sm:gap-3">
                {/* Type filter — frontend */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="appearance-none w-full pl-3 sm:pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[130px]"
                  >
                    {typeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
                {/* Status filter — server-side */}
                <div className="relative flex-1 sm:flex-none">
                  <select
                    value={statusFilter}
                    onChange={(e) => { setStatusFilter(e.target.value); setPage(0); }}
                    className="appearance-none w-full pl-3 sm:pl-4 pr-8 py-2.5 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[130px]"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* ── Mobile / Tablet / Small-Laptop Cards (below 1280px) ── */}
            <div className="block xl:hidden px-4 py-4 space-y-3">
              {loading ? (
                <table className="w-full"><tbody><ListLoader rows={4} avatar={false} /></tbody></table>
              ) : paginated.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">No vehicles found</p>
                  <p className="text-xs mt-1">Try adjusting your search or filters</p>
                </div>
              ) : paginated.map((v) => (
                <VehicleCard key={v.id} v={v} capacityMap={capacityMap} onAction={handleAction} />
              ))}
            </div>

            {/* ── Desktop Table (1280px and above) ── */}
            <div className="hidden xl:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    {TABLE_COLUMNS.map((col, i) => (
                      <th
                        key={i}
                        className={`${col.extra} py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider text-nowrap`}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <ListLoader rows={ITEMS_PER_PAGE} avatar={false} />
                  ) : paginated.length === 0 ? (
                    <tr>
                      <td colSpan={TABLE_COLUMNS.length} className="text-center py-16 text-gray-400">
                        <Bus className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                        <p className="font-medium">No vehicles found</p>
                        <p className="text-xs mt-1">Try adjusting your search or filters</p>
                      </td>
                    </tr>
                  ) : paginated.map((v, idx) => {
                    const cap     = capacityMap[v.id] || {};
                    const insDate = v.insuranceExpiryDate   || cap.insuranceExpiryDate;
                    const fitDate = v.fitnessCertExpiryDate || cap.fitnessCertExpiryDate;
                    const insWarn = isExpiringSoon(insDate);
                    const fitWarn = isExpiringSoon(fitDate);
                    const isBusy  = togglingId === v.id;

                    return (
                      <tr key={v.id} className="hover:bg-blue-50/30 transition-colors text-center">
                        <td className="px-4 sm:px-6 py-3 text-gray-400 text-xs font-medium">
                          {currentPage * ITEMS_PER_PAGE + idx + 1}
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <p className="font-bold text-gray-900">{v.vehicleNumber}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{v.makeModel} · {v.yearOfManufacture}</p>
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          <span className={`text-xs font-semibold text-nowrap px-2.5 py-1 rounded-full ${typeColors[v.vehicleType] || "bg-gray-100 text-gray-600"}`}>
                            {typeLabel[v.vehicleType] || v.vehicleType}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-gray-700 font-semibold">{v.capacity}</td>
                        <td className="px-3 sm:px-4 py-3">
                          {v.gpsEnabled
                            ? <span className="inline-flex items-center gap-1 text-green-600 text-xs font-semibold bg-green-50 px-2.5 py-1 rounded-full border border-green-100"><CheckCircle2 className="w-3.5 h-3.5" /> Yes</span>
                            : <span className="inline-flex items-center gap-1 text-red-500 text-xs font-semibold bg-red-50 px-2.5 py-1 rounded-full border border-red-100"><XCircle className="w-3.5 h-3.5" /> No</span>
                          }
                        </td>
                        <td className="px-3 sm:px-4 py-3 hidden 2xl:table-cell text-nowrap text-gray-600">{v.makeModel}</td>
                        <td className="px-3 sm:px-4 py-3 text-left">
                          <div className="flex flex-col gap-1 text-xs">
                            <span className={`inline-flex items-center gap-1 font-semibold ${insWarn ? "text-orange-600" : "text-gray-600"}`}>
                              {insWarn && <AlertTriangle className="w-3 h-3 shrink-0" />}
                              <span className="text-gray-400 font-normal">Ins:</span> {fmtDate(insDate)}
                            </span>
                            <span className={`inline-flex items-center gap-1 font-semibold ${fitWarn ? "text-orange-600" : "text-gray-600"}`}>
                              {fitWarn && <AlertTriangle className="w-3 h-3 shrink-0" />}
                              <span className="text-gray-400 font-normal">Fit:</span> {fmtDate(fitDate)}
                            </span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-3">
                          {isBusy ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">Wait…</span>
                          ) : v.status === "ACTIVE" ? (
                            <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-3 sm:px-4 py-3 text-center">
                          <ActionDropDownComp
                            onAction={(val) => handleAction(v, val)}
                            actionOptions={[
                              { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                              {
                                label: v.status === "ACTIVE" ? "Deactivate" : "Activate",
                                value: "toggle",
                                icon: v.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                                bg: "bg-white",
                                text: v.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                                hover: v.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                                disabled: isBusy,
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ── */}
            {!loading && totalPages > 1 && (
              <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-xs text-gray-400 font-medium">
                  Showing {totalItems === 0 ? 0 : currentPage * ITEMS_PER_PAGE + 1}–{Math.min((currentPage + 1) * ITEMS_PER_PAGE, totalItems)} of {totalItems} vehicle{totalItems !== 1 ? "s" : ""}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  {pageNumbers().map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${
                        currentPage === p
                          ? "bg-blue-600 text-white shadow-sm"
                          : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      {p + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage === totalPages - 1}
                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ── Add / Edit Modal ── */}
        <AddVehicleCard
          isOpen={showModal}
          onClose={() => { setShowModal(false); setEditVehicle(null); }}
          onSaved={handleSaved}
          editData={editVehicle}
        />
      </div>
    </>
  );
}