"use client"

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ArrowRight } from 'lucide-react'
import { FAQ_CATEGORIES, FAQS } from './shared'

interface FAQSectionProps {
    searchQuery: string
}

export function FAQSection({ searchQuery }: FAQSectionProps) {
    const [activeCategory, setActiveCategory] = useState(FAQ_CATEGORIES[0].id)
    const [openItem, setOpenItem] = useState<string | null>(null)

    // Filter Logic
    const filteredFAQs = useMemo(() => {
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            return FAQS.filter(faq =>
                faq.question.toLowerCase().includes(query) ||
                faq.answer.toLowerCase().includes(query)
            )
        }
        return FAQS.filter(faq => faq.category === activeCategory)
    }, [searchQuery, activeCategory])

    const displayCategory = searchQuery ? 'Search Results' : FAQ_CATEGORIES.find(c => c.id === activeCategory)?.label

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col lg:flex-row gap-12">

                {/* Sidebar Categories */}
                <div key="sidebar" className="lg:w-1/4 shrink-0">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Categories</h3>
                    <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 no-scrollbar">
                        {FAQ_CATEGORIES.map(category => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategory(category.id)}
                                disabled={!!searchQuery}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all whitespace-nowrap ${activeCategory === category.id && !searchQuery
                                    ? 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    } ${searchQuery ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                <category.icon className={`w-5 h-5 ${activeCategory === category.id && !searchQuery ? 'text-white' : 'text-slate-400'}`} />
                                <span className="font-semibold text-sm">{category.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQ List */}
                <div key="list" className="flex-1 min-h-[400px]">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        {displayCategory}
                        {searchQuery && <span className="text-sm font-normal text-slate-500">({filteredFAQs.length} found)</span>}
                    </h3>

                    <div className="space-y-4">
                        <AnimatePresence mode='wait'>
                            {filteredFAQs.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-8 text-center text-slate-500 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800"
                                >
                                    No results found matching "{searchQuery}"
                                </motion.div>
                            ) : (
                                filteredFAQs.map((faq) => (
                                    <motion.div
                                        key={faq.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setOpenItem(openItem === faq.id ? null : faq.id)}
                                            className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                        >
                                            <span className="font-bold text-slate-900 dark:text-white pr-8">{faq.question}</span>
                                            <ChevronDown
                                                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${openItem === faq.id ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <AnimatePresence>
                                            {openItem === faq.id && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                >
                                                    <div className="px-6 pb-6 pt-0 text-slate-600 dark:text-slate-400 text-sm leading-relaxed border-t border-slate-100 dark:border-slate-800/50">
                                                        <div className="pt-4">
                                                            {faq.answer}
                                                        </div>
                                                        <a href="#" className="inline-flex items-center gap-1 text-[#FF5E1F] font-bold mt-4 hover:underline">
                                                            Learn more <ArrowRight className="w-4 h-4" />
                                                        </a>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}
