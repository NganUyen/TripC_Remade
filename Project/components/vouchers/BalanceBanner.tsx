import { useState, useEffect } from 'react'
import { Wallet, Clock, X, ArrowUpRight, ArrowDownLeft, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface LedgerEntry {
    id: string
    amount: number
    transaction_type: string
    status: string
    description: string
    created_at: string
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

export function BalanceBanner({ balance = 0 }: { balance?: number }) {
    const [isHistoryOpen, setIsHistoryOpen] = useState(false)

    return (
        <>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative w-full overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-600 to-violet-600 p-8 md:p-12 shadow-2xl group"
            >
                {/* Watermark Icon */}
                <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 opacity-10">
                    <Wallet className="w-64 h-64 text-white rotate-12" />
                </div>

                {/* History Button (Same as Rewards page) */}
                <button
                    onClick={() => setIsHistoryOpen(true)}
                    className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-all active:scale-95 border border-white/10 z-20"
                    title="View History"
                >
                    <Clock className="w-5 h-5" />
                </button>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 text-white/80 mb-2 font-medium">
                            <div className="p-1.5 bg-white/20 rounded-full">
                                <Wallet className="w-4 h-4 text-white" />
                            </div>
                            <span>Available Balance</span>
                        </div>
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight">{balance.toLocaleString()} <span className="text-2xl md:text-4xl opacity-50 font-bold">Points</span></h2>
                    </div>

                    {/* Removed Top Up Button, replaced by absolute history button */}
                </div>
            </motion.div>

            <HistoryModal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} />
        </>
    )
}
