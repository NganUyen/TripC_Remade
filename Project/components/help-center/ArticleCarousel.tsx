"use client"

import { motion } from 'framer-motion'
import { FileText, Clock, ArrowRight } from 'lucide-react'
import { POPULAR_ARTICLES } from './shared'

interface ArticleCarouselProps {
    searchQuery: string
}

export function ArticleCarousel({ searchQuery }: ArticleCarouselProps) {
    const filteredArticles = searchQuery
        ? POPULAR_ARTICLES.filter(a => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
        : POPULAR_ARTICLES

    if (filteredArticles.length === 0) return null

    return (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {searchQuery ? 'Matching Articles' : 'Popular Articles'}
                </h2>
                {!searchQuery && (
                    <a href="#" className="hidden sm:flex items-center gap-1 text-[#FF5E1F] font-bold text-sm hover:underline">
                        View All <ArrowRight className="w-4 h-4" />
                    </a>
                )}
            </div>

            <div className="flex gap-6 overflow-x-auto pb-8 snap-x no-scrollbar">
                {filteredArticles.map((article, index) => (
                    <motion.a
                        key={article.id}
                        href="#"
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        className="snap-start shrink-0 w-[280px] sm:w-[320px] bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:shadow-orange-500/5 transition-all group flex flex-col justify-between h-[200px]"
                    >
                        <div>
                            <span className="inline-block px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-4 uppercase tracking-wider">
                                {article.category}
                            </span>
                            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-2 group-hover:text-[#FF5E1F] transition-colors">
                                {article.title}
                            </h3>
                        </div>
                        <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                            <Clock className="w-4 h-4" />
                            {article.readTime} read
                        </div>
                    </motion.a>
                ))}
            </div>
        </section>
    )
}
