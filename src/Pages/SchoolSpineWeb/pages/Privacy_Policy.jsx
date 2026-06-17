import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

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

const Section = ({ id, number, title, icon, children }) => (
    <section
        id={id}
        className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8 scroll-mt-28"
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
                    <h2 className="font-heading text-xl font-bold text-white">{title}</h2>
                </div>
                <div className="mt-3 h-px bg-gradient-to-r from-teal/30 via-white/5 to-transparent" />
            </div>
        </div>

        {/* Body */}
        <div className="text-text-muted text-sm leading-7 flex flex-col gap-3 pl-14">
            {children}
        </div>
    </section>
)

const InfoBox = ({ children, type = 'info' }) => {
    const styles = {
        info: 'bg-teal/5 border-teal/20',
        warning: 'bg-gold/5 border-gold/20',
        success: 'bg-teal/[0.08] border-teal/25',
    }
    const icons = { info: 'ℹ️', warning: '⚠️', success: '✅' }
    return (
        <div className={`flex gap-3 p-4 rounded-xl border ${styles[type]} text-sm`}>
            <span className="flex-shrink-0 mt-0.5">{icons[type]}</span>
            <p className={type === 'warning' ? 'text-gold/80' : 'text-teal/80'}>{children}</p>
        </div>
    )
}

