import { SearchIcon } from 'lucide-react';

const TeachersFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  classFilter,
  setClassFilter,
  salaryFilter,
  setSalaryFilter,
  setPage,
  classes = []
}) => {

  const classOptions = [
    { label: 'All Classes', value: 'All Classes' },
    ...classes.map((c) => ({
      label: c.name,
      value: c.id,
    })),
  ];

  return (
    <div className="
        bg-white
        grid
        grid-cols-1
        md:grid-cols-2
        lg:grid-cols-5
        gap-3
        px-4
        py-3
        rounded-xl
        border
        border-gray-200
        mb-4
    ">

      <div className="
    lg:col-span-2
    flex
    items-center
    gap-2
    border
    rounded-lg
    border-gray-200
    bg-gray-100
    px-3
    py-2
    min-w-0 ">

        <SearchIcon className="w-5 h-5 text-gray-500 shrink-0" />

        <input
          name="teacher-search-filter"
          autoComplete="one-time-code"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, employee code or contact..."
          className="
        w-full
        min-w-0
        text-sm
        focus:outline-none
        bg-transparent
        text-gray-600"/>
      </div>


      {/* Status */}
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value);
          setPage(1);
        }}
        className="
          px-3
          py-2
          border
          border-gray-200
          bg-gray-100
          rounded-lg
          text-sm
          focus:outline-none
        "
      >
        <option value="All Status">All Status</option>
        <option value="Active">Active</option>
        <option value="Inactive">Inactive</option>
      </select>


      {/* Class */}
      <select
        value={classFilter}
        onChange={(e) => {
          setClassFilter(e.target.value);
          setPage(1);
        }}
        className="
          px-3
          py-2
          border
          border-gray-200
          bg-gray-100
          rounded-lg
          text-sm
          focus:outline-none
        "
      >
        {classOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>


      {/* Salary */}
      <select
        value={salaryFilter}
        onChange={(e) => {
          setSalaryFilter(e.target.value);
          setPage(1);
        }}
        className="
          px-3
          py-2
          border
          border-gray-200
          bg-gray-100
          rounded-lg
          text-sm
          focus:outline-none
        "
      >
        <option value="All Salary Types">All Salary</option>
        <option value="Monthly">Monthly</option>
        <option value="Per Day">Per Day</option>
      </select>


    </div>
  );
};

export default TeachersFilters;