import React from "react";

/* Tailwind color tokens standing in for the mockup's navy/g-scale palette.
   Swap these for your theme's actual classes if you have design tokens set up. */

export const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

export function formatCurrency(value) {
    const n = Number(value ?? 0);
    return `₹${n.toLocaleString("en-IN")}`;
}

/**
 * TEMP GUARD — normalizes whatever shape a list endpoint returns into
 * { items: Array, total: number, totalPages: number }. Handles a bare array,
 * { items, total }, { data, totalElements, totalPages }, and Spring's default
 * { content, totalElements, totalPages }. Falls back to an empty list rather
 * than throwing, so a shape mismatch degrades to "no records" instead of a
 * white screen.
 *
 * This exists because Payrollservice.jsx's actual return shape hasn't been
 * confirmed yet. Once it is, every getPayroll()/getAllSalaryStructures()/etc.
 * caller should read the real field directly and this helper should go away.
 */
export function normalizeList(res) {
    if (Array.isArray(res)) return { items: res, total: res.length, totalPages: 1 };
    if (Array.isArray(res?.items)) return { items: res.items, total: res.total ?? res.items.length, totalPages: res.totalPages ?? 1 };
    if (Array.isArray(res?.data)) return { items: res.data, total: res.totalElements ?? res.data.length, totalPages: res.totalPages ?? 1 };
    if (Array.isArray(res?.content)) return { items: res.content, total: res.totalElements ?? res.content.length, totalPages: res.totalPages ?? 1 };
    return { items: [], total: 0, totalPages: 1 };
}

const ROLE_STYLES = {
    TEACHER: "bg-blue-50 text-blue-700",
    ADMIN: "bg-purple-50 text-purple-700",
    ACCOUNTANT: "bg-amber-50 text-amber-800",
    PRINCIPAL: "bg-emerald-50 text-emerald-700",
};

export function RoleBadge({ role }) {
    const cls = ROLE_STYLES[String(role).toUpperCase()] || "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${cls}`}>
      {role}
    </span>
    );
}

const STATUS_STYLES = {
    DRAFT: "bg-slate-100 text-slate-600",
    APPROVED: "bg-blue-100 text-blue-700",
    PAID: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ status }) {
    const cls = STATUS_STYLES[String(status).toUpperCase()] || "bg-slate-100 text-slate-600";
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${cls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {status}
    </span>
    );
}

export function ManagedByBadge({ managedBy }) {
    const isBulkOrTeacher = managedBy === "TEACHER_MODULE";
    const cls = isBulkOrTeacher ? "bg-violet-50 text-violet-700" : "bg-blue-50 text-blue-700";
    return (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold whitespace-nowrap ${cls}`}>
      {managedBy === "TEACHER_MODULE" ? "Teacher module" : "Payroll module"}
    </span>
    );
}

export function StatCard({ icon, label, value, sub, tone = "slate" }) {
    const iconTones = {
        slate: "bg-slate-100",
        blue: "bg-blue-50",
        green: "bg-emerald-50",
        yellow: "bg-amber-50",
        red: "bg-red-50",
    };
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg mb-3 ${iconTones[tone] || iconTones.slate}`}>
                {icon}
            </div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">{value}</div>
            {sub && <div className="text-[11px] text-slate-400 mt-1.5">{sub}</div>}
        </div>
    );
}

export function Notice({ tone = "info", children, action }) {
    const tones = {
        info: "bg-blue-50 border-blue-100 text-blue-800",
        warn: "bg-amber-50 border-amber-100 text-amber-900",
        success: "bg-emerald-50 border-emerald-100 text-emerald-800",
    };
    return (
        <div className={`flex items-start gap-2.5 rounded-lg border px-4 py-3 text-[12.5px] mb-4 ${tones[tone]}`}>
            <div className="flex-1">{children}</div>
            {action}
        </div>
    );
}

export function Spinner({ label = "Loading…" }) {
    return (
        <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
            <span className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            {label}
        </div>
    );
}

export function ErrorBanner({ message, onRetry }) {
    if (!message) return null;
    return (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-[12.5px] mb-4">
            <span>⚠ {message}</span>
            {onRetry && (
                <button onClick={onRetry} className="text-red-700 font-semibold underline underline-offset-2 shrink-0">
                    Retry
                </button>
            )}
        </div>
    );
}

export function Pagination({ page, totalPages, onChange }) {
    if (totalPages <= 1) return null;
    const pages = Array.from({ length: totalPages }, (_, i) => i);
    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-xs text-slate-500">
            <span>Page {page + 1} of {totalPages}</span>
            <div className="flex gap-1">
                <button
                    disabled={page === 0}
                    onClick={() => onChange(page - 1)}
                    className="w-7 h-7 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                    ‹
                </button>
                {pages.slice(Math.max(0, page - 2), page + 3).map((p) => (
                    <button
                        key={p}
                        onClick={() => onChange(p)}
                        className={`w-7 h-7 rounded border text-xs font-semibold ${
                            p === page ? "bg-slate-900 text-white border-slate-900" : "border-slate-200 hover:bg-slate-50"
                        }`}
                    >
                        {p + 1}
                    </button>
                ))}
                <button
                    disabled={page >= totalPages - 1}
                    onClick={() => onChange(page + 1)}
                    className="w-7 h-7 rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
                >
                    ›
                </button>
            </div>
        </div>
    );
}