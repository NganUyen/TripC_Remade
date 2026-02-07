"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plane, Hotel, Music, Gift, Loader2 } from 'lucide-react'
import { Voucher } from './shared'
import { toast } from 'sonner'


// --- Helpers ---

function TcentIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 6v12M8.5 8.5h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}

function TicketIcon({ category, className }: { category: string, className?: string }) {
    // Map voucher_type to icon logic
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

// --- Components ---

export function VoucherDrawer({ voucher, onClose, onRedeemSuccess }: {
    voucher: Voucher | null,
    onClose: () => void,
    onRedeemSuccess?: () => void
}) {
    const [redeeming, setRedeeming] = useState(false)

    const handleRedeem = async () => {
        if (!voucher) return
        setRedeeming(true)
        try {
            const res = await fetch('/api/v1/vouchers/exchange', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ voucherId: voucher.id })
            })

            if (res.ok) {
                const data = await res.json()
                toast.success(`Successfully redeemed ${voucher.code}!`, {
                    description: `New Balance: ${data.newBalance} Tcents`
                })
                onClose()
                // Dispatch custom event to refresh balance instead of page reload
                window.dispatchEvent(new CustomEvent('voucher-redeemed', {
                    detail: { newBalance: data.newBalance }
                }))
                // Also trigger marketplace refresh to hide redeemed voucher
                console.log('[VOUCHER] Dispatching refresh-marketplace event')
                window.dispatchEvent(new Event('refresh-marketplace'))

                // Call parent callback if provided
                if (onRedeemSuccess) {
                    console.log('[VOUCHER] Calling onRedeemSuccess callback')
                    onRedeemSuccess()
                }
            } else {
                const err = await res.json()
                toast.error(err.error || 'Redemption failed')
            }
        } catch (error) {
            toast.error('Network error. Please try again.')
        } finally {
            setRedeeming(false)
        }
    }

    return (
        <AnimatePresence>
            {voucher && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 lg:hidden"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#111] rounded-t-[2.5rem] p-6 pb-10 z-50 shadow-2xl border-t border-slate-100 dark:border-white/10 lg:hidden"
                    >
                        <div className="w-12 h-1 bg-slate-200 dark:bg-white/10 rounded-full mx-auto mb-8" />

                        <div className="flex items-start gap-6 mb-8">
                            <div className={`w-20 h-20 rounded-3xl ${getVoucherColor(voucher.voucher_type)} text-white flex items-center justify-center shadow-lg shrink-0`}>
                                <TicketIcon category={voucher.voucher_type} className="w-10 h-10" />
                            </div>
                            <div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 inline-block">
                                    {voucher.voucher_type}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{voucher.code}</h2>
                                <div className="flex items-center gap-2 text-[#FF5E1F] font-bold text-xl">
                                    <TcentIcon className="w-6 h-6" />
                                    <span>{voucher.tcent_price?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl">
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1">Terms & Conditions</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Valid for 30 days after redemption. Cannot be combined with other offers. Subject to availability.
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={handleRedeem}
                            disabled={redeeming}
                            className="w-full py-4 bg-[#FF5E1F] text-white font-bold rounded-full shadow-xl shadow-orange-500/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                        >
                            {redeeming && <Loader2 className="w-5 h-5 animate-spin" />}
                            {redeeming ? 'Processing...' : 'Confirm Redemption'}
                        </button>
                    </motion.div>

                    {/* Desktop Drawer (Side) */}
                    {/* Desktop Drawer (Side) */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 w-96 bg-white dark:bg-[#111] z-[60] shadow-2xl border-l border-slate-100 dark:border-white/10 hidden lg:flex flex-col"
                    >
                        {/* Static Header with Close Button */}
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex justify-end">
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6 text-slate-500" />
                            </button>
                        </div>

                        {/* Scrollable Content */}
                        <div className="flex-1 overflow-y-auto p-8">
                            <div className={`w-24 h-24 rounded-3xl ${getVoucherColor(voucher.voucher_type)} text-white flex items-center justify-center shadow-xl mb-8 mx-auto`}>
                                <TicketIcon category={voucher.voucher_type} className="w-12 h-12" />
                            </div>

                            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 text-center">{voucher.code}</h2>
                            <p className="text-slate-500 dark:text-slate-400 font-medium mb-6 text-center">
                                Values: {voucher.discount_value} OFF<br />(Min Spend: {voucher.min_spend})
                            </p>

                            <div className="flex items-center justify-center gap-2 text-[#FF5E1F] font-bold text-2xl mb-8">
                                <TcentIcon className="w-8 h-8" />
                                <span>{voucher.tcent_price?.toLocaleString()}</span>
                            </div>

                            <div className="mb-8">
                                <h4 className="font-bold text-slate-900 dark:text-white mb-2">Description</h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    Redeem this voucher to enjoy exclusive benefits on your next trip. This reward is part of the Gold Tier benefits package.
                                </p>
                            </div>
                        </div>

                        {/* Static Footer with Action Button */}
                        <div className="p-6 border-t border-slate-100 dark:border-white/10 bg-white dark:bg-[#111]">
                            <button
                                onClick={handleRedeem}
                                disabled={redeeming}
                                className="w-full py-4 bg-[#FF5E1F] text-white font-bold rounded-full shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                {redeeming && <Loader2 className="w-5 h-5 animate-spin" />}
                                {redeeming ? 'Processing...' : 'Confirm Redemption'}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export function VoucherSection({ onSelect }: { onSelect: (v: Voucher) => void }) {
    const filters = ['All', 'Hotels', 'Transport', 'Wellness', 'Events']
    const [activeFilter, setActiveFilter] = useState('All')
    const [vouchers, setVouchers] = useState<Voucher[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const res = await fetch('/api/v1/vouchers/marketplace')
                if (res.ok) {
                    const data = await res.json()
                    setVouchers(data.vouchers || []) // Ensure array
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchVouchers()
    }, [])

    const filteredVouchers = vouchers.filter(v => {
        if (activeFilter === 'All') return true
        const type = v.voucher_type?.toLowerCase() || ''
        const filter = activeFilter.toLowerCase()

        if (filter === 'transport') return type.includes('transport') || type.includes('flight')
        if (filter === 'hotels') return type.includes('hotel')
        if (filter === 'wellness') return type.includes('wellness') || type.includes('spa')
        if (filter === 'events') return type.includes('event') || type.includes('entertainment') || type.includes('concert')

        // Fallback for strict match (e.g. if we add new filters later)
        // Handle "s" removal only at end for simple plurals
        return type.includes(filter.replace(/s$/, ''))
    })

    return (
        <div className="mb-20">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Redeem E-Vouchers</h2>
                <span className="text-xs font-bold text-[#FF5E1F]">See All</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-4 no-scrollbar px-2">
                {filters.map(filter => (
                    <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeFilter === filter
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                            : 'bg-white dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10'
                            }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
                {loading ? (
                    <div className="col-span-full h-40 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                    </div>
                ) : filteredVouchers.length === 0 ? (
                    <div className="col-span-full p-8 text-center text-slate-500 text-sm">No vouchers available in this category.</div>
                ) : filteredVouchers.map((voucher) => (
                    <motion.div
                        layout
                        key={voucher.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${getVoucherColor(voucher.voucher_type)} text-white flex items-center justify-center shadow-lg`}>
                                <TicketIcon category={voucher.voucher_type} className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => onSelect(voucher)}
                                className="px-4 py-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-colors"
                            >
                                Redeem
                            </button>
                        </div>

                        <div className="relativePath z-10">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{voucher.code}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{voucher.voucher_type} • Min Spend {voucher.min_spend}</p>
                            <div className="flex items-center gap-1.5 text-[#FF5E1F] font-bold">
                                <TcentIcon className="w-4 h-4" />
                                <span className='text-sm'>{voucher.tcent_price?.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 ${getVoucherColor(voucher.voucher_type)} blur-3xl`} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
