import { useState, useCallback, useEffect } from "react";
import {
    Camera, Users, ScanFace, PenLine, Download, BarChart2, List,
    ChevronDown, Search, CheckCircle2, Clock, XCircle, AlertTriangle,
    UserCheck, Trash2, ArrowLeft, ChevronLeft, ChevronRight,
    TrendingUp, BookOpen, Star, Loader2,
} from "lucide-react";
import UnmarkModal from "./UnmarkModel";
import ManualMarkModal from "./ManualMarkModel";
import { getClasses, getSectionsByClass } from "../../../Api/Teachers/TeachersAPI";
import {
    getAttendanceRoster,
    manualMarkAttendance,
    unmarkAttendance,
} from "../../../Api/Attendance/AttendanceApi";
import CardComponent from "../../../Components/CommonComp/CardComponent";
import IndividualFaceScanView from "./IndividualFaceScanView";
import GroupPhotoView from "./GroupPhotoView";

import {
    PAGES_PER_VIEW,
    STATUS_NOT_MARKED, STATUS_PRESENT, STATUS_LATE, STATUS_PRESENT_MANUAL,
    SOURCE_MAP, SOURCE_MANUAL_LABEL,
    DASH_PLACEHOLDER,
    STATUS_COLOR_MAP, CONFIDENCE_COLOR_MAP,
    CONFIDENCE_HIGH_THRESHOLD, CONFIDENCE_MEDIUM_THRESHOLD,
    AVATAR_INITIALS_COLORS, FILTER_OPTIONS, FILTER_ALL_STUDENTS, UI_STRINGS
} from "../../../Constants/StringConstants/AttendanceConstants";

