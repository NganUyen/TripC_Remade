"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    BarChart3,
    Settings,
    Users,
    Menu,
    X,
    ChevronLeft,
    Store,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePartnerStore } from '@/store/usePartnerStore'

// Skeleton version of sidebar shown during loading
export function PartnerSidebarSkeleton() {
    return (
        <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-screen z-40 flex flex-col animate-pulse">
            {/* Header Skeleton */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>

            {/* Nav Items Skeleton */}
            <nav className="p-4 space-y-2 flex-1">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2.5">
                        <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" />
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </nav>

            {/* Footer Skeleton */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3 px-3 py-2.5">
                    <div className="w-5 h-5 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                </div>
            </div>
        </aside>
    )
}

interface NavItem {
    id: string
    label: string
    icon: React.ElementType
    href: string
    children?: NavItem[]
    permission?: 'products' | 'orders' | 'analytics'
}

const navItems: NavItem[] = [
    {
        id: 'dashboard',
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/shop/partner/dashboard',
    },
    {
        id: 'products',
        label: 'Products',
        icon: Package,
        href: '/shop/partner/products',
        permission: 'products',
    },
    {
        id: 'orders',
        label: 'Orders',
        icon: ShoppingCart,
        href: '/shop/partner/orders',
        permission: 'orders',
    },
    {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        href: '/shop/partner/settings',
        children: [
            { id: 'profile', label: 'Store Profile', icon: Store, href: '/shop/partner/settings' },
            { id: 'team', label: 'Team', icon: Users, href: '/shop/partner/settings/team' },
        ],
    },
]

export function PartnerSidebar() {
    const pathname = usePathname()
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [expandedSections, setExpandedSections] = useState<string[]>(['settings'])
    const { partner } = usePartnerStore()

    const toggleSection = (sectionId: string) => {
        setExpandedSections(prev =>
            prev.includes(sectionId)
                ? prev.filter(id => id !== sectionId)
                : [...prev, sectionId]
        )
    }

    const isActive = (href: string) => {
        // Dashboard: exact match or root partner path
        if (href === '/shop/partner/dashboard') {
            return pathname === href || pathname === '/shop/partner'
        }
        // Settings root: exact match only (not children)
        if (href === '/shop/partner/settings') {
            return pathname === href
        }
        // Other routes: prefix match
        return pathname?.startsWith(href) ?? false
    }

    const hasPermission = (permission?: string) => {
        if (!permission || !partner) return true
        if (partner.role === 'owner') return true
        return partner.permissions?.[permission as keyof typeof partner.permissions] ?? false
    }

    return (
        <aside
            className={`
                ${isSidebarOpen ? 'w-64' : 'w-20'}
                bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
                transition-all duration-300 fixed h-screen z-40 flex flex-col
            `}
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                {isSidebarOpen ? (
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Store className="w-5 h-5 text-primary" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                {partner?.display_name || partner?.business_name || 'Shop Partner'}
                            </h2>
                            <p className="text-xs text-slate-500 truncate">Partner Portal</p>
                        </div>
                    </div>
                ) : (
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                        <Store className="w-5 h-5 text-primary" />
                    </div>
                )}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                >
                    {isSidebarOpen ? (
                        <X className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                        <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-4 space-y-1 overflow-y-auto flex-1">
                {navItems
                    .filter(item => hasPermission(item.permission))
                    .map((item) => {
                        const Icon = item.icon
                        const hasChildren = item.children && item.children.length > 0
                        const isExpanded = expandedSections.includes(item.id)
                        const active = hasChildren
                            ? item.children!.some(c => isActive(c.href))
                            : isActive(item.href)

                        if (hasChildren) {
                            return (
                                <div key={item.id}>
                                    <button
                                        onClick={() => toggleSection(item.id)}
                                        className={`
                                            w-full flex items-center gap-3 px-3 py-2.5 rounded-xl
                                            transition-all duration-200
                                            ${active
                                                ? 'bg-primary/10 text-primary'
                                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                            }
                                        `}
                                    >
                                        <Icon className="w-5 h-5 flex-shrink-0" />
                                        {isSidebarOpen && (
                                            <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                                        )}
                                    </button>

                                    {isSidebarOpen && (
                                        <AnimatePresence>
                                            {isExpanded && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="ml-8 mt-1 space-y-1 overflow-hidden"
                                                >
                                                    {item.children!
                                                        .filter(c => hasPermission(c.permission))
                                                        .map((child) => {
                                                            const ChildIcon = child.icon
                                                            const childActive = isActive(child.href)
                                                            return (
                                                                <Link
                                                                    key={child.id}
                                                                    href={child.href}
                                                                    className={`
                                                                        flex items-center gap-2 px-3 py-2 rounded-lg
                                                                        transition-all duration-200 text-sm
                                                                        ${childActive
                                                                            ? 'bg-primary/10 text-primary font-semibold'
                                                                            : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                                                        }
                                                                    `}
                                                                >
                                                                    <ChildIcon className="w-4 h-4" />
                                                                    <span>{child.label}</span>
                                                                </Link>
                                                            )
                                                        })}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    )}
                                </div>
                            )
                        }

                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                className={`
                                    flex items-center gap-3 px-3 py-2.5 rounded-xl
                                    transition-all duration-200
                                    ${active
                                        ? 'bg-primary/10 text-primary font-semibold'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5 flex-shrink-0" />
                                {isSidebarOpen && (
                                    <span className="flex-1 text-left font-medium text-sm">{item.label}</span>
                                )}
                            </Link>
                        )
                    })}
            </nav>

            {/* Back to Shop */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
                <Link
                    href="/shop"
                    className={`
                        flex items-center gap-3 px-3 py-2.5 rounded-xl
                        text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800
                        transition-all duration-200
                    `}
                >
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    {isSidebarOpen && (
                        <span className="text-sm font-medium">Back to Shop</span>
                    )}
                </Link>
            </div>
        </aside>
    )
}
