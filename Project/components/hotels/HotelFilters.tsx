"use client"

import { Star, Check } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export function HotelFilters() {
    const router = useRouter()
    const searchParams = useSearchParams()
    
    // State from URL params
    const [priceMax, setPriceMax] = useState(Number(searchParams.get('maxPrice')) || 1000)
    const [selectedStars, setSelectedStars] = useState<number[]>(() => {
        const stars = searchParams.get('stars')
        return stars ? stars.split(',').map(Number) : []
    })
    const [selectedAmenities, setSelectedAmenities] = useState<string[]>(() => {
        const amenities = searchParams.get('amenities')
        return amenities ? amenities.split(',') : []
    })

    // Update URL when filters change
    const updateFilters = (updates: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString())
        
        Object.entries(updates).forEach(([key, value]) => {
            if (value) {
                params.set(key, value)
            } else {
                params.delete(key)
            }
        })
        
        router.push(`/hotels?${params.toString()}`)
    }

    const handlePriceChange = (value: number) => {
        setPriceMax(value)
        updateFilters({ maxPrice: value.toString() })
    }

    const toggleStar = (stars: number) => {
        const newStars = selectedStars.includes(stars)
            ? selectedStars.filter(s => s !== stars)
            : [...selectedStars, stars]
        
        setSelectedStars(newStars)
        updateFilters({ stars: newStars.length > 0 ? newStars.join(',') : null })
    }

    const toggleAmenity = (amenity: string) => {
        const newAmenities = selectedAmenities.includes(amenity)
            ? selectedAmenities.filter(a => a !== amenity)
            : [...selectedAmenities, amenity]
        
        setSelectedAmenities(newAmenities)
        updateFilters({ amenities: newAmenities.length > 0 ? newAmenities.join(',') : null })
    }

    const resetFilters = () => {
        setPriceMax(1000)
        setSelectedStars([])
        setSelectedAmenities([])
        
        // Keep destination and dates, remove filters
        const params = new URLSearchParams()
        const destination = searchParams.get('destination')
        const checkIn = searchParams.get('checkIn')
        const checkOut = searchParams.get('checkOut')
        const adults = searchParams.get('adults')
        const children = searchParams.get('children')
        const rooms = searchParams.get('rooms')
        
        if (destination) params.set('destination', destination)
        if (checkIn) params.set('checkIn', checkIn)
        if (checkOut) params.set('checkOut', checkOut)
        if (adults) params.set('adults', adults)
        if (children) params.set('children', children)
        if (rooms) params.set('rooms', rooms)
        
        router.push(`/hotels?${params.toString()}`)
    }

    return (
        <aside className="w-full lg:w-80 flex-shrink-0 space-y-8 sticky top-24">
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-white/20 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Filters</h3>
                    <button 
                        onClick={resetFilters}
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600"
                    >
                        Reset
                    </button>
                </div>

                {/* Price Range */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Price Range</h4>
                    <div className="px-1">
                        <input
                            type="range"
                            min="50"
                            max="1000"
                            value={priceMax}
                            onChange={(e) => handlePriceChange(Number(e.target.value))}
                            className="w-full h-1 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                        />
                        <div className="flex items-center justify-between mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                            <span>$50</span>
                            <span>${priceMax}{priceMax >= 1000 ? '+' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Star Rating */}
                <div className="mb-8">
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Star Rating</h4>
                    <div className="flex flex-col gap-3">
                        {[5, 4, 3].map((stars) => (
                            <label key={stars} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedStars.includes(stars)}
                                        onChange={() => toggleStar(stars)}
                                        className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" 
                                    />
                                    <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 peer-checked:bg-orange-500 absolute inset-0 m-auto rounded-[5px] transition-all bg-orange-500 scale-0 peer-checked:scale-100" />
                                    <div className="w-full h-full rounded-[5px] absolute inset-0 bg-transparent peer-checked:bg-orange-500 transition-colors" />
                                </div>
                                <div className="flex items-center gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300 dark:text-slate-600'}`}
                                        />
                                    ))}
                                    <span className="text-sm text-slate-600 dark:text-slate-400 ml-1">{stars} Stars</span>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Popular Filters */}
                <div>
                    <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Amenities</h4>
                    <div className="flex flex-col gap-3">
                        {[
                            { label: "Free Breakfast", value: "breakfast_included" },
                            { label: "Swimming Pool", value: "pool" },
                            { label: "Spa & Wellness", value: "spa" },
                            { label: "Free WiFi", value: "wifi" },
                            { label: "Beach Access", value: "beach_access" }
                        ].map(({ label, value }) => (
                            <label key={value} className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex items-center justify-center w-5 h-5 border border-slate-300 dark:border-slate-600 rounded-[6px] transition-colors group-hover:border-orange-500">
                                    <input 
                                        type="checkbox" 
                                        checked={selectedAmenities.includes(value)}
                                        onChange={() => toggleAmenity(value)}
                                        className="peer appearance-none w-full h-full opacity-0 absolute inset-0 z-10 cursor-pointer" 
                                    />
                                    <div className="w-full h-full rounded-[5px] bg-transparent peer-checked:bg-orange-500 transition-colors flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                                <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

            </div>
        </aside>
    )
}
