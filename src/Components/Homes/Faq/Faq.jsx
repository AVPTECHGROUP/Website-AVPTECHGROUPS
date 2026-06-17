import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
    {
        question: 'What is School Spine?',
        answer:
            'School Spine is a comprehensive School Management System designed to streamline and automate daily school operations, including admissions, attendance, fees, examinations, communication, and administration.',
    },
    {
        question: 'Who can use School Spine?',
        answer:
            'School Spine is suitable for Play Schools, Pre-Primary Schools, Primary Schools, Secondary Schools, Senior Secondary Schools, and educational institutions of all sizes.',
    },
    {
        question: 'Does School Spine provide a mobile app for parents?',
        answer:
            'Yes, School Spine offers a dedicated parent mobile app where parents can track attendance, homework, fees, examination results, and school announcements.',
    },
    {
        question: 'Can School Spine manage student attendance?',
        answer:
            'Yes, School Spine allows schools to manage and monitor student attendance efficiently while generating detailed attendance reports.',
    },
    {
        question: 'Does School Spine support online fee collection?',
        answer:
            'Yes, parents can pay fees online, and schools can easily track payments, dues, and financial records through the platform.',
    },
    {
        question: 'Can I manage examinations and report cards using School Spine?',
        answer:
            'Yes, School Spine includes examination scheduling, marks entry, report card generation, and result publishing features.',
    },
    {
        question: 'Does the system support homework and assignment management?',
        answer:
            'Yes, teachers can assign homework, upload assignments, and share study materials directly with students and parents.',
    },
    {
        question: 'Can schools send notifications through School Spine?',
        answer:
            'Yes, schools can communicate with students and parents through SMS, Email, and Push Notifications.',
    },
    {
        question: 'Does School Spine include transport management?',
        answer:
            'Yes, School Spine provides transport management features, including route planning, vehicle management, and transport-related reports.',
    },
    {
        question: 'Is our data secure on School Spine?',
        answer:
            'Absolutely. School Spine uses advanced security measures and regular data backups to ensure the safety and privacy of school data.',
    },
    {
        question: 'Do you provide training and technical support?',
        answer:
            'Yes, we provide onboarding assistance, staff training, and ongoing technical support to ensure a smooth experience.',
    },
    {
        question: 'Can School Spine manage multiple school branches?',
        answer:
            'Yes, School Spine supports multi-branch management, allowing administrators to manage multiple campuses from a single dashboard.',
    },
    {
        question: 'Can teachers access and manage their own activities?',
        answer:
            'Yes, teachers can log in to manage attendance, assignments, grades, lesson plans, and other classroom activities.',
    },
    {
        question: 'How long does it take to implement School Spine?',
        answer:
            'Implementation time depends on the size and requirements of the institution, but most schools can get started within a few days.',
    },
    {
        question: 'How can I request a demo?',
        answer:
            'You can request a free demo by filling out the contact form on our website or by contacting our sales team directly.',
    },
    {
        question: 'How can parents access the School Spine Parent App?',
        answer:
            "Parents can log in using the credentials provided by the school and access their child's academic and school-related information anytime.",
    },
    {
        question: "Can parents monitor their child's attendance through the app?",
        answer:
            'Yes, parents can view daily, monthly, and overall attendance records directly from the app.',
    },
    {
        question: 'Will parents receive notifications about school updates?',
        answer:
            'Yes, parents receive instant notifications for announcements, homework, attendance, fee reminders, events, and examination updates.',
    },
    {
        question: 'Can parents pay school fees through the app?',
        answer:
            'Yes, parents can securely pay school fees online and download payment receipts directly from the app.',
    },
    {
        question: 'Can students view homework and assignments in the app?',
        answer:
            'Yes, students can access homework, assignments, study materials, and submission deadlines from their account.',
    },
    {
        question: 'Can parents communicate with teachers through the app?',
        answer:
            'Yes, the app provides communication features that allow parents to stay connected with teachers and school administration.',
    },
    {
        question: 'Can parents view the school calendar and upcoming events?',
        answer:
            'Yes, the app includes an academic calendar displaying holidays, examinations, events, and important dates.',
    },
    {
        question: 'Can students check their exam schedules in the app?',
        answer:
            'Yes, students can view examination timetables, subject schedules, and important exam-related announcements.',
    },
    {
        question: 'Is the app available on Android and iOS devices?',
        answer:
            'Yes, School Spine apps are available for both Android and iOS platforms.',
    },
    {
        question: 'Can parents manage multiple children from a single account?',
        answer:
            'Yes, parents with multiple children enrolled in the school can access all student profiles from a single parent account.',
    },
    {
        question: "Can parents check their child's daily activities?",
        answer:
            'Yes, parents can track attendance, homework, assignments, exam schedules, and important school updates from a single dashboard.',
    },
    {
        question: 'How do teachers log in to the app?',
        answer:
            'Teachers can log in using the credentials provided by the school administration.',
    },
    {
        question: 'Can teachers mark student attendance through the app?',
        answer:
            'Yes, teachers can easily mark and manage daily student attendance directly from the app.',
    },
    {
        question: 'Can teachers assign homework using the app?',
        answer:
            'Yes, teachers can create, upload, and assign homework to students in just a few clicks.',
    },
    {
        question: 'Can teachers view student attendance history?',
        answer:
            'Yes, teachers can access attendance records and monitor student attendance trends.',
    },
    {
        question: 'Can teachers view upcoming school events?',
        answer:
            'Yes, teachers can access the academic calendar, events, holidays, and examination schedules.',
    },
]

