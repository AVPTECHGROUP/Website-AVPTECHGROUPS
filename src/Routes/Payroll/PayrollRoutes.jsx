import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Payroll = lazy(() => import('../../Pages/Payroll/Payroll'));
const MyPayroll = lazy(() => import('../../Pages/Payroll/mypayroll'));
const PayrollConfig = lazy(() => import('../../Pages/Payroll/Payrollconfig'));

export default function PayrollRoutes() {
    return (
        <>
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/payroll/myPayroll" element={<MyPayroll />} />
            <Route path="/payroll/payrollConfig" element={<PayrollConfig />} />
        </>
    );
}