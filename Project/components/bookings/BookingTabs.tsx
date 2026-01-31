"use client";

import React from 'react'
import { motion } from 'framer-motion'

interface BookingTabsProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export default function BookingTabs({ activeTab, onTabChange }: BookingTabsProps) {
    const tabs = [
        { id: 'all', label: 'Tất cả', icon: 'apps' },
        { id: 'transport', label: 'Di chuyển', icon: 'directions_car' },
        { id: 'hotel', label: 'Khách sạn', icon: 'hotel' },
        { id: 'flight', label: 'Vé máy bay', icon: 'flight' },
        { id: 'shop', label: 'Mua sắm', icon: 'shopping_bag' },
        { id: 'activity', label: 'Sự kiện', icon: 'event' }, // Changed 'events' to 'activity'
        { id: 'other', label: 'Khác', icon: 'more_horiz' },
    ];

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white transition-colors">Quản lý hành trình</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Theo dõi và quản lý các chuyến đi của bạn</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center bg-white dark:bg-zinc-800 p-1 rounded-full shadow-lg border border-slate-100 dark:border-zinc-700 flex-wrap md:flex-nowrap"
            >
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`relative flex items-center gap-2 whitespace-nowrap px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${activeTab === tab.id
                            ? 'text-white'
                            : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                            }`}
                    >
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTabRefined"
                                className="absolute inset-0 bg-slate-900 dark:bg-[#FF5E1F] shadow-md"
                                style={{ borderRadius: 9999 }}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                            />
                        )}
                        <span className="relative z-10 material-symbols-outlined text-[18px]">{tab.icon}</span>
                        <span className="relative z-10">{tab.label}</span>
                    </button>
                ))}
            </motion.div>
        </div>
    )
}
