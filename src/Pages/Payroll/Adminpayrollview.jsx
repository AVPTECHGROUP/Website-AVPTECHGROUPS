import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Search, Users, Wallet, CalendarCog, HandCoins, FileText, GraduationCap, Briefcase, X } from "lucide-react";
import { getTeacherLookup } from "../../Api/Teachers/TeachersAPI";
import { getUsersSummary, searchUsers, getRolesSummary } from "../../Api/StaffManagement/UserManagementAPI.js"; // TODO: confirm this path
import TeacherSalaryConfig from "./TeacherSalaryconfig";
import LeaveConfigManager from "./LeaveConfigManager";
import AdvanceSalaryPanel from "./AdvanceSalaryPanel";
import SalarySlip from "./Salaryslipgenerator";

const TABS = [
    { key: "salary", label: "Salary Structure", icon: Wallet },
    { key: "leavePolicy", label: "Leave Policy", icon: CalendarCog },
    { key: "advance", label: "Advance Salary", icon: HandCoins },
    { key: "slip", label: "Salary Slip", icon: FileText },
];

const ENTITY_TYPES = [
    { key: "teacher", label: "Teachers", icon: GraduationCap },
    { key: "staff", label: "Staff / Users", icon: Briefcase },
];

// Roles that don't belong in a "Staff" payroll picker even though they come
// back from the generic Users endpoint. Adjust to match your real role enum.
const EXCLUDED_STAFF_ROLES = ["TEACHER", "STUDENT", "PARENT"];

// Normalizes a raw User record (whatever shape getUsersSummary/searchUsers
// returns) into the {id, name, designation, employeeCode} shape every
// downstream payroll component (TeacherSalaryConfig, LeaveConfigManager,
// AdvanceSalaryPanel, SalarySlip) already expects via its `teacher` prop.
const normalizePerson = (u) => ({
    id: u.id,
    name: u.name || [u.firstName, u.lastName].filter(Boolean).join(" ") || u.username || u.email || "Unnamed User",
    designation: u.designation || u.role || u.roleName || "Staff",
    employeeCode: u.employeeCode || u.staffCode || u.code || null,
    role: u.role || u.roleName || null,
});

