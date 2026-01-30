"use client"

import React, { useState } from 'react'
import { Search, Calendar, ChevronDown, User, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

export function DiningHero() {
    const categories = ['Italian', 'Japanese', 'Rooftop', 'Steakhouse', 'Vegan']

    return (
        <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center p-4">
            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2670&auto=format&fit=crop"
                    alt="Fine Dining"
                    className="w-full h-full object-cover opacity-95"
                />
                {/* Standard Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-3xl flex flex-col items-center mt-12 md:mt-24">
                <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-white text-4xl md:text-6xl font-black mb-8 text-center drop-shadow-lg tracking-tight"
                >
                    Reserve Your<br />Perfect Table
                </motion.h1>

                {/* COMPLEX SEARCH PILL - Floating & Overlapping */}
                <div className="w-full relative z-20">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-2 rounded-full shadow-2xl flex flex-col md:flex-row items-center gap-2"
                    >
                        {/* Input Area */}
                        <div className="flex-1 w-full flex items-center px-4 h-12">
                            <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
                            <input
                                type="text"
                                placeholder="Search restaurants, cuisines..."
                                className="bg-transparent w-full h-full outline-none text-slate-900 dark:text-white placeholder:text-slate-500 text-lg font-medium"
                            />
                        </div>

                        {/* Divider (Hidden on mobile) */}
                        <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-zinc-700"></div>

                        {/* Date/Guests Selector */}
                        <button className="w-full md:w-auto flex items-center justify-between md:justify-start gap-4 px-4 h-12 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors group text-left">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Date & Guests</span>
                                <span className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors flex items-center gap-1">
                                    Tonight, 2 People <ChevronDown className="w-3 h-3" />
                                </span>
                            </div>
                            <Calendar className="w-5 h-5 text-slate-400 md:hidden" />
                        </button>

                        {/* Search Button */}
                        <button className="w-full md:w-12 h-12 bg-[#FF5E1F] rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#e04f18] hover:scale-105 transition-all shrink-0">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </motion.div>

                    {/* Categories below search */}
                    <div className="mt-8 w-full overflow-hidden z-20 relative px-4">
                        <div className="flex justify-start md:justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                            {categories.map((cat, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.05) }}
                                    className="cursor-pointer whitespace-nowrap px-5 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm shrink-0"
                                >
                                    {cat}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