const DataCard = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {items.map(({ label, value }) => (
            <div key={label} className="bg-white/[0.03] border border-white/[0.07] rounded-xl px-4 py-3">
                <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1">{label}</p>
                <p className="text-sm text-white font-medium break-all">{value}</p>
            </div>
        ))}
    </div>
)

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Privacy_Policy = () => {
    const [activeSection, setActiveSection] = useState('introduction')
    const [scrollProgress, setScrollProgress] = useState(0)

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
        <div className="min-h-screen bg-bg-dark font-body">

            {/* ── Scroll progress ── */}
            <div
                className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-150"
                style={{
                    width: `${scrollProgress}%`,
                    background: 'linear-gradient(to right, #00C9B1, #F5A623)',
                }}
            />

            {/* ══════════════════════════════════════════════════════
                HERO
            ══════════════════════════════════════════════════════ */}
            <div className="relative overflow-hidden">

                {/* Background glow blobs */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(0,201,177,0.07),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(245,166,35,0.05),transparent)]" />
                <div className="absolute top-16 right-24 w-56 h-56 rounded-full bg-teal/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-16  md:pb-20">

                    {/* Breadcrumb */}
                    <div
                        className="flex items-center gap-2 text-sm text-text-muted mb-8"
                        style={{ animation: 'fadeDown 0.45s ease both' }}
                    >
                        <Link to="/" className="hover:text-teal transition-colors">Home</Link>
                        <span className="text-white/20">/</span>
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
                        className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-4"
                        style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}
                    >
                        Privacy{' '}
                        <span className="text-grad-teal-gold">Policy</span>
                    </h1>

                    {/* Subtitle */}
                    <p
                        className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed mb-10"
                        style={{ animation: 'fadeUp 0.5s ease 0.22s both' }}
                    >
                        At SchoolSpine we take your privacy seriously. This document explains how we
                        collect, use, store, and protect your personal information across all our services.
                    </p>

                    {/* Meta pills */}
                    <div
                        className="flex flex-wrap gap-4 text-sm"
                        style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
                    >
                        {[
                            { emoji: '📅', label: 'Last Updated', value: 'June 2026' },
                            { emoji: '🏢', label: 'Controller', value: 'ComputeSoftTechnologies' },
                            { emoji: '📍', label: 'Jurisdiction', value: 'Lucknow, India' },
                        ].map(({ emoji, label, value }) => (
                            <div
                                key={label}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-text-muted"
                            >
                                <span>{emoji}</span>
                                <span>{label}:</span>
                                <span className="text-white font-medium">{value}</span>
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
                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-md">
                                <p className="text-[10px] text-text-muted uppercase tracking-widest font-semibold px-2 mb-3">
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
                                                            : 'text-text-muted hover:text-white hover:bg-white/[0.04]'
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
                            <div className="bg-[linear-gradient(135deg,rgba(0,201,177,0.07),rgba(245,166,35,0.04))] border border-teal/[0.15] rounded-2xl p-4">
                                <p className="text-sm font-semibold text-white mb-1">Questions?</p>
                                <p className="text-xs text-text-muted mb-3">Reach out to our privacy team</p>
                                <a
                                    href="mailto:info@computesofttech.com"
                                    className="text-xs text-teal hover:text-teal-light transition-colors break-all"
                                >
                                    info@computesofttech.com
                                </a>
                            </div>
                        </div>
                    </aside>

                    {/* ── Content ── */}
                    <div className="flex-1 min-w-0 flex flex-col gap-5 pt-1">

                        {/* 01 · Introduction */}
                        <Section id="introduction" number="01" title="Introduction" icon="📋">
                            <p>
                                Welcome to <strong className="text-white">SchoolSpine</strong>, a comprehensive School
                                Management System operated by <strong className="text-white">ComputeSoftTechnologies</strong> ("Company",
                                "we", "our", or "us"). SchoolSpine is designed to facilitate communication, academic
                                management, attendance tracking, homework management, examinations, notifications, and
                                document sharing between schools, teachers, parents, and authorized users.
                            </p>
                            <p>
                                This Privacy Policy explains how we collect, use, store, disclose, and protect personal
                                information when you access or use the SchoolSpine website, mobile applications, and
                                related services.
                            </p>
                            <InfoBox type="info">
                                By accessing or using SchoolSpine, you acknowledge and agree to the practices described
                                in this Privacy Policy.
                            </InfoBox>
                        </Section>

                        {/* 02 · Company Information */}
                        <Section id="company-info" number="02" title="Company Information" icon="🏢">
                            <p>SchoolSpine is a product of ComputeSoftTechnologies. You may reach us through:</p>
                            <DataCard items={[
                                { label: 'Company Name', value: 'ComputeSoftTechnologies' },
                                { label: 'Brand Name', value: 'SchoolSpine' },
                                { label: 'Address', value: 'Royal Plaza, Sushant Golf City, Lucknow, UP – 226030, India' },
                                { label: 'Website', value: 'www.schoolspine.com' },
                                { label: 'Email', value: 'info@computesofttech.com' },
                                { label: 'Phone', value: '+91 9511117450' },
                            ]} />
                        </Section>

                        {/* 03 · Information We Collect */}
                        <Section id="information-collected" number="03" title="Information We Collect" icon="📊">
                            <p>We may collect and process the following categories of information:</p>
                            <div className="grid grid-cols-1 gap-3 mt-1">
                                {[
                                    {
                                        category: 'Student Information', emoji: '🎓',
                                        items: [
                                            'Student name & admission number',
                                            'Class, section & date of birth',
                                            'Academic & attendance records',
                                            'Homework & examination results',
                                            'Uploaded documents and certificates',
                                            'Parent or guardian details',
                                        ],
                                    },
                                    {
                                        category: 'Parent Information', emoji: '👨‍👩‍👧',
                                        items: [
                                            'Parent name & contact number',
                                            'Email address',
                                            'Relationship with student',
                                            'Login credentials',
                                        ],
                                    },
                                    {
                                        category: 'Teacher Information', emoji: '👩‍🏫',
                                        items: [
                                            'Name & contact information',
                                            'Employee details',
                                            'Subject assignments',
                                            'Attendance and academic records',
                                            'Login credentials',
                                        ],
                                    },
                                    {
                                        category: 'Technical Information', emoji: '💻',
                                        items: [
                                            'IP address & device information',
                                            'Browser type & operating system',
                                            'Application version',
                                            'Login activity & usage logs',
                                        ],
                                    },
                                ].map(({ category, emoji, items }) => (
                                    <div key={category} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-xl">{emoji}</span>
                                            <h4 className="text-white font-semibold text-sm">{category}</h4>
                                        </div>
                                        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                            {items.map((item) => (
                                                <li key={item} className="flex items-start gap-2 text-[13px] text-text-muted">
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
                        <Section id="how-we-use" number="04" title="How We Use Information" icon="⚙️">
                            <p>We use collected information to deliver, improve, and secure our services:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
                                {[
                                    { icon: '📚', text: 'Provide educational management services' },
                                    { icon: '✅', text: 'Manage attendance records' },
                                    { icon: '📝', text: 'Facilitate homework assignments' },
                                    { icon: '📊', text: 'Generate examination reports' },
                                    { icon: '🔔', text: 'Send notifications and announcements' },
                                    { icon: '🏫', text: 'Maintain school administration records' },
                                    { icon: '⚡', text: 'Improve platform functionality' },
                                    { icon: '🛡️', text: 'Ensure platform security' },
                                    { icon: '⚖️', text: 'Comply with legal obligations' },
                                    { icon: '🔧', text: 'Provide technical support' },
                                ].map(({ icon, text }) => (
                                    <div
                                        key={text}
                                        className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.07] rounded-xl px-4 py-3"
                                    >
                                        <span className="text-base">{icon}</span>
                                        <span className="text-[13px] text-text-muted">{text}</span>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* 05 · Data Security */}
                        <Section id="data-security" number="05" title="Data Security" icon="🔐">
                            <p>
                                We implement reasonable administrative, technical, and organizational safeguards to
                                protect information from unauthorized access, disclosure, alteration, or destruction.
                            </p>
                            <InfoBox type="warning">
                                While we strive to protect personal data, no internet-based platform can guarantee
                                absolute security. Users are encouraged to maintain strong passwords and protect their
                                login credentials.
                            </InfoBox>
                        </Section>

                        {/* 06 · Data Retention */}
                        <Section id="data-retention" number="06" title="Data Retention" icon="🗄️">
                            <p>
                                Information is retained only as long as necessary for educational, operational, legal,
                                and administrative purposes.
                            </p>
                            <p>
                                Schools may request deletion of data subject to applicable legal and operational
                                requirements. Contact us at the address below to initiate a deletion request.
                            </p>
                        </Section>

                        {/* 07 · Sharing of Information */}
                        <Section id="sharing" number="07" title="Sharing of Information" icon="🤝">
                            <InfoBox type="success">
                                We do not sell, rent, or trade personal information to any third parties.
                            </InfoBox>
                            <p className="mt-1">Information may be shared only in the following circumstances:</p>
                            <ul className="flex flex-col gap-2 mt-1">
                                {[
                                    'With authorized school administrators',
                                    'With teachers and parents as required for educational purposes',
                                    'With service providers assisting platform operations',
                                    'When required by law or government authorities',
                                    'To protect legal rights and platform security',
                                ].map((item) => (
                                    <li key={item} className="flex items-start gap-3 text-[13px] text-text-muted">
                                        <span className="mt-0.5 w-5 h-5 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center text-teal text-[10px] flex-shrink-0">
                                            ✓
                                        </span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Section>

                        {/* 08 · Children's Privacy */}
                        <Section id="childrens-privacy" number="08" title="Children's Privacy" icon="👶">
                            <p>
                                SchoolSpine is intended for educational institutions and may process information
                                relating to students under parental and school authorization.
                            </p>
                            <InfoBox type="info">
                                Schools are responsible for obtaining any required parental consent before submitting
                                student information to the platform.
                            </InfoBox>
                        </Section>

                        {/* 09 · User Responsibilities */}
                        <Section id="user-responsibilities" number="09" title="User Responsibilities" icon="👤">
                            <p>Users are responsible for maintaining the following:</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                                {[
                                    { icon: '🔑', title: 'Account Confidentiality', desc: 'Keep your credentials secure at all times' },
                                    { icon: '🛡️', title: 'Credential Protection', desc: 'Never share login details with unauthorised parties' },
                                    { icon: '✅', title: 'Accurate Information', desc: 'Ensure all provided data is truthful and up to date' },
                                    { icon: '⚖️', title: 'Lawful Use', desc: 'Use the platform in compliance with applicable laws' },
                                ].map(({ icon, title, desc }) => (
                                    <div key={title} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                                        <span className="text-2xl">{icon}</span>
                                        <p className="text-white font-semibold text-sm mt-2">{title}</p>
                                        <p className="text-text-muted text-xs mt-1">{desc}</p>
                                    </div>
                                ))}
                            </div>
                        </Section>

                        {/* 10 · Third-Party Services */}
                        <Section id="third-party" number="10" title="Third-Party Services" icon="🔗">
                            <p>
                                The platform may integrate with third-party services necessary for platform operations.
                                Such services may have independent privacy practices.
                            </p>
                            <InfoBox type="warning">
                                Users are advised to review the privacy policies of any third-party services they
                                interact with through SchoolSpine.
                            </InfoBox>
                        </Section>

                        {/* 11 · Changes */}
                        <Section id="changes" number="11" title="Changes to this Policy" icon="🔄">
                            <p>
                                We reserve the right to update this Privacy Policy at any time. Updated versions will
                                be posted on the platform with a revised effective date.
                            </p>
                            <p>
                                Continued use of SchoolSpine following any modifications constitutes acceptance of the
                                updated Privacy Policy. We encourage users to review this Policy periodically.
                            </p>
                        </Section>

                        {/* 12 · Contact */}
                        <Section id="contact" number="12" title="Contact Us" icon="✉️">
                            <p>For questions regarding this Privacy Policy, please reach out to us:</p>
                            <div className="mt-2 bg-[linear-gradient(135deg,rgba(0,201,177,0.05),rgba(245,166,35,0.03))] border border-teal/[0.15] rounded-2xl p-5 md:p-6">
                                <p className="text-white font-heading font-bold text-lg mb-5">ComputeSoftTechnologies</p>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                                    <div>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Address</p>
                                        <p className="text-sm text-white leading-6">
                                            Royal Plaza, Sushant Golf City,<br />Lucknow, UP – 226030, India
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Email</p>
                                        <a
                                            href="mailto:info@computesofttech.com"
                                            className="text-sm text-teal hover:text-teal-light transition-colors"
                                        >
                                            info@computesofttech.com
                                        </a>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-text-muted uppercase tracking-wider mb-1.5">Phone</p>
                                        <a
                                            href="tel:9511117450"
                                            className="text-sm text-teal hover:text-teal-light transition-colors"
                                        >
                                            +91 9511117450
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

export default Privacy_Policy