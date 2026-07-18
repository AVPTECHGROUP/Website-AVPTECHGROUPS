import { useRef, useState, useContext } from 'react'
import { motion, useInView } from 'framer-motion'
import { UserContext } from '../../../ContextAPI/UserContext'
import { useNavigate } from 'react-router-dom'
import BookaDemo from '../../../assets/Images/Demo/BookaDemo.png'

// ─── School-themed Floating SVGs ──────────────────────────────────────────────
const SchoolSVGs = {
    graduation: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8 L58 22 L32 36 L6 22 Z" stroke="#00C9B1" strokeWidth="2" fill="rgba(0,201,177,0.08)" strokeLinejoin="round" />
            <path d="M16 29 L16 45 C16 45 22 52 32 52 C42 52 48 45 48 45 L48 29" stroke="#00C9B1" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="54" cy="22" r="3" fill="rgba(0,201,177,0.3)" stroke="#00C9B1" strokeWidth="1.5" />
            <line x1="54" y1="25" x2="54" y2="38" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M50 38 L54 43 L58 38" stroke="#00C9B1" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    ),
    book: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="10" y="10" width="32" height="44" rx="3" stroke="#F5A623" strokeWidth="2" fill="rgba(245,166,35,0.07)" />
            <rect x="14" y="10" width="4" height="44" fill="rgba(245,166,35,0.15)" rx="1" />
            <line x1="20" y1="20" x2="36" y2="20" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="27" x2="36" y2="27" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="20" y1="34" x2="30" y2="34" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M38 42 L44 36 L50 42 L44 48 Z" fill="rgba(0,201,177,0.2)" stroke="#00C9B1" strokeWidth="1.5" />
        </svg>
    ),
    pencil: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 52 L16 36 L44 8 C46 6 50 6 52 8 L56 12 C58 14 58 18 56 20 L28 48 Z" stroke="#00C9B1" strokeWidth="2" fill="rgba(0,201,177,0.08)" strokeLinejoin="round" />
            <line x1="40" y1="12" x2="52" y2="24" stroke="#00C9B1" strokeWidth="1.5" />
            <path d="M12 52 L16 36 L28 48 Z" fill="rgba(245,166,35,0.25)" stroke="#F5A623" strokeWidth="1.5" />
        </svg>
    ),
    atom: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="4" fill="rgba(0,201,177,0.4)" stroke="#00C9B1" strokeWidth="1.5" />
            <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#00C9B1" strokeWidth="1.5" fill="none" />
            <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#F5A623" strokeWidth="1.5" fill="none" transform="rotate(60 32 32)" />
            <ellipse cx="32" cy="32" rx="22" ry="9" stroke="#00C9B1" strokeWidth="1.2" fill="none" strokeOpacity="0.4" transform="rotate(120 32 32)" />
        </svg>
    ),
    chart: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="36" width="10" height="18" rx="2" fill="rgba(0,201,177,0.2)" stroke="#00C9B1" strokeWidth="1.5" />
            <rect x="22" y="24" width="10" height="30" rx="2" fill="rgba(245,166,35,0.2)" stroke="#F5A623" strokeWidth="1.5" />
            <rect x="36" y="16" width="10" height="38" rx="2" fill="rgba(0,201,177,0.2)" stroke="#00C9B1" strokeWidth="1.5" />
            <line x1="6" y1="54" x2="58" y2="54" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M13 30 L27 20 L41 12" stroke="#F5A623" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="3 2" />
        </svg>
    ),
    bell: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M32 8 C32 8 20 12 20 28 L20 40 L12 46 L52 46 L44 40 L44 28 C44 12 32 8 32 8Z" stroke="#F5A623" strokeWidth="2" fill="rgba(245,166,35,0.08)" strokeLinejoin="round" />
            <path d="M27 46 C27 49 29.2 52 32 52 C34.8 52 37 49 37 46" stroke="#F5A623" strokeWidth="2" fill="none" strokeLinecap="round" />
            <circle cx="32" cy="10" r="3" fill="rgba(0,201,177,0.4)" stroke="#00C9B1" strokeWidth="1.5" />
        </svg>
    ),
    ruler: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="24" width="48" height="16" rx="3" stroke="#00C9B1" strokeWidth="2" fill="rgba(0,201,177,0.08)" transform="rotate(-10 32 32)" />
            <line x1="16" y1="28" x2="16" y2="34" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
            <line x1="24" y1="28" x2="24" y2="32" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
            <line x1="32" y1="28" x2="32" y2="34" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
            <line x1="40" y1="28" x2="40" y2="32" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
            <line x1="48" y1="28" x2="48" y2="34" stroke="#00C9B1" strokeWidth="1.5" strokeLinecap="round" transform="rotate(-10 32 32)" />
        </svg>
    ),
}

