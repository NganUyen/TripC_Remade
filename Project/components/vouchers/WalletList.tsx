"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Ticket, Hotel, Plane, Gift, Music, Tag, Calendar, CheckCircle } from 'lucide-react'

// Types based on Wallet API response
interface UserVoucher {
    id: string
    status: 'AVAILABLE' | 'USED' | 'EXPIRED'
    acquired_at: string
    used_at: string | null
    voucher: {
        id: string
        code: string
        voucher_type: string
        discount_value: number
        min_spend: number
        description?: string
        global_expiry: string | null
    }
}

function TicketIcon({ category, className }: { category: string, className?: string }) {
    const lower = category?.toLowerCase() || ''
    if (lower.includes('hotel')) return <Hotel className={className} />
    if (lower.includes('flight') || lower.includes('transport')) return <Plane className={className} />
    if (lower.includes('wellness') || lower.includes('spa')) return <Gift className={className} />
    if (lower.includes('entertainment') || lower.includes('concert')) return <Music className={className} />
    return <Tag className={className} />
}

function getVoucherColor(type: string): string {
    const lower = type?.toLowerCase() || ''
    if (lower.includes('hotel')) return 'bg-blue-500'
    if (lower.includes('transport')) return 'bg-indigo-500'
    if (lower.includes('wellness')) return 'bg-emerald-500'
    if (lower.includes('entertainment')) return 'bg-rose-500'
    return 'bg-slate-500'
}

export function WalletList() {
    const [userVouchers, setUserVouchers] = useState<UserVoucher[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchWallet = async () => {
            try {
                const res = await fetch('/api/v1/vouchers/wallet')
                if (res.ok) {
                    const data = await res.json()
                    setUserVouchers(data.vouchers || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchWallet()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        )
    }

    if (userVouchers.length === 0) {
        return (
            <div className="w-full bg-slate-50 dark:bg-[#18181b] rounded-[2rem] p-12 flex flex-col items-center justify-center text-center border border-dashed border-slate-300 dark:border-zinc-800">
                <Ticket className="w-12 h-12 text-slate-300 dark:text-zinc-600 mb-4" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Your wallet is empty</h3>
                <p className="text-slate-500 text-sm">Purchased vouchers will appear here.</p>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">My Vouchers</h2>
                <span className="text-slate-400 font-medium text-sm">{userVouchers.length} items</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userVouchers.map((item) => (
                    <motion.div
                        layout
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group shadow-sm hover:shadow-lg transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-6 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${getVoucherColor(item.voucher.voucher_type)} text-white flex items-center justify-center shadow-lg`}>
                                <TicketIcon category={item.voucher.voucher_type} className="w-6 h-6" />
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${item.status === 'AVAILABLE' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' :
                                item.status === 'USED' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400' :
                                    'bg-red-100 text-red-500'
                                }`}>
                                {item.status}
                            </span>
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{item.voucher.code}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{item.voucher.voucher_type}</p>

                            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 dark:border-white/5 pt-4">
                                <div className="flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>
                                        Expires {item.voucher.global_expiry
                                            ? new Date(item.voucher.global_expiry).toLocaleDateString()
                                            : 'Never'
                                        }
                                    </span>
                                </div>
                                {item.status === 'AVAILABLE' && (
                                    <div className="ml-auto flex items-center gap-1 text-[#FF5E1F] cursor-pointer hover:underline">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        <span>Use Now</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
