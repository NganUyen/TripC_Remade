"use client"

import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Minus, Plus, User, Lock, Ticket } from 'lucide-react'
import { Activity } from '@/types'
import { useUser, useClerk } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { createActivityBooking } from '@/lib/actions/activities'
import { Calendar } from "@/components/ui/calendar"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"

interface ActivityBookingSidebarProps {
    activity: Activity
}

export function ActivityBookingSidebar({ activity }: ActivityBookingSidebarProps) {
    const { user, isSignedIn } = useUser()
    const { openSignIn } = useClerk()
    const router = useRouter()

    // State
    const [date, setDate] = useState<Date>()
    const [ticketCounts, setTicketCounts] = useState<{ [key: string]: number }>({})
    const [totalPrice, setTotalPrice] = useState(0)
    const [isBooking, setIsBooking] = useState(false)

    // Contact Form
    const [contact, setContact] = useState({
        name: '',
        email: '',
        phone: ''
    })

    // Voucher state
    const [voucherCode, setVoucherCode] = useState('')
    const [discountAmount, setDiscountAmount] = useState(0)
    const [isValidating, setIsValidating] = useState(false)

    useEffect(() => {
        if (user) {
            setContact({
                name: user.fullName || '',
                email: user.primaryEmailAddress?.emailAddress || '',
                phone: user.primaryPhoneNumber?.phoneNumber || ''
            })
        }
    }, [user])

    // Initialize ticket counts
    useEffect(() => {
        if (activity.ticket_types) {
            const initiald: any = {}
            activity.ticket_types.forEach(t => initiald[t.name] = 0)
            // Default 1 adult
            if (activity.ticket_types.length > 0) {
                initiald[activity.ticket_types[0].name] = 1
            }
            setTicketCounts(initiald)
        }
    }, [activity])

    // Calculate total
    useEffect(() => {
        let total = 0
        activity.ticket_types.forEach(t => {
            total += (ticketCounts[t.name] || 0) * t.price
        })
        setTotalPrice(total)
    }, [ticketCounts, activity])

    const handleApplyVoucher = async () => {
        if (!voucherCode) return
        setIsValidating(true)
        try {
            const baseTotal = totalPrice
            const res = await fetch('/api/v1/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: voucherCode,
                    cartTotal: baseTotal,
                    serviceType: 'activity'
                }),
            })
            const data = await res.json()

            if (!res.ok) {
                toast.error(data.error || 'Invalid voucher')
                setDiscountAmount(0)
            } else {
                toast.success(`Voucher applied! Saved $${data.discountAmount}`)
                setDiscountAmount(data.discountAmount)
            }
        } catch (error) {
            toast.error('Failed to validate voucher')
        } finally {
            setIsValidating(false)
        }
    }

    const handleTicketChange = (name: string, delta: number) => {
        setTicketCounts(prev => {
            const current = prev[name] || 0
            const next = Math.max(0, current + delta)
            return { ...prev, [name]: next }
        })
    }

    // Validation state
    const hasChild = Object.entries(ticketCounts).some(([name, count]) =>
        (name.toLowerCase().includes('child') ||
            name.toLowerCase().includes('kid') ||
            name.toLowerCase().includes('trẻ em')) &&
        count > 0
    )

    const hasAdult = Object.entries(ticketCounts).some(([name, count]) =>
        (name.toLowerCase().includes('adult') ||
            name.toLowerCase().includes('người lớn')) &&
        count > 0
    )

    const isMissingAdult = hasChild && !hasAdult

    const handleBook = async () => {
        if (!date) {
            toast.error("Please select a date")
            return
        }

        // Guest booking is allowed, so we don't return if not signed in

        // Validate contact info
        if (!contact.name || !contact.email) {
            toast.error("Please fill in contact details")
            return
        }

        // Validate adult for children
        if (isMissingAdult) {
            toast.error("Children must be accompanied by an adult")
            return
        }

        // Proceed to booking
        setIsBooking(true)
        try {
            // Prepare booking data
            const formattedDate = format(date, 'yyyy-MM-dd')
            const bookingData = {
                activityId: activity.id,
                date: formattedDate,
                tickets: ticketCounts,
                contact,
                totalPrice: Math.max(0, totalPrice - discountAmount),
                voucherCode: discountAmount > 0 ? voucherCode : undefined,
                discountAmount
            }

            const result = await createActivityBooking({
                user_id: user?.id,
                activity_id: activity.id,
                total_amount: Math.max(0, totalPrice - discountAmount),
                booking_details: bookingData,
                title: activity.title,
                image_url: activity.image_url,
                start_date: formattedDate,
                guest_details: contact
            })

            if (result.success && result.booking) {
                toast.success("Booking created!")
                // Redirect to Global Checkout
                router.push(`/checkout?bookingId=${result.booking.id}`)
            }
            else {
                toast.error("Booking failed: " + result.error)
            }

        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsBooking(false)
        }
    }

    const showDetails = date && totalPrice > 0

    return (
        <div className="sticky top-24">
            <div className="p-8 rounded-[2.5rem] bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-white/40 dark:border-white/5 shadow-2xl transition-all duration-500 ease-in-out">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <span className="p-2 bg-[#FF5E1F] rounded-xl text-white">
                            <Ticket className="w-6 h-6" />
                        </span>
                        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Book Tickets</h2>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">From</span>
                        <span className="text-[#FF5E1F] font-black text-xl">${activity.price}</span>
                        <span className="text-[10px] font-medium text-slate-500 block">/ person</span>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Date Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Select Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        "w-full bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 rounded-full pl-6 pr-6 py-4 text-left focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all outline-none flex items-center gap-3",
                                        !date && "text-slate-400"
                                    )}
                                >
                                    <CalendarIcon className="w-5 h-5 opacity-50" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Ticket Selection */}
                    <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Select Tickets</label>
                        <div className="space-y-3">
                            {activity.ticket_types.map((ticket, i) => (
                                <div key={i} className="p-5 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-200/60 dark:border-white/10 flex items-center justify-between">
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">{ticket.name}</p>
                                        <p className="text-[#FF5E1F] font-bold text-sm">${ticket.price}</p>
                                    </div>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-900 rounded-full p-1">
                                        <button
                                            onClick={() => handleTicketChange(ticket.name, -1)}
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="w-4 text-center font-bold text-slate-900 dark:text-white">{ticketCounts[ticket.name] || 0}</span>
                                        <button
                                            onClick={() => handleTicketChange(ticket.name, 1)}
                                            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <div className={cn(
                        "grid transition-[grid-template-rows] duration-500 ease-in-out",
                        showDetails ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-50 pointer-events-none"
                    )}>
                        <div className="overflow-hidden">
                            <div className="space-y-6 pt-2">
                                {/* Contact Details */}
                                <div className="space-y-4">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-2 flex items-center gap-2">
                                        <User className="w-4 h-4" /> Contact Details
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Full Name *"
                                        value={contact.name}
                                        onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 rounded-full px-6 py-4 focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all outline-none"
                                    />
                                    <input
                                        type="email"
                                        placeholder="Email *"
                                        value={contact.email}
                                        onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 rounded-full px-6 py-4 focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all outline-none"
                                    />
                                    <input
                                        type="tel"
                                        placeholder="Phone (Optional)"
                                        value={contact.phone}
                                        onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                        className="w-full bg-white dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 rounded-full px-6 py-4 focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all outline-none"
                                    />
                                </div>

                                {/* Promo Code */}
                                <div className="space-y-2">
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest px-2">
                                        Voucher Code
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter code"
                                            value={voucherCode}
                                            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                            disabled={isLoading}
                                            className="flex-1 bg-white dark:bg-slate-800/50 border-slate-200/60 dark:border-white/10 rounded-full px-6 py-4 focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all text-sm outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleApplyVoucher}
                                            disabled={isValidating || !voucherCode}
                                            className="px-6 py-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-full font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                                        >
                                            {isValidating ? 'Checking...' : 'Apply'}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* Validation Warning */}
                    {isMissingAdult && (
                        <div className="mx-2 mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="p-2 bg-red-100 dark:bg-red-900/40 rounded-full">
                                <User className="w-4 h-4 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-600 dark:text-red-400">Adult Required</p>
                                <p className="text-xs font-medium text-red-500/80 dark:text-red-400/80">
                                    Children tickets require at least 1 Adult ticket.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Total & Button */}
                    <div className="pt-6 border-t border-slate-200/60 dark:border-white/10 space-y-4">
                        <div className="space-y-2">
                            {discountAmount > 0 && (
                                <>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-slate-500">Subtotal</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-300">${totalPrice.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-green-600 font-bold">
                                        <span>Discount</span>
                                        <span>-${discountAmount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-500">Total</span>
                                <span className="text-3xl font-black text-slate-900 dark:text-white">${Math.max(0, totalPrice - discountAmount).toLocaleString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={handleBook}
                            disabled={isBooking || !showDetails}
                            className={cn(
                                "w-full py-5 bg-[#FF5E1F] text-white text-lg font-extrabold rounded-full shadow-xl shadow-[#FF5E1F]/20 hover:shadow-[#FF5E1F]/40 hover:-translate-y-1 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                !showDetails && "opacity-50 cursor-not-allowed bg-slate-400 shadow-none hover:shadow-none hover:translate-y-0"
                            )}
                        >
                            {isBooking ? 'Processing...' : showDetails ? 'Book Now' : 'Select Date & Tickets'}
                        </button>
                        <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-emerald-500 uppercase tracking-wider">
                            <Lock className="w-3 h-3" /> Instant Confirmation
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
