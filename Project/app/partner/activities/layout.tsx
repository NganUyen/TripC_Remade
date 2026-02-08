
"use client"

import { useUser } from '@clerk/nextjs'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSupabaseClient } from '@/lib/supabase'
import { Store, LayoutDashboard, Ticket, Settings, LogOut, Package } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'

export default function PartnerLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const pathname = usePathname()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = useSupabaseClient()

    useEffect(() => {
        async function checkPartnerStatus() {
            if (!isLoaded) return

            if (!user) {
                router.push('/sign-in')
                return
            }

            const { data: dbUser } = await supabase
                .from('users')
                .select('partner_status')
                .eq('clerk_id', user.id)
                .single()

            if (dbUser?.partner_status === 'approved') {
                setIsAuthorized(true)
            } else {
                router.push('/partner') // Redirect back to selection or 'apply' page
            }
            setIsLoading(false)
        }

        checkPartnerStatus()
    }, [user, isLoaded, router, supabase])

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading Partner Portal...</div>
    }

    if (!isAuthorized) {
        return null
    }

    const navigation = [
        { name: 'Dashboard', href: '/partner/activities/dashboard', icon: LayoutDashboard },
        { name: 'My Activities', href: '/partner/activities', icon: Package },
        { name: 'Bookings', href: '/partner/activities/bookings', icon: Ticket },
        // { name: 'Settings', href: '/partner/activities/settings', icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-2 font-bold text-xl text-primary">
                        <Store className="w-6 h-6" />
                        <span>TripC Partner</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Activities Portal</p>
                </div>

                <nav className="flex-1 p-4 space-y-1">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                    isActive
                                        ? "bg-primary/10 text-primary"
                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50"
                                )}
                            >
                                <item.icon className="w-5 h-5" />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-4 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                    >
                        <LogOut className="w-5 h-5" />
                        Exit Portal
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 md:hidden flex items-center px-4 justify-between">
                    <span className="font-bold">Partner Portal</span>
                    {/* Add mobile menu trigger here if needed */}
                </header>
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    )
}
