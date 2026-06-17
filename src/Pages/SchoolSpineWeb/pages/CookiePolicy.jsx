import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const sections = [
    { id: 'introduction', label: 'Introduction', icon: '📋' },
    { id: 'company-info', label: 'Company Information', icon: '🏢' },
    { id: 'what-are-cookies', label: 'What Are Cookies?', icon: '🍪' },
    { id: 'why-we-use', label: 'Why We Use Cookies', icon: '🎯' },
    { id: 'types-of-cookies', label: 'Types of Cookies', icon: '🗂️' },
    { id: 'mobile-app', label: 'Mobile App Technologies', icon: '📱' },
    { id: 'third-party', label: 'Third-Party Services', icon: '🔗' },
    { id: 'managing-cookies', label: 'Managing Cookies', icon: '⚙️' },
    { id: 'data-protection', label: 'Data Protection', icon: '🔐' },
    { id: 'childrens-info', label: "Children's Information", icon: '👶' },
    { id: 'changes', label: 'Policy Changes', icon: '🔄' },
    { id: 'contact', label: 'Contact Us', icon: '✉️' },
]

/* ─── Sub-components (mirrors Privacy Policy page) ──────────────────────── */

const Section = ({ id, number, title, icon, children }) => (
    <section
        id={id}
        className="bg-white/[0.02] border border-white/[0.08] rounded-2xl p-6 md:p-8 scroll-mt-28"
        style={{ animation: 'fadeUp 0.5s ease both' }}
    >
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

const CheckList = ({ items }) => (
    <ul className="flex flex-col gap-2 mt-1">
        {items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-[13px] text-text-muted">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center text-teal text-[10px] flex-shrink-0">
                    ✓
                </span>
                {item}
            </li>
        ))}
    </ul>
)

const IconGrid = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        {items.map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.07] rounded-xl px-4 py-3">
                <span className="text-base">{icon}</span>
                <span className="text-[13px] text-text-muted">{text}</span>
            </div>
        ))}
    </div>
)

