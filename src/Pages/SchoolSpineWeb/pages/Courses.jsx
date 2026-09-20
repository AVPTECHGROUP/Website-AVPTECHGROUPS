import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import {
    ArrowRight,
    Check,
    Cloud,
    Globe,
    KeyRound,
    Laptop,
    Layers,
    ShieldCheck,
    Smartphone,
    Server,
    Sparkles,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'

/* -------------------------------------------------------------------------- */
/*  EDIT THESE: featured course prices                                         */
/*  !! PLACEHOLDER PRICES: replace originalPrice and price with your real ones */
/*  originalPrice = the crossed-out price, price = the discounted price (INR)  */
/* -------------------------------------------------------------------------- */

const FEATURED = [
    {
        name: "Microsoft Intune",
        category: "Endpoint & Device Management",
        icon: Smartphone,
        description:
            "Manage and secure Windows, iOS and Android devices from the cloud, from enrolment and policies to app deployment and compliance.",
        originalPrice: 24999,
        price: 16999,
    },
    {
        name: "Microsoft SCCM (MECM)",
        category: "Endpoint & Device Management",
        icon: Server,
        description:
            "Deploy software, operating systems and updates across your organisation's devices, and keep every endpoint inventoried and patched.",
        originalPrice: 24999,
        price: 16999,
    },
]

// Included with every course (from your About page)
const INCLUDED = [
    "Live, instructor-led sessions",
    "Small batches, 8 learners max",
    "Course material included",
    "Certificate of attendance",
]

// Every other course, grouped like the topbar menu. Featured courses are left out here.
const CATEGORIES = [
    {
        name: "Endpoint & Device Management",
        icon: Laptop,
        color: "#3AA6E8",
        courses: [
            "Windows Autopilot",
            "Windows Autopatch",
            "Windows Update for Business",
            "Microsoft Endpoint Analytics",
            "Microsoft 365 Endpoint Administrator",
            "Microsoft Endpoint Security",
        ],
    },
    {
        name: "Security & Defender",
        icon: ShieldCheck,
        color: "#14B8A6",
        courses: [
            "Microsoft Defender XDR",
            "Microsoft Defender for Endpoint",
            "Microsoft Defender for Office 365",
            "Microsoft Defender for Identity",
            "Microsoft Defender for Cloud Apps",
            "Microsoft Defender for Cloud",
            "Microsoft Sentinel (SIEM & SOAR)",
            "Microsoft Purview",
            "Microsoft Cloud Security",
            "Microsoft 365 Security Administrator",
            "Microsoft 365 Security Deep Dive",
            "Microsoft Cloud Security Deep Dive",
        ],
    },
    {
        name: "Azure & Cloud",
        icon: Cloud,
        color: "#2380CC",
        courses: [
            "Microsoft Azure Administrator",
            "Microsoft Azure Solutions Architect",
            "Microsoft Azure Security",
            "Microsoft Azure Networking",
            "Microsoft Azure Virtual Desktop (AVD)",
            "Microsoft Azure AVD Deep Dive",
        ],
    },
    {
        name: "Microsoft 365",
        icon: Layers,
        color: "#5CD6F5",
        courses: [
            "Microsoft 365 Administration (O365)",
            "Microsoft Exchange Online",
            "Microsoft Teams Administration",
            "SharePoint Online Administration",
            "OneDrive for Business",
        ],
    },
    {
        name: "Identity & Access",
        icon: KeyRound,
        color: "#6C8CFF",
        courses: [
            "Microsoft Entra ID (Azure AD)",
            "Microsoft Identity & Access Admin",
        ],
    },
    {
        name: "Google Workspace",
        icon: Globe,
        color: "#2DD4BF",
        courses: ["Google Workspace Administration"],
    },
]

const ALL_COURSES = CATEGORIES.flatMap((cat) =>
    cat.courses.map((name) => ({ name, category: cat.name, icon: cat.icon, color: cat.color }))
)

const formatINR = (n) => `₹${new Intl.NumberFormat('en-IN').format(n)}`
const courseLink = (name) => `/courses?search=${encodeURIComponent(name)}`

/* -------------------------------------------------------------------------- */
/*  Reveal on scroll + cursor spotlight                                        */
/* -------------------------------------------------------------------------- */

const useReveal = () => {
    const ref = useRef(null)
    const [shown, setShown] = useState(false)

    useEffect(() => {
        const el = ref.current
        if (!el) return undefined
        if (typeof IntersectionObserver === 'undefined') {
            setShown(true)
            return undefined
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setShown(true)
                    io.disconnect()
                }
            },
            { threshold: 0.12 }
        )
        io.observe(el)
        return () => io.disconnect()
    }, [])

    return [ref, shown]
}

