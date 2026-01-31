"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Flame, Check, Gift, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import confetti from 'canvas-confetti'

interface StreakData {
    current_streak: number
    last_claim_at: string | null
    status: 'AVAILABLE' | 'CLAIMED' | 'MISSED'
}

export function DailyStreak() {
    const [streakData, setStreakData] = useState<StreakData | null>(null)
    const [loading, setLoading] = useState(true)
    const [claiming, setClaiming] = useState(false)

    useEffect(() => {
        checkStatus()
    }, [])

    const checkStatus = async () => {
        try {
            // Can't easily check status without trying to claim in the current design 
            // OR we need a separate GET endpoint.
            // For MVP, let's just use a simple local check or we can modify the API 
            // BUT actually, the prompt logic implies a "Check" then "Claim".
            // Let's implement a quick GET endpoint logic or just rely on local state if persisted.
            // BETTER: Let's create a GET endpoint for reading status.
            // Wait, the plan didn't have a GET endpoint. 
            // Let's create one quickly inline or just assume we fetch it via user profile/status?
            // Actually, let's add a GET route or just use the user status endpoint if we add streak there.
            // For now, let's try to fetch from a new `GET /api/v1/quests/daily/status`. 
            // I'll create that next.
            const res = await fetch('/api/v1/quests/daily/status')
            if (res.ok) {
                const data = await res.json()
                setStreakData(data)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const handleClaim = async () => {
        setClaiming(true)
        try {
            const res = await fetch('/api/v1/quests/daily/claim', { method: 'POST' })
            const data = await res.json()

            if (res.ok) {
                if (data.status === 'CLAIMED') {
                    toast.success(`Streak Claimed! +${data.reward} Tcents`)
                    confetti({
                        particleCount: 100,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#FF5E1F', '#FDBA74', '#FFFFFF']
                    })
                    // Refresh status
                    checkStatus()
                    // Force refresh balance somewhere? We might need a global context refresh event
                    window.location.reload() // Simple brute force for balance update for now
                } else if (data.status === 'ALREADY_CLAIMED') {
                    toast.error('Already claimed today!')
                }
            }
        } catch (error) {
            toast.error('Failed to claim reward')
        } finally {
            setClaiming(false)
        }
    }

    if (loading) return <div className="h-24 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />

    const currentStreak = streakData?.current_streak || 0
    // Check if already claimed today
    const lastClaimDate = streakData?.last_claim_at ? new Date(streakData.last_claim_at).toDateString() : null
    const today = new Date().toDateString()
    const isClaimedToday = lastClaimDate === today

    return (
        <div className="bg-white dark:bg-[#18181b] rounded-3xl p-6 border border-slate-100 dark:border-white/5 shadow-sm relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

            <div className="relative z-10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-500/20 rounded-xl flex items-center justify-center text-[#FF5E1F]">
                            <Flame className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Daily Streak</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Keep it up for 7 days!</p>
                        </div>
                    </div>

                    <button
                        onClick={handleClaim}
                        disabled={isClaimedToday || claiming}
                        className={`px-6 py-2 rounded-full font-bold text-sm transition-all ${isClaimedToday
                                ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 cursor-default'
                                : 'bg-[#FF5E1F] text-white shadow-lg shadow-orange-500/20 hover:scale-105 active:scale-95'
                            }`}
                    >
                        {claiming ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : isClaimedToday ? (
                            <span className="flex items-center gap-1"><Check className="w-4 h-4" /> Claimed</span>
                        ) : (
                            'Claim Reward'
                        )}
                    </button>
                </div>

                {/* Days Grid */}
                <div className="flex justify-between items-center gap-2">
                    {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                        // Logic for active/completed state
                        // This is tricky without knowing exactly "which day of the streak" 
                        // For simplicity, we light up circles up to currentStreak % 7
                        // If streak is 0, nothing.
                        // If streak is 8, it's day 1 of next cycle.

                        const normalizedStreak = currentStreak % 7 === 0 && currentStreak > 0 && isClaimedToday ? 7 : currentStreak % 7
                        const isCompleted = day <= normalizedStreak
                        const isTodayTarget = day === normalizedStreak + 1 && !isClaimedToday
                        const isBigReward = day === 7

                        return (
                            <div key={day} className="flex-1 flex flex-col items-center gap-2">
                                <div
                                    className={`w-full aspect-square rounded-2xl flex items-center justify-center text-sm font-bold border-2 transition-all ${isCompleted
                                            ? 'bg-[#FF5E1F] border-[#FF5E1F] text-white shadow-md shadow-orange-500/20'
                                            : isTodayTarget
                                                ? 'bg-orange-50 dark:bg-orange-500/10 border-[#FF5E1F] border-dashed text-[#FF5E1F] animate-pulse'
                                                : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-300 dark:text-zinc-700'
                                        }`}
                                >
                                    {isCompleted ? (
                                        <Check className="w-4 h-4" />
                                    ) : isBigReward ? (
                                        <Gift className={`w-5 h-5 ${isTodayTarget ? 'text-[#FF5E1F]' : ''}`} />
                                    ) : (
                                        day
                                    )}
                                </div>
                                <span className={`text-[10px] font-bold ${isCompleted || isTodayTarget ? 'text-[#FF5E1F]' : 'text-slate-300 dark:text-zinc-700'}`}>
                                    Day {day}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
