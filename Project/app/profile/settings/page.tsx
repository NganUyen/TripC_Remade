"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    User, Shield, Globe, CreditCard, Lock,
    ChevronRight, Smartphone,
    Download, Trash2
} from 'lucide-react'
import { SettingsHero } from '@/components/settings/SettingsHero'
import { BridgeNav, SectionId } from '@/components/settings/BridgeNav'
import { StickyRail } from '@/components/settings/StickyRail'
import { SectionCard, InputField, GlassToggle } from '@/components/settings/InternalComponents'

// --- Animation Config ---
// --- Animation Config ---
const tabContentVariants = {
    hidden: { opacity: 0, y: 10, filter: 'blur(4px)' },
    show: {
        opacity: 1,
        y: 0,
        filter: 'blur(0px)',
        transition: {
            type: "spring" as const,
            stiffness: 400,
            damping: 30,
            staggerChildren: 0.1
        }
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: 'blur(4px)',
        transition: { duration: 0.2 }
    }
}

// --- Page Component ---

export default function SettingsPage() {
    const [activeSection, setActiveSection] = useState<SectionId>('account')

    // Toggle States for interactive demo
    const [toggles, setToggles] = useState({
        twoFactor: true,
        emailNotifs: true,
        pushNotifs: false,
        promoEmails: true,
        dataSharing: false
    })

    const handleToggle = (key: keyof typeof toggles) => (val: boolean) => {
        setToggles(prev => ({ ...prev, [key]: val }))
    }

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a] pb-20">
            <SettingsHero />

            <BridgeNav activeSection={activeSection} setActiveSection={setActiveSection} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Main Settings (7 cols) */}
                {/* Left Column: Main Settings (7 cols) */}
                <div className="lg:col-span-8">
                    <AnimatePresence mode="wait" initial={false}>
                        {/* Account Section */}
                        {activeSection === 'account' && (
                            <motion.div
                                key="account"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <SectionCard title="Personal Information" icon={User}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputField label="First Name" defaultValue="Alex" />
                                        <InputField label="Last Name" defaultValue="Johnson" />
                                    </div>
                                    <InputField label="Email Address" defaultValue="alex.j@tripc.ai" type="email" />
                                    <InputField label="Phone Number" defaultValue="+1 (555) 000-1234" type="tel" />

                                    <div className="mt-6 flex justify-end">
                                        <button className="px-8 py-3 bg-[#FF5E1F] text-white font-bold rounded-full shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all">
                                            Save Changes
                                        </button>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}

                        {/* Security Section */}
                        {activeSection === 'security' && (
                            <motion.div
                                key="security"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <SectionCard title="Login & Security" icon={Shield}>
                                    <div className="mb-8">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Password</h3>
                                        <button className="w-full py-4 border border-slate-200 dark:border-white/10 rounded-xl flex items-center justify-between px-4 hover:border-slate-300 dark:hover:border-white/20 transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-white/10 transition-colors">
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-bold text-slate-900 dark:text-white">Change Password</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">Last changed 3 months ago</p>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-400 dark:text-slate-500 group-hover:translate-x-1 transition-transform" />
                                        </button>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wider">Two-Factor Authentication</h3>
                                    <GlassToggle
                                        label="Enable 2FA"
                                        checked={toggles.twoFactor}
                                        onChange={handleToggle('twoFactor')}
                                    />

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5">
                                        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 uppercase tracking-wider">Active Sessions</h3>
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-white/5 rounded-xl">
                                                <div className="flex items-center gap-3">
                                                    <Smartphone className="w-5 h-5 text-slate-400" />
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">iPhone 14 Pro</p>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400">San Francisco, CA • Active now</p>
                                                    </div>
                                                </div>
                                                <div className="w-2 h-2 bg-green-500 rounded-full" />
                                            </div>
                                        </div>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}

                        {/* Preferences & Notifications */}
                        {(activeSection === 'preferences' || activeSection === 'notifications') && (
                            <motion.div
                                key="preferences"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <SectionCard title="Global Preferences" icon={Globe}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Language</label>
                                            <select className="w-full h-12 px-4 rounded-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]">
                                                <option>English (US)</option>
                                                <option>French</option>
                                                <option>Spanish</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Currency</label>
                                            <select className="w-full h-12 px-4 rounded-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]">
                                                <option>USD ($)</option>
                                                <option>EUR (€)</option>
                                                <option>JPY (¥)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 uppercase tracking-wider mt-8">Notifications</h3>
                                    <GlassToggle label="Email Notifications" checked={toggles.emailNotifs} onChange={handleToggle('emailNotifs')} />
                                    <GlassToggle label="Push Notifications" checked={toggles.pushNotifs} onChange={handleToggle('pushNotifs')} />
                                    <GlassToggle label="Marketing & Deals" checked={toggles.promoEmails} onChange={handleToggle('promoEmails')} />
                                </SectionCard>
                            </motion.div>
                        )}

                        {/* Payments */}
                        {activeSection === 'payments' && (
                            <motion.div
                                key="payments"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <SectionCard title="Wallet & Payment Methods" icon={CreditCard}>
                                    <div className="w-full h-48 rounded-[1.5rem] bg-gradient-to-br from-slate-900 to-slate-800 p-6 relative overflow-hidden mb-8 shadow-xl text-white">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF5E1F] rounded-full blur-[80px] opacity-20 -mr-16 -mt-16" />
                                        <div className="relative z-10 flex flex-col justify-between h-full">
                                            <div className="flex justify-between items-start">
                                                <span className="font-mono opacity-80">TripC Wallet</span>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src="https://raw.githubusercontent.com/muhammederdem/credit-card-form/master/src/assets/images/chip.png" alt="chip" className="h-10 opacity-80" />
                                            </div>
                                            <div>
                                                <p className="font-mono text-xl tracking-widest mb-1">**** **** **** 4288</p>
                                                <div className="flex justify-between items-end">
                                                    <span className="font-bold">ALEX JOHNSON</span>
                                                    <span className="font-bold text-[#FF5E1F]">$1,240.50</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full py-3 bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300 font-bold rounded-full hover:bg-slate-200 dark:hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                                        <CreditCard className="w-4 h-4" /> Add Payment Method
                                    </button>
                                </SectionCard>
                            </motion.div>
                        )}

                        {/* Privacy */}
                        {activeSection === 'privacy' && (
                            <motion.div
                                key="privacy"
                                variants={tabContentVariants}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <SectionCard title="Privacy & Data" icon={Lock}>
                                    <GlassToggle label="Share usage data for improvements" checked={toggles.dataSharing} onChange={handleToggle('dataSharing')} />
                                    <div className="py-3 flex items-center justify-between">
                                        <span className="text-slate-700 dark:text-slate-300 font-medium">Profile Visibility</span>
                                        <span className="text-sm font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full">Public</span>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-slate-50 dark:border-white/5 space-y-3">
                                        <button className="w-full py-4 text-left px-4 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl transition-colors flex items-center gap-3 group text-slate-600 dark:text-slate-400 dark:hover:text-slate-200">
                                            <Download className="w-5 h-5" />
                                            <span className="font-bold">Download my data</span>
                                        </button>
                                        <button className="w-full py-4 text-left px-4 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-3 group text-red-500 dark:text-red-400">
                                            <Trash2 className="w-5 h-5" />
                                            <span className="font-bold">Delete Account</span>
                                        </button>
                                    </div>
                                </SectionCard>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Column: Sticky Rail (4 cols) */}
                <div className="lg:col-span-4">
                    <StickyRail />
                </div>
            </div>
        </main>
    )
}
