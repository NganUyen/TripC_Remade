import { Heart, Star, MapPin, Clock } from 'lucide-react'

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
        // 1. Outer Wrapper (The Mover)
        <div
            className="group relative hover:-translate-y-1 transition-transform duration-300 transform-gpu animate-fade-in-up h-full"
            style={{ animationDelay: `${staggerIndex * 100}ms` }}
        >
            {/* 2. Inner Container (The Shell) */}
            <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow flex flex-col">
                {/* 3. Content */}
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
                        <Heart size={20} />
                    </button>
                    {tags?.map((tag, i) => (
                        <div key={i} className={`absolute ${i === 0 ? 'top-4 left-4' : 'bottom-2 left-2'} px-3 py-1 ${tag.color === 'bg-blue-500' ? 'bg-emerald-500' : (tag.color || 'bg-[#FF5E1F]')} text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg backdrop-blur-sm`}>
                            {tag.text}
                        </div>
                    ))}
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-2">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{category}</div>
                        <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md">
                            <Star size={12} fill="currentColor" strokeWidth={0} /> {rating} ({reviews})
                        </div>
                    </div>
                    <h3 className="font-bold text-lg leading-tight mb-2 text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">{title}</h3>
                    <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <MapPin size={14} /> {location}
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <Clock size={14} /> {duration}
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col">
                            {originalPrice && <span className="text-xs text-slate-400 line-through">${originalPrice}</span>}
                            <span className="text-lg font-bold text-emerald-500">${price}</span>
                        </div>
                        <button className="bg-[#FF5E1F] hover:bg-orange-600 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md shadow-orange-500/20 transform group-hover:scale-105 transition-all duration-300">
                            Book Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
