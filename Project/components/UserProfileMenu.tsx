"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, BookOpen, Heart, Bell, Gift, Settings, Globe, Moon, Sun, LogOut } from 'lucide-react'
import Link from 'next/link'

export function UserProfileMenu({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [isDark, setIsDark] = useState(false)

    // Toggle Dark Mode
    useEffect(() => {
        if (document.documentElement.classList.contains('dark')) {
            setIsDark(true)
        }
    }, [])

    const toggleTheme = () => {
        const root = document.documentElement
        if (isDark) {
            root.classList.remove('dark')
            root.classList.add('light')
            setIsDark(false)
        } else {
            root.classList.remove('light')
            root.classList.add('dark')
            setIsDark(true)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for closing */}
                    <div className="fixed inset-0 z-40" onClick={onClose}></div>

                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-0 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 flex flex-col gap-1"
                    >
                        {/* Section 1: Links */}
                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                            <MenuItem icon={User} label="My Profile" />
                            <MenuItem icon={BookOpen} label="My Bookings" />
                            <MenuItem icon={Heart} label="Wishlist" />
                            <MenuItem icon={Bell} label="Price Alerts" />
                            <MenuItem icon={Gift} label="Rewards" />
                        </div>

                        {/* Section 2: Preferences */}
                        <div className="flex flex-col border-b border-slate-100 dark:border-slate-800 pb-2 mb-2">
                            <MenuItem icon={Settings} label="Settings" />

                            {/* Dark Mode Toggle */}
                            <div className="flex items-center justify-between px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer" onClick={toggleTheme}>
                                <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                    {isDark ? <Moon className="w-5 h-5 text-indigo-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                                    <span className="text-sm font-medium">Dark Mode</span>
                                </div>
                                <div className={`w-10 h-6 rounded-full p-1 transition-colors ${isDark ? 'bg-indigo-600' : 'bg-slate-200'} flex items-center`}>
                                    <motion.div
                                        layout
                                        className={`w-4 h-4 rounded-full bg-white shadow-sm`}
                                        animate={{ x: isDark ? 16 : 0 }}
                                    />
                                </div>
                            </div>

                            <MenuItem icon={Globe} label="Language" />
                        </div>

                        {/* Section 3: Destructive */}
                        <div>
                            <button className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors text-red-600 group">
                                <LogOut className="w-5 h-5 group-hover:text-red-700" />
                                <span className="text-sm font-bold group-hover:text-red-700">Sign Out</span>
                            </button>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}

function MenuItem({ icon: Icon, label }: { icon: any, label: string }) {
    return (
        <Link href="#" className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors group">
            <Icon className="w-5 h-5 text-slate-400 group-hover:text-[#FF5E1F] transition-colors" />
            <span className="text-sm font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                {label}
            </span>
        </Link>
    )
}
