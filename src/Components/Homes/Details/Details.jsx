import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    ArrowRight,
    Wrench,
    GraduationCap,
    Building2,
    Handshake,
    Smartphone,
    ShieldCheck,
    Cloud,
    Layers,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";
import { featureData } from "../../../assets/data/featureData";

// Route that renders <FeatureDetails /> (expects a :slug param). Change if yours differs.
const FEATURE_PATH = "/features";

const ICONS = {
    Wrench,
    GraduationCap,
    Building2,
    Handshake,
    Smartphone,
    ShieldCheck,
    Cloud,
    Layers,
};

const CATEGORY_STYLES = {
    Services: {
        dark: "bg-[#2380CC]/15 text-[#3AA6E8] border-[#2380CC]/30",
        light: "bg-[#2380CC]/10 text-[#1B57A0] border-[#2380CC]/25",
    },
    Training: {
        dark: "bg-[#5CD6F5]/10 text-[#5CD6F5] border-[#5CD6F5]/25",
        light: "bg-[#0E7490]/10 text-[#0E7490] border-[#0E7490]/25",
    },
    Technology: {
        dark: "bg-white/5 text-slate-300 border-white/10",
        light: "bg-slate-100 text-slate-600 border-slate-200",
    },
};

const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
};

const Details = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

    return (
        <section
            id="features-section"
            className="relative scroll-mt-20 overflow-hidden py-20 sm:py-28"
        >
            {/* Ambient glows */}
            <div className="pointer-events-none absolute inset-0 -z-0">
                <div className="absolute -top-32 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[#2380CC] opacity-15 blur-[120px]" />
                <div className="absolute bottom-[-160px] right-[-160px] h-[420px] w-[420px] rounded-full bg-[#5CD6F5] opacity-10 blur-[110px]" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
                {/* Heading */}
                <div className="mx-auto mb-14 max-w-3xl text-center sm:mb-16">
                    <div
                        className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide backdrop-blur-md sm:text-sm ${
                            isDark
                                ? "border-[#2380CC]/30 bg-[#2380CC]/10 text-[#3AA6E8]"
                                : "border-[#2380CC]/25 bg-[#2380CC]/5 text-[#1B57A0]"
                        }`}
                    >
                        <Sparkles size={14} className="animate-pulse" /> What we do
                    </div>

                    <h2
                        className={`mb-4 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl ${
                            isDark ? "text-white" : "text-slate-900"
                        }`}
                    >
                        Everything Your IT{" "}
                        <span
                            className={`bg-gradient-to-r bg-clip-text text-transparent ${
                                isDark
                                    ? "from-[#3AA6E8] to-[#5CD6F5]"
                                    : "from-[#0D3F7A] to-[#2380CC]"
                            }`}
                        >
                            Needs
                        </span>
                    </h2>

                    <p
                        className={`text-base sm:text-lg ${
                            isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                    >
                        One partner for solutions, training and talent. No vendor hand-offs.
                    </p>
                </div>

                {/* Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-80px" }}
                    className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
                >
                    {featureData.map((feature) => {
                        const Icon = ICONS[feature.icon] || Sparkles;
                        const chip = CATEGORY_STYLES[feature.category] || CATEGORY_STYLES.Technology;

                        return (
                            <motion.div key={feature.slug} variants={cardVariants} className="h-full">
                                <Link
                                    to={`${FEATURE_PATH}/${feature.slug}`}
                                    className="group relative block h-full rounded-3xl bg-gradient-to-br from-[#2380CC]/40 via-slate-500/10 to-[#5CD6F5]/40 p-px transition-all duration-500 hover:-translate-y-1.5 hover:from-[#2380CC] hover:via-[#2380CC]/30 hover:to-[#5CD6F5] hover:shadow-2xl hover:shadow-[#2380CC]/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5CD6F5] focus-visible:ring-offset-2 focus-visible:ring-offset-transparent"
                                >
                                    <div
                                        className={`relative flex h-full flex-col overflow-hidden rounded-[23px] p-6 ${
                                            isDark ? "bg-[#060d1c]" : "bg-white"
                                        }`}
                                    >
                                        {/* Hover glow */}
                                        <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#2380CC]/25 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

                                        {/* Icon + category */}
                                        <div className="relative mb-6 flex items-start justify-between gap-3">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0D3F7A] to-[#2380CC] text-white shadow-lg shadow-[#2380CC]/30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-3">
                                                <Icon size={22} strokeWidth={1.8} />
                                            </div>
                                            <span
                                                className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${
                                                    isDark ? chip.dark : chip.light
                                                }`}
                                            >
                                                {feature.category}
                                            </span>
                                        </div>

                                        <h3
                                            className={`relative mb-2 text-lg font-bold leading-snug tracking-tight ${
                                                isDark ? "text-white" : "text-slate-900"
                                            }`}
                                        >
                                            {feature.title}
                                        </h3>

                                        <p
                                            className={`relative text-sm leading-relaxed ${
                                                isDark ? "text-slate-400" : "text-slate-600"
                                            }`}
                                        >
                                            {feature.shortDescription}
                                        </p>

                                        <span
                                            className={`relative mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold ${
                                                isDark ? "text-[#3AA6E8]" : "text-[#1B57A0]"
                                            }`}
                                        >
                                            Learn more
                                            <ArrowRight
                                                size={16}
                                                className="transition-transform duration-300 group-hover:translate-x-1.5"
                                            />
                                        </span>
                                    </div>
                                </Link>
                            </motion.div>
                        );
                    })}
                </motion.div>

                {/* Bottom prompt */}
                <div className="mt-14 text-center">
                    <p className={`mb-4 text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Not sure where to start?
                    </p>
                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2.5 rounded-full bg-gradient-to-br from-[#0D3F7A] to-[#2380CC] px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#2380CC]/30 transition-all duration-300 hover:scale-[1.03] hover:shadow-[#2380CC]/50 sm:text-base"
                    >
                        Talk to Our Experts <ArrowRight size={18} />
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default Details;