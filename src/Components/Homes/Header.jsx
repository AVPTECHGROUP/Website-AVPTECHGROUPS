import { useState, useEffect } from 'react'
import { Download, Star, CreditCard, FileText, ClipboardCheck, ShoppingBag, Bus, BookOpen } from 'lucide-react'
import Dashboard_anim from './Dashboard_anim'
import Text_animate from './Text_animate'

const SCHOOLS = [
    'Delhi Public School', 'Sunrise Academy', "St. Mary's Convent",
    'Modern High School', 'Ryan International', 'Greenfield Academy',
    'Orchid International', 'Cambridge School',
]

const colorMap = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-500', childBorder: 'border-teal-100' },
    gold: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', childBorder: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', childBorder: 'border-purple-100' },
    coral: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500', childBorder: 'border-rose-100' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', childBorder: 'border-blue-100' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', childBorder: 'border-emerald-100' },
}

export default function Header() {
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    return (
        <div className="relative overflow-hidden font-body flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">
            
            {/* Ambient Animated Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute rounded-full opacity-[0.38] blur-[120px]"
                    style={{
                        width: '750px',
                        height: '750px',
                        background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(0, 201, 177, 0.1) 50%, transparent 70%)',
                        top: '-15%',
                        left: '-12%',
                        animation: 'floatUpDown 14s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute rounded-full opacity-[0.32] blur-[120px]"
                    style={{
                        width: '750px',
                        height: '750px',
                        background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(124, 106, 247, 0.2) 50%, transparent 70%)',
                        bottom: '-15%',
                        right: '-12%',
                        animation: 'floatUpDown 16s ease-in-out infinite alternate',
                    }}
                />
                <div
                    className="absolute rounded-full opacity-[0.25] blur-[100px]"
                    style={{
                        width: '550px',
                        height: '550px',
                        background: 'radial-gradient(circle, rgba(245, 166, 35, 0.35) 0%, transparent 70%)',
                        top: '20%',
                        right: '20%',
                        animation: 'floatUpDown 11s ease-in-out infinite',
                    }}
                />
            </div>

            {/* HERO ROW */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 px-6 sm:px-10 xl:px-16 pt-10 sm:pt-14 pb-0 w-full max-w-350 mx-auto">

                {/* LEFT: Text */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full lg:w-[46%] xl:w-[44%]">

                    <div className="animate-[fadeUp_0.9s_0.1s_ease_both]">
                        <span className="inline-flex items-center gap-2 bg-theme-card border border-theme-border backdrop-blur-md rounded-full px-4 py-1.5 text-gold text-[11px] font-semibold tracking-widest uppercase">
                            <Star size={12} fill="currentColor" className="text-gold" /> Recognized by Startup India
                        </span>
                    </div>

                    <div className="mt-4 animate-[fadeUp_0.9s_0.2s_ease_both]">
                        <h1 className="font-heading font-bold text-4xl text-nowrap sm:text-5xl lg:text-5xl xl:text-6xl leading-tight">
                            <span className="block text-theme-text">Run Your School.</span>
                            <span className="block text-grad-teal-gold animate-text-glow">Not Spreadsheets.</span>
                        </h1>
                        <div className="flex items-center justify-center lg:justify-start mt-1">
                            <Text_animate />
                        </div>
                    </div>

                    <p className="mt-3 text-[14px] sm:text-[15px] md:text-[16px] font-light leading-relaxed text-theme-subtext max-w-sm lg:max-w-none animate-[fadeUp_0.9s_0.28s_ease_both]">
                        The all-in-one platform that automates admissions, attendance, fees &amp; exams — so your staff focuses on students, not paperwork.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-6 justify-center lg:justify-start animate-[fadeUp_0.9s_0.35s_ease_both]">
                        <button className="relative overflow-hidden flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-teal-dark to-teal text-white font-semibold text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(0,201,177,0.4),0_8px_32px_rgba(0,201,177,0.25)] hover:shadow-[0_0_0_1px_rgba(0,201,177,0.6),0_12px_40px_rgba(0,201,177,0.4)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group animate-heartbeat">
                            <span className="relative z-10 flex items-center gap-2">Start Free Trial <span>→</span></span>
                            <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                        <button className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-theme-card border border-theme-border text-theme-text font-medium text-[14px] sm:text-[15px] rounded-2xl hover:bg-theme-border/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                            <Download size={14} className="text-gold" /> Brochure
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 mt-5 justify-center lg:justify-start animate-[fadeUp_0.9s_0.45s_ease_both]">
                        {[
                            { dot: 'teal', label: '100+ Schools' },
                            { dot: 'teal', label: '900+ Active Users' },
                            { dot: 'gold', label: 'Free Mobile Apps' },
                            { dot: 'gold', label: '4.9 ★ Rating' },
                        ].map((s, i) => (
                            <span key={i} className="flex items-center gap-2 bg-theme-card border border-theme-border backdrop-blur-md rounded-full px-3.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-theme-subtext hover:bg-theme-border/20 transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.15)]">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot === 'teal' ? 'bg-teal shadow-[0_0_8px_#00C9B1]' : 'bg-gold shadow-[0_0_8px_#F5A623]'} animate-pulse`} />
                                {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Dashboard animation */}
                <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end animate-[fadeUp_1s_0.5s_ease_both] relative overflow-hidden sm:overflow-visible">
                    <div className="absolute pointer-events-none" style={{
                        width: '380px', height: '380px',
                        background: 'radial-gradient(ellipse, rgba(0,201,177,0.09) 0%, rgba(245,166,35,0.04) 50%, transparent 70%)',
                        filter: 'blur(55px)',
                        zIndex: 0,
                    }} />
                    <div className="relative z-10 w-full" style={{ maxWidth: '520px' }}>
                        <Dashboard_anim />
                    </div>
                </div>
            </div>

            {/* Scroll indicator */}
            <div className="flex flex-col items-center mt-9 mb-6 animate-[fadeUp_1s_0.65s_ease_both] relative z-10">
                <span className="text-[11px] tracking-widest uppercase font-semibold text-theme-subtext">
                    Explore More
                </span>
                <div className="relative mt-3 w-7 h-11 rounded-full border border-theme-border bg-theme-card backdrop-blur-md flex items-start justify-center p-1 shadow-[inset_0_0_8px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="w-1.5 h-2.5 rounded-full bg-linear-to-b from-teal-light to-teal-dark animate-[scrollDot_1.4s_ease-in-out_infinite] shadow-[0_0_8px_rgba(0,201,177,0.6)]" />
                </div>
            </div>

        </div>
    )
}