const PAGE_SIZE = 10

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null)
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx)
    }

    const handleViewAll = () => {
        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, faqs.length))
    }

    const handleViewLess = () => {
        setVisibleCount(PAGE_SIZE)
        setOpenIndex(null)
    }

    const visibleFaqs = faqs.slice(0, visibleCount)
    const hasMore = visibleCount < faqs.length
    const isExpanded = visibleCount > PAGE_SIZE
    const remaining = faqs.length - visibleCount

    return (
        <section className="w-full min-h-screen bg-white px-4 sm:px-6 flex items-center">
            <div className="w-full max-w-3xl mx-auto py-16 lg:py-20">

                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-3">
                        Frequently asked questions
                    </h1>
                    <p className="text-text-secondary text-base sm:text-lg">
                        Everything you need to know about SchoolSpine.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="divide-y divide-gray-200 border-t border-gray-200">
                    {visibleFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <div key={idx}>
                                {/* Question Row */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-text-primary font-body font-medium text-base sm:text-lg group-hover:text-teal-dark transition-colors duration-200">
                                        {faq.question}
                                    </span>
                                    <span className="flex-shrink-0 text-text-muted group-hover:text-teal-dark transition-colors duration-200">
                                        {isOpen ? (
                                            <ChevronUp size={20} />
                                        ) : (
                                            <ChevronDown size={20} />
                                        )}
                                    </span>
                                </button>

                                {/* Answer — animated open/close */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <p className="text-text-secondary font-body text-sm sm:text-base leading-relaxed pr-8">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* View All / View Less Controls */}
                {(hasMore || isExpanded) && (
                    <div className="flex flex-wrap items-center justify-center gap-3 mt-10">
                        {hasMore && (
                            <button
                                onClick={handleViewAll}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-teal-dark/30 text-teal-dark font-body font-medium text-sm sm:text-base hover:bg-teal-dark/5 transition-all duration-200 cursor-pointer"
                            >
                                View All
                                <span className="text-text-muted font-normal">({remaining} more)</span>
                                <ChevronDown size={18} />
                            </button>
                        )}

                        {isExpanded && (
                            <button
                                onClick={handleViewLess}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-gray-300 text-text-secondary font-body font-medium text-sm sm:text-base hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                            >
                                View Less
                                <ChevronUp size={18} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </section>
    )
}

export default FAQ