import { Search, RefreshCcw } from "lucide-react";
import { LEAD_STATUS_LABELS, LEAD_STATUS_OPTIONS } from "../../Constants/StringConstants/LeadsConstants.js";

const LeadsFilterBar = ({ search, onSearchChange, status, onStatusChange, onRefresh, refreshing }) => {
    return (
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => onSearchChange(e.target.value)}
                    placeholder="Search by name, school or phone..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                    <option value="">All Status</option>
                    {LEAD_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                            {LEAD_STATUS_LABELS[s]}
                        </option>
                    ))}
                </select>

                <button
                    type="button"
                    onClick={onRefresh}
                    disabled={refreshing}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-60"
                >
                    <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>
        </div>
    );
};

export default LeadsFilterBar;