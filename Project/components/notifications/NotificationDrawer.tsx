"use client"

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCheck, Inbox, Gift, Calendar, AlertCircle } from 'lucide-react'
import { NOTIFICATIONS, Notification } from './notificationData'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'

interface NotificationDrawerProps {
    isOpen: boolean
    onClose: () => void
}

const TABS = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'reward', label: 'Rewards' },
    { id: 'booking', label: 'Bookings' },
    { id: 'system', label: 'System' },
] as const

export function NotificationDrawer({ isOpen, onClose }: NotificationDrawerProps) {
    const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('all')
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isLoading, setIsLoading] = useState(false)

    // Fetch Notifications
    const fetchNotifications = async () => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/v1/notifications?t=' + Date.now()) // bust cache
            if (res.ok) {
                const data = await res.json()
                const formatted = data.map((n: any) => ({
                    id: n.id,
                    type: n.type,
                    title: n.title,
                    message: n.message,
                    time: n.created_at ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true }) : 'Just now',
                    isRead: n.is_read,
                    deepLink: n.deep_link
                }))
                setNotifications(formatted)
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (isOpen) {
            fetchNotifications()
        }
    }, [isOpen])

    const filteredNotifications = useMemo(() => {
        return notifications.filter(n => {
            if (activeTab === 'all') return true
            if (activeTab === 'unread') return !n.isRead
            return n.type === activeTab
        })
    }, [notifications, activeTab])

    const markAllRead = async () => {
        // Optimistic UI
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        await fetch('/api/v1/notifications', {
            method: 'PATCH',
            body: JSON.stringify({ markAll: true })
        })
    }

    const markRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        await fetch('/api/v1/notifications', {
            method: 'PATCH',
            body: JSON.stringify({ id })
        })
    }

    const deleteNotification = async (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
        await fetch(`/api/v1/notifications?id=${id}`, {
            method: 'DELETE'
        })
    }

    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        return () => setMounted(false)
    }, [])

    if (!mounted) return null

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[90]"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%', opacity: 0 }} // Desktop: from right
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#fcfaf8]/95 dark:bg-[#111]/95 backdrop-blur-xl z-[100] border-l border-white/20 dark:border-white/5 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10 shrink-0">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Notifications</h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400">You have {notifications.filter(n => !n.isRead).length} unread messages</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={markAllRead}
                                    className="p-2 text-slate-500 hover:text-[#FF5E1F] hover:bg-orange-50 dark:hover:bg-orange-500/10 rounded-full transition-colors"
                                    title="Mark all as read"
                                >
                                    <CheckCheck className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="px-6 pt-4 pb-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
                            {TABS.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 py-2 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10'
                                        }`}
                                >
                                    {activeTab === tab.id && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-[#FF5E1F] rounded-full"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{tab.label}</span>
                                </button>
                            ))}
                        </div>

                        {/* List */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            <AnimatePresence mode='popLayout'>
                                {filteredNotifications.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="flex flex-col items-center justify-center h-64 text-slate-400"
                                    >
                                        <Inbox className="w-12 h-12 mb-4 opacity-50" />
                                        <p className="text-sm">No notifications found</p>
                                    </motion.div>
                                ) : (
                                    filteredNotifications.map((notification) => (
                                        <NotificationItem
                                            key={notification.id}
                                            data={notification}
                                            onRead={() => markRead(notification.id)}
                                            onDismiss={() => deleteNotification(notification.id)}
                                        />
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>,
        document.body
    )
}

function NotificationItem({ data, onRead, onDismiss }: { data: Notification, onRead: () => void, onDismiss: () => void }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className={`group relative p-4 rounded-2xl border transition-all hover:-translate-y-1 hover:shadow-lg ${data.isRead
                ? 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 opacity-80 hover:opacity-100'
                : 'bg-white dark:bg-[#1a1a1a] border-orange-100 dark:border-orange-500/20 shadow-sm'
                }`}
        >
            {!data.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#FF5E1F]" />
            )}

            <Link href={data.deepLink || '#'} onClick={onRead} className="flex gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${data.type === 'reward' ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/20' :
                    data.type === 'booking' ? 'bg-blue-100 text-blue-600 dark:bg-blue-500/20' :
                        'bg-slate-100 text-slate-600 dark:bg-slate-500/20'
                    }`}>
                    {data.type === 'reward' ? <Gift className="w-5 h-5" /> :
                        data.type === 'booking' ? <Calendar className="w-5 h-5" /> :
                            <AlertCircle className="w-5 h-5" />}
                </div>

                <div className="flex-1 pr-6">
                    <h4 className={`text-sm font-bold mb-1 ${data.isRead ? 'text-slate-700 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                        {data.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-2 line-clamp-2">
                        {data.message}
                    </p>
                    <span className="text-[10px] font-medium text-slate-400">
                        {data.time}
                    </span>
                </div>
            </Link>

            <button
                onClick={(e) => { e.stopPropagation(); onDismiss(); }}
                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-slate-500 dark:text-slate-600 dark:hover:text-slate-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
                <X className="w-3 h-3" />
            </button>
        </motion.div>
    )
}
