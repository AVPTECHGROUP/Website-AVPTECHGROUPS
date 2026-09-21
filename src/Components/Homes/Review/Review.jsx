import React, { useContext } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ReviewCard } from "./ReviewCard";
import { UserContext } from "../../../ContextAPI/UserContext";

/* -------------------------------------------------------------------------- */
/*  !! PLACEHOLDER REVIEWS !!                                                  */
/*  The names and quotes below are sample text so you can see the design.      */
/*  Replace them with real feedback from your clients (with their permission)  */
/*  before publishing. Only the client's NAME is shown on the cards: no role,  */
/*  company, school or country.                                                */
/*                                                                             */
/*  effect = the hover motion of that card: tilt | spotlight | lift | shine |  */
/*           magnetic                                                          */
/* -------------------------------------------------------------------------- */

const reviews = [
    {
        quote:
            "The Intune course was hands-on from the very first session. I went from reading documentation to deploying policies and Autopilot profiles on my own.",
        name: "Michael Turner",
        effect: "tilt",
        accent: "#14B8A6",
        featured: true,
        layout: "md:col-span-2 lg:col-span-3 lg:row-span-2",
        from: { x: -70, y: 0 },
    },
    {
        quote: "Small batches meant every question got answered, and the labs made the theory stick.",
        name: "Priya Nair",
        effect: "spotlight",
        accent: "#2380CC",
        layout: "lg:col-span-3",
        from: { x: 70, y: -20 },
    },
    {
        quote:
            "AVP Tech Group fixed a device management problem our team had been fighting for weeks, and explained the fix as they went.",
        name: "Daniel Brooks",
        effect: "lift",
        accent: "#2DD4BF",
        layout: "lg:col-span-3",
        from: { x: 70, y: 30 },
    },
    {
        quote: "Clear trainers, real labs and course material I still refer back to at work.",
        name: "Ananya Verma",
        effect: "shine",
        accent: "#3AA6E8",
        layout: "lg:col-span-3",
        from: { x: -50, y: 60 },
    },
    {
        quote:
            "Professional, responsive and practical. Exactly what our team needed to get up to speed on Defender.",
        name: "Emily Carter",
        effect: "magnetic",
        accent: "#5CD6F5",
        layout: "lg:col-span-3",
        from: { x: 50, y: 60 },
    },
];

// Drifting colour blobs behind the cards (teal / mint / azure, taken from the course cards)
const orbs = [
    { color: "#14B8A6", size: 520, top: "-8%", left: "-6%", dx: 60, dy: 40, duration: 18 },
    { color: "#2380CC", size: 420, top: "55%", left: "78%", dx: -50, dy: -40, duration: 22 },
    { color: "#2DD4BF", size: 380, top: "10%", left: "70%", dx: -40, dy: 50, duration: 20 },
];

const Review = () => {
    const { theme } = useContext(UserContext);
    const isDark = theme === "dark";
    const reduce = useReducedMotion();

    return (
        // id="reviews-section" is what the footer's "Reviews" link scrolls to
        <section
            id="reviews-section"
            className="relative w-full overflow-hidden py-16 sm:py-20 transition-colors duration-300"
            style={{
                background: isDark
                    ? "linear-gradient(135deg, #04201E 0%, #062B29 50%, #083634 100%)"
                    : "linear-gradient(135deg, #ECFDF8 0%, #F0FDFA 50%, #E8F7FB 100%)",
            }}
        >
            {/* Drifting colour blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {orbs.map((o, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full blur-[110px]"
                        style={{
                            width: o.size,
                            height: o.size,
                            top: o.top,
                            left: o.left,
                            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
                            opacity: isDark ? 0.28 : 0.22,
                        }}
                        animate={reduce ? undefined : { x: [0, o.dx, 0], y: [0, o.dy, 0] }}
                        transition={{ duration: o.duration, repeat: Infinity, ease: "easeInOut" }}
                    />
                ))}
                {/* dot grid */}
                <div
                    className="absolute inset-0"
                    style={{
                        backgroundImage: isDark
                            ? "radial-gradient(rgba(255,255,255,0.07) 1px, transparent 1px)"
                            : "radial-gradient(rgba(15,143,130,0.14) 1px, transparent 1px)",
                        backgroundSize: "30px 30px",
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-4 sm:px-6">
                {/* Heading */}
                <motion.div
                    initial={reduce ? false : { opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                    className="mb-12 flex flex-col items-center gap-4 text-center"
                >
                    <span
                        className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide sm:text-sm"
                        style={{
                            color: isDark ? "#5EEAD4" : "#0F766E",
                            borderColor: isDark ? "rgba(94,234,212,0.30)" : "rgba(15,118,110,0.25)",
                            backgroundColor: isDark ? "rgba(94,234,212,0.08)" : "rgba(20,184,166,0.10)",
                        }}
                    >
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-teal-400" />
                        Client Reviews
                    </span>

                    <h2
                        className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl"
                        style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}
                    >
                        Loved by{" "}
                        <span
                            className={`bg-gradient-to-r bg-clip-text text-transparent ${
                                isDark ? "from-[#2DD4BF] to-[#3AA6E8]" : "from-[#0F8F82] to-[#1B57A0]"
                            }`}
                        >
                            learners &amp; teams
                        </span>
                    </h2>

                    <p className="max-w-xl text-base sm:text-lg" style={{ color: isDark ? "#9FC5C1" : "#475569" }}>
                        Hear from the professionals and businesses we&apos;ve trained and supported.
                    </p>
                </motion.div>

                {/* Bento grid of five cards */}
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-6 lg:gap-6">
                    {reviews.map((r, i) => (
                        // 1) entrance: each card slides in from a different direction
                        <motion.div
                            key={r.name}
                            className={`${r.layout} h-full`}
                            initial={reduce ? false : { opacity: 0, scale: 0.92, ...r.from }}
                            whileInView={{ opacity: 1, scale: 1, x: 0, y: 0 }}
                            viewport={{ once: true, margin: "-60px" }}
                            transition={{ type: "spring", stiffness: 90, damping: 16, delay: i * 0.1 }}
                        >
                            {/* 2) idle motion: slow, gentle floating (each card on its own rhythm) */}
                            <motion.div
                                className="h-full"
                                animate={reduce ? undefined : { y: [0, -7, 0] }}
                                transition={{ duration: 5 + (i % 3), repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }}
                            >
                                {/* 3) hover motion: different for every card (see ReviewCard) */}
                                <ReviewCard
                                    quote={r.quote}
                                    name={r.name}
                                    effect={r.effect}
                                    accent={r.accent}
                                    featured={r.featured}
                                    isDark={isDark}
                                />
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Review;