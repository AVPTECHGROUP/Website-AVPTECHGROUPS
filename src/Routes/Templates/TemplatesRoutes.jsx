import { lazy } from 'react';
import { Route } from 'react-router-dom';

// Same pattern as the other module route files (AttendanceRoutes, StockRoutes, ...):
// each page is lazy-loaded here, and this function returns the <Route> elements
// that MainRoutes.jsx renders inside <AppLayout />.
const ReportCardTemplates = lazy(() => import('../../Pages/Templates/ReportCardTemplates'));
const IDCardTemplates = lazy(() => import('../../Pages/Templates/IDCardTemplates'));
const AdmitCardTemplates = lazy(() => import('../../Pages/Templates/AdmitCardTemplates'));
const CertificateTemplates = lazy(() => import('../../Pages/Templates/CertificateTemplates'));
const FeeReceiptTemplates = lazy(() => import('../../Pages/Templates/FeeReceiptTemplates'));

// NOTE: paths hardcoded here to match Sidebar.jsx exactly. If your project
// keeps route strings centralized in Constants/RoutesConstants/RoutesConst.js
// (like ROUTE_PATHS.DASHBOARD, ROUTE_PATHS.SETTINGS elsewhere in MainRoutes.jsx),
// just add these 5 keys there and swap the string literals below for
// ROUTE_PATHS.TEMPLATES_REPORT_CARD etc. — everything else stays the same.
const TemplatesRoutes = () => (
  <>
    <Route path="/templates/reportCard" element={<ReportCardTemplates />} />
    <Route path="/templates/idCard" element={<IDCardTemplates />} />
    <Route path="/templates/admitCard" element={<AdmitCardTemplates />} />
    <Route path="/templates/certificate" element={<CertificateTemplates />} />
    <Route path="/templates/feeReceipt" element={<FeeReceiptTemplates />} />
  </>
);

export default TemplatesRoutes;
