"use client"

import { Info } from 'lucide-react'

export function EventDetails() {
    return (
        <div className="space-y-8">
            <div className="flex items-center gap-2 mb-4">
                <Info className="w-5 h-5 text-primary" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">About This Experience</h3>
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] p-6 border border-slate-100 dark:border-slate-800 shadow-sm leading-relaxed text-slate-600 dark:text-slate-300">
                <p className="mb-4">
                    Get ready for the ultimate summer music festival experience in the heart of the city.
                    Start your journey with a scenic ferry ride to the island venue, followed by a welcome drink at the Sunset Lounge.
                    As the sun goes down, the Main Stage comes alive with world-class performances.
                </p>
                <p className="mb-4">
                    Between sets, explore the silent disco, artisan food market, and interactive art installations.
                    Ends with a spectacular drone light show finale. Suitable for music lovers of all ages.
                </p>

                <h4 className="font-bold text-slate-900 dark:text-white mt-6 mb-2">What to Expect</h4>
                <ul className="list-disc pl-5 space-y-1">
                    <li>World-class sound systems and lighting</li>
                    <li>Curated food vendors from top city chefs</li>
                    <li>Dedicated chill-out zones and VIP lounges</li>
                </ul>
            </div>
        </div>
    )
}
