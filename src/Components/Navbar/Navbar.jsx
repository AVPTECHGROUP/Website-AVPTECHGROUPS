import React, { useState, useContext } from 'react';
import { CircleStar, Phone, Mail, Menu, X, Sun, Moon, User, ArrowRight } from 'lucide-react';
import ss_logo_2 from '../../assets/Images/SS_logo_3.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../ContextAPI/UserContext';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useContext(UserContext);
    const navLinks = ['Home', 'Features', 'Blog', 'Pricing', "About Us", 'Contact Us'];

    // Unified link click handler for flawless smooth sliding
    const handleNavLinkClick = (link) => {
        setMenuOpen(false); // Instantly close mobile drawer if open

        if (link === "Home") {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (link === "Features") {
            if (location.pathname === "/") {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate("/#features-section");
            }
        } else if (link === "Pricing") {
            if (location.pathname === "/") {
                document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate("/#pricing-section");
            }
        } else if (link === "Get Free Demo") {
            /* ── Added Demo Section Scroll Logic ── */
            if (location.pathname === "/") {
                document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate("/#demo");
            }
        } else if (link === "Blog") {
            navigate("/blog");
        } else if (link === "About Us") {
            navigate("/about");
        } else if (link === "Contact Us") {
            navigate("/contact");
        }
    };

    return (
        <div className="relative bg-theme-nav text-theme-text transition-colors duration-300 w-full">
            <style>{`
                @keyframes custom-shimmer {
                    0% { transform: translateX(-200%) skewX(-20deg); }
                    100% { transform: translateX(200%) skewX(-20deg); }
                }
                .shimmer-effect {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.45),
                        transparent
                    );
                    animation: custom-shimmer 4s infinite ease-in-out;
                }
            `}</style>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/35 via-[#F5A623]/20 to-transparent z-30" />

            {/* ── Top Announcement Bar ── */}
            <div className="hidden md:flex px-6 lg:px-12 xl:px-16 py-2 items-center justify-between border-b border-theme-border/40">
                <p className='flex gap-2 items-center text-theme-subtext font-medium text-xs lg:text-sm'>
                    <CircleStar size={16} color='gold' className="animate-spin-slow" />
                    Recognized by Startup India
                </p>
                <div className='flex gap-4 lg:gap-6'>
                    <a href="tel:+919511117450" className='flex items-center gap-1.5 text-theme-subtext hover:text-[#00C9B1] font-body text-xs lg:text-sm transition-colors duration-200'>
                        <Phone size={12} className="text-theme-text" /> +91 9511117450
                    </a>
                    <a href="mailto:info@computesofttech.com" className='flex items-center gap-1.5 text-theme-subtext hover:text-[#00C9B1] font-body text-xs lg:text-sm transition-colors duration-200'>
                        <Mail size={12} className="text-theme-text" /> info@computesofttech.com
                    </a>
                </div>
            </div>

            {/* ── Main Navbar ── */}
            <div className='flex items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-16 py-3 relative max-w-7xl mx-auto w-full'>
                
                {/* Logo */}
                <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                    <img className="h-12 sm:h-14 lg:h-16 xl:h-20 w-auto object-contain drop-shadow-md hover:drop-shadow-xl transition duration-300 ease-in-out hover:scale-105" src={ss_logo_2} alt="SchoolSpine Logo" />
                </div>

                {/* Desktop Navigation */}
                <div className='hidden lg:flex items-center justify-between flex-1 ml-8 xl:ml-12 z-50'>
                    <div className='flex gap-4 xl:gap-8 font-body tracking-wide text-sm xl:text-base text-theme-subtext mx-auto'>
                        {navLinks.map(link => (
                            <p
                                key={link}
                                onClick={() => handleNavLinkClick(link)}
                                className='text-theme-subtext hover:text-[#00C9B1] cursor-pointer transition duration-200 relative group py-2'
                            >
                                {link}
                                <span className='absolute bottom-0 left-0 w-0 h-0.5 bg-[#00C9B1] group-hover:w-full transition-all duration-300'></span>
                            </p>
                        ))}
                    </div>

                    {/* Desktop CTA Action Actions */}
                    <div className="flex items-center gap-4 xl:gap-5">
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/20 transition-all duration-300 cursor-pointer flex items-center justify-center" aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun size={18} className="text-[#F5A623]" /> : <Moon size={18} className="text-[#00C9B1]" />}
                        </button>

                        <button onClick={() => window.open("/login", "_blank")} className="group relative overflow-hidden flex items-center gap-2 px-5 xl:px-6 py-2.5 rounded-xl font-bold tracking-wide text-slate-950 cursor-pointer bg-gradient-to-r from-[#00C9B1] via-[#00C9B1] to-[#F5A623] shadow-[0_4px_20px_rgba(0,201,177,0.22)] hover:shadow-[0_6px_24px_rgba(245,166,35,0.32)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]">
                            <div className="shimmer-effect" />
                            <User size={16} className="text-slate-950 relative z-10 stroke-[2.5]" />
                            <span className="text-sm xl:text-base relative z-10">Login</span>
                        </button>

                        {/* Desktop: Get Free Demo Trigger */}
                        <button onClick={() => handleNavLinkClick("Get Free Demo")} className="group relative overflow-hidden flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl font-bold tracking-wide text-slate-950 cursor-pointer bg-gradient-to-r from-[#00C9B1] via-[#00C9B1] to-[#F5A623] shadow-[0_4px_20px_rgba(0,201,177,0.25)] hover:shadow-[0_6px_24px_rgba(245,166,35,0.35)] hover:-translate-y-0.5 transition-all duration-300 active:scale-[0.98]">
                            <div className="shimmer-effect" />
                            <span className="text-sm xl:text-base relative z-10">Get Free Demo</span>
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Triggers */}
                <div className='flex lg:hidden gap-3 items-center'>
                    <button onClick={toggleTheme} className="p-2 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-white/[0.08] transition-all duration-300 cursor-pointer flex items-center justify-center" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={16} className="text-[#F5A623]" /> : <Moon size={16} className="text-[#00C9B1]" />}
                    </button>

                    <div className='flex md:hidden gap-3 items-center text-theme-text text-xs border-r border-theme-border pr-2 mr-1'>
                        <a href="tel:+919511117450" className='flex items-center gap-1 text-nowrap hover:text-[#00C9B1]'><Phone size={12} className="text-theme-text" /> Call</a>
                        <a href="mailto:info@computesofttech.com" className='flex items-center gap-1 text-nowrap hover:text-[#00C9B1]'><Mail size={12} className="text-theme-text" /> Email</a>
                    </div>

                    <button className='p-1 text-[#00C9B1] cursor-pointer hover:scale-105 transition-transform' onClick={() => setMenuOpen(true)} aria-label="Open menu">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* ── Mobile/Tablet Drawer ── */}
            {menuOpen && (
                <div className='lg:hidden fixed inset-0 z-50 bg-theme-bg text-theme-text flex flex-col transition-colors duration-300 animate-in fade-in zoom-in-95 duration-200'>
                    <div className='flex items-center justify-between px-6 py-4 border-b border-theme-border'>
                        <img onClick={() => { navigate('/'); setMenuOpen(false); }} className="h-12 w-auto object-contain cursor-pointer" src={ss_logo_2} alt="SchoolSpine Logo" />
                        <button onClick={() => setMenuOpen(false)} className='text-theme-text p-1 cursor-pointer hover:text-[#00C9B1]' aria-label="Close menu">
                            <X size={24} />
                        </button>
                    </div>

                    <div className='flex flex-col px-6 py-4 overflow-y-auto split-y divide-y divide-theme-border/60'>
                        {navLinks.map((link) => (
                            <p
                                key={link}
                                className='text-theme-text font-body text-base font-medium py-4 cursor-pointer hover:text-[#00C9B1] transition duration-200'
                                onClick={() => handleNavLinkClick(link)}
                            >
                                {link}
                            </p>
                        ))}
                    </div>

                    <div className='px-6 mt-auto pb-8 flex flex-col gap-3 border-t border-theme-border/40 pt-4'>
                        <button onClick={() => { window.open("/login", "_blank"); setMenuOpen(false); }} className='w-full py-3 text-sm relative overflow-hidden flex items-center justify-center gap-2 text-slate-950 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] rounded-xl font-bold cursor-pointer transition-transform duration-200 shadow-md'>
                            <div className="shimmer-effect" />
                            <User size={16} className="text-slate-950 relative z-10" />
                            <span className="relative z-10">Login</span>
                        </button>
                        
                        {/* Mobile: Get Free Demo Trigger */}
                        <button onClick={() => handleNavLinkClick("Get Free Demo")} className='w-full py-3 text-sm relative overflow-hidden flex items-center justify-center gap-2 text-slate-950 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] rounded-xl font-bold cursor-pointer transition-transform duration-200 shadow-md'>
                            <div className="shimmer-effect" />
                            <span className="relative z-10">Get Free Demo</span>
                            <div className="relative z-10 bg-slate-950/10 rounded-md p-0.5 flex items-center justify-center">
                                <ArrowRight size={12} className="text-slate-950 stroke-[2.5]" />
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;