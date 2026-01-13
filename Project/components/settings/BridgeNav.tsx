"use client"

import { motion } from 'framer-motion'
import { User, Shield, Globe, Bell, CreditCard, Lock } from 'lucide-react'
import { springTransition } from './InternalComponents'

export type SectionId = 'account' | 'security' | 'preferences' | 'notifications' | 'payments' | 'privacy'

export function BridgeNav({ activeSection, setActiveSection }: { activeSection: SectionId, setActiveSection: (id: SectionId) => void }) {
    const navItems = [
        { id: 'account', label: 'Account', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'preferences', label: 'Preferences', icon: Globe },
        { id: 'notifications', label: 'Notifs', icon: Bell },
        { id: 'payments', label: 'Wallet', icon: CreditCard },
        { id: 'privacy', label: 'Privacy', icon: Lock },
    ]

    return (
        <div className="sticky top-20 z-20 w-full bg-[#fcfaf8]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-slate-100 dark:border-white/5 mb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ y: 0, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, ...springTransition }}
                    className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3"
                >
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveSection(item.id as SectionId)}
                                className={`relative px-4 py-3 rounded-full flex items-center gap-2 transition-all shrink-0 ${isActive ? 'text-white' : 'text-slate-500 hover:bg-slate-100'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="activePill"
                                        className="absolute inset-0 bg-[#FF5E1F] rounded-full shadow-md shadow-orange-500/20"
                                        transition={springTransition}
                                    />
                                )}
                                <span className="relative z-10 hidden md:block font-bold text-sm tracking-wide">{item.label}</span>
                                <item.icon className={`relative z-10 w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} strokeWidth={isActive ? 2 : 1.5} />
                            </button>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}
