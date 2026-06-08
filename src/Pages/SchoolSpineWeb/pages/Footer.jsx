import React, { useState } from 'react'
import { FaLinkedinIn, FaYoutube, FaInstagram } from 'react-icons/fa'
import { FaXTwitter } from 'react-icons/fa6'
import Logo from '../../../assets/Images/SS_logo_3.png'
import cst from '../../../assets/Images/cst.png'
import { useNavigate } from 'react-router-dom'

const footerLinks = {
    Product: ['Features', 'Pricing', 'Integrations', 'Security', 'Updates'],
    Company: ['About', 'Careers', 'Press', 'Partners', 'Contact'],
    Resources: ['Documentation', 'Help Center', 'API Reference', 'Community', 'Blog'],
    Legal: [
        { name: 'Privacy Policy', path: '/privacy-policy' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Cookie Policy', path: '/cookies' }
    ],
}

const socialIcons = [
    { icon: <FaLinkedinIn size={16} />, label: 'LinkedIn' },
    { icon: <FaXTwitter size={16} />, label: 'Twitter' },
    { icon: <FaYoutube size={16} />, label: 'YouTube' },
    { icon: <FaInstagram size={16} />, label: 'Instagram' },
]

const Footer = () => {
    const [email, setEmail] = useState('')
    const navigate = useNavigate()
    return (
        <footer className="w-full bg-bg-dark font-body">

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_2fr] gap-16">

                    {/* LEFT SECTION */}
                    <div className="flex flex-col gap-7">

                        {/* Logo */}
                        <a href="/" className="w-fit">
                            <img
                                src={Logo}
                                alt="SchoolSpine Logo"
                                className="h-30 object-contain"
                            />
                        </a>

                        {/* Tagline */}
                        <p className="text-text-muted text-sm leading-7 max-w-md">
                            The modern school management platform that helps schools
                            streamline operations, improve communication, and focus more
                            on quality education.
                        </p>

                        {/* Contact Card */}
                        <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col gap-4 max-w-md">

                            <div className="flex gap-3">
                                <div className="w-10 h-10 rounded-xl bg-teal/10 border border-teal/20 flex items-center justify-center text-teal font-bold">
                                    📍
                                </div>

                                <div>
                                    <p className="text-white text-sm font-medium">
                                        Office Address
                                    </p>

                                    <p className="text-text-muted text-sm leading-6 mt-1">
                                        Royal Plaza, Sushant Golf City,
                                        Lucknow - 226030
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">

                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        📞
                                    </div>

                                    <div>
                                        <p className="text-xs text-text-muted">
                                            Phone
                                        </p>

                                        <a
                                            href="tel:9511117450"
                                            className="text-sm text-white hover:text-teal transition-colors"
                                        >
                                            +91 9511117450
                                        </a>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                                        ✉️
                                    </div>

                                    <div>
                                        <p className="text-xs text-text-muted">
                                            Email
                                        </p>

                                        <a
                                            href="mailto:info@computesofttech.com"
                                            className="text-sm text-white hover:text-teal transition-colors"
                                        >
                                            info@computesofttech.com
                                        </a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Subscribe */}
                        <div className="flex items-center flex-col lg:flex-row gap-3 max-w-md">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="flex-1 h-12 px-5 py-3 w-full rounded-lg bg-white/4 border border-white/10 text-white placeholder-text-muted outline-none focus:border-teal/50 transition-all"
                            />

                            <button className="h-12 px-6 rounded-2xl font-semibold text-white bg-[linear-gradient(to_right,#00C9B1,#F5A623)] hover:scale-105 transition-all duration-300 shadow-lg shadow-teal/20 cursor-pointer">
                                Subscribe
                            </button>
                        </div>
                    </div>

                    {/* RIGHT LINKS */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 lg:pt-5">
                        {Object.entries(footerLinks).map(([category, links]) => (
                            <div key={category} className="flex flex-col gap-5">

                                <h3 className="text-white font-semibold tracking-wide text-base">
                                    {category}
                                </h3>

                                <ul className="flex flex-col gap-4">
                                    {links.map((link) => (
                                        <li key={typeof link === "string" ? link : link.name}>
                                            <button
                                                onClick={() => {
                                                    if (typeof link === "object") {
                                                        navigate(link.path)
                                                    }
                                                }}
                                                className="text-text-muted text-sm hover:text-teal transition-all duration-200 hover:translate-x-1 inline-block cursor-pointer bg-transparent border-none p-0"
                                            >
                                                {typeof link === "string" ? link : link.name}
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                            </div>
                        ))}
                    </div>

                </div>
            </div>
            {/* Divider */}
            <div className="border-t border-white/10 mx-6" />

            {/* Bottom Bar */}
            <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <p className="text-text-muted text-[17px] flex items-center gap-2">
                        © 2026{" "}
                        <a href="https://computesofttech.com/" className="w-fit">
                            <img className="w-30 cursor-pointer" src={cst} alt="" />
                        </a>
                        . All rights reserved.
                    </p>

                    <span className="hidden sm:block text-white/10">•</span>

                    <p className="text-sm text-text-muted">
                        Crafted with innovation for modern schools
                    </p>
                </div>

                {/* Social Icons */}
                <div className="flex items-center gap-3">
                    {socialIcons.map(({ icon, label }) => (
                        <a
                            key={label}
                            href="#"
                            aria-label={label}
                            className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted border border-white/10 hover:text-teal hover:border-teal/40 hover:bg-teal/10 hover:scale-110 transition-all duration-200"
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