const AdminPayrollView = () => {
    const [entityType, setEntityType] = useState("teacher");

    // ── Teacher list state ────────────────────────────────────────────
    const [teachers, setTeachers] = useState([]);
    const [loadingTeachers, setLoadingTeachers] = useState(true);

    // ── Staff/User list state ─────────────────────────────────────────
    const [staff, setStaff] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(true);
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const searchDebounceRef = useRef(null);

    const [search, setSearch] = useState("");
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [activeTab, setActiveTab] = useState("salary");

    // TEMP: no payroll backend/permission system exists yet, so this view is
    // fully editable for everyone who can reach it. Once real PAYROLL_CONFIGURE
    // / PAYROLL_MANAGE_LEAVE_CONFIG permissions exist, swap these two back to
    // real hasPermission(...) checks via your useAuth hook.
    const canConfigure = true;
    const canManageLeavePolicy = true;

    // Load teachers once
    useEffect(() => {
        (async () => {
            try {
                setLoadingTeachers(true);
                const data = await getTeacherLookup();
                setTeachers(Array.isArray(data) ? data : data?.data ?? []);
            } catch (err) {
                toast.error(err.message || "Failed to load teachers");
            } finally {
                setLoadingTeachers(false);
            }
        })();
    }, []);

    // Load role options for the staff filter (once)
    useEffect(() => {
        (async () => {
            try {
                const data = await getRolesSummary();
                const list = Array.isArray(data) ? data : data?.data ?? [];
                setRoles(list.filter((r) => !EXCLUDED_STAFF_ROLES.includes((r.name || r.roleName || r).toString().toUpperCase())));
            } catch {
                // Non-fatal — role filter just won't render options if this fails
                setRoles([]);
            }
        })();
    }, []);

    // Base staff listing — reloads whenever the role filter changes,
    // as long as the person isn't actively typing a search query.
    const loadStaffByRole = async () => {
        try {
            setLoadingStaff(true);
            const data = await getUsersSummary({ role: selectedRole || undefined, size: 200 });
            const list = Array.isArray(data) ? data : data?.data ?? [];
            const filtered = selectedRole
                ? list
                : list.filter((u) => !EXCLUDED_STAFF_ROLES.includes((u.role || u.roleName || "").toString().toUpperCase()));
            setStaff(filtered.map(normalizePerson));
        } catch (err) {
            toast.error(err.message || "Failed to load staff");
        } finally {
            setLoadingStaff(false);
        }
    };

    useEffect(() => {
        if (entityType !== "staff") return;
        loadStaffByRole();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entityType, selectedRole]);

    // Debounced live search against the server for staff — falls back to
    // the role-filtered listing once the query is cleared.
    useEffect(() => {
        if (entityType !== "staff") return;
        clearTimeout(searchDebounceRef.current);

        if (!search.trim()) {
            setIsSearching(false);
            return;
        }
        if (search.trim().length < 2) return;

        searchDebounceRef.current = setTimeout(async () => {
            try {
                setIsSearching(true);
                setLoadingStaff(true);
                const data = await searchUsers(search.trim(), 0, 30);
                const list = Array.isArray(data) ? data : data?.data ?? [];
                const filtered = list.filter((u) => !EXCLUDED_STAFF_ROLES.includes((u.role || u.roleName || "").toString().toUpperCase()));
                setStaff(filtered.map(normalizePerson));
            } catch (err) {
                toast.error(err.message || "Search failed");
            } finally {
                setLoadingStaff(false);
            }
        }, 400);

        return () => clearTimeout(searchDebounceRef.current);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, entityType]);

    const clearStaffSearch = () => {
        setSearch("");
        setIsSearching(false);
        loadStaffByRole();
    };

    const handleEntityTypeChange = (key) => {
        setEntityType(key);
        setSearch("");
        setIsSearching(false);
        setSelectedRole("");
        setSelectedPerson(null);
        setActiveTab("salary");
    };

    const handleSelectPerson = (p) => {
        setSelectedPerson(p);
        setActiveTab("salary");
    };

    // Teacher list still uses simple client-side filtering (small dataset,
    // matches the original behavior).
    const filteredTeachers = useMemo(() => {
        if (!search.trim()) return teachers;
        const q = search.toLowerCase();
        return teachers.filter(
            (t) =>
                t.name?.toLowerCase().includes(q) ||
                t.employeeCode?.toLowerCase().includes(q) ||
                t.designation?.toLowerCase().includes(q)
        );
    }, [teachers, search]);

    const listForEntity = entityType === "teacher" ? filteredTeachers : staff;
    const loadingList = entityType === "teacher" ? loadingTeachers : loadingStaff;

    return (
        <div className="w-full px-0 py-2 sm:py-4">
            {/* Header */}
            <div className="mb-4 sm:mb-6 flex items-start justify-between flex-wrap gap-3">
                <div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 leading-tight">
                        Payroll Management
                    </h1>
                    <p className="text-xs sm:text-sm md:text-base text-gray-500 mt-1">
                        Select a {entityType === "teacher" ? "teacher" : "staff member"} to view or configure their payroll details.
                    </p>
                </div>

                {/* Teacher / Staff toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                    {ENTITY_TYPES.map((et) => {
                        const Icon = et.icon;
                        return (
                            <button
                                key={et.key}
                                type="button"
                                onClick={() => handleEntityTypeChange(et.key)}
                                className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                                    entityType === et.key ? "bg-white shadow-sm text-blue-700" : "text-gray-600 hover:text-gray-800"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> {et.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
                {/* ── List / dropdown ────────────────────────────────────── */}
                <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 h-fit">
                    <div className="flex items-center gap-2 mb-3 sm:mb-4">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-purple-100 rounded-lg flex items-center justify-center shrink-0">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                        </div>
                        <h2 className="text-sm sm:text-base font-semibold text-gray-900">
                            {entityType === "teacher" ? "Teachers" : "Staff / Users"}
                        </h2>
                    </div>

                    {/* Role filter — staff only */}
                    {entityType === "staff" && roles.length > 0 && (
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            disabled={isSearching}
                            className="w-full mb-3 px-3 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                        >
                            <option value="">All Staff Roles</option>
                            {roles.map((r) => {
                                const value = r.name || r.roleName || r;
                                return (
                                    <option key={value} value={value}>
                                        {value}
                                    </option>
                                );
                            })}
                        </select>
                    )}

                    <div className="relative mb-3">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder={entityType === "teacher" ? "Search by name, code..." : "Search by name, email, code... (min 2 chars)"}
                            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {entityType === "staff" && isSearching && (
                            <button
                                type="button"
                                onClick={clearStaffSearch}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
                        {loadingList ? (
                            <p className="text-xs sm:text-sm text-gray-400 text-center py-6">Loading…</p>
                        ) : listForEntity.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-400 text-center py-6">
                                {entityType === "staff" && search.trim().length >= 1 && search.trim().length < 2
                                    ? "Keep typing to search…"
                                    : `No ${entityType === "teacher" ? "teachers" : "staff"} found`}
                            </p>
                        ) : (
                            listForEntity.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    onClick={() => handleSelectPerson(t)}
                                    className={`w-full text-left px-3 py-2.5 rounded-lg border transition-colors ${
                                        selectedPerson?.id === t.id
                                            ? "bg-blue-50 border-blue-400"
                                            : "border-transparent hover:bg-gray-50"
                                    }`}
                                >
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 truncate">{t.name}</p>
                                    <p className="text-[11px] sm:text-xs text-gray-500 truncate">
                                        {t.designation || (entityType === "teacher" ? "Teacher" : "Staff")} {t.employeeCode ? `· ${t.employeeCode}` : ""}
                                    </p>
                                </button>
                            ))
                        )}
                    </div>
                </div>

                {/* ── Detail panel ─────────────────────────────────────────────── */}
                <div className="col-span-1 lg:col-span-3">
                    {!selectedPerson ? (
                        <div className="bg-white rounded-xl border border-dashed border-gray-300 p-10 sm:p-16 text-center">
                            <Users className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm sm:text-base text-gray-500">
                                Select a {entityType === "teacher" ? "teacher" : "staff member"} from the list to view or configure their payroll.
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Selected person header */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-5 mb-4 flex items-center justify-between flex-wrap gap-2">
                                <div>
                                    <p className="text-base sm:text-lg font-semibold text-gray-900">{selectedPerson.name}</p>
                                    <p className="text-xs sm:text-sm text-gray-500">
                                        {selectedPerson.designation || (entityType === "teacher" ? "Teacher" : "Staff")} · {selectedPerson.employeeCode || "—"}
                                    </p>
                                </div>
                                <span className="bg-blue-100 border border-blue-200 text-blue-700 px-3 py-1 rounded-full text-xs font-medium">
                  Employee ID: {selectedPerson.id}
                </span>
                            </div>

                            {/* Tabs */}
                            <div className="flex gap-1 sm:gap-2 mb-4 overflow-x-auto pb-1">
                                {TABS.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.key}
                                            type="button"
                                            onClick={() => setActiveTab(tab.key)}
                                            className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-colors ${
                                                activeTab === tab.key
                                                    ? "bg-blue-600 text-white"
                                                    : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                                            }`}
                                        >
                                            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </div>

                            {activeTab === "salary" && (
                                <TeacherSalaryConfig
                                    teacher={selectedPerson}
                                    readOnly={!canConfigure}
                                    onSaveAndNext={() => setActiveTab("leavePolicy")}
                                />
                            )}
                            {activeTab === "leavePolicy" && (
                                <LeaveConfigManager readOnly={!canManageLeavePolicy} />
                            )}
                            {activeTab === "advance" && (
                                <AdvanceSalaryPanel teacher={selectedPerson} readOnly={!canConfigure} />
                            )}
                            {activeTab === "slip" && <SalarySlip teacher={selectedPerson} />}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPayrollView;