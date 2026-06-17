import React, { useState } from 'react'
import Pricing_List from './Pricing_List'

const Pricing = () => {
    const [activeTab, setActiveTab] = useState('Monthly')

    return (
        <div className="w-full bg-theme-bg text-theme-text relative py-16 sm:py-24 overflow-hidden transition-colors duration-300">
            {/* Top Gradient Divider */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />
            {/* Bottom Gradient Divider */}
            <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00C9B1]/30 via-[#F5A623]/20 to-transparent z-10" />

            {/* Grid background overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.5]" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

            {/* Subtle decorative blobs */}
            <div className="pointer-events-none absolute -top-20 -left-20 w-96 h-96 rounded-full opacity-[0.2] blur-3xl"
                style={{ background: 'radial-gradient(circle, #00C9B1, transparent 70%)' }} />
            <div className="pointer-events-none absolute -bottom-20 -right-20 w-96 h-96 rounded-full opacity-[0.2] blur-3xl"
                style={{ background: 'radial-gradient(circle, #F5A623, transparent 70%)' }} />

            {/* Heading */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-4 px-4 mb-14">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold tracking-tight text-theme-text text-center">
                    Affordable Pricing. <span className="bg-gradient-to-r from-teal-dark to-teal bg-clip-text text-transparent">Powerful Features.</span>
                </h1>
                <p className="text-base sm:text-lg font-body font-normal text-theme-subtext text-center max-w-xl">
                    Choose the plan that fits your school. No hidden fees, ever.
                </p>

                {/* Toggle */}
                <div className="w-fit p-1 bg-theme-card border border-theme-border backdrop-blur-md rounded-full flex gap-1 items-center shadow-[0_12px_40px_rgba(0,0,0,0.1)] mt-4">
                    <button
                        onClick={() => setActiveTab('Monthly')}
                        className={`px-6 sm:px-8 py-2 rounded-full cursor-pointer text-sm sm:text-base font-body font-semibold transition-all duration-300 ${activeTab === 'Monthly'
                                ? 'bg-gradient-to-r from-[#00C9B1] to-[#00E5D4] text-[#05111D] shadow-[0_4px_20px_rgba(0,201,177,0.3)]'
                                : 'text-theme-subtext hover:text-theme-text'
                            }`}
                    >
                        Monthly
                    </button>

                    <button
                        onClick={() => setActiveTab('Yearly')}
                        className={`flex items-center gap-2 px-6 sm:px-8 py-2 rounded-full cursor-pointer text-sm sm:text-base font-body font-semibold transition-all duration-300 ${activeTab === 'Yearly'
                                ? 'bg-gradient-to-r from-[#00C9B1] to-[#00E5D4] text-[#05111D] shadow-[0_4px_20px_rgba(0,201,177,0.3)]'
                                : 'text-theme-subtext hover:text-theme-text'
                            }`}
                    >
                        Yearly
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full whitespace-nowrap transition-all duration-300 ${activeTab === 'Yearly'
                                ? 'bg-theme-bg text-[#00C9B1]'
                                : 'bg-[#F5A623] text-[#05111D]'
                            }`}>
                            Save 20%
                        </span>
                    </button>
                </div>
            </div>

            {/* Cards */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <Pricing_List activeTab={activeTab} />
            </div>
        </div>
    )
}

export default Pricing