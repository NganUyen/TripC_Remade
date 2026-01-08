'use client'

interface BeautyActivityCardProps {
    image: string
    title: string
    location: string
    rating: string
    price: string
    originalPrice?: string
    discount?: string
    priceLabel?: string
    badges?: { text: string, colorClass: string, icon?: string, iconColor?: string }[]
}

export function BeautyActivityCard({
    image,
    title,
    location,
    rating,
    price,
    originalPrice,
    discount,
    priceLabel,
    badges
}: BeautyActivityCardProps) {
    return (
        <div className="flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-slate-100 dark:border-slate-800/50 h-full">
            <div className="relative aspect-[4/3] overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-700"
                    style={{ backgroundImage: `url('${image}')` }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60"></div>

                {badges && badges.length > 0 && (
                    <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                        {badges.map((badge, i) => (
                            <span key={i} className={`${badge.colorClass} text-white text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm`}>
                                {badge.icon && <span className={`material-symbols-outlined text-[14px] ${badge.iconColor || ''}`}>{badge.icon}</span>}
                                {badge.text}
                            </span>
                        ))}
                    </div>
                )}

                <div className="absolute top-3 right-3 flex items-center gap-2">
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white text-slate-700 hover:text-primary transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">share</span>
                    </button>
                    <button className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white text-slate-700 hover:text-red-500 transition-colors shadow-sm">
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                    </button>
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1 gap-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-slate-800 dark:text-slate-200 bg-yellow-50 dark:bg-yellow-900/30 px-1.5 py-1 rounded-md shrink-0 border border-yellow-200 dark:border-yellow-700/50">
                        <span className="material-symbols-outlined text-[14px] text-yellow-500 font-variation-settings-'FILL'1">star</span>
                        {rating}
                    </div>
                </div>

                <p className="text-slate-500 dark:text-slate-400 text-xs font-medium flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">location_on</span>
                    {location}
                </p>

                <div className="mt-auto pt-3 flex items-end justify-between border-t border-slate-100 dark:border-slate-800/50">
                    <div className="flex flex-col">
                        {(originalPrice || discount) ? (
                            <div className="flex items-center gap-2">
                                {originalPrice && <span className="text-xs text-slate-400 font-medium line-through">${originalPrice}</span>}
                                {discount && <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">{discount}</span>}
                            </div>
                        ) : (
                            priceLabel && <span className="text-xs text-slate-400 font-medium mb-0.5">{priceLabel}</span>
                        )}
                        <span className="text-xl font-extrabold text-primary">${price}</span>
                    </div>
                    <button className="bg-primary hover:bg-primary-dark text-white text-sm font-bold px-4 py-2 rounded-full transition-all duration-300 hover:shadow-glow active:scale-95 shadow-md">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}
