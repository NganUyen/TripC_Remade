import React from 'react'

export default function BookingTabs() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Quản lý hành trình</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Theo dõi và quản lý các tour du lịch của bạn</p>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                <button className="whitespace-nowrap px-6 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all">Đã đặt</button>
                <button className="whitespace-nowrap px-6 py-2.5 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-full transition-all">Chờ thanh toán</button>
                <button className="whitespace-nowrap px-6 py-2.5 text-sm font-semibold bg-[#FF5E1F] text-white rounded-full shadow-lg shadow-orange-500/20 transition-all">Đã hủy</button>
            </div>
        </div>
    )
}
