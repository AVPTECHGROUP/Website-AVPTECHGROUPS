import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    BookOpen,
    GraduationCap,
    PencilRuler,
    Backpack,
    Bell,
    School,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

import Blog_1 from "../../../assets/Images/Blog/Blog_1.png";
import Blog_2 from "../../../assets/Images/Blog/Blog_2.png";
import Blog_3 from "../../../assets/Images/Blog/Blog_3.png";
import Blog_4 from "../../../assets/Images/Blog/Blog_4.png";
import Blog_5 from "../../../assets/Images/Blog/Blog_5.png";

const blogData = [
    {
        id: 1,
        category: "The Digital School Revolution",
        title: "Why Leading Institutions Are Reimagining Education Management",
        description: "Education is experiencing one of the most significant transformations in history. Artificial Intelligence, digital learning environments, hybrid classrooms, data-driven decision-making, and evolving parent expectations are reshaping how schools operate across the world. Exceptional education requires exceptional operational efficiency.",
        image: Blog_1,
        points: [
            "Exceptional operational efficiency across all departments",
            "Intelligent platforms allowing teachers to focus on teaching",
            "Data-driven insights to maximize student success channels"
        ],
        quote: "Every minute saved in administration is a minute invested in education."
    },
    {
        id: 2,
        category: "The New Parent Expectation",
        title: "Transparency, Communication, and Trust",
        description: "Parents today are more informed, connected, and involved than ever before. They no longer evaluate schools solely on academic performance — they assess communication standards, transparency, responsiveness, safety, and digital accessibility.",
        image: Blog_2,
        points: [
            "Real-time access to student performance dashboards",
            "Instant communication and broadcast channels",
            "Transparent academic progress and secure fee tracking"
        ],
        quote: "When parents, teachers, and administrators operate within a connected ecosystem, trust naturally grows."
    },
    {
        id: 3,
        category: "Data-Driven Education",
        title: "The Competitive Advantage Schools Can No Longer Ignore",
        description: "Every school generates thousands of data points every day — attendance, academic performance, assessments, enrollment trends, faculty productivity, and parent engagement metrics. The question is whether they're using it effectively.",
        image: Blog_3,
        points: [
            "Identify at-risk students much earlier in the cycle",
            "Optimize complex resource allocation seamlessly",
            "Forecast enrollment and strengthen structural retention rates"
        ],
        quote: "Data is no longer a reporting tool — it is a strategic asset."
    },
    {
        id: 4,
        category: "Beyond School Management",
        title: "Building Future-Ready Educational Institutions",
        description: "The education sector is changing faster than ever before. Artificial Intelligence is transforming learning, remote education has become mainstream, and parents expect consumer-grade digital experiences. Future-ready institutions build scalable systems.",
        image: Blog_4,
        points: [
            "Scalable systems engineered for tomorrow's challenges",
            "Strategic investments in modern educational infrastructure",
            "Environments where creative student innovation can thrive"
        ],
        quote: "The institutions that lead tomorrow are the ones making strategic investments today."
    },
    {
        id: 5,
        category: "Operational Excellence",
        title: "Why Educational Excellence Starts With Operational Excellence",
        description: "Behind every high-performing school is an invisible engine that keeps everything running smoothly — admissions, academics, finance, human resources, transportation, communication, and compliance.",
        image: Blog_5,
        points: [
            "Seamless multi-channel admissions & academic control",
            "Automated backend financial tracking systems",
            "Integrated real-time transportation and safety compliance"
        ],
        quote: "Operational excellence is not separate from academic excellence — it is the foundation that enables it."
    }
];

const floatingIcons = [
    { Icon: BookOpen, top: "6%", left: "5%", size: 32 },
    { Icon: GraduationCap, top: "22%", left: "93%", size: 38 },
    { Icon: PencilRuler, top: "45%", left: "3%", size: 26 },
    { Icon: Backpack, top: "68%", left: "92%", size: 30 },
    { Icon: Bell, top: "82%", left: "4%", size: 24 },
    { Icon: School, top: "94%", left: "89%", size: 34 },
];

// Framer Motion Variants for Staggered Hero Elements
const heroVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (custom) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }
    })
};

