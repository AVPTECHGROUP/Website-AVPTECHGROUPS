import React, { useContext, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion, animate, useInView } from "framer-motion";
import {
    Sparkles,
    Target,
    Eye,
    Users,
    ShieldCheck,
    Building2,
    MapPin,
    Phone,
    Mail,
    ArrowRight,
    Award,
    GraduationCap,
    BookOpen,
    ClipboardCheck,
    UserCheck,
    Tag,
    Cloud,
    Server,
    Database,
    Laptop,
    Code2,
    Layers,
    Share2,
    Wrench,
    Briefcase,
    Bot,
    Smartphone,
    Headphones,
    Handshake,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

import AboutImg from "../../../assets/Images/About_Us/About_Us.png";

/* -------------------------------------------------------------------------- */
/*  EDIT THESE: company details & numbers shown on the page                    */
/* -------------------------------------------------------------------------- */

const COMPANY = {
    name: "AVP Tech Group",
    address: "Royal Plaza,,Flat no. 1005 , Sushant Golf City, Lucknow, UP, India",
    phone: "+91 96995789998",
    phoneHref: "tel:+9196995789998",
    email: "info@avptechgroup.com",
};

// Placeholder numbers — replace with your real figures before going live.
const stats = [
    { value: 5, suffix: "+", label: "Projects Delivered" },
    { value: 60, suffix: "+", label: "Certified Trainers & Engineers" },
    { value: 100, suffix: "+", label: "Professionals Trained" },
    { value: 36, suffix: "+", label: "Courses & Certifications" },
];

const services = [
    {
        icon: Wrench,
        title: "IT Solutions & Support",
        desc: "From infrastructure and cloud migration to device management and security, we diagnose the problem and fix it end to end.",
    },
    {
        icon: GraduationCap,
        title: "Certification Training",
        desc: "Live, instructor-led courses in Microsoft Intune, Defender, Azure, Microsoft 365 and more, built around the exams and the real job.",
    },
    {
        icon: Building2,
        title: "Corporate Training",
        desc: "Private team training on your schedule, with content tailored to the tools and environment your staff actually use.",
    },
    {
        icon: Handshake,
        title: "Staffing Services",
        desc: "Skilled IT professionals for short-term projects and long-term roles, matched to your stack and your team.",
    },
];

const microsoftTopics = [
    { icon: Smartphone, name: "Microsoft Intune" },
    { icon: ShieldCheck, name: "Microsoft Defender" },
    { icon: Cloud, name: "Microsoft Azure" },
    { icon: Layers, name: "Microsoft 365" },
    { icon: Server, name: "Windows Server" },
    { icon: Database, name: "SQL Server" },
    { icon: Laptop, name: "Windows" },
    { icon: Mail, name: "Exchange Server" },
    { icon: Share2, name: "SharePoint" },
    { icon: Wrench, name: "System Center" },
    { icon: Briefcase, name: "Dynamics 365" },
    { icon: Code2, name: "Developer Certification" },
    { icon: Bot, name: "Microsoft AI" },
];

const included = [
    {
        icon: Award,
        title: "Certificate of Attendance",
        desc: "Every learner receives a certificate that shows their commitment to learning.",
    },
    {
        icon: Users,
        title: "Small Classes, 8 Max",
        desc: "Small batches mean each student gets personal attention and time to ask questions.",
    },
    {
        icon: BookOpen,
        title: "Course Material Included",
        desc: "Digital course material comes with every course, so you can study anywhere and revisit it any time.",
    },
    {
        icon: ClipboardCheck,
        title: "Mock & Test Questions",
        desc: "Practice tests are part of our full-time courses to help you prepare for the certification exam.",
    },
    {
        icon: UserCheck,
        title: "Highly Skilled Trainers",
        desc: "Our trainers bring deep expertise and years of hands-on, real-world experience.",
    },
    {
        icon: Tag,
        title: "Transparent Pricing",
        desc: "The price you see is the price you pay. There are no extra costs on top of the course.",
    },
];

const whyUs = [
    {
        icon: Headphones,
        title: "One Partner for Every IT Need",
        desc: "Instead of juggling separate vendors for support, training and staffing, you work with one team that understands your whole environment.",
    },
    {
        icon: Award,
        title: "Microsoft Specialists",
        desc: "Our engineers and trainers work with Intune, Defender, Azure and the wider Microsoft stack every day, so what we teach is what we practice.",
    },
    {
        icon: ShieldCheck,
        title: "Security-First Approach",
        desc: "Endpoint management and threat protection are built into how we design and deploy solutions, not added at the end.",
    },
];

/* -------------------------------------------------------------------------- */
/*  Animation variants                                                         */
/* -------------------------------------------------------------------------- */

const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
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
        transition: { staggerChildren: 0.15 },
    },
};

