import {getUserId} from "./getCurrUserDetails/GetCurrUserDetails.js";
import {getUserRole} from "./getCurrUserDetails/GetCurrUserDetails.js";


// Role helpers used across the payroll module.
// Adjust the role strings below if your JWT uses different values.

export const PAYROLL_ADMIN_ROLES = ["ADMIN", "PRINCIPAL", "SUPER_ADMIN", "GLOBAL_ADMIN"];

export const isPayrollAdmin = (user) => {
    const role = getUserRole(user);
    return role ? PAYROLL_ADMIN_ROLES.includes(role) : false;
};

export const isTeacher = (user) => {
    const role = getUserRole(user);
    return role === "TEACHER";
};

// Convenience getter for the logged-in user's own userId, used to scope
// every payroll API call so a teacher can never fetch someone else's record.
export const getSelfUserId = (user) => getUserId(user);