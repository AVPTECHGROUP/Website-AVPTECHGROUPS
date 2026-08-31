import React, { useEffect, useState, useCallback } from "react";
import {
    getAllSalaryStructures,
    getSalaryStructureByUser,
    createSalaryStructure,
    updateSalaryStructure,
    deleteSalaryStructure,
    bulkApplySalaryStructure,
} from "./Payrollservice.jsx";
import {
    RoleBadge,
    ManagedByBadge,
    Pagination,
    Spinner,
    ErrorBanner,
    Notice,
    formatCurrency,
    normalizeList,
} from "./payrollUi";

const emptyForm = () => ({
    salaryType: "MONTHLY",
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
    effectiveFrom: "",
});

export default function PayrollConfig() {
    const [page, setPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(1);

    const [editing, setEditing] = useState(null); // { userId, userType } | null
    const [form, setForm] = useState(emptyForm());
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [bulkOpen, setBulkOpen] = useState(false);
    const [bulkForm, setBulkForm] = useState({
        mode: "role", // "role" | "users"
        targetRole: "TEACHER",
        targetUserIds: "",
        overwriteExisting: false,
        ...emptyForm(),
    });
    const [bulkBusy, setBulkBusy] = useState(false);
    const [bulkError, setBulkError] = useState("");
    const [bulkResult, setBulkResult] = useState(null);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getAllSalaryStructures(page, 20);
            // TEMP GUARD — see normalizeList in payrollUi.jsx. Remove once
            // Payrollservice.jsx's actual return shape is confirmed.
            const { items: normalizedItems, totalPages: normalizedTotalPages } = normalizeList(res);
            setItems(normalizedItems);
            setTotalPages(normalizedTotalPages);
        } catch (e) {
            setError(e.message || "Failed to load salary structures");
        } finally {
            setLoading(false);
        }
    }, [page]);

    useEffect(() => {
        load();
    }, [load]);

    async function openEdit(row) {
        // Teacher-managed structures are edited in the Teacher module, not here.
        if (row.managedBy === "TEACHER_MODULE") {
            window.alert("This structure is managed via the Teacher module (GET/PUT /v1/teachers/{teacherId}/salary-structure). Edit it there.");
            return;
        }
        setFormError("");
        setEditing({ userId: row.userId, userType: row.userType });
        try {
            const detail = await getSalaryStructureByUser(row.userId, row.userType);
            setForm({ ...emptyForm(), ...detail });
        } catch (e) {
            setFormError(e.message || "Failed to load structure detail");
        }
    }

    function openCreate() {
        setFormError("");
        setEditing({ userId: "", userType: "ADMIN", isNew: true });
        setForm(emptyForm());
    }

    function closeEdit() {
        setEditing(null);
    }

    async function handleSave() {
        if (!editing) return;
        setSaving(true);
        setFormError("");
        try {
            const payload = {
                ...form,
                baseSalary: Number(form.baseSalary) || 0,
                houseRentAllowance: Number(form.houseRentAllowance) || 0,
                travelAllowance: Number(form.travelAllowance) || 0,
                dearnessAllowance: Number(form.dearnessAllowance) || 0,
                specialAllowance: Number(form.specialAllowance) || 0,
                otherAllowances: Number(form.otherAllowances) || 0,
                providentFund: Number(form.providentFund) || 0,
                professionalTax: Number(form.professionalTax) || 0,
                incomeTax: Number(form.incomeTax) || 0,
                otherDeductions: Number(form.otherDeductions) || 0,
            };
            if (editing.isNew) {
                await createSalaryStructure(Number(editing.userId), editing.userType, payload);
            } else {
                await updateSalaryStructure(editing.userId, editing.userType, payload);
            }
            closeEdit();
            await load();
        } catch (e) {
            setFormError(e.message || "Failed to save salary structure");
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(row) {
        if (row.managedBy === "TEACHER_MODULE") return;
        if (!window.confirm(`Delete the salary structure for ${row.userName}?`)) return;
        try {
            await deleteSalaryStructure(row.userId, row.userType);
            await load();
        } catch (e) {
            setError(e.message || "Failed to delete salary structure");
        }
    }

    async function handleBulkApply() {
        setBulkBusy(true);
        setBulkError("");
        setBulkResult(null);
        try {
            const payload = {
                overwriteExisting: bulkForm.overwriteExisting,
                salaryType: bulkForm.salaryType,
                baseSalary: Number(bulkForm.baseSalary) || 0,
                houseRentAllowance: Number(bulkForm.houseRentAllowance) || 0,
                travelAllowance: Number(bulkForm.travelAllowance) || 0,
                dearnessAllowance: Number(bulkForm.dearnessAllowance) || 0,
                specialAllowance: Number(bulkForm.specialAllowance) || 0,
                otherAllowances: Number(bulkForm.otherAllowances) || 0,
                providentFund: Number(bulkForm.providentFund) || 0,
                professionalTax: Number(bulkForm.professionalTax) || 0,
                incomeTax: Number(bulkForm.incomeTax) || 0,
                otherDeductions: Number(bulkForm.otherDeductions) || 0,
                effectiveFrom: bulkForm.effectiveFrom,
            };
            if (bulkForm.mode === "role") {
                payload.targetRole = bulkForm.targetRole;
            } else {
                payload.targetUserIds = bulkForm.targetUserIds
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => !Number.isNaN(n));
            }
            const res = await bulkApplySalaryStructure(payload);
            setBulkResult(res);
            await load();
        } catch (e) {
            setBulkError(e.message || "Failed to bulk apply salary structure");
        } finally {
            setBulkBusy(false);
        }
    }

    return (
        <div>
            <div className="flex items-start justify-between mb-5">
                <div>
                    <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Salary Structures</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Merged view of teacher and non-teacher structures. Only non-teacher (Payroll module) structures can be
                        edited or deleted here — teacher structures route to the Teacher module.
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => setBulkOpen(true)} className="border border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-50">
                        📦 Bulk Apply Template
                    </button>
                    <button onClick={openCreate} className="bg-slate-900 text-white text-xs font-semibold px-3.5 py-2 rounded-lg hover:bg-slate-800">
                        + Add Structure
                    </button>
                </div>
            </div>

            <ErrorBanner message={error} onRetry={load} />

            {loading ? (
                <Spinner label="Loading salary structures…" />
            ) : (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                        <tr className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                            <th className="text-left px-4 py-2.5 font-bold">Employee</th>
                            <th className="text-left px-4 py-2.5 font-bold">Role</th>
                            <th className="text-left px-4 py-2.5 font-bold">Base Salary</th>
                            <th className="text-left px-4 py-2.5 font-bold">Gross</th>
                            <th className="text-left px-4 py-2.5 font-bold">Net</th>
                            <th className="text-left px-4 py-2.5 font-bold">Managed By</th>
                            <th className="text-left px-4 py-2.5 font-bold">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {items.length === 0 ? (
                            <tr><td colSpan={7} className="text-center text-slate-400 text-sm py-10">No salary structures found.</td></tr>
                        ) : (
                            items.map((row) => (
                                <tr key={`${row.userType}-${row.userId}`} className="border-t border-slate-100 hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800">{row.userName}</div>
                                        <div className="text-[11px] text-slate-400">{row.employeeCode}</div>
                                    </td>
                                    <td className="px-4 py-3"><RoleBadge role={row.userType} /></td>
                                    <td className="px-4 py-3 text-slate-600">{formatCurrency(row.baseSalary)}</td>
                                    <td className="px-4 py-3 text-emerald-700 font-medium">{formatCurrency(row.grossSalary)}</td>
                                    <td className="px-4 py-3 font-bold text-slate-900">{formatCurrency(row.netSalary)}</td>
                                    <td className="px-4 py-3"><ManagedByBadge managedBy={row.managedBy} /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1.5">
                                            <button onClick={() => openEdit(row)} className="text-xs font-semibold text-blue-700 border border-blue-600 rounded px-2 py-1 hover:bg-blue-50">Edit</button>
                                            {row.managedBy !== "TEACHER_MODULE" && (
                                                <button onClick={() => handleDelete(row)} className="text-xs font-semibold text-red-600 border border-red-300 rounded px-2 py-1 hover:bg-red-50">Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                    <Pagination page={page} totalPages={totalPages} onChange={setPage} />
                </div>
            )}

            {editing && (
                <Modal title={editing.isNew ? "Add Salary Structure" : `Edit Structure`} onClose={closeEdit}>
                    <ErrorBanner message={formError} onRetry={null} />
                    {editing.isNew && (
                        <div className="grid grid-cols-2 gap-3 mb-3">
                            <Field label="User ID">
                                <input type="number" value={editing.userId} onChange={(e) => setEditing({ ...editing, userId: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                            </Field>
                            <Field label="User Type">
                                <select value={editing.userType} onChange={(e) => setEditing({ ...editing, userType: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                    <option value="ADMIN">Admin</option>
                                    <option value="ACCOUNTANT">Accountant</option>
                                    <option value="PRINCIPAL">Principal</option>
                                </select>
                            </Field>
                        </div>
                    )}
                    <StructureFields form={form} setForm={setForm} />
                    <div className="flex justify-end gap-2 mt-5">
                        <button onClick={closeEdit} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2">Cancel</button>
                        <button disabled={saving} onClick={handleSave} className="text-xs font-semibold text-white bg-slate-900 rounded-lg px-3.5 py-2 disabled:opacity-50">
                            {saving ? "Saving…" : "Save Structure"}
                        </button>
                    </div>
                </Modal>
            )}

            {bulkOpen && (
                <Modal title="Bulk Apply Salary Template" onClose={() => { setBulkOpen(false); setBulkResult(null); }}>
                    <ErrorBanner message={bulkError} onRetry={null} />
                    {bulkResult && (
                        <Notice tone="success">
                            Applied to {bulkResult.appliedCount ?? bulkResult.updatedCount ?? "the selected"} employee(s).
                        </Notice>
                    )}
                    <div className="flex gap-2 mb-3">
                        <button
                            onClick={() => setBulkForm((f) => ({ ...f, mode: "role" }))}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bulkForm.mode === "role" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                        >
                            By Role
                        </button>
                        <button
                            onClick={() => setBulkForm((f) => ({ ...f, mode: "users" }))}
                            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${bulkForm.mode === "users" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"}`}
                        >
                            Specific Users
                        </button>
                    </div>

                    {bulkForm.mode === "role" ? (
                        <Field label="Target Role">
                            <select value={bulkForm.targetRole} onChange={(e) => setBulkForm({ ...bulkForm, targetRole: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                                <option value="ACCOUNTANT">Accountant</option>
                                <option value="PRINCIPAL">Principal</option>
                            </select>
                        </Field>
                    ) : (
                        <Field label="User IDs (comma-separated)">
                            <input
                                type="text"
                                placeholder="12, 15, 18"
                                value={bulkForm.targetUserIds}
                                onChange={(e) => setBulkForm({ ...bulkForm, targetUserIds: e.target.value })}
                                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                            />
                        </Field>
                    )}

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-600 my-3">
                        <input type="checkbox" checked={bulkForm.overwriteExisting} onChange={(e) => setBulkForm({ ...bulkForm, overwriteExisting: e.target.checked })} />
                        Overwrite existing structures for these employees
                    </label>

                    <StructureFields form={bulkForm} setForm={setBulkForm} />

                    <div className="flex justify-end gap-2 mt-5">
                        <button onClick={() => setBulkOpen(false)} className="text-xs font-semibold text-slate-600 border border-slate-200 rounded-lg px-3.5 py-2">Close</button>
                        <button disabled={bulkBusy} onClick={handleBulkApply} className="text-xs font-semibold text-white bg-slate-900 rounded-lg px-3.5 py-2 disabled:opacity-50">
                            {bulkBusy ? "Applying…" : "Apply Template"}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
}

function StructureFields({ form, setForm }) {
    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
    return (
        <div>
            <div className="grid grid-cols-2 gap-3 mb-3">
                <Field label="Salary Type">
                    <select value={form.salaryType} onChange={set("salaryType")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                        <option value="MONTHLY">Monthly</option>
                        <option value="HOURLY">Hourly</option>
                    </select>
                </Field>
                <Field label="Effective From">
                    <input type="date" value={form.effectiveFrom} onChange={set("effectiveFrom")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
                </Field>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Earnings</div>
            <div className="grid grid-cols-3 gap-3 mb-3">
                <Field label="Base Salary"><input type="number" value={form.baseSalary} onChange={set("baseSalary")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="House Rent Allowance"><input type="number" value={form.houseRentAllowance} onChange={set("houseRentAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Travel Allowance"><input type="number" value={form.travelAllowance} onChange={set("travelAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Dearness Allowance"><input type="number" value={form.dearnessAllowance} onChange={set("dearnessAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Special Allowance"><input type="number" value={form.specialAllowance} onChange={set("specialAllowance")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Other Allowances"><input type="number" value={form.otherAllowances} onChange={set("otherAllowances")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
            </div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-2">Deductions</div>
            <div className="grid grid-cols-3 gap-3">
                <Field label="Provident Fund"><input type="number" value={form.providentFund} onChange={set("providentFund")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Professional Tax"><input type="number" value={form.professionalTax} onChange={set("professionalTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Income Tax"><input type="number" value={form.incomeTax} onChange={set("incomeTax")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
                <Field label="Other Deductions"><input type="number" value={form.otherDeductions} onChange={set("otherDeductions")} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" /></Field>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="text-[11.5px] font-semibold text-slate-600 mb-1 block">{label}</span>
            {children}
        </label>
    );
}

function Modal({ title, onClose, children }) {
    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
                    <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
                    <button onClick={onClose} className="w-7 h-7 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-500">✕</button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}