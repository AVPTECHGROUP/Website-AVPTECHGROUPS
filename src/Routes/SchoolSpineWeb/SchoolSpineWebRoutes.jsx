import { lazy } from 'react';
import { Route } from 'react-router-dom';

const LandingApp = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Landing'));
const About = lazy(() => import('../../Pages/SchoolSpineWeb/pages/About'));
const Contact = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Contact'));
const PrivacyPolicy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Privacy_Policy'));
const LandingLayout = lazy(() => import('../../Pages/SchoolSpineWeb/pages/LandingLayout'));
const Terms_Of_Service = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Terms'));
const Cookie_Policy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/CookiePolicy'));
const FaqListing = lazy(() => import('../../Components/Homes/Faq/FaqLisitng'));

// Called as a function: SchoolSpineWebRoutes({ RootRedirect, isLoggedIn })
export default function SchoolSpineWebRoutes({RootRedirect, isLoggedIn }) {
  return (
    <>
      <Route path="/" element={isLoggedIn ? <RootRedirect /> : <LandingApp />} />
      <Route
        path="/about"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><About /></LandingLayout>}
      />
      <Route
        path="/contact"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Contact /></LandingLayout>}
      />
      <Route
        path="/privacy-policy"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><PrivacyPolicy /></LandingLayout>}
      />
      <Route
        path="/terms"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Terms_Of_Service /></LandingLayout>}
      />
      <Route
        path="/cookies"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Cookie_Policy /></LandingLayout>}
      />
      <Route
        path="/faqs"
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><FaqListing /></LandingLayout>}
      />
    </>
  );
}