const floatingItems = [
    { key: 'graduation', top: '6%', left: '3%', size: 70, delay: 0, duration: 7 },
    { key: 'book', top: '14%', left: '88%', size: 58, delay: 1.2, duration: 8 },
    { key: 'pencil', top: '72%', left: '5%', size: 54, delay: 0.6, duration: 9 },
    { key: 'atom', top: '80%', left: '82%', size: 62, delay: 1.8, duration: 7.5 },
    { key: 'chart', top: '42%', left: '92%', size: 50, delay: 0.3, duration: 8.5 },
    { key: 'bell', top: '55%', left: '1%', size: 48, delay: 2, duration: 6.5 },
    { key: 'ruler', top: '28%', left: '94%', size: 44, delay: 0.9, duration: 10 },
]

function FloatingSchoolBg() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {floatingItems.map(({ key, top, left, size, delay, duration }) => (
                <motion.div
                    key={key}
                    style={{ position: 'absolute', top, left, width: size, height: size, opacity: 0.32 }}
                    animate={{ y: [0, -18, 0], rotate: [0, 6, -4, 0] }}
                    transition={{ duration, delay, repeat: Infinity, ease: 'easeInOut' }}
                >
                    {SchoolSVGs[key]}
                </motion.div>
            ))}
        </div>
    )
}

const demoPoints = [
    'Full platform walkthrough — Admin, Teacher & Parent views',
    'Live demo of Attendance, Fees & Result modules',
    'Live Q&A with our education product expert',
    'Custom pricing based on your student strength',
]

