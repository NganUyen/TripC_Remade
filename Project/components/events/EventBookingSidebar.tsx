"use client"

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { ChevronDown, Check, Ticket, AlertCircle, Loader2, X } from 'lucide-react'
import { useTicketAvailability, formatEventPrice, formatEventDate, formatEventTime } from '@/hooks/use-events'
import type { EventWithSessions, EventSessionWithTickets, EventTicketType } from '@/lib/events/types'

interface EventBookingSidebarProps {
    event: EventWithSessions
}

export function EventBookingSidebar({ event }: EventBookingSidebarProps) {
    const router = useRouter()
    const { user, isLoaded: isUserLoaded } = useUser()

    // Selection state
    const [selectedSessionId, setSelectedSessionId] = useState<string>('')
    const [selectedTicketTypeId, setSelectedTicketTypeId] = useState<string>('')
    const [adults, setAdults] = useState(1)
    const [children, setChildren] = useState(0)

    // UI state
    const [showSessionDropdown, setShowSessionDropdown] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string>('')

    // Get available sessions (only on_sale status)
    const availableSessions = useMemo(() => {
        return event.sessions?.filter(s => s.status === 'on_sale') || []
    }, [event.sessions])

    // Auto-select first session if none selected
    useEffect(() => {
        if (!selectedSessionId && availableSessions.length > 0) {
            setSelectedSessionId(availableSessions[0].id)
        }
    }, [availableSessions, selectedSessionId])

    // Get selected session
    const selectedSession = useMemo(() => {
        return availableSessions.find(s => s.id === selectedSessionId)
    }, [availableSessions, selectedSessionId])

    // Get ticket types for selected session
    const sessionTicketTypes = useMemo(() => {
        return selectedSession?.ticket_types?.filter(t => t.is_active) || []
    }, [selectedSession])

    // Auto-select first ticket type when session changes
    useEffect(() => {
        if (sessionTicketTypes.length > 0) {
            const currentTypeExists = sessionTicketTypes.some(t => t.id === selectedTicketTypeId)
            if (!currentTypeExists) {
                setSelectedTicketTypeId(sessionTicketTypes[0].id)
            }
        }
    }, [sessionTicketTypes, selectedTicketTypeId])

    // Fetch real-time availability
    const { ticketTypes: availabilityData, loading: availabilityLoading } = useTicketAvailability(
        event.id,
        selectedSessionId
    )

    // Get selected ticket type with availability
    const selectedTicketType = useMemo(() => {
        const baseTicket = sessionTicketTypes.find(t => t.id === selectedTicketTypeId)
        if (!baseTicket) return null

        // Merge with availability data
        const availabilityInfo = availabilityData.find(a => a.id === selectedTicketTypeId)
        if (availabilityInfo) {
            return {
                ...baseTicket,
                available_count: availabilityInfo.available_count,
                is_available: availabilityInfo.is_available
            }
        }

        // Calculate from base data if availability not loaded
        const available = baseTicket.total_capacity - baseTicket.sold_count - baseTicket.held_count
        return {
            ...baseTicket,
            available_count: available,
            is_available: available > 0
        }
    }, [sessionTicketTypes, selectedTicketTypeId, availabilityData])

    // Calculate total quantity and price
    const totalQuantity = adults + children
    const unitPrice = selectedTicketType?.price || 0
    const currency = selectedTicketType?.currency || 'VND'
    const totalPrice = totalQuantity * unitPrice

    // Validation
    const showWarning = children > 0 && adults === 0
    const maxPerOrder = selectedTicketType?.max_per_order || 10
    const minPerOrder = selectedTicketType?.min_per_order || 1
    const availableCount = selectedTicketType?.available_count || 0
    const isOverLimit = totalQuantity > maxPerOrder
    const isOverAvailable = totalQuantity > availableCount
    const isBelowMin = totalQuantity < minPerOrder && totalQuantity > 0
    const isNotAvailable = !selectedTicketType?.is_available

    const canSubmit = !showWarning &&
        !isOverLimit &&
        !isOverAvailable &&
        !isBelowMin &&
        !isNotAvailable &&
        totalQuantity > 0 &&
        selectedSessionId &&
        selectedTicketTypeId

    // Handle session selection
    const handleSessionSelect = (sessionId: string) => {
        setSelectedSessionId(sessionId)
        setShowSessionDropdown(false)
        // Reset quantities when session changes
        setAdults(1)
        setChildren(0)
    }

    // Voucher State
    const [voucherCode, setVoucherCode] = useState('')
    const [discountAmount, setDiscountAmount] = useState(0)
    const [isVoucherApplied, setIsVoucherApplied] = useState(false)
    const [voucherMessage, setVoucherMessage] = useState('')
    const [isValidatingVoucher, setIsValidatingVoucher] = useState(false)

    // Handle Voucher Application
    const handleApplyVoucher = async () => {
        if (!voucherCode.trim()) return

        setIsValidatingVoucher(true)
        setVoucherMessage('')
        setDiscountAmount(0)
        setIsVoucherApplied(false)

        try {
            const res = await fetch('/api/v1/vouchers/validate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: voucherCode,
                    cartTotal: totalPrice,
                    serviceType: 'event'
                })
            })

            const data = await res.json()

            if (!res.ok) {
                setVoucherMessage(data.error || 'Invalid voucher')
                return
            }

            if (data.valid) {
                setDiscountAmount(data.discountAmount)
                setIsVoucherApplied(true)
                setVoucherMessage(`Voucher applied: -$${data.discountAmount}`)
                toast.success('Voucher applied successfully!')
            }
        } catch (err) {
            setVoucherMessage('Failed to validate voucher')
        } finally {
            setIsValidatingVoucher(false)
        }
    }

    const finalPrice = Math.max(0, totalPrice - discountAmount)

    // Check if submitting allowed
    // ... existed logic ...

    // Updated handleGetTickets
    const handleGetTickets = async () => {
        setError('')

        if (!isUserLoaded) {
            setError('Loading user information...')
            return
        }

        if (!user) {
            toast.info("Please sign in to book tickets")
            router.push(`/sign-in?redirect_url=/events/${event.id}`)
            return
        }

        if (!canSubmit) {
            toast.error('Please check your ticket selection and try again')
            setError('Please check your ticket selection and try again')
            return
        }

        setIsSubmitting(true)

        try {
            const query = new URLSearchParams({
                eventId: event.id,
                sessionId: selectedSessionId,
                ticketTypeId: selectedTicketTypeId,
                adults: adults.toString(),
                children: children.toString(),
                voucherCode: isVoucherApplied ? voucherCode : '',
                discountAmount: discountAmount.toString()
            })

            toast.success("Redirecting to secure checkout...")
            router.push(`/events/checkout?${query.toString()}`)
        } catch (err: any) {
            console.error('Checkout error:', err)
            const msg = err.message || 'Something went wrong'
            toast.error(msg)
            setError(msg)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Get availability badge
    const getAvailabilityBadge = () => {
        if (availabilityLoading) return null
        if (!selectedTicketType) return null

        const available = selectedTicketType.available_count
        const total = selectedTicketType.total_capacity

        if (available === 0) {
            return (
                <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-xs font-bold">
                    Sold Out
                </div>
            )
        }

        if (available < total * 0.1) {
            return (
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-3 py-1 rounded-full text-xs font-bold">
                    Only {available} left!
                </div>
            )
        }

        if (available < total * 0.3) {
            return (
                <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 px-3 py-1 rounded-full text-xs font-bold">
                    Selling Fast
                </div>
            )
        }

        return (
            <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
                Available
            </div>
        )
    }

    return (
        <aside className="hidden lg:block w-full sticky top-24 z-30">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
                {/* Price Header */}
                <div className="flex items-end gap-2 mb-6">
                    <span className="text-4xl font-black text-slate-900 dark:text-white">
                        {formatEventPrice(totalPrice, currency)}
                    </span>
                    <span className="text-lg text-slate-500 font-medium mb-1">total</span>
                    <div className="ml-auto">
                        {getAvailabilityBadge()}
                    </div>
                </div>

                {/* Inputs */}
                <div className="space-y-3 mb-6">
                    {/* Session Selection */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSessionDropdown(!showSessionDropdown)}
                            className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-[#FF5E1F] transition-colors group text-left"
                        >
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Date & Time</p>
                                <p className="font-bold text-slate-900 dark:text-white group-hover:text-[#FF5E1F] transition-colors">
                                    {selectedSession
                                        ? `${formatEventDate(selectedSession.session_date)} • ${formatEventTime(selectedSession.start_time)}`
                                        : 'Select a date'
                                    }
                                </p>
                                {selectedSession?.name && (
                                    <p className="text-xs text-slate-500 mt-0.5">{selectedSession.name}</p>
                                )}
                            </div>
                            <ChevronDown className={`w-5 h-5 text-slate-400 group-hover:text-[#FF5E1F] transition-all ${showSessionDropdown ? 'rotate-180' : ''}`} />
                        </button>

                        {/* Session Dropdown */}
                        {showSessionDropdown && (
                            <div className="absolute top-full mt-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-20 max-h-64 overflow-y-auto">
                                {availableSessions.length === 0 ? (
                                    <div className="p-4 text-center text-slate-500 text-sm">
                                        No sessions available
                                    </div>
                                ) : (
                                    availableSessions.map((session) => (
                                        <button
                                            key={session.id}
                                            onClick={() => handleSessionSelect(session.id)}
                                            className={`w-full p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b last:border-b-0 border-slate-100 dark:border-slate-800 ${session.id === selectedSessionId ? 'bg-orange-50 dark:bg-orange-900/20' : ''
                                                }`}
                                        >
                                            <p className="font-bold text-slate-900 dark:text-white">
                                                {formatEventDate(session.session_date)}
                                            </p>
                                            <p className="text-sm text-slate-500">
                                                {formatEventTime(session.start_time)}
                                                {session.end_time && ` - ${formatEventTime(session.end_time)}`}
                                            </p>
                                            {session.name && (
                                                <p className="text-xs text-[#FF5E1F] font-medium mt-1">{session.name}</p>
                                            )}
                                        </button>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quantity - Adults */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Adults (18+)</p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {formatEventPrice(unitPrice, currency)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setAdults(Math.max(0, adults - 1))}
                                    disabled={adults === 0}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800"
                                >-</button>
                                <span className="font-bold text-slate-900 dark:text-white w-4 text-center">{adults}</span>
                                <button
                                    onClick={() => setAdults(Math.min(maxPerOrder - children, adults + 1))}
                                    disabled={totalQuantity >= maxPerOrder || totalQuantity >= availableCount}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Quantity - Children */}
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem]">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Children</p>
                                <p className="font-bold text-slate-900 dark:text-white">
                                    {formatEventPrice(unitPrice, currency)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setChildren(Math.max(0, children - 1))}
                                    disabled={children === 0}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800"
                                >-</button>
                                <span className="font-bold text-slate-900 dark:text-white w-4 text-center">{children}</span>
                                <button
                                    onClick={() => setChildren(Math.min(maxPerOrder - adults, children + 1))}
                                    disabled={totalQuantity >= maxPerOrder || totalQuantity >= availableCount}
                                    className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 font-bold hover:bg-[#FF5E1F] hover:text-white transition-colors disabled:opacity-50 disabled:hover:bg-slate-100 dark:disabled:hover:bg-slate-800"
                                >+</button>
                            </div>
                        </div>
                    </div>

                    {/* Validation Warnings */}
                    {showWarning && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium animate-in fade-in slide-in-from-top-2">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Children must be accompanied by at least 1 adult.</p>
                        </div>
                    )}

                    {isOverLimit && (
                        <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Maximum {maxPerOrder} tickets per order.</p>
                        </div>
                    )}

                    {isOverAvailable && !isOverLimit && (
                        <div className="flex items-start gap-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-3 rounded-xl text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Only {availableCount} tickets available.</p>
                        </div>
                    )}

                    {isBelowMin && (
                        <div className="flex items-start gap-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 p-3 rounded-xl text-sm font-medium">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <p>Minimum {minPerOrder} tickets per order.</p>
                        </div>
                    )}
                </div>

                {/* Ticket Tier Selection */}
                {sessionTicketTypes.length > 0 && (
                    <div className="mb-6">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ticket Tier</p>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {sessionTicketTypes.map((ticketType) => {
                                const availability = availabilityData.find(a => a.id === ticketType.id)
                                const isSoldOut = availability ? !availability.is_available : false

                                return (
                                    <button
                                        key={ticketType.id}
                                        onClick={() => {
                                            setSelectedTicketTypeId(ticketType.id)
                                            setAdults(1)
                                            setChildren(0)
                                        }}
                                        disabled={isSoldOut}
                                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold truncate transition-all ${selectedTicketTypeId === ticketType.id
                                            ? 'border border-[#FF5E1F] bg-orange-50 dark:bg-orange-900/20 text-[#FF5E1F] dark:text-orange-400'
                                            : isSoldOut
                                                ? 'border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                                : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:border-[#FF5E1F]'
                                            }`}
                                    >
                                        {ticketType.name}
                                        {ticketType.badge && (
                                            <span className="ml-1 text-xs">• {ticketType.badge}</span>
                                        )}
                                        {isSoldOut && <span className="ml-1 text-xs">(Sold Out)</span>}
                                    </button>
                                )
                            })}
                        </div>

                        {/* Ticket Type Perks */}
                        {selectedTicketType && selectedTicketType.perks && selectedTicketType.perks.length > 0 && (
                            <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                                <p className="text-xs font-bold text-slate-500 mb-2">Includes:</p>
                                <ul className="space-y-1">
                                    {selectedTicketType.perks.slice(0, 3).map((perk, i) => (
                                        <li key={i} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                            <Check className="w-3 h-3 text-green-500" />
                                            {perk}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* Price Breakdown */}
                {totalQuantity > 0 && (
                    <div className="mb-4 space-y-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        {/* Breakdown Items */}
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-600 dark:text-slate-400">
                                    {formatEventPrice(unitPrice, currency)} × {totalQuantity}
                                </span>
                                <span className="font-bold text-slate-900 dark:text-white">
                                    {formatEventPrice(totalPrice, currency)}
                                </span>
                            </div>

                            {/* Voucher Input */}
                            <div className="pt-2 pb-2">
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Ticket className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <input
                                            type="text"
                                            placeholder="Voucher Code"
                                            value={voucherCode}
                                            onChange={(e) => {
                                                setVoucherCode(e.target.value.toUpperCase())
                                                setIsVoucherApplied(false) // Reset if changed
                                                setDiscountAmount(0)
                                                setVoucherMessage('')
                                            }}
                                            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:border-[#FF5E1F]"
                                        />
                                    </div>
                                    <button
                                        onClick={handleApplyVoucher}
                                        disabled={!voucherCode || isValidatingVoucher}
                                        className="px-4 py-2 bg-slate-900 dark:bg-slate-700 text-white text-sm font-bold rounded-lg hover:bg-slate-800 disabled:opacity-50"
                                    >
                                        {isValidatingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                                    </button>
                                </div>
                                {voucherMessage && (
                                    <p className={`text-xs mt-1 ${isVoucherApplied ? 'text-green-600' : 'text-red-500'}`}>
                                        {voucherMessage}
                                    </p>
                                )}
                            </div>

                            {isVoucherApplied && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>-{formatEventPrice(discountAmount, currency)}</span>
                                </div>
                            )}
                        </div>

                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">Total</span>
                            <span className="font-black text-xl text-[#FF5E1F]">
                                {formatEventPrice(finalPrice, currency)}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-2">
                        <X className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Submit Action */}
                <button
                    onClick={handleGetTickets}
                    disabled={!canSubmit || isSubmitting}
                    className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-[#FF5E1F] disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Ticket className="w-5 h-5" />
                            Get Tickets
                        </>
                    )}
                </button>

                <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
                    <Check className="w-3 h-3 text-green-500" /> Instant Digital Delivery
                </div>
            </div>
        </aside>
    )
}

interface EventMobileBookingBarProps {
    event: EventWithSessions
}

export function EventMobileBookingBar({ event }: EventMobileBookingBarProps) {
    const router = useRouter()

    // Get first available session and its cheapest ticket
    const firstSession = event.sessions?.find(s => s.status === 'on_sale')
    const cheapestTicket = firstSession?.ticket_types
        ?.filter(t => t.is_active)
        ?.sort((a, b) => a.price - b.price)[0]

    const price = cheapestTicket?.price || 0
    const currency = cheapestTicket?.currency || 'VND'

    const handleGetTickets = () => {
        // Scroll to top where the desktop sidebar is, or on mobile just navigate
        // For mobile, we can redirect to a ticket selection modal/page
        if (firstSession && cheapestTicket) {
            const query = new URLSearchParams({
                eventId: event.id,
                sessionId: firstSession.id,
                ticketTypeId: cheapestTicket.id,
                adults: '1',
                children: '0',
            })
            toast.success("Redirecting to secure checkout...")
            router.push(`/events/checkout?${query.toString()}`)
        }
    }

    return (
        <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 lg:hidden flex items-center justify-between gap-4 pb-8">
            <div>
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                        {formatEventPrice(price, currency)}
                    </span>
                    <span className="text-sm text-slate-500 mb-1">/ ticket</span>
                </div>
                <p className="text-xs text-[#FF5E1F] font-bold">
                    {firstSession
                        ? `${formatEventDate(firstSession.session_date)} • ${cheapestTicket?.name || 'GA'}`
                        : 'Select date'
                    }
                </p>
            </div>
            <button
                onClick={handleGetTickets}
                disabled={!firstSession || !cheapestTicket}
                className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Get Tickets
            </button>
        </div>
    )
}
