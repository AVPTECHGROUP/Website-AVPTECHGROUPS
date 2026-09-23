import { useRef, useContext } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserContext } from '../../../ContextAPI/UserContext'
import { useNavigate } from 'react-router-dom'
import BookaDemo from '../../../assets/Images/Demo/BookaDemo.png'

// ─── Career / tech-themed floating SVGs (logo blue + cyan) ────────────────────
const BLUE = '#3AA6E8'
const CYAN = '#5CD6F5'

const CareerSVGs = {
    cap: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8 L58 22 L32 36 L6 22 Z" stroke={BLUE} strokeWidth="2" fill="rgba(58,166,232,0.10)" strokeLinejoin="round" />
            <path d="M16 29 L16 45 C16 45 22 52 32 52 C42 52 48 45 48 45 L48 29" stroke={BLUE} strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="54" cy="22" r="3" fill="rgba(92,214,245,0.3)" stroke={CYAN} strokeWidth="1.5" />
            <line x1="54" y1="25" x2="54" y2="38" stroke={CYAN} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    ),
    laptop: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="11" y="14" width="42" height="28" rx="3" stroke={CYAN} strokeWidth="2" fill="rgba(92,214,245,0.07)" />
            <path d="M4 47 H60 L55 51 H9 Z" stroke={CYAN} strokeWidth="2" fill="rgba(92,214,245,0.10)" strokeLinejoin="round" />
            <line x1="18" y1="36" x2="18" y2="30" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
            <line x1="26" y1="36" x2="26" y2="24" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
            <line x1="34" y1="36" x2="34" y2="28" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
            <line x1="42" y1="36" x2="42" y2="20" stroke={BLUE} strokeWidth="3" strokeLinecap="round" />
        </svg>
    ),
    shield: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 6 L54 14 V32 C54 44 44 54 32 58 C20 54 10 44 10 32 V14 Z" stroke={BLUE} strokeWidth="2" fill="rgba(58,166,232,0.09)" strokeLinejoin="round" />
            <path d="M22 32 L29 39 L42 24" stroke={CYAN} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    cloud: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 46 H46 C53 46 58 41 58 35 C58 29 53 25 47 25 C45 17 39 12 32 12 C24 12 18 18 17 26 C11 27 6 31 6 37 C6 42 11 46 18 46 Z" stroke={CYAN} strokeWidth="2" fill="rgba(92,214,245,0.08)" strokeLinejoin="round" />
            <line x1="24" y1="34" x2="40" y2="34" stroke={BLUE} strokeWidth="2" strokeLinecap="round" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="36" width="10" height="18" rx="2" fill="rgba(58,166,232,0.2)" stroke={BLUE} strokeWidth="1.5" />
            <rect x="22" y="26" width="10" height="28" rx="2" fill="rgba(92,214,245,0.2)" stroke={CYAN} strokeWidth="1.5" />
            <rect x="36" y="16" width="10" height="38" rx="2" fill="rgba(58,166,232,0.2)" stroke={BLUE} strokeWidth="1.5" />
            <line x1="6" y1="54" x2="58" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 30 L27 20 L41 12 L54 6" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
            <path d="M48 6 L54 6 L54 12" stroke={CYAN} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    briefcase: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="22" width="48" height="30" rx="4" stroke={BLUE} strokeWidth="2" fill="rgba(58,166,232,0.09)" />
            <path d="M24 22 V17 C24 14.8 25.8 13 28 13 H36 C38.2 13 40 14.8 40 17 V22" stroke={BLUE} strokeWidth="2" fill="none" />
            <line x1="8" y1="35" x2="56" y2="35" stroke={BLUE} strokeWidth="1.5" />
            <rect x="28" y="32" width="8" height="6" rx="1.5" fill="rgba(92,214,245,0.3)" stroke={CYAN} strokeWidth="1.5" />
        </svg>
    ),
    badge: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="26" r="15" stroke={CYAN} strokeWidth="2" fill="rgba(92,214,245,0.08)" />
            <path d="M32 18 L34.6 23.4 L40.5 24.2 L36.2 28.3 L37.3 34.2 L32 31.4 L26.7 34.2 L27.8 28.3 L23.5 24.2 L29.4 23.4 Z" stroke={BLUE} strokeWidth="1.5" fill="rgba(58,166,232,0.25)" strokeLinejoin="round" />
            <path d="M24 38 L20 56 L32 50 L44 56 L40 38" stroke={BLUE} strokeWidth="2" fill="none" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    ),
}

