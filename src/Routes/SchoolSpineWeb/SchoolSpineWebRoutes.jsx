import { lazy } from 'react';
import { Route } from 'react-router-dom';
import { ROUTE_PATHS } from '../../Constants/RoutesConstants/RoutesConst';

const LandingApp = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Landing'));
const About = lazy(() => import('../../Pages/SchoolSpineWeb/pages/About'));
const Contact = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Contact'));
const PrivacyPolicy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Privacy_Policy'));
const LandingLayout = lazy(() => import('../../Pages/SchoolSpineWeb/pages/LandingLayout'));
const Terms_Of_Service = lazy(() => import('../../Pages/SchoolSpineWeb/pages/Terms'));
const Cookie_Policy = lazy(() => import('../../Pages/SchoolSpineWeb/pages/CookiePolicy'));
const FaqListing = lazy(() => import('../../Components/Homes/Faq/FaqLisitng'));

// Called as a function: SchoolSpineWebRoutes({ RootRedirect, isLoggedIn })
export default function SchoolSpineWebRoutes({ RootRedirect, isLoggedIn }) {
  return (
    <>
      <Route path={ROUTE_PATHS.HOME} element={isLoggedIn ? <RootRedirect /> : <LandingApp />} />
      <Route
        path={ROUTE_PATHS.ABOUT}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><About /></LandingLayout>}
      />
      <Route
        path={ROUTE_PATHS.CONTACT}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Contact /></LandingLayout>}
      />
      <Route
        path={ROUTE_PATHS.PRIVACY_POLICY}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><PrivacyPolicy /></LandingLayout>}
      />
      <Route
        path={ROUTE_PATHS.TERMS}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Terms_Of_Service /></LandingLayout>}
      />
      <Route
        path={ROUTE_PATHS.COOKIES}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><Cookie_Policy /></LandingLayout>}
      />
      <Route
        path={ROUTE_PATHS.FAQS}
        element={isLoggedIn ? <RootRedirect /> : <LandingLayout><FaqListing /></LandingLayout>}
      />
    </>
  );
}
