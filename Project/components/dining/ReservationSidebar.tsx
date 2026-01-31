"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { Calendar, Clock, Users, ChevronDown } from 'lucide-react'
import { diningApi } from '@/lib/dining/api'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface ReservationSidebarProps {
    venueId?: string
}

export function ReservationSidebar({ venueId }: ReservationSidebarProps) {
    const [guests, setGuests] = useState(2)
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [time, setTime] = useState<string>('')
    const [availableTimes, setAvailableTimes] = useState<string[]>([])
    const [availabilityReason, setAvailabilityReason] = useState<string | undefined>(undefined)
    const [loading, setLoading] = useState(false)
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const { user } = useUser()
    const router = useRouter()

    useEffect(() => {
        if (!venueId) return
        diningApi.getAvailableTimes(venueId, date, guests)
            .then((res) => {
                setAvailableTimes(res.times ?? [])
                setAvailabilityReason(res.reason)
                setTime((prev) => {
                    if (prev && (res.times ?? []).includes(prev)) return prev
                    return (res.times ?? [])[0] ?? ''
                })
            })
            .catch(() => {
                setAvailableTimes([])
                setAvailabilityReason('Failed to load available times')
                setTime('')
            })
    }, [venueId, date, guests])

    useEffect(() => {
        if (user) {
            setGuestName(user.fullName || '')
            setGuestEmail(user.primaryEmailAddress?.emailAddress || '')
        }
    }, [user])

    const canBook = useMemo(() => {
        return !!venueId && !!date && !!time && guests >= 1 && availableTimes.includes(time) && !!guestName && !!guestEmail
    }, [venueId, date, time, guests, availableTimes, guestName, guestEmail])

    const handleReservation = async () => {
        if (!venueId) {
            alert('Please select a restaurant')
            return
        }

        setLoading(true)
        try {
            if (!time) {
                alert(availabilityReason || 'Please select a time')
                return
            }

            // Create dining_appointment (new booking flow)
            const appointment = await diningApi.createAppointment({
                venue_id: venueId,
                appointment_date: date,
                appointment_time: time,
                guest_count: guests,
                guest_name: guestName,
                guest_email: guestEmail,
            })

            alert(`Booking confirmed! Code: ${appointment.appointment_code}`)
            // Optional: add a detail page later
            router.refresh()
        } catch (error: any) {
            console.error('Error creating reservation:', error)
            alert(error.message || 'Failed to create reservation')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="sticky top-24 bg-white dark:bg-[#18181b] rounded-[2rem] p-6 shadow-xl border border-slate-100 dark:border-zinc-800">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white">Reserve a Table</h3>
                <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2.5 w-2.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#FF5E1F]"></span>
                    </span>
                    <span className="text-xs font-bold text-[#FF5E1F]">Live</span>
                </div>
            </div>

            <div className="space-y-4 mb-6">
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3">
                    <button className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-[#FF5E1F] transition-colors group">
                        <div className="flex items-center gap-2 overflow-hidden">
                            <Calendar className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F]" />
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]}
                                className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none cursor-pointer"
                            />
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>
                    <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700 hover:border-[#FF5E1F] transition-colors group">
                        <div className="flex items-center gap-2 overflow-hidden w-full">
                            <Clock className="w-4 h-4 text-slate-400 group-hover:text-[#FF5E1F]" />
                            <select
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                className="text-sm font-bold text-slate-900 dark:text-white bg-transparent border-none outline-none cursor-pointer w-full"
                            >
                                {availableTimes.length === 0 ? (
                                    <option value="">{availabilityReason || 'No times available'}</option>
                                ) : (
                                    availableTimes.map((t) => (
                                        <option key={t} value={t}>{t}</option>
                                    ))
                                )}
                            </select>
                        </div>
                        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
                    </div>
                </div>

                {/* Guests */}
                <div className="flex items-center justify-between px-5 py-3 bg-slate-50 dark:bg-zinc-900 rounded-full border border-slate-200 dark:border-zinc-700">
                    <div className="flex items-center gap-3">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-bold text-slate-900 dark:text-white">{guests} Guests</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold hover:bg-[#FF5E1F] hover:text-white">-</button>
                        <button onClick={() => setGuests(guests + 1)} className="w-6 h-6 rounded-full bg-white dark:bg-zinc-800 shadow flex items-center justify-center text-slate-600 dark:text-slate-300 font-bold hover:bg-[#FF5E1F] hover:text-white">+</button>
                    </div>
                </div>

                {/* Guest Info (Always show or only if not logged in? User requested guest support, so let's allow input) */}
                <div className="space-y-3 pt-2">
                    <input
                        type="text"
                        placeholder="Full Name *"
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-full px-5 py-3 text-sm font-bold outline-none focus:border-[#FF5E1F]"
                    />
                    <input
                        type="email"
                        placeholder="Email Address *"
                        value={guestEmail}
                        onChange={(e) => setGuestEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-full px-5 py-3 text-sm font-bold outline-none focus:border-[#FF5E1F]"
                    />
                </div>
            </div>

            <button
                onClick={handleReservation}
                disabled={loading || !canBook}
                className="w-full bg-[#FF5E1F] hover:bg-[#e04f18] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-full shadow-lg shadow-orange-500/20 transition-all active:scale-95 mb-3 flex items-center justify-center gap-2 relative overflow-hidden group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 rounded-full"></div>
                <span className="relative">{loading ? 'Processing...' : 'Confirm Booking'}</span>
            </button>

            <button className="w-full text-slate-500 dark:text-slate-400 font-bold text-sm hover:text-slate-900 dark:hover:text-white transition-colors">
                For groups {'>'} 10, click here
            </button>
        </div>
    )
}
