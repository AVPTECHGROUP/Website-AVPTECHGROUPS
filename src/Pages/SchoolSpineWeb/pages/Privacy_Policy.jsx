import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'

/* ─── Company details (single source of truth for this page) ────────────── */

const COMPANY = {
    name: 'AVP Tech Group',
    address: 'Royal Plaza,,Flat no. 1005 , Sushant Golf City, Lucknow, UP, India',
    addressLine1: 'Royal Plaza, Sushant Golf City,',
    addressLine2: 'Lucknow, UP, India',
    website: 'avptechgroup.com',
    email: 'info@avptechgroup.com',
    phone: '+91 96995789998',
    phoneHref: 'tel:+9196995789998',
}

const sections = [
    { id: 'introduction', label: 'Introduction', icon: '📋' },
    { id: 'company-info', label: 'Company Information', icon: '🏢' },
    { id: 'information-collected', label: 'Information We Collect', icon: '📊' },
    { id: 'how-we-use', label: 'How We Use Information', icon: '⚙️' },
    { id: 'data-security', label: 'Data Security', icon: '🔐' },
    { id: 'data-retention', label: 'Data Retention', icon: '🗄️' },
    { id: 'sharing', label: 'Sharing of Information', icon: '🤝' },
    { id: 'childrens-privacy', label: "Children's Privacy", icon: '👶' },
    { id: 'user-responsibilities', label: 'User Responsibilities', icon: '👤' },
    { id: 'third-party', label: 'Third-Party Services', icon: '🔗' },
    { id: 'changes', label: 'Policy Changes', icon: '🔄' },
    { id: 'contact', label: 'Contact Us', icon: '✉️' },
]

/* ─── Sub-components ─────────────────────────────────────────────────────── */

