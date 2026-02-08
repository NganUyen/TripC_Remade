
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
                            <TableHead>Item</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Guest</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {bookings.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                                    No bookings found yet.
                                </TableCell>
                            </TableRow>
                        ) : (
                            bookings.map((booking) => (
                                <TableRow key={booking.id}>
                                    <TableCell className="font-mono text-xs">{booking.booking_reference || booking.confirmation_code}</TableCell>
                                    <TableCell className="font-medium">{booking.item_title}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                                            ${booking.type === 'activity' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                                                booking.type === 'event' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                                                    'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-400'}`}>
                                            {booking.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span>{booking.customer_name || booking.guest_name}</span>
                                            <span className="text-xs text-slate-500">{booking.customer_email || booking.guest_email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {(() => {
                                            try {
                                                const dateVal = booking.created_at || booking.booking_date
                                                return dateVal ? format(new Date(dateVal), 'PPP') : 'N/A'
                                            } catch (e) {
                                                console.error("Date Error:", e)
                                                return 'Invalid Date'
                                            }
                                        })()}
                                    </TableCell>
                                    <TableCell>${booking.total_amount}</TableCell>
                                    <TableCell>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.booking_status === 'confirmed' || booking.status === 'confirmed'
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                            : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {booking.status || booking.booking_status}
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
