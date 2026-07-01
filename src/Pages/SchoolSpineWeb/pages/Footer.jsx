import React, { useState } from 'react'
import { FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Logo from '../../../assets/Images/SS_logo_3.png'
import cst from '../../../assets/Images/cst.png'

const footerLinks = {
    Product: [
        'Features',
        'Pricing',
        'Integrations',
        'Security',
        'Updates'
    ],

    Company: [
        { name: 'About Us', path: '/about' },
        { name: 'Our Clients', path: '/clients' },
        { name: 'Contact Us', path: '/contact' },
        { name: 'Help & support', path: '/support' },
        { name: 'Blog', path: '/blog' },
        { name: 'FAQ', path: '/faqs' }
    ],

    Legal: [
        {
            name: 'Privacy Policy',
            path: '/privacy-policy',
            external: true
        },
        {
            name: 'Terms of Service',
            path: '/terms',
            external: true
        },
        {
            name: 'Cookie Policy',
            path: '/cookies',
            external: true
        }
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

    return (
        <footer className="w-full bg-[#0B1320] font-body text-white">

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-12 lg:py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1.8fr] gap-12 lg:gap-16">

                    {/* LEFT SECTION */}
                    <div className="flex flex-col gap-6 max-w-xl">

                        {/* Logo */}
                        <a href="/" className="w-fit block">
                            <img
                                src={Logo}
                                alt="SchoolSpine Logo"
                                className="h-16 md:h-20 object-contain"
                            />
                        </a>

                        {/* Tagline */}
                        <p className="text-gray-400 text-sm leading-7">
                            SchoolSpine is redefining school management with a secure, intelligent, and future-ready platform that connects administrators, teachers, parents, and students—all in one place.
                        </p>

                        {/* Contact Card */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4">

                            <div className="flex gap-3 items-start">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 flex-shrink-0">
                                    📍
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-white">
                                        Office Address
                                    </p>
                                    <p className="text-gray-400 text-sm leading-6 mt-1">
                                        Royal Plaza, Sushant Golf City, Lucknow - 226030
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        📞
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Phone</p>
                                        <a
                                            href="tel:9511117450"
                                            className="text-sm text-white hover:text-teal-400 transition-colors block"
                                        >
                                            +91 9511117450
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                        ✉️
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400">Email</p>
                                        <a
                                            href="mailto:info@computesofttech.com"
                                            className="text-sm text-white hover:text-teal-400 transition-colors block break-all"
                                        >
                                            info@computesofttech.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Subscribe */}
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3 w-full">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 h-12 px-5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-teal-500/50 transition-all text-sm"
                                required
                            />
                            <button
                                type="submit"
                                className="h-12 px-6 rounded-xl font-semibold text-white bg-gradient-to-r from-[#00C9B1] to-[#F5A623] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 shadow-lg shadow-teal-500/10 cursor-pointer whitespace-nowrap"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>

                    {/* RIGHT LINKS */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:pt-4">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="flex flex-col gap-4">
                                <h3 className="text-white font-semibold tracking-wide text-base">
                                    {category}
                                </h3>

                                <ul className="flex flex-col gap-3">
                                    {links.map((link, idx) => {
                                        const isObject = typeof link === 'object';

                                        const label = isObject ? link.name : link;

                                        const path = isObject ? link.path : '#';

                                        const openNewTab = isObject && link.external;

                                        return (
                                            <li key={idx}>
                                                <a
                                                    href={path}
                                                    target={openNewTab ? "_blank" : "_self"}
                                                    rel={openNewTab ? "noopener noreferrer" : undefined}
                                                    className="text-gray-400 text-sm hover:text-teal-400 transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer"
                                                >
                                                    {label}
                                                </a>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}
                    </div>

                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/10 mx-6" />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                    <div className="text-gray-400 text-sm flex flex-wrap items-center justify-center gap-2">
                        <span>© 2026</span>
                        <a href="https://computesofttech.com/" target="_blank" rel="noopener noreferrer" className="inline-block align-middle">
                            <img className="w-24 object-contain" src={cst} alt="ComputeSoft" />
                        </a>
                        <span>. All rights reserved.</span>
                    </div>

                    <span className="hidden sm:block text-white/10">•</span>

                    <p className="text-sm text-gray-400">
                        Crafted with innovation for modern schools
                    </p>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                    {socialIcons.map(({ icon, label, href }) => (
                        <a
                            key={label}
                            href={href}
                            aria-label={label}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 border border-white/10 hover:text-teal-400 hover:border-teal-500/40 hover:bg-teal-500/10 hover:scale-110 transition-all duration-200"
                        >
                            {icon}
                        </a>
                    ))}
                </div>
            </div>

        </footer>
    )
}

export default Footer