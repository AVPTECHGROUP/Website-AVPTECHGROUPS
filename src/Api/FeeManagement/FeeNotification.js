import { authFetch } from "../../Authfetch/Authfetch";
import { API_ENDPOINTS } from "../../Constants/Endpoints";

// Serializes a flat { key: value } object into a query string, skipping
// any key whose value is undefined, null, or an empty string.
const buildQueryParams = (params = {}) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
            qs.append(key, value);
        }
    });
    return qs.toString();
};

// POST /v1/fee/notifications/overdue?classId=&periodId=
// Notifies every parent with an overdue balance for the given class +
// period. No body, no per-student targeting — see Swagger contract.
export const sendOverdueFeeNotifications = async ({
                                                      classId,
                                                      periodId,
                                                  } = {}) => {
    const qs = buildQueryParams({
        classId,
        periodId,
    });

    const res = await authFetch(
        `${API_ENDPOINTS.FEE_NOTIFICATIONS_OVERDUE}${qs ? `?${qs}` : ""}`,
        {
            method: "POST",
        }
    );

    const data = await res.json();

    if (!res.ok) {
        throw new Error(
            data?.message || "Failed to send overdue fee notifications"
        );
    }

    return data;
};