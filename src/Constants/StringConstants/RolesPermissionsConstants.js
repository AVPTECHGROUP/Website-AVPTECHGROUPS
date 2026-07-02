export const PALETTE = [
  "#7c3aed", "#2563eb", "#16a34a", "#d97706",
  "#dc2626", "#0891b2", "#ec4899", "#10b981",
  "#f59e0b", "#8b5cf6", "#ef4444", "#6366f1",
];

export const PREDEFINED_MODULE_COLORS = {
  GENERAL: "#0891b2", ACADEMIC: "#d97706", ATTENDANCE: "#16a34a",
  DASHBOARD: "#6366f1", EXAM: "#7c3aed", EXPENSE: "#f59e0b",
  FEE: "#10b981", HOMEWORK: "#ec4899", LEAVE: "#d97706",
  NOTICE: "#8b5cf6", PAYROLL: "#ef4444", STORE: "#dc2626",
  STUDENT: "#7c3aed", TEACHER: "#2563eb", USER: "#2563eb",
  ACADEMIC_YEAR: "#0891b2", TIMETABLE: "#7c3aed",
};

export const REGEX = {
  ROLE_NAME_TEST: /^[A-Z0-9_]+$/,
  ROLE_NAME_REPLACE: /[^A-Z0-9_]/g,
  UNDERSCORE_REPLACE: /_/g,
};

export const UI_TEXT = {
  // Page Headers & Status
  PAGE_TITLE: "Roles & Permissions",
  PAGE_SUBTITLE: "Manage role-based access control. Assign granular permissions per module for each role.",
  LOADING_PERMS: "Loading permissions...",
  NO_ROLES: "No roles found.",
  NO_PERMS: "No permissions found.",
  SELECT_ROLE_PROMPT: "Select a role to view its permissions",
  ALL_MODULES: "All Modules",
  UNSAVED_CHANGES: "You have unsaved changes",
  NO_CHANGES: "No pending changes",
  ASSIGNED: "assigned",
  PARTIAL: "partial",

  // Placeholders
  SEARCH_ROLES: "Search roles...",
  SEARCH_PERMS: "Search permissions...",
  
  // Stats
  STATS: {
    TOTAL_ROLES: "Total Roles",
    SYSTEM_ROLES: "System Roles",
    CUSTOM_ROLES: "Custom Roles",
    TOTAL_PERMISSIONS: "Total Permissions",
  },

  // Role Types
  ROLE_TYPES: {
    SYSTEM: "System Role",
    CUSTOM: "Custom Role",
    SYSTEM_SHORT: "System",
    CUSTOM_SHORT: "Custom",
  },

  // Buttons
  BUTTONS: {
    NEW_ROLE: "New Role",
    EDIT_ROLE: "Edit Role",
    DELETE: "Delete",
    SELECT_ALL: "Select All",
    DESELECT_ALL: "Deselect All",
    CANCEL: "Cancel",
    SAVE_CHANGES: "Save Changes",
    CREATE_ROLE: "Create Role",
    DISCARD: "Discard",
    SAVE_PERMS: "Save Permissions",
  },

  // Modal Text
  MODAL: {
    CREATE_TITLE: "Create New Role",
    EDIT_TITLE: "Edit Role",
    CREATE_SUB: "A protected role with predefined permissions for secure system access.",
    EDIT_SUB: "Update role details and permissions to reflect current access requirements.",
    SECT_ROLE_DETAILS: "Role Details",
    SECT_ASSIGN_PERMS: "Assign Permissions",
    SYS_ROLE_HINT_DEL: "This role can be deleted.",
    SYS_ROLE_HINT_NODEL: "This role cannot be deleted.",
    SYS_ROLE_WARN: "System roles cannot be deleted from System.",
    PERMS_SELECTED: "selected",
    NO_PERMS_SELECTED: "No",
  },

  // Form Labels & Placeholders
  FORM: {
    LBL_ROLE_NAME: "Role Name",
    LBL_DISPLAY_NAME: "Display Name",
    LBL_DESC: "Description",
    LBL_SYS_ROLE: "System Role",
    PH_ROLE_NAME: "E.G. STORE_ACCOUNTANT",
    PH_DISPLAY_NAME: "e.g. Store Accountant",
    PH_DESC: "Brief description of this role's responsibilities...",
  },

  // Validation Messages
  VALIDATION: {
    NAME_REQ: "Role name is required",
    NAME_PATTERN: "Uppercase letters, digits and underscores only",
    NAME_HINT: "Uppercase, underscores only.",
    DISPLAY_NAME_REQ: "Display Role name is required",
  },

  // Dialogs
  DIALOG: {
    DEL_TITLE: "Delete Role",
    DEL_MSG_PREFIX: "Delete role \"",
    DEL_MSG_SUFFIX: "\"? This cannot be undone.",
  }
};