import { CreditCard, FileText, ClipboardCheck, ShoppingBag, Bus, BookOpen } from 'lucide-react'
import DashboardMockup from '../Mockups/DashboardMockup'
import PhoneMockup from '../Mockups/PhoneMockup'

const LEFT_CARDS = [
    {
        id: 'attendance',
        icon: ClipboardCheck,
        label: 'Smart Attendance',
        color: 'teal',
        top: '3%',
        children: ['Face Recognition', 'Geo-Tracking'],
    },
    {
        id: 'store',
        icon: ShoppingBag,
        label: 'Store Management',
        color: 'coral',
        top: '36%',
        children: ['Inventory', 'Books & Uniform'],
    },
    {
        id: 'exams',
        icon: FileText,
        label: 'Exam Scheduler',
        color: 'purple',
        top: '68%',
        children: ['Timetable Gen', 'Result Sheet'],
    },
]

const RIGHT_CARDS = [
    {
        id: 'fees',
        icon: CreditCard,
        label: 'Fee Collection',
        color: 'gold',
        top: '3%',
        children: ['Online Payment', 'Fee Reminders'],
    },
    {
        id: 'transport',
        icon: Bus,
        label: 'Transport Mgmt',
        color: 'blue',
        top: '36%',
        children: ['Live Tracking', 'Route Planner'],
    },
    {
        id: 'academic',
        icon: BookOpen,
        label: 'Academic Mgmt',
        color: 'green',
        top: '68%',
        children: ['Curriculum', 'Homework Track'],
    },
]

const colorMap = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-500', childBorder: 'border-teal-100' },
    gold: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500', childBorder: 'border-amber-100' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', icon: 'text-purple-500', childBorder: 'border-purple-100' },
    coral: { bg: 'bg-rose-50', border: 'border-rose-200', icon: 'text-rose-500', childBorder: 'border-rose-100' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500', childBorder: 'border-blue-100' },
    green: { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', childBorder: 'border-emerald-100' },
}

function TreeCard({ card, animDelay = 0 }) {
    const Icon = card.icon
    const c = colorMap[card.color]
    return (
        <div
            className="flex flex-col items-center w-full"
            style={{ animation: `floatUpDown 5s ${animDelay}s ease-in-out infinite` }}
        >
            <div className="flex items-center gap-2 px-3 py-2.5 w-full bg-theme-card border border-theme-border rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.07)]">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${c.bg} border ${c.border}`}>
                    <Icon size={14} className={c.icon} />
                </div>
                <span className="text-[12px] font-semibold text-theme-text font-heading leading-tight">{card.label}</span>
            </div>
            <div className="w-px h-5 bg-theme-border" />
            <div className="relative w-full flex flex-col items-center">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px bg-theme-border" />
                <div className="flex justify-center gap-6 w-full mt-0.5">
                    {card.children.map(child => (
                        <div key={child} className="flex flex-col items-center">
                            <div className="w-px h-4 bg-theme-border" />
                            <div className="px-3 py-1.5 text-center text-[10px] font-medium text-theme-subtext bg-theme-card border border-theme-border rounded-xl shadow-[0_1px_6px_rgba(0,0,0,0.05)] whitespace-nowrap">
                                {child}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
export default function Mockups() {
    return (
        <div id="mockups-section" className="bg-theme-bg -mt-8 text-theme-text transition-colors duration-300 scroll-mt-10">
            <div className="relative z-10 px-4 sm:px-6 w-full max-w-7xl mx-auto">
                <div className="absolute pointer-events-none z-0" style={{
                    top: '5%', bottom: '5%', left: '18%', right: '18%',
                    background: 'radial-gradient(ellipse, rgba(0,201,177,0.07) 0%, rgba(245,166,35,0.03) 50%, transparent 80%)',
                    filter: 'blur(60px)',
                }} />

                <div className="relative flex items-start w-full">
                    {/* Left cards */}
                    <div className="hidden lg:block shrink-0 relative" style={{ width: '160px', minHeight: '520px' }}>
                        {LEFT_CARDS.map((card, i) => (
                            <div key={card.id} className="absolute w-full pr-2" style={{ top: card.top }}>
                                <TreeCard card={card} animDelay={i * 0.45} />
                            </div>
                        ))}
                    </div>

                    {/* Center: Laptop + Phone */}
                    <div className="relative flex-1 z-20 min-w-0 px-0 sm:px-2 md:px-4 lg:mt-12">
                        <div className="relative w-full">
                            <div className="absolute z-30" style={{ width: 'clamp(75px, 10vw, 130px)', top: 'clamp(-50px, -11vw, -50px)', right: 'clamp(4px, 1vw, 12px)', animation: 'floatUpDown 5s ease-in-out infinite', filter: 'drop-shadow(0 16px 32px rgba(0,0,0,0.18))' }}>
                                <PhoneMockup />
                            </div>
                            <div className="w-full overflow-hidden">
                                <DashboardMockup />
                            </div>
                        </div>
                    </div>

                    {/* Right cards */}
                    <div className="hidden lg:block shrink-0 relative" style={{ width: '160px', minHeight: '520px' }}>
                        {RIGHT_CARDS.map((card, i) => (
                            <div key={card.id} className="absolute w-full pl-2" style={{ top: card.top }}>
                                <TreeCard card={card} animDelay={i * 0.45 + 0.25} />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Mobile/Tablet view */}
                <div className="lg:hidden mt-10 grid grid-cols-2 gap-4 px-1">
                    {[...LEFT_CARDS, ...RIGHT_CARDS].map((card, i) => (
                        <TreeCard key={card.id} card={card} animDelay={i * 0.15} />
                    ))}
                </div>
            </div>
        </div>
    )
}