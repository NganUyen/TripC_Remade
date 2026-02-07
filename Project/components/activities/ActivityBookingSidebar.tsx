"use client"

import React, { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, Minus, Plus, User, Lock, Ticket, ChevronDown, Check } from 'lucide-react'
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
    const [promoCode, setPromoCode] = useState('')

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
            <div className="p-6 rounded-3xl bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/50 dark:border-white/5 shadow-xl transition-all duration-300">

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Book Tickets</h2>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                            <Lock className="w-3 h-3" />
                            <span>Instant Confirmation</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">From</span>
                        <div className="flex items-baseline justify-end gap-1">
                            <span className="text-[#FF5E1F] font-black text-xl">${activity.price}</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-5">
                    {/* Date Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Date</label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <button
                                    className={cn(
                                        "w-full bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-2xl px-4 py-3 text-left focus:ring-2 focus:ring-[#FF5E1F]/20 dark:text-white transition-all outline-none flex items-center gap-3 hover:border-[#FF5E1F]/50 group",
                                        !date && "text-slate-400"
                                    )}
                                >
                                    <div className={cn("p-2 rounded-xl transition-colors", date ? "bg-[#FF5E1F]/10 text-[#FF5E1F]" : "bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-[#FF5E1F]")}>
                                        <CalendarIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <span className={cn("block text-sm font-bold", date ? "text-slate-900 dark:text-white" : "text-slate-500")}>
                                            {date ? format(date, "EEE, MMM d, yyyy") : "Pick a date"}
                                        </span>
                                    </div>
                                    <ChevronDown className="w-4 h-4 text-slate-400 opacity-50" />
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
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Tickets</label>
                        <div className="space-y-2.5">
                            {activity.ticket_types.map((ticket, i) => (
                                <div key={i} className="p-3.5 bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200/60 dark:border-white/5 flex items-center justify-between group hover:border-slate-300 dark:hover:border-white/10 transition-colors">
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-white">{ticket.name}</p>
                                        <p className="text-[#FF5E1F] font-bold text-sm">${ticket.price}</p>
                                    </div>
                                    <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/80 rounded-xl p-1 border border-slate-100 dark:border-white/5">
                                        <button
                                            onClick={() => handleTicketChange(ticket.name, -1)}
                                            disabled={!ticketCounts[ticket.name]}
                                            className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <span className="w-4 text-center font-bold text-sm text-slate-900 dark:text-white">{ticketCounts[ticket.name] || 0}</span>
                                        <button
                                            onClick={() => handleTicketChange(ticket.name, 1)}
                                            className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white shadow-sm border border-slate-100 dark:border-slate-700 hover:scale-105 active:scale-95 transition-all"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Expandable Section */}
                    <div className={cn(
                        "grid transition-all duration-500 ease-in-out",
                        showDetails ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-50 pointer-events-none"
                    )}>
                        <div className="overflow-hidden">
                            <div className="space-y-5 pt-2">
                                {/* Contact Details */}
                                <div className="space-y-3">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                                        Contact Details
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="text"
                                            placeholder="Full Name *"
                                            value={contact.name}
                                            onChange={(e) => setContact({ ...contact, name: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]/50 dark:text-white transition-all outline-none"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email *"
                                            value={contact.email}
                                            onChange={(e) => setContact({ ...contact, email: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]/50 dark:text-white transition-all outline-none"
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Phone (Optional)"
                                            value={contact.phone}
                                            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                                            className="w-full bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]/50 dark:text-white transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Promo Code */}
                                <div className="space-y-2">
                                    <div className="flex gap-2 items-stretch">
                                        <div className="relative flex-1">
                                            <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                type="text"
                                                placeholder="Promo code"
                                                value={voucherCode}
                                                onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                                className="w-full h-10 bg-white dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/10 rounded-xl pl-9 pr-3 text-sm focus:ring-2 focus:ring-[#FF5E1F]/20 focus:border-[#FF5E1F]/50 dark:text-white transition-all outline-none"
                                            />
                                        </div>
                                        <button
                                            className="h-10 px-4 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl font-bold text-xs hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-50"
                                            type="button"
                                            onClick={handleApplyVoucher}
                                            disabled={isValidating || !voucherCode}
                                        >
                                            {isValidating ? '...' : 'Apply'}
                                        </button>
                                    </div>
                                    {discountAmount > 0 && (
                                        <div className="flex justify-between items-center px-2 text-xs text-emerald-600 font-medium">
                                            <span>Discount applied</span>
                                            <span>-${discountAmount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validation Warning */}
                    {isMissingAdult && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
                            <div className="mt-0.5 p-1 bg-red-100 dark:bg-red-900/30 rounded-full shrink-0">
                                <User className="w-3 h-3 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-red-600 dark:text-red-400">Adult Required</p>
                                <p className="text-[11px] font-medium text-red-500/80 dark:text-red-400/70 mt-0.5 leading-tight">
                                    A child ticket requires at least 1 adult ticket.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Total & Button */}
                    <div className="pt-5 border-t border-slate-200/60 dark:border-white/10 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="font-bold text-sm text-slate-500">Total Price</span>
                            <div className="text-right">
                                {discountAmount > 0 && (
                                    <span className="block text-xs text-slate-400 line-through decoration-slate-400/50">
                                        ${totalPrice.toLocaleString()}
                                    </span>
                                )}
                                <span className={cn(
                                    "text-2xl font-black tracking-tight",
                                    discountAmount > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-900 dark:text-white"
                                )}>
                                    ${Math.max(0, totalPrice - discountAmount).toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={handleBook}
                            disabled={isBooking || !showDetails || isMissingAdult}
                            className={cn(
                                "w-full h-12 bg-[#FF5E1F] text-white text-base font-bold rounded-xl shadow-lg shadow-[#FF5E1F]/20 hover:shadow-xl hover:shadow-[#FF5E1F]/30 hover:-translate-y-0.5 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                                (!showDetails || isMissingAdult) && "opacity-50 cursor-not-allowed bg-slate-200 dark:bg-slate-800 text-slate-400 shadow-none hover:shadow-none hover:translate-y-0"
                            )}
                        >
                            {isBooking ? (
                                <>
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Processing...</span>
                                </>
                            ) : showDetails ? (
                                <>
                                    <span>Book Now</span>
                                    <Check className="w-4 h-4" />
                                </>
                            ) : (
                                'Select Parameters'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
