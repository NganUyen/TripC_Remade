"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Ticket, Hotel, Plane, Gift, Music, Tag } from 'lucide-react'
import { Voucher } from '../rewards/shared'
import { VoucherDrawer } from '../rewards/VoucherSection'

// Duplicate helper for now to avoid cross-component deep imports/exports issues if not set up for shared utils
function TcentIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 6v12M8.5 8.5h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
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

export function MarketplaceList() {
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null)

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const res = await fetch('/api/v1/vouchers/marketplace')
                if (res.ok) {
                    const data = await res.json()
                    setVouchers(data.vouchers || [])
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchVouchers()
    }, [])

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
            </div>
        )
    }

    if (vouchers.length === 0) {
        return (
            <div className="w-full bg-white dark:bg-[#18181b] rounded-[2rem] p-12 md:p-24 flex flex-col items-center justify-center text-center border border-slate-100 dark:border-zinc-800 shadow-sm relative overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-slate-100 dark:bg-zinc-800 rounded-full blur-3xl opacity-50"></div>
                <div className="relative z-10">
                    <div className="w-20 h-20 bg-slate-50 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                        <Ticket className="w-10 h-10 text-slate-300 dark:text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">No active vouchers</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-8">
                        Check back later for new deals and rewards.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black text-[#1c140d] dark:text-white">Gift Cards & Vouchers</h2>
                <span className="text-slate-400 font-medium text-sm">Showing {vouchers.length} results</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vouchers.map((voucher) => (
                    <motion.div
                        layout
                        key={voucher.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-white/5 rounded-[2rem] p-6 border border-slate-100 dark:border-white/5 relative overflow-hidden group hover:shadow-xl transition-shadow"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`w-14 h-14 rounded-2xl ${getVoucherColor(voucher.voucher_type)} text-white flex items-center justify-center shadow-lg`}>
                                <TicketIcon category={voucher.voucher_type} className="w-7 h-7" />
                            </div>
                            <button
                                onClick={() => setSelectedVoucher(voucher)}
                                className="px-5 py-2.5 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-colors"
                            >
                                Redeem
                            </button>
                        </div>

                        <div className="relative z-10">
                            <h3 className="font-bold text-xl text-slate-900 dark:text-white mb-1">{voucher.code}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">{voucher.voucher_type} • Min Spend {voucher.min_spend}</p>
                            <div className="flex items-center gap-2 text-[#FF5E1F] font-bold">
                                <TcentIcon className="w-5 h-5" />
                                <span className='text-lg'>{voucher.tcent_price?.toLocaleString()}</span>
                            </div>
                        </div>

                        <div className={`absolute -bottom-10 -right-10 w-48 h-48 rounded-full opacity-10 ${getVoucherColor(voucher.voucher_type)} blur-3xl group-hover:opacity-20 transition-opacity`} />
                    </motion.div>
                ))}
            </div>

            <VoucherDrawer
                voucher={selectedVoucher}
                onClose={() => setSelectedVoucher(null)}
            />
        </div>
    )
}
