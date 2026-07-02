import { useState, useEffect } from 'react'
import { Download, Star } from 'lucide-react'
import Dashboard_anim from './Dashboard_anim'
import Text_animate from './Text_animate'
import Mockups from '../../Components/Homes/Mockups/Mockups' // Correctly importing your specified component

export default function Header() {
    const [mounted, setMounted] = useState(false)
    // State to track if user triggered the slide explore
    const [hasExplored, setHasExplored] = useState(false)
    
    useEffect(() => { setMounted(true) }, [])

    // Added the requested high-performance scroll target function 
    const handleExploreScroll = () => {
        setHasExplored(true)
        
        // Timeout ensures dynamic states stabilize before triggering viewport slide
        setTimeout(() => {
            const targetElement = document.getElementById('mockups-section')
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start', // Instantly centers screen view cleanly at target beginning
                })
            }
        }, 50)
    }

    return (
        <div className="relative overflow-hidden font-body flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">
            
            {/* Ambient Animated Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute rounded-full opacity-[0.38] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(0, 201, 177, 0.1) 50%, transparent 70%)', top: '-15%', left: '-12%', animation: 'floatUpDown 14s ease-in-out infinite' }} />
                <div className="absolute rounded-full opacity-[0.32] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(124, 106, 247, 0.2) 50%, transparent 70%)', bottom: '-15%', right: '-12%', animation: 'floatUpDown 16s ease-in-out infinite alternate' }} />
            </div>

            {/* HERO ROW */}
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-4 px-6 sm:px-10 xl:px-16 pt-10 sm:pt-8 pb-0 w-full max-w-350 mx-auto">

                {/* LEFT: Text Block */}
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
                        </button>
                        <button className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-theme-card border border-theme-border text-theme-text font-medium text-[14px] sm:text-[15px] rounded-2xl hover:bg-theme-border/20 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                            <Download size={14} className="text-gold" /> Brochure
                        </button>
                    </div>
                </div>

                {/* RIGHT: Dashboard Graphic Visual */}
                <div 
                    className={`w-full lg:flex-1 flex items-center justify-center lg:justify-end relative overflow-hidden sm:overflow-visible transition-all duration-1000 ease-out ${
                        hasExplored 
                        ? 'translate-y-0 opacity-100 scale-100 filter drop-shadow-[0_0_50px_rgba(0,210,185,0.15)]' 
                        : 'lg:translate-y-8 opacity-90 lg:scale-95'
                    }`}
                >
                    <div className="absolute pointer-events-none" style={{
                        width: '380px', height: '380px',
                        background: 'radial-gradient(ellipse, rgba(0,201,177,0.12) 0%, rgba(245,166,35,0.04) 50%, transparent 70%)',
                        filter: 'blur(55px)',
                        zIndex: 0,
                    }} />
                    <div className="relative z-10 w-full" style={{ maxWidth: '520px' }}>
                        <Dashboard_anim />
                    </div>
                </div>
            </div>

            {/* Scroll Indicator button connected to handleExploreScroll */}
            <div 
                onClick={handleExploreScroll} 
                className="flex flex-col items-center mt-9 mb-12 relative z-10 group cursor-pointer"
            >
                <span className="text-[11px] tracking-widest uppercase font-semibold text-theme-subtext group-hover:text-teal transition-colors duration-300 select-none">
                    Explore More
                </span>
                <div className="relative mt-3 w-7 h-11 rounded-full border border-theme-border bg-theme-card backdrop-blur-md flex items-start justify-center p-1 shadow-[inset_0_0_8px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.4)] group-hover:border-teal/50 transition-colors duration-300">
                    <div className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-teal-light to-teal-dark animate-[scrollDot_1.4s_ease-in-out_infinite] shadow-[0_0_8px_rgba(0,201,177,0.6)]" />
                </div>
            </div>

            {/* Dedicated downstream container holding Mockups showcase view */}
            <div className="w-full relative z-20">
                <Mockups />
            </div>

        </div>
    )
}