import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/** Filters out undefined, null, and empty string values to build params */
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value);
    }
  });
  return searchParams.toString();
};

export const createFeeCollection = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.FEE_COLLECTIONS, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create fee collection");
  return data;
};

export const createBulkFeeCollection = async (payload) => {
  const res = await authFetch(API_ENDPOINTS.FEE_COLLECTIONS_BULK, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || "Failed to create bulk fee collection");
  return data;
};

export const getFeeCollectionHistory = async ({ fromDate, toDate, classId, periodId, mode, page = 0, size = 10 } = {}) => {
  const qs = buildQueryParams({ fromDate, toDate, classId, periodId, mode, page, size });
  const res = await authFetch(`${API_ENDPOINTS.FEE_COLLECTIONS_HISTORY}${qs ? "?" + qs : ""}`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee history");
  const data = await res.json();

  return {
    records: data?.data?.content || [],
    pagination: {
      totalPages: data?.data?.totalPages || 0,
      totalElements: data?.data?.totalElements || 0,
      size: data?.data?.size || size,
      number: data?.data?.number || page,
    },
  };
};

/**
 * FIX: previously only accepted { classId, periodId } — `status`, `page`,
 * `size` passed in by callers were silently dropped since they weren't
 * destructured or appended to the query string. This is why filtering by
 * status (OVERDUE/PARTIAL/PENDING) and pagination appeared to "not load all
 * data" — every call actually hit the backend's default page regardless of
 * what the UI had selected. Now matches the documented Swagger contract:
 * classId, periodId, status (query) + page/size (pageable, sent as flat
 * query params — Spring's Pageable binds page/size/sort from query string,
 * the "pageable" object in Swagger UI is just its editor representation).
 */
export const getOutstandingFees = async ({ classId, periodId, status, page = 0, size = 20 } = {}) => {
  const qs = buildQueryParams({ classId, periodId, status, page, size });
  const res = await authFetch(`${API_ENDPOINTS.FEE_COLLECTIONS_OUTSTANDING}${qs ? '?' + qs : ''}`, { method: "GET" });

  if (!res.ok) throw new Error(await res.text() || "Failed to fetch outstanding fees");

  const data = await res.json();
  const pageObj = data?.data || {};

  return {
    records: Array.isArray(pageObj.content) ? pageObj.content : [],
    pagination: {
      totalPages: pageObj.totalPages || 0,
      totalElements: pageObj.totalElements || 0,
      size: pageObj.size || size,
      number: pageObj.number || page,
    },
  };
};

export const getFeeReceiptById = async (id) => {
  if (!id) throw new Error("Receipt ID is required");

  const res = await authFetch(API_ENDPOINTS.feeReceiptById(id), { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee receipt");

  return (await res.json()).data || {};
};