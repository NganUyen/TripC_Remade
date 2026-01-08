"use client"

const ROUTES = [
    {
        from: "JFK Airport",
        to: "Manhattan",
        price: 85,
        image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=2070&auto=format&fit=crop"
    },
    {
        from: "Heathrow (LHR)",
        to: "Central London",
        price: 110,
        image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?q=80&w=2070&auto=format&fit=crop"
    },
    {
        from: "Charles de Gaulle",
        to: "Paris City Center",
        price: 95,
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=2073&auto=format&fit=crop"
    }
]

export function PopularTransfers() {
    return (
        <section className="py-16 px-4 lg:px-12 max-w-[1440px] mx-auto">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-8">
                Popular Transfers
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {ROUTES.map((route, i) => (
                    <div key={i} className="group relative rounded-[2rem] overflow-hidden h-64 shadow-lg cursor-pointer">
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
                                <span>{route.to}</span>
                            </div>
                            <div className="flex items-end justify-between">
                                <h3 className="text-white text-2xl font-black">
                                    One Way
                                </h3>
                                <div className="text-right">
                                    <span className="text-white/60 text-xs font-bold block">From</span>
                                    <span className="text-primary text-2xl font-black">${route.price}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
