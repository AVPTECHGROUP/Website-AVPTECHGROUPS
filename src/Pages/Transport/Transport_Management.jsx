import { useState, useEffect } from "react";
import {
  Bus, Users, MapPin, GraduationCap,
  AlertTriangle, CheckCircle2, Activity,
  Clock, Info, UserCheck, Wifi, WifiOff,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import CardLoader    from "../../Components/CommonComp/CardLoader";
import ListLoader    from "../../Components/CommonComp/ListLoader";
import {
  getActiveRoutes,
  getActiveVehicles,
  getTransportAllocations,
  getTransportStaff,
  getVehicleCapacityReport,
} from "../../Api/TransportAPI";

const typeColors = {
  BUS: "bg-blue-100 text-blue-700",
  MINI_BUS: "bg-purple-100 text-purple-700",
  "MINI BUS": "bg-purple-100 text-purple-700",
  VAN: "bg-orange-100 text-orange-700",
};

const typeLabel = { BUS: "BUS", MINI_BUS: "MINI BUS", VAN: "VAN" };

function UtilBadge({ allocated, capacity }) {
  const pct = capacity > 0 ? Math.round((allocated / capacity) * 100) : 0;
  if (pct === 100) return (
    <span className="inline-flex items-center gap-1 bg-red-50 text-red-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-red-100 whitespace-nowrap">
      <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> Full
    </span>
  );
  if (pct >= 80) return (
    <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-100 whitespace-nowrap">
      <AlertTriangle className="w-3 h-3" /> Near Full
    </span>
  );
  if (pct === 0) return (
    <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-100 whitespace-nowrap">
      <CheckCircle2 className="w-3 h-3" /> Available
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-600 text-xs font-semibold px-2.5 py-1 rounded-full border border-blue-100 whitespace-nowrap">
      <Activity className="w-3 h-3" /> Active
    </span>
  );
}

function buildAlerts(capacityReport, staff) {
  const alerts = [];
  const today = new Date();

  capacityReport.forEach((v) => {
    if (v.insuranceExpiringSoon && v.insuranceExpiryDate) {
      const exp = new Date(v.insuranceExpiryDate);
      const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `ins-${v.vehicleId}`,
        type: "warning",
        msg: {
          pre: "",
          bold1: v.vehicleNumber,
          mid: " – Insurance expires on ",
          bold2: new Date(v.insuranceExpiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          post: days > 0 ? ` (${days} days left)` : " (EXPIRED)",
        },
      });
    }
    if (v.fitnessExpiringSoon && v.fitnessCertExpiryDate) {
      const exp = new Date(v.fitnessCertExpiryDate);
      const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      alerts.push({
        id: `fit-${v.vehicleId}`,
        type: "warning",
        msg: {
          pre: "",
          bold1: v.vehicleNumber,
          mid: " – Fitness certificate expires on ",
          bold2: new Date(v.fitnessCertExpiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
          post: days > 0 ? ` (${days} days left)` : " (EXPIRED)",
        },
      });
    }
    if (v.utilizationPercent >= 100) {
      alerts.push({
        id: `cap-${v.vehicleId}`,
        type: "info",
        msg: {
          pre: `${v.vehicleNumber} route is at `,
          bold1: "100% capacity",
          mid: ". No more students can be allocated.",
          bold2: "",
          post: "",
        },
      });
    }
  });

  staff.forEach((s) => {
    if (s.staffRole === "DRIVER" && s.licenseExpiryDate) {
      const exp = new Date(s.licenseExpiryDate);
      const days = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
      if (days <= 30) {
        alerts.push({
          id: `lic-${s.id}`,
          type: days <= 0 ? "error" : "warning",
          msg: {
            pre: "",
            bold1: s.fullName,
            mid: days <= 0
              ? " – Driving licence expired on "
              : " – Driving licence expires on ",
            bold2: exp.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
            post: days > 0 ? ` (${days} days left)` : "",
          },
        });
      }
    }
  });

  return alerts;
}

function AlertItem({ type, msg }) {
  const styles = {
    warning: {
      wrap: "bg-amber-50 border border-amber-200",
      icon: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />,
      boldColor: "text-orange-700",
    },
    error: {
      wrap: "bg-red-50 border border-red-200",
      icon: <span className="w-3 h-3 rounded-full bg-red-500 shrink-0 mt-1 inline-block" />,
      boldColor: "text-red-700",
    },
    info: {
      wrap: "bg-blue-50 border border-blue-200",
      icon: <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />,
      boldColor: "text-blue-700",
    },
  };
  const s = styles[type] || styles.info;
  return (
    <div className={`${s.wrap} rounded-lg px-4 py-3 flex items-start gap-2.5 text-sm`}>
      {s.icon}
      <span className="text-gray-700 leading-snug">
        {msg.pre}
        {msg.bold1 && <span className={s.boldColor}>{msg.bold1}</span>}
        {msg.mid}
        {msg.bold2 && <span className={s.boldColor}>{msg.bold2}</span>}
        {msg.post}
      </span>
    </div>
  );
}

function fmtTime(t) {
  if (!t) return "–";
  return t.slice(0, 5); 
}

export default function Transport_Management() {
  const [routes, setRoutes]               = useState([]);
  const [vehicles, setVehicles]           = useState([]);
  const [staff, setStaff]                 = useState([]);
  const [allocations, setAllocations]     = useState({ allocations: [], pagination: null });
  const [capacityReport, setCapacityReport] = useState([]);
  const [loadingStats, setLoadingStats]     = useState(true);
  const [loadingCapacity, setLoadingCapacity] = useState(true);
  const [loadingRoutes, setLoadingRoutes]   = useState(true);

  useEffect(() => {
    // Stat cards
    Promise.all([
      getActiveRoutes(),
      getActiveVehicles(),
      getTransportAllocations({ size: 100 }),
      getTransportStaff({ size: 100 }),
    ])
      .then(([r, v, a, s]) => {
        setRoutes(r);
        setVehicles(v);
        setAllocations(a);
        setStaff(s.staff);
      })
      .catch(console.error)
      .finally(() => setLoadingStats(false));

    getVehicleCapacityReport({ expiringSoonDays: 30 })
      .then(setCapacityReport)
      .catch(console.error)
      .finally(() => setLoadingCapacity(false));
  }, []);

  useEffect(() => {
    if (!loadingStats) setLoadingRoutes(false);
  }, [loadingStats]);

  const totalVehicles     = vehicles.length;
  const activeRoutes      = routes.length;
  const totalStops        = routes.reduce((acc, r) => acc + (r.totalStops || 0), 0);
  const studentsAllocated = allocations.pagination?.totalElements ?? allocations.allocations.length;
  const totalCapacity     = vehicles.reduce((acc, v) => acc + (v.capacity || 0), 0);
  const driverCount       = staff.filter((s) => s.staffRole === "DRIVER").length;
  const attendantCount    = staff.filter((s) => s.staffRole === "ATTENDANT").length;

  const alerts = buildAlerts(capacityReport, staff);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">🚌 Transport Management</h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1">Monitor vehicles, routes, drivers and compliance across your fleet.</p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {loadingStats ? (
            <><CardLoader /><CardLoader /><CardLoader /><CardLoader /></>
          ) : (
            <>
              <CardComponent
                IconName={Bus}
                keyName="Total Vehicles"
                val={String(totalVehicles)}
                subText={`${totalVehicles} Active`}
                iconTxColor="text-blue-600"
                iconBgColor="bg-blue-50"
              />
              <CardComponent
                IconName={MapPin}
                keyName="Active Routes"
                val={String(activeRoutes)}
                subText={`${totalStops} Stops Total`}
                iconTxColor="text-teal-600"
                iconBgColor="bg-teal-50"
              />
              <CardComponent
                IconName={GraduationCap}
                keyName="Students Allocated"
                val={String(studentsAllocated)}
                subText={`Out of ${totalCapacity} capacity`}
                iconTxColor="text-orange-500"
                iconBgColor="bg-orange-50"
              />
              <CardComponent
                IconName={Users}
                keyName="Transport Staff"
                val={String(staff.length)}
                subText={`${driverCount} Driver${driverCount !== 1 ? "s" : ""} · ${attendantCount} Attendant${attendantCount !== 1 ? "s" : ""}`}
                iconTxColor="text-indigo-600"
                iconBgColor="bg-indigo-50"
              />
            </>
          )}
        </div>

        {/* ── Vehicle Capacity Utilisation + Alerts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

          {/* ── Capacity Utilisation ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <Bus className="w-4 h-4 text-blue-500" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Vehicle Capacity Utilisation</span>
            </div>

            {/* ── Table header — sm and above ── */}
            <div className="hidden sm:grid text-xs font-medium text-gray-400 uppercase tracking-wide border-b border-gray-100 px-5 py-3 shrink-0"
              style={{ gridTemplateColumns: "2fr 1fr 80px 80px 2fr 100px" }}>
              <span>Vehicle</span>
              <span className="text-center">Type</span>
              <span className="text-center">Capacity</span>
              <span className="text-center">Allocated</span>
              <span className="text-center">Utilisation</span>
              <span className="text-center">Status</span>
            </div>

            {/* ── Rows ── */}
            <div className="flex flex-col divide-y divide-gray-50 flex-1">
              {loadingCapacity ? (
                <table className="w-full"><tbody><ListLoader rows={3} avatar={false} /></tbody></table>
              ) : (
                capacityReport.map((v) => {
                  const pct      = v.totalCapacity > 0 ? Math.round((v.totalStudentsAllocated / v.totalCapacity) * 100) : 0;
                  const barColor = pct === 100 ? "bg-red-500" : pct >= 80 ? "bg-orange-400" : pct > 0 ? "bg-blue-500" : "bg-gray-200";

                  return (
                    <div key={v.vehicleId} className="hover:bg-gray-50 transition-colors">

                      {/* ── sm+ : aligned 6-col row ── */}
                      <div
                        className="hidden sm:grid items-center px-5 py-4 gap-3"
                        style={{ gridTemplateColumns: "2fr 1fr 80px 80px 2fr 100px" }}
                      >
                        {/* Vehicle */}
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm">{v.vehicleNumber}</p>
                          <p className="text-xs text-gray-400">{v.makeModel}</p>
                        </div>

                        {/* Type */}
                        <div className="flex justify-center">
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-center leading-tight ${typeColors[v.vehicleType] || "bg-gray-100 text-gray-600"}`}>
                            {typeLabel[v.vehicleType] || v.vehicleType}
                          </span>
                        </div>

                        {/* Capacity */}
                        <p className="text-center text-gray-700 font-medium text-sm">{v.totalCapacity}</p>

                        {/* Allocated */}
                        <p className="text-center text-gray-700 font-medium text-sm">{v.totalStudentsAllocated}</p>

                        {/* Utilisation bar + % */}
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden min-w-0">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 shrink-0 w-8 text-right">{pct}%</span>
                        </div>

                        {/* Status badge */}
                        <div className="flex justify-center">
                          <UtilBadge allocated={v.totalStudentsAllocated} capacity={v.totalCapacity} />
                        </div>
                      </div>

                      {/* ── xs : stacked card ── */}
                      <div className="sm:hidden px-4 py-4 space-y-2.5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-gray-900 text-sm">{v.vehicleNumber}</p>
                            <p className="text-xs text-gray-400">{v.makeModel}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 leading-tight text-center ${typeColors[v.vehicleType] || "bg-gray-100 text-gray-600"}`}>
                            {typeLabel[v.vehicleType] || v.vehicleType}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <span>Capacity: <span className="font-bold text-gray-700">{v.totalCapacity}</span></span>
                          <span>Allocated: <span className="font-bold text-gray-700">{v.totalStudentsAllocated}</span></span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-gray-500 shrink-0 w-8 text-right">{pct}%</span>
                          <UtilBadge allocated={v.totalStudentsAllocated} capacity={v.totalCapacity} />
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ── Alerts & Expiry ── */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-2 shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span className="font-semibold text-gray-900 text-sm sm:text-base">Alerts &amp; Expiry Notices</span>
            </div>
            <div className="p-4 space-y-3 flex-1">
              {loadingCapacity || loadingStats ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="animate-pulse h-14 bg-gray-100 rounded-lg" />
                  ))}
                </div>
              ) : alerts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <CheckCircle2 className="w-10 h-10 text-green-400 mb-2" />
                  <p className="text-sm font-medium text-gray-600">All clear! No active alerts.</p>
                  <p className="text-xs mt-1">Insurance, fitness &amp; licences are up to date.</p>
                </div>
              ) : (
                alerts.map((a) => <AlertItem key={a.id} type={a.type} msg={a.msg} />)
              )}
            </div>
          </div>
        </div>

        {/* ── Active Routes Summary ── */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-500" />
            <span className="font-bold text-gray-900 text-sm sm:text-base">Active Routes Summary</span>
          </div>
          <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {loadingRoutes ? (
              <>
                <div className="animate-pulse bg-blue-50 rounded-xl border-2 border-blue-200 p-4 space-y-3">
                  <div className="h-4 bg-blue-200 rounded w-2/3" />
                  <div className="h-3 bg-blue-200 rounded w-1/3" />
                  <div className="h-2.5 bg-blue-200 rounded-full w-full mt-3" />
                </div>
                <div className="animate-pulse bg-blue-50 rounded-xl border-2 border-blue-200 p-4 space-y-3">
                  <div className="h-4 bg-blue-200 rounded w-2/3" />
                  <div className="h-3 bg-blue-200 rounded w-1/3" />
                  <div className="h-2.5 bg-blue-200 rounded-full w-full mt-3" />
                </div>
              </>
            ) : (
              routes.map((r) => {
                const pct         = r.vehicleCapacity > 0 ? Math.round((r.allocatedStudents / r.vehicleCapacity) * 100) : 0;
                const barColor    = pct === 100 ? "bg-red-500"       : pct >= 80 ? "bg-orange-400"    : "bg-blue-500";
                const borderColor = pct === 100 ? "border-red-200"   : pct >= 80 ? "border-orange-200" : "border-blue-200";
                const bgColor     = pct === 100 ? "bg-red-50"        : pct >= 80 ? "bg-orange-50"     : "bg-blue-50";
                return (
                  <div key={r.id} className={`rounded-xl border-2 ${borderColor} ${bgColor} p-4`}>
                    {/* Route name + status */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base leading-tight">{r.routeName}</p>
                        <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">{r.routeCode}</span>
                      </div>
                      <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                        {r.status}
                      </span>
                    </div>

                    {/* Info chips */}
                    <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs text-gray-600 mt-3">
                      <span className="flex items-center gap-1">
                        <Bus className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span className="truncate">{r.vehicleNumber} ({typeLabel[r.vehicleType] || r.vehicleType})</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-orange-400 shrink-0" />{r.driverName}
                      </span>
                      {r.attendantName && (
                        <span className="flex items-center gap-1">
                          <Users className="w-3.5 h-3.5 text-purple-400 shrink-0" />{r.attendantName}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />{fmtTime(r.startTime)} → {fmtTime(r.returnTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0" />{r.totalStops} Stops
                      </span>
                    </div>

                    {/* Utilisation bar */}
                    <div className="mt-3 flex items-center gap-3">
                      <div className="flex-1 h-2.5 rounded-full bg-white bg-opacity-70 overflow-hidden">
                        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-gray-500 font-medium whitespace-nowrap shrink-0">
                        {r.allocatedStudents}/{r.vehicleCapacity} ({pct}%)
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>
    </div>
  );
}