const floatingItems = [
    { key: 'cap', top: '6%', left: '3%', size: 70, delay: 0, duration: 7 },
    { key: 'laptop', top: '14%', left: '88%', size: 58, delay: 1.2, duration: 8 },
    { key: 'shield', top: '72%', left: '5%', size: 54, delay: 0.6, duration: 9 },
    { key: 'cloud', top: '80%', left: '82%', size: 62, delay: 1.8, duration: 7.5 },
    { key: 'chart', top: '42%', left: '92%', size: 50, delay: 0.3, duration: 8.5 },
    { key: 'briefcase', top: '55%', left: '1%', size: 48, delay: 2, duration: 6.5 },
    { key: 'badge', top: '28%', left: '94%', size: 44, delay: 0.9, duration: 10 },
]

function FloatingCareerBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingItems.map(({ key, top, left, size, delay, duration }) => (
                <motion.div
                    key={key}
                    style={{ position: 'absolute', top, left, width: size, height: size, opacity: 0.32 }}
                    animate={{ y: [0, -18, 0], rotate: [0, 6, -4, 0] }}
                    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {CareerSVGs[key]}
                </motion.div>
            ))}
        </div>
    )
}

const careerPoints = [
    'Live, instructor-led Microsoft training with hands-on labs',
    'Courses in Intune, Defender, Azure, Microsoft 365 and more',
    'Small batches, with course material and mock tests included',
    'A certificate of attendance with every course',
]

