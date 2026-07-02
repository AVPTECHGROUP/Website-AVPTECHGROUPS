import React, { useState } from 'react'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export const faqs = [
    // General
    {
        category: 'general',
        question: 'What is School Spine?',
        answer:
            'School Spine is a comprehensive School Management System designed to streamline and automate daily school operations, including admissions, attendance, fees, examinations, communication, and administration.',
    },
    {
        category: 'general',
        question: 'Who can use School Spine?',
        answer:
            'School Spine is suitable for Play Schools, Pre-Primary Schools, Primary Schools, Secondary Schools, Senior Secondary Schools, and educational institutions of all sizes.',
    },
    {
        category: 'general',
        question: 'Does School Spine provide a mobile app for parents?',
        answer:
            'Yes, School Spine offers a dedicated parent mobile app where parents can track attendance, homework, fees, examination results, and school announcements.',
    },
    {
        category: 'general',
        question: 'Can School Spine manage student attendance?',
        answer:
            'Yes, School Spine allows schools to manage and monitor student attendance efficiently while generating detailed attendance reports.',
    },
    {
        category: 'general',
        question: 'Does School Spine support online fee collection?',
        answer:
            'Yes, parents can pay fees online, and schools can easily track payments, dues, and financial records through the platform.',
    },
    {
        category: 'general',
        question: 'Can I manage examinations and report cards using School Spine?',
        answer:
            'Yes, School Spine includes examination scheduling, marks entry, report card generation, and result publishing features.',
    },
    {
        category: 'general',
        question: 'Does the system support homework and assignment management?',
        answer:
            'Yes, teachers can assign homework, upload assignments, and share study materials directly with students and parents.',
    },
    {
        category: 'general',
        question: 'Can schools send notifications through School Spine?',
        answer:
            'Yes, schools can communicate with students and parents through SMS, Email, and Push Notifications.',
    },
    {
        category: 'general',
        question: 'Does School Spine include transport management?',
        answer:
            'Yes, School Spine provides transport management features, including route planning, vehicle management, and transport-related reports.',
    },
    {
        category: 'general',
        question: 'Is our data secure on School Spine?',
        answer:
            'Absolutely. School Spine uses advanced security measures and regular data backups to ensure the safety and privacy of school data.',
    },
    {
        category: 'general',
        question: 'Do you provide training and technical support?',
        answer:
            'Yes, we provide onboarding assistance, staff training, and ongoing technical support to ensure a smooth experience.',
    },
    {
        category: 'general',
        question: 'Can School Spine manage multiple school branches?',
        answer:
            'Yes, School Spine supports multi-branch management, allowing administrators to manage multiple campuses from a single dashboard.',
    },
    {
        category: 'general',
        question: 'Can teachers access and manage their own activities?',
        answer:
            'Yes, teachers can log in to manage attendance, assignments, grades, lesson plans, and other classroom activities.',
    },
    {
        category: 'general',
        question: 'How long does it take to implement School Spine?',
        answer:
            'Implementation time depends on the size and requirements of the institution, but most schools can get started within a few days.',
    },
    {
        category: 'general',
        question: 'How can I request a demo?',
        answer:
            'You can request a free demo by filling out the contact form on our website or by contacting our sales team directly.',
    },
    // Parents
    {
        category: 'parents',
        question: 'How can parents access the School Spine Parent App?',
        answer:
            "Parents can log in using the credentials provided by the school and access their child's academic and school-related information anytime.",
    },
    {
        category: 'parents',
        question: "Can parents monitor their child's attendance through the app?",
        answer:
            'Yes, parents can view daily, monthly, and overall attendance records directly from the app.',
    },
    {
        category: 'parents',
        question: 'Will parents receive notifications about school updates?',
        answer:
            'Yes, parents receive instant notifications for announcements, homework, attendance, fee reminders, events, and examination updates.',
    },
    {
        category: 'parents',
        question: 'Can parents pay school fees through the app?',
        answer:
            'Yes, parents can securely pay school fees online and download payment receipts directly from the app.',
    },
    {
        category: 'parents',
        question: 'Can students view homework and assignments in the app?',
        answer:
            'Yes, students can access homework, assignments, study materials, and submission deadlines from their account.',
    },
    {
        category: 'parents',
        question: 'Can parents communicate with teachers through the app?',
        answer:
            'Yes, the app provides communication features that allow parents to stay connected with teachers and school administration.',
    },
    {
        category: 'parents',
        question: 'Can parents view the school calendar and upcoming events?',
        answer:
            'Yes, the app includes an academic calendar displaying holidays, examinations, events, and important dates.',
    },
    {
        category: 'parents',
        question: 'Can students check their exam schedules in the app?',
        answer:
            'Yes, students can view examination timetables, subject schedules, and important exam-related announcements.',
    },
    {
        category: 'parents',
        question: 'Is the app available on Android and iOS devices?',
        answer:
            'Yes, School Spine apps are available for both Android and iOS platforms.',
    },
    {
        category: 'parents',
        question: 'Can parents manage multiple children from a single account?',
        answer:
            'Yes, parents with multiple children enrolled in the school can access all student profiles from a single parent account.',
    },
    {
        category: 'parents',
        question: "Can parents check their child's daily activities?",
        answer:
            'Yes, parents can track attendance, homework, assignments, exam schedules, and important school updates from a single dashboard.',
    },
    // Teachers
    {
        category: 'teachers',
        question: 'How do teachers log in to the app?',
        answer:
            'Teachers can log in using the credentials provided by the school administration.',
    },
    {
        category: 'teachers',
        question: 'Can teachers mark student attendance through the app?',
        answer:
            'Yes, teachers can easily mark and manage daily student attendance directly from the app.',
    },
    {
        category: 'teachers',
        question: 'Can teachers assign homework using the app?',
        answer:
            'Yes, teachers can create, upload, and assign homework to students in just a few clicks.',
    },
    {
        category: 'teachers',
        question: 'Can teachers view student attendance history?',
        answer:
            'Yes, teachers can access attendance records and monitor student attendance trends.',
    },
    {
        category: 'teachers',
        question: 'Can teachers view upcoming school events?',
        answer:
            'Yes, teachers can access the academic calendar, events, holidays, and examination schedules.',
    },
]


