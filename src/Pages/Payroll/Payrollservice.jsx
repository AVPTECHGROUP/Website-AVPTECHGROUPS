import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/* ── shared helpers ───────────────────────────────────────────────────── */

async function handleJson(res, fallbackMsg) {
    const text = await res.text();
    if (!res.ok) {
        let msg = fallbackMsg;
        try {
            const parsed = JSON.parse(text);
            msg = parsed?.message || parsed?.error || text || fallbackMsg;
        } catch {
            msg = text || fallbackMsg;
        }
        throw new Error(msg);
    }
    return text ? JSON.parse(text) : {};
}

/**
 * Normalizes the backend's paged response shape into { items, total, totalPages }.
 * Handles both `data[]` (used by the payroll list endpoints per the API
 * reference) and the more common Spring `content[]` shape, so the UI layer
 * doesn't need to care which one comes back.
 */
function unwrapPage(json) {
    const items = json?.data ?? json?.content ?? [];
    const total = json?.totalElements ?? items.length ?? 0;
    const totalPages = json?.totalPages ?? 1;
    return { items, total, totalPages, raw: json };
}

/* ── Payroll records ──────────────────────────────────────────────────── */

// GET /v1/payroll?month&year&page&size&status&userType&sort
export const getPayroll = async (
    month,
    year,
    status = "",
    userType = "",
    page = 0,
    size = 10,
    sort = ""
) => {
    const params = new URLSearchParams({ month, year, page, size });
    if (status) params.append("status", status);
    if (userType) params.append("userType", userType);
    if (sort) params.append("sort", sort);

    const res = await authFetch(`${API_ENDPOINTS.PAYROLL}?${params.toString()}`, {
        method: "GET",
    });
    const json = await handleJson(res, "Failed to fetch payroll");
    return unwrapPage(json);
};

// GET /v1/payroll/{id}
export const getPayrollById = async (id) => {
    const res = await authFetch(API_ENDPOINTS.payrollById(id), { method: "GET" });
    return handleJson(res, "Failed to fetch payroll");
};

// DELETE /v1/payroll/{id} — DRAFT only
export const deletePayroll = async (id) => {
    const res = await authFetch(API_ENDPOINTS.payrollById(id), { method: "DELETE" });
    return handleJson(res, "Failed to delete payroll");
};

// POST /v1/payroll/approve — Body: { payrollIds:[...] }
export const approvePayrolls = async (payrollIds) => {
    const res = await authFetch(API_ENDPOINTS.PAYROLL_APPROVE, {
        method: "POST",
        body: JSON.stringify({ payrollIds }),
    });
    return handleJson(res, "Failed to approve payrolls");
};

// POST /v1/payroll/approve/bulk?month&year — no body, approvedBy from JWT
export const approvePayrollsBulk = async (month, year) => {
    const params = new URLSearchParams({ month, year });
    const res = await authFetch(
        `${API_ENDPOINTS.PAYROLL_APPROVE_BULK}?${params.toString()}`,
        { method: "POST" }
    );
    return handleJson(res, "Failed to approve payrolls in bulk");
};

// POST /v1/payroll/mark-paid — Body: { payrollIds:[...], remarks }
export const markPayrollAsPaid = async (payrollIds, remarks = "") => {
    const res = await authFetch(API_ENDPOINTS.PAYROLL_MARK_PAID, {
        method: "POST",
        body: JSON.stringify({ payrollIds, remarks }),
    });
    return handleJson(res, "Failed to mark payroll as paid");
};

// GET /v1/payroll/total?month&year
export const getPayrollTotal = async (month, year) => {
    const params = new URLSearchParams({ month, year });
    const res = await authFetch(`${API_ENDPOINTS.PAYROLL_TOTAL}?${params.toString()}`, {
        method: "GET",
    });
    return handleJson(res, "Failed to fetch payroll total");
};

// GET /v1/payroll/users/{userId}/history?userType&page&size&sort
export const getPayrollUserHistory = async (
    userId,
    userType = "",
    page = 0,
    size = 12,
    sort = ""
) => {
    const params = new URLSearchParams({ page, size });
    if (userType) params.append("userType", userType);
    if (sort) params.append("sort", sort);

    const res = await authFetch(
        `${API_ENDPOINTS.payrollUserHistory(userId)}?${params.toString()}`,
        { method: "GET" }
    );
    const json = await handleJson(res, "Failed to fetch payroll history");
    return unwrapPage(json);
};

// GET /v1/payroll/users/{userId}/slip?userType&month&year -> SalarySlipResponseDto
export const getPayrollSlip = async (userId, userType, month, year) => {
    const params = new URLSearchParams({ userType, month, year });
    const res = await authFetch(
        `${API_ENDPOINTS.payrollUserSlip(userId)}?${params.toString()}`,
        { method: "GET" }
    );
    return handleJson(res, "Failed to fetch payroll slip");
};

