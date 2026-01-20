import { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from './Components/Sidebar';
import MainRoutes from './Routes/MainRoutes';
import Login_2 from './Pages/Login_2'; // Make sure path is correct

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if token exists in localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('token'); // Assuming you save token as 'token'
    if (token) setIsLoggedIn(true);
  }, []);

  // Handler for login success
  const handleLoginSuccess = (token) => {
    localStorage.setItem('token', token);
    setIsLoggedIn(true);
  };

  // Handler for logout (optional for future use)
  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
  };

  // If not logged in, show login page only
  if (!isLoggedIn) {
    return <Login_2  onLoginSuccess={handleLoginSuccess} />;
  }

  // If logged in, show sidebar + main routes
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
          onLogout={handleLogout} 
        />
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <header className="bg-white border-b lg:hidden px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <h1 className="text-lg font-bold">Delhi Public International School</h1>
        </header>

        {/* Routes */}
        <main className="flex-1 overflow-auto">
          <MainRoutes />
        </main>
      </div>
    </div>
  );
};

export default App;
