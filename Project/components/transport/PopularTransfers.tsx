"use client"
import Link from "next/link"
import { useEffect, useState } from "react"

interface TransferRoute {
    from: string
    to: string
    price: number
    image: string
}

export function PopularTransfers() {
    const [routes, setRoutes] = useState<TransferRoute[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchPopular() {
            try {
                const res = await fetch('/api/transport/popular')
                if (res.ok) {
                    const data = await res.json()
                    setRoutes(data)
                }
            } catch (error) {
                console.error("Failed to fetch popular transfers", error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchPopular()
    }, [])

    if (isLoading) {
        return (
            <section className="py-16 px-4 lg:px-12 max-w-[1440px] mx-auto">
                <div className="h-10 w-64 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-[2rem] bg-slate-100 dark:bg-slate-800 animate-pulse" />
                    ))}
                </div>
            </section>
        )
    }

    if (routes.length === 0) return null;

    return (
        <section className="py-16 px-4 lg:px-12 max-w-[1440px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8">
                Popular Transfers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {routes.map((route, i) => (
                    <Link
                        key={i}
                        href={`/transport/results?origin=${route.from}&destination=${route.to}`}
                        className="group relative rounded-[2rem] overflow-hidden h-64 shadow-lg cursor-pointer block"
                    >
                        <img
                            src={route.image}
                            alt={`${route.from} to ${route.to}`}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                        <div className="absolute bottom-0 left-0 p-6 w-full">
                            <div className="flex items-center gap-2 text-white/80 text-sm font-bold uppercase tracking-wider mb-1">
                                <span>{route.from}</span>
                                <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                <span className="text-primary font-bold">{route.to}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-white text-2xl font-black">
                                    One Way
                                </h3>
                                <div className="text-right">
                                    <span className="text-white/60 text-xs font-bold block">From</span>
                                    <span className="text-primary text-2xl font-black">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    )
}
