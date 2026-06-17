// Login_2.jsx
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import React, { useContext, useState } from 'react'
import Worker_3 from '../assets/Images/Worker_3.jpeg'
import { Link, useNavigate } from 'react-router-dom'
import { loginAPI } from '../Api/AuthApi'
import { UserContext } from '../ContextAPI/UserContext'
import SS_logo from "../assets/Images/ss_logo.png"
import cstech from "../assets/Images/cstech.png"
import { motion } from 'framer-motion'
import SS_logo_3 from "../assets/Images/loginimageschool.png"
import { getSchoolById } from '../Api/SchoolConfig'
import { getCurrentAcademicYear } from '../Api/AcademicYear' 

// ─── School Floating SVGs ─────────────────────────────────────────────────────
const SchoolSVGs = {
  graduation: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 L58 22 L32 36 L6 22 Z" stroke="#3b82f6" strokeWidth="2" fill="rgba(0,201,177,0.08)" strokeLinejoin="round" />
      <path d="M16 29 L16 45 C16 45 22 52 32 52 C42 52 48 45 48 45 L48 29" stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="54" cy="22" r="3" fill="rgba(0,201,177,0.3)" stroke="#3b82f6" strokeWidth="1.5" />
      <line x1="54" y1="25" x2="54" y2="38" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50 38 L54 43 L58 38" stroke="#3b82f6" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  book: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="10" width="32" height="44" rx="3" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,166,35,0.07)" />
      <rect x="14" y="10" width="4" height="44" fill="rgba(245,166,35,0.15)" rx="1" />
      <line x1="20" y1="20" x2="36" y2="20" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="27" x2="36" y2="27" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="20" y1="34" x2="30" y2="34" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M38 42 L44 36 L50 42 L44 48 Z" fill="rgba(0,201,177,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  ),
  pencil: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 52 L16 36 L44 8 C46 6 50 6 52 8 L56 12 C58 14 58 18 56 20 L28 48 Z" stroke="#3b82f6" strokeWidth="2" fill="rgba(0,201,177,0.08)" strokeLinejoin="round" />
      <line x1="40" y1="12" x2="52" y2="24" stroke="#3b82f6" strokeWidth="1.5" />
      <path d="M12 52 L16 36 L28 48 Z" fill="rgba(245,166,35,0.25)" stroke="#f59e0b" strokeWidth="1.5" />
    </svg>
  ),
  atom: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="4" fill="rgba(0,201,177,0.4)" stroke="#3b82f6" strokeWidth="1.5" />
      <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#3b82f6" strokeWidth="1.5" fill="none" />
      <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#f59e0b" strokeWidth="1.5" fill="none" transform="rotate(60 32 32)" />
      <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#3b82f6" strokeWidth="1.2" fill="none" strokeOpacity="0.4" transform="rotate(120 32 32)" />
    </svg>
  ),
  chart: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="36" width="10" height="18" rx="2" fill="rgba(0,201,177,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
      <rect x="22" y="24" width="10" height="30" rx="2" fill="rgba(245,166,35,0.2)" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x="36" y="16" width="10" height="38" rx="2" fill="rgba(0,201,177,0.2)" stroke="#3b82f6" strokeWidth="1.5" />
      <line x1="6" y1="54" x2="58" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13 30 L27 20 L41 12" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
    </svg>
  ),
  bell: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M32 8 C32 8 20 12 20 28 L20 40 L12 46 L52 46 L44 40 L44 28 C44 12 32 8 32 8Z" stroke="#f59e0b" strokeWidth="2" fill="rgba(245,166,35,0.08)" strokeLinejoin="round" />
      <path d="M27 46 C27 49 29.2 52 32 52 C34.8 52 37 49 37 46" stroke="#f59e0b" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="32" cy="10" r="3" fill="rgba(0,201,177,0.4)" stroke="#3b82f6" strokeWidth="1.5" />
    </svg>
  ),
  ruler: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="24" width="48" height="16" rx="3" stroke="#3b82f6" strokeWidth="2" fill="rgba(0,201,177,0.08)" transform="rotate(-10 32 32)" />
      <line x1="16" y1="28" x2="16" y2="34" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
      <line x1="24" y1="28" x2="24" y2="32" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
      <line x1="32" y1="28" x2="32" y2="34" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
      <line x1="40" y1="28" x2="40" y2="32" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
      <line x1="48" y1="28" x2="48" y2="34" stroke="#3b82f6" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
    </svg>
  ),
}

