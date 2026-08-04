import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Phone,
    Mail,
    MapPin,
    Clock,
    Send,
    LifeBuoy,
    Wallet,
    MessageCircleQuestion,
    ChevronDown,
    CheckCircle2,
    BadgeCheck,
    Navigation,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

import ContactImg from "../../../assets/Images/Contact/Contact.png";

// ⚠️ ADJUST THESE TWO PATHS to match where your Api/demorequestApi.js and
// Constants/Demorequestconstant.js actually live relative to this Contact.jsx file.
import { submitDemoRequest } from "../../../Api/demorequestApi";
import { STUDENT_STRENGTH_OPTIONS } from "../../../Constants/Demorequestconstant";

const inquiryTypes = ["Technical Support", "Book a Free Demo", "Feedback", "Product Training & Support", "Other Inquiries"];

const helpDesks = [
    {
        icon: LifeBuoy,
        title: "Technical Support & Portal Help",
        desc: "Assistance with the Parent App, student dashboards, login issues, or software bugs.",
        rows: [
            { label: "Email", value: "support@computesofttech.com", href: "mailto:support@computesofttech.com" },
            { label: "Live Chat", value: "Available inside your Admin/Parent dashboard" },
        ],
    },
    {
        icon: Wallet,
        title: "Accounts & Billing Department",
        desc: "Questions regarding online fee payments, receipts, pending dues, or transport billing.",
        rows: [
            { label: "Email", value: "accounts@schoolspine.com", href: "mailto:accounts@schoolspine.com" },
        ],
    },
];

const CAMPUS_MAP_LINK = "https://maps.app.goo.gl/2oEXQaYmnFTaQaHfA";
const CAMPUS_MAP_EMBED_SRC = "https://www.google.com/maps?q=Royal+Plaza,+Sushant+Golf+City,+Lucknow,+Uttar+Pradesh+226030&z=16&output=embed";

const faqLinks = [
    { title: "Setting up the mobile app?", label: "Help & Support", path: "/support" },
    {
        title: "Explore Our Latest Blog Articles",
        label: "Visit Blog",
        path: "/blog"
    },
    { title: "Quick questions on features?", label: "FAQ Section", path: "/faqs" },
];

// Motion Components for Custom Routes
const MotionLink = motion(Link);

// Animation Configuration Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.12 }
    }
};

// NOTE ON DROPDOWNS:
// Native <select> popup lists are rendered by the OS/browser, not by our CSS —
// on most browsers (esp. Windows Chrome) that popup always has a WHITE
// background no matter what dark-theme classes we put on <option>. So option
// text color is kept dark/readable here regardless of `isDark`, otherwise
// dark-theme text (white-on-white) becomes invisible inside the open list.
const OPTION_CLASSES = "bg-white text-slate-900";

