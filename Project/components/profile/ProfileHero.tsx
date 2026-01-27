"use client"


import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { Edit2, Share2, MapPin } from 'lucide-react'

interface ProfileHeroProps {
    profile?: {
        membership_tier: string
    } | null
}

export function ProfileHero({ profile }: ProfileHeroProps) {
    const { user, isLoaded } = useUser()

    if (!isLoaded) {
        return (
            <div className="w-full pt-32 pb-8 animate-pulse">
                <div className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-slate-200 dark:bg-slate-800" />
                        <div>
                            <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
                            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded" />
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <section className="w-full pt-32 pb-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row items-end md:items-center justify-between gap-6"
            >
                <div className="flex items-center gap-6">
                    {/* Avatar */}
                    <div className="relative shrink-0">
                        <div className="w-24 h-24 md:w-28 md:h-28 rounded-full p-1 bg-gradient-to-tr from-orange-500 to-amber-500 shadow-lg">
                            <img
                                src={user?.imageUrl}
                                alt={user?.fullName || 'User'}
                                className="w-full h-full rounded-full object-cover border-4 border-[#fcfaf8] dark:border-[#0a0a0a]"
                            />
                        </div>
                        <div className="absolute bottom-1 right-1 w-6 h-6 bg-green-500 border-4 border-[#fcfaf8] dark:border-[#0a0a0a] rounded-full" />
                    </div>

                    {/* User Info */}
                    <div>
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-1">
                            <h1 className="text-3xl font-black text-slate-900 dark:text-white">
                                {user?.fullName || user?.firstName || 'Traveller'}
                            </h1>
                            <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-bold rounded-full border border-orange-200 dark:border-orange-800/50">
                                {profile?.membership_tier || 'Member'}
                            </span>
                        </div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium mb-3">
                            {user?.username ? `@${user.username}` : user?.primaryEmailAddress?.emailAddress} • Joined {user?.createdAt ? new Date(user.createdAt).getFullYear() : '2024'}
                        </p>

                        {/* Stats - Keeping mocked for now as per plan */}
                        <div className="flex gap-6">
                            <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900 dark:text-white">1.2k</span>
                                <span className="text-xs font-bold text-slate-400">Followers</span>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="font-black text-slate-900 dark:text-white">284</span>
                                <span className="text-xs font-bold text-slate-400">Following</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 w-full md:w-auto mt-6 md:mt-0">
                    <button className="flex-1 md:flex-none h-11 px-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <Edit2 className="w-4 h-4" />
                        <span>Edit</span>
                    </button>
                    <button className="flex-1 md:flex-none h-11 px-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </button>
                </div>
            </motion.div>
        </section>
    )
}
