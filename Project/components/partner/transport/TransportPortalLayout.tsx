"use client"

import React, { useState } from 'react'
import {
    LayoutDashboard,
    Bus,
    Route,
    Users,
    Calendar,
    Ticket,
    DollarSign,
    Armchair,
    BarChart3,
    TrendingUp,
    Settings,
    Bell,
    Star,
    Menu,
    X,
    ArrowLeft
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
        label: 'Vận hành',
        icon: Bus,
        children: [
            { id: 'fleet', label: 'Quản lý Đội xe', icon: Bus },
            { id: 'routes', label: 'Quản lý Tuyến đường', icon: Route },
            { id: 'drivers', label: 'Quản lý Tài xế', icon: Users },
            { id: 'schedule', label: 'Lịch vận hành', icon: Calendar }
        ]
    },
    {
        id: 'bookings-group',
        label: 'Đặt chỗ & Giá',
        icon: Ticket,
        children: [
            { id: 'bookings', label: 'Quản lý Đặt chỗ', icon: Ticket },
            { id: 'pricing', label: 'Quản lý Giá', icon: DollarSign },
            { id: 'seats', label: 'Quản lý Ghế', icon: Armchair }
        ]
    },
    {
        id: 'analytics',
        label: 'Phân tích',
        icon: BarChart3,
        children: [
            { id: 'performance', label: 'Hiệu suất', icon: BarChart3 },
            { id: 'revenue', label: 'Doanh thu', icon: TrendingUp }
        ]
    },
    {
        id: 'admin',
        label: 'Quản trị',
        icon: Settings,
        children: [
            { id: 'settings', label: 'Cài đặt', icon: Settings },
            { id: 'notifications', label: 'Thông báo', icon: Bell },
            { id: 'reviews', label: 'Đánh giá', icon: Star }
        ]
    }
]

interface TransportPortalLayoutProps {
    children: React.ReactNode
    activeSection?: string
    onSectionChange?: (section: string) => void
}

export function TransportPortalLayout({ children, activeSection = 'dashboard', onSectionChange }: TransportPortalLayoutProps) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [expandedSections, setExpandedSections] = useState<string[]>(['operations', 'bookings-group'])

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    return (
        <div className="h-screen overflow-hidden bg-[#fcfaf8] dark:bg-[#0a0a0a] flex">
            {/* Sidebar */}
            <aside className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'} 
                bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 
                transition-all duration-300 flex flex-col h-full z-40 flex-shrink-0
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    {isSidebarOpen && (
                        <div className="flex items-center gap-3">
                            <Link href="/partner" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                            </Link>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                                Transport Portal
                            </h2>
                        </div>
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
            <main className="flex-1 overflow-y-auto h-full">
                <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
                    {children}
                </div>
            </main>
        </div>
    )
}
