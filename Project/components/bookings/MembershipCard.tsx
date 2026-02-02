import React from 'react'
import { QrCode, Loader2 } from 'lucide-react'
import { useCurrentUser } from '@/lib/hooks/useCurrentUser'

export default function MembershipCard() {
    const { supabaseUser, isLoading } = useCurrentUser()

    if (isLoading) {
        return (
            <div className="col-span-12 lg:col-span-5 h-[240px] metallic-card rounded-[2rem] p-8 flex items-center justify-center animate-pulse">
                <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
        )
    }

    // Format membership ID (chunks of 4)
    const memberId = supabaseUser?.id
        ? supabaseUser.id.toUpperCase().slice(0, 12).match(/.{1,4}/g)?.join(" ")
        : "N/A"

    // Tier Gradients
    const tierGradients: Record<string, string> = {
        BRONZE: "linear-gradient(135deg, #78350f 0%, #92400e 50%, #78350f 100%)", // Amber/Bronze
        SILVER: "linear-gradient(135deg, #3f3f46 0%, #52525b 50%, #3f3f46 100%)", // Zinc/Silver
        GOLD: "linear-gradient(135deg, #854d0e 0%, #a16207 50%, #854d0e 100%)",   // Yellow/Gold (Darkened for white text)
        PLATINUM: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" // Slate/Platinum
    }

    const currentTier = supabaseUser?.membership_tier || "BRONZE"
    const cardBackground = tierGradients[currentTier] || tierGradients["PLATINUM"]

    return (
        // 1. Outer Wrapper (The Mover)
        <div className="col-span-12 lg:col-span-5 group hover:-translate-y-1 transition-transform duration-300 transform-gpu cursor-pointer">
            {/* 2. Inner Container (The Shell) */}
            <div
                className="relative h-full metallic-card rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-2xl transition-shadow overflow-hidden"
                style={{ background: cardBackground }}
            >
                {/* 3. Content */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1 font-bold">Thành viên</p>
                        <h2 className="text-3xl font-bold tracking-tight uppercase">
                            {currentTier} ELITE
                        </h2>
                    </div>
                    <div className="bg-white p-2 rounded-xl">
                        <div className="w-12 h-12 bg-slate-900 rounded flex items-center justify-center">
                            <QrCode size={30} className="text-white" />
                        </div>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex justify-between items-end">
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">ID Thành viên</p>
                            <p className="font-mono text-lg tracking-widest">{memberId}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Tích lũy</p>
                            <p className="text-xl font-bold">
                                {supabaseUser?.tcent_balance?.toLocaleString() || 0} <span className="text-sm font-normal text-white/60">Pts</span>
                            </p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white/60 rounded-full transition-all duration-1000"
                            style={{ width: `${Math.min(((supabaseUser?.tcent_balance || 0) / 10000) * 100, 100)}%` }}
                        ></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
