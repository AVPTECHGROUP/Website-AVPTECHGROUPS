import React, { useState, useMemo, useContext } from 'react'
import { ChevronDown, ChevronUp, Search, ArrowLeft, X, HelpCircle, Users, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../../ContextAPI/UserContext'
import { faqs } from './Faq' 

/* ─── Category config ─── */
const CATEGORIES = [
    {
        id: 'all',
        label: 'All Questions',
        icon: HelpCircle,
        count: null,
    },
    {
        id: 'general',
        label: 'General',
        icon: BookOpen,
        count: null,
    },
    {
        id: 'parents',
        label: 'For Parents',
        icon: Users,
        count: null,
    },
    {
        id: 'teachers',
        label: 'For Teachers',
        icon: Users,
        count: null,
    },
]

/* Count per category */
CATEGORIES.forEach((cat) => {
    cat.count =
        cat.id === 'all'
            ? faqs.length
            : faqs.filter((f) => f.category === cat.id).length
})

const FaqListing = () => {
    const navigate = useNavigate()
    const { theme } = useContext(UserContext)
    const isDark = theme === 'dark'

    const [openIndex, setOpenIndex] = useState(null)
    const [activeCategory, setActiveCategory] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')

    /* Filtered list */
    const filteredFaqs = useMemo(() => {
        return faqs.filter((faq) => {
            const matchCat = activeCategory === 'all' || faq.category === activeCategory
            const matchSearch =
                searchQuery.trim() === '' ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
            return matchCat && matchSearch
        })
    }, [activeCategory, searchQuery])

    const toggle = (idx) => {
        setOpenIndex(openIndex === idx ? null : idx)
    }

    const clearSearch = () => {
        setSearchQuery('')
    }

    /* Category display labels */
    const categoryLabel = {
        general: 'General',
        parents: 'Parents & Students',
        teachers: 'Teachers',
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-[#030712] text-slate-100' : 'bg-slate-50 text-slate-900'}`}>

            {/* ── Hero ── */}
            <div className={`relative overflow-hidden border-b transition-colors duration-300 ${isDark ? 'bg-slate-950/60 border-slate-900' : 'bg-[#0f172a] border-slate-800'}`}>
                {/* Decorative blobs */}
                <div
                    className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #00C9B1 0%, transparent 70%)' }}
                />
                <div
                    className="absolute -bottom-24 -right-24 w-[400px] h-[400px] rounded-full opacity-10 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #F5A623 0%, transparent 70%)' }}
                />
                <div
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[2px] opacity-10 pointer-events-none"
                    style={{ background: 'linear-gradient(90deg, transparent, #00C9B1, #F5A623, transparent)' }}
                />

                <div className="relative max-w-4xl mx-auto px-4 sm:px-6 pt-14 pb-16">
                    <div className="text-center">
                        <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4">
                            Frequently Asked{' '}
                            <span className="text-grad-teal-gold bg-gradient-to-r from-[#00C9B1] to-[#F5A623] bg-clip-text text-transparent">Questions</span>
                        </h1>
                        <p className="font-body text-slate-400 text-base sm:text-lg max-w-xl mx-auto">
                            Browse {faqs.length} answers across general platform, parent app, and teacher portal topics.
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="relative mt-10 max-w-xl mx-auto">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search questions…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className={`w-full backdrop-blur border text-white font-body text-sm sm:text-base rounded-xl pl-11 pr-11 py-3.5 outline-none transition-all duration-200 ${
                                isDark 
                                    ? 'bg-white/[0.04] border-white/10 placeholder-slate-500 focus:border-[#00C9B1]/50 focus:bg-white/[0.07]' 
                                    : 'bg-white/10 border-white/10 placeholder-slate-400 focus:border-[#00C9B1]/60 focus:bg-white/15'
                            }`}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-24">

                {/* Category tabs */}
                <div className={`flex gap-2 flex-wrap py-6 sticky top-0 z-10 border-b backdrop-blur-md bg-opacity-90 ${
                    isDark ? 'bg-[#030712] border-slate-900' : 'bg-slate-50 border-slate-200/60'
                }`}>
                    {CATEGORIES.map((cat) => {
                        const Icon = cat.icon
                        const isActive = activeCategory === cat.id
                        return (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id)
                                    setOpenIndex(null)
                                }}
                                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-body font-medium text-sm transition-all duration-200 cursor-pointer ${
                                    isActive
                                        ? 'bg-[#1A8A8A] text-white shadow-sm'
                                        : isDark 
                                            ? 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200' 
                                            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                <Icon size={13} />
                                {cat.label}
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : isDark ? 'bg-slate-800 text-slate-500' : 'bg-slate-100 text-slate-400'
                                    }`}
                                >
                                    {cat.count}
                                </span>
                            </button>
                        )
                    })}
                </div>

                {/* Results count + clear */}
                {(searchQuery || activeCategory !== 'all') && (
                    <div className="flex items-center justify-between py-4">
                        <p className={`font-body text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            {filteredFaqs.length === 0
                                ? 'No results found'
                                : `${filteredFaqs.length} question${filteredFaqs.length !== 1 ? 's' : ''} found`}
                            {searchQuery && (
                                <span className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                                    {' '}for "<em>{searchQuery}</em>"
                                </span>
                            )}
                        </p>
                        {(searchQuery || activeCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveCategory('all')
                                    setOpenIndex(null)
                                }}
                                className="text-[#00C9B1] font-body text-sm font-medium hover:underline cursor-pointer transition-colors"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                )}

                {/* FAQ Accordion */}
                {filteredFaqs.length > 0 ? (
                    <div className="mt-2">
                        {/* Group by category when "All" is active and no search */}
                        {activeCategory === 'all' && !searchQuery ? (
                            ['general', 'parents', 'teachers'].map((catId) => {
                                const grouped = filteredFaqs.filter((f) => f.category === catId)
                                if (!grouped.length) return null

                                return (
                                    <div key={catId} className="mb-10">
                                        {/* Section label */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className={`h-px flex-1 bg-gradient-to-r to-transparent ${isDark ? 'from-slate-800' : 'from-slate-200'}`} />
                                            <span
                                                className="font-body text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full"
                                                style={{
                                                    color: catId === 'teachers' ? '#C8860A' : '#1A8A8A',
                                                    background:
                                                        catId === 'teachers'
                                                            ? 'rgba(245,166,35,0.08)'
                                                            : 'rgba(26,138,138,0.08)',
                                                }}
                                            >
                                                {categoryLabel[catId]}
                                            </span>
                                            <div className={`h-px flex-1 bg-gradient-to-l to-transparent ${isDark ? 'from-slate-800' : 'from-slate-200'}`} />
                                        </div>

                                        <div className={`divide-y border-t border-b ${isDark ? 'divide-slate-900 border-slate-900' : 'divide-slate-200/60 border-slate-200/60'}`}>
                                            {grouped.map((faq) => {
                                                const realIdx = faqs.indexOf(faq)
                                                const isOpen = openIndex === realIdx
                                                return (
                                                    <AccordionItem
                                                        key={realIdx}
                                                        faq={faq}
                                                        isOpen={isOpen}
                                                        isDark={isDark}
                                                        onToggle={() => toggle(realIdx)}
                                                        searchQuery={searchQuery}
                                                    />
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })
                        ) : (
                            <div className={`divide-y border-t border-b ${isDark ? 'divide-slate-900 border-slate-900' : 'divide-slate-200/60 border-slate-200/60'}`}>
                                {filteredFaqs.map((faq) => {
                                    const realIdx = faqs.indexOf(faq)
                                    const isOpen = openIndex === realIdx
                                    return (
                                        <AccordionItem
                                            key={realIdx}
                                            faq={faq}
                                            isOpen={isOpen}
                                            isDark={isDark}
                                            onToggle={() => toggle(realIdx)}
                                            searchQuery={searchQuery}
                                        />
                                    )
                                })}
                            </div>
                        )}
                    </div>
                ) : (
                    /* Empty state */
                    <div className="text-center py-20">
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-5"
                            style={{ background: 'rgba(26,138,138,0.08)' }}
                        >
                            <Search size={28} className="text-[#1A8A8A] opacity-65" />
                        </div>
                        <h3 className={`font-heading text-xl font-bold mb-2 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                            No results found
                        </h3>
                        <p className={`font-body text-sm max-w-xs mx-auto ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Try a different keyword or{' '}
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveCategory('all')
                                }}
                                className="text-[#00C9B1] font-medium hover:underline cursor-pointer"
                            >
                                browse all questions
                            </button>
                            .
                        </p>
                    </div>
                )}

                {/* Still have questions CTA */}
                {filteredFaqs.length > 0 && (
                    <div
                        className={`mt-16 rounded-2xl p-8 sm:p-10 text-center border backdrop-blur-sm ${
                            isDark 
                                ? 'bg-gradient-to-br from-teal-950/20 to-amber-950/10 border-slate-800/80' 
                                : 'bg-gradient-to-br from-teal-50/40 to-amber-50/20 border-slate-200'
                        }`}
                    >
                        <div
                            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                            style={{ background: 'rgba(26,138,138,0.1)' }}
                        >
                            <HelpCircle size={22} className="text-[#1A8A8A]" />
                        </div>
                        <h3 className={`font-heading text-xl sm:text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            Still have questions?
                        </h3>
                        <p className={`font-body text-sm sm:text-base max-w-sm mx-auto mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                            Can't find what you're looking for? Our team is happy to help you get started.
                        </p>
                        <a
                            href="mailto:info@computesofttech.com"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-[#1A8A8A] text-white font-body font-semibold text-sm sm:text-base hover:bg-[#00C9B1] shadow-md transition-all duration-200"
                        >
                            Contact Support
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}

/* ─── Reusable Accordion Item ─── */
const AccordionItem = ({ faq, isOpen, isDark, onToggle, searchQuery }) => {
    /* Highlight matching text */
    const highlight = (text) => {
        if (!searchQuery.trim()) return text
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(regex)
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark
                    key={i}
                    style={{ background: 'rgba(0,201,177,0.22)', color: 'inherit', borderRadius: 3 }}
                >
                    {part}
                </mark>
            ) : (
                part
            )
        )
    }

    return (
        <div>
            <button
                onClick={onToggle}
                className="w-full flex items-start justify-between py-5 text-left gap-4 group cursor-pointer"
                aria-expanded={isOpen}
            >
                <span className={`font-body font-medium text-base sm:text-[17px] transition-colors duration-200 leading-snug ${
                    isDark 
                        ? 'text-slate-200 group-hover:text-[#00C9B1]' 
                        : 'text-slate-800 group-hover:text-[#1A8A8A]'
                }`}>
                    {highlight(faq.question)}
                </span>
                <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-200 ${
                        isOpen
                            ? 'bg-[#1A8A8A] border-[#1A8A8A] text-white'
                            : isDark
                                ? 'border-slate-800 text-slate-500 group-hover:border-[#00C9B1] group-hover:text-[#00C9B1]'
                                : 'border-slate-200 text-slate-400 group-hover:border-[#1A8A8A] group-hover:text-[#1A8A8A]'
                    }`}
                >
                    {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </span>
            </button>

            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                }`}
            >
                <div className={`pl-4 border-l-2 ${isDark ? 'border-teal-500/20' : 'border-[#1A8A8A]/30'}`}>
                    <p className={`font-body text-sm sm:text-base leading-relaxed pr-10 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                        {highlight(faq.answer)}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FaqListing