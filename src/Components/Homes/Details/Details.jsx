import React from 'react'
import StatCard from "../../Common/StatCard";
import SeeInAction from "./SeeInAction";
import DesignCard from './DesignCard';
import { Briefcase, Building2, Bus, CalendarCheck, ClipboardList, Dock, FileBarChartIcon, GraduationCap, Smartphone, Store, Users } from 'lucide-react';
import DetailsStrip from './DetailsStrip';
import { useNavigate } from 'react-router-dom';

const statsData = [
    {
        icon: <GraduationCap />, title: "Student Management", slug: "student-management",
        description: "Manage admissions, student records, academic history, attendance, and performance reports from one centralized dashboard."
    },

    {
        icon: <CalendarCheck />, title: "Geo Attendance", slug: "geo-attendance",
        description: "Smart attendance system with face recognition, biometric verification, GPS tracking, and secure check-in/check-out monitoring."
    },

    {
        icon: <Dock />, title: "Fees & Billing", slug: "fee-billing",
        description: "Automate fee collection, payment reminders, invoices, receipts, and financial reporting with ease."
    },

    {
        icon: <FileBarChartIcon />, title: "Exam Management", slug: "exam-management",
        description: "Create exams, manage schedules, enter marks, generate report cards, and publish results seamlessly."
    },

    {
        icon: <Bus />, title: "Transport Management", slug: "transport-management",
        description: "Track vehicles, manage routes, monitor student pickups, and streamline transport operations efficiently."
    },

    {
        icon: <Users />, title: "Staff Management", slug: "staff-management",
        description: "Handle staff attendance, payroll, leave requests, department records, and workforce management efficiently."
    },

    {
        icon: <Smartphone />, title: "Parent App", slug: "parent-app",
        description: "Keep parents updated with real-time notifications, attendance alerts, results, homework, and announcements."
    },

    {
        icon: <Store />, title: "Store Management", slug: "store-management",
        description: "Manage inventory, suppliers, purchases, stock movement, and store operations without manual hassle."
    },
];

const futerData = [
    { icon: <FileBarChartIcon />, title: "Reports & Analytics", description: "Generate detailed reports on academics, attendance, and finances with actionable insights." },
    { icon: <Users />, title: "Role-Based Access", description: "Secure access control for admins, teachers, students, and parents with custom permissions." },
    { icon: <Smartphone />, title: "Mobile Friendly", description: "Access the system anytime, anywhere with a fully responsive and optimized mobile experience." },
    { icon: <CalendarCheck />, title: "Timetable Management", description: "Create and manage class schedules efficiently with conflict-free timetable planning." },
];

const Designcards = [
    {
        icon: <Building2 size={26} />,
        title: "Admin",
        description: "Complete control over school operations",
        features: [
            "Full dashboard access",
            "Student management",
            "Staff management",
            "Fee & finance management",
            "Admission management",
            "Exam & result management",
            "Transport monitoring",
            "Reports & analytics",
            "User role & permissions",
            "System settings & configuration"
        ],
        accentColor: "teal"
    },
    {
        icon: <GraduationCap size={26} />,
        title: "Teacher",
        description: "Tools for effective classroom management",
        features: [
            "Mark attendance",
            "Enter grades & report cards",
            "Create homework & assignments",
            "View class timetable",
            "Upload study materials",
            "Conduct online assessments",
            "Track student performance",
            "Communicate with parents",
            "Manage classroom activities",
            "Generate academic reports"
        ],
        accentColor: "amber"
    },
    {
        icon: <Users size={26} />,
        title: "Parent",
        description: "Stay connected with your child's progress",
        features: [
            "Track attendance",
            "Pay fees online",
            "Direct messaging",
            "View homework",
            "Download report cards",
            "Receive school notices",
            "Monitor exam schedules",
            "Track academic performance",
            "View transport updates",
            "Apply leave requests"
        ],
        accentColor: "slate"
    },
    {
        icon: <Briefcase size={26} />,
        title: "Staff",
        description: "Manage daily staff operations efficiently",
        features: [
            "Check-in / Check-out tracking",
            "Leave management",
            "Payroll access",
            "Attendance history",
            "Download salary slips",
            "View work schedules",
            "Receive announcements",
            "Update personal profile",
            "Submit requests online",
            "Access important documents"
        ],
        accentColor: "amber"
    },
];

const Details = () => {
    const navigate = useNavigate();
    return (
        <>
            <div className="relative min-h-screen overflow-x-hidden font-body bg-theme-bg text-theme-text transition-colors duration-300">

                {/* ── Intro ── */}
                <div className='flex flex-col justify-center items-center gap-3 sm:gap-4 px-4 pt-8 sm:pt-10'>
                    <h1 className='font-heading text-2xl sm:text-4xl lg:text-5xl tracking-tight text-center text-theme-text'>
                        Everything Your School Needs
                    </h1>
                    <p className='text-sm sm:text-base lg:text-lg text-theme-subtext max-w-xs sm:max-w-md lg:max-w-lg text-center'>
                        A complete suite of tools designed to streamline every aspect of school administration.
                    </p>
                </div>

                {/* ── Stat Cards ── */}
                <div className="px-4 sm:px-8 lg:px-12 py-6 sm:py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6 mt-3 sm:mt-5">
                    {statsData.map((item, index) => (
                        <div
                            key={index}
                            onClick={() => navigate(`/features/${item.slug}`)}
                            onKeyDown={(e) => e.key === 'Enter' && navigate(`/features/${item.slug}`)}
                            role="button"
                            tabIndex={0}
                            className="cursor-pointer"
                        >
                            <StatCard icon={item.icon} title={item.title} description={item.description} showLearnMore={true} />
                        </div>
                    ))}
                </div>

                {/* ── GSAP Device Showcase ── */}
                <SeeInAction />

                {/* ── Future Section ── */}
                <div className='bg-theme-card border-y border-theme-border px-4 sm:px-8 lg:px-20 py-8 lg:py-20 transition-colors duration-300'>
                    <div className='flex flex-col lg:flex-row justify-between items-center gap-8 lg:gap-18'>

                        {/* Heading */}
                        <div className='lg:w-2/5 shrink-0'>
                            <h1 className='font-heading text-3xl sm:text-4xl lg:text-[47px] text-center lg:text-left leading-tight text-theme-text'>
                                Built for the{" "}
                                <span className='underline decoration-teal-300 decoration-[6px] underline-offset-4'>
                                    future
                                </span>{" "}
                                of school management
                            </h1>
                        </div>

                        {/* Cards */}
                        <div className='lg:w-3/6 w-full grid grid-cols-1 sm:grid-cols-2 gap-3 lg:gap-4'>
                            {futerData.map((item, index) => (
                                <StatCard
                                    key={index}
                                    icon={item.icon}
                                    title={item.title}
                                    description={item.description}
                                    showLearnMore={false}
                                />
                            ))}
                        </div>

                    </div>
                </div>
            </div>

            {/* ── Designed For Everyone ── */}
            <div className='bg-theme-bg text-theme-text px-4 sm:px-8 lg:px-10 py-10 lg:pt-20 flex flex-col gap-6 sm:gap-8 transition-colors duration-300'>
                <h1 className='font-heading text-2xl sm:text-3xl lg:text-5xl font-bold text-center text-theme-text'>
                    Designed for everyone in your school
                </h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
                    {Designcards.map((card, i) => (
                        <DesignCard key={i} {...card} />
                    ))}
                </div>
            </div>

            {/* Details Strip */}
            <div className='bg-theme-bg text-theme-text transition-colors duration-300'>
                <DetailsStrip />
            </div>
        </>
    )
}

export default Details