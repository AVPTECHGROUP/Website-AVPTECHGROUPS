import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Users, MapPin, ChevronLeft, ChevronRight,
  CheckCircle, LogOut, ArrowRight, GraduationCap,
  School, TrendingUp, AlertTriangle, ServerCrash,
} from "lucide-react";
import SchoolSelectedCard from "../../Components/SuperAdmin/SchoolSelectedCard";
import { getMySchools, getMySchoolStats } from "../../Api/Schools";
import dpis from "../../assets/Images/dpis.jpg";

const borderAccents = [
  "border-t-blue-500", "border-t-purple-500", "border-t-emerald-500",
  "border-t-orange-500", "border-t-pink-500", "border-t-teal-500",
];

const boardBadge = (board) => {
  const map = {
    CBSE:         "bg-blue-50 text-blue-700 border border-blue-200",
    ICSE:         "bg-amber-50 text-amber-700 border border-amber-200",
    "STATE BOARD":"bg-emerald-50 text-emerald-700 border border-emerald-200",
  };
  return map[(board || "").toUpperCase()] ?? "bg-gray-100 text-gray-600 border border-gray-200";
};

const buildStats = (stats) => {
  const boardWise = stats?.boardWiseCount ?? {};
  return [
    {
      keyName: "Total Schools", val: stats?.totalSchools ?? 0,
      IconName: School, accentBar: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600",
      sub: "All registered",
    },
    {
      keyName: "Active", val: stats?.activeSchools ?? 0,
      IconName: CheckCircle, accentBar: "bg-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600",
      sub: "Currently operating", pulse: true,
    },
    {
      keyName: "Inactive", val: stats?.inactiveSchools ?? 0,
      IconName: AlertTriangle, accentBar: "bg-slate-400", iconBg: "bg-slate-50", iconColor: "text-slate-500",
      sub: "Not operating",
    },
    {
      keyName: "CBSE", val: boardWise["CBSE"] ?? 0,
      IconName: GraduationCap, accentBar: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-blue-600",
      sub: "Central board",
    },
    {
      keyName: "ICSE", val: boardWise["ICSE"] ?? 0,
      IconName: GraduationCap, accentBar: "bg-amber-400", iconBg: "bg-amber-50", iconColor: "text-amber-600",
      sub: "Indian certificate",
    },
    {
      keyName: "State Board",
      val: boardWise["STATE BOARD"] ?? boardWise["State Board"] ?? 0,
      IconName: TrendingUp, accentBar: "bg-violet-500", iconBg: "bg-violet-50", iconColor: "text-violet-600",
      sub: "State curriculum",
    },
  ];
};

const getRoleMeta = (role) => {
  if (role === "GLOBAL_ADMIN")
    return { label: "Global Admin Console", badge: "bg-indigo-100 text-indigo-700 border-indigo-200", roleTag: "GLOBAL ADMIN" };
  return { label: "Super Admin Console", badge: "bg-blue-100 text-blue-700 border-blue-200", roleTag: "SUPER ADMIN" };
};

/* ── Stat Card Skeleton ── */
const StatCardSkeleton = () => (
  <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-gray-200" />
    <div className="py-4 px-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-gray-100 shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-12 bg-gray-100 rounded" />
        <div className="h-3 w-20 bg-gray-100 rounded" />
        <div className="h-2.5 w-16 bg-gray-100 rounded" />
      </div>
    </div>
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ keyName, val, IconName, accentBar, iconBg, iconColor, sub, pulse }) => (
  <div className="relative bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200 group">
    <div className={`absolute top-0 left-0 right-0 h-[3px] ${accentBar}`} />
    <div className="py-4 px-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200`}>
        <IconName size={22} className={iconColor} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-gray-900 leading-none mb-1 tabular-nums">{val.toLocaleString()}</p>
        <p className="text-sm font-semibold text-gray-600 truncate">{keyName}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          {pulse && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />}
          <p className="text-xs text-gray-400 truncate">{sub}</p>
        </div>
      </div>
    </div>
  </div>
);

/* ── School Card Skeleton ── */
const SchoolCardSkeleton = () => (
  <div className="bg-white rounded-2xl border-t-4 border-t-gray-200 border border-gray-200 shadow-sm p-5 space-y-3 animate-pulse">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gray-200 mx-auto" />
    <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
    <div className="flex justify-center gap-2">
      <div className="h-3 bg-gray-200 rounded w-14" />
      <div className="h-3 bg-gray-200 rounded w-14" />
    </div>
    <div className="border-t border-gray-100" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-4/5" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
    <div className="h-8 bg-gray-200 rounded-xl w-full" />
  </div>
);

