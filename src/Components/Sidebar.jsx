import dpis from '../assets/Images/dpis.jpg'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, FileText, Users, LogOut,
  ChevronDown, UserCog, Package, Bus, Shield, ChevronUp,
  ArrowLeftRight, BookOpenText, GraduationCap, SchoolIcon,
  MessageSquare, IndianRupee, Mail, Phone, Printer, CreditCard,
  Ticket, Award, Receipt, DoorOpen,
  Bike,
  Wallet,
  UserCheck
} from 'lucide-react'
import { useState, useEffect, useContext, useRef, useMemo } from 'react'
import { UserContext } from '../ContextAPI/UserContext'
import { PERMISSIONS as P, SYSTEM_ROLES } from '../Constants/Permission'



const SCHOOL_SWITCHER_ROLES = SYSTEM_ROLES.SCHOOL_SWITCHER;

// ── Restructured Menu Definition with Category Sections ─────────────────────────
const menuSections = [
  {
    section: 'MAIN',
    items: [
      {
        id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', route: '/dashboard',
        permission: P.DASHBOARD_VIEW,
      }
    ]
  },
  {
    section: 'PEOPLE',
    items: [
      {
        id: 'manageUsers', icon: UserCog, label: 'Staff Management', route: '/manageUsers',
        permission: P.USER_VIEW,
      },
      {
        id: 'teachers', icon: Users, label: 'Teachers', route: '/teachers',
        permission: P.TEACHER_VIEW,
      },
      {
        id: 'students', icon: Users, label: 'Students', route: '/students',
        permission: P.STUDENT_VIEW,
      },
    ]
  },
  {
    section: 'ACADEMICS',
    items: [
      {
        id: 'academics', icon: GraduationCap, label: 'Academics', route: '/subjectMaster',
        subItems: [
          { label: 'Subjects', route: '/subjectMaster', permission: P.ACADEMIC_VIEW },
          { label: 'Class & Sections', route: '/academics/classSections', permission: P.ACADEMIC_YEAR_MANAGE },
          { label: 'Student Promotion', route: '/academics/studentPromotion', permission: P.STUDENT_PROMOTE },
          { label: 'Homework', route: '/homework', permission: P.HOMEWORK_VIEW, featureFlag: 'homeworkEnabled' },
          { label: 'Time Table', route: '/schedule', permission: P.TIMETABLE_VIEW, featureFlag: 'timetableEnabled' },
          {
            id: 'exams',
            label: 'Exams',
            route: '/exams',
            featureFlag: 'examEnabled',
            permissions: [P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER],
            childItems: [
              { label: 'Exam Overview', route: '/exams', permissions: [P.EXAM_VIEW, P.EXAM_MARKS_VIEW_CLASS, P.EXAM_MARKS_ENTER] },
              { label: 'Marks Entry', route: '/exams/marksEntry', permission: P.EXAM_MARKS_ENTER },
              { label: 'Report Cards', route: '/exams/reportCard', permission: P.EXAM_MARKS_VIEW_CLASS },
              { label: 'Analytics', route: '/exams/analytics', permission: P.EXAM_APPROVE },
              { label: 'Exam Configuration', route: '/exams/examConfig', permission: P.EXAM_CREATE },
            ]
          },
        ]
      },
      {
        id: 'academicYear', icon: BookOpenText, label: 'Academic Years', route: '/academicYear',
        permission: P.ACADEMIC_YEAR_MANAGE,
      }
    ]
  },
  {
    section: 'ATTENDANCE & LEAVES',
    items: [
      {
        id: 'attendance', icon: Calendar, label: 'Attendance', route: '/attendance',
        subItems: [
          {
            label: 'Attendance Overview',
            route: '/attendance',
            permission: P.ATTENDANCE_VIEW,
            showIf: (perms, features) => (features?.staffAttendanceEnabled || features?.studentAttendanceEnabled)
          },
          { label: 'Staff Enrollment', route: '/attendance/staffImgReg', permission: P.ATTENDANCE_APPROVE, featureFlag: 'staffAttendanceEnabled' },
          { label: 'Staff Attendance', route: '/attendance/markUserAttendance', permission: P.ATTENDANCE_CREATE, featureFlag: 'staffAttendanceEnabled' },
          { label: 'Student Enrollment', route: '/attendance/studentImgReg', permission: P.ATTENDANCE_APPROVE, featureFlag: 'studentAttendanceEnabled' },
          { label: 'Student Attendance', route: '/attendance/studentAttendance', permission: P.ATTENDANCE_CREATE, featureFlag: 'studentAttendanceEnabled' },
        ]
      },
      {
        id: 'leaves', icon: FileText, label: 'Leaves', route: '/leaves/applyLeaves',
        permission: P.LEAVE_VIEW,
        featureFlag: 'leaveEnabled',
        subItems: [
          { label: 'Manage Leave', route: '/leaves', permission: P.LEAVE_APPROVE },
          { label: 'My Leaves', route: '/leaves/myLeaves', permission: P.LEAVE_VIEW },
          { label: 'Holiday Management', route: '/leaves/manageHolidays', permission: P.LEAVE_DELETE },
          { label: 'Leave Config', route: '/leaves/leaveConfig', permission: P.LEAVE_DELETE },
        ]
      },
      {
        id: 'payroll', icon: Wallet, label: 'Payroll', route: '/payroll',
        permission: P.PAYROLL_VIEW,
        featureFlag: 'payrollEnabled',

      }
    ]
  },
  {
    section: 'COMMUNICATION',
    items: [
      {
        id: 'communication',
        icon: MessageSquare,
        label: 'Communication',
        route: '/communication/circulars',
        subItems: [
          {
            label: 'Circulars',
            route: '/communication/circulars',
            permissions: [P.CIRCULAR_CREATE, P.CIRCULAR_APPROVE, P.CIRCULAR_DELETE],
          },
          {
            label: 'School Events',
            route: '/communication/events',
            permissions: [P.EVENT_CREATE, P.EVENT_APPROVE, P.EVENT_DELETE],
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
      }
    ]
  },
  {
    section: 'OPERATIONS',
    items: [
      {
        id: 'passManagement', icon: CreditCard, label: 'Pass & ID Management', route: '/passManagement',
        permission: P.STUDENT_VIEW,
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
        id: 'studentOrders', icon: Package, label: 'Student Orders', route: '/stock/studentOrders',
        showIf: (perms) => perms.includes(P.STUDENT_ORDER_VIEW) && !perms.includes(P.STOCK_OVERVIEW),
      },
      {
        id: 'transport', icon: Bus, label: 'Transport', route: '/route',
        permission: P.TRANSPORT_VIEW,
        featureFlag: 'transportEnabled',
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
        id: 'FeeManagement', icon: IndianRupee, label: 'Fee Management', route: '/feeManagement',
        permission: P.FEE_VIEW,
        subItems: [
          { label: 'Fee Config', route: '/feeManagement/config', permission: P.FEE_STRUCTURE_MANAGE },
          { label: 'Collection and History', route: '/feeManagement/collections', permission: P.FEE_COLLECT },
          { label: 'Overdue Fee Notifications', route: 'overduefeenotifications', permission: P.FEE_COLLECT }
        ]
      }
    ]
  },
  {
    section: 'PRINT & TEMPLATES',
    items: [
      {
        id: 'templates', icon: Printer, label: 'Templates', route: '/templates/reportCard',
        systemRole: true,
        subItems: [
          { label: 'Report Card Templates', route: '/templates/reportCard', icon: FileText },
          { label: 'ID Card Templates', route: '/templates/idCard', icon: CreditCard },
          { label: 'Admit Card Templates', route: '/templates/admitCard', icon: Ticket },
          { label: 'Certificate Templates', route: '/templates/certificate', icon: Award },
          { label: 'Fee Receipt Templates', route: '/templates/feeReceipt', icon: Receipt },
          { label: 'Gate Pass Templates', route: '/templates/gatePass', icon: DoorOpen },
          { label: 'Visitor Pass Templates', route: '/templates/visitorPass', icon: UserCheck },
          { label: 'Cycle Stand Templates', route: '/templates/cycleStandPass', icon: Bike },
          { label: 'Salary Slip Templates', route: '/templates/salarySlip', icon: Wallet },
        ]
      }
    ]
  },
  {
    section: 'SYSTEM CONTROLS',
    items: [
      {
        id: 'Permission', icon: Shield, label: 'Permissions', route: '/rolesPermissions',
        systemRole: true,
      },
      {
        id: 'schoolConfig', icon: SchoolIcon, label: 'School Config', route: '/schoolConfig',
        systemRole: true,
      },

    ]
  }
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
  GLOBAL_SALES_SUPPORT: 'bg-rose-100 text-rose-700',
}

// ── Strict Access Checker ──
// (imports, menuSections, roleBadgeStyles — all unchanged, omitted here for brevity;
// keep exactly what you already have)

// ── Strict Access Checker ──
const checkAccess = (item, userPermissions, userRole, features) => {
  // 1. System Role Lock Check
  if (item.systemRole) {
    const map = {
      Permission: SYSTEM_ROLES.ROLE_MANAGE,
      schoolConfig: SYSTEM_ROLES.SCHOOL_CONFIG_MANAGE,
      templates: SYSTEM_ROLES.GLOBAL_ADMIN_ONLY || ['GLOBAL_ADMIN'],
      // Sidebar visibility only — GLOBAL_ADMIN exclusively. GLOBAL_SALES_SUPPORT
      // never gets a dashboard/sidebar (see DASHBOARD_ROLES), so this is a
      // defensive floor: even if that ever changes, Demo Leads still won't
      // show up here for them. Their access stays routed through the Select
      // School console button, which uses LEAD_MANAGEMENT_ROLES separately.
      leadManagement: SYSTEM_ROLES.SIDEBAR_LEAD_MANAGEMENT_ROLES || ['GLOBAL_ADMIN'],
    }
    return (map[item.id] || []).includes(userRole)
  }

  // 2. Feature Flag Check
  if (item.featureFlag && features) {
    if (features[item.featureFlag] === false) return false;
  }

  // 3. Custom showIf Function Check
  if (typeof item.showIf === 'function') {
    if (!item.showIf(userPermissions, features, userRole)) return false;
  }

  // 4. Permission Check
  if (item.permission && !userPermissions.includes(item.permission)) return false;
  if (item.permissions && !item.permissions.some(p => userPermissions.includes(p))) return false;

  // 5. SubItems Check: If all sub-items are hidden, hide parent menu item too
  if (item.subItems && item.subItems.length > 0) {
    const hasValidSubItem = item.subItems.some(sub => checkAccess(sub, userPermissions, userRole, features));
    if (!hasValidSubItem) return false;
  }

  return true;
}

// (rest of Sidebar component — Sidebar function body, JSX, styles — all unchanged)

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

  const userRole = ctxUser?.userType || (Array.isArray(ctxUser?.roles) ? ctxUser.roles[0] : null) || (Array.isArray(storedUser?.roles) ? storedUser.roles[0] : null) || null
  const userPermissions = ctxUser?.permissions || storedUser?.permissions || []

  // Feature Flags State (Fallback to true if features key isn't populated yet)
  const features = useMemo(() => {
    return schoolInfo?.features || {
      staffAttendanceEnabled: true,
      studentAttendanceEnabled: true,
      transportEnabled: true,
      homeworkEnabled: true,
      examEnabled: true,
      leaveEnabled: true,
      timetableEnabled: true,
      payrollEnabled: true,
    };
  }, [schoolInfo]);

  const schoolDisplayName = schoolInfo?.schoolName || 'Delhi Public International School'
  const schoolDisplayCode = schoolInfo?.schoolCode || ''
  const schoolLogoUrl = schoolInfo?.logoUrl || dpis

  const handleSidebarSchool = () => {
    localStorage.removeItem('school')
    navigate('/superAdmin')
  }

  // Filter sections dynamically based on permissions & active feature flags
  const filteredSections = useMemo(() => {
    return menuSections
        .map(section => {
          const items = section.items
              .filter(item => checkAccess(item, userPermissions, userRole, features))
              .map(item => ({
                ...item,
                route: item.id === 'leaves' && !userPermissions.includes(P.LEAVE_APPROVE) ? '/leaves/myLeaves' : item.route,
                subItems: item.subItems
                    ? item.subItems
                        .filter(sub => checkAccess(sub, userPermissions, userRole, features))
                        .map(sub => ({
                          ...sub,
                          childItems: sub.childItems ? sub.childItems.filter(child => checkAccess(child, userPermissions, userRole, features)) : undefined
                        }))
                    : undefined
              }));
          return { ...section, items };
        })
        .filter(section => section.items.length > 0);
  }, [userPermissions, userRole, features]);

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

    filteredSections.forEach(section => {
      section.items.forEach(item => {
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
    })

    setOpenDropdowns(prev => ({ ...prev, ...newDropdowns }))
    setOpenSubDropdowns(prev => ({ ...prev, ...newSubDropdowns }))
  }, [location.pathname, filteredSections])

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
    if (subItem.childItems?.length > 0) toggleSubDropdown(subItem.id)
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

  const displayName = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.name || user?.username || 'User'
  const userPhone = user?.phone || user?.phoneNumber || null
  const userStatus = user?.status ? user.status.charAt(0) + user.status.slice(1).toLowerCase() : 'Active'
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  const badgeClass = roleBadgeStyles[userRole] || 'bg-gray-100 text-gray-600'
  const formatRoleLabel = (role) => role ? role.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ') : ''

  const canSwitchSchool = SCHOOL_SWITCHER_ROLES.includes(userRole)

  return (
      <div className={`bg-[#F8FAFC] border-r border-gray-200/80 flex flex-col transition-all duration-300 h-full ${sidebarOpen ? 'w-64' : 'w-20'}`}>

        {/* ── Logo Heading Section ── */}
        <div className="p-5 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={handleLogoClick} className="shrink-0">
              <img
                  src={schoolLogoUrl}
                  className="w-11 h-11 cursor-pointer object-contain rounded-lg bg-white border border-gray-100/70 shadow-2xs"
                  alt="School Logo"
                  onError={(e) => { e.currentTarget.src = dpis }}
              />
            </button>

            {sidebarOpen && (
                <div className="min-w-0 flex-1">
                  <h2 className="font-bold text-slate-800 text-sm leading-tight truncate">
                    {schoolDisplayName}
                  </h2>
                  <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                    {schoolDisplayCode ? `${schoolDisplayCode} · ` : ''}Management System
                  </p>
                  {canSwitchSchool && (
                      <button
                          onClick={handleSidebarSchool}
                          className="flex items-center gap-1 cursor-pointer text-[10px] font-bold text-purple-600 mt-1
                    bg-purple-50 hover:bg-purple-100/80 border border-purple-100
                    px-2 py-0.5 rounded-full transition-all"
                      >
                        <ArrowLeftRight size={10} /> Switch School
                      </button>
                  )}
                </div>
            )}
          </div>
        </div>

        {/* ── Navigation Items Menu ── */}
        <nav className="flex-1 p-3 overflow-y-auto sidebar-scroll space-y-4">
          {filteredSections.map((section) => (
              <div key={section.section}>
                {sidebarOpen && (
                    <div className="px-3.5 py-1.5 text-[10px] font-bold text-slate-400 tracking-wider uppercase select-none">
                      {section.section}
                    </div>
                )}
                <div className="space-y-0.5 mt-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    const isActive = isRouteActive(item)
                    const hasSubItems = item.subItems && item.subItems.length > 0
                    const isOpen = openDropdowns[item.id]

                    let calculatedHeight = item.subItems ? item.subItems.length * 40 : 0
                    if (hasSubItems && isOpen) {
                      item.subItems.forEach(sub => {
                        if (sub.childItems && openSubDropdowns[sub.id]) {
                          calculatedHeight += sub.childItems.length * 36
                        }
                      })
                    }

                    return (
                        <div key={item.id} className="mb-0.5">
                          <button
                              onClick={() => handleMenuClick(item)}
                              title={!sidebarOpen ? item.label : ''}
                              className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl
                        transition-all duration-150 select-none cursor-pointer
                        ${isActive ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:bg-gray-100/80 hover:text-slate-900'}
                        ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                              {sidebarOpen && <span className="font-semibold text-[13px] truncate">{item.label}</span>}
                            </div>
                            {sidebarOpen && hasSubItems && (
                                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200
                          ${isActive ? 'text-blue-100' : 'text-gray-400'}
                          ${isOpen ? 'rotate-180' : 'rotate-0'}`}
                                />
                            )}
                          </button>

                          {/* Sub items render block */}
                          {sidebarOpen && hasSubItems && (
                              <div
                                  style={{ maxHeight: isOpen ? `${calculatedHeight}px` : '0px' }}
                                  className="overflow-hidden transition-[max-height] duration-200 ease-in-out"
                              >
                                <div className="mt-0.5 ml-4.5 pl-3 border-l border-gray-200/70 space-y-0.5 pb-1">
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
                                              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg
                                    text-[12.5px] transition-all duration-150 text-left select-none cursor-pointer
                                    ${isSubActive ? 'bg-blue-50/60 text-blue-600 font-bold' : 'text-slate-500 hover:bg-gray-50 hover:text-slate-800'}`}
                                          >
                                            <div className="flex items-center gap-2 min-w-0">
                                    <span className={`w-1 h-1 rounded-full shrink-0 transition-all duration-150
                                      ${isSubActive ? 'bg-blue-500 scale-125' : 'bg-gray-300'}`}
                                    />
                                              <span className="truncate">{subItem.label}</span>
                                            </div>
                                            {hasChildItems && (
                                                <ChevronDown className={`w-3 h-3 shrink-0 transition-transform duration-200 text-gray-400
                                      ${isSubOpen ? 'rotate-180' : 'rotate-0'}`}
                                                />
                                            )}
                                          </button>

                                          {hasChildItems && (
                                              <div
                                                  style={{ maxHeight: isSubOpen ? `${subItem.childItems.length * 36}px` : '0px' }}
                                                  className="overflow-hidden transition-[max-height] duration-200 ease-in-out ml-2 pl-2.5 border-l border-gray-200 space-y-0.5 mt-0.5"
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
                                                          className={`w-full flex items-center gap-2 px-2.5 py-1 rounded-md text-[11.5px] transition-all duration-150 text-left truncate cursor-pointer
                                            ${isChildActive ? 'text-blue-600 font-semibold bg-blue-50/40' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50/50'}`}
                                                      >
                                                        <span className="opacity-50">•</span>
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
                </div>
              </div>
          ))}
        </nav>

        {/* ── Bottom Profile Section ── */}
        <div className="p-3 border-t border-gray-100 shrink-0" ref={profileRef}>
          <div className="relative">
            <button
                onClick={() => setProfileOpen(prev => !prev)}
                className={`w-full flex items-center cursor-pointer gap-3 px-3 py-2 rounded-xl
              transition-all duration-200 hover:bg-blue-50 border border-transparent hover:border-blue-100/50
              ${profileOpen ? 'bg-blue-50 border-blue-100/50' : ''}
              ${!sidebarOpen ? 'justify-center' : ''}`}
                title={!sidebarOpen ? displayName : ''}
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-600
              flex items-center justify-center text-white font-bold text-xs shadow-xs">
                {initials}
              </div>
              {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-[12.5px] font-bold text-slate-800 truncate leading-snug">{displayName}</p>
                      <p className={`text-[9.5px] font-bold px-1.5 py-0.5 rounded-md inline-block ${badgeClass}`}>
                        {formatRoleLabel(userRole)}
                      </p>
                    </div>
                    <ChevronUp className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 shrink-0
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
                  <div className="h-12 bg-gradient-to-r from-blue-600 to-blue-500 relative">
                    <div className="absolute -bottom-5 left-4">
                      <div className="w-10 h-10 rounded-full bg-white p-0.5 shadow-md">
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600
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
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl
                    bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs cursor-pointer
                    transition-colors duration-150 border border-red-100 hover:border-red-200"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
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