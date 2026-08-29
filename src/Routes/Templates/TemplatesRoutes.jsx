import { lazy } from 'react';
import { Route } from 'react-router-dom';


const ReportCardTemplates = lazy(() => import('../../Pages/Templates/ReportCardTemplates'));
const IDCardTemplates = lazy(() => import('../../Pages/Templates/IDCardTemplates'));
const AdmitCardTemplates = lazy(() => import('../../Pages/Templates/AdmitCardTemplates'));
const CertificateTemplates = lazy(() => import('../../Pages/Templates/CertificateTemplates'));
const FeeReceiptTemplates = lazy(() => import('../../Pages/Templates/FeeReceiptTemplates'));
const GatePassTemplates = lazy(() => import('../../Pages/Templates/GatePassTemplates'));
const CycleStandPassTemplates = lazy(() => import('../../Pages/Templates/CycleStandPassTemplates'));
const VisitorPassTemplates = lazy(() => import('../../Pages/Templates/VisitorPassTemplates'));
const SalarySlipTemplates = lazy(() => import('../../Pages/Templates/SalarySlipTemplates'));
const NoDuesFormTemplates = lazy(() => import('../../Pages/Templates/NoDuesTemplates.jsx'));
const TemplatesRoutes = () => (
    <>
        <Route path="/templates/reportCard" element={<ReportCardTemplates />} />
        <Route path="/templates/idCard" element={<IDCardTemplates />} />
        <Route path="/templates/admitCard" element={<AdmitCardTemplates />} />
        <Route path="/templates/certificate" element={<CertificateTemplates />} />
        <Route path="/templates/feeReceipt" element={<FeeReceiptTemplates />} />
        <Route path="/templates/gatePass" element={<GatePassTemplates />} />
        <Route path="/templates/cycleStandPass" element={<CycleStandPassTemplates />} />
        <Route path="/templates/visitorPass" element={<VisitorPassTemplates />} />
        <Route path="/templates/SalarySlip" element={<SalarySlipTemplates />} />
        <Route path="/templates/noDues" element={<NoDuesFormTemplates />} />
    </>
);

export default TemplatesRoutes;