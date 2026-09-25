import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from "framer-motion";
import { Quote } from "lucide-react";

/* -------------------------------------------------------------------------- */
/*  Hover effects (set with the `effect` prop): each one moves differently     */
/*    tilt      → 3D tilt that follows the cursor                              */
/*    spotlight → a soft light that follows the cursor across the card         */
/*    lift      → card rises and rocks, accent bar sweeps in, quote icon spins */
/*    shine     → a bright diagonal sweep glides across the card               */
/*    magnetic  → card is pulled toward the cursor while the quote icon        */
/*                drifts the opposite way (depth / parallax)                   */
/* -------------------------------------------------------------------------- */

function StarRating({ rating = 5, color = "#2DD4BF" }) {
    return (
        <div className="flex gap-0.5" aria-label={`${rating} out of 5 stars`}>
            {Array.from({ length: 5 }).map((_, i) => (
                <svg
                    key={i}
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill={i < rating ? color : "none"}
                    stroke={i < rating ? color : "#94A3B8"}
                    strokeWidth="1.5"
                    className="shrink-0"
                >
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
            ))}
        </div>
    );
}

function Avatar({ name, accent }) {
    const initials = name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();

    return (
        <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 text-white"
            style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}99 100%)` }}
        >
            {initials}
        </div>
    );
}

const HOVER_TARGET = {
    tilt: { scale: 1.03 },
    spotlight: { scale: 1.02 },
    lift: { y: -14, rotate: -1.6, scale: 1.02 },
    shine: { scale: 1.04 },
    magnetic: { scale: 1.03 },
};

// Only the client's name is shown: no role, company, school or location.
export function ReviewCard({ quote, name, rating = 5, effect = "tilt", accent = "#14B8A6", isDark = true, featured = false }) {
    const reduce = useReducedMotion();
    const ref = useRef(null);
    const [hovered, setHovered] = useState(false);

    // Cursor position inside the card, from -0.5 to 0.5, smoothed with springs
    const mx = useMotionValue(0);
    const my = useMotionValue(0);
    const sx = useSpring(mx, { stiffness: 170, damping: 16, mass: 0.6 });
    const sy = useSpring(my, { stiffness: 170, damping: 16, mass: 0.6 });

    const rotateX = useTransform(sy, [-0.5, 0.5], [9, -9]);
    const rotateY = useTransform(sx, [-0.5, 0.5], [-11, 11]);
    const pullX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
    const pullY = useTransform(sy, [-0.5, 0.5], [-10, 10]);
    const iconX = useTransform(sx, [-0.5, 0.5], [12, -12]);
    const iconY = useTransform(sy, [-0.5, 0.5], [10, -10]);

    const handleMove = (e) => {
        if (reduce || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        if (!r.width || !r.height) return;
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        mx.set(px - 0.5);
        my.set(py - 0.5);
        ref.current.style.setProperty("--px", `${px * 100}%`);
        ref.current.style.setProperty("--py", `${py * 100}%`);
    };

    const handleLeave = () => {
        mx.set(0);
        my.set(0);
        setHovered(false);
    };

    const motionStyle =
        effect === "tilt"
            ? { rotateX, rotateY, transformPerspective: 900 }
            : effect === "magnetic"
            ? { x: pullX, y: pullY }
            : {};

    const on = (name) => hovered && effect === name && !reduce;

    return (
        <motion.div
            ref={ref}
            onMouseEnter={() => setHovered(true)}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            whileHover={reduce ? undefined : HOVER_TARGET[effect]}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            style={{
                ...(reduce ? {} : motionStyle),
                backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.86)",
                borderColor: hovered ? `${accent}99` : isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)",
                boxShadow: hovered
                    ? `0 24px 50px -18px ${accent}66`
                    : isDark
                    ? "0 10px 30px -18px rgba(0,0,0,0.6)"
                    : "0 10px 30px -18px rgba(15,143,130,0.28)",
                transition: "border-color 0.3s ease, box-shadow 0.3s ease",
            }}
            className={`relative flex h-full flex-col overflow-hidden rounded-3xl border backdrop-blur-md ${
                featured ? "p-7 sm:p-9" : "p-6 sm:p-7"
            }`}
        >
            {/* thin accent line along the top edge */}
            <span
                className="pointer-events-none absolute inset-x-8 top-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent}, transparent)`, opacity: 0.7 }}
            />

            {/* spotlight: light that follows the cursor */}
            <span
                className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                style={{
                    opacity: on("spotlight") ? 1 : 0,
                    background: `radial-gradient(300px circle at var(--px, 50%) var(--py, 50%), ${accent}40, transparent 65%)`,
                }}
            />

            {/* shine: diagonal sweep */}
            <span className="pointer-events-none absolute inset-0 overflow-hidden">
                <motion.span
                    className="absolute -top-1/2 h-[200%] w-1/3"
                    style={{
                        rotate: 20,
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.28), transparent)",
                    }}
                    initial={{ x: "-150%" }}
                    animate={{ x: on("shine") ? "450%" : "-150%" }}
                    transition={on("shine") ? { duration: 0.95, ease: "easeInOut" } : { duration: 0 }}
                />
            </span>

            {/* lift: accent bar that sweeps in along the bottom */}
            <motion.span
                className="pointer-events-none absolute bottom-0 left-0 h-1 w-full origin-left"
                style={{ backgroundColor: accent }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: on("lift") ? 1 : 0 }}
                transition={{ duration: 0.45, ease: "easeOut" }}
            />

            {/* header: quote icon + stars */}
            <div className="relative flex items-start justify-between gap-3">
                <motion.span
                    className="inline-flex"
                    style={effect === "magnetic" && !reduce ? { x: iconX, y: iconY } : undefined}
                    animate={{ rotate: on("lift") ? 14 : 0, scale: on("lift") ? 1.2 : 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 14 }}
                >
                    <Quote size={featured ? 40 : 30} style={{ color: accent }} strokeWidth={2} fill={`${accent}33`} />
                </motion.span>
                <StarRating rating={rating} color={accent} />
            </div>

            {/* testimonial text */}
            <p
                className={`relative mt-4 flex-1 leading-relaxed ${
                    featured ? "text-lg sm:text-xl font-medium" : "text-[15px] sm:text-base"
                }`}
                style={{ color: isDark ? "#E2E8F0" : "#334155" }}
            >
                “{quote}”
            </p>

            {/* author: name only */}
            <div className="relative mt-6 flex items-center gap-3">
                <Avatar name={name} accent={accent} />
                <p className="font-semibold text-sm sm:text-base truncate" style={{ color: isDark ? "#FFFFFF" : "#0F172A" }}>
                    {name}
                </p>
            </div>
        </motion.div>
    );
}

export default ReviewCard;