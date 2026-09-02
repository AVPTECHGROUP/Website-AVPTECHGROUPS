import React, { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import {
    getAllSalaryStructures,
    getSalaryStructureByUser,
    createSalaryStructureByUser,
    updateSalaryStructureByUser,
    deleteSalaryStructureByUser,
    createSalaryStructuresBulk,
} from "../../Api/SalaryStructure/Salarystructure.js";

import {
    RoleBadge,
    Spinner,
    ErrorBanner,
    formatCurrency,
    normalizeList,
} from "./Payrollui.jsx";

const PAGE_SIZE_OPTIONS = [15, 30, 50];

// Canonical role keys — match what the /all list endpoint actually returns
// (upper case) and what RoleBadge's style map keys on. Salarystructure.js
// title-cases these for you at the wire boundary (TEACHER -> Teacher) for the
// by-user endpoints, so every caller in this file can stay upper case.
const ROLE_META = [
    { key: "TEACHER", emoji: "🎓", label: "Teacher" },
    { key: "ADMIN", emoji: "🔧", label: "Admin" },
    { key: "ACCOUNTANT", emoji: "📒", label: "Accountant" },
    { key: "PRINCIPAL", emoji: "🏛️", label: "Principal" },
];
const USER_TYPES = ROLE_META.map((r) => r.key);

const emptyForm = () => ({
    userId: "",
    userType: "TEACHER",
    salaryType: "MONTHLY",
    effectiveFrom: "",
    effectiveTo: "",
    baseSalary: "",
    houseRentAllowance: "",
    travelAllowance: "",
    dearnessAllowance: "",
    specialAllowance: "",
    otherAllowances: "",
    providentFund: "",
    professionalTax: "",
    incomeTax: "",
    otherDeductions: "",
    leaveDeductionPerDay: "",
    payrollEligible: true,
    remarks: "",
});

const emptyBulkForm = () => ({
    overwriteExisting: false,
    salaryType: "MONTHLY",
    effectiveFrom: "",
    baseSalary: "",
    houseRentAllowance: "",
    travelAllowance: "",
    dearnessAllowance: "",
    specialAllowance: "",
    otherAllowances: "",
    providentFund: "",
    professionalTax: "",
    incomeTax: "",
    otherDeductions: "",
    leaveDeductionPerDay: "",
    payrollEligible: true,
    remarks: "",
});

const n = (v) => Number(v) || 0;

function calcPreview(form) {
    const gross =
        n(form.baseSalary) +
        n(form.houseRentAllowance) +
        n(form.travelAllowance) +
        n(form.dearnessAllowance) +
        n(form.specialAllowance) +
        n(form.otherAllowances);
    const deductions =
        n(form.providentFund) + n(form.professionalTax) + n(form.incomeTax) + n(form.otherDeductions);
    return { gross, deductions, net: gross - deductions };
}

const rowKey = (row) => `${row.userType}:${row.userId}`;

// Field-by-field prefill from an already-loaded list row. The /all endpoint
// resolves final values for every employee (override or inherited), so this
// is real data — used both as the instant prefill and as the fallback when
// the by-user detail endpoint 404s (no individual override yet).
function formFromRow(row) {
    return {
        ...emptyForm(),
        userId: row.userId,
        userType: row.userType,
        salaryType: row.salaryType || "MONTHLY",
        effectiveFrom: row.effectiveFrom || "",
        effectiveTo: row.effectiveTo || "",
        baseSalary: row.baseSalary ?? "",
        houseRentAllowance: row.houseRentAllowance ?? "",
        travelAllowance: row.travelAllowance ?? "",
        dearnessAllowance: row.dearnessAllowance ?? "",
        specialAllowance: row.specialAllowance ?? "",
        otherAllowances: row.otherAllowances ?? "",
        providentFund: row.providentFund ?? "",
        professionalTax: row.professionalTax ?? "",
        incomeTax: row.incomeTax ?? "",
        otherDeductions: row.otherDeductions ?? "",
        leaveDeductionPerDay: row.leaveDeductionPerDay ?? "",
        payrollEligible: row.payrollEligible ?? true,
        remarks: row.remarks || "",
    };
}

const isNotFoundError = (msg) => /not found/i.test(msg || "") || /\b404\b/.test(msg || "");

export default function PayrollStructures() {
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(15);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(null);

    // { isNew, userName, employeeCode, hasOverride } — the userId/userType being
    // edited live in `form` itself so inputs stay simple controlled fields.
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");
    const [reverting, setReverting] = useState(false);

    // Row selection (for bulk setup "apply to selected employees") — keyed by
    // `${userType}:${userId}` and kept as { [key]: row } so the bulk modal can
    // show names without re-fetching, and selection can persist across pages.
    const [selectedRows, setSelectedRows] = useState({});
    const selectedCount = Object.keys(selectedRows).length;

    // Bulk setup wizard
    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkMode, setBulkMode] = useState("role"); // "role" | "selected"
    const [bulkStep, setBulkStep] = useState(0);
    const [bulkTargetRoles, setBulkTargetRoles] = useState([]);
    const [bulkForm, setBulkForm] = useState(emptyBulkForm());
    const [bulkSaving, setBulkSaving] = useState(false);
    const [bulkError, setBulkError] = useState("");
    const [bulkExisting, setBulkExisting] = useState([]);
    const [bulkExistingLoading, setBulkExistingLoading] = useState(false);

    const bulkStepNames = bulkMode === "role"
        ? ["Select Roles", "Define Template", "Review", "Confirm"]
        : ["Define Template", "Review", "Confirm"];
    const bulkStepName = bulkStepNames[bulkStep];

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getAllSalaryStructures(page, pageSize);
            const { items: normalizedItems, totalPages: normalizedTotalPages } = normalizeList(res);
            setItems(normalizedItems);
            setTotalPages(normalizedTotalPages || 1);
            const pagination = res?.data?.pagination;
            setTotalElements(typeof pagination?.totalElements === "number" ? pagination.totalElements : null);
        } catch (e) {
            const msg = e.message || "Failed to load salary structures";
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, [page, pageSize]);

    useEffect(() => {
        load();
    }, [load]);

    // Fetch which employees of the selected role(s) already have a resolved
    // structure once the wizard reaches Review, so that step shows real data
    // instead of guessing. There's no staff-roster endpoint available, so
    // unconfigured employees can't be enumerated here — only what's already
    // configured.
    useEffect(() => {
        if (!bulkOpen || bulkMode !== "role" || bulkStepName !== "Review" || bulkTargetRoles.length === 0) return;
        let cancelled = false;
        setBulkExistingLoading(true);
        (async () => {
            try {
                const res = await getAllSalaryStructures(0, 200);
                const { items: all } = normalizeList(res);
                if (!cancelled) setBulkExisting(all.filter((r) => bulkTargetRoles.includes(r.userType)));
            } catch {
                if (!cancelled) setBulkExisting([]);
            } finally {
                if (!cancelled) setBulkExistingLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [bulkOpen, bulkMode, bulkStepName, bulkTargetRoles]);

    async function openEdit(row) {
        setFormError("");
        setEditing({
            isNew: false,
            userName: row.userName,
            employeeCode: row.employeeCode,
            hasOverride: !!row.isOverride,
        });
        // Prefill instantly from the row's already-resolved values so the
        // modal is never blank while the detail call is in flight.
        setForm(formFromRow(row));
        try {
            const detail = await getSalaryStructureByUser(row.userId, row.userType);
            setForm((f) => ({ ...f, ...detail, userId: row.userId, userType: row.userType }));
        } catch (e) {
            // A 404 here just means no individual override exists yet (the
            // employee inherits the role's bulk template) — expected, not an
            // error. The row-derived prefill above already covers it.
            if (!isNotFoundError(e.message)) {
                const msg = e.message || "Failed to load latest structure detail";
                setFormError(msg);
                toast.error(msg);
            }
        }
    }

    function openCreate() {
        setFormError("");
        setEditing({ isNew: true, userName: "", employeeCode: "", hasOverride: false });
        setForm(emptyForm());
    }

    function closeEdit() {
        setEditing(null);
    }

    function buildPayload() {
        return {
            salaryType: form.salaryType,
            effectiveFrom: form.effectiveFrom,
            effectiveTo: form.effectiveTo || null,
            baseSalary: n(form.baseSalary),
            houseRentAllowance: n(form.houseRentAllowance),
            travelAllowance: n(form.travelAllowance),
            dearnessAllowance: n(form.dearnessAllowance),
            specialAllowance: n(form.specialAllowance),
            otherAllowances: n(form.otherAllowances),
            providentFund: n(form.providentFund),
            professionalTax: n(form.professionalTax),
            incomeTax: n(form.incomeTax),
            otherDeductions: n(form.otherDeductions),
            leaveDeductionPerDay: n(form.leaveDeductionPerDay),
            payrollEligible: !!form.payrollEligible,
            remarks: form.remarks || "",
        };
    }

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        setFormError("");
        try {
            const payload = buildPayload();
            if (editing.isNew) {
                if (!form.userId) throw new Error("Enter a User ID first.");
                await createSalaryStructureByUser(Number(form.userId), form.userType, payload);
                toast.success("Salary structure created.");
            } else {
                await updateSalaryStructureByUser(form.userId, form.userType, payload);
                toast.success(`Salary structure saved for ${editing.userName}.`);
            }
            closeEdit();
            await load();
        } catch (e) {
            const msg = e.message || "Failed to save salary structure";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setSaving(false);
        }
    }

    async function handleRevertToTemplate() {
        if (!editing || editing.isNew) return;
        if (!window.confirm(`Revert ${editing.userName} to the role's bulk template? This deletes their individual override.`)) return;
        setReverting(true);
        setFormError("");
        try {
            await deleteSalaryStructureByUser(form.userId, form.userType);
            toast.success(`${editing.userName} reverted to the bulk template.`);
            closeEdit();
            await load();
        } catch (e) {
            const msg = e.message || "Failed to revert to template";
            setFormError(msg);
            toast.error(msg);
        } finally {
            setReverting(false);
        }
    }

    async function handleDelete(row) {
        if (!window.confirm(`Delete the salary structure for ${row.userName}? This cannot be undone.`)) return;
        try {
            await deleteSalaryStructureByUser(row.userId, row.userType);
            toast.success(`Deleted salary structure for ${row.userName}.`);
            setSelectedRows((prev) => {
                const next = { ...prev };
                delete next[rowKey(row)];
                return next;
            });
            await load();
        } catch (e) {
            const msg = e.message || "Failed to delete salary structure";
            setError(msg);
            toast.error(msg);
        }
    }

    // ── Row selection ──────────────────────────────────────────────
    function toggleRow(row) {
        const key = rowKey(row);
        setSelectedRows((prev) => {
            const next = { ...prev };
            if (next[key]) delete next[key];
            else next[key] = row;
            return next;
        });
    }

    function toggleAllOnPage(checked) {
        setSelectedRows((prev) => {
            const next = { ...prev };
            items.forEach((row) => {
                const key = rowKey(row);
                if (checked) next[key] = row;
                else delete next[key];
            });
            return next;
        });
    }

    function clearSelection() {
        setSelectedRows({});
    }

    const allOnPageSelected = items.length > 0 && items.every((row) => selectedRows[rowKey(row)]);

    // ── Bulk setup wizard ──────────────────────────────────────────────
    function openBulk(mode) {
        setBulkError("");
        setBulkForm(emptyBulkForm());
        setBulkExisting([]);
        setBulkTargetRoles([]);
        setBulkStep(0);
        setBulkMode(mode === "selected" && selectedCount > 0 ? "selected" : "role");
        setBulkOpen(true);
    }

    function closeBulk() {
        setBulkOpen(false);
    }

    function toggleBulkRole(roleKey) {
        setBulkTargetRoles((prev) => (prev.includes(roleKey) ? prev.filter((r) => r !== roleKey) : [...prev, roleKey]));
    }

    function buildBulkPayload(targetPart) {
        return {
            ...targetPart,
            overwriteExisting: !!bulkForm.overwriteExisting,
            salaryType: bulkForm.salaryType,
            effectiveFrom: bulkForm.effectiveFrom,
            baseSalary: n(bulkForm.baseSalary),
            houseRentAllowance: n(bulkForm.houseRentAllowance),
            travelAllowance: n(bulkForm.travelAllowance),
            dearnessAllowance: n(bulkForm.dearnessAllowance),
            specialAllowance: n(bulkForm.specialAllowance),
            otherAllowances: n(bulkForm.otherAllowances),
            providentFund: n(bulkForm.providentFund),
            professionalTax: n(bulkForm.professionalTax),
            incomeTax: n(bulkForm.incomeTax),
            otherDeductions: n(bulkForm.otherDeductions),
            leaveDeductionPerDay: n(bulkForm.leaveDeductionPerDay),
            payrollEligible: !!bulkForm.payrollEligible,
            remarks: bulkForm.remarks || "",
        };
    }

    async function handleBulkSubmit() {
        setBulkSaving(true);
        setBulkError("");
        try {
            if (!bulkForm.effectiveFrom) throw new Error("Effective From is required.");

            if (bulkMode === "role") {
                if (bulkTargetRoles.length === 0) throw new Error("Select at least one role.");
                // The confirmed bulk endpoint takes one targetRole per call, so
                // multiple selected roles mean one call per role, sequentially.
                for (const role of bulkTargetRoles) {
                    await createSalaryStructuresBulk(buildBulkPayload({ targetRole: role }));
                }
                toast.success(`Bulk template applied to ${bulkTargetRoles.length} role${bulkTargetRoles.length > 1 ? "s" : ""}.`);
            } else {
                const targetUserIds = Object.values(selectedRows).map((r) => r.userId);
                if (targetUserIds.length === 0) throw new Error("Select at least one employee first.");
                await createSalaryStructuresBulk(buildBulkPayload({ targetUserIds }));
                toast.success(`Bulk template applied to ${targetUserIds.length} employee${targetUserIds.length > 1 ? "s" : ""}.`);
            }

            closeBulk();
            clearSelection();
            await load();
        } catch (e) {
            const msg = e.message || "Failed to apply bulk salary structure";
            setBulkError(msg);
            toast.error(msg);
        } finally {
            setBulkSaving(false);
        }
    }

    function goBulkNext() {
        if (bulkStepName === "Select Roles") {
            if (bulkTargetRoles.length === 0) {
                setBulkError("Select at least one role.");
                return;
            }
            if (!bulkForm.effectiveFrom) {
                setBulkError("Effective From is required.");
                return;
            }
        }
        if (bulkStepName === "Define Template" && bulkMode === "selected" && !bulkForm.effectiveFrom) {
            setBulkError("Effective From is required.");
            return;
        }
        setBulkError("");
        if (bulkStep < bulkStepNames.length - 1) {
            setBulkStep((s) => s + 1);
        } else {
            handleBulkSubmit();
        }
    }

    function goBulkPrev() {
        setBulkError("");
        setBulkStep((s) => Math.max(0, s - 1));
    }

    // ── Pagination footer ──────────────────────────────────────────────
    function handlePageSizeChange(e) {
        setPageSize(Number(e.target.value));
        setPage(0);
    }
    const goPrev = () => setPage((p) => Math.max(0, p - 1));
    const goNext = () => setPage((p) => Math.min(totalPages - 1, p + 1));

    const rangeStart = totalElements != null && items.length > 0 ? page * pageSize + 1 : null;
    const rangeEnd = totalElements != null ? Math.min(page * pageSize + items.length, totalElements) : null;

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Salary Structures</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Set or override salary components per employee. An employee without an individual override inherits
                        their role's bulk template.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => openBulk("role")} className="bg-white text-slate-900 border border-slate-300 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-50">
                        ⚡ Bulk Setup
                    </button>
                    <button onClick={openCreate} className="bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-800">
                        + Add Structure
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} onRetry={load} />

            {selectedCount > 0 && (
                <div className="flex items-center gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-2.5 mb-4">
                    <span className="text-xs font-semibold text-blue-800">{selectedCount} selected</span>
                    <button onClick={() => openBulk("selected")} className="text-xs font-semibold text-blue-700 border border-blue-600 rounded px-2.5 py-1 hover:bg-blue-100">
                        ⚡ Apply Bulk Template
                    </button>
                    <button onClick={clearSelection} className="text-xs font-semibold text-slate-500 border border-slate-200 rounded px-2.5 py-1 bg-white hover:bg-slate-50">
                        ✕ Clear
                    </button>
                </div>
            )}

            {loading ? (
                <Spinner label="Loading salary structures…" />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                            <th className="px-4 py-2.5 w-8">
                                <input type="checkbox" checked={allOnPageSelected} onChange={(e) => toggleAllOnPage(e.target.checked)} />
                            </th>
                            <th className="text-left px-4 py-2.5 font-bold">Employee</th>
                            <th className="text-left px-4 py-2.5 font-bold">Role</th>
                            <th className="text-left px-4 py-2.5 font-bold">Base Salary</th>
                            <th className="text-left px-4 py-2.5 font-bold">Gross</th>
                            <th className="text-left px-4 py-2.5 font-bold">Net</th>
                            <th className="text-left px-4 py-2.5 font-bold">Source</th>
                            <th className="text-left px-4 py-2.5 font-bold">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={8} className="text-center text-slate-400 text-sm py-10">No salary structures found.</td></tr>
                        ) : (
                            items.map((row) => (
                                <tr key={rowKey(row)} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={!!selectedRows[rowKey(row)]} onChange={() => toggleRow(row)} />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800">{row.userName}</div>
                                        <div className="text-[11px] text-slate-400">{row.employeeCode}</div>
                                    </td>
                                    <td className="px-4 py-3"><RoleBadge role={row.userType} /></td>
                                    <td className="px-4 py-3 text-slate-600">{formatCurrency(row.baseSalary)}</td>
                                    <td className="px-4 py-3 text-emerald-700 font-medium">{formatCurrency(row.grossSalary)}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(row.netSalary)}</td>
                                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          row.isOverride ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {row.isOverride ? "Individual override" : "Bulk template"}
                      </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openEdit(row)} className="text-xs font-semibold text-blue-700 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50">Edit</button>
                                            <button onClick={() => handleDelete(row)} className="text-xs font-semibold text-red-600 border border-red-300 rounded px-2 py-1 hover:bg-red-50">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/60">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span>Rows per page:</span>
                            <select
                                value={pageSize}
                                onChange={handlePageSizeChange}
                                className="border border-slate-200 rounded-md px-2 py-1 text-xs bg-white text-slate-700"
                            >
                                {PAGE_SIZE_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            {rangeStart != null && (
                                <span className="hidden sm:inline text-slate-400">
                                    · Showing {rangeStart}–{rangeEnd} of {totalElements}
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-slate-500">Page {page + 1} of {totalPages}</span>
                            <div className="flex items-center gap-1">
                                <button
                                    onClick={goPrev}
                                    disabled={page <= 0}
                                    aria-label="Previous page"
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                                >
                                    ‹
                                </button>
                                <button
                                    onClick={goNext}
                                    disabled={page >= totalPages - 1}
                                    aria-label="Next page"
                                    className="w-7 h-7 flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100"
                                >
                                    ›
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {editing && (
                <StructureModal
                    editing={editing}
                    form={form}
                    setForm={setForm}
                    saving={saving}
                    reverting={reverting}
                    formError={formError}
                    onCancel={closeEdit}
                    onSave={handleSave}
                    onRevert={handleRevertToTemplate}
                />
            )}

            {bulkOpen && (
                <BulkWizardModal
                    mode={bulkMode}
                    stepNames={bulkStepNames}
                    step={bulkStep}
                    stepName={bulkStepName}
                    roles={bulkTargetRoles}
                    onToggleRole={toggleBulkRole}
                    form={bulkForm}
                    setForm={setBulkForm}
                    saving={bulkSaving}
                    formError={bulkError}
                    existing={bulkExisting}
                    existingLoading={bulkExistingLoading}
                    selectedRows={selectedRows}
                    onRemoveSelected={(row) => toggleRow(row)}
                    onNext={goBulkNext}
                    onPrev={goBulkPrev}
                    onCancel={closeBulk}
                />
            )}
        </div>
    );
}

function StructureModal({ editing, form, setForm, saving, reverting, formError, onCancel, onSave, onRevert }) {
    const set = (k) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [k]: value }));
    };

    const preview = useMemo(() => calcPreview(form), [form]);

    const httpMethod = editing.isNew ? "POST" : "PUT";
    const apiPath = `/v1/payroll/salary-structures/users/${form.userId || "{userId}"}`;

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">Salary Structure — Individual</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Set or override salary components for a single employee</p>
                        </div>
                        <button onClick={onCancel} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0">✕</button>
                    </div>
                </div>

                <div className="p-6">
                    <ErrorBanner message={formError} onRetry={null} />

                    {!editing.isNew && (
                        <div className="flex items-start gap-2.5 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-[12.5px] text-amber-900 mb-4">
                            <span className="shrink-0">⚡</span>
                            <div className="flex-1">
                                <strong>{editing.userName}</strong> currently {editing.hasOverride ? "has an" : "inherits the"}{" "}
                                <strong>{form.userType?.toLowerCase()} bulk template</strong>. Saving here creates an individual
                                override — bulk template changes won't affect this employee in future.
                            </div>
                            <button
                                disabled={reverting}
                                onClick={onRevert}
                                className="bg-white border border-amber-300 text-amber-800 text-xs font-semibold px-3 py-1.5 rounded-lg shrink-0 disabled:opacity-50"
                            >
                                {reverting ? "Reverting…" : "Revert to Template"}
                            </button>
                        </div>
                    )}

                    <SectionLabel>Employee</SectionLabel>
                    <div className="grid grid-cols-2 gap-3 mb-5">
                        <Field label="Employee">
                            {editing.isNew ? (
                                // No confirmed staff-directory endpoint was available (nothing in
                                // Payrollservice.jsx lists all employees), so new structures are
                                // created by User ID rather than the searchable name dropdown the
                                // mockup shows. Wire this to a real employee-list endpoint (e.g.
                                // USERS / TEACHERS_DROPDOWN from Endpoints.js) for parity with the
                                // mockup if you want it.
                                <div className="grid grid-cols-3 gap-2">
                                    <input
                                        type="number"
                                        placeholder="User ID"
                                        value={form.userId}
                                        onChange={set("userId")}
                                        className="col-span-1 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                                    />
                                    <select value={form.userType} onChange={set("userType")} className="col-span-2 border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                        {USER_TYPES.map((t) => (
                                            <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()}</option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg px-3 py-2 text-sm bg-slate-50 text-slate-600">
                                    {editing.userName} — {form.userType} ({editing.employeeCode})
                                </div>
                            )}
                        </Field>
                        <Field label="Salary Type">
                            <select value={form.salaryType} onChange={set("salaryType")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                <option value="MONTHLY">Monthly</option>
                                <option value="PER_DAY">Per Day</option>
                            </select>
                        </Field>
                        <Field label="Effective From">
                            <input type="date" value={form.effectiveFrom} onChange={set("effectiveFrom")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        </Field>
                        <Field label="Effective To (leave blank = active)">
                            <input type="date" value={form.effectiveTo} onChange={set("effectiveTo")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        </Field>
                    </div>

                    <SectionLabel>Base Salary</SectionLabel>
                    <div className="mb-5">
                        <Field label="Basic Salary (₹)">
                            <input type="number" value={form.baseSalary} onChange={set("baseSalary")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                        </Field>
                    </div>

                    <SectionLabel>Allowances</SectionLabel>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <Field label="House Rent (HRA)"><input type="number" value={form.houseRentAllowance} onChange={set("houseRentAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Travel Allowance"><input type="number" value={form.travelAllowance} onChange={set("travelAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Dearness Allowance"><input type="number" value={form.dearnessAllowance} onChange={set("dearnessAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Special Allowance"><input type="number" value={form.specialAllowance} onChange={set("specialAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Other Allowances"><input type="number" value={form.otherAllowances} onChange={set("otherAllowances")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                    </div>

                    <SectionLabel>Deductions</SectionLabel>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <Field label="Provident Fund"><input type="number" value={form.providentFund} onChange={set("providentFund")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Professional Tax"><input type="number" value={form.professionalTax} onChange={set("professionalTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Income Tax (TDS)"><input type="number" value={form.incomeTax} onChange={set("incomeTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Other Deductions"><input type="number" value={form.otherDeductions} onChange={set("otherDeductions")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                        <Field label="Leave Deduction / Day"><input type="number" value={form.leaveDeductionPerDay} onChange={set("leaveDeductionPerDay")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                        <div className="text-[11px] font-extrabold uppercase tracking-wide text-blue-800 mb-3">Calculated Preview</div>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <div className="text-[11px] text-slate-500">Gross Salary</div>
                                <div className="text-lg font-extrabold text-emerald-700">{formatCurrency(preview.gross)}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-500">Total Deductions</div>
                                <div className="text-lg font-extrabold text-red-600">-{formatCurrency(preview.deductions)}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-slate-500">Net Salary</div>
                                <div className="text-lg font-extrabold text-slate-900">{formatCurrency(preview.net)}</div>
                            </div>
                        </div>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-4">
                        <input type="checkbox" checked={form.payrollEligible} onChange={set("payrollEligible")} />
                        Payroll Eligible — Include in payroll generation
                    </label>

                    <Field label="Remarks (optional)">
            <textarea
                value={form.remarks}
                onChange={set("remarks")}
                placeholder="e.g. Revised per performance review May 2026…"
                rows={2}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm resize-y"
            />
                    </Field>
                </div>

                <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <button onClick={onCancel} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2 bg-white">
                        Cancel
                    </button>
                    <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono bg-slate-900 text-emerald-300 px-2 py-1 rounded">
              {httpMethod} {apiPath}
            </span>
                        <button
                            disabled={saving}
                            onClick={onSave}
                            className="text-xs font-semibold text-white bg-slate-900 rounded-lg px-3.5 py-2 disabled:opacity-50"
                        >
                            {saving ? "Saving…" : "Save Individual Structure"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

const BULK_NEXT_LABEL = {
    "Select Roles": "Next: Define Template →",
    "Define Template": "Next: Review →",
    "Review": "Next: Confirm →",
};

function BulkWizardModal({
                             mode, stepNames, step, stepName, roles, onToggleRole,
                             form, setForm, saving, formError, existing, existingLoading,
                             selectedRows, onRemoveSelected, onNext, onPrev, onCancel,
                         }) {
    const set = (k) => (e) => {
        const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [k]: value }));
    };

    const preview = useMemo(() => calcPreview(form), [form]);
    const selectedList = Object.values(selectedRows);
    const roleLabels = roles.map((key) => ROLE_META.find((r) => r.key === key)?.label || key);

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-5 border-b border-slate-200">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-base font-extrabold text-slate-900">⚡ Bulk Salary Structure Setup</h2>
                            <p className="text-xs text-slate-500 mt-0.5">Define a salary template and apply it to multiple employees at once</p>
                        </div>
                        <button onClick={onCancel} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500 shrink-0">✕</button>
                    </div>
                </div>

                <div className="p-6">
                    {/* Step indicator */}
                    <div className="flex items-center mb-6">
                        {stepNames.map((name, i) => (
                            <React.Fragment key={name}>
                                <div className="flex flex-col items-center gap-1.5 min-w-[72px]">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold ${
                                        i < step ? "bg-emerald-500 text-white" : i === step ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-400"
                                    }`}>
                                        {i < step ? "✓" : i + 1}
                                    </div>
                                    <div className={`text-[10.5px] font-semibold text-center ${i === step ? "text-slate-900" : "text-slate-400"}`}>{name}</div>
                                </div>
                                {i < stepNames.length - 1 && <div className={`flex-1 h-0.5 mb-5 ${i < step ? "bg-emerald-400" : "bg-slate-100"}`} />}
                            </React.Fragment>
                        ))}
                    </div>

                    <ErrorBanner message={formError} onRetry={null} />

                    {stepName === "Select Roles" && (
                        <div>
                            <div className="text-[13px] font-bold text-slate-900 mb-1.5">Which roles is this template for?</div>
                            <div className="text-xs text-slate-500 mb-3.5">You can select multiple roles — one bulk template call is made per role.</div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {ROLE_META.map((r) => (
                                    <button
                                        key={r.key}
                                        onClick={() => onToggleRole(r.key)}
                                        className={`text-xs font-semibold px-3.5 py-2 rounded-full border ${
                                            roles.includes(r.key) ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200"
                                        }`}
                                    >
                                        {r.emoji} {r.label}
                                    </button>
                                ))}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Effective From">
                                    <input type="date" value={form.effectiveFrom} onChange={set("effectiveFrom")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                </Field>
                                <Field label="Salary Type">
                                    <div className="flex gap-4 items-center h-full pt-1.5">
                                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                            <input type="radio" name="bulk-salary-type" checked={form.salaryType === "MONTHLY"} onChange={() => setForm((f) => ({ ...f, salaryType: "MONTHLY" }))} /> Monthly
                                        </label>
                                        <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                                            <input type="radio" name="bulk-salary-type" checked={form.salaryType === "PER_DAY"} onChange={() => setForm((f) => ({ ...f, salaryType: "PER_DAY" }))} /> Per Day
                                        </label>
                                    </div>
                                </Field>
                            </div>
                        </div>
                    )}

                    {stepName === "Define Template" && (
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="text-[13px] font-bold text-slate-900">
                                        {mode === "role" ? (
                                            <>Template for: {roleLabels.map((l) => <span key={l} className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold ml-1.5">{l}</span>)}</>
                                        ) : (
                                            `Template for ${selectedList.length} selected employee${selectedList.length !== 1 ? "s" : ""}`
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">These values apply to everyone targeted — individual overrides can still be edited afterward.</div>
                                </div>
                            </div>

                            {mode === "selected" && (
                                <div className="grid grid-cols-2 gap-3 mb-5">
                                    <Field label="Effective From">
                                        <input type="date" value={form.effectiveFrom} onChange={set("effectiveFrom")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                    </Field>
                                    <Field label="Salary Type">
                                        <select value={form.salaryType} onChange={set("salaryType")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                            <option value="MONTHLY">Monthly</option>
                                            <option value="PER_DAY">Per Day</option>
                                        </select>
                                    </Field>
                                </div>
                            )}

                            <SectionLabel>Base Salary</SectionLabel>
                            <div className="mb-5">
                                <Field label="Basic Salary (₹)">
                                    <input type="number" value={form.baseSalary} onChange={set("baseSalary")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                                </Field>
                            </div>

                            <SectionLabel>Allowances</SectionLabel>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <Field label="House Rent (HRA)"><input type="number" value={form.houseRentAllowance} onChange={set("houseRentAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Travel Allowance"><input type="number" value={form.travelAllowance} onChange={set("travelAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Dearness Allowance"><input type="number" value={form.dearnessAllowance} onChange={set("dearnessAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Special Allowance"><input type="number" value={form.specialAllowance} onChange={set("specialAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Other Allowances"><input type="number" value={form.otherAllowances} onChange={set("otherAllowances")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                            </div>

                            <SectionLabel>Deductions</SectionLabel>
                            <div className="grid grid-cols-3 gap-3 mb-5">
                                <Field label="Provident Fund"><input type="number" value={form.providentFund} onChange={set("providentFund")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Professional Tax"><input type="number" value={form.professionalTax} onChange={set("professionalTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Income Tax (TDS)"><input type="number" value={form.incomeTax} onChange={set("incomeTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Other Deductions"><input type="number" value={form.otherDeductions} onChange={set("otherDeductions")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                                <Field label="Leave Deduction / Day"><input type="number" value={form.leaveDeductionPerDay} onChange={set("leaveDeductionPerDay")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                                <div className="text-[11px] font-extrabold uppercase tracking-wide text-blue-800 mb-3">Template Preview (per employee)</div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-[11px] text-slate-500">Gross Salary</div>
                                        <div className="text-lg font-extrabold text-emerald-700">{formatCurrency(preview.gross)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-slate-500">Total Deductions</div>
                                        <div className="text-lg font-extrabold text-red-600">-{formatCurrency(preview.deductions)}</div>
                                    </div>
                                    <div>
                                        <div className="text-[11px] text-slate-500">Net Salary</div>
                                        <div className="text-lg font-extrabold text-slate-900">{formatCurrency(preview.net)}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {stepName === "Review" && mode === "role" && (
                        <div>
                            <div className="text-[13px] font-bold text-slate-900 mb-1.5">Review before applying</div>
                            <div className="text-xs text-slate-500 mb-3.5">
                                This is only what's currently configured for {roleLabels.join(", ")} — there's no staff-directory endpoint
                                available to list not-yet-configured employees, but the backend will apply this template to the whole role
                                regardless of what's shown here.
                            </div>

                            <label className="flex items-start gap-2 text-xs text-slate-600 mb-4 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                                <input type="checkbox" checked={form.overwriteExisting} onChange={set("overwriteExisting")} className="mt-0.5" />
                                <span>
                                    <strong className="text-amber-900">Overwrite existing individual overrides.</strong> If unchecked, employees who
                                    already have an override keep it — the template only fills employees currently on the bulk default.
                                </span>
                            </label>

                            {existingLoading ? (
                                <Spinner label="Checking existing structures…" />
                            ) : existing.length === 0 ? (
                                <div className="text-xs text-slate-400 border border-slate-200 rounded-lg p-4 text-center bg-slate-50">
                                    No employees in {roleLabels.join(", ")} currently have a configured structure.
                                </div>
                            ) : (
                                <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-56 overflow-y-auto">
                                    {existing.map((row) => (
                                        <div key={rowKey(row)} className={`flex items-center justify-between px-3 py-2 text-xs ${row.isOverride ? "bg-amber-50" : ""}`}>
                                            <div>
                                                <div className="font-semibold text-slate-800">{row.userName}</div>
                                                <div className="text-[10.5px] text-slate-400">{row.employeeCode} · {formatCurrency(row.baseSalary)} base</div>
                                            </div>
                                            <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${row.isOverride ? "text-amber-700 bg-amber-100" : "text-slate-500 bg-slate-100"}`}>
                                                {row.isOverride ? "Has override" : "Bulk template"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {stepName === "Review" && mode === "selected" && (
                        <div>
                            <div className="text-[13px] font-bold text-slate-900 mb-1.5">Employees this template will apply to</div>
                            <label className="flex items-start gap-2 text-xs text-slate-600 mb-4 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                                <input type="checkbox" checked={form.overwriteExisting} onChange={set("overwriteExisting")} className="mt-0.5" />
                                <span>
                                    <strong className="text-amber-900">Overwrite existing individual overrides</strong> for anyone in this list who already has one.
                                </span>
                            </label>
                            <div className="flex flex-wrap gap-1.5 border border-slate-200 rounded-lg p-3 bg-slate-50">
                                {selectedList.length === 0 ? (
                                    <span className="text-xs text-slate-400">No employees selected.</span>
                                ) : (
                                    selectedList.map((row) => (
                                        <span key={rowKey(row)} className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-full pl-2.5 pr-1.5 py-1 text-xs text-slate-700">
                                            {row.userName}
                                            <button onClick={() => onRemoveSelected(row)} className="w-4 h-4 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 text-[10px] leading-none">✕</button>
                                        </span>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {stepName === "Confirm" && (
                        <div>
                            <div className="flex items-start gap-2.5 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-[12.5px] text-emerald-900 mb-4">
                                ✅ Ready to apply. Review the summary below before confirming.
                            </div>
                            <div className="bg-slate-50 rounded-xl p-4 mb-4 text-xs">
                                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2.5">Application Summary</div>
                                <SummaryRow label={mode === "role" ? "Role(s)" : "Target"} value={mode === "role" ? roleLabels.join(", ") || "—" : `${selectedList.length} selected employee${selectedList.length !== 1 ? "s" : ""}`} />
                                <SummaryRow label="Overwrite existing overrides" value={form.overwriteExisting ? "Yes" : "No"} />
                                <SummaryRow label="Template base salary" value={formatCurrency(n(form.baseSalary))} />
                                <SummaryRow label="Template gross salary" value={formatCurrency(preview.gross)} tone="green" />
                                <SummaryRow label="Template net salary" value={formatCurrency(preview.net)} />
                                <SummaryRow label="Effective From" value={form.effectiveFrom || "—"} />
                                <SummaryRow label="Salary Type" value={form.salaryType === "PER_DAY" ? "Per Day" : "Monthly"} />
                            </div>
                            {mode === "role" && (
                                <div className="text-[12.5px] text-slate-700 bg-blue-50 border border-blue-100 rounded-lg px-3.5 py-3">
                                    ℹ️ After applying, employees in {roleLabels.join(", ")} without an individual override will show
                                    "Bulk template" as their source. You can still override any single employee anytime without affecting
                                    the rest.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
                    <div className="flex gap-2">
                        {step > 0 && (
                            <button onClick={onPrev} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2 bg-white">
                                ← Back
                            </button>
                        )}
                        <button onClick={onCancel} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2 bg-white">
                            Cancel
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        {stepName === "Confirm" && (
                            <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-mono bg-slate-900 text-emerald-300 px-2 py-1 rounded">
                                POST /v1/payroll/salary-structures/bulk{mode === "role" && roles.length > 1 ? ` ×${roles.length}` : ""}
                            </span>
                        )}
                        <button
                            disabled={saving}
                            onClick={onNext}
                            className="text-xs font-semibold text-white bg-slate-900 rounded-lg px-3.5 py-2 disabled:opacity-50"
                        >
                            {saving ? "Applying…" : stepName === "Confirm" ? "✅ Apply Bulk Template" : BULK_NEXT_LABEL[stepName]}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SummaryRow({ label, value, tone }) {
    const toneClass = tone === "green" ? "text-emerald-700" : "text-slate-900";
    return (
        <div className="flex items-center justify-between py-1">
            <span className="text-slate-500">{label}</span>
            <span className={`font-semibold ${toneClass}`}>{value}</span>
        </div>
    );
}

function SectionLabel({ children }) {
    return <div className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500 pb-2 border-b border-slate-200 mb-3">{children}</div>;
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="text-[11.5px] font-semibold text-slate-600 mb-1 block">{label}</span>
            {children}
        </label>
    );
}