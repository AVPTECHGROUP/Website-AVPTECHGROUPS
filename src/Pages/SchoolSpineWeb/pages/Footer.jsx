import React, { useState, useContext } from 'react'
import { FaFacebookF, FaWhatsapp, FaInstagram } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6'
import { FiMail, FiPhone, FiMapPin, FiSend, FiArrowUp } from 'react-icons/fi'
import Logo from '../../../assets/Images/SS_logo_3.png'
import cst from '../../../assets/Images/cst.png'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'

const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cst.schoolspine&hl=en_IN"
const APP_STORE_URL = "https://apps.apple.com/ng/app/schoolspine/id6800739236"

const footerLinks = {
    Product: [
        'Features',
        // 'Pricing',
        { name: 'Blog', path: '/blog' },
    ],
    Company: [
        { name: 'About Us', path: '/about' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Help & support', path: '/support' },
        { name: 'FAQ', path: '/faqs' }
    ],
    Legal: [
        { name: 'Privacy Policy', path: '/privacy-policy', external: true },
        { name: 'Terms of Service', path: '/terms', external: true },
        { name: 'Cookie Policy', path: '/cookies', external: true }
    ],
}

const socialIcons = [
    {
        icon: <FaFacebookF size={16} />,
        label: 'Facebook',
        href: 'https://www.facebook.com/photo.php?fbid=122103899157384825&type=3&mibextid=wwXIfr&rdid=BiXSt0SFkJP0NL43&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1HTJzS7tyF%2F%3Fmibextid%3DwwXIfr#'
    },
    {
        icon: <FaInstagram size={16} />,
        label: 'Instagram',
        href: 'https://www.instagram.com/schoolspineofficial/'
    },
    {
        icon: <FaWhatsapp size={16} />,
        label: 'WhatsApp',
        href: 'https://wa.me/919511117450'
    },
];

const Footer = () => {
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'

    const [email, setEmail] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

    const handleScrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleFooterLinkClick = (e, link) => {
        const isObject = typeof link === 'object';
        const label = isObject ? link.name : link;

        if (label === 'Features') {
            e.preventDefault();
            if (location.pathname === '/') {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/#features-section');
            }
        }
        else if (label === 'Our Clients') {
            e.preventDefault();
            if (location.pathname === '/') {
                document.getElementById('clients-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/#clients-section');
            }
        }
        else if (label === 'Reviews') {
            e.preventDefault();
            if (location.pathname === '/') {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/#reviews-section');
            }
        }
        else if (isObject) {
            if (!link.external) {
                e.preventDefault();
                navigate(link.path);
            }
        }
    };

    return (
        <footer
            className="w-full font-body transition-colors duration-300 relative overflow-hidden border-t"
            style={{
                backgroundColor: isDark ? '#070D19' : '#f8fafc',
                borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                color: isDark ? '#cbd5e1' : '#334155'
            }}
        >
            {/* Ambient backdrop glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00C9B1]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">

                {/* ─── ROW 1: NEWSLETTER BANNER ─── */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 mb-12 border-b" style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}>
                    <div className="max-w-xl">
                        <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>
                            Stay updated with SchoolSpine
                        </h3>
                        <p className="text-sm mt-1.5" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            Join our newsletter to receive the latest updates, feature releases, and modern school management insights.
                        </p>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 w-full lg:w-auto max-w-md bg-white/[0.03] border p-1.5 rounded-xl focus-within:border-[#00C9B1]/40 transition-all duration-300" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your work email"
                            className="w-full bg-transparent pl-3 pr-2 py-2 text-sm outline-none"
                            style={{ color: isDark ? 'white' : '#0f172a' }}
                            required
                        />
                        <button type="submit" className="h-10 px-5 text-slate-950 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] rounded-xl font-bold transition-transform duration-200 shadow-md flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-[0.98]">
                            <span>Subscribe</span>
                            <FiSend size={14} />
                        </button>
                    </form>
                </div>

                {/* ─── ROW 2: 5-COLUMN GRID ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">

                    {/* Brand Info & App Download Promotion */}
                    <div className="flex flex-col gap-4 lg:col-span-4">
                        <a href="/" className="w-fit block transition-transform duration-200 hover:scale-[1.02]">
                            <img src={Logo} alt="SchoolSpine Logo" className="h-14 md:h-16 object-contain" />
                        </a>
                        <p className="text-sm leading-6" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            Redefining educational ecosystems with a secure, intelligent, and future-ready interface built to sync administrators, instructors, parents, and students seamlessly.
                        </p>

                        {/* App Store & Play Store Promotional Badges */}
                        <div className="pt-2 flex flex-col gap-2.5">
                            <p className="text-xs font-bold uppercase tracking-wider text-[#00C9B1]">
                                Experience on Mobile
                            </p>

                            <div className="flex flex-wrap items-center gap-2.5">
                                {/* Google Play Badge */}
                                <a
                                    href={PLAY_STORE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download on Google Play Store"
                                    className={`group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 shadow-sm ${isDark
                                            ? 'bg-slate-900/90 border-slate-800 hover:border-[#00C9B1] hover:bg-slate-800'
                                            : 'bg-white border-slate-200 hover:border-[#00C9B1] hover:shadow-md'
                                        }`}
                                >
                                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M3.609 1.814L13.793 12 3.61 22.186A2.213 2.213 0 0 1 3 20.627V3.373c0-.613.226-1.18.609-1.559z" fill="#00C9B1" />
                                        <path d="M17.207 8.586L13.793 12l3.414 3.414 3.904-2.231c.883-.505.883-1.861 0-2.366L17.207 8.586z" fill="#F5A623" />
                                        <path d="M13.793 12L3.61 1.814A2.327 2.327 0 0 1 4.708 1.55c.489 0 .964.128 1.385.369l11.114 6.667L13.793 12z" fill="#00E5CC" />
                                        <path d="M13.793 12l3.414 3.414-11.114 6.667a2.76 2.76 0 0 1-1.385.369 2.327 2.327 0 0 1-1.098-.264L13.793 12z" fill="#FF5722" />
                                    </svg>
                                    <div className="flex flex-col text-left leading-tight">
                                        <span className="text-[9px] uppercase tracking-tight text-slate-400 font-medium">Get it on</span>
                                        <span className="text-xs font-bold text-theme-text group-hover:text-[#00C9B1] transition-colors">Google Play</span>
                                    </div>
                                </a>

                                {/* Apple App Store Badge */}
                                <a
                                    href={APP_STORE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Download on Apple App Store"
                                    className={`group inline-flex items-center gap-2.5 px-3 py-1.5 rounded-xl border transition-all duration-300 hover:-translate-y-0.5 shadow-sm ${isDark
                                            ? 'bg-slate-900/90 border-slate-800 hover:border-[#F5A623] hover:bg-slate-800'
                                            : 'bg-white border-slate-200 hover:border-[#F5A623] hover:shadow-md'
                                        }`}
                                >
                                    <svg className="w-4 h-4 fill-current text-theme-text group-hover:text-[#F5A623] transition-colors shrink-0" viewBox="0 0 170 170">
                                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.44-6.19-9.58-10.87-20.47-14.04-32.66-3.17-12.19-4.76-23.77-4.76-34.73 0-16.14 4.15-29.6 12.44-40.38 8.29-10.78 18.7-16.29 31.25-16.53 4.8 0 10.3 1.25 16.51 3.75 6.21 2.5 10.02 3.8 11.43 3.91 1.74-.22 5.82-1.63 12.24-4.24 6.42-2.61 11.97-3.8 16.65-3.59 13.06.65 23.59 5.38 31.6 14.19-11.54 6.96-17.15 16.52-16.84 28.69.33 9.79 4.13 18.06 11.4 24.81 7.27 6.75 16.03 10.77 26.27 12.08-2.61 7.84-5.94 15.79-9.98 23.85zm-43.24-118.9c0 7.84-2.83 15.01-8.49 21.52-5.66 6.52-12.74 10.77-21.23 12.74-.22-1.09-.33-2.18-.33-3.27 0-7.62 3.05-15.01 9.15-22.18 6.1-7.18 13.44-11.31 22.02-12.4.11 1.2.17 2.4.17 3.59z" />
                                    </svg>
                                    <div className="flex flex-col text-left leading-tight">
                                        <span className="text-[9px] uppercase tracking-tight text-slate-400 font-medium">Download on</span>
                                        <span className="text-xs font-bold text-theme-text group-hover:text-[#F5A623] transition-colors">App Store</span>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 lg:pl-4">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Product</h4>
                        <ul className="space-y-2">
                            {footerLinks.Product.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={typeof link === 'object' ? link.path : '#'}
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {typeof link === 'object' ? link.name : link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.Company.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={typeof link === 'object' ? link.path : '#'}
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {typeof link === 'object' ? link.name : link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.Legal.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-1" style={{ color: isDark ? 'white' : '#1e293b' }}>Get in Touch</h4>
                        <ul className="space-y-3.5 text-sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            <li className="flex items-start gap-2.5">
                                <FiMapPin size={16} className="text-[#00C9B1] mt-0.5 flex-shrink-0" />
                                <span className="leading-5">Sushant Golf City, Lucknow, 226030</span>
                            </li >
                            <li className="flex items-center gap-2.5">
                                <FiPhone size={15} className="text-[#00C9B1] flex-shrink-0" />
                                <a href="tel:9511117450" className="hover:text-[#00C9B1] transition-colors">+91 9511117450</a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FiMail size={15} className="text-[#00C9B1] flex-shrink-0" />
                                <a href="mailto:info@computesofttech.com" className="hover:text-[#00C9B1] transition-colors block max-w-[160px] lg:max-w-none">info@computesofttech.com</a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="w-full my-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                {/* ─── ROW 3: BOTTOM BAR ─── */}
                <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-6 pt-4 text-center md:text-left">

                    <div onClick={handleScrollToTop}
                        className="group flex items-center gap-3 cursor-pointer"
                    >
                        <div className="w-12 h-12 rounded-full border border-[#00C9B1]/30 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#00C9B1] scale-0 group-hover:scale-100 transition duration-500 rounded-full" />
                            <FiArrowUp
                                size={20}
                                className="relative z-10 text-[#00C9B1] group-hover:text-white transition"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 text-xs md:text-sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                        <div className="flex items-center justify-center gap-1.5">
                            <span>© 2026</span>
                            <a href="https://computesofttech.com/" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
                                <img className={`w-20 object-contain ${isDark ? 'brightness-95' : 'brightness-50'}`} src={cst} alt="ComputeSoft" />
                            </a>
                            <span>. All rights reserved.</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                        {socialIcons.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/[0.01] hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/5 hover:scale-105 transition-all duration-200"
                                style={{
                                    color: isDark ? '#94a3b8' : '#475569',
                                    borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                                }}
                            >
                                {icon}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    )
}

export default Footer;