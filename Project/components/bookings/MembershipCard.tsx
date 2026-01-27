import React from 'react'
import { QrCode } from 'lucide-react'

export default function MembershipCard() {
    return (
        // 1. Outer Wrapper (The Mover)
        <div className="col-span-12 lg:col-span-5 group hover:-translate-y-1 transition-transform duration-300 transform-gpu cursor-pointer">
            {/* 2. Inner Container (The Shell) */}
            <div className="relative h-full metallic-card rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-2xl transition-shadow overflow-hidden">
                {/* 3. Content */}
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-1 font-bold">Thành viên</p>
                        <h2 className="text-3xl font-bold tracking-tight">PLATINUM ELITE</h2>
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
                            <p className="font-mono text-lg tracking-widest">8842 9901 2234</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Tích lũy</p>
                            <p className="text-xl font-bold">12,450 <span className="text-sm font-normal text-white/60">Pts</span></p>
                        </div>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-white/60 w-3/4 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
