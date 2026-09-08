import React, { useState, useEffect, useContext } from 'react';
import {
    CircleStar, Phone, Mail, Menu, X, Sun, Moon,
    User, ArrowRight, Sparkles, Handshake, CheckCircle2, ChevronDown, ChevronRight
} from 'lucide-react';
import ss_logo_2 from '../../assets/Images/SS_logo_3.png';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../ContextAPI/UserContext';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [announcementIndex, setAnnouncementIndex] = useState(0);
    const [isPartnerOpen, setIsPartnerOpen] = useState(false);

    // Partner Form States
    const [partnerForm, setPartnerForm] = useState({
        firstName: '',
        lastName: '',
        workEmail: '',
        phone: '',
        partnerType: ''
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { theme, toggleTheme } = useContext(UserContext);
    const navLinks = ['Home', 'Features', 'Blog', "About Us", 'Contact Us'];

    const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.cst.schoolspine&hl=en_IN";
    const APP_STORE_URL = "https://apps.apple.com/ng/app/schoolspine/id6800739236";

    // Auto-switch announcement bar messages every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setAnnouncementIndex((prev) => (prev === 0 ? 1 : 0));
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Prevent background scroll when modal or mobile menu is open
    useEffect(() => {
        if (isPartnerOpen || menuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isPartnerOpen, menuOpen]);

    const handleNavLinkClick = (link) => {
        setMenuOpen(false);
        if (link === "Home") {
            navigate("/");
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (link === "Features") {
            if (location.pathname === "/") {
                document.getElementById('features-section')?.scrollIntoView({ behavior: 'smooth' });
            } else {
                navigate("/#features-section");
            }
        } else if (link === "Book A Demo") {
            navigate("/contact");
        } else if (link === "Blog") {
            navigate("/blog");
        } else if (link === "About Us") {
            navigate("/about");
        } else if (link === "Contact Us") {
            navigate("/contact");
        }
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsSubmitted(true);
        setTimeout(() => {
            setIsSubmitted(false);
            setIsPartnerOpen(false);
            setPartnerForm({
                firstName: '',
                lastName: '',
                workEmail: '',
                phone: '',
                partnerType: ''
            });
        }, 2200);
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
                    z-index: 5;
                }
                @keyframes announcementSlide {
                    0% { opacity: 0; transform: translateY(6px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-announcement-switch {
                    animation: announcementSlide 0.4s ease-out both;
                }
                @keyframes modalScaleIn {
                    0% { opacity: 0; transform: scale(0.96) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-pop {
                    animation: modalScaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both;
                }
                @keyframes drawerSlideRight {
                    0% { transform: translateX(100%); }
                    100% { transform: translateX(0); }
                }
                @keyframes navItemCascade {
                    0% { opacity: 0; transform: translateX(28px); }
                    100% { opacity: 1; transform: translateX(0); }
                }
                .animate-drawer-in {
                    animation: drawerSlideRight 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
                .animate-nav-item {
                    opacity: 0;
                    animation: navItemCascade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>

            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/35 via-[#F5A623]/20 to-transparent z-30" />

            {/* ── Auto-Switching Top Announcement Bar ── */}
            <div className="w-full bg-gradient-to-r from-[#00C9B1]/[0.06] via-transparent to-[#F5A623]/[0.06] border-b border-theme-border/40 px-3 sm:px-8 lg:px-12 xl:px-16 py-1.5 transition-colors duration-300 min-h-[42px] flex items-center">
                <div className="max-w-7xl mx-auto w-full">

                    {/* Announcement 1: Startup India & Direct Contacts */}
                    {announcementIndex === 0 && (
                        <div key="announcement-0" className="flex items-center justify-between gap-3 animate-announcement-switch">
                            <p className="flex items-center gap-2 text-theme-subtext font-medium text-xs lg:text-sm">
                                <CircleStar size={15} color="gold" className="animate-spin-slow shrink-0" />
                                <span>Recognized by <strong className="text-theme-text font-semibold">Startup India</strong></span>
                            </p>
                            <div className="flex items-center gap-4 lg:gap-6 shrink-0">
                                <a href="tel:+919511117450" className="flex items-center gap-1.5 text-theme-subtext hover:text-[#00C9B1] font-body text-xs lg:text-sm transition-colors duration-200">
                                    <Phone size={12} className="text-theme-text" />
                                    <span className="hidden sm:inline">+91 9511117450</span>
                                    <span className="sm:hidden">Call</span>
                                </a>
                                <a href="mailto:info@computesofttech.com" className="flex items-center gap-1.5 text-theme-subtext hover:text-[#00C9B1] font-body text-xs lg:text-sm transition-colors duration-200">
                                    <Mail size={12} className="text-theme-text" />
                                    <span className="hidden sm:inline">info@computesofttech.com</span>
                                    <span className="sm:hidden">Email</span>
                                </a>
                            </div>
                        </div>
                    )}

                    {/* Announcement 2: Store Badges */}
                    {announcementIndex === 1 && (
                        <div key="announcement-1" className="flex items-center justify-between gap-2 animate-announcement-switch">
                            <div className="flex items-center gap-2 shrink-0">
                                <span className="hidden sm:inline-flex items-center gap-1 bg-[#00C9B1]/15 text-[#00C9B1] border border-[#00C9B1]/30 rounded-full px-2 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shrink-0">
                                    <Sparkles size={11} className="animate-pulse" /> MOBILE APP
                                </span>
                                <span className="text-theme-subtext text-xs sm:text-sm font-medium whitespace-nowrap">
                                    Available on <strong className="text-theme-text font-semibold">Android & iOS</strong>
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                <a
                                    href={PLAY_STORE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Google Play Store"
                                    className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-theme-card/90 hover:bg-[#00C9B1]/10 border border-theme-border hover:border-[#00C9B1]/60 shadow-xs transition-all duration-200 cursor-pointer whitespace-nowrap"
                                >
                                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                                        <path d="M3.609 1.814L13.793 12 3.61 22.186A2.213 2.213 0 0 1 3 20.627V3.373c0-.613.226-1.18.609-1.559z" fill="#00C9B1" />
                                        <path d="M17.207 8.586L13.793 12l3.414 3.414 3.904-2.231c.883-.505.883-1.861 0-2.366L17.207 8.586z" fill="#F5A623" />
                                        <path d="M13.793 12L3.61 1.814A2.327 2.327 0 0 1 4.708 1.55c.489 0 .964.128 1.385.369l11.114 6.667L13.793 12z" fill="#00E5CC" />
                                        <path d="M13.793 12l3.414 3.414-11.114 6.667a2.76 2.76 0 0 1-1.385.369 2.327 2.327 0 0 1-1.098-.264L13.793 12z" fill="#FF5722" />
                                    </svg>
                                    <span className="text-[11px] sm:text-xs font-bold text-theme-text group-hover:text-[#00C9B1] transition-colors">
                                        Google Play
                                    </span>
                                </a>

                                <a
                                    href={APP_STORE_URL}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Apple App Store"
                                    className="group inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1 rounded-xl bg-theme-card/90 hover:bg-[#F5A623]/10 border border-theme-border hover:border-[#F5A623]/60 shadow-xs transition-all duration-200 cursor-pointer whitespace-nowrap"
                                >
                                    <svg className="w-3.5 h-3.5 fill-current text-theme-text group-hover:text-[#F5A623] transition-colors shrink-0" viewBox="0 0 170 170">
                                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.69-7.85-11.97-14.44-6.19-9.58-10.87-20.47-14.04-32.66-3.17-12.19-4.76-23.77-4.76-34.73 0-16.14 4.15-29.6 12.44-40.38 8.29-10.78 18.7-16.29 31.25-16.53 4.8 0 10.3 1.25 16.51 3.75 6.21 2.5 10.02 3.8 11.43 3.91 1.74-.22 5.82-1.63 12.24-4.24 6.42-2.61 11.97-3.8 16.65-3.59 13.06.65 23.59 5.38 31.6 14.19-11.54 6.96-17.15 16.52-16.84 28.69.33 9.79 4.13 18.06 11.4 24.81 7.27 6.75 16.03 10.77 26.27 12.08-2.61 7.84-5.94 15.79-9.98 23.85zm-43.24-118.9c0 7.84-2.83 15.01-8.49 21.52-5.66 6.52-12.74 10.77-21.23 12.74-.22-1.09-.33-2.18-.33-3.27 0-7.62 3.05-15.01 9.15-22.18 6.1-7.18 13.44-11.31 22.02-12.4.11 1.2.17 2.4.17 3.59z" />
                                    </svg>
                                    <span className="text-[11px] sm:text-xs font-bold text-theme-text group-hover:text-[#F5A623] transition-colors">
                                        App Store
                                    </span>
                                </a>
                            </div>
                        </div>
                    )}

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

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-3 xl:gap-4">
                        <button onClick={toggleTheme} className="p-2.5 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-theme-border/20 transition-all duration-300 cursor-pointer flex items-center justify-center" aria-label="Toggle theme">
                            {theme === 'dark' ? <Sun size={18} className="text-[#F5A623]" /> : <Moon size={18} className="text-[#00C9B1]" />}
                        </button>

                        <button
                            onClick={() => setIsPartnerOpen(true)}
                            className="group relative overflow-hidden flex items-center gap-1.5 px-3.5 xl:px-4 py-2.5 rounded-xl font-semibold text-xs xl:text-sm tracking-wide cursor-pointer border border-[#00C9B1]/40 bg-[#00C9B1]/10 text-theme-text hover:border-[#00C9B1] hover:bg-[#00C9B1]/20 hover:text-[#00C9B1] transition-all duration-300 hover:-translate-y-0.5 shadow-xs"
                        >
                            <Handshake size={15} className="text-[#00C9B1] group-hover:scale-110 transition-transform" />
                            <span>Partner with us</span>
                        </button>

                        {/* ── DESKTOP LOGIN BUTTON (CREATIVE SIDE-FILL ANIMATION) ── */}
                        <button
                            onClick={() => window.open("/login", "_blank")}
                            className="group relative overflow-hidden flex items-center gap-2 px-5 xl:px-6 py-2.5 rounded-xl font-bold tracking-wide cursor-pointer border-2 border-[#00C9B1] shadow-[0_4px_18px_rgba(0,201,177,0.18)] hover:shadow-[0_8px_25px_rgba(0,201,177,0.38)] hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-300"
                        >
                            {/* Base Background */}
                            <span className={`absolute inset-0 w-full h-full transition-colors duration-300 ${theme === "light" ? "bg-[#E8FEFF]" : "bg-[#00C9B1]/10"
                                }`} />

                            {/* Side Fill Layer (Slides in from Left to Right on Hover) */}
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#F5A623] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                            {/* Shimmer Sweep Animation */}
                            <div className="shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                            {/* Icon & Label with Contrast Color Shift */}
                            <User
                                size={18}
                                className="relative z-10 text-[#00C9B1] group-hover:text-slate-950 transition-colors duration-300 stroke-[2.5]"
                            />
                            <span className="text-sm xl:text-base relative z-10 text-[#00C9B1] group-hover:text-slate-950 transition-colors duration-300">
                                Login
                            </span>
                        </button>

                        <button
                            onClick={() => handleNavLinkClick("Book A Demo")}
                            className="group relative overflow-hidden flex items-center gap-2 px-4 xl:px-5 py-2.5 rounded-xl font-bold tracking-wide text-slate-950 cursor-pointer bg-gradient-to-r from-[#F5A623] via-[#F7B347] to-[#FF8C00] shadow-[0_4px_20px_rgba(245,166,35,0.35)] hover:shadow-[0_6px_28px_rgba(255,140,0,0.45)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 active:scale-[0.98]"
                        >
                            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 rounded-full bg-[#E07B00] transition-all duration-500 ease-out group-hover:w-[320px] group-hover:h-[320px] pointer-events-none z-0" />
                            <div className="shimmer-effect" />
                            <span className="text-sm xl:text-base relative z-10">
                                Book A Demo
                            </span>
                        </button>
                    </div>
                </div>

                {/* Mobile/Tablet Triggers */}
                <div className='flex lg:hidden gap-2.5 items-center'>
                    <button
                        onClick={() => setIsPartnerOpen(true)}
                        className="px-2.5 py-1.5 rounded-lg border border-[#00C9B1]/50 bg-[#00C9B1]/10 text-xs font-semibold text-[#00C9B1] flex items-center gap-1"
                    >
                        <Handshake size={13} /> Partner
                    </button>

                    <button onClick={toggleTheme} className="p-2 rounded-xl border border-theme-border bg-theme-card text-theme-text hover:bg-white/[0.08] transition-all duration-300 cursor-pointer flex items-center justify-center" aria-label="Toggle theme">
                        {theme === 'dark' ? <Sun size={16} className="text-[#F5A623]" /> : <Moon size={16} className="text-[#00C9B1]" />}
                    </button>

                    <button
                        className='p-1.5 rounded-xl bg-theme-card border border-theme-border text-[#00C9B1] cursor-pointer hover:scale-105 active:scale-95 transition-all'
                        onClick={() => setMenuOpen(true)}
                        aria-label="Open menu"
                    >
                        <Menu size={22} />
                    </button>
                </div>
            </div>

            {/* ── ANIMATED MOBILE/TABLET DRAWER WITH STAGGERED NAV ITEMS ── */}
            {menuOpen && (
                <div className='lg:hidden fixed inset-0 z-[110] flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300'>

                    <div className='w-full sm:w-[380px] h-full bg-theme-bg text-theme-text flex flex-col shadow-2xl border-l border-theme-border/60 animate-drawer-in overflow-hidden'>

                        <div className='flex items-center justify-between px-6 py-4 border-b border-theme-border/60 bg-theme-nav/50 backdrop-blur-md'>
                            <img
                                onClick={() => { navigate('/'); setMenuOpen(false); }}
                                className="h-11 w-auto object-contain cursor-pointer transition-transform hover:scale-105"
                                src={ss_logo_2}
                                alt="SchoolSpine Logo"
                            />
                            <button
                                onClick={() => setMenuOpen(false)}
                                className='w-9 h-9 rounded-full bg-theme-card border border-theme-border text-theme-text flex items-center justify-center cursor-pointer hover:text-[#00C9B1] hover:border-[#00C9B1] transition-all duration-200'
                                aria-label="Close menu"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className='flex flex-col px-6 py-4 overflow-y-auto flex-1 divide-y divide-theme-border/30'>
                            {navLinks.map((link, idx) => (
                                <div
                                    key={link}
                                    style={{ animationDelay: `${70 + idx * 55}ms` }}
                                    className='animate-nav-item py-3.5 flex items-center justify-between group cursor-pointer'
                                    onClick={() => handleNavLinkClick(link)}
                                >
                                    <span className='text-theme-text font-heading text-base font-semibold group-hover:text-[#00C9B1] group-hover:translate-x-1.5 transition-all duration-200'>
                                        {link}
                                    </span>
                                    <ChevronRight size={16} className="text-theme-subtext/40 group-hover:text-[#00C9B1] group-hover:translate-x-1 transition-all duration-200" />
                                </div>
                            ))}
                        </div>

                        <div className='px-6 pt-3 pb-7 flex flex-col gap-2.5 border-t border-theme-border/60 bg-theme-nav/30'>
                            <button
                                style={{ animationDelay: `${70 + navLinks.length * 55 + 50}ms` }}
                                onClick={() => {
                                    setIsPartnerOpen(true);
                                    setMenuOpen(false);
                                }}
                                className="animate-nav-item w-full py-2.5 rounded-xl border border-[#00C9B1] bg-[#00C9B1]/10 text-[#00C9B1] font-semibold text-xs flex items-center justify-center gap-2 hover:bg-[#00C9B1]/20 transition-colors"
                            >
                                <Handshake size={15} />
                                <span>Partner with us</span>
                            </button>

                            {/* ── MOBILE DRAWER LOGIN BUTTON (CREATIVE SIDE-FILL ANIMATION) ── */}
                            <button
                                style={{ animationDelay: `${70 + navLinks.length * 55 + 100}ms` }}
                                onClick={() => {
                                    window.open("/login", "_blank");
                                    setMenuOpen(false);
                                }}
                                className="animate-nav-item group relative overflow-hidden w-full py-2.5 text-xs rounded-xl font-bold cursor-pointer border-2 border-[#00C9B1] transition-all duration-300 flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_4px_15px_rgba(0,201,177,0.15)] hover:shadow-[0_6px_22px_rgba(0,201,177,0.35)]"
                            >
                                {/* Base Background */}
                                <span className={`absolute inset-0 w-full h-full transition-colors duration-300 ${theme === "light" ? "bg-[#E8FEFF]" : "bg-[#00C9B1]/10"
                                    }`} />

                                {/* Side Fill Layer */}
                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#F5A623] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                                <div className="shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <User size={15} className="relative z-10 text-[#00C9B1] group-hover:text-slate-950 transition-colors duration-300 stroke-[2.5]" />
                                <span className="relative z-10 text-[#00C9B1] group-hover:text-slate-950 transition-colors duration-300">
                                    Login
                                </span>
                            </button>

                            <button
                                style={{ animationDelay: `${70 + navLinks.length * 55 + 150}ms` }}
                                onClick={() => handleNavLinkClick("Book A Demo")}
                                className='animate-nav-item w-full py-2.5 text-xs relative overflow-hidden flex items-center justify-center gap-2 text-slate-950 bg-gradient-to-r from-[#F5A623] via-[#F7B347] to-[#FF8C00] rounded-xl font-bold cursor-pointer shadow-md active:scale-[0.99] transition-all'
                            >
                                <div className="shimmer-effect" />
                                <span>Book A Demo</span>
                                <ArrowRight size={13} className="text-slate-950" />
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* ── "PARTNER WITH US" MODAL ── */}
            {isPartnerOpen && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-md transition-all duration-300">

                    <div
                        className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl sm:rounded-[36px] p-6 sm:p-10 border transition-all duration-300 shadow-2xl animate-modal-pop
                        ${theme === 'dark'
                                ? 'bg-[#080E1A] border-slate-800 text-slate-100'
                                : 'bg-white border-slate-200 text-slate-900 shadow-[0_25px_70px_rgba(0,0,0,0.22)]'
                            }`}
                    >
                        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00C9B1] via-[#00B8C8] to-[#F5A623] rounded-t-3xl" />

                        <button
                            onClick={() => setIsPartnerOpen(false)}
                            aria-label="Close modal"
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-900/90 text-white hover:bg-[#00C9B1] hover:text-slate-950 transition-all duration-200 flex items-center justify-center shadow-md cursor-pointer z-20"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center pt-2">

                            {/* Left Side: Brand Authority */}
                            <div className="lg:col-span-6 flex flex-col justify-center">
                                <h2 className="font-heading font-bold text-3xl sm:text-4xl lg:text-[40px] tracking-tight leading-tight">
                                    Partner with{' '}
                                    <span className="bg-gradient-to-r from-[#00C9B1] via-[#00B8C8] to-[#F5A623] bg-clip-text text-transparent">
                                        SchoolSpine
                                    </span>
                                </h2>

                                <p className="mt-2.5 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#F5A623]">
                                    MANAGE | CONNECT | GROW
                                </p>

                                <p className="mt-2 text-sm sm:text-base italic text-theme-subtext font-medium leading-relaxed">
                                    "We believe digital transformation in education is a collaborative journey."
                                </p>

                                <div className="w-16 h-1 bg-gradient-to-r from-[#00C9B1] to-[#F5A623] rounded-full mt-4 mb-6" />

                                <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5 mb-7">
                                    <div className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${theme === 'dark'
                                            ? 'bg-slate-900/80 border-slate-800 hover:border-[#00C9B1]/50'
                                            : 'bg-slate-50 border-slate-200 hover:border-[#00C9B1]/60 hover:bg-[#00C9B1]/[0.03]'
                                        }`}>
                                        <span className="text-xl sm:text-2xl">🚀</span>
                                        <span className="text-[10px] sm:text-[11px] font-bold text-theme-text uppercase mt-2 tracking-tight">
                                            SCHOOLSPINE
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] font-extrabold text-[#00C9B1] uppercase tracking-wider mt-0.5">
                                            NEXT-GEN
                                        </span>
                                    </div>

                                    <div className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${theme === 'dark'
                                            ? 'bg-slate-900/80 border-slate-800 hover:border-[#00B8C8]/50'
                                            : 'bg-slate-50 border-slate-200 hover:border-[#00B8C8]/60 hover:bg-[#00B8C8]/[0.03]'
                                        }`}>
                                        <span className="text-xl sm:text-2xl">🌐</span>
                                        <span className="text-[10px] sm:text-[11px] font-bold text-theme-text uppercase mt-2 tracking-tight">
                                            SUPPORT
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] font-extrabold text-[#00C9B1] uppercase tracking-wider mt-0.5">
                                            24/7 TECH
                                        </span>
                                    </div>

                                    <div className={`p-3.5 sm:p-4 rounded-2xl border text-center flex flex-col items-center justify-center transition-all ${theme === 'dark'
                                            ? 'bg-slate-900/80 border-slate-800 hover:border-[#F5A623]/50'
                                            : 'bg-slate-50 border-slate-200 hover:border-[#F5A623]/60 hover:bg-[#F5A623]/[0.03]'
                                        }`}>
                                        <span className="text-xl sm:text-2xl">⚙️</span>
                                        <span className="text-[10px] sm:text-[11px] font-bold text-theme-text uppercase mt-2 tracking-tight">
                                            SEAMLESS
                                        </span>
                                        <span className="text-[8px] sm:text-[9px] font-extrabold text-[#F5A623] uppercase tracking-wider mt-0.5">
                                            API SYNC
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* Right Side: Form */}
                            <div className="lg:col-span-6">
                                <div className={`p-6 sm:p-8 rounded-3xl border transition-colors ${theme === 'dark'
                                        ? 'bg-[#0B1323] border-slate-800 shadow-xl'
                                        : 'bg-white border-slate-200/90 shadow-[0_10px_35px_rgba(0,0,0,0.06)]'
                                    }`}>

                                    <h3 className="font-heading font-bold text-2xl text-theme-text">
                                        Apply Today
                                    </h3>
                                    <p className="text-xs sm:text-sm text-theme-subtext mt-1 mb-5">
                                        Join the SchoolSpine ecosystem. Let's scale together.
                                    </p>

                                    {isSubmitted ? (
                                        <div className="py-10 flex flex-col items-center text-center animate-modal-pop">
                                            <div className="w-14 h-14 rounded-full bg-[#00C9B1]/15 text-[#00C9B1] flex items-center justify-center mb-3">
                                                <CheckCircle2 size={32} />
                                            </div>
                                            <h4 className="font-heading font-bold text-lg text-theme-text">Partnership Request Sent!</h4>
                                            <p className="text-xs text-theme-subtext mt-1 max-w-xs">
                                                Our strategic partnership team will get in touch with you shortly.
                                            </p>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleFormSubmit} className="flex flex-col gap-3.5">

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-theme-subtext mb-1 block">First Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="John"
                                                        value={partnerForm.firstName}
                                                        onChange={(e) => setPartnerForm({ ...partnerForm, firstName: e.target.value })}
                                                        required
                                                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none border transition-colors ${theme === 'dark'
                                                                ? 'bg-slate-900 border-slate-800 text-white focus:border-[#00C9B1]'
                                                                : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-[#00C9B1]'
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-theme-subtext mb-1 block">Last Name</label>
                                                    <input
                                                        type="text"
                                                        placeholder="Doe"
                                                        value={partnerForm.lastName}
                                                        onChange={(e) => setPartnerForm({ ...partnerForm, lastName: e.target.value })}
                                                        required
                                                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none border transition-colors ${theme === 'dark'
                                                                ? 'bg-slate-900 border-slate-800 text-white focus:border-[#00C9B1]'
                                                                : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-[#00C9B1]'
                                                            }`}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold uppercase tracking-wider text-theme-subtext mb-1 block">Work Email</label>
                                                <input
                                                    type="email"
                                                    placeholder="name@company.com"
                                                    value={partnerForm.workEmail}
                                                    onChange={(e) => setPartnerForm({ ...partnerForm, workEmail: e.target.value })}
                                                    required
                                                    className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none border transition-colors ${theme === 'dark'
                                                            ? 'bg-slate-900 border-slate-800 text-white focus:border-[#00C9B1]'
                                                            : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-[#00C9B1]'
                                                        }`}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-theme-subtext mb-1 block">Phone</label>
                                                    <input
                                                        type="tel"
                                                        placeholder="+91..."
                                                        value={partnerForm.phone}
                                                        onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                                                        required
                                                        className={`w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl outline-none border transition-colors ${theme === 'dark'
                                                                ? 'bg-slate-900 border-slate-800 text-white focus:border-[#00C9B1]'
                                                                : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-[#00C9B1]'
                                                            }`}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold uppercase tracking-wider text-theme-subtext mb-1 block">Partner Type</label>
                                                    <div className="relative">
                                                        <select
                                                            value={partnerForm.partnerType}
                                                            onChange={(e) => setPartnerForm({ ...partnerForm, partnerType: e.target.value })}
                                                            required
                                                            className={`w-full appearance-none px-3.5 py-2.5 pr-8 text-xs sm:text-sm rounded-xl outline-none border transition-colors cursor-pointer ${theme === 'dark'
                                                                    ? 'bg-slate-900 border-slate-800 text-white focus:border-[#00C9B1]'
                                                                    : 'bg-[#F8FAFC] border-slate-200 text-slate-900 focus:border-[#00C9B1]'
                                                                }`}
                                                        >
                                                            <option value="" disabled>Choose</option>
                                                            <option value="EdTech Reseller">EdTech Reseller</option>
                                                            <option value="School Consultant">School Consultant</option>
                                                            <option value="Hardware Partner">Hardware Partner</option>
                                                            <option value="Curriculum & Content">Curriculum & Content</option>
                                                            <option value="Institutional Partner">Institutional Partner</option>
                                                        </select>
                                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-theme-subtext" />
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                type="submit"
                                                className="group relative overflow-hidden w-full mt-3 py-3.5 px-6 rounded-xl font-heading font-bold text-xs sm:text-sm tracking-wider uppercase border border-[#00C9B1]/60 text-theme-text hover:text-slate-950 shadow-md hover:shadow-[0_8px_25px_rgba(0,201,177,0.38)] active:scale-[0.98] transition-all duration-300 cursor-pointer flex items-center justify-center gap-2"
                                            >
                                                <span className={`absolute inset-0 w-full h-full transition-colors duration-300 ${theme === 'dark' ? 'bg-slate-900/90' : 'bg-slate-100/90'
                                                    }`} />

                                                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-[#00B8C8] via-[#00C9B1] to-[#F5A623] -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />

                                                <div className="shimmer-effect opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                                <span className="relative z-10 flex items-center justify-center gap-2 tracking-widest font-extrabold transition-colors duration-300">
                                                    <span>Send Partnership Request</span>
                                                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1.5" />
                                                </span>
                                            </button>

                                            <p className="text-[9px] uppercase tracking-wider text-center text-theme-subtext/75 font-semibold mt-1">
                                                © ComputeSoft Technologies Pvt. Ltd.
                                            </p>
                                        </form>
                                    )}

                                </div>
                            </div>

                        </div>

                    </div>
                </div>
            )}
        </div>
    );
};

export default Navbar;