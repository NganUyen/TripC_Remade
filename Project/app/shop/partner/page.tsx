"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { usePartnerStore } from '@/store/usePartnerStore'
import { PartnerGuard } from '@/components/shop/partner/shared/PartnerGuard'
import { Clock, Ban, ShieldX } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Partner Portal landing page.
 * - If approved partner -> redirect to dashboard
 * - Otherwise PartnerGuard handles: not signed in, not partner (CTA to apply)
 * - If pending/suspended/banned -> this page shows the appropriate status message
 */
export default function ShopPartnerPage() {
    const { isSignedIn, isLoaded } = useUser()
    const { partner } = usePartnerStore()
    const router = useRouter()

    useEffect(() => {
        if (isLoaded && isSignedIn && partner && partner.status === 'approved') {
            router.replace('/shop/partner/dashboard')
        }
    }, [isLoaded, isSignedIn, partner, router])

    return (
        <PartnerGuard requireApproved={false}>
            {/* PartnerGuard with requireApproved={false} will render children
                for any partner status. We handle pending/suspended/banned here. */}
            {partner?.status === 'pending' && (
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
            )}

            {partner?.status === 'suspended' && (
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
            )}

            {partner?.status === 'banned' && (
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
            )}
        </PartnerGuard>
    )
}
