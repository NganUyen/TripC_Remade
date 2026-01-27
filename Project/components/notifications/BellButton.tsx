"use client"

import { useState } from 'react'
import { Bell } from 'lucide-react'
import { NotificationDrawer } from './NotificationDrawer'
import { NOTIFICATIONS } from './notificationData'

interface BellButtonProps {
    className?: string
    colorClass?: string
}

export function BellButton({ className, colorClass = "text-slate-600 dark:text-slate-300" }: BellButtonProps) {
    const [isOpen, setIsOpen] = useState(false)
    const unreadCount = NOTIFICATIONS.filter(n => !n.isRead).length

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className={`relative p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${className}`}
            >
                <Bell className={`w-6 h-6 ${colorClass}`} strokeWidth={1.5} />
                {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF5E1F] rounded-full ring-2 ring-white dark:ring-[#0a0a0a]" />
                )}
            </button>

            <NotificationDrawer isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    )
}
