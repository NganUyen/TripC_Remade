import React from 'react'

export default function QuickAccessLinks() {
    return (
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-4">
            <h3 className="text-lg font-bold px-2 text-slate-900 dark:text-white">Truy cập nhanh</h3>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-[#FF5E1F]/30 dark:hover:border-[#FF5E1F]/30 transition-all hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-500/10 text-[#FF5E1F] flex items-center justify-center group-hover:bg-[#FF5E1F] group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined icon-stroke text-2xl">hotel</span>
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">Khách sạn</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Ưu đãi đến 40%</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-600 group-hover:text-[#FF5E1F] transition-colors">chevron_right</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-blue-400/30 transition-all hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined icon-stroke text-2xl">flight</span>
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-blue-500 transition-colors">Chuyến bay</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Vé rẻ mỗi ngày</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-600 group-hover:text-blue-500 transition-colors">chevron_right</span>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-5 border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-5 group cursor-pointer hover:border-purple-400/30 transition-all hover:shadow-md">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all duration-300">
                    <span className="material-symbols-outlined icon-stroke text-2xl">auto_fix_high</span>
                </div>
                <div>
                    <p className="font-bold text-slate-900 dark:text-white group-hover:text-purple-500 transition-colors">Lên kế hoạch AI</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Tối ưu lịch trình</p>
                </div>
                <span className="material-symbols-outlined ml-auto text-slate-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors">chevron_right</span>
            </div>
        </div>
    )
}
