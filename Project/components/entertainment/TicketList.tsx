"use client"

import React from 'react'
import { MapPin, Calendar, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

const HOT_TICKETS = [
    { id: 1, title: 'Galaxy KTV VIP Room', date: 'Daily • Open late', location: 'District 1, HCMC', price: 50, image: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=800&auto=format&fit=crop' },
    { id: 2, title: 'Skyline Rooftop Bar', date: 'Reserved Seating', location: 'Marina Bay, SG', price: 35, image: 'https://images.unsplash.com/photo-1519671482538-518b48d195f4?q=80&w=800&auto=format&fit=crop' },
    { id: 3, title: 'The Jazz Corner', date: 'Tue-Sun • 7:30 PM', location: 'Greenwich Village, NY', price: 45, image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop' },
    { id: 4, title: 'O\'Malley\'s Irish Pub', date: 'Live Folk Music', location: 'Boston, MA', price: 0, image: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=800&auto=format&fit=crop' },
]

export function TicketList() {
    return (
        <section className="pb-12">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-black text-[#1c140d] dark:text-white">Hot Tickets</h3>
                <button className="text-[#FF5E1F] text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">
                    View Calendar <ArrowRight className="w-4 h-4" />
                </button>
            </div >

            <div className="flex gap-6 overflow-x-auto pb-8 -mx-4 px-4 lg:-mx-12 lg:px-12 no-scrollbar snap-x">
                {HOT_TICKETS.map((ticket, i) => (
                    <Link
                        key={ticket.id}
                        href={`/entertainment/${ticket.id}`}
                        className="snap-start shrink-0 w-[340px] md:w-[400px] block"
                    >
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="flex bg-white dark:bg-[#18181b] rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-800 overflow-hidden relative h-full"
                        >
                            {/* Left: Image Area */}
                            <div className="w-1/3 relative">
                                <img src={ticket.image} alt={ticket.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/10"></div>
                            </div>

                            {/* Perforation Line */}
                            <div className="relative w-[1px] h-full">
                                <div className="absolute top-0 bottom-0 left-[-1px] w-[2px] border-r-2 border-dashed border-slate-200 dark:border-zinc-700"></div>
                                {/* Optional notches */}
                                <div className="absolute -top-2 -left-2 w-4 h-4 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-10"></div>
                                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-[#fcfaf8] dark:bg-[#0a0a0a] rounded-full z-10"></div>
                            </div>

                            {/* Right: Details */}
                            <div className="w-2/3 p-5 flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-slate-900 dark:text-white leading-tight mb-2 line-clamp-2">{ticket.title}</h4>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>{ticket.date}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="line-clamp-1">{ticket.location}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between mt-4">
                                    <div className="text-[#FF5E1F] font-black text-xl">${ticket.price}</div>
                                    <button className="bg-[#FF5E1F] text-white px-4 py-1.5 rounded-full text-xs font-bold hover:bg-[#ff7640] transition-colors">
                                        Book
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                ))}

                {/* View All Card */}
                <div className="snap-start shrink-0 w-[150px] flex items-center justify-center">
                    <button className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-400 hover:border-[#FF5E1F] hover:text-[#FF5E1F] transition-colors">
                        <ArrowRight className="w-6 h-6" />
                    </button>
                </div>
            </div>
        </section >
    )
}
