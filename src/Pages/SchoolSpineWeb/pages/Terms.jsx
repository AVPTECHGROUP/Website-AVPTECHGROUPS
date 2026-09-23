import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'

/* ─── Company details (single source of truth for this page) ────────────── */

const COMPANY = {
    name: 'AVP Tech Group',
    address: 'Royal Plaza, Sushant Golf City, Lucknow, UP, India',
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
    { id: 'services', label: 'Description of Services', icon: '🛠️' },
    { id: 'eligibility', label: 'Eligibility', icon: '✅' },
    { id: 'account-security', label: 'Account & Security', icon: '🔐' },
    { id: 'acceptable-use', label: 'Acceptable Use Policy', icon: '🚫' },
    { id: 'client-data', label: 'Client Data Responsibility', icon: '🗂️' },
    { id: 'training', label: 'Training & Certification', icon: '🎓' },
    { id: 'fees', label: 'Fees & Payments', icon: '💳' },
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

/* ─── Sub-components ────────────────────────────────────────────────────── */

const Section = ({ id, number, title, icon, children, isDark }) => (
    <section
        id={id}
        className={`border rounded-2xl p-6 md:p-8 scroll-mt-28 transition-colors duration-300 ${
            isDark 
                ? 'bg-white/[0.02] border-white/[0.08]' 
                : 'bg-black/[0.02] border-black/[0.08]'
        }`}
        style={{ animation: 'fadeUp 0.5s ease both' }}
    >
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

const CheckList = ({ items, isDark }) => (
    <ul className="flex flex-col gap-2 mt-1">
        {items.map((item) => (
            <li key={item} className={`flex items-start gap-3 text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                <span className="mt-0.5 w-5 h-5 rounded-full bg-teal/10 border border-teal/20 flex items-center justify-center text-teal text-[10px] flex-shrink-0">
                    ✓
                </span>
                {item}
            </li>
        ))}
    </ul>
)

const IconGrid = ({ items, isDark }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-1">
        {items.map(({ icon, text }) => (
            <div key={text} className={`flex items-center gap-3 border rounded-xl px-4 py-3 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                <span className="text-base">{icon}</span>
                <span className={`text-[13px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{text}</span>
            </div>
        ))}
    </div>
)

const FeatureGrid = ({ items, isDark }) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
        {items.map(({ icon, title, desc }) => (
            <div key={title} className={`border rounded-xl p-4 ${isDark ? 'bg-white/[0.02] border-white/[0.07]' : 'bg-black/[0.02] border-black/[0.07]'}`}>
                <span className="text-2xl">{icon}</span>
                <p className={`font-semibold text-sm mt-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>{title}</p>
                {desc && <p className={`text-xs mt-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{desc}</p>}
            </div>
        ))}
    </div>
)

/* ─── Main Page ──────────────────────────────────────────────────────────── */

const Terms_Of_Service = () => {
    const [activeSection, setActiveSection] = useState('introduction')
    const [scrollProgress, setScrollProgress] = useState(0)

    const { theme } = useContext(UserContext);
    const isDark = theme === 'dark';

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
        <div className={`min-h-screen font-body transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

            <div
                className="fixed top-0 left-0 z-50 h-[2px] transition-all duration-150"
                style={{
                    width: `${scrollProgress}%`,
                    background: 'linear-gradient(to right, #2380CC, #5CD6F5)',
                }}
            />

            {/* ══════════════════ HERO ══════════════════ */}
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_10%_0%,rgba(35,128,204,0.07),transparent)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_90%_100%,rgba(92,214,245,0.05),transparent)]" />
                <div className="absolute top-16 right-24 w-56 h-56 rounded-full bg-teal/[0.04] blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal/20 to-transparent" />

                <div className="relative max-w-7xl mx-auto px-6 pt-5 pb-16 md:pb-20">
                    <div
                        className={`flex items-center gap-2 text-sm mb-8 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
                        style={{ animation: 'fadeDown 0.45s ease both' }}
                    >
                        <Link to="/" className="hover:text-teal transition-colors">Home</Link>
                        <span className={isDark ? 'text-white/20' : 'text-black/20'}>/</span>
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
                        className={`font-heading text-5xl md:text-7xl font-bold leading-tight mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}
                        style={{ animation: 'fadeUp 0.5s ease 0.15s both' }}
                    >
                        Terms of{' '}
                        <span className="text-grad-teal-gold">Service</span>
                    </h1>

                    <p
                        className={`text-base md:text-lg max-w-2xl leading-relaxed mb-10 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}
                        style={{ animation: 'fadeUp 0.5s ease 0.22s both' }}
                    >
                        These Terms govern your access to and use of the {COMPANY.name} website and
                        services, including IT solutions, training and staffing. Please read them
                        carefully before enrolling in a course or engaging our services.
                    </p>

                    <div
                        className="flex flex-wrap gap-4 text-sm"
                        style={{ animation: 'fadeUp 0.5s ease 0.3s both' }}
                    >
                        {[
                            { emoji: '📅', label: 'Last Updated', value: 'September 2026' },
                            { emoji: '🏢', label: 'Operator', value: COMPANY.name },
                            { emoji: '📍', label: 'Jurisdiction', value: 'Lucknow, India' },
                        ].map(({ emoji, label, value }) => (
                            <div
                                key={label}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                                    isDark 
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

            {/* ══════════════════ MAIN LAYOUT ══════════════════ */}
            <div className="max-w-7xl mx-auto px-6 pb-24">
                <div className="flex gap-10 xl:gap-14 relative">

                    <aside className="hidden lg:block w-64 xl:w-72 flex-shrink-0">
                        <div className="sticky top-24 flex flex-col gap-4">

                            <div className={`border rounded-2xl p-4 backdrop-blur-md max-h-[70vh] overflow-y-auto shadow-sm ${isDark ? 'bg-slate-900 border-white/[0.08]' : 'bg-white border-slate-200'}`}>
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
                            
                            <div className="bg-[linear-gradient(135deg,rgba(35,128,204,0.07),rgba(92,214,245,0.04))] border border-teal/[0.15] rounded-2xl p-4">
                                <p className={`text-sm font-semibold mb-1 ${isDark ? 'text-white' : 'text-slate-800'}`}>Questions?</p>
                                <p className={`text-xs mb-3 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reach out to our team</p>
                                <a
                                    href={`mailto:${COMPANY.email}`}
                                    className="text-xs text-teal hover:text-teal-light transition-colors break-all">
                                    {COMPANY.email}
                                </a>
                            </div>
                        </div>
                    </aside>

                    <div className="flex-1 min-w-0 flex flex-col gap-5 pt-1">

                        {/* 01 */}
                        <Section id="introduction" number="01" title="Introduction" icon="📋" isDark={isDark}>
                            <p>
                                Welcome to <strong className={isDark ? 'text-white' : 'text-slate-900'}>{COMPANY.name}</strong>, an IT
                                solutions, certification training and staffing company. These Terms of Service
                                ("Terms") govern your access to and use of the {COMPANY.name} website and
                                related services, including course enquiries and enrollment, corporate training,
                                staffing and IT solutions.
                            </p>
                            <InfoBox type="info" isDark={isDark}>
                                By accessing, enrolling in, or using {COMPANY.name} services, you agree to be
                                legally bound by these Terms. If you do not agree with any part of these Terms,
                                you must discontinue use of the website and services immediately.
                            </InfoBox>
                        </Section>

                        {/* 02 */}
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

                        {/* 03 */}
                        <Section id="services" number="03" title="Description of Services" icon="🛠️" isDark={isDark}>
                            <p>{COMPANY.name} provides technology solutions and professional training, including:</p>
                            <IconGrid isDark={isDark} items={[
                                { icon: '🛠️', text: 'IT solutions & technical support' },
                                { icon: '☁️', text: 'Cloud & infrastructure services' },
                                { icon: '📱', text: 'Device management with Microsoft Intune' },
                                { icon: '🛡️', text: 'Endpoint & threat protection with Microsoft Defender' },
                                { icon: '🎓', text: 'Microsoft certification training' },
                                { icon: '🏢', text: 'Corporate training programs' },
                                { icon: '📚', text: 'Course materials & mock test questions' },
                                { icon: '📜', text: 'Certificates of attendance' },
                                { icon: '🧑‍💼', text: 'IT staffing services' },
                                { icon: '💬', text: 'Enquiries, consultation & support' },
                            ]} />
                            <InfoBox type="info" isDark={isDark}>
                                Our website and services are intended solely for legitimate business, learning
                                and professional purposes.
                            </InfoBox>
                        </Section>

                        {/* 04 */}
                        <Section id="eligibility" number="04" title="Eligibility" icon="✅" isDark={isDark}>
                            <p>Our services are intended for users who are 18 years of age or older and legally able to enter into a binding agreement. Users may include:</p>
                            <FeatureGrid isDark={isDark} items={[
                                { icon: '🎓', title: 'Individual Learners', desc: 'Enrolling in our courses and certifications' },
                                { icon: '👩‍💻', title: 'IT Professionals', desc: 'Upskilling or preparing for certification exams' },
                                { icon: '🏢', title: 'Corporate Clients', desc: 'Organizations engaging our IT or training services' },
                                { icon: '🧑‍💼', title: 'Authorized Representatives', desc: 'Acting on behalf of a company' },
                                { icon: '👥', title: 'Client Employees', desc: 'Enrolled in training by their employer' },
                                { icon: '📄', title: 'Staffing Candidates', desc: 'Seeking IT roles through our staffing services' },
                            ]} />
                            <p>Users must provide accurate information and keep their details up to date.</p>
                        </Section>

                        {/* 05 */}
                        <Section id="account-security" number="05" title="Account Registration and Security" icon="🔐" isDark={isDark}>
                            <p>Where the website or a learning platform provides login access, users are responsible for:</p>
                            <CheckList isDark={isDark} items={[
                                'Maintaining the confidentiality of login credentials',
                                'Restricting unauthorized access to their accounts',
                                'Ensuring the accuracy of information provided',
                                'Reporting unauthorized account activity immediately',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                {COMPANY.name} shall not be liable for losses resulting from unauthorized use
                                of user accounts due to negligence or credential sharing.
                            </InfoBox>
                        </Section>

                        {/* 06 */}
                        <Section id="acceptable-use" number="06" title="Acceptable Use Policy" icon="🚫" isDark={isDark}>
                            <p>Users agree not to:</p>
                            <CheckList isDark={isDark} items={[
                                'Use the website or services for unlawful purposes',
                                'Upload harmful, malicious, or fraudulent content',
                                'Attempt unauthorized access to systems or data',
                                'Interfere with website, platform or training operations',
                                'Distribute malware, viruses, or harmful code',
                                'Share, resell or publicly distribute course materials, recordings or login access',
                                'Record or capture live training sessions without written permission',
                                'Violate the privacy rights of other learners, clients, trainers, or staff',
                                'Misrepresent identity, qualifications, or authority',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                Any violation may result in suspension or termination of access.
                            </InfoBox>
                        </Section>

                        {/* 07 */}
                        <Section id="client-data" number="07" title="Client Data Responsibility" icon="🗂️" isDark={isDark}>
                            <p>Clients remain the owners and controllers of the data, systems and accounts they entrust to {COMPANY.name}. Clients are responsible for:</p>
                            <CheckList isDark={isDark} items={[
                                'Obtaining the permissions needed to grant us access to their systems and data',
                                'Maintaining independent backups before any changes are made to their environment',
                                'Ensuring the accuracy of the information and requirements they provide',
                                'Managing user permissions and any credentials shared with us',
                                'Maintaining compliance with applicable laws and regulations',
                            ]} />
                            <p>{COMPANY.name} acts as a technology service provider and does not independently verify data or information supplied by clients.</p>
                        </Section>

                        {/* 08 */}
                        <Section id="training" number="08" title="Training and Certification" icon="🎓" isDark={isDark}>
                            <p>The following applies to all courses and training programs offered by {COMPANY.name}:</p>
                            <CheckList isDark={isDark} items={[
                                'A certificate of attendance issued by us confirms participation in a course; it is not a vendor certification',
                                'Official certifications, such as Microsoft certifications, are awarded by the vendor after passing the relevant exam, under the vendor\'s own terms, fees and policies',
                                'Mock tests and practice questions are learning aids and do not replace or reproduce the official exam',
                                'Schedules, batches, trainers and delivery formats may be changed where necessary',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                We do not guarantee exam results, certification, employment, or career outcomes.
                            </InfoBox>
                            <InfoBox type="info" isDark={isDark}>
                                Microsoft, Intune, Defender and other product names are trademarks of their
                                respective owners. Mentioning them does not imply affiliation with or
                                endorsement by those owners unless expressly stated.
                            </InfoBox>
                        </Section>

                        {/* 09 */}
                        <Section id="fees" number="09" title="Fees and Payments" icon="💳" isDark={isDark}>
                            <p>
                                Fees, payment terms, and any rescheduling, cancellation or refund conditions
                                apply in addition to these Terms:
                            </p>
                            <CheckList isDark={isDark} items={[
                                'Course and service fees are quoted at enrollment or in the agreed proposal',
                                'Applicable taxes are charged as per law',
                                'Rescheduling, cancellation and refund conditions are communicated before payment',
                            ]} />
                            <InfoBox type="info" isDark={isDark}>
                                Please confirm the applicable fee and refund terms with our team before enrolling
                                or engaging our services.
                            </InfoBox>
                        </Section>

                        {/* 10 */}
                        <Section id="ip-rights" number="10" title="Intellectual Property Rights" icon="©️" isDark={isDark}>
                            <p>
                                All software, source code, designs, course content, presentations, course
                                materials, mock test questions, recordings, logos, trademarks, and website
                                features are the exclusive property of {COMPANY.name} or its licensors unless
                                otherwise stated. Users may not:
                            </p>
                            <CheckList isDark={isDark} items={[
                                'Copy any part of our content or materials',
                                'Modify any part of our content or materials',
                                'Reverse engineer any part of our website or software',
                                'Distribute any part of our content or materials',
                                'Resell any part of our content or materials',
                                'Reproduce any part of our content or materials',
                            ]} />
                            <p>...without prior written permission.</p>
                        </Section>

                        {/* 11 */}
                        <Section id="data-privacy" number="11" title="Data Privacy" icon="🔏" isDark={isDark}>
                            <p>
                                The collection, processing, storage, and protection of personal information are
                                governed by our <Link to="/privacy-policy" className="text-teal hover:text-teal-light transition-colors">Privacy Policy</Link>.
                            </p>
                            <p>By using {COMPANY.name} services, users consent to the collection and processing of information as described in the Privacy Policy.</p>
                        </Section>

                        {/* 12 */}
                        <Section id="service-availability" number="12" title="Service Availability" icon="⏱️" isDark={isDark}>
                            <p>While we strive to maintain uninterrupted services, we do not guarantee that the website or live training sessions will always be available without interruption. Services may occasionally be unavailable or rescheduled due to:</p>
                            <CheckList isDark={isDark} items={[
                                'System maintenance',
                                'Technical upgrades',
                                'Internet connectivity issues',
                                'Trainer unavailability or unforeseen circumstances',
                                'Force majeure events',
                                'Third-party service disruptions, including video conferencing platforms',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                {COMPANY.name} shall not be liable for temporary service interruptions, but will
                                make reasonable efforts to reschedule any affected sessions.
                            </InfoBox>
                        </Section>

                        {/* 13 */}
                        <Section id="third-party" number="13" title="Third-Party Services" icon="🔗" isDark={isDark}>
                            <p>Our website and services may integrate with third-party technologies or services, such as video conferencing, payment or cloud platforms. We are not responsible for:</p>
                            <CheckList isDark={isDark} items={[
                                'Third-party content',
                                'External websites',
                                'Third-party privacy practices',
                                'External service interruptions',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                Users access third-party services at their own risk.
                            </InfoBox>
                        </Section>

                        {/* 14 */}
                        <Section id="liability" number="14" title="Limitation of Liability" icon="⚖️" isDark={isDark}>
                            <p>To the maximum extent permitted by applicable law, {COMPANY.name} shall not be liable for:</p>
                            <CheckList isDark={isDark} items={[
                                'Indirect damages',
                                'Consequential damages',
                                'Data loss',
                                'Business interruption',
                                'Revenue loss',
                                'Exam results, certification outcomes, or career and employment decisions',
                                'Business or technical decisions made on the basis of our recommendations',
                                'Unauthorized access caused by user negligence',
                            ]} />
                            <InfoBox type="info" isDark={isDark}>
                                The website and services are provided on an "as available" and "as is" basis.
                            </InfoBox>
                        </Section>

                        {/* 15 */}
                        <Section id="indemnification" number="15" title="Indemnification" icon="🛡️" isDark={isDark}>
                            <p>Users and clients agree to indemnify and hold harmless {COMPANY.name}, its directors, employees, partners, and affiliates from claims, liabilities, damages, losses, and expenses arising from:</p>
                            <CheckList isDark={isDark} items={[
                                'Misuse of the website or services',
                                'Violation of these Terms',
                                'Violation of applicable laws',
                                'Infringement of third-party rights',
                            ]} />
                        </Section>

                        {/* 16 */}
                        <Section id="termination" number="16" title="Suspension and Termination" icon="⛔" isDark={isDark}>
                            <p>We reserve the right to suspend, restrict, or terminate access to our website, learning resources or services if:</p>
                            <CheckList isDark={isDark} items={[
                                'These Terms are violated',
                                'Fraudulent activity is detected',
                                'Unauthorized access is attempted',
                                'Course materials or login access are shared or resold without permission',
                                'Legal or regulatory requirements necessitate such action',
                            ]} />
                            <InfoBox type="warning" isDark={isDark}>
                                Termination may occur without prior notice where required for security or legal
                                reasons.
                            </InfoBox>
                        </Section>

                        {/* 17 */}
                        <Section id="modifications" number="17" title="Modifications to Services" icon="🔄" isDark={isDark}>
                            <p>{COMPANY.name} reserves the right to:</p>
                            <CheckList isDark={isDark} items={[
                                'Add new courses and services',
                                'Modify course content, schedules or delivery formats',
                                'Discontinue courses or features',
                                'Update pricing structures (if applicable)',
                                'Improve systems and infrastructure',
                            ]} />
                            <p>Such modifications may occur without prior notice.</p>
                        </Section>

                        {/* 18 */}
                        <Section id="governing-law" number="18" title="Governing Law" icon="🏛️" isDark={isDark}>
                            <p>
                                These Terms shall be governed by and interpreted in accordance with the laws of
                                India.
                            </p>
                            <InfoBox type="info" isDark={isDark}>
                                Any disputes arising from these Terms shall be subject to the exclusive
                                jurisdiction of the courts located in Lucknow, Uttar Pradesh, India.
                            </InfoBox>
                        </Section>

                        {/* 19 */}
                        <Section id="changes" number="19" title="Changes to These Terms" icon="📝" isDark={isDark}>
                            <p>We may revise these Terms periodically. Updated versions will be posted on the {COMPANY.name} website with a revised effective date.</p>
                            <p>Continued use of our website and services after updates constitutes acceptance of the revised Terms.</p>
                        </Section>

                        {/* 20 */}
                        <Section id="contact" number="20" title="Contact Information" icon="✉️" isDark={isDark}>
                            <p>For questions regarding these Terms of Service, please contact us:</p>
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

export default Terms_Of_Service;