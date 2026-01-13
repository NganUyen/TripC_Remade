"use client"

import React from 'react'
import { motion } from 'framer-motion'

export const springTransition = { type: "spring" as const, stiffness: 400, damping: 25 }

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: springTransition }
}

export function GlassToggle({ label, checked, onChange }: { label: string, checked: boolean, onChange: (val: boolean) => void }) {
    return (
        <div className="flex items-center justify-between py-3">
            <span className="text-slate-700 dark:text-slate-300 font-medium">{label}</span>
            <button
                onClick={() => onChange(!checked)}
                className={`relative w-12 h-7 rounded-full transition-colors duration-300 ${checked ? 'bg-[#FF5E1F]' : 'bg-slate-200 dark:bg-zinc-700'}`}
            >
                <motion.div
                    layout
                    className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm"
                    animate={{ x: checked ? 20 : 0 }}
                    transition={springTransition}
                />
            </button>
        </div>
    )
}

export function SectionCard({ title, icon: Icon, children }: { title: string, icon: any, children: React.ReactNode }) {
    return (
        <motion.div
            variants={fadeInUp}
            className="bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm rounded-[2rem] p-6 md:p-8 shadow-sm border border-slate-100 dark:border-white/5 mb-6 group hover:shadow-md dark:hover:shadow-zinc-900/20 hover:border-slate-200 dark:hover:border-white/10 transition-all duration-300"
        >
            <div className="flex items-center gap-3 mb-6 border-b border-slate-50 dark:border-white/5 pb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-[#FF5E1F] dark:text-orange-400">
                    <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
            </div>
            {children}
        </motion.div>
    )
}

export function InputField({ label, defaultValue, type = "text" }: { label: string, defaultValue: string, type?: string }) {
    return (
        <div className="mb-4">
            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{label}</label>
            <input
                type={type}
                defaultValue={defaultValue}
                className="w-full h-11 px-4 rounded-full bg-slate-50 dark:bg-zinc-800/50 border border-slate-200 dark:border-zinc-700/50 text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F] dark:focus:border-[#FF5E1F] transition-all placeholder:text-slate-400"
            />
        </div>
    )
}
