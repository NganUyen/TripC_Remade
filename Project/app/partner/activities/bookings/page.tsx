
"use client"

import { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { format } from 'date-fns'

export default function PartnerBookings() {
    const [bookings, setBookings] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchBookings() {
            try {
                const res = await fetch('/api/partner/bookings')
                if (res.ok) {
                    const data = await res.json()
                    setBookings(data)
                }
            } catch (error) {
                console.error("Failed to fetch bookings", error)
            } finally {
                setLoading(false)
            }
        }
        fetchBookings()
    }, [])

    if (loading) return <div>Loading bookings...</div>

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Recent Bookings</h1>

            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Booking Ref</TableHead>
                            <TableHead>Activity</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                                    No bookings found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-mono text-xs">{booking.confirmation_code}</TableCell>
                                    <TableCell className="font-medium">{booking.activity_title}</TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{booking.guest_name}</span>
                                            <span className="text-xs text-slate-500">{booking.guest_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>{format(new Date(booking.booking_date), 'PPP')}</TableCell>
                                    <TableCell>${booking.total_amount}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.payment_status === 'paid'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
