import React, { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'
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
        <section className="w-full bg-white px-4 sm:px-6 flex items-center">
            <div className="w-full max-w-3xl mx-auto py-16 lg:py-24">

                {/* Header */}
                <div className="text-center mb-12">
                    <p className="font-body text-teal-dark text-sm font-semibold uppercase tracking-widest mb-3">
                        Support
                    </p>
                    <h2 className="font-heading text-4xl sm:text-5xl font-bold text-text-primary leading-tight mb-4">
                        Frequently asked{' '}
                        <span className="text-grad-teal-gold">questions</span>
                    </h2>
                    <p className="text-text-secondary font-body text-base sm:text-lg max-w-xl mx-auto">
                        Everything you need to know about SchoolSpine. Can't find the answer?{' '}
                        <a href="#contact" className="text-teal-dark font-medium underline underline-offset-2 hover:text-teal transition-colors">
                            Talk to our team
                        </a>
                        .
                    </p>
                </div>

                {/* Accordion List — first 10 */}
                <div className="divide-y divide-gray-100 border-t border-gray-100">
                    {previewFaqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <div key={idx}>
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between py-5 text-left gap-4 group cursor-pointer"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-text-primary font-body font-medium text-base sm:text-[17px] group-hover:text-teal-dark transition-colors duration-200">
                                        {faq.question}
                                    </span>
                                    <span
                                        className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center transition-all duration-200 ${
                                            isOpen
                                                ? 'bg-teal-dark border-teal-dark text-white'
                                                : 'border-gray-200 text-text-muted group-hover:border-teal-dark group-hover:text-teal-dark'
                                        }`}
                                    >
                                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    </span>
                                </button>

                                {/* Animated answer */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                                        isOpen ? 'max-h-[400px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                                    }`}
                                >
                                    <p className="text-text-secondary font-body text-sm sm:text-base leading-relaxed pr-10">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        )
                    })}
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
            </div>
        </section>
    )
}

export default FAQ