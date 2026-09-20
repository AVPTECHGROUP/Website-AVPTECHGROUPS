import { lazy } from 'react';
import { Route } from 'react-router-dom';

const LandingApp = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Landing'));
const About = lazy(() => import('../../Pages/SchoolSpineWeb/pages/About'));
const Contact = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Contact'));
const PrivacyPolicy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Privacy_Policy'));
const LandingLayout = lazy(() => import('../../Pages/SchoolSpineWeb/pages/LandingLayout'));
const TermsOfService = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Terms'));
const CookiePolicy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/CookiePolicy'));

const FeatureDetails = lazy(() => import('../../Components/Homes/Details/Features/FeatureDetails'));
const Blog = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Blog'));
const Support = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Help_Support'));

const WebsitePage = ({ children }) => (
  <LandingLayout>{children}</LandingLayout>
);

export default function SchoolSpineWebRoutes() {
  return (
    <>
      <Route path="/" element={<LandingApp />} />
      <Route path="/about" element={<WebsitePage><About /></WebsitePage>} />
      <Route path="/contact" element={<WebsitePage><Contact /></WebsitePage>} />
      <Route path="/privacy-policy" element={<WebsitePage><PrivacyPolicy /></WebsitePage>} />
      <Route path="/terms" element={<WebsitePage><TermsOfService /></WebsitePage>} />
      <Route path="/cookies" element={<WebsitePage><CookiePolicy /></WebsitePage>} />
      
      <Route path="/blog" element={<WebsitePage><Blog /></WebsitePage>} />
      <Route path="/features/:slug" element={<WebsitePage><FeatureDetails /></WebsitePage>} />
      <Route path="/support" element={<WebsitePage><Support /></WebsitePage>} />
    </>
  );
}
