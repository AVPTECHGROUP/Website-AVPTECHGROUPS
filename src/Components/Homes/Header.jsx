import { useState, useEffect, useCallback, useRef } from 'react'
import { BookOpen, Star } from 'lucide-react'
import CourseTopbar from '../../Pages/SchoolSpineWeb/pages/Coursetopbar'
import { useNavigate } from 'react-router-dom'

// Carousel image assets (AVP Tech Group, transparent PNGs)
import slideSolutions from '../../assets/Images/crousel/avp_carousel_1_it_solutions.png'
import slideTraining from '../../assets/Images/crousel/avp_carousel_2_certification_training.png'
import slideSecurity from '../../assets/Images/crousel/avp_carousel_3_microsoft_security.png'
import slideTeams from '../../assets/Images/crousel/avp_carousel_4_corporate_training_staffing.png'

// Same size for every slide: the images are square, so width drives the height.
const IMAGE_SIZE = "w-full max-w-[420px] sm:max-w-[500px] lg:max-w-[540px]"

// How long each slide stays on screen (ms). The indicator fills over this time.
const SLIDE_MS = 5000

// 4 carousel slides
const slides = [
    {
        id: 1,
        tag: "IT Solutions & Support",
        hasStar: false,
        titleFirst: "One Team.",
        titleSecond: "",
        highlight: "Every IT Solution.",
        description: "Infrastructure, cloud, device management and security, diagnosed and fixed end to end.",
        features: [
            "Cloud & Infrastructure Support",
            "Device & Endpoint Management",
            "Security-First Deployments",
            "Responsive Expert Support"
        ],
        image: slideSolutions
    },
    {
        id: 2,
        tag: "Certification Training",
        hasStar: false,
        titleFirst: "Learn Microsoft.",
        titleSecond: "",
        highlight: "Get Certified.",
        description: "Live, instructor-led courses built around the exams and the real job.",
        features: [
            "36+ Courses & Certifications",
            "Small Batches, 8 Max",
            "Mock & Test Questions",
            "Course Material Included"
        ],
        image: slideTraining
    },
    {
        id: 3,
        tag: "Microsoft Security",
        hasStar: false,
        titleFirst: "Secure Endpoints.",
        titleSecond: "",
        highlight: "Protect Identities.",
        description: "Intune, Defender, Entra ID and Sentinel, deployed and taught by engineers who use them daily.",
        features: [
            "Microsoft Intune & Autopilot",
            "Defender XDR & Endpoint",
            "Entra ID & Access Admin",
            "Sentinel SIEM & SOAR"
        ],
        image: slideSecurity
    },
    {
        id: 4,
        tag: "Corporate Training & Staffing",
        hasStar: false,
        titleFirst: "Skilled People.",
        titleSecond: "",
        highlight: "Ready to Deliver.",
        description: "Private team training on your schedule, plus IT professionals matched to your stack.",
        features: [
            "Tailored Corporate Training",
            "Short & Long-Term Staffing",
            "Certified Trainers & Engineers",
            "Transparent Pricing"
        ],
        image: slideTeams
    }
]

// Technologies from the course catalog, shown in the marquee under the hero
const microsoftExpertise = [
    { name: "Microsoft Intune" },
    { name: "Microsoft Defender XDR" },
    { name: "Microsoft Azure" },
    { name: "Microsoft 365" },
    { name: "Microsoft Sentinel" },
    { name: "Microsoft Entra ID" },
    { name: "Windows Autopilot" },
    { name: "Microsoft SCCM (MECM)" },
    { name: "Microsoft Purview" },
    { name: "Azure Virtual Desktop" }
]