const CategoryCard = ({ category, emoji, items, note }) => (
    <div className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
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
        {note && <p className="text-[12px] text-text-muted/80 mt-3 italic">{note}</p>}
    </div>
)

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Cookie_Policy = () => {
    const [activeSection, setActiveSection] = useState('introduction')
    const [scrollProgress, setScrollProgress] = useState(0)

    useEffect(() => {
        const onScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight
            setScrollProgress(total > 0 ? (window.scrollY / total) * 100 : 0)
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

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

            <div
                className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-150"
                style={{
                    width: `${scrollProgress}%`,
                    background: 'linear-gradient(to right, #00C9B1, #F5A623)',
                }}
            />

            {/* ══════════════════ HERO ══════════════════ */}
            <div className="relative overflow-hidden">

                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(0,201,177,0.07),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(245,166,35,0.05),transparent)]" />
                <div className="absolute top-16 right-24 w-56 h-56 rounded-full bg-teal/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-16  md:pb-20">

                    <div
                        className="flex items-center gap-2 text-sm text-text-muted mb-8"
                        style={{ animation: 'fadeDown 0.45s ease both' }}
                    >
                        <Link to="/" className="hover:text-teal transition-colors">Home</Link>
                        <span className="text-white/20">/</span>
                        <span className="text-teal">Cookie Policy</span>
                    </div>

                    <div
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-teal/20 bg-teal/[0.06] text-teal text-[11px] font-semibold tracking-widest uppercase mb-6"
                        style={{ animation: 'fadeUp 0.45s ease 0.08s both' }}
                    >
                        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
                        Legal Document
                    </div>

                    <h1
                        className="font-heading text-5xl md:text-7xl font-bold text-white leading-tight mb-4"
                        style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}
                    >
                        Cookie{' '}
                        <span className="text-grad-teal-gold">Policy</span>
                    </h1>

                    <p
                        className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed mb-10"
                        style={{ animation: 'fadeUp 0.5s ease 0.22s both' }}
                    >
                        This Policy explains how SchoolSpine uses cookies and similar technologies
                        across our website, mobile applications, and related services.
                    </p>

                    <div
                        className="flex flex-wrap gap-4 text-sm"
                        style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
                    >
                        {[
                            { emoji: '📅', label: 'Last Updated', value: 'June 2026' },
                            { emoji: '🏢', label: 'Operator', value: 'ComputeSoftTechnologies' },
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

            {/* ══════════════════ MAIN LAYOUT ══════════════════ */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex gap-10 xl:gap-14 relative">

                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24 flex flex-col gap-4">

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

                            <div className="bg-[linear-gradient(135deg,rgba(0,201,177,0.07),rgba(245,166,35,0.04))] border border-teal/[0.15] rounded-2xl p-4">
                                <p className="text-sm font-semibold text-white mb-1">Questions?</p>
                                <p className="text-xs text-text-muted mb-3">Reach out to our team</p>
                                <a
                                    href="mailto:info@computesofttech.com"
                                    className="text-xs text-teal hover:text-teal-light transition-colors break-all"
                                >
                                    info@computesofttech.com
                                </a>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0 flex flex-col gap-5 pt-1">

                        {/* 01 */}
                        <Section id="introduction" number="01" title="Introduction" icon="📋">
                            <p>
                                This Cookie Policy explains how <strong className="text-white">SchoolSpine</strong>,
                                a product of <strong className="text-white">ComputeSoftTechnologies</strong>, uses cookies
                                and similar technologies on its website, mobile applications, and related services.
                            </p>
                            <p>
                                This Policy should be read together with our{' '}
                                <Link to="/privacy-policy" className="text-teal hover:text-teal-light transition-colors">Privacy Policy</Link>
                                {' '}and{' '}
                                <Link to="/terms" className="text-teal hover:text-teal-light transition-colors">Terms of Service</Link>.
                            </p>
                            <InfoBox type="info">
                                By continuing to use SchoolSpine, you consent to the use of cookies and similar
                                technologies as described in this Policy.
                            </InfoBox>
                        </Section>

                        {/* 02 */}
                        <Section id="company-info" number="02" title="Company Information" icon="🏢">
                            <p>You may reach ComputeSoftTechnologies through:</p>
                            <DataCard items={[
                                { label: 'Company Name', value: 'ComputeSoftTechnologies' },
                                { label: 'Brand Name', value: 'SchoolSpine' },
                                { label: 'Address', value: 'Royal Plaza, Sushant Golf City, Lucknow, UP – 226030, India' },
                                { label: 'Website', value: 'schoolspine.com' },
                                { label: 'Email', value: 'info@computesofttech.com' },
                                { label: 'Phone', value: '+91 9511117450' },
                            ]} />
                        </Section>

                        {/* 03 */}
                        <Section id="what-are-cookies" number="03" title="What Are Cookies?" icon="🍪">
                            <p>
                                Cookies are small text files stored on your device when you visit a website or
                                use certain online services. Cookies help websites remember user preferences,
                                improve functionality, enhance security, and provide a better user experience.
                            </p>
                            <p>
                                Cookies do not typically contain information that personally identifies users,
                                but they may be linked to information stored in user accounts.
                            </p>
                        </Section>

                        {/* 04 */}
                        <Section id="why-we-use" number="04" title="Why We Use Cookies" icon="🎯">
                            <p>SchoolSpine uses cookies and similar technologies to:</p>
                            <IconGrid items={[
                                { icon: '🔒', text: 'Maintain secure user sessions' },
                                { icon: '🔑', text: 'Authenticate users during login' },
                                { icon: '⚙️', text: 'Remember user preferences' },
                                { icon: '⚡', text: 'Improve website performance' },
                                { icon: '📊', text: 'Analyze platform usage' },
                                { icon: '✨', text: 'Enhance user experience' },
                                { icon: '🛡️', text: 'Detect security threats & unauthorized access' },
                                { icon: '✅', text: 'Ensure proper platform functionality' },
                            ]} />
                        </Section>

                        {/* 05 */}
                        <Section id="types-of-cookies" number="05" title="Types of Cookies We Use" icon="🗂️">
                            <div className="grid grid-cols-1 gap-3 mt-1">
                                <CategoryCard
                                    category="Essential Cookies"
                                    emoji="🔑"
                                    items={[
                                        'User authentication',
                                        'Session management',
                                        'Security verification',
                                        'Login maintenance',
                                        'System access control',
                                    ]}
                                    note="These cookies are necessary for the operation of the platform and cannot be disabled. Without them, certain features of SchoolSpine may not function properly."
                                />
                                <CategoryCard
                                    category="Performance & Analytics Cookies"
                                    emoji="📊"
                                    items={[
                                        'Pages visited',
                                        'Time spent on pages',
                                        'Device information',
                                        'Browser information',
                                        'Application performance metrics',
                                    ]}
                                    note="This information helps us understand how users interact with our platform and improve performance and usability."
                                />
                                <CategoryCard
                                    category="Functional Cookies"
                                    emoji="🎛️"
                                    items={[
                                        'Language preferences',
                                        'User settings',
                                        'Dashboard preferences',
                                        'Notification settings',
                                    ]}
                                    note="These cookies enable enhanced functionality and personalization, improving the overall user experience."
                                />
                                <CategoryCard
                                    category="Security Cookies"
                                    emoji="🛡️"
                                    items={[
                                        'Prevent unauthorized access',
                                        'Detect suspicious activities',
                                        'Protect user accounts',
                                        'Maintain system integrity',
                                    ]}
                                    note="These cookies are critical to safeguarding school and student information."
                                />
                            </div>
                        </Section>

                        {/* 06 */}
                        <Section id="mobile-app" number="06" title="Mobile Application Technologies" icon="📱">
                            <p>The SchoolSpine mobile application may use technologies similar to cookies, including:</p>
                            <CheckList items={[
                                'Device identifiers',
                                'Application storage',
                                'Session tokens',
                                'Security authentication tokens',
                            ]} />
                            <p>These technologies are used to provide secure access and improve application performance.</p>
                        </Section>

                        {/* 07 */}
                        <Section id="third-party" number="07" title="Third-Party Services" icon="🔗">
                            <p>SchoolSpine may use trusted third-party services that may place cookies or collect limited technical information to support:</p>
                            <CheckList items={[
                                'Platform analytics',
                                'Performance monitoring',
                                'Security services',
                                'Cloud infrastructure',
                            ]} />
                            <p>Such third-party providers are contractually required to maintain appropriate safeguards for user information.</p>
                            <InfoBox type="success">
                                We do not sell user data to advertisers or marketing companies.
                            </InfoBox>
                        </Section>

                        {/* 08 */}
                        <Section id="managing-cookies" number="08" title="Managing Cookies" icon="⚙️">
                            <p>Most web browsers allow users to:</p>
                            <CheckList items={[
                                'View stored cookies',
                                'Delete cookies',
                                'Block cookies',
                                'Configure cookie preferences',
                            ]} />
                            <InfoBox type="warning">
                                Please note that disabling certain cookies may affect the functionality, security,
                                and performance of SchoolSpine.
                            </InfoBox>
                        </Section>

                        {/* 09 */}
                        <Section id="data-protection" number="09" title="Data Protection" icon="🔐">
                            <p>
                                Information collected through cookies is protected using appropriate technical
                                and organizational security measures.
                            </p>
                            <p>
                                We take reasonable precautions to prevent unauthorized access, misuse, disclosure,
                                alteration, or destruction of information collected through cookies and similar
                                technologies.
                            </p>
                        </Section>

                        {/* 10 */}
                        <Section id="childrens-info" number="10" title="Children's Information" icon="👶">
                            <p>
                                SchoolSpine is designed for educational institutions and may process information
                                relating to students through schools and authorized guardians.
                            </p>
                            <InfoBox type="info">
                                Schools are responsible for obtaining any necessary permissions or consents
                                required under applicable laws before providing student information to the
                                platform.
                            </InfoBox>
                        </Section>

                        {/* 11 */}
                        <Section id="changes" number="11" title="Changes to This Cookie Policy" icon="🔄">
                            <p>
                                ComputeSoftTechnologies reserves the right to update this Cookie Policy at any time.
                                Any changes will become effective immediately upon publication on the School
                                Spine website or mobile application.
                            </p>
                            <p>Users are encouraged to review this Policy periodically to remain informed about how cookies are used.</p>
                        </Section>

                        {/* 12 */}
                        <Section id="contact" number="12" title="Contact Us" icon="✉️">
                            <p>If you have any questions regarding this Cookie Policy, please contact us:</p>
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

export default Cookie_Policy