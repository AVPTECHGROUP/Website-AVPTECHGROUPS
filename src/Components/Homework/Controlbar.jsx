import { ChevronDown, Search, RotateCcw, Plus, Filter, CheckCheck } from "lucide-react";

function FilterSelect({ value, onChange, loading = false, disabled = false, className = "", children }) {
  return (
    <div className={`relative ${className} min-w-0 shrink-0`}>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={loading || disabled}
        className="appearance-none w-full border border-gray-200 rounded-lg py-1.5 pl-2.5 pr-7 text-xs text-slate-700
          bg-white outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 cursor-pointer
          disabled:opacity-60 disabled:cursor-not-allowed truncate"
      >
        {children}
      </select>
      <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
    </div>
  );
}

function DateInput({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-1 min-w-0">
      <span className="text-[11px] font-medium text-slate-400 select-none whitespace-nowrap">{label}</span>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-0 p-0 text-xs text-slate-700 bg-transparent outline-none cursor-pointer w-[100px]"
      />
    </div>
  );
}

export default function ControlBar({
  classes = [],
  sections = [],
  subjects = [],
  subjectsLoading = false,
  selectedClassId, setSelectedClassId,
  selectedSectionId, setSelectedSectionId,
  subjectFilter, setSubjectFilter,
  statusFilter, setStatusFilter,
  dateFrom, setDateFrom,
  dateTo, setDateTo,
  search, setSearch,
  onReset, onApply, onAssign,
}) {
  const noSection = !selectedSectionId;

  return (
    <div className="w-full bg-white shrink-0 min-w-0 flex flex-col">

      {/* Header */}
      <div className="flex items-center px-4 py-2 border-b border-gray-100 bg-slate-50/40">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 select-none">
          <Filter size={12} className="text-slate-400 stroke-[2.5]" />
          <span>Filters</span>
        </div>
      </div>

      {/* All controls in one flex-wrap row */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 p-3 min-w-0">

        {/* Class */}
        <FilterSelect value={selectedClassId} onChange={setSelectedClassId} className="w-full sm:w-[120px]">
          <option value="">Select class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
        </FilterSelect>

        {/* Section */}
        <FilterSelect value={selectedSectionId} onChange={setSelectedSectionId} disabled={!selectedClassId} className="w-full sm:w-[100px]">
          <option value="">Section</option>
          {sections.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </FilterSelect>

        {/* Subject */}
        <FilterSelect value={subjectFilter} onChange={setSubjectFilter} loading={subjectsLoading} disabled={noSection} className="w-full sm:w-[120px]">
          <option value="">All Subjects</option>
          {subjects.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
        </FilterSelect>

        {/* Status */}
        <FilterSelect value={statusFilter} onChange={setStatusFilter} className="w-full sm:w-[105px]">
          <option value="">All Status</option>
          <option value="PUBLISHED">Published</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </FilterSelect>

        {/* Date range */}
        <div className="flex flex-row items-center gap-1.5 border border-gray-200 rounded-lg px-2 py-1 bg-white shrink-0 w-full sm:w-auto">
          <DateInput label="From" value={dateFrom} onChange={setDateFrom} />
          <span className="text-gray-200 font-light select-none">|</span>
          <DateInput label="To" value={dateTo} onChange={setDateTo} />
        </div>

        {/* Search */}
        <div className="relative w-full sm:flex-1 sm:min-w-[140px] sm:max-w-[240px]">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search homework title..."
            className="w-full pl-7 pr-2.5 py-1.5 text-xs border border-gray-200 rounded-lg bg-white
              outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100 truncate"
          />
        </div>

        {/* Apply */}
        <button
          onClick={onApply}
          disabled={noSection}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 shrink-0
            px-3 py-1.5 text-xs font-semibold
            border border-green-600 rounded-lg text-green-700 bg-green-50
            hover:bg-green-100 active:scale-95 transition-all cursor-pointer
            touch-manipulation disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap"
        >
          <CheckCheck size={12} />
          <span>Apply</span>
        </button>

        {/* Clear Filters */}
        <button
          onClick={onReset}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 shrink-0
            px-3 py-1.5 text-xs font-semibold
            border border-gray-300 rounded-lg text-gray-600 bg-white
            hover:bg-gray-50 active:scale-95 transition-all cursor-pointer
            touch-manipulation select-none whitespace-nowrap"
        >
          <RotateCcw size={12} />
          <span>Clear</span>
        </button>

        {/* Assign Homework */}
        <button
          onClick={onAssign}
          disabled={noSection}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1 shrink-0
            px-3.5 py-1.5 text-xs font-semibold
            bg-blue-700 hover:bg-blue-800 text-white rounded-lg
            active:scale-95 transition-all cursor-pointer touch-manipulation
            disabled:opacity-40 disabled:cursor-not-allowed select-none whitespace-nowrap"
        >
          <Plus size={12} />
          <span>Assign Homework</span>
        </button>

      </div>
    </div>
  );
}