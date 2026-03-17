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
  UserCog,
  Package,
  Bus,
  Phone,
  Mail,
  Shield,
  ChevronUp,
} from 'lucide-react'
import { useState, useEffect, useContext, useRef } from 'react'
import { UserContext } from '../ContextAPI/UserContext'

const menuItems = [
  {
    id: 'dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    route: '/dashboard',
    roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STORE_ACCOUNTANT'],
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
    label: 'Attendance',
    route: '/attendance',
    roles: ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
    subItems: [
      {
        label: 'Mark Attendance',
        route: '/attendance/markUserAttendance',
        roles: ['SUPER_ADMIN', 'ADMIN', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: 'Attendance Registration',
        route: '/attendance/attendanceImgReg',
        roles: ['SUPER_ADMIN', 'ADMIN'],
      },
      {
        label: 'Pending Approvals',
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
    label: 'Manage Leaves',
    route: '/leaves',
    roles: ['ADMIN', 'SUPER_ADMIN', 'TEACHER', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
    subItems: [
      {
        label: 'Apply Leave',
        route: '/leaves/applyLeaves',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: 'My Leaves',
        route: '/leaves/myLeaves',
        roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST'],
      },
      {
        label: 'Holiday Management',
        route: '/leaves/manageHolidays',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      }
    ]
  },
  {
    id: 'stock',
    icon: Package,
    label: 'Stock',
    route: '/stock',
    roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],  // ← STORE_SELLER removed
    subItems: [
      {
        label: 'Stores',
        route: '/stock/stores',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],
      },
      {
        label: 'Items',
        route: '/stock/items',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],
      },
      {
        label: 'Transactions',
        route: '/stock/transactions',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],
      },
      {
        label: 'Class Config',
        route: '/stock/classConfig',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],
      },
      {
        label: 'Student Orders',
        route: '/stock/studentOrders',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],  // ← STORE_SELLER removed
      },
      {
        label: 'Movement History',
        route: '/stock/movementHistory',
        roles: ['ADMIN', 'SUPER_ADMIN', 'STORE_ACCOUNTANT'],
      }
    ]
  },
  // ── STORE_SELLER sees only this top-level item (like Students for ADMIN) ──
  {
    id: 'studentOrders',
    icon: Package,
    label: 'Student Orders',
    route: '/stock/studentOrders',
    roles: ['STORE_SELLER'],
  },
  {
    id: 'transport',
    icon: Bus,
    label: 'Transport',
    route: '/route',
    roles: ['ADMIN', 'SUPER_ADMIN', 'PRINCIPAL'],
    subItems: [
      {
        label: 'Vehicles',
        route: '/route/vehicles',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Driver & Attendants',
        route: '/route/Driver&Attendants',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Routes',
        route: '/route/routes_management',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Student Allocations',
        route: '/route/studentAllocations',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Fee Plans',
        route: '/route/feePlans',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      },
      {
        label: 'Reports',
        route: '/route/reports',
        roles: ['ADMIN', 'SUPER_ADMIN'],
      }
    ]
  },
  {
    id: 'Permission',
    icon: Shield,
    label: 'Permissions',
    route: '/accessPermissions',
    roles: [ 'SUPER_ADMIN'],
  },
  // {
  //   id: 'settings',
  //   icon: Settings,
  //   label: 'Settings',
  //   route: '/settings',
  //   roles: ['ADMIN', 'TEACHER', 'SUPER_ADMIN', 'PRINCIPAL', 'ACCOUNTANT', 'RECEPTIONIST', 'PARENT', 'STORE_ACCOUNTANT', 'STORE_SELLER'],
  // },
]

const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN']

