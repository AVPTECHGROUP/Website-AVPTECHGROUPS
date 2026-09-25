import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Phone,
    Mail,
    MapPin,
    Clock,
    LifeBuoy,
    GraduationCap,
    MessageCircleQuestion,
    BadgeCheck,
    Navigation,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

import ContactImg from "../../../assets/Images/Contact/Contact.png";

/* -------------------------------------------------------------------------- */
/*  Company details (edit here)                                                */
/* -------------------------------------------------------------------------- */

const COMPANY = {
    name: "AVP Tech Group",
    address: "Royal Plaza, Sushant Golf City, Lucknow, Uttar Pradesh, India",
    phone: "+91 96995789998",
    phoneHref: "tel:+9196995789998",
    email: "info@avptechgroup.com",
    hours: "Mon – Sat, 9AM – 6PM",
    hoursNote: "Closed Sundays & holidays",
};

const OFFICE_MAP_LINK = "https://maps.app.goo.gl/2oEXQaYmnFTaQaHfA";
const OFFICE_MAP_EMBED_SRC =
    "https://www.google.com/maps?q=Royal+Plaza,+Sushant+Golf+City,+Lucknow,+Uttar+Pradesh+226030&z=16&output=embed";

const helpDesks = [
    {
        icon: LifeBuoy,
        title: "IT Solutions & Technical Support",
        desc: "Help with Intune and Defender deployments, device management, security, and other IT issues.",
        rows: [
            { label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
            { label: "Phone", value: COMPANY.phone, href: COMPANY.phoneHref },
        ],
    },
    {
        icon: GraduationCap,
        title: "Training & Enrollment",
        desc: "Questions about course dates, fees, batches, certificates, or corporate training requests.",
        rows: [
            { label: "Email", value: COMPANY.email, href: `mailto:${COMPANY.email}` },
            { label: "Phone", value: COMPANY.phone, href: COMPANY.phoneHref },
        ],
    },
];

const faqLinks = [
    { title: "Need help with a course or service?", label: "Help & Support", path: "/support" },
    { title: "Explore Our Latest Blog Articles", label: "Visit Blog", path: "/blog" },
    { title: "Looking for our training options?", label: "Browse Courses", path: "/courses" },
];

// Motion Components for Custom Routes
const MotionLink = motion(Link);

// Animation Configuration Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
    },
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 },
    },
};