/* -------------------------------------------------------------------------- */
/*  Count-up number (starts when scrolled into view)                           */
/* -------------------------------------------------------------------------- */

const Counter = ({ value, suffix = "" }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-50px" });
    const [n, setN] = useState(0);

    useEffect(() => {
        if (!inView) return undefined;
        const controls = animate(0, value, {
            duration: 1.6,
            ease: "easeOut",
            onUpdate: (v) => setN(Math.round(v)),
        });
        return () => controls.stop();
    }, [inView, value]);

    return (
        <span ref={ref}>
            {n.toLocaleString("en-IN")}
            {suffix}
        </span>
    );
};

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

const About = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

    const heading = isDark ? "text-white" : "text-slate-900";
    const body = isDark ? "text-slate-400" : "text-slate-600";
    const card = isDark
        ? "bg-slate-950/40 border-slate-800/60 hover:border-[#2380CC]/40"
        : "bg-white/80 border-slate-200/80 hover:border-[#2380CC]/50 shadow-sm";
    const panel = isDark
        ? "bg-gradient-to-br from-slate-950/60 to-slate-900/40 border-slate-800/80 shadow-black/30"
        : "bg-gradient-to-br from-white/90 to-slate-50/80 border-slate-200 shadow-slate-200/60";

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
                isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
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

            {/* Split Hero Section */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Left Side: Image */}
                    <motion.div
                        initial={{ opacity: 0, x: -40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div
                            className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
                                isDark
                                    ? "border-slate-800/80 shadow-black/40"
                                    : "border-slate-200 shadow-slate-200/50"
                            }`}
                        >
                            <img
                                src={AboutImg}
                                alt={`About ${COMPANY.name}`}
                                className="w-full h-auto block object-cover transition-transform duration-700 hover:scale-[1.02]"
                            />
                            <div
                                className="absolute inset-0 pointer-events-none"
                                style={{
                                    background: isDark
                                        ? "linear-gradient(to bottom, transparent 85%, rgba(3,7,18,0.2) 95%, #030712 100%)"
                                        : "linear-gradient(to bottom, transparent 85%, rgba(248,250,252,0.2) 95%, #f8fafc 100%)",
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Right Side: Text Content */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="text-left flex flex-col justify-center"
                    >
                        <motion.div
                            variants={fadeInUp}
                            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-wide border backdrop-blur-md self-start"
                            style={{
                                backgroundColor: isDark ? "rgba(35, 128, 204, 0.08)" : "rgba(35, 128, 204, 0.05)",
                                borderColor: "rgba(35, 128, 204, 0.25)",
                                color: "#2380CC",
                            }}
                        >
                            <Sparkles size={14} className="animate-pulse" /> About {COMPANY.name}
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight ${heading}`}
                        >
                            Welcome to {COMPANY.name}.{" "}
                            <span
                                className={`bg-gradient-to-r bg-clip-text text-transparent ${
                                    isDark ? "from-[#3AA6E8] to-[#5CD6F5]" : "from-[#0D3F7A] to-[#2380CC]"
                                }`}
                            >
                                One team for every IT problem.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className={`text-sm sm:text-base mb-4 leading-relaxed ${body}`}
                        >
                            {COMPANY.name} provides complete IT solutions for businesses and professionals. We
                            solve technology problems, train people to work with the tools that run modern
                            organizations, and supply the skilled talent to keep those systems running.
                        </motion.p>

                        <motion.p variants={fadeInUp} className={`text-sm sm:text-base leading-relaxed ${body}`}>
                            We specialize in the Microsoft ecosystem, offering certification training in Microsoft
                            Intune, Microsoft Defender and related technologies, delivered live by trainers who
                            work with these products in the field.
                        </motion.p>
                    </motion.div>
                </div>
            </section>

            {/* Stats */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className={`rounded-3xl border backdrop-blur-md shadow-xl px-4 py-8 sm:py-10 ${panel}`}>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-8 gap-x-4 text-center">
                        {stats.map(({ value, suffix, label }) => (
                            <div key={label}>
                                <p className="text-3xl sm:text-4xl font-bold text-[#2380CC] tabular-nums">
                                    <Counter value={value} suffix={suffix} />
                                </p>
                                <p className={`text-xs sm:text-sm mt-1.5 ${body}`}>{label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Who We Are + Services */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="text-center mb-10">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-3 ${heading}`}>Who We Are</h2>
                    <p className={`text-sm sm:text-base max-w-3xl mx-auto leading-relaxed ${body}`}>
                        We are an IT solutions and certification training company. Technology changes quickly and
                        demand for qualified people is high, so we combine hands-on delivery with live,
                        instructor-led learning. That way, the people who solve your problems are also the ones
                        who teach your team how to prevent them.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                >
                    {services.map(({ icon: Icon, title, desc }) => (
                        <motion.div
                            key={title}
                            variants={fadeInUp}
                            className={`rounded-2xl p-6 border backdrop-blur-md transition-colors duration-300 ${card}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-base mb-2 ${heading}`}>{title}</h3>
                            <p className={`text-sm leading-relaxed ${body}`}>{desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Vision & Mission */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={`rounded-3xl p-8 sm:p-10 border backdrop-blur-md shadow-xl ${panel}`}>
                        <div
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                                isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                            }`}
                        >
                            <Eye size={26} className="text-[#2380CC]" />
                        </div>
                        <h2 className={`text-2xl font-bold mb-4 tracking-tight ${heading}`}>Our Vision</h2>
                        <p className={`text-sm sm:text-base leading-relaxed ${body}`}>
                            To become the most trusted partner for IT solutions and Microsoft skills, helping
                            organizations and professionals get more from the technology they depend on.
                        </p>
                    </div>

                    <div className={`rounded-3xl p-8 sm:p-10 border backdrop-blur-md shadow-xl ${panel}`}>
                        <div
                            className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                                isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                            }`}
                        >
                            <Target size={26} className="text-[#2380CC]" />
                        </div>
                        <h2 className={`text-2xl font-bold mb-4 tracking-tight ${heading}`}>Our Mission</h2>
                        <p className={`text-sm sm:text-base leading-relaxed ${body}`}>
                            To solve real IT problems and build real skills. We deliver live training and
                            certifications in Microsoft Intune, Defender and related technologies, backed by
                            experienced industry professionals and responsive support, so our learners and
                            clients can move their work and careers to the next level.
                        </p>
                    </div>
                </div>
            </section>

            {/* Microsoft Expertise */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="text-center mb-10">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${heading}`}>
                        Our Microsoft Expertise
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto ${body}`}>
                        Certification training and solutions across the Microsoft technology stack.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                >
                    {microsoftTopics.map(({ icon: Icon, name }) => (
                        <motion.div
                            key={name}
                            variants={fadeInUp}
                            className={`rounded-xl px-4 py-3.5 border backdrop-blur-md flex items-center gap-3 transition-colors duration-300 ${card}`}
                        >
                            <span className="w-9 h-9 rounded-lg bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] flex-shrink-0">
                                <Icon size={17} />
                            </span>
                            <span className={`text-sm font-medium ${heading}`}>{name}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* What's included with every course */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="text-center mb-10">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${heading}`}>
                        What&apos;s Included With Every Course
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto ${body}`}>
                        Everything you need to learn, practice and get certified, with nothing extra to buy.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                    {included.map(({ icon: Icon, title, desc }) => (
                        <motion.div
                            key={title}
                            variants={fadeInUp}
                            className={`rounded-2xl p-6 border backdrop-blur-md transition-colors duration-300 ${card}`}
                        >
                            <div
                                className={`w-11 h-11 rounded-xl border flex items-center justify-center mb-4 ${
                                    isDark
                                        ? "bg-[#5CD6F5]/10 border-[#5CD6F5]/20 text-[#5CD6F5]"
                                        : "bg-[#1B57A0]/10 border-[#1B57A0]/20 text-[#1B57A0]"
                                }`}
                            >
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-base mb-2 ${heading}`}>{title}</h3>
                            <p className={`text-sm leading-relaxed ${body}`}>{desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Why Choose Us */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="text-center mb-10">
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${heading}`}>
                        Why Choose {COMPANY.name}
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto ${body}`}>
                        We aren&apos;t just a vendor; we are a long-term technology partner.
                    </p>
                </div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {whyUs.map(({ icon: Icon, title, desc }) => (
                        <motion.div
                            key={title}
                            variants={fadeInUp}
                            className={`rounded-2xl p-6 sm:p-7 border backdrop-blur-md transition-colors duration-300 ${card}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-lg mb-2 ${heading}`}>{title}</h3>
                            <p className={`text-sm leading-relaxed ${body}`}>{desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* Contact / Presence */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className={`rounded-2xl p-6 border backdrop-blur-md flex items-start gap-4 ${card}`}>
                        <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] flex-shrink-0">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold tracking-wide text-slate-500">Head office</p>
                            <p className={`text-sm font-medium mt-0.5 ${heading}`}>{COMPANY.address}</p>
                        </div>
                    </div>

                    <div className={`rounded-2xl p-6 border backdrop-blur-md flex items-start gap-4 ${card}`}>
                        <div className="w-11 h-11 rounded-xl bg-[#2380CC]/10 border border-[#2380CC]/20 flex items-center justify-center text-[#2380CC] flex-shrink-0">
                            <Phone size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold tracking-wide text-slate-500">Contact</p>
                            <p className={`text-sm font-medium mt-0.5 ${heading}`}>
                                <a href={COMPANY.phoneHref} className="hover:text-[#2380CC] transition-colors">
                                    {COMPANY.phone}
                                </a>
                                {" | "}
                                <a
                                    href={`mailto:${COMPANY.email}`}
                                    className="hover:text-[#2380CC] transition-colors break-all"
                                >
                                    {COMPANY.email}
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <motion.section
                initial={{ opacity: 0, scale: 0.96 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-4 pb-24"
            >
                <div
                    className={`rounded-3xl p-8 sm:p-12 text-center border backdrop-blur-lg shadow-2xl ${panel}`}
                >
                    <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                            isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}
                    >
                        <GraduationCap size={26} className="text-[#2380CC]" />
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-bold mb-4 tracking-tight ${heading}`}>
                        Have an IT problem or a skills gap to close?
                    </h3>

                    <p className={`text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed ${body}`}>
                        Tell us what you need. We will recommend the right solution, course or team.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                to="/contact"
                                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300"
                                style={{
                                    background: "linear-gradient(135deg, #0D3F7A 0%, #2380CC 100%)",
                                    boxShadow: "0 4px 20px rgba(35, 128, 204, 0.35)",
                                }}
                            >
                                Talk to Our Experts <ArrowRight size={18} />
                            </Link>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                            <Link
                                to="/courses"
                                className={`inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base border transition-colors duration-300 ${
                                    isDark
                                        ? "border-slate-700 text-slate-100 hover:border-[#2380CC]/60"
                                        : "border-slate-300 text-slate-900 hover:border-[#2380CC]"
                                }`}
                            >
                                <BookOpen size={18} /> Explore Courses
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </motion.section>
        </div>
    );
};

export default About;