import React, { useState } from 'react'
import { CircleStar, Phone, Menu, X } from 'lucide-react';
import ss_logo_2 from '../../assets/Images/SS_logo_3.png'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const navLinks = ['Home', 'Features', 'Highlights', 'In The News', 'Clients', 'Blog'];

    return (
        <div className="relative bg-[#05111D]">
            {/* Gradient border line at the bottom of Navbar */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/35 via-[#F5A623]/20 to-transparent z-30" />

            {/* ── Top Announcement Bar ── */}
            <div className="hidden md:flex px-4 lg:px-10 xl:px-16 py-2 items-center justify-between">
                <p className='flex gap-1 items-center text-slate-300 font-medium text-sm'>
                    <CircleStar size={18} color='gold' className="animate-spin-slow" />
                    Recognized by Startup India
                </p>
                <div className='flex gap-3 md:gap-5 pr-0 md:pr-20'>
                    <p className='flex items-center gap-1 text-slate-300 hover:text-white font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'>
                        <Phone size={13} color='white' />
                        Call Us
                    </p>
                        <p
                            onClick={() => navigate('/login')}
                            className='text-slate-300 hover:text-white font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'
                        >
                            Login
                        </p>
                    <p className='text-slate-300 hover:text-white font-body text-[13px] md:text-[15px] cursor-pointer transition-colors duration-200'>Support</p>
                </div>
            </div>

            <div className='hidden md:block h-[1px] mx-16 bg-white/[0.08]'></div>

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
                    <div className='hidden lg:flex gap-4 xl:gap-7 px-10 sm:px-15 lg:px-20 xl:px-30 font-body tracking-wide text-[15px] text-slate-300 xl:text-[16px]'>
                        {navLinks.map(link => (
                            <p
                                key={link}
                                onClick={() => {
                                    if (link === "Home") {
                                        navigate("/");
                                    }
                                }}
                                className='text-slate-300 hover:text-[#00C9B1] cursor-pointer transition duration-200 relative group py-5'
                            >
                                {link}
                                <span className='absolute bottom-3 left-0 w-0 h-0.5 bg-[#00C9B1] group-hover:w-full transition-all duration-300'></span>
                            </p>
                        ))}
                    </div>

                    {/* Desktop Buttons */}
                    <div className='hidden lg:flex gap-3 items-center'>
                        <div className="flex items-center gap-4">
                            {/* Login Button */}
                            <button
                                onClick={() => navigate("/login")}
                                className="
      group relative overflow-hidden
      px-7 xl:px-8 py-3
      rounded-2xl
      border border-[#00CAFB]/60
      bg-white/[0.03]
      backdrop-blur-xl
      text-white
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

                {/* Mobile: top-bar links (small, inline) */}
                <div className='flex md:hidden gap-3 items-center text-white text-xs'>
                    <p className='flex items-center gap-1 text-nowrap cursor-pointer'>
                        <Phone size={11} color='white' /> Call Us
                    </p>
                        <p onClick={() => navigate('/login')} className='cursor-pointer'>Login</p>
                    <p className='cursor-pointer'>Support</p>
                </div>

                {/* Mobile Hamburger */}
                <button
                    className='lg:hidden p-1 text-teal-dark ml-2'
                    onClick={() => setMenuOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={26} />
                </button>

            </div>


            {/* ── Mobile Drawer ── */}
            {menuOpen && (
                <div className='lg:hidden fixed inset-0 z-50 bg-white flex flex-col'>

                    {/* Drawer Header */}
                    <div className='flex items-center justify-between px-15 py-3 border-b border-gray-100'>
                        <img
                            onClick={() => navigate('/')}
                            className="h-16 w-auto object-contain"
                            src={ss_logo_2}
                            alt="SchoolSpine Logo"
                        />

                        <div className='flex gap-4 items-center'>
                            <p className='flex items-center gap-1 text-teal-dark text-xs cursor-pointer'>
                                <Phone size={12} color='#1A8A8A' /> Call Us
                            </p>
                                <p onClick={() => { navigate('/login'); setMenuOpen(false); }} className='text-teal-dark text-xs cursor-pointer'>Login</p>
                            <p className='text-teal-dark text-xs cursor-pointer'>Support</p>
                        </div>

                        <button onClick={() => setMenuOpen(false)} className='text-teal-dark p-1' aria-label="Close menu">
                            <X size={24} />
                        </button>
                    </div>

                    {/* Nav Links */}
                    <div className='flex flex-col px-4 py-2 overflow-y-auto'>
                        {navLinks.map((link, i) => (
                            <React.Fragment key={link}>
                                <p
                                    className='text-text-primary font-body text-[17px] font-medium py-4 cursor-pointer hover:text-teal-dark transition duration-200'
                                    onClick={() => setMenuOpen(false)}
                                >
                                    {link}
                                </p>
                                {i < navLinks.length - 1 && (
                                    <div className='h-px w-full bg-gray-100'></div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Bottom Buttons */}
                    <div className='px-4 mt-auto pb-8 flex flex-col gap-3'>
                        <button
                            onClick={() => navigate("/login")}
                            className='w-full py-3 text-base border-teal border-2 rounded-2xl text-teal-dark font-body font-semibold cursor-pointer hover:bg-linear-to-r from-teal-dark to-teal hover:text-white transition duration-300'>
                            Login
                        </button>
                        <button className='w-full py-3 text-base text-white bg-linear-to-r from-teal-dark to-teal rounded-2xl font-body font-semibold cursor-pointer drop-shadow-md'>
                            Get Free Demo
                        </button>
                    </div>

                </div>
            )}

        </div>
    )
}

export default Navbar