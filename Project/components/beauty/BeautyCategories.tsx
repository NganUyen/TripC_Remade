"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { beautyApi } from '@/lib/beauty/api'

type BeautyCategoriesProps = {
  onCategorySelect: (categoryId: string) => void
  selectedCategoryId?: string
}

export function BeautyCategories({ onCategorySelect, selectedCategoryId }: BeautyCategoriesProps) {
  const [categories, setCategories] = useState<{ id: string; label: string }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    beautyApi
      .getCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || categories.length === 0) return null

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black text-[#1c140d] dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-[#FF5E1F]" />
            Browse by category
          </h2>
          <p className="text-slate-500 mt-1 font-medium">Categories available in our database</p>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {categories.map((cat, i) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            type="button"
            onClick={() => onCategorySelect(cat.id)}
            className={`whitespace-nowrap px-6 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm border-2 ${
              selectedCategoryId === cat.id
                ? 'bg-[#FF5E1F] text-white border-[#FF5E1F] scale-105'
                : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-zinc-700 hover:border-[#FF5E1F] hover:text-[#FF5E1F] dark:hover:border-[#FF5E1F] dark:hover:text-[#FF5E1F]'
            }`}
          >
            {cat.label}
          </motion.button>
        ))}
      </div>
    </section>
  )
}
