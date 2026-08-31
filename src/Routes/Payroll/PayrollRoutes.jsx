import { lazy } from 'react';
import { Route } from 'react-router-dom';

const Payrollmodule = lazy(() => import('../../Pages/Payroll/Payrollmodule'));

export default function PayrollRoutes() {
    return (
        <>
            <Route path="/payroll" element={<Payrollmodule />} />
        </>
    );
}