import { useState, useEffect, useCallback } from "react";
import {
  getSubjectsWithFilters,
  deleteSubject,
} from "../../Api/subject";
import { getSubjectCategoryLov } from "../../Api/ListOfValues";
import AddNewSubject from "./AddnewSubject";
import SectionSubjectAssignment from "../../Pages/SubjectManagement/SectionSubjectAssignment";

/* ═══════════════════════════════════════════
   CONSTANTS
═══════════════════════════════════════════ */

// FIX 1: Added all 10 API category values + label-based fallback keys
// The list API sends `subject.category` as a LABEL (e.g. "Social Studies"),
// so we also key by LABEL_UPPERCASED_NO_SPACES to cover both shapes.
const CAT_CLS = {
  // ── by VALUE key (what the LOV/edit API sends) ──────────────────────────
  CORE:           "bg-blue-50    text-blue-700    border-blue-200",
  LANGUAGE:       "bg-violet-50  text-violet-700  border-violet-200",
  SCIENCE:        "bg-emerald-50 text-emerald-700 border-emerald-200",
  ARTS:           "bg-pink-50    text-pink-700    border-pink-200",
  SPORTS:         "bg-orange-50  text-orange-700  border-orange-200",
  ELECTIVE:       "bg-amber-50   text-amber-700   border-amber-200",
  SOCIAL:         "bg-teal-50    text-teal-700    border-teal-200",
  COMPUTER:       "bg-cyan-50    text-cyan-700    border-cyan-200",
  VOCATIONAL:     "bg-lime-50    text-lime-700    border-lime-200",
  OTHER:          "bg-slate-100  text-slate-600   border-slate-200",
  // ── by LABEL uppercased + spaces stripped (what the list API sends) ─────
  SOCIALSTUDIES:  "bg-teal-50    text-teal-700    border-teal-200",
  COMPUTERSCIENCE:"bg-cyan-50    text-cyan-700    border-cyan-200",
};

const ROW_OPTIONS = [10, 20, 30];

/* ═══════════════════════════════════════════
   TINY SVG ICONS
═══════════════════════════════════════════ */
const IPlus  = () => <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const IEdit  = () => <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>;
const ITrash = () => <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
const ISearch= () => <svg className="w-4 h-4 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" strokeLinecap="round" /></svg>;
const ISpin  = () => <svg className="w-6 h-6 animate-spin text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" /></svg>;
const IChev  = () => <svg className="w-4 h-4 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>;

/* ═══════════════════════════════════════════
   REUSABLE ATOMS
═══════════════════════════════════════════ */

// FIX 1 (continued): Normalise `cat` → uppercase + no spaces before lookup.
// This handles both "SOCIAL" (value) and "Social Studies" (label) correctly.
function CatBadge({ cat }) {
  const key = (cat ?? "").toUpperCase().replace(/\s+/g, "");
  const cls = CAT_CLS[key] || "bg-slate-100 text-slate-600 border-slate-200";
  return (
    <span className={`inline-block border text-[11px] font-bold px-2 py-0.5 rounded uppercase tracking-wide whitespace-nowrap ${cls}`}>
      {cat || "—"}
    </span>
  );
}

