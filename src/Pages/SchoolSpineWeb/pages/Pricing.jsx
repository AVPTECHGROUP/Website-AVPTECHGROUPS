import React from 'react'
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

// Assets from src/assets/Images/pricing/
import priceAppImg from '../../../assets/Images/pricing/price_app.png'
import schoolPriceImg from '../../../assets/Images/pricing/school_price.png'

const column1Modules = [
    {
        icon: BarChart3,
        title: "School Analytics",
        desc: "Data-driven insights for better decisions.",
        accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"
    },
    {
        icon: CalendarDays,
        title: "Academics & Timetable",
        desc: "Organize classes, subjects and schedules.",
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/25"
    },
    {
        icon: BookOpenCheck,
        title: "Homework & Learning",
        desc: "Digital learning and homework management.",
        accent: "text-teal-400 bg-teal-500/10 border-teal-500/25"
    },
    {
        icon: ShieldCheck,
        title: "Staff HR & 360° Security",
        desc: "Manage staff, roles and campus security.",
        accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25"
    }
]

const column2Modules = [
    {
        icon: ScanFace,
        title: "Attendance & Face Recognition",
        desc: "Accurate, fast and secure attendance.",
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/25"
    },
    {
        icon: GraduationCap,
        title: "Exams & Report Cards",
        desc: "Automate exams and generate reports.",
        accent: "text-indigo-400 bg-indigo-500/10 border-indigo-500/25"
    },
    {
        icon: BellRing,
        title: "Broadcasts & FCM",
        desc: "Keep everyone informed, instantly.",
        accent: "text-teal-400 bg-teal-500/10 border-teal-500/25"
    }
]

const column3Modules = [
    {
        icon: CreditCard,
        title: "Fees & Finance",
        desc: "Simplify fee collection and financial tracking.",
        accent: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25"
    },
    {
        icon: Bus,
        title: "Transport & Fleet",
        desc: "Track buses, routes and student safety.",
        accent: "text-sky-400 bg-sky-500/10 border-sky-500/25"
    },
    {
        icon: PackageCheck,
        title: "Inventory & Campus Store",
        desc: "Manage stock, purchases and campus store.",
        accent: "text-teal-400 bg-teal-500/10 border-teal-500/25"
    }
]

export default function Pricing() {
    const navigate = useNavigate()

    return (
        <section
            id="pricing-section"
            className="relative py-14 sm:py-20 lg:py-24 overflow-hidden bg-[#020713] text-slate-100 select-none"
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

            {/* Ambient Background Radial Lights */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div
                    className="absolute -top-32 left-1/4 w-[750px] h-[500px] rounded-full opacity-25 blur-[150px]"
                    style={{ background: 'radial-gradient(circle, #00C9B1 0%, #0284C7 50%, #4f46e5 100%)' }}
                />
                <div
                    className="absolute top-1/3 -right-24 w-[500px] h-[500px] rounded-full opacity-20 blur-[140px]"
                    style={{ background: 'radial-gradient(circle, #00F0FF 0%, #0369a1 60%, transparent 80%)' }}
                />
            </div>

            {/* Dot Matrix Background Accents */}
            <div className="absolute left-6 top-72 hidden xl:grid grid-cols-5 gap-3.5 opacity-20 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-cyan-400" />
                ))}
            </div>
            <div className="absolute right-6 bottom-40 hidden xl:grid grid-cols-5 gap-3.5 opacity-20 pointer-events-none">
                {[...Array(25)].map((_, i) => (
                    <div key={i} className="w-1 h-1 rounded-full bg-cyan-400" />
                ))}
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ── TOP HEADER + LARGE FLOATING PHONE ON THE RIGHT ── */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 sm:mb-16">

                    {/* Left: Heading & Trust Badges */}
                    <div className="lg:col-span-8 text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#00C9B1]/40 bg-[#00C9B1]/10 text-[#00C9B1] text-xs font-extrabold tracking-widest uppercase shadow-[0_0_20px_rgba(0,201,177,0.25)] mb-4">
                            <Sparkles size={13} className="text-[#00C9B1] animate-pulse" />
                            <span>ONE PLAN. EVERYTHING INCLUDED.</span>
                        </div>

                        <h2 className="font-heading font-extrabold text-3xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.12]">
                            Run Your Entire School.{' '}
                            <span className="block mt-2">
                                For Just{' '}
                                <span className="bg-gradient-to-r from-[#00F0FF] via-[#00C9B1] to-[#38BDF8] bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(0,240,255,0.4)]">
                                    ₹10
                                </span>{' '}
                                / Student.
                            </span>
                        </h2>

                        <p className="mt-3.5 text-slate-400 text-sm sm:text-base max-w-xl mx-auto lg:mx-0">
                            One simple plan. Every core school operation. No hidden fees. No feature gates.
                        </p>

                        {/* Trust Check Badges */}
                        <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5 mt-6 text-xs font-semibold text-slate-300">
                            {["No setup fee", "Unlimited staff accounts", "Android + iOS", "10+ modules included"].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-1.5 bg-[#071329]/90 border border-cyan-500/20 px-3 py-1.5 rounded-full backdrop-blur-md">
                                    <div className="w-3.5 h-3.5 rounded-full bg-[#00C9B1]/20 flex items-center justify-center text-[#00C9B1]">
                                        <Check size={10} strokeWidth={3} />
                                    </div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Prominent Floating Phone Mockup */}
                    <div className="lg:col-span-4 hidden lg:flex justify-end items-center relative">
                        <div className="relative w-85 xl:w-100 anim-phone">
                            <div className="absolute inset-0 bg-[#00C9B1]/20 rounded-3xl blur-3xl pointer-events-none" />
                            <img
                                src={priceAppImg}
                                alt="SchoolSpine Mobile App"
                                className="relative z-10 w-full h-auto object-contain drop-shadow-[0_25px_50px_rgba(0,0,0,0.85)]"
                            />
                        </div>
                    </div>

                </div>

                {/* ── MAIN HERO DECK: PRICING CARD + 3D SCHOOL SYSTEM ── */}
                <div className="relative rounded-[32px] sm:rounded-[36px] border border-cyan-500/30 bg-gradient-to-b from-[#071329]/90 via-[#050e1f]/95 to-[#030816]/98 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 shadow-[0_20px_70px_-15px_rgba(0,201,177,0.2)] mb-18 overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent shadow-[0_0_15px_#00F0FF]" />

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">

                        {/* LEFT: Pricing Module (4 Cols) */}
                        <div className="lg:col-span-4 flex justify-center lg:justify-start">
                            <div className="w-full max-w-sm rounded-3xl border border-cyan-500/40 bg-gradient-to-b from-[#0a1a3b]/90 to-[#071329]/90 p-6 sm:p-7 backdrop-blur-xl shadow-[inset_0_0_30px_rgba(0,201,177,0.08),0_15px_40px_rgba(0,0,0,0.5)]">

                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00C9B1]/15 border border-[#00C9B1]/40 text-[#00C9B1] text-[11px] font-extrabold uppercase tracking-wider mb-4">
                                    <Zap size={12} className="fill-current text-[#00C9B1]" />
                                    <span>ALL-INCLUSIVE SCHOOL PASS</span>
                                </div>

                                <div className="flex items-baseline gap-2 my-2">
                                    <span className="font-heading font-extrabold text-5xl sm:text-6xl text-white tracking-tight drop-shadow-[0_0_20px_rgba(0,240,255,0.3)]">
                                        ₹10
                                    </span>
                                    <div className="text-left leading-tight">
                                        <p className="text-sm font-bold text-slate-100">per student</p>
                                        <p className="text-xs text-cyan-300 font-medium">/ month</p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-center gap-2 my-4 text-xs text-slate-400 font-medium">
                                    <span className="h-[1px] w-6 bg-cyan-500/40" />
                                    <span>Flat school-wide pricing</span>
                                    <span className="h-[1px] w-6 bg-cyan-500/40" />
                                </div>

                                <button
                                    onClick={() => navigate('/contact')}
                                    className="group relative overflow-hidden w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-[#00F0FF] via-[#00B4D8] to-[#6366F1] text-white font-heading font-extrabold text-sm tracking-wide shadow-[0_0_30px_rgba(0,240,255,0.45)] hover:shadow-[0_0_40px_rgba(0,240,255,0.65)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                                >
                                    <span>Start for ₹10</span>
                                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform stroke-[2.5]" />
                                </button>

                                <div className="flex items-center justify-between text-[10px] text-slate-300 font-semibold mt-5 pt-4 border-t border-slate-800/80">
                                    <span>🤖 Android App</span>
                                    <span>🍏 iOS App</span>
                                    <span>🛡️ No credit card required</span>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Floating 3D Campus + Floating Chips (8 Cols) */}
                        <div className="lg:col-span-8 relative flex items-center justify-center min-h-[380px] sm:min-h-[440px]">
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="w-96 h-96 rounded-full bg-cyan-500/20 blur-[100px]" />
                            </div>

                            {/* Floating Chip 1: Students */}
                            <div className="absolute top-2 left-4 sm:left-12 z-20 anim-float-1">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <Users size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Students</p>
                                        <p className="text-[9px] text-slate-400">Enroll • Track • Grow →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 2: Attendance */}
                            <div className="absolute -top-3 sm:top-0 left-1/2 -translate-x-1/2 z-20 anim-float-2">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                                        <ScanFace size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Attendance</p>
                                        <p className="text-[9px] text-slate-400">Real-time tracking →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 3: Fees & Finance */}
                            <div className="absolute top-2 right-4 sm:right-12 z-20 anim-float-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                                        <CreditCard size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Fees & Finance</p>
                                        <p className="text-[9px] text-slate-400">Online payments →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 4: Transport */}
                            <div className="absolute bottom-16 left-2 sm:left-8 z-20 anim-float-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                                        <Bus size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Transport</p>
                                        <p className="text-[9px] text-slate-400">Safe & efficient →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 5: Teachers & Staff */}
                            <div className="absolute -bottom-3 left-1/3 -translate-x-12 z-20 anim-float-5">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                                        <Users size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Teachers & Staff</p>
                                        <p className="text-[9px] text-slate-400">Manage & engage →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 6: Timetable */}
                            <div className="absolute top-28 right-0 sm:right-6 z-20 anim-float-6">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                                        <CalendarDays size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Timetable</p>
                                        <p className="text-[9px] text-slate-400">Smart scheduling →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Floating Chip 7: Reports */}
                            <div className="absolute -bottom-1 right-2 sm:right-10 z-20 anim-float-7">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-cyan-500/40 bg-[#08152e]/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,201,177,0.2)] hover:scale-105 hover:border-cyan-400 transition-all duration-300 cursor-pointer">
                                    <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
                                        <TrendingUp size={13} />
                                    </div>
                                    <div className="text-left leading-tight">
                                        <p className="text-[11px] font-bold text-white">Reports</p>
                                        <p className="text-[9px] text-slate-400">Insights & analytics →</p>
                                    </div>
                                </div>
                            </div>

                            {/* Center Floating Campus Illustration */}
                            <div className="relative z-10 w-full max-w-[480px] sm:max-w-[540px] anim-campus">
                                <img
                                    src={schoolPriceImg}
                                    alt="SchoolSpine Smart Campus 3D Model"
                                    className="w-full h-auto object-contain drop-shadow-[0_25px_45px_rgba(0,0,0,0.65)] hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                        </div>

                    </div>
                </div>

                {/* ── BOTTOM SECTION: 10+ ENTERPRISE MODULES ── */}
                <div className="flex flex-col items-center mt-6">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-[10px] font-extrabold tracking-widest uppercase mb-3">
                        <span>10+ ENTERPRISE MODULES</span>
                    </div>

                    <h3 className="font-heading font-extrabold text-3xl sm:text-4xl text-center">
                        Everything{' '}
                        <span className="bg-gradient-to-r from-[#00F0FF] via-[#00C9B1] to-[#38BDF8] bg-clip-text text-transparent">
                            Included
                        </span>
                    </h3>
                    <p className="mt-1.5 text-slate-400 text-xs sm:text-sm text-center max-w-md">
                        Powerful features for a smarter, simpler school.
                    </p>

                    {/* 3-Column Structured Layout (4 + 3 + 3) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-10">

                        {/* Column 1 (4 modules) */}
                        <div className="flex flex-col gap-3.5">
                            {column1Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/90 bg-[#071329]/80 hover:bg-[#0c1e42]/90 hover:border-cyan-500/50 shadow-md hover:shadow-[0_0_20px_rgba(0,201,177,0.15)] transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                                    </div>
                                )
                            })}
                        </div>

                        {/* Column 2 (3 modules + Cursive Quote) */}
                        <div className="flex flex-col gap-3.5">
                            {column2Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/90 bg-[#071329]/80 hover:bg-[#0c1e42]/90 hover:border-cyan-500/50 shadow-md hover:shadow-[0_0_20px_rgba(0,201,177,0.15)] transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                                    </div>
                                )
                            })}

                            <div className="flex items-center justify-center pt-5">
                                <span className="font-serif italic text-cyan-300/80 text-sm tracking-wide text-center">
                                    ~ More features. Better learning. ~
                                </span>
                            </div>
                        </div>

                        {/* Column 3 (3 modules) */}
                        <div className="flex flex-col gap-3.5">
                            {column3Modules.map((item, idx) => {
                                const IconComp = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="group relative flex items-center justify-between p-3.5 rounded-2xl border border-slate-800/90 bg-[#071329]/80 hover:bg-[#0c1e42]/90 hover:border-cyan-500/50 shadow-md hover:shadow-[0_0_20px_rgba(0,201,177,0.15)] transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${item.accent} group-hover:scale-110 transition-transform`}>
                                                <IconComp size={17} />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
                                                    {item.title}
                                                </h4>
                                                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                                    {item.desc}
                                                </p>
                                            </div>
                                        </div>
                                        <ArrowRight size={14} className="text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
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