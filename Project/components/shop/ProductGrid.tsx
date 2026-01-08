"use client"

import React from 'react'
import { Star, ShoppingBag } from 'lucide-react'

// Mock Data
const PRODUCTS = [
    { id: 1, title: 'Weekender Pro Carry-On', price: 245, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1565026057447-bc04064bbccd?q=80&w=1000&auto=format&fit=crop', badge: 'Best Seller' },
    { id: 2, title: 'Noise-Cancel Flight Buds', price: 189, rating: 4.9, reviews: 342, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', badge: '-20%' },
    { id: 3, title: 'Universal Travel Adapter', price: 35, rating: 4.7, reviews: 856, image: 'https://images.unsplash.com/photo-1621257134268-c999c0da2752?q=80&w=1000&auto=format&fit=crop' },
    { id: 4, title: 'Silk Sleep Mask Set', price: 42, rating: 4.9, reviews: 200, image: 'https://images.unsplash.com/photo-1512948606013-1765c3fd5397?q=80&w=1000&auto=format&fit=crop', badge: 'Luxury' },
    { id: 5, title: 'Tech Organizer Pouch', price: 28, rating: 4.6, reviews: 154, image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1000&auto=format&fit=crop' },
    { id: 6, title: 'Compact Travel Pillow', price: 55, rating: 4.5, reviews: 112, image: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?q=80&w=1000&auto=format&fit=crop' },
    { id: 7, title: 'Collapsible Water Bottle', price: 24, rating: 4.8, reviews: 420, image: 'https://images.unsplash.com/photo-1602143407151-01114192003b?q=80&w=1000&auto=format&fit=crop' },
    { id: 8, title: 'Smart Luggage Tag', price: 29, rating: 4.7, reviews: 89, image: 'https://images.unsplash.com/photo-1588729579040-7e28328114f2?q=80&w=1000&auto=format&fit=crop', badge: 'New' },
]

export function ProductGrid() {
    return (
        <section className="pb-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold">Trending Gear</h3>
                <div className="flex gap-2">
                    <button className="active-pill bg-slate-100 dark:bg-zinc-800 px-4 py-2 rounded-full text-sm font-bold">Recommended</button>
                    <button className="px-4 py-2 rounded-full text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors">Newest</button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {PRODUCTS.map((product) => (
                    <div key={product.id} className="group relative">
                        {/* Badge */}
                        {product.badge && (
                            <div className="absolute top-4 left-4 z-20 bg-white/90 dark:bg-black/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                                {product.badge}
                            </div>
                        )}

                        {/* Image Container */}
                        <div className="aspect-[4/5] md:aspect-square w-full rounded-[2rem] overflow-hidden relative bg-slate-100 dark:bg-zinc-900 mb-4">
                            <img
                                src={product.image}
                                alt={product.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            {/* Overlay UI */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>

                            {/* Add to Cart Button */}
                            <button className="absolute bottom-4 right-4 w-12 h-12 bg-white dark:bg-black text-black dark:text-white rounded-full flex items-center justify-center shadow-lg translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110">
                                <ShoppingBag className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Product Info */}
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-1 text-[#FF5E1F] text-xs font-bold">
                                    <Star className="w-3 h-3 fill-current" />
                                    <span>{product.rating}</span>
                                    <span className="text-slate-400 font-medium">({product.reviews})</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-base md:text-lg mb-1 leading-snug line-clamp-1 group-hover:text-[#FF5E1F] transition-colors">{product.title}</h4>
                            <div className="font-bold text-slate-900 dark:text-white text-xl">${product.price}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-16 flex justify-center">
                <button className="px-8 py-4 bg-slate-100 dark:bg-zinc-800 rounded-full font-bold text-sm hover:bg-slate-200 dark:hover:bg-zinc-700 transition-colors">
                    Load More Products
                </button>
            </div>
        </section>
    )
}
