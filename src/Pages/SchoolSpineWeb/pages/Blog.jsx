import React, { useContext, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import {
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Cloud,
    ShieldCheck,
    Server,
    Laptop,
    Code2,
    Bot,
    Handshake,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";


import Blog_1 from "../../../assets/Images/Blog/Blog_1.svg"
import Blog_2 from "../../../assets/Images/Blog/Blog_2.svg";
import Blog_3 from "../../../assets/Images/Blog/Blog_3.svg";
import Blog_4 from "../../../assets/Images/Blog/Blog_4.svg";
import Blog_5 from "../../../assets/Images/Blog/Blog_5.svg";

const blogData = [
    {
        id: 1,
        category: "The Unified IT Advantage",
        title: "Why One IT Partner Beats Five Separate Vendors",
        description: "Most organizations juggle one vendor for support, another for cloud, a third for training and a fourth for staffing. Every hand-off adds delay and blurs accountability. A single partner who understands your whole environment resolves problems faster and helps stop them from coming back.",
        image: Blog_1,
        points: [
            "One accountable team for support, training and staffing",
            "Faster resolution with no hand-offs between vendors",
            "Solutions designed around your actual environment"
        ],
        quote: "The best IT support is the kind that teaches your team to need it less."
    },
    {
        id: 2,
        category: "Security First",
        title: "Zero Trust Starts at the Endpoint",
        description: "Every laptop, phone and virtual desktop is a door into your business. Modern security means managing devices with Microsoft Intune, protecting them with Defender and verifying every identity through Entra ID, so protection is designed in from day one instead of added after an incident.",
        image: Blog_2,
        points: [
            "Unified management for Windows, mobile and virtual desktops",
            "Threat detection and response with Microsoft Defender XDR",
            "Conditional access built on strong identity controls"
        ],
        quote: "Security is not a product you buy at the end; it is how you build from the start."
    },
    {
        id: 3,
        category: "Cloud Without the Chaos",
        title: "Moving to Azure and Microsoft 365 the Right Way",
        description: "A move to the cloud should simplify work, not disrupt it. A good migration starts with an honest assessment, a clear architecture and a plan for governance, cost and security, so the cloud becomes an advantage instead of a surprise bill.",
        image: Blog_3,
        points: [
            "Assessment and architecture before any migration begins",
            "Secure, well-governed Azure and Microsoft 365 environments",
            "Virtual desktops and collaboration tools that work anywhere"
        ],
        quote: "A cloud move succeeds or fails long before the first workload is migrated."
    },
    {
        id: 4,
        category: "Skills That Certify",
        title: "Why Live, Instructor-Led Training Beats Self-Study",
        description: "Videos and PDFs can teach concepts, but certification exams and real jobs demand judgment. Live training in small batches, with hands-on practice and mock tests, lets learners ask questions, make mistakes safely and walk into the exam and the workplace with confidence.",
        image: Blog_4,
        points: [
            "Small batches of up to eight learners for personal attention",
            "Trainers who work with these products every day",
            "Mock tests and course material to prepare for the exam"
        ],
        quote: "You do not learn a platform by watching it; you learn it by running it."
    },
    {
        id: 5,
        category: "People & Talent",
        title: "Closing the Skills Gap: Train Your Team or Hire the Right One",
        description: "Every growing IT environment reaches the same point: the tools outgrow the team. Some gaps are best closed by upskilling the people you already have, while others need experienced professionals on a project or permanent basis. The right partner can help with both.",
        image: Blog_5,
        points: [
            "Private corporate training on your schedule and your tools",
            "Skilled IT professionals for short-term and long-term roles",
            "Talent matched to your stack, not just a job description"
        ],
        quote: "Technology only delivers value in the hands of people who know how to use it."
    }
];

const floatingIcons = [
    { Icon: Cloud, top: "6%", left: "5%", size: 32 },
    { Icon: ShieldCheck, top: "22%", left: "93%", size: 38 },
    { Icon: Server, top: "45%", left: "3%", size: 26 },
    { Icon: Laptop, top: "68%", left: "92%", size: 30 },
    { Icon: Code2, top: "82%", left: "4%", size: 24 },
    { Icon: Bot, top: "94%", left: "89%", size: 34 },
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
                    style={{ background: "radial-gradient(circle, #2380CC 0%, transparent 70%)" }}
                />
                <div
                    className="absolute top-[40%] right-[-200px] w-[500px] h-[500px] rounded-full opacity-10 blur-[100px]"
                    style={{ background: "radial-gradient(circle, #5CD6F5 0%, transparent 70%)" }}
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
                            className={isDark ? "text-[#2380CC]/15" : "text-slate-400/20"}
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
                        backgroundColor: isDark ? "rgba(35, 128, 204, 0.08)" : "rgba(35, 128, 204, 0.05)",
                        borderColor: "rgba(35, 128, 204, 0.25)",
                        color: "#2380CC",
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> AVP Tech Group Blog
                </motion.div>

                <motion.h1
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    custom={2}
                    className={`text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 ${isDark ? "text-white" : "text-slate-900"
                        }`}
                >
                    Insights for <span className={`bg-gradient-to-r bg-clip-text text-transparent ${isDark ? "from-[#3AA6E8] to-[#5CD6F5]" : "from-[#0D3F7A] to-[#2380CC]"}`}>Future-Ready</span> IT Teams
                </motion.h1>

                <motion.p
                    variants={heroVariants}
                    initial="hidden"
                    animate="visible"
                    custom={3}
                    className={`text-base sm:text-lg max-w-3xl mx-auto leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                >
                    Practical ideas on Microsoft, cloud, security and the skills that keep modern organizations running.
                </motion.p>
            </header>

            {/* Main Timeline Section */}
            <main className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 z-10">

                {/* Central Timeline Line */}
                <div
                    className="absolute left-6 lg:left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 opacity-60 z-0"
                    style={{
                        background: "linear-gradient(to bottom, #2380CC 0%, #5CD6F5 25%, #2380CC 50%, #5CD6F5 75%, #2380CC 100%)",
                        boxShadow: "0 0 12px rgba(35, 128, 204, 0.3)"
                    }}
                />

                <div className="flex flex-col gap-20 lg:gap-36 relative z-10">
                    {blogData.map((post, index) => {
                        const isEven = index % 2 === 0;
                        const stepNumber = String(post.id).padStart(2, '0');
                        const stepColor = isEven ? "#2380CC" : (isDark ? "#5CD6F5" : "#0E7490");

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
                                        borderColor: stepColor,
                                        color: stepColor,
                                        backgroundColor: isDark ? "#090d1a" : "#ffffff",
                                        boxShadow: isEven ? "0 0 15px rgba(35, 128, 204, 0.25)" : "0 0 15px rgba(92, 214, 245, 0.25)"
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
                                                ? "border-slate-800/90 bg-slate-900/40 hover:border-[#2380CC]/50"
                                                : "border-slate-200 bg-white hover:border-[#2380CC]/50"
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
                                                background: `radial-gradient(circle at center, rgba(${isEven ? '35,128,204' : '92,214,245'},0.08) 0%, transparent 75%)`
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
                                                color: "#2380CC",
                                                backgroundColor: isDark ? "rgba(35, 128, 204, 0.06)" : "rgba(35, 128, 204, 0.03)",
                                                borderColor: "rgba(35, 128, 204, 0.15)"
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
                                                        <CheckCircle2 size={16} className="text-[#2380CC]" />
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
                                                        ? "from-[#5CD6F5]/5 to-transparent border-[#5CD6F5] text-[#5CD6F5]"
                                                        : "from-[#1B57A0]/5 to-transparent border-[#1B57A0] text-[#0D3F7A]"
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
                        <Handshake size={26} className="text-[#2380CC]" />
                    </div>

                    <h3
                        className={`text-2xl sm:text-3xl font-bold mb-4 tracking-tight ${isDark ? "text-white" : "text-slate-900"
                            }`}
                    >
                        Have an IT problem or a skills gap to close?
                    </h3>

                    <p
                        className={`text-sm sm:text-base max-w-md mx-auto mb-8 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                    >
                        Tell us what you need. We will recommend the right solution, course or team.
                    </p>

                    <Link
                        to="/contact"
                        className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full font-semibold text-sm sm:text-base text-white transition-all duration-300 transform hover:scale-[1.03]"
                        style={{
                            background: "linear-gradient(135deg, #0D3F7A 0%, #2380CC 100%)",
                            boxShadow: "0 4px 20px rgba(35, 128, 204, 0.35)"
                        }}
                    >
                        Talk to Our Experts <ArrowRight size={18} />
                    </Link>
                </div>
            </motion.section>
        </div>
    );
};

export default Blog;