const Contact = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

    // Secondary accent: deep royal blue on light backgrounds, cyan on dark
    const accentB = isDark ? "#5CD6F5" : "#1B57A0";

    // Ways to reach us (shown in the main card)
    const contactRows = [
        {
            icon: Phone,
            label: "Call us",
            value: COMPANY.phone,
            href: COMPANY.phoneHref,
            sub: "Speak to our team directly",
        },
        {
            icon: Mail,
            label: "Email us",
            value: COMPANY.email,
            href: `mailto:${COMPANY.email}`,
            sub: "For general and course enquiries",
        },
        {
            icon: MapPin,
            label: "Visit us",
            value: COMPANY.address,
            href: OFFICE_MAP_LINK,
            external: true,
            sub: "Scheduled visits are welcome",
        },
        {
            icon: Clock,
            label: "Working hours",
            value: COMPANY.hours,
            sub: COMPANY.hoursNote,
        },
    ];

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
                }`}
        >
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[120px]"
                    style={{ background: "radial-gradient(circle, #2380CC 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[45%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #5CD6F5 0%, transparent 70%)" }}
                />
            </div>

            {/* Hero Section */}
            <motion.header
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-14 text-center z-10"
            >
                <motion.div
                    variants={fadeInUp}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-wide border backdrop-blur-md"
                    style={{
                        backgroundColor: isDark ? "rgba(35, 128, 204, 0.10)" : "rgba(35, 128, 204, 0.06)",
                        borderColor: "rgba(35, 128, 204, 0.30)",
                        color: "#2380CC",
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> We're Here to Help
                </motion.div>

                <motion.h1
                    variants={fadeInUp}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? "text-white" : "text-slate-900"
                        }`}
                >
                    Get in{" "}
                    <span
                        className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? "from-[#3AA6E8] to-[#5CD6F5]" : "from-[#0D3F7A] to-[#2380CC]"
                            }`}
                    >
                        Touch
                    </span>{" "}
                    With Us
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                >
                    Whether it's a course enquiry, an IT problem, or a hiring need — our team is ready to
                    assist. Call, email or visit us using the details below.
                </motion.p>
            </motion.header>

            {/* Contact Details + Image Section */}
            <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-20">
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className={`rounded-3xl border backdrop-blur-md overflow-hidden shadow-2xl ${isDark
                            ? "bg-slate-950/40 border-slate-800/60 shadow-black/30"
                            : "bg-white/80 border-slate-200/80 shadow-slate-200/60"
                        }`}
                >
                    <div className="grid grid-cols-1 lg:grid-cols-2">
                        {/* Left Image Column */}
                        <div className="relative hidden lg:flex w-full h-full items-stretch justify-center overflow-hidden">
                            <motion.img
                                initial={{ scale: 1.05, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                                src={ContactImg}
                                alt={`Contact ${COMPANY.name}`}
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                        {/* Right Details */}
                        <div className="p-6 sm:p-10">
                            <span
                                className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                                style={{
                                    color: accentB,
                                    backgroundColor: `${accentB}10`,
                                    borderColor: `${accentB}33`,
                                }}
                            >
                                Contact Details
                            </span>
                            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                Talk to our team
                            </h2>
                            <p className={`text-sm mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                Reach us in whichever way suits you best. We're happy to help with training,
                                IT solutions and staffing.
                            </p>

                            <div className="flex flex-col gap-4">
                                {contactRows.map(({ icon: Icon, label, value, href, sub, external }) => (
                                    <div
                                        key={label}
                                        className={`rounded-2xl p-4 sm:p-5 border flex items-start gap-4 transition-colors duration-300 ${isDark
                                                ? "bg-white/[0.03] border-slate-800/70 hover:border-[#2380CC]/50"
                                                : "bg-white border-slate-200/80 hover:border-[#2380CC]/50 shadow-sm"
                                            }`}
                                    >
                                        <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] flex-shrink-0">
                                            <Icon size={18} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                {label}
                                            </p>
                                            <p className={`text-sm sm:text-base font-medium mt-0.5 break-words ${isDark ? "text-white" : "text-slate-900"}`}>
                                                {href ? (
                                                    <a
                                                        href={href}
                                                        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                                        className="hover:text-[#2380CC] transition-colors"
                                                    >
                                                        {value}
                                                    </a>
                                                ) : (
                                                    value
                                                )}
                                            </p>
                                            {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 mt-8">
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={COMPANY.phoneHref}
                                    className="flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0D3F7A] to-[#2380CC] transition-all duration-300 shadow-lg shadow-[#2380CC]/25 cursor-pointer"
                                >
                                    <Phone size={16} /> Call Now
                                </motion.a>
                                <motion.a
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    href={`mailto:${COMPANY.email}`}
                                    className={`flex-1 inline-flex items-center justify-center gap-2 h-12 px-6 rounded-xl font-semibold text-sm border transition-colors duration-300 cursor-pointer ${isDark
                                            ? "border-slate-700 text-slate-100 hover:border-[#2380CC]/60"
                                            : "border-slate-300 text-slate-900 hover:border-[#2380CC]"
                                        }`}
                                >
                                    <Mail size={16} /> Send an Email
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </main>

            {/* Department Helpdesks */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Department-Specific Helpdesks
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Use the right channel so your inquiry reaches the right team quickly.
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {helpDesks.map(({ icon: Icon, title, desc, rows }, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            className={`rounded-2xl p-6 sm:p-7 border backdrop-blur-md transition-colors duration-300 ${isDark
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#2380CC]/50"
                                    : "bg-white/80 border-slate-200/80 hover:border-[#2380CC]/50 shadow-sm"
                                }`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                            <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{desc}</p>
                            <div className="flex flex-col gap-1.5">
                                {rows.map((r, idx) => (
                                    <div key={idx} className="text-sm flex gap-2">
                                        <span className="text-slate-500">{r.label}:</span>
                                        {r.href ? (
                                            <a href={r.href} className="text-[#2380CC] hover:underline font-medium break-all">{r.value}</a>
                                        ) : (
                                            <span className={isDark ? "text-slate-300" : "text-slate-700"}>{r.value}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Office Location + Live Map */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6 }}
                    className={`rounded-3xl border backdrop-blur-md overflow-hidden shadow-xl ${isDark
                            ? "bg-slate-950/40 border-slate-800/60 shadow-black/30"
                            : "bg-white/80 border-slate-200/80 shadow-slate-200/60"
                        }`}
                >
                    <div
                        className={`p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b ${isDark ? "border-slate-800/60" : "border-slate-200/70"
                            }`}
                    >
                        <div className="flex items-start sm:items-center gap-5">
                            <div
                                className="w-14 h-14 rounded-2xl border flex items-center justify-center flex-shrink-0"
                                style={{
                                    color: accentB,
                                    backgroundColor: `${accentB}14`,
                                    borderColor: `${accentB}33`,
                                }}
                            >
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Office Location</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    We welcome scheduled visits at — {COMPANY.address}.
                                </p>
                            </div>
                        </div>

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={OFFICE_MAP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-[#0D3F7A] to-[#2380CC] transition-all duration-300 shadow-lg shadow-[#2380CC]/25 cursor-pointer whitespace-nowrap"
                        >
                            <Navigation size={16} /> Get Directions
                        </motion.a>
                    </div>

                    <div className="relative w-full h-[320px] sm:h-[420px]">
                        <iframe
                            title={`${COMPANY.name} Office Location — Royal Plaza, Sushant Golf City, Lucknow`}
                            src={OFFICE_MAP_EMBED_SRC}
                            className={`w-full h-full border-0 ${isDark ? "grayscale-[0.3] contrast-[1.1] brightness-[0.85]" : ""}`}
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            allowFullScreen
                        />
                    </div>
                </motion.div>
            </section>

            {/* FAQ Quick Links */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pb-24">
                <div className="text-center mb-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4 text-xs font-semibold tracking-wide border"
                        style={{
                            backgroundColor: isDark ? "rgba(35, 128, 204, 0.10)" : "rgba(35, 128, 204, 0.06)",
                            borderColor: "rgba(35, 128, 204, 0.30)",
                            color: "#2380CC",
                        }}
                    >
                        <MessageCircleQuestion size={14} /> Before You Reach Out
                    </motion.div>
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Frequently Asked Questions
                    </h2>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-5"
                >
                    {faqLinks.map(({ title, label, path }, i) => (
                        <MotionLink
                            key={i}
                            to={path}
                            variants={fadeInUp}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className={`group rounded-2xl p-6 border backdrop-blur-md transition-shadow duration-300 ${isDark
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#5CD6F5]/40"
                                    : "bg-white/80 border-slate-200/80 hover:border-[#1B57A0]/40 shadow-sm"
                                }`}
                        >
                            <BadgeCheck size={18} className="mb-3" style={{ color: accentB }} />
                            <p className={`text-sm mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{title}</p>
                            <span className="text-sm font-semibold text-[#2380CC] group-hover:underline">{label} →</span>
                        </MotionLink>
                    ))}
                </motion.div>
            </section>
        </div>
    );
};

export default Contact;