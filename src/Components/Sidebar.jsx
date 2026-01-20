import dpis from '../assets/Images/dpis.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  IndianRupee
} from 'lucide-react'

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  setMobileSidebarOpen,
  onLogout
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard' },
    { id: 'attendance', icon: Calendar, label: 'Attendance', route: '/attendance' },
    { id: 'leaves', icon: FileText, label: 'Leaves', route: '/leaves' },
    { id: 'payroll', icon: IndianRupee, label: 'Payroll', route: '/payroll' },
    { id: 'teachers', icon: Users, label: 'Teachers', route: '/teachers' },
    { id: 'settings', icon: Settings, label: 'Settings', route: '/settings' }
  ]

  const handleMenuClick = (route) => {
    navigate(route)
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false)
    }
  }

  const handleLogoClick = () => {
    if (window.innerWidth >= 1024) {
      setSidebarOpen(!sidebarOpen)
    } else {
      setMobileSidebarOpen(false)
    }
  }

  return (
    <div
      className={`bg-[#F8FAFC] border-r border-gray-200 flex flex-col transition-all duration-300 h-screen
      ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Logo */}
      <div className="p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={handleLogoClick} className="shrink-0">
            <img src={dpis} className="w-12 h-12 cursor-pointer" />
          </button>

          {sidebarOpen && (
            <div>
              <h2 className="font-semibold text-gray-900 text-sm text-nowrap">Delhi Public International <br/> School</h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.route

          return (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.route)}
              className={`w-full flex items-center gap-3 px-4 py-3 mb-1 rounded-lg transition-all
              ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
              ${!sidebarOpen ? 'justify-center' : ''}`}
              title={!sidebarOpen ? item.label : ''}
            >
              <Icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{item.label}</span>}
            </button>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 ">
        <button onClick={onLogout}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100
          ${!sidebarOpen ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {sidebarOpen && <span className="font-medium">Log Out</span>}
        </button>
      </div>
    </div>
  )
}

export default Sidebar