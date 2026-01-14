import React from 'react'

export default function QuickAccessLinks() {
    return (
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold px-2">Truy cập nhanh</h3>
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 text-[#FF5E1F] flex items-center justify-center group-hover:bg-[#FF5E1F] group-hover:text-white transition-all">
                    <span className="material-symbols-outlined icon-stroke text-2xl">hotel</span>
                </div>
                <div>
                    <p className="font-bold">Khách sạn</p>
                    <p className="text-xs text-slate-400">Ưu đãi đến 40%</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-[#FF5E1F] transition-colors">chevron_right</span>
            </div>
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <span className="material-symbols-outlined icon-stroke text-2xl">flight</span>
                </div>
                <div>
                    <p className="font-bold">Chuyến bay</p>
                    <p className="text-xs text-slate-400">Vé rẻ mỗi ngày</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-blue-500 transition-colors">chevron_right</span>
            </div>
            <div className="bg-white rounded-[2rem] p-5 border border-slate-100 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 transition-all">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                    <span className="material-symbols-outlined icon-stroke text-2xl">auto_fix_high</span>
                </div>
                <div>
                    <p className="font-bold">Lên kế hoạch AI</p>
                    <p className="text-xs text-slate-400">Tối ưu lịch trình</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 group-hover:text-purple-500 transition-colors">chevron_right</span>
            </div>
        </div>
    )
}
