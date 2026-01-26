import React from 'react'
import Image from 'next/image'
import { Calendar, User, RefreshCw, Clock } from 'lucide-react'

interface BookingCardProps {
    title: string
    category: string
    date: string
    peopleCount?: string
    imageSrc: string
    status: string
    price?: number
    currency?: string
}

const statusConfig: Record<string, { label: string, color: string }> = {
    confirmed: { label: 'Đã xác nhận', color: 'bg-green-500/80' },
    pending: { label: 'Chờ thanh toán', color: 'bg-yellow-500/80' },
    cancelled: { label: 'Đã hủy', color: 'bg-red-500/80' },
    completed: { label: 'Hoàn thành', color: 'bg-blue-500/80' },
    held: { label: 'Chờ giữ chỗ', color: 'bg-orange-500/80' },
}

export default function BookingCard({
    title,
    category,
    date,
    peopleCount,
    imageSrc,
    status,
    price,
    currency = 'VND'
}: BookingCardProps) {
    const config = statusConfig[status] || { label: status, color: 'bg-slate-500/80' };

    return (
        <div className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu h-full">
            <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow p-5 flex flex-col">
                <div className="relative rounded-2xl overflow-hidden aspect-video mb-5 group-hover:scale-[1.02] transition-transform duration-500">
                    <img
                        src={imageSrc}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-500 grayscale-[0.3] group-hover:grayscale-0"
                    />
                    <div className={`absolute top-3 right-3 ${config.color} backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10`}>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                </div>
                <div className="px-1 flex-1">
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-500 mb-1.5 uppercase tracking-wider">{category}</p>
                    <h4 className="text-xl font-bold mb-3 text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#FF5E1F] transition-colors">{title}</h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mb-6">
                        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                            <Calendar size={14} className="text-slate-400" />
                            {date}
                        </div>
                        {peopleCount && (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md">
                                <User size={14} className="text-slate-400" />
                                {peopleCount}
                            </div>
                        )}
                        {price && (
                            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/50 px-2 py-1 rounded-md ml-auto">
                                <span className="font-bold text-primary">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(price)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-auto relative z-10">
                    {status === 'pending' || status === 'held' ? (
                        <button className="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-full bg-[#FF5E1F] text-white hover:bg-[#FF5E1F]/90 transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/20">
                            Thanh toán ngay
                        </button>
                    ) : (
                        <button className="w-full py-3.5 flex items-center justify-center gap-2 font-bold text-sm rounded-full border-2 border-[#FF5E1F] text-[#FF5E1F] hover:bg-[#FF5E1F] hover:text-white transition-all duration-300 active:scale-95 shadow-lg shadow-orange-500/10">
                            <RefreshCw size={18} />
                            Đặt lại ngay
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}
