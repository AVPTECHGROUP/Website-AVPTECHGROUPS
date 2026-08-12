import { 
  FileText, 
  Clock, 
  CheckCircle, 
  Truck, 
  XCircle 
} from "lucide-react";

/**
 * Global Configuration Settings
 */
export const STOCK_CONFIG = {
  SEARCH_DEBOUNCE_MS: 400, // Debounce time for stock/item searches
  ROWS_PER_PAGE_OPTIONS: [10, 20, 50], // Standard pagination row configurations
};

/**
 * Access Control Roles
 * Roles permitted to perform sensitive operational overrides (e.g., cancelling a confirmed order)
 */
export const CANCEL_CONFIRMED_ROLES = ["SUPER_ADMIN", "GLOBAL_ADMIN", "STORE_ACCOUNTANT"];

/**
 * Reusable Tailwind CSS Utility Classes
 */
export const UI_CLASSES = {
  // Reusable standard text inputs utilized across order forms
  INPUT_STANDARD: "w-full border rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 transition border-gray-200",
};

/**
 * Item Category Badge Themes
 * Centralizes the styling profiles used across Stock Lists, Class Configuration, and Item Add Modals.
 */
export const CATEGORY_COLORS = {
  // Standard Item Listing Style Variant
  STANDARD: {
    STATIONERY:  "bg-gray-100 text-gray-700",
    LAB:         "bg-purple-100 text-purple-700",
    SPORTS:      "bg-blue-100 text-blue-700",
    UNIFORM:     "bg-orange-100 text-orange-700",
    BOOKS:       "bg-yellow-100 text-yellow-700",
    FURNITURE:   "bg-amber-100 text-amber-700",
    ELECTRONICS: "bg-cyan-100 text-cyan-700",
    CLEANING:    "bg-teal-100 text-teal-700",
    OTHER:       "bg-gray-100 text-gray-500",
  },
  // Class Setup List & Configurations Specific Variant
  CLASS_CONFIG: {
    BOOKS:       "bg-blue-100 text-blue-700",
    STATIONERY:  "bg-gray-100 text-gray-700",
    LAB:         "bg-purple-100 text-purple-700",
    SPORTS:      "bg-green-100 text-green-700",
    UNIFORM:     "bg-yellow-100 text-yellow-700",
  },
  // Order Cart Modals Bordered Style Variant
  ORDER_ADD_ITEM: {
    STATIONERY:  "bg-yellow-100 text-yellow-700 border-yellow-200",
    BOOKS:       "bg-purple-100 text-purple-700 border-purple-200",
    LAB:         "bg-blue-100 text-blue-700 border-blue-200",
    SPORTS:      "bg-green-100 text-green-700 border-green-200",
    UNIFORM:     "bg-pink-100 text-pink-700 border-pink-200",
    ARTS:        "bg-orange-100 text-orange-700 border-orange-200",
  }
};

/**
 * Dropdown Selection Options
 */
export const DROPDOWN_OPTIONS = {
  // Filters used on the core Item Repository view
  ITEM_STATUS: [
    { label: "All Status", api: "" },
    { label: "Active", api: "ACTIVE" },
    { label: "Inactive", api: "INACTIVE" },
  ],
  // Filters used on the Student Orders monitoring view
  ORDER_STATUS: [
    { value: "", label: "All Status" },
    { value: "DRAFT", label: "Draft" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "CANCELLED", label: "Cancelled" },
  ]
};

/**
 * Order Status Complete Meta Maps
 * Ties styling parameters, visual labels, and contextual Icons directly to backend Order States.
 */
export const ORDER_STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    badgeCls: "bg-gray-100 text-gray-600 border border-gray-300",
  },
  PENDING: {
    label: "Pending",
    icon: Clock,
    badgeCls: "bg-yellow-100 text-yellow-700 border border-yellow-200",
  },
  CONFIRMED: {
    label: "Confirmed",
    icon: CheckCircle,
    badgeCls: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle,
    badgeCls: "bg-blue-100 text-blue-700 border border-blue-200",
  },
  DISPATCHED: {
    label: "Dispatched",
    icon: Truck,
    badgeCls: "bg-purple-100 text-purple-700 border border-purple-200",
  },
  DELIVERED: {
    label: "Delivered",
    icon: CheckCircle,
    badgeCls: "bg-green-100 text-green-700 border border-green-200",
  },
  CANCELLED: {
    label: "Cancelled",
    icon: XCircle,
    badgeCls: "bg-red-100 text-red-600 border border-red-200",
  }
};

// Fallback metadata in case status parameter evaluation errors out
export const FALLBACK_ORDER_STATUS = {
  label: "Unknown",
  icon: FileText,
  badgeCls: "bg-gray-100 text-gray-600 border border-gray-300",
};

/**
 * Stock Movement Metadata Configuration
 * Utilized across Stock Overview & Transaction Log trackers.
 */
export const MOVEMENT_TYPE_META = {
  IN: { 
    dot: "bg-green-500",
    badge: "text-green-700 bg-green-50 border border-green-200",
    label: "IN",
    textCls: "text-green-600",
    prefix: "+"
  },
  OUT: { 
    dot: "bg-red-500",
    badge: "text-red-600 bg-red-50 border border-red-200",
    label: "OUT",
    textCls: "text-red-500",
    prefix: "-"
  },
  TRANSFER: { 
    dot: "bg-blue-500",
    badge: "text-blue-700 bg-blue-50 border border-blue-200",
    label: "TRANSFER",
    textCls: "text-blue-600",
    prefix: "±"
  },
  ORDER: { 
    dot: "bg-orange-500",
    badge: "text-orange-700 bg-orange-50 border border-orange-200",
    label: "ORDER",
    textCls: "text-orange-600",
    prefix: "-"
  }
};

/**
 * Step Navigation Workflow Configuration
 * Active wizard layout used during order generation maps.
 */
export const STUDENT_ORDER_STEPS = [
  { id: 1, label: "Select Student & Store" },
  { id: 2, label: "Review & Edit Items" },
  { id: 3, label: "Confirm Order" },
];

/**
 * Dynamic Inventory Health Visual Indicators
 * Evaluates the inventory level status versus safe limits to return critical coloring context
 * @param {number} qty - Current Stock Value
 * @param {number} min - Specified Threshold Minimum Level
 * @returns {string} Tailwind background class name strings
 */
export const getStockBarColor = (qty, min) => {
  if (!qty || qty === 0) return "bg-red-500";
  if (qty <= min / 2) return "bg-red-500";
  if (qty < min) return "bg-orange-400";
  return "bg-blue-500";
};