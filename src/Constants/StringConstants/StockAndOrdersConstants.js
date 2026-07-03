// ══════════════════════════════════════════════════════════════════════
// SHARED — enums / labels / codes reused across multiple files
// ══════════════════════════════════════════════════════════════════════
export const STOCK_SHARED_CONSTS = {
    // Generic active/inactive status (Items, Stores)
    STATUS: {
        ALL: "All Status",
        ACTIVE_LABEL: "Active",
        ACTIVE_API: "ACTIVE",
        INACTIVE_LABEL: "Inactive",
        INACTIVE_API: "INACTIVE",
    },

    // Stock movement types (Movement, Stock, Transactions)
    MOVEMENT_TYPE: {
        IN: "IN",
        OUT: "OUT",
        TRANSFER: "TRANSFER",
        ORDER: "ORDER",
        ALL_TYPES: "All Types",
    },

    // Item categories — display label + API code (Transactions LOV fallback)
    ITEM_CATEGORY: {
        ALL: "All Categories",
        LOV_KEY: "ITEM_CATEGORY",
        OPTIONS: [
            { label: "Books", api: "BOOKS" },
            { label: "Uniform", api: "UNIFORM" },
            { label: "Lab", api: "LAB" },
            { label: "Stationery", api: "STATIONERY" },
            { label: "Sports", api: "SPORTS" },
            { label: "Furniture", api: "FURNITURE" },
            { label: "Electronics", api: "ELECTRONICS" },
            { label: "Cleaning", api: "CLEANING" },
            { label: "Other", api: "OTHER" },
        ],
    },

    // Student order lifecycle status (CreateStudentOrder, EditStudentOrder, StudentOrders, ViewOrder)
    ORDER_STATUS: {
        DRAFT_API: "DRAFT",
        DRAFT_LABEL: "Draft",
        CONFIRMED_API: "CONFIRMED",
        CONFIRMED_LABEL: "Confirmed",
        CANCELLED_API: "CANCELLED",
        CANCELLED_LABEL: "Cancelled",
        PENDING_LABEL: "Pending",
        APPROVED_LABEL: "Approved",
        DISPATCHED_API: "DISPATCHED",
        DISPATCHED_LABEL: "Dispatched",
        DELIVERED_API: "DELIVERED",
        DELIVERED_LABEL: "Delivered",
    },

    // Payment methods (ViewOrder / CreateStudentOrder / EditStudentOrder)
    PAYMENT_METHOD: {
        LOV_KEY: "PAYMENT_METHOD",
        CASH: "Cash",
        ONLINE: "Online",
        UPI: "UPI",
        CHEQUE: "Cheque",
        DEMAND_DRAFT: "Demand Draft",
        CARD: "Card",
        FREE_ISSUE: "Free Issue",
    },

    UNIT: {
        PCS: "PCS",
    },

    LOCALE: {
        DATE_GB: "en-GB",
        DATE_IN: "en-IN",
        CURRENCY_PREFIX: "₹",
    },

    // Common empty-state / pagination copy shared by most list screens
    COMMON: {
        LOADING_ELLIPSIS: "Loading…",
        SEARCH_BY_NAME_OR_CODE: "Search by name or code…",
        ROWS_PER_PAGE: "Rows per page:",
        ROWS_SHORT: "Rows:",
        RETRY: "Retry",
        EDIT: "Edit",
        VIEW: "View",
        CANCEL: "Cancel",
        DELETE: "Delete",
        ACTIVATE: "Activate",
        ACTIVATING: "Activating…",
        DEACTIVATING: "Deactivating…",
        STATUS_COL: "Status",
        ACTIONS_COL: "Actions",
        GENERIC_ERROR: "Something went wrong",
        BACK: "Back",
        SHOWING_RANGE: (from, to, total) => `Showing ${from} to ${to} of ${total}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// Items.jsx — Stock item catalogue (list, stats, activate/deactivate)
// ══════════════════════════════════════════════════════════════════════
export const ITEMS_CONSTS = {
    CONFIG: {
        SEARCH_DEBOUNCE_MS: 400,
    },
    TEXT: {
        TITLE: "Stock Items",
        SUBTITLE: "Manage inventory items, categories, stock levels and store distribution.",
        NEW_ITEM_BTN: "New Item",
        LOADING: "Loading items…",
        EMPTY_TITLE: "No Items Found",
        EMPTY_SUB: "There are no items to display.",
        NO_ITEMS: "No items",
        STOCK_LABEL: "Stock:",
        MIN_LABEL: "Min:",
    },
    STATS: {
        TOTAL_ITEMS: "Total Items",
        ACTIVE_ITEMS: "Active Items",
        CATEGORIES_COVERED: "Categories Covered",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        CATEGORY: "Category",
        UNIT: "Unit",
        UNIT_PRICE: "Unit Price",
        STOCK: "Stock",
        MIN_LVL: "Min Lvl",
        STATUS: "Status",
        ACTIONS: "Actions",
    },
    MESSAGES: {
        LOAD_FAILED: "Failed to load items",
        ITEM_DEACTIVATED: "Item deactivated",
        ITEM_ACTIVATED: "Item activated",
        STATUS_UPDATE_FAILED: "Failed to update item status",
        ITEM_UPDATED: "Item updated successfully",
        ITEM_CREATED: "Item created successfully",
        UPDATE_FAILED: "Failed to update item",
        CREATE_FAILED: "Failed to create item",
    },
};

// ══════════════════════════════════════════════════════════════════════
// Movement.jsx — Full stock movement history / audit log + CSV export
// ══════════════════════════════════════════════════════════════════════
export const MOVEMENT_CONSTS = {
    TEXT: {
        TITLE: "Stock Movement History",
        SUBTITLE: "Track all stock IN, OUT, ORDER and transfer movements across stores.",
        LOADING: "Loading movements…",
        EMPTY_TITLE: "No Movements Found",
        EMPTY_SUB: "Try adjusting your filters or date range.",
        NO_MOVEMENTS: "No movements",
        LOADING_STORES: "Loading stores…",
        ALL_STORES: "All Stores",
        SEARCH_ITEM_NAME_CODE: "Search item name, item code...",
        SEARCH_ITEM_STORE_USER: "Search item, store, user...",
        FROM: "From",
        TO: "To",
        DATE_LABEL: "Date:",
        STORE_CONTEXT_LABEL: "Store Context:",
        QTY_LABEL: "Qty:",
        STOCK_LABEL: "Stock:",
        REF_LABEL: "Ref:",
        REASON_LABEL: "Reason:",
    },
    STATS: {
        TOTAL_MOVEMENTS: "Total Movements",
        STOCK_IN: "Stock IN",
        STOCK_OUT: "Stock OUT",
        TRANSFERS: "Transfers",
        ORDERS: "Orders",
    },
    TABLE_HEADERS: {
        DATE_TIME: "Date & Time",
        ITEM: "Item",
        ITEM_ID: "Item ID",
        TYPE: "Type",
        STORE: "Store",
        STORE_LOG: "Store Log",
        DEST_STORE: "Dest Store",
        QTY: "Qty",
        BEFORE: "Before",
        AFTER: "After",
        BEFORE_AFTER: "Before → After",
        REFERENCE: "Reference",
        REASON: "Reason",
        REASON_REMARKS: "Reason / Remarks",
    },
    CONFIG: {
        SEARCH_DEBOUNCE_MS: 400,
        ROWS_PER_PAGE_OPTIONS: [10, 20, 50],
    },
    MESSAGES: {
        LOAD_FAILED: "Failed to load stock movements. Please try again.",
    },
    CSV: {
        MIME_TYPE: "text/csv;charset=utf-8;",
        FILE_NAME: (dateStr) => `stock-movements-${dateStr}.csv`,
    },
    ITEM_ID_PREFIX: (itemId) => `ITM-${itemId}`,
};

// ══════════════════════════════════════════════════════════════════════
// Stock.jsx — Stock management dashboard (overview page)
// ══════════════════════════════════════════════════════════════════════
export const STOCK_DASHBOARD_CONSTS = {
    TEXT: {
        TITLE: "Stock Management",
        SUBTITLE: "Monitor inventory, movements and low-stock alerts across all stores.",
        LOW_STOCK_BANNER: (count) =>
            `${count} item${count !== 1 ? "s" : ""} ${count === 1 ? "is" : "are"} at or below minimum stock level across your stores.`,
        VIEW_LOW_STOCK: "View Low Stock →",
        RECENT_MOVEMENTS: "Recent Movements",
        STORE_WISE_SUMMARY: "Store-wise Stock Summary",
        NO_STORES_FOUND: "No stores found",
        HEALTHY: "✓ Healthy",
        LOW_STOCK_ITEM_COUNT: (count) => `${count} low-stock item${count !== 1 ? "s" : ""}`,
        LOW_STOCK_ITEMS: "Low Stock Items",
        NEED_ATTENTION: (count) => `${count} item${count !== 1 ? "s" : ""} need attention`,
        NO_LOW_STOCK_ITEMS: "No low-stock items found",
        ALL_ABOVE_MIN: "All items are above minimum stock levels",
        NO_MOVEMENTS_FOUND: "No movements found",
        TRY_ADJUSTING_FILTERS: "Try adjusting your filters",
        DATE_ERROR: "To Date cannot be earlier than From Date.",
        CLEAR_ALL_FILTERS: "Clear all filters",
        AVAILABLE: "Available",
        MIN_LEVEL: "Min Level",
        ACTION: "Action",
        MIN_SUFFIX: "/ Min:",
        ADD_STOCK_INWARD: "Add Stock (Inward)",
        CURRENT_STOCK_LABEL: "Current stock:",
        CONFIRM_STOCK_IN: "Confirm Stock IN",
        SUBMITTED_LABEL: "Submitted:",
    },
    CONFIG: {
        MV_PAGE_SIZE: 5,
    },
    STATS: {
        TOTAL_STORES: "Total Stores",
        TOTAL_ITEMS: "Total Items",
        LOW_STOCK_ALERTS: "Low Stock Alerts",
        TOTAL_MOVEMENTS: "Total Movements",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        TYPE: "Type",
        STORE: "Store",
        QTY: "Qty",
        DATE_TIME: "Date & Time",
        BEFORE_AFTER: "Before → After",
        STATUS: "Status",
    },
    STOCK_LEVEL: {
        CRITICAL: "Critical",
        LOW: "Low",
    },
    STORE_TRANSFER_ROUTE: (from, to) => `${from} → ${to}`,
    STORE_FALLBACK: (storeId) => `Store ${storeId}`,
    ITEM_ID_PREFIX: (itemId) => `ITM-${itemId}`,
};

// ══════════════════════════════════════════════════════════════════════
// Stores.jsx — Store master list (list, stats, activate/deactivate)
// ══════════════════════════════════════════════════════════════════════
export const STORES_CONSTS = {
    TEXT: {
        TITLE: "Stores",
        SUBTITLE: "Manage store locations, codes and activation status.",
        NEW_STORE_BTN: "New Store",
        LOADING: "Loading stores…",
        ERROR_TITLE: "Error Loading Stores",
        EMPTY_TITLE: "No Stores Found",
        EMPTY_SUB: "There are no stores to display.",
        NO_STORES: "No stores",
        CODE_LABEL: "Code:",
        LOCATION_LABEL: "Location:",
    },
    STATS: {
        TOTAL_STORES: "Total Stores",
        ACTIVE_STORES: "Active Stores",
        INACTIVE_STORES: "Inactive Stores",
        TOTAL_ITEMS: "Total Items",
        LOW_STOCK: "Low Stock",
    },
    TABLE_HEADERS: {
        STORE_NAME: "Store Name",
        CODE: "Code",
        LOCATION: "Location",
        STATUS: "Status",
        ACTIONS: "Actions",
    },
    MESSAGES: {
        LOAD_STATS_FAILED: "Failed to load store stats",
        LOAD_FAILED: "Failed to load stores",
        DEACTIVATED: "Store deactivated successfully",
        ACTIVATED: "Store activated successfully",
        STATUS_UPDATE_FAILED: "Failed to update store status",
        UPDATED: "Store updated successfully",
        CREATED: "Store created successfully",
        UPDATE_FAILED: "Failed to update store",
        CREATE_FAILED: "Failed to create store",
    },
};

// ══════════════════════════════════════════════════════════════════════
// Transactions.jsx — Store stock view + Stock IN / OUT / Transfer actions
// ══════════════════════════════════════════════════════════════════════
export const TRANSACTIONS_CONSTS = {
    TEXT: {
        TITLE: "Store Stock View",
        SUBTITLE: "Manage stock movements — add, remove or transfer inventory across stores.",
        ALL_STORES: "All Stores",
        LOADING: "Loading…",
        LOADING_ITEMS: "Loading items…",
        EMPTY_TITLE: "No Items Found",
        NO_ITEMS: "No items",
        TRY_ADJUSTING_FILTERS: "Try adjusting your filters",
        SEARCH_ITEM_NAME_OR_CODE: "Search item name or code…",
        QTY_LABEL: "Qty:",
        MIN_LABEL: "Min:",
        RETRYING: "Retrying…",
        AGGREGATED_ACROSS_STORES: (count) => `Aggregated stock across all ${count} active stores`,
        ACTIVE_FILTER_COUNT: (count) => `(${count})`,
    },
    STOCK_LEVEL: {
        OK: "OK",
        OK_API: "OK",
        LOW: "Low",
        LOW_API: "LOW",
        CRITICAL: "Critical",
        CRITICAL_API: "CRITICAL",
    },
    STATS: {
        TOTAL_QTY: "Total Qty",
        QTY: "Qty",
    },
    STOCK_MODAL: {
        STOCK_IN_TITLE: "Stock IN",
        STOCK_IN_DESC: "Add stock to a store",
        STOCK_OUT_TITLE: "Stock OUT",
        STOCK_OUT_DESC: "Remove stock from a store",
        TRANSFER_TITLE: "Transfer",
        TRANSFER_DESC: "Move between stores",
        MODAL_HEADER: (type) => `Stock ${type.toUpperCase()}:`,
        TRANSFER_HEADER: "Transfer:",
    },
    MESSAGES: {
        LOAD_STORES_FAILED: "Failed to load stores.",
        LOAD_STOCK_FAILED: "Failed to load stock data.",
        LOAD_STOCK_FAILED_RETRY: "Failed to load stock data. Please try again.",
        FILTERS_CLEARED: "Filters cleared.",
        STOCK_ADDED: "Stock added successfully!",
        STOCK_REMOVED: "Stock removed successfully!",
        STOCK_TRANSFERRED: "Stock transferred successfully!",
        STOCK_REFRESHED: "Stock data refreshed.",
    },
    CONFIG: {
        SEARCH_DEBOUNCE_MS: 400,
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        CATEGORY: "Category",
        UNIT: "Unit",
        TOTAL_QTY: "Total Qty",
        QTY: "Qty",
        STOCKED_IN: "Stocked In",
        MIN: "Min",
        STATUS: "Status",
        ACTIONS: "Actions",
    },
    SORT: {
        DEFAULT: "id,desc",
    },
};

// ══════════════════════════════════════════════════════════════════════
// CreateStudentOrder.jsx — 3-step wizard: student & store → items → confirm
// ══════════════════════════════════════════════════════════════════════
export const CREATE_STUDENT_ORDER_CONSTS = {
    STEPS: {
        SELECT_STUDENT_STORE: "Select Student & Store",
        REVIEW_ITEMS: "Review & Edit Items",
        CONFIRM_ORDER: "Confirm Order",
    },
    TEXT: {
        TITLE: "New Student Order",
        SUBTITLE: "Create a new stock order for a student.",
        BACK: "Back",
        SUBMITTING: "Submitting…",
        LOADING: "Loading…",
        STUDENT_STORE_DETAILS: "Student & Store Details",
        STUDENT_LABEL: "Student",
        CHANGE: "Change",
        NO_STUDENTS_FOUND: "No students found.",
        AUTO_DETECTED_LABEL: "Auto-detected:",
        DEFAULT_ITEMS_HINT: "· Default items will be pre-loaded from class config",
        SEARCH_STUDENT_PH: "Search by name or admission no…",
        ISSUE_FROM_STORE: "Issue from Store",
        SELECT_STORE_PLACEHOLDER: "-- Select a store --",
        ORDER_DATE: "Order Date",
        PARENTS_NAME: "Parents Name",
        REVIEW_EDIT_ITEMS: "Review & Edit Items",
        STOCK_ISSUE_DETECTED: "Stock issue detected",
        STOCK_ISSUE_BODY: "Some quantities exceed available stock. Reduce them to confirm. You can still",
        SAVE_AS_DRAFT: "Save as Draft",
        LOADING_PREVIEW_ITEMS: "Loading items from preview…",
        NO_ITEMS_FOR_COMBINATION: "No items found for this combination",
        TRY_DIFFERENT_STUDENT_STORE: "Try a different student or store.",
        ONLY: "Only",
        AVAILABLE_REQUESTED: "available, requested",
        CONFIRM_ISSUE_STOCK: "Confirm & Issue Stock",
        REVIEW_BEFORE_SUBMIT: "Review your order before submitting.",
        STORE_LABEL: "Store",
        ORDER_DATE_LABEL: "Order Date:",
        PARENTS_LABEL: "Parents:",
        PAYMENT_METHOD: "Payment Method",
        SELECT_METHOD_PLACEHOLDER: "— Select method —",
        TXN_REF_NO: "Transaction / Reference No.",
        TXN_REF_PLACEHOLDER: "e.g. TXN20260316001",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        QTY: "Qty",
        AVAILABLE: "Available",
        UNIT: "Unit",
        TOTAL: "Total",
        UNIT_PRICE: "Unit Price",
        LINE_TOTAL: "Line Total"
    },
    MESSAGES: {
        NO_ITEMS_FOR_STUDENT_STORE: "No items found for this student/store combination.",
        LOAD_ITEMS_FAILED: "Failed to load items. Please try again.",
        SELECT_STUDENT_REQUIRED: "Please select a student.",
        SELECT_STORE_REQUIRED: "Please select a store.",
        KEEP_ONE_ITEM_REQUIRED: "Please keep at least one item.",
        SAVE_DRAFT_FAILED: "Failed to save draft.",
        CONFIRM_ORDER_FAILED: "Failed to confirm order.",
    },
    FALLBACKS: {
        STUDENT_ID: (id) => `Student #${id}`,
        ITEM_ID: (id) => `Item #${id}`,
        STORE_ID: (id) => `Store #${id}`,
        AVAIL_COUNT: (avail) => (avail === 0 ? "0 avail" : `${avail} avail`),
        ADMISSION_NO: (adm) => `ADM: ${adm}`,
        CLASS_NAME_SUFFIX: (className) => ` · ${className}`,
        STORE_CODE_SUFFIX: (code) => ` (${code})`,
    },
    CURRENCY: {
        UNIT_PRICE: (price) => `₹${Number(price).toFixed(2)}`,
        LINE_TOTAL: (total) => `₹${Number(total).toFixed(2)}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// EditStudentOrder.jsx — Edit an existing draft order (same wizard shape)
// ══════════════════════════════════════════════════════════════════════
export const EDIT_STUDENT_ORDER_CONSTS = {
    STEPS: {
        SELECT_STUDENT_STORE: "Select Student & Store",
        REVIEW_ITEMS: "Review & Edit Items",
        CONFIRM_ORDER: "Confirm Order",
    },
    TEXT: {
        TITLE: "Edit Student Order",
        SUBTITLE: "Update the order details and confirm to issue stock.",
        NO_ORDER_ID_TITLE: "No Order ID Found",
        NO_ORDER_ID_SUB: "Please open this page from the orders table.",
        BACK: "Back",
        SUBMITTING: "Submitting…",
        LOADING: "Loading…",
        STUDENT_STORE_DETAILS: "Student & Store Details",
        STUDENT_LABEL: "Student",
        CHANGE: "Change",
        NO_STUDENTS_FOUND: "No students found.",
        AUTO_DETECTED_LABEL: "Auto-detected:",
        SEARCH_STUDENT_PH: "Search by name or admission no…",
        ISSUE_FROM_STORE: "Issue from Store",
        SELECT_STORE_PLACEHOLDER: "-- Select a store --",
        ORDER_DATE: "Order Date",
        OPTIONAL_LBL: "(optional)",
        ORDER_NOTES_PLACEHOLDER: "e.g. AY 2025-26 opening kit",
        REVIEW_EDIT_ITEMS: "Review & Edit Items",
        DRAFT_ITEMS_HINT: "Showing items saved in this draft order. Remove unwanted items and click",
        STOCK_ISSUE_DETECTED: "Stock issue detected",
        STOCK_ISSUE_BODY: "Some item quantities exceed available stock. Reduce them to confirm. You can still",
        SAVE_AS_DRAFT: "Save as Draft",
        LOADING_ITEMS: "Loading items…",
        NO_ITEMS_FOR_COMBINATION: "No items found for this combination",
        ONLY: "Only",
        AVAILABLE_REQUESTED: "available, requested",
        CONFIRM_ISSUE_STOCK: "Confirm & Issue Stock",
        REVIEW_BEFORE_SUBMIT: "Review your order before submitting.",
        STORE_LABEL: "Store",
        ORDER_DATE_LABEL: "Order Date:",
        REMARKS_LABEL: "Remarks:",
        PAYMENT_METHOD: "Payment Method",
        SELECT_METHOD_PLACEHOLDER: "— Select method —",
        TXN_REF_NO: "Transaction / Reference No.",
        TXN_REF_PLACEHOLDER: "e.g. TXN20260316001",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        QTY: "Qty",
        AVAILABLE: "Available",
        UNIT: "Unit",
        TOTAL: "Total",
        UNIT_PRICE: "Unit Price",
        LINE_TOTAL: "Line Total"
    },
    MESSAGES: {
        SELECT_STUDENT_REQUIRED: "Please select a student.",
        SELECT_STORE_REQUIRED: "Please select a store.",
        KEEP_ONE_ITEM_REQUIRED: "Please keep at least one item.",
        SAVE_DRAFT_FAILED: "Failed to save draft.",
        CONFIRM_ORDER_FAILED: "Failed to confirm order.",
    },
    FALLBACKS: {
        STUDENT_ID: (id) => `Student #${id}`,
        STORE_ID: (id) => `Store #${id}`,
        AVAIL_COUNT: (avail) => (avail === 0 ? "0 avail" : `${avail} avail`),
        ADMISSION_NO: (adm) => `ADM: ${adm}`,
        CLASS_NAME_SUFFIX: (className) => ` · ${className}`,
        STORE_CODE_SUFFIX: (code) => ` (${code})`,
    },
    CURRENCY: {
        UNIT_PRICE: (price) => `₹${Number(price).toFixed(2)}`,
        LINE_TOTAL: (total) => `₹${Number(total).toFixed(2)}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// StudentOrderAddItem.jsx — Picker modal for adding extra items to an order
// ══════════════════════════════════════════════════════════════════════
export const STUDENT_ORDER_ADD_ITEM_CONSTS = {
    TEXT: {
        TITLE: "Add Extra Items",
        ALL_CATEGORIES: "All Categories",
        LOADING_ITEMS: "Loading items…",
        NO_ITEMS_FOUND: "No items found",
        NOT_APPLICABLE: "N/A",
        OUT_OF_STOCK: "Out of stock",
        TAP_TO_SELECT: "Tap items to select",
        SEARCH_ITEM_PH: "Search item by name or code...",
        CLEAR_FILTERS: "Clear filters",
        SELECTED_COUNT: (count) => `(${count})`,
        ITEMS_BTN: "Items",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        CATEGORY: "Category",
        UNIT: "Unit",
        STOCK: "Stock",
        PRICE: "Price"
    },
    MESSAGES: {
        LOAD_ITEMS_FAILED: "Failed to load items. Please try again.",
    },
    FALLBACKS: {
        ITEM_ID: (id) => `Item #${id}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// StudentOrders.jsx — Student order list, filters, cancel action
// ══════════════════════════════════════════════════════════════════════
export const STUDENT_ORDERS_CONSTS = {
    TEXT: {
        TITLE: "Student Orders",
        SUBTITLE: "Create and manage stock orders for students — track from draft through confirmed.",
        FROM: "From",
        TO: "To",
        LOADING: "Loading orders…",
        LOADING_ELLIPSIS: "Loading...",
        EMPTY_TITLE: "No Orders Found",
        EMPTY_SUB: "Try adjusting your filters.",
        NO_ORDERS: "No orders",
        CLASS_LABEL: "Class:",
        STORE_LABEL: "Store:",
        DATE_LABEL: "Date:",
        ITEMS_LABEL: "Items:",
        SEARCH_ORDER_PH: "Search by student name or order ID…",
        ALL_CLASSES: "All Classes",
        TYPE_ORDER_ID_PLACEHOLDER: "Type Order ID",
        THIS_STUDENT: "this student",
        ALL_STATUS: "All Status",
    },
    STATS: {
        DRAFT_ORDERS: "Draft Orders",
        CONFIRMED_ORDERS: "Confirmed Orders",
        CANCELLED_ORDERS: "Cancelled Orders",
    },
    TABLE_HEADERS: {
        STUDENT: "Student",
        CLASS: "Class",
        STORE: "Store",
        ITEMS: "Items",
        ORDER_DATE: "Order Date",
        STATUS: "Status",
        ACTIONS: "Actions",
    },
    CANCEL_MODAL: {
        TITLE: "Cancel Order?",
        CANCELLING: "Cancelling...",
        CONFIRM_BTN: "Yes, Cancel",
        DEFAULT_REASON: "Cancelled by admin - restore stock",
        KEEP_ORDER: "Keep Order"
    },
    MESSAGES: {
        SAVED_AS_DRAFT: "Order saved as draft.",
        CONFIRMED_STOCK_ISSUED: "Order confirmed & stock issued.",
        LOAD_CLASSES_FAILED: "Failed to fetch classes",
        LOAD_ORDERS_FAILED: "Failed to load student orders.",
        ORDER_CANCELLED: (id) => `Order #${id} cancelled.`,
        CANCEL_FAILED: (msg) => `Failed to cancel: ${msg}`,
    },
    ROLES: {
        SUPER_ADMIN: "SUPER_ADMIN",
        GLOBAL_ADMIN: "GLOBAL_ADMIN",
        STORE_ACCOUNTANT: "STORE_ACCOUNTANT",
    },
    SORT: {
        DEFAULT: "createdAt,desc",
    },
    ROUTES: {
        EDIT_ORDER: (orderId) => `/stock/studentOrders/editOrder?editId=${orderId}`,
    },
    CURRENCY: {
        AMOUNT: (val) => `₹${Number(val).toFixed(2)}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// ViewOrder.jsx — Read-only order / invoice view (printable)
// ══════════════════════════════════════════════════════════════════════
export const VIEW_ORDER_CONSTS = {
    TEXT: {
        ORDER_DATE_LABEL: "Order Date:",
        REF_TXN_LABEL: "Ref / Txn:",
        FIRM_NAME_LABEL: "Firm Name",
        DEFAULT_FIRM_NAME: "LEELA ENTERPRISES",
        FIRM_NAME_HINT: "(optional — will appear on print)",
        PARENT_LABEL: "Parent",
        NO_ITEMS_IN_ORDER: "No items found in this order.",
        ORDER_TOTAL: "Order Total",
        TOTAL_UNITS: "total units",
        PREPARING: "Preparing...",
        PRINT: "Print",
        GST_PLACEHOLDER: "e.g. 22AAAAA0000A1Z5",
        CLOSE: "Close",
        PRINT_COPIES_INFO: "🖨️ 3 copies · A4 Landscape · 1 page · 26+ rows",
        GST_LABEL: "GST Number",
    },
    TABLE_HEADERS: {
        CODE: "Code",
        ITEM_NAME: "Item Name",
        QTY: "Qty",
        RATE: "Rate",
        AMOUNT: "Amount",
    },
    MESSAGES: {
        LOAD_FAILED: "Failed to load order details. Showing cached data.",
    },
    FALLBACKS: {
        STORE_ID: (id) => `Store #${id}`,
        ITEM_ID: (idOrIdx) => `Item #${idOrIdx}`,
    },
    CURRENCY: {
        AMOUNT: (val) => `₹${Number(val).toFixed(2)}`,
    },
};

// ══════════════════════════════════════════════════════════════════════
// AddItemClassConfig.jsx — Bulk add/edit default items for a class
// ══════════════════════════════════════════════════════════════════════
export const ADD_ITEM_CLASS_CONFIG_CONSTS = {
    TEXT: {
        EDIT_TITLE: (className) => `Edit Items — ${className}`,
        ADD_TITLE: (className) => `Add Items to ${className}`,
        STEP_ADJUST_QTY: "Adjust quantities for existing items",
        STEP_SELECT_QTY: "Select items & set quantities",
        STEP_REVIEW: "Review selection, adjust quantities & add remarks",
        ALL_CATEGORIES: "All Categories",
        SEARCH_ITEM_PH: "Search by item name or code…",
        LOADING_ITEMS: "Loading items…",
        NO_ITEMS_FOUND: "No items found.",
        NO_ITEMS_SELECTED: "No items selected yet",
        ADJUST_BEFORE_SAVING: "— adjust quantities before saving",
        NO_ITEMS_SELECTED_SHORT: "No items selected.",
        REMARKS_HINT: "(optional — applies to all items)",
        REMARKS_PLACEHOLDER: "e.g. AY 2025-26 opening kit…",
        SUBTITLE: "Configure default items for each class. Items are auto-loaded when creating a student order.",
        ADD_FIRST_ITEM: "+ Add first item",
        UPDATING: "Updating…",
        SAVING: "Saving…",
        UPDATE_BTN: (count) => `Update (${count})`,
        SAVE_BTN: (count) => `Save (${count})`,
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        QUANTITY: "Quantity",
    },
    MESSAGES: {
        LOAD_ITEMS_FAILED: "Failed to load items. Please try again.",
    },
    STATUS: {
        ALL: "ALL",
        ACTIVE: "ACTIVE",
    },
};

// ══════════════════════════════════════════════════════════════════════
// ClassConfig.jsx — Class-wise default item configuration management
// ══════════════════════════════════════════════════════════════════════
export const CLASS_CONFIG_CONSTS = {
    TEXT: {
        TITLE: "Class Config",
        CLASSES_PANEL_TITLE: "Classes",
        NO_CLASSES_FOUND: "No classes found.",
        NO_ITEMS_FOR_CLASS: "No items configured for this class.",
        NO_ITEMS_CONFIGURED: "No items configured.",
        DEFAULT_CONFIG_TITLE: (className) => `${className} — Default Item Configuration`,
        DEFAULT_CONFIG_TITLE_FALLBACK: "Default Item Configuration",
    },
    STATS: {
        CLASSES_CONFIGURED: "Classes Configured",
        TOTAL_CONFIG_ENTRIES: "Total Config Entries",
        ITEMS_AVAILABLE: "Items Available",
    },
    TABLE_HEADERS: {
        ITEM: "Item",
        CATEGORY: "Category",
        DEFAULT_QUANTITY: "Default Quantity",
        REMARKS: "Remarks",
        ACTIONS: "Actions",
    },
    ACTIONS: {
        EDIT: "Edit",
        DELETE: "Delete",
    },
    MESSAGES: {
        LOAD_CLASSES_FAILED: "Failed to load classes.",
        LOAD_ITEMS_FAILED: "Failed to load items for this class.",
        ITEM_REMOVED: (itemName, className) => `"${itemName}" removed from ${className}.`,
        DELETE_FAILED: "Failed to delete item.",
        NO_ITEMS_TO_SAVE: "No items to save.",
        ITEM_UPDATED: (itemName) => `"${itemName}" updated successfully.`,
        ITEMS_ADDED: (count, className) => `${count} item${count > 1 ? "s" : ""} added to ${className}.`,
        UPDATE_FAILED: "Failed to update item.",
        ADD_FAILED: "Failed to add items.",
    },
};