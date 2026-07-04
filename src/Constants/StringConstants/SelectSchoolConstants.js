export const STORAGE_KEYS = {
  SCHOOL: "school",
  SCHOOL_ID: "schoolId",
  SCHOOL_CODE: "schoolCode",
  SCHOOL_NAME: "schoolName",
  USER: "user",
  TOKEN: "token",
  REQUIRE_SCHOOL_SELECTION: "requireSchoolSelection"
};

export const ROUTES = {
  DASHBOARD: "/dashboard",
  LOGIN: "/login"
};

export const CONFIG = {
  PAGE_SIZE: 20,
  DEBOUNCE_DELAY: 400,
  TIMEOUT_DELAY: 700,
  WINDOW_TARGET: "_blank",
  WINDOW_FEATURES: "noopener,noreferrer",
  KEY_ESCAPE: "Escape"
};

export const ROLES = {
  GLOBAL_ADMIN: "GLOBAL_ADMIN",
  LBL_GLOBAL_ADMIN: "Global Admin Console",
  TAG_GLOBAL_ADMIN: "GLOBAL ADMIN",
  LBL_SUPER_ADMIN: "Super Admin Console",
  TAG_SUPER_ADMIN: "SUPER ADMIN"
};

export const BOARDS = {
  CBSE: "CBSE",
  ICSE: "ICSE",
  STATE_BOARD: "STATE BOARD",
  STATE_BOARD_CAMEL: "State Board",
  LBL_ALL: "All Boards"
};

export const STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  LBL_ACTIVE_ONLY: "Active only",
  LBL_ALL: "All",
  LBL_INACTIVE_ONLY: "Inactive only",
  LBL_ACTIVE: "Active",
  LBL_INACTIVE: "Inactive"
};

export const STATS = {
  TOTAL_SCHOOLS: { KEY: "Total Schools", SUB: "All registered" },
  ACTIVE: { KEY: "Active", SUB: "Currently operating" },
  INACTIVE: { KEY: "Inactive", SUB: "Not operating" },
  CBSE: { KEY: "CBSE", SUB: "Central board" },
  ICSE: { KEY: "ICSE", SUB: "Indian certificate" },
  STATE_BOARD: { KEY: "State Board", SUB: "State curriculum" }
};

export const STYLES = {
  MODAL_BG: "rgba(0,0,0,0.45)",
  MODAL_BACKDROP: "blur(4px)",
  BORDER_ACCENTS: [
    "border-t-blue-500", "border-t-purple-500", "border-t-emerald-500",
    "border-t-orange-500", "border-t-pink-500", "border-t-teal-500",
  ],
  BOARD_BADGE: {
    CBSE: "bg-blue-50 text-blue-700 border border-blue-200",
    ICSE: "bg-amber-50 text-amber-700 border border-amber-200",
    STATE_BOARD: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    DEFAULT: "bg-gray-100 text-gray-600 border border-gray-200"
  }
};

export const UI_TEXT = {
  // SchoolSelectedCard
  MODAL_TITLE: "School Selected!",
  WORKSPACE_UPDATED: "Workspace successfully updated.",
  ACCESS_VALIDATED: "Access validated",
  FALLBACK_DASH: "—",
  OPENING: "Opening...",
  ENTER_DASHBOARD: "Enter Dashboard",
  MODAL_FOOTER: "Opens in a new tab · open multiple schools side by side",
  
  // SuperAdminSchools
  APP_NAME: "SchoolSpine",
  SIGN_OUT: "Sign Out",
  WELCOME: "Welcome, ",
  SUBTITLE_PT1: "Select a school to operate. Logged in as ",
  SEARCH_PLACEHOLDER: "Search by name, code or city...",
  LOADING: "Loading…",
  SCHOOL: "school",
  SCHOOLS: "schools",
  ERR_LOAD: "Failed to load schools",
  RETRY: "Retry",
  NO_SCHOOLS: "No schools found",
  ADJUST_FILTERS: "Try adjusting your search or filters",
  EST: "Est. ",
  ENTER_SCHOOL: "Enter School",
  PAGINATION: {
    PREV: "Prev",
    NEXT: "Next",
    PAGE: "Page ",
    OF: " of "
  }
}; 