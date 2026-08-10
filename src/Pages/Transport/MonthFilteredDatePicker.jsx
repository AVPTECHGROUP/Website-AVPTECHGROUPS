import { useState, useRef, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X as XIcon } from "lucide-react";
import { TRANSPORT_FEE_MONTHS } from "../../Constants/StringConstants/TransportConstants";

// ─── Date helpers (local-time safe — avoids the UTC/`new Date(str)` off-by-one-day bug) ───
const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const pad2 = (n) => String(n).padStart(2, "0");
const toISO = (y, m, d) => `${y}-${pad2(m + 1)}-${pad2(d)}`;
const parseISO = (s) => {
    if (!s) return null;
    const parts = String(s).split("-").map(Number);
    const [y, m, d] = parts;
    if (!y || !m || !d) return null;
    return { y, m: m - 1, d };
};
const daysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
const firstWeekday = (y, m) => new Date(y, m, 1).getDay();

// TRANSPORT_FEE_MONTHS is authored January → December in order, so its array
// index (0-11) already lines up with the native JS Date month index. That's
// what lets this component translate between "JANUARY".."DECEMBER" values
// and calendar month positions without any hardcoded month mapping.
const monthValueAt = (idx) => TRANSPORT_FEE_MONTHS[idx]?.value;
const isMonthApplicable = (idx, applicableSet) => applicableSet.has(monthValueAt(idx));

/**
 * Steps from (year, monthIndex) in `direction` (+1 / -1) until it lands on a
 * month present in applicableSet, wrapping across year boundaries as needed.
 * This is the single routine behind Prev/Next navigation, the initial view
 * position, and the "snap away from a month that just got unchecked" logic —
 * so unavailable months are structurally unreachable everywhere, not just
 * hidden by a disabled state.
 */
function findApplicableMonth(year, monthIndex, direction, applicableSet, includeStart = false) {
    if (!applicableSet.size) return null;
    let y = year;
    let m = monthIndex;
    if (!includeStart) {
        m += direction;
        if (m > 11) { m = 0; y += 1; }
        if (m < 0) { m = 11; y -= 1; }
    }
    const SAFETY_BOUND = 12 * 5; // 5 years — plenty, and guards against an infinite loop
    for (let i = 0; i < SAFETY_BOUND; i++) {
        if (isMonthApplicable(m, applicableSet)) return { year: y, monthIndex: m };
        m += direction;
        if (m > 11) { m = 0; y += 1; }
        if (m < 0) { m = 11; y -= 1; }
    }
    return null;
}

/**
 * Calendar / date-picker whose displayable & navigable months are driven
 * entirely by `applicableMonths` (the checked Transport Fee Months list).
 * An unchecked month never renders — not as a disabled state, not as a
 * visible-but-blocked option — it is simply absent from navigation,
 * the month dropdown, and the day grid.
 *
 * onChange receives the plain "YYYY-MM-DD" string (or "" for cleared),
 * matching the format the rest of the form already stores/sends.
 */
