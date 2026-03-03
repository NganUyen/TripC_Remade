"use client"

import { useUser, useClerk } from '@clerk/nextjs'
import { useEffect } from 'react'
import { Loader2, LogIn, ShieldCheck } from 'lucide-react'
import { motion } from 'framer-motion'

interface PartnerAuthGuardProps {
    children: React.ReactNode
    portalName?: string
}

/**
 * Shared auth guard for all Partner Portal pages.
 * If the user is not signed in, shows a friendly sign-in prompt
 * and triggers the Clerk sign-in modal.
 */
export function PartnerAuthGuard({ children, portalName = "Partner Portal" }: PartnerAuthGuardProps) {
    const { user, isLoaded } = useUser()
    const { openSignIn } = useClerk()

    useEffect(() => {
        // Auto-open sign-in modal if user is not authenticated
        if (isLoaded && !user) {
            openSignIn({ afterSignInUrl: window.location.href })
        }
    }, [isLoaded, user, openSignIn])

    // Loading state
    if (!isLoaded) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    // Not logged in — fallback UI while modal opens
    if (!user) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-black">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-md px-6"
                >
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="w-10 h-10 text-primary" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                        Đăng nhập để tiếp tục
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mb-8">
                        Bạn cần đăng nhập để truy cập <strong>{portalName}</strong>.
                    </p>
                    <button
                        onClick={() => openSignIn({ afterSignInUrl: window.location.href })}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
                    >
                        <LogIn className="w-5 h-5" />
                        Đăng nhập ngay
                    </button>
                </motion.div>
            </div>
        )
    }

    return <>{children}</>
}
