import { Funnel } from 'lucide-react';

const TeachersFilters = ({
  statusFilter,
  setStatusFilter,
  classFilter,
  setClassFilter,
  salaryFilter,
  setSalaryFilter,
  setPage
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        
        {/* FILTERS LABEL */}
        <div className="flex items-center gap-2 shrink-0">
          <Funnel className="w-5 h-5 text-gray-500" />
          <p className="text-base sm:text-lg font-medium">Filters:</p>
        </div>

        {/* FILTER DROPDOWNS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>

          {/* Class Filter */}
          <select
            value={classFilter}
            onChange={(e) => {
              setClassFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Classes</option>
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
              setPage(1); // Reset to first page when filter changes
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option>All Salary Types</option>
            <option>Monthly</option>
            <option>Per Day</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TeachersFilters;