function StatusBadge({ active }) {
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full whitespace-nowrap ${
      active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
    }`}>
      {active ? "Active" : "INACTIVE"}
    </span>
  );
}

function NativeSelect({ value, onChange, className = "", children, disabled }) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full appearance-none bg-white border border-slate-200 rounded-lg pl-3 pr-8 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ minHeight: 38 }}
      >
        {children}
      </select>
      <span className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"><IChev /></span>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MOBILE CARD
═══════════════════════════════════════════ */
function SubjectCard({ s, onEdit, onDelete }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 whitespace-nowrap">
            {s.code}
          </span>
          <CatBadge cat={s.category} />
        </div>
        <StatusBadge active={s.status === "ACTIVE"} />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 text-sm leading-snug break-words">{s.name}</p>
        {s.description && (
          <p className="text-slate-500 text-xs mt-0.5 line-clamp-2 break-words">{s.description}</p>
        )}
      </div>
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <span className="text-xs text-slate-400 shrink-0">
          Order: <strong className="text-slate-600">{s.displayOrder ?? "—"}</strong>
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(s)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
            style={{ minHeight: 36 }}
          >
            <IEdit /> Edit
          </button>
          <button
            onClick={() => onDelete(s)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
            style={{ minHeight: 36 }}
          >
            <ITrash /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   DELETE DIALOG
═══════════════════════════════════════════ */
function DeleteDialog({ subject, onClose, onConfirm }) {
  const [busy, setBusy] = useState(false);
  const go = async () => {
    setBusy(true);
    try { await deleteSubject(subject.id); onConfirm(); }
    catch { onClose(); }
    finally { setBusy(false); }
  };
  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-0 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl shadow-2xl p-6 text-center">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
          <ITrash />
        </div>
        <h3 className="text-slate-800 font-bold text-base mb-1">Delete Subject</h3>
        <p className="text-slate-500 text-sm mb-5 leading-relaxed break-words">
          Delete <span className="font-semibold text-slate-700">"{subject.name}"</span>?{" "}
          This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
            style={{ minHeight: 44 }}>
            Cancel
          </button>
          <button onClick={go} disabled={busy}
            className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-semibold disabled:opacity-60 transition-colors"
            style={{ minHeight: 44 }}>
            {busy ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   PAGINATION
═══════════════════════════════════════════ */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const all = Array.from({ length: totalPages }, (_, i) => i);
  const vis = all.filter((n) => n === 0 || n === totalPages - 1 || Math.abs(n - page) <= 1);
  return (
    <div className="flex items-center gap-1 flex-wrap justify-center sm:justify-end">
      <button
        onClick={() => onChange(Math.max(0, page - 1))}
        disabled={page === 0}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ minHeight: 36 }}
      >‹ Prev</button>

      {vis.map((n, idx) => {
        const prev = vis[idx - 1];
        return (
          <span key={n} className="flex items-center gap-1">
            {prev !== undefined && n - prev > 1 && (
              <span className="w-6 text-center text-slate-400 text-sm select-none">…</span>
            )}
            <button
              onClick={() => onChange(n)}
              className={`w-8 h-8 text-sm rounded-lg font-medium transition-colors ${
                page === n ? "bg-indigo-600 text-white" : "text-slate-600 border border-slate-200 hover:bg-slate-100"
              }`}
            >{n + 1}</button>
          </span>
        );
      })}

      <button
        onClick={() => onChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
        className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        style={{ minHeight: 36 }}
      >Next ›</button>
    </div>
  );
}

/* ═══════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════ */
export default function SubjectsMaster() {
  const [subjects,      setSubjects]      = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages,    setTotalPages]    = useState(1);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState("");

  const [categories,        setCategories]        = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [page,           setPage]           = useState(0);
  const [size,           setSize]           = useState(10);
  const [statusFilter,   setStatusFilter]   = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [searchQuery,    setSearchQuery]    = useState("");
  const [debouncedSearch,setDebouncedSearch]= useState("");

  const [modal,        setModal]        = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [activeTab, setActiveTab] = useState("materSubject");

  // ── Debounce ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 800);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // ── Reset page on filter/size change ─────────────────────────────────────
  useEffect(() => { setPage(0); }, [statusFilter, categoryFilter, size, debouncedSearch]);

  // ── Fetch subjects ────────────────────────────────────────────────────────
  const fetchSubjects = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page,
        size,
        sort: "id",
        search: debouncedSearch,
        status:   statusFilter   === "ALL" ? "" : statusFilter,
        category: categoryFilter === "ALL" ? "" : categoryFilter,
      };
      const result = await getSubjectsWithFilters(params);
      setSubjects(result?.subjects ?? []);
      setTotalElements(result?.pagination?.totalElements ?? result?.subjects?.length ?? 0);
      setTotalPages(result?.pagination?.totalPages ?? 1);
    } catch (err) {
      setError(err.message || "Failed to load subjects.");
    } finally {
      setLoading(false);
    }
  }, [page, size, statusFilter, categoryFilter, debouncedSearch]);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  // ── Fetch categories once ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const data = await getSubjectCategoryLov();
        const list = Array.isArray(data) ? data : data?.data ?? [];
        setCategories(list);
      } catch (err) {
        setCategories([]);
        console.error("Failed to fetch categories:", err.message);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const handleSaved   = () => { setModal(null);        fetchSubjects(); };
  const handleDeleted = () => { setDeleteTarget(null); fetchSubjects(); };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700&family=DM+Mono:wght@400;500&display=swap');
        .sm-root, .sm-root * { font-family:'DM Sans',sans-serif; box-sizing:border-box; }
        .sm-mono { font-family:'DM Mono',monospace; }
        .sm-tabs { scrollbar-width:none; }
        .sm-tabs::-webkit-scrollbar { display:none; }
      `}</style>

      <div className="sm-root w-full min-w-0 bg-slate-50 min-h-screen">

        {/* ── PAGE HEADER ── */}
        <div className="w-full bg-white border-b border-slate-200">
          <div className="px-3 sm:px-4 xl:px-6 pt-4 pb-0">
            <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mb-0.5">
              {activeTab === "materSubject" ? "Academic → Subjects" : "Academic → Section Assignment"}
            </p>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-800 tracking-tight">
              Subjects &amp; Section Assignment
            </h1>

            {/* Tabs */}
            <div className="sm-tabs mt-3 flex overflow-x-auto border-b border-slate-200 -mb-px gap-0">
              <button
                onClick={() => setActiveTab("materSubject")}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === "materSubject"
                    ? "text-indigo-600 border-indigo-600"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                Subjects
              </button>
              <button
                onClick={() => setActiveTab("assignment")}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 pb-3 text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === "assignment"
                    ? "text-indigo-600 border-indigo-600"
                    : "text-slate-400 border-transparent hover:text-slate-600"
                }`}
              >
                <span className="hidden sm:inline">Section–Subject Assignment</span>
                <span className="sm:hidden">Assignment</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── ASSIGNMENT TAB ── */}
        <div className={activeTab === "materSubject" ? "hidden" : ""}>
          <SectionSubjectAssignment />
        </div>

        {/* ── SUBJECTS TAB ── */}
        <div className={`${activeTab === "assignment" ? "hidden" : ""} px-3 sm:px-4 md:px-6 py-3 sm:py-4`}>
          <div className="w-full bg-white rounded-xl xl:rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

            {/* ── TOOLBAR ── */}
            <div className="px-3 sm:px-4 xl:px-5 py-3 border-b border-slate-100 space-y-2.5">

              {/* Row A: Title + Add button */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">All Subjects</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    <span className="font-semibold text-slate-600">{totalElements}</span> total subjects
                  </p>
                </div>
                <button
                  onClick={() => setModal({ mode: "add" })}
                  className="flex-shrink-0 flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
                  style={{ minHeight: 36 }}
                >
                  <IPlus /> Add Subject
                </button>
              </div>

              {/* Row B: Search + Filters */}
              <div className="flex flex-col gap-2">
                <div className="relative w-full">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ISearch />
                  </span>
                  <input
                    type="text"
                    placeholder="Search by name or code…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                    style={{ minHeight: 38 }}
                  />
                  {searchQuery !== debouncedSearch && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:flex md:items-center gap-2">
                  <NativeSelect
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full md:w-40"
                  >
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </NativeSelect>

                  <NativeSelect
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full md:w-48"
                    disabled={categoriesLoading}
                  >
                    <option value="ALL">
                      {categoriesLoading ? "Loading categories…" : "All Categories"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.value || c.id} value={c.value || c.id}>
                        {c.label || c.value}
                      </option>
                    ))}
                  </NativeSelect>
                </div>
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mx-3 sm:mx-4 xl:mx-5 mt-4 flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm px-4 py-3 rounded-lg">
                <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" />
                </svg>
                <span className="break-words min-w-0">{error}</span>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="py-16 flex flex-col items-center gap-3 text-slate-400">
                <ISpin />
                <p className="text-sm">Loading subjects…</p>
              </div>
            )}

            {/* Empty */}
            {!loading && subjects.length === 0 && (
              <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
                <svg className="w-10 h-10 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm font-medium">No subjects found.</p>
                <p className="text-xs">Try adjusting your search or filters</p>
              </div>
            )}

            {/* ── MOBILE CARDS (< 1280px) ── */}
            {!loading && subjects.length > 0 && (
              <div className="xl:hidden p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((s) => (
                  <SubjectCard
                    key={s.id}
                    s={s}
                    onEdit={(s) => setModal({ mode: "edit", subject: s })}
                    onDelete={(s) => setDeleteTarget(s)}
                  />
                ))}
              </div>
            )}

            {/* ── DESKTOP TABLE (≥ 1280px) ── */}
            {!loading && subjects.length > 0 && (
              <div className="hidden xl:block w-full overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: "100%" }}>
                  <thead>
                    <tr className="bg-slate-50 border-y border-slate-200 text-left">
                      {[
                        { h: "Code",         cls: "w-20"         },
                        { h: "Subject Name", cls: ""             },
                        { h: "Category",     cls: "w-36"         },
                        { h: "Description",  cls: ""             },
                        { h: "Status",       cls: "text-center w-24" },
                        { h: "Actions",      cls: "text-right  w-36" },
                      ].map(({ h, cls }) => (
                        <th key={h}
                          className={`py-3 px-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${cls}`}
                        >{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((s) => {
                      const isActive = s.status === "ACTIVE";
                      return (
                        <tr key={s.id} className="border-b border-slate-100 hover:bg-indigo-50/30 transition-colors">
                          <td className="py-3 px-4 whitespace-nowrap">
                            <span className="sm-mono inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                              {s.code}
                            </span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-800 max-w-xs truncate">
                            {s.name}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <CatBadge cat={s.category} />
                          </td>
                          <td className="py-3 px-4 text-slate-500 max-w-xs truncate whitespace-nowrap">
                            {s.description || "—"}
                          </td>
                          <td className="py-3 px-4 text-center whitespace-nowrap">
                            <StatusBadge active={isActive} />
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setModal({ mode: "edit", subject: s })}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                                style={{ minHeight: 32 }}
                              >
                                <IEdit /> Edit
                              </button>
                              <button
                                onClick={() => setDeleteTarget(s)}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                                style={{ minHeight: 32 }}
                              >
                                <ITrash /> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* ── FOOTER ── */}
            {!loading && subjects.length > 0 && (
              <div className="px-3 sm:px-5 py-3.5 border-t border-slate-100 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-slate-500 whitespace-nowrap">Rows per page:</span>
                  <NativeSelect
                    value={size}
                    onChange={(e) => setSize(Number(e.target.value))}
                    className="w-20"
                  >
                    {ROW_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
                  </NativeSelect>
                  <span className="text-sm text-slate-400 whitespace-nowrap">
                    <span className="font-medium text-slate-600">{subjects.length}</span>
                    {" "}of{" "}
                    <span className="font-medium text-slate-600">{totalElements}</span>
                    {" "}subjects
                  </span>
                </div>
                <Pagination page={page} totalPages={totalPages} onChange={setPage} />
              </div>
            )}

          </div>
        </div>
      </div>

      {modal && (
        <AddNewSubject
          subject={modal.mode === "edit" ? modal.subject : null}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
      {deleteTarget && (
        <DeleteDialog
          subject={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleted}
        />
      )}
    </>
  );
}