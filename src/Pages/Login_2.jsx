import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import React, { useContext, useState } from 'react'
import Worker_3 from '../assets/Images/Worker_3.jpeg'
import { Link, useNavigate } from 'react-router-dom'
import { loginAPI } from '../Api/AuthApi'
import { UserContext } from '../ContextAPI/UserContext'
import SS_logo from "../assets/Images/ss_logo.png"
import cstech from "../assets/Images/cstech.png"
import { motion } from 'framer-motion'
import SS_logo_3 from "../assets/Images/loginimageschool.png";
// ─── School Floating SVGs (same as TransformSchool) ───────────────────────────
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
  // { key: 'graduation', top: '5%', left: '2%', size: 64, delay: 0, duration: 7 },
  { key: 'book', top: '10%', left: '87%', size: 54, delay: 1.2, duration: 8 },
  { key: 'pencil', top: '70%', left: '4%', size: 50, delay: 0.6, duration: 9 },
  { key: 'atom', top: '78%', left: '83%', size: 58, delay: 1.8, duration: 7.5 },
  { key: 'chart', top: '40%', left: '91%', size: 46, delay: 0.3, duration: 8.5 },
  { key: 'bell', top: '52%', left: '1%', size: 44, delay: 2, duration: 6.5 },
  { key: 'ruler', top: '25%', left: '93%', size: 40, delay: 0.9, duration: 10 },
]

function FloatingSchoolBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top Left Logo */}
      <motion.div
        className="
    absolute
    top-2 left-2
    sm:top-4 sm:left-4
    md:top-6 md:left-6
    lg:top-8 lg:left-8
    z-10
  "
      >
        <img
  src={SS_logo_3}
  alt="School Logo"
  className="
    w-[100px] h-[100px]
    sm:w-[120px] sm:h-[120px]
    md:w-[150px] md:h-[150px]
    lg:w-[180px] lg:h-[180px]
    xl:w-[220px] xl:h-[220px]
    object-contain
  "
/>
      </motion.div>
      {floatingItems.map(({ key, top, left, size, delay, duration }) => (
        <motion.div
          key={key}
          style={{ position: 'absolute', top, left, width: size, height: size, opacity: 0.18 }}
          animate={{ y: [0, -16, 0], rotate: [0, 5, -4, 0] }}
          transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          {SchoolSVGs[key]}
        </motion.div>
      ))}
    </div>
  )
}

// ─── Shiny Button Component ───────────────────────────────────────────────────
// Pure Tailwind + inline keyframe via style tag injected once
function ShinyButton({ children, disabled, isLoading }) {
  return (
    <>
      <style>{`
        @keyframes shine {
          0% {
            transform: translateX(-120%) skewX(-20deg);
          }
          100% {
            transform: translateX(300%) skewX(-20deg);
          }
        }

        .shine-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          width: 35%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255,255,255,0.45),
            transparent
          );
          animation: shine 2.5s infinite;
          pointer-events: none;
        }

        .shine-btn:disabled::after {
          animation: none;
        }
      `}</style>

      <button
        type="submit"
        disabled={disabled}
        className={`
          shine-btn
          relative overflow-hidden
          w-full py-2.5 rounded-lg
          font-semibold text-white text-sm tracking-wide
          transition-all duration-300
          ${disabled
            ? "bg-blue-300 cursor-not-allowed shadow-none"
            : `
                bg-gradient-to-r from-blue-500 to-blue-700
                hover:from-blue-600 hover:to-blue-800
                hover:shadow-blue-300 hover:shadow-lg
                active:scale-95
                cursor-pointer
              `
          }
        `}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Verifying...
          </span>
        ) : (
          children
        )}
      </button>
    </>
  );
}

