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
} from "lucide-react";
import { getFeatureBySlug } from "../../../../assets/data/featureData";
import { UserContext } from "../../../../ContextAPI/UserContext"; // Context import kiya

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

    // UserContext se theme state nikaala taaki navbar se direct sync ho sake
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
        <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
            }`}>
            {/* keyframes for staggered fade-in */}
            <style>{`
                @keyframes fdUp {
                  from { opacity: 0; transform: translateY(16px); }
                  to { opacity: 1; transform: translateY(0); }
                }
                .fd-anim { animation: fdUp 0.55s ease forwards; opacity: 0; }
            `}</style>

            {/* ── Hero section (Dono modes me balanced gradient look ke sath) ── */}
            <div className={`relative overflow-hidden transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900 border-b border-slate-800' : 'bg-slate-50 border-b border-slate-200'
                }`}>
                <div
                    className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
                />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-8 pb-16">
                    <div className="text-center fd-anim" style={{ animationDelay: "80ms" }}>
                        <div
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-5 text-xs sm:text-sm font-body font-semibold"
                            style={{ background: "rgba(0,201,177,0.12)", color: "#00C9B1" }}
                        >
                            <Icon size={14} /> {feature.title}
                        </div>

                        <h1 className={`font-heading text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 ${theme === 'dark' ? 'text-white' : 'text-slate-900'
                            }`}>
                            {feature.heading}
                        </h1>
                        <p className={`font-body text-base sm:text-lg max-w-2xl mx-auto leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-600'
                            }`}>
                            {feature.description}
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Body Content ── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 sm:py-20">

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
                                className={`fd-anim flex items-start gap-3 p-5 rounded-2xl border transition-all duration-200 hover:shadow-md ${theme === 'dark'
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
                                className="fd-anim flex items-center gap-3 p-5 rounded-2xl transition-all duration-200"
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
                    className="rounded-2xl p-8 sm:p-10 text-center fd-anim transition-all duration-200"
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
                        <Icon size={22} className={theme === 'dark' ? "text-[#00C9B1]" : "text-teal-dark"} />
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
                        className={`inline-flex items-center gap-2 px-7 py-3 rounded-full font-body font-semibold text-sm sm:text-base shadow-md transition-all duration-200 ${theme === 'dark' ? 'bg-[#00C9B1] text-slate-950 hover:bg-[#00b09b]' : 'bg-teal-dark text-white hover:bg-teal'
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