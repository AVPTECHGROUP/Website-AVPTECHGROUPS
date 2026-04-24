import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  Shield, Users, Key, LayoutGrid,
  Plus, Edit, Trash2, ChevronRight, Search, Save, RotateCcw, X,
} from "lucide-react";
import CardComponent from "../../Components/CommonComp/CardComponent";
import {
  filterModuleChips,
  getAllRolesSummary,
  getPermissionAccessStat,
  getAllPermissions,
  getSpecificRolePermissions,
  createRole,
  updateRole,
  updateRolePermissions,
  deleteRole,
} from "../../Api/AccessPermission";
import ShowWarningDialog from "../../Components/CommonComp/WarningShowDialog/ShowWarningDialog";

// ─────────────────────────────────────────────────────────────────────────────
// MODULE COLOR MAP — auto-assigns for any unknown module
// ─────────────────────────────────────────────────────────────────────────────
const PALETTE = [
  "#7c3aed", "#2563eb", "#16a34a", "#d97706",
  "#dc2626", "#0891b2", "#ec4899", "#10b981",
  "#f59e0b", "#8b5cf6", "#ef4444", "#6366f1",
];
const MODULE_COLORS = {
  GENERAL: "#0891b2", ACADEMIC: "#d97706", ATTENDANCE: "#16a34a",
  DASHBOARD: "#6366f1", EXAM: "#7c3aed", EXPENSE: "#f59e0b",
  FEE: "#10b981", HOMEWORK: "#ec4899", LEAVE: "#d97706",
  NOTICE: "#8b5cf6", PAYROLL: "#ef4444", STORE: "#dc2626",
  STUDENT: "#7c3aed", TEACHER: "#2563eb", USER: "#2563eb",
};
let _colorIdx = 0;
const getModuleColor = (mod) => {
  if (MODULE_COLORS[mod]) return MODULE_COLORS[mod];
  const c = PALETTE[_colorIdx % PALETTE.length];
  _colorIdx++;
  MODULE_COLORS[mod] = c;
  return c;
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Convert grouped API response → { allColumns, moduleRows }
 * allColumns: string[] — every unique action in insertion order (fully dynamic, no hardcoding)
 * moduleRows: { module, color, actions: Set, permissionMap: { action → permObj } }[]
 */
function parseGroupedPermissions(groupedData) {
  const actionOrderSeen = [];
  const moduleRows = [];

  Object.entries(groupedData).forEach(([moduleName, permissions]) => {
    const actions = new Set();
    const permissionMap = {};
    permissions.forEach((p) => {
      actions.add(p.action);
      permissionMap[p.action] = p;
      if (!actionOrderSeen.includes(p.action)) actionOrderSeen.push(p.action);
    });
    moduleRows.push({
      module: moduleName,
      color: getModuleColor(moduleName),
      actions,
      permissionMap,
    });
  });

  return { allColumns: actionOrderSeen, moduleRows };
}

/** Build checked rows for a role given its assigned permissions list */
function buildCheckedRows(moduleRows, assignedPermissions) {
  const assignedNames = new Set((assignedPermissions || []).map((p) => p.name));
  return moduleRows.map((row) => {
    const cols = {};
    let checkedCount = 0;
    row.actions.forEach((action) => {
      const perm = row.permissionMap[action];
      const isChecked = perm && assignedNames.has(perm.name);
      cols[action] = isChecked ? 1 : 0;
      if (isChecked) checkedCount++;
    });
    return { ...row, cols, assigned: `${checkedCount}/${row.actions.size}` };
  });
}

/** Build all-unchecked rows */
const buildEmptyRows = (moduleRows) =>
  moduleRows.map((row) => ({
    ...row,
    cols: Object.fromEntries([...row.actions].map((a) => [a, 0])),
    assigned: `0/${row.actions.size}`,
  }));

// ─────────────────────────────────────────────────────────────────────────────
// CHECKBOX — reusable
// ─────────────────────────────────────────────────────────────────────────────
function Checkbox({ checked, onChange, accent = "blue" }) {
  const colors = {
    blue: "bg-blue-600 border-blue-600",
    violet: "bg-violet-600 border-violet-600",
  };
  return (
    <button
      type="button"
      onClick={onChange}
      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors
        ${checked ? colors[accent] : "bg-white border-gray-300 hover:border-" + accent + "-400"}`}
    >
      {checked && (
        <svg viewBox="0 0 10 10" className="w-2.5 h-2.5" fill="none">
          <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE / EDIT ROLE MODAL
// ─────────────────────────────────────────────────────────────────────────────
function RoleModal({ mode, role, moduleRows, onClose, onSave }) {
  const isEdit = mode === "edit";

  // ── form state ──
  const [form, setForm] = useState({
    displayName: isEdit ? (role?.displayName ?? "") : "",
    description: isEdit ? (role?.description ?? "") : "",
    isSystemRole: isEdit ? (role?.isSystemRole ?? false) : false,
    // name only used in create mode
    name: "",
  });

  // selectedIds: Set<number> of permission IDs
  const [selectedIds, setSelectedIds] = useState(() =>
    new Set((role?.permissions || []).map((p) => p.id))
  );

  const [permSearch, setPermSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});


  // filter modules by search query
  const filteredModules = useMemo(() => {
    if (!permSearch.trim()) return moduleRows;
    const q = permSearch.toLowerCase();
    return moduleRows
      .map((row) => {
        const matchingActions = [...row.actions].filter((action) => {
          const perm = row.permissionMap[action];
          return (
            perm?.name?.toLowerCase().includes(q) ||
            perm?.displayName?.toLowerCase().includes(q) ||
            action.toLowerCase().includes(q) ||
            row.module.toLowerCase().includes(q)
          );
        });
        if (!matchingActions.length) return null;
        return { ...row, filteredActions: matchingActions };
      })
      .filter(Boolean);
  }, [moduleRows, permSearch]);

  const togglePerm = (permId) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(permId) ? next.delete(permId) : next.add(permId);
      return next;
    });
  };

  const toggleModule = (row) => {
    const displayActions = row.filteredActions ?? [...row.actions];
    const ids = displayActions.map((a) => row.permissionMap[a]?.id).filter(Boolean);
    const allChecked = ids.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => (allChecked ? next.delete(id) : next.add(id)));
      return next;
    });
  };

  const validate = () => {
    const errs = {};
    if (!isEdit) {
      if (!form.name.trim()) {
        errs.name = "Role name is required";
      } else if (!/^[A-Z0-9_]+$/.test(form.name)) {
        errs.name = "Uppercase letters, digits and underscores only";
      }
    }
    if (!form.displayName.trim()) errs.displayName = "Display Role name is required";
    setErrors(errs);
    return !Object.keys(errs).length;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      if (isEdit) {
        // PUT /roles/:roleId
        // Payload: { displayName, description, isSystemRole, permissionIds }
        // name is NOT sent — immutable after creation
        const payload = {
          displayName: form.displayName.trim(),
          description: form.description.trim(),
          isSystemRole: form.isSystemRole,
          permissionIds: [...selectedIds],
        };
        await updateRole(role.id, payload);
      } else {
        // POST /roles
        // Payload: { name, displayName, description, isSystemRole, permissionIds }
        const payload = {
          name: form.name.trim(),
          displayName: form.displayName.trim(),
          description: form.description.trim(),
          isSystemRole: form.isSystemRole,
          permissionIds: [...selectedIds],
        };
        await createRole(payload);
      }
      onSave();
    } catch (e) {
      console.error("save role error:", e.message);
    } finally {
      setSaving(false);
    }
  };




  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Panel — full-screen on mobile, centred card on sm+ */}
      <div className="relative bg-white w-full sm:max-w-lg sm:rounded-2xl shadow-2xl flex flex-col
                      h-full sm:h-auto sm:max-h-[92vh] rounded-t-2xl overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="font-bold text-gray-800 text-base leading-tight">
              {isEdit ? "Edit Role" : "Create New Role"}
            </h2>
            <p className="text-[11px] text-gray-400 mt-0.5">
              {isEdit ? "Update role details and permissions to reflect current access requirements." : "A protected role with predefined permissions for secure system access."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="overflow-y-auto flex-1 px-5 py-5 space-y-5">

          {/* ROLE DETAILS */}
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-4">
              Role Details
            </p>

            {/* Name — create only */}
            {!isEdit && (
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Role Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="E.G. STORE_ACCOUNTANT"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"),
                    }))
                  }
                  className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors
                    ${errors.name
                      ? "border-red-400 bg-red-50 focus:border-red-500"
                      : "border-gray-200 bg-white focus:border-blue-400"
                    }`}
                />
                {errors.name
                  ? <p className="text-[11px] text-red-500 mt-1">{errors.name}</p>
                  : <p className="text-[11px] text-gray-400 mt-1">Uppercase, underscores only.</p>
                }
              </div>
            )}

            {/* Display Name */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Display Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Store Accountant"
                value={form.displayName}
                onChange={(e) => setForm((f) => ({ ...f, displayName: e.target.value }))}
                className={`w-full border rounded-lg px-3 py-2.5 text-sm outline-none transition-colors
                  ${errors.displayName
                    ? "border-red-400 bg-red-50 focus:border-red-500"
                    : "border-gray-200 bg-white focus:border-blue-400"
                  }`}
              />
              {errors.displayName && (
                <p className="text-[11px] text-red-500 mt-1">{errors.displayName}</p>
              )}
            </div>

            {/* Description */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Brief description of this role's responsibilities..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
              />
            </div>

            {/* System Role toggle */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">System Role</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isSystemRole: !f.isSystemRole }))}
                  className={`relative w-10 h-5 rounded-full transition-colors focus:outline-none shrink-0
                    ${form.isSystemRole ? "bg-blue-600" : "bg-gray-300"}`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform
                      ${form.isSystemRole ? "translate-x-5" : "translate-x-0"}`}
                  />
                </button>
                <span className="text-sm text-gray-600">
                  {form.isSystemRole ? `This role cannot be deleted.` : "This role can be deleted."}
                </span>
              </div>
              <p className="text-[11px] text-gray-400 mt-1">System roles cannot be deleted from System.</p>
            </div>
          </div>

          {/* ASSIGN PERMISSIONS */}
          <div>
            <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1">
              Assign Permissions
            </p>

            {/* Search */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 mb-3">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search permissions..."
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
              {permSearch && (
                <button onClick={() => setPermSearch("")} className="text-gray-300 hover:text-gray-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Permissions list */}
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              {filteredModules.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400 text-sm">No permissions found.</div>
              ) : (
                filteredModules.map((row) => {
                  const displayActions = row.filteredActions ?? [...row.actions];
                  const ids = displayActions.map((a) => row.permissionMap[a]?.id).filter(Boolean);
                  const allChecked = ids.length > 0 && ids.every((id) => selectedIds.has(id));
                  const someChecked = !allChecked && ids.some((id) => selectedIds.has(id));

                  return (
                    <div key={row.module}>
                      {/* Module header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-100 sticky top-0">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
                          <span className="text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                            {row.module.replace(/_/g, " ")}
                          </span>
                          {someChecked && (
                            <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-full">
                              partial
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleModule(row)}
                          className={`text-[10px] font-semibold transition-colors
                            ${allChecked
                              ? "text-red-500 hover:text-red-700"
                              : "text-blue-600 hover:text-blue-800"
                            }`}
                        >
                          {allChecked ? "Deselect All" : "Select All"}
                        </button>
                      </div>

                      {/* Permission rows */}
                      {displayActions.map((action) => {
                        const perm = row.permissionMap[action];
                        if (!perm) return null;
                        const checked = selectedIds.has(perm.id);
                        return (
                          <div
                            key={perm.id}
                            onClick={() => togglePerm(perm.id)}
                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors border-t border-gray-100 first:border-t-0"
                          >
                            <Checkbox checked={checked} onChange={() => togglePerm(perm.id)} accent="blue" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700 leading-tight">
                                {perm.displayName || action.replace(/_/g, " ")}
                              </p>
                              <p className="text-[10px] font-mono text-gray-400 mt-0.5">{perm.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="shrink-0 px-5 py-4 border-t border-gray-100 bg-gray-50">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-gray-500 leading-tight">
              <span className="font-semibold text-blue-700">{selectedIds.size === 0 ? 'No' : selectedIds.size}</span> {`permission${selectedIds.size > 1 ? 's' : ''} selected`}
              <span className="text-gray-400 hidden sm:inline">
                {" "}
              </span>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {saving && (
                  <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                    <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                  </svg>
                )}
                {isEdit ? "Save Changes" : "Create Role"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function RolesPermissionsManagement() {
  const [statsData, setStatsData] = useState({
    totalRoles: 0, systemRoles: 0, customRoles: 0, totalPermissions: 0, totalModules: 0,
  });
  const [roles, setRoles] = useState([]);
  const [MODULE_FILTERS, setMODULE_FILTERS] = useState([]);

  // Fully dynamic — derived from GET /roles/permissions/grouped, zero hardcoding
  const [allColumns, setAllColumns] = useState([]);
  const [moduleRows, setModuleRows] = useState([]);

  const [selectedRole, setSelectedRole] = useState(null);
  const [permissionsMap, setPermissionsMap] = useState({});
  const [activeFilter, setActiveFilter] = useState("All Modules");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [loadingPerms, setLoadingPerms] = useState(false);
  const [modal, setModal] = useState(null); // null | { mode: "create"|"edit", role? }

  //for local store to handle discard changes in permission matrix
  const [baselinePermissions, setBaselinePermissions] = useState({});

   const [showDeleteModal, setShowDeleteModal] = useState(false);
  // ── Stat cards config ──
  const stats = [
    { key: "Total Roles", val: statsData.totalRoles, icon: Shield, txColor: "text-blue-600", bgColor: "bg-blue-50" },
    { key: "System Roles", val: statsData.systemRoles, icon: Users, txColor: "text-violet-600", bgColor: "bg-violet-50" },
    { key: "Custom Roles", val: statsData.customRoles, icon: LayoutGrid, txColor: "text-amber-500", bgColor: "bg-amber-50" },
    { key: "Total Permissions", val: statsData.totalPermissions, icon: Key, txColor: "text-green-600", bgColor: "bg-green-50" },
  ];

  // ── Data fetching ──
  useEffect(() => {
    getPermissionAccessStat()
      .then((res) => setStatsData(res.data))
      .catch((e) => console.error("stats error:", e.message));
  }, []);

  const refreshRoles = useCallback(() => {
    getAllRolesSummary()
      .then((res) => setRoles(res.data))
      .catch((e) => console.error("roles error:", e.message));
  }, []);
  useEffect(refreshRoles, [refreshRoles]);

  useEffect(() => {
    filterModuleChips()
      .then((res) => setMODULE_FILTERS(res.data))
      .catch((e) => console.error("chips error:", e.message));
  }, []);

  // Fetch grouped permissions once → derive dynamic columns + rows
  useEffect(() => {
    getAllPermissions()
      .then((res) => {
        const { allColumns: cols, moduleRows: rows } = parseGroupedPermissions(res.data);
        setAllColumns(cols);
        setModuleRows(rows);
      })
      .catch((e) => console.error("getAllPermissions error:", e.message));
  }, []);

  // Lazy-load permissions for selected role, cache by id
  useEffect(() => {
    if (!selectedRole || !moduleRows.length) return;
    if (permissionsMap[selectedRole.id]) return;

    setLoadingPerms(true);
    getSpecificRolePermissions(selectedRole.id)
      .then((res) => {
        const assigned = Array.isArray(res.data)
          ? res.data
          : (res.data?.permissions ?? []);
        setPermissionsMap((prev) => ({
          ...prev,
          [selectedRole.id]: buildCheckedRows(moduleRows, assigned),
        }));

        const rows = buildCheckedRows(moduleRows, assigned);
        //for local store 
        setBaselinePermissions((prev) => ({
          ...prev,
          [selectedRole.id]: rows,
        }));
      })
      .catch((e) => console.error("getSpecificRolePermissions error:", e.message))
      .finally(() => setLoadingPerms(false));
  }, [selectedRole, moduleRows]);

  // ── Derived data ──
  const currentPerms = useMemo(() => {
    if (!selectedRole) return buildEmptyRows(moduleRows);
    return permissionsMap[selectedRole.id] ?? buildEmptyRows(moduleRows);
  }, [selectedRole, permissionsMap, moduleRows]);

  const filteredPerms = useMemo(() =>
    activeFilter === "All Modules"
      ? currentPerms
      : currentPerms.filter((m) => m.module.toLowerCase().includes(activeFilter.toLowerCase())),
    [currentPerms, activeFilter]
  );

  const columnLabels = useMemo(() => {
  const actionModuleCount = {};
  const actionDisplayName = {};

  moduleRows.forEach((row) => {
    row.actions.forEach((action) => {
      actionModuleCount[action] = (actionModuleCount[action] || 0) + 1;
      if (!actionDisplayName[action]) {
        actionDisplayName[action] = row.permissionMap[action]?.displayName;
      }
    });
  });

  const map = {};
  Object.keys(actionModuleCount).forEach((action) => {
    // Only use displayName for unique actions (e.g. STOCK_INWARD, ENTER_MARKS)
    // Common actions (CREATE, VIEW, EDIT...) just format the action key itself
    map[action] =
      actionModuleCount[action] === 1
        ? actionDisplayName[action] || action.replace(/_/g, " ")
        : action.replace(/_/g, " ");
  });

  return map;
}, [moduleRows]);

  // ── Matrix checkbox toggle ──
  const handleToggle = (mIdx, col) => {
    if (!selectedRole) return;
    const roleId = selectedRole.id;
    const updated = currentPerms.map((row) => ({ ...row, cols: { ...row.cols } }));
    const realIdx = currentPerms.findIndex((m) => m.module === filteredPerms[mIdx].module);
    if (realIdx === -1) return;
    updated[realIdx].cols[col] = updated[realIdx].cols[col] === 1 ? 0 : 1;
    const count = Object.values(updated[realIdx].cols).filter((v) => v === 1).length;
    updated[realIdx].assigned = `${count}/${updated[realIdx].actions.size}`;
    setPermissionsMap((prev) => ({ ...prev, [roleId]: updated }));
    setHasChanges(true);
  };

  // ── Save matrix changes — PUT /roles/:roleId with { permissionIds }
  const handleSave = async () => {
    if (!selectedRole) return;
    const permissionIds = currentPerms.flatMap((row) =>
      Object.entries(row.cols)
        .filter(([, v]) => v === 1)
        .map(([action]) => row.permissionMap[action]?.id)
        .filter(Boolean)
    );
    try {
      await updateRolePermissions(selectedRole.id, permissionIds);
      setHasChanges(false);
    } catch (e) {
      console.error("save permissions error:", e.message);
    }
  };

  // ── Discard matrix changes ──
  const handleDiscard = () => {
    if (!selectedRole) return;

    const original = baselinePermissions[selectedRole.id];
    if (!original) return;

    setPermissionsMap((prev) => ({
      ...prev,
      [selectedRole.id]: original,
    }));

    setHasChanges(false);
  };

  // ── Delete role — DELETE /roles/:roleId (only roleId needed, no body) ──
  const handleDeleteDialogBox = async () => {
    if (!selectedRole) return;
    //if (!window.confirm(`Delete role "${selectedRole.displayName}"? This can not be undone.`)) return;
    try {
      await deleteRole(selectedRole.id);
      setSelectedRole(null);
      setPermissionsMap((prev) => { const n = { ...prev }; delete n[selectedRole.id]; return n; });
      refreshRoles();
    } catch (e) {
      console.error("delete role error:", e.message);
    }
    finally {
      setShowDeleteModal(false);
    }
  };

  // ── Open edit modal — fetch current permissions to pre-fill checkboxes ──
  const handleOpenEdit = async () => {
    if (!selectedRole) return;
    let assigned = [];
    try {
      const res = await getSpecificRolePermissions(selectedRole.id);
      assigned = Array.isArray(res.data) ? res.data : (res.data?.permissions ?? []);
    } catch (e) { /* non-fatal */ }
    setModal({ mode: "edit", role: { ...selectedRole, permissions: assigned } });
  };

  // ── After modal save: invalidate cache + refresh list ──
  const handleModalSave = () => {
    if (modal?.role?.id) {
      setPermissionsMap((prev) => { const n = { ...prev }; delete n[modal.role.id]; return n; });
    }
    setModal(null);
    refreshRoles();
  };

  const visibleRoles = roles.filter((r) =>
    r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8 font-sans">

      {/* Modal */}
      {modal && (
        <RoleModal
          mode={modal.mode}
          role={modal.role}
          moduleRows={moduleRows}
          onClose={() => setModal(null)}
          onSave={handleModalSave}
        />
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Roles &amp; Permissions</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage role-based access control. Assign granular permissions per module for each role.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4 text-sm">
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

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — Roles List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-500" />
              <h2 className="font-semibold text-gray-800">All Roles</h2>
            </div>
            <button
              onClick={() => setModal({ mode: "create" })}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              New Role
            </button>
          </div>

          <div className="px-3 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm w-full outline-none text-gray-700 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[601px] overflow-y-auto">
            {visibleRoles.length === 0 ? (
              <div className="px-4 py-10 text-center text-gray-400 text-sm">No roles found.</div>
            ) : (
              visibleRoles.map((role) => {
                const isSelected = selectedRole?.id === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => { setSelectedRole(role); setHasChanges(false); }}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                      ${isSelected
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                      }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shrink-0
                        ${role.isSystemRole ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {role.displayName?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isSelected ? "text-blue-700" : "text-gray-700"}`}>
                          {role.displayName}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[140px]">{role.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                        ${role.isSystemRole ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                        {role.isSystemRole ? "System" : "Custom"}
                      </span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? "text-blue-500" : "text-gray-300"}`} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
        {/* Delete Role Modal */}
        {ShowWarningDialog && selectedRole && showDeleteModal && (
          <ShowWarningDialog
            title="Delete Role"
            message={`Delete role "${selectedRole.displayName}"? This cannot be undone.`}
            onConfirm={handleDeleteDialogBox}   // Calls your deletion method
            onClose={() => setShowDeleteModal(false)}
          />
        )}
        {/* RIGHT — Permissions Matrix */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">

          {/* Matrix header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base font-bold shrink-0
                ${selectedRole?.isSystemRole === false ? "bg-amber-100 text-amber-700" : "bg-blue-100 text-blue-700"}`}>
                {selectedRole?.displayName
                  ? selectedRole.displayName.charAt(0).toUpperCase()
                  : <Shield className="w-4 h-4 text-blue-400" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-semibold text-gray-800 truncate">
                  {selectedRole?.displayName ?? "Select a role"}
                </h2>
                <p className="text-xs text-gray-400 truncate">{selectedRole?.description}</p>
              </div>
              {selectedRole?.isSystemRole === true && (
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
              <button
                onClick={handleOpenEdit}
                disabled={!selectedRole}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                Edit Role
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={!selectedRole || selectedRole?.isSystemRole}
                className="flex items-center gap-1.5 bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete
              </button>
            </div>
          </div>

          {/* Module filter chips */}
          <div className="px-5 py-2.5 border-b border-gray-100 overflow-x-auto">
            <div className="flex gap-2 flex-nowrap sm:flex-wrap">
              <button
                onClick={() => setActiveFilter("All Modules")}
                className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0
                  ${activeFilter === "All Modules" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                All Modules
              </button>
              {MODULE_FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`text-xs font-semibold px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0
                    ${activeFilter === f ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[545px] overflow-y-auto flex-1">
            {loadingPerms ? (
              <div className="flex items-center justify-center h-40 text-gray-400 text-sm gap-2">
                <svg className="w-4 h-4 animate-spin text-blue-500" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" strokeLinecap="round" className="opacity-75" />
                </svg>
                Loading permissions...
              </div>
            ) : !selectedRole ? (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-2">
                <Shield className="w-8 h-8 text-gray-200" />
                <p className="text-sm">Select a role to view its permissions</p>
              </div>
            ) : (
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 text-[10px] font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100 sticky top-0">
                    <th className="px-5 py-3 text-left min-w-[180px]">Module</th>
                    {/* allColumns is 100% dynamic — zero hardcoded action names */}
                    {allColumns.map((col) => (
                      <th
  key={col}
  className="px-3 py-3 text-center"
  style={{ minWidth: "72px", whiteSpace: "normal", wordBreak: "normal", lineHeight: "1.3" }}
>
  {columnLabels[col] || col.replace(/_/g, " ")}
</th>
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
                            <p className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                              {mod.module.replace(/_/g, " ")}
                            </p>
                            <p className="text-[10px] text-gray-400">{mod.assigned} assigned</p>
                          </div>
                        </div>
                      </td>
                      {allColumns.map((col) => {
                        if (!mod.actions.has(col)) {
                          return (
                            <td key={col} className="px-3 py-3.5 text-center">
                              <span className="text-gray-200 text-sm">—</span>
                            </td>
                          );
                        }
                        return (
                          <td key={col} className="px-3 py-3.5 text-center">
                            <Checkbox
                              checked={mod.cols[col] === 1}
                              onChange={() => handleToggle(mIdx, col)}
                              accent="blue"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <span className={`text-xs font-medium ${hasChanges ? "text-amber-600" : "text-gray-400"}`}>
              {hasChanges ? "You have unsaved changes" : "No pending changes"}
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