const floatingItems = [
  { key: 'book',   top: '10%', left: '87%', size: 54, delay: 1.2, duration: 8   },
  { key: 'pencil', top: '70%', left: '4%',  size: 50, delay: 0.6, duration: 9   },
  { key: 'atom',   top: '78%', left: '83%', size: 58, delay: 1.8, duration: 7.5 },
  { key: 'chart',  top: '40%', left: '91%', size: 46, delay: 0.3, duration: 8.5 },
  { key: 'bell',   top: '52%', left: '1%',  size: 44, delay: 2,   duration: 6.5 },
  { key: 'ruler',  top: '25%', left: '93%', size: 40, delay: 0.9, duration: 10  },
]

function FloatingSchoolBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute hidden md:block top-3 left-4 lg:top-3 lg:left-6 z-10"
      >
        <img
          src={SS_logo_3}
          alt="School Logo"
          className="w-[130px] h-[130px] lg:w-[170px] lg:h-[170px] xl:w-[210px] xl:h-[210px] object-contain filter drop-shadow-md hover:scale-102 transition-transform duration-300"
        />
      </motion.div>
      {floatingItems.map(({ key, top, left, size, delay, duration }) => (
        <motion.div
          key={key}
          className="hidden md:block p-3.5 bg-white/45 backdrop-blur-[6px] rounded-2xl border border-white/50 shadow-[0_8px_32px_rgba(59,130,246,0.06)] hover:scale-110 transition-transform duration-300"
          style={{
            position: 'absolute',
            top,
            left,
            width: size + 24,
            height: size + 24,
          }}
          animate={{
            y: [0, -16, 0],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration,
            delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <div className="w-full h-full flex items-center justify-center opacity-85">
            {SchoolSVGs[key]}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function ShinyButton({ children, disabled, isLoading }) {
  return (
    <>
      <style>{`
        @keyframes shine-sweep {
          0%   { transform: translateX(-130%) skewX(-18deg); }
          100% { transform: translateX(320%) skewX(-18deg); }
        }
        @keyframes brand-glow-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(0,201,177,0.35), 0 2px 8px rgba(245,166,35,0.2); }
          50%       { box-shadow: 0 6px 28px rgba(0,201,177,0.55), 0 4px 14px rgba(245,166,35,0.35); }
        }
        .brand-btn::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0; left: 0;
          width: 45%;
          background: linear-gradient(
            90deg,
            transparent 0%,
            rgba(255,255,255,0.28) 45%,
            rgba(255,255,255,0.45) 55%,
            transparent 100%
          );
          animation: shine-sweep 2.8s infinite ease-in-out;
          pointer-events: none;
        }
        .brand-btn:disabled::after { animation: none; }
        .brand-btn:not(:disabled) { animation: brand-glow-pulse 3s ease-in-out infinite; }
        .brand-btn:not(:disabled):hover { animation: none; }
      `}</style>
      <button
        type="submit"
        disabled={disabled}
        className={`
          brand-btn relative overflow-hidden
          w-full py-3.5 rounded-xl
          font-bold text-white text-sm tracking-widest uppercase
          transition-all duration-300 ease-out
          ${disabled
            ? 'opacity-60 cursor-not-allowed'
            : `bg-gradient-to-r from-[#00C9B1] via-[#00DEC5] to-[#F5A623]
               hover:from-[#00B89F] hover:via-[#00C9B1] hover:to-[#E8961A]
               hover:shadow-[0_8px_28px_rgba(0,201,177,0.5),0_4px_12px_rgba(245,166,35,0.3)]
               hover:scale-[1.015] active:scale-[0.975] cursor-pointer`
          }
        `}
        style={disabled ? {} : {
          background: 'linear-gradient(135deg, #00C9B1 0%, #00DEC5 40%, #F5A623 100%)',
          boxShadow: '0 4px 20px rgba(0,201,177,0.35), 0 2px 8px rgba(245,166,35,0.2)'
        }}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Verifying Credentials...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-1.5">
            {children}
          </span>
        )}
      </button>
    </>
  )
}

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login_2 = ({ onLoginSuccess }) => {
  const [email,        setemail]        = useState('')
  const [password,     setpassword]     = useState('')
  const [showPassword, setshowPassword] = useState(false)
  const [errors,       seterrors]       = useState({})
  const [isLoading,    setIsLoading]    = useState(false)
  const [loginError,   setLoginError]   = useState('')
  const navigate = useNavigate()

  // ── Pull saveToken + saveCurrentAcademicYear in addition to existing context values ──
  const { setUser, saveProfile, saveSchool, saveToken, saveCurrentAcademicYear } = useContext(UserContext)

  const validateForm = () => {
    const allErrors = {}
    if (!email) {
      allErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      allErrors.email = 'Please enter a valid email address'
    }
    if (!password) {
      allErrors.password = 'Password is required'
    } else if (password.length < 6) {
      allErrors.password = 'Password must be at least 6 characters'
    }
    seterrors(allErrors)
    return Object.keys(allErrors).length === 0
  }

  const onSubmitHandler = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setIsLoading(true)
    setLoginError('')
    try {
      const res = await loginAPI({ email, password })
      const token = res.data?.token || res.token
      const user  = res.data?.user  || res.user
      const requiresSchoolSelection =
        res.data?.requiresSchoolSelection ?? res.requiresSchoolSelection ?? false

      if (!token) throw new Error('Invalid response from server. Please try again.')

      // ── 1. Save token via saveToken (not localStorage directly) ──────────
      //    saveToken does localStorage.setItem + setToken(token) which
      //    triggers useEffect([token]) in UserContext → re-decodes JWT →
      //    user.schoolId / userType are correct for FCM + academic year fetch
      saveToken(token)

      localStorage.setItem('requireSchoolSelection', requiresSchoolSelection)

      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        setUser({
          id:          user.id,
          userType:    user.roles?.[0],
          email:       user.email,
          permissions: user.permissions,
          schoolId:    user.schoolId ?? null,
        })
        if (user.profile) saveProfile(user.profile)
      }

      if (onLoginSuccess) onLoginSuccess(token)

      // ── 2. Route based on school selection requirement ────────────────────
      if (requiresSchoolSelection) {
        // SUPER_ADMIN / GLOBAL_ADMIN — let them pick a school
        navigate('/superAdmin')
      } else {
        // ADMIN / PRINCIPAL / TEACHER etc.
        // Use schoolId from login response to fetch & save school details
        // so sidebar shows correct school info immediately on dashboard
        const schoolId = user?.schoolId
        if (schoolId) {
          try {
            const schoolRes = await getSchoolById(schoolId)
            const s = schoolRes?.data
            if (s) {
              saveSchool({
                id:         s.id,
                schoolId:   s.id,
                schoolName: s.name    || '',
                schoolCode: s.code    || '',
                logoUrl:    s.logoUrl || null,
                board:      s.board   || '',
                city:       s.city    || '',
                status:     s.status  || '',
              })
            }
          } catch (schoolErr) {
            // Non-fatal — sidebar will show a fallback name
            console.warn('Could not fetch school details after login:', schoolErr)
          }

          // ── Fetch & save current academic year (mirrors school fetch above) ──
          try {
            const ayRes = await getCurrentAcademicYear(schoolId)
            const ay = ayRes?.data
            if (ay) saveCurrentAcademicYear(ay)
          } catch (ayErr) {
            // Non-fatal — academic year can be refreshed later if missing
            console.warn('Could not fetch current academic year after login:', ayErr)
          }
        }
        navigate('/dashboard')
      }

    } catch (err) {
      setLoginError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const inputBase   = 'w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-xl text-sm text-slate-850 placeholder-slate-400 outline-none transition-all duration-300 focus:ring-4'
  const inputNormal = 'bg-slate-50/60 border border-slate-200/80 focus:bg-white focus:border-indigo-500 focus:ring-indigo-500/10'
  const inputError  = 'bg-red-500/5 border border-red-300 focus:bg-white focus:border-red-500 focus:ring-red-500/15'

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden bg-gradient-to-tr from-[#f3f4f6] via-[#eff6ff] to-[#f5f3ff]">

      <style>{`
        input::-ms-reveal, input::-ms-clear { display: none; }
        input::-webkit-credentials-auto-fill-button,
        input::-webkit-password-toggle-button { display: none !important; }

        @keyframes floatSlow {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(35px, -50px) scale(1.08); }
        }
        @keyframes floatReverse {
          0%, 100% { transform: translate(0px, 0px) scale(1.05); }
          50% { transform: translate(-45px, 35px) scale(0.95); }
        }
        @keyframes floatMedium {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          50% { transform: translate(-25px, -25px) scale(1.03); }
        }
        .animate-float-slow {
          animation: floatSlow 20s infinite ease-in-out;
        }
        .animate-float-reverse {
          animation: floatReverse 24s infinite ease-in-out;
        }
        .animate-float-medium {
          animation: floatMedium 16s infinite ease-in-out;
        }
      `}</style>

      {/* Dynamic Background Mesh Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-300/20 to-purple-300/20 blur-[130px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full bg-gradient-to-br from-teal-200/15 to-blue-300/20 blur-[140px] pointer-events-none animate-float-reverse" />
      <div className="absolute top-[35%] right-[15%] w-[35%] h-[35%] rounded-full bg-gradient-to-br from-pink-200/10 to-indigo-300/15 blur-[110px] pointer-events-none animate-float-medium" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(99, 102, 241, 0.05) 1.5px, transparent 1.5px)',
          backgroundSize: '24px 24px',
        }}
      />

      <FloatingSchoolBg />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 hidden sm:flex flex-col items-center mb-5 md:mb-6 gap-2"
      >
        <h1 className="text-center font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 text-lg md:text-xl lg:text-3xl tracking-wider uppercase"
          style={{ fontFamily: '"Syne", sans-serif' }}>
          SCHOOL MANAGEMENT PORTAL
        </h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="relative z-10 flex flex-col sm:flex-row w-full max-w-xs sm:max-w-xl md:max-w-2xl lg:max-w-3xl overflow-hidden rounded-3xl"
        style={{
          background: 'rgba(255, 255, 255, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.12), 0 0 40px rgba(255, 255, 255, 0.2) inset, 0 4px 30px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div className="hidden sm:block sm:w-5/12 relative overflow-hidden">
          <img
            src={Worker_3}
            alt="Portal Visual"
            className="w-full h-full object-cover object-center transition-transform duration-700 hover:scale-105"
            style={{ minHeight: '100%' }}
          />
          {/* Brand-themed gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/20 via-indigo-600/10 to-transparent mix-blend-multiply pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />
          <div className="absolute top-0 left-0 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        </div>

        <div className="flex-1 flex flex-col justify-center px-5 sm:px-7 md:px-8 py-7 sm:py-8 md:py-10 bg-white/85 backdrop-blur-md">

          <div className="flex sm:hidden items-center gap-2.5 mb-5 pb-4 border-b border-slate-100">
            <img src={SS_logo} alt="Logo" className="w-9 h-9 object-contain shrink-0" />
            <div>
              <p className="text-xs font-bold text-slate-700 leading-tight tracking-wide">SCHOOL MANAGEMENT</p>
              <p className="text-[10px] text-slate-400 tracking-widest uppercase">Portal</p>
            </div>
          </div>

          <div className="mb-5 sm:mb-6">
            <h2 className="font-bold text-slate-800 text-xl sm:text-2xl mb-1"
              style={{ fontFamily: '"Syne", sans-serif' }}>
              System Login
            </h2>
            <p className="text-xs sm:text-sm text-slate-500"
              style={{ fontFamily: '"DM Sans", sans-serif' }}>
              Sign in to access your portal
            </p>
            <div className="mt-2 h-[3px] w-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600" />
          </div>

          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl text-xs sm:text-sm text-center"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.2)',
                color: '#ef4444',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {loginError}
            </motion.div>
          )}

          <form onSubmit={onSubmitHandler} className="space-y-3.5 sm:space-y-4">

            <div>
              <label
                className="block text-[10.5px] sm:text-xs font-semibold mb-1.5 tracking-wider uppercase text-slate-500"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                Email Address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500" />
                <input
                  autoComplete="email"
                  value={email}
                  onChange={(e) => { setemail(e.target.value); setLoginError('') }}
                  type="email"
                  placeholder="Enter your email"
                  className={`${inputBase} ${errors.email ? inputError : inputNormal}`}
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                />
              </div>
              {errors.email && (
                <p className="text-[11px] mt-1.5 text-red-500" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div>
              <label
                className="block text-[10.5px] sm:text-xs font-semibold mb-1.5 tracking-wider uppercase text-slate-500"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                Password
              </label>
              <div className="relative">
                <LockKeyhole size={15} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500" />
                <input
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setpassword(e.target.value); setLoginError('') }}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  className={`${inputBase} pr-10 ${errors.password ? inputError : inputNormal}`}
                  style={{ fontFamily: '"DM Sans", sans-serif' }}
                />
                <button
                  type="button"
                  onClick={() => setshowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors duration-150 cursor-pointer"
                >
                  {showPassword ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] mt-1.5 text-red-500" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            <div className="pt-1">
              <ShinyButton disabled={isLoading} isLoading={isLoading}>
                Login →
              </ShinyButton>
            </div>

            <div className="flex items-center gap-3 py-0.5">
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.15)' }} />
              <ShieldCheck size={13} style={{ color: 'rgba(99,102,241,0.45)', flexShrink: 0 }} />
              <div className="flex-1 h-px" style={{ background: 'rgba(99,102,241,0.15)' }} />
            </div>

            <div className="text-center space-y-1">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500"
                style={{ fontFamily: '"DM Sans", sans-serif' }}>
                Authorized access only
              </p>
              <p className="text-[10px] sm:text-[11px] text-slate-400"
                style={{ fontFamily: '"DM Sans", sans-serif' }}>
                Contact your system administrator for access credentials.
              </p>
            </div>

          </form>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-4 sm:mt-6 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full flex items-center gap-2.5 text-xs sm:text-sm bg-white/70 backdrop-blur-md shadow-sm hover:shadow-md hover:bg-white/95 transition-all duration-300"
        style={{
          border: '1px solid rgba(59, 130, 246, 0.15)',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <span className="text-slate-500 font-medium">Developed by</span>
        <Link to="https://computesofttech.com/" target="_blank" rel="noopener noreferrer" className="hover:opacity-85 transition-opacity">
          <img className="h-5 sm:h-7 w-auto object-contain" src={cstech} alt="CSTech" />
        </Link>
      </motion.div>

    </div>
  )
}

export default Login_2;