"use client"

import React, { useState } from 'react'
import { Search } from 'lucide-react'
import { motion } from 'framer-motion'

export function ShopHero() {
    const [activeTab, setActiveTab] = useState<'products' | 'giftcards'>('products')
    const categories = ['Luggage', 'Tech', 'Wearables', 'Toiletries', 'Accessories', 'Sleep', 'Photography', 'Outdoors']

    return (
        // SỬA: Dùng min-h để responsive tốt hơn trên mobile, không bị cụt nếu nội dung dài
        <section className="relative min-h-[550px] w-full flex flex-col items-center justify-center p-4">

            {/* Background Image & Overlay */}
            <div className="absolute inset-0 z-0 overflow-hidden rounded-b-[2.5rem]">
                <img
                    src="https://images.unsplash.com/photo-1556905200-279565513a2d?q=80&w=2670&auto=format&fit=crop"
                    alt="Travel Gear"
                    className="w-full h-full object-cover opacity-90"
                />
                {/* KHÔI PHỤC STYLE CŨ: Giữ to-[#fcfaf8] để hòa vào nền trắng */}
                {/* Thêm via-60% để đẩy phần đen lên cao hơn, phần trắng chỉ ở đáy */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 via-60% to-[#fcfaf8] dark:to-[#0a0a0a]"></div>
            </div>

            {/* Hero Content */}
            <div className="relative z-10 w-full max-w-2xl flex flex-col items-center mt-12 md:mt-16">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-white text-4xl md:text-5xl font-bold mb-8 text-center drop-shadow-md"
                >
                    Pack smarter,<br />travel further.
                </motion.h1>

                {/* Search Console */}
                <div className="w-full relative z-20 px-2 md:px-0">
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                            <Search className="w-6 h-6" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search travel gear, bags, essentials..."
                            className="w-full h-14 pl-14 pr-6 rounded-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400"
                        />
                    </div>

                    {/* Segmented Control / Toggle */}
                    <div className="absolute -bottom-14 left-1/2 -translate-x-1/2 z-30 w-max">
                        <div className="bg-white dark:bg-zinc-800 p-1 rounded-full shadow-lg border border-slate-100 dark:border-zinc-700 flex items-center">
                            <button
                                onClick={() => setActiveTab('products')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'products' ? 'bg-[#1c140d] dark:bg-[#FF5E1F] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Products
                            </button>
                            <button
                                onClick={() => setActiveTab('giftcards')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === 'giftcards' ? 'bg-[#1c140d] dark:bg-[#FF5E1F] text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                            >
                                Gift Cards
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quick Categories */}
                {/* SỬA LAYOUT: Tăng mt lên 32 (128px) để né cái nút Toggle ở trên */}
                <div className="mt-20 w-full overflow-visible z-10 relative">
                    <div className="flex justify-center gap-3 overflow-x-auto pb-4 px-4 no-scrollbar">
                        {categories.map((cat, i) => (
                            <button
                                key={i}
                                // QUAN TRỌNG: 
                                // Vì nền web chỗ này là màu TRẮNG (do gradient), nên nút phải là màu TỐI hoặc có viền đậm.
                                // bg-white/60: nền kính mờ sáng
                                // text-slate-800: chữ đậm để đọc được
                                className="whitespace-nowrap px-4 py-2 
                                bg-white/60 dark:bg-black/40 backdrop-blur-md 
                                border border-slate-200 dark:border-white/10 
                                rounded-full 
                                text-slate-900 dark:text-white 
                                text-sm font-bold 
                                hover:bg-white hover:scale-105 
                                transition-all shadow-sm"
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
} 
