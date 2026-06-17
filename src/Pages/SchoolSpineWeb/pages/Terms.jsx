import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

const sections = [
    { id: 'introduction', label: 'Introduction', icon: '📋' },
    { id: 'company-info', label: 'Company Information', icon: '🏢' },
    { id: 'services', label: 'Description of Services', icon: '🛠️' },
    { id: 'eligibility', label: 'Eligibility', icon: '✅' },
    { id: 'account-security', label: 'Account & Security', icon: '🔐' },
    { id: 'acceptable-use', label: 'Acceptable Use Policy', icon: '🚫' },
    { id: 'school-data', label: 'School Data Responsibility', icon: '🏫' },
    { id: 'ip-rights', label: 'Intellectual Property', icon: '©️' },
    { id: 'data-privacy', label: 'Data Privacy', icon: '🔏' },
    { id: 'service-availability', label: 'Service Availability', icon: '⏱️' },
    { id: 'third-party', label: 'Third-Party Services', icon: '🔗' },
    { id: 'liability', label: 'Limitation of Liability', icon: '⚖️' },
    { id: 'indemnification', label: 'Indemnification', icon: '🛡️' },
    { id: 'termination', label: 'Suspension & Termination', icon: '⛔' },
    { id: 'modifications', label: 'Modifications to Services', icon: '🔄' },
    { id: 'governing-law', label: 'Governing Law', icon: '🏛️' },
    { id: 'changes', label: 'Changes to These Terms', icon: '📝' },
    { id: 'contact', label: 'Contact Information', icon: '✉️' },
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

const FeatureGrid = ({ items }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        {items.map(({ icon, title, desc }) => (
            <div key={title} className="bg-white/[0.02] border border-white/[0.07] rounded-xl p-4">
                <span className="text-2xl">{icon}</span>
                <p className="text-white font-semibold text-sm mt-2">{title}</p>
                {desc && <p className="text-text-muted text-xs mt-1">{desc}</p>}
            </div>
        ))}
    </div>
)

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Terms_Of_Service = () => {
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
                        <span className="text-teal">Terms of Service</span>
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
                        Terms of{' '}
                        <span className="text-grad-teal-gold">Service</span>
                    </h1>

                    <p
                        className="text-text-muted text-base md:text-lg max-w-2xl leading-relaxed mb-10"
                        style={{ animation: 'fadeUp 0.5s ease 0.22s both' }}
                    >
                        These Terms govern your access to and use of SchoolSpine. Please read them
                        carefully before registering for or using the platform.
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

                            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 backdrop-blur-md max-h-[70vh] overflow-y-auto">
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
                                Welcome to <strong className="text-white">SchoolSpine</strong>, a School
                                Management System owned and operated by <strong className="text-white">ComputeSoftTechnologies</strong>.
                                These Terms of Service ("Terms") govern your access to and use of the School
                                Spine website, mobile applications, and related services.
                            </p>
                            <InfoBox type="info">
                                By accessing, registering for, or using SchoolSpine, you agree to be legally
                                bound by these Terms. If you do not agree with any part of these Terms, you must
                                discontinue use of the platform immediately.
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
                        <Section id="services" number="03" title="Description of Services" icon="🛠️">
                            <p>SchoolSpine is a cloud-based School Management Platform that enables educational institutions to manage and monitor:</p>
                            <IconGrid items={[
                                { icon: '🎓', text: 'Student records' },
                                { icon: '👩‍🏫', text: 'Teacher records' },
                                { icon: '✅', text: 'Attendance management' },
                                { icon: '📝', text: 'Homework management' },
                                { icon: '📊', text: 'Examination management' },
                                { icon: '📈', text: 'Academic performance tracking' },
                                { icon: '📢', text: 'School notices & announcements' },
                                { icon: '💬', text: 'Parent-teacher communication' },
                                { icon: '🗂️', text: 'Digital document management' },
                                { icon: '📱', text: 'Mobile & web-based administration' },
                            ]} />
                            <InfoBox type="info">
                                The platform is intended solely for legitimate educational and administrative
                                purposes.
                            </InfoBox>
                        </Section>

                        {/* 04 */}
                        <Section id="eligibility" number="04" title="Eligibility" icon="✅">
                            <p>Users must be authorized by their educational institution to access and use SchoolSpine. Authorized users may include:</p>
                            <FeatureGrid items={[
                                { icon: '🧑‍💼', title: 'School Administrators' },
                                { icon: '🏫', title: 'Principals' },
                                { icon: '👩‍🏫', title: 'Teachers' },
                                { icon: '👥', title: 'Staff Members' },
                                { icon: '👨‍👩‍👧', title: 'Parents or Guardians' },
                                { icon: '🎓', title: 'Students', desc: 'Where permitted by the institution' },
                            ]} />
                            <p>Users must provide accurate information and maintain updated account details.</p>
                        </Section>

                        {/* 05 */}
                        <Section id="account-security" number="05" title="Account Registration and Security" icon="🔐">
                            <p>Users are responsible for:</p>
                            <CheckList items={[
                                'Maintaining the confidentiality of login credentials',
                                'Restricting unauthorized access to their accounts',
                                'Ensuring the accuracy of information provided',
                                'Reporting unauthorized account activity immediately',
                            ]} />
                            <InfoBox type="warning">
                                ComputeSoftTechnologies shall not be liable for losses resulting from unauthorized use
                                of user accounts due to negligence or credential sharing.
                            </InfoBox>
                        </Section>

                        {/* 06 */}
                        <Section id="acceptable-use" number="06" title="Acceptable Use Policy" icon="🚫">
                            <p>Users agree not to:</p>
                            <CheckList items={[
                                'Use the platform for unlawful purposes',
                                'Upload harmful, malicious, or fraudulent content',
                                'Attempt unauthorized access to systems or data',
                                'Interfere with platform operations',
                                'Distribute malware, viruses, or harmful code',
                                'Violate the privacy rights of students, parents, teachers, or staff',
                                'Misrepresent identity or authority',
                            ]} />
                            <InfoBox type="warning">
                                Any violation may result in suspension or termination of access.
                            </InfoBox>
                        </Section>

                        {/* 07 */}
                        <Section id="school-data" number="07" title="School Data Responsibility" icon="🏫">
                            <p>Educational institutions remain the owners and controllers of the data they upload to SchoolSpine. Schools are responsible for:</p>
                            <CheckList items={[
                                'Obtaining necessary permissions and consents',
                                'Ensuring data accuracy',
                                'Maintaining compliance with applicable laws and regulations',
                                'Managing user permissions within their institution',
                            ]} />
                            <p>ComputeSoftTechnologies acts as a technology service provider and does not independently verify uploaded data.</p>
                        </Section>

                        {/* 08 */}
                        <Section id="ip-rights" number="08" title="Intellectual Property Rights" icon="©️">
                            <p>
                                All software, source code, designs, interfaces, logos, trademarks, content, and
                                platform features are the exclusive property of ComputeSoftTechnologies unless
                                otherwise stated. Users may not:
                            </p>
                            <CheckList items={[
                                'Copy any part of the platform',
                                'Modify any part of the platform',
                                'Reverse engineer any part of the platform',
                                'Distribute any part of the platform',
                                'Resell any part of the platform',
                                'Reproduce any part of the platform',
                            ]} />
                            <p>...without prior written permission.</p>
                        </Section>

                        {/* 09 */}
                        <Section id="data-privacy" number="09" title="Data Privacy" icon="🔏">
                            <p>
                                The collection, processing, storage, and protection of personal information are
                                governed by our <Link to="/privacy-policy" className="text-teal hover:text-teal-light transition-colors">Privacy Policy</Link>.
                            </p>
                            <p>By using SchoolSpine, users consent to the collection and processing of information as described in the Privacy Policy.</p>
                        </Section>

                        {/* 10 */}
                        <Section id="service-availability" number="10" title="Service Availability" icon="⏱️">
                            <p>While we strive to maintain uninterrupted services, we do not guarantee that the platform will always be available without interruption. Services may occasionally be unavailable due to:</p>
                            <CheckList items={[
                                'System maintenance',
                                'Technical upgrades',
                                'Internet connectivity issues',
                                'Force majeure events',
                                'Third-party service disruptions',
                            ]} />
                            <InfoBox type="warning">
                                ComputeSoftTechnologies shall not be liable for temporary service interruptions.
                            </InfoBox>
                        </Section>

                        {/* 11 */}
                        <Section id="third-party" number="11" title="Third-Party Services" icon="🔗">
                            <p>The platform may integrate with third-party technologies or services. We are not responsible for:</p>
                            <CheckList items={[
                                'Third-party content',
                                'External websites',
                                'Third-party privacy practices',
                                'External service interruptions',
                            ]} />
                            <InfoBox type="warning">
                                Users access third-party services at their own risk.
                            </InfoBox>
                        </Section>

                        {/* 12 */}
                        <Section id="liability" number="12" title="Limitation of Liability" icon="⚖️">
                            <p>To the maximum extent permitted by applicable law, ComputeSoftTechnologies shall not be liable for:</p>
                            <CheckList items={[
                                'Indirect damages',
                                'Consequential damages',
                                'Data loss',
                                'Business interruption',
                                'Revenue loss',
                                'Educational decisions based on platform data',
                                'Unauthorized access caused by user negligence',
                            ]} />
                            <InfoBox type="info">
                                The platform is provided on an "as available" and "as is" basis.
                            </InfoBox>
                        </Section>

                        {/* 13 */}
                        <Section id="indemnification" number="13" title="Indemnification" icon="🛡️">
                            <p>Users and educational institutions agree to indemnify and hold harmless ComputeSoftTechnologies, its directors, employees, partners, and affiliates from claims, liabilities, damages, losses, and expenses arising from:</p>
                            <CheckList items={[
                                'Misuse of the platform',
                                'Violation of these Terms',
                                'Violation of applicable laws',
                                'Infringement of third-party rights',
                            ]} />
                        </Section>

                        {/* 14 */}
                        <Section id="termination" number="14" title="Suspension and Termination" icon="⛔">
                            <p>We reserve the right to suspend, restrict, or terminate access to SchoolSpine if:</p>
                            <CheckList items={[
                                'These Terms are violated',
                                'Fraudulent activity is detected',
                                'Unauthorized access is attempted',
                                'Legal or regulatory requirements necessitate such action',
                            ]} />
                            <InfoBox type="warning">
                                Termination may occur without prior notice where required for security or legal
                                reasons.
                            </InfoBox>
                        </Section>

                        {/* 15 */}
                        <Section id="modifications" number="15" title="Modifications to Services" icon="🔄">
                            <p>ComputeSoftTechnologies reserves the right to:</p>
                            <CheckList items={[
                                'Add new features',
                                'Modify existing functionality',
                                'Discontinue features',
                                'Update pricing structures (if applicable)',
                                'Improve system architecture',
                            ]} />
                            <p>Such modifications may occur without prior notice.</p>
                        </Section>

                        {/* 16 */}
                        <Section id="governing-law" number="16" title="Governing Law" icon="🏛️">
                            <p>
                                These Terms shall be governed by and interpreted in accordance with the laws of
                                India.
                            </p>
                            <InfoBox type="info">
                                Any disputes arising from these Terms shall be subject to the exclusive
                                jurisdiction of the courts located in Lucknow, Uttar Pradesh, India.
                            </InfoBox>
                        </Section>

                        {/* 17 */}
                        <Section id="changes" number="17" title="Changes to These Terms" icon="📝">
                            <p>We may revise these Terms periodically. Updated versions will be posted on the SchoolSpine website and applications with a revised effective date.</p>
                            <p>Continued use of the platform after updates constitutes acceptance of the revised Terms.</p>
                        </Section>

                        {/* 18 */}
                        <Section id="contact" number="18" title="Contact Information" icon="✉️">
                            <p>For questions regarding these Terms of Service, please contact us:</p>
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

export default Terms_Of_Service