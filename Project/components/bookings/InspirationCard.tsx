import React from 'react'

export default function InspirationCard() {
    return (
        <div className="bg-white rounded-[2rem] p-10 border border-slate-100 shadow-sm overflow-hidden relative min-h-[400px] flex items-center justify-center text-center">
            <div className="relative z-10 max-w-sm">
                <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="material-symbols-outlined text-[#FF5E1F] icon-stroke text-4xl">travel_explore</span>
                </div>
                <h3 className="text-2xl font-bold mb-3">Tìm cảm hứng mới?</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">Hãy để AI của TripC gợi ý những địa điểm phù hợp với sở thích du lịch của bạn.</p>
                <button className="pill-button bg-[#FF5E1F] text-white px-10 py-4 font-bold text-sm hover:shadow-[0_8px_30px_rgb(255,94,31,0.4)] transition-all">
                    Khám phá ngay
                </button>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.03] select-none pointer-events-none">
                <span className="material-symbols-outlined text-[20rem]">map</span>
            </div>
        </div>
    )
}
