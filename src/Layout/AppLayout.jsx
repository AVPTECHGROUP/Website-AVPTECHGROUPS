import { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Sidebar from '../Components/Sidebar';
import { getCurrUserDetails } from '../utils/getCurrUserDetails/GetCurrUserDetails';

// ✅ Roles that require school selection before accessing dashboard
const SCHOOL_SELECTION_ROLES = ['SUPER_ADMIN', 'GLOBAL_ADMIN'];

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const decoded = getCurrUserDetails();
  const role = decoded?.roles?.[0];

  // ── Guard: if role requires school selection and no schoolId in token → redirect to picker
  if (SCHOOL_SELECTION_ROLES.includes(role) && !decoded?.schoolId) {
    return <Navigate to="/superAdmin" replace />;
  }

  const schoolInfo = (() => {
    try { return JSON.parse(localStorage.getItem('school')); }
    catch { return null; }
  })();
  const schoolDisplayName = schoolInfo?.schoolName || 'Delhi Public International School';

  return (
    <div className="flex h-screen overflow-hidden bg-[#edf0f3]">

      {/* Mobile Overlay */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static z-50 h-full transition-transform duration-300
          ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0`}
      >
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          setMobileSidebarOpen={setMobileSidebarOpen}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b lg:hidden px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>
          <h1 className="text-lg font-bold truncate">{schoolDisplayName}</h1>
        </header>

        <main className="overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;