// ─── Main Login Component ─────────────────────────────────────────────────────
const Login_2 = ({ onLoginSuccess }) => {
  const [email, setemail] = useState('')
  const [password, setpassword] = useState('')
  const [showPassword, setshowPassword] = useState(false)
  const [errors, seterrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const navigate = useNavigate()
  const { setUser, saveProfile } = useContext(UserContext)

  const validateForm = () => {
    let allErrors = {}
    if (!email) {
      allErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      allErrors.email = "Please enter a valid email address"
    }
    if (!password) {
      allErrors.password = "Password is required"
    } else if (password.length < 6) {
      allErrors.password = "Password must be at least 6 characters"
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
      const user = res.data?.user || res.user
      const requireSchoolSelection =
        res.data?.requiresSchoolSelection ?? res.requiresSchoolSelection ?? false
      if (!token) throw new Error('Invalid response from server. Please try again.')
      localStorage.setItem("token", token)
      localStorage.setItem("requireSchoolSelection", requireSchoolSelection)
      if (user) {
        localStorage.setItem("user", JSON.stringify(user))
        setUser({ id: user.id, userType: user.roles?.[0], email: user.email, permissions: user.permissions })
        if (user.profile) saveProfile(user.profile)
      }
      if (onLoginSuccess) onLoginSuccess(token)
      if (requireSchoolSelection) navigate("/superAdmin")
      else navigate("/dashboard")
    } catch (err) {
      setLoginError(err.message || "Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // shared input base style
  const inputBase = `w-full pl-10 pr-4 py-3 rounded-xl text-sm text-black placeholder-[#8A9BB0] outline-none transition-all duration-200 focus:ring-2`
  const inputNormal = 'bg-blue-50 border border-blue-200 focus:ring-blue-400/40 focus:border-blue-400 '
  const inputError = `bg-red-500/5 border-2 border-red-400/60 focus:ring-red-400/30`

  return (
    <div
      className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-gradient-to-br from-blue-100 to-blue-200"
    >
      <style>{`
        /* Hide native password reveal/clear buttons in various browsers */
        input::-ms-reveal, input::-ms-clear { display: none; }
        input::-webkit-credentials-auto-fill-button, input::-webkit-password-toggle-button { display: none !important; }
      `}</style>
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(0,201,177,0.08) 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Floating SVGs */}
      <FloatingSchoolBg />

      {/* Ambient glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,201,177,0.07) 0%, transparent 70%)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)' }} />

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 flex flex-col items-center mb-6 gap-2"
      >
        <h1
          className="text-center font-bold text-gray-800 text-sm md:text-lg lg:text-3xl tracking-wide"

        >
          SCHOOL MANAGEMENT PORTAL
        </h1>
      </motion.div>

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, delay: 0.1 }}
        className="relative z-10 flex flex-col md:flex-row w-full max-w-3xl overflow-hidden rounded-2xl"
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          border: '1.5px solid rgba(0,201,177,0.18)',
          boxShadow: '0 0 60px rgba(0,201,177,0.08), 0 4px 40px rgba(0,0,0,0.4)',
        }}
      >

        {/* ── Left: image panel ── */}
        <div className="sm:w-5/12 w-full overflow-hidden relative " style={{ minHeight: '220px' }}>
          <img
            src={Worker_3}
            alt="Portal Visual"
            className="w-full h-full object-cover object-center"
            style={{ minHeight: '220px' }}
          />
          {/* Teal corner accent */}
          <div
            className="absolute top-0 left-0 w-16 h-1"
            style={{ background: 'linear-gradient(to right, #3b82f6, transparent)' }}
          />
        </div>

        {/* ── Right: Form panel ── */}
        <div
          className="flex-1 flex flex-col justify-center px-6 sm:px-8 py-8 sm:py-10 bg-white"
        >
          {/* Form header */}
          <div className="mb-6">
            <h2
              className="font-bold text-gray-800 text-2xl mb-1"
              style={{ fontFamily: '"Syne", sans-serif' }}
            >
              System Login
            </h2>
            <p
              className="text-sm"
              style={{ color: '#4b5563', fontFamily: '"DM Sans", sans-serif' }}
            >
              Sign in to access your portal
            </p>
            {/* Teal underline accent */}
            <div
              className="mt-3 h-0.5 w-12 rounded-full bg-blue-400"
            />
          </div>

          {/* Error banner */}
          {loginError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3 rounded-xl text-sm text-center"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5',
                fontFamily: '"DM Sans", sans-serif',
              }}
            >
              {loginError}
            </motion.div>
          )}

          <form onSubmit={onSubmitHandler} className="space-y-4">

            {/* Email */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 tracking-wide"
                style={{ color: '#4b5563', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.06em' }}
              >
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#60a5fa' }} />
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
                <p className="text-xs mt-1.5 text-red-400" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                className="block text-xs font-semibold mb-1.5 tracking-wide"
                style={{ color: '#4b5563', fontFamily: '"DM Sans", sans-serif', letterSpacing: '0.06em' }}
              >
                PASSWORD
              </label>
              <div className="relative">
                <LockKeyhole size={16} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#60a5fa' }} />
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150 cursor-pointer"
                  style={{ color: '#4b5563' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#3b82f6'}
                  onMouseLeave={e => e.currentTarget.style.color = '#8A9BB0'}
                >
                  {showPassword ? <Eye size={17} /> : <EyeOff size={17} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5 text-red-400" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Shiny Login Button */}
            <div className="pt-1">
              <ShinyButton disabled={isLoading} isLoading={isLoading}>
                Login →
              </ShinyButton>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px" style={{ background: 'rgba(0,201,177,0.15)' }} />
              <ShieldCheck size={13} style={{ color: 'rgba(0,201,177,0.45)', flexShrink: 0 }} />
              <div className="flex-1 h-px" style={{ background: 'rgba(0,201,177,0.15)' }} />
            </div>

            {/* Footer notes */}
            <div className="text-center space-y-1">
              <p
                className="text-xs font-medium"
                style={{ color: '#4b5563', fontFamily: '"DM Sans", sans-serif' }}
              >
                Authorized access only
              </p>
              <p className="text-xs" style={{ color: 'rgba(138,155,176,0.6)', fontFamily: '"DM Sans", sans-serif' }}>
                Contact your system administrator for access credentials.
              </p>
            </div>

          </form>
        </div>
      </motion.div>

      {/* ── Developed By ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="relative z-10 mt-6 px-5 py-2 rounded-full flex items-center gap-2 text-sm"
        style={{
          background: 'rgba(255,255,255,1)',
          border: '1px solid rgba(59,130,246,0.25)',
          backdropFilter: 'blur(12px)',
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        <span>Developed by</span>
        <Link
          to="https://computesofttech.com/"
          target="_blank"
          rel="noopener noreferrer">
          <img className="h-7 w-auto" src={cstech} alt="CSTech" />
        </Link>
      </motion.div>

    </div>
  )
}

export default Login_2