"use client"

import { MapPin, Calendar, Clock, Tag, Music, Star } from 'lucide-react'
import { motion } from 'framer-motion'

const EVENT_DATA = {
    title: "Summer Vibes 2026",
    image: "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?q=80&w=1000&auto=format&fit=crop", // Reliable Concert Image
    date: "Aug 12-14, 2026",
    time: "14:00 - 23:00",
    venue: "Central Park",
    city: "New York, NY",
    price: "From $129",
    category: "Music Festival",
    rating: "4.9",
    reviews: "840"
}

export function EventHeaderPanel() {
    return (
        <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden flex flex-col-reverse lg:flex-row">

                {/* LEFT: Meta Block */}
                <div className="flex-1 p-6 lg:p-10 flex flex-col justify-between">
                    <div>
                        {/* Tags */}
                        <div className="flex flex-wrap items-center gap-3 mb-4">
                            <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                                <Music className="w-3 h-3" /> {EVENT_DATA.category}
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-slate-500">
                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                <span className="text-slate-900 dark:text-white">{EVENT_DATA.rating}</span>
                                <span>({EVENT_DATA.reviews})</span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl lg:text-5xl font-display font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                            {EVENT_DATA.title}
                        </h1>

                        {/* Meta Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Date</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{EVENT_DATA.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Time</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{EVENT_DATA.time}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Venue</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{EVENT_DATA.venue}</p>
                                    <p className="text-xs">{EVENT_DATA.city}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
                                <div className="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-primary">
                                    <Tag className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold uppercase text-slate-400">Price</p>
                                    <p className="font-bold text-slate-900 dark:text-white">{EVENT_DATA.price}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Row - Like Ticketbox */}
                    <div className="flex items-center gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-2xl font-black text-primary">{EVENT_DATA.price}</span>
                        <button className="flex-1 h-12 rounded-full bg-primary hover:bg-primary-hover text-white font-bold shadow-lg shadow-orange-500/20 transition-all">
                            Get Tickets
                        </button>
                    </div>
                </div>

                {/* RIGHT: Poster Image */}
                <div className="w-full lg:w-[400px] h-[300px] lg:h-auto relative bg-slate-100 dark:bg-slate-800">
                    <img
                        src={EVENT_DATA.image}
                        alt={EVENT_DATA.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent lg:hidden" />
                </div>
            </div>
        </section>
    )
}
