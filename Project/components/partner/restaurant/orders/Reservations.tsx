"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, CheckCircle, XCircle, Clock, Users, Loader2 } from 'lucide-react'
import { partnerApi } from '@/lib/partner/api'
import type { DiningReservation, DiningVenue } from '@/lib/dining/types'
import { useUser } from '@clerk/nextjs'

export function Reservations() {
    const { user } = useUser()
    const [venue, setVenue] = useState<DiningVenue | null>(null)
    const [bookings, setBookings] = useState<DiningReservation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadData = async () => {
            if (!user) return
            try {
                const venues = await partnerApi.getMyVenues(user.id)
                if (venues.length > 0) {
                    setVenue(venues[0])
                    const data = await partnerApi.getReservations(venues[0].id, user.id)
                    setBookings(data)
                }
            } catch (error) {
                console.error("Failed to load reservations:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [user])

    const handleStatusUpdate = async (id: string, newStatus: any) => {
        if (!user) return
        try {
            const updated = await partnerApi.updateReservationStatus(id, newStatus, user.id)
            setBookings(bookings.map(b => b.id === id ? updated : b))
        } catch (error) {
            console.error("Failed to update status:", error)
        }
    }

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>
    if (!venue) return <div className="p-8 text-center text-slate-500">No venue found.</div>

    return (
        <div className="space-y-6">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Reservations</h2>
                <p className="text-slate-500">Manage incoming and upcoming bookings</p>
            </div>

            <div className="space-y-4">
                {bookings.length === 0 && <p className="text-slate-500 text-center py-8">No reservations found.</p>}

                {bookings.map((booking) => (
                    <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                        {/* Info */}
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Calendar className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                                    {booking.guest_name}
                                </h3>
                                <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1">
                                        <Users className="w-4 h-4" /> {booking.guest_count} Guests
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-4 h-4" /> {booking.reservation_time} - {booking.reservation_date}
                                    </span>
                                </div>
                                {booking.special_requests && (
                                    <p className="text-sm text-amber-600 mt-2 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded w-fit">
                                        Note: {booking.special_requests}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3">
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase
                                ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                    booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                        booking.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}
                            `}>
                                {booking.status}
                            </div>

                            {booking.status === 'pending' && (
                                <>
                                    <button
                                        onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                        title="Confirm"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Decline"
                                    >
                                        <XCircle className="w-5 h-5" />
                                    </button>
                                </>
                            )}
                            {booking.status === 'confirmed' && (
                                <button
                                    onClick={() => handleStatusUpdate(booking.id, 'seated')}
                                    className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary/90"
                                >
                                    Mark Seated
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
