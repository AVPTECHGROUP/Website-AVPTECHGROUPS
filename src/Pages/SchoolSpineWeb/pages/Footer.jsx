import React, { useState } from 'react'
import { FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi'
import Logo from '../../../assets/Images/SS_logo_3.png'
import cst from '../../../assets/Images/cst.png'
import { useNavigate, useLocation } from 'react-router-dom'

const footerLinks = {
    Product: [
        'Features',
        'Pricing',
    ],
    Company: [
        { name: 'About Us', path: '/about' },
        { name: 'Reviews', path: '/reviews' }, // ─── ADDED: REVIEWS LINK ───
        { name: 'Contact Us', path: '/contact' },
        { name: 'Help & support', path: '/support' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQ', path: '/faqs' }
    ],
    Legal: [
        { name: 'Privacy Policy', path: '/privacy-policy', external: true },
        { name: 'Terms of Service', path: '/terms', external: true },
        { name: 'Cookie Policy', path: '/cookies', external: true }
    ],
}

const socialIcons = [
    { icon: <FaLinkedinIn size={16} />, label: 'LinkedIn', href: '#' },
    { icon: <FaXTwitter size={16} />, label: 'Twitter', href: '#' },
    { icon: <FaYoutube size={16} />, label: 'YouTube', href: '#' },
    { icon: <FaInstagram size={16} />, label: 'Instagram', href: '#' },
]

const Footer = () => {
    const [email, setEmail] = useState('')
    const navigate = useNavigate()
    const location = useLocation()

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
        else if (label === 'Pricing') {
            e.preventDefault();
            if (location.pathname === '/') {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate('/#pricing-section');
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
        // ─── ADDED: SMOOTH SCROLL LOGIC FOR REVIEWS ───
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
        <footer className="w-full bg-[#070D19] font-body text-slate-300 relative overflow-hidden">
            {/* Ambient subtle backdrop glows */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#00C9B1]/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#F5A623]/5 rounded-full blur-3xl pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 pt-16 pb-8 relative z-10">

                {/* ─── ROW 1: PREMIUM UNIFIED NEWSLETTER BANNER ─── */}
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-12 mb-12 border-b border-white/10">
                    <div className="max-w-xl">
                        <h3 className="text-xl md:text-2xl font-heading font-bold text-white tracking-tight">
                            Stay updated with SchoolSpine
                        </h3>
                        <p className="text-slate-400 text-sm mt-1.5">
                            Join our newsletter to receive the latest updates, feature releases, and modern school management insights.
                        </p>
                    </div>
                    <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2 w-full lg:w-auto max-w-md bg-white/[0.03] border border-white/10 p-1.5 rounded-xl focus-within:border-[#00C9B1]/40 transition-all duration-300">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your work email"
                            className="w-full bg-transparent pl-3 pr-2 py-2 text-sm text-white placeholder-slate-500 outline-none"
                            required
                        />
                        <button type="submit" className="h-10 px-5 text-slate-950  bg-linear-to-r from-teal to-gold rounded-xl font-bold transition-transform duration-200 shadow-md flex items-center gap-2 text-sm cursor-pointer whitespace-nowrap">
                            <span>Subscribe</span>
                            <FiSend size={14} />
                        </button>
                    </form>
                </div>

                {/* ─── ROW 2: BALANCED 5-COLUMN GRID ─── */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-12 gap-10 lg:gap-8 pb-12">

                    {/* Brand Info & Core Description */}
                    <div className="flex flex-col gap-5 lg:col-span-4">
                        <a href="/" className="w-fit block transition-transform duration-200 hover:scale-[1.02]">
                            <img src={Logo} alt="SchoolSpine Logo" className="h-14 md:h-16 object-contain" />
                        </a>
                        <p className="text-slate-400 text-sm leading-6">
                            Redefining educational ecosystems with a secure, intelligent, and future-ready interface built to sync administrators, instructors, parents, and students seamlessly.
                        </p>
                    </div>

                    {/* Links Columns */}
                    <div className="lg:col-span-2 lg:pl-4">
                        <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Product</h4>
                        <ul className="space-y-3">
                            {footerLinks.Product.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href="#"
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-slate-400 text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                    >
                                        {link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Company</h4>
                        <ul className="space-y-3">
                            {footerLinks.Company.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={typeof link === 'object' ? link.path : '#'}
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-slate-400 text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                    >
                                        {typeof link === 'object' ? link.name : link}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-2">
                        <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-4">Legal</h4>
                        <ul className="space-y-3">
                            {footerLinks.Legal.map((link, idx) => (
                                <li key={idx}>
                                    <a
                                        href={link.path}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => handleFooterLinkClick(e, link)}
                                        className="text-slate-400 text-sm hover:text-[#00C9B1] transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                    >
                                        {link.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact Column */}
                    <div className="flex flex-col gap-4 lg:col-span-2">
                        <h4 className="text-white font-semibold text-sm tracking-wider uppercase mb-1">Get in Touch</h4>
                        <ul className="space-y-3.5 text-sm text-slate-400">
                            <li className="flex items-start gap-2.5">
                                <FiMapPin size={16} className="text-[#00C9B1] mt-0.5 flex-shrink-0" />
                                <span className="leading-5">Sushant Golf City, Lucknow, 226030</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FiPhone size={15} className="text-[#00C9B1] flex-shrink-0" />
                                <a href="tel:9511117450" className="hover:text-[#00C9B1] transition-colors">+91 9511117450</a>
                            </li>
                            <li className="flex items-center gap-2.5">
                                <FiMail size={15} className="text-[#00C9B1] flex-shrink-0" />
                                <a href="mailto:info@computesofttech.com" className="hover:text-[#00C9B1] transition-colors truncate block max-w-[160px] lg:max-w-none">info@computesofttech.com</a>
                            </li>
                        </ul>
                    </div>

                </div>

                <div className="border-t border-white/5 w-full my-4" />

                {/* ─── ROW 3: FOOTER BOTTOM COMPACT BAR ─── */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 text-center md:text-left">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 text-xs md:text-sm text-slate-400">
                        <div className="flex items-center justify-center gap-1.5">
                            <span>© 2026</span>
                            <a href="https://computesofttech.com/" target="_blank" rel="noopener noreferrer" className="inline-block transition-opacity hover:opacity-80">
                                <img className="w-20 object-contain brightness-95" src={cst} alt="ComputeSoft" />
                            </a>
                            <span>. All rights reserved.</span>
                        </div>
                        <span className="hidden sm:block text-slate-700">•</span>
                        <p className="text-slate-500">Crafted with innovation for modern schools</p>
                    </div>

                    {/* Social channels */}
                    <div className="flex items-center gap-2.5">
                        {socialIcons.map(({ icon, label, href }) => (
                            <a
                                key={label}
                                href={href}
                                aria-label={label}
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 border border-white/10 bg-white/[0.01] hover:text-[#00C9B1] hover:border-[#00C9B1]/30 hover:bg-[#00C9B1]/5 hover:scale-105 transition-all duration-200"
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