/* ── Pagination ── */
const PaginationButtons = ({ page, totalPages, setPage }) => {
  const getVisiblePages = () => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i);
    const pages = new Set([0, totalPages - 1, page]);
    if (page > 0) pages.add(page - 1);
    if (page < totalPages - 1) pages.add(page + 1);
    return Array.from(pages).sort((a, b) => a - b);
  };

  const visiblePages = getVisiblePages();

  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap pb-4 px-2">
      <button
        disabled={page === 0}
        onClick={() => setPage((p) => p - 1)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft size={13} />
        <span className="hidden xs:inline">Prev</span>
      </button>

      {visiblePages.map((p, idx) => {
        const prev = visiblePages[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="text-xs text-gray-400 px-1">…</span>}
            <button
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm
                ${p === page
                  ? "bg-blue-600 text-white shadow-blue-200"
                  : "bg-white border border-gray-200 text-gray-500 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50"
                }`}
            >
              {p + 1}
            </button>
          </span>
        );
      })}

      <button
        disabled={page >= totalPages - 1}
        onClick={() => setPage((p) => p + 1)}
        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white border border-gray-200 text-xs text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <span className="hidden xs:inline">Next</span>
        <ChevronRight size={13} />
      </button>

      <span className="w-full text-center sm:w-auto sm:text-left text-xs text-gray-400 sm:ml-2 mt-1 sm:mt-0">
        Page {page + 1} of {totalPages}
      </span>
    </div>
  );
};

/* ════════════════════════════════════════════
   Main Component
════════════════════════════════════════════ */
export default function SuperAdminSchools() {
  const navigate = useNavigate();

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem("user")) || null; }
    catch { return null; }
  })();

  const userRole =
    storedUser?.userType ||
    (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null) ||
    null;

  const roleMeta = getRoleMeta(userRole);

  const displayName =
    storedUser?.fullName ||
    [storedUser?.firstName, storedUser?.lastName].filter(Boolean).join(" ") ||
    storedUser?.name ||
    storedUser?.email ||
    "User";

  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("school");
    localStorage.removeItem("requireSchoolSelection");
    navigate("/login");
  };

  const [schools,       setSchools]       = useState([]);
  const [statsData,     setStatsData]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [statsLoading,  setStatsLoading]  = useState(true);
  const [error,         setError]         = useState(null);
  const [selectedId,    setSelectedId]    = useState(null);
  const [modalSchool,   setModalSchool]   = useState(null);

  const [searchInput,   setSearchInput]   = useState("");
  const [search,        setSearch]        = useState("");
  const [boardFilter,   setBoardFilter]   = useState("");
  const [statusFilter,  setStatusFilter]  = useState("ACTIVE");

  const [page,          setPage]          = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const PAGE_SIZE   = 20;
  const debounceRef = useRef(null);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setSearch(searchInput); setPage(0); }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [searchInput]);

  useEffect(() => { setPage(0); }, [boardFilter, statusFilter]);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const isActive =
        statusFilter === "ACTIVE"   ? true  :
        statusFilter === "INACTIVE" ? false :
        undefined;

      const res = await getMySchools(page, PAGE_SIZE, search, boardFilter, isActive);

      if (res?.success && res?.data) {
        const { content = [], totalElements: te = 0, totalPages: tp = 1 } = res.data;
        setSchools(content);
        setTotalElements(te);
        setTotalPages(tp);
      } else {
        setSchools([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load schools");
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, boardFilter, statusFilter]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      setStatsData(buildStats(await getMySchoolStats()));
    } catch {
      setStatsData(buildStats(null));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  const handleRefresh = () => Promise.all([fetchSchools(), fetchStats()]);

  const getStatusBadge = (school) => {
    const active = school.isActive || school.status === "ACTIVE";
    return active
      ? { label: "Active",   cls: "text-emerald-600 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" }
      : { label: "Inactive", cls: "text-red-500 bg-red-50 border-red-100",             dot: "bg-red-400"     };
  };

  return (
    <>
      <div className="min-h-screen bg-[#eef2f7] font-sans">

        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">

            {/* Left: Logo + Title */}
            <div className="flex items-center gap-2 min-w-0">
              <img src={dpis} alt="School Logo" className="w-7 h-7 sm:w-10 sm:h-10 object-cover shadow shrink-0" />
              <span className="font-bold text-gray-800 md:text-lg tracking-wide truncate">SchoolSpine</span>
              <span className={`hidden md:inline text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-widest border whitespace-nowrap ${roleMeta.badge}`}>
                {roleMeta.label}
              </span>
            </div>

            {/* Right: User info + sign out */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-xl bg-gray-100 border border-gray-200">
                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
                  {initials}
                </div>
                <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-fit text-nowrap">{displayName}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-xs text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-200 border cursor-pointer border-transparent hover:border-red-100"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-8 space-y-4 sm:space-y-6">

          {/* ── Header ── */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                Welcome, {storedUser?.firstName || displayName}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Select a school to operate. Logged in as{" "}
                <span className="text-blue-600 font-semibold">{roleMeta.roleTag}</span>.
              </p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {statsLoading
              ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statsData.map((s) => <StatCard key={s.keyName} {...s} />)}
          </div>

          {/* ── Search + Filters ── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-3 sm:p-4 shadow-sm flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, code or city..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all duration-200"
              />
            </div>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
            >
              <option value="">All Boards</option>
              <option value="CBSE">CBSE</option>
              <option value="ICSE">ICSE</option>
              <option value="STATE BOARD">State Board</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all duration-200 cursor-pointer"
            >
              <option value="ACTIVE">Active only</option>
              <option value="">All</option>
              <option value="INACTIVE">Inactive only</option>
            </select>
            <span className="text-xs text-gray-400 whitespace-nowrap font-medium text-center sm:text-left">
              {loading ? "Loading…" : `${totalElements} school${totalElements !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 sm:px-5 py-4 text-sm">
              <ServerCrash size={18} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Failed to load schools</p>
                <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors whitespace-nowrap"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── School Cards Grid ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SchoolCardSkeleton key={i} />)
              : schools.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 sm:py-16 text-gray-400 gap-3">
                    <School size={36} className="text-gray-300 sm:w-10 sm:h-10" />
                    <p className="font-semibold text-gray-500 text-sm sm:text-base">No schools found</p>
                    <p className="text-xs sm:text-sm text-center px-4">Try adjusting your search or filters</p>
                  </div>
                )
                : schools.map((school, idx) => {
                  const accent     = borderAccents[idx % borderAccents.length];
                  const isSelected = selectedId === school.id;
                  const badge      = getStatusBadge(school);
                  return (
                    <div
                      key={school.id}
                      onClick={() => setSelectedId(school.id)}
                      className={`relative bg-white rounded-2xl border-t-4 cursor-pointer group transition-all duration-200 overflow-hidden
                        ${accent}
                        ${isSelected
                          ? "border border-blue-300 shadow-xl shadow-blue-100 ring-2 ring-blue-200 scale-[1.02]"
                          : "border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-gray-300"
                        }`}
                    >
                      <div className="p-4 sm:p-5">

                        {/* Status badge */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                          <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${badge.dot === "bg-emerald-500" ? "animate-pulse" : ""}`} />
                            {badge.label}
                          </span>
                        </div>

                        {/* School logo */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 transition-transform duration-200 group-hover:scale-105 drop-shadow-md">
                          <img
                            src={school.logoUrl || dpis}
                            alt={school.name}
                            className="w-full h-full object-contain p-1 bg-white border-2 border-gray-100 shadow rounded"
                            onError={(e) => { e.currentTarget.src = dpis; }}
                          />
                        </div>

                        {/* Name */}
                        <h3 className="font-bold text-xs sm:text-sm text-gray-900 leading-tight mb-1.5 text-center line-clamp-2">
                          {school.name}
                        </h3>

                        {/* Code + Board */}
                        <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4 flex-wrap">
                          <span className="text-[10px] text-gray-400 font-mono bg-gray-50 border border-gray-200 px-1.5 py-0.5 rounded">
                            {school.code}
                          </span>
                          {school.board && (
                            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-lg ${boardBadge(school.board)}`}>
                              {school.board}
                            </span>
                          )}
                        </div>

                        <div className="border-t border-gray-100 mb-2.5 sm:mb-3" />

                        {/* Details */}
                        <div className="space-y-1 sm:space-y-1.5 text-xs text-gray-500 mb-3 sm:mb-4">
                          {(school.city || school.state) && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <MapPin size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{[school.city, school.state].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                          {school.establishedYear && (
                            <div className="flex items-center gap-1.5">
                              <School size={11} className="text-gray-400 shrink-0" />
                              Est. {school.establishedYear}
                            </div>
                          )}
                          {school.phone && (
                            <div className="flex items-center gap-1.5 min-w-0">
                              <Users size={11} className="text-gray-400 shrink-0" />
                              <span className="truncate">{school.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA — opens school selection modal */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalSchool(school); }}
                          className="w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 active:scale-95 cursor-pointer transition-all duration-200 touch-manipulation"
                        >
                          Enter School <ArrowRight size={13} />
                        </button>

                      </div>
                    </div>
                  );
                })}
          </div>

          {/* ── Pagination ── */}
          {!loading && totalPages > 1 && (
            <PaginationButtons page={page} totalPages={totalPages} setPage={setPage} />
          )}

        </div>
      </div>

      {/* Modal — SchoolSelectedCard handles new-tab opening internally */}
      {modalSchool && (
        <SchoolSelectedCard
          school={modalSchool}
          onClose={() => setModalSchool(null)}
        />
      )}
    </>
  );
}