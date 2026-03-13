import { useEffect, useState } from "react";
import {
  CreditCard, ChevronDown, Plus, Pencil,
  ToggleLeft, ToggleRight, SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import ActionDropDownComp from "../../../Components/CommonComp/ActionDropDownComp";
import AddFeePlanCard from "./AddFeePlanCard";
import EditFeePlanCard from "./EditFeePlanCard";
import ListLoader from "../../../Components/CommonComp/ListLoader";
import {
  getTransportFeePlans,
  activateTransportFeePlan,
  deactivateTransportFeePlan,
} from "../../../Api/TransportAPI";

const freqColors = {
  MONTHLY:    "bg-blue-100 text-blue-700",
  QUARTERLY:  "bg-purple-100 text-purple-700",
  ANNUALLY:   "bg-orange-100 text-orange-700",
  "ONE-TIME": "bg-gray-100 text-gray-600",
};

const ITEMS_PER_PAGE = 5;

function fmt(n) { return `₹${Number(n).toLocaleString("en-IN")}`; }

export default function Fee_Plans() {
  const [plans, setPlans]               = useState([]);
  const [search, setSearch]             = useState("");
  const [freqFilter, setFreqFilter]     = useState("All Frequencies");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage]                 = useState(1);
  const [addModal, setAddModal]         = useState(false);
  const [editModal, setEditModal]       = useState(false);
  const [loading, setLoading]           = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [togglingId, setTogglingId]     = useState(null);

  useEffect(() => { fetchFeePlans(); }, []);

  const fetchFeePlans = async () => {
    try {
      setLoading(true);
      const data = await getTransportFeePlans();
      const formatted = data.map((item) => ({
        id:           item.id,
        planName:     item.planName,
        routeId:      item.routeId ?? "",
        route:        item.routeName ? item.routeName.split(" – ")[0] : "Generic",
        amount:       item.feeAmount,
        frequency:    item.frequency,
        distanceSlab: item.distanceSlabKm ? `${item.distanceSlabKm} km` : "—",
        description:  item.description ?? "",
        status:       item.isActive ? "ACTIVE" : "INACTIVE",
      }));
      setPlans(formatted);
    } catch (error) {
      console.error("Failed to fetch fee plans:", error);
      toast.error("Failed to load fee plans. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, value, status) => {
    if (value === "edit") {
      const plan = plans.find((p) => p.id === id);
      setSelectedPlan(plan);
      setEditModal(true);
      return;
    }
    if (value === "toggle") {
      try {
        setTogglingId(id);
        if (status === "ACTIVE") {
          await deactivateTransportFeePlan(id);
          toast.success("Fee plan deactivated successfully.");
        } else {
          await activateTransportFeePlan(id);
          toast.success("Fee plan activated successfully.");
        }
        fetchFeePlans();
      } catch (err) {
        console.error("Toggle failed:", err);
        toast.error("Failed to update fee plan status. Please try again.");
      } finally {
        setTogglingId(null);
      }
    }
  };

  const filtered = plans.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.planName.toLowerCase().includes(q) || p.route.toLowerCase().includes(q);
    const matchFreq   = freqFilter === "All Frequencies" || p.frequency === freqFilter;
    const matchStatus = statusFilter === "All Status"    || p.status    === statusFilter;
    return matchSearch && matchFreq && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-[#f0f2f8] font-sans">

      {/* Page Header */}
      <div className="px-4 sm:px-6 lg:px-8 pt-8 pb-2">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
          <CreditCard className="w-7 h-7 text-indigo-600" />
          Fees Management
        </h1>
        <p className="text-gray-500 text-sm mt-1 max-w-2xl">
          Create and manage transport fee plans — define amounts, frequencies, route-specific or distance-based pricing.
        </p>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Table Header */}
          <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-300">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
              Transport Fee Plans
            </h2>
            <button
              onClick={() => setAddModal(true)}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shadow-sm w-fit"
            >
              <Plus className="w-4 h-4" />
              Add Fee Plan
            </button>
          </div>

          {/* Desktop Table */}
          <div className="overflow-x-auto hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  {["Plan Name", "Route", "Amount", "Frequency", "Distance Slab", "Status", "Actions"].map((h) => (
                    <th key={h} className={`px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider whitespace-nowrap ${h === "Actions" ? "text-center" : ""}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <ListLoader rows={5} avatar={false} colSpanSet={7} />
                ) : paginated.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-16 text-gray-400">
                      <CreditCard className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                      <p className="font-medium">No fee plans found</p>
                      <p className="text-xs mt-1">Try adjusting your search or filters</p>
                    </td>
                  </tr>
                ) : (
                  paginated.map((p) => (
                    <tr key={p.id} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-4 py-4 font-bold text-sm text-nowrap text-gray-900">{p.planName}</td>
                      <td className="px-4 py-4 text-nowrap text-center">
                        {p.route === "Generic"
                          ? <span className="text-gray-400 text-sm italic">Generic</span>
                          : <span className="inline-flex items-center bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{p.route}</span>
                        }
                      </td>
                      <td className="px-4 py-4 font-semibold text-center text-gray-800">{fmt(p.amount)}</td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${freqColors[p.frequency] ?? "bg-gray-100 text-gray-600"}`}>
                          {p.frequency}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-gray-500 text-center text-sm">{p.distanceSlab}</td>
                      <td className="px-4 py-4">
                        {p.status === "ACTIVE"
                          ? <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" /> Active
                            </span>
                          : <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                            </span>
                        }
                      </td>
                      <td className="px-4 py-4">
                        <ActionDropDownComp
                          onAction={(val) => handleAction(p.id, val, p.status)}
                          disabled={togglingId === p.id}
                          actionOptions={[
                            { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                            {
                              label: p.status === "ACTIVE" ? "Deactivate" : "Activate",
                              value: "toggle",
                              icon:  p.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                              bg:    "bg-white",
                              text:  p.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                              hover: p.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
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

          {/* Mobile Cards */}
          <div className="sm:hidden divide-y divide-gray-100">
            {loading ? (
              <div className="py-4">
                <table className="w-full"><tbody><ListLoader rows={5} avatar={false} colSpanSet={1} /></tbody></table>
              </div>
            ) : paginated.length === 0 ? (
              <div className="py-16 text-center text-gray-400">
                <CreditCard className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="font-medium text-sm">No fee plans found</p>
              </div>
            ) : (
              paginated.map((p) => (
                <div key={p.id} className="px-4 py-4 space-y-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-900">{p.planName}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{p.route === "Generic" ? "Generic / Distance" : p.route}</p>
                    </div>
                    {p.status === "ACTIVE"
                      ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full border border-green-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> Active
                        </span>
                      : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-xs font-bold px-2.5 py-1 rounded-full border border-gray-200 shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> Inactive
                        </span>
                    }
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs items-center">
                    <span className={`font-semibold px-2.5 py-0.5 rounded-full ${freqColors[p.frequency] ?? "bg-gray-100 text-gray-600"}`}>{p.frequency}</span>
                    <span className="font-bold text-gray-800 text-sm">{fmt(p.amount)}</span>
                    {p.distanceSlab !== "—" && <span className="text-gray-500">{p.distanceSlab}</span>}
                  </div>
                  <div className="pt-1">
                    <ActionDropDownComp
                      onAction={(val) => handleAction(p.id, val, p.status)}
                      disabled={togglingId === p.id}
                      actionOptions={[
                        { label: "Edit", value: "edit", icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                        {
                          label: p.status === "ACTIVE" ? "Deactivate" : "Activate",
                          value: "toggle",
                          icon:  p.status === "ACTIVE" ? ToggleLeft : ToggleRight,
                          bg:    "bg-white",
                          text:  p.status === "ACTIVE" ? "text-orange-600" : "text-green-600",
                          hover: p.status === "ACTIVE" ? "hover:bg-orange-50" : "hover:bg-green-50",
                        },
                      ]}
                    />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-gray-400 font-medium">
              Showing {filtered.length === 0 ? 0 : (safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length} plan{filtered.length !== 1 ? "s" : ""}
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

        </div>
      </div>

      {/* Modals */}
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
    </div>
  );
}