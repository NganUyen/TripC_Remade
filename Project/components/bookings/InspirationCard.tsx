import React from 'react'

export default function InspirationCard() {
    return (
        <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-10 border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden relative min-h-[400px] flex items-center justify-center text-center group">
            <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-orange-50 dark:bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-500 ease-out">
                    <span className="material-symbols-outlined text-[#FF5E1F] icon-stroke text-4xl">travel_explore</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">Tìm cảm hứng mới?</h3>
                <p className="text-slate-400 dark:text-slate-400 text-sm mb-8 leading-relaxed">Hãy để AI của TripC gợi ý những địa điểm phù hợp với sở thích du lịch của bạn.</p>
                <button className="pill-button bg-[#FF5E1F] hover:bg-orange-600 text-white px-10 py-4 font-bold text-sm shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-95">
                    Khám phá ngay
                </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] dark:opacity-[0.05] select-none pointer-events-none">
                <span className="material-symbols-outlined text-[20rem] text-slate-900 dark:text-white">map</span>
            </div>
        </div>
    )
}
