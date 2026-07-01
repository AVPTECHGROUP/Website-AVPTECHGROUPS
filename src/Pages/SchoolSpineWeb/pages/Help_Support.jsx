import React, { useContext, useMemo, useState } from "react";
import {
    Sparkles,
    Search,
    Building2,
    GraduationCap,
    Smartphone,
    Wrench,
    CheckCircle2,
    Camera,
    Video,
    ChevronDown,
    Mail,
    Phone,
    MessageCircle,
    HelpCircle,
} from "lucide-react";
import { UserContext } from "../../../ContextAPI/UserContext";

// ─── Content Data ───────────────────────────────────────────────────────────
const searchExamples = ["How to collect fees", "Marking attendance", "Reset password", "Bulk student import"];

const knowledgeBase = [
    {
        id: "admin",
        icon: Building2,
        accent: "#00C9B1",
        title: "Administrator Knowledge Base",
        subtitle: "Complete guides for managing school operations, configurations, and high-level reporting.",
        groups: [
            {
                heading: "Core Setup & Onboarding",
                items: [
                    { title: "Initial School Configuration", desc: "Step-by-step guide to setting up your academic year, adding classes, sections, and assigning class teachers." },
                    { title: "System Permissions & Roles", desc: "How to create custom roles and grant specific access rights to non-teaching staff, accountants, or vice-principals." },
                ],
            },
            {
                heading: "Admissions & Student Records",
                items: [
                    { title: "Processing New Admissions", desc: "How to accept online applications, verify documents, and generate auto-incremented Student IDs." },
                    { title: "Bulk Student Import", desc: "Download our Excel template to upload thousands of student profiles in a single click." },
                ],
                media: { type: "image", label: "Admin Dashboard → Student Management → Import Screen" },
            },
            {
                heading: "Fee & Financial Management",
                items: [
                    { title: "Setting up Fee Structures", desc: "How to create custom fee categories (Tuition, Transport, Lab, Uniforms) based on classes or individual waivers." },
                    { title: "Automating Reminders & Penalties", desc: "Configuring the system to automatically send SMS/Push notifications to parents 5 days before the due date." },
                ],
            },
        ],
    },
    {
        id: "teacher",
        icon: GraduationCap,
        accent: "#F5A623",
        title: "Teacher Portal Guide",
        subtitle: "Streamlining your daily classroom chores so you can focus entirely on teaching.",
        groups: [
            {
                heading: "Smart Attendance (Face Recognition & Manual)",
                items: [
                    { title: "Taking Attendance via Mobile App", desc: "Open the SchoolSpine Teacher App, select your class, and toggle attendance statuses instantly." },
                    { title: "Using Face Recognition Cameras", desc: "How the system auto-logs attendance when students pass the entryway." },
                ],
                media: { type: "video", label: "Mobile App Interface showing Attendance Toggle and Face ID confirmation" },
            },
            {
                heading: "Academic & Exam Management",
                items: [
                    { title: "Marks Entry & Report Cards", desc: "Inputting marks for unit tests, term exams, and co-curricular activities. How to generate the final automated grading matrix." },
                    { title: "Homework & Assignment Dispatch", desc: "Attaching PDFs, worksheets, or links to study materials and broadcasting them directly to the Parent App." },
                ],
            },
        ],
    },
    {
        id: "parent",
        icon: Smartphone,
        accent: "#00C9B1",
        title: "Parent App Assistance",
        subtitle: "Helping parents stay perfectly synced with their child's academic lifecycle.",
        groups: [
            {
                heading: "Mobile App Onboarding",
                items: [
                    { title: "First-Time Login", desc: "How to use your registered mobile number to receive the secure OTP and link multiple children to a single dashboard." },
                    { title: "Push Notifications", desc: "Ensuring your smartphone settings allow instant updates for bus tracking and sudden school announcements." },
                ],
            },
        ],
    },
];