const SpotlightCard = ({ as: Tag = 'div', children, className = '', style, delay = 0, onClick, spot }) => {
    const [ref, shown] = useReveal()

    const onMove = (e) => {
        const r = e.currentTarget.getBoundingClientRect()
        e.currentTarget.style.setProperty('--mx', `${e.clientX - r.left}px`)
        e.currentTarget.style.setProperty('--my', `${e.clientY - r.top}px`)
    }

    return (
        <Tag
            ref={ref}
            type={Tag === 'button' ? 'button' : undefined}
            onMouseMove={onMove}
            onClick={onClick}
            className={`pr-card ${shown ? 'is-in' : ''} relative ${className}`}
            style={{ '--d': `${delay}ms`, '--spot': spot || 'rgba(58,166,232,0.18)', ...style }}
        >
            {children}
            <span className="pr-spot pointer-events-none absolute inset-0" style={{ borderRadius: 'inherit' }} />
        </Tag>
    )
}

/* -------------------------------------------------------------------------- */
/*  Featured course card (price, crossed-out price, discounted price)          */
/* -------------------------------------------------------------------------- */

const FeaturedCard = ({ course, index, isDark, onOpen }) => {
    const Icon = course.icon
    const off = Math.round((1 - course.price / course.originalPrice) * 100)
    const saved = course.originalPrice - course.price

    return (
        <SpotlightCard
            delay={index * 120}
            onClick={() => onOpen(course.name)}
            className="cursor-pointer rounded-[26px] p-[1.5px]"
            style={{ background: 'linear-gradient(135deg, #5CD6F5 0%, #2380CC 45%, #14B8A6 100%)' }}
        >
            <article
                className="relative flex h-full flex-col overflow-hidden rounded-[24.5px] p-6 sm:p-7"
                style={{ backgroundColor: isDark ? '#071329' : '#ffffff' }}
            >
                {/* corner glow */}
                <div
                    className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                    style={{ background: 'radial-gradient(circle, rgba(58,166,232,0.28), transparent 70%)' }}
                />

                <div className="relative flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div
                            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white"
                            style={{ background: 'linear-gradient(135deg, #3AA6E8, #0D3F7A)' }}
                        >
                            <Icon size={22} />
                        </div>
                        <span
                            className="rounded-full border px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest"
                            style={{
                                color: isDark ? '#5CD6F5' : '#0D3F7A',
                                borderColor: isDark ? 'rgba(92,214,245,0.35)' : 'rgba(13,63,122,0.25)',
                                backgroundColor: isDark ? 'rgba(92,214,245,0.08)' : 'rgba(35,128,204,0.07)',
                            }}
                        >
                            Featured
                        </span>
                    </div>

                    <span
                        className="rounded-full px-3 py-1 text-xs font-extrabold"
                        style={{ background: 'linear-gradient(90deg, #5CD6F5, #2DD4BF)', color: '#062A55' }}
                    >
                        {off}% OFF
                    </span>
                </div>

                <h3
                    className="relative mt-5 font-heading text-2xl font-extrabold tracking-tight sm:text-3xl"
                    style={{ color: isDark ? '#ffffff' : '#0f172a' }}
                >
                    {course.name}
                </h3>
                <p className="relative mt-1 text-xs font-semibold uppercase tracking-wider" style={{ color: isDark ? '#5CD6F5' : '#2380CC' }}>
                    {course.category}
                </p>
                <p className="relative mt-3 text-sm leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                    {course.description}
                </p>

                <ul className="relative mt-5 grid gap-2.5 sm:grid-cols-2">
                    {INCLUDED.map((item) => (
                        <li key={item} className="flex items-center gap-2 text-[13px] font-medium" style={{ color: isDark ? '#cbd5e1' : '#334155' }}>
                            <span
                                className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full"
                                style={{
                                    backgroundColor: isDark ? 'rgba(45,212,191,0.18)' : '#D1F7F3',
                                    color: isDark ? '#2DD4BF' : '#0F8F82',
                                }}
                            >
                                <Check size={10} strokeWidth={3.5} />
                            </span>
                            {item}
                        </li>
                    ))}
                </ul>

                {/* Price */}
                <div
                    className="relative mt-6 flex flex-wrap items-end justify-between gap-4 border-t pt-5"
                    style={{ borderColor: isDark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)' }}
                >
                    <div>
                        <div className="flex items-baseline gap-3">
                            <span
                                className="text-lg font-semibold line-through decoration-2"
                                style={{ color: isDark ? '#64748b' : '#94a3b8', textDecorationColor: '#F87171' }}
                            >
                                {formatINR(course.originalPrice)}
                            </span>
                            <span
                                className="font-heading text-4xl font-extrabold tracking-tight sm:text-[44px]"
                                style={{ color: isDark ? '#ffffff' : '#0D3F7A' }}
                            >
                                {formatINR(course.price)}
                            </span>
                        </div>
                        <p className="mt-1 text-xs font-semibold" style={{ color: isDark ? '#2DD4BF' : '#0F8F82' }}>
                            You save {formatINR(saved)} · per learner
                        </p>
                    </div>

                    <span
                        className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-transform duration-300 group-hover:translate-x-0.5"
                        style={{ background: 'linear-gradient(90deg, #5CD6F5 0%, #3AA6E8 100%)', color: '#062A55' }}
                    >
                        View Course Details <ArrowRight size={16} />
                    </span>
                </div>
            </article>
        </SpotlightCard>
    )
}

/* -------------------------------------------------------------------------- */
/*  Section                                                                    */
/* -------------------------------------------------------------------------- */

export default function Pricing() {
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'
    const navigate = useNavigate()
    const [filter, setFilter] = useState('All')

    const open = (name) => navigate(courseLink(name))

    const visible = useMemo(
        () => (filter === 'All' ? ALL_COURSES : ALL_COURSES.filter((c) => c.category === filter)),
        [filter]
    )

    const muted = isDark ? '#94a3b8' : '#475569'
    const heading = isDark ? '#ffffff' : '#0f172a'

    return (
        <section
            id="pricing-section"
            className="relative overflow-hidden py-14 font-body transition-colors duration-300 sm:py-20 lg:py-24"
            style={{
                backgroundColor: isDark ? '#020713' : '#F8FAFC',
                color: isDark ? '#f1f5f9' : '#0f172a',
            }}
        >
            <style>{`
                .pr-card {
                    opacity: 0;
                    transform: scale(0.97);
                    filter: blur(6px);
                    transition:
                        opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms),
                        transform 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms),
                        filter 0.7s cubic-bezier(0.16, 1, 0.3, 1) var(--d, 0ms),
                        border-color 0.3s ease,
                        box-shadow 0.3s ease;
                }
                .pr-card.is-in { opacity: 1; transform: none; filter: none; }
                .pr-spot {
                    opacity: 0;
                    transition: opacity 0.3s ease;
                    background: radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), var(--spot), transparent 65%);
                }
                .pr-card:hover .pr-spot { opacity: 1; }
                @media (prefers-reduced-motion: reduce) {
                    .pr-card { opacity: 1 !important; transform: none !important; filter: none !important;
                        transition: border-color 0.3s ease, box-shadow 0.3s ease !important; }
                }
            `}</style>

            {/* Ambient glows (logo blue + teal) */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div
                    className="absolute -top-32 left-1/4 h-[500px] w-[750px] rounded-full blur-[150px]"
                    style={{
                        opacity: isDark ? 0.28 : 0.13,
                        background: 'radial-gradient(circle, #2380CC 0%, #0D3F7A 55%, transparent 100%)',
                    }}
                />
                <div
                    className="absolute -right-24 top-1/3 h-[500px] w-[500px] rounded-full blur-[140px]"
                    style={{
                        opacity: isDark ? 0.2 : 0.1,
                        background: 'radial-gradient(circle, #14B8A6 0%, #0369a1 60%, transparent 80%)',
                    }}
                />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* ── HEADER ── */}
                <div className="mx-auto max-w-3xl text-center">
                    <div
                        className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-widest shadow-sm sm:text-xs"
                        style={{
                            backgroundColor: isDark ? 'rgba(58,166,232,0.1)' : '#EAF4FD',
                            borderColor: isDark ? 'rgba(58,166,232,0.35)' : 'rgba(35,128,204,0.4)',
                            color: isDark ? '#5CD6F5' : '#1B57A0',
                        }}
                    >
                        <Sparkles size={13} />
                        <span>Courses &amp; Pricing</span>
                    </div>

                    <h2
                        className="font-heading text-3xl font-extrabold leading-[1.15] tracking-tight sm:text-4xl lg:text-5xl"
                        style={{ color: heading }}
                    >
                        Live Microsoft Training.{' '}
                        <span className="bg-gradient-to-r from-[#2380CC] via-[#3AA6E8] to-[#14B8A6] bg-clip-text text-transparent">
                            Transparent Pricing.
                        </span>
                    </h2>

                    <p className="mx-auto mt-4 max-w-xl text-sm sm:text-base" style={{ color: muted }}>
                        The price you see is the price you pay. Course material and a certificate of attendance are included with every course.
                    </p>
                </div>

                {/* ── FEATURED COURSES ── */}
                <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                    {FEATURED.map((course, i) => (
                        <FeaturedCard key={course.name} course={course} index={i} isDark={isDark} onOpen={open} />
                    ))}
                </div>

                {/* ── ALL OTHER COURSES ── */}
                <div className="mt-16 sm:mt-20">
                    <div className="flex flex-col items-center text-center">
                        <h3 className="font-heading text-2xl font-extrabold sm:text-4xl" style={{ color: heading }}>
                            More Courses We{' '}
                            <span className="bg-gradient-to-r from-[#2380CC] via-[#3AA6E8] to-[#14B8A6] bg-clip-text text-transparent">
                                Offer
                            </span>
                        </h3>
                        <p className="mt-2 max-w-md text-xs sm:text-sm" style={{ color: muted }}>
                            Pick a course to see its details and upcoming batches.
                        </p>
                    </div>

                    {/* Category filter */}
                    <div className="mt-7 flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Filter courses by category">
                        {['All', ...CATEGORIES.map((c) => c.name)].map((name) => {
                            const active = filter === name
                            const count = name === 'All' ? ALL_COURSES.length : ALL_COURSES.filter((c) => c.category === name).length
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    aria-pressed={active}
                                    onClick={() => setFilter(name)}
                                    className="rounded-full border px-4 py-2 text-xs font-semibold transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AA6E8] sm:text-[13px]"
                                    style={
                                        active
                                            ? {
                                                  background: 'linear-gradient(90deg, #2380CC, #14B8A6)',
                                                  borderColor: 'transparent',
                                                  color: '#ffffff',
                                              }
                                            : {
                                                  backgroundColor: isDark ? 'rgba(7,19,41,0.85)' : '#ffffff',
                                                  borderColor: isDark ? 'rgba(148,163,184,0.25)' : 'rgba(203,213,225,0.9)',
                                                  color: isDark ? '#cbd5e1' : '#334155',
                                              }
                                    }
                                >
                                    {name} <span className="opacity-70">({count})</span>
                                </button>
                            )
                        })}
                    </div>

                    {/* Course cards */}
                    <div
                        key={filter}
                        className="mt-8 grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4"
                    >
                        {visible.map((course, i) => {
                            const Icon = course.icon
                            return (
                                <SpotlightCard
                                    as="button"
                                    key={course.name}
                                    delay={Math.min(i * 40, 360)}
                                    spot={`${course.color}2E`}
                                    onClick={() => open(course.name)}
                                    className="group flex cursor-pointer items-center gap-3.5 rounded-2xl border p-4 text-left shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AA6E8]"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(7,19,41,0.85)' : '#ffffff',
                                        borderColor: isDark ? 'rgba(30,41,59,0.95)' : 'rgba(226,232,240,0.95)',
                                    }}
                                >
                                    <div
                                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border"
                                        style={{
                                            color: course.color,
                                            backgroundColor: `${course.color}1A`,
                                            borderColor: `${course.color}4D`,
                                        }}
                                    >
                                        <Icon size={19} />
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h4
                                            className="line-clamp-2 text-sm font-bold leading-snug"
                                            style={{ color: isDark ? '#f8fafc' : '#0f172a' }}
                                        >
                                            {course.name}
                                        </h4>
                                        <p className="mt-0.5 truncate text-[11px]" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                            {course.category}
                                        </p>
                                    </div>

                                    <ArrowRight
                                        size={16}
                                        className="shrink-0 transition-transform duration-300 group-hover:translate-x-1"
                                        style={{ color: course.color }}
                                    />
                                </SpotlightCard>
                            )
                        })}
                    </div>

                    {/* Bottom actions */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
                        <button
                            type="button"
                            onClick={() => navigate('/courses')}
                            className="inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-bold transition-transform duration-300 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AA6E8] sm:text-base"
                            style={{
                                background: 'linear-gradient(90deg, #5CD6F5 0%, #3AA6E8 100%)',
                                color: '#062A55',
                                boxShadow: '0 8px 24px rgba(58,166,232,0.3)',
                            }}
                        >
                            View All Courses <ArrowRight size={17} />
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/contact')}
                            className="inline-flex items-center gap-2 rounded-xl border px-7 py-3.5 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3AA6E8] sm:text-base"
                            style={{
                                borderColor: isDark ? 'rgba(92,214,245,0.45)' : 'rgba(35,128,204,0.5)',
                                color: isDark ? '#5CD6F5' : '#1B57A0',
                            }}
                        >
                            Talk to Our Experts
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}