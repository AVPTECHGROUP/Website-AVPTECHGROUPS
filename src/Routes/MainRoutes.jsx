import { Suspense } from 'react';
import { Routes } from 'react-router-dom';
import SchoolSpineWebRoutes from './SchoolSpineWeb/WebRoutes';

const MainRoutes = () => (
  <Suspense fallback={<div className="min-h-screen bg-white" />}>
    <Routes>
      {SchoolSpineWebRoutes()}
    </Routes>
  </Suspense>
);

export default MainRoutes;
