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
        <div className="cancelled-card group bg-white border border-slate-100 rounded-[2rem] p-6 relative flex flex-col h-full overflow-hidden">
            <div className="card-content opacity-40 blur-[0.5px] transition-all duration-500">
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-5">
                    <Image
                        src={imageSrc}
                        alt={title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover grayscale-[0.5]"
                    />
                    <div className="absolute top-4 right-4 bg-slate-900/50 backdrop-blur-md px-3 py-1 rounded-full text-white text-[10px] font-bold uppercase tracking-widest">{status}</div>
                </div>
                <p className="text-xs font-medium text-slate-400 mb-1">{category}</p>
                <h4 className="text-xl font-bold mb-2">{title}</h4>
                <div className="flex items-center gap-4 text-xs text-slate-500 mb-6">
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_month</span>
                        {date}
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span>
                        {peopleCount}
                    </div>
                </div>
            </div>
            <div className="mt-auto pt-4 relative z-10">
                <button className="rebook-btn pill-button w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm bg-white transition-all">
                    <span className="material-symbols-outlined text-lg leading-none">replay</span>
                    Đặt lại ngay
                </button>
            </div>
        </div>
    )
}
