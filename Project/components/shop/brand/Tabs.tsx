"use client"

import { LayoutGrid, ShoppingBag, Star, TrendingUp } from 'lucide-react'

interface BrandTabsProps {
    activeTab: string
    onTabChange: (tab: string) => void
}

export function BrandTabs({ activeTab, onTabChange }: BrandTabsProps) {
    const tabs = [
        { id: 'all', label: 'All Products', icon: LayoutGrid },
        { id: 'top_selling', label: 'Top Selling', icon: TrendingUp },
        { id: 'new_arrival', label: 'New Arrivals', icon: ShoppingBag },
        { id: 'high_rating', label: 'Top Rated', icon: Star },
    ]

    return (
        <div className="flex overflow-x-auto pb-2 scrollbar-hide mb-6 gap-2 border-b border-slate-100 dark:border-slate-800">
            {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-t-2xl whitespace-nowrap font-medium text-sm transition-colors border-b-2
                            ${isActive
                                ? 'border-[#FF5E1F] text-[#FF5E1F] bg-white dark:bg-slate-900'
                                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                            }`}
                    >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                )
            })}
        </div>
    )
}
