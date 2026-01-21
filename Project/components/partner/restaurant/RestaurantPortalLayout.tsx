"use client"

import React, { useState } from 'react'
import { 
    LayoutDashboard, 
    Store, 
    UtensilsCrossed, 
    Table2, 
    ChefHat,
    Calendar,
    ShoppingCart,
    DollarSign,
    BarChart3,
    Users,
    Gift,
    Package,
    Settings,
    Menu,
    X
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
    id: string
    label: string
    icon: React.ElementType
    children?: NavItem[]
}

const navItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard
    },
    {
        id: 'operations',
        label: 'Vận hành Nhà hàng',
        icon: Store,
        children: [
            { id: 'outlets', label: 'Cơ sở của tôi', icon: Store },
            { id: 'menu', label: 'Quản lý Thực đơn', icon: UtensilsCrossed },
            { id: 'tables', label: 'Sơ đồ Bàn', icon: Table2 },
            { id: 'kitchen', label: 'Nhà bếp (KDS)', icon: ChefHat }
        ]
    },
    {
        id: 'orders',
        label: 'Đơn hàng & Doanh thu',
        icon: ShoppingCart,
        children: [
            { id: 'reservations', label: 'Đặt bàn', icon: Calendar },
            { id: 'order-management', label: 'Quản lý Đơn hàng', icon: ShoppingCart },
            { id: 'pricing', label: 'Kiểm soát Giá', icon: DollarSign },
            { id: 'reports', label: 'Báo cáo Tài chính', icon: BarChart3 }
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing & Gamification',
        icon: Gift,
        children: [
            { id: 'loyalty', label: 'Chương trình Hội viên', icon: Users },
            { id: 'gamification', label: 'Gamification', icon: Gift },
            { id: 'promotions', label: 'Khuyến mãi', icon: Gift }
        ]
    },
    {
        id: 'inventory',
        label: 'Kho hàng & Nguyên liệu',
        icon: Package,
        children: [
            { id: 'stock', label: 'Quản lý Nguyên liệu', icon: Package },
            { id: 'recipes', label: 'Công thức món ăn', icon: UtensilsCrossed },
            { id: 'alerts', label: 'Cảnh báo Tồn kho', icon: Settings }
        ]
    },
    {
        id: 'admin',
        label: 'Quản trị & Phân tích',
        icon: Settings,
        children: [
            { id: 'analytics', label: 'Phân tích', icon: BarChart3 },
            { id: 'staff', label: 'Quản lý Đội ngũ', icon: Users },
            { id: 'hardware', label: 'Kết nối Thiết bị', icon: Settings }
        ]
    }
]

interface RestaurantPortalLayoutProps {
    children: React.ReactNode
    activeSection?: string
    onSectionChange?: (section: string) => void
}

export function RestaurantPortalLayout({ children, activeSection = 'dashboard', onSectionChange }: RestaurantPortalLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [expandedSections, setExpandedSections] = useState<string[]>(['operations', 'orders'])

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev => 
            prev.includes(sectionId) 
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    return (
        <div className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
                transition-all duration-300 fixed h-screen z-40
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    {isSidebarOpen && (
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                            Restaurant Portal
                        </h2>
                    )}
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        {isSidebarOpen ? (
                            <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        ) : (
                            <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                        )}
                    </button>
                </div>

                <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
                    {navItems.map((item) => {
                        const Icon = item.icon
                        const isExpanded = expandedSections.includes(item.id)
                        const hasChildren = item.children && item.children.length > 0

                        return (
                            <div key={item.id}>
                                <button
                                    onClick={() => {
                                        if (hasChildren) {
                                            toggleSection(item.id)
                                        } else {
                                            onSectionChange?.(item.id)
                                        }
                                    }}
                                    className={`
                                        w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                        transition-all duration-200
                                        ${activeSection === item.id || (hasChildren && isExpanded)
                                            ? 'bg-primary/10 text-primary'
                                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    {isSidebarOpen && (
                                        <span className="flex-1 text-left font-medium text-sm">
                                            {item.label}
                                        </span>
                                    )}
                                </button>

                                {isSidebarOpen && hasChildren && (
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="ml-8 mt-2 space-y-1 overflow-hidden"
                                            >
                                                {item.children?.map((child) => {
                                                    const ChildIcon = child.icon
                                                    return (
                                                        <button
                                                            key={child.id}
                                                            onClick={() => onSectionChange?.(child.id)}
                                                            className={`
                                                                w-full flex items-center gap-2 px-3 py-2 rounded-lg
                                                                transition-all duration-200 text-sm
                                                                ${activeSection === child.id
                                                                    ? 'bg-primary/10 text-primary font-semibold'
                                                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                }
                                                            `}
                                                        >
                                                            <ChildIcon className="w-4 h-4" />
                                                            <span>{child.label}</span>
                                                        </button>
                                                    )
                                                })}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                )}
                            </div>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`
                flex-1 transition-all duration-300
                ${isSidebarOpen ? 'ml-64' : 'ml-20'}
            `}>
                <div className="p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
