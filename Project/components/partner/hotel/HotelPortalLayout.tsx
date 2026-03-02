"use client"

import React, { useState } from 'react'
import {
    LayoutDashboard,
    Building2,
    BedDouble,
    Calendar,
    ClipboardList,
    BarChart3,
    Star,
    Settings,
    Menu,
    X,
    DollarSign,
    Users,
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
        id: 'properties',
        label: 'Quản lý Khách sạn',
        icon: Building2,
        children: [
            { id: 'hotel-list', label: 'Danh sách Khách sạn', icon: Building2 },
            { id: 'hotel-details', label: 'Thông tin Chi tiết', icon: Settings }
        ]
    },
    {
        id: 'rooms',
        label: 'Quản lý Phòng',
        icon: BedDouble,
        children: [
            { id: 'room-types', label: 'Loại Phòng', icon: BedDouble },
            { id: 'room-inventory', label: 'Tồn kho Phòng', icon: ClipboardList }
        ]
    },
    {
        id: 'rates',
        label: 'Giá & Khả dụng',
        icon: DollarSign,
        children: [
            { id: 'rate-calendar', label: 'Lịch Giá', icon: Calendar },
            { id: 'rate-management', label: 'Quản lý Giá', icon: DollarSign },
            { id: 'bulk-update', label: 'Cập nhật Hàng loạt', icon: Settings }
        ]
    },
    {
        id: 'bookings',
        label: 'Quản lý Đặt phòng',
        icon: ClipboardList,
        children: [
            { id: 'booking-list', label: 'Danh sách Đặt phòng', icon: ClipboardList },
            { id: 'booking-calendar', label: 'Lịch Đặt phòng', icon: Calendar },
            { id: 'check-in-out', label: 'Check-in/Check-out', icon: Users }
        ]
    },
    {
        id: 'analytics',
        label: 'Phân tích & Báo cáo',
        icon: BarChart3,
        children: [
            { id: 'dashboard-metrics', label: 'Chỉ số Dashboard', icon: BarChart3 },
            { id: 'revenue-report', label: 'Báo cáo Doanh thu', icon: DollarSign },
            { id: 'occupancy-report', label: 'Báo cáo Công suất', icon: BedDouble },
            { id: 'financial-reports', label: 'Báo cáo Tài chính', icon: BarChart3 }
        ]
    },
    {
        id: 'reviews',
        label: 'Đánh giá & Phản hồi',
        icon: Star,
        children: [
            { id: 'reviews-list', label: 'Danh sách Đánh giá', icon: Star },
            { id: 'respond-reviews', label: 'Phản hồi Đánh giá', icon: Bell }
        ]
    },
    {
        id: 'settings',
        label: 'Cài đặt',
        icon: Settings,
        children: [
            { id: 'account-settings', label: 'Thông tin Tài khoản', icon: Users },
            { id: 'notification-settings', label: 'Thông báo', icon: Bell },
            { id: 'payout-settings', label: 'Thanh toán', icon: DollarSign }
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
    const [expandedSections, setExpandedSections] = useState<string[]>(['properties', 'bookings'])

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    // Force light-mode override — the root html element may have `dark` class globally
    // We use a CSS `light` color-scheme wrapper to override dark mode inside this portal only
    return (
        <div className="light-portal" style={{ colorScheme: 'light' }}>
            <div className="min-h-screen bg-[#fcfaf8] flex">
                {/* Sidebar */}
                <aside className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-white border-r border-slate-200
                transition-all duration-300 fixed h-screen z-40
            `}>
                    <div className="p-4 border-b border-slate-200 flex items-center justify-between">
                        {isSidebarOpen && (
                            <h2 className="text-xl font-bold text-slate-900">
                                Hotel Portal
                            </h2>
                        )}
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                            {isSidebarOpen ? (
                                <X className="w-5 h-5 text-slate-600" />
                            ) : (
                                <Menu className="w-5 h-5 text-slate-600" />
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
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-slate-600 hover:bg-slate-100'
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
                                                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                                                        : 'text-slate-500 hover:bg-slate-50'
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
        </div>
    )
}
