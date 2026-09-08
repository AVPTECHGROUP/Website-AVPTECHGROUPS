import React, { useContext } from 'react'
import {
    Check,
    Sparkles,
    ArrowRight,
    Zap,
    BarChart3,
    CalendarDays,
    BookOpenCheck,
    ShieldCheck,
    ScanFace,
    GraduationCap,
    BellRing,
    CreditCard,
    Bus,
    PackageCheck,
    Users,
    TrendingUp
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'

// Assets
import priceAppImg from '../../../assets/Images/pricing/price_app.png'
import schoolPriceImg from '../../../assets/Images/pricing/school_price.png'

const column1Modules = [
    {
        icon: BarChart3,
        title: "School Analytics",
        desc: "Data-driven insights for better decisions.",
        accent: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30"
    },
    {
        icon: CalendarDays,
        title: "Academics & Timetable",
        desc: "Organize classes, subjects and schedules.",
        accent: "text-sky-600 bg-sky-500/10 border-sky-500/30"
    },
    {
        icon: BookOpenCheck,
        title: "Homework & Learning",
        desc: "Digital learning and homework management.",
        accent: "text-teal-600 bg-teal-500/10 border-teal-500/30"
    },
    {
        icon: ShieldCheck,
        title: "Staff HR & 360° Security",
        desc: "Manage staff, roles and campus security.",
        accent: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30"
    }
]

const column2Modules = [
    {
        icon: ScanFace,
        title: "Attendance & Face Recognition",
        desc: "Accurate, fast and secure attendance.",
        accent: "text-sky-600 bg-sky-500/10 border-sky-500/30"
    },
    {
        icon: GraduationCap,
        title: "Exams & Report Cards",
        desc: "Automate exams and generate reports.",
        accent: "text-indigo-600 bg-indigo-500/10 border-indigo-500/30"
    },
    {
        icon: BellRing,
        title: "Broadcasts & FCM",
        desc: "Keep everyone informed, instantly.",
        accent: "text-teal-600 bg-teal-500/10 border-teal-500/30"
    }
]

const column3Modules = [
    {
        icon: CreditCard,
        title: "Fees & Finance",
        desc: "Simplify fee collection and financial tracking.",
        accent: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30"
    },
    {
        icon: Bus,
        title: "Transport & Fleet",
        desc: "Track buses, routes and student safety.",
        accent: "text-amber-600 bg-amber-500/10 border-amber-500/30"
    },
    {
        icon: PackageCheck,
        title: "Inventory & Campus Store",
        desc: "Manage stock, purchases and campus store.",
        accent: "text-teal-600 bg-teal-500/10 border-teal-500/30"
    }
]

export default function Pricing() {
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'
    const navigate = useNavigate()

    return (
        <section
            id="pricing-section"
            className="relative py-14 sm:py-20 lg:py-24 overflow-hidden transition-colors duration-300 select-none font-body"
            style={{
                backgroundColor: isDark ? '#020713' : '#F8FAFC',
                color: isDark ? '#f1f5f9' : '#0f172a'
            }}
        >
            {/* Scoped floating animations */}
            <style>{`
                @keyframes floatSlow {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-7px); }
                }
                @keyframes floatReverse {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(6px); }
                }
                @keyframes campusFloat {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-5px); }
                }
                @keyframes phoneBounce {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-8px); }
                }
                .anim-float-1 { animation: floatSlow 4s ease-in-out infinite; }
                .anim-float-2 { animation: floatReverse 4.6s ease-in-out infinite 0.3s; }
                .anim-float-3 { animation: floatSlow 5s ease-in-out infinite 0.7s; }
                .anim-float-4 { animation: floatReverse 4.4s ease-in-out infinite 1.1s; }
                .anim-float-5 { animation: floatSlow 5.4s ease-in-out infinite 0.5s; }
                .anim-float-6 { animation: floatReverse 4.8s ease-in-out infinite 0.9s; }
                .anim-float-7 { animation: floatSlow 4.2s ease-in-out infinite 0.2s; }
                .anim-campus  { animation: campusFloat 6s ease-in-out infinite; }
                .anim-phone   { animation: phoneBounce 5.5s ease-in-out infinite; }
            `}</style>

            {/* Ambient Radial Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-32 left-1/4 w-[750px] h-[500px] rounded-full blur-[150px] transition-opacity duration-300"
                    style={{
                        opacity: isDark ? 0.25 : 0.12,
                        background: 'radial-gradient(circle, #00C9B1 0%, #0284C7 50%, #4f46e5 100%)'
                    }}
                />
                <div
                    className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full blur-[140px] transition-opacity duration-300"
                    style={{
                        opacity: isDark ? 0.20 : 0.10,
                        background: 'radial-gradient(circle, #00F0FF 0%, #0369a1 60%, transparent 80%)'
                    }}
                />
            </div>

            {/* Dot Matrix Decorative Elements */}
            <div className="absolute left-6 top-72 hidden xl:grid grid-cols-5 gap-3.5 opacity-20 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                ))}
            </div>
            <div className="absolute right-6 bottom-40 hidden xl:grid grid-cols-5 gap-3.5 opacity-20 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div key={i} className={`w-1 h-1 rounded-full ${isDark ? 'bg-cyan-400' : 'bg-slate-400'}`} />
                ))}
            </div>

            {/* Main Content Container */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pr-14 sm:pr-16 md:pr-6 lg:pr-8">

                {/* ── TOP HEADER + PHONE ── */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center mb-10 sm:mb-16">

                    {/* Left: Headline & Trust Badges */}
                    <div className="md:col-span-7 lg:col-span-7 xl:col-span-8 text-center md:text-left">
                        <div
                            className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full border text-[11px] sm:text-xs font-extrabold tracking-widest uppercase mb-4 shadow-sm"
                            style={{
                                backgroundColor: isDark ? 'rgba(0,201,177,0.1)' : '#E6FAF8',
                                borderColor: isDark ? 'rgba(0,201,177,0.35)' : 'rgba(0,201,177,0.5)',
                                color: isDark ? '#00C9B1' : '#008a7b'
                            }}
                        >
                            <Sparkles size={13} className="animate-pulse" />
                            <span>ONE PLAN. EVERYTHING INCLUDED.</span>
                        </div>

                        <h2
                            className="font-heading font-extrabold text-3xl sm:text-4xl md:text-4xl lg:text-5xl xl:text-6xl tracking-tight leading-[1.15]"
                            style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                        >
                            Run Your Entire School.{' '}
                            <span className="block mt-2">
                                For Just{' '}
                                <span className="bg-gradient-to-r from-[#00A896] via-[#0284C7] to-[#2563EB] bg-clip-text text-transparent">
                                    ₹10
                                </span>{' '}
                                / Student.
                            </span>
                        </h2>

                        <p
                            className="mt-3.5 text-sm sm:text-base max-w-xl mx-auto md:mx-0"
                            style={{ color: isDark ? '#94a3b8' : '#475569' }}
                        >
                            One simple plan. Every core school operation. No hidden fees. No feature gates.
                        </p>

                        {/* Trust Check Badges */}
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-2.5 mt-6 text-xs font-semibold">
                            {["No setup fee", "Unlimited staff accounts", "Android + iOS", "15+ modules included"].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm backdrop-blur-md"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(7,19,41,0.9)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.2)' : 'rgba(203,213,225,0.8)',
                                        color: isDark ? '#cbd5e1' : '#334155'
                                    }}
                                >
                                    <div
                                        className="w-3.5 h-3.5 rounded-full flex items-center justify-center"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(0,201,177,0.2)' : '#D1F7F3',
                                            color: isDark ? '#00C9B1' : '#008a7b'
                                        }}
                                    >
                                        <Check size={10} strokeWidth={3} />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Phone Mockup */}
                    <div className="md:col-span-5 lg:col-span-5 xl:col-span-4 hidden md:flex justify-end items-center relative">
                        <div className="relative w-64 md:w-72 lg:w-92 xl:w-[410px] anim-phone">
                            <div
                                className="absolute inset-0 rounded-3xl blur-3xl pointer-events-none"
                                style={{ backgroundColor: isDark ? 'rgba(0,201,177,0.2)' : 'rgba(0,201,177,0.12)' }}
                            />
                            <img
                                src={priceAppImg}
                                alt="SchoolSpine Mobile App"
                                className="relative z-10 w-full h-auto object-contain"
                                style={{
                                    filter: isDark
                                        ? 'drop-shadow(0 25px 45px rgba(0,0,0,0.85))'
                                        : 'drop-shadow(0 20px 35px rgba(15,23,42,0.12))'
                                }}
                            />
                        </div>
                    </div>

                </div>

                {/* ── HERO DECK: PRICING CARD + 3D SCHOOL SYSTEM ── */}
                <div
                    className="relative rounded-[28px] sm:rounded-[36px] border backdrop-blur-2xl p-4.5 sm:p-6 md:p-7 lg:p-10 mb-14 sm:mb-18 overflow-hidden transition-all duration-300"
                    style={{
                        backgroundColor: isDark ? 'rgba(7, 19, 41, 0.92)' : '#ffffff',
                        borderColor: isDark ? 'rgba(6, 182, 212, 0.3)' : 'rgba(226, 232, 240, 0.95)',
                        boxShadow: isDark
                            ? '0 20px 70px -15px rgba(0,201,177,0.2)'
                            : '0 20px 50px -15px rgba(15, 23, 42, 0.07)'
                    }}
                >
                    {/* Top gradient highlight strip */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C9B1] to-transparent" />

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8 items-center">

                        {/* LEFT: Pricing Module */}
                        <div className="md:col-span-5 lg:col-span-4 flex justify-center md:justify-start w-full">
                            <div
                                className="w-full max-w-sm rounded-2xl sm:rounded-3xl border p-5 sm:p-6 lg:p-7 backdrop-blur-xl transition-all duration-300"
                                style={{
                                    backgroundColor: isDark ? '#0a1a3b' : '#FAFCFD',
                                    borderColor: isDark ? 'rgba(6, 182, 212, 0.35)' : 'rgba(0, 201, 177, 0.35)',
                                    boxShadow: isDark
                                        ? 'inset 0 0 30px rgba(0,201,177,0.08), 0 15px 40px rgba(0,0,0,0.5)'
                                        : '0 12px 35px -8px rgba(0, 180, 216, 0.12)'
                                }}
                            >
                                <div
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-3 sm:mb-4"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(0,201,177,0.15)' : '#E6FAF8',
                                        borderColor: isDark ? 'rgba(0,201,177,0.4)' : 'rgba(0,201,177,0.5)',
                                        color: isDark ? '#00C9B1' : '#008a7b'
                                    }}
                                >
                                    <Zap size={12} className="fill-current" />
                                    <span>ALL-INCLUSIVE SCHOOL PASS</span>
                                </div>

                                <div className="flex items-baseline gap-2 my-2">
                                    <span
                                        className="font-heading font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight"
                                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                                    >
                                        ₹10
                                    </span>
                                    <div className="text-left leading-tight">
                                        <p className="text-xs sm:text-sm font-bold" style={{ color: isDark ? '#e2e8f0' : '#1e293b' }}>
                                            per student
                                        </p>
                                        <p className="text-[11px] sm:text-xs font-semibold" style={{ color: isDark ? '#38bdf8' : '#0284c7' }}>
                                            / month
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 my-3 sm:my-4 text-xs font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                    <span className="h-[1px] w-6" style={{ backgroundColor: isDark ? 'rgba(6,182,212,0.4)' : '#cbd5e1' }} />
                                    <span>Flat school-wide pricing</span>
                                    <span className="h-[1px] w-6" style={{ backgroundColor: isDark ? 'rgba(6,182,212,0.4)' : '#cbd5e1' }} />
                                </div>

                                <button
                                    onClick={() => navigate('/contact')}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-heading font-extrabold text-white text-sm sm:text-base tracking-wide cursor-pointer transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.98]"
                                    style={{
                                        background: 'linear-gradient(90deg, #00C9B1 0%, #0284C7 100%)',
                                        boxShadow: '0 6px 20px rgba(0, 201, 177, 0.28)'
                                    }}
                                >
                                    <span>Start for ₹10</span>
                                    <ArrowRight size={17} className="stroke-[2.5]" />
                                </button>

                                <div
                                    className="flex items-center justify-between text-[10px] font-semibold mt-4 sm:mt-5 pt-3.5 sm:pt-4 border-t"
                                    style={{
                                        borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                                        color: isDark ? '#94a3b8' : '#64748b'
                                    }}
                                >
                                    <span>🤖 Android</span>
                                    <span>🍏 iOS</span>
                                    <span>🛡️ No card needed</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: 3D Campus + Floating Chips */}
                        <div className="md:col-span-7 lg:col-span-8 relative flex items-center justify-center min-h-[350px] sm:min-h-[400px] lg:min-h-[440px] px-1 sm:px-2">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div
                                    className="w-64 sm:w-80 lg:w-96 h-64 sm:h-80 lg:h-96 rounded-full blur-[80px]"
                                    style={{ backgroundColor: isDark ? 'rgba(6, 182, 212, 0.18)' : 'rgba(0, 201, 177, 0.12)' }}
                                />
                            </div>

                            {/* Floating Chip 1: Students */}
                            <div className="absolute top-1 left-1 sm:top-2 sm:left-4 lg:left-8 z-20 anim-float-1">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                                        <Users size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Students</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Enroll • Track →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 2: Attendance */}
                            <div className="absolute -top-3 sm:top-0 left-1/2 -translate-x-1/2 z-20 anim-float-2">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-cyan-500/15 text-cyan-600 flex items-center justify-center shrink-0">
                                        <ScanFace size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Attendance</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Real-time →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 3: Fees */}
                            <div className="absolute top-1 right-1 sm:top-2 sm:right-4 lg:right-8 z-20 anim-float-3">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-teal-500/15 text-teal-600 flex items-center justify-center shrink-0">
                                        <CreditCard size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Fees</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Online pay →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 4: Transport */}
                            <div className="absolute bottom-12 left-0 sm:bottom-14 sm:left-2 lg:left-6 z-20 anim-float-4">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-amber-500/15 text-amber-600 flex items-center justify-center shrink-0">
                                        <Bus size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Transport</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>GPS safety →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 5: Staff */}
                            <div className="absolute -bottom-3 left-1/3 -translate-x-8 sm:-translate-x-12 z-20 anim-float-5">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center shrink-0">
                                        <Users size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Staff & HR</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Manage →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 6: Timetable */}
                            <div className="absolute top-20 sm:top-24 right-0 sm:right-2 lg:right-4 z-20 anim-float-6">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                                        <CalendarDays size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Timetable</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Schedules →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 7: Reports */}
                            <div className="absolute -bottom-1 right-1 sm:right-4 lg:right-8 z-20 anim-float-7">
                                <div
                                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg sm:rounded-xl border backdrop-blur-md shadow-sm hover:scale-105 transition-all duration-300 cursor-pointer"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(8,21,46,0.92)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(6,182,212,0.4)' : 'rgba(203,213,225,0.85)'
                                    }}
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md sm:rounded-lg bg-sky-500/15 text-sky-600 flex items-center justify-center shrink-0">
                                        <TrendingUp size={12} className="sm:w-[13px] sm:h-[13px]" />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[10px] sm:text-[11px] font-bold" style={{ color: isDark ? '#ffffff' : '#0f172a' }}>Reports</p>
                                        <p className="hidden xs:block text-[8px] sm:text-[9px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Insights →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Center Floating Campus */}
                            <div className="relative z-10 w-full max-w-[320px] sm:max-w-[420px] md:max-w-[440px] lg:max-w-[520px] anim-campus">
                                <img
                                    src={schoolPriceImg}
                                    alt="SchoolSpine Smart Campus 3D Model"
                                    className="w-full h-auto object-contain hover:scale-[1.02] transition-transform duration-500"
                                    style={{
                                        filter: isDark
                                            ? 'drop-shadow(0 25px 45px rgba(0,0,0,0.65))'
                                            : 'drop-shadow(0 15px 30px rgba(15,23,42,0.12))'
                                    }}
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── BOTTOM SECTION: 15+ ENTERPRISE MODULES ── */}
                <div className="flex flex-col items-center mt-6">
                    <div
                        className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border text-[10px] font-extrabold tracking-widest uppercase mb-3 shadow-sm"
                        style={{
                            backgroundColor: isDark ? 'rgba(6,182,212,0.1)' : '#E6FAF8',
                            borderColor: isDark ? 'rgba(6,182,212,0.3)' : 'rgba(0,201,177,0.4)',
                            color: isDark ? '#38bdf8' : '#008a7b'
                        }}
                    >
                        <span>15+ ENTERPRISE MODULES</span>
                    </div>

                    <h3
                        className="font-heading font-extrabold text-2xl sm:text-4xl text-center"
                        style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                    >
                        Everything{' '}
                        <span className="bg-gradient-to-r from-[#00A896] via-[#0284C7] to-[#2563EB] bg-clip-text text-transparent">
                            Included
                        </span>
                    </h3>
                    <p
                        className="mt-1.5 text-xs sm:text-sm text-center max-w-md"
                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                    >
                        Powerful features for a smarter, simpler school.
                    </p>

                    {/* 3-Column Structured Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 w-full mt-8 sm:mt-10">

                        {/* Column 1 */}
                        <div className="flex flex-col gap-3 sm:gap-3.5">
                            {column1Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(7,19,41,0.85)' : '#ffffff',
                                            borderColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(226,232,240,0.9)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4
                                                    className="text-xs sm:text-sm font-bold truncate transition-colors group-hover:text-[#00A896]"
                                                    style={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] truncate mt-0.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {/* Column 2 */}
                        <div className="flex flex-col gap-3 sm:gap-3.5">
                            {column2Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(7,19,41,0.85)' : '#ffffff',
                                            borderColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(226,232,240,0.9)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4
                                                    className="text-xs sm:text-sm font-bold truncate transition-colors group-hover:text-[#00A896]"
                                                    style={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] truncate mt-0.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="flex items-center justify-center pt-3 sm:pt-5">
                                <span
                                    className="font-serif italic text-xs sm:text-sm tracking-wide text-center"
                                    style={{ color: isDark ? 'rgba(103,232,249,0.8)' : '#008a7b' }}
                                >
                                    ~ More features. Better learning. ~
                                </span>
                            </div>
                        </div>

                        {/* Column 3 */}
                        <div className="flex flex-col gap-3 sm:gap-3.5">
                            {column3Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-0.5"
                                        style={{
                                            backgroundColor: isDark ? 'rgba(7,19,41,0.85)' : '#ffffff',
                                            borderColor: isDark ? 'rgba(30,41,59,0.9)' : 'rgba(226,232,240,0.9)'
                                        }}
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-8.5 h-8.5 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4
                                                    className="text-xs sm:text-sm font-bold truncate transition-colors group-hover:text-[#00A896]"
                                                    style={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                                >
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] truncate mt-0.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}