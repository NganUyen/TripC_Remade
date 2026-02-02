import React from 'react'
import Link from 'next/link'
import { Compass, Map as MapIcon } from 'lucide-react'

export default function InspirationCard() {
    return (
        // 1. Outer Wrapper (The Mover)
        <div className="group hover:-translate-y-1 transition-transform duration-300 transform-gpu h-full">
            {/* 2. Inner Container (The Shell) */}
            <div className="relative h-full bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-shadow overflow-hidden flex items-center justify-center text-center">
                {/* 3. Content */}
                <div className="relative z-10 max-w-sm">
                    <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                        <Compass size={40} className="text-[#FF5E1F]" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Tìm cảm hứng mới?</h3>
                    <p className="text-slate-400 dark:text-slate-400 text-sm mb-8 leading-relaxed">Hãy để AI của TripC gợi ý những địa điểm phù hợp với sở thích du lịch của bạn.</p>
                    <Link href="/">
                        <button className="bg-[#FF5E1F] hover:bg-orange-600 text-white px-10 py-4 rounded-full font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-95">
                            Khám phá ngay
                        </button>
                    </Link>
                </div>
                <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.05] select-none pointer-events-none">
                    <MapIcon size={320} className="text-slate-900 dark:text-white" strokeWidth={1} />
                </div>
            </div>
        </div>
    )
}
