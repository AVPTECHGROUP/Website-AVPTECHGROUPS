import { useState, useEffect } from 'react'
import { Download, Star } from 'lucide-react'
import Dashboard_anim from './Dashboard_anim'
import Text_animate from './Text_animate'
import Mockups from '../../Components/Homes/Mockups/Mockups'
import { useNavigate } from 'react-router-dom'

export default function Header() {
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false);
    const [hasExplored, setHasExplored] = useState(false)
    const navigate = useNavigate();

    useEffect(() => { setMounted(true) }, [])

    // High-performance scroll target function 
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
    const handleNavLinkClick = (link) => {
        setMenuOpen(false);
        if (link === "Book A Demo") {
            navigate("/contact");
        }
    };

    const features = [
        "Smart ERP Operations",
        "Unified Communication",
        "Real-Time Analytics",
        "Secure Cloud Platform",
    ];

    // Premium Schools Dataset (Updated with new entries & logos removed)
    const trustedSchools = [
        { name: "Delhi Public International School" },
        { name: "RAV Public School" },
        { name: "St. Xavier's School" },
        { name: "RLB School" },
        { name: "Shyam Children Public School" },
        { name: "Rama Public School" },
        { name: "KBMA School" }
    ];

    return (
        <div className="relative overflow-hidden font-body flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">

            {/* Inline CSS injecting premium marquee behavior instantly */}
            <style>{`
                @keyframes marqueeLeft {
                    0% { transform: translate3d(0, 0, 0); }
                    100% { transform: translate3d(-50%, 0, 0); }
                }
                .animate-marquee-premium {
                    display: flex;
                    width: max-content;
                    animation: marqueeLeft 35s linear infinite;
                }
                .animate-marquee-premium:hover {
                    animation-play-state: paused;
                }
            `}</style>

            {/* Ambient Animated Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute rounded-full opacity-[0.38] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(0, 201, 177, 0.1) 50%, transparent 70%)', top: '-15%', left: '-12%', animation: 'floatUpDown 14s ease-in-out infinite' }} />
                <div className="absolute rounded-full opacity-[0.32] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(124, 106, 247, 0.2) 50%, transparent 70%)', bottom: '-15%', right: '-12%', animation: 'floatUpDown 16s ease-in-out infinite alternate' }} />
            </div>

            {/* MAIN HERO WRAPPER CONTAINER */}
            <div className="relative z-10 flex flex-col w-full max-w-350 mx-auto px-6 sm:px-10 xl:px-16 pt-10 sm:pt-8 pb-0">

                {/* TOP HERO ROW: Content Split */}
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 w-full">

                    {/* LEFT: Text Block */}
                    <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full lg:w-[48%] xl:w-[44%]">
                        <div className="animate-[fadeUp_0.9s_0.1s_ease_both]">
                            <span className="inline-flex items-center gap-2 bg-theme-card border border-theme-border backdrop-blur-md rounded-full px-4 py-1.5 text-gold text-[11px] font-semibold tracking-widest uppercase">
                                <Star size={12} fill="currentColor" className="text-gold" /> Recognized by Startup India
                            </span>
                        </div>

                        {/* MOBILE OPTIMIZED HEADLINE & SPACING */}
                        <div className="mt-4 w-full animate-[fadeUp_0.9s_0.2s_ease_both]">
                            <h1 className="font-heading font-bold text-[28px] leading-[1.25] sm:text-5xl lg:text-4xl xl:text-5xl sm:leading-tight lg:leading-tight xl:leading-tight">
                                <span className="block text-theme-text">The Operating System</span>
                                <span className="text-theme-text"> for</span> <span className='text-grad-teal-gold'> Modern Schools.</span>
                            </h1>
                            {/* Adjusted padding/margin spacing on mobile to prevent overlapping */}
                            <div className="flex items-center justify-center lg:justify-start mt-4 min-h-[32px]">
                                <Text_animate />
                            </div>
                        </div>

                        <p className="mt-4 text-[14px] sm:text-[15px] md:text-[18px] lg:text-[15px] xl:text-[18px] font-medium leading-relaxed text-theme-subtext max-w-sm lg:max-w-none animate-[fadeUp_0.9s_0.28s_ease_both]">
                            Manage everything. Connect everyone. <span className='block lg:inline xl:block'>Grow beyond limits.</span>
                        </p>

                        {/* Responsive 4-Point Feature Grid */}
                        <div className="mt-5 grid grid-cols-2 gap-y-3 w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 text-left animate-[fadeUp_0.9s_0.34s_ease_both]">
                            {features.map((feature) => (
                                <div
                                    key={feature}
                                    className="flex items-center gap-2 text-theme-subtext text-[13px] sm:text-[14px] md:text-[15px] lg:text-[13px] xl:text-[15px] font-medium"
                                >
                                    <div className="w-5 h-5 sm:w-6 sm:h-6 lg:w-5 lg:h-5 xl:w-6 xl:h-6 rounded-full bg-teal-dark flex items-center justify-center shrink-0 shadow-sm">
                                        <svg
                                            className="w-3 h-3 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                            strokeWidth="3"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                    <span>{feature}</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-wrap items-center gap-3 mt-6 justify-center lg:justify-start animate-[fadeUp_0.9s_0.4s_ease_both]">
                            <button
                                onClick={() => handleNavLinkClick("Book A Demo")}
                                className="relative overflow-hidden flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#00D9C8] text-slate-950 font-semibold text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(0,201,177,0.45),0_8px_32px_rgba(0,201,177,0.28)] hover:shadow-[0_0_0_1px_rgba(0,201,177,0.65),0_12px_40px_rgba(0,201,177,0.42)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                            >
                                <div className="shimmer-effect" />
                                <span className="relative z-10 flex items-center gap-2 font-heading">
                                    Book A Demo
                                </span>
                            </button>
                            <a
                                href="/brochure/SchoolSpine-Brochure.pdf"
                                download="SchoolSpine-Brochure.pdf"
                                className="relative overflow-hidden inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0D1626] border-2 border-[#F5A623] text-[#F5A623] font-medium text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(245,166,35,0.25),0_8px_32px_rgba(0,0,0,0.35)] hover:bg-[#142036] hover:shadow-[0_0_0_1px_rgba(245,166,35,0.45),0_12px_40px_rgba(245,166,35,0.18)] hover:-translate-y-0.5 transition-all duration-300 group"
                            >
                                <Download
                                    size={14}
                                    className="text-[#F5A623] group-hover:scale-110 transition-transform duration-300"
                                />
                                <span>Brochure</span>
                            </a>
                        </div>
                    </div>

                    {/* RIGHT: Dashboard Graphic Visual */}
                    <div
                        className={`w-full lg:flex-1 flex items-center justify-center lg:justify-end relative overflow-hidden sm:overflow-visible transition-all duration-1000 ease-out ${hasExplored
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

            </div>

            {/* Scroll Indicator button connected to handleExploreScroll */}
            <div
                onClick={handleExploreScroll}
                className="flex flex-col items-center mt-9 mb-10 relative z-10 group cursor-pointer"
            >
                <span className="text-[11px] tracking-widest uppercase font-semibold text-theme-subtext group-hover:text-teal transition-colors duration-300 select-none">
                    Explore More
                </span>
                <div className="relative mt-3 w-7 h-11 rounded-full border border-theme-border bg-theme-card backdrop-blur-md flex items-start justify-center p-1 shadow-[inset_0_0_8px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.4)] group-hover:border-teal/50 transition-colors duration-300">
                    <div className="w-1.5 h-2.5 rounded-full bg-gradient-to-b from-teal-light to-teal-dark animate-[scrollDot_1.4s_ease-in-out_infinite] shadow-[0_0_8px_rgba(0,201,177,0.6)]" />
                </div>
            </div>

            {/* PLACED AFTER EXPLORE MORE: PREMIUM MARQUEE TRUST BANNER */}
            <div className="w-full max-w-350 mx-auto px-6 sm:px-10 xl:px-16 mb-16 animate-[fadeUp_0.9s_0.2s_ease_both] flex flex-col items-center relative z-10">

                {/* Floating Label perfectly structured above the line */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-bg px-4 z-20 transition-colors duration-300">
                    <p className="text-center text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-theme-subtext/90 whitespace-nowrap select-none">
                        Trusted by schools across India
                    </p>
                </div>

                {/* Premium Glass Showcase Container with Hidden Overflow */}
                <div className="w-full relative overflow-hidden bg-gradient-to-r from-theme-card/10 via-theme-card/40 to-theme-card/10 border border-theme-border/60 backdrop-blur-xl rounded-2xl py-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.15)] hover:border-theme-border/90 transition-all duration-300">

                    {/* Premium Edge Fades Overlay (Left/Right Blur Mask) */}
                    <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />
                    <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />

                    {/* Infinite Marquee Track Container */}
                    <div className="animate-marquee-premium flex items-center">

                        {/* Rendered Twice for a Flawless Endless Dynamic Flow */}
                        {[...trustedSchools, ...trustedSchools].map((school, index) => (
                            <div key={index} className="flex items-center shrink-0">
                                <div
                                    className="flex items-center group transition-all duration-300 cursor-pointer px-8 sm:px-12"
                                >
                                    {/* Premium Typography Showcase Tag */}
                                    <span className="text-[14px] sm:text-[16px] font-heading font-medium text-theme-text/75 tracking-wider leading-snug group-hover:text-[#00C9B1] group-hover:scale-[1.03] transition-all duration-300 whitespace-nowrap">
                                        {school.name}
                                    </span>
                                </div>

                                {/* Teal Light Color Divider Line */}
                                <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-[#00C9B1]/45 to-transparent shadow-[0_0_4px_rgba(0,201,177,0.2)]" />
                            </div>
                        ))}

                    </div>
                </div>
            </div>

            {/* Dedicated downstream container holding Mockups showcase view */}
            <div className="w-full relative z-20">
                <div id="mockups-section">
                    <Mockups />
                </div>
            </div>

        </div>
    )
}