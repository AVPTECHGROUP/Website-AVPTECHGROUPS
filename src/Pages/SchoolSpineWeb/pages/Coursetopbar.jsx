import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, LayoutGrid, Menu, Search, X } from 'lucide-react'

// Logo mark (transparent PNG cropped from the AVP logo)
import avpMark from '../../../assets/Images/login/avp_mark.png'

/* -------------------------------------------------------------------------- */
/*  EDIT THESE: links, login button and course menu                            */
/* -------------------------------------------------------------------------- */

const NAV_LINKS = [
    { label: "Resources", to: "/blog" },
    { label: "Contact Us", to: "/contact" },
]

const LOGIN = { label: "Login", to: "/login" } // set to null to hide the button

// Where a course click goes. The course name is passed as ?search=
const courseLink = (name) => `/courses?search=${encodeURIComponent(name)}`

// Grouped from your 1-36 course list (repeated entries removed)
const CATEGORIES = [
    {
        name: "Endpoint & Device Management",
        courses: [
            "Microsoft SCCM (MECM)",
            "Microsoft Intune",
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
        courses: [
            "Microsoft Entra ID (Azure AD)",
            "Microsoft Identity & Access Admin",
            "Microsoft Defender for Identity",
        ],
    },
    {
        name: "Google Workspace",
        courses: ["Google Workspace Administration"],
    },
]

const ALL_COURSES = [...new Set(CATEGORIES.flatMap((c) => c.courses))]

/* -------------------------------------------------------------------------- */
/*  Colours (from the AVP logo: navy #0D3F7A, blue #2380CC, cyan #5CD6F5)      */
/* -------------------------------------------------------------------------- */

const BAR_BG =
    'radial-gradient(520px 150px at 88% 0%, rgba(92,214,245,0.30), transparent 70%), ' +
    'radial-gradient(420px 130px at 6% 100%, rgba(20,184,166,0.20), transparent 70%), ' +
    'linear-gradient(90deg, #0A2E5C 0%, #0D3F7A 45%, #1B57A0 100%)'

const CYAN_BTN =
    'bg-gradient-to-r from-[#5CD6F5] to-[#3AA6E8] text-[#062A55] hover:from-[#7BE0F8] hover:to-[#5CB8F0]'

/* -------------------------------------------------------------------------- */
/*  Mega menu content (used by the desktop panel and the mobile menu)          */
/* -------------------------------------------------------------------------- */

const MegaContent = ({ activeCat, setActiveCat, onNavigate }) => {
    const category = CATEGORIES[activeCat]

    return (
        <div className="grid md:grid-cols-[280px_1fr]">
            {/* Categories */}
            <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-[#0D3F7A]/40 p-2 md:flex-col md:overflow-visible md:border-b-0 md:border-r">
                {CATEGORIES.map((cat, i) => (
                    <button
                        key={cat.name}
                        type="button"
                        onMouseEnter={() => setActiveCat(i)}
                        onFocus={() => setActiveCat(i)}
                        onClick={() => setActiveCat(i)}
                        className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CD6F5] ${
                            activeCat === i
                                ? 'bg-[#5CD6F5]/15 text-[#5CD6F5] shadow-[inset_3px_0_0_#5CD6F5]'
                                : 'text-white/85 hover:bg-white/10'
                        }`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {/* Courses */}
            <div className="p-5 sm:p-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-[#9CCBF2]">
                    {category.name}
                </p>
                <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
                    {category.courses.map((course) => (
                        <Link
                            key={course}
                            to={courseLink(course)}
                            onClick={onNavigate}
                            className="border-b border-white/10 py-3.5 text-sm leading-snug text-white/90 transition-colors duration-200 hover:text-[#5CD6F5]"
                        >
                            {course}
                        </Link>
                    ))}
                </div>
                <Link
                    to="/courses"
                    onClick={onNavigate}
                    className={`mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors duration-300 ${CYAN_BTN}`}
                >
                    Show All Courses <ArrowRight size={16} />
                </Link>
            </div>
        </div>
    )
}

/* -------------------------------------------------------------------------- */
/*  Search box with live suggestions                                           */
/* -------------------------------------------------------------------------- */

const CourseSearch = ({ className = '', onDone }) => {
    const navigate = useNavigate()
    const [query, setQuery] = useState('')
    const [focused, setFocused] = useState(false)

    const results = useMemo(() => {
        const q = query.trim().toLowerCase()
        if (!q) return []
        return ALL_COURSES.filter((c) => c.toLowerCase().includes(q)).slice(0, 6)
    }, [query])

    const go = (path) => {
        setQuery('')
        setFocused(false)
        onDone?.()
        navigate(path)
    }

    const submit = (e) => {
        e.preventDefault()
        const q = query.trim()
        if (q) go(courseLink(q))
    }

    return (
        <form onSubmit={submit} role="search" className={`relative ${className}`}>
            <Search
                size={18}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/70"
            />
            <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setTimeout(() => setFocused(false), 150)}
                placeholder="Search courses"
                aria-label="Search courses"
                className="w-full rounded-xl border border-white/20 bg-white/10 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/60 transition-colors duration-200 focus:border-[#5CD6F5]/70 focus:bg-white/15 focus:outline-none"
            />

            {focused && query.trim() && (
                <ul className="topbar-menu-in absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/15 bg-[#0A2447] shadow-2xl">
                    {results.length > 0 ? (
                        results.map((c) => (
                            <li key={c}>
                                <button
                                    type="button"
                                    onMouseDown={(e) => e.preventDefault()}
                                    onClick={() => go(courseLink(c))}
                                    className="w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-white/10 hover:text-[#5CD6F5]"
                                >
                                    {c}
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-3 text-sm text-white/70">
                            No matching course. Press Enter to search all courses.
                        </li>
                    )}
                </ul>
            )}
        </form>
    )
}

/* -------------------------------------------------------------------------- */
/*  Topbar                                                                     */
/* -------------------------------------------------------------------------- */

export default function CourseTopbar() {
    const wrapRef = useRef(null)
    const location = useLocation()
    const [megaOpen, setMegaOpen] = useState(false)
    const [mobileOpen, setMobileOpen] = useState(false)
    const [activeCat, setActiveCat] = useState(0)

    const closeAll = () => {
        setMegaOpen(false)
        setMobileOpen(false)
    }

    // Close on route change
    useEffect(() => { closeAll() }, [location.pathname])

    // Close on outside click / Escape
    useEffect(() => {
        const onDown = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) closeAll()
        }
        const onKey = (e) => { if (e.key === 'Escape') closeAll() }
        document.addEventListener('mousedown', onDown)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onDown)
            document.removeEventListener('keydown', onKey)
        }
    }, [])

    const coursesButtonClass = `items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium text-white transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5CD6F5] ${
        megaOpen ? 'border-[#5CD6F5]/60 bg-white/20' : 'border-white/20 bg-white/10 hover:bg-white/15'
    }`

    return (
        <header
            ref={wrapRef}
            className="relative z-40 w-full border-b border-white/10 text-white"
            style={{ background: BAR_BG }}
        >
            <style>{`
                @keyframes topbarMenuIn {
                    0% { opacity: 0; transform: scale(0.97); filter: blur(4px); }
                    100% { opacity: 1; transform: scale(1); filter: blur(0); }
                }
                .topbar-menu-in { transform-origin: top left; animation: topbarMenuIn 0.22s ease-out both; }
                @media (prefers-reduced-motion: reduce) { .topbar-menu-in { animation: none; } }
            `}</style>

            <div className="relative mx-auto w-full max-w-350 px-6 py-3 sm:px-10 xl:px-16">
                <div className="flex items-center gap-3 lg:gap-5">
                    {/* Logo */}
                    <Link to="/" aria-label="AVP Tech Group home" className="flex shrink-0 items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white shadow-[0_4px_14px_rgba(3,20,45,0.35)]">
                            <img src={avpMark} alt="" className="h-7 w-auto select-none" />
                        </span>
                        <span className="leading-none">
                            <span className="block font-heading text-xl font-extrabold tracking-tight text-white">AVP</span>
                            <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.22em] text-[#9CCBF2]">
                                Tech Group
                            </span>
                        </span>
                    </Link>

                    {/* All Courses (desktop) */}
                    <button
                        type="button"
                        aria-haspopup="true"
                        aria-expanded={megaOpen}
                        onClick={() => setMegaOpen((o) => !o)}
                        className={`hidden lg:inline-flex ${coursesButtonClass}`}
                    >
                        <LayoutGrid size={18} className="text-[#5CD6F5]" />
                        All Courses
                        <ChevronDown size={16} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Search (desktop) */}
                    <CourseSearch className="hidden max-w-xl flex-1 lg:block" />

                    {/* Links + login (desktop) */}
                    <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Main">
                        {NAV_LINKS.map((l) => (
                            <Link
                                key={l.label}
                                to={l.to}
                                className="text-sm font-medium text-white/90 transition-colors duration-200 hover:text-[#5CD6F5]"
                            >
                                {l.label}
                            </Link>
                        ))}
                    </nav>
                    {LOGIN && (
                        <Link
                            to={LOGIN.to}
                            className={`hidden rounded-xl px-6 py-2.5 text-sm font-semibold shadow-[0_8px_24px_rgba(3,20,45,0.35)] transition-colors duration-300 lg:inline-flex ${CYAN_BTN}`}
                        >
                            {LOGIN.label}
                        </Link>
                    )}

                    {/* Menu button (mobile) */}
                    <button
                        type="button"
                        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={mobileOpen}
                        onClick={() => setMobileOpen((o) => !o)}
                        className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white lg:hidden"
                    >
                        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* Mega menu (desktop) */}
                {megaOpen && (
                    <div className="topbar-menu-in absolute left-6 right-6 top-full mt-2 hidden overflow-hidden rounded-2xl border border-white/15 bg-[#0A2447] shadow-[0_24px_60px_rgba(3,10,25,0.55)] sm:left-10 sm:right-10 lg:block xl:left-16 xl:right-16">
                        <MegaContent activeCat={activeCat} setActiveCat={setActiveCat} onNavigate={closeAll} />
                    </div>
                )}

                {/* Mobile menu */}
                {mobileOpen && (
                    <div className="topbar-menu-in mt-3 max-h-[75vh] space-y-3 overflow-y-auto rounded-2xl border border-white/15 bg-[#0A2447] p-4 shadow-2xl lg:hidden">
                        <CourseSearch onDone={closeAll} />

                        <button
                            type="button"
                            aria-expanded={megaOpen}
                            onClick={() => setMegaOpen((o) => !o)}
                            className={`flex w-full justify-between ${coursesButtonClass}`}
                        >
                            <span className="inline-flex items-center gap-2.5">
                                <LayoutGrid size={18} className="text-[#5CD6F5]" /> All Courses
                            </span>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${megaOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {megaOpen && (
                            <div className="overflow-hidden rounded-xl border border-white/15">
                                <MegaContent activeCat={activeCat} setActiveCat={setActiveCat} onNavigate={closeAll} />
                            </div>
                        )}

                        <div className="flex flex-col">
                            {NAV_LINKS.map((l) => (
                                <Link
                                    key={l.label}
                                    to={l.to}
                                    onClick={closeAll}
                                    className="border-b border-white/10 py-3 text-sm font-medium text-white/90 hover:text-[#5CD6F5]"
                                >
                                    {l.label}
                                </Link>
                            ))}
                        </div>

                        {LOGIN && (
                            <Link
                                to={LOGIN.to}
                                onClick={closeAll}
                                className={`block rounded-xl px-6 py-3 text-center text-sm font-semibold ${CYAN_BTN}`}
                            >
                                {LOGIN.label}
                            </Link>
                        )}
                    </div>
                )}
            </div>

            {/* Thin light line along the bottom edge */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#5CD6F5]/70 to-transparent" />
        </header>
    )
}