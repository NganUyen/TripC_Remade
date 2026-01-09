"use client"

import React, { useState } from 'react'
import { MapPin, Clock, Phone, Star, ChefHat, MessageSquare } from 'lucide-react'
import { motion } from 'framer-motion'

export function RestaurantContent() {
    const [activeTab, setActiveTab] = useState('Overview')
    const tabs = ['Overview', 'Menu', 'Reviews']

    return (
        <div className="space-y-12">
            {/* Segmented Control Tabs */}
            <div className="flex p-1.5 bg-slate-100 dark:bg-zinc-900 rounded-full w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${activeTab === tab ? 'bg-white dark:bg-zinc-800 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* About Section */}
            <section>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-6">About the Restaurant</h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-8">
                    Experience the authentic flavors of Vietnam reimagined with modern culinary techniques.
                    Madame Vo's Kitchen offers a warm, inviting atmosphere perfect for both intimate dinners and family gatherings.
                    Our chef, with over 20 years of experience, curates a menu that honors tradition while embracing innovation.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center shrink-0">
                            <MapPin className="w-6 h-6 text-[#FF5E1F]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Location</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400">123 Riverfront Avenue, Da Nang</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/10 rounded-full flex items-center justify-center shrink-0">
                            <Clock className="w-6 h-6 text-[#FF5E1F]" />
                        </div>
                        <div>
                            <h4 className="font-bold text-slate-900 dark:text-white mb-1">Opening Hours</h4>
                            <div className="text-sm text-slate-500 dark:text-slate-400 flex flex-wrap gap-1">
                                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                                    <span key={i} className={`w-6 h-6 flex items-center justify-center rounded-full text-[10px] font-bold ${i === 4 ? 'bg-[#FF5E1F] text-white' : 'bg-slate-100 dark:bg-zinc-800'}`}>{day}</span>
                                ))}
                                <span className="ml-2">17:00 - 23:00</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reviews Section */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Reviews (2.3k)</h2>
                    <div className="flex items-center gap-2">
                        <span className="text-3xl font-black text-[#FF5E1F]">4.9</span>
                        <div className="flex text-amber-500">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} className="w-4 h-4 fill-current" />)}
                        </div>
                    </div>
                </div>

                {/* Write Input */}
                <div className="bg-slate-50 dark:bg-zinc-900 rounded-[2rem] p-4 flex gap-4 items-center mb-8">
                    <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-slate-500" />
                    </div>
                    <input
                        type="text"
                        placeholder="Share your dining experience..."
                        className="flex-1 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
                    />
                    <button className="text-[#FF5E1F] font-bold text-sm">Post</button>
                </div>

                {/* Mock Reviews List */}
                <div className="space-y-6">
                    {[1, 2].map((review) => (
                        <div key={review} className="border-b border-slate-100 dark:border-zinc-800 pb-6">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-200" />
                                    <span className="font-bold text-slate-900 dark:text-white">Sarah Jenkins</span>
                                </div>
                                <span className="text-xs text-slate-400">2 days ago</span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                                Absolutely stunning food and atmosphere. The Pho Wagyu was out of this world! Highly recommend booking the patio seating for sunset.
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    )
}
