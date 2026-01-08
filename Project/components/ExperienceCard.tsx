interface ExperienceCardProps {
    image: string
    category: string
    title: string
    location: string
    duration: string
    price: string
    originalPrice?: string
    rating: string
    reviews: string
    tags?: { text: string, color?: string }[]
    staggerIndex?: number
}

export function ExperienceCard({
    image,
    category,
    title,
    location,
    duration,
    price,
    originalPrice,
    rating,
    reviews,
    tags,
    staggerIndex = 0
}: ExperienceCardProps) {
    return (
        <div
            className={`group relative bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 animate-fade-in-up h-full flex flex-col`}
            style={{ animationDelay: `${staggerIndex * 100}ms` }}
        >
            <div className="relative h-56 w-full overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white font-medium tracking-wide border border-white/50 px-4 py-2 rounded-full backdrop-blur-sm">View Details</span>
                </div>
                <button className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-md hover:bg-white text-white hover:text-red-500 transition-colors z-20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-xl">favorite_border</span>
                </button>
                {tags?.map((tag, i) => (
                    <div key={i} className={`absolute ${i === 0 ? 'top-4 left-4' : 'bottom-2 left-2'} px-3 py-1 ${tag.color || 'bg-blue-500'} text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm`}>
                        {tag.text}
                    </div>
                ))}
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex items-start justify-between mb-2">
                    <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category}</div>
                    <div className="flex items-center gap-1 text-yellow-400 text-xs font-bold">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {rating} ({reviews})
                    </div>
                </div>
                <h3 className="font-display font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">{title}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="material-symbols-outlined text-base">location_on</span> {location}
                    <span className="text-slate-300">•</span>
                    <span className="material-symbols-outlined text-base">schedule</span> {duration}
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex flex-col">
                        {originalPrice && <span className="text-xs text-slate-400 line-through">${originalPrice}</span>}
                        <span className="text-lg font-bold text-price-green">${price}</span>
                    </div>
                    <button className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-orange-500/20 transform group-hover:scale-105 transition-all duration-300">
                        Book Now
                    </button>
                </div>
            </div>
        </div>
    )
}
