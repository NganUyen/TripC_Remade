import React from 'react'
import Image from 'next/image'

interface BookingCardProps {
    title: string
    category: string
    date: string
    peopleCount: string
    imageSrc: string
    status?: string
}

export default function BookingCard({
    title,
    category,
    date,
    peopleCount,
    imageSrc,
    status = 'Đã hủy'
}: BookingCardProps) {
    return (
        <div className="booking-card group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-5 relative flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-slate-900/50 hover:border-slate-200 dark:hover:border-slate-700">
            <div className="card-content transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-5 group-hover:scale-[1.02] transition-transform duration-500">
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover transition-all duration-500 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    <div className="absolute top-3 right-3 bg-slate-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">{status}</span>
                    </div>
                </div>
                <div className="px-1">
                    <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-1.5 uppercase tracking-wide">{category}</p>
                    <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF5E1F] transition-colors">{title}</h4>
                    <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[16px]">calendar_month</span>
                            {date}
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                            <span className="material-symbols-outlined text-[16px]">person</span>
                            {peopleCount}
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-auto relative z-10">
                <button className="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-xl border-2 border-[#FF5E1F] text-[#FF5E1F] dark:text-[#FF5E1F] hover:bg-[#FF5E1F] hover:text-white dark:hover:text-white transition-all duration-300 active:scale-[0.98]">
                    <span className="material-symbols-outlined text-xl">replay</span>
                    Đặt lại ngay
                </button>
            </div>
        </div>
    )
}
