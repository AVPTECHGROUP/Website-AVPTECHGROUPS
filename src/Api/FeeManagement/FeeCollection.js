import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

/**
 * Filters out undefined, null, and empty string values to build params.
 *
 * FIX: now also accepts ARRAY values (e.g. sort: ['updatedAt,desc',
 * 'id,desc']) and appends each entry under the same key — this is Spring
 * Data's actual convention for multi-field sort on a Pageable param
 * (`?sort=updatedAt,desc&sort=id,desc`, NOT a single comma-joined string).
 * Confirmed against the real /v1/fee/collections/cancelled response, whose
 * `pageable.sort` shows exactly this two-field default (updatedAt DESC,
 * then id DESC as a tiebreaker) even when the request sent an empty sort.
 * Scalar values behave exactly as before — this is purely additive.
 */
const buildQueryParams = (params) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    if (Array.isArray(value)) {
      value.forEach((v) => {
        if (v !== undefined && v !== null && v !== '') searchParams.append(key, v);
      });
      return;
    }
    searchParams.append(key, value);
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
 * FIX: `status`, `page`, `size` are now sent straight through to the
 * backend (which supports OVERDUE / PARTIAL / PENDING natively), matching
 * the documented Swagger contract: classId, periodId, status (query) +
 * page/size (pageable, sent as flat query params — Spring's Pageable binds
 * page/size/sort from query string, the "pageable" object in Swagger UI is
 * just its editor representation).
 *
 * FIX (bug reported: "after cancelling a payment I have to go find the
 * reinstated balance in Outstanding & Overdue"): confirmed via a real
 * response that this endpoint's `pageable.sort` comes back EMPTY by
 * default — unlike /fee/collections/cancelled, which defaults to
 * `[updatedAt DESC, id DESC]`. With no sort at all, a just-reinstated
 * record has no predictable position after a refetch. `sort` is now an
 * accepted param (string or array — buildQueryParams above already
 * handles both) so the caller can explicitly request the same ordering
 * convention as the cancelled endpoint.
 */
export const getOutstandingFees = async ({ classId, periodId, status, sort, page = 0, size = 20 } = {}) => {
  const qs = buildQueryParams({ classId, periodId, status, sort, page, size });
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

/**
 * FIX: this previously returned ONLY `json.data`, silently discarding the
 * outer `json.timestamp` field from the API response (the response shape
 * is `{ success, data, timestamp }`). CollectionsHistory.jsx's
 * handleViewReceipt reads `res?.timestamp` to get the real collection time
 * for the receipt's "Time" row — with the old return value that was always
 * undefined, so "View Receipt" from history never showed a time even
 * though the backend actually sends one. Now returns both pieces so the
 * caller can use `res.data` and `res.timestamp` exactly like the other
 * wrapped endpoints (createFeeCollection, getOutstandingFees, etc.).
 */
export const getFeeReceiptById = async (id) => {
  if (!id) throw new Error("Receipt ID is required");

  const res = await authFetch(API_ENDPOINTS.feeReceiptById(id), { method: "GET" });
  if (!res.ok) throw new Error(await res.text() || "Failed to fetch fee receipt");

  const json = await res.json();
  const data = json?.data || {};
  // FIX: some backend responses may carry the timestamp at the top level,
  // others might carry it inside `data` (e.g. data.timestamp / data.createdAt).
  // Check all known shapes instead of assuming only json.timestamp exists.
  const timestamp = json?.timestamp || data?.timestamp || data?.generatedAt || data?.createdAt || '';
  return { data, timestamp };
};

export const deleteFeeCollection = async (paymentId) => {
  if (!paymentId) {
    throw new Error("Payment ID is required");
  }

  const res = await authFetch(
      API_ENDPOINTS.DELETE_FEE_COLLECTION(paymentId),
      {
        method: "DELETE",
      }
  );

  const data = await res.json();

  if (!res.ok) {
    throw new Error(
        data?.message || "Failed to delete fee collection"
    );
  }

  return data;
};

/**
 * FIX: `sort` can now be either a single string ("updatedAt,desc") or an
 * array of strings (["updatedAt,desc", "id,desc"]) — buildQueryParams
 * above handles both. Confirmed against the real API response: the
 * backend's own default sort for this endpoint is exactly
 * ["updatedAt,desc", "id,desc"] (updatedAt as the primary key, id as a
 * tiebreaker for records updated in the same instant) — CancelledFeeCollections.jsx
 * now sends that same two-field sort explicitly instead of relying on the
 * backend default, so ordering stays correct even if the backend's default
 * ever changes independently of the frontend.
 */
export const getCancelledFeeCollections = async ({
                                                   fromDate,
                                                   toDate,
                                                   studentId,
                                                   classId,
                                                   periodId,
                                                   page = 0,
                                                   size = 10,
                                                   sort,
                                                 } = {}) => {
  const qs = buildQueryParams({
    fromDate,
    toDate,
    studentId,
    classId,
    periodId,
    page,
    size,
    sort,
  });

  const res = await authFetch(
      `${API_ENDPOINTS.FEE_COLLECTIONS_CANCELLED}${qs ? "?" + qs : ""}`,
      {
        method: "GET",
      }
  );

  if (!res.ok) {
    throw new Error(
        (await res.text()) || "Failed to fetch cancelled fee collections"
    );
  }

  const data = await res.json();
  const pageObj = data?.data || {};

  return {
    records: Array.isArray(pageObj.content) ? pageObj.content : [],
    pagination: {
      totalPages: pageObj.totalPages || 0,
      totalElements: pageObj.totalElements || 0,
      size: pageObj.size || size,
      number: pageObj.number ?? page,
    },
  };
};