const Contact = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

    const [form, setForm] = useState({
        name: "",
        email: "",
        countryCode: "+91",
        phone: "",
        inquiry: "",
        message: "",
        schoolName: "",
        studentStrength: "",
    });
    const [submitted, setSubmitted] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const isDemoInquiry = form.inquiry === "Book a Free Demo";

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setForm({
            name: "",
            email: "",
            countryCode: "+91",
            phone: "",
            inquiry: "",
            message: "",
            schoolName: "",
            studentStrength: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        // ── Path 1: "Book a Free Demo" → calls the real /v1/public/demo-request API ──
        if (isDemoInquiry) {
            if (!form.name || !form.phone || !form.schoolName || !form.studentStrength) {
                setErrorMsg("Please fill all required demo fields.");
                return;
            }

            const digitsOnly = form.phone.replace(/\D/g, "");
            if (digitsOnly.length < 6) {
                setErrorMsg("Please enter a valid phone number.");
                return;
            }

            const payload = {
                fullName: form.name.trim(),
                schoolName: form.schoolName.trim(),
                phoneNumber: `${form.countryCode}${digitsOnly}`,
                studentStrength: form.studentStrength,
            };

            setLoading(true);
            try {
                const result = await submitDemoRequest(payload);
                setSuccessMsg(
                    result?.message ||
                    "Demo request received! Our team will reach out within 24 hours."
                );
                setSubmitted(true);
                resetForm();
                setTimeout(() => {
                    setSubmitted(false);
                    setSuccessMsg("");
                }, 5000);
            } catch (err) {
                setErrorMsg(err.message || "We couldn't reach the server. Please try again.");
            } finally {
                setLoading(false);
            }
            return;
        }

        // ── Path 2: all other inquiry types → existing local-only behaviour ──
        if (!form.name || !form.email || !form.phone || !form.inquiry || !form.message) {
            setErrorMsg("Please fill all required fields.");
            return;
        }
        setSuccessMsg("Message sent! We'll get back to you shortly.");
        setSubmitted(true);
        resetForm();
        setTimeout(() => {
            setSubmitted(false);
            setSuccessMsg("");
        }, 5000);
    };

    const inputClasses = `w-full h-12 px-4 rounded-xl border outline-none transition-all text-sm ${isDark
            ? "bg-white/[0.04] border-white/10 text-white placeholder-slate-500 focus:border-[#00C9B1]/50"
            : "bg-white border-slate-200 text-slate-900 placeholder-slate-400 focus:border-[#00C9B1]/60"
        }`;
    const labelClasses = `text-xs font-semibold uppercase tracking-wide mb-2 block ${isDark ? "text-slate-400" : "text-slate-500"
        }`;

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
                }`}
        >
            {/* Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[120px]"
                    style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[45%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
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
                        backgroundColor: isDark ? "rgba(0, 201, 177, 0.08)" : "rgba(0, 201, 177, 0.05)",
                        borderColor: "rgba(0, 201, 177, 0.25)",
                        color: "#00C9B1",
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> We're Here to Help
                </motion.div>

                <motion.h1
                    variants={fadeInUp}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? "text-white" : "text-slate-900"
                        }`}
                >
                    Get in <span className="bg-gradient-to-r from-[#00C9B1] to-[#00E5CC] bg-clip-text text-transparent">Touch</span> With Us
                </motion.h1>

                <motion.p
                    variants={fadeInUp}
                    className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                >
                    Whether it's admissions, technical support, or school fees — our team is ready to
                    assist. Reach out below, or fill the form and we'll reply within 24 hours.
                </motion.p>
            </motion.header>

            {/* Quick Contact Strip */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                >
                    {[
                        { icon: Phone, label: "Main Office", value: "+91 9511117450", sub: "Alt: +91 9511117451" },
                        { icon: Mail, label: "General Inquiries", value: "info@computesofttech.com" },
                        { icon: Clock, label: "Working Hours", value: "Mon – Sat, 9AM – 6PM", sub: "Closed Sundays & holidays" },
                    ].map(({ icon: Icon, label, value, sub }, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -4, transition: { duration: 0.2 } }}
                            className={`rounded-2xl p-5 border backdrop-blur-md flex items-start gap-4 transition-colors duration-300 ${isDark
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#00C9B1]/40"
                                    : "bg-white/80 border-slate-200/80 hover:border-teal-400/50 shadow-sm"
                                }`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1] flex-shrink-0">
                                <Icon size={18} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    {label}
                                </p>
                                <p className={`text-sm font-medium mt-0.5 break-words ${isDark ? "text-white" : "text-slate-900"}`}>
                                    {value}
                                </p>
                                {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Form + Image Section */}
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
                                alt="Contact SchoolSpine"
                                className="w-full h-full object-cover object-center"
                            />
                        </div>

                        {/* Right Form */}
                        <div className="p-6 sm:p-10">
                            <span
                                className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                                style={{
                                    color: "#F5A623",
                                    backgroundColor: isDark ? "rgba(245, 166, 35, 0.06)" : "rgba(245, 166, 35, 0.05)",
                                    borderColor: "rgba(245, 166, 35, 0.2)",
                                }}
                            >
                                Send Us a Message
                            </span>
                            <h2 className={`text-2xl sm:text-3xl font-bold mb-2 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                Write to our team
                            </h2>
                            <p className={`text-sm mb-8 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                We review every message and reply via email or phone within 1 business day.
                            </p>

                            {submitted && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl border border-[#00C9B1]/30 bg-[#00C9B1]/10 text-[#00C9B1] text-sm font-medium"
                                >
                                    <CheckCircle2 size={16} />
                                    {successMsg}
                                </motion.div>
                            )}

                            {errorMsg && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="mb-6 flex items-center gap-2 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 text-sm font-medium"
                                >
                                    {errorMsg}
                                </motion.div>
                            )}

                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your first and last name"
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    {!isDemoInquiry && (
                                        <div>
                                            <label className={labelClasses}>Email Address *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleChange}
                                                placeholder="you@example.com"
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                    <div>
                                        <label className={labelClasses}>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder={isDemoInquiry ? "98765 43210" : "A valid contact number"}
                                            className={inputClasses}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClasses}>Inquiry Type *</label>
                                        <div className="relative">
                                            <select
                                                name="inquiry"
                                                value={form.inquiry}
                                                onChange={handleChange}
                                                className={`${inputClasses} appearance-none pr-10 cursor-pointer ${!form.inquiry ? (isDark ? "text-slate-500" : "text-slate-400") : ""
                                                    }`}
                                                required
                                            >
                                                <option value="" disabled className={OPTION_CLASSES}>
                                                    Select an inquiry type
                                                </option>
                                                {inquiryTypes.map((t) => (
                                                    <option key={t} value={t} className={OPTION_CLASSES}>
                                                        {t}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown
                                                size={16}
                                                className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Demo-only fields — required by /v1/public/demo-request */}
                                {isDemoInquiry && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className={labelClasses}>School Name *</label>
                                            <input
                                                type="text"
                                                name="schoolName"
                                                value={form.schoolName}
                                                onChange={handleChange}
                                                placeholder="e.g. Sunrise Public School"
                                                className={inputClasses}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className={labelClasses}>Number of Students *</label>
                                            <div className="relative">
                                                <select
                                                    name="studentStrength"
                                                    value={form.studentStrength}
                                                    onChange={handleChange}
                                                    className={`${inputClasses} appearance-none pr-10 cursor-pointer ${!form.studentStrength ? (isDark ? "text-slate-500" : "text-slate-400") : ""
                                                        }`}
                                                    required
                                                >
                                                    <option value="" disabled className={OPTION_CLASSES}>
                                                        Select a range
                                                    </option>
                                                    {STUDENT_STRENGTH_OPTIONS.map((s) => (
                                                        <option key={s.value} value={s.value} className={OPTION_CLASSES}>
                                                            {s.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                <ChevronDown
                                                    size={16}
                                                    className={`pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-slate-500" : "text-slate-400"}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {!isDemoInquiry && (
                                    <div>
                                        <label className={labelClasses}>Message *</label>
                                        <textarea
                                            name="message"
                                            value={form.message}
                                            onChange={handleChange}
                                            placeholder="Please provide as much detail as possible"
                                            rows={5}
                                            className={`${inputClasses} h-auto py-3 resize-none`}
                                            required
                                        />
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.015 }}
                                    whileTap={{ scale: 0.98 }}
                                    type="submit"
                                    disabled={loading}
                                    className="mt-2 h-12 px-6 rounded-xl font-semibold text-slate-950 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] transition-all duration-300 shadow-lg shadow-teal-500/10 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                                >
                                    {loading ? "Sending..." : isDemoInquiry ? "Request Demo" : "Send Message"} <Send size={16} />
                                </motion.button>
                            </form>
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
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#00C9B1]/40"
                                    : "bg-white/80 border-slate-200/80 hover:border-teal-400/50 shadow-sm"
                                }`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1] mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                            <p className={`text-sm mb-4 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{desc}</p>
                            <div className="flex flex-col gap-1.5">
                                {rows.map((r, idx) => (
                                    <div key={idx} className="text-sm flex gap-2">
                                        <span className="text-slate-500">{r.label}:</span>
                                        {r.href ? (
                                            <a href={r.href} className="text-[#00C9B1] hover:underline font-medium break-all">{r.value}</a>
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

            {/* Campus Location + Live Map */}
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
                            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                                <MapPin size={24} />
                            </div>
                            <div>
                                <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>Office Location</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    We welcome scheduled visits at — Royal Plaza,
                                    Sushant Golf City, Lucknow, Uttar Pradesh – 226030, India.
                                </p>
                            </div>
                        </div>

                        <motion.a
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            href={CAMPUS_MAP_LINK}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-shrink-0 inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl font-semibold text-sm text-slate-950 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] transition-all duration-300 shadow-lg shadow-teal-500/10 cursor-pointer whitespace-nowrap"
                        >
                            <Navigation size={16} /> Get Directions
                        </motion.a>
                    </div>

                    <div className="relative w-full h-[320px] sm:h-[420px]">
                        <iframe
                            title="SchoolSpine Campus Location — Royal Plaza, Sushant Golf City, Lucknow"
                            src={CAMPUS_MAP_EMBED_SRC}
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
                            backgroundColor: isDark ? "rgba(0, 201, 177, 0.08)" : "rgba(0, 201, 177, 0.05)",
                            borderColor: "rgba(0, 201, 177, 0.25)",
                            color: "#00C9B1",
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
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#F5A623]/40"
                                    : "bg-white/80 border-slate-200/80 hover:border-amber-400/50 shadow-sm"
                                }`}
                        >
                            <BadgeCheck size={18} className="text-[#F5A623] mb-3" />
                            <p className={`text-sm mb-3 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{title}</p>
                            <span className="text-sm font-semibold text-[#00C9B1] group-hover:underline">{label} →</span>
                        </MotionLink>
                    ))}
                </motion.div>
            </section>
        </div>
    );
};

export default Contact;