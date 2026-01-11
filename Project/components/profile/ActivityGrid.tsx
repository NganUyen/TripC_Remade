"use client"

import { Target, Calendar, Heart, Bookmark, ShoppingBag, Gift, Users, Award } from 'lucide-react'
import { motion, Variants } from 'framer-motion'

// Color Mapping for Dynamic Shadow Interpolation
const SHADOW_COLORS: Record<string, string> = {
    rose: "rgba(244, 63, 94, 0.4)",
    sky: "rgba(14, 165, 233, 0.4)",
    pink: "rgba(217, 70, 239, 0.4)",
    indigo: "rgba(99, 102, 241, 0.4)",
    amber: "rgba(245, 158, 11, 0.4)",
    emerald: "rgba(16, 185, 129, 0.4)",
    cyan: "rgba(6, 182, 212, 0.4)",
    purple: "rgba(168, 85, 247, 0.4)",
}

const ACTIVITIES = [
    {
        icon: Target,
        label: "Missions",
        badge: "3",
        colorName: "rose",
        colorClass: "text-rose-600 dark:text-rose-400",
        bgClass: "bg-rose-50 dark:bg-rose-900/20"
    },
    {
        icon: Calendar,
        label: "Bookings",
        badge: null,
        colorName: "sky",
        colorClass: "text-sky-600 dark:text-sky-400",
        bgClass: "bg-sky-50 dark:bg-sky-900/20"
    },
    {
        icon: Heart,
        label: "Saved",
        badge: null,
        colorName: "pink",
        colorClass: "text-pink-600 dark:text-pink-400",
        bgClass: "bg-pink-50 dark:bg-pink-900/20"
    },
    {
        icon: Bookmark,
        label: "Collections",
        badge: null,
        colorName: "indigo",
        colorClass: "text-indigo-600 dark:text-indigo-400",
        bgClass: "bg-indigo-50 dark:bg-indigo-900/20"
    },
    {
        icon: ShoppingBag,
        label: "Orders",
        badge: "1",
        colorName: "amber",
        colorClass: "text-amber-600 dark:text-amber-400",
        bgClass: "bg-amber-50 dark:bg-amber-900/20"
    },
    {
        icon: Gift,
        label: "Rewards",
        badge: null,
        colorName: "emerald",
        colorClass: "text-emerald-600 dark:text-emerald-400",
        bgClass: "bg-emerald-50 dark:bg-emerald-900/20"
    },
    {
        icon: Users,
        label: "Referrals",
        badge: null,
        colorName: "cyan",
        colorClass: "text-cyan-600 dark:text-cyan-400",
        bgClass: "bg-cyan-50 dark:bg-cyan-900/20"
    },
    {
        icon: Award,
        label: "Nominations",
        badge: null,
        colorName: "purple",
        colorClass: "text-purple-600 dark:text-purple-400",
        bgClass: "bg-purple-50 dark:bg-purple-900/20"
    },
]

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 }
    }
}

export function ActivityGrid() {
    return (
        <section className="mb-12">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 px-2">My Activity</h3>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-4 gap-y-8 gap-x-4"
            >
                {ACTIVITIES.map((item, i) => {
                    const shadowColor = SHADOW_COLORS[item.colorName] || "rgba(0,0,0,0.1)"

                    return (
                        <motion.button
                            key={i}
                            variants={itemVariants}
                            whileHover="hover"
                            whileTap={{ scale: 0.95 }}
                            className="group flex flex-col items-center gap-3 relative"
                        >
                            {/* Icon Container - The "App Icon" */}
                            <motion.div
                                variants={{
                                    hover: {
                                        y: -8,
                                        scale: 1.1,
                                        boxShadow: `0 20px 30px -10px ${shadowColor}`,
                                    }
                                }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                className={`relative w-20 h-20 md:w-24 md:h-24 rounded-[2rem] flex items-center justify-center ${item.bgClass}`}
                            >
                                {item.badge && (
                                    <motion.span
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 15,
                                            delay: 0.5 + (i * 0.1)
                                        }}
                                        className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-lg border-2 border-white dark:border-slate-900 z-10"
                                    >
                                        {item.badge}
                                    </motion.span>
                                )}

                                <motion.div
                                    className={item.colorClass}
                                    variants={{
                                        hover: { scale: 1.15 }
                                    }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                >
                                    <item.icon className="w-8 h-8 md:w-10 md:h-10" strokeWidth={1.5} />
                                </motion.div>
                            </motion.div>

                            {/* Label */}
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                {item.label}
                            </span>
                        </motion.button>
                    )
                })}
            </motion.div>
        </section>
    )
}
