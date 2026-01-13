import Link from 'next/link'

interface DestinationCardProps {
    image: string
    location: string
    country: string
    title: string
    rating: string
    description: string
    price: string
    tags?: { text: string, icon?: string, color?: string }[]
}

export function DestinationCard({
    image,
    location,
    country,
    title,
    rating,
    description,
    price,
    tags
}: DestinationCardProps) {
    return (
        // Outer wrapper: Handles hover transform only
        <div className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu">
            {/* Inner card: Handles clipping, background, border, shadow */}
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-subtle hover:shadow-xl transition-shadow duration-300 border border-slate-100 dark:border-slate-700 h-full flex flex-col relative"
                style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
            >
                <div className="relative h-56 overflow-hidden shrink-0">
                    <img
                        src={image}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        data-location={location}
                    />
                    {tags?.map((tag, i) => (
                        <div key={i} className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1">
                            {tag.icon && <span className={`material-symbols-outlined text-xs ${tag.color || ''}`}>{tag.icon}</span>}
                            {tag.text}
                        </div>
                    ))}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                        <div className="flex items-center gap-1 text-white">
                            <span className="material-symbols-outlined text-sm">location_on</span>
                            <span className="text-xs font-medium">{country}</span>
                        </div>
                    </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-primary transition-colors">{title}</h3>
                        <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md">
                            <span className="material-symbols-outlined text-sm">star</span>
                            <span className="text-xs font-bold">{rating}</span>
                        </div>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{description}</p>
                    <div className="flex items-center justify-between mt-auto">
                        <div className="text-slate-900 dark:text-white font-bold">
                            ${price} <span className="text-slate-400 text-xs font-normal">/ person</span>
                        </div>
                        <button className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold text-xs hover:bg-primary hover:text-white transition-colors">Book Now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
