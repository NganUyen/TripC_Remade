"use client"

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Bus,
    Clock,
    MapPin,
    Users
} from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface ScheduleEvent {
    id: string
    origin: string
    destination: string
    departure_time: string
    arrival_time: string
    vehicle_type: string
    seats_available: number
    type: string
    provider_name?: string
}

export function VehicleSchedule() {
    const [loading, setLoading] = useState(true)
    const [events, setEvents] = useState<ScheduleEvent[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [view, setView] = useState<'day' | 'week'>('day')

    useEffect(() => {
        fetchSchedule()
    }, [currentDate])

    const fetchSchedule = async () => {
        try {
            setLoading(true)

            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // Get user's providers
            const { data: providers } = await supabase
                .from('transport_providers')
                .select('id')
                .eq('owner_id', user.id)

            if (!providers || providers.length === 0) {
                setEvents([])
                setLoading(false)
                return
            }

            const providerIds = providers.map(p => p.id)

            // Get date range
            const startOfDay = new Date(currentDate)
            startOfDay.setHours(0, 0, 0, 0)

            const endOfDay = new Date(currentDate)
            endOfDay.setHours(23, 59, 59, 999)

            const { data, error } = await supabase
                .from('transport_routes')
                .select(`
                    id,
                    origin,
                    destination,
                    departure_time,
                    arrival_time,
                    vehicle_type,
                    seats_available,
                    type,
                    transport_providers (
                        name
                    )
                `)
                .in('provider_id', providerIds)
                .gte('departure_time', startOfDay.toISOString())
                .lte('departure_time', endOfDay.toISOString())
                .order('departure_time', { ascending: true })

            if (error) {
                console.error('Error fetching schedule:', error)
            } else {
                const formattedEvents = data?.map(item => ({
                    ...item,
                    provider_name: (item.transport_providers as any)?.name
                })) || []
                setEvents(formattedEvents)
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
    }

    const goToPreviousDay = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() - 1)
        setCurrentDate(newDate)
    }

    const goToNextDay = () => {
        const newDate = new Date(currentDate)
        newDate.setDate(newDate.getDate() + 1)
        setCurrentDate(newDate)
    }

    const goToToday = () => {
        setCurrentDate(new Date())
    }

    const getVehicleTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'bus': 'Xe buýt',
            'limousine': 'Limousine',
            'private_car': 'Xe riêng',
            'train': 'Tàu',
            'airplane': 'Máy bay'
        }
        return labels[type] || type
    }

    const getHourSlots = () => {
        const slots = []
        for (let i = 0; i < 24; i++) {
            slots.push(i)
        }
        return slots
    }

    const getEventPosition = (departureTime: string) => {
        const date = new Date(departureTime)
        const hours = date.getHours()
        const minutes = date.getMinutes()
        return (hours * 60 + minutes) / (24 * 60) * 100
    }

    const getEventDuration = (departureTime: string, arrivalTime: string) => {
        const start = new Date(departureTime)
        const end = new Date(arrivalTime)
        const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60)
        return Math.max(durationMinutes / (24 * 60) * 100, 2) // Minimum 2% width
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <div className="p-3.5 bg-primary/10 rounded-2xl">
                        <Calendar className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                            Lịch Vận hành
                        </h1>
                        <p className="text-slate-500 dark:text-slate-400">
                            Hệ thống quản lý lịch trình và phân bổ phương tiện thời gian thực
                        </p>
                    </div>
                </div>
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                        onClick={() => setView('day')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'day'
                            ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Ngày
                    </button>
                    <button
                        onClick={() => setView('week')}
                        className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${view === 'week'
                            ? 'bg-white dark:bg-slate-900 text-primary shadow-sm ring-1 ring-slate-200 dark:ring-slate-700'
                            : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                            }`}
                    >
                        Tuần
                    </button>
                </div>
            </div>

            {/* Date Navigation */}
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                    onClick={goToPreviousDay}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-primary"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>

                <div className="flex items-center gap-6">
                    <button
                        onClick={goToToday}
                        className="px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-xl transition-all ring-1 ring-primary/20"
                    >
                        Hôm nay
                    </button>
                    <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                        <Calendar className="w-5 h-5 text-primary" />
                        <span className="text-lg font-bold text-slate-900 dark:text-white">
                            {formatDate(currentDate)}
                        </span>
                    </div>
                </div>

                <button
                    onClick={goToNextDay}
                    className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-primary"
                >
                    <ChevronRight className="w-6 h-6" />
                </button>
            </div>

            {/* Schedule View */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                {loading ? (
                    <div className="p-6 space-y-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="relative">
                        {/* Time slots header */}
                        <div className="flex border-b border-slate-200 dark:border-slate-800 sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <div className="w-20 flex-shrink-0 p-3 border-r border-slate-200 dark:border-slate-800">
                                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Giờ</span>
                            </div>
                            <div className="flex-1 flex">
                                {getHourSlots().filter((_, i) => i % 3 === 0).map(hour => (
                                    <div
                                        key={hour}
                                        className="flex-1 p-2 text-center border-r border-slate-100 dark:border-slate-800 last:border-r-0"
                                    >
                                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                            {hour.toString().padStart(2, '0')}:00
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Events */}
                        <div className="min-h-[400px] p-4">
                            {events.length > 0 ? (
                                <div className="space-y-3">
                                    {events.map((event, index) => (
                                        <motion.div
                                            key={event.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="flex items-center gap-4 p-4 bg-primary/5 hover:bg-primary/10 rounded-xl transition-colors cursor-pointer border border-primary/10"
                                        >
                                            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-primary/20 shrink-0">
                                                <Bus className="w-6 h-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <MapPin className="w-3.5 h-3.5 text-primary" />
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {event.origin}
                                                        </span>
                                                    </div>
                                                    <div className="h-px w-4 bg-slate-300 dark:bg-slate-600" />
                                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                        <MapPin className="w-3.5 h-3.5 text-red-500" />
                                                        <span className="text-sm font-bold text-slate-900 dark:text-white">
                                                            {event.destination}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                                                    <span className="flex items-center gap-1.5 font-medium">
                                                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                        {formatTime(event.departure_time)}
                                                        <span className="text-xs opacity-50">→</span>
                                                        {formatTime(event.arrival_time)}
                                                    </span>
                                                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        {getVehicleTypeLabel(event.type)} • {event.vehicle_type}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="flex items-center justify-end gap-1.5 mb-1">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span className={`text-sm font-bold ${event.seats_available > 5 ? 'text-green-600' : 'text-amber-600'}`}>
                                                        {event.seats_available} chỗ
                                                    </span>
                                                </div>
                                                {event.provider_name && (
                                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-tight">
                                                        {event.provider_name}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-64 text-center">
                                    <Calendar className="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4" />
                                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                        Không có chuyến xe nào
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400">
                                        Không có lịch trình vận hành trong ngày {formatDate(currentDate)}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Bus className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng số chuyến</p>
                            <p className="text-2xl font-bold text-slate-900 dark:text-white">{events.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                            <Users className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Tổng chỗ trống</p>
                            <p className="text-2xl font-bold text-green-600">
                                {events.reduce((sum, e) => sum + e.seats_available, 0)}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                            <MapPin className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Số tuyến</p>
                            <p className="text-2xl font-bold text-blue-600">
                                {new Set(events.map(e => `${e.origin}-${e.destination}`)).size}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
