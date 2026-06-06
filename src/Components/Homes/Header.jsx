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
        <div className="relative overflow-x-hidden font-body flex flex-col bg-[linear-gradient(to_right,#102130,#132939,#152F3F,#173343)] text-white">

            {/* HERO ROW */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 px-6 sm:px-10 xl:px-16 pt-10 sm:pt-14 pb-0 w-full max-w-350 mx-auto">

                {/* LEFT: Text */}
                <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full lg:w-[46%] xl:w-[44%]">

                    <div className="animate-[fadeUp_0.9s_0.1s_ease_both]">
                        <span className="inline-flex items-center gap-2 bg-gold/8 border border-gold/25 rounded-full px-4 py-1.5 text-gold text-[11px] font-medium tracking-widest uppercase">
                            <Star size={12} fill="currentColor" /> Recognized by Startup India
                        </span>
                    </div>

                    <div className="mt-4 animate-[fadeUp_0.9s_0.2s_ease_both]">
                        <h1 className="font-heading font-bold text-4xl text-nowrap sm:text-5xl lg:text-5xl xl:text-6xl leading-tight">
                            <span className="block text-white">Run Your School.</span>
                            <span className="block text-grad-teal-gold">Not Spreadsheets.</span>
                        </h1>
                        <div className="flex items-center justify-center lg:justify-start mt-1">
                            <Text_animate />
                        </div>
                    </div>

                    <p className="mt-3 text-[14px] sm:text-[15px] md:text-[16px] font-light leading-relaxed text-gray-300 max-w-sm lg:max-w-none animate-[fadeUp_0.9s_0.28s_ease_both]">
                        The all-in-one platform that automates admissions, attendance, fees &amp; exams — so your staff focuses on students, not paperwork.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 mt-6 justify-center lg:justify-start animate-[fadeUp_0.9s_0.35s_ease_both]">
                        <button className="flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-linear-to-br from-teal-dark to-teal text-white font-semibold text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(0,201,177,0.4),0_8px_32px_rgba(0,201,177,0.25)] hover:shadow-[0_0_0_1px_rgba(0,201,177,0.6),0_12px_40px_rgba(0,201,177,0.4)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                            Start Free Trial <span>→</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-gold/6 border border-gold/20 text-gold font-medium text-[14px] sm:text-[15px] rounded-2xl hover:bg-gold/12 hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                            <Download size={14} /> Brochure
                        </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-4 justify-center lg:justify-start animate-[fadeUp_0.9s_0.45s_ease_both]">
                        {[
                            { dot: 'teal', label: '100+ Schools' },
                            { dot: 'teal', label: '900+ Active Users' },
                            { dot: 'gold', label: 'Free Mobile Apps' },
                            { dot: 'gold', label: '4.9 ★ Rating' },
                        ].map((s, i) => (
                            <span key={i} className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-full px-3 sm:px-3.5 py-1.5 text-[11px] sm:text-[12px] font-medium text-gray-500">
                                <span className={`w-1.5 h-1.5 rounded-full ${s.dot === 'teal' ? 'bg-teal' : 'bg-gold'}`} />
                                {s.label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Dashboard animation */}
                <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end animate-[fadeUp_1s_0.5s_ease_both] relative overflow-hidden sm:overflow-visible">                    <div className="absolute pointer-events-none" style={{
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
            <div className="flex flex-col items-center mt-9 mb-6 animate-[fadeUp_1s_0.65s_ease_both]">
                <span className="text-[11px] tracking-widest uppercase font-semibold text-gray-100">
                    Explore More
                </span>
                <div className="relative mt-3 w-7 h-11 rounded-full border border-white/30 bg-white/10 backdrop-blur-md flex items-start justify-center p-1 shadow-[inset_0_0_8px_rgba(255,255,255,0.15),0_4px_20px_rgba(0,0,0,0.4)]">
                    <div className="w-1.5 h-2.5 rounded-full bg-linear-to-b from-teal-light to-teal-dark animate-[scrollDot_1.4s_ease-in-out_infinite] shadow-[0_0_8px_rgba(0,201,177,0.6)]" />
                </div>
            </div>

        </div>
    )
}