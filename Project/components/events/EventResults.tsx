"use client"

import React from 'react'
import { Calendar, MapPin, Heart } from 'lucide-react'
import { motion } from 'framer-motion'

const EVENTS = [
    { id: 1, title: "Neon Lights Festival", date: "Aug 12, 2026", location: "Central Park, NY", image: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?q=80&w=800&auto=format&fit=crop", price: 45 },
    { id: 2, title: "Tech Innovators Summit", date: "Sep 05, 2026", location: "Moscone Center, SF", image: "https://images.unsplash.com/photo-1540575467063-17e6fc48dee5?q=80&w=800&auto=format&fit=crop", price: 299 },
    { id: 3, title: "Jazz by the Bay", date: "Jul 20, 2026", location: "Marina Bay, SG", image: "https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop", price: 80 },
    { id: 4, title: "Modern Art Gallery Opening", date: "Oct 10, 2026", location: "The Louve, Paris", image: "https://images.unsplash.com/photo-1545989253-02cc26577f88?q=80&w=800&auto=format&fit=crop", price: 35 },
    { id: 5, title: "Grand Prix Final", date: "Nov 15, 2026", location: "Yas Marina, UAE", image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop", price: 550 },
    { id: 6, title: "Culinary Masterclass", date: "Aug 30, 2026", location: "Gordon Ramsay Academy", image: "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=800&auto=format&fit=crop", price: 150 },
]

export function EventResults() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {EVENTS.map((event, i) => (
                <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.05 }}
                    className="group bg-white dark:bg-[#18181b] rounded-[2rem] overflow-hidden border border-slate-100 dark:border-zinc-800 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                    {/* Image */}
                    <div className="h-48 relative overflow-hidden">
                        <img
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full cursor-pointer hover:bg-white/40 transition-colors">
                            <Heart className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                            <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight line-clamp-2">{event.title}</h4>
                        </div>

                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <Calendar className="w-3.5 h-3.5 text-[#FF5E1F]" />
                                <span>{event.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                <span>{event.location}</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-zinc-800">
                            <span className="text-[#FF5E1F] font-black text-lg">${event.price}</span>
                            <button className="bg-slate-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full text-xs font-bold hover:opacity-90 transition-opacity">
                                Book Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}
