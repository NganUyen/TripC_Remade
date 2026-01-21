"use client"

import { motion } from 'framer-motion'
import { Heart, Share2, Grid, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface ProductHeroProps {
    images: string[]
    category: string
}

export function ProductHero({ images, category }: ProductHeroProps) {
    const [currentImage, setCurrentImage] = useState(0)

    const nextImage = () => setCurrentImage((prev) => (prev + 1) % images.length)
    const prevImage = () => setCurrentImage((prev) => (prev - 1 + images.length) % images.length)

    return (
        <section className="relative w-full h-[60vh] md:h-[70vh] min-h-[500px]">
            {/* Gallery Slider */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[3rem]">
                <motion.img
                    key={currentImage}
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    src={images[currentImage]}
                    alt="Product Gallery"
                    className="w-full h-full object-cover"
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Navigation Controls */}
                <button onClick={prevImage} className="absolute left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hidden md:flex">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextImage} className="absolute right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all hidden md:flex">
                    <ChevronRight className="w-6 h-6" />
                </button>

                {/* Mobile Dots */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-2 md:hidden">
                    {images.map((_, i) => (
                        <div key={i} className={`w-2 h-2 rounded-full transition-all ${i === currentImage ? 'bg-white w-4' : 'bg-white/40'}`} />
                    ))}
                </div>
            </div>

            {/* Top Bar Actions */}
            <div className="absolute top-0 inset-x-0 p-6 flex justify-between items-start z-10 max-w-7xl mx-auto w-full pt-8">
                <span className="px-4 py-2 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white text-xs font-bold uppercase tracking-wider shadow-lg">
                    {category}
                </span>

                <div className="flex gap-3">
                    <button className="p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white hover:bg-white hover:text-red-500 transition-all shadow-lg group">
                        <Heart className="w-5 h-5 group-hover:fill-current" />
                    </button>
                    <button className="p-3 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white hover:bg-white hover:text-slate-900 transition-all shadow-lg">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* View Grid Button */}
            <button className="absolute bottom-8 right-8 px-5 py-2.5 rounded-full bg-white/20 backdrop-blur-xl border border-white/20 text-white font-bold text-sm hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg hidden md:flex">
                <Grid className="w-4 h-4" />
                View Gallery ({images.length})
            </button>
        </section>
    )
}
