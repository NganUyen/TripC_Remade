'use client'

interface ActivitiesHeroProps {
    themeColor?: 'primary' | 'green' | 'blue' | 'purple'
}

export function ActivitiesHero({ themeColor = 'primary' }: ActivitiesHeroProps) {
    const isGreen = themeColor === 'green'

    const titleGradient = isGreen
        ? "bg-gradient-to-br from-green-600 to-emerald-500"
        : "bg-gradient-to-br from-primary to-amber-500"

    const iconColor = isGreen ? "text-green-600" : "text-primary"
    const buttonClass = isGreen
        ? "bg-green-600 hover:bg-green-700 shadow-green-600/20"
        : "bg-primary hover:bg-primary-dark shadow-primary/20"

    return (
        <section className="relative w-full h-[360px] overflow-hidden flex flex-col justify-center items-center text-center">
            <div className="absolute inset-0 z-0">
                <img
                    alt="Scenic mountain range with clear blue lake"
                    className="w-full h-full object-cover"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuAPI5lqKpFTKxM7N6c_LWn_0OWXrDCYB3MQyDa9-C7KEPmtZuWsyhm4bYoH9xG1Ttyf4VYESn6F3zdxc_Y_AkSaJmA6s5R2GkrdsFp34weBRDh8_-oZR9F2GmtLcuTCUz8_uGPWfidgPZbILa3KuZqmxF7EY42yP2E_jV3iZSWh4zoiU7MRwpATJe9JilnitYRDpFCSX16wiNr3cFz_ZcVb1mq9MsX8b9p-QXpwyDyBYqHuZgmOc-jsssdDz6bGfhwaX4W2P_ilDng"
                />
            </div>
            <div className="absolute inset-0 z-10 bg-black/40"></div>
            <div className="relative z-20 max-w-5xl w-full px-4 animate-fade-in flex flex-col items-center">
                <div className="absolute top-6 left-0 right-0 flex justify-between items-center px-8 text-white">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-3xl drop-shadow-md">travel_explore</span>
                        <span className="text-xl font-bold tracking-tight drop-shadow-md">TripC</span>
                    </div>
                </div>
                <div className="flex flex-col items-center w-full max-w-3xl mt-8">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-3 leading-tight drop-shadow-lg">
                        <span className="text-gradient">Your Adventure Awaits</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 font-medium mb-8 max-w-2xl drop-shadow-md">
                        Discover unforgettable experiences, from theme parks to nature escapes.
                    </p>
                    <div className="w-full max-w-xl mx-auto mb-2">
                        <div className="glass-search rounded-full p-1.5 flex items-center transition-all duration-300 group hover:bg-white/25">
                            <div className="pl-4 text-white/70">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-white/70 text-base px-3"
                                placeholder="Search activities..."
                                type="text"
                            />
                            <button className="bg-primary hover:bg-primary-dark text-white rounded-full p-2.5 shadow-lg transition-transform transform active:scale-95 group-hover:scale-105 flex items-center justify-center">
                                <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}
