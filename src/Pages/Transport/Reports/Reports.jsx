import { useState, useEffect, useCallback } from "react";
import { FileText, Download, ChevronDown, List, Bus, User2, File } from "lucide-react";
import VehicleCapacityTab from "./VehicleCapaityTab";
import StaffAssignmentsTab from "./StaffAssignmentsTab";
import StudentFeeTab from "./StudentFeeTab";
import { toast } from "react-toastify";
import { getActiveRoutes, getRouteStudentsReport } from "../../../Api/Transport/TransportAPI";
import {
  PICKUP_DROP_COLORS,
  PICKUP_DROP_LABELS,
  REPORT_TABS,
  REPORT_TAB_LABELS,
  REPORT_UI_TEXT,
  EXPORT_CONSTANTS,
  CSV_HEADERS,
  ROUTE_STUDENT_LIST_COLUMNS,
  TOAST_MESSAGES
} from "../../../Constants/StringConstants/TransportConstants"; // Adjust import path as needed

// ─── Skeleton Loader ──────────────────────────────────────────────
function SkeletonLoader() {
  return (
    <div className="px-4 sm:px-6 py-6 space-y-4">
      <div className="rounded-xl bg-gray-100 animate-pulse h-24 w-full" />
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-xl border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="h-3.5 bg-gray-200 animate-pulse rounded w-40" />
              <div className="h-3 bg-gray-100 animate-pulse rounded w-56" />
            </div>
          </div>
          <div className="px-4 py-3 space-y-3">
            {[...Array(2)].map((_, j) => (
              <div key={j} className="flex items-center gap-4">
                <div className="h-3 bg-gray-100 animate-pulse rounded w-12" />
                <div className="h-3 bg-gray-200 animate-pulse rounded w-32" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-20" />
                <div className="h-3 bg-gray-100 animate-pulse rounded w-24 ml-auto" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── CSV Export Helper ────────────────────────────────────────────
function exportToCSV(reportData) {
  if (!reportData) return;

  const rows = [];
  rows.push([EXPORT_CONSTANTS.ROUTE_REPORT_TITLE]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.ROUTE, reportData.routeName]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.ROUTE_CODE, reportData.routeCode]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.VEHICLE, `${reportData.vehicleNumber} (${reportData.vehicleType})`]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.DRIVER, `${reportData.driverName} · ${reportData.driverContact}`]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.ATTENDANT, `${reportData.attendantName} · ${reportData.attendantContact}`]);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.PICKUP_DROP, `${reportData.startTime} → ${reportData.returnTime}`]);

  const pct = Math.round(reportData.utilizationPercent);
  rows.push([REPORT_UI_TEXT.ROUTE_META_LABELS.UTILISATION, `${reportData.totalAllocated}/${reportData.vehicleCapacity} (${pct}%)`]);
  rows.push([]);
  rows.push(CSV_HEADERS.ROUTE_STUDENT_REPORT);

  reportData.stopGroups?.forEach((stop) => {
    stop.students?.forEach((s) => {
      rows.push([
        stop.stopOrder,
        stop.stopName,
        stop.locationAddress,
        s.studentId,
        s.studentName,
        s.className,
        s.sectionName,
        s.studentRollNumber || "",
        PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType,
        s.feePlanName,
        s.feeAmount,
        s.feeFrequency,
        s.effectiveFrom,
        s.effectiveTo,
      ]);
    });
  });

  const csvContent = rows
    .map((r) => r.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${reportData.routeCode}_${EXPORT_CONSTANTS.ROUTE_REPORT_PREFIX}`;
  link.click();
  URL.revokeObjectURL(url);
}

// ─── Route Student List ───────────────────────────────────────────
function RouteStudentList() {
  const [routes, setRoutes] = useState([]);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loadingRoutes, setLoadingRoutes] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setLoadingRoutes(true);
        const data = await getActiveRoutes();
        setRoutes(data);
        if (data.length > 0) {
          setSelectedRouteId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        toast.error(TOAST_MESSAGES.ROUTES_LOAD_FAIL);
      } finally {
        setLoadingRoutes(false);
      }
    };
    fetchRoutes();
  }, []);

  const fetchReport = useCallback(async (routeId) => {
    if (!routeId) return;
    try {
      setLoadingReport(true);
      const data = await getRouteStudentsReport(routeId);
      setReportData(data);
    } catch (err) {
      console.error(err);
      toast.error(TOAST_MESSAGES.ROUTE_REPORT_LOAD_FAIL);
    } finally {
      setLoadingReport(false);
    }
  }, []);

  useEffect(() => {
    if (selectedRouteId) fetchReport(selectedRouteId);
  }, [selectedRouteId, fetchReport]);

  const isLoading = loadingRoutes || loadingReport;
  const pct = reportData ? Math.round(reportData.utilizationPercent) : 0;
  const utilColor = pct >= 100 ? "text-red-500" : pct >= 80 ? "text-orange-500" : "text-blue-600";

  const metaFields = reportData
    ? [
      { label: REPORT_UI_TEXT.ROUTE_META_LABELS.ROUTE, val: `${reportData.routeName} (${reportData.routeCode})` },
      { label: REPORT_UI_TEXT.ROUTE_META_LABELS.VEHICLE, val: `${reportData.vehicleNumber} (${reportData.vehicleType})` },
      { label: REPORT_UI_TEXT.ROUTE_META_LABELS.DRIVER, val: `${reportData.driverName} · ${reportData.driverContact}` },
      { label: REPORT_UI_TEXT.ROUTE_META_LABELS.ATTENDANT, val: `${reportData.attendantName} · ${reportData.attendantContact}` },
      { label: REPORT_UI_TEXT.ROUTE_META_LABELS.PICKUP_DROP, val: `${reportData.startTime?.slice(0, 5)} → ${reportData.returnTime?.slice(0, 5)}` },
      {
        label: REPORT_UI_TEXT.ROUTE_META_LABELS.UTILISATION,
        val: (
          <span className={`font-extrabold text-sm ${utilColor}`}>
            {reportData.totalAllocated}/{reportData.vehicleCapacity} ({pct}%)
          </span>
        ),
      },
    ]
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100">
        <h2 className="font-bold text-gray-900 flex items-center gap-2 text-sm sm:text-base">
          {REPORT_UI_TEXT.ROUTE_TAB_TITLE}
        </h2>
        <button
          onClick={() => {
            if (!reportData) return toast.info(TOAST_MESSAGES.EXPORT_NO_DATA);
            exportToCSV(reportData);
            toast.success(TOAST_MESSAGES.EXPORT_SUCCESS);
          }}
          className="inline-flex items-center cursor-pointer gap-1.5 border border-gray-200 text-gray-600 text-xs font-semibold px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors w-fit"
        >
          <Download className="w-3.5 h-3.5" /> {REPORT_UI_TEXT.BTN_EXPORT_CSV}
        </button>
      </div>

      {/* Controls */}
      <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <select
            value={selectedRouteId ?? ""}
            onChange={(e) => {
              setReportData(null);
              setSelectedRouteId(Number(e.target.value));
            }}
            disabled={loadingRoutes}
            className="appearance-none w-full sm:w-auto pl-4 pr-9 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-60 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingRoutes ? (
              <option disabled value="">{REPORT_UI_TEXT.OPT_LOADING_ROUTES}</option>
            ) : (
              routes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.routeCode ? `${r.routeCode} – ` : ""}{r.routeName || r.name}
                </option>
              ))
            )}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* ── Body ── */}
      {isLoading && <SkeletonLoader />}

      {!isLoading && !reportData && (
        <div className="py-16 text-center text-gray-400">
          <FileText className="w-10 h-10 mx-auto text-gray-200 mb-3" />
          <p className="font-medium text-sm">{REPORT_UI_TEXT.NO_DATA_ROUTE}</p>
        </div>
      )}

      {!isLoading && reportData && (
        <>
          <div className="mx-4 sm:mx-6 my-4 rounded-xl bg-blue-50 border border-blue-100 px-4 sm:px-5 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              {metaFields.map((c) => (
                <div key={c.label}>
                  <p className="text-gray-600 font-medium mb-0.5">{c.label}</p>
                  <div className="font-bold text-gray-800 text-xs break-words">{c.val}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-4 sm:px-6 pb-6 space-y-4 sm:space-y-5">
            {reportData.stopGroups?.length === 0 && (
              <div className="py-10 text-center text-gray-400 text-sm">
                {REPORT_UI_TEXT.NO_STUDENTS_ALLOCATED}
              </div>
            )}

            {reportData.stopGroups?.map((stop) => (
              <div key={stop.stopId} className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="flex items-start sm:items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-100 gap-2">
                  <div className="flex items-start sm:items-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 sm:mt-0">
                      {stop.stopOrder}
                    </span>
                    <div>
                      <span className="font-bold text-gray-900 text-sm">{stop.stopName}</span>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1 mt-0.5 sm:mt-0">
                        <span className="text-gray-400 text-xs">– {stop.locationAddress}</span>
                        {stop.landmark && (
                          <span className="text-gray-400 text-xs sm:ml-1">| 📍 {stop.landmark}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-blue-600 font-bold shrink-0 mt-0.5 sm:mt-0">
                    {stop.studentCount} {stop.studentCount !== 1 ? REPORT_UI_TEXT.STUDENT_COUNT_PLURAL : REPORT_UI_TEXT.STUDENT_COUNT_SINGULAR}
                  </span>
                </div>

                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-50">
                        {ROUTE_STUDENT_LIST_COLUMNS.map((h) => (
                          <th key={h} className="px-4 py-2.5 text-xs font-semibold text-gray-400 text-left whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {stop.students?.map((s) => (
                        <tr key={s.allocationId} className="hover:bg-blue-50/20 transition-colors">
                          <td className="px-4 py-3 text-gray-400 text-xs font-medium">{s.studentId}</td>
                          <td className="px-4 py-3 font-semibold text-gray-900">{s.studentName}</td>
                          <td className="px-4 py-3 text-gray-500 text-xs">{s.className} {s.sectionName}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${PICKUP_DROP_COLORS[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
                              {PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-gray-600">{s.feePlanName}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">
                            ₹{Number(s.feeAmount).toLocaleString("en-IN")}/{s.feeFrequency?.toLowerCase().slice(0, 2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="sm:hidden divide-y divide-gray-50">
                  {stop.students?.map((s) => (
                    <div key={s.allocationId} className="px-4 py-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{s.studentName}</p>
                          <p className="text-xs text-gray-400">{s.studentId} · {s.className} {s.sectionName}</p>
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${PICKUP_DROP_COLORS[s.pickupDropType] ?? "bg-gray-100 text-gray-600"}`}>
                          {PICKUP_DROP_LABELS[s.pickupDropType] || s.pickupDropType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-gray-500">{s.feePlanName}</span>
                        <span className="text-xs font-semibold text-gray-800">
                          ₹{Number(s.feeAmount).toLocaleString("en-IN")}/{s.feeFrequency?.toLowerCase().slice(0, 2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TabIcon({ icon, color }) {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-500",
    purple: "bg-purple-100 text-purple-600",
  };
  return (
    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 ${colorMap[color] ?? colorMap.blue}`}>
      {icon}
    </span>
  );
}

const TABS = [
  { id: REPORT_TABS.ROUTE, label: REPORT_TAB_LABELS[REPORT_TABS.ROUTE], emoji: <TabIcon icon={<List className="w-5 h-5" />} color="blue" /> },
  { id: REPORT_TABS.VEHICLE, label: REPORT_TAB_LABELS[REPORT_TABS.VEHICLE], emoji: <TabIcon icon={<Bus className="w-5 h-5" />} color="green" /> },
  { id: REPORT_TABS.DRIVER, label: REPORT_TAB_LABELS[REPORT_TABS.DRIVER], emoji: <TabIcon icon={<User2 className="w-5 h-5" />} color="red" /> },
  { id: REPORT_TABS.FEE, label: REPORT_TAB_LABELS[REPORT_TABS.FEE], emoji: <TabIcon icon={<File className="w-5 h-5" />} color="purple" /> },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState(REPORT_TABS.ROUTE);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">
      <div className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-2">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <FileText className="w-6 h-6 sm:w-7 sm:h-7 text-rose-500 shrink-0" />
          {REPORT_UI_TEXT.PAGE_TITLE}
        </h1>
        <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl">
          {REPORT_UI_TEXT.PAGE_SUBTITLE}
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div className="mb-4 sm:mb-5">
          <div className="grid grid-cols-2 gap-2 sm:hidden">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold rounded-xl transition-all border
                  ${activeTab === tab.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-500 border-gray-200 hover:border-blue-200 hover:text-blue-600"
                  }`}
              >
                <span>{tab.emoji}</span>
                <span className="text-center leading-tight">{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <div className="flex gap-1 min-w-max border-b border-gray-200">
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`inline-flex items-center cursor-pointer gap-2 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 -mb-px
                    ${activeTab === tab.id
                      ? "border-blue-600 text-blue-600 bg-white rounded-t-lg"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                >
                  <span>{tab.emoji}</span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeTab === REPORT_TABS.ROUTE && <RouteStudentList />}
        {activeTab === REPORT_TABS.VEHICLE && <VehicleCapacityTab />}
        {activeTab === REPORT_TABS.DRIVER && <StaffAssignmentsTab />}
        {activeTab === REPORT_TABS.FEE && <StudentFeeTab />}
      </div>
    </div>
  );
}