const getInitials = (fullName = "") => {
    const parts = fullName.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "??";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const mapStatus = (apiStatus) => {
    if (!apiStatus) return STATUS_NOT_MARKED;
    const s = apiStatus.toUpperCase();
    if (s === "PRESENT") return STATUS_PRESENT;
    if (s === "LATE") return STATUS_LATE;
    if (s === "PRESENT_MANUAL" || s === "MANUAL") return STATUS_PRESENT_MANUAL;
        if (s === "ABSENT") return "Absent";
    return STATUS_NOT_MARKED;
};

const shapeRosterStudent = (st) => {
    const name = st.studentName || UI_STRINGS.COMMON.UNKNOWN;
    const confidence = st.confidenceScore ? Math.round(st.confidenceScore) : null;
    const source = st.status
        ? st.isManual ? SOURCE_MANUAL_LABEL : (SOURCE_MAP[st.attendanceSource] || st.attendanceSource || null)
        : null;
    return {
        id: st.studentId,
        name,
        initials: getInitials(name),
        rollNo: st.rollNumber || st.admissionNumber || DASH_PLACEHOLDER,
        status: mapStatus(st.status),
        checkIn: st.checkInTime ? st.checkInTime.slice(0, 5) : null,
        source,
        confidence,
        attendanceId: st.attendanceId || null,
        enrolled: true,
        remarks: st.remarks || "", // Added to bridge historical backend entries
    };
};

const statusColor = (s) => {
    if (!s || s === STATUS_NOT_MARKED) return STATUS_COLOR_MAP.NOT_MARKED;
    if (s.includes(STATUS_PRESENT_MANUAL)) return STATUS_COLOR_MAP.PRESENT_MANUAL;
    if (s.includes(STATUS_PRESENT)) return STATUS_COLOR_MAP.PRESENT;
    if (s === STATUS_LATE) return STATUS_COLOR_MAP.LATE;
    if (s === "Absent") return "bg-red-100 text-red-600";
    return STATUS_COLOR_MAP.DEFAULT;
};

const statusIcon = (s) => {
    if (!s || s === STATUS_NOT_MARKED) return <BookOpen className="w-3.5 h-3.5" />;
    if (s.includes(STATUS_PRESENT_MANUAL)) return <PenLine className="w-3.5 h-3.5" />;
    if (s.includes(STATUS_PRESENT)) return <CheckCircle2 className="w-3.5 h-3.5" />;
     if (s === "Absent") return <XCircle className="w-3.5 h-3.5" />;
    if (s === STATUS_LATE) return <Clock className="w-3.5 h-3.5" />;
    return null;
};

const confidenceColor = (c) => {
    if (!c) return CONFIDENCE_COLOR_MAP.NONE;
    if (c >= CONFIDENCE_HIGH_THRESHOLD) return CONFIDENCE_COLOR_MAP.HIGH;
    if (c >= CONFIDENCE_MEDIUM_THRESHOLD) return CONFIDENCE_COLOR_MAP.MEDIUM;
    return CONFIDENCE_COLOR_MAP.LOW;
};
const avatarColor = (initials = "??") => {
    return AVATAR_INITIALS_COLORS[((initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0)) % AVATAR_INITIALS_COLORS.length];
};

function SelectLoader() {
    return (
        <div className="h-9 w-32 rounded-lg bg-gray-200 shimmer">
            <style>{`.shimmer{background:linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;}@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
        </div>
    );
}

function StatCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4" />
                <div className="h-5 bg-gray-200 rounded w-1/2" />
            </div>
        </div>
    );
}

function ActionDropDownComp({ onAction, actionOptions }) {
    return (
        <div className="flex justify-center w-full">
            <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg border border-gray-200 flex-wrap">
                {actionOptions.map((item) => (
                    <button key={item.label} disabled={item.disabled}
                        onClick={() => { if (!item.disabled) onAction(item.value); }}
                        className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-150 cursor-pointer ${item.bg} ${item.text} ${item.hover} disabled:cursor-not-allowed disabled:opacity-50`}>
                        {item.icon && <item.icon className="h-3.5 w-3.5 shrink-0" />}
                        <span>{item.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

function RosterView({
    students, loadingRoster, onUnmark, onMark, actionLoadingId,
    loadingClasses, loadingSections, classes, sections,
    selectedClass, selectedSection, handleClassChange, handleSectionChange,
    date, setDate,
}) {
    const [filter, setFilter] = useState(FILTER_ALL_STUDENTS);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const filtered = students.filter((s) => {
        const matchFilter =
            filter === FILTER_ALL_STUDENTS ||
            (filter === STATUS_PRESENT && s.status.includes(STATUS_PRESENT)) ||
            (filter === STATUS_LATE && s.status === STATUS_LATE) ||
            (filter === STATUS_NOT_MARKED && s.status === STATUS_NOT_MARKED);
        const matchSearch =
            s.name.toLowerCase().includes(search.toLowerCase()) ||
            (s.rollNo || "").includes(search);
        return matchFilter && matchSearch;
    });

    const totalPages = Math.ceil(filtered.length / PAGES_PER_VIEW);
    const paged = filtered.slice((page - 1) * PAGES_PER_VIEW, page * PAGES_PER_VIEW);

    const TableRowSkeleton = () => (
        <tr className="animate-pulse">
            <td className="px-4 py-3"><div className="h-4 w-4 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-16 bg-gray-200 rounded" />
                    </div>
                </div>
            </td>
            <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-6 w-24 bg-gray-200 rounded-full" /></td>
            <td className="px-4 py-3"><div className="h-4 w-12 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-5 w-20 bg-gray-200 rounded-full" /></td>
            <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded" /></td>
            <td className="px-4 py-3"><div className="h-8 w-20 bg-gray-200 rounded-lg mx-auto" /></td>
        </tr>
    );

    const MobileCardSkeleton = () => (
        <div className="p-4 animate-pulse">
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="space-y-1.5">
                        <div className="h-3.5 w-28 bg-gray-200 rounded" />
                        <div className="h-3 w-20 bg-gray-200 rounded" />
                    </div>
                </div>
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
            </div>
            <div className="mt-3 h-8 bg-gray-200 rounded-lg" />
        </div>
    );

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="flex flex-col sm:flex-row gap-3 p-4 border-b border-gray-100 flex-wrap">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-600">{UI_STRINGS.ROSTER.FILTER}</span>
                    <div className="relative">
                        <select value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}
                            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer bg-white">
                            {FILTER_OPTIONS.map((f) => <option key={f}>{f}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                    </div>
                </div>
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                    <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        placeholder={UI_STRINGS.ROSTER.SEARCH_PLACEHOLDER}
                        className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200" />
                </div>
                <div className="flex flex-wrap items-center gap-2 ml-auto">
                    {loadingClasses ? <SelectLoader /> : (
                        <div className="relative">
                            <select value={selectedClass?.id ?? ""} onChange={(e) => handleClassChange(e.target.value)}
                                className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer shadow-sm">
                                {classes.length === 0 && <option value="">{UI_STRINGS.ROSTER.NO_CLASSES}</option>}
                                {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                        </div>
                    )}
                    {loadingSections ? <SelectLoader /> : (
                        <div className="relative">
                            <select value={selectedSection?.id ?? ""} onChange={(e) => handleSectionChange(e.target.value)}
                                disabled={sections.length === 0}
                                className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm appearance-none pr-8 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer shadow-sm disabled:opacity-60">
                                {sections.length === 0 && <option value="">{UI_STRINGS.ROSTER.NO_SECTIONS}</option>}
                                {sections.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 text-gray-400 absolute right-2 top-2.5 pointer-events-none" />
                        </div>
                    )}
                    <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                        className="border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm cursor-pointer" />
                </div>
            </div>

            {loadingRoster ? (
                <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {UI_STRINGS.ROSTER.HEADERS.map((h, i) => (
                                        <th key={i} className={`px-4 py-3 ${i === 0 || i === UI_STRINGS.ROSTER.HEADERS.length - 1 ? 'text-center' : 'text-left'} ${i === 0 ? 'w-10' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {Array(6).fill(0).map((_, i) => <TableRowSkeleton key={i} />)}
                            </tbody>
                        </table>
                    </div>
                    <div className="md:hidden divide-y divide-gray-100">
                        {Array(4).fill(0).map((_, i) => <MobileCardSkeleton key={i} />)}
                    </div>
                </>
            ) : students.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-sm">{UI_STRINGS.ROSTER.NO_STUDENTS}</div>
            ) : (
                <>
                    <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                    {UI_STRINGS.ROSTER.HEADERS.map((h, i) => (
                                        <th key={i} className={`px-4 py-3 ${i === 0 || i === UI_STRINGS.ROSTER.HEADERS.length - 1 ? 'text-center' : 'text-left'} ${i === 0 ? 'w-10' : ''}`}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {paged.map((s, i) => (
                                    <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-4 py-3 text-sm text-gray-500">{(page - 1) * PAGES_PER_VIEW + i + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${avatarColor(s.initials)}`}>{s.initials}</div>
                                                <div>
                                                    <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                                    <p className="text-xs text-gray-400">{UI_STRINGS.COMMON.ID_LABEL} {s.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm font-mono text-gray-600">{s.rollNo}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor(s.status)}`}>
                                                {statusIcon(s.status)}{s.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-600">{s.checkIn || "—"}</td>
                                        <td className="px-4 py-3">
                                            {s.source ? (
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${s.source === "Group Photo" ? "bg-blue-50 text-blue-600 border-blue-100" : s.source === "Face Scan" ? "bg-green-50 text-green-600 border-green-100" : "bg-purple-50 text-purple-600 border-purple-100"}`}>{s.source}</span>
                                            ) : "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            {s.confidence ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                                        <div className="h-full rounded-full ${confidenceColor(s.confidence)}" style={{ width: `${s.confidence}%` }} />
                                                    </div>
                                                    <span className="text-xs text-gray-600 font-mono">{s.confidence}%</span>
                                                </div>
                                            ) : <span className="text-xs text-gray-400">{UI_STRINGS.COMMON.N_A}</span>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ActionDropDownComp
                                                onAction={(val) => val === "unmark" ? onUnmark(s) : onMark(s)}
                                                actionOptions={
                                                    s.status === STATUS_NOT_MARKED
                                                        ? [{ label: actionLoadingId === s.id ? UI_STRINGS.COMMON.MARKING : UI_STRINGS.COMMON.MARK, value: "mark", icon: actionLoadingId === s.id ? Loader2 : PenLine, bg: "bg-white", text: "text-orange-600", hover: "hover:bg-orange-50", disabled: actionLoadingId === s.id }]
                                                        : [{ label: actionLoadingId === s.id ? UI_STRINGS.COMMON.UNMARKING : UI_STRINGS.COMMON.UNMARK, value: "unmark", icon: actionLoadingId === s.id ? Loader2 : Trash2, bg: "bg-white", text: "text-red-500", hover: "hover:bg-red-50", disabled: actionLoadingId === s.id }]
                                                }
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="md:hidden divide-y divide-gray-100">
                        {paged.map((s) => (
                            <div key={s.id} className="p-4 hover:bg-gray-50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${avatarColor(s.initials)}`}>{s.initials}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                            <p className="text-xs text-gray-400">{UI_STRINGS.COMMON.ROLL_LABEL}: {s.rollNo} · {UI_STRINGS.COMMON.ID_LABEL} {s.id}</p>
                                        </div>
                                    </div>
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor(s.status)}`}>
                                        {statusIcon(s.status)}{s.status}
                                    </span>
                                </div>
                                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                                    {s.checkIn && <span>⏰ {s.checkIn}</span>}
                                    {s.source && <span>📷 {s.source}</span>}
                                    {s.confidence && <span>🎯 {s.confidence}%</span>}
                                </div>
                                <div className="mt-3">
                                    <ActionDropDownComp
                                        onAction={(val) => val === "unmark" ? onUnmark(s) : onMark(s)}
                                        actionOptions={
                                            s.status === STATUS_NOT_MARKED
                                                ? [{ label: UI_STRINGS.COMMON.MARK, value: "mark", icon: PenLine, bg: "bg-white", text: "text-orange-600", hover: "hover:bg-orange-50", disabled: false }]
                                                : [{ label: UI_STRINGS.COMMON.UNMARK, value: "unmark", icon: Trash2, bg: "bg-white", text: "text-red-500", hover: "hover:bg-red-50", disabled: false }]
                                        }
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
                        <p className="text-xs text-gray-500">
                            {UI_STRINGS.ROSTER.SHOWING} {filtered.length === 0 ? 0 : (page - 1) * PAGES_PER_VIEW + 1}–{Math.min(page * PAGES_PER_VIEW, filtered.length)} {UI_STRINGS.ROSTER.OF} {filtered.length} {UI_STRINGS.ROSTER.STUDENTS_LOWER}
                        </p>
                        <div className="flex items-center gap-1">
                            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1">
                                <ChevronLeft className="w-3.5 h-3.5" /> {UI_STRINGS.ROSTER.PREV}
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                <button key={p} onClick={() => setPage(p)}
                                    className={`w-8 h-8 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${p === page ? "bg-blue-600 text-white" : "border border-gray-200 text-gray-600 hover:bg-white"}`}>
                                    {p}
                                </button>
                            ))}
                            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
                                className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-600 hover:bg-white disabled:opacity-40 cursor-pointer transition-colors flex items-center gap-1">
                                {UI_STRINGS.ROSTER.NEXT} <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function SummaryView({ rosterMeta, students, loadingSummary, date, selectedClassName, selectedSectionName }) {
    const totalStudents = rosterMeta?.totalStudents ?? students.length;
    const presentCount = rosterMeta?.totalPresent ?? students.filter((s) => s.status.includes(STATUS_PRESENT)).length;
    const lateCount = rosterMeta?.totalLate ?? students.filter((s) => s.status === STATUS_LATE).length;
    const absentCount = rosterMeta?.totalNotMarked ?? students.filter((s) => s.status === STATUS_NOT_MARKED).length;
    const markedCount = presentCount + lateCount;
    const todayRate = totalStudents > 0 ? ((markedCount / totalStudents) * 100).toFixed(1) : "0.0";
    const presentPct = totalStudents > 0 ? ((presentCount / totalStudents) * 100).toFixed(1) : 0;
    const latePct = totalStudents > 0 ? ((lateCount / totalStudents) * 100).toFixed(1) : 0;
    const absentPct = totalStudents > 0 ? ((absentCount / totalStudents) * 100).toFixed(1) : 0;

    const weekDays = [
        { day: "Mon", pct: 95, color: "bg-green-600" },
        { day: "Tue", pct: 89, color: "bg-green-500" },
        { day: "Wed", pct: 82, color: "bg-yellow-500" },
        { day: "Thu", pct: 76, color: "bg-orange-500" },
        { day: "Fri", pct: parseFloat(todayRate) || 87, color: "bg-blue-500", today: true },
    ];

    const attentionStudents = students.filter((s) => s.status === STATUS_NOT_MARKED).slice(0, 3);
    const formattedDate = new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

    if (loadingSummary) {
        return (
            <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse">
                        <div className="h-4 w-24 bg-gray-200 rounded mx-auto mb-3" />
                        <div className="h-14 w-28 bg-gray-200 rounded mx-auto mb-2" />
                        <div className="h-3 w-32 bg-gray-200 rounded mx-auto" />
                    </div>
                    <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5 animate-pulse space-y-4">
                        <div className="h-5 w-48 bg-gray-200 rounded" />
                        {[1, 2, 3].map(i => <div key={i} className="h-8 bg-gray-200 rounded" />)}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex flex-col items-center justify-center text-center">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{UI_STRINGS.SUMMARY.TODAY_RATE}</p>
                    <p className="text-5xl font-black text-green-600">{todayRate}%</p>
                    <p className="text-sm text-gray-500 mt-1">{markedCount} {UI_STRINGS.ROSTER.OF} {totalStudents} {UI_STRINGS.SUMMARY.OF_MARKED}</p>
                    <div className="w-full mt-3">
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full transition-all duration-700" style={{ width: `${todayRate}%` }} />
                        </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">{selectedClassName} · {selectedSectionName}</p>
                </div>
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4 text-blue-600" />
                        {UI_STRINGS.SUMMARY.BREAKDOWN} {selectedClassName} {selectedSectionName} · {formattedDate}
                    </h3>
                    <div className="space-y-3">
                        {[
                            { label: STATUS_PRESENT, pct: presentPct, count: presentCount, color: "bg-green-500", textColor: "text-green-600" },
                            { label: STATUS_LATE, pct: latePct, count: lateCount, color: "bg-orange-400", textColor: "text-orange-500" },
                            { label: UI_STRINGS.SUMMARY.STAT_ABSENT, pct: absentPct, count: absentCount, color: "bg-red-400", textColor: "text-red-500" },
                        ].map((item) => (
                            <div key={item.label}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                                    </div>
                                    <span className={`text-sm font-bold ${item.textColor}`}>{item.count} {UI_STRINGS.SUMMARY.STUDENTS_PAREN}{item.pct}%)</span>
                                </div>
                                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${item.color} transition-all duration-700`} style={{ width: `${item.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-blue-600" /> {UI_STRINGS.SUMMARY.WEEKLY_TREND}
                    </h3>
                    <div className="flex items-end justify-around gap-2 h-32">
                        {weekDays.map((d) => (
                            <div key={d.day} className="flex flex-col items-center gap-1 flex-1">
                                <span className={`text-xs font-bold ${d.today ? "text-blue-600" : "text-gray-600"}`}>{d.pct}%</span>
                                <div className="w-full rounded-t-lg overflow-hidden" style={{ height: `${(d.pct / 100) * 96}px` }}>
                                    <div className={`w-full h-full ${d.color} rounded-t-lg`} />
                                </div>
                                <span className={`text-xs font-semibold ${d.today ? "text-blue-600" : "text-gray-500"}`}>
                                    {d.day}{d.today && <Star className="w-3 h-3 inline ml-0.5 text-blue-500 fill-blue-500" />}
                                </span>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">{selectedClassName} · {selectedSectionName}</p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" /> {UI_STRINGS.SUMMARY.NEED_ATTENTION}
                        </h3>
                        <span className="text-xs text-gray-400">{UI_STRINGS.SUMMARY.NOT_MARKED_TODAY}</span>
                    </div>
                    {attentionStudents.length === 0 ? (
                        <div className="text-center py-8 text-gray-400 text-sm">{UI_STRINGS.SUMMARY.ALL_MARKED}</div>
                    ) : (
                        <div className="space-y-3">
                            {attentionStudents.map((s) => (
                                <div key={s.id} className="rounded-xl border p-3 bg-amber-50 border-amber-100 flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(s.initials)}`}>{s.initials}</div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{s.name}</p>
                                            <p className="text-xs text-gray-500">{UI_STRINGS.COMMON.ROLL_LABEL} {s.rollNo} · {UI_STRINGS.COMMON.ID_LABEL} {s.id}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-semibold text-amber-600 px-2 py-0.5 bg-amber-100 rounded-full">{STATUS_NOT_MARKED}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function exportAttendanceCSV({ students, selectedClass, selectedSection, date, rosterMeta }) {
    const className = selectedClass?.name || "Unknown Class";
    const sectionName = selectedSection?.name || "Unknown Section";
    const formattedDate = new Date(date).toLocaleDateString("en-IN", {
        weekday: "long", day: "2-digit", month: "long", year: "numeric",
    });
    const exportedAt = new Date().toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    });

    const total = rosterMeta?.totalStudents ?? students.length;
    const present = rosterMeta?.totalPresent ?? students.filter(s => s.status.includes(STATUS_PRESENT)).length;
    const late = rosterMeta?.totalLate ?? students.filter(s => s.status === STATUS_LATE).length;
    const absent = rosterMeta?.totalNotMarked ?? students.filter(s => s.status === STATUS_NOT_MARKED).length;
    const attendanceRate = total > 0 ? (((present + late) / total) * 100).toFixed(1) : "0.0";

    const cell = (val) => `"${String(val ?? "").replace(/"/g, '""')}"`;
    const rows = [];

    rows.push([cell(UI_STRINGS.EXPORT.REPORT_TITLE), "", "", "", "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.CLASS), cell(className), cell(UI_STRINGS.EXPORT.SECTION), cell(sectionName), "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.DATE), cell(formattedDate), "", "", "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.EXPORTED_AT), cell(exportedAt), "", "", "", "", "", ""]);
    rows.push(["", "", "", "", "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.SUMMARY), "", "", "", "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.TOTAL_STUDENTS), cell(total), cell(UI_STRINGS.EXPORT.ATTENDANCE_RATE), cell(`${attendanceRate}%`), "", "", "", ""]);
    rows.push([cell(STATUS_PRESENT), cell(present), cell(STATUS_LATE), cell(late), "", "", "", ""]);
    rows.push([cell(UI_STRINGS.EXPORT.ABSENT_UNMARKED), cell(absent), "", "", "", "", "", ""]);
    rows.push(["", "", "", "", "", "", "", ""]);
    rows.push(UI_STRINGS.EXPORT.HEADERS.map(cell));

    students.forEach((s, index) => {
        rows.push([cell(index + 1), cell(s.name), cell(s.rollNo), cell(s.id), cell(s.status), cell(s.checkIn || "—"), cell(s.source || "—"), cell(s.confidence ?? "—")]);
    });

    const csvContent = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeDate = date.replace(/-/g, "");
    const safeName = `${className}_${sectionName}_Attendance_${safeDate}`.replace(/\s+/g, "_");
    link.href = url;
    link.setAttribute("download", `${safeName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

export default function StudentAttendance() {
    const [view, setView] = useState("roster");
    const [activeTab, setActiveTab] = useState("roster");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

    const [classes, setClasses] = useState([]);
    const [sections, setSections] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [loadingClasses, setLoadingClasses] = useState(true);
    const [loadingSections, setLoadingSections] = useState(false);

    const [rosterMeta, setRosterMeta] = useState(null);
    const [mergedStudents, setMergedStudents] = useState([]);
    const [loadingRoster, setLoadingRoster] = useState(false);

    const [showManualMark, setShowManualMark] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [unmarkTarget, setUnmarkTarget] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [exportingCSV, setExportingCSV] = useState(false);

    const [subViewClass, setSubViewClass] = useState(null);
    const [subViewSection, setSubViewSection] = useState(null);

    useEffect(() => {
        (async () => {
            setLoadingClasses(true);
            try {
                const data = await getClasses();
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]);
            } catch (err) { console.error("getClasses error:", err); }
            finally { setLoadingClasses(false); }
        })();
    }, []);

    useEffect(() => {
        if (!selectedClass?.id) return;
        (async () => {
            setLoadingSections(true);
            setSections([]);
            setSelectedSection(null);
            setMergedStudents([]);
            setRosterMeta(null);
            try {
                const data = await getSectionsByClass(selectedClass.id);
                setSections(data);
                if (data.length > 0) setSelectedSection(data[0]);
            } catch (err) { console.error("getSectionsByClass error:", err); }
            finally { setLoadingSections(false); }
        })();
    }, [selectedClass]);

    useEffect(() => {
        if (!selectedClass?.id || !selectedSection?.id) return;
        (async () => {
            setLoadingRoster(true);
            setMergedStudents([]);
            setRosterMeta(null);
            try {
                const roster = await getAttendanceRoster(selectedClass.id, selectedSection.id, date);
                setRosterMeta(roster);
                setMergedStudents((roster.students || []).map(shapeRosterStudent));
            } catch (err) { console.error("getAttendanceRoster error:", err); }
            finally { setLoadingRoster(false); }
        })();
    }, [selectedClass, selectedSection, date]);

    const stats = {
        total: rosterMeta?.totalStudents ?? mergedStudents.length,
        present: rosterMeta?.totalPresent ?? mergedStudents.filter((s) => s.status.includes(STATUS_PRESENT)).length,
        late: rosterMeta?.totalLate ?? mergedStudents.filter((s) => s.status === STATUS_LATE).length,
        absent: rosterMeta?.totalNotMarked ?? mergedStudents.filter((s) => s.status === STATUS_NOT_MARKED).length,
        enrolled: mergedStudents.filter((s) => s.enrolled).length,
    };

    const showStatSkeletons = loadingClasses;

    const handleClassChange = (classId) => {
        const cls = classes.find((c) => String(c.id) === String(classId));
        if (cls) setSelectedClass(cls);
    };
    const handleSectionChange = (sectionId) => {
        const sec = sections.find((s) => String(s.id) === String(sectionId));
        if (sec) setSelectedSection(sec);
    };

    const refreshRoster = useCallback(async () => {
        if (!selectedClass?.id || !selectedSection?.id) return;
        try {
            const roster = await getAttendanceRoster(selectedClass.id, selectedSection.id, date);
            setRosterMeta(roster);
            setMergedStudents((roster.students || []).map(shapeRosterStudent));
        } catch (err) { console.error("Roster refresh failed:", err); }
    }, [selectedClass, selectedSection, date]);

    const handleUnmarkConfirm = async (student) => {
        if (!student.attendanceId) { alert(UI_STRINGS.ALERTS.NO_ATTENDANCE_ID); return; }
        setActionLoadingId(student.id);
        try {
            await unmarkAttendance(student.attendanceId, "Wrong marking corrected by teacher");
            setUnmarkTarget(null);
            await refreshRoster();
        } catch (err) { alert(err.message || UI_STRINGS.COMMON.ERROR); }
        finally { setActionLoadingId(null); }
    };

    const handleManualMark = async (payload) => {
        const result = await bulkManualMarkAttendance(payload);
        await refreshRoster();
    };


    const handleExportCSV = () => {
        if (mergedStudents.length === 0) {
            alert(UI_STRINGS.ALERTS.NO_STUDENT_DATA_EXPORT);
            return;
        }
        setExportingCSV(true);
        try {
            exportAttendanceCSV({ students: mergedStudents, selectedClass, selectedSection, date, rosterMeta });
        } catch (err) {
            console.error("CSV export error:", err);
            alert(UI_STRINGS.ALERTS.EXPORT_FAILED);
        } finally {
            setTimeout(() => setExportingCSV(false), 1000);
        }
    };

    const isSubView = view === "faceScan" || view === "groupPhoto";

    const openSubView = (viewName) => {
        if (!selectedClass?.id || !selectedSection?.id) {
            alert(UI_STRINGS.ALERTS.WAIT_BEFORE_PROCEEDING);
            return;
        }
        setSubViewClass({ ...selectedClass });
        setSubViewSection({ ...selectedSection });
        setView(viewName);
    };

    const handleSubViewBack = () => {
        setView("roster");
        setActiveTab("roster");
        setSubViewClass(null);
        setSubViewSection(null);
        refreshRoster();
    };

    const sectionReady = !!selectedClass?.id && !!selectedSection?.id && !loadingSections;

    return (
        <div className="min-h-screen bg-slate-100 p-3 sm:p-4 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-4">

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div>
                        <h1 className="text-xl sm:text-3xl font-bold text-gray-900">{UI_STRINGS.ROSTER.TITLE}</h1>
                        <p className="text-sm text-gray-500 mt-0.5">{UI_STRINGS.ROSTER.SUBTITLE}</p>
                    </div>
                </div>

                {showStatSkeletons ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {Array(5).fill(0).map((_, i) => <StatCardSkeleton key={i} />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-5 gap-3">
                        <CardComponent IconName={Users} keyName={UI_STRINGS.SUMMARY.TOTAL_STUDENTS} val={stats.total} iconBgColor="bg-blue-100" iconTxColor="text-blue-600" />
                        <CardComponent IconName={CheckCircle2} keyName={STATUS_PRESENT}
                            val={stats.total > 0 ? `${stats.present} · ${((stats.present / stats.total) * 100).toFixed(1)}%` : "0"}
                            iconBgColor="bg-green-100" iconTxColor="text-green-600" />
                        <CardComponent IconName={Clock} keyName={STATUS_LATE} val={stats.late} iconBgColor="bg-orange-100" iconTxColor="text-orange-500" />
                        <CardComponent IconName={XCircle} keyName={UI_STRINGS.SUMMARY.ABSENT_UNMARKED} val={stats.absent} iconBgColor="bg-red-100" iconTxColor="text-red-500" />
                        <CardComponent IconName={UserCheck} keyName={UI_STRINGS.SUMMARY.ENROLLED}
                            val={`${stats.enrolled} · ${stats.total - stats.enrolled}${UI_STRINGS.SUMMARY.NOT_ENROLLED}`}
                            iconBgColor="bg-sky-100" iconTxColor="text-sky-600" />
                    </div>
                )}

                <div className="flex flex-col sm:flex-row justify-between gap-3">
                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => openSubView("groupPhoto")}
                            disabled={!sectionReady}
                            title={!sectionReady ? UI_STRINGS.ALERTS.WAIT_FOR_SECTIONS : ""}
                            className="flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                            <Camera className="w-4 h-4" />
                            {UI_STRINGS.ROSTER.GROUP_BTN}
                            {sectionReady && (
                                <span className="text-blue-200 text-xs font-normal hidden sm:inline">
                                    · {selectedSection?.name}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => openSubView("faceScan")}
                            disabled={!sectionReady}
                            title={!sectionReady ? UI_STRINGS.ALERTS.WAIT_FOR_SECTIONS : ""}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                            <ScanFace className="w-4 h-4" /> {UI_STRINGS.ROSTER.FACE_BTN}
                        </button>

                        <button onClick={() => setShowManualMark(true)}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors shadow-sm">
                            <PenLine className="w-4 h-4" /> {UI_STRINGS.ROSTER.MANUAL_BTN}
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button onClick={() => { setView("roster"); setActiveTab("roster"); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors border ${activeTab === "roster" && !isSubView ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                            <List className="w-4 h-4" /> {UI_STRINGS.ROSTER.BTN_ROSTER}
                        </button>
                        <button onClick={() => { setView("summary"); setActiveTab("summary"); }}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors border ${activeTab === "summary" && !isSubView ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}>
                            <BarChart2 className="w-4 h-4" /> {UI_STRINGS.ROSTER.BTN_SUMMARY}
                        </button>
                        <button
                            onClick={handleExportCSV}
                            disabled={exportingCSV || mergedStudents.length === 0 || loadingRoster}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-colors border bg-white text-gray-700 border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                            {exportingCSV
                                ? <><Loader2 className="w-4 h-4 animate-spin" /> {UI_STRINGS.ROSTER.EXPORTING}</>
                                : <><Download className="w-4 h-4" /> {UI_STRINGS.ROSTER.EXPORT_CSV}</>
                            }
                        </button>
                    </div>
                </div>

                {view === "roster" && (
                    <RosterView
                        students={mergedStudents}
                        loadingRoster={loadingRoster}
                        onUnmark={(student) => setUnmarkTarget(student)}
                        onMark={(student) => { setSelectedStudent(student); setShowManualMark(true); }}
                        actionLoadingId={actionLoadingId}
                        loadingClasses={loadingClasses}
                        loadingSections={loadingSections}
                        classes={classes}
                        sections={sections}
                        selectedClass={selectedClass}
                        selectedSection={selectedSection}
                        handleClassChange={handleClassChange}
                        handleSectionChange={handleSectionChange}
                        date={date}
                        setDate={setDate}
                    />
                )}
                {view === "summary" && (
                    <SummaryView
                        rosterMeta={rosterMeta}
                        students={mergedStudents}
                        loadingSummary={loadingRoster}
                        date={date}
                        selectedClassName={selectedClass?.name || ""}
                        selectedSectionName={selectedSection?.name || ""}
                    />
                )}
                {view === "faceScan" && (
                    <IndividualFaceScanView
                        onBack={handleSubViewBack}
                        selectedClass={subViewClass}
                        selectedSection={subViewSection}
                    />
                )}
                {view === "groupPhoto" && (
                    <GroupPhotoView
                        onBack={handleSubViewBack}
                        selectedClass={subViewClass}
                        selectedSection={subViewSection}
                    />
                )}
            </div>

            {showManualMark && (
                <ManualMarkModal
                    students={mergedStudents}
                    selectedClass={selectedClass}
                    selectedSection={selectedSection}
                    date={date}
                    onClose={() => { setShowManualMark(false); setSelectedStudent(null); }}
                    onConfirm={handleManualMark}
                />
            )}

            {unmarkTarget && (
                <UnmarkModal
                    student={unmarkTarget}
                    onClose={() => setUnmarkTarget(null)}
                    onConfirm={handleUnmarkConfirm}
                />
            )}
        </div>
    );
}