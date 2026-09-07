import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

export const getPayroll = async (
    month,
    year,
    status = "",
    userType = "",
    page = 0,
    size = 10,
    sort = ""
) => {
  const params = new URLSearchParams({
    month,
    year,
    page,
    size,
  });

  if (status) params.append("status", status);
  if (userType) params.append("userType", userType);
  if (sort) params.append("sort", sort);

  const res = await authFetch(
      `${API_ENDPOINTS.PAYROLL}?${params.toString()}`,
      {
        method: "GET",
      }
  );

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch payroll"
    );
  }

  return await res.json();
};

export const getPayrollById = async (id) => {
  const res = await authFetch(API_ENDPOINTS.payrollById(id), {
    method: "GET",
  });

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch payroll"
    );
  }

  return await res.json();
};

export const deletePayroll = async (id) => {
  const res = await authFetch(API_ENDPOINTS.payrollById(id), {
    method: "DELETE",
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to delete payroll");
  }

  return text ? JSON.parse(text) : {};
};


export const approvePayrolls = async (payrollIds) => {
  const res = await authFetch(API_ENDPOINTS.PAYROLL_APPROVE, {
    method: "POST",
    body: JSON.stringify({
      payrollIds,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to approve payrolls");
  }

  return text ? JSON.parse(text) : {};
};

export const approvePayrollsBulk = async (month, year) => {
  const params = new URLSearchParams({
    month,
    year,
  });

  const res = await authFetch(
      `${API_ENDPOINTS.PAYROLL_APPROVE_BULK}?${params.toString()}`,
      {
        method: "POST",
      }
  );

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to approve payrolls in bulk");
  }

  return text ? JSON.parse(text) : {};
};

export const generatePayroll = async (payrollData) => {
  const res = await authFetch(API_ENDPOINTS.PAYROLL_GENERATE, {
    method: "POST",
    body: JSON.stringify(payrollData),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to generate payroll");
  }

  return text ? JSON.parse(text) : {};
};

export const markPayrollAsPaid = async (payrollIds) => {
  const res = await authFetch(API_ENDPOINTS.PAYROLL_MARK_PAID, {
    method: "POST",
    body: JSON.stringify({
      payrollIds,
    }),
  });

  const text = await res.text();

  if (!res.ok) {
    throw new Error(text || "Failed to mark payroll as paid");
  }

  return text ? JSON.parse(text) : {};
};

export const getPayrollTotal = async (month, year) => {
  const params = new URLSearchParams({
    month,
    year,
  });

  const res = await authFetch(
      `${API_ENDPOINTS.PAYROLL_TOTAL}?${params.toString()}`,
      {
        method: "GET",
      }
  );

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch payroll total"
    );
  }

  return await res.json();
};

export const getPayrollUserHistory = async (
    userId,
    userType = "",
    page = 0,
    size = 10,
    sort = ""
) => {
  const params = new URLSearchParams({
    page,
    size,
  });

  if (userType) params.append("userType", userType);
  if (sort) params.append("sort", sort);

  const res = await authFetch(
      `${API_ENDPOINTS.payrollUserHistory(userId)}?${params.toString()}`,
      {
        method: "GET",
      }
  );

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch payroll history"
    );
  }

  return await res.json();
};

export const getPayrollSlip = async (
    userId,
    userType,
    month,
    year
) => {
  const params = new URLSearchParams({
    userType,
    month,
    year,
  });

  const res = await authFetch(
      `${API_ENDPOINTS.payrollUserSlip(userId)}?${params.toString()}`,
      {
        method: "GET",
      }
  );

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch payroll slip"
    );
  }

  return await res.json();
};