const Blog = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";
    const iconsRef = useRef([]);

    // GSAP: Handling organic loop animations for floating icons
    useEffect(() => {
        const ctx = gsap.context(() => {
            iconsRef.current.forEach((icon, index) => {
                if (!icon) return;
                // Unique duration and movement offsets per icon for an organic look
                const durationY = 4 + (index % 3) * 1.5;
                const durationX = 3 + (index % 2) * 2;
                const rotateMax = 8 + (index % 4) * 3;

                gsap.to(icon, {
                    y: "-=20",
                    duration: durationY,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });

                gsap.to(icon, {
                    x: index % 2 === 0 ? "+=12" : "-=12",
                    duration: durationX,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });

                gsap.to(icon, {
                    rotation: index % 2 === 0 ? rotateMax : -rotateMax,
                    duration: durationY * 1.2,
                    ease: "sine.inOut",
                    repeat: -1,
                    yoyo: true,
                });
            });
        });

        return () => ctx.revert(); // Clean up GSAP timelines on unmount
    }, []);

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
                }`}
        >
            {/* Background Ambient Glows */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div
                    className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full opacity-20 blur-[120px]"
                    style={{ background: "radial-gradient(circle, #00C9B1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #F5A623 0%, transparent 70%)" }}
                />
            </div>

            {/* Decorative Floating Icons (Animated by GSAP) */}
            <div className="absolute inset-0 pointer-events-none hidden lg:block z-0">
                {floatingIcons.map(({ Icon, top, left, size }, i) => (
                    <div
                        key={i}
                        ref={(el) => (iconsRef.current[i] = el)}
                        className="absolute"
                        style={{ top, left }}
                    >
                        <Icon
                            size={size}
                            className={isDark ? "text-[#00C9B1]/10" : "text-slate-400/20"}
                        />
                    </div>
                ))}
            </div>

            {/* Hero Section (Animated by Framer Motion) */}
            <header className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center z-10">
                <motion.div
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    custom={1}
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-wide border backdrop-blur-md"
                    style={{
                        backgroundColor: isDark ? "rgba(0, 201, 177, 0.08)" : "rgba(0, 201, 177, 0.05)",
                        borderColor: "rgba(0, 201, 177, 0.25)",
                        color: "#00C9B1",
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> SchoolSpine Blog
                </motion.div>

                <motion.h1
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? "text-white" : "text-slate-900"
                        }`}
                >
                    Insights for <span className="bg-gradient-to-r from-[#00C9B1] to-[#00E5CC] bg-clip-text text-transparent">Future-Ready</span> Schools
                </motion.h1>

                <motion.p
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                >
                    Ideas, trends, and perspectives on building smarter, more connected educational institutions.
                </motion.p>
            </header>

            {/* Main Timeline Section */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 z-10">

                {/* Central Timeline Line */}
                <div
                    className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 opacity-60 z-0"
                    style={{
                        background: "linear-gradient(to bottom, #00C9B1 0%, #F5A623 25%, #00C9B1 50%, #F5A623 75%, #00C9B1 100%)",
                        boxShadow: "0 0 12px rgba(0, 201, 177, 0.3)"
                    }}
                />

                <div className="flex flex-col gap-20 lg:gap-36 relative z-10">
                    {blogData.map((post, index) => {
                        const isEven = index % 2 === 0;
                        const stepNumber = String(post.id).padStart(2, '0');

                        return (
                            <motion.div
                                key={post.id}
                                initial={{ opacity: 0, y: 40 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-120px" }}
                                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                                className="relative grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24 items-center pl-12 lg:pl-0"
                            >
                                {/* Step Circle Indicator */}
                                <div
                                    className="absolute left-6 lg:left-1/2 top-6 lg:top-1/2 -translate-x-1/2 -translate-y-1/2 z-30 flex items-center justify-center w-10 h-10 rounded-full font-bold text-xs border backdrop-blur-md transition-all duration-300"
                                    style={{
                                        borderColor: isEven ? "#00C9B1" : "#F5A623",
                                        color: isEven ? "#00C9B1" : "#F5A623",
                                        backgroundColor: isDark ? "#090d1a" : "#ffffff",
                                        boxShadow: isEven ? "0 0 15px rgba(0, 201, 177, 0.25)" : "0 0 15px rgba(245, 166, 35, 0.25)"
                                    }}
                                >
                                    {stepNumber}
                                </div>

                                {/* Image Side Container */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? -30 : 30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className={`w-full ${isEven ? "lg:order-1" : "lg:order-2"}`}
                                >
                                    <div
                                        className={`group relative rounded-2xl overflow-hidden border transition-all duration-500 ease-out transform hover:scale-[1.015] shadow-xl ${isDark
                                                ? "border-slate-800/90 bg-slate-900/40 hover:border-[#00C9B1]/40"
                                                : "border-slate-200 bg-white hover:border-teal-500/40"
                                            }`}
                                    >
                                        <img
                                            src={post.image}
                                            alt={post.title}
                                            className="w-full h-auto block object-contain transition-transform duration-700 ease-out"
                                            loading="lazy"
                                        />
                                        <div
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-500 mix-blend-screen"
                                            style={{
                                                background: `radial-gradient(circle at center, rgba(${isEven ? '0,201,177' : '245,166,35'},0.08) 0%, transparent 75%)`
                                            }}
                                        />
                                    </div>
                                </motion.div>

                                {/* Content Details Side Container */}
                                <motion.div
                                    initial={{ opacity: 0, x: isEven ? 30 : -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className={`w-full ${isEven ? "lg:order-2" : "lg:order-1"}`}
                                >
                                    <div
                                        className={`rounded-2xl p-6 sm:p-8 border backdrop-blur-md transition-all duration-300 ${isDark
                                                ? "bg-slate-950/40 border-slate-800/60 shadow-black/20"
                                                : "bg-white/70 border-slate-200/80 shadow-slate-100"
                                            }`}
                                    >
                                        <span
                                            className="inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 border"
                                            style={{
                                                color: "#00C9B1",
                                                backgroundColor: isDark ? "rgba(0, 201, 177, 0.06)" : "rgba(0, 201, 177, 0.03)",
                                                borderColor: "rgba(0, 201, 177, 0.15)"
                                            }}
                                        >
                                            {post.category}
                                        </span>

                                        <h2
                                            className={`text-xl sm:text-2xl font-bold mb-4 tracking-tight leading-snug ${isDark ? "text-white" : "text-slate-900"
                                                }`}
                                        >
                                            {post.title}
                                        </h2>

                                        <p
                                            className={`text-sm sm:text-base leading-relaxed mb-6 ${isDark ? "text-slate-300" : "text-slate-600"
                                                }`}
                                        >
                                            {post.description}
                                        </p>

                                        <ul className="space-y-3 mb-6">
                                            {post.points.map((point, idx) => (
                                                <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm">
                                                    <span className="mt-0.5 flex-shrink-0">
                                                        <CheckCircle2 size={16} className="text-[#00C9B1]" />
                                                    </span>
                                                    <span className={isDark ? "text-slate-300" : "text-slate-700"}>
                                                        {point}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>

                                        {post.quote && (
                                            <div
                                                className={`pl-4 border-l-4 italic text-sm sm:text-base bg-gradient-to-r py-2 pr-2 rounded-r-lg ${isDark
                                                        ? "from-amber-500/5 to-transparent border-[#F5A623] text-[#F5A623]"
                                                        : "from-amber-500/5 to-transparent border-amber-600 text-amber-800"
                                                    }`}
                                            >
                                                “{post.quote}”
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                            </motion.div>
                        );
                    })}
                </div>
            </main>

            {/* CTA Section (Animated by Framer Motion) */}
            <motion.section
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 pt-16 pb-24"
            >
                <div
                    className={`rounded-3xl p-8 sm:p-12 text-center border backdrop-blur-lg transition-all duration-300 shadow-2xl ${isDark
                            ? "bg-gradient-to-br from-slate-950/60 to-slate-900/40 border-slate-800/80 shadow-black/40"
                            : "bg-gradient-to-br from-white/90 to-slate-50/80 border-slate-200 shadow-slate-200/60"
                        }`}
                >
                    <div
                        className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-6 border ${isDark ? "bg-slate-900/80 border-slate-800" : "bg-slate-100 border-slate-200"
                            }`}
                    >
                        <GraduationCap size={26} className="text-[#00C9B1]" />
                    </div>

                    <h3
                        className={`text-2xl sm:text-3xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"
                            }`}
                    >
                        Ready to build a future-ready school?
                    </h3>

                    <p
                        className={`text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                    >
                        See how SchoolSpine helps your institution move beyond traditional administration boundaries.
                    </p>

                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300 transform hover:scale-[1.03]"
                        style={{
                            background: "linear-gradient(135deg, #00C9B1 0%, #00a38f 100%)",
                            boxShadow: "0 4px 20px rgba(0, 201, 177, 0.25)"
                        }}
                    >
                        Contact Support <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

export default Blog;