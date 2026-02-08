import dpis from '../assets/Images/dpis.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Users,
  Settings,
  LogOut,
  IndianRupee,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { useState, useEffect } from 'react'

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  setMobileSidebarOpen,
  onLogout
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})

  const menuItems = [
    { 
      id: 'dashboard', 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      route: '/dashboard',
    },
   {
  id: 'attendance',
  icon: Calendar,
  label: (
    <span className="t font-semibold">Attendance</span>),
  route: '/attendance',
  subItems: [
    {
      label: (
        <span className="text-sm text-gray-600 hover:text-blue-600">
          Mark Attendance
        </span>
      ),
      route: '/attendance/markUserAttendance'
    },
    {
      label: (
        <span className="text-sm text-gray-600 hover:text-blue-600">
          Attendance Registration
        </span>
      ),
      route: '/attendance/attendanceImgReg'
    },
    {
      label: (
        <span className="text-sm text-gray-600 hover:text-blue-600">
          Pending Approvals
        </span>
      ),
      route: '/attendance/usersAttendance'
    }
  ]
},
    { id: 'leaves', icon: FileText, label: 'Leaves', route: '/leaves' },
    { id: 'payroll', icon: IndianRupee, label: 'Payroll', route: '/payroll' },
    { id: 'teachers', icon: Users, label: 'Teachers', route: '/teachers' },
    { id: 'settings', icon: Settings, label: 'Settings', route: '/settings' }
  ]

  // Auto-open dropdown if current route matches any sub-item
  useEffect(() => {
    menuItems.forEach(item => {
      if (item.subItems) {
        const isSubItemActive = item.subItems.some(subItem => 
          location.pathname.startsWith(subItem.route)
        )
        const isMainRouteActive = location.pathname === item.route
        
        if (isSubItemActive || isMainRouteActive) {
          setOpenDropdowns(prev => ({
            ...prev,
            [item.id]: true
          }))
        }
      }
    })
  }, [location.pathname])

  const toggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleMenuClick = (route, hasSubItems, itemId) => {
    // Navigate to the route first
    navigate(route)
    
    // Then toggle dropdown if it has sub-items and sidebar is open
    if (hasSubItems && sidebarOpen) {
      toggleDropdown(itemId)
    }
    
    // Close mobile sidebar
    if (window.innerWidth < 1024) {
      setMobileSidebarOpen(false)
    }
  }

  const handleSubItemClick = (route) => {
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

  const isRouteActive = (route, subItems) => {
    // Check if main route is active
    if (location.pathname === route) return true
    
    // Check if any sub-item route is active
    if (subItems) {
      return subItems.some(subItem => location.pathname.startsWith(subItem.route))
    }
    return false
  }

  return (
    <div
      className={`bg-[#F8FAFC] border-r border-gray-200 flex flex-col transition-all duration-300 h-full
      ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* Logo */}
      <div className="p-5 border border-gray-200">
        <div className="flex items-center gap-3">
          <button onClick={handleLogoClick} className="shrink-0">
            <img src={dpis} className="w-12 h-12 cursor-pointer" alt="DPIS Logo" />
          </button>

          {sidebarOpen && (
            <div>
              <h2 className="font-semibold text-gray-900 text-sm text-nowrap">
                Delhi Public International <br/> School
              </h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = isRouteActive(item.route, item.subItems)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isOpen = openDropdowns[item.id]

          return (
            <div key={item.id} className="mb-1">
              <button
                onClick={() => handleMenuClick(item.route, hasSubItems, item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}
                ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
                title={!sidebarOpen ? item.label : ''}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  {sidebarOpen && <span className="font-medium">{item.label}</span>}
                </div>
                {sidebarOpen && hasSubItems && (
                  isOpen ? 
                    <ChevronDown className="w-4 h-4" /> : 
                    <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {/* Dropdown Sub-items */}
              {sidebarOpen && hasSubItems && isOpen && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.subItems.map((subItem, index) => (
                    <button
                      key={index}
                      onClick={() => handleSubItemClick(subItem.route)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-all
                      ${location.pathname.startsWith(subItem.route)
                        ? 'bg-blue-50 text-blue-600 font-medium' 
                        : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                      <span>{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button 
          onClick={onLogout}
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