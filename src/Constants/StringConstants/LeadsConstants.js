// src/Constants/LeadConstants.js
// Single source of truth for the Demo Request Leads (CRM) module.
// Keep status VALUES in sync with the backend enum returned in `status`
// and accepted by PATCH /v1/leads/{id}.

export const LEAD_STATUS = {
    NEW: "NEW",
    CONTACTED: "CONTACTED",
    DEMO_SCHEDULED: "DEMO_SCHEDULED",
    CONVERTED: "CONVERTED",
    LOST: "LOST",
};

export const LEAD_STATUS_LABELS = {
    [LEAD_STATUS.NEW]: "New",
    [LEAD_STATUS.CONTACTED]: "Contacted",
    [LEAD_STATUS.DEMO_SCHEDULED]: "Demo Scheduled",
    [LEAD_STATUS.CONVERTED]: "Converted",
    [LEAD_STATUS.LOST]: "Lost",
};

// Tailwind classes per status — pill background/text + a matching dot color.
export const LEAD_STATUS_STYLES = {
    [LEAD_STATUS.NEW]: {
        badge: "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-200",
        dot: "bg-blue-500",
    },
    [LEAD_STATUS.CONTACTED]: {
        badge: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
        dot: "bg-amber-500",
    },
    [LEAD_STATUS.DEMO_SCHEDULED]: {
        badge: "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200",
        dot: "bg-indigo-500",
    },
    [LEAD_STATUS.CONVERTED]: {
        badge: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
        dot: "bg-emerald-500",
    },
    [LEAD_STATUS.LOST]: {
        badge: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200",
        dot: "bg-red-500",
    },
};

// Lifecycle: NEW -> CONTACTED -> DEMO_SCHEDULED -> CONVERTED / LOST
// Used to constrain the "next status" dropdown in the details modal so a
// GLOBAL_ADMIN can't jump the lifecycle by accident. LOST is reachable from
// any non-terminal state (a lead can go cold at any point).
export const LEAD_STATUS_OPTIONS = [
    LEAD_STATUS.NEW,
    LEAD_STATUS.CONTACTED,
    LEAD_STATUS.DEMO_SCHEDULED,
    LEAD_STATUS.CONVERTED,
    LEAD_STATUS.LOST,
];

export const NEXT_STATUS_OPTIONS = {
    [LEAD_STATUS.NEW]: [LEAD_STATUS.NEW, LEAD_STATUS.CONTACTED, LEAD_STATUS.LOST],
    [LEAD_STATUS.CONTACTED]: [
        LEAD_STATUS.CONTACTED,
        LEAD_STATUS.DEMO_SCHEDULED,
        LEAD_STATUS.LOST,
    ],
    [LEAD_STATUS.DEMO_SCHEDULED]: [
        LEAD_STATUS.DEMO_SCHEDULED,
        LEAD_STATUS.CONVERTED,
        LEAD_STATUS.LOST,
    ],
    [LEAD_STATUS.CONVERTED]: [LEAD_STATUS.CONVERTED],
    [LEAD_STATUS.LOST]: [LEAD_STATUS.LOST, LEAD_STATUS.NEW],
};

// Same enum/labels used by the public demo-request form's STUDENT_STRENGTH_OPTIONS
// (kept identical here so the two features never drift apart).
export const STUDENT_STRENGTH_OPTIONS = [
    { value: "BELOW_100", label: "Below 100" },
    { value: "STRENGTH_100_300", label: "100 – 300" },
    { value: "STRENGTH_300_500", label: "300 – 500" },
    { value: "STRENGTH_500_1000", label: "500 – 1,000" },
    { value: "ABOVE_1000", label: "Above 1,000" },
];

export const STUDENT_STRENGTH_LABELS = STUDENT_STRENGTH_OPTIONS.reduce(
    (acc, opt) => ({ ...acc, [opt.value]: opt.label }),
    {}
);

export const DEFAULT_PAGE_SIZE = 20;

// Stat cards shown on the dashboard header, in display order.
// `key` must match a field in the /v1/leads/stats response payload.
export const LEAD_STAT_CARDS = [
    { key: "total", label: "Total Leads", accent: "blue" },
    { key: "newCount", label: "New", accent: "blue" },
    { key: "contacted", label: "Contacted", accent: "amber" },
    { key: "demoScheduled", label: "Demo Scheduled", accent: "indigo" },
    { key: "converted", label: "Converted", accent: "emerald" },
    { key: "lost", label: "Lost", accent: "red" },
];