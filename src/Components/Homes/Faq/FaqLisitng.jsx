import React, { useState, useMemo } from 'react'
import { ChevronDown, ChevronUp, Search, ArrowLeft, X, HelpCircle, Users, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { faqs } from './FAQ' // Re-use the same data

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
        <div className="min-h-screen bg-bg-white">

            {/* ── Hero ── */}
            <div className="relative overflow-hidden bg-bg-dark">
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
                            <span className="text-grad-teal-gold">Questions</span>
                        </h1>
                        <p className="font-body text-text-muted text-base sm:text-lg max-w-xl mx-auto">
                            Browse {faqs.length} answers across general platform, parent app, and teacher portal topics.
                        </p>
                    </div>

                    {/* Search bar */}
                    <div className="relative mt-10 max-w-xl mx-auto">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
                        />
                        <input
                            type="text"
                            placeholder="Search questions…"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white/8 backdrop-blur border border-white/10 text-white placeholder-text-muted font-body text-sm sm:text-base rounded-xl pl-11 pr-11 py-3.5 outline-none focus:border-teal/50 focus:bg-white/12 transition-all duration-200"
                            style={{ background: 'rgba(255,255,255,0.07)' }}
                        />
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-white transition-colors cursor-pointer"
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
                <div className="flex gap-2 flex-wrap py-6 sticky top-0 bg-bg-white z-10 border-b border-gray-100">
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
                                        ? 'bg-teal-dark text-white shadow-sm'
                                        : 'bg-gray-100 text-text-secondary hover:bg-gray-200 hover:text-text-primary'
                                }`}
                            >
                                <Icon size={13} />
                                {cat.label}
                                <span
                                    className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${
                                        isActive
                                            ? 'bg-white/20 text-white'
                                            : 'bg-gray-200 text-text-muted'
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
                        <p className="font-body text-text-muted text-sm">
                            {filteredFaqs.length === 0
                                ? 'No results found'
                                : `${filteredFaqs.length} question${filteredFaqs.length !== 1 ? 's' : ''} found`}
                            {searchQuery && (
                                <span className="text-text-primary font-medium">
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
                                className="text-teal-dark font-body text-sm font-medium hover:underline cursor-pointer transition-colors"
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

                                // Global index for toggle tracking
                                const globalOffset = faqs.findIndex((f) => f.category === catId)

                                return (
                                    <div key={catId} className="mb-10">
                                        {/* Section label */}
                                        <div className="flex items-center gap-3 mb-1">
                                            <div className="h-px flex-1 bg-gradient-to-r from-teal-dark/30 to-transparent" />
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
                                            <div className="h-px flex-1 bg-gradient-to-l from-teal-dark/30 to-transparent" />
                                        </div>

                                        <div className="divide-y divide-gray-100 border-t border-gray-100">
                                            {grouped.map((faq) => {
                                                const realIdx = faqs.indexOf(faq)
                                                const isOpen = openIndex === realIdx
                                                return (
                                                    <AccordionItem
                                                        key={realIdx}
                                                        faq={faq}
                                                        isOpen={isOpen}
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
                            <div className="divide-y divide-gray-100 border-t border-gray-100">
                                {filteredFaqs.map((faq) => {
                                    const realIdx = faqs.indexOf(faq)
                                    const isOpen = openIndex === realIdx
                                    return (
                                        <AccordionItem
                                            key={realIdx}
                                            faq={faq}
                                            isOpen={isOpen}
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
                            <Search size={28} className="text-teal-dark opacity-50" />
                        </div>
                        <h3 className="font-heading text-xl font-bold text-text-primary mb-2">
                            No results found
                        </h3>
                        <p className="font-body text-text-secondary text-sm max-w-xs mx-auto">
                            Try a different keyword or{' '}
                            <button
                                onClick={() => {
                                    setSearchQuery('')
                                    setActiveCategory('all')
                                }}
                                className="text-teal-dark font-medium hover:underline cursor-pointer"
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
                        className="mt-16 rounded-2xl p-8 sm:p-10 text-center"
                        style={{
                            background:
                                'linear-gradient(135deg, rgba(26,138,138,0.07) 0%, rgba(245,166,35,0.06) 100%)',
                            border: '1px solid rgba(26,138,138,0.12)',
                        }}
                    >
                        <div
                            className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                            style={{ background: 'rgba(26,138,138,0.1)' }}
                        >
                            <HelpCircle size={22} className="text-teal-dark" />
                        </div>
                        <h3 className="font-heading text-xl sm:text-2xl font-bold text-text-primary mb-2">
                            Still have questions?
                        </h3>
                        <p className="font-body text-text-secondary text-sm sm:text-base max-w-sm mx-auto mb-6">
                            Can't find what you're looking for? Our team is happy to help you get started.
                        </p>
                        <a
                            href="mailto:info@computesofttech.com"
                            className="inline-flex items-center gap-2 px-7 py-3 rounded-full bg-teal-dark text-white font-body font-semibold text-sm sm:text-base hover:bg-teal shadow-md transition-all duration-200"
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
const AccordionItem = ({ faq, isOpen, onToggle, searchQuery }) => {
    /* Highlight matching text */
    const highlight = (text) => {
        if (!searchQuery.trim()) return text
        const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
        const parts = text.split(regex)
        return parts.map((part, i) =>
            regex.test(part) ? (
                <mark
                    key={i}
                    style={{ background: 'rgba(0,201,177,0.18)', color: 'inherit', borderRadius: 3 }}
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
                <span className="text-text-primary font-body font-medium text-base sm:text-[17px] group-hover:text-teal-dark transition-colors duration-200 leading-snug">
                    {highlight(faq.question)}
                </span>
                <span
                    className={`flex-shrink-0 w-7 h-7 rounded-full border flex items-center justify-center mt-0.5 transition-all duration-200 ${
                        isOpen
                            ? 'bg-teal-dark border-teal-dark text-white'
                            : 'border-gray-200 text-text-muted group-hover:border-teal-dark group-hover:text-teal-dark'
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
                <div
                    className="pl-4 border-l-2 border-teal-dark/30"
                >
                    <p className="text-text-secondary font-body text-sm sm:text-base leading-relaxed pr-10">
                        {highlight(faq.answer)}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default FaqListing