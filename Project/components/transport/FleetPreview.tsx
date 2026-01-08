"use client"

const FLEET = [
    {
        name: "Business Class",
        image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?q=80&w=2670&auto=format&fit=crop", // Mercedes E-Class esque
        passengers: 3,
        luggage: 2,
        example: "Mercedes-Benz E-Class"
    },
    {
        name: "First Class",
        image: "https://images.unsplash.com/photo-1563720223185-11003d516935?q=80&w=2670&auto=format&fit=crop", // Mercedes S-Class
        passengers: 3,
        luggage: 2,
        example: "Mercedes-Benz S-Class"
    },
    {
        name: "Business SUV",
        image: "https://images.unsplash.com/photo-1533558701576-23c65e0272fb?q=80&w=2574&auto=format&fit=crop", // Escalade
        passengers: 6,
        luggage: 6,
        example: "Cadillac Escalade"
    },
    {
        name: "Business Van",
        image: "https://images.unsplash.com/photo-1605218427306-022ba8c696d9?q=80&w=2669&auto=format&fit=crop", // Sprinter (generic luxury van)
        passengers: 12,
        luggage: 12,
        example: "Mercedes-Benz Sprinter"
    }
]

export function FleetPreview() {
    return (
        <section className="py-16 px-4 lg:px-12 max-w-[1440px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                        Premium Fleet
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Choose the perfect vehicle for your journey.
                    </p>
                </div>
                <button className="text-primary font-bold hover:underline flex items-center gap-1">
                    View All Vehicles <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {FLEET.map((car, i) => (
                    <div key={i} className="group flex flex-col bg-white dark:bg-[#18181b] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={car.image}
                                alt={car.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
                            <div className="absolute bottom-4 left-4 text-white font-bold text-lg">
                                {car.name}
                            </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col justify-between">
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Example Vehicle</p>
                                <p className="text-slate-700 dark:text-slate-200 font-medium text-sm mb-4">{car.example}</p>
                            </div>

                            <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
                                <div className="flex items-center gap-1.5" title="Max Passengers">
                                    <span className="material-symbols-outlined text-lg">person</span>
                                    <span className="text-xs font-bold">{car.passengers}</span>
                                </div>
                                <div className="flex items-center gap-1.5" title="Max Luggage">
                                    <span className="material-symbols-outlined text-lg">business_center</span>
                                    <span className="text-xs font-bold">{car.luggage}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
