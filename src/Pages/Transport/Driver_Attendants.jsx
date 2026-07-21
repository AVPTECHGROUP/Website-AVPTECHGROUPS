import { useState, useEffect, useCallback } from "react";
import {
  Users, Search, ChevronDown, AlertTriangle,
  Pencil, ToggleLeft, ToggleRight, Plus, SlidersHorizontal,
  XCircle, Phone, MapPin, Calendar, FileText
} from "lucide-react";
import AddStaffCard from "../../Components/Transport/AddStaffCard";
import ActionDropDownComp from "../../Components/CommonComp/ActionDropDownComp";
import ListLoader from "../../Components/CommonComp/ListLoader";
import {
  getTransportStaff,
  activateTransportStaff,
  deactivateTransportStaff,
} from "../../Api/Transport/TransportAPI";
import { toast } from "react-toastify";
import {
  STATUS,
  ACTION_TYPES,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  PAGINATION,
  ROLE_COLORS,
  STAFF_TABLE_COLUMNS,
  TOAST_MESSAGES,
  STAFF_UI_TEXT,
  COMMON_UI_TEXT,
  ACTION_MESSAGES
} from "../../Constants/StringConstants/TransportConstants";

// ─── Helpers ──────────────────────────────────────────────────────
function fmtDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function isExpiringSoon(dateStr, days = 30) {
  if (!dateStr) return false;
  const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}
function isExpired(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr) < new Date();
}

