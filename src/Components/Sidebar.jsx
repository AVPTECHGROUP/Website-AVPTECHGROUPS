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
  ChevronRight,
  UserCog,
  Package,
  Bus
} from 'lucide-react'
import { useState, useEffect, useContext } from 'react'
import { UserContext } from '../ContextAPI/UserContext'

const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    route: '/dashboard',
    roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT'],
  },
  {
    id: 'manageUsers',
    icon: UserCog,
    label: 'Manage Users',
    route: '/dashboard/manageUsers',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    id: 'teachers',
    icon: Users,
    label: 'Teachers',
    route: '/teachers',
    roles: ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'],
  },
  {
    id: 'attendance',
    icon: Calendar,
    label: <span className="font-semibold">Attendance</span>,
    route: '/attendance',
    roles: ['ADMIN', 'SUPER_ADMIN','TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
    subItems: [
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Mark Attendance</span>,
        route: '/attendance/markUserAttendance',
        roles: ['SUPER_ADMIN', 'ADMIN','TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Attendance Registration</span>,
        route: '/attendance/attendanceImgReg',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Pending Approvals</span>,
        route: '/attendance/usersAttendance',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      }
    ]
  },
  {
    id: 'students',
    icon: Users,
    label: 'Students',
    route: '/students',
    roles: ['ADMIN', 'SUPER_ADMIN'],
  },
  {
    id: 'leaves',
    icon: FileText,
    label: <span className="font-semibold">Manage Leaves</span>,
    route: '/leaves',
    roles: ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
    subItems: [
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Apply Leave</span>,
        route: '/leaves/applyLeaves',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">My Leaves</span>,
        route: '/leaves/myLeaves',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Holiday Management</span>,
        route: '/leaves/manageHolidays',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      }
    ]
  },
  {
    id: 'stock',
    icon: Package,
    label: <span className="font-semibold">Stock</span>,
    route: '/stock',
    roles: ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
    subItems: [
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Stores</span>,
        route: '/stock/stores',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Items</span>,
        route: 'stock/items',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Transactions</span>,
        route: 'stock/transactions',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Movement History</span>,
        route: 'stock/movementHistory',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      }
    ]
  },
  {
    id: 'transport',
    icon: Bus,
    label: <span className="font-semibold">Transport </span>,
    route: '/route',
    roles: ['ADMIN', 'SUPER_ADMIN','PRINCIPAL'],
    subItems: [
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Vehicles</span>,
        route: '/route/vehicles',
        roles: ['ADMIN','SUPER_ADMIN', 'PRINCIPAL'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Driver & Attendants</span>,
        route: '/route/Driver&Attendants',
        roles: ['ADMIN','SUPER_ADMIN','PRINCIPAL'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Routes</span>,
        route: '/route/routes_management',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Student Allocations</span>,
        route: '/route/studentAllocations',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Fee Plans</span>,
        route: '/route/feePlans',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      { 
        label: <span className="text-sm text-gray-600 hover:text-blue-600">Reports</span>,
        route: '/route/reports',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      }
    ]
  },
  {
    id: 'payroll',
    icon: IndianRupee,
    label: 'Payroll',
    route: '/payroll',
    roles: ['ADMIN', 'SUPER_ADMIN', 'ACCOUNTANT'],
  },
  {
    id: 'settings',
    icon: Settings,
    label: 'Settings',
    route: '/settings',
    roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST','PARENT'],
  },
]

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

const Sidebar = ({
  sidebarOpen,
  setSidebarOpen,
  setMobileSidebarOpen,
}) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})

  const {user} = useContext(UserContext);

  const userRole = user?.userType || null

  const filteredMenuItems = menuItems
    .filter(item => item.roles.includes(userRole))
    .map(item => ({
      ...item,
      route: item.id === 'attendance' && !ADMIN_ROLES.includes(userRole)
        ? '/attendance/markUserAttendance'
        : item.id === 'leaves' && !ADMIN_ROLES.includes(userRole)
          ? '/leaves/myLeaves'
          : item.route,
      subItems: item.subItems
        ? item.subItems.filter(sub => !sub.roles || sub.roles.includes(userRole))
        : undefined
    }))

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.reload();
  }

  useEffect(() => {
    if (location.pathname === '/login') return

    const newDropdowns = {}

    filteredMenuItems.forEach(item => {
      if (item.subItems) {
        const isSubItemActive = item.subItems.some(subItem =>
          location.pathname.startsWith(subItem.route)
        )
        const isMainRouteActive = location.pathname === item.route

        if (isSubItemActive || isMainRouteActive) {
          newDropdowns[item.id] = true
        }
      }
    })

    setOpenDropdowns(prev => {
      const isSame = Object.keys(newDropdowns).every(key => prev[key] === newDropdowns[key])
        && Object.keys(newDropdowns).length === Object.keys(prev).filter(k => prev[k] && newDropdowns[k]).length
      if (isSame) return prev
      return { ...prev, ...newDropdowns }
    })

  }, [location.pathname, user])

  const toggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }))
  }

  const handleMenuClick = (route, hasSubItems, itemId) => {
    navigate(route)
    if (hasSubItems && sidebarOpen) {
      toggleDropdown(itemId)
    }
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
    if (location.pathname === route) return true
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
                Delhi Public International <br /> School
              </h2>
              <p className="text-xs text-gray-500">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        {filteredMenuItems.map((item) => {
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
                  isOpen
                    ? <ChevronDown className="w-4 h-4" />
                    : <ChevronRight className="w-4 h-4" />
                )}
              </button>

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