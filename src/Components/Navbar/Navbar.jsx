import React, { useState } from 'react';
import { CircleStar, Phone, Menu, X } from 'lucide-react';
import ss_logo_2 from '../../assets/Images/SS_logo_3.png';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const navLinks = ['Home', 'Features', 'Highlights', 'In The News', 'Clients', 'Blog'];

    return (
        <div className="relative bg-[linear-gradient(to_right,#102130,#132939,#152F3F,#173343)] w-full overflow-hidden">

            {/* ── Top Announcement Bar (Desktop & Tablet) ── */}
            <div className="hidden md:flex px-6 lg:px-12 xl:px-16 py-2 items-center justify-between border-b border-white/10">
                <p className='flex gap-2 items-center text-white font-medium text-xs lg:text-sm'>
                    <CircleStar size={16} color='gold' />
                    Recognized by Startup India
                </p>
                <div className='flex gap-5 lg:gap-8'>
                    <p className='flex items-center gap-1 text-white font-body text-xs lg:text-sm cursor-pointer hover:opacity-80 transition'>
                        <Phone size={13} color='white' />
                        Call Us
                    </p>
                    <p
                        onClick={() => navigate('/login')}
                        className='text-white font-body text-xs lg:text-sm cursor-pointer hover:opacity-80 transition'
                    >
                        Login
                    </p>
                    <p className='text-white font-body text-xs lg:text-sm cursor-pointer hover:opacity-80 transition'>
                        Support
                    </p>
                </div>
            </div>

            {/* ── Main Navbar ── */}
            <div className='flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-4'>

                {/* Logo Area */}
                <div className="flex items-center shrink-0">
                    <img
                        onClick={() => navigate('/')}
                        className="h-12 sm:h-14 md:h-16 lg:h-18 xl:h-20 cursor-pointer w-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
                        src={ss_logo_2}
                        alt="SchoolSpine Logo"
                    />
                </div>

                {/* Navigation Links (Desktop - Visible from lg onwards) */}
                <div className='hidden lg:flex items-center justify-center flex-1 mx-4 xl:mx-8 font-body tracking-wide text-sm xl:text-base'>
                    <div className='flex gap-4 xl:gap-6 text-white text-nowrap'>
                        {navLinks.map(link => (
                            <p
                                key={link}
                                onClick={() => {
                                    if (link === "Home") navigate("/");
                                }}
                                className='text-white hover:text-[#00CAFB] cursor-pointer transition duration-200 relative group py-2'
                            >
                                {link}
                                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-[#00CAFB] group-hover:w-full transition-all duration-300'></span>
                            </p>
                        ))}
                    </div>
                </div>

                {/* Action Buttons (Desktop - lg onwards) */}
                <div className='hidden lg:flex items-center gap-3 xl:gap-4 flex-shrink-0'>
                    {/* Login Button */}
                    <button
                        onClick={() => navigate("/login")}
                        className="group relative overflow-hidden px-5 xl:px-6 py-2.5 rounded-xl border border-[#00CAFB]/60 bg-white/[0.03] backdrop-blur-xl text-white font-semibold tracking-wide cursor-pointer shadow-[0_8px_30px_rgba(0,202,251,0.08)] hover:border-[#00CAFB] hover:bg-[#00CAFB]/10 hover:-translate-y-0.5 hover:shadow-[0_12px_35px_rgba(0,202,251,0.25)] transition-all duration-300 text-sm"
                    >
                        <span className="relative z-10">Login</span>
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                    </button>

                    {/* CTA Button */}
                    <button
                        className="group relative overflow-hidden px-6 xl:px-7 py-2.5 rounded-xl font-semibold tracking-wide text-white cursor-pointer bg-gradient-to-r from-[#00C9B1] to-[#F5A623] shadow-[0_10px_35px_rgba(0,202,251,0.35)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 text-sm text-nowrap"
                    >
                        <span className="relative z-10">Get Free Demo</span>
                        <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent group-hover:translate-x-full transition-transform duration-1000" />
                        <span className="absolute inset-x-0 top-0 h-px bg-white/40" />
                    </button>
                </div>

                {/* Mobile Right Controls (Hamburger & Small Utilities) */}
                <div className='flex lg:hidden items-center gap-4'>
                    {/* Mobile inline links - hidden on md up because they live in top bar */}
                    <div className='flex md:hidden gap-3 items-center text-white text-xs'>
                        <p className='flex items-center gap-1 text-nowrap cursor-pointer hover:opacity-80'>
                            <Phone size={11} color='white' /> Call Us
                        </p>
                        <p onClick={() => navigate('/login')} className='cursor-pointer hover:opacity-80'>Login</p>
                    </div>

                    {/* Hamburger Button */}
                    <button
                        className='p-1.5 text-white/90 hover:text-[#00CAFB] transition'
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={28} />
                    </button>
                </div>

            </div>

            {/* ── Mobile Sidebar Drawer ── */}
            {menuOpen && (
                <div className='lg:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fade-in'>

                    {/* Drawer Header */}
                    <div className='flex items-center justify-between px-5 py-4 border-b border-gray-100'>
                        <img
                            onClick={() => { navigate('/'); setMenuOpen(false); }}
                            className="h-12 w-auto object-contain"
                            src={ss_logo_2}
                            alt="SchoolSpine Logo"
                        />

                        <button 
                            onClick={() => setMenuOpen(false)} 
                            className='text-gray-700 p-1.5 hover:bg-gray-100 rounded-full transition' 
                            aria-label="Close menu"
                        >
                            <X size={26} />
                        </button>
                    </div>

                    {/* Secondary Utilities Container inside Drawer */}
                    <div className='flex gap-5 justify-around items-center bg-gray-50 py-3 px-5 border-b border-gray-100 text-sm font-medium text-gray-700'>
                        <p className='flex items-center gap-1.5 cursor-pointer hover:text-[#00CAFB]'>
                            <Phone size={14} color='#1A8A8A' /> Call Us
                        </p>
                        <p onClick={() => { navigate('/login'); setMenuOpen(false); }} className='cursor-pointer hover:text-[#00CAFB]'>
                            Login
                        </p>
                        <p className='cursor-pointer hover:text-[#00CAFB]'>
                            Support
                        </p>
                    </div>

                    {/* Nav Links */}
                    <div className='flex flex-col px-6 py-4 overflow-y-auto divide-y divide-gray-100'>
                        {navLinks.map((link) => (
                            <p
                                key={link}
                                className='text-gray-800 font-body text-lg font-medium py-4 cursor-pointer hover:text-[#00CAFB] transition-colors'
                                onClick={() => {
                                    if (link === "Home") navigate("/");
                                    setMenuOpen(false);
                                }}
                            >
                                {link}
                            </p>
                        ))}
                    </div>

                    {/* Drawer Action Buttons */}
                    <div className='px-6 mt-auto pb-8 flex flex-col gap-3.5'>
                        <button
                            onClick={() => { navigate("/login"); setMenuOpen(false); }}
                            className='w-full py-3 text-base border-2 border-[#00C9B1] rounded-xl text-[#1A8A8A] font-body font-semibold cursor-pointer hover:bg-gradient-to-r hover:from-[#1A8A8A] hover:to-[#00C9B1] hover:text-white transition duration-300'
                        >
                            Login
                        </button>
                        <button 
                            onClick={() => setMenuOpen(false)}
                            className='w-full py-3 text-base text-white bg-gradient-to-r from-[#1A8A8A] to-[#00C9B1] rounded-xl font-body font-semibold cursor-pointer drop-shadow-md'
                        >
                            Get Free Demo
                        </button>
                    </div>

                </div>
            )}

        </div>
    );
};

export default Navbar;