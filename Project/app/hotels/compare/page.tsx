"use client"

import Image from 'next/image'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Footer } from '@/components/Footer'
import { Suspense, useMemo } from 'react'
import { hotels } from '../../../data/hotels'

interface Hotel {
    id: number;
    name: string;
    location: string;
    rating: number;
    ratingLabel: string;
    reviews: number;
    stars: number;
    image: string;
    priceOld: number;
    priceNew: number;
    badge: string | null;
    amenities: string[];
    wellness: number;
    roomSize: number;
    distance: number;
}

function CompareContent() {
    const searchParams = useSearchParams()
    const idsParam = searchParams.get('ids')

    // Select hotels based on IDs from URL
    const selectedHotels = useMemo(() => {
        const ids = idsParam ? idsParam.split(',').filter(id => id.trim() !== '') : []
        // Filter locally imported hotel data
        return hotels.filter((h: any) => ids.includes(h.id.toString())) as Hotel[]
    }, [idsParam])

    // Condition: If selected hotels are fewer than 2
    if (selectedHotels.length < 2) {
        return (
            <>
                <main className="flex min-h-screen items-center justify-center p-6 md:p-12 animate-fade-in-up">
                    <div className="w-full max-w-4xl text-center space-y-12">
                        <div className="relative w-36 h-36 mx-auto">
                            <div className="absolute inset-0 bg-brand-orange/5 dark:bg-brand-orange/10 rounded-full scale-150 blur-3xl"></div>
                            <svg className="w-full h-full relative z-10 text-brand-orange stroke-current stroke-[1.5]" fill="none" viewBox="0 0 100 100">
                                <path d="M20 85H80" strokeLinecap="round"></path>
                                <rect height="50" rx="4" width="16" x="30" y="35"></rect>
                                <line strokeLinecap="round" x1="34" x2="42" y1="45" y2="45"></line>
                                <line strokeLinecap="round" x1="34" x2="42" y1="55" y2="55"></line>
                                <line strokeLinecap="round" x1="34" x2="42" y1="65" y2="65"></line>
                                <rect height="60" rx="4" width="16" x="54" y="25"></rect>
                                <line strokeLinecap="round" x1="58" x2="66" y1="35" y2="35"></line>
                                <line strokeLinecap="round" x1="58" x2="66" y1="45" y2="45"></line>
                                <line strokeLinecap="round" x1="58" x2="66" y1="55" y2="55"></line>
                                <line strokeLinecap="round" x1="58" x2="66" y1="65" y2="65"></line>
                                <circle className="dark:fill-slate-900" cx="50" cy="50" fill="white" r="10" stroke="currentColor" strokeWidth="1.5"></circle>
                                <text fill="currentColor" fontSize="8" fontWeight="800" style={{ stroke: 'none' }} textAnchor="middle" x="50" y="53">VS</text>
                            </svg>
                        </div>
                        <div className="space-y-6">
                            <h1 className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                                Compare Hotels
                            </h1>
                            <p className="text-xl text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-medium">
                                Find your perfect stay. Select at least 2 hotels to compare amenities, prices, and verified ratings side by side.
                            </p>
                        </div>
                        <div className="pt-4">
                            <Link
                                href="/hotels"
                                className="border-2 border-brand-orange text-brand-orange px-12 py-5 text-xl font-bold rounded-full inline-flex items-center space-x-4 group hover:bg-brand-orange hover:text-white hover:shadow-[0_10px_25px_-5px_rgba(255,94,31,0.3)] transition-all duration-300"
                            >
                                <span className="material-symbols-outlined group-hover:-translate-x-1 transition-transform">arrow_back</span>
                                <span>Browse Hotels</span>
                            </Link>
                        </div>
                        <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">analytics</span>
                                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Data Analysis</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Real-time pricing data from over 20+ global sources.</p>
                            </div>
                            <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">verified</span>
                                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Trusted Reviews</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Verified guest feedback and professional industry ratings.</p>
                            </div>
                            <div className="p-8 bg-white/40 dark:bg-slate-800/20 backdrop-blur-sm rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 hover:bg-white/60 dark:hover:bg-slate-800/40 transition-colors">
                                <span className="material-symbols-outlined text-brand-orange text-3xl mb-4">bolt</span>
                                <h3 className="font-bold text-xs mb-2 uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Instant Compare</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">Side-by-side technical breakdown in a single click.</p>
                            </div>
                        </div>
                    </div>
                </main>
                <div className="fixed bottom-10 right-10 z-[100]">
                    <button className="w-16 h-16 bg-brand-orange text-white rounded-full shadow-2xl shadow-brand-orange/30 flex items-center justify-center hover:scale-110 active:scale-95 transition-all group">
                        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform">chat_bubble</span>
                    </button>
                </div>
                <Footer />
            </>
        )
    }

    // Determine Dynamic Winner Logic
    // Winner: Highest Rating
    const winner = selectedHotels.reduce((prev, current) => (prev.rating > current.rating) ? prev : current, selectedHotels[0])

    // Best Value: Lowest Price
    const bestValue = selectedHotels.reduce((prev, current) => (prev.priceNew < current.priceNew) ? prev : current, selectedHotels[0])

    const gridColsClass =
        selectedHotels.length === 2 ? "grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto" :
            selectedHotels.length === 3 ? "grid-cols-1 md:grid-cols-3 max-w-7xl mx-auto" :
                "grid-cols-1 md:grid-cols-4 max-w-[1400px] mx-auto"

    const imageSizeClasses = selectedHotels.length >= 4 ? "h-40" : "h-48"

    return (
        <>
            <main className="bg-slate-50 min-h-screen relative">
                {/* Back Button for Comparison View */}
                <div className="absolute top-6 left-6 z-[60]">
                    <Link
                        href="/hotels"
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-full font-bold hover:bg-white/20 transition-colors border border-white/20"
                    >
                        <span className="material-symbols-outlined text-lg">arrow_back</span>
                        <span className="text-xs tracking-widest uppercase">Back to Hotels</span>
                    </Link>
                </div>

                <section className="relative h-[60vh] w-full overflow-hidden">
                    <Image
                        alt="Luxury Hotel Interior"
                        fill
                        className="object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuAtObXxzl5gFklIb9tEBG4cnGXT5t2S6_1HdfWccLkaHEm1y6hmK3JJhOy5NoIgA0eU-T-nv8fchBV_GtNQY4bTCysGgLgn9thxP7i2_zZGr3tis_-DydxSYhTsAt2zfjiWXVg6KYPL1nTD38J4eJJULaishsUjiguQkGsuJTP0AeKHQWY26G__joSc84ct2GR6Lq9eYJB1sJC-WlVfW_mHCoZZoeJHJ0rMKcsDx4sHzoRRKR-_62X_skUsrm4VASTEEr1eRK5WxrM"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4">
                        <h1 className="text-6xl md:text-8xl font-black mb-4 tracking-tighter">
                            Stay <span className="text-brand-orange">Better.</span>
                        </h1>
                        <p className="text-lg md:text-xl font-light max-w-2xl opacity-90">
                            Expert-curated comparison for your next extraordinary escape.
                        </p>
                    </div>
                </section>

                <div className="relative z-50 -mt-24 px-8 lg:px-24">
                    <div className="max-w-6xl mx-auto backdrop-blur-3xl bg-white/80 dark:bg-slate-900/80 border border-white/40 dark:border-slate-800 rounded-[3rem] p-8 md:p-12 shadow-2xl flex flex-col md:flex-row gap-12 items-center">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="material-symbols-outlined text-brand-orange">auto_awesome</span>
                                <span className="text-[10px] font-black tracking-widest uppercase text-slate-400">AI Concierge Analysis</span>
                            </div>
                            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-4">The Verdict</h2>
                            <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg italic">
                                "Based on data analysis, <span className="font-bold text-slate-900 dark:text-white underline decoration-brand-orange underline-offset-4">{winner.name}</span> emerges as the winner with a superior rating of {winner.rating}, while <span className="font-bold text-slate-900 dark:text-white">{bestValue.name}</span> offers the best value at ${bestValue.priceNew}."
                            </p>
                        </div>
                        <div className="flex flex-col gap-3 w-full md:w-auto">
                            <Link
                                href={`/hotels/${winner.id}`}
                                className="bg-brand-orange text-white px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
                            >
                                Select Winner
                                <span className="material-symbols-outlined text-lg">arrow_forward</span>
                            </Link>
                            <button className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-10 py-4 rounded-full font-bold text-sm tracking-widest uppercase flex items-center justify-center gap-3 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                Share Report
                                <span className="material-symbols-outlined text-lg">ios_share</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className={`py-20 px-4 md:px-8 lg:px-12`}>
                    <div className={`grid ${gridColsClass} gap-8 mb-20`}>
                        {selectedHotels.map((hotel) => {
                            const isBestValue = hotel.id === bestValue.id
                            const isWinner = hotel.id === winner.id

                            return (
                                <div key={hotel.id} className={`flex flex-col gap-6 ${isBestValue ? 'scale-105 z-10' : ''}`}>
                                    <div className={`rounded-[2.5rem] overflow-hidden bg-white shadow-sm border border-slate-100 p-2 ${isBestValue ? 'relative ring-2 ring-brand-orange ring-offset-2 ring-offset-slate-50' : ''}`}>
                                        {isBestValue && (
                                            <div className="absolute top-4 right-4 bg-brand-orange text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full z-20">BEST VALUE</div>
                                        )}
                                        {isWinner && !isBestValue && (
                                            <div className="absolute top-4 right-4 bg-slate-900 text-white text-[9px] font-black tracking-widest px-3 py-1 rounded-full z-20">TOP RATED</div>
                                        )}
                                        <div className={`relative ${imageSizeClasses} w-full rounded-[2.5rem] overflow-hidden`}>
                                            <Image
                                                alt={hotel.name}
                                                fill
                                                className="object-cover"
                                                src={hotel.image}
                                            />
                                        </div>
                                    </div>
                                    <div className="px-2">
                                        <span className={`text-[10px] font-black tracking-widest uppercase mb-2 block ${isBestValue ? 'text-brand-orange' : 'text-slate-400'}`}>
                                            {isBestValue ? 'Our Top Pick' : hotel.ratingLabel}
                                        </span>
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-4 line-clamp-2 min-h-[4rem]">{hotel.name}</h3>
                                        <div className="flex items-end gap-1 mb-8">
                                            <span className={`text-3xl font-black ${isBestValue ? 'text-brand-orange' : 'text-slate-900 dark:text-white'}`}>${hotel.priceNew}</span>
                                            <span className="text-sm font-medium text-slate-400 pb-1">/ Night</span>
                                        </div>
                                        <ul className="space-y-6">
                                            <li className={`flex items-center justify-between border-b ${isBestValue ? 'border-brand-orange/10' : 'border-slate-50 dark:border-slate-800'} pb-4`}>
                                                <span className="text-sm text-slate-400 font-medium">Wellness</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{hotel.wellness || 'N/A'}/10</span>
                                            </li>
                                            <li className={`flex items-center justify-between border-b ${isBestValue ? 'border-brand-orange/10' : 'border-slate-50 dark:border-slate-800'} pb-4`}>
                                                <span className="text-sm text-slate-400 font-medium">Room Size</span>
                                                <span className="text-sm font-bold text-slate-900 dark:text-white">{hotel.roomSize || 'N/A'} sqft</span>
                                            </li>
                                            <li className={`flex items-center justify-between border-b ${isBestValue ? 'border-brand-orange/10' : 'border-slate-50 dark:border-slate-800'} pb-4`}>
                                                <span className="text-sm text-slate-400 font-medium">Distance</span>
                                                <span className={`text-sm font-bold ${isBestValue ? 'text-brand-orange' : 'text-slate-900 dark:text-white'}`}>{hotel.distance || 'N/A'} mi</span>
                                            </li>
                                        </ul>
                                    </div>
                                    <Link
                                        href={`/hotels/${hotel.id}`}
                                        className={`w-full py-4 mt-4 rounded-full font-bold text-xs tracking-widest uppercase text-center transition-all ${isBestValue ? 'bg-brand-orange text-white shadow-xl shadow-brand-orange/30 hover:shadow-2xl' : 'border-2 border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                                    >
                                        {isBestValue ? 'Select This' : 'View Details'}
                                    </Link>
                                </div>
                            )
                        })}
                    </div>

                    <div className="pt-16 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-12 text-slate-400">
                        <div className="flex flex-col items-center text-center gap-4">
                            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>wifi</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase">High-Speed Connectivity</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>pool</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Infinity Pools Included</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>parking_valet</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Complimentary Valet</span>
                        </div>
                        <div className="flex flex-col items-center text-center gap-4">
                            <span className="material-symbols-outlined text-slate-900 dark:text-white" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>workspace_premium</span>
                            <span className="text-[10px] font-bold tracking-widest uppercase">Verified Luxury Standard</span>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}

export default function ComparePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading comparison...</div>}>
            <CompareContent />
        </Suspense>
    )
}