/**
 * POST /v1/payroll/generate
 * payload: { month, year } or { month, year, overrides: [{ userId, userType, presentDays, leaveDays }] }
 * Returns PayrollGenerationResultDto: { generated: [], skipped: [], generatedCount, skippedCount }
 */
export const generatePayroll = async (payload) => {
    const res = await authFetch(API_ENDPOINTS.PAYROLL_GENERATE, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    return handleJson(res, "Failed to generate payroll");
};

/* ── Salary structures ────────────────────────────────────────────────── */

// GET /v1/payroll/salary-structures/all?page&size -> SalaryStructureSummaryDto[]
// Merges TeacherSalaryStructure + UserSalaryStructure. Each item carries
// `managedBy: "TEACHER_MODULE" | "PAYROLL_MODULE"` — use it to route edits.
export const getAllSalaryStructures = async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const res = await authFetch(
        `${API_ENDPOINTS.PAYROLL_SALARY_STRUCTURES_ALL}?${params.toString()}`,
        { method: "GET" }
    );
    const json = await handleJson(res, "Failed to fetch salary structures");
    return unwrapPage(json);
};

// GET /v1/payroll/salary-structures?page&size -> non-teacher (UserSalaryStructure) only
export const getUserSalaryStructures = async (page = 0, size = 20) => {
    const params = new URLSearchParams({ page, size });
    const res = await authFetch(
        `${API_ENDPOINTS.PAYROLL_SALARY_STRUCTURES}?${params.toString()}`,
        { method: "GET" }
    );
    const json = await handleJson(res, "Failed to fetch salary structures");
    return unwrapPage(json);
};

// GET /v1/payroll/salary-structures/users/{userId}?userType
export const getSalaryStructureByUser = async (userId, userType) => {
    const params = new URLSearchParams({ userType });
    const res = await authFetch(
        `${API_ENDPOINTS.payrollSalaryStructureByUser(userId)}?${params.toString()}`,
        { method: "GET" }
    );
    return handleJson(res, "Failed to fetch salary structure");
};

// POST /v1/payroll/salary-structures/users/{userId}?userType — create
export const createSalaryStructure = async (userId, userType, structureDto) => {
    const params = new URLSearchParams({ userType });
    const res = await authFetch(
        `${API_ENDPOINTS.payrollSalaryStructureByUser(userId)}?${params.toString()}`,
        { method: "POST", body: JSON.stringify(structureDto) }
    );
    return handleJson(res, "Failed to create salary structure");
};

// PUT /v1/payroll/salary-structures/users/{userId}?userType — update / upsert (same body as POST)
export const updateSalaryStructure = async (userId, userType, structureDto) => {
    const params = new URLSearchParams({ userType });
    const res = await authFetch(
        `${API_ENDPOINTS.payrollSalaryStructureByUser(userId)}?${params.toString()}`,
        { method: "PUT", body: JSON.stringify(structureDto) }
    );
    return handleJson(res, "Failed to update salary structure");
};

// DELETE /v1/payroll/salary-structures/users/{userId}?userType
export const deleteSalaryStructure = async (userId, userType) => {
    const params = new URLSearchParams({ userType });
    const res = await authFetch(
        `${API_ENDPOINTS.payrollSalaryStructureByUser(userId)}?${params.toString()}`,
        { method: "DELETE" }
    );
    return handleJson(res, "Failed to delete salary structure");
};

/**
 * POST /v1/payroll/salary-structures/bulk — Body: BulkSalaryStructureRequestDto
 * By role:          { targetRole, overwriteExisting, salaryType, baseSalary, houseRentAllowance, ..., effectiveFrom }
 * Specific users:    { targetUserIds:[...], overwriteExisting, salaryType, baseSalary, ..., effectiveFrom }
 */
export const bulkApplySalaryStructure = async (bulkDto) => {
    const res = await authFetch(API_ENDPOINTS.PAYROLL_SALARY_STRUCTURES_BULK, {
        method: "POST",
        body: JSON.stringify(bulkDto),
    });
    return handleJson(res, "Failed to bulk apply salary structure");
};

// Teacher-managed structures reuse the existing Teachers endpoint —
// GET/PUT `${BASE_URL_V1}/teachers/{teacherId}/salary-structure`
export const getTeacherSalaryStructure = async (teacherId) => {
    const res = await authFetch(API_ENDPOINTS.teacherSalary(teacherId), { method: "GET" });
    return handleJson(res, "Failed to fetch teacher salary structure");
};

export const updateTeacherSalaryStructure = async (teacherId, structureDto) => {
    const res = await authFetch(API_ENDPOINTS.teacherSalary(teacherId), {
        method: "PUT",
        body: JSON.stringify(structureDto),
    });
    return handleJson(res, "Failed to update teacher salary structure");
};