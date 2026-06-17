import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

const faqs = [
    {
        question: 'How long does the onboarding process take?',
        answer:
            'Our onboarding process typically takes 3–7 business days depending on your institution size. We provide dedicated support throughout setup, data migration, and staff training to ensure a smooth transition.',
    },
    {
        question: 'Can you migrate data from our existing system?',
        answer:
            'Yes! We support data migration from most popular school management systems. Our technical team will handle the entire migration process securely, ensuring zero data loss.',
    },
    {
        question: 'Do you support multi-branch schools?',
        answer:
            'Absolutely. SchoolSpine is built for multi-branch institutions. You can manage all branches from a single dashboard with centralized reporting, while each branch retains its own admin controls.',
    },
    {
        question: 'Is there an API for custom integrations?',
        answer:
            'Yes, we offer a RESTful API with comprehensive documentation. You can integrate SchoolSpine with your existing tools — accounting software, biometric devices, third-party apps, and more.',
    },
    {
        question: 'What kind of support do you offer?',
        answer:
            'We offer 24/7 email support, live chat during business hours, and dedicated account managers for enterprise plans. Our average response time is under 2 hours.',
    },
    {
        question: 'Can I change my plan later?',
        answer:
            'Yes, you can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle and there are no hidden fees for switching.',
    },
]

const FAQ = () => {
    const [openIndex, setOpenIndex] = useState(null)

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx)
    }

    return (
        <section className="w-full relative py-20 px-4 sm:px-6 overflow-hidden bg-[#05111D]">
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
                    <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight mb-4">
                        Frequently Asked <span className="bg-gradient-to-r from-teal-dark to-teal bg-clip-text text-transparent">Questions</span>
                    </h2>
                    <p className="text-slate-300 text-base sm:text-lg max-w-lg mx-auto">
                        Everything you need to know about SchoolSpine.
                    </p>
                </div>

                {/* Accordion List */}
                <div className="space-y-4">
                    {faqs.map((faq, idx) => {
                        const isOpen = openIndex === idx
                        return (
                            <div
                                key={idx}
                                className="rounded-2xl backdrop-blur-md transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_30px_rgba(0,201,177,0.12)] overflow-hidden"
                                style={{
                                    border: '1px solid transparent',
                                    background: 'linear-gradient(rgba(10, 24, 40, 0.4), rgba(10, 24, 40, 0.4)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)) border-box',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'linear-gradient(rgba(10, 24, 40, 0.5), rgba(10, 24, 40, 0.5)) padding-box, linear-gradient(135deg, rgba(0, 201, 177, 0.45), rgba(245, 166, 35, 0.25)) border-box'
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'linear-gradient(rgba(10, 24, 40, 0.4), rgba(10, 24, 40, 0.4)) padding-box, linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.02)) border-box'
                                }}
                            >
                                {/* Question Row */}
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between p-6 text-left gap-4 group cursor-pointer"
                                    aria-expanded={isOpen}
                                >
                                    <span className="text-white font-body font-bold text-base sm:text-lg group-hover:text-[#00C9B1] transition-colors duration-200">
                                        {faq.question}
                                    </span>
                                    <span className={`flex-shrink-0 text-slate-400 group-hover:text-[#00C9B1] transition-all duration-300 ${isOpen ? 'rotate-180 text-[#00C9B1]' : ''}`}>
                                        <ChevronDown size={20} />
                                    </span>
                                </button>

                                {/* Answer — animated open/close */}
                                <div
                                    className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                                        }`}
                                >
                                    <div className="p-6 pt-0 text-slate-300 font-body text-sm sm:text-base leading-relaxed pr-8 border-t border-white/[0.06] mt-1">
                                        {faq.answer}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}

export default FAQ