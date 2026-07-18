import { useEffect, useState, useCallback } from "react";
import {
  CreditCard, ChevronDown, Plus, Pencil, Search,
  ToggleLeft, ToggleRight, SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import AddFeePlanCard from "./AddFeePlanCard";
import EditFeePlanCard from "./EditFeePlanCard";
import ListLoader from "../../../Components/CommonComp/ListLoader";

// 1. Import your other tab components here (Adjust paths if necessary)
import TransportBilling from "./TransportBilling";
// import CollectionView from "./Collection_View";
import FeeConfig from "./Fee_Config";

// Fee Plan APIs - commented out, tab disabled
// import {
//   getTransportFeePlans,
//   activateTransportFeePlan,
//   deactivateTransportFeePlan,
// } from "../../../Api/Transport/TransportAPI";
import {
  FEE_FREQ_COLORS,
  PAGINATION,
  STATUS,
  ACTION_TYPES,
  FEE_PLAN_TABLE_COLUMNS,
  FEE_FREQ_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS_SIMPLE,
  TOAST_MESSAGES,
  FEE_PLAN_UI_TEXT
} from "../../../Constants/StringConstants/TransportConstants";

function fmt(n) { return `${FEE_PLAN_UI_TEXT.CURRENCY_SYMBOL}${Number(n).toLocaleString("en-IN")}`; }

export default function Fee_Plans() {
  // 2. State to track the active tab - default to "billing" now that fee-plan tab is disabled
  const [activeTab, setActiveTab] = useState("billing");

  // Fee Plan state - kept but unused since fee-plan tab/APIs are disabled
  const [plans, setPlans] = useState([]);
  const [search, setSearch] = useState("");
  const [freqFilter, setFreqFilter] = useState(FEE_FREQ_FILTER_OPTIONS[0]);
  const [statusFilter, setStatusFilter] = useState(STATUS_FILTER_OPTIONS_SIMPLE[0]);
  const [page, setPage] = useState(1);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  // Fee Plan API calls - commented out, no longer fetched
  // const fetchFeePlans = useCallback(async () => {
  //   try {
  //     setLoading(true);
  //     const data = await getTransportFeePlans();
  //     const formatted = data.map((item) => ({
  //       id: item.id,
  //       planName: item.planName,
  //       routeId: item.routeId ?? "",
  //       route: item.routeName ? item.routeName.split(" – ")[0] : FEE_PLAN_UI_TEXT.GENERIC_ROUTE,
  //       amount: item.feeAmount,
  //       frequency: item.frequency,
  //       distanceSlab: item.distanceSlabKm ? `${item.distanceSlabKm} km` : "—",
  //       description: item.description ?? "",
  //       status: item.isActive ? STATUS.ACTIVE : STATUS.INACTIVE,
  //     }));
  //     setPlans(formatted);
  //   } catch (error) {
  //     console.error("Failed to fetch fee plans:", error);
  //     toast.error(TOAST_MESSAGES.FEE_PLAN_LOAD_FAIL);
  //   } finally {
  //     setLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   if (activeTab === "fee-plan") {
  //     fetchFeePlans();
  //   }
  // }, [fetchFeePlans, activeTab]);

  // const handleAction = async (id, value, status) => {
  //   if (value === ACTION_TYPES.EDIT) {
  //     const plan = plans.find((p) => p.id === id);
  //     setSelectedPlan(plan);
  //     setEditModal(true);
  //     return;
  //   }
  //   if (value === ACTION_TYPES.TOGGLE) {
  //     try {
  //       setTogglingId(id);
  //       if (status === STATUS.ACTIVE) {
  //         await deactivateTransportFeePlan(id);
  //         toast.success(TOAST_MESSAGES.FEE_PLAN_DEACTIVATE_SUCCESS);
  //       } else {
  //         await activateTransportFeePlan(id);
  //         toast.success(TOAST_MESSAGES.FEE_PLAN_ACTIVATE_SUCCESS);
  //       }
  //       fetchFeePlans();
  //     } catch (err) {
  //       console.error("Toggle failed:", err);
  //       toast.error(TOAST_MESSAGES.FEE_PLAN_STATUS_UPDATE_FAIL);
  //     } finally {
  //       setTogglingId(null);
  //     }
  //   }
  // };

  // const filtered = plans.filter((p) => {
  //   const q = search.toLowerCase();
  //   const matchSearch = p.planName.toLowerCase().includes(q) || p.route.toLowerCase().includes(q);
  //   const matchFreq = freqFilter === FEE_FREQ_FILTER_OPTIONS[0] || p.frequency === freqFilter;
  //   const matchStatus = statusFilter === STATUS_FILTER_OPTIONS_SIMPLE[0] || p.status === statusFilter;
  //   return matchSearch && matchFreq && matchStatus;
  // });

  // const totalPages = Math.max(1, Math.ceil(filtered.length / PAGINATION.FEE_PLANS_PER_PAGE));
  // const safePage = Math.min(page, totalPages);
  // const paginated = filtered.slice((safePage - 1) * PAGINATION.FEE_PLANS_PER_PAGE, safePage * PAGINATION.FEE_PLANS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans w-full max-w-full overflow-x-hidden min-w-0 flex flex-col">

      {/* Page Header */}
      <div className="px-4 sm:px-6 xl:px-8 pt-8 pb-0 w-full max-w-full bg-white border-b border-gray-200">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-indigo-600 shrink-0" />
          Fee Management
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          {FEE_PLAN_UI_TEXT.PAGE_SUBTITLE}
        </p>

        {/* 3. Switch Tabs Row - only Transport Billing and Fee Config are active */}
        <div className="flex flex-wrap gap-2 sm:gap-6 mt-6 border-b border-transparent">
          {[
            // { id: "fee-plan", label: "Fee Plan" },
            { id: "billing", label: "Transport Billing" },
            // { id: "collection", label: "Collection View" },
            { id: "config", label: "Fee Config" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-semibold transition-all relative px-1 ${activeTab === tab.id
                ? "text-blue-600 border-b-2 border-blue-600 font-bold"
                : "text-gray-500 hover:text-gray-800"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Fee Plan tab content - commented out, tab disabled */}
      {/*
      {activeTab === "fee-plan" && (
        <>
          <div className="px-4 sm:px-6 xl:px-8 py-6 w-full max-w-full min-w-0 flex-1">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden w-full max-w-full min-w-0 flex flex-col">

              <div className="px-4 sm:px-6 py-4 flex flex-row items-center justify-between gap-4 border-b border-gray-100 w-full min-w-0">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
                  {FEE_PLAN_UI_TEXT.SECTION_TITLE}
                </h2>
                <button
                  onClick={() => setAddModal(true)}
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm shrink-0"
                >
                  <Plus className="w-4 h-4" /> {FEE_PLAN_UI_TEXT.ADD_BTN}
                </button>
              </div>

              <div className="px-4 sm:px-6 py-3.5 border-b border-gray-50 flex flex-col md:flex-row gap-3 w-full max-w-full min-w-0 items-center">
                <div className="relative flex-1 w-full">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={FEE_PLAN_UI_TEXT.SEARCH_PLACEHOLDER}
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-gray-50 placeholder-gray-400"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 w-full md:w-auto shrink-0 min-w-0">
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={freqFilter}
                      onChange={(e) => { setFreqFilter(e.target.value); setPage(1); }}
                      className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[150px]"
                    >
                      {FEE_FREQ_FILTER_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>

                  <div className="relative flex-1 sm:flex-none">
                    <select
                      value={statusFilter}
                      onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                      className="appearance-none w-full pl-3 pr-8 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[130px]"
                    >
                      {STATUS_FILTER_OPTIONS_SIMPLE.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="hidden xl:block w-full max-w-full min-w-0 overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <table className="w-full text-sm border-collapse table-auto min-w-[920px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        {FEE_PLAN_TABLE_COLUMNS.map((h) => (
                          <th
                            key={h}
                            className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : "text-left"}`}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {loading ? (
                        <ListLoader rows={PAGINATION.FEE_PLANS_PER_PAGE} avatar={false} colSpanSet={7} />
                      ) : paginated.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-16 text-gray-400">
                            <CreditCard className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                            <p className="font-medium">{FEE_PLAN_UI_TEXT.EMPTY_STATE_TITLE}</p>
                            <p className="text-xs mt-1">{FEE_PLAN_UI_TEXT.EMPTY_STATE_SUBTITLE}</p>
                          </td>
                        </tr>
                      ) : (
                        paginated.map((p) => (
                          <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                            <td className="px-4 py-4 font-bold text-sm text-gray-900 whitespace-nowrap">{p.planName}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {p.route === FEE_PLAN_UI_TEXT.GENERIC_ROUTE
                                ? <span className="text-gray-400 text-sm italic">{FEE_PLAN_UI_TEXT.GENERIC_ROUTE}</span>
                                : <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-0.5 rounded-full">{p.route}</span>
                              }
                            </td>
                            <td className="px-4 py-4 font-semibold text-gray-800 whitespace-nowrap">{fmt(p.amount)}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FEE_FREQ_COLORS[p.frequency] ?? "bg-gray-100 text-gray-600"}`}>
                                {p.frequency}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-gray-500 text-sm whitespace-nowrap">{p.distanceSlab}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {p.status === STATUS.ACTIVE ? (
                                <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-4 text-center whitespace-nowrap">
                              <ActionDropDownComp
                                onAction={(val) => handleAction(p.id, val, p.status)}
                                disabled={togglingId === p.id}
                                actionOptions={[
                                  { label: "Edit", value: ACTION_TYPES.EDIT, icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                                  {
                                    label: p.status === STATUS.ACTIVE ? "Deactivate" : "Activate",
                                    value: ACTION_TYPES.TOGGLE,
                                    icon: p.status === STATUS.ACTIVE ? ToggleLeft : ToggleRight,
                                    bg: "bg-white",
                                    text: p.status === STATUS.ACTIVE ? "text-orange-600" : "text-green-600",
                                    hover: p.status === STATUS.ACTIVE ? "hover:bg-orange-50" : "hover:bg-green-50",
                                  },
                                ]}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="xl:hidden divide-y divide-gray-100 w-full bg-gray-50/30">
                {loading ? (
                  <div className="p-4 bg-white"><ListLoader rows={4} avatar={false} colSpanSet={1} /></div>
                ) : paginated.length === 0 ? (
                  <div className="py-16 text-center text-gray-400 bg-white">
                    <CreditCard className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                    <p className="font-medium text-sm">{FEE_PLAN_UI_TEXT.EMPTY_STATE_TITLE}</p>
                  </div>
                ) : (
                  paginated.map((p) => (
                    <div key={p.id} className="p-4 md:p-5 space-y-3 bg-white hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 text-sm md:text-base truncate">{p.planName}</p>
                          <p className="text-xs text-gray-400 mt-0.5 font-medium">{p.route === FEE_PLAN_UI_TEXT.GENERIC_ROUTE ? FEE_PLAN_UI_TEXT.GENERIC_DISTANCE_PLAN : `${FEE_PLAN_UI_TEXT.ROUTE_PREFIX}${p.route}`}</p>
                        </div>
                        {p.status === STATUS.ACTIVE ? (
                          <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-gray-50 p-2.5 rounded-xl text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold px-2.5 py-0.5 rounded-full text-[11px] ${FEE_FREQ_COLORS[p.frequency] ?? "bg-gray-100 text-gray-600"}`}>{p.frequency}</span>
                          {p.distanceSlab !== "—" && <span className="text-gray-500 font-medium">{FEE_PLAN_UI_TEXT.SLAB_PREFIX}{p.distanceSlab}</span>}
                        </div>
                        <span className="font-bold text-gray-900 text-sm">{fmt(p.amount)}</span>
                      </div>
                      <div className="pt-1 flex justify-end">
                        <ActionDropDownComp
                          onAction={(val) => handleAction(p.id, val, p.status)}
                          disabled={togglingId === p.id}
                          actionOptions={[
                            { label: "Edit", value: ACTION_TYPES.EDIT, icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                            {
                              label: p.status === STATUS.ACTIVE ? "Deactivate" : "Activate",
                              value: ACTION_TYPES.TOGGLE,
                              icon: p.status === STATUS.ACTIVE ? ToggleLeft : ToggleRight,
                              bg: "bg-white",
                              text: p.status === STATUS.ACTIVE ? "text-orange-600" : "text-green-600",
                              hover: p.status === STATUS.ACTIVE ? "hover:bg-orange-50" : "hover:bg-green-50",
                            },
                          ]}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {!loading && totalPages > 1 && (
                <div className="px-4 sm:px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap bg-white mt-auto">
                  <p className="text-xs text-gray-400 font-medium">
                    {FEE_PLAN_UI_TEXT.SHOWING} {filtered.length === 0 ? 0 : (safePage - 1) * PAGINATION.FEE_PLANS_PER_PAGE + 1}–{Math.min(safePage * PAGINATION.FEE_PLANS_PER_PAGE, filtered.length)} {FEE_PLAN_UI_TEXT.OF} {filtered.length} {filtered.length !== 1 ? FEE_PLAN_UI_TEXT.PLAN_PLURAL : FEE_PLAN_UI_TEXT.PLAN_SINGULAR}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <button key={n} onClick={() => setPage(n)}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${safePage === n ? "bg-blue-600 text-white shadow-sm" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                        {n}
                      </button>
                    ))}
                    <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}
                      className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          <AddFeePlanCard
            isOpen={addModal}
            onClose={() => setAddModal(false)}
            onSave={() => { fetchFeePlans(); setAddModal(false); }}
          />
          <EditFeePlanCard
            isOpen={editModal}
            onClose={() => setEditModal(false)}
            onSave={() => { fetchFeePlans(); setEditModal(false); }}
            plan={selectedPlan}
          />
        </>
      )}
      */}

      {/* 5. Render active tab components - only Transport Billing and Fee Config are wired up */}
      {activeTab === "billing" && (
        <div className="px-4 sm:px-6 xl:px-8 py-6 w-full max-w-full">
          <TransportBilling />
        </div>
      )}

      {/*
      {activeTab === "collection" && (
        <div className="px-4 sm:px-6 xl:px-8 py-6 w-full max-w-full">
          <CollectionView />
        </div>
      )}
      */}

      {activeTab === "config" && (
        <div className="px-4 sm:px-6 xl:px-8 py-6 w-full max-w-full">
          <FeeConfig />
        </div>
      )}

    </div>
  );
}