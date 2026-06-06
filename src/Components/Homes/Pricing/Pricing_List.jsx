import { IndianRupee } from 'lucide-react'
import React from 'react'

const monthlyPlans = [
    {
        name: "Basic",
        tagline: "Perfect for small schools",
        price: "4,999",
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
        price: "9,999",
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
        price: "19,999",
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
            className="relative flex flex-col rounded-2xl bg-bg-dark p-7 w-full h-full"
            style={{
                border: '2px solid #00C9B1',
                boxShadow: '0 8px 40px rgba(0,201,177,0.20)',
            }}
        >
            {/* Most Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <span
                    className="text-bg-dark text-xs font-body font-semibold px-5 py-1.5 rounded-full whitespace-nowrap"
                    style={{ background: '#00C9B1' }}
                >
                    Most Popular
                </span>
            </div>

            {/* Header */}
            <div className="mb-5 mt-2">
                <h3 className="text-2xl font-heading font-bold text-white mb-1">{name}</h3>
                <p className="text-sm font-body" style={{ color: '#8A9BB0' }}>{tagline}</p>
            </div>

            {/* Price — inline, no wrapping */}
            <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-heading font-bold flex items-center justify-center text-white leading-none whitespace-nowrap">
                    <IndianRupee size={20} />{price}
                </span>
                <span className="text-sm font-body leading-snug text-nowrap" style={{ color: '#8A9BB0', maxWidth: '80px' }}>
                    {period}
                </span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-sm font-body text-gray-300">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                className="w-full py-3.5 rounded-full font-body font-semibold text-sm text-bg-dark cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(90deg, #00C9B1 0%, #F5A623 100%)' }}
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
            className="relative flex flex-col rounded-2xl bg-white p-3 pr-12 w-full h-full"
            style={{
                border: '1px solid #e5e7eb',
                boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                transition: 'all 0.3s ease',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,201,177,0.15)'
                e.currentTarget.style.borderColor = 'rgba(0,201,177,0.4)'
                e.currentTarget.style.transform = 'translateY(-4px)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.06)'
                e.currentTarget.style.borderColor = '#e5e7eb'
                e.currentTarget.style.transform = 'translateY(0)'
            }}
        >
            {/* Header */}
            <div className="mb-5">
                <h3 className="text-2xl font-heading font-bold text-text-primary mb-1">{name}</h3>
                <p className="text-sm font-body text-text-secondary">{tagline}</p>
            </div>

            {/* Price — inline, no wrapping */}
            <div className="flex items-baseline gap-3 mb-6">
                <span className="text-4xl font-heading font-bold text-text-primary flex items-center justify-center leading-none whitespace-nowrap">
                    <IndianRupee size={20}
                     />{price}
                </span>
                <span className="text-sm font-body text-text-muted leading-snug text-nowrap" style={{ maxWidth: '80px' }}>
                    {period}
                </span>
            </div>

            {/* Features */}
            <ul className="flex flex-col gap-3 mb-8 flex-1">
                {features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                        <CheckIcon />
                        <span className="text-sm font-body text-text-secondary">{feature}</span>
                    </li>
                ))}
            </ul>

            {/* CTA */}
            <button
                className="w-full py-3.5 rounded-full font-body font-semibold text-sm text-white cursor-pointer transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: '#0D1B2A', transition: 'all 0.3s ease' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#1A8A8A')}
                onMouseLeave={e => (e.currentTarget.style.background = '#0D1B2A')}
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