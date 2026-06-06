import React, { useState } from 'react'
import Pricing_List from './Pricing_List'

const Pricing = () => {
    const [activeTab, setActiveTab] = useState('Monthly')

    return (
        <div className="w-full bg-bg-alt relative py-16 sm:py-20 overflow-hidden">

            {/* Subtle decorative blobs */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-20 -right-20 w-72 h-72 rounded-full opacity-10"
                style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />

            {/* Heading */}
            <div className="flex flex-col items-center justify-center gap-5 px-4 mb-12">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-heading font-medium tracking-wider text-text-primary text-center">
                    Affordable Pricing. Powerful Features.
                </h1>
                <p className="text-base sm:text-lg font-body font-light text-text-secondary text-center max-w-xl">
                    Choose the plan that fits your school. No hidden fees, ever.
                </p>

                {/* Toggle */}
                <div className="w-fit py-1 px-2 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex gap-2 sm:gap-3 items-center">
                    <button
                        onClick={() => setActiveTab('Monthly')}
                        className={`px-6 sm:px-10 py-2 rounded-full cursor-pointer text-sm sm:text-base font-body font-medium transition-all duration-300 ${activeTab === 'Monthly'
                                ? 'bg-bg-dark text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Monthly
                    </button>

                    <button
                        onClick={() => setActiveTab('Yearly')}
                        className={`flex items-center gap-2 px-4 sm:px-5 py-2 rounded-full cursor-pointer text-sm sm:text-base font-body font-medium transition-all duration-300 ${activeTab === 'Yearly'
                                ? 'bg-bg-dark text-white shadow-md'
                                : 'text-gray-600 hover:text-gray-800'
                            }`}
                    >
                        Yearly
                        <span className="px-2 py-0.5 text-[11px] font-semibold text-gray-900 bg-gold rounded-full whitespace-nowrap">
                            Save 20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Pricing_List activeTab={activeTab} />
            </div>
        </div>
    )
}

export default Pricing