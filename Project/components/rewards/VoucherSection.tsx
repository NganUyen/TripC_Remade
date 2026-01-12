"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Tag, Plane, Hotel, Music, Gift } from 'lucide-react'
import { VOUCHERS, Voucher } from './shared'

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
    switch (category) {
        case 'Hotel': return <Hotel className={className} />
        case 'Transport': return <Plane className={className} />
        case 'Wellness': return <Gift className={className} />
        case 'Entertainment': return <Music className={className} />
        default: return <Tag className={className} />
    }
}

// --- Components ---

export function VoucherDrawer({ voucher, onClose }: { voucher: Voucher | null, onClose: () => void }) {
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
                            <div className={`w-20 h-20 rounded-3xl ${voucher.color} text-white flex items-center justify-center shadow-lg shrink-0`}>
                                <TicketIcon category={voucher.category} className="w-10 h-10" />
                            </div>
                            <div>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 inline-block">
                                    {voucher.category}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{voucher.title}</h2>
                                <div className="flex items-center gap-2 text-[#FF5E1F] font-bold text-xl">
                                    <TcentIcon className="w-6 h-6" />
                                    <span>{voucher.cost}</span>
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

                        <button className="w-full py-4 bg-[#FF5E1F] text-white font-bold rounded-full shadow-xl shadow-orange-500/20 active:scale-95 transition-transform">
                            Confirm Redemption
                        </button>
                    </motion.div>

                    {/* Desktop Drawer (Side) */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        className="fixed top-4 right-4 bottom-4 w-96 bg-white dark:bg-[#111] rounded-[2rem] p-8 z-50 shadow-2xl border border-slate-100 dark:border-white/10 hidden lg:flex flex-col"
                    >
                        <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-6 h-6 text-slate-500" />
                        </button>

                        <div className={`w-24 h-24 rounded-3xl ${voucher.color} text-white flex items-center justify-center shadow-xl mb-8`}>
                            <TicketIcon category={voucher.category} className="w-12 h-12" />
                        </div>

                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{voucher.title}</h2>
                        <span className="text-slate-500 dark:text-slate-400 font-medium mb-6">{voucher.description}</span>

                        <div className="flex items-center gap-2 text-[#FF5E1F] font-bold text-2xl mb-8">
                            <TcentIcon className="w-8 h-8" />
                            <span>{voucher.cost}</span>
                        </div>

                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 dark:text-white mb-2">Description</h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                                Redeem this voucher to enjoy exclusive benefits on your next trip. This reward is part of the Gold Tier benefits package.
                            </p>
                        </div>

                        <button className="w-full py-4 bg-[#FF5E1F] text-white font-bold rounded-full shadow-xl shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-transform">
                            Confirm Redemption
                        </button>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

export function VoucherSection({ onSelect }: { onSelect: (v: Voucher) => void }) {
    const filters = ['All', 'Hotels', 'Transport', 'Wellness', 'Events']
    const [activeFilter, setActiveFilter] = useState('All')

    const filteredVouchers = activeFilter === 'All'
        ? VOUCHERS
        : VOUCHERS.filter(v => v.category === activeFilter.replace('s', '')) // Simple singularization match

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVouchers.map((voucher) => (
                    <motion.div
                        layout
                        key={voucher.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white dark:bg-white/5 rounded-[2rem] p-5 border border-slate-100 dark:border-white/5 relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-8 relative z-10">
                            <div className={`w-12 h-12 rounded-2xl ${voucher.color} text-white flex items-center justify-center shadow-lg`}>
                                <TicketIcon category={voucher.category} className="w-6 h-6" />
                            </div>
                            <button
                                onClick={() => onSelect(voucher)}
                                className="px-4 py-2 bg-white/90 dark:bg-black/50 backdrop-blur-sm rounded-full text-xs font-bold text-slate-900 dark:text-white border border-slate-100 dark:border-white/10 hover:bg-slate-50 transition-colors"
                            >
                                Redeem
                            </button>
                        </div>

                        <div className="relativePath z-10">
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">{voucher.title}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">{voucher.description}</p>
                            <div className="flex items-center gap-1.5 text-[#FF5E1F] font-bold">
                                <TcentIcon className="w-4 h-4" />
                                <span>{voucher.cost}</span>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className={`absolute -bottom-10 -right-10 w-40 h-40 rounded-full opacity-10 ${voucher.color} blur-3xl`} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
