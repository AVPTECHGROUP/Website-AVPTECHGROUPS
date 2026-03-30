import React, { useEffect, useState } from "react";
import {
  Shield, Users, Key, LayoutGrid,
  Plus, Edit, Trash2, ChevronRight, Search, Save, RotateCcw,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import { filterModuleChips, getAllRolesSummary, getPermissionAccessStat } from "../../Api/AccessPermission";

// ─────────────────────────────────────────────
// MOCK DATA
// ─────────────────────────────────────────────
const MOCK_STATS = {
  totalRoles: 9,
  systemRoles: 7,
  customRoles: 2,
  totalPermissions: 38,
};

// const MOCK_ROLES = [
//   { id: 1, name: "Super Admin", desc: "Full platform access", icon: "👑", type: "system", perms: 38, color: "bg-violet-50" },
//   { id: 2, name: "Admin", desc: "School-level administration", icon: "🛡️", type: "system", perms: 38, color: "bg-blue-50" },
//   { id: 3, name: "Principal", desc: "School principal access", icon: "🎓", type: "system", perms: 10, color: "bg-green-50" },
//   { id: 4, name: "Teacher", desc: "Teaching staff access", icon: "📚", type: "system", perms: 6, color: "bg-yellow-50" },
//   { id: 5, name: "Accountant", desc: "Finance and fees access", icon: "💰", type: "system", perms: 5, color: "bg-amber-50" },
//   { id: 6, name: "Librarian", desc: "Library management access", icon: "📖", type: "system", perms: 4, color: "bg-teal-50" },
//   { id: 7, name: "Transport Manager", desc: "Transport operations", icon: "🚌", type: "system", perms: 8, color: "bg-sky-50" },
//   { id: 8, name: "Store Accountant", desc: "Full stock management access", icon: "🏪", type: "custom", perms: 6, color: "bg-fuchsia-50" },
//   { id: 9, name: "Seller", desc: "Sell and outward stock only", icon: "🛒", type: "custom", perms: 2, color: "bg-rose-50" },
// ];

// All permission columns across all modules
const ALL_COLUMNS = [
  "VIEW", "CREATE", "EDIT", "DELETE", "APPROVE",
  "INWARD", "OUTWARD", "STUDENT_CREATE", "STUDENT_DELETE", "STUDENT_EDIT",
  "STUDENT_VIEW", "USER_CREATE", "USER_DELETE",
];

// Per-module: which columns are available + initial checked state
const MOCK_PERMISSIONS = {
  1: [ // Super Admin — all checked
    { module: "Student Management", color: "#7c3aed", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, STUDENT_CREATE: 1, STUDENT_DELETE: 1, STUDENT_EDIT: 1, STUDENT_VIEW: 1 } },
    { module: "User Management", color: "#2563eb", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, USER_CREATE: 1, USER_DELETE: 1 } },
    { module: "Attendance", color: "#16a34a", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, APPROVE: 1 } },
    { module: "Leave", color: "#d97706", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, APPROVE: 1 } },
    { module: "Stock", color: "#dc2626", assigned: "6/6", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, INWARD: 1, OUTWARD: 1 } },
    { module: "Transport", color: "#0891b2", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1 } },
    { module: "Exam & Results", color: "#7c3aed", assigned: "5/5", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1, APPROVE: 1 } },
    { module: "Holiday", color: "#16a34a", assigned: "4/4", cols: { VIEW: 1, CREATE: 1, EDIT: 1, DELETE: 1 } },
    { module: "Academic", color: "#d97706", assigned: "3/3", cols: { VIEW: 1, CREATE: 1, EDIT: 1 } },
  ],
  5: [ // Accountant
    { module: "Student Management", color: "#7c3aed", assigned: "1/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
    { module: "User Management", color: "#2563eb", assigned: "1/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
    { module: "Attendance", color: "#16a34a", assigned: "1/4", cols: { VIEW: 1, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
    { module: "Leave", color: "#d97706", assigned: "1/4", cols: { VIEW: 1, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
    { module: "Stock", color: "#dc2626", assigned: "0/6", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, INWARD: 0, OUTWARD: 0 } },
    { module: "Transport", color: "#0891b2", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
    { module: "Exam & Results", color: "#7c3aed", assigned: "0/5", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
    { module: "Holiday", color: "#16a34a", assigned: "1/4", cols: { VIEW: 1, CREATE: 0, EDIT: 0, DELETE: 0 } },
    { module: "Academic", color: "#d97706", assigned: "0/3", cols: { VIEW: 0, CREATE: 0, EDIT: 0 } },
  ],
};

// Default permissions for roles not explicitly listed
const DEFAULT_PERMISSIONS = [
  { module: "Student Management", color: "#7c3aed", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
  { module: "User Management", color: "#2563eb", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
  { module: "Attendance", color: "#16a34a", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
  { module: "Leave", color: "#d97706", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
  { module: "Stock", color: "#dc2626", assigned: "0/6", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, INWARD: 0, OUTWARD: 0 } },
  { module: "Transport", color: "#0891b2", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
  { module: "Exam & Results", color: "#7c3aed", assigned: "0/5", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0, APPROVE: 0 } },
  { module: "Holiday", color: "#16a34a", assigned: "0/4", cols: { VIEW: 0, CREATE: 0, EDIT: 0, DELETE: 0 } },
  { module: "Academic", color: "#d97706", assigned: "0/3", cols: { VIEW: 0, CREATE: 0, EDIT: 0 } },
];

//const MODULE_FILTERS = ["All Modules", "Students", "Users", "Attendance", "Leave", "Stock", "Transport", "Exam", "Holiday"];

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function RolesPermissionsManagement() {
  const [statsData, setStatsData] = useState({
    totalRoles: 0, systemRoles: 0, customRoles: 0, totalPermissions: 0, totalModules: 0
  });
  // const statsData = MOCK_STATS;

  const [roles, setRoles] = useState([]);

  // use state for module chip filters
  const [MODULE_FILTERS, setMODULE_FILTERS] = useState([]);
  // usestate for roles management

  const [selectedRole, setSelectedRole] = useState([]); // Accountant default
  const [permissionsMap, setPermissionsMap] = useState(MOCK_PERMISSIONS);
  const [activeFilter, setActiveFilter] = useState("All Modules");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // ── Stat cards config (uses your CardComponent) ──
  const stats = [
    { key: "Total Roles", val: statsData.totalRoles, icon: Shield, txColor: "text-blue-600", bgColor: "bg-blue-50" },
    { key: "System Roles", val: statsData.systemRoles, icon: Users, txColor: "text-violet-600", bgColor: "bg-violet-50" },
    { key: "Custom Roles", val: statsData.customRoles, icon: LayoutGrid, txColor: "text-amber-500", bgColor: "bg-amber-50" },
    { key: "Total Permissions", val: statsData.totalPermissions, icon: Key, txColor: "text-green-600", bgColor: "bg-green-50" },
  ];

  //--- to set the stat values
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const statistics_res = await getPermissionAccessStat();
        setStatsData(statistics_res.data);
      } catch (e) {
        console.error("get permissions statistics error:", e.message);
      }
    };
    fetchStatistics();
  }, []);

  //--- to set the roles to roles values
  useEffect(() => {
    const fetchRolesSummary = async () => {
      try {
        const roles_summary = await getAllRolesSummary();
        setRoles(roles_summary.data);
      } catch (e) {
        console.error("get permissions statistics error:", e.message);
      }
    };
    fetchRolesSummary();
  }, []);

  //for filter module stat cards
  useEffect(() => {
    const fetchMoudleFilterChips = async () => {
      try {
        const moduleChips = await filterModuleChips();
        setMODULE_FILTERS(moduleChips.data);
      } catch (e) {
        console.error("get permissions statistics error:", e.message);
      }
    };
    fetchMoudleFilterChips();
  }, []);

  // ── Permissions for selected role ──
  const getPermsForRole = (roleId) =>
    permissionsMap[roleId]
      ? JSON.parse(JSON.stringify(permissionsMap[roleId]))
      : JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS));

  const currentPerms = getPermsForRole(selectedRole?.id);

  // ── Filter modules ──
  const filteredPerms = currentPerms.filter((m) => {
    if (activeFilter === "All Modules") return true;
    return m.module.toLowerCase().includes(activeFilter.toLowerCase());
  });

  // ── Toggle a single permission checkbox ──
  const handleToggle = (moduleIdx, col) => {
    const roleId = selectedRole.id;
    const updated = getPermsForRole(roleId);
    const realIdx = currentPerms.findIndex((m) => m.module === filteredPerms[moduleIdx].module);
    if (realIdx === -1) return;
    updated[realIdx].cols[col] = updated[realIdx].cols[col] === 1 ? 0 : 1;
    setPermissionsMap((prev) => ({ ...prev, [roleId]: updated }));
    setHasChanges(true);
  };

  // ── Save ──
  const handleSave = () => {
    // In production: call your API here
    setHasChanges(false);
  };

  // ── Discard ──
  const handleDiscard = () => {
    setPermissionsMap((prev) => {
      const next = { ...prev };
      delete next[selectedRole.id];
      return next;
    });
    setHasChanges(false);
  };

  //-------handle delete 
  const handleDelete = () => {
    setPermissionsMap((prev) => {
      const next = { ...prev };
      delete next[selectedRole.id];
      return next;
    });
    setHasChanges(false);
  };

  // ── Filtered roles for sidebar search ──
  const visibleRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

      {/* ── Page Header ── */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Roles & Permissions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage role-based access control. Assign granular permissions per module for each role.
        </p>
      </div>

      {/* ── Stat Cards (using your CardComponent) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        {stats.map((s) => (
          <CardComponent
            key={s.key}
            IconName={s.icon}
            keyName={s.key}
            val={s.val}
            iconTxColor={s.txColor}
            iconBgColor={s.bgColor}
          />
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── LEFT: Roles List ── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">All Roles</h2>
            </div>
            <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              New Role
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery} // updates only search query
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Role list */}
          <div className="divide-y divide-gray-100 max-h-[560px] overflow-y-auto">
            {visibleRoles.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-400 text-sm">No roles found.</div>
            ) : (
              visibleRoles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => { setSelectedRole(role); setHasChanges(false); }}
                    className={`w-full flex items-center cursor-pointer justify-between px-4 py-3 text-left transition-colors
                      ${isSelected
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* for icons of the role  */}
                      <div className={`w-8 h-8 rounded-lg ${role.isSystemRole
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                        } flex items-center justify-center text-base font-medium shrink-0`}>
                        {role.displayName.length != 0 ? role.displayName.charAt(0) : ''}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                          {role.displayName}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${role.isSystemRole
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                        }`}>
                        {role.isSystemRole ? "System" : "Custom"}
                      </span>
                      {/* <span className="text-[10px] text-gray-400">{role.perms}p</span> */}
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-blue-500" : "text-gray-300"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Permissions Matrix ── */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

          {/* Table Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg  ${selectedRole.isSystemRole == false
                ?
                "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"
                } flex items-center justify-center text-lg font-medium shrink-0`}>
                {selectedRole?.displayName?.length > 0
                  ? selectedRole.displayName.charAt(0).toUpperCase()
                  : <Shield className="text-blue-700" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-800 truncate">
                  {selectedRole?.displayName ?? "Select a role"}
                </h2>
                <p className="text-xs text-gray-400 truncate">{selectedRole?.desc}</p>
              </div>
              {selectedRole?.isSystemRole && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 shrink-0">
                  System Role
                </span>
              )}
              {selectedRole?.isSystemRole === false && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 shrink-0">
                  Custom Role
                </span>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Edit className="w-3.5 h-3.5" />
                Edit Role
              </button>
              <button
              onClick={handleDelete}
              className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Module filter tabs */}
          <div className="px-5 py-2.5 border-b border-gray-100">
            {/* Label */}
            {/* <p className="font-medium mb-2 pl-1 pr-4">Filters:</p> */}

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                key='all_modules'
                onClick={() => setActiveFilter('All Modules')}
                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeFilter === 'All Modules'
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                All Modules
              </button>
              {MODULE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors ${activeFilter === f
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Permissions table */}
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3 text-left min-w-[180px]">Module</th>
                  {ALL_COLUMNS.map((col) => (
                    <th key={col} className="px-3 py-3 text-center whitespace-nowrap">{col.replace(/_/g, " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPerms.map((mod, mIdx) => (
                  <tr key={mod.module} className="hover:bg-blue-50/30 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ background: mod.color }} />
                        <div>
                          <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">{mod.module}</p>
                          <p className="text-[10px] text-gray-400">{mod.assigned} assigned</p>
                        </div>
                      </div>
                    </td>
                    {ALL_COLUMNS.map((col) => {
                      const available = col in mod.cols;
                      if (!available) {
                        return (
                          <td key={col} className="px-3 py-3.5 text-center">
                            <span className="text-gray-200 text-sm">—</span>
                          </td>
                        );
                      }
                      const checked = mod.cols[col] === 1;
                      return (
                        <td key={col} className="px-3 py-3.5 text-center">
                          <button
                            onClick={() => handleToggle(mIdx, col)}
                            className={`w-4 h-4 rounded border flex items-center justify-center mx-auto transition-colors ${checked
                              ? "bg-blue-600 border-blue-600"
                              : "bg-white border-gray-300 hover:border-blue-400"
                              }`}
                          >
                            {checked && (
                              <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <span className={`text-xs font-medium ${hasChanges ? "text-amber-600" : "text-gray-400"}`}>
              {hasChanges ? "⚠ You have unsaved changes" : "No pending changes"}
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleDiscard}
                disabled={!hasChanges}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Discard
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                Save Permissions
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}