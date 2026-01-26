import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, X, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'
import { fadeInUp } from './shared'

function TcentIcon({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
            <circle cx="12" cy="12" r="10" fill="currentColor" fillOpacity="0.2" />
            <path d="M12 6v12M8.5 8.5h7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
    )
}

interface LedgerEntry {
    id: string
    amount: number
    transaction_type: string
    status: string
    description: string
    created_at: string
}

export interface BalanceHeaderProps {
    tcent_balance: number
    membership_tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'
    tcent_pending: number
}

function HistoryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [history, setHistory] = useState<LedgerEntry[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen) {
            setLoading(true)
            fetch('/api/v1/ledger/history')
                .then(res => res.ok ? res.json() : { history: [] })
                .then(data => setHistory(data.history || []))
                .catch(err => console.error(err))
                .finally(() => setLoading(false))
        }
    }, [isOpen])

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full md:w-[600px] h-[80vh] md:h-[700px] bg-white dark:bg-[#18181b] rounded-3xl shadow-2xl overflow-hidden flex flex-col z-10"
                    >
                        <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md sticky top-0 z-10">
                            <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
                                <Clock className="w-5 h-5 text-[#FF5E1F]" />
                                Tcent History
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors text-slate-500 dark:text-slate-400">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-black/20">
                            {loading ? (
                                <div className="h-40 flex items-center justify-center">
                                    <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
                                </div>
                            ) : history.length === 0 ? (
                                <div className="text-center py-12 text-slate-400 text-sm">No transactions yet</div>
                            ) : (
                                history.map((item) => (
                                    <div key={item.id} className="bg-white dark:bg-white/5 p-4 rounded-2xl flex items-center justify-between shadow-sm border border-slate-100 dark:border-white/5 group hover:border-[#FF5E1F]/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.amount > 0
                                                ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                                                }`}>
                                                {item.amount > 0 ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-900 dark:text-white text-sm">{item.description || 'Transaction'}</p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">{new Date(item.created_at).toLocaleDateString()} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                            </div>
                                        </div>
                                        <div className={`font-mono font-bold ${item.amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-slate-900 dark:text-white'
                                            }`}>
                                            {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

export function BalanceHeader({ tcent_balance, membership_tier, tcent_pending }: BalanceHeaderProps) {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    const tierMultiplier = membership_tier === 'PLATINUM' ? 2.0 :
        membership_tier === 'GOLD' ? 1.5 :
            membership_tier === 'SILVER' ? 1.2 : 1.0

    return (
        <>
            <motion.div variants={fadeInUp} className="relative overflow-hidden rounded-[2rem] p-8 mb-6 bg-gradient-to-br from-orange-400 via-orange-500 to-amber-500 dark:from-orange-600 dark:to-amber-700 shadow-xl shadow-orange-500/20 group">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 mix-blend-overlay" />
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-pulse-slow" />

                {/* History Button */}
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 z-20"
                    title="View History"
                >
                    <Clock className="w-5 h-5" />
                </button>

                <div className="relative z-10 text-white">
                    <div className="flex items-center gap-2 mb-2 opacity-90">
                        <TcentIcon className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-wide uppercase"></span>
                    </div>
                    <h1 className="text-5xl font-black mb-4 tracking-tight">{tcent_balance?.toLocaleString() ?? 0}</h1>
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold border border-white/20">
                            {membership_tier} Member • {tierMultiplier}x
                        </span>
                        {tcent_pending > 0 && (
                            <span className="text-xs font-medium opacity-80">
                                {tcent_pending} Pending
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>

            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        </>
    )
}
