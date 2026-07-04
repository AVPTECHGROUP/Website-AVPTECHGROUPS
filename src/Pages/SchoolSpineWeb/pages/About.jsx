import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Target,
    Users,
    ShieldCheck,
    Building2,
    MapPin,
    Phone,
    Mail,
    MessageCircle,
    ArrowRight,
    CheckCircle2,
    Award,
    GraduationCap,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

import AboutImg from "../../../assets/Images/About_Us/About_Us.png";

const WHATSAPP_LINK = "https://wa.me/919511117450?text=Hi%2C%20I%20want%20to%20know%20more%20about%20SchoolSpine";

const whyUs = [
    {
        icon: Users,
        title: "Tailored for Everyone",
        desc: "Whether you're an Administrator needing deep financial analytics, a Teacher managing busy classrooms, or a Parent tracking your child's live school bus and grades — SchoolSpine offers specialized, role-based interfaces for a flawless user experience.",
    },
    {
        icon: Award,
        title: "Startup India Recognized",
        desc: "Built with cutting-edge engineering and innovation, our platform is trusted by over 500+ schools and securely manages data for more than 2 million students.",
    },
    {
        icon: ShieldCheck,
        title: "Security You Can Trust",
        desc: "Education data demands absolute privacy. SchoolSpine is built on a zero-trust architecture featuring military-grade AES-256 encryption and automated cloud backups, ensuring your institution stays fully compliant and secure.",
    },
];


// Reusable Animation Variants
const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
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
        transition: { staggerChildren: 0.15 }
    }
};