const roleBadgeStyles = {
  SUPER_ADMIN:      'bg-purple-100 text-purple-700',
  ADMIN:            'bg-blue-100 text-blue-700',
  TEACHER:          'bg-green-100 text-green-700',
  PRINCIPAL:        'bg-amber-100 text-amber-700',
  ACCOUNTANT:       'bg-cyan-100 text-cyan-700',
  RECEPTIONIST:     'bg-pink-100 text-pink-700',
  PARENT:           'bg-orange-100 text-orange-700',
  STORE_ACCOUNTANT: 'bg-teal-100 text-teal-700',
  STORE_SELLER:     'bg-indigo-100 text-indigo-700',
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, setMobileSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const { user: ctxUser } = useContext(UserContext)

  const storedUser = (() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  })()

  const user = storedUser || ctxUser

  const userRole = ctxUser?.userType
    || (Array.isArray(ctxUser?.roles) ? ctxUser.roles[0] : null)
    || (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null)
    || null

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
    window.location.reload()
  }

  /* Close profile dropdown on outside click */
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  /* Auto-open the accordion for whichever route is currently active */
  useEffect(() => {
    if (location.pathname === '/login') return
    const newDropdowns = {}
    filteredMenuItems.forEach(item => {
      if (item.subItems) {
        const isSubActive = item.subItems.some(s => location.pathname.startsWith(s.route))
        const isMainActive = location.pathname === item.route
        if (isSubActive || isMainActive) newDropdowns[item.id] = true
      }
    })
    setOpenDropdowns(prev => {
      const merged = { ...prev, ...newDropdowns }
      const same =
        Object.keys(merged).length === Object.keys(prev).length &&
        Object.keys(merged).every(k => prev[k] === merged[k])
      return same ? prev : merged
    })
  }, [location.pathname])

  const toggleDropdown = (itemId) => {
    setOpenDropdowns(prev => ({ ...prev, [itemId]: !prev[itemId] }))
  }

  const handleMenuClick = (item) => {
    navigate(item.route)
    if (item.subItems && item.subItems.length > 0 && sidebarOpen) {
      toggleDropdown(item.id)
    }
    if (window.innerWidth < 1024) setMobileSidebarOpen(false)
  }

  const handleSubItemClick = (route) => {
    navigate(route)
    if (window.innerWidth < 1024) setMobileSidebarOpen(false)
  }

  const handleLogoClick = () => {
    if (window.innerWidth >= 1024) setSidebarOpen(!sidebarOpen)
    else setMobileSidebarOpen(false)
  }

  const isRouteActive = (item) =>
    location.pathname === item.route ||
    (item.subItems && item.subItems.some(s => location.pathname.startsWith(s.route)))

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name ||
    user?.username ||
    'User'

  const userPhone = user?.phone || user?.phoneNumber || null
  const userStatus = user?.status
    ? user.status.charAt(0) + user.status.slice(1).toLowerCase()
    : 'Active'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const badgeClass = roleBadgeStyles[userRole] || 'bg-gray-100 text-gray-600'

  const formatRoleLabel = (role) => {
    if (!role) return ''
    return role
      .split('_')
      .map(word => word.charAt(0) + word.slice(1).toLowerCase())
      .join(' ')
  }

  return (
    <div
      className={`bg-[#F8FAFC] border-r border-gray-200 flex flex-col transition-all duration-300 h-full
        ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* ── Logo ── */}
      <div className="p-5 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleLogoClick} className="shrink-0">
            <img src={dpis} className="w-12 h-12 cursor-pointer rounded-lg" alt="DPIS Logo" />
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

      {/* ── Navigation — scrollable, scrollbar hidden ── */}
      <nav className="flex-1 p-2 overflow-y-auto sidebar-scroll">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = isRouteActive(item)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isOpen = openDropdowns[item.id]

          return (
            <div key={item.id} className="mb-0.5">
              {/* Parent row */}
              <button
                onClick={() => handleMenuClick(item)}
                title={!sidebarOpen ? item.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 select-none
                  ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }
                  ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && (
                    <span className="font-medium text-sm truncate">{item.label}</span>
                  )}
                </div>
                {sidebarOpen && hasSubItems && (
                  <ChevronDown
                    className={`w-4 h-4 shrink-0 transition-transform duration-300
                      ${isActive ? 'text-blue-100' : 'text-gray-400'}
                      ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                )}
              </button>

              {/* ── Inline accordion sub-items ── */}
              {sidebarOpen && hasSubItems && (
                <div
                  style={{ maxHeight: isOpen ? `${item.subItems.length * 48}px` : '0px' }}
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                >
                  <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-200 space-y-0.5 pb-1">
                    {item.subItems.map((subItem, index) => {
                      const isSubActive = location.pathname.startsWith(subItem.route)
                      return (
                        <button
                          key={index}
                          onClick={() => handleSubItemClick(subItem.route)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg
                            text-sm transition-all duration-150 text-left
                            ${isSubActive
                              ? 'bg-blue-50 text-blue-600 font-semibold'
                              : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'
                            }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200
                              ${isSubActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                          />
                          <span className="truncate">{subItem.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Profile Section ── */}
      <div className="p-3 border-t border-gray-200 shrink-0" ref={profileRef}>
        <div className="relative">
          {/* Trigger button */}
          <button
            onClick={() => setProfileOpen(prev => !prev)}
            className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2.5 rounded-xl
              transition-all duration-200 hover:bg-blue-50 border border-transparent hover:border-blue-100
              ${profileOpen ? 'bg-blue-50 border-blue-100' : ''}
              ${!sidebarOpen ? 'justify-center' : ''}`}
            title={!sidebarOpen ? displayName : ''}
          >
            <div className="shrink-0 w-9 h-9 rounded-full bg-linear-to-br from-blue-500 to-blue-700
              flex items-center justify-center text-white font-bold text-sm shadow-sm">
              {initials}
            </div>
            {sidebarOpen && (
              <>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{displayName}</p>
                  <p className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full inline-block mt-0.5 ${badgeClass}`}>
                    {formatRoleLabel(userRole)}
                  </p>
                </div>
                <ChevronUp
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0
                    ${profileOpen ? 'rotate-0' : 'rotate-180'}`}
                />
              </>
            )}
          </button>

          {/* Dropdown panel — opens upward */}
          {profileOpen && (
            <div
              className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100
                overflow-hidden z-50
                ${sidebarOpen ? 'left-0 right-0' : 'left-0 w-64'}`}
              style={{ animation: 'slideUp 0.18s ease-out' }}
            >
              <div className="h-12 bg-linear-to-r from-blue-600 to-blue-500 relative">
                <div className="absolute -bottom-5 left-4">
                  <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md">
                    <div className="w-full h-full rounded-full bg-linear-to-br from-blue-500 to-blue-700
                      flex items-center justify-center text-white font-bold text-sm">
                      {initials}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-7 px-4 pb-3 border-b border-gray-100">
                <p className="font-bold text-gray-900 text-sm">{displayName}</p>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${badgeClass}`}>
                  {formatRoleLabel(userRole)}
                </span>
              </div>

              <div className="px-4 py-3 space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mail className="w-3.5 h-3.5 text-blue-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Email</p>
                    <p className="text-xs text-gray-700 font-medium truncate">
                      {user?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-gray-700 font-medium">
                      {userPhone || 'Not provided'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Status</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      <p className="text-xs text-emerald-600 font-semibold">{userStatus}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-3 pb-3">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                    bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm
                    transition-colors duration-150 border border-red-100 hover:border-red-200"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .sidebar-scroll::-webkit-scrollbar { display: none; }
        .sidebar-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  )
}

export default Sidebar