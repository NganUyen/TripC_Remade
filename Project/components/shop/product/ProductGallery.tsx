"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ProductGalleryProps {
    images: string[]
}

export function ProductGallery({ images }: ProductGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0)

    return (
        <div className="flex flex-col gap-4">
            {/* Main Image */}
            <div className="relative aspect-square w-full rounded-[2rem] overflow-hidden bg-white dark:bg-white/5 border border-slate-100 dark:border-slate-800 group">
                <AnimatePresence mode='wait'>
                    <motion.img
                        key={currentIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        src={images[currentIndex]}
                        alt="Product View"
                        className="w-full h-full object-cover"
                    />
                </AnimatePresence>

                {/* Hover Arrows */}
                <button
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm shadow-lg flex items-center justify-center text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                {images.map((img, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${idx === currentIndex
                                ? 'border-[#FF5E1F] ring-2 ring-[#FF5E1F]/20'
                                : 'border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                            }`}
                    >
                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    )
}
