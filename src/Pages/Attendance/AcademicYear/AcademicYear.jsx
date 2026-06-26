import React, { useEffect, useState, useCallback } from "react";
import { Plus, GraduationCap, RefreshCw, AlertTriangle, X } from "lucide-react";
import {
    getAcademicYears,
    setCurrentAcademicYear,
    closeAcademicYear,
} from "../../../Api/AcademicYears/AcademicYear";
import NewAcademicYear from "./NewAcademicYear";

// ─── Action Dropdown Component ──────────────────────────────────────────────
const ActionDropDown = ({ year, onSetCurrent, onClose }) => {
    const isCurrent = year.isCurrent;
    const isClosed = year.status === "CLOSED";

    if (isClosed) return <span className="text-gray-300">—</span>;

    return (
        <div className="flex items-center justify-end gap-2">
            {!isCurrent && (
                <button
                    onClick={() => onSetCurrent(year)}
                    className="px-3 py-1.5 text-xs font-semibold text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                    Set Current
                </button>
            )}
            <button
                onClick={() => onClose(year)}
                className="px-3 py-1.5 text-xs font-semibold text-red-600 border border-red-400 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap"
            >
                Close
            </button>
        </div>
    );
};

// ─── Confirm Close Modal ────────────────────────────────────────────────────
const ConfirmCloseModal = ({ year, onConfirm, onCancel, loading }) => {
    if (!year) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />
            <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                <div className="px-6 pt-6 pb-2 flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                        <AlertTriangle size={18} className="text-red-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-gray-900">
                            Close Academic Year?
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Are you sure you want to close{" "}
                            <span className="font-medium text-gray-800">{year.label}</span>?
                            This action cannot be undone.
                        </p>
                    </div>
                    <button
                        onClick={onCancel}
                        className="ml-auto p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="px-6 pb-6 pt-4 flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                        No, Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Closing...
                            </>
                        ) : (
                            "Yes, Close"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
    const styles =
        status === "ACTIVE"
            ? "bg-green-100 text-green-700 border border-green-200"
            : "bg-gray-100 text-gray-500 border border-gray-200";
    return (
        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${styles}`}>
            {status}
        </span>
    );
};

// ─── Current Badge ───────────────────────────────────────────────────────────
const CurrentBadge = ({ isCurrent }) => {
    if (!isCurrent) return <span className="text-gray-400 text-sm">—</span>;
    return (
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
            YES
        </span>
    );
};

// ─── Skeleton Row ────────────────────────────────────────────────────────────
const SkeletonRow = () => (
    <tr className="border-b border-gray-100">
        {[...Array(6)].map((_, i) => (
            <td key={i} className="px-4 py-4">
                <div className="h-4 bg-gray-200 rounded-md animate-pulse w-3/4" />
            </td>
        ))}
    </tr>
);

// ─── Mobile Card ─────────────────────────────────────────────────────────────
const MobileCard = ({ year, onSetCurrent, onClose }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2 mb-3">
            <div>
                <span className="text-base font-bold text-gray-900">{year.label}</span>
                {year.isCurrent && (
                    <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
                        CURRENT
                    </span>
                )}
            </div>
            <StatusBadge status={year.status} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-4">
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    Start Date
                </p>
                <p className="font-medium text-gray-800">{year.startDate}</p>
            </div>
            <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
                    End Date
                </p>
                <p className="font-medium text-gray-800">{year.endDate}</p>
            </div>
        </div>
        {year.status !== "CLOSED" && (
            <div className="flex gap-2 pt-2 border-t border-gray-100">
                {!year.isCurrent && (
                    <button
                        onClick={() => onSetCurrent(year)}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-blue-600 border border-blue-500 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                        Set Current
                    </button>
                )}
                <button
                    onClick={() => onClose(year)}
                    className="flex-1 px-3 py-2 text-xs font-semibold text-red-600 border border-red-400 rounded-lg hover:bg-red-50 transition-colors"
                >
                    Close
                </button>
            </div>
        )}
    </div>
);

// ─── Main Component ──────────────────────────────────────────────────────────
const ROWS_OPTIONS = [5, 10, 20];

const AcademicYear = () => {
    const [years, setYears] = useState([]); // Initialized as array
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAdd, setShowAdd] = useState(false);
    const [closeTarget, setCloseTarget] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [toast, setToast] = useState(null);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchYears = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const response = await getAcademicYears();
            // Ensure we handle response structure safely
            setYears(response || []);
        } catch (err) {
            setError("Failed to load academic years. Please try again.");
            setYears([]); // Reset on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchYears();
    }, [fetchYears]);

    const handleSetCurrent = async (year) => {
        try {
            setActionLoading(true);
            await setCurrentAcademicYear(year.id);
            showToast(`${year.label} set as current year.`);
            fetchYears();
        } catch (err) {
            showToast(err.message || "Failed to set current year.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    const handleClose = (year) => setCloseTarget(year);

    const handleConfirmClose = async () => {
        try {
            setActionLoading(true);
            await closeAcademicYear(closeTarget.id);
            showToast(`${closeTarget.label} has been closed.`);
            setCloseTarget(null);
            fetchYears();
        } catch (err) {
            showToast(err.message || "Failed to close academic year.", "error");
        } finally {
            setActionLoading(false);
        }
    };

    // Pagination logic with safety defaults
    const safeYears = years || [];
    const totalPages = Math.max(1, Math.ceil(safeYears.length / rowsPerPage));
    const paginated = safeYears.slice((page - 1) * rowsPerPage, page * rowsPerPage);

    const handleRowsChange = (e) => {
        setRowsPerPage(Number(e.target.value));
        setPage(1);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            {/* Toast */}
            {toast && (
                <div
                    className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${toast.type === "error"
                        ? "bg-red-600 text-white"
                        : "bg-green-600 text-white"
                        }`}
                >
                    {toast.msg}
                </div>
            )}

            {/* Modals */}
            <NewAcademicYear
                isOpen={showAdd}
                onClose={() => setShowAdd(false)}
                onSuccess={() => {
                    showToast("Academic year created successfully!");
                    fetchYears();
                }}
            />
            <ConfirmCloseModal
                year={closeTarget}
                onConfirm={handleConfirmClose}
                onCancel={() => setCloseTarget(null)}
                loading={actionLoading}
            />

            <div className="max-w-6xl mx-auto">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                            <GraduationCap size={20} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                                Manage Academic Years
                            </h1>
                            <p className="text-sm text-gray-500">
                                {safeYears?.length || 0} year{safeYears?.length !== 1 ? "s" : ""} configured
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={fetchYears}
                            disabled={loading}
                            className="p-2.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            title="Refresh"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                        </button>
                        <button
                            onClick={() => setShowAdd(true)}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors"
                        >
                            <Plus size={16} />
                            <span>Add Academic Year</span>
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertTriangle size={16} />
                        {error}
                        <button
                            onClick={fetchYears}
                            className="ml-auto text-red-600 hover:text-red-800 font-medium underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Desktop Table */}
                <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    {["Label", "Start Date", "End Date", "Status", "Current", "Actions"].map(
                                        (col) => (
                                            <th
                                                key={col}
                                                className={`px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500 ${col === "Actions" ? "text-right" : "text-left"
                                                    }`}
                                            >
                                                {col}
                                            </th>
                                        )
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    [...Array(4)].map((_, i) => <SkeletonRow key={i} />)
                                ) : paginated.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="py-16 text-center text-gray-400 text-sm"
                                        >
                                            <GraduationCap
                                                size={36}
                                                className="mx-auto mb-2 text-gray-300"
                                            />
                                            No academic years found.
                                        </td>
                                    </tr>
                                ) : (
                                    paginated.map((year) => (
                                        <tr
                                            key={year.id}
                                            className="border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                                        >
                                            <td className="px-5 py-4 font-semibold text-gray-900 text-sm">
                                                {year.label}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {year.startDate}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {year.endDate}
                                            </td>
                                            <td className="px-5 py-4">
                                                <StatusBadge status={year.status} />
                                            </td>
                                            <td className="px-5 py-4">
                                                <CurrentBadge isCurrent={year.isCurrent} />
                                            </td>
                                            <td className="px-5 py-4 text-right">
                                                <ActionDropDown
                                                    year={year}
                                                    onSetCurrent={handleSetCurrent}
                                                    onClose={handleClose}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {!loading && years.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
                            <p className="text-sm text-gray-600">
                                Showing{" "}
                                <span className="font-semibold">
                                    {(page - 1) * rowsPerPage + 1}
                                </span>{" "}
                                to{" "}
                                <span className="font-semibold">
                                    {Math.min(page * rowsPerPage, years.length)}
                                </span>{" "}
                                of <span className="font-semibold">{years.length}</span> records
                            </p>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <span>Rows per page:</span>
                                    <select
                                        value={rowsPerPage}
                                        onChange={handleRowsChange}
                                        className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {ROWS_OPTIONS.map((n) => (
                                            <option key={n} value={n}>
                                                {n}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        ‹
                                    </button>
                                    {[...Array(totalPages)].map((_, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setPage(i + 1)}
                                            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === i + 1
                                                ? "bg-blue-600 text-white"
                                                : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                                                }`}
                                        >
                                            {i + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
                                    >
                                        ›
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-3">
                    {loading ? (
                        [...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-white border border-gray-200 rounded-xl p-4 animate-pulse"
                            >
                                <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                    <div className="h-4 bg-gray-200 rounded w-2/3" />
                                </div>
                            </div>
                        ))
                    ) : paginated.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center text-gray-400 text-sm">
                            <GraduationCap size={36} className="mx-auto mb-2 text-gray-300" />
                            No academic years found.
                        </div>
                    ) : (
                        paginated.map((year) => (
                            <MobileCard
                                key={year.id}
                                year={year}
                                onSetCurrent={handleSetCurrent}
                                onClose={handleClose}
                            />
                        ))
                    )}

                    {/* Mobile Pagination */}
                    {!loading && years.length > 0 && (
                        <div className="flex items-center justify-between pt-2">
                            <p className="text-xs text-gray-500">
                                {(page - 1) * rowsPerPage + 1}–
                                {Math.min(page * rowsPerPage, years.length)} of {years.length}
                            </p>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 text-sm"
                                >
                                    ‹
                                </button>
                                <span className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg">
                                    {page}
                                </span>
                                <button
                                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 disabled:opacity-40 text-sm"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AcademicYear;