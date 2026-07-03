import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Users, MapPin, ChevronLeft, ChevronRight,
  CheckCircle, LogOut, ArrowRight, GraduationCap,
  School, TrendingUp, AlertTriangle, ServerCrash,
  Sun, Moon,
} from "lucide-react";
import SchoolSelectedCard from "../../Components/SuperAdmin/SchoolSelectedCard";
import { getMySchools, getMySchoolStats } from "../../Api/SchoolConfiguration/Schools";
import dpis from "../../assets/Images/dpis.jpg";
import { UserContext } from "../../ContextAPI/UserContext";

const boardBadge = (board) => {
  const map = {
    CBSE:         "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    ICSE:         "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    "STATE BOARD":"bg-purple-500/10 text-purple-400 border border-purple-500/20",
  };
  return map[(board || "").toUpperCase()] ?? "bg-white/5 text-slate-400 border border-white/10";
};

const buildStats = (stats) => {
  const boardWise = stats?.boardWiseCount ?? {};
  return [
    {
      keyName: "Total Schools", val: stats?.totalSchools ?? 0,
      IconName: School, accentBar: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-[#00C9B1]",
      sub: "All registered",
    },
    {
      keyName: "Active", val: stats?.activeSchools ?? 0,
      IconName: CheckCircle, accentBar: "bg-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-[#00C9B1]",
      sub: "Currently operating", pulse: true,
    },
    {
      keyName: "Inactive", val: stats?.inactiveSchools ?? 0,
      IconName: AlertTriangle, accentBar: "bg-slate-400", iconBg: "bg-slate-50", iconColor: "text-[#00C9B1]",
      sub: "Not operating",
    },
    {
      keyName: "CBSE", val: boardWise["CBSE"] ?? 0,
      IconName: GraduationCap, accentBar: "bg-blue-500", iconBg: "bg-blue-50", iconColor: "text-[#00C9B1]",
      sub: "Central board",
    },
    {
      keyName: "ICSE", val: boardWise["ICSE"] ?? 0,
      IconName: GraduationCap, accentBar: "bg-amber-400", iconBg: "bg-amber-50", iconColor: "text-[#00C9B1]",
      sub: "Indian certificate",
    },
    {
      keyName: "State Board",
      val: boardWise["STATE BOARD"] ?? boardWise["State Board"] ?? 0,
      IconName: TrendingUp, accentBar: "bg-violet-500", iconBg: "bg-violet-50", iconColor: "text-[#00C9B1]",
      sub: "State curriculum",
    },
  ];
};

const getRoleMeta = (role) => {
  if (role === "GLOBAL_ADMIN")
    return { label: "Global Admin Console", badge: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25", roleTag: "GLOBAL ADMIN" };
  return { label: "Super Admin Console", badge: "bg-blue-500/15 text-blue-400 border-blue-500/25", roleTag: "SUPER ADMIN" };
};

/* ── Stat Card Skeleton ── */
const StatCardSkeleton = () => (
  <div className="relative bg-theme-card border border-theme-border rounded-2xl overflow-hidden animate-pulse">
    <div className="absolute top-0 left-0 right-0 h-[3px] bg-white/[0.05]" />
    <div className="py-4 px-4 flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl bg-white/[0.05] shrink-0" />
      <div className="space-y-2 flex-1">
        <div className="h-6 w-12 bg-white/[0.05] rounded" />
        <div className="h-3 w-20 bg-white/[0.05] rounded" />
        <div className="h-2.5 w-16 bg-white/[0.05] rounded" />
      </div>
    </div>
  </div>
);

/* ── Stat Card ── */
const StatCard = ({ keyName, val, IconName, accentBar, iconBg, iconColor, sub, pulse }) => {
  const getAccentColor = (barClass) => {
    if (barClass.includes("blue") || barClass.includes("emerald") || barClass.includes("violet")) return "from-[#00C9B1] to-[#00E5D4]";
    if (barClass.includes("amber") || barClass.includes("orange")) return "from-[#F5A623] to-[#FFD166]";
    return "from-slate-500/40 to-slate-500/10";
  };
  
  const accentGradient = getAccentColor(accentBar);

  return (
    <div className="relative bg-theme-card border border-theme-border backdrop-blur-md rounded-2xl overflow-hidden hover:border-[#00C9B1]/40 hover:shadow-[0_8px_30px_rgba(0,201,177,0.12)] hover:-translate-y-0.5 transition-all duration-300 group">
      <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${accentGradient}`} />
      <div className="py-4 px-4 flex items-center gap-4">
        <div className="w-11 h-11 rounded-xl bg-theme-bg border border-theme-border flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform duration-200">
          <IconName size={22} className="text-[#00C9B1]" />
        </div>
        <div className="min-w-0">
          <p className="text-2xl font-bold text-theme-text leading-none mb-1 tabular-nums">{val.toLocaleString()}</p>
          <p className="text-sm font-semibold text-theme-subtext truncate">{keyName}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            {pulse && <span className="w-1.5 h-1.5 rounded-full bg-[#00C9B1] animate-pulse shrink-0" />}
            <p className="text-xs text-theme-subtext truncate">{sub}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── School Card Skeleton ── */
const SchoolCardSkeleton = () => (
  <div className="bg-theme-card border border-theme-border rounded-2xl p-5 space-y-3 animate-pulse">
    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/[0.05] mx-auto" />
    <div className="h-4 bg-white/[0.05] rounded w-3/4 mx-auto" />
    <div className="flex justify-center gap-2">
      <div className="h-3 bg-white/[0.05] rounded w-14" />
      <div className="h-3 bg-white/[0.05] rounded w-14" />
    </div>
    <div className="border-t border-white/[0.05]" />
    <div className="space-y-2">
      <div className="h-3 bg-white/[0.05] rounded w-full" />
      <div className="h-3 bg-white/[0.05] rounded w-4/5" />
      <div className="h-3 bg-white/[0.05] rounded w-2/3" />
    </div>
    <div className="h-8 bg-white/[0.05] rounded-xl w-full" />
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
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/10 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <ChevronLeft size={13} />
        <span className="hidden xs:inline">Prev</span>
      </button>

      {visiblePages.map((p, idx) => {
        const prev = visiblePages[idx - 1];
        const showEllipsis = prev !== undefined && p - prev > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {showEllipsis && <span className="text-xs text-slate-400 px-1">…</span>}
            <button
              onClick={() => setPage(p)}
              className={`w-8 h-8 rounded-xl text-xs font-bold transition-all duration-200 shadow-sm cursor-pointer
                ${p === page
                  ? "bg-[#00C9B1] text-[#05111D]"
                  : "bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:border-[#00C9B1]/30 hover:text-[#00C9B1] hover:bg-[#00C9B1]/10"
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
        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs text-slate-300 hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/10 transition-all duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
      >
        <span className="hidden xs:inline">Next</span>
        <ChevronRight size={13} />
      </button>

      <span className="w-full text-center sm:w-auto sm:text-left text-xs text-slate-400 sm:ml-2 mt-1 sm:mt-0">
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
  const { theme, toggleTheme } = useContext(UserContext);

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
      ? { label: "Active",   cls: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25", dot: "bg-emerald-500" }
      : { label: "Inactive", cls: "text-red-400 bg-red-500/10 border-red-500/25",             dot: "bg-red-400"     };
  };

  return (
    <>
      <div className="min-h-screen bg-theme-bg text-theme-text font-sans relative overflow-hidden transition-colors duration-300">
        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.4]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Ambient background glowing blobs */}
        <div className="pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-[0.22] blur-[120px]"
            style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />
        <div className="pointer-events-none absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.18] blur-[120px]"
            style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />

        {/* ── Navbar ── */}
        <nav className="sticky top-0 z-50 backdrop-blur-md bg-theme-nav/80 border-b border-theme-border shadow-lg transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2">

            {/* Left: Logo + Title */}
            <div className="flex items-center gap-2 min-w-0">
              <img src={dpis} alt="School Logo" className="w-8 h-8 object-cover shadow rounded shrink-0 border border-theme-border" />
              <span className="font-extrabold text-theme-text md:text-lg tracking-wide truncate">SchoolSpine</span>
              <span className={`hidden md:inline text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-widest border whitespace-nowrap bg-gradient-to-r from-[#00C9B1]/20 to-[#F5A623]/10 text-[#00C9B1] border-[#00C9B1]/30`}>
                {roleMeta.roleTag}
              </span>
            </div>

            {/* Right: User info + sign out */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
              <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 rounded-xl bg-theme-card border border-theme-border">
                <div className="w-6.5 h-6.5 rounded-full bg-gradient-to-tr from-[#00C9B1] to-[#F5A623] flex items-center justify-center text-[10px] font-black text-[#05111D] shrink-0">
                  {initials}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-theme-subtext max-w-fit text-nowrap">{displayName}</span>
              </div>
              
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/25 transition-all duration-200 cursor-pointer flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun size={13} className="text-[#F5A623]" /> : <Moon size={13} className="text-[#00C9B1]" />}
              </button>

              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-xl text-xs text-theme-subtext hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 border cursor-pointer border-transparent hover:border-red-500/20"
              >
                <LogOut size={13} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">

          {/* ── Header ── */}
          <div className="flex flex-col xs:flex-row items-start xs:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-theme-text tracking-tight">
                Welcome, {storedUser?.firstName || displayName}
              </h1>
              <p className="text-xs sm:text-sm text-theme-subtext mt-1">
                Select a school to operate. Logged in as{" "}
                <span className="text-[#00C9B1] font-semibold">{roleMeta.roleTag}</span>.
              </p>
            </div>
          </div>

          {/* ── Stat Cards ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {statsLoading
              ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
              : statsData.map((s) => <StatCard key={s.keyName} {...s} />)}
          </div>

          {/* ── Search + Filters ── */}
          <div className="bg-theme-card border border-theme-border backdrop-blur-md p-3 sm:p-4 rounded-2xl shadow-lg flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1 min-w-0">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-theme-subtext" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, code or city..."
                className="w-full bg-theme-card border border-theme-border rounded-xl pl-9 pr-4 py-2.5 text-sm text-theme-text placeholder:text-theme-subtext focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200"
              />
            </div>
            <select
              value={boardFilter}
              onChange={(e) => setBoardFilter(e.target.value)}
              className="bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200 cursor-pointer"
            >
              <option value="" className="bg-theme-bg text-theme-text">All Boards</option>
              <option value="CBSE" className="bg-theme-bg text-theme-text">CBSE</option>
              <option value="ICSE" className="bg-theme-bg text-theme-text">ICSE</option>
              <option value="STATE BOARD" className="bg-theme-bg text-theme-text">State Board</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-theme-card border border-theme-border rounded-xl px-3 py-2.5 text-sm text-theme-text focus:outline-none focus:border-[#00C9B1]/60 focus:bg-theme-bg focus:ring-2 focus:ring-[#00C9B1]/20 transition-all duration-200 cursor-pointer"
            >
              <option value="ACTIVE" className="bg-theme-bg text-theme-text">Active only</option>
              <option value="" className="bg-theme-bg text-theme-text">All</option>
              <option value="INACTIVE" className="bg-theme-bg text-theme-text">Inactive only</option>
            </select>
            <span className="text-xs text-slate-400 whitespace-nowrap font-semibold text-center sm:text-left">
              {loading ? "Loading…" : `${totalElements} school${totalElements !== 1 ? "s" : ""}`}
            </span>
          </div>

          {/* ── Error Banner ── */}
          {error && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-950/20 border border-red-900/30 text-red-400 rounded-2xl px-4 sm:px-5 py-4 text-sm">
              <ServerCrash size={18} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold">Failed to load schools</p>
                <p className="text-xs text-red-500 mt-0.5 break-words">{error}</p>
              </div>
              <button
                onClick={handleRefresh}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-900/30 hover:bg-red-900/50 transition-colors whitespace-nowrap cursor-pointer text-red-200"
              >
                Retry
              </button>
            </div>
          )}

          {/* ── School Cards Grid ── */}
          <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => <SchoolCardSkeleton key={i} />)
              : schools.length === 0
                ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-slate-500 gap-3">
                    <School size={36} className="text-slate-600 sm:w-10 sm:h-10" />
                    <p className="font-semibold text-slate-400 text-sm sm:text-base">No schools found</p>
                    <p className="text-xs sm:text-sm text-center px-4">Try adjusting your search or filters</p>
                  </div>
                )
                : schools.map((school) => {
                  const isSelected = selectedId === school.id;
                  const badge      = getStatusBadge(school);
                  return (
                    <div
                      key={school.id}
                      onClick={() => setSelectedId(school.id)}
                      className={`relative rounded-2xl cursor-pointer group transition-all duration-300 overflow-hidden
                        ${isSelected
                          ? "shadow-2xl shadow-cyan-950/40 scale-[1.02]"
                          : "shadow-md hover:shadow-2xl hover:shadow-cyan-950/30"
                        }`}
                      style={{
                          border: '1px solid transparent',
                          background: isSelected
                            ? 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, #00C9B1, #F5A623) border-box'
                            : 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, var(--theme-card-border-light), var(--theme-card-border-light)) border-box',
                      }}
                      onMouseEnter={e => {
                          if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, #00C9B1, rgba(245, 166, 35, 0.4)) border-box';
                          }
                      }}
                      onMouseLeave={e => {
                          if (!isSelected) {
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, var(--theme-card-border-light), var(--theme-card-border-light)) border-box';
                          }
                      }}
                    >
                      <div className="p-4 sm:p-5">

                        {/* Status badge */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badge.cls}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot} ${badge.dot === "bg-emerald-500" ? "animate-pulse" : ""}`} />
                            {badge.label}
                          </span>
                        </div>

                        {/* School logo */}
                        <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3.5 sm:mb-4 transition-transform duration-350 group-hover:scale-108 drop-shadow-md">
                          <img
                            src={school.logoUrl || dpis}
                            alt={school.name}
                            className="w-full h-full object-contain p-1 bg-white border border-white/[0.08] shadow rounded"
                            onError={(e) => { e.currentTarget.src = dpis; }}
                          />
                        </div>

                        {/* Name */}
                        <h3 className="font-extrabold text-xs sm:text-sm text-theme-text leading-tight mb-2 text-center line-clamp-2 min-h-[2.5rem] flex items-center justify-center">
                          {school.name}
                        </h3>

                        {/* Code + Board */}
                        <div className="flex items-center justify-center gap-2 mb-3.5 sm:mb-4 flex-wrap">
                          <span className="text-[10px] text-theme-subtext font-mono bg-theme-card border border-theme-border px-2 py-0.5 rounded">
                            {school.code}
                          </span>
                          {school.board && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${boardBadge(school.board)}`}>
                              {school.board}
                            </span>
                          )}
                        </div>

                        <div className="border-t border-theme-border mb-3 sm:mb-3.5" />

                        {/* Details */}
                        <div className="space-y-1.5 text-xs text-theme-subtext mb-4 sm:mb-5">
                          {(school.city || school.state) && (
                            <div className="flex items-center gap-2 min-w-0">
                              <MapPin size={12} className="text-[#00C9B1] shrink-0" />
                              <span className="truncate">{[school.city, school.state].filter(Boolean).join(", ")}</span>
                            </div>
                          )}
                          {school.establishedYear && (
                            <div className="flex items-center gap-2">
                              <School size={12} className="text-[#00C9B1] shrink-0" />
                              Est. {school.establishedYear}
                            </div>
                          )}
                          {school.phone && (
                            <div className="flex items-center gap-2 min-w-0">
                              <Users size={12} className="text-[#00C9B1] shrink-0" />
                              <span className="truncate">{school.phone}</span>
                            </div>
                          )}
                        </div>

                        {/* CTA — opens school selection modal */}
                        <button
                          onClick={(e) => { e.stopPropagation(); setModalSchool(school); }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#00C9B1] to-[#F5A623] hover:from-[#00E5D4] hover:to-[#FFD166] text-[#05111D] font-bold text-xs hover:scale-[1.01] active:scale-[0.98] cursor-pointer transition-all duration-200 touch-manipulation shadow-md shadow-cyan-900/35"
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