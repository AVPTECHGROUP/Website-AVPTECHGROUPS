import { Funnel, SearchIcon } from 'lucide-react';

const TeachersFilters = ({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  classFilter,
  setClassFilter,
  salaryFilter,
  setSalaryFilter,
  setPage
}) => {
  return (
    <div className="bg-white grid lg:grid-cols-3 gap-2 px-4 py-2 rounded-xl border border-gray-200 mb-4">
      
      <div className="flex col-span-2 items-center gap-2 border rounded-lg border-gray-200 bg-gray-100 px-2 py-1 focus-within:shadow-sm focus-within:shadow-blue-200">
        <SearchIcon className="w-5 h-5 text-gray-500" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name, employee code or contact..."
          className="text-base sm:text-sm font-normal focus:outline-none appearance-none text-gray-600 w-full bg-transparent"
        />
      </div>

      {/* FILTER DROPDOWNS - Takes 1 column on large screens */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
        >
          <option value="All Status">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        {/* Class Filter */}
        <select
          value={classFilter}
          onChange={(e) => {
            setClassFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
        >
          <option value="All Classes">All Classes</option>
          <option value="Class-5">Class-5</option>
          <option value="Class-6">Class-6</option>
          <option value="Class-7">Class-7</option>
          <option value="Class-8">Class-8</option>
          <option value="Class-9">Class-9</option>
          <option value="Class-10">Class-10</option>
          <option value="Class-11">Class-11</option>
          <option value="Class-12">Class-12</option>
        </select>

        {/* Salary Type Filter */}
        <select
          value={salaryFilter}
          onChange={(e) => {
            setSalaryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 bg-gray-100 rounded-lg focus:outline-none focus:shadow-sm focus:shadow-blue-200 text-sm"
        >
          <option value="All Salary Types">All Salary</option>
          <option value="Monthly">Monthly</option>
          <option value="Per Day">Per Day</option>
        </select>
      </div>
    </div>
  );
};

export default TeachersFilters;