export default function MonthFilteredDatePicker({
    value,
    onChange,
    applicableMonths = [],
    minDate,
    placeholder = "Select date",
    hasError = false,
    disabled = false,
    clearable = false,
}) {
    const applicableSet = useMemo(() => new Set(applicableMonths), [applicableMonths]);
    const parsedValue = parseISO(value);
    const parsedMin = parseISO(minDate);

    const initialView = useMemo(() => {
        if (parsedValue && isMonthApplicable(parsedValue.m, applicableSet)) {
            return { year: parsedValue.y, monthIndex: parsedValue.m };
        }
        const seedYear = parsedValue?.y ?? new Date().getFullYear();
        const seedMonth = parsedValue?.m ?? new Date().getMonth();
        return (
            findApplicableMonth(seedYear, seedMonth, 1, applicableSet, true) ||
            { year: seedYear, monthIndex: seedMonth }
        );
        // Only computed once on mount — subsequent moves go through goPrev/goNext/
        // selectMonth/selectYear or the auto-snap effect below.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const [open, setOpen] = useState(false);
    const [viewYear, setViewYear] = useState(initialView.year);
    const [viewMonthIndex, setViewMonthIndex] = useState(initialView.monthIndex);
    const containerRef = useRef(null);
    const isFirstApplicableRun = useRef(true);

    useEffect(() => {
        const handler = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // If the currently VIEWED month stops being applicable (e.g. the user just
    // unchecked the month the calendar happens to be open on), immediately
    // snap the view to the nearest still-applicable month — preferring the
    // next one, falling back to the previous one. This is what guarantees the
    // user is never left looking at an unavailable month.
    useEffect(() => {
        if (!applicableSet.size) return;
        if (isMonthApplicable(viewMonthIndex, applicableSet)) return;
        const next =
            findApplicableMonth(viewYear, viewMonthIndex, 1, applicableSet, true) ||
            findApplicableMonth(viewYear, viewMonthIndex, -1, applicableSet, true);
        if (next) {
            setViewYear(next.year);
            setViewMonthIndex(next.monthIndex);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicableMonths]);

    // If the SELECTED value's month stops being applicable, the value itself
    // is no longer valid — clear it rather than silently keeping an invalid
    // date around. Skipped on first mount so loading existing edit data never
    // gets wiped by this effect's own initial run.
    useEffect(() => {
        if (isFirstApplicableRun.current) { isFirstApplicableRun.current = false; return; }
        if (!value) return;
        const pv = parseISO(value);
        if (pv && !isMonthApplicable(pv.m, applicableSet)) {
            onChange("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [applicableMonths]);

    const goPrev = () => {
        const found = findApplicableMonth(viewYear, viewMonthIndex, -1, applicableSet);
        if (found) { setViewYear(found.year); setViewMonthIndex(found.monthIndex); }
    };
    const goNext = () => {
        const found = findApplicableMonth(viewYear, viewMonthIndex, 1, applicableSet);
        if (found) { setViewYear(found.year); setViewMonthIndex(found.monthIndex); }
    };

    // Direct month selection — the dropdown's option list itself only ever
    // contains applicable months, so an unavailable month cannot be chosen
    // this way either.
    const monthOptions = TRANSPORT_FEE_MONTHS
        .map((m, idx) => ({ ...m, idx }))
        .filter((m) => applicableSet.has(m.value));

    const yearOptions = useMemo(() => {
        const base = (parsedMin?.y ?? new Date().getFullYear()) - 1;
        return Array.from({ length: 8 }, (_, i) => base + i);
    }, [parsedMin]);

    const selectMonth = (idx) => {
        if (!isMonthApplicable(idx, applicableSet)) return; // guard — mirrors the option filtering above
        setViewMonthIndex(idx);
    };

    const isDateDisabled = (y, m, d) => {
        if (!isMonthApplicable(m, applicableSet)) return true; // safety net; grid never renders such a month anyway
        if (parsedMin) {
            const cur = new Date(y, m, d).setHours(0, 0, 0, 0);
            const min = new Date(parsedMin.y, parsedMin.m, parsedMin.d).setHours(0, 0, 0, 0);
            if (cur < min) return true;
        }
        return false;
    };

    const pickDay = (d) => {
        if (isDateDisabled(viewYear, viewMonthIndex, d)) return;
        onChange(toISO(viewYear, viewMonthIndex, d));
        setOpen(false);
    };

    const label = parsedValue
        ? new Date(parsedValue.y, parsedValue.m, parsedValue.d).toLocaleDateString("en-GB", {
            day: "2-digit", month: "short", year: "numeric",
        })
        : "";

    const noneApplicable = applicableSet.size === 0;
    const disabledUi = disabled || noneApplicable;

    const totalDays = daysInMonth(viewYear, viewMonthIndex);
    const leadingBlanks = firstWeekday(viewYear, viewMonthIndex);
    const cells = [
        ...Array.from({ length: leadingBlanks }, () => null),
        ...Array.from({ length: totalDays }, (_, i) => i + 1),
    ];

    return (
        <div ref={containerRef} className="relative">
            <button
                type="button"
                onClick={() => !disabledUi && setOpen((o) => !o)}
                disabled={disabledUi}
                className={[
                    "w-full border rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 transition flex items-center justify-between gap-2 text-left",
                    hasError ? "border-red-400 focus:ring-red-200 focus:border-red-400" : "border-gray-200 focus:ring-blue-300 focus:border-blue-400",
                    disabledUi ? "opacity-50 cursor-not-allowed bg-gray-50" : "cursor-pointer",
                    open ? "ring-2 ring-blue-300 border-blue-400" : "",
                ].filter(Boolean).join(" ")}
            >
                <span className={`truncate flex-1 ${!label ? "text-gray-400" : "text-gray-700"}`}>
                    {noneApplicable ? "No applicable months selected" : (label || placeholder)}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                    {clearable && value && !disabledUi && (
                        <span
                            role="button"
                            tabIndex={-1}
                            onClick={(e) => { e.stopPropagation(); onChange(""); }}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <XIcon className="w-3.5 h-3.5" />
                        </span>
                    )}
                    <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                </div>
            </button>

            {open && !disabledUi && (
                <div className="absolute left-0 z-[9999] mt-1.5 bg-white border border-gray-200 rounded-xl shadow-xl p-3 w-72"
                    style={{ animation: "dropIn 0.14s ease-out forwards", transformOrigin: "top" }}>
                    <style>{`
            @keyframes dropIn {
              from { opacity:0; transform: translateY(-6px) scaleY(0.95); }
              to   { opacity:1; transform: translateY(0)    scaleY(1);    }
            }
          `}</style>

                    {/* Prev / Month & Year direct-select / Next — Prev & Next only ever
              land on applicable months (findApplicableMonth), and the Month
              dropdown's options are pre-filtered to applicable months only. */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                        <button type="button" onClick={goPrev}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-1">
                            <select
                                value={viewMonthIndex}
                                onChange={(e) => selectMonth(Number(e.target.value))}
                                className="text-xs font-semibold border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
                            >
                                {monthOptions.map((m) => (
                                    <option key={m.value} value={m.idx}>{m.label}</option>
                                ))}
                            </select>
                            <select
                                value={viewYear}
                                onChange={(e) => setViewYear(Number(e.target.value))}
                                className="text-xs font-semibold border border-gray-200 rounded-lg px-1.5 py-1 bg-white focus:outline-none focus:ring-1 focus:ring-blue-300 cursor-pointer"
                            >
                                {yearOptions.map((y) => (
                                    <option key={y} value={y}>{y}</option>
                                ))}
                            </select>
                        </div>

                        <button type="button" onClick={goNext}
                            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-1">
                        {WEEKDAY_LABELS.map((w) => (
                            <div key={w} className="text-[10px] font-semibold text-gray-400 text-center">{w}</div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((d, i) => {
                            if (d === null) return <div key={`b${i}`} />;
                            const isSelected = !!parsedValue
                                && parsedValue.y === viewYear
                                && parsedValue.m === viewMonthIndex
                                && parsedValue.d === d;
                            const isDis = isDateDisabled(viewYear, viewMonthIndex, d);
                            return (
                                <button
                                    key={d}
                                    type="button"
                                    disabled={isDis}
                                    onClick={() => pickDay(d)}
                                    className={[
                                        "h-7 text-xs rounded-lg transition-colors",
                                        isSelected ? "bg-blue-600 text-white font-semibold" : "text-gray-700 hover:bg-blue-50",
                                        isDis ? "opacity-30 cursor-not-allowed hover:bg-transparent" : "cursor-pointer",
                                    ].join(" ")}
                                >
                                    {d}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}