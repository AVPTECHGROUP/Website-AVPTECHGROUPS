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
                    {faqs.map((faq, idx) => {
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
            </div>
        </section>
    )
}

export default FAQ