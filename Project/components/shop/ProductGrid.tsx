"use client"

import React from 'react'
import { Star, ShoppingBag } from 'lucide-react'
import { ProductCard } from './ProductCard'

// Mock Data
const PRODUCTS = [
    { id: 1, title: 'Weekender Pro Carry-On', price: 245, rating: 4.8, reviews: 128, image: 'https://images.unsplash.com/photo-1565026057447-bc04064bbccd?q=80&w=1000&auto=format&fit=crop', badge: 'Best Seller', category: 'Luggage', colors: ['#000000', '#1e293b', '#64748b'] },
    { id: 2, title: 'Noise-Cancel Flight Buds', price: 189, rating: 4.9, reviews: 342, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop', badge: '-20%', category: 'Audio', colors: ['#ffffff', '#000000'] },
    { id: 3, title: 'Universal Travel Adapter', price: 35, rating: 4.7, reviews: 856, image: 'https://images.unsplash.com/photo-1621257134268-c999c0da2752?q=80&w=1000&auto=format&fit=crop', category: 'Accessories', colors: ['#cbd5e1'] },
    { id: 4, title: 'Silk Sleep Mask Set', price: 42, rating: 4.9, reviews: 200, image: 'https://images.unsplash.com/photo-1512948606013-1765c3fd5397?q=80&w=1000&auto=format&fit=crop', badge: 'Luxury', category: 'Wellness', colors: ['#f8fafc', '#pink'] },
    { id: 5, title: 'Tech Organizer Pouch', price: 28, rating: 4.6, reviews: 154, image: 'https://images.unsplash.com/photo-1553531384-cc64ac80f931?q=80&w=1000&auto=format&fit=crop', category: 'Organization', colors: ['#334155', '#475569'] },
    { id: 6, title: 'Compact Travel Pillow', price: 55, rating: 4.5, reviews: 112, image: 'https://images.unsplash.com/photo-1520106212299-d99c443e4568?q=80&w=1000&auto=format&fit=crop', category: 'Comfort', colors: ['#475569', '#94a3b8'] },
    { id: 7, title: 'Collapsible Water Bottle', price: 24, rating: 4.8, reviews: 420, image: 'https://images.unsplash.com/photo-1602143407151-01114192003b?q=80&w=1000&auto=format&fit=crop', category: 'Hydration', colors: ['#3b82f6', '#ef4444', '#22c55e'] },
    { id: 8, title: 'Smart Luggage Tag', price: 29, rating: 4.7, reviews: 89, image: 'https://images.unsplash.com/photo-1588729579040-7e28328114f2?q=80&w=1000&auto=format&fit=crop', badge: 'New', category: 'Tech', colors: ['#000000'] },
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
                    <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        price={product.price}
                        rating={product.rating}
                        reviews={product.reviews}
                        image={product.image}
                        badge={product.badge}
                        category={product.category}
                        colors={product.colors}
                    />
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
