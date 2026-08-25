import React, { useEffect, useState, useCallback } from "react";
import { CalendarClock, RefreshCcw, ServerCrash, CalendarX2 } from "lucide-react";
import { toast } from "react-toastify";
import { getUsersLeaveBalance } from "../../Api/Leaves/LeavesManagementAPI.js";

// Maps the API's actual leaveBalances[] entry shape into what the table
// renders. Confirmed live shape:
// { leaveType, leaveName, annualLimit, daysUsed, daysAvailable,
//   carryForwardAllowed, maxCarryForwardDays }
const normalizeBalanceEntry = (entry) => {
    const leaveType = entry.leaveType || "UNKNOWN";
    const leaveName = entry.leaveName || entry.leaveType || "Unknown";
    const allocated = Number(entry.annualLimit ?? 0);
    const used = Number(entry.daysUsed ?? 0);
    const remaining = entry.daysAvailable !== undefined && entry.daysAvailable !== null
        ? Number(entry.daysAvailable)
        : Math.max(0, allocated - used);
    const carryForwardAllowed = !!entry.carryForwardAllowed;
    const maxCarryForwardDays = Number(entry.maxCarryForwardDays ?? 0);

    return { leaveType, leaveName, allocated, used, remaining, carryForwardAllowed, maxCarryForwardDays };
};

// Works for ANY selected person — teacher or staff/user — as long as a
// valid userId is passed in. This component has no role-specific logic;
// it purely renders whatever getUsersLeaveBalance(userId) returns for
// whichever row was clicked in either the Teachers list or the
// Staff/Users list in AdminPayrollView.
const UserLeaveBalanceView = ({ userId, userName }) => {
    const [balances, setBalances] = useState([]);
    const [year, setYear] = useState(null);
    const [totalUsed, setTotalUsed] = useState(0);
    const [totalAvailable, setTotalAvailable] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadBalance = useCallback(async () => {
        if (!userId) return;
        try {
            setLoading(true);
            setError(null);
            const res = await getUsersLeaveBalance(userId);

            // The API nests the array under data.leaveBalances — NOT
            // directly under data, and NOT at the top level. Handle that
            // shape explicitly, with fallbacks kept only as a safety net
            // in case a different endpoint/version ever returns a bare array.
            const payload = res?.data ?? res ?? {};
            const raw = Array.isArray(payload.leaveBalances)
                ? payload.leaveBalances
                : Array.isArray(payload)
                    ? payload
                    : [];

            setBalances(raw.map(normalizeBalanceEntry));
            setYear(payload.year ?? null);
            setTotalUsed(
                payload.totalDaysUsed !== undefined
                    ? Number(payload.totalDaysUsed)
                    : raw.reduce((sum, e) => sum + Number(e.daysUsed ?? 0), 0)
            );
            setTotalAvailable(
                payload.totalDaysAvailable !== undefined
                    ? Number(payload.totalDaysAvailable)
                    : raw.reduce((sum, e) => sum + Number(e.daysAvailable ?? 0), 0)
            );
        } catch (err) {
            const msg = err.message || "Failed to load leave balance";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadBalance();
    }, [loadBalance]);

    const totalAllocated = balances.reduce((sum, b) => sum + b.allocated, 0);

    if (!userId) {
        return (
            <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <CalendarX2 className="w-8 h-8 mb-2" />
                <p className="text-sm">Select a teacher or staff member to view leave balance</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-indigo-100 rounded-lg flex items-center justify-center shrink-0">
                        <CalendarClock className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                    </div>
                    <div>
                        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Leave Balance</h2>
                        <p className="text-xs sm:text-sm text-gray-500">
                            {userName ? `Breakdown for ${userName}` : "Per leave-type breakdown for the selected user"}
                            {year ? ` · ${year}` : ""}
                        </p>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={loadBalance}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-60"
                >
                    <RefreshCcw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh
                </button>
            </div>

            {loading ? (
                <p className="text-sm text-gray-400 text-center py-10">Loading leave balance…</p>
            ) : error ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-red-50 border border-red-200 text-red-600 rounded-xl px-4 py-4 text-sm">
                    <ServerCrash size={18} className="shrink-0" />
                    <div className="flex-1 min-w-0">
                        <p className="font-semibold">Failed to load leave balance</p>
                        <p className="text-xs mt-0.5 break-words">{error}</p>
                    </div>
                    <button
                        onClick={loadBalance}
                        className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 transition-colors whitespace-nowrap"
                    >
                        Retry
                    </button>
                </div>
            ) : balances.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10 border border-dashed border-gray-200 rounded-lg">
                    No leave balance records found for this user.
                </p>
            ) : (
                <>
                    {/* Summary cards */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Total Allocated</p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{totalAllocated}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Used</p>
                            <p className="text-xl sm:text-2xl font-bold text-orange-500 mt-1">{totalUsed}</p>
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4">
                            <p className="text-[11px] uppercase tracking-wide text-gray-500 font-medium">Available</p>
                            <p className="text-xl sm:text-2xl font-bold text-emerald-600 mt-1">{totalAvailable}</p>
                        </div>
                    </div>

                    {/* Per-type breakdown */}
                    <div className="overflow-x-auto -mx-4 sm:mx-0">
                        <table className="w-full min-w-[560px] text-xs sm:text-sm">
                            <thead>
                            <tr className="text-left text-gray-500 uppercase text-[11px] tracking-wide border-b border-gray-200">
                                <th className="py-2.5 px-4 sm:px-2 font-medium">Leave Type</th>
                                <th className="py-2.5 px-4 sm:px-2 font-medium">Annual Limit</th>
                                <th className="py-2.5 px-4 sm:px-2 font-medium">Used</th>
                                <th className="py-2.5 px-4 sm:px-2 font-medium">Available</th>
                                <th className="py-2.5 px-4 sm:px-2 font-medium">Carry Forward</th>
                            </tr>
                            </thead>
                            <tbody>
                            {balances.map((b, idx) => (
                                <tr key={`${b.leaveType}-${idx}`} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="py-3 px-4 sm:px-2 font-medium text-gray-900">{b.leaveName}</td>
                                    <td className="py-3 px-4 sm:px-2 text-gray-700">{b.allocated}</td>
                                    <td className="py-3 px-4 sm:px-2 text-gray-700">{b.used}</td>
                                    <td className="py-3 px-4 sm:px-2">
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                                                    b.remaining > 0
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-gray-100 text-gray-500 border-gray-200"
                                                }`}
                                            >
                                                {b.remaining}
                                            </span>
                                    </td>
                                    <td className="py-3 px-4 sm:px-2 text-gray-500 text-xs">
                                        {b.carryForwardAllowed ? `Up to ${b.maxCarryForwardDays} days` : "—"}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default UserLeaveBalanceView;