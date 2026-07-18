import React, { useEffect, useState } from 'react';
import StatCard from "../../Common/StatCard";
import SeeInAction from "./SeeInAction";
import DetailsStrip from './DetailsStrip';
import {
    Bus, CalendarCheck, CalendarClock, CalendarX2, FileBarChartIcon, GraduationCap,
    IndianRupee, MessageSquareText, NotebookPen, Smartphone, Store, Users,
    Building2, ShieldCheck, Headphones, ChevronRight
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

import mobileLight from '../../../assets/Images/DesignedFor/mobile_light.png';
import mobileDark from '../../../assets/Images/DesignedFor/mobile_dark.png';
import tabletLight from '../../../assets/Images/DesignedFor/tablet_light.png';
import tabletDark from '../../../assets/Images/DesignedFor/tablet_dark.png';
import desktopLight from '../../../assets/Images/DesignedFor/desktop_light.png';
import desktopDark from '../../../assets/Images/DesignedFor/desktop_dark.png';

const statsData = [
    { icon: <GraduationCap />, title: "Student Management", slug: "student-management", description: "Manage admissions, student records, academic history, attendance, and performance reports from one centralized dashboard." },
    { icon: <CalendarCheck />, title: "Geo Attendance", slug: "geo-attendance", description: "Smart attendance system with face recognition, biometric verification, GPS tracking, and secure check-in/check-out monitoring." },
    { icon: <IndianRupee />, title: "Fees & Billing", slug: "fee-billing", description: "Automated fee collection with smart payment reminders, instant digital invoices, receipts, and effortless real-time financial reporting." },
    { icon: <FileBarChartIcon />, title: "Exam Management", slug: "exam-management", description: "Seamless exam scheduling, effortless marks entry, automated grading matrix, custom report card generation, and instant result publishing." },
    { icon: <Bus />, title: "Transport Management", slug: "transport-management", description: "Track vehicles, manage routes, monitor student pickups, and streamline transport operations efficiently." },
    { icon: <Users />, title: "Staff Management", slug: "staff-management", description: "Handle staff attendance, payroll, leave requests, department records, and workforce management efficiently." },
    { icon: <Smartphone />, title: "Parent App", slug: "parent-app", description: "Keep parents updated with real-time notifications, attendance alerts, results, homework, and announcements." },
    { icon: <Store />, title: "Store Management", slug: "store-management", description: "Manage inventory, suppliers, purchases, stock movement, and store operations without manual hassle." },
    { icon: <CalendarClock />, title: "Timetable Management", slug: "timetable-management", description: "Create conflict-free class schedules, manage teacher workloads, and handle substitutions with ease." },
    { icon: <NotebookPen />, title: "Homework & Assignments", slug: "homework-assignments", description: "Assign, track, and evaluate homework with subject-wise submissions and approval workflows." },
    { icon: <MessageSquareText />, title: "Communication Hub", slug: "communication-hub", description: "Send circulars, announcements, and real-time push notifications to parents, staff, and students instantly." },
    { icon: <CalendarX2 />, title: "Leave & Holiday Management", slug: "leave-holiday-management", description: "Automate leave requests, approvals, and holiday calendars across your entire institution." },
];

const futerData = [
    {
        icon: <FileBarChartIcon />,
        title: "Reports & Analytics",
        description: "Generate detailed reports on academics, attendance, and finances with actionable insights.",
        gradient: "from-cyan-500 to-teal-500",
        border: "border-t-cyan-500/70 dark:border-t-cyan-400/70",
        glow: "hover:shadow-cyan-500/10",
        // img: dataImg,
    },
    {
        icon: <Users />,
        title: "Role-Based Access",
        description: "Secure access control for admins, teachers, students, and parents with custom permissions.",
        gradient: "from-blue-500 to-indigo-500",
        border: "border-t-blue-500/70 dark:border-t-blue-400/70",
        glow: "hover:shadow-blue-500/10",
        // img: secureImg,
    },
    {
        icon: <Smartphone />,
        title: "Mobile Friendly",
        description: "Access the system anytime, anywhere with a fully responsive and optimized mobile experience.",
        gradient: "from-cyan-500 to-teal-500",
        border: "border-t-cyan-500/70 dark:border-t-cyan-400/70",
        glow: "hover:shadow-cyan-500/10",
        // img: sheildImg,
    },
    {
        icon: <CalendarCheck />,
        title: "Timetable Management",
        description: "Create and manage class schedules efficiently with conflict-free timetable planning.",
        gradient: "from-amber-500 to-orange-500",
        border: "border-t-amber-500/70 dark:border-t-amber-400/70",
        glow: "hover:shadow-amber-500/10",
        // img: timeImg,
    },
];

const trustStats = [
    { icon: <Building2 />, value: "5+", label: "Schools Trust Us", color: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/30 dark:ring-cyan-400/30" },
    { icon: <Users />, value: "3000+", label: "Students Managed", color: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/30 dark:ring-cyan-400/30" },
    { icon: <ShieldCheck />, value: "99.99%", label: "Uptime & Reliability", color: "text-amber-600 dark:text-amber-400", ring: "ring-amber-500/30 dark:ring-amber-400/30" },
    { icon: <Headphones />, value: "24x7", label: "Support Available", color: "text-cyan-600 dark:text-cyan-400", ring: "ring-cyan-500/30 dark:ring-cyan-400/30" },
];

const designedForImages = {
    mobile: { light: mobileLight, dark: mobileDark },
    tablet: { light: tabletLight, dark: tabletDark },
    desktop: { light: desktopLight, dark: desktopDark },
};

const useResponsiveTheme = () => {
    const [breakpoint, setBreakpoint] = useState('desktop');
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        const getBreakpoint = () => {
            const w = window.innerWidth;
            if (w < 640) return 'mobile';
            if (w < 1024) return 'tablet';
            return 'desktop';
        };

        const handleResize = () => setBreakpoint(getBreakpoint());
        handleResize();
        window.addEventListener('resize', handleResize);

        const checkDark = () => setIsDark(document.documentElement.classList.contains('dark'));
        checkDark();

        const observer = new MutationObserver(checkDark);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

        return () => {
            window.removeEventListener('resize', handleResize);
            observer.disconnect();
        };
    }, []);

    return { breakpoint, isDark };
};

const Details = () => {
    const navigate = useNavigate();
    const { hash } = useLocation();
    const { breakpoint, isDark } = useResponsiveTheme();
    const designedForImg = designedForImages[breakpoint][isDark ? 'dark' : 'light'];

    useEffect(() => {
        if (hash === '#features-section') {
            const element = document.getElementById('features-section');
            if (element) {
                setTimeout(() => {
                    element.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }, [hash]);

    return (
        <>
            <div id="features-section" className="relative min-h-screen overflow-x-hidden font-body bg-theme-bg text-theme-text transition-colors duration-300">

                {/* Subtle soft background highlight (Not aggressive) */}
                <div className='pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-cyan-500/[0.03] dark:bg-cyan-500/[0.05] rounded-full blur-[100px] -z-10' />

                {/* ── Intro ── */}
                <div className='flex flex-col justify-center items-center gap-3 sm:gap-4 px-4 pt-10 sm:pt-14'>
                    <h1 className='font-heading text-2xl sm:text-4xl lg:text-5xl tracking-tight text-center text-theme-text font-semibold'>
                        Everything Your School{' '}
                        <span className='bg-gradient-to-r from-cyan-600 to-teal-600 dark:from-cyan-400 dark:to-teal-400 bg-clip-text text-transparent font-bold'>
                            Needs
                        </span>
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg text-theme-subtext max-w-xs sm:max-w-lg md:max-w-2xl text-center leading-relaxed opacity-90">
                        One platform. All the tools. Infinite possibilities.
                    </p>
                </div>

                {/* ── Stat Cards Grid (Expanded to max-w-7xl) ── */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mt-4">
                    {statsData.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(`/features/${item.slug}`)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/features/${item.slug}`)}
                            role="button"
                            tabIndex={0}
                            className="cursor-pointer group rounded-2xl transition-all duration-200 hover:shadow-md dark:hover:bg-white/[0.02]"
                        >
                            <StatCard icon={item.icon} title={item.title} description={item.description} showLearnMore={true} />
                        </div>
                    ))}
                </div>

                {/* ── GSAP Device Showcase ── */}
                <SeeInAction />

                {/* ══════════════════ Future Section (Full hero-style, matches reference) ══════════════════ */}
                <div className={`relative overflow-hidden border-y py-14 lg:py-20 transition-colors duration-300
    ${isDark ? 'bg-[#050914] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>

                    {/* Decorative dotted grid — top left */}
                    <div
                        className="pointer-events-none absolute top-8 left-6 sm:left-10 w-32 h-24 -z-0"
                        style={{
                            backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
                            backgroundSize: '10px 10px',
                            color: isDark ? '#38bdf8' : '#94a3b8',
                            opacity: isDark ? 0.25 : 0.35,
                        }}
                    />

                    {/* Decorative floating comet dot near heading */}
                    <div className="pointer-events-none absolute top-24 left-[38%] hidden lg:block -z-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_12px_4px_rgba(251,191,36,0.5)]" />
                        <svg width="140" height="60" viewBox="0 0 140 60" className="absolute -top-4 left-2" style={{ opacity: isDark ? 0.4 : 0.3 }}>
                            <path d="M0,50 C40,10 80,0 138,4" stroke="url(#cometGrad)" strokeWidth="1.2" fill="none" />
                            <defs>
                                <linearGradient id="cometGrad" x1="0" y1="0" x2="1" y2="0">
                                    <stop offset="0%" stopColor="transparent" />
                                    <stop offset="100%" stopColor={isDark ? '#38bdf8' : '#0891b2'} />
                                </linearGradient>
                            </defs>
                        </svg>
                    </div>

                    {/* Decorative wave lines — bottom */}
                    <svg
                        className="pointer-events-none absolute bottom-0 left-0 w-full h-24 sm:h-32 -z-0"
                        viewBox="0 0 1440 160" preserveAspectRatio="none"
                        style={{ opacity: isDark ? 0.6 : 0.2 }}
                    >
                        <path d="M0,120 C240,40 480,140 720,80 C960,20 1200,100 1440,60" stroke={isDark ? '#38bdf8' : '#0891b2'} strokeWidth="2" fill="none" />
                        <path d="M0,140 C260,90 520,150 780,110 C1040,70 1260,130 1440,100" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.5" />
                    </svg>

                    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row justify-between items-start gap-10 lg:gap-8 relative z-10'>

                        {/* ── Left: Badge + Heading + Subtext + Stats ── */}
                        <div className='lg:w-2/5 shrink-0 w-full text-center lg:text-left'>

                            {/* Pill badge */}
                            <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide uppercase border
                ${isDark ? 'border-cyan-400/30 text-cyan-300 bg-cyan-400/5' : 'border-cyan-600/30 text-cyan-700 bg-cyan-500/10'}`}>
                                Future-Ready School Management
                                <ChevronRight className="w-3.5 h-3.5" />
                            </span>

                            {/* Heading */}
                            <h1 className={`font-heading text-3xl sm:text-4xl lg:text-[42px] leading-tight font-bold mt-4
                ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                Built for the{" "}
                                <span className={`relative inline-block font-extrabold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>
                                    future
                                    <svg
                                        className="absolute left-0 -bottom-2 w-full h-[14px]"
                                        viewBox="0 0 100 16"
                                        preserveAspectRatio="none"
                                    >
                                        <path
                                            d="M0,8 Q17,0 34,8 T68,8 T100,8"
                                            fill="none"
                                            stroke={isDark ? '#22d3ee' : '#0891b2'}
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                </span>{" "}
                                of school management
                            </h1>

                            {/* Subtext */}
                            <p className={`mt-4 text-sm sm:text-base leading-relaxed max-w-md mx-auto lg:mx-0 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                Modern schools need more than just software.{" "}
                                <span className={`font-semibold ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`}>SchoolSpine</span>{" "}
                                is built to simplify today and transform tomorrow.
                            </p>

                            {/* Stats row */}
                            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                                {trustStats.map((stat, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center text-center gap-2">
                                        <div className={`w-11 h-11 rounded-full flex items-center justify-center ring-1 ${stat.ring} ${isDark ? 'bg-[#0b1220]' : 'bg-white shadow-sm'}`}>
                                            <span className={`${stat.color} [&>svg]:w-5 [&>svg]:h-5`}>
                                                {stat.icon}
                                            </span>
                                        </div>
                                        <div className={`font-heading text-lg sm:text-xl font-bold ${stat.color}`}>
                                            {stat.value}
                                        </div>
                                        <div
                                            className={`text-[11px] sm:text-xs text-center leading-tight ${isDark ? 'text-slate-400' : 'text-slate-500'
                                                }`}
                                        >
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* ── Right: Cards ── */}
                        <div className='lg:w-3/5 w-full grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5'>
                            {futerData.map((item, index) => (
                                <div
                                    key={index}
                                    className={`group relative rounded-2xl p-5 sm:p-6 min-h-[240px] flex flex-col border-t-4 border-x border-b transition-all duration-300
                        hover:-translate-y-1 hover:shadow-lg ${item.border}
                        ${isDark
                                            ? 'bg-[#0b1220] border-x-slate-800 border-b-slate-800'
                                            : 'bg-white border-x-slate-200 border-b-slate-200 shadow-sm'}`}
                                >
                                    {/* Icon badge */}
                                    <div className={`relative z-10 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mb-4 shrink-0
                        bg-gradient-to-br ${item.gradient} shadow-md`}>
                                        <span className="text-white [&>svg]:w-5 [&>svg]:h-5 sm:[&>svg]:w-6 sm:[&>svg]:h-6">
                                            {item.icon}
                                        </span>
                                    </div>

                                    {/* Title + accent underline */}
                                    <h3 className={`relative z-10 font-heading text-base sm:text-lg font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                                        {item.title}
                                    </h3>
                                    <div className={`relative z-10 h-[2px] w-8 rounded-full mb-3 bg-gradient-to-r ${item.gradient}`} />

                                    {/* Description */}
                                    <p className={`relative z-10 text-xs sm:text-sm leading-relaxed max-w-[75%] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {item.description}
                                    </p>

                                    {/* Illustration — centered, fully visible in lower half of card */}
                                    <div className="relative z-10 flex-1 flex items-end justify-center mt-3 -mb-1">
                                        {/* <img
                                            src={item.img}
                                            alt=""
                                            aria-hidden="true"
                                            className="pointer-events-none select-none w-32 sm:w-36 h-auto object-contain
                                opacity-95 group-hover:scale-105 transition-transform duration-300"
                                        /> */}
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
                {/* ══════════════════ End Future Section ══════════════════ */}
            </div>

            {/* ── Designed For Everyone Section (Expanded to max-w-7xl) ── */}
            <div className='relative bg-theme-bg text-theme-text py-12 lg:py-16 overflow-hidden transition-colors duration-300'>
                <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex justify-center'>
                    <div className={`w-full rounded-2xl p-1.5 transition-all duration-300
                        ${isDark
                            ? 'bg-slate-900 border border-slate-800 shadow-xl'
                            : 'bg-white border border-slate-200 shadow-lg'
                        }`}
                    >
                        <img
                            src={designedForImg}
                            alt="Designed for everyone in your school"
                            className='w-full h-auto rounded-xl block'
                        />
                    </div>
                </div>
            </div>

            {/* Details Strip */}
            <div className='bg-theme-bg text-theme-text transition-colors duration-300'>
                <DetailsStrip />
            </div>
        </>
    )
}

export default Details;