const About = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";

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
                    style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[45%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
                />
            </div>

            {/* Split Hero Section */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-10 md:pt-16 pb-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center">
                    
                    {/* Left Side: Choti & Clean Rounded Image */}
                    <motion.div 
                        initial={{ opacity: 0, x: -40, scale: 0.98 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={`relative rounded-2xl overflow-hidden border shadow-2xl ${
                            isDark ? "border-slate-800/80 shadow-black/40" : "border-slate-200 shadow-slate-200/50"
                        }`}>
                            <img
                                src={AboutImg}
                                alt="About SchoolSpine"
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
                                backgroundColor: isDark ? "rgba(0, 201, 177, 0.08)" : "rgba(0, 201, 177, 0.05)",
                                borderColor: "rgba(0, 201, 177, 0.25)",
                                color: "#00C9B1",
                            }}
                        >
                            <Sparkles size={14} className="animate-pulse" /> About SchoolSpine
                        </motion.div>

                        <motion.h1
                            variants={fadeInUp}
                            className={`text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-6 leading-tight ${
                                isDark ? "text-white" : "text-slate-900"
                            }`}
                        >
                            Empowering Educators. <br />
                            <span className="bg-gradient-to-r from-[#00C9B1] to-[#00E5CC] bg-clip-text text-transparent">
                                Automating Administration.
                            </span>{" "}
                            Inspiring the Future.
                        </motion.h1>

                        <motion.p
                            variants={fadeInUp}
                            className={`text-sm sm:text-base mb-4 leading-relaxed ${
                                isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                        >
                            At SchoolSpine, we believe the heart of education belongs in the classroom, not in
                            endless spreadsheets. Developed by{" "}
                            <a
                                href="https://computesofttech.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#00C9B1] font-semibold hover:underline"
                            >
                                ComputeSoft
                            </a>
                            , SchoolSpine is an enterprise-grade, all-in-one school management platform designed
                            to completely digitize, streamline, and optimize daily campus operations.
                        </motion.p>

                        <motion.p
                            variants={fadeInUp}
                            className={`text-sm sm:text-base leading-relaxed ${
                                isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                        >
                            We bridge the gap between administrators, teachers, parents, and students by turning
                            chaotic paperwork into a seamless, unified digital experience. From cutting-edge
                            face-recognition attendance and live transport tracking to automated fee collection
                            and instant report card generation, we handle the heavy lifting of school administration.
                        </motion.p>
                    </motion.div>

                </div>
            </section>

            {/* Mission Section */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16"
            >
                <div
                    className={`rounded-3xl p-8 sm:p-12 border backdrop-blur-md text-center shadow-xl ${
                        isDark
                            ? "bg-gradient-to-br from-slate-950/60 to-slate-900/40 border-slate-800/80 shadow-black/30"
                            : "bg-gradient-to-br from-white/90 to-slate-50/80 border-slate-200 shadow-slate-200/60"
                    }`}
                >
                    <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                            isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}
                    >
                        <Target size={26} className="text-[#00C9B1]" />
                    </div>
                    <h2 className={`text-2xl sm:text-3xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Our Mission
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        To revolutionize educational administration across India by delivering secure,
                        intelligent, and highly accessible technology that empowers schools to operate at
                        peak efficiency.
                    </p>
                </div>
            </motion.section>

            {/* Why Leading Schools Choose Us */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <motion.div 
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-10"
                >
                    <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                        Why Leading Schools Choose SchoolSpine
                    </h2>
                    <p className={`text-sm sm:text-base max-w-2xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        We aren't just a software provider; we are a dedicated growth partner for modern
                        educational institutions.
                    </p>
                </motion.div>

                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6"
                >
                    {whyUs.map(({ icon: Icon, title, desc }, i) => (
                        <motion.div
                            key={i}
                            variants={fadeInUp}
                            whileHover={{ y: -6, transition: { duration: 0.2 } }}
                            className={`rounded-2xl p-6 sm:p-7 border backdrop-blur-md transition-shadow duration-300 ${
                                isDark
                                    ? "bg-slate-950/40 border-slate-800/60 hover:border-[#00C9B1]/40 shadow-black/10"
                                    : "bg-white/80 border-slate-200/80 hover:border-teal-400/50 shadow-sm"
                            }`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1] mb-4">
                                <Icon size={20} />
                            </div>
                            <h3 className={`font-bold text-lg mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>{title}</h3>
                            <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* The Minds Behind the Innovation */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16"
            >
                <div
                    className={`rounded-2xl p-6 sm:p-8 border backdrop-blur-md flex flex-col sm:flex-row items-start sm:items-center gap-5 ${
                        isDark
                            ? "bg-slate-950/40 border-slate-800/60"
                            : "bg-white/80 border-slate-200/80 shadow-sm"
                    }`}
                >
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F5A623] flex-shrink-0">
                        <Building2 size={24} />
                    </div>
                    <div>
                        <h3 className={`font-bold text-lg mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                            The Minds Behind the Innovation
                        </h3>
                        <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            SchoolSpine is proudly crafted by ComputeSoft, a team of passionate engineers,
                            product designers, and education technology experts. Operating from our
                            headquarters in Lucknow, we combine deep operational insights with robust cloud
                            technology to solve the real, everyday headaches of school management.
                        </p>
                    </div>
                </div>
            </motion.section>

            {/* Our Presence */}
            <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 mb-16">
                <motion.div 
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={staggerContainer}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                >
                    {/* Presence Card 1 */}
                    <motion.div
                        variants={fadeInUp}
                        className={`rounded-2xl p-6 border backdrop-blur-md flex items-start gap-4 ${
                            isDark ? "bg-slate-950/40 border-slate-800/60" : "bg-white/80 border-slate-200/80 shadow-sm"
                        }`}
                    >
                        <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1] flex-shrink-0">
                            <MapPin size={18} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Headquarters
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                                Royal Plaza, Sushant Golf City, Lucknow - 226030
                            </p>
                        </div>
                    </motion.div>

                    {/* Presence Card 2 */}
                    <motion.div
                        variants={fadeInUp}
                        className={`rounded-2xl p-6 border backdrop-blur-md flex items-start gap-4 ${
                            isDark ? "bg-slate-950/40 border-slate-800/60" : "bg-white/80 border-slate-200/80 shadow-sm"
                        }`}
                    >
                        <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1] flex-shrink-0">
                            <Phone size={18} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Contact
                            </p>
                            <p className={`text-sm font-medium mt-0.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                                <a href="tel:+919511117450" className="hover:text-[#00C9B1] transition-colors">
                                    +91 9511117450
                                </a>
                                {" | "}
                                <a href="mailto:info@computesofttech.com" className="hover:text-[#00C9B1] transition-colors break-all">
                                    info@computesofttech.com
                                </a>
                            </p>
                        </div>
                    </motion.div>
                </motion.div>
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
                    className={`rounded-3xl p-8 sm:p-12 text-center border backdrop-blur-lg transition-all duration-300 shadow-2xl ${
                        isDark
                            ? "bg-gradient-to-br from-slate-950/60 to-slate-900/40 border-slate-800/80 shadow-black/40"
                            : "bg-gradient-to-br from-white/90 to-slate-50/80 border-slate-200 shadow-slate-200/60"
                    }`}
                >
                    <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${
                            isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                        }`}
                    >
                        <GraduationCap size={26} className="text-[#00C9B1]" />
                    </div>

                    <h3 className={`text-2xl sm:text-3xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        Ready to transform your institution?
                    </h3>

                    <p className={`text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Join hundreds of progressive schools that have already thrown away the spreadsheets.
                    </p>

                    <motion.a
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        href={WHATSAPP_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-slate-950 transition-all duration-300"
                        style={{
                            background: "linear-gradient(135deg, #00C9B1 0%, #F5A623 100%)",
                            boxShadow: "0 4px 20px rgba(0, 201, 177, 0.25)",
                        }}
                    >
                        <MessageCircle size={18} /> Book a 30-Minute Live Demo <ArrowRight size={18} />
                    </motion.a>

                    
                </div>
            </motion.section>
        </div>
    );
};

export default About;