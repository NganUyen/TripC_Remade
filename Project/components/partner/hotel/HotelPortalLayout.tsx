"use client"

import React, { useState } from 'react'
import { 
    LayoutDashboard, 
    Hotel, 
    Bed,
    Calendar,
    ShoppingCart,
    DollarSign,
    BarChart3,
    Users,
    Gift,
    Package,
    Settings,
    Menu,
    X,
    TrendingUp,
    MessageSquare,
    Bell
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
        label: 'Vận hành Khách sạn',
        icon: Hotel,
        children: [
            { id: 'hotels', label: 'Cơ sở của tôi', icon: Hotel },
            { id: 'rooms', label: 'Quản lý Phòng', icon: Bed },
            { id: 'calendar', label: 'Lịch vận hành', icon: Calendar },
            { id: 'availability', label: 'Quản lý Trống', icon: Calendar }
        ]
    },
    {
        id: 'reservations',
        label: 'Đặt phòng',
        icon: Calendar,
        children: [
            { id: 'bookings', label: 'Quản lý Đặt phòng', icon: Calendar },
            { id: 'rate-management', label: 'Quản lý Giá', icon: DollarSign },
            { id: 'channel-manager', label: 'Điều phối Kênh', icon: TrendingUp }
        ]
    },
    {
        id: 'commerce',
        label: 'Thương mại điện tử',
        icon: ShoppingCart,
        children: [
            { id: 'products', label: 'Quản lý Sản phẩm', icon: Package },
            { id: 'orders', label: 'Xử lý Đơn hàng', icon: ShoppingCart }
        ]
    },
    {
        id: 'marketing',
        label: 'Marketing & Gamification',
        icon: Gift,
        children: [
            { id: 'loyalty', label: 'Lòng trung thành', icon: Users },
            { id: 'gamification', label: 'Gamification', icon: Gift },
            { id: 'promotions', label: 'Khuyến mãi', icon: Gift }
        ]
    },
    {
        id: 'analytics',
        label: 'Phân tích & Hiệu suất',
        icon: BarChart3,
        children: [
            { id: 'performance', label: 'Quản trị Hiệu suất', icon: BarChart3 },
            { id: 'campaign-analytics', label: 'Phân tích Chiến dịch', icon: TrendingUp }
        ]
    },
    {
        id: 'feedback',
        label: 'Phản hồi & Đánh giá',
        icon: MessageSquare,
        children: [
            { id: 'reviews', label: 'Quản lý Đánh giá', icon: MessageSquare },
            { id: 'reputation', label: 'Quản trị Danh tiếng', icon: BarChart3 }
        ]
    },
    {
        id: 'admin',
        label: 'Quản trị Hệ thống',
        icon: Settings,
        children: [
            { id: 'team', label: 'Quản lý Đội ngũ', icon: Users },
            { id: 'configuration', label: 'Cấu hình Hệ thống', icon: Settings },
            { id: 'notifications', label: 'Trung tâm Thông báo', icon: Bell },
            { id: 'bulk-import', label: 'Nhập dữ liệu hàng loạt', icon: Package }
        ]
    }
]

interface HotelPortalLayoutProps {
    children: React.ReactNode
    activeSection?: string
    onSectionChange?: (section: string) => void
}

export function HotelPortalLayout({ children, activeSection = 'dashboard', onSectionChange }: HotelPortalLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [expandedSections, setExpandedSections] = useState<string[]>(['operations', 'reservations'])

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
                            Hotel Portal
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
