import React from 'react'

export default function BookingTabs() {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight">Quản lý hành trình</h3>
                <p className="text-slate-400 text-sm">Theo dõi và quản lý các tour du lịch của bạn</p>
            </div>
            <div className="flex items-center bg-white p-1 rounded-full border border-slate-100 shadow-sm">
                <button className="px-6 py-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Đã đặt</button>
                <button className="px-6 py-2 text-sm font-semibold text-slate-400 hover:text-slate-900 transition-colors">Chờ thanh toán</button>
                <button className="px-6 py-2 text-sm font-semibold bg-[#FF5E1F] text-white rounded-full shadow-md transition-shadow">Đã hủy</button>
            </div>
        </div>
    )
}