export default function Header() {
    const [mounted, setMounted] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)
    const [hasExplored, setHasExplored] = useState(false)
    const [activeSlide, setActiveSlide] = useState(0)
    const tiltRef = useRef(null)
    const navigate = useNavigate()

    useEffect(() => { setMounted(true) }, [])

    // Preload every slide image so nothing flashes blank when the slide changes
    useEffect(() => {
        slides.forEach((s) => {
            const img = new Image()
            img.src = s.image
        })
    }, [])

    const nextSlide = useCallback(() => {
        setActiveSlide((prev) => (prev + 1) % slides.length)
    }, [])

    // Advance after SLIDE_MS. Clicking a dot changes activeSlide, which restarts the timer.
    useEffect(() => {
        const timer = setTimeout(nextSlide, SLIDE_MS)
        return () => clearTimeout(timer)
    }, [activeSlide, nextSlide])

    // Cursor-follow tilt on the hero image (desktop only, skipped for reduced motion)
    const handleTilt = (e) => {
        const el = tiltRef.current
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
        const r = el.getBoundingClientRect()
        const x = (e.clientX - r.left) / r.width - 0.5
        const y = (e.clientY - r.top) / r.height - 0.5
        el.style.transform = `perspective(1000px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) scale3d(1.02, 1.02, 1.02)`
    }

    const resetTilt = () => {
        if (tiltRef.current) {
            tiltRef.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) scale3d(1, 1, 1)'
        }
    }

    const handleExploreScroll = () => {
        setHasExplored(true)
        setTimeout(() => {
            const targetElement = document.getElementById('expertise-section')
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                })
            }
        }, 50)
    }

    const goTo = (path) => {
        setMenuOpen(false)
        navigate(path)
    }

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

                /* Text: slides in from the left with a soft blur-to-sharp focus */
                @keyframes heroTextIn {
                    0% { opacity: 0; transform: translate3d(-24px, 0, 0); filter: blur(6px); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0); filter: blur(0); }
                }
                .hero-reveal {
                    animation: heroTextIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both;
                    animation-delay: var(--d, 0ms);
                }

                /* Image: glides in from the right, scaling up and coming into focus */
                @keyframes heroImageIn {
                    0% { opacity: 0; transform: translate3d(48px, 0, 0) scale(0.94); filter: blur(10px); }
                    100% { opacity: 1; transform: translate3d(0, 0, 0) scale(1); filter: blur(0); }
                }
                .hero-image-in {
                    animation: heroImageIn 0.9s cubic-bezier(0.16, 1, 0.3, 1) both;
                }

                /* Slow rotating light behind the image */
                @keyframes heroGlowSpin {
                    to { transform: rotate(360deg); }
                }
                .hero-glow-spin {
                    animation: heroGlowSpin 26s linear infinite;
                }

                /* Slide indicator fills while the slide is showing */
                @keyframes heroProgress {
                    from { transform: scaleY(0); }
                    to { transform: scaleY(1); }
                }
                .hero-progress {
                    transform-origin: top;
                    animation: heroProgress var(--dur, 5000ms) linear both;
                }

                /* Scroll cue: pulses in place instead of travelling down */
                @keyframes heroCuePulse {
                    0%, 100% { opacity: 0.45; transform: scale(0.8); }
                    50% { opacity: 1; transform: scale(1.2); }
                }
                @keyframes heroCueRipple {
                    0% { opacity: 0.55; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.7); }
                }
                .hero-cue-dot { animation: heroCuePulse 1.8s ease-in-out infinite; }
                .hero-cue-ripple { animation: heroCueRipple 2.2s ease-out infinite; }

                @media (prefers-reduced-motion: reduce) {
                    .hero-reveal, .hero-image-in, .hero-glow-spin, .hero-progress,
                    .hero-cue-dot, .hero-cue-ripple { animation: none !important; }
                    .animate-marquee-premium { animation-duration: 120s; }
                }
            `}</style>

            {/* Ambient Background Blobs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div className="absolute rounded-full opacity-[0.38] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(0, 201, 177, 0.1) 50%, transparent 70%)', top: '-15%', left: '-12%', animation: 'floatUpDown 14s ease-in-out infinite' }} />
                <div className="absolute rounded-full opacity-[0.32] blur-[120px]" style={{ width: '750px', height: '750px', background: 'radial-gradient(circle, rgba(0, 201, 177, 0.45) 0%, rgba(124, 106, 247, 0.2) 50%, transparent 70%)', bottom: '-15%', right: '-12%', animation: 'floatUpDown 16s ease-in-out infinite alternate' }} />
            </div>

            {/* TOPBAR: All Courses menu, search, links */}
            <CourseTopbar />

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
                                    className={`relative overflow-hidden transition-all duration-300 rounded-full cursor-pointer ${activeSlide === idx
                                        ? 'w-2 sm:w-2.5 h-7 sm:h-8 bg-theme-subtext/25 shadow-[0_0_10px_rgba(0,201,177,0.45)]'
                                        : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-theme-subtext/35 hover:bg-theme-subtext/70'
                                        }`}
                                >
                                    {activeSlide === idx && (
                                        <span
                                            key={`progress-${activeSlide}`}
                                            className="hero-progress absolute inset-0 rounded-full bg-gradient-to-b from-[#00C9B1] to-[#00B8C8]"
                                            style={{ '--dur': `${SLIDE_MS}ms` }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Text Content Block */}
                        <div key={`text-${activeSlide}`} className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 w-full">
                            <div className="hero-reveal" style={{ '--d': '0ms' }}>
                                <span className="inline-flex items-center gap-2 bg-theme-card border border-theme-border backdrop-blur-md rounded-full px-4 py-1.5 text-gold text-[11px] font-semibold tracking-widest uppercase">
                                    {slides[activeSlide].hasStar && <Star size={12} fill="currentColor" className="text-gold" />}
                                    {slides[activeSlide].tag}
                                </span>
                            </div>

                            <div className="mt-4 w-full hero-reveal" style={{ '--d': '70ms' }}>
                                <h1 className="font-heading font-bold text-[28px] leading-[1.25] sm:text-5xl lg:text-4xl xl:text-5xl sm:leading-tight lg:leading-tight xl:leading-tight">
                                    <span className="block text-theme-text">{slides[activeSlide].titleFirst}</span>
                                    {slides[activeSlide].titleSecond && (
                                        <span className="text-theme-text"> {slides[activeSlide].titleSecond} </span>
                                    )}
                                    <span className='text-grad-teal-gold'> {slides[activeSlide].highlight}</span>
                                </h1>
                            </div>

                            <p
                                className="hero-reveal mt-4 text-[14px] sm:text-[15px] md:text-[18px] lg:text-[15px] xl:text-[18px] font-medium leading-relaxed text-theme-subtext max-w-sm lg:max-w-none"
                                style={{ '--d': '150ms' }}
                            >
                                {slides[activeSlide].description}
                            </p>

                            <div
                                className="hero-reveal mt-5 grid grid-cols-2 gap-y-3 w-full max-w-xs sm:max-w-md lg:max-w-none mx-auto lg:mx-0 text-left"
                                style={{ '--d': '220ms' }}
                            >
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
                            <div
                                className="hero-reveal flex flex-wrap items-center gap-3 mt-6 justify-center lg:justify-start"
                                style={{ '--d': '290ms' }}
                            >
                                <button
                                    onClick={() => goTo("/contact")}
                                    className="relative overflow-hidden flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#00D9C8] text-slate-950 font-semibold text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(0,201,177,0.45),0_8px_32px_rgba(0,201,177,0.28)] hover:shadow-[0_0_0_1px_rgba(0,201,177,0.65),0_12px_40px_rgba(0,201,177,0.42)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                                >
                                    <div className="shimmer-effect" />
                                    <span className="relative z-10 flex items-center gap-2 font-heading">
                                        Talk to Our Experts
                                    </span>
                                </button>
                                <button
                                    onClick={() => goTo("/courses")}
                                    className="relative overflow-hidden inline-flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 bg-[#0D1626] border-2 border-[#F5A623] text-[#F5A623] font-medium text-[14px] sm:text-[15px] rounded-2xl shadow-[0_0_0_1px_rgba(245,166,35,0.25),0_8px_32px_rgba(0,0,0,0.35)] hover:bg-[#142036] hover:shadow-[0_0_0_1px_rgba(245,166,35,0.45),0_12px_40px_rgba(245,166,35,0.18)] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer group"
                                >
                                    <BookOpen
                                        size={14}
                                        className="text-[#F5A623] group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <span>Explore Courses</span>
                                </button>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT SIDE: Visual Showcase */}
                    <div
                        className={`w-full lg:flex-1 flex items-center justify-center lg:justify-end relative overflow-visible transition-all duration-700 ease-out ${hasExplored
                            ? 'translate-y-0 opacity-100 scale-100 filter drop-shadow-[0_0_50px_rgba(0,210,185,0.15)]'
                            : 'lg:translate-y-2 opacity-100'
                            }`}
                    >
                        {/* Rotating light behind the image (logo blue + teal) */}
                        <div
                            className="hero-glow-spin absolute pointer-events-none rounded-full"
                            style={{
                                width: '460px', height: '460px',
                                background: 'conic-gradient(from 0deg, rgba(35,128,204,0) 0%, rgba(35,128,204,0.38) 25%, rgba(92,214,245,0.30) 50%, rgba(0,201,177,0.32) 75%, rgba(35,128,204,0) 100%)',
                                filter: 'blur(70px)',
                                zIndex: 0,
                            }}
                        />

                        {/* Unclipped Image Holder */}
                        <div
                            key={`visual-${activeSlide}`}
                            className="relative z-10 w-full flex items-center justify-center py-2 px-1"
                            style={{ maxWidth: '560px', minHeight: '440px' }}
                        >
                            <div className="hero-image-in w-full flex items-center justify-center">
                                <div
                                    ref={tiltRef}
                                    onMouseMove={handleTilt}
                                    onMouseLeave={resetTilt}
                                    className="w-full flex items-center justify-center"
                                    style={{ transition: 'transform 0.25s ease-out', willChange: 'transform' }}
                                >
                                    <img
                                        src={slides[activeSlide].image}
                                        alt={`${slides[activeSlide].titleFirst} ${slides[activeSlide].highlight}`}
                                        className={`h-auto object-contain drop-shadow-[0_15px_35px_rgba(0,201,177,0.18)] select-none ${IMAGE_SIZE}`}
                                    />
                                </div>
                            </div>
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
                <div className="relative mt-3 w-7 h-11 rounded-full border border-theme-border bg-theme-card backdrop-blur-md flex items-center justify-center shadow-[inset_0_0_8px_rgba(255,255,255,0.05),0_4px_20px_rgba(0,0,0,0.4)] group-hover:border-teal/50 transition-colors duration-300">
                    <span className="hero-cue-ripple absolute inset-0 rounded-full border border-[#00C9B1]/50 pointer-events-none" />
                    <div className="hero-cue-dot w-1.5 h-1.5 rounded-full bg-gradient-to-b from-teal-light to-teal-dark shadow-[0_0_8px_rgba(0,201,177,0.6)]" />
                </div>
            </div>

            {/* MARQUEE EXPERTISE BANNER */}
            <div id="expertise-section" className="w-full max-w-350 mx-auto px-6 sm:px-10 xl:px-16 mb-16 animate-[fadeUp_0.9s_0.2s_ease_both] flex flex-col items-center relative z-10">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-theme-bg px-4 z-20 transition-colors duration-300">
                    <p className="text-center text-[10px] sm:text-[11px] tracking-[0.2em] uppercase font-bold text-theme-subtext/90 whitespace-nowrap select-none">
                        Our Microsoft expertise
                    </p>
                </div>

                <div className="w-full relative overflow-hidden bg-gradient-to-r from-theme-card/10 via-theme-card/40 to-theme-card/10 border border-theme-border/60 backdrop-blur-xl rounded-2xl py-6 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_16px_48px_-16px_rgba(0,0,0,0.15)] hover:border-theme-border/90 transition-all duration-300">
                    <div className="absolute inset-y-0 left-0 w-16 sm:w-28 bg-gradient-to-r from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />
                    <div className="absolute inset-y-0 right-0 w-16 sm:w-28 bg-gradient-to-l from-theme-bg via-theme-bg/40 to-transparent z-10 pointer-events-none transition-colors duration-300" />

                    <div className="animate-marquee-premium flex items-center">
                        {[...microsoftExpertise, ...microsoftExpertise].map((item, index) => (
                            <div key={index} className="flex items-center shrink-0">
                                <div className="flex items-center group transition-all duration-300 cursor-pointer px-8 sm:px-12">
                                    <span className="text-[14px] sm:text-[16px] font-heading font-medium text-theme-text/75 tracking-wider leading-snug group-hover:text-[#00C9B1] group-hover:scale-[1.03] transition-all duration-300 whitespace-nowrap">
                                        {item.name}
                                    </span>
                                </div>
                                <div className="h-5 w-[1px] bg-gradient-to-b from-transparent via-[#00C9B1]/45 to-transparent shadow-[0_0_4px_rgba(0,201,177,0.2)]" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

        </div>
    )
}