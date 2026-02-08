"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Plane,
    Calendar,
    Route,
    TrendingUp,
    DollarSign,
    Zap,
    Users,
    ClipboardCheck,
    UserCheck,
    BarChart3,
    LineChart,
    PieChart,
    Activity,
    Settings,
    Bell,
    CreditCard,
    ChevronDown,
    ChevronRight,
    Menu,
    X
} from 'lucide-react'

interface FlightPortalLayoutProps {
    children: React.ReactNode
    activeSection: string
    onSectionChange: (section: any) => void
}

const menuSections = [
    {
        id: 'dashboard',
        label: 'Tổng quan',
        icon: LayoutDashboard,
        single: true
    },
    {
        id: 'flights',
        label: 'Chuyến bay',
        icon: Plane,
        items: [
            { id: 'flight-list', label: 'Danh sách' },
            { id: 'flight-schedule', label: 'Lịch bay' },
        ]
    },
    {
        id: 'routes',
        label: 'Tuyến bay',
        icon: Route,
        items: [
            { id: 'route-list', label: 'Quản lý tuyến' },
            { id: 'route-analytics', label: 'Phân tích tuyến' },
        ]
    },
    {
        id: 'pricing',
        label: 'Giá vé',
        icon: DollarSign,
        items: [
            { id: 'pricing-rules', label: 'Quy tắc giá' },
            { id: 'dynamic-pricing', label: 'Giá động' },
        ]
    },
    {
        id: 'bookings',
        label: 'Đặt vé',
        icon: Users,
        items: [
            { id: 'booking-list', label: 'Danh sách đặt vé' },
            { id: 'passenger-management', label: 'Quản lý hành khách' },
            { id: 'check-in-management', label: 'Quản lý check-in' },
        ]
    },
    {
        id: 'analytics',
        label: 'Phân tích',
        icon: BarChart3,
        items: [
            { id: 'analytics-dashboard', label: 'Dashboard' },
            { id: 'revenue-report', label: 'Báo cáo doanh thu' },
            { id: 'capacity-report', label: 'Báo cáo công suất' },
            { id: 'performance-metrics', label: 'Chỉ số hiệu suất' },
        ]
    },
    {
        id: 'settings',
        label: 'Cài đặt',
        icon: Settings,
        items: [
            { id: 'account-settings', label: 'Tài khoản' },
            { id: 'notification-settings', label: 'Thông báo' },
            { id: 'payout-settings', label: 'Thanh toán' },
        ]
    },
]

export default function FlightPortalLayout({ children, activeSection, onSectionChange }: FlightPortalLayoutProps) {
    const [expandedSections, setExpandedSections] = useState<string[]>(['flights'])
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 fixed top-0 left-0 right-0 z-30">
                <div className="h-full px-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            {isSidebarOpen ? (
                                <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            ) : (
                                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                            )}
                        </button>
                        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                            Cổng đối tác hàng không
                        </h1>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.aside
                        initial={{ x: -280 }}
                        animate={{ x: 0 }}
                        exit={{ x: -280 }}
                        transition={{ duration: 0.2 }}
                        className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed left-0 top-16 bottom-0 overflow-y-auto z-20"
                    >
                        <nav className="p-4 space-y-2">
                            {menuSections.map((section) => (
                                <div key={section.id}>
                                    {section.single ? (
                                        <button
                                            onClick={() => onSectionChange(section.id)}
                                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                                                activeSection === section.id
                                                    ? 'bg-primary text-white'
                                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }`}
                                        >
                                            <section.icon className="w-5 h-5" />
                                            <span className="font-medium">{section.label}</span>
                                        </button>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => toggleSection(section.id)}
                                                className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <section.icon className="w-5 h-5" />
                                                    <span className="font-medium">{section.label}</span>
                                                </div>
                                                {expandedSections.includes(section.id) ? (
                                                    <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </button>

                                            <AnimatePresence>
                                                {expandedSections.includes(section.id) && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        transition={{ duration: 0.2 }}
                                                        className="ml-8 mt-1 space-y-1 overflow-hidden"
                                                    >
                                                        {section.items?.map((item) => (
                                                            <button
                                                                key={item.id}
                                                                onClick={() => onSectionChange(item.id)}
                                                                className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-colors ${
                                                                    activeSection === item.id
                                                                        ? 'bg-primary/10 text-primary font-medium'
                                                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                                }`}
                                                            >
                                                                {item.label}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    )}
                                </div>
                            ))}
                        </nav>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main
                className={`pt-16 transition-all duration-200 ${
                    isSidebarOpen ? 'ml-64' : 'ml-0'
                }`}
            >
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    )
}
