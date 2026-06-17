import React, { useState, useContext } from 'react'
import { CircleStar, Phone, Menu, X, Sun, Moon } from 'lucide-react';
import ss_logo_2 from '../../assets/Images/SS_logo_3.png'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../ContextAPI/UserContext'

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const { theme, toggleTheme } = useContext(UserContext);
    const navLinks = ['Home', 'Features', 'Highlights', 'In The News', 'Clients', 'Blog'];

    return (
        <div className="relative bg-theme-nav text-theme-text transition-colors duration-300">
            {/* Gradient border line at the bottom of Navbar */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/35 via-[#F5A623]/20 to-transparent z-30" />

            {/* ── Top Announcement Bar ── */}
            <div className="hidden md:flex px-4 lg:px-10 xl:px-16 py-2 items-center justify-between">
                <p className='flex gap-1 items-center text-theme-subtext font-medium text-sm'>
                    <CircleStar size={18} color='gold' className="animate-spin-slow" />
                    Recognized by Startup India
                </p>
                <div className='flex gap-3 md:gap-5 pr-0 md:pr-20'>
                    <p className='flex items-center gap-1 text-theme-subtext hover:text-theme-text font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'>
                        <Phone size={13} className="text-theme-text" />
                        Call Us
                    </p>
                    <p
                        onClick={() => navigate('/login')}
                        className='text-theme-subtext hover:text-theme-text font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'
                    >
                        Login
                    </p>
                    <p className='text-theme-subtext hover:text-theme-text font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'>Support</p>
                </div>
            </div>

            <div className='hidden md:block h-[1px] mx-16 bg-theme-border'></div>

            {/* ── Main Navbar ── */}
            <div className='flex items-center justify-between px-10 sm:px-15 lg:px-20 xl:px-30 py-3 relative'>

                {/* Logo (always visible) */}
                <img
                    onClick={() => navigate('/')}
                    className="h-15 sm:h-17 md:h-18  cursor-pointer w-auto object-contain drop-shadow-md hover:drop-shadow-xl transition duration-300 ease-in-out hover:scale-105 lg:hidden"
                    src={ss_logo_2}
                    alt="SchoolSpine Logo"
                />
                <img
                    onClick={() => navigate('/')}
                    className="hidden lg:block h-20 cursor-pointer xl:h-24 w-auto object-contain drop-shadow-md hover:scale-105"
                    src={ss_logo_2}
                    alt="SchoolSpine Logo"
                />

                {/* Desktop pill nav */}
                <div className='hidden lg:flex items-center justify-between flex-1 z-50 p-2 lg:pl-10 mx-8'>

                    {/* Logo */}

                    {/* Nav Links */}
                    <div className='hidden lg:flex gap-4 xl:gap-7 px-10 sm:px-15 lg:px-20 xl:px-30 font-body tracking-wide text-[15px] text-theme-subtext xl:text-[16px]'>
                        {navLinks.map(link => (
                            <p
                                key={link}
                                onClick={() => {
                                    if (link === "Home") {
                                        navigate("/");
                                    }
                                }}
                                className='text-theme-subtext hover:text-[#00C9B1] cursor-pointer transition duration-200 relative group py-5'
                            >
                                {link}
                                <span className='absolute bottom-3 left-0 w-0 h-0.5 bg-[#00C9B1] group-hover:w-full transition-all duration-300'></span>
                            </p>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className='hidden lg:flex gap-3 items-center'>
                        <div className="flex items-center gap-4">
                            {/* Theme Toggle Button */}
                            <button
                                onClick={toggleTheme}
                                className="p-3 rounded-2xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/20 transition-all duration-300 cursor-pointer flex items-center justify-center"
                                aria-label="Toggle theme"
                            >
                                {theme === 'dark' ? <Sun size={18} className="text-[#F5A623]" /> : <Moon size={18} className="text-[#00C9B1]" />}
                            </button>
                            {/* Login Button */}
                            <button
                                onClick={() => navigate("/login")}
                                className="
      group relative overflow-hidden
      px-7 xl:px-8 py-3
      rounded-2xl
      border border-[#00CAFB]/60
      bg-theme-card
      backdrop-blur-xl
      text-theme-text
      font-semibold
      tracking-wide
      cursor-pointer
      shadow-[0_8px_30px_rgba(0,202,251,0.08)]
      hover:border-[#00CAFB]
      hover:bg-[#00CAFB]/10
      hover:-translate-y-1
      hover:shadow-[0_12px_35px_rgba(0,202,251,0.25)]
      transition-all duration-300
    "
                            >
                                <span className="relative z-10">Login</span>

                                {/* Shine Effect */}
                                <span
                                    className="
        absolute inset-0
        -translate-x-full
        bg-gradient-to-r
        from-transparent
        via-white/10
        to-transparent
        group-hover:translate-x-full
        transition-transform
        duration-1000
      "
                                />
                            </button>

                            {/* CTA Button */}
                            <button
                                className="
      group relative overflow-hidden
      px-8 xl:px-9 py-3
      rounded-2xl
      font-semibold
      tracking-wide
      text-white
      cursor-pointer
      bg-[linear-gradient(to_right,#00C9B1,#F5A623)]
      shadow-[0_10px_35px_rgba(0,202,251,0.35)]
      hover:-translate-y-1
      hover:scale-[1.02]
      transition-all duration-300
    "
                            >
                                <span className="relative z-10">
                                    Get Free Demo
                                </span>

                                {/* Premium Shine */}
                                <span
                                    className=" absolute inset-0-translate-x-full bg-linear-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-1000" />

                                {/* Inner Highlight */}
                                <span
                                    className=" absolute inset-x-0 top-0 h-px bg-white/40" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Theme Toggle & links */}
                <div className='flex lg:hidden gap-3 items-center text-theme-text text-xs'>
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-white/[0.08] transition-all duration-300 cursor-pointer flex items-center justify-center"
                        aria-label="Toggle theme"
                    >
                        {theme === 'dark' ? <Sun size={15} className="text-[#F5A623]" /> : <Moon size={15} className="text-[#00C9B1]" />}
                    </button>
                    <div className='flex md:hidden gap-3 items-center text-theme-text text-xs'>
                        <p className='flex items-center gap-1 text-nowrap cursor-pointer'>
                            <Phone size={11} className="text-theme-text" /> Call
                        </p>
                        <p onClick={() => navigate('/login')} className='cursor-pointer'>Login</p>
                    </div>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className='lg:hidden p-1 text-[#00C9B1] ml-2 cursor-pointer'
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={26} />
                </button>

            </div>


            {/* ── Mobile Drawer ── */}
            {menuOpen && (
                <div className='lg:hidden fixed inset-0 z-50 bg-theme-bg text-theme-text flex flex-col transition-colors duration-300'>

                    {/* Drawer Header */}
                    <div className='flex items-center justify-between px-15 py-3 border-b border-theme-border'>
                        <img
                            onClick={() => navigate('/')}
                            className="h-16 w-auto object-contain cursor-pointer"
                            src={ss_logo_2}
                            alt="SchoolSpine Logo"
                        />

                        <div className='flex gap-4 items-center'>
                            <p className='flex items-center gap-1 text-theme-subtext text-xs cursor-pointer'>
                                <Phone size={12} className="text-[#00C9B1]" /> Call Us
                            </p>
                            <p onClick={() => { navigate('/login'); setMenuOpen(false); }} className='text-theme-subtext text-xs cursor-pointer hover:text-theme-text'>Login</p>
                            <p className='text-theme-subtext text-xs cursor-pointer hover:text-theme-text'>Support</p>
                        </div>

                        <button onClick={() => setMenuOpen(false)} className='text-theme-text p-1 cursor-pointer' aria-label="Close menu">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className='flex flex-col px-4 py-2 overflow-y-auto'>
                        {navLinks.map((link, i) => (
                            <React.Fragment key={link}>
                                <p
                                    className='text-theme-text font-body text-[17px] font-medium py-4 cursor-pointer hover:text-[#00C9B1] transition duration-200'
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link}
                                </p>
                                {i < navLinks.length - 1 && (
                                    <div className='h-px w-full bg-theme-border'></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Bottom Buttons */}
                    <div className='px-4 mt-auto pb-8 flex flex-col gap-3'>
                        <button
                            onClick={() => { navigate("/login"); setMenuOpen(false); }}
                            className='w-full py-3 text-base border-theme-border border-2 rounded-2xl text-theme-text font-body font-semibold cursor-pointer hover:bg-gradient-to-r hover:from-[#00C9B1] hover:to-[#F5A623] hover:text-[#05111D] transition duration-300'>
                            Login
                        </button>
                        <button className='w-full py-3 text-base text-white bg-gradient-to-r from-[#00C9B1] to-[#F5A623] rounded-2xl font-body font-semibold cursor-pointer drop-shadow-md'>
                            Get Free Demo
                        </button>
                    </div>

                </div>
            )}

        </div>
    )
}

export default Navbar