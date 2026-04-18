import { ChevronDown, Search, RotateCcw, Plus, Loader2, CheckCheck } from "lucide-react";

function FilterSelect({ value, onChange, loading = false, disabled = false, minWidth = "", children }) {
  return (
    <div className="relative">
      {loading && (
        <Loader2
          size={11}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none"
        />
      )}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || disabled}
        className={`appearance-none border border-gray-300 rounded-lg py-[7px] text-[13px] text-gray-600
          bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer
          disabled:opacity-60 disabled:cursor-not-allowed ${loading ? "pl-7" : "pl-3"} pr-7 ${minWidth}`}
      >
        {children}
      </select>
      <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
    </div>
  );
}

function Stat({ label, value, danger = false }) {
  return (
    <div className="text-center min-w-[36px]">
      <div className={`text-xl font-bold leading-none ${danger ? "text-red-600" : "text-gray-900"}`}>{value ?? 0}</div>
      <div className="text-[10px] text-gray-400 uppercase tracking-wider mt-0.5">{label}</div>
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] font-semibold text-gray-500 whitespace-nowrap">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border border-gray-300 rounded-lg px-2.5 py-[7px] text-[13px] text-gray-700
          bg-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 w-[140px]"
      />
    </div>
  );
}

/**
 * Props
 *  classes / classesLoading
 *  sections / sectionsLoading   — populated after class is selected
 *  subjects / subjectsLoading   — populated after section is selected (section-scoped)
 *
 *  selectedClassId / setSelectedClassId
 *  selectedSectionId / setSelectedSectionId
 *
 *  subjectFilter / setSubjectFilter   — filters homework table by subject
 *  statusFilter  / setStatusFilter
 *  dateFrom / setDateFrom
 *  dateTo   / setDateTo
 *  search   / setSearch
 *  onReset  / onApply / onAssign
 */
export default function ControlBar({
  classes = [],  classesLoading  = false,
  sections = [], sectionsLoading = false,
  subjects = [], subjectsLoading = false,

  selectedClassId,   setSelectedClassId,
  selectedSectionId, setSelectedSectionId,

  total, active, overdue,

  subjectFilter,  setSubjectFilter,
  statusFilter,   setStatusFilter,
  dateFrom,       setDateFrom,
  dateTo,         setDateTo,
  search,         setSearch,
  onReset,        onApply,        onAssign,
}) {
  const noClass   = !selectedClassId;
  const noSection = !selectedSectionId;

  return (
    <>
      {/* ── Row 1: Class → Section → Stats ───────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-3 px-5 py-3.5 border-b border-gray-100">

        {/* Class dropdown */}
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Class</span>
        <FilterSelect
          value={selectedClassId}
          onChange={setSelectedClassId}
          loading={classesLoading}
          minWidth="min-w-[130px]"
        >
          <option value="">Select class</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>{c.label}</option>
          ))}
        </FilterSelect>

        {/* Section dropdown — disabled until class chosen */}
        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest ml-2">Section</span>
        <FilterSelect
          value={selectedSectionId}
          onChange={setSelectedSectionId}
          loading={sectionsLoading}
          disabled={noClass}
          minWidth="min-w-[140px]"
        >
          <option value="">Select section</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </FilterSelect>

       
        {/* Contextual hints */}
        {noClass && (
          <span className="text-[11px] text-gray-400 italic">Select a class to see sections</span>
        )}
        {!noClass && noSection && !sectionsLoading && (
          <span className="text-[11px] text-gray-400 italic">Select a section, then click Apply</span>
        )}

        {/* Stats */}
        <div className="ml-auto flex items-center gap-6">
          <Stat label="Total"   value={total} />
          <Stat label="Active"  value={active} />
          <Stat label="Overdue" value={overdue} danger />
        </div>
      </div>

      {/* ── Row 2: Subject filter · Status · Dates · Search · Apply · Assign ─ */}
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-gray-100">

        {/*
          Subject filter — populated from the section-scoped subject list.
          Disabled until a section is chosen (no section = no subjects).
          Resets automatically in HomeworkPage when the section changes.
        */}
        <FilterSelect
          value={subjectFilter}
          onChange={setSubjectFilter}
          loading={subjectsLoading}
          disabled={noSection}
        >
          <option value="">All Subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.label}</option>
          ))}
        </FilterSelect>

        {/* Status filter */}
        <FilterSelect value={statusFilter} onChange={setStatusFilter}>
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </FilterSelect>

        {/* Date range */}
        <div className="flex items-center gap-2 border border-gray-300 rounded-lg px-3 py-[6px] bg-white">
          <DateInput label="From" value={dateFrom} onChange={setDateFrom} />
          <span className="text-gray-300 font-light mx-1">|</span>
          <DateInput label="To"   value={dateTo}   onChange={setDateTo} />
        </div>

        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-[280px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search homework title..."
            className="w-full pl-8 pr-3 py-[7px] text-[13px] border border-gray-300 rounded-lg
              outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white"
          />
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-medium
            border border-gray-300 rounded-lg text-gray-600 bg-white hover:bg-gray-50 transition-colors"
        >
          <RotateCcw size={13} /> Reset
        </button>

        {/* Apply — fires the actual API fetch */}
        <button
          onClick={onApply}
          disabled={noSection}
          title={noSection ? "Select a class and section first" : "Fetch homework with current filters"}
          className="inline-flex items-center gap-1.5 px-3.5 py-[7px] text-[13px] font-semibold
            border border-green-600 rounded-lg text-green-700 bg-green-50
            hover:bg-green-100 transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCheck size={14} /> Apply
        </button>

        <div className="flex-1" />

        {/* Assign button — requires a section to be selected */}
        <button
          onClick={onAssign}
          disabled={noSection}
          title={noSection ? "Select a class and section first" : "Assign new homework"}
          className="inline-flex items-center gap-1.5 px-4 py-[7px] text-[13px] font-semibold
            bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Assign Homework
        </button>
      </div>
    </>
  );
}