const Section = ({ id, number, title, icon, children, isDark }) => (
    <section
        id={id}
        className={`border rounded-2xl p-6 md:p-8 scroll-mt-28 transition-colors duration-300 ${isDark
                ? 'bg-white/[0.02] border-white/[0.08]'
                : 'bg-black/[0.02] border-black/[0.08]'
            }`}
        style={{ animation: 'fadeUp 0.5s ease both' }}
    >
        {/* Header */}
        <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center font-mono text-xs font-bold text-teal">
                {number}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xl">{icon}</span>
                    <h2 className={`font-heading text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</h2>
                </div>
                <div className={`mt-3 h-px bg-gradient-to-r from-teal/30 to-transparent ${isDark ? 'via-white/5' : 'via-black/5'}`} />
            </div>
        </div>

        {/* Body */}
        <div className={`text-sm leading-7 flex flex-col gap-3 pl-14 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            {children}
        </div>
    </section>
)

const InfoBox = ({ children, type = 'info', isDark }) => {
    const styles = {
        info: 'bg-teal/5 border-teal/20',
        warning: 'bg-gold/5 border-gold/20',
        success: 'bg-teal/[0.08] border-teal/25',
    }
    const icons = { info: 'ℹ️', warning: '⚠️', success: '✅' }
    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${styles[type]} text-sm`}>
            <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
            <p className={type === 'warning' ? 'text-amber-500' : 'text-teal/80'}>{children}</p>
        </div>
    )
}

const DataCard = ({ items, isDark }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {items.map(({ label, value }) => (
            <div key={label} className={`border rounded-xl px-4 py-3 ${isDark ? 'bg-white/[0.03] border-white/[0.07]' : 'bg-black/[0.03] border-black/[0.07]'}`}>
                <p className={`text-[10px] uppercase tracking-wider mb-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
                <p className={`text-sm font-medium break-all ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</p>
            </div>
        ))}
    </div>
)

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Privacy_Policy = () => {
    const [activeSection, setActiveSection] = useState('introduction')
    const [scrollProgress, setScrollProgress] = useState(0)

    const { theme } = useContext(UserContext);
    const isDark = theme === 'dark';

    /* Scroll progress bar */
    useEffect(() => {
        const onScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    /* Scrollspy */
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) setActiveSection(e.target.id)
                })
            },
            { rootMargin: '-20% 0px -70% 0px' }
        )
        sections.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) observer.observe(el)
        })
        return () => observer.disconnect()
    }, [])

    const scrollTo = (id) => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    return (
        <div className={`min-h-screen font-body transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

            {/* ── Scroll progress ── */}
            <div
                className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-150"
                style={{
                    width: `${scrollProgress}%`,
                    background: 'linear-gradient(to right, #2380CC, #5CD6F5)',
                }}
            />

            {/* ══════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden">
                {/* Background glow blobs */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(35,128,204,0.07),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(92,214,245,0.05),transparent)]" />
                <div className="absolute top-16 right-24 w-56 h-56 rounded-full bg-teal/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-16 md:pb-20">
                    {/* Breadcrumb */}
                    <div
                        className={`flex items-center gap-2 text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        style={{ animation: 'fadeDown 0.45s ease both' }}
                    >
                        <Link to="/" className="hover:text-teal transition-colors">Home</Link>
                        <span className={isDark ? 'text-white/20' : 'text-black/20'}>/</span>
                        <span className="text-teal">Privacy Policy</span>
                    </div>

                    {/* Live badge */}
                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/[0.06] text-teal text-[11px] font-semibold tracking-widest uppercase mb-6"
                        style={{ animation: 'fadeUp 0.45s ease 0.08s both' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                        Legal Document
                    </div>

                    {/* Title */}
                    <h1
                        className={`font-heading text-5xl md:text-7xl font-bold leading-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
                        style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}
                    >
                        Privacy{' '}
                        <span className="text-grad-teal-gold">Policy</span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className={`text-base md:text-lg max-w-2xl leading-relaxed mb-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        style={{ animation: 'fadeUp 0.5s ease 0.22s both' }}
                    >
                        At {COMPANY.name} we take your privacy seriously. This document explains how we
                        collect, use, store, and protect your personal information across all our services.
                    </p>

                    {/* Meta pills */}
                    <div
                        className="flex flex-wrap gap-4 text-sm"
                        style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
                    >
                        {[
                            { emoji: '📅', label: 'Last Updated', value: 'September 2026' },
                            { emoji: '🏢', label: 'Controller', value: COMPANY.name },
                            { emoji: '📍', label: 'Jurisdiction', value: 'Lucknow, India' },
                        ].map(({ emoji, label, value }) => (
                            <div
                                key={label}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${isDark
                                        ? 'bg-white/[0.03] border-white/[0.08] text-slate-300'
                                        : 'bg-black/[0.03] border-black/[0.08] text-slate-600'
                                    }`}
                            >
                                <span>{emoji}</span>
                                <span>{label}:</span>
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════
                MAIN LAYOUT
            ══════════════════════════════════════════════════════ */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex gap-10 xl:gap-14 relative">

                    {/* ── Sticky Sidebar ── */}
                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24 flex flex-col gap-4">

                            {/* TOC card */}
                            <div className={`border rounded-2xl p-4 backdrop-blur-md shadow-sm ${isDark ? 'bg-slate-900 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
                                <p className={`text-[10px] uppercase tracking-widest font-semibold px-2 mb-3 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                                    On This Page
                                </p>
                                <ul className="flex flex-col gap-0.5">
                                    {sections.map(({ id, label, icon }) => {
                                        const active = activeSection === id
                                        return (
                                            <li key={id}>
                                                <button
                                                    onClick={() => scrollTo(id)}
                                                    className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-200 cursor-pointer
                                                        ${active
                                                            ? 'bg-teal/10 text-teal border border-teal/20'
                                                            : isDark
                                                                ? 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                                                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                                                        }`}
                                                >
                                                    <span className="text-sm">{icon}</span>
                                                    <span className="leading-tight flex-1">{label}</span>
                                                    {active && <span className="w-1.5 h-1.5 rounded-full bg-teal flex-shrink-0" />}
                                                </button>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>

                            {/* Quick contact */}
                            <div className="bg-[linear-gradient(135deg,rgba(35,128,204,0.07),rgba(92,214,245,0.04))] border border-teal/[0.15] rounded-2xl p-4">
                                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Questions?</p>
                                <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reach out to our privacy team</p>
                                <a
                                    href={`mailto:${COMPANY.email}`}
                                    className="text-xs text-teal hover:text-teal-light transition-colors break-all"
                                >
                                    {COMPANY.email}
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* ── Content ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5 pt-1">

                        {/* 01 · Introduction */}
                        <Section id="introduction" number="01" title="Introduction" icon="📋" isDark={isDark}>
                            <p>
                                Welcome to <strong className={isDark ? 'text-white' : 'text-slate-900'}>{COMPANY.name}</strong> ("Company",
                                "we", "our", or "us"). We provide IT solutions, Microsoft certification training,
                                corporate training, and staffing services to individuals and organizations.
                            </p>
                            <p>
                                This Privacy Policy explains how we collect, use, store, disclose, and protect personal
                                information when you visit the {COMPANY.name} website, enquire about or enroll in our
                                courses, engage our IT and staffing services, or otherwise interact with us.
                            </p>
                            <InfoBox type="info" isDark={isDark}>
                                By accessing or using our website and services, you acknowledge and agree to the
                                practices described in this Privacy Policy.
                            </InfoBox>
                        </Section>

                        {/* 02 · Company Information */}
                        <Section id="company-info" number="02" title="Company Information" icon="🏢" isDark={isDark}>
                            <p>You may reach {COMPANY.name} through:</p>
                            <DataCard isDark={isDark} items={[
                                { label: 'Company Name', value: COMPANY.name },
                                { label: 'Services', value: 'IT Solutions, Certification Training, Corporate Training & Staffing' },
                                { label: 'Address', value: COMPANY.address },
                                { label: 'Website', value: COMPANY.website },
                                { label: 'Email', value: COMPANY.email },
                                { label: 'Phone', value: COMPANY.phone },
                            ]} />
                        </Section>

                        {/* 03 · Information We Collect */}
                        <Section id="information-collected" number="03" title="Information We Collect" icon="📊" isDark={isDark}>
                            <p>We may collect and process the following categories of information:</p>
                            <div className="grid grid-cols-1 gap-3 mt-1">
                                {[
                                    {
                                        category: 'Learner Information', emoji: '🎓',
                                        items: [
                                            'Name & contact details',
                                            'Email address & phone number',
                                            'Course enquiry & enrollment details',
                                            'Location & timing preferences',
                                            'Attendance & assessment records',
                                            'Mock test performance',
                                            'Certificates issued',
                                            'Login credentials (where applicable)',
                                        ],
                                    },
                                    {
                                        category: 'Client & Corporate Information', emoji: '🏢',
                                        items: [
                                            'Contact person name & designation',
                                            'Company name & work email',
                                            'Phone number',
                                            'Service and training requirements',
                                            'Support requests & project details',
                                            'Access details shared for support work',
                                        ],
                                    },
                                    {
                                        category: 'Staffing Candidate Information', emoji: '🧑‍💼',
                                        items: [
                                            'Name & contact information',
                                            'Resume or CV',
                                            'Skills, experience & qualifications',
                                            'Employment preferences',
                                            'Interview & placement records',
                                        ],
                                    },
                                    {
                                        category: 'Technical Information', emoji: '💻',
                                        items: [
                                            'IP address & device information',
                                            'Browser type & operating system',
                                            'Pages visited & usage logs',
                                            'Cookies & similar technologies',
                                        ],
                                    },
                                ].map(({ category, emoji, items }) => (
                                    <div key={category} className={`border rounded-xl p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">{emoji}</span>
                                            <h4 className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-800'}`}>{category}</h4>
                                        </div>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {items.map((item) => (
                                                <li key={item} className={`flex items-start gap-2 text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                                    <span className="text-teal mt-0.5 text-[10px]">▸</span>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* 04 · How We Use Information */}
                        <Section id="how-we-use" number="04" title="How We Use Information" icon="⚙️" isDark={isDark}>
                            <p>We use collected information to deliver, improve, and secure our services:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                                {[
                                    { icon: '📩', text: 'Respond to enquiries and requests' },
                                    { icon: '🎓', text: 'Enroll learners and deliver training' },
                                    { icon: '📜', text: 'Issue certificates and maintain training records' },
                                    { icon: '🛠️', text: 'Deliver IT solutions and technical support' },
                                    { icon: '🧑‍💼', text: 'Match candidates with staffing opportunities' },
                                    { icon: '🔔', text: 'Share course updates, schedules and notices' },
                                    { icon: '⚡', text: 'Improve website functionality and service quality' },
                                    { icon: '🛡️', text: 'Ensure platform security' },
                                    { icon: '⚖️', text: 'Comply with legal obligations' },
                                    { icon: '🔧', text: 'Provide customer support' },
                                ].map(({ icon, text }) => (
                                    <div
                                        key={text}
                                        className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}
                                    >
                                        <span className="text-base">{icon}</span>
                                        <span className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* 05 · Data Security */}
                        <Section id="data-security" number="05" title="Data Security" icon="🔐" isDark={isDark}>
                            <p>
                                We implement reasonable administrative, technical, and organizational safeguards to
                                protect information from unauthorized access, disclosure, alteration, or destruction.
                            </p>
                            <InfoBox type="warning" isDark={isDark}>
                                While we strive to protect personal data, no internet-based platform can guarantee
                                absolute security. Users are encouraged to maintain strong passwords and protect their
                                login credentials.
                            </InfoBox>
                        </Section>

                        {/* 06 · Data Retention */}
                        <Section id="data-retention" number="06" title="Data Retention" icon="🗄️" isDark={isDark}>
                            <p>
                                Information is retained only as long as necessary for training, service delivery,
                                staffing, operational, legal, and administrative purposes.
                            </p>
                            <p>
                                Learners, clients, and candidates may request deletion of their data, subject to
                                applicable legal and operational requirements. Contact us at the address below to
                                initiate a deletion request.
                            </p>
                        </Section>

                        {/* 07 · Sharing of Information */}
                        <Section id="sharing" number="07" title="Sharing of Information" icon="🤝" isDark={isDark}>
                            <InfoBox type="success" isDark={isDark}>
                                We do not sell, rent, or trade personal information to any third parties.
                            </InfoBox>
                            <p className="mt-1">Information may be shared only in the following circumstances:</p>
                            <ul className="flex flex-col gap-2 mt-1">
                                {[
                                    'With our trainers, engineers, and staff as needed to deliver services',
                                    "With client companies or prospective employers as part of staffing services, with the candidate's knowledge",
                                    'With service providers assisting operations, such as hosting, communication, and payment processing',
                                    'When required by law or government authorities',
                                    'To protect legal rights and platform security',
                                ].map((item) => (
                                    <li key={item} className={`flex items-start gap-3 text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                                        <span className="mt-0.5 w-5 h-5 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center text-teal text-[10px] flex-shrink-0">
                                            ✓
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Section>

                        {/* 08 · Children's Privacy */}
                        <Section id="childrens-privacy" number="08" title="Children's Privacy" icon="👶" isDark={isDark}>
                            <p>
                                Our services, including training courses and certifications, are intended for
                                professionals, students of legal age, and businesses. They are not directed at
                                children under 18.
                            </p>
                            <InfoBox type="info" isDark={isDark}>
                                We do not knowingly collect personal information from children. If you believe a
                                child has provided us with information, please contact us so we can take
                                appropriate action.
                            </InfoBox>
                        </Section>

                        {/* 09 · User Responsibilities */}
                        <Section id="user-responsibilities" number="09" title="User Responsibilities" icon="👤" isDark={isDark}>
                            <p>Users are responsible for maintaining the following:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                {[
                                    { icon: '🔑', title: 'Account Confidentiality', desc: 'Keep your credentials secure at all times' },
                                    { icon: '🛡️', title: 'Credential Protection', desc: 'Never share login details with unauthorised parties' },
                                    { icon: '✅', title: 'Accurate Information', desc: 'Ensure all provided data is truthful and up to date' },
                                    { icon: '⚖️', title: 'Lawful Use', desc: 'Use our website and services in compliance with applicable laws' },
                                ].map(({ icon, title, desc }) => (
                                    <div key={title} className={`border rounded-xl p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                                        <span className="text-2xl">{icon}</span>
                                        <p className={`font-semibold text-sm mt-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>{title}</p>
                                        <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* 10 · Third-Party Services */}
                        <Section id="third-party" number="10" title="Third-Party Services" icon="🔗" isDark={isDark}>
                            <p>
                                Our website and services may integrate with third-party services necessary for
                                operations, such as video conferencing, payment, and cloud platforms. Such services
                                may have independent privacy practices.
                            </p>
                            <InfoBox type="warning" isDark={isDark}>
                                Users are advised to review the privacy policies of any third-party services they
                                interact with through {COMPANY.name}.
                            </InfoBox>
                        </Section>

                        {/* 11 · Changes */}
                        <Section id="changes" number="11" title="Changes to this Policy" icon="🔄" isDark={isDark}>
                            <p>
                                We reserve the right to update this Privacy Policy at any time. Updated versions will
                                be posted on our website with a revised effective date.
                            </p>
                            <p>
                                Continued use of our website and services following any modifications constitutes
                                acceptance of the updated Privacy Policy. We encourage users to review this Policy
                                periodically.
                            </p>
                        </Section>

                        {/* 12 · Contact */}
                        <Section id="contact" number="12" title="Contact Us" icon="✉️" isDark={isDark}>
                            <p>For questions regarding this Privacy Policy, please reach out to us:</p>
                            <div className={`mt-2 border rounded-2xl p-5 md:p-6 ${isDark ? 'bg-white/[0.02] border-white/[0.15]' : 'bg-black/[0.02] border-black/[0.15]'}`}>
                                <p className={`font-heading font-bold text-lg mb-5 ${isDark ? 'text-white' : 'text-slate-900'}`}>{COMPANY.name}</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Address</p>
                                        <p className={`text-sm leading-6 ${isDark ? 'text-white' : 'text-slate-700'}`}>
                                            {COMPANY.addressLine1}<br />{COMPANY.addressLine2}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Email</p>
                                        <a
                                            href={`mailto:${COMPANY.email}`}
                                            className="text-sm text-teal hover:text-teal-light transition-colors break-all"
                                        >
                                            {COMPANY.email}
                                        </a>
                                    </div>
                                    <div>
                                        <p className={`text-[10px] uppercase tracking-wider mb-1.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Phone</p>
                                        <a
                                            href={COMPANY.phoneHref}
                                            className="text-sm text-teal hover:text-teal-light transition-colors"
                                        >
                                            {COMPANY.phone}
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </Section>

                    </div>
                </div>
            </div>

        </div>
    )
}

export default Privacy_Policy;