export default function TransformCareer() {
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'

    const ref = useRef(null)
    const navigate = useNavigate()
    const inView = useInView(ref, { once: true, margin: '-80px' })

    // Logo palette: navy #0D3F7A · royal #1B57A0 · azure #2380CC · sky #3AA6E8 · cyan #5CD6F5
    const accent = isDark ? '#5CD6F5' : '#1B57A0'

    return (
        <section
            id="demo"
            className="relative overflow-hidden transition-colors duration-300"
            style={{
                background: isDark
                    ? 'linear-gradient(to right, #06122A, #0A1D3F, #0C2650, #0D2C5E)'
                    : 'linear-gradient(to right, #f8fafc, #f1f5f9, #e2e8f0)',
                minHeight: '100vh',
            }}
        >
            <FloatingCareerBg />

            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? 'radial-gradient(circle, rgba(58,166,232,0.12) 1px, transparent 1px)'
                        : 'radial-gradient(circle, rgba(35,128,204,0.16) 1px, transparent 1px)',
                    backgroundSize: '28px 28px',
                }}
            />

            <div
                className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center"
                style={{ minHeight: '100vh' }}
                ref={ref}
            >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center w-full">

                    {/* ── Left: CTA ── */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7 }}
                        className="flex flex-col items-center text-center lg:items-start lg:text-left"
                    >
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.15 }}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
                            style={{
                                background: isDark ? 'rgba(35,128,204,0.14)' : 'rgba(35,128,204,0.08)',
                                color: accent,
                                border: '1px solid rgba(35,128,204,0.32)',
                                fontFamily: '"DM Sans", sans-serif',
                                letterSpacing: '0.03em',
                                boxShadow: '0 0 0 4px rgba(35,128,204,0.06)',
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [1, 0.35, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#3AA6E8',
                                    display: 'inline-block',
                                }}
                            />
                            Start Your Journey
                        </motion.span>

                        {/* Heading */}
                        <div className="flex flex-col items-center lg:items-start gap-0.5 mb-6">
                            <h1
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight transition-colors"
                                style={{ fontFamily: '"Syne", sans-serif', color: isDark ? 'white' : '#0f172a' }}
                            >
                                Ready to
                            </h1>
                            <h1
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight"
                                style={{ fontFamily: '"Syne", sans-serif' }}
                            >
                                <span style={{ color: isDark ? '#3AA6E8' : '#0D3F7A' }}>trans</span>
                                <span style={{ color: isDark ? '#5CD6F5' : '#2380CC' }}>form</span>
                            </h1>
                            <h1
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight transition-colors"
                                style={{ fontFamily: '"Syne", sans-serif', color: isDark ? 'white' : '#0f172a' }}
                            >
                                your IT career?
                            </h1>
                        </div>

                        <p
                            className="text-base sm:text-lg mb-8 max-w-md leading-relaxed transition-colors"
                            style={{ color: isDark ? '#93A9C4' : '#475569', fontFamily: '"DM Sans", sans-serif' }}
                        >
                            Join{' '}
                            <strong style={{ color: accent, fontWeight: 600 }}>100+ professionals</strong>{' '}
                            who have already upskilled with AVP Tech Group. Talk to our experts and plan your next step in Microsoft and cloud technologies.
                        </p>

                        {/* Bullet points */}
                        <ul className="flex flex-col items-center lg:items-start space-y-4 mb-10">
                            {careerPoints.map((point, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-3 text-sm transition-colors"
                                    style={{ color: isDark ? 'rgba(255,255,255,0.78)' : '#334155', fontFamily: '"DM Sans", sans-serif' }}
                                >
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: isDark ? 'rgba(58,166,232,0.14)' : 'rgba(35,128,204,0.10)',
                                            border: isDark ? '1px solid rgba(92,214,245,0.35)' : '1px solid rgba(35,128,204,0.4)',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6 L5 9 L10 3" stroke={accent} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </motion.li>
                            ))}
                        </ul>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                            <motion.button
                                onClick={() => navigate('/contact')}
                                whileHover={{ scale: 1.03, boxShadow: '0 10px 32px rgba(35,128,204,0.45)' }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-3.5 rounded-full text-white text-base cursor-pointer"
                                style={{
                                    background: 'linear-gradient(to right, #0D3F7A, #2380CC)',
                                    border: 'none',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontWeight: 700,
                                    boxShadow: '0 8px 24px rgba(35,128,204,0.32)',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                Book A Session
                            </motion.button>

                            <motion.button
                                onClick={() => navigate('/courses')}
                                whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)', scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-base cursor-pointer"
                                style={{
                                    background: 'transparent',
                                    border: isDark ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(15,23,42,0.18)',
                                    color: isDark ? 'white' : '#1e293b',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontWeight: 600,
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                Explore Courses
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* ── Right: Career growth graphic ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="hidden sm:flex relative w-full justify-center items-center"
                        style={{ minHeight: 480 }}
                    >
                        {/* Ambient glow behind the image */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                width: '78%',
                                height: '78%',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(35,128,204,0.34) 0%, rgba(92,214,245,0.18) 45%, transparent 72%)',
                                filter: 'blur(60px)',
                                opacity: isDark ? 0.9 : 0.55,
                            }}
                        />

                        <img
                            src={BookaDemo}
                            alt="Career growth path: learn, get certified and move up with AVP Tech Group"
                            className="relative w-full h-auto max-h-[580px] object-contain rounded-2xl border shadow-2xl transition-all duration-300"
                            style={{
                                borderColor: isDark ? 'rgba(92,214,245,0.18)' : 'rgba(27,87,160,0.18)',
                                boxShadow: isDark
                                    ? '0 30px 60px -20px rgba(0,0,0,0.6)'
                                    : '0 30px 60px -20px rgba(13,63,122,0.30)',
                            }}
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}