export default function TransformSchool() {
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'

    const ref = useRef(null)
    const navigate = useNavigate();
    const inView = useInView(ref, { once: true, margin: '-80px' })
    const [menuOpen, setMenuOpen] = useState(false);

    const handleNavLinkClick = (link) => {
        setMenuOpen(false); // Instantly close mobile drawer if open
        if (link === "Book A Demo") {
            navigate("/contact");
        }
    };

    // Two intersecting linear-gradient masks fade only the thin outer border of the
    // image on every side — corners aren't singled out, and the center stays fully sharp.
    const imageFadeMaskX = 'linear-gradient(to right, transparent 0%, #000 6%, #000 94%, transparent 100%)'
    const imageFadeMaskY = 'linear-gradient(to bottom, transparent 0%, #000 6%, #000 94%, transparent 100%)'

    return (
        <section
            id="demo"
            className="relative overflow-hidden transition-colors duration-300"
            style={{
                background: isDark
                    ? 'linear-gradient(to right, #102130, #132939, #152F3F, #173343)'
                    : 'linear-gradient(to right, #f8fafc, #f1f5f9, #e2e8f0)',
                minHeight: '100vh',
            }}
        >
            <FloatingSchoolBg />

            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: isDark
                        ? 'radial-gradient(circle, rgba(0,201,177,0.09) 1px, transparent 1px)'
                        : 'radial-gradient(circle, rgba(0,201,177,0.15) 1px, transparent 1px)',
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
                                background: isDark ? 'rgba(0,201,177,0.1)' : 'rgba(0,201,177,0.08)',
                                color: isDark ? '#00C9B1' : '#00967f',
                                border: '1px solid rgba(0,201,177,0.28)',
                                fontFamily: '"DM Sans", sans-serif',
                                letterSpacing: '0.03em',
                                boxShadow: isDark ? '0 0 0 4px rgba(0,201,177,0.04)' : '0 0 0 4px rgba(0,201,177,0.05)',
                            }}
                        >
                            <motion.span
                                animate={{ opacity: [1, 0.35, 1] }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                                style={{
                                    width: 6,
                                    height: 6,
                                    borderRadius: '50%',
                                    background: '#00C9B1',
                                    display: 'inline-block',
                                }}
                            />
                            Free Demo
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
                                <span style={{ color: '#00C9B1' }}>trans</span>
                                <span style={{ color: '#F5A623' }}>form</span>
                            </h1>
                            <h1
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl leading-tight transition-colors"
                                style={{ fontFamily: '"Syne", sans-serif', color: isDark ? 'white' : '#0f172a' }}
                            >
                                your school?
                            </h1>
                        </div>

                        <p
                            className="text-base sm:text-lg mb-8 max-w-md leading-relaxed transition-colors"
                            style={{ color: isDark ? '#8A9BB0' : '#475569', fontFamily: '"DM Sans", sans-serif' }}
                        >
                            Join{' '}
                            <strong style={{ color: isDark ? '#00C9B1' : '#00967f', fontWeight: 600 }}>500+ schools</strong>{' '}
                            that have already modernised their administration with SchoolSpine. Book a free 30-minute live demo today.
                        </p>

                        {/* Bullet points */}
                        <ul className="flex flex-col items-center lg:items-start space-y-4 mb-10">
                            {demoPoints.map((point, i) => (
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
                                            background: isDark ? 'rgba(0,201,177,0.12)' : 'rgba(0,201,177,0.1)',
                                            border: isDark ? '1px solid rgba(0,201,177,0.35)' : '1px solid rgba(0,201,177,0.4)',
                                            boxShadow: isDark ? 'none' : '0 1px 2px rgba(0,150,127,0.08)',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6 L5 9 L10 3" stroke={isDark ? "#00C9B1" : "#00967f"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </motion.li>
                            ))}
                        </ul>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4">
                            <motion.button
                                onClick={() => handleNavLinkClick("Book A Demo")}
                                whileHover={{ scale: 1.03, boxShadow: isDark ? '0 10px 32px rgba(0,201,177,0.32)' : '0 10px 28px rgba(0,150,127,0.28)' }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-3.5 rounded-full font-semibold text-slate-950 text-base cursor-pointer"
                                style={{
                                    background: 'linear-gradient(to right, #00C9B1, #F5A623)',
                                    border: 'none',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontWeight: 700,
                                    boxShadow: isDark
                                        ? '0 8px 24px rgba(0,201,177,0.22)'
                                        : '0 8px 24px rgba(0,150,127,0.18)',
                                    transition: 'box-shadow 0.2s',
                                }}
                            >
                                Book A Demo
                            </motion.button>

                            <motion.a
                                href="https://wa.me/919511117450?text=Hi%2C%20I%20want%20to%20know%20more%20about%20SchoolSpine"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(15,23,42,0.04)', scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-base cursor-pointer"
                                style={{
                                    border: isDark ? '1px solid rgba(255,255,255,0.28)' : '1px solid rgba(15,23,42,0.18)',
                                    color: isDark ? 'white' : '#1e293b',
                                    textDecoration: 'none',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontWeight: 600,
                                    transition: 'background-color 0.2s',
                                }}
                            >
                                Talk to Sales
                            </motion.a>
                        </div>
                    </motion.div>

                    {/* ── Right: Responsive Demo Graphic/Image ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                        className="hidden sm:flex relative w-full justify-center items-center"
                        style={{ minHeight: 480 }}
                    >
                        {/* Ambient color glow sitting behind the image — visible through the faded edges */}
                        <div
                            className="absolute pointer-events-none"
                            style={{
                                width: '78%',
                                height: '78%',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, rgba(0,201,177,0.28) 0%, rgba(245,166,35,0.16) 45%, transparent 72%)',
                                filter: 'blur(60px)',
                                opacity: isDark ? 0.9 : 0.5,
                            }}
                        />

                        <img
                            src={BookaDemo}
                            alt="Book a Demo"
                            className="relative w-full rounded-xl h-auto max-h-[580px] object-contain transition-all duration-300"
                           
                        />
                    </motion.div>

                </div>
            </div>
        </section>
    )
}