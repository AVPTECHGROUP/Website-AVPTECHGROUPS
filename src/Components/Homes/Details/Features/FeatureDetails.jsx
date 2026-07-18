import React, { useContext } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    GraduationCap,
    CalendarCheck,
    Wallet,
    FileBarChart,
    Bus,
    Users,
    Smartphone,
    Store,
    MessageCircle,
} from "lucide-react";
import { getFeatureBySlug } from "../../../../assets/data/featureData";
import { UserContext } from "../../../../ContextAPI/UserContext";

const ICONS = {
    GraduationCap,
    CalendarCheck,
    Wallet,
    FileBarChart,
    Bus,
    Users,
    Smartphone,
    Store,
};

const FeatureDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const feature = getFeatureBySlug(slug);

    const { theme } = useContext(UserContext);

    // ── Fallback for unknown slug ──
    if (!feature) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center px-4 text-center transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-white' : 'bg-white text-slate-900'
                }`}>
                <div
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                    style={{ background: theme === 'dark' ? "rgba(0,201,177,0.15)" : "rgba(26,138,138,0.08)" }}
                >
                    <Sparkles size={28} className={theme === 'dark' ? "text-[#00C9B1]" : "text-teal-dark"} />
                </div>
                <h1 className="font-heading text-2xl font-bold mb-2">
                    Feature not found
                </h1>
                <p className={`font-body text-sm max-w-xs mx-auto mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    We couldn't find the feature you're looking for.
                </p>
                <button
                    onClick={() => navigate("/")}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-body font-semibold text-sm shadow-md transition-all duration-200 cursor-pointer ${theme === 'dark' ? 'bg-[#00C9B1] text-slate-950 hover:bg-[#00b09b]' : 'bg-teal-dark text-white hover:bg-teal'
                        }`}
                >
                    <ArrowLeft size={16} /> Back to Home
                </button>
            </div>
        );
    }

    const Icon = ICONS[feature.icon] || Sparkles;

    return (
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'}`}>
            <style>{`
            @keyframes fdUp {
              from { opacity: 0; transform: translateY(16px); }
              to { opacity: 1; transform: translateY(0); }
            }
            @keyframes fdFade {
              from { opacity: 0; }
              to { opacity: 1; }
            }
            @keyframes fdFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-10px); }
            }
            .fd-anim { animation: fdUp 0.6s ease forwards; opacity: 0; }
            .fd-fade { animation: fdFade 0.9s ease forwards; opacity: 0; }
            .fd-float { animation: fdFloat 6s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) {
              .fd-anim, .fd-fade, .fd-float { animation: none; opacity: 1; }
            }
        `}</style>

            {/* ── Hero: Image left / Heading right ── */}
            <div className={`relative overflow-hidden pt-16 pb-16 sm:pt-20 sm:pb-24 transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-950 border-b border-slate-900' : 'bg-slate-50 border-b border-slate-200'
            }`}>

                {/* Abstract Accent Radial Gradients */}
                <div
                    className="absolute -top-40 -left-40 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
                />

                {/* Faint grid texture for a "premium dashboard" feel */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px), linear-gradient(90deg, ${theme === 'dark' ? '#fff' : '#000'} 1px, transparent 1px)`,
                        backgroundSize: "48px 48px",
                    }}
                />

                <div className="relative max-w-6xl mx-auto px-4 sm:px-6 z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-center">

                        {/* ── Left: Image ── */}
                        <div className="fd-fade order-2 lg:order-1" style={{ animationDelay: "120ms" }}>
                            <div className="relative mx-auto max-w-md lg:max-w-none">
                                {/* Glow behind card */}
                                <div
                                    className="absolute -inset-4 rounded-[2rem] blur-2xl opacity-40 pointer-events-none"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(0,201,177,0.35) 0%, rgba(245,166,35,0.25) 100%)",
                                    }}
                                />

                                {/* Image frame */}
                                <div
                                    className={`relative rounded-[1.75rem] overflow-hidden border shadow-2xl fd-float ${
                                        theme === 'dark'
                                            ? 'border-slate-800 bg-slate-900/60'
                                            : 'border-white bg-white'
                                    }`}
                                    style={{
                                        boxShadow: theme === 'dark'
                                            ? "0 30px 60px -20px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04)"
                                            : "0 30px 60px -20px rgba(15,23,42,0.18), 0 0 0 1px rgba(15,23,42,0.03)",
                                    }}
                                >
                                    {feature.bgImage ? (
                                        <div className="w-full aspect-[13/9]">
                                            <img
                                                src={feature.bgImage}
                                                alt={feature.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-full aspect-[13/9] flex items-center justify-center">
                                            <Icon size={96} className={theme === 'dark' ? "text-[#00C9B1]/60" : "text-teal-dark/40"} />
                                        </div>
                                    )}

                                    {/* subtle top sheen */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background: "linear-gradient(180deg, rgba(255,255,255,0.06) 0%, transparent 30%)",
                                        }}
                                    />
                                </div>

                                {/* Floating icon badge */}
                                <div
                                    className={`absolute -top-5 -right-5 sm:-top-6 sm:-right-6 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center shadow-xl border ${
                                        theme === 'dark' ? 'border-slate-800' : 'border-white'
                                    }`}
                                    style={{
                                        background: theme === 'dark'
                                            ? "linear-gradient(135deg, #00C9B1 0%, #009e8a 100%)"
                                            : "linear-gradient(135deg, #1A8A8A 0%, #106868 100%)",
                                    }}
                                >
                                    <Icon size={30} className="text-white" strokeWidth={1.8} />
                                </div>

                                {/* Floating stat chip */}
                                <div
                                    className={`absolute -bottom-5 -left-5 sm:-bottom-6 sm:-left-6 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 backdrop-blur-md ${
                                        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white/95 border-slate-100'
                                    }`}
                                >
                                    <div
                                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: theme === 'dark' ? "rgba(245,166,35,0.18)" : "rgba(245,166,35,0.12)" }}
                                    >
                                        <CheckCircle2 size={16} className="text-amber-500" />
                                    </div>
                                    <div className="text-left">
                                        <p className={`font-heading text-sm font-bold leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                            {feature.features?.length || 0}+ Features
                                        </p>
                                        <p className={`font-body text-[11px] mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                            Built for schools
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Right: Heading & description ── */}
                        <div className="order-1 lg:order-2 text-center lg:text-left">
                            <div
                                className="fd-anim inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-body font-semibold shadow-sm"
                                style={{
                                    animationDelay: "60ms",
                                    background: theme === 'dark' ? "rgba(0,201,177,0.16)" : "rgba(26,138,138,0.08)",
                                    color: theme === 'dark' ? "#00C9B1" : "#1A8A8A",
                                }}
                            >
                                <Icon size={14} /> {feature.title}
                            </div>

                            <h1
                                className={`fd-anim font-heading text-3xl sm:text-4xl lg:text-[2.75rem] font-bold leading-[1.1] mb-5 tracking-tight ${
                                    theme === 'dark' ? 'text-white' : 'text-slate-900'
                                }`}
                                style={{ animationDelay: "140ms" }}
                            >
                                {feature.heading}
                            </h1>

                            <p
                                className={`fd-anim font-body text-base sm:text-lg leading-relaxed max-w-xl mx-auto lg:mx-0 mb-8 ${
                                    theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                                }`}
                                style={{ animationDelay: "200ms" }}
                            >
                                {feature.description}
                            </p>

                            <div
                                className="fd-anim flex flex-col sm:flex-row items-center lg:items-start gap-3 justify-center lg:justify-start"
                                style={{ animationDelay: "260ms" }}
                            >
                                <Link
                                    to="/contact"
                                    className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-semibold text-sm sm:text-base shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
                                        theme === 'dark' ? 'bg-[#00C9B1] text-slate-950 hover:bg-[#00b09b]' : 'bg-teal-dark text-white hover:bg-teal'
                                    }`}
                                >
                                    Contact Support <ArrowRight size={16} />
                                </Link>
                                <button
                                    onClick={() => navigate(-1)}
                                    className={`inline-flex items-center gap-2 px-7 py-3.5 rounded-full font-body font-semibold text-sm sm:text-base transition-all duration-200 border cursor-pointer ${
                                        theme === 'dark'
                                            ? 'border-slate-700 text-slate-200 hover:border-[#00C9B1]/50 hover:text-[#00C9B1]'
                                            : 'border-slate-200 text-slate-700 hover:border-teal-dark/40 hover:text-teal-dark'
                                    }`}
                                >
                                    <ArrowLeft size={16} /> All Features
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

                {/* Key Features Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${theme === 'dark' ? 'from-[#00C9B1]/30' : 'from-teal-dark/30'}`} />
                        <span
                            className="font-body text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full transition-all"
                            style={{
                                color: theme === 'dark' ? '#00C9B1' : '#1A8A8A',
                                background: theme === 'dark' ? 'rgba(0,201,177,0.15)' : 'rgba(26,138,138,0.08)'
                            }}
                        >
                            Key Features
                        </span>
                        <div className={`h-px flex-1 bg-gradient-to-l to-transparent ${theme === 'dark' ? 'from-[#00C9B1]/30' : 'from-teal-dark/30'}`} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {feature.features.map((item, i) => (
                            <div
                                key={i}
                                className={`fd-anim flex items-start gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${theme === 'dark'
                                        ? 'border-slate-800 bg-slate-900/40 hover:border-[#00C9B1]/40'
                                        : 'border-gray-100 bg-white hover:border-teal-dark/30'
                                    }`}
                                style={{ animationDelay: `${100 + i * 70}ms` }}
                            >
                                <div
                                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center mt-0.5"
                                    style={{ background: theme === 'dark' ? "rgba(0,201,177,0.15)" : "rgba(26,138,138,0.1)" }}
                                >
                                    <CheckCircle2 size={16} className={theme === 'dark' ? "text-[#00C9B1]" : "text-teal-dark"} />
                                </div>
                                <p className={`font-body font-medium text-sm sm:text-base leading-snug pt-1 ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                                    }`}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Benefits Section */}
                <div className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-px flex-1 bg-gradient-to-r from-amber-400/30 to-transparent" />
                        <span
                            className="font-body text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full transition-all"
                            style={{
                                color: theme === 'dark' ? '#F5A623' : '#C8860A',
                                background: theme === 'dark' ? 'rgba(245,166,35,0.15)' : 'rgba(245,166,35,0.08)'
                            }}
                        >
                            Benefits
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-amber-400/30 to-transparent" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {feature.benefits.map((item, i) => (
                            <div
                                key={i}
                                className="fd-anim flex items-center gap-3 p-5 rounded-2xl transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
                                style={{
                                    background: theme === 'dark'
                                        ? "linear-gradient(135deg, rgba(0,201,177,0.08) 0%, rgba(245,166,35,0.06) 100%)"
                                        : "linear-gradient(135deg, rgba(26,138,138,0.06) 0%, rgba(245,166,35,0.05) 100%)",
                                    border: theme === 'dark'
                                        ? "1px solid rgba(245,166,35,0.25)"
                                        : "1px solid rgba(245,166,35,0.15)",
                                    animationDelay: `${100 + i * 70}ms`,
                                }}
                            >
                                <Sparkles size={18} className="text-amber-500 flex-shrink-0" />
                                <p className={`font-body font-medium text-sm sm:text-base ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'
                                    }`}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom CTA Box */}
                <div
                    className="relative overflow-hidden rounded-2xl p-8 sm:p-10 text-center fd-anim transition-all duration-200"
                    style={{
                        background: theme === 'dark'
                            ? "linear-gradient(135deg, rgba(0,201,177,0.08) 0%, rgba(245,166,35,0.06) 100%)"
                            : "linear-gradient(135deg, rgba(26,138,138,0.07) 0%, rgba(245,166,35,0.06) 100%)",
                        border: theme === 'dark'
                            ? "1px solid rgba(0,201,177,0.25)"
                            : "1px solid rgba(26,138,138,0.12)",
                    }}
                >
                    <div
                        className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                        style={{ background: theme === 'dark' ? "rgba(0,201,177,0.15)" : "rgba(26,138,138,0.1)" }}
                    >
                        <MessageCircle size={22} className={theme === 'dark' ? "text-[#00C9B1]" : "text-teal-dark"} />
                    </div>
                    <h3 className={`font-heading text-xl sm:text-2xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                        }`}>
                        {feature.footer}
                    </h3>
                    <p className={`font-body text-sm sm:text-base max-w-sm mx-auto mb-6 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                        }`}>
                        See how SchoolSpine's {feature.title} module fits your school — no commitment required.
                    </p>
                    <Link
                        to="/contact"
                        className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-body font-semibold text-sm sm:text-base shadow-md transition-all duration-200 hover:-translate-y-0.5 ${theme === 'dark' ? 'bg-[#00C9B1] text-slate-950 hover:bg-[#00b09b]' : 'bg-teal-dark text-white hover:bg-teal'
                            }`}
                    >
                        Contact Support <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default FeatureDetails;