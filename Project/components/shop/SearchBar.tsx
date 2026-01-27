"use client"

import React, { useState, useEffect, useRef } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'


interface Suggestion {
    id: string
    title: string
    slug: string
    image_url: string | null
    price_from: { amount: number, currency: string }
    category: string
}

export function SearchBar() {
    const router = useRouter()
    const [query, setQuery] = useState('')
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [loading, setLoading] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [hasSearched, setHasSearched] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    // Handle click outside to close suggestions
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [])

    // Debounce Search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setLoading(true)
                try {
                    const res = await fetch(`/api/shop/products/search?q=${encodeURIComponent(query)}&mode=suggest`)
                    const data = await res.json()

                    // Fix: Check for data array directly, not success boolean
                    if (data.data) {
                        setSuggestions(data.data)
                    } else {
                        setSuggestions([])
                    }
                    setShowSuggestions(true)
                    setHasSearched(true)
                } catch (error) {
                    console.error('Failed to fetch suggestions', error)
                    setSuggestions([])
                } finally {
                    setLoading(false)
                }
            } else {
                setSuggestions([])
                setShowSuggestions(false)
                setHasSearched(false)
            }
        }, 250)

        return () => clearTimeout(timer)
    }, [query])

    const handleSearch = (e?: React.FormEvent) => {
        e?.preventDefault()
        if (query.trim()) {
            setShowSuggestions(false)
            router.push(`/shop/search?q=${encodeURIComponent(query)}`)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <div ref={wrapperRef} className="w-full relative z-20 px-2 md:px-0">
            <form onSubmit={handleSearch} className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-500">
                    <Search className="w-6 h-6" />
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setShowSuggestions(true)}
                    placeholder="Search travel gear, bags, essentials..."
                    className="w-full h-14 pl-14 pr-12 rounded-full bg-white/95 dark:bg-zinc-900/90 backdrop-blur-md border border-white/20 shadow-xl text-lg outline-none focus:ring-2 focus:ring-[#FF5E1F] transition-all placeholder:text-slate-400"
                />
                {loading && (
                    <div className="absolute inset-y-0 right-4 flex items-center text-[#FF5E1F]">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                )}
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && query.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-slate-100 dark:border-zinc-800 overflow-hidden max-h-[400px] overflow-y-auto">
                    <div className="p-2">
                        <div className="flex items-center justify-between px-3 py-2">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suggestions</div>
                            <Link
                                href={`/shop/search?q=${encodeURIComponent(query)}`}
                                onClick={() => setShowSuggestions(false)}
                                className="text-xs font-bold text-[#FF5E1F] hover:text-orange-600 transition-colors"
                            >
                                View all results
                            </Link>
                        </div>

                        {loading ? (
                            <div className="p-4 text-center text-slate-400 text-sm">Searching...</div>
                        ) : suggestions.length > 0 ? (
                            <>
                                {suggestions.map((item) => (
                                    <Link
                                        key={item.id}
                                        href={`/shop/product/${item.slug}`}
                                        onClick={() => setShowSuggestions(false)}
                                        className="flex items-center gap-4 p-3 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors group"
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-zinc-800 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-zinc-700">
                                            {item.image_url ? (
                                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <Search className="w-5 h-5" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-white truncate group-hover:text-[#FF5E1F] transition-colors">{item.title}</h4>
                                            <div className="flex items-center gap-2 text-xs text-slate-500">
                                                <span>{item.category}</span>
                                                <span>•</span>
                                                <span className="font-medium text-slate-900 dark:text-white">${item.price_from.amount}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </>
                        ) : (
                            <div className="px-3 py-6 text-center">
                                <p className="text-slate-500 text-sm mb-2">No results found for "{query}"</p>
                                <p className="text-xs text-slate-400">Try checking your spelling or use different keywords.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