const PREVIEW_COUNT = 10
const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null)
    const navigate = useNavigate()

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx)
    }

    const previewFaqs = faqs.slice(0, PREVIEW_COUNT)
    const remaining = faqs.length - PREVIEW_COUNT
    return (
        <section className="w-full relative py-20 px-4 sm:px-6 overflow-hidden bg-theme-bg text-theme-text transition-colors duration-300">
            {/* Top Gradient Divider */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />
            {/* Bottom Gradient Divider */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />

            {/* Grid overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Glowing background blob */}
            <div className="pointer-events-none absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-[0.15] blur-3xl"
                style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />

            <div className="relative z-10 w-full max-w-3xl mx-auto py-8">

                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-theme-text leading-tight mb-4">
                        Frequently Asked <span className="bg-gradient-to-r from-teal-dark to-teal bg-clip-text text-transparent">Questions</span>
                    </h2>
                    <p className="text-theme-subtext text-base sm:text-lg max-w-lg mx-auto">
                        Everything you need to know about SchoolSpine.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {previewFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <div
                                key={idx}
                                className="rounded-2xl backdrop-blur-md transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,201,177,0.08)] border border-theme-border hover:border-teal/50 bg-theme-card overflow-hidden"
                            >
                                {/* Question Row */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between p-6 text-left gap-4 group cursor-pointer"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-theme-text font-body font-bold text-base sm:text-lg group-hover:text-[#00C9B1] transition-colors duration-200">
                                        {faq.question}
                                    </span>
                                    <span className={`flex-shrink-0 text-theme-subtext group-hover:text-[#00C9B1] transition-all duration-300 ${isOpen ? 'rotate-180 text-[#00C9B1]' : ''}`}>
                                        <ChevronDown size={20} />
                                    </span>
                                </button>

                                {/* Answer — animated open/close */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-6 pt-0 text-theme-subtext font-body text-sm sm:text-base leading-relaxed pr-8 border-t border-theme-border mt-1">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                </div>
            </div>
            {/* View More CTA */}
            <div className="mt-10 flex flex-col items-center gap-3">
                <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-2" />
                <button
                    onClick={() => navigate('/faqs')}
                    className="group inline-flex items-center gap-3 px-7 py-3.5 rounded-full bg-teal-dark text-white font-body font-semibold text-sm sm:text-base shadow-md hover:bg-teal transition-all duration-200 cursor-pointer"
                >
                    View All FAQs
                    <span className="text-white/60 font-normal text-sm">
                        +{remaining} more
                    </span>
                    <ArrowRight
                        size={17}
                        className="group-hover:translate-x-1 transition-transform duration-200"
                    />
                </button>
            </div>

        </section >
    )
}

export default FAQ