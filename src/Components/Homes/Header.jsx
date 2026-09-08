import { useState, useEffect, useCallback } from 'react'
import { Download, Star } from 'lucide-react'
import Dashboard_anim from './Dashboard_anim'
import Text_animate from './Text_animate'
import Mockups from '../../Components/Homes/Mockups/Mockups'
import { useNavigate } from 'react-router-dom'

// Carousel image assets
import crousel2 from '../../assets/Images/crousel/2nd_cr.png'
import crousel3 from '../../assets/Images/crousel/3rd_crousel.png'
import crousel4 from '../../assets/Images/crousel/4th_crousel.png'
import crousel5 from '../../assets/Images/crousel/5th_cr.png'
import logosImg from '../../assets/Images/crousel/logos.png'

export default function Header() {
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [hasExplored, setHasExplored] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)
    const navigate = useNavigate()

    useEffect(() => { setMounted(true) }, [])

    // 5 Carousel Slides with optimized sizing
    const slides = [
        {
            id: 1,
            tag: "Recognized by Startup India",
            hasStar: true,
            titleFirst: "The Operating System",
            titleSecond: "for",
            highlight: "Modern Schools.",
            hasTextAnimate: true,
            description: "Manage everything. Connect everyone. Grow beyond limits.",
            features: [
                "Smart ERP Operations",
                "Unified Communication",
                "Real-Time Analytics",
                "Secure Cloud Platform"
            ],
            type: "component",
            showLogos: true
        },
        {
            id: 2,
            tag: "SchoolSpine Mobile",
            hasStar: false,
            titleFirst: "Connected Schools.",
            titleSecond: "",
            highlight: "Happier Communities.",
            hasTextAnimate: false,
            description: "Keep teachers, parents and students connected every day.",
            features: [
                "Parent & Teacher Engagement",
                "Attendance & Homework Updates",
                "Instant School Notifications",
                "Easy Access to School Activities"
            ],
            type: "image",
            image: crousel2,
            sizeClass: "max-h-[380px] sm:max-h-[430px] lg:max-h-[460px]",
            showLogos: true
        },
        {
            id: 3,
            tag: "SchoolSpine",
            hasStar: false,
            titleFirst: "Everyone Connected.",
            titleSecond: "",
            highlight: "Everything Simplified.",
            hasTextAnimate: false,
            description: "Bring administrators, teachers, parents and students together on one platform.",
            features: [
                "Manage Classes & Academics",
                "Track Attendance Effortlessly",
                "Stay Connected with Notifications",
                "Access Reports & School Updates"
            ],
            type: "image",
            image: crousel3,
            sizeClass: "max-h-[420px] sm:max-h-[480px] lg:max-h-[510px]",
            showLogos: true
        },
        {
            id: 4,
            tag: "SchoolSpine Admin",
            hasStar: false,
            titleFirst: "One Platform.",
            titleSecond: "",
            highlight: "Complete School Control.",
            hasTextAnimate: false,
            description: "Manage people. Monitor performance. Run your school smarter.",
            features: [
                "Centralized School Management",
                "Staff & Teacher Management",
                "Real-Time School Analytics",
                "Simplified Admin Operations"
            ],
            type: "image",
            image: crousel4,
            sizeClass: "max-h-[380px] sm:max-h-[430px] lg:max-h-[460px]",
            showLogos: true
        },
        {
            id: 5,
            tag: "SchoolSpine ERP",
            hasStar: false,
            titleFirst: "Smart Management",
            titleSecond: "for",
            highlight: "Modern Schools.",
            hasTextAnimate: false,
            description: "Manage resources. Track transport. Simplify attendance.",
            features: [
                "Smart Inventory Management",
                "Live Transport Tracking",
                "Real-Time Attendance",
                "Secure School Operations"
            ],
            type: "image",
            image: crousel5,
            sizeClass: "max-h-[430px] sm:max-h-[480px] lg:max-h-[520px] w-full max-w-[500px]",
            showLogos: true
        }
    ]

    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length)
    }, [slides.length])

    useEffect(() => {
        const timer = setInterval(() => {
            nextSlide()
        }, 3000)
        return () => clearInterval(timer)
    }, [nextSlide])

    const handleExploreScroll = () => {
        setHasExplored(true)
        setTimeout(() => {
            const targetElement = document.getElementById('mockups-section')
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                })
            }
        }, 50)
    }

    const handleNavLinkClick = (link) => {
        setMenuOpen(false)
        if (link === "Book A Demo") {
            navigate("/contact")
        }
    }

    const trustedSchools = [
        { name: "Delhi Public International School" },
        { name: "RAV Public School" },
        { name: "St. Xavier's School" },
        { name: "RLB School" },
        { name: "Shyam Children Public School" },
        { name: "Rama Public School" },
        { name: "KBMA School" }
    ]

    return (
        <div className="relative overflow-hidden font-body flex flex-col bg-theme-bg text-theme-text transition-colors duration-300">

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
                @keyframes heroFadeIn {
                    0% { opacity: 0; transform: translateY(8px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-hero-slide {
                    animation: heroFadeIn 0.45s ease-out both;
                }
                @keyframes gentleBounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .animate-gentle-bounce {
                    animation: gentleBounce 3.4s ease-in-out infinite;
                }
            `}</style>

            {/* Ambient Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute rounded-full opacity-[0.38] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(0, 201, 177, 0.1) 50%, transparent 70%)', top: '-15%', left: '-12%', animation: 'floatUpDown 14s ease-in-out infinite' }} />
                <div className="absolute rounded-full opacity-[0.32] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(124, 106, 247, 0.2) 50%, transparent 70%)', bottom: '-15%', right: '-12%', animation: 'floatUpDown 16s ease-in-out infinite alternate' }} />
            </div>

            {/* MAIN HERO CAROUSEL CONTAINER */}
            <div className="relative z-10 flex flex-col w-full max-w-350 mx-auto px-6 sm:px-10 xl:px-16 pt-8 sm:pt-8 pb-0">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-6 w-full min-h-[550px]">

                    {/* LEFT SIDE: Portrait Indicators Beside the Text Content */}
                    <div className="flex items-start gap-3 sm:gap-5 w-full lg:w-[48%] xl:w-[46%]">

                        {/* Portrait Carousel Indicators (HIDDEN ON MOBILE via hidden sm:flex) */}
                        <div className="hidden sm:flex flex-col items-center gap-2 pt-12 sm:pt-14 shrink-0">
                            {slides.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSlide(idx)}
                                    aria-label={`Slide ${idx + 1}`}
                                    className={`transition-all duration-300 rounded-full cursor-pointer ${activeSlide === idx
                                        ? 'w-2 sm:w-2.5 h-7 sm:h-8 bg-gradient-to-b from-[#00C9B1] to-[#00B8C8] shadow-[0_0_10px_rgba(0,201,177,0.7)]'
                                        : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-theme-subtext/35 hover:bg-theme-subtext/70'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Text Content Block */}
                        <div key={`text-${activeSlide}`} className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full animate-hero-slide">
                            <div>
                                <span className="inline-flex items-center gap-2 bg-theme-card border border-theme-border backdrop-blur-md rounded-full px-4 py-1.5 text-gold text-[11px] font-semibold tracking-widest uppercase">
                                    {slides[activeSlide].hasStar && <Star size={12} fill="currentColor" className="text-gold" />}
                                    {slides[activeSlide].tag}
                                </span>
                            </div>

                            <div className="mt-4 w-full">
                                <h1 className="font-heading font-bold text-[28px] leading-[1.25] sm:text-5xl lg:text-4xl xl:text-5xl sm:leading-tight lg:leading-tight xl:leading-tight">
                                    <span className="block text-theme-text">{slides[activeSlide].titleFirst}</span>
                                    {slides[activeSlide].titleSecond && (
                                        <span className="text-theme-text"> {slides[activeSlide].titleSecond} </span>
                                    )}
                                    <span className='text-grad-teal-gold'> {slides[activeSlide].highlight}</span>
                                </h1>

                                {slides[activeSlide].hasTextAnimate && (
                                    <div className="flex items-center justify-center lg:justify-start mt-4 min-h-[32px]">
                                        <Text_animate />
                                    </div>
                                )}
                            </div>

                            <p className="mt-4 text-[14px] sm:text-[15px] md:text-[18px] lg:text-[15px] xl:text-[18px] font-medium leading-relaxed text-theme-subtext max-w-sm lg:max-w-none">
                                {slides[activeSlide].description}
                            </p>

                            <div className="mt-5 grid grid-cols-2 gap-y-3 w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 text-left">
                                {slides[activeSlide].features.map((feature, idx) => (
                                    <div
                                        key={idx}
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
                                        <span className="leading-snug">{feature}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Buttons */}
                            <div className="flex flex-wrap items-center gap-3 mt-6 justify-center lg:justify-start">
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

                            {/* Logos section */}
                            {slides[activeSlide].showLogos && (
                                <div className="mt-7 w-full max-w-sm sm:max-w-md flex justify-center lg:justify-start animate-[fadeUp_0.6s_ease_both]">
                                    <img
                                        src={logosImg}
                                        alt="SchoolSpine Recognitions & Accreditations"
                                        className="w-full max-w-47.5 sm:max-w-52.5 md:max-w-60 h-auto object-contain drop-shadow-sm select-none"
                                    />
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT SIDE: Visual Showcase */}
                    <div
                        className={`w-full lg:flex-1 flex items-center justify-center lg:justify-end relative overflow-visible transition-all duration-700 ease-out ${hasExplored
                            ? 'translate-y-0 opacity-100 scale-100 filter drop-shadow-[0_0_50px_rgba(0,210,185,0.15)]'
                            : 'lg:translate-y-2 opacity-100'
                            }`}
                    >
                        {/* Ambient Glow */}
                        <div className="absolute pointer-events-none" style={{
                            width: '440px', height: '440px',
                            background: 'radial-gradient(ellipse, rgba(0,201,177,0.18) 0%, rgba(245,166,35,0.06) 50%, transparent 70%)',
                            filter: 'blur(60px)',
                            zIndex: 0,
                        }} />

                        {/* Unclipped Image Holder */}
                        <div
                            key={`visual-${activeSlide}`}
                            className="relative z-10 w-full flex items-center justify-center animate-hero-slide py-2 px-1"
                            style={{ maxWidth: '560px', minHeight: '440px' }}
                        >
                            {slides[activeSlide].type === "component" ? (
                                <div className="w-full animate-gentle-bounce">
                                    <Dashboard_anim />
                                </div>
                            ) : (
                                <div className="w-full flex items-center justify-center animate-gentle-bounce">
                                    <img
                                        src={slides[activeSlide].image}
                                        alt={slides[activeSlide].highlight}
                                        className={`h-auto max-w-full object-contain drop-shadow-[0_15px_35px_rgba(0,201,177,0.18)] transition-transform duration-300 hover:scale-[1.02] select-none ${slides[activeSlide].sizeClass}`}
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            {/* Explore More Scroll Indicator */}
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

            {/* MARQUEE TRUST BANNER */}
            <div className="w-full max-w-350 mx-auto px-6 sm:px-10 xl:px-16 mb-16 animate-[fadeUp_0.9s_0.2s_ease_both] flex flex-col items-center relative z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-bg px-4 z-20 transition-colors duration-300">
                    <p className="text-center text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-theme-subtext/90 whitespace-nowrap select-none">
                        Trusted by schools across India
                    </p>
                </div>

                <div className="w-full relative overflow-hidden bg-gradient-to-r from-theme-card/10 via-theme-card/40 to-theme-card/10 border border-theme-border/60 backdrop-blur-xl rounded-2xl py-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.15)] hover:border-theme-border/90 transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />
                    <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />

                    <div className="animate-marquee-premium flex items-center">
                        {[...trustedSchools, ...trustedSchools].map((school, index) => (
                            <div key={index} className="flex items-center shrink-0">
                                <div className="flex items-center group transition-all duration-300 cursor-pointer px-8 sm:px-12">
                                    <span className="text-[14px] sm:text-[16px] font-heading font-medium text-theme-text/75 tracking-wider leading-snug group-hover:text-[#00C9B1] group-hover:scale-[1.03] transition-all duration-300 whitespace-nowrap">
                                        {school.name}
                                    </span>
                                </div>
                                <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-[#00C9B1]/45 to-transparent shadow-[0_0_4px_rgba(0,201,177,0.2)]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Downstream Mockups section */}
            <div className="w-full relative z-20">
                <div id="mockups-section">
                    <Mockups />
                </div>
            </div>

        </div>
    )
}