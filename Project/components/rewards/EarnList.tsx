import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Gift, Upload, Loader2, X } from 'lucide-react'
import { Quest, fadeInUp } from './shared'

function SubmitModal({ quest, isOpen, onClose }: { quest: Quest | null, isOpen: boolean, onClose: () => void }) {
    const [evidenceUrl, setEvidenceUrl] = useState('')
    const [notes, setNotes] = useState('')
    const [submitting, setSubmitting] = useState(false)

    if (!isOpen || !quest) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await fetch('/api/v1/quests/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ questId: quest.id, evidenceUrl, notes })
            })

            if (res.ok) {
                window.alert('Evidence submitted successfully! Reward pending review.')
                onClose()
            } else {
                const err = await res.json()
                window.alert(err.error || 'Submission failed')
            }
        } catch (error) {
            window.alert('Network error. Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md p-6 relative"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                        <X className="w-5 h-5" />
                    </button>

                    <h3 className="text-xl font-bold mb-1">{quest.title}</h3>
                    <p className="text-sm text-slate-500 mb-6">Submit evidence to claim {quest.reward_amount} Tcents</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Evidence URL</label>
                            <input
                                type="url"
                                required
                                placeholder="https://..."
                                value={evidenceUrl}
                                onChange={e => setEvidenceUrl(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase mb-1">Notes (Optional)</label>
                            <textarea
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent h-20 resize-none"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {submitting ? 'Submitting...' : 'Submit Claim'}
                        </button>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export function EarnList() {
    const [quests, setQuests] = useState<Quest[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null)

    useEffect(() => {
        const fetchQuests = async () => {
            try {
                const res = await fetch('/api/v1/quests/available')
                if (res.ok) {
                    const data = await res.json()
                    setQuests(data.quests)
                }
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchQuests()
    }, [])

    return (
        <div className="mb-10">
            <div className="flex items-center justify-between mb-6 px-2">
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">How you earn Tcent</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Quests</span>
                </div>
            </div>

            <div className="bg-white dark:bg-white/5 rounded-[2rem] border border-slate-100 dark:border-white/5 overflow-hidden min-h-[100px]">
                {loading ? (
                    <div className="flex items-center justify-center h-32">
                        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                ) : quests.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">No active quests available right now.</div>
                ) : (
                    quests.map((quest, i) => (
                        <motion.div
                            key={quest.id}
                            variants={fadeInUp}
                            className={`p-5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${i !== quests.length - 1 ? 'border-b border-slate-50 dark:border-white/5' : ''}`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                                    <Gift className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">{quest.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{quest.description}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="font-bold text-slate-900 dark:text-white text-sm">+{quest.reward_amount}</span>
                                <button
                                    onClick={() => setSelectedQuest(quest)}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <Upload className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            <SubmitModal
                quest={selectedQuest}
                isOpen={!!selectedQuest}
                onClose={() => setSelectedQuest(null)}
            />
        </div>
    )
}
