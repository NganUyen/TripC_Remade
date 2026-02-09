"use client"

import { useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { usePartnerStore } from '@/store/usePartnerStore'
import { Clock, Ban, ShieldX, Store } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface PartnerGuardProps {
    children: ReactNode
    requiredRole?: 'owner' | 'staff'
    requireApproved?: boolean
    /** Custom skeleton to show while loading - should match the page structure */
    loadingSkeleton?: ReactNode
}

// Dashboard skeleton - matches DashboardView structure
export function DashboardSkeleton() {
    return (
        <div className="space-y-8 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                </div>
                <div className="flex gap-2">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-10 w-20 bg-slate-200 dark:bg-slate-700 rounded-full" />
                    ))}
                </div>
            </div>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5">
                        <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
                        <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
                        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
            {/* Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 h-64" />
                ))}
            </div>
        </div>
    )
}

// Products skeleton - matches ProductList structure
export function ProductsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="h-8 w-28 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
                </div>
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-full" />
            </div>
            {/* Filters */}
            <div className="flex gap-3">
                <div className="flex-1 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-10 w-28 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="w-14 h-14 rounded-xl bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="hidden sm:block space-y-2 text-right">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                            <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Orders skeleton - matches OrderList structure
export function OrdersSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header */}
            <div>
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-700 rounded-lg" />
                <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mt-2" />
            </div>
            {/* Filters */}
            <div className="flex gap-3">
                <div className="h-10 w-36 bg-slate-200 dark:bg-slate-700 rounded-xl" />
                <div className="h-10 w-32 bg-slate-200 dark:bg-slate-700 rounded-xl" />
            </div>
            {/* Table */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-slate-700" />
                        <div className="flex-1 space-y-2">
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded" />
                            <div className="h-3 w-48 bg-slate-200 dark:bg-slate-700 rounded" />
                        </div>
                        <div className="hidden sm:block space-y-2 text-right">
                            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                            <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded ml-auto" />
                        </div>
                        <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Settings skeleton
export function SettingsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-40 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded" />
                        <div className="h-10 w-full bg-slate-200 dark:bg-slate-700 rounded-xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}

// Default skeleton (generic fallback)
function DefaultSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg" />
            <div className="h-4 w-64 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-24 bg-slate-200 dark:bg-slate-700 rounded-2xl" />
                ))}
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 h-64" />
        </div>
    )
}

export function PartnerGuard({
    children,
    requiredRole,
    requireApproved = true,
    loadingSkeleton
}: PartnerGuardProps) {
    const { isSignedIn, isLoaded: clerkLoaded } = useUser()
    const { partner, isLoading, fetchPartner } = usePartnerStore()

    useEffect(() => {
        if (clerkLoaded && isSignedIn) {
            fetchPartner()
        }
    }, [clerkLoaded, isSignedIn, fetchPartner])

    // Clerk still loading OR partner data loading - show skeleton inside layout
    if (!clerkLoaded || isLoading) {
        return loadingSkeleton || <DefaultSkeleton />
    }

    // Not signed in
    if (!isSignedIn) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto p-8"
                >
                    <ShieldX className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Sign In Required</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-6">
                        Please sign in to access the Partner Portal.
                    </p>
                </motion.div>
            </div>
        )
    }

    // Not a partner yet - show CTA
    if (!partner) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg mx-auto p-8"
                >
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                        <Store className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
                        Become a Shop Partner
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                        Start selling your products on TripC Marketplace. Apply now to set up your store,
                        manage products, track orders, and grow your business.
                    </p>
                    <Link
                        href="/shop/partner/onboarding"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover transition-colors shadow-lg shadow-orange-500/20"
                    >
                        Apply Now
                    </Link>
                </motion.div>
            </div>
        )
    }

    // Partner is pending
    if (requireApproved && partner.status === 'pending') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg mx-auto p-8"
                >
                    <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
                        <Clock className="w-10 h-10 text-amber-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        Application Under Review
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                        Your partner application for <strong className="text-slate-700 dark:text-slate-200">{partner.business_name}</strong> is
                        being reviewed. We&apos;ll notify you once it&apos;s approved.
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-medium">
                        <Clock className="w-4 h-4" />
                        Pending Review
                    </div>
                </motion.div>
            </div>
        )
    }

    // Partner is suspended
    if (partner.status === 'suspended') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg mx-auto p-8"
                >
                    <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <Ban className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Account Suspended</h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-2">
                        Your partner account has been suspended.
                    </p>
                    {partner.rejection_reason && (
                        <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 rounded-xl p-4 mt-4">
                            Reason: {partner.rejection_reason}
                        </p>
                    )}
                </motion.div>
            </div>
        )
    }

    // Partner is banned
    if (partner.status === 'banned') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-lg mx-auto p-8"
                >
                    <div className="w-20 h-20 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                        <ShieldX className="w-10 h-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Account Banned</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Your partner account has been permanently banned.
                    </p>
                </motion.div>
            </div>
        )
    }

    // Role check
    if (requiredRole === 'owner' && partner.role !== 'owner') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md mx-auto p-8"
                >
                    <ShieldX className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h2>
                    <p className="text-slate-500 dark:text-slate-400">
                        Only the partner owner can access this section.
                    </p>
                </motion.div>
            </div>
        )
    }

    return <>{children}</>
}
