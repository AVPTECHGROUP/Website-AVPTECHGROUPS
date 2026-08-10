import { lazy } from 'react';
import { Route } from 'react-router-dom';

const ReportCardTemplates = lazy(() => import('../../Pages/Templates/ReportCardTemplates'));
const IDCardTemplates = lazy(() => import('../../Pages/Templates/IDCardTemplates'));
const AdmitCardTemplates = lazy(() => import('../../Pages/Templates/AdmitCardTemplates'));
const CertificateTemplates = lazy(() => import('../../Pages/Templates/CertificateTemplates'));
const FeeReceiptTemplates = lazy(() => import('../../Pages/Templates/FeeReceiptTemplates'));
const GatePassTemplates = lazy(() => import('../../Pages/Templates/GatePassTemplates'));

const TemplatesRoutes = () => (
  <>
    <Route path="/templates/reportCard" element={<ReportCardTemplates />} />
    <Route path="/templates/idCard" element={<IDCardTemplates />} />
    <Route path="/templates/admitCard" element={<AdmitCardTemplates />} />
    <Route path="/templates/certificate" element={<CertificateTemplates />} />
    <Route path="/templates/feeReceipt" element={<FeeReceiptTemplates />} />
    <Route path="/templates/gatePass" element={<GatePassTemplates />} />
  </>
);

export default TemplatesRoutes;