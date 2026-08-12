import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { isPayrollAdmin, isTeacher } from "../../utils/authSession";
import {getCurrUserDetails} from "../../utils/getCurrUserDetails/index.js";
import AdminPayrollView from "./Adminpayrollview";
import TeacherPayrollSelfView from "./TeacherPayrollselfview";

// Single entry point — mount this at your /payroll route.
// It never renders both views in the same tree: a teacher's browser
// never even receives the admin view's code path or data.
const PayrollDashboard = () => {
    const [user, setUser] = useState(undefined); // undefined = loading, null = no session

    useEffect(() => {
        setUser(getCurrUserDetails());
    }, []);

    if (user === undefined) {
        return (
            <div className="w-full flex items-center justify-center py-24">
                <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="w-full flex flex-col items-center justify-center py-24 text-center px-4">
                <ShieldAlert className="w-10 h-10 text-red-500 mb-3" />
                <p className="text-gray-700 font-medium">Your session has expired.</p>
                <p className="text-gray-500 text-sm mt-1">Please log in again to view payroll.</p>
            </div>
        );
    }

    if (isPayrollAdmin(user)) {
        return <AdminPayrollView currentUser={user} />;
    }

    if (isTeacher(user)) {
        return <TeacherPayrollSelfView currentUser={user} />;
    }

    return (
        <div className="w-full flex flex-col items-center justify-center py-24 text-center px-4">
            <ShieldAlert className="w-10 h-10 text-orange-500 mb-3" />
            <p className="text-gray-700 font-medium">Payroll access isn't configured for your role.</p>
            <p className="text-gray-500 text-sm mt-1">Contact your school administrator.</p>
        </div>
    );
};

export default PayrollDashboard;