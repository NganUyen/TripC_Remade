import React from 'react'

interface BookingTabsProps {
    activeTab: 'all' | 'pending' | 'cancelled';
    onTabChange: (tab: 'all' | 'pending' | 'cancelled') => void;
}

export default function BookingTabs({ activeTab, onTabChange }: BookingTabsProps) {
    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Quản lý hành trình</h3>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">Theo dõi và quản lý các tour du lịch của bạn</p>
            </div>
            <div className="flex items-center bg-white dark:bg-slate-900 p-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
                <button
                    onClick={() => onTabChange('all')}
                    className={`whitespace-nowrap px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${activeTab === 'all'
                        ? 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    Đã đặt
                </button>
                <button
                    onClick={() => onTabChange('pending')}
                    className={`whitespace-nowrap px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${activeTab === 'pending'
                        ? 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    Chờ thanh toán
                </button>
                <button
                    onClick={() => onTabChange('cancelled')}
                    className={`whitespace-nowrap px-6 py-2.5 text-sm font-semibold rounded-full transition-all ${activeTab === 'cancelled'
                        ? 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    Đã hủy
                </button>
            </div>
        </div>
    )
}
