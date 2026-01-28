"use client";

import React from 'react'
import { motion } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import { Globe, Map, Plane, Sparkles } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

export default function WelcomeHeader() {
    const { user, isLoaded } = useUser();

    // Greeting based on time of day
    const hour = new Date().getHours();
    const greetingText = hour < 12 ? "Chào buổi sáng" : hour < 18 ? "Chào buổi chiều" : "Chào buổi tối";

    const stats = [
        { icon: <Map className="size-4" />, count: '24', label: 'Quốc gia' },
        { icon: <Plane className="size-4" />, count: '03', label: 'Chuyến đi' },
        { icon: <Sparkles className="size-4" />, count: '12', label: 'Ưu đãi' }
    ];

    return (
        <div className="col-span-12 lg:col-span-7 flex flex-col justify-between py-1">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
            >
                {/* Brand Identity Branding */}
                <div className="flex items-center gap-2 mb-2 opacity-80 group cursor-default w-fit">
                    <div className="text-[#FF5E1F] size-7 bg-[#FF5E1F]/10 rounded-lg flex items-center justify-center group-hover:bg-[#FF5E1F] group-hover:text-white transition-all duration-300">
                        <Globe className="w-4 h-4" />
                    </div>
                    <span className="text-slate-500 dark:text-slate-400 text-xs font-bold tracking-widest uppercase">
                        TripC Pro Member
                    </span>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                        {greetingText},<br />
                        {!isLoaded ? (
                            <Skeleton className="h-10 w-64 mt-2 rounded-xl" />
                        ) : (
                            <span className="text-slate-900 dark:text-white">
                                {user?.firstName || user?.username || "Lữ khách"}
                            </span>
                        )}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
                        Bạn có <span className="text-[#FF5E1F] font-bold">03 chuyến đi</span> sắp khởi hành trong tháng này.
                    </p>
                </div>
            </motion.div>

            <div className="flex items-center gap-8 mt-6">
                {stats.map((item, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (0.1 * idx), duration: 0.4 }}
                        className="flex flex-col gap-1 group/stat cursor-default"
                    >
                        <div className="flex items-center gap-2">
                            <div className="text-slate-400 dark:text-slate-500 group-hover/stat:text-[#FF5E1F] transition-colors duration-300">
                                {item.icon}
                            </div>
                            <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{item.count}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest">{item.label}</span>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}

