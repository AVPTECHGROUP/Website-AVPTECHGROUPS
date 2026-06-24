import dpis from '../assets/Images/dpis.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, FileText, Users, LogOut,
  ChevronDown, UserCog, Package, Bus, Phone, Mail,
  Shield, ChevronUp, ArrowLeftRight, BookOpenText,
  GraduationCap, SchoolIcon, MessageSquare,
  IndianRupee
} from 'lucide-react'
import { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { UserContext } from '../ContextAPI/UserContext'
import { PERMISSIONS as P, SYSTEM_ROLES } from '../Constants/Permission'

const SCHOOL_SWITCHER_ROLES = SYSTEM_ROLES.SCHOOL_SWITCHER;

// ── Menu definition — gated by PERMISSION, not role ─────────────────────────
// permission: single permission string required
// permissions: array — user needs AT LEAST ONE (OR logic)
// showIf: custom function(userPermissions) => boolean, for edge cases
// systemRole: true — gated by ROLE instead (only for the 2 screens that must
//             never be grantable via custom-role permissions; see permissions.js)
// No gate at all on a parent with subItems = visible if ANY child is visible.
const menuItems = [
  {
    id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard',
    permission: P.DASHBOARD_VIEW,
  },
  {
    id: 'manageUsers', icon: UserCog, label: 'Manage Users', route: '/manageUsers',
    permission: P.USER_VIEW,
  },
  {
    id: 'teachers', icon: Users, label: 'Teachers', route: '/teachers',
    permission: P.TEACHER_VIEW,
  },
  // ── Academics (With Nested Exams Dropdown) ──────────────────────────────────
  {
    id: 'academics', icon: GraduationCap, label: 'Academics', route: '/subjectsmaster',
    subItems: [
      { label: 'Subjects', route: '/subjectsmaster', permission: P.ACADEMIC_VIEW },
      // No dedicated permission exists for Class & Sections config; ACADEMIC_YEAR_MANAGE
      // is the closest accurate proxy (matches ADMIN/PRINCIPAL/SUPER_ADMIN/GLOBAL_ADMIN
      // having it and TEACHER not having it, per confirmed JWTs).
      { label: 'Class & Sections', route: '/academics/classSections', permission: P.CLASS_SECTION_MANAGE },
      { label: 'HomeWork', route: '/homework', permission: P.HOMEWORK_VIEW },
      { label: 'Time Table', route: '/schedule', permission: P.TIMETABLE_VIEW },
      {
        id: 'exams',
        label: 'Exams',
        route: '/exams',
        // TEACHER has no EXAM_VIEW — only the two below. Any-of covers all roles.
        permissions: [P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER],
        childItems: [
          { label: 'Exam Overview', route: '/exams', permissions: [P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER] },
          { label: 'Marks Entry', route: '/exams/marksEntry', permission: P.EXAM_MARKS_ENTER },
          { label: 'Report Cards', route: '/exams/reportCard', permission: P.EXAM_MARKS_VIEW_CLASS },
          { label: 'Analytics', route: '/exams/analytics', permission: P.EXAM_ANALYTICS_VIEW },
          { label: 'Exam Configuration', route: '/exams/examConfig', permission: P.EXAM_CONFIG_MANAGE },
        ]
      },
    ]
  },
  // ── Communication ───────────────────────────────────────────────────────────
  {
    id: 'communication',
    icon: MessageSquare,
    label: 'Communication',
    route: '/communication/circulars',
    subItems: [
      {
        label: 'Circulars',
        route: '/communication/circulars',
        permissions: [P.CIRCULAR_VIEW, P.CIRCULAR_CREATE, P.CIRCULAR_APPROVE, P.CIRCULAR_DELETE],
      },
      {
        label: 'School Events',
        route: '/communication/events',
        permissions: [P.EVENT_VIEW, P.EVENT_CREATE, P.EVENT_APPROVE, P.EVENT_DELETE],
      },
      {
        label: 'Approval Queue',
        route: '/communication/approval',
        permissions: [P.CIRCULAR_APPROVE, P.EVENT_APPROVE],
        badge: 3,
      },
      {
        label: 'Notifications',
        route: '/communication/notifications',
        permission: P.NOTICE_VIEW,
        badge: 7,
      },
    ],
  },
  {
    id: 'attendance', icon: Calendar, label: 'Attendance', route: '/attendance',
    // TEACHER has CREATE/EDIT but not VIEW — any-of covers everyone correctly.
    permissions: [P.ATTENDANCE_VIEW, P.ATTENDANCE_CREATE, P.ATTENDANCE_EDIT],
    subItems: [
      { label: 'Attendance Overview', route: '/attendance', permission: P.ATTENDANCE_VIEW },
      // Enrollment screens are admin-only in practice — gated on APPROVE which
      // PRINCIPAL/ADMIN/SUPER_ADMIN/GLOBAL_ADMIN have and TEACHER does not.
      { label: 'Staff Enrollment', route: '/attendance/staffImgReg', permission: P.ATTENDANCE_APPROVE },
      { label: 'Staff Attendance', route: '/attendance/markUserAttendance', permission: P.ATTENDANCE_CREATE },
      { label: 'Student Enrollment', route: '/attendance/studentImgReg', permission: P.ATTENDANCE_APPROVE },
      { label: 'Student Attendance', route: '/attendance/studentAttendance', permission: P.ATTENDANCE_CREATE },
    ]
  },
  {
    id: 'students', icon: Users, label: 'Students', route: '/students',
    permission: P.STUDENT_VIEW,
  },
  {
    id: 'leaves', icon: FileText, label: 'Leaves', route: '/leaves/applyLeaves',
    permission: P.LEAVE_VIEW,
    subItems: [
      { label: 'Manage Leave', route: '/leaves', permission: P.LEAVE_APPROVE },
      { label: 'My Leaves', route: '/leaves/myLeaves', permission: P.LEAVE_VIEW },
      { label: 'Holiday Management', route: '/leaves/manageHolidays', permission: P.HOLIDAY_MANAGE },
      { label: 'Leave Config', route: '/leaves/leaveConfig', permission: P.LEAVE_CONFIG_MANAGE },
    ]
  },
  {
    id: 'stock', icon: Package, label: 'Stock', route: '/stock',
    permission: P.STOCK_OVERVIEW,
    subItems: [
      { label: 'Stores', route: '/stock/stores', permission: P.STORE_VIEW },
      { label: 'Items', route: '/stock/items', permission: P.STOCK_ITEM_VIEW },
      { label: 'Transactions', route: '/stock/transactions', permissions: [P.STOCK_INWARD, P.STOCK_OUTWARD, P.STOCK_TRANSFER] },
      { label: 'Class Config', route: '/stock/classConfig', permission: P.CLASS_ITEM_CONFIG_VIEW },
      { label: 'Student Orders', route: '/stock/studentOrders', permission: P.STUDENT_ORDER_VIEW },
      { label: 'Movement History', route: '/stock/movementHistory', permission: P.STOCK_MOVEMENT_VIEW },
    ]
  },
  {
    // Standalone entry point for users (e.g. STORE_SELLER) who can view orders
    // but don't have full stock access — avoids duplicating "Student Orders"
    // from the Stock module above for accountants who already see it there.
    id: 'studentOrders', icon: Package, label: 'Student Orders', route: '/stock/studentOrders',
    showIf: (perms) => perms.includes(P.STUDENT_ORDER_VIEW) && !perms.includes(P.STOCK_OVERVIEW),
  },
  {
    id: 'transport', icon: Bus, label: 'Transport', route: '/route',
    permission: P.TRANSPORT_VIEW,
    subItems: [
      { label: 'Vehicles', route: '/route/vehicles', permission: P.TRANSPORT_VIEW },
      { label: 'Driver & Attendants', route: '/route/Driver&Attendants', permission: P.TRANSPORT_VIEW },
      { label: 'Routes', route: '/route/routes_management', permission: P.TRANSPORT_VIEW },
      { label: 'Student Allocations', route: '/route/studentAllocations', permission: P.TRANSPORT_EDIT },
      { label: 'Fee Plans', route: '/route/feePlans', permission: P.TRANSPORT_EDIT },
      { label: 'Reports', route: '/route/reports', permission: P.TRANSPORT_VIEW },
    ]
  },
  {
    id: 'academicYear', icon: BookOpenText, label: 'Academic Years', route: '/academicYear',
    permission: P.ACADEMIC_YEAR_MANAGE,
  },
  {
    id: 'FeeManagement', icon: IndianRupee, label: 'Fee Management', route: '/feemanagement',
    permission: P.FEE_VIEW,
    subItems: [
      { label: 'Fee Config', route: '/feemanagement/config', permission: P.FEE_STRUCTURE_MANAGE },
      { label: 'Collection and History', route: '/feemanagement/collections', permission: P.FEE_COLLECT },
    ]
  },
  // ── Stays role-locked by design — see SYSTEM_ROLES comment in permissions.js ──
  {
    id: 'Permission', icon: Shield, label: 'Permissions', route: '/rolesPermissions',
    systemRole: true,
  },
  {
    id: 'schoolConfig', icon: SchoolIcon, label: 'School Config', route: '/schoolConfig',
    systemRole: true,
  },
]

const roleBadgeStyles = {
  SUPER_ADMIN: 'bg-purple-100 text-purple-700',
  GLOBAL_ADMIN: 'bg-indigo-100 text-indigo-700',
  ADMIN: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  PRINCIPAL: 'bg-amber-100 text-amber-700',
  ACCOUNTANT: 'bg-cyan-100 text-cyan-700',
  RECEPTIONIST: 'bg-pink-100 text-pink-700',
  PARENT: 'bg-orange-100 text-orange-700',
  STORE_ACCOUNTANT: 'bg-teal-100 text-teal-700',
  STORE_SELLER: 'bg-indigo-100 text-indigo-700',
}

// ── Permission/role access checker — used recursively at all 3 menu tiers ───
const checkAccess = (item, userPermissions, userRole) => {
  if (item.systemRole) {
    const map = {
      Permission: SYSTEM_ROLES.ROLE_MANAGE,
      schoolConfig: SYSTEM_ROLES.SCHOOL_CONFIG_MANAGE,
    }
    return (map[item.id] || []).includes(userRole)
  }
  if (typeof item.showIf === 'function') return item.showIf(userPermissions)
  if (item.permission) return userPermissions.includes(item.permission)
  if (item.permissions) return item.permissions.some(p => userPermissions.includes(p))
  if (item.subItems) return item.subItems.some(sub => checkAccess(sub, userPermissions, userRole))
  if (item.childItems) return item.childItems.some(child => checkAccess(child, userPermissions, userRole))
  return true
}

const Sidebar = ({ sidebarOpen, setSidebarOpen, setMobileSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [openDropdowns, setOpenDropdowns] = useState({})
  const [openSubDropdowns, setOpenSubDropdowns] = useState({}) 
  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const { user: ctxUser, schoolInfo: ctxSchoolInfo } = useContext(UserContext)

  const [schoolInfo, setSchoolInfo] = useState(() => {
    try { return JSON.parse(localStorage.getItem('school')) || null }
    catch { return null }
  })

  useEffect(() => {
    const syncSchool = () => {
      try {
        const latest = JSON.parse(localStorage.getItem('school')) || null
        setSchoolInfo(latest)
      } catch { setSchoolInfo(null) }
    }
    window.addEventListener('storage', syncSchool)
    return () => window.removeEventListener('storage', syncSchool)
  }, [])

  useEffect(() => {
    if (ctxSchoolInfo) setSchoolInfo(ctxSchoolInfo)
  }, [ctxSchoolInfo])

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')) || null }
    catch { return null }
  })()
  const user = storedUser || ctxUser

  const userRole = ctxUser?.userType
    || (Array.isArray(ctxUser?.roles) ? ctxUser.roles[0] : null)
    || (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null)
    || null

  // ── Permissions array from JWT (decoded by UserContext, or fallback to localStorage) ──
  const userPermissions = ctxUser?.permissions || storedUser?.permissions || []

  const schoolDisplayName = schoolInfo?.schoolName || 'Delhi Public International School'
  const schoolDisplayCode = schoolInfo?.schoolCode || ''
  const schoolLogoUrl = schoolInfo?.logoUrl || dpis

  const handleSwitchSchool = () => {
    localStorage.removeItem('school')
    navigate('/superAdmin')
  }

  const filteredMenuItems = useMemo(() => {
    return menuItems
      .filter(item => checkAccess(item, userPermissions, userRole))
      .map(item => ({
        ...item,
        route: item.id === 'leaves' && !userPermissions.includes(P.LEAVE_APPROVE) ? '/leaves/myLeaves' : item.route,
        subItems: item.subItems
          ? item.subItems
              .filter(sub => checkAccess(sub, userPermissions, userRole))
              .map(sub => ({
                ...sub,
                childItems: sub.childItems
                  ? sub.childItems.filter(child => checkAccess(child, userPermissions, userRole))
                  : undefined
              }))
          : undefined
      }));
  }, [userPermissions, userRole]);

  const onLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('school')
    window.location.reload()
  }

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target))
        setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  useEffect(() => {
    if (location.pathname === '/login') return
    const newDropdowns = {}
    const newSubDropdowns = {}

    filteredMenuItems.forEach(item => {
      if (item.subItems) {
        const isSubActive = item.subItems.some(s => {
          const isDirectSubActive = location.pathname === s.route || location.pathname.startsWith(s.route + '/')
          let isChildActive = false

          if (s.childItems) {
            isChildActive = s.childItems.some(c => location.pathname === c.route || location.pathname.startsWith(c.route + '/'))
            if (isChildActive) newSubDropdowns[s.id] = true
          }
          return isDirectSubActive || isChildActive
        })
        const isMainActive = location.pathname === item.route
        if (isSubActive || isMainActive) newDropdowns[item.id] = true
      }
    })

    setOpenDropdowns(prev => ({ ...prev, ...newDropdowns }))
    setOpenSubDropdowns(prev => ({ ...prev, ...newSubDropdowns }))
  }, [location.pathname, filteredMenuItems])

  const toggleDropdown = (id) => setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }))
  const toggleSubDropdown = (id) => setOpenSubDropdowns(prev => ({ ...prev, [id]: !prev[id] }))

  const handleLogoClick = () => {
    if (window.innerWidth >= 1024) setSidebarOpen(!sidebarOpen)
    else setMobileSidebarOpen(false)
  }

  const handleMenuClick = (item) => {
    navigate(item.route)
    if (item.subItems?.length > 0 && sidebarOpen) toggleDropdown(item.id)
    if (window.innerWidth < 1024) setMobileSidebarOpen(false)
  }

  const handleSubItemClick = (subItem) => {
    navigate(subItem.route)
    if (subItem.childItems?.length > 0) {
      toggleSubDropdown(subItem.id)
    }
    if (window.innerWidth < 1024 && !subItem.childItems?.length) setMobileSidebarOpen(false)
  }

  const isRouteActive = (item) => {
    if (location.pathname === item.route) return true
    if (item.route !== '/' && location.pathname.startsWith(item.route + '/')) return true
    if (item.subItems) {
      return item.subItems.some(sub => {
        if (location.pathname === sub.route || location.pathname.startsWith(sub.route + '/')) return true
        if (sub.childItems) {
          return sub.childItems.some(child => location.pathname === child.route || location.pathname.startsWith(child.route + '/'))
        }
        return false
      })
    }
    return false
  }

  const displayName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(' ') ||
    user?.name || user?.username || 'User'

  const userPhone = user?.phone || user?.phoneNumber || null
  const userStatus = user?.status ? user.status.charAt(0) + user.status.slice(1).toLowerCase() : 'Active'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const badgeClass = roleBadgeStyles[userRole] || 'bg-gray-100 text-gray-600'
  const formatRoleLabel = (role) => role ? role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : ''

  const canSwitchSchool = SCHOOL_SWITCHER_ROLES.includes(userRole)

  return (
    <div className={`bg-[#F8FAFC] border-r border-gray-200 flex flex-col transition-all duration-300 h-full
      ${sidebarOpen ? 'w-64' : 'w-20'}`}
    >
      {/* ── Logo Heading Section ── */}
      <div className="p-5 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={handleLogoClick} className="shrink-0">
            <img
              src={schoolLogoUrl}
              className="w-12 h-12 cursor-pointer object-contain rounded-sm bg-white border border-gray-100"
              alt="School Logo"
              onError={(e) => { e.currentTarget.src = dpis }}
            />
          </button>

          {sidebarOpen && (
            <div className="min-w-0 flex-1">
              <h2 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                {schoolDisplayName}
              </h2>
              <p className="text-xs text-gray-500 mb-1.5">
                {schoolDisplayCode ? `${schoolDisplayCode} · ` : ''}Management System
              </p>
              {canSwitchSchool && (
                <button
                  onClick={handleSwitchSchool}
                  className="flex items-center gap-1 cursor-pointer text-[12px] font-semibold text-purple-600
                    bg-purple-50 hover:bg-purple-100 border border-purple-200 hover:border-purple-300
                    px-2 py-0.5 rounded-full transition-all duration-150"
                >
                  <ArrowLeftRight size={12} />
                  Switch School
                </button>
              )}
            </div>
          )}

          {!sidebarOpen && canSwitchSchool && (
            <div className="absolute left-0 right-0 flex justify-center" style={{ top: '72px' }}>
              <button
                onClick={handleSwitchSchool}
                title="Switch School"
                className="w-8 h-8 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200
                  flex items-center justify-center text-purple-600 transition-all duration-150"
              >
                <ArrowLeftRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Navigation Items Menu ── */}
      <nav className="flex-1 p-2 overflow-y-auto sidebar-scroll">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon
          const isActive = isRouteActive(item)
          const hasSubItems = item.subItems && item.subItems.length > 0
          const isOpen = openDropdowns[item.id]

          let calculatedHeight = item.subItems ? item.subItems.length * 45 : 0
          if (hasSubItems && isOpen) {
            item.subItems.forEach(sub => {
              if (sub.childItems && openSubDropdowns[sub.id]) {
                calculatedHeight += sub.childItems.length * 38
              }
            })
          }

          return (
            <div key={item.id} className="mb-0.5">
              <button
                onClick={() => handleMenuClick(item)}
                title={!sidebarOpen ? item.label : ''}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg
                  transition-all duration-200 select-none
                  ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
                  ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className="w-5 h-5 shrink-0" />
                  {sidebarOpen && <span className="font-medium text-sm truncate">{item.label}</span>}
                </div>
                {sidebarOpen && hasSubItems && (
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform duration-300
                    ${isActive ? 'text-blue-100' : 'text-gray-400'}
                    ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                  />
                )}
              </button>

              {/* ── Tier 2 (Sub Items Level Dropdown) ── */}
              {sidebarOpen && hasSubItems && (
                <div
                  style={{ maxHeight: isOpen ? `${calculatedHeight}px` : '0px' }}
                  className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
                >
                  <div className="mt-1 ml-4 pl-3 border-l-2 border-gray-200 space-y-0.5 pb-1">
                    {item.subItems.map((subItem, index) => {
                      const hasChildItems = subItem.childItems && subItem.childItems.length > 0
                      const isSubOpen = openSubDropdowns[subItem.id]
                      const isSubActive = location.pathname === subItem.route || 
                        (!['/exams', '/attendance', '/leaves'].includes(subItem.route) && location.pathname.startsWith(subItem.route + '/')) ||
                        (subItem.childItems && subItem.childItems.some(child => location.pathname === child.route || location.pathname.startsWith(child.route + '/')))

                      return (
                        <div key={index} className="w-full">
                          <button
                            onClick={() => handleSubItemClick(subItem)}
                            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg
                              text-sm transition-all duration-150 text-left select-none
                              ${isSubActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-800'}`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all duration-200
                                ${isSubActive ? 'bg-blue-500' : 'bg-gray-300'}`}
                              />
                              <span className="truncate">{subItem.label}</span>
                            </div>
                            {hasChildItems && (
                              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 text-gray-400
                                ${isSubOpen ? 'rotate-180' : 'rotate-0'}`}
                              />
                            )}
                          </button>

                          {/* ── Tier 3 (Exams Deep Nested Level Dropdown) ── */}
                          {hasChildItems && (
                            <div
                              style={{ maxHeight: isSubOpen ? `${subItem.childItems.length * 38}px` : '0px' }}
                              className="overflow-hidden transition-[max-height] duration-200 ease-in-out ml-3 pl-2.5 border-l border-gray-200 space-y-0.5 mt-0.5"
                            >
                              {subItem.childItems.map((childItem, childIndex) => {
                                const isChildActive = location.pathname === childItem.route || location.pathname.startsWith(childItem.route + '/')
                                return (
                                  <button
                                    key={childIndex}
                                    onClick={() => {
                                      navigate(childItem.route)
                                      if (window.innerWidth < 1024) setMobileSidebarOpen(false)
                                    }}
                                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all duration-150 text-left truncate
                                      ${isChildActive ? 'text-blue-600 font-medium bg-blue-50/50' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50'}`}
                                  >
                                    <span className="opacity-60">•</span>
                                    <span className="truncate">{childItem.label}</span>
                                  </button>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* ── Bottom Profile Section ── */}
      <div className="p-3 border-t border-gray-200 shrink-0" ref={profileRef}>
        <div className="relative">
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
                <ChevronUp className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0
                  ${profileOpen ? 'rotate-0' : 'rotate-180'}`}
                />
              </>
            )}
          </button>

          {profileOpen && (
            <div
              className={`absolute bottom-full mb-2 bg-white rounded-2xl shadow-xl border border-gray-100
                overflow-hidden z-50 ${sidebarOpen ? 'left-0 right-0' : 'left-0 w-64'}`}
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
                    <p className="text-xs text-gray-700 font-medium truncate">{user?.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center shrink-0">
                    <Phone className="w-3.5 h-3.5 text-green-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Phone</p>
                    <p className="text-xs text-gray-700 font-medium">{userPhone || 'Not provided'}</p>
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
                  <LogOut className="w-4 h-4" /> Sign Out
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

export default Sidebar;