"use client"

import React, { useEffect, useState } from 'react'
import { Search, MapPin, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { beautyApi } from '@/lib/beauty/api'

type BeautyHeroProps = {
  searchQuery: string
  setSearchQuery: (v: string) => void
  locationQuery: string
  setLocationQuery: (v: string) => void
  onSearch: () => void
  onCategorySelect: (categoryId: string) => void
  clearFilters: () => void
  hasActiveFilters: boolean
}

export function BeautyHero({
  searchQuery,
  setSearchQuery,
  locationQuery,
  setLocationQuery,
  onSearch,
  onCategorySelect,
  clearFilters,
  hasActiveFilters,
}: BeautyHeroProps) {
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([])

  useEffect(() => {
    beautyApi.getCategories().then(setCategories).catch(() => setCategories([]))
  }, [])

  return (
    <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center pt-24 pb-12 px-4">
      <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
        <img
          src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?q=80&w=2669&auto=format&fit=crop"
          alt="Luxury Spa"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
      </div>

      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center mt-8 md:mt-16">
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-white text-4xl md:text-7xl font-black mb-6 text-center drop-shadow-xl tracking-tight leading-tight"
        >
          Redefine Your <span className="text-orange-200 italic font-serif">Glow</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-white/90 text-lg md:text-xl font-medium text-center max-w-2xl mb-10 drop-shadow-md"
        >
          Book top-rated salons, spas, and wellness experiences near you.
        </motion.p>

        <div className="w-full flex flex-col items-center gap-6">
          <div className="w-full max-w-3xl relative bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl rounded-full shadow-2xl p-2.5 flex flex-col md:flex-row items-center gap-2 border border-white/20 dark:border-zinc-800">
            <div className="flex-1 flex items-center px-4 h-12 w-full group">
              <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Service or Salon name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="bg-transparent w-full h-full outline-none text-slate-900 dark:text-white placeholder:text-slate-500 font-medium"
              />
            </div>
            <div className="hidden md:block w-[1px] h-8 bg-slate-200 dark:bg-zinc-700"></div>
            <div className="flex-1 flex items-center px-4 h-12 w-full group">
              <MapPin className="w-5 h-5 text-slate-400 mr-3 shrink-0 group-focus-within:text-orange-500 transition-colors" />
              <input
                type="text"
                placeholder="Location (e.g. Da Nang, Hanoi)"
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                className="bg-transparent w-full h-full outline-none text-slate-900 dark:text-white placeholder:text-slate-500 font-medium"
              />
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="md:mr-2 p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-zinc-700 hover:text-slate-700 dark:hover:text-white transition-colors"
                title="Clear filters"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onSearch}
              className="w-full md:w-auto px-8 h-12 bg-[#FF5E1F] rounded-full text-white font-bold hover:bg-[#e04f18] transition-all shadow-lg hover:shadow-orange-500/25 active:scale-95"
            >
              Search
            </button>
          </div>

          {categories.length > 0 && (
            <div className="w-full overflow-hidden z-20 relative px-4">
              <div className="flex justify-start md:justify-center gap-3 overflow-x-auto pb-4 no-scrollbar">
                {categories.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                    onClick={() => onCategorySelect(cat.id)}
                    className="cursor-pointer whitespace-nowrap px-6 py-2.5 bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/20 rounded-full text-slate-900 dark:text-white text-sm font-bold hover:bg-white hover:scale-105 transition-all shadow-sm shrink-0"
                  >
                    {cat.label}
                  </motion.button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