const faqGroups = [
    {
        heading: "Technical & Access Issues",
        items: [
            {
                q: "I forgot my password. How do I reset it?",
                a: "Click on Forgot Password on the login screen. Admins/Teachers will receive a reset link on their work email. Parents will receive a secure 6-digit OTP on their registered phone number.",
            },
            {
                q: "The live transport tracking map isn't updating.",
                a: "Ensure the driver's device has active GPS and cellular data turned on. If the issue persists, the route admin can restart the route link from the main dashboard.",
            },
        ],
    },
    {
        heading: "Hardware & Integration Updates",
        items: [
            {
                q: "How do we sync our biometric/face recognition gates with SchoolSpine?",
                a: "Our local API connector links directly with standard devices. Go to Settings > Hardware Integration to download the network execution script.",
            },
        ],
    },
];

const contactChannels = [
    {
        icon: Mail,
        label: "Email Support",
        value: "info@computesofttech.com",
        sub: "Average response time: < 2 hours",
        href: "mailto:info@computesofttech.com",
    },
    {
        icon: Phone,
        label: "Helpline",
        value: "+91 9511117450",
        sub: "Mon – Sat, 9:00 AM to 6:00 PM IST",
        href: "tel:+919511117450",
    },
    {
        icon: MessageCircle,
        label: "Live Chat",
        value: "Floating bubble on your Admin Dashboard",
        sub: "Real-time human assistance",
    },
];

// Flattened index used for the live search
const buildSearchIndex = () => {
    const index = [];
    knowledgeBase.forEach((section) => {
        section.groups.forEach((group) => {
            group.items.forEach((item) => {
                index.push({
                    category: section.title,
                    heading: group.heading,
                    title: item.title,
                    desc: item.desc,
                    accent: section.accent,
                });
            });
        });
    });
    faqGroups.forEach((group) => {
        group.items.forEach((item) => {
            index.push({
                category: "FAQ",
                heading: group.heading,
                title: item.q,
                desc: item.a,
                accent: "#F5A623",
            });
        });
    });
    return index;
};
const searchIndex = buildSearchIndex();

