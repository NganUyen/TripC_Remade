"use client"

import { Settings, HelpCircle, Shield, Globe, Lock, LogOut, ChevronRight, Briefcase, Camera } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function GrowthSection() {
    return (
        <section className="mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 px-2">Grow with TripC</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-900/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                        <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">TripC Concierge</h4>
                        <p className="text-sm text-slate-500 mb-3">Become a local expert partner</p>
                        <button className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-colors">
                            Apply Now
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/10 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0">
                        <Camera className="w-8 h-8" />
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-slate-900 dark:text-white">Content Creator</h4>
                        <p className="text-sm text-slate-500 mb-3">Earn from your travel stories</p>
                        <button className="px-5 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold hover:bg-orange-500 hover:text-white dark:hover:bg-orange-500 dark:hover:text-white transition-colors">
                            Learn More
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}

export function SettingsList() {
    const router = useRouter()
    const items = [
        { icon: <Settings className="w-5 h-5" />, label: "Account Settings", href: "/profile/settings" },
        { icon: <Shield className="w-5 h-5" />, label: "Privacy & Security", href: "/profile/settings" },
        { icon: <Globe className="w-5 h-5" />, label: "Language & Region" },
        { icon: <HelpCircle className="w-5 h-5" />, label: "Help & Support" },
        { icon: <Lock className="w-5 h-5" />, label: "Legal" },
    ]

    return (
        <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-4 shadow-sm border border-slate-100 dark:border-slate-800">
            <div className="space-y-1">
                {items.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => item.href && router.push(item.href)}
                        className="w-full flex items-center justify-between p-4 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="text-slate-400 group-hover:text-orange-500 transition-colors">
                                {item.icon}
                            </div>
                            <span className="font-bold text-slate-700 dark:text-slate-200">{item.label}</span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </button>
                ))}
            </div>

            <div className="h-px bg-slate-100 dark:bg-slate-800 my-2 mx-4" />

            <button className="w-full flex items-center justify-center gap-2 p-4 rounded-[1.5rem] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 font-bold transition-colors">
                <LogOut className="w-5 h-5" />
                Sign Out
            </button>
        </section>
    )
}
