import React from 'react'
import { Sparkles, CheckCircle2, Download, Star, ShieldCheck, ArrowUpRight } from 'lucide-react'
import appPreview from '../../../assets/Images/crousel/android_ios.png'

export default function AppDownload() {
    const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cst.schoolspine&hl=en_IN"
    const APP_STORE_URL = "https://apps.apple.com/ng/app/schoolspine/id6800739236"

    const highlights = [
        "Smart Transport Management",
        "Instant Homework & Attendance",
        "Easy Profile & Role Switching",
        "Instant Fee Receipts & Dues"
    ]

    return (
        <section className="relative overflow-hidden py-14 sm:py-20 lg:py-24 bg-theme-bg text-theme-text transition-colors duration-300">

            <style>{`
                @keyframes deviceBounce {
                    0%, 100% {
                        transform: translateY(0px) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-18px) rotate(0.8deg);
                    }
                }
                @keyframes shadowPulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.38;
                    }
                    50% {
                        transform: scale(0.86);
                        opacity: 0.16;
                    }
                }
                .animate-device-bounce {
                    animation: deviceBounce 3.6s ease-in-out infinite;
                }
                .animate-shadow-pulse {
                    animation: shadowPulse 3.6s ease-in-out infinite;
                }
            `}</style>

            {/* Ambient Background Radial Glows */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
                <div
                    className="absolute top-1/2 left-4 md:left-1/4 -translate-y-1/2 rounded-full opacity-[0.25] blur-[120px]"
                    style={{
                        width: '550px',
                        height: '550px',
                        background: 'radial-gradient(circle, rgba(0,201,177,0.55) 0%, transparent 70%)'
                    }}
                />
                <div
                    className="absolute top-1/2 right-4 md:right-1/4 -translate-y-1/2 rounded-full opacity-[0.22] blur-[130px]"
                    style={{
                        width: '520px',
                        height: '520px',
                        background: 'radial-gradient(circle, rgba(245,166,35,0.45) 0%, transparent 70%)'
                    }}
                />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                {/* Main Glass Showcase Card */}
                <div className="relative rounded-3xl border border-theme-border/80 bg-gradient-to-br from-theme-card/85 via-theme-card/45 to-theme-card/75 backdrop-blur-2xl p-6 sm:p-10 md:p-12 lg:p-14 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.35)] overflow-hidden">

                    {/* Top Accent Gradient Border */}
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#00C9B1] via-[#F5A623]/60 to-transparent" />

                    {/* Equal 6-6 Column Split to Give Ample Space to the Enlarged Image */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

                        {/* LEFT: Heading, Bullet Points, Download CTA Badges */}
                        <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">

                            {/* Tagline Pill */}
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#00C9B1]/35 bg-[#00C9B1]/10 text-[#00C9B1] text-xs font-semibold uppercase tracking-wider mb-4 shadow-xs">
                                <Sparkles size={13} className="animate-pulse text-[#00C9B1]" />
                                <span>Click to Download</span>
                            </div>

                            <h2 className="font-heading font-bold text-2xl sm:text-4xl md:text-5xl leading-[1.2] tracking-tight">
                                Carry Your Entire Campus in <br className="hidden sm:inline" />
                                <span className="text-grad-teal-gold">Your Pocket.</span>
                            </h2>

                            <p className="mt-3.5 text-theme-subtext text-sm sm:text-base lg:text-[17px] max-w-xl leading-relaxed">
                                Never miss an academic update again. Get live bus notifications, track day-to-day attendance, pay fees securely, and communicate directly with teachers—all in one place.
                            </p>

                            {/* Trust Rating Strip */}
                            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mt-5 text-xs sm:text-sm font-medium text-theme-subtext">
                                <span className="inline-flex items-center gap-1.5 text-gold font-semibold">
                                    <Star size={15} fill="currentColor" /> 4.9 Rating
                                </span>
                                <span className="w-1 h-1 rounded-full bg-theme-border" />
                                <span className="inline-flex items-center gap-1 text-[#00C9B1]">
                                    <ShieldCheck size={16} /> Verified Official App
                                </span>
                                <span className="w-1 h-1 rounded-full bg-theme-border hidden sm:block" />
                                <span className="hidden sm:inline text-theme-subtext/80">iOS & Android Ready</span>
                            </div>

                            {/* Feature Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3.5 mt-6 w-full max-w-lg text-left">
                                {highlights.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center gap-2.5 p-2.5 rounded-xl bg-theme-bg/40 border border-theme-border/60 text-xs sm:text-[13px] font-medium text-theme-subtext"
                                    >
                                        <div className="w-5 h-5 rounded-full bg-[#00C9B1]/15 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={13} className="text-[#00C9B1]" />
                                        </div>
                                        <span className="truncate">{item}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Download Action Section */}
                            <div className="mt-8 flex flex-col items-center lg:items-start gap-3 w-full">
                                <p className="text-[11px] font-bold uppercase tracking-widest text-theme-subtext flex items-center gap-1.5">
                                    <Download size={13} className="text-[#00C9B1]" /> Select your store to install:
                                </p>

                                <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">

                                    {/* Google Play Store Badge */}
                                    <a
                                        href={PLAY_STORE_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download on Google Play Store"
                                        className="group relative w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 px-5 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-[#00C9B1] shadow-lg hover:shadow-[0_0_24px_rgba(0,201,177,0.35)] hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer"
                                    >
                                        <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24" fill="none">
                                            <path d="M3.609 1.814L13.793 12 3.61 22.186A2.213 2.213 0 0 1 3 20.627V3.373c0-.613.226-1.18.609-1.559z" fill="#00C9B1" />
                                            <path d="M17.207 8.586L13.793 12l3.414 3.414 3.904-2.231c.883-.505.883-1.861 0-2.366L17.207 8.586z" fill="#F5A623" />
                                            <path d="M13.793 12L3.61 1.814A2.327 2.327 0 0 1 4.708 1.55c.489 0 .964.128 1.385.369l11.114 6.667L13.793 12z" fill="#00E5CC" />
                                            <path d="M13.793 12l3.414 3.414-11.114 6.667a2.76 2.76 0 0 1-1.385.369 2.327 2.327 0 0 1-1.098-.264L13.793 12z" fill="#FF5722" />
                                        </svg>
                                        <div className="flex flex-col text-left leading-tight">
                                            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight font-medium">Get it on</span>
                                            <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#00C9B1] transition-colors">Google Play</span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-500 group-hover:text-[#00C9B1] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-1" />
                                    </a>

                                    {/* Apple App Store Badge */}
                                    <a
                                        href={APP_STORE_URL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label="Download on Apple App Store"
                                        className="group relative w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 px-5 py-3 rounded-2xl bg-slate-950 border border-slate-700/80 hover:border-[#F5A623] shadow-lg hover:shadow-[0_0_24px_rgba(245,166,35,0.35)] hover:-translate-y-1 active:scale-95 transition-all duration-300 cursor-pointer"
                                    >
                                        <svg className="w-6 h-6 fill-current text-white group-hover:text-[#F5A623] transition-colors shrink-0" viewBox="0 0 170 170">
                                            <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.44-6.19-9.58-10.87-20.47-14.04-32.66-3.17-12.19-4.76-23.77-4.76-34.73 0-16.14 4.15-29.6 12.44-40.38 8.29-10.78 18.7-16.29 31.25-16.53 4.8 0 10.3 1.25 16.51 3.75 6.21 2.5 10.02 3.8 11.43 3.91 1.74-.22 5.82-1.63 12.24-4.24 6.42-2.61 11.97-3.8 16.65-3.59 13.06.65 23.59 5.38 31.6 14.19-11.54 6.96-17.15 16.52-16.84 28.69.33 9.79 4.13 18.06 11.4 24.81 7.27 6.75 16.03 10.77 26.27 12.08-2.61 7.84-5.94 15.79-9.98 23.85zm-43.24-118.9c0 7.84-2.83 15.01-8.49 21.52-5.66 6.52-12.74 10.77-21.23 12.74-.22-1.09-.33-2.18-.33-3.27 0-7.62 3.05-15.01 9.15-22.18 6.1-7.18 13.44-11.31 22.02-12.4.11 1.2.17 2.4.17 3.59z" />
                                        </svg>
                                        <div className="flex flex-col text-left leading-tight">
                                            <span className="text-[9px] sm:text-[10px] text-slate-400 uppercase tracking-tight font-medium">Download on the</span>
                                            <span className="text-sm sm:text-base font-bold text-white group-hover:text-[#F5A623] transition-colors">App Store</span>
                                        </div>
                                        <ArrowUpRight size={14} className="text-slate-500 group-hover:text-[#F5A623] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all ml-1" />
                                    </a>

                                </div>
                            </div>

                        </div>

                        {/* RIGHT: Significantly Enlarged Bouncy Float App Mockup */}
                        <div className="lg:col-span-6 flex flex-col items-center justify-center relative order-1 lg:order-2 py-4 lg:py-0">

                            {/* Enlarged Device Backdrop Glow */}
                            <div className="absolute w-72 h-72 sm:w-96 sm:h-96 md:w-[440px] md:h-[440px] rounded-full bg-gradient-to-tr from-[#00C9B1]/30 via-[#00C9B1]/10 to-[#F5A623]/25 blur-3xl pointer-events-none" />

                            {/* Floating / Bouncing Image Container with Expanded Breakpoints */}
                            <div className="relative z-10 w-full flex items-center justify-center animate-device-bounce">
                                <img
                                    src={appPreview}
                                    alt="SchoolSpine Android & iOS Apps Preview"
                                    className="w-full max-w-[340px] sm:max-w-[450px] md:max-w-[520px] lg:max-w-[580px] xl:max-w-[620px] h-auto object-contain drop-shadow-[0_28px_55px_rgba(0,0,0,0.55)] transition-transform duration-500 hover:scale-[1.04] select-none"
                                />
                            </div>

                            {/* Synchronized Base Shadow Underneath Device */}
                            <div className="w-56 sm:w-72 md:w-84 lg:w-96 h-6 rounded-[100%] bg-black/55 blur-lg mt-3 animate-shadow-pulse pointer-events-none" />
                        </div>

                    </div>
                </div>

            </div>
        </section>
    )
}