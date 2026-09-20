import React, { useState, useContext } from 'react'
import { FaFacebookF, FaWhatsapp, FaInstagram } from 'react-icons/fa'
import { FiMail, FiPhone, FiMapPin, FiSend, FiArrowUp } from 'react-icons/fi'
import Logo from '../../../assets/Images/avp_logo.png'
import { useNavigate, useLocation } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'


const footerLinks = {
    Product: [
        'Features',
        { name: 'Blog', path: '/blog' },
    ],
    Company: [
        { name: 'About Us', path: '/about' },
        { name: 'Reviews', path: '/reviews' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Help & support', path: '/support' },
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
        href: 'https://www.facebook.com/AVPTECHGROUP'
    },
    {
        icon: <FaInstagram size={16} />,
        label: 'Instagram',
        href: 'https://www.instagram.com/avptechgroup/'
    },
    {
        icon: <FaWhatsapp size={16} />,
        label: 'WhatsApp',
        href: 'https://wa.me/918810254451'
    },
]

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
        })
    }

    const handleFooterLinkClick = (e, link) => {
        const isObject = typeof link === 'object'
        const label = isObject ? link.name : link

        if (label === 'Features') {
            e.preventDefault()
            if (location.pathname === '/') {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' })
            } else {
                navigate('/#features-section')
            }
        } else if (label === 'Reviews') {
            e.preventDefault()
            if (location.pathname === '/') {
                document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })
            } else {
                navigate('/#reviews-section')
            }
        } else if (isObject) {
            if (!link.external) {
                e.preventDefault()
                navigate(link.path)
            }
        }
    }

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
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2380CC]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#5CD6F5]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">

                {/* ─── ROW 1: NEWSLETTER BANNER ─── */}
                <div
                    className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 mb-12 border-b"
                    style={{ borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }}
                >
                    <div className="max-w-xl">
                        <h3 className="text-xl md:text-2xl font-heading font-bold tracking-tight" style={{ color: isDark ? 'white' : '#0f172a' }}>
                            Stay updated with AVP Tech Group
                        </h3>
                        <p className="text-sm mt-1.5" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            Join our newsletter to receive the latest updates, feature releases, and modern Technology insights.
                        </p>
                    </div>
                    <form
                        onSubmit={(e) => e.preventDefault()}
                        className="flex items-center gap-2 w-full lg:w-auto max-w-md border p-1.5 rounded-xl focus-within:border-[#2380CC]/50 transition-all duration-300"
                        style={{
                            backgroundColor: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
                        }}
                    >
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your work email"
                            className="w-full bg-transparent pl-3 pr-2 py-2 text-sm outline-none"
                            style={{ color: isDark ? 'white' : '#0f172a' }}
                            required
                        />
                        <button
                            type="submit"
                            className="h-10 px-5 text-white bg-gradient-to-r from-[#0D3F7A] to-[#2380CC] rounded-xl font-bold transition-transform duration-200 shadow-md shadow-[#2380CC]/25 flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap active:scale-[0.98]"
                        >
                            <span>Subscribe</span>
                            <FiSend size={14} />
                        </button>
                    </form>
                </div>

                {/* ─── ROW 2: BALANCED RESPONSIVE GRID ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-8 lg:gap-6 xl:gap-8 pb-12">

                    {/* Brand Info (4 cols on desktop) */}
                    <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-12 lg:col-span-3 xl:col-span-4">
                        {/* On dark mode the navy wordmark needs a light plate to stay readable */}
                        <a
                            href="/"
                            className={`w-fit block transition-transform duration-200 hover:scale-[1.02] ${isDark ? 'bg-white rounded-2xl p-2.5' : ''}`}
                        >
                            <img src={Logo} alt="AVP Tech Group Logo" className="h-20 md:h-24 w-auto object-contain" />
                        </a>
                        <p className="text-sm leading-6 max-w-sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            Complete IT solutions, Microsoft certification training, and skilled IT staffing, all from one trusted partner for every technology need.
                        </p>
                    </div>

                    {/* Product Column */}
                    <div className="md:col-span-3 lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Product</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.Product.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={typeof link === 'object' ? link.path : '#'}
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#2380CC] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {typeof link === 'object' ? link.name : link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Column */}
                    <div className="md:col-span-3 lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Company</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.Company.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={typeof link === 'object' ? link.path : '#'}
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#2380CC] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {typeof link === 'object' ? link.name : link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Legal Column */}
                    <div className="md:col-span-3 lg:col-span-2">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-4" style={{ color: isDark ? 'white' : '#1e293b' }}>Legal</h4>
                        <ul className="space-y-2.5">
                            {footerLinks.Legal.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-sm hover:text-[#2380CC] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                        style={{ color: isDark ? '#94a3b8' : '#475569' }}
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column (Expanded width + right buffer for sticky WhatsApp/Call icons) */}
                    <div className="md:col-span-3 lg:col-span-3 xl:col-span-2 pr-6 sm:pr-8 md:pr-0">
                        <h4 className="font-semibold text-sm tracking-wider uppercase mb-3" style={{ color: isDark ? 'white' : '#1e293b' }}>Get in Touch</h4>
                        <ul className="space-y-3.5 text-sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                            <li className="flex items-start gap-2.5">
                                <FiMapPin size={16} className="text-[#2380CC] mt-0.5 shrink-0" />
                                <span className="leading-snug">Sushant Golf City, Lucknow, 226030</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FiPhone size={15} className="text-[#2380CC] shrink-0" />
                                <a href="tel:96995789998" className="hover:text-[#2380CC] transition-colors whitespace-nowrap">+91 96995789998</a>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <FiMail size={15} className="text-[#2380CC] mt-0.5 shrink-0" />
                                <a
                                    href="mailto:info@avptechgroup.com"
                                    className="hover:text-[#2380CC] transition-colors break-all leading-snug"
                                >
                                    info@avptechgroup.com
                                </a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="w-full my-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />

                {/* ─── ROW 3: BOTTOM BAR ─── */}
                <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-6 pt-4 text-center md:text-left">

                    <div onClick={handleScrollToTop} className="group flex items-center gap-3 cursor-pointer">
                        <div className="w-11 h-11 rounded-full border border-[#2380CC]/30 flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 bg-[#2380CC] scale-0 group-hover:scale-100 transition duration-500 rounded-full" />
                            <FiArrowUp size={18} className="relative z-10 text-[#2380CC] group-hover:text-white transition" />
                        </div>
                    </div>

                    <p className="text-xs md:text-sm" style={{ color: isDark ? '#94a3b8' : '#475569' }}>
                        © 2026 AVP Tech Group. All rights reserved.
                    </p>

                    <div className="flex items-center gap-2.5">
                        {socialIcons.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={label}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border bg-white/[0.01] hover:text-[#2380CC] hover:border-[#2380CC]/30 hover:bg-[#2380CC]/5 hover:scale-105 transition-all duration-200"
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

export default Footer