import { useRef, useState } from 'react'
import { motion, useInView} from 'framer-motion'

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
    const ref = useRef(null)
    const inView = useInView(ref, { once: true, margin: '-80px' })
    const [form, setForm] = useState({ name: '', school: '', phone: '', strength: '' })
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()
        if (form.name && form.school && form.phone) setSubmitted(true)
    }

    const inputStyle = {
        width: '100%',
        padding: '14px 18px',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.06)',
        border: '1.5px solid rgba(0,201,177,0.22)',
        color: 'white',
        fontSize: '14px',
        fontFamily: '"DM Sans", sans-serif',
        outline: 'none',
        transition: 'border-color 0.2s',
    }

    return (
        <section
            id="demo"
            className="relative overflow-hidden"
            style={{
                background: 'linear-gradient(to right, #102130, #132939, #152F3F, #173343)',
                minHeight: '100vh',
            }}
        >
            <FloatingSchoolBg />

            {/* Dot grid overlay */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(circle, rgba(0,201,177,0.09) 1px, transparent 1px)',
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
                    >
                        {/* Badge */}
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={inView ? { opacity: 1, y: 0 } : {}}
                            transition={{ delay: 0.15 }}
                            className="inline-block px-4 py-1.5 rounded-full text-sm font-semibold mb-6"
                            style={{
                                background: 'rgba(0,201,177,0.1)',
                                color: '#00C9B1',
                                border: '1px solid rgba(0,201,177,0.28)',
                                fontFamily: '"DM Sans", sans-serif',
                                letterSpacing: '0.03em',
                            }}
                        >
                            Free Demo
                        </motion.span>

                        {/* Heading — exact original structure + Syne font */}
                        <div className="flex flex-col items-start gap-0.5 mb-6">
                            <h1
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
                                style={{ fontFamily: '"Syne", sans-serif' }}
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
                                className="font-extrabold text-4xl sm:text-5xl md:text-6xl text-white leading-tight"
                                style={{ fontFamily: '"Syne", sans-serif' }}
                            >
                                your school?
                            </h1>
                        </div>

                        <p
                            className="text-base sm:text-lg mb-8 max-w-md leading-relaxed"
                            style={{ color: '#8A9BB0', fontFamily: '"DM Sans", sans-serif' }}
                        >
                            Join{' '}
                            <strong style={{ color: '#00C9B1', fontWeight: 600 }}>500+ schools</strong>{' '}
                            that have already modernised their administration with SchoolSpine. Book a free 30-minute live demo today.
                        </p>

                        {/* Bullet points */}
                        <ul className="space-y-4 mb-10">
                            {demoPoints.map((point, i) => (
                                <motion.li
                                    key={i}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={inView ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: 0.3 + i * 0.1 }}
                                    className="flex items-center gap-3 text-sm"
                                    style={{ color: 'rgba(255,255,255,0.78)', fontFamily: '"DM Sans", sans-serif' }}
                                >
                                    <span
                                        className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{
                                            background: 'rgba(0,201,177,0.12)',
                                            border: '1px solid rgba(0,201,177,0.35)',
                                        }}
                                    >
                                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                            <path d="M2 6 L5 9 L10 3" stroke="#00C9B1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </span>
                                    {point}
                                </motion.li>
                            ))}
                        </ul>

                        {/* Buttons — exact original style */}
                        <div className="flex flex-col sm:flex-row items-start gap-4">
                            <motion.button
                                whileHover={{ opacity: 0.88, scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="px-8 py-3.5 rounded-full font-semibold text-white text-base cursor-pointer"
                                style={{
                                    background: 'linear-gradient(to right, #00C9B1, #F5A623)',
                                    border: 'none',
                                    fontFamily: '"DM Sans", sans-serif',
                                    fontWeight: 600,
                                    boxShadow: '0 8px 24px rgba(0,201,177,0.18)',
                                }}
                            >
                                Start Free Trial
                            </motion.button>

                            <motion.a
                                href="https://wa.me/919511117450?text=Hi%2C%20I%20want%20to%20know%20more%20about%20SchoolSpine"
                                target="_blank"
                                rel="noopener noreferrer"
                                whileHover={{ backgroundColor: 'rgba(255,255,255,0.08)', scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full font-semibold text-white text-base cursor-pointer"
                                style={{
                                    border: '1px solid rgba(255,255,255,0.28)',
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

                    {/* ── Right: Demo Form ── */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={inView ? { opacity: 1, x: 0 } : {}}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        <div
                            className="rounded-2xl p-8"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                backdropFilter: 'blur(24px)',
                                WebkitBackdropFilter: 'blur(24px)',
                                border: '1.5px solid rgba(0,201,177,0.18)',
                                boxShadow: '0 0 56px rgba(0,201,177,0.07), 0 2px 32px rgba(0,0,0,0.3)',
                            }}
                        >
                            {submitted ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-10"
                                >
                                    <div className="text-5xl mb-4">🎉</div>
                                    <h3
                                        className="text-2xl font-bold text-white mb-3"
                                        style={{ fontFamily: '"Syne", sans-serif' }}
                                    >
                                        Demo Booked!
                                    </h3>
                                    <p style={{ color: '#8A9BB0', fontFamily: '"DM Sans", sans-serif' }}>
                                        Our team will reach out within 24 hours to confirm your demo slot.
                                    </p>
                                </motion.div>
                            ) : (
                                <>
                                    <h3
                                        className="text-xl font-bold text-white mb-1.5"
                                        style={{ fontFamily: '"Syne", sans-serif' }}
                                    >
                                        Book Your Free Demo
                                    </h3>
                                    <p
                                        className="text-sm mb-7"
                                        style={{ color: '#8A9BB0', fontFamily: '"DM Sans", sans-serif' }}
                                    >
                                        Fill in your details and our education specialist will set up a personalised demo.
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Your Full Name *"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            style={inputStyle}
                                            required
                                            onFocus={(e) => (e.target.style.borderColor = '#00C9B1')}
                                            onBlur={(e) => (e.target.style.borderColor = 'rgba(0,201,177,0.22)')}
                                        />
                                        <input
                                            type="text"
                                            placeholder="School / Institution Name *"
                                            value={form.school}
                                            onChange={(e) => setForm({ ...form, school: e.target.value })}
                                            style={inputStyle}
                                            required
                                            onFocus={(e) => (e.target.style.borderColor = '#00C9B1')}
                                            onBlur={(e) => (e.target.style.borderColor = 'rgba(0,201,177,0.22)')}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone Number *"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            style={inputStyle}
                                            required
                                            onFocus={(e) => (e.target.style.borderColor = '#00C9B1')}
                                            onBlur={(e) => (e.target.style.borderColor = 'rgba(0,201,177,0.22)')}
                                        />
                                        <select
                                            value={form.strength}
                                            onChange={(e) => setForm({ ...form, strength: e.target.value })}
                                            style={{
                                                ...inputStyle,
                                                color: form.strength ? 'white' : '#8A9BB0',
                                            }}
                                            onFocus={(e) => (e.target.style.borderColor = '#00C9B1')}
                                            onBlur={(e) => (e.target.style.borderColor = 'rgba(0,201,177,0.22)')}
                                        >
                                            <option value="" disabled style={{ background: '#152F3F', color: '#8A9BB0' }}>Student Strength</option>
                                            <option value="<200" style={{ background: '#152F3F' }}>Below 200 Students</option>
                                            <option value="200-500" style={{ background: '#152F3F' }}>200–500 Students</option>
                                            <option value="500-1000" style={{ background: '#152F3F' }}>500–1000 Students</option>
                                            <option value="1000+" style={{ background: '#152F3F' }}>1000+ Students</option>
                                        </select>

                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.03, boxShadow: '0 0 28px rgba(0,201,177,0.3)' }}
                                            whileTap={{ scale: 0.97 }}
                                            className="w-full py-4 rounded-xl font-bold text-white text-base mt-2 cursor-pointer"
                                            style={{
                                                background: 'linear-gradient(to right, #00C9B1, #F5A623)',
                                                border: 'none',
                                                fontFamily: '"DM Sans", sans-serif',
                                                fontWeight: 700,
                                                letterSpacing: '0.02em',
                                            }}
                                        >
                                            Book Free Demo →
                                        </motion.button>
                                    </form>

                                    <p
                                        className="text-center text-xs mt-4"
                                        style={{ color: 'rgba(138,155,176,0.6)', fontFamily: '"DM Sans", sans-serif' }}
                                    >
                                        No credit card required · 100% free · Response within 24hrs
                                    </p>
                                </>
                            )}
                        </div>
                    </motion.div>

                </div>
            </div>
        </section>
    )
}