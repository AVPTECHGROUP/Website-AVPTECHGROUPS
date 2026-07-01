import { IndianRupee } from 'lucide-react'
import React from 'react'

const monthlyPlans = [
    {
        name: "Basic",
        tagline: "Perfect for small schools",
        price: "3,999",
        period: "per school/month",
        features: [
            "Up to 500 students",
            "Student management",
            "Attendance tracking",
            "Basic reports",
            "Email support",
        ],
        isPopular: false,
        isDark: false,
    },
    {
        name: "Pro",
        tagline: "For growing institutions",
        price: "8,999",
        period: "per school/month",
        features: [
            "Up to 1,200 students",
            "Everything in Basic",
            "Fee management",
            "Exam module",
            "Parent app",
            "Priority support",
            "API access",
        ],
        isPopular: true,
        isDark: true,
    },
    {
        name: "Enterprise",
        tagline: "For large school groups",
        price: "Custom Quote",
        period: "per school/month",
        features: [
            "1,200 + students",
            "Everything in Pro",
            "Multi-branch support",
            "Custom integrations",
            "Dedicated account manager",
            "24/7 support",
            "On-premise option",
        ],
        isPopular: false,
        isDark: false,
    },
]

const yearlyPlans = [
    {
        name: "Basic",
        tagline: "Perfect for small schools",
        price: "3,999",
        period: "per school/month",
        features: [
            "Up to 500 students",
            "Student management",
            "Attendance tracking",
            "Basic reports",
            "Email support",
        ],
        isPopular: false,
        isDark: false,
    },
    {
        name: "Pro",
        tagline: "For growing institutions",
        price: "7,999",
        period: "per school/month",
        features: [
            "Up to 2,000 students",
            "Everything in Basic",
            "Fee management",
            "Exam module",
            "Parent app",
            "Priority support",
            "API access",
        ],
        isPopular: true,
        isDark: true,
    },
    {
        name: "Enterprise",
        tagline: "For large school groups",
        price: "15,999",
        period: "per school/month",
        features: [
            "Unlimited students",
            "Everything in Pro",
            "Multi-branch support",
            "Custom integrations",
            "Dedicated account manager",
            "24/7 support",
            "On-premise option",
        ],
        isPopular: false,
        isDark: false,
    },
]

const CheckIcon = () => (
    <svg
        className="w-4 h-4 flex-shrink-0"
        style={{ color: '#00C9B1' }}
        viewBox="0 0 20 20"
        fill="currentColor"
    >
        <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
        />
    </svg>
)

const DarkCard = ({ plan }) => {
    const { name, tagline, price, period, features } = plan
    return (
        <div
            className="relative flex flex-col rounded-2xl p-8 w-full h-full text-theme-text animate-pulse-border"
            style={{
                background: 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, #00C9B1, #F5A623) border-box',
                border: '2px solid transparent',
                boxShadow: '0 12px 45px rgba(0, 201, 177, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-8px)'
                e.currentTarget.style.boxShadow = '0 24px 60px rgba(0, 201, 177, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, #00E5D4, #FFD166) border-box'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 12px 45px rgba(0, 201, 177, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, #00C9B1, #F5A623) border-box'
            }}
        >
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 animate-heartbeat">
                <span
                    className="text-[#05111D] text-xs font-body font-extrabold px-5 py-1.5 rounded-full whitespace-nowrap shadow-[0_4px_20px_rgba(0,201,177,0.4)] uppercase tracking-wider bg-gradient-to-r from-[#00C9B1] to-[#00E5D4]"
                >
                    Most Popular
                </span>
            </div>

            {/* Header */}
            <div className="mb-6 mt-2">
                <h3 className="text-2xl font-heading font-extrabold text-theme-text mb-1.5">{name}</h3>
                <p className="text-sm font-body text-theme-subtext">{tagline}</p>
            </div>

            {/* Price — inline, no wrapping */}
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-4xl font-heading font-extrabold text-theme-text flex items-center justify-center leading-none whitespace-nowrap">
                    <IndianRupee size={22} className="text-[#00C9B1] mr-0.5 animate-pulse" />{price}
                </span>
                <span className="text-xs font-body leading-snug whitespace-nowrap text-theme-subtext">
                    / {period.includes('month') ? 'month' : 'year'}
                </span>
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-theme-border mb-6" />

            {/* Features */}
            <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-sm font-body text-theme-subtext font-medium">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                className="w-full py-4 rounded-xl font-body font-bold text-sm text-[#05111D] cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-[0_4px_20px_rgba(0,201,177,0.3)] hover:shadow-[0_8px_30px_rgba(0,201,177,0.5)] animate-heartbeat bg-gradient-to-r from-[#00C9B1] to-[#F5A623]"
            >
                Get Started
            </button>
        </div>
    )
}

const LightCard = ({ plan }) => {
    const { name, tagline, price, period, features } = plan
    return (
        <div
            className="relative flex flex-col rounded-2xl p-8 w-full h-full text-theme-text transition-all duration-300"
            style={{
                background: 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, var(--theme-card-border-light), var(--theme-card-border-light)) border-box',
                border: '1px solid transparent',
                boxShadow: '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
                transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 20px 45px rgba(0, 201, 177, 0.18)'
                e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, rgba(0, 201, 177, 0.5), rgba(245, 166, 35, 0.3)) border-box'
                e.currentTarget.style.transform = 'translateY(-6px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
                e.currentTarget.style.background = 'linear-gradient(var(--theme-card-grad-start), var(--theme-card-grad-end)) padding-box, linear-gradient(135deg, var(--theme-card-border-light), var(--theme-card-border-light)) border-box'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-2xl font-heading font-extrabold text-theme-text mb-1.5">{name}</h3>
                <p className="text-sm font-body text-theme-subtext">{tagline}</p>
            </div>

            {/* Price — inline, no wrapping */}
            <div className="flex items-baseline gap-2 mb-6">
                <span className="text-2xl font-heading font-extrabold text-theme-text flex items-center justify-center leading-none whitespace-nowrap">
                    <IndianRupee size={22} className="text-[#00C9B1] mr-0.5" />{price}
                </span>
                {price !== "Custom Quote" && (
                    <span className="text-xs font-body text-theme-subtext leading-snug whitespace-nowrap">
                        / {period.includes('month') ? 'month' : 'year'}
                    </span>
                )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-theme-border mb-6" />

            {/* Features */}
            <ul className="flex flex-col gap-3.5 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-sm font-body text-theme-subtext">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                className="w-full py-4 rounded-xl font-body font-bold text-sm text-theme-text cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-lg bg-theme-card border border-theme-border hover:bg-theme-border/20"
            >
                Get Started
            </button>
        </div>
    )
}

const Pricing_List = ({ activeTab }) => {
    const plans = activeTab === 'Monthly' ? monthlyPlans : yearlyPlans

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 w-full items-stretch pt-6">
            {plans.map((plan, index) => (
                <div
                    key={`${activeTab}-${index}`}
                    /* Pro card stretches slightly taller via negative margin on md+ */
                    className={`flex ${plan.isDark ? 'md:-my-4' : ''}`}
                >
                    {plan.isDark ? <DarkCard plan={plan} /> : <LightCard plan={plan} />}
                </div>
            ))}
        </div>
    )
}

export default Pricing_List