// ─── Mobile / Tablet Staff Card ────────────────────────────────────
function StaffCard({ s, onAction }) {
  const licExpired = isExpired(s.licenseExpiryDate);
  const licWarn = !licExpired && isExpiringSoon(s.licenseExpiryDate);
  const avatarLetter = (s.fullName || "S")[0].toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-2xs p-3.5 sm:p-4 flex flex-col gap-3 hover:border-gray-300 transition-all min-w-0 w-full">
      {/* Header Row */}
      <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3 min-w-0">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-700 font-bold text-xs shrink-0">
            {avatarLetter}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{s.fullName}</p>

            <a
              href={`tel:${s.contactNumber}`}
              className="inline-flex items-center gap-1 text-xs text-blue-600 font-medium hover:underline mt-1 min-w-0"
            >
              <Phone className="w-3 h-3 text-blue-500 shrink-0" />
              <span className="truncate">{s.contactNumber}</span>
            </a>

            {s.alternateContact && (
              <span className="block text-[11px] text-gray-400 font-medium mt-0.5 truncate">
                {STAFF_UI_TEXT.LBL_ALT_CONTACT} {s.alternateContact}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLORS[s.staffRole] || "bg-gray-100 text-gray-600"}`}>
            {s.staffRole}
          </span>
          {s.status === STATUS.ACTIVE
            ? <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border border-green-200"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" /> {COMMON_UI_TEXT.ACTIVE}</span>
            : <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-500 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full border border-gray-200"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" /> {COMMON_UI_TEXT.INACTIVE}</span>
          }
        </div>
      </div>

      {/* Grid Details */}
      <div className="grid grid-cols-2 gap-2 text-xs min-w-0">
        <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-100 min-w-0">
          <p className="text-gray-400 font-medium text-[10px] sm:text-[11px] mb-0.5 truncate">{STAFF_UI_TEXT.LBL_LICENSE_NO}</p>
          <p className="font-mono font-semibold text-gray-800 truncate text-[11px] sm:text-xs">{s.licenseNumber || "—"}</p>
        </div>

        <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-100 min-w-0">
          <p className="text-gray-400 font-medium text-[10px] sm:text-[11px] mb-0.5 truncate">{STAFF_UI_TEXT.LBL_LICENSE_EXPIRY}</p>
          {licExpired
            ? <span className="inline-flex items-center gap-1 text-red-600 font-bold truncate text-[11px]"><XCircle className="w-3 h-3 shrink-0" /> EXPIRED</span>
            : licWarn
              ? <span className="inline-flex items-center gap-1 text-orange-600 font-semibold truncate text-[11px]"><AlertTriangle className="w-3 h-3 shrink-0" />{fmtDate(s.licenseExpiryDate)}</span>
              : <p className="font-semibold text-gray-700 truncate text-[11px] sm:text-xs">{fmtDate(s.licenseExpiryDate)}</p>
          }
        </div>

        <div className="bg-gray-50/80 rounded-lg p-2 border border-gray-100 col-span-2 flex items-center justify-between min-w-0">
          <div className="min-w-0">
            <p className="text-gray-400 font-medium text-[10px] sm:text-[11px] mb-0.5 truncate">{STAFF_UI_TEXT.LBL_JOINING_DATE}</p>
            <p className="font-semibold text-gray-800 truncate text-[11px] sm:text-xs">{fmtDate(s.joiningDate)}</p>
          </div>
          <Calendar className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
        </div>
      </div>

      {/* Address */}
      {s.address && (
        <div className="flex items-start gap-1.5 text-xs text-gray-600 bg-gray-50/60 p-2 rounded-lg border border-gray-100 min-w-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-tight text-[11px] sm:text-xs min-w-0 flex-1">{s.address}</span>
        </div>
      )}

      {/* Remarks */}
      {s.remarks && (
        <div className="flex items-start gap-1.5 text-xs text-gray-500 bg-amber-50/40 p-2 rounded-lg border border-amber-100 min-w-0">
          <FileText className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
          <span className="line-clamp-2 leading-tight text-[11px] sm:text-xs min-w-0 flex-1">{s.remarks}</span>
        </div>
      )}

      {/* Actions */}
      <div className="pt-1 flex justify-end min-w-0">
        <ActionDropDownComp
          onAction={(val) => onAction(s, val)}
          actionOptions={[
            { label: COMMON_UI_TEXT.EDIT, value: ACTION_TYPES.EDIT, icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
            {
              label: s.status === STATUS.ACTIVE ? COMMON_UI_TEXT.DEACTIVATE : COMMON_UI_TEXT.ACTIVATE,
              value: ACTION_TYPES.TOGGLE,
              icon: s.status === STATUS.ACTIVE ? ToggleLeft : ToggleRight,
              bg: "bg-white",
              text: s.status === STATUS.ACTIVE ? "text-orange-600" : "text-green-600",
              hover: s.status === STATUS.ACTIVE ? "hover:bg-orange-50" : "hover:bg-green-50",
            },
          ]}
        />
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────
export default function Driver_Attendants() {
  const [allStaff, setAllStaff] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getTransportStaff({
        page, size: PAGINATION.ITEMS_PER_PAGE, searchTerm: search, role: roleFilter, status: statusFilter,
      });
      setAllStaff(res.staff || []);
      setPagination(res.pagination);
    } catch (e) {
      console.error(e);
      toast.error(TOAST_MESSAGES.STAFF_LOAD_FAIL);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, statusFilter]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);
  useEffect(() => { setPage(0); }, [roleFilter, statusFilter]);

  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.totalElements / PAGINATION.ITEMS_PER_PAGE)) : 1;
  const totalItems = pagination?.totalElements ?? allStaff.length;

  const pageNumbers = () => {
    const pages = [];
    for (let i = Math.max(0, page - 2); i <= Math.min(totalPages - 1, page + 2); i++) pages.push(i);
    return pages;
  };

  const handleAction = async (staff, value) => {
    if (value === ACTION_TYPES.EDIT) { setEditStaff(staff); setShowModal(true); return; }
    if (value === ACTION_TYPES.TOGGLE) {
      const isActive = staff.status === STATUS.ACTIVE;
      setTogglingId(staff.id);
      try {
        isActive ? await deactivateTransportStaff(staff.id) : await activateTransportStaff(staff.id);
        toast.success(isActive ? `${staff.fullName} ${ACTION_MESSAGES.DEACTIVATED}` : `${staff.fullName} ${ACTION_MESSAGES.ACTIVATED}`);
        await fetchStaff();
      } catch (e) {
        toast.error(`${isActive ? ACTION_MESSAGES.FAILED_DEACTIVATE : ACTION_MESSAGES.FAILED_ACTIVATE} ${staff.fullName}.`);
      } finally {
        setTogglingId(null);
      }
    }
  };

  const handleSaved = async (isEdit) => {
    setShowModal(false);
    setEditStaff(null);
    toast.success(isEdit ? TOAST_MESSAGES.STAFF_UPDATE_SUCCESS : TOAST_MESSAGES.STAFF_ADD_SUCCESS);
    await fetchStaff();
  };

  return (
    <>
      <div className="min-h-screen bg-[#f0f2f8] font-sans w-full max-w-full overflow-x-hidden min-w-0 flex flex-col">

        {/* Top Header Section */}
        <div className="px-3 sm:px-5 lg:px-6 pt-4 sm:pt-6 pb-2 w-full max-w-full min-w-0">
          <h1 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center gap-2 min-w-0">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600 shrink-0" />
            <span className="truncate">{STAFF_UI_TEXT.PAGE_TITLE}</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm mt-1 max-w-2xl line-clamp-2 sm:line-clamp-none">
            {STAFF_UI_TEXT.PAGE_SUBTITLE}
          </p>
        </div>

        {/* Main Container */}
        <div className="px-2.5 sm:px-5 lg:px-6 py-3 sm:py-4 w-full max-w-full min-w-0 flex-1">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden w-full max-w-full min-w-0 flex flex-col">

            {/* Section Header */}
            <div className="px-3.5 sm:px-5 py-3 sm:py-3.5 border-b border-gray-100 w-full min-w-0">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-900 flex items-center gap-1.5 sm:gap-2 min-w-0">
                <SlidersHorizontal className="w-4 h-4 text-teal-500 shrink-0" />
                <span className="truncate">{STAFF_UI_TEXT.SECTION_TITLE}</span>
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-400 mt-0.5 truncate">
                {totalItems} {totalItems !== 1 ? STAFF_UI_TEXT.STAFF_MEMBERS : STAFF_UI_TEXT.STAFF_MEMBER} {COMMON_UI_TEXT.FOUND}
              </p>
            </div>

            {/* Integrated Toolbar: Search, Filters & Add Staff Button */}
            <div className="px-3.5 sm:px-5 py-3 border-b border-gray-50 flex flex-col md:flex-row gap-2.5 w-full max-w-full min-w-0 items-center bg-gray-50/50">
              {/* Search Bar */}
              <div className="relative flex-1 w-full min-w-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 shrink-0" />
                <input
                  type="text" placeholder={STAFF_UI_TEXT.SEARCH_PLACEHOLDER}
                  value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white placeholder-gray-400 min-w-0"
                />
              </div>

              {/* Filters & Add Staff Group */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto shrink-0 min-w-0">
                {[
                  { val: roleFilter, set: setRoleFilter, opts: ROLE_OPTIONS },
                  { val: statusFilter, set: setStatusFilter, opts: STATUS_OPTIONS },
                ].map(({ val, set, opts }, fi) => (
                  <div key={fi} className="relative flex-1 sm:flex-none min-w-0">
                    <select value={val} onChange={(e) => set(e.target.value)}
                      className="appearance-none w-full pl-2.5 pr-7 py-2 text-xs sm:text-sm border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer sm:min-w-[120px] min-w-0 text-gray-700 font-medium">
                      {opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none shrink-0" />
                  </div>
                ))}

                {/* Compact Add Staff Button inside Toolbar */}
                <button
                  onClick={() => { setEditStaff(null); setShowModal(true); }}
                  className="inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-xl transition-colors shadow-2xs shrink-0 cursor-pointer w-full sm:w-auto whitespace-nowrap"
                >
                  <Plus className="w-4 h-4 shrink-0" /> {STAFF_UI_TEXT.BTN_ADD_STAFF}
                </button>
              </div>
            </div>

            {/* Mobile / Tablet Cards View (< xl / < 1280px) */}
            <div className="block xl:hidden px-2.5 sm:px-4 py-3 sm:py-4 bg-gray-50/30 min-w-0">
              {loading ? (
                <div className="bg-white rounded-xl p-4"><ListLoader rows={4} avatar={false} /></div>
              ) : allStaff.length === 0 ? (
                <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-100">
                  <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                  <p className="font-medium text-sm">{STAFF_UI_TEXT.EMPTY_TITLE}</p>
                  <p className="text-xs mt-1">{STAFF_UI_TEXT.EMPTY_SUBTITLE}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 min-w-0">
                  {allStaff.map((s) => <StaffCard key={s.id} s={s} onAction={handleAction} />)}
                </div>
              )}
            </div>

            {/* Desktop Table View (≥ xl / ≥ 1280px) */}
            <div className="hidden xl:block w-full max-w-full min-w-0 overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="w-full text-xs xl:text-sm text-left border-collapse table-auto min-w-[1000px]">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {STAFF_TABLE_COLUMNS.map((h) => (
                        <th key={h} className="px-3 xl:px-4 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 bg-white">
                    {loading ? (
                      <ListLoader rows={PAGINATION.ITEMS_PER_PAGE} avatar={false} colSpanSet={STAFF_TABLE_COLUMNS.length} />
                    ) : allStaff.length === 0 ? (
                      <tr>
                        <td colSpan={STAFF_TABLE_COLUMNS.length} className="text-center py-16 text-gray-400">
                          <Users className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                          <p className="font-medium">{STAFF_UI_TEXT.EMPTY_TITLE}</p>
                          <p className="text-xs mt-1">{STAFF_UI_TEXT.EMPTY_SUBTITLE}</p>
                        </td>
                      </tr>
                    ) : allStaff.map((s) => {
                      const licExpired = isExpired(s.licenseExpiryDate);
                      const licWarn = !licExpired && isExpiringSoon(s.licenseExpiryDate);
                      const isBusy = togglingId === s.id;
                      return (
                        <tr key={s.id} className="hover:bg-teal-50/20 transition-colors">
                          <td className="px-4 xl:px-5 py-4">
                            <p className="font-bold text-gray-900 whitespace-nowrap">{s.fullName}</p>
                            {s.address && <p className="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate" title={s.address}>{s.address}</p>}
                          </td>
                          <td className="px-3 xl:px-4 py-4 whitespace-nowrap text-center">
                            <span className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap ${ROLE_COLORS[s.staffRole] || "bg-gray-100 text-gray-600"}`}>{s.staffRole}</span>
                          </td>

                          <td className="px-3 xl:px-4 py-4 text-gray-600 font-medium whitespace-nowrap">
                            <span className="flex items-center gap-1.5 justify-center">
                              <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                              {s.contactNumber}
                            </span>
                            {s.alternateContact && (
                              <p className="text-[12px] text-gray-400 font-normal mt-0.5 pl-2 text-center">
                                {STAFF_UI_TEXT.LBL_ALT_CONTACT} {s.alternateContact}
                              </p>
                            )}
                          </td>

                          <td className="px-3 xl:px-4 py-4 text-gray-600 text-center font-mono text-xs whitespace-nowrap">{s.licenseNumber || <span className="text-gray-300">—</span>}</td>
                          <td className="px-3 xl:px-4 py-4 whitespace-nowrap text-center">
                            {!s.licenseExpiryDate ? (
                              <span className="text-gray-300">—</span>
                            ) : licExpired ? (
                              <div className="flex flex-col items-center text-xs font-bold text-red-600">
                                <span>{fmtDate(s.licenseExpiryDate)}</span>
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 px-1.5 py-0.5 rounded w-fit mt-0.5">
                                  <XCircle className="w-3 h-3" /> EXPIRED
                                </span>
                              </div>
                            ) : licWarn ? (
                              <span className="inline-flex items-center justify-center gap-1 text-orange-600 text-xs font-semibold">
                                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                {fmtDate(s.licenseExpiryDate)}
                              </span>
                            ) : (
                              <span className="text-gray-600">{fmtDate(s.licenseExpiryDate)}</span>
                            )}
                          </td>
                          <td className="px-3 xl:px-4 py-4 text-gray-600 whitespace-nowrap text-center">{fmtDate(s.joiningDate)}</td>
                          <td className="px-3 xl:px-4 py-4 whitespace-nowrap text-center">
                            {isBusy ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 border border-gray-200 animate-pulse">{COMMON_UI_TEXT.WAIT}</span>
                            ) : s.status === STATUS.ACTIVE ? (
                              <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />{COMMON_UI_TEXT.ACTIVE}</span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200 whitespace-nowrap"><span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />{COMMON_UI_TEXT.INACTIVE}</span>
                            )}
                          </td>
                          <td className="px-3 xl:px-4 py-4 whitespace-nowrap">
                            <ActionDropDownComp
                              onAction={(val) => handleAction(s, val)}
                              actionOptions={[
                                { label: COMMON_UI_TEXT.EDIT, value: ACTION_TYPES.EDIT, icon: Pencil, bg: "bg-white", text: "text-blue-600", hover: "hover:bg-blue-50" },
                                {
                                  label: s.status === STATUS.ACTIVE ? COMMON_UI_TEXT.DEACTIVATE : COMMON_UI_TEXT.ACTIVATE,
                                  value: ACTION_TYPES.TOGGLE,
                                  icon: s.status === STATUS.ACTIVE ? ToggleLeft : ToggleRight,
                                  bg: "bg-white",
                                  text: s.status === STATUS.ACTIVE ? "text-orange-600" : "text-green-600",
                                  hover: s.status === STATUS.ACTIVE ? "hover:bg-orange-50" : "hover:bg-green-50",
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
            </div>

            {/* Pagination Controls */}
            {!loading && totalPages > 1 && (
              <div className="px-3.5 sm:px-6 py-3.5 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap bg-white mt-auto">
                <p className="text-[11px] sm:text-xs text-gray-400 font-medium">
                  Showing {totalItems === 0 ? 0 : page * PAGINATION.ITEMS_PER_PAGE + 1}–{Math.min((page + 1) * PAGINATION.ITEMS_PER_PAGE, totalItems)} of {totalItems}
                </p>
                <div className="flex items-center gap-1">
                  <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 rotate-90" />
                  </button>
                  {pageNumbers().map((p) => (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg text-xs font-semibold transition-colors ${page === p ? "bg-blue-600 text-white shadow-2xs" : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                      {p + 1}
                    </button>
                  ))}
                  <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <ChevronDown className="w-3.5 h-3.5 -rotate-90" />
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      <AddStaffCard
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditStaff(null); }}
        onSaved={handleSaved}
        editData={editStaff}
      />
    </>
  );
}