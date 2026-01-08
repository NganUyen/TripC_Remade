'use client'

export function WellnessHero() {
    return (
        <section className="relative w-full h-[400px] overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Wellness retreat background with nature and zen vibes"
                    className="w-full h-full object-cover"
                    src="https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=2070&auto=format&fit=crop"
                />
            </div>
            <div className="absolute inset-0 z-10 bg-black/30"></div>
            <div className="relative z-20 max-w-4xl w-full px-4 animate-fade-in flex flex-col items-center">
                <span className="inline-block py-1 px-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-bold uppercase tracking-wider mb-4">
                    Rejuvenate Your Soul
                </span>
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-lg mb-6">
                    Wellness & <span className="text-earth-olive">Balance</span>
                </h1>
                <p className="text-lg md:text-xl text-white/95 font-medium mb-8 max-w-2xl drop-shadow-md">
                    Find inner peace with our curated selection of retreats, spas, and mindfulness experiences.
                </p>

                <div className="w-full max-w-xl mx-auto">
                    <div className="glass-search rounded-full p-2 flex items-center bg-white/10 backdrop-blur-md border border-white/20 transition-all duration-300 hover:bg-white/20">
                        <div className="pl-4 text-white/80">
                            <span className="material-symbols-outlined">spa</span>
                        </div>
                        <input
                            className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/80 text-base px-4 placeholder-shown:text-ellipsis"
                            placeholder="Search retreats, yoga, meditation..."
                            type="text"
                        />
                        <button className="bg-earth-olive hover:bg-earth-olive/90 text-white rounded-full p-3 shadow-lg transition-transform transform active:scale-95 flex items-center justify-center">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}