// ─── Reusable Media Placeholder ─────────────────────────────────────────────
const MediaPlaceholder = ({ type, label, isDark }) => {
    const Icon = type === "video" ? Video : Camera;
    return (
        <div
            className={`mt-4 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center gap-2 py-8 px-4 transition-colors ${
                isDark ? "border-slate-700/70 bg-white/[0.02]" : "border-slate-300 bg-slate-50"
            }`}
        >
            <Icon size={22} className={isDark ? "text-slate-500" : "text-slate-400"} />
            <p className={`text-xs sm:text-sm ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                {type === "video" ? "Video walkthrough coming soon" : "Screenshot coming soon"} — {label}
            </p>
        </div>
    );
};

const Support = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";
    const [query, setQuery] = useState("");
    const [openFaq, setOpenFaq] = useState({});

    const toggleFaq = (key) => {
        setOpenFaq((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const results = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return null;
        return searchIndex.filter(
            (entry) =>
                entry.title.toLowerCase().includes(q) ||
                entry.desc.toLowerCase().includes(q) ||
                entry.heading.toLowerCase().includes(q) ||
                entry.category.toLowerCase().includes(q)
        );
    }, [query]);

    const cardClasses = isDark
        ? "bg-slate-950/40 border-slate-800/60"
        : "bg-white/80 border-slate-200/80 shadow-sm";

    return (
        <div
            className={`relative min-h-screen overflow-hidden transition-colors duration-500 ${
                isDark ? "bg-[#030712] text-slate-100" : "bg-slate-50 text-slate-900"
            }`}
        >
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); filter: blur(4px); }
                    to { opacity: 1; transform: translateY(0); filter: blur(0); }
                }
                .animate-reveal { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; }
            `}</style>

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

            {/* Hero */}
            <header className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-10 text-center z-10">
                <div
                    className="animate-reveal inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 text-xs sm:text-sm font-semibold tracking-wide border backdrop-blur-md"
                    style={{
                        backgroundColor: isDark ? "rgba(0, 201, 177, 0.08)" : "rgba(0, 201, 177, 0.05)",
                        borderColor: "rgba(0, 201, 177, 0.25)",
                        color: "#00C9B1",
                        animationDelay: "100ms",
                    }}
                >
                    <Sparkles size={14} className="animate-pulse" /> Help & Support Center
                </div>

                <h1
                    className={`animate-reveal text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-5 leading-tight ${
                        isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{ animationDelay: "250ms" }}
                >
                    Welcome to SchoolSpine{" "}
                    <span className="bg-gradient-to-r from-[#00C9B1] to-[#00E5CC] bg-clip-text text-transparent">
                        Help & Support
                    </span>
                </h1>

                <p
                    className={`animate-reveal text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed mb-8 ${
                        isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                    style={{ animationDelay: "400ms" }}
                >
                    Your go-to resource for mastering school administration, classroom management, and
                    parent communication.
                </p>

                {/* Search Bar */}
                <div className="animate-reveal max-w-xl mx-auto" style={{ animationDelay: "500ms" }}>
                    <div
                        className={`flex items-center gap-3 rounded-2xl border px-4 sm:px-5 h-14 backdrop-blur-md transition-all focus-within:border-[#00C9B1]/50 ${
                            isDark ? "bg-white/[0.04] border-white/10" : "bg-white border-slate-200 shadow-sm"
                        }`}
                    >
                        <Search size={20} className="text-[#00C9B1] flex-shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`How can we help you today? e.g. "${searchExamples[0]}"`}
                            className={`w-full h-full bg-transparent outline-none text-sm sm:text-base ${
                                isDark ? "text-white placeholder-slate-500" : "text-slate-900 placeholder-slate-400"
                            }`}
                        />
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
                        {searchExamples.map((ex) => (
                            <button
                                key={ex}
                                onClick={() => setQuery(ex)}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                                    isDark
                                        ? "border-white/10 text-slate-400 hover:text-[#00C9B1] hover:border-[#00C9B1]/40"
                                        : "border-slate-200 text-slate-500 hover:text-[#00C9B1] hover:border-teal-400/50"
                                }`}
                            >
                                {ex}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Search Results (shown only when typing) */}
            {results && (
                <section className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 mb-16">
                    <p className={`text-sm mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
                    </p>
                    <div className="flex flex-col gap-3">
                        {results.length === 0 && (
                            <div className={`rounded-2xl p-6 border text-center text-sm ${cardClasses} ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                No matches found — try the Contact Specialists section below.
                            </div>
                        )}
                        {results.map((r, i) => (
                            <div key={i} className={`rounded-2xl p-5 border backdrop-blur-md ${cardClasses}`}>
                                <span
                                    className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full mb-2 border"
                                    style={{ color: r.accent, borderColor: `${r.accent}40`, backgroundColor: `${r.accent}10` }}
                                >
                                    {r.category} · {r.heading}
                                </span>
                                <h3 className={`font-semibold text-sm sm:text-base mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>{r.title}</h3>
                                <p className={`text-sm leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>{r.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Knowledge Base Sections (hidden while searching) */}
            {!results && (
                <main className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 flex flex-col gap-14 mb-16">
                    {knowledgeBase.map((section) => {
                        const SectionIcon = section.icon;
                        return (
                            <section key={section.id}>
                                <div className="flex items-start sm:items-center gap-4 mb-6">
                                    <div
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border flex-shrink-0"
                                        style={{
                                            color: section.accent,
                                            backgroundColor: `${section.accent}14`,
                                            borderColor: `${section.accent}33`,
                                        }}
                                    >
                                        <SectionIcon size={22} />
                                    </div>
                                    <div>
                                        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                            {section.title}
                                        </h2>
                                        <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>{section.subtitle}</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {section.groups.map((group, gi) => (
                                        <div
                                            key={gi}
                                            className={`rounded-2xl p-5 sm:p-6 border backdrop-blur-md transition-all duration-300 ${cardClasses} ${
                                                isDark ? "hover:border-[#00C9B1]/30" : "hover:border-teal-400/40"
                                            }`}
                                        >
                                            <h3 className={`font-semibold text-sm sm:text-base mb-4 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                🔹 {group.heading}
                                            </h3>
                                            <ul className="flex flex-col gap-3.5">
                                                {group.items.map((item, ii) => (
                                                    <li key={ii} className="flex items-start gap-2.5">
                                                        <CheckCircle2 size={16} className="text-[#00C9B1] mt-0.5 flex-shrink-0" />
                                                        <div>
                                                            <p className={`text-sm font-medium ${isDark ? "text-slate-200" : "text-slate-800"}`}>{item.title}</p>
                                                            <p className={`text-xs sm:text-sm mt-0.5 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                                {item.desc}
                                                            </p>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            {group.media && <MediaPlaceholder {...group.media} isDark={isDark} />}
                                        </div>
                                    ))}
                                </div>
                            </section>
                        );
                    })}

                    {/* Troubleshooting & FAQs */}
                    <section>
                        <div className="flex items-start sm:items-center gap-4 mb-6">
                            <div
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center border flex-shrink-0"
                                style={{ color: "#F5A623", backgroundColor: "rgba(245,166,35,0.08)", borderColor: "rgba(245,166,35,0.2)" }}
                            >
                                <Wrench size={22} />
                            </div>
                            <div>
                                <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                                    Common Troubleshooting & FAQs
                                </h2>
                                <p className={`text-sm mt-1 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                    Quick fixes for the most frequently encountered technical snags.
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-col gap-6">
                            {faqGroups.map((group, gi) => (
                                <div key={gi}>
                                    <p className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                        ❓ {group.heading}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {group.items.map((item, ii) => {
                                            const key = `${gi}-${ii}`;
                                            const isOpen = !!openFaq[key];
                                            return (
                                                <div key={key} className={`rounded-xl border backdrop-blur-md overflow-hidden ${cardClasses}`}>
                                                    <button
                                                        onClick={() => toggleFaq(key)}
                                                        className="w-full flex items-center justify-between gap-4 text-left px-5 py-4 cursor-pointer"
                                                    >
                                                        <span className={`text-sm sm:text-base font-medium flex items-start gap-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                                                            <HelpCircle size={16} className="text-[#F5A623] mt-0.5 flex-shrink-0" />
                                                            {item.q}
                                                        </span>
                                                        <ChevronDown
                                                            size={18}
                                                            className={`flex-shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""} ${isDark ? "text-slate-400" : "text-slate-500"}`}
                                                        />
                                                    </button>
                                                    <div
                                                        className={`grid transition-all duration-300 ease-in-out ${
                                                            isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                                                        }`}
                                                    >
                                                        <div className="overflow-hidden">
                                                            <p className={`text-sm leading-relaxed px-5 pb-4 pl-11 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                                                                {item.a}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>
            )}

            {/* Contact Specialists */}
            <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 pb-24">
                <div
                    className={`rounded-3xl p-8 sm:p-10 border backdrop-blur-lg shadow-2xl ${
                        isDark
                            ? "bg-gradient-to-br from-slate-950/60 to-slate-900/40 border-slate-800/80 shadow-black/30"
                            : "bg-gradient-to-br from-white/90 to-slate-50/80 border-slate-200 shadow-slate-200/60"
                    }`}
                >
                    <div className="text-center mb-8">
                        <h2 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
                            Still Need Assistance?
                        </h2>
                        <p className={`text-sm sm:text-base max-w-xl mx-auto ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                            If you can't find what you're looking for, our dedicated support engineering team
                            is available around the clock.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {contactChannels.map(({ icon: Icon, label, value, sub, href }, i) => {
                            const Wrapper = href ? "a" : "div";
                            return (
                                <Wrapper
                                    key={i}
                                    {...(href ? { href } : {})}
                                    className={`rounded-2xl p-5 border backdrop-blur-md flex flex-col items-center text-center gap-2 transition-all duration-300 ${
                                        href ? "cursor-pointer hover:-translate-y-1" : ""
                                    } ${isDark ? "bg-slate-950/40 border-slate-800/60 hover:border-[#00C9B1]/40" : "bg-white/80 border-slate-200/80 hover:border-teal-400/50 shadow-sm"}`}
                                >
                                    <div className="w-11 h-11 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-[#00C9B1]">
                                        <Icon size={18} />
                                    </div>
                                    <p className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                                        {label}
                                    </p>
                                    <p className={`text-sm font-medium break-words ${isDark ? "text-white" : "text-slate-900"}`}>{value}</p>
                                    <p className="text-xs text-slate-400">{sub}</p>
                                </Wrapper>
                            );
                        })}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Support;