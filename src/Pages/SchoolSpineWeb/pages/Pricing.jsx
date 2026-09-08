import React from 'react'
import {
    Check,
    Sparkles,
    ArrowRight,
    ScanFace,
    Bus,
    CreditCard,
    GraduationCap,
    CalendarDays,
    PackageCheck,
    BellRing,
    ShieldCheck,
    BookOpenCheck,
    BarChart3,
    Zap
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const modulesList = [
    {
        icon: BarChart3,
        title: "Multi-School Dashboard & Analytics",
        desc: "Live KPIs, multi-campus governance, fee overdue summaries & executive reports."
    },
    {
        icon: ScanFace,
        title: "Face Recognition & Attendance",
        desc: "GPS-validated Face attendance logging & automated absentee alerts."
    },
    {
        icon: CreditCard,
        title: "Smart Fee & Finance Management",
        desc: "Automated digital receipts, dynamic fee structures, online collections & ledger trails."
    },
    {
        icon: CalendarDays,
        title: "Academics & Timetable Engine",
        desc: "Conflict-free period scheduling, section assignments & academic-year planners."
    },
    {
        icon: GraduationCap,
        title: "Examinations & Digital Report Cards",
        desc: "Grade distribution, topper tracking, remarks workflows & auto-generated marksheets."
    },
    {
        icon: Bus,
        title: "Transport & Bus Fleet",
        desc: "Multi-stop route mapping, student-to-bus allocation & driver safety logs."
    },
    {
        icon: BookOpenCheck,
        title: "Homework & Continuous Learning",
        desc: "Subject-wise homework distribution, digital submissions & teacher review approval."
    },
    {
        icon: BellRing,
        title: "Targeted Broadcasts & FCM Push",
        desc: "Instant circular distribution with PDF attachments to classes, staff, or parents."
    },
    {
        icon: PackageCheck,
        title: "Inventory & Campus Store Control",
        desc: "Uniforms, books, multi-store stock tracking and student purchase records."
    },
    {
        icon: ShieldCheck,
        title: "Staff HR & 40+ Role-Based Security",
        desc: "Leave tracking, staff credentials, and fine-grained permissions across 10 roles."
    }
]

export default function Pricing() {
    const navigate = useNavigate()

    return (
        <section id="pricing-section" className="relative py-5 sm:py-10 lg:py-15 overflow-hidden bg-theme-bg text-theme-text transition-colors duration-300">

            {/* Ambient Background Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute -top-10 left-1/2 -translate-x-1/2 w-[720px] h-[450px] rounded-full opacity-20 blur-[130px]"
                    style={{ background: 'radial-gradient(circle, #00C9B1 0%, #F5A623 50%, transparent 70%)' }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">

                {/* Section Header */}
                <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#00C9B1]/30 bg-[#00C9B1]/10 text-[#00C9B1] text-xs font-semibold uppercase tracking-wider mb-4">
                        <Sparkles size={13} className="animate-pulse" /> 100% Transparent Pricing
                    </span>

                    <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight">
                        One Powerful ERP. <br className="hidden sm:inline" />
                        <span className="text-grad-teal-gold">One Simple Flat Price.</span>
                    </h2>

                    <p className="mt-4 text-theme-subtext text-sm sm:text-base lg:text-lg leading-relaxed">
                        No hidden setup costs, no modular lock-ins, and no tier restrictions. Every single feature is unlocked for your entire school from day one.
                    </p>
                </div>

                {/* Main Showcase Hero Card */}
                <div className="relative rounded-3xl border border-theme-border/80 bg-gradient-to-br from-theme-card/85 via-theme-card/45 to-theme-card/80 backdrop-blur-2xl p-6 sm:p-10 lg:p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] mb-12 overflow-hidden">

                    {/* Top Accent Gradient Bar */}
                    <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00C9B1] via-[#00B8C8] to-[#F5A623]" />

                    <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 pb-10 border-b border-theme-border/60">

                        {/* Price Tag Details */}
                        <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#F5A623] bg-[#F5A623]/10 px-3 py-1 rounded-md mb-3 border border-[#F5A623]/30">
                                <Zap size={13} className="fill-current" /> All-Inclusive School Pass
                            </div>

                            <div className="flex items-baseline gap-2">
                                <span className="font-heading font-extrabold text-5xl sm:text-6xl lg:text-7xl text-theme-text tracking-tight">
                                    ₹10
                                </span>
                                <div className="text-left">
                                    <p className="text-sm sm:text-base font-bold text-theme-text leading-tight">/ student</p>
                                    <p className="text-xs text-theme-subtext">per month (flat fee)</p>
                                </div>
                            </div>

                            <p className="text-xs sm:text-sm text-theme-subtext mt-3 max-w-md">
                                Zero setup fees • Unlimited teachers & staff accounts included • Android & iOS apps unlocked.
                            </p>
                        </div>

                        {/* Quick Inclusions + Primary CTA */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-4 w-full lg:w-auto">
                            {/* <div className="flex flex-wrap justify-center lg:justify-end gap-2 text-xs text-theme-subtext font-medium">
                                <span className="px-3 py-1.5 rounded-lg bg-theme-bg/60 border border-theme-border/70 flex items-center gap-1.5">
                                    <Check size={14} className="text-[#00C9B1]" /> Free Cloud Hosting
                                </span>
                                <span className="px-3 py-1.5 rounded-lg bg-theme-bg/60 border border-theme-border/70 flex items-center gap-1.5">
                                    <Check size={14} className="text-[#00C9B1]" /> 24/7 Tech Onboarding
                                </span>
                            </div> */}

                            <button
                                onClick={() => navigate('/contact')}
                                className="group relative overflow-hidden flex items-center justify-center gap-2.5 w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#00D9C8] text-slate-950 font-heading font-bold text-sm sm:text-base tracking-wide shadow-[0_4px_24px_rgba(0,201,177,0.35)] hover:shadow-[0_8px_32px_rgba(0,201,177,0.5)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300 cursor-pointer"
                            >
                                <span>Get Started at ₹10</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>

                    </div>

                    {/* Modules Grid (Brochure Modules Included at ₹10) */}
                    <div className="pt-8">
                        <div className="flex items-center justify-between gap-4 mb-6">
                            <p className="text-xs sm:text-sm font-bold uppercase tracking-wider text-theme-subtext">
                                Everything Included In Your ₹10 Plan:
                            </p>
                            <span className="text-xs font-semibold text-[#00C9B1] bg-[#00C9B1]/10 px-2.5 py-0.5 rounded-full border border-[#00C9B1]/20">
                                10+ Enterprise Modules
                            </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                            {modulesList.map((item, idx) => {
                                const IconComponent = item.icon
                                return (
                                    <div
                                        key={idx}
                                        className="flex items-start gap-3 p-3.5 rounded-2xl bg-theme-bg/40 border border-theme-border/60 hover:border-[#00C9B1]/50 hover:bg-theme-bg/70 transition-all duration-200 group"
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-[#00C9B1]/15 text-[#00C9B1] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            <IconComponent size={17} />
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="text-xs sm:text-sm font-bold text-theme-text group-hover:text-[#00C9B1] transition-colors truncate">
                                                {item.title}
                                            </h4>
                                            <p className="text-[11px] text-theme-subtext line-clamp-2 mt-0.5 leading-snug">
                                                {item.desc}
                                            </p>
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