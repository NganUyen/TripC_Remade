import Link from 'next/link'
import { MapPin, Star } from 'lucide-react'

interface DestinationCardProps {
    image: string
    location: string
    country: string
    title: string
    rating: string
    description: string
    price: string
    tags?: { text: string, icon?: string, color?: string }[]
    link?: string
}

export function DestinationCard({
    image,
    country,
    title,
    rating,
    description,
    price,
    tags,
    link = "#"
}: DestinationCardProps) {
    const CardContent = (
        <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
            style={{ WebkitMaskImage: '-webkit-radial-gradient(white, black)' }}
        >
            {/* 3. Content */}
            <div className="relative h-56 overflow-hidden shrink-0">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {tags?.map((tag, i) => (
                    <div key={i} className="absolute top-4 right-4 bg-white/95 dark:bg-black/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 dark:text-white shadow-sm border border-white/10 flex items-center gap-1">
                        {tag.icon && <span className={`text-xs ${tag.color || ''}`}>{tag.text}</span>}
                        {!tag.icon && tag.text}
                    </div>
                ))}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                    <div className="flex items-center gap-1 text-white">
                        <MapPin size={14} className="text-white" />
                        <span className="text-xs font-medium">{country}</span>
                    </div>
                </div>
            </div>
            <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">{title}</h3>
                    <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded-md">
                        <Star size={12} fill="currentColor" strokeWidth={0} />
                        <span className="text-xs font-bold">{rating}</span>
                    </div>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{description}</p>
                <div className="flex items-center justify-between mt-auto">
                    <div className="text-slate-900 dark:text-white font-bold">
                        ${price} <span className="text-slate-400 text-xs font-normal">/ person</span>
                    </div>
                    <button className="px-4 py-2 rounded-full bg-[#FF5E1F] text-white font-bold text-xs hover:bg-orange-600 shadow-lg shadow-orange-500/20 transition-colors">Book Now</button>
                </div>
            </div>
        </div>
    );

    return (
        // 1. Outer Wrapper (The Mover)
        <div className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu">
            {link.startsWith('http') ? (
                <a href={link} target="_blank" rel="noopener noreferrer">{CardContent}</a>
            ) : (
                <Link href={link}>{CardContent}</Link>
            )}
        </div>
    )
}
