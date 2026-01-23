"use client"

import { ActivitiesDetails } from './ActivitiesDetails'
import type { ActivityItem } from './mockData'
import { motion } from 'framer-motion'
import { Check, Star, ShieldCheck } from 'lucide-react'

interface ActivitiesContentProps {
    item: ActivityItem
}

export function ActivitiesContent({ item }: ActivitiesContentProps) {
    return (
        <div className="space-y-12">

            {/* Quick Feature Pillars */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {item.features.map((feature, i) => (
                    <div key={i} className="bg-slate-50 dark:bg-slate-900 rounded-xl p-4 flex flex-col items-center text-center gap-2 border border-slate-100 dark:border-slate-800">
                        <div className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm text-primary">
                            <Check className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-slate-700 dark:text-slate-300 leading-tight">
                            {feature}
                        </span>
                    </div>
                ))}
            </div>

            {/* Main Content Details */}
            <ActivitiesDetails item={item} />

            {/* Trust Badge */}
            <div className="bg-blue-50 dark:bg-blue-900/10 rounded-2xl p-6 flex items-start gap-4 border border-blue-100 dark:border-blue-800/30">
                <ShieldCheck className="w-8 h-8 text-blue-600 dark:text-blue-400 shrink-0" />
                <div>
                    <h4 className="font-bold text-blue-900 dark:text-blue-300 mb-1">Book with Confidence</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-400/80">
                        Best price guarantee. No booking fees. 24/7 customer support via chat or phone.
                    </p>
                </div>
            </div>

        </div>
    )
}
