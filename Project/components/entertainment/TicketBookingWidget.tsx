"use client"

import { useState } from 'react'
import { Calendar, Users, ChevronDown, Check, Plus, Minus, Ticket } from 'lucide-react'
import { motion } from 'framer-motion'
import type { EntertainmentItem, TicketType, AddOn } from './mockData'

interface TicketBookingWidgetProps {
  item: EntertainmentItem
}

export function TicketBookingWidget({ item }: TicketBookingWidgetProps) {
  const [selectedTicketType, setSelectedTicketType] = useState<TicketType>(item.ticketTypes[0])
  const [ticketQuantity, setTicketQuantity] = useState(1)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [isBooking, setIsBooking] = useState(false)

  // Calculate total price
  const ticketPrice = selectedTicketType.price * ticketQuantity
  const addOnsPrice = item.addOns
    ? item.addOns
        .filter(addon => selectedAddOns.includes(addon.id))
        .reduce((sum, addon) => sum + addon.price, 0)
    : 0
  const subtotal = ticketPrice + addOnsPrice
  const fees = Math.round(subtotal * 0.075) // 7.5% booking fee
  const total = subtotal + fees

  const handleQuantityChange = (delta: number) => {
    const newQuantity = ticketQuantity + delta
    if (newQuantity >= 1 && newQuantity <= 10) {
      setTicketQuantity(newQuantity)
    }
  }

  const toggleAddOn = (addonId: string) => {
    setSelectedAddOns(prev =>
      prev.includes(addonId)
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    )
  }

  const handleBooking = async () => {
    setIsBooking(true)
    try {
      // TODO: Integrate with Convex bookings when available
      // Simulating booking for now
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Store booking info in localStorage for demo purposes
      const booking = {
        type: 'event',
        title: item.title,
        description: `${ticketQuantity}x ${selectedTicketType.name}`,
        date: item.date,
        price: total,
        imageUrl: item.image,
        metadata: {
          ticketType: selectedTicketType.id,
          quantity: ticketQuantity,
          addOns: selectedAddOns,
          venue: item.venue.name,
          category: item.category
        },
        bookedAt: new Date().toISOString()
      }
      
      // Save to localStorage
      const existingBookings = JSON.parse(localStorage.getItem('entertainment_bookings') || '[]')
      existingBookings.push(booking)
      localStorage.setItem('entertainment_bookings', JSON.stringify(existingBookings))
      
      alert('✅ Booking confirmed! Your tickets have been reserved.')
      // TODO: Navigate to bookings page or show success modal
    } catch (error) {
      console.error('Booking failed:', error)
      alert('❌ Booking failed. Please try again.')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <aside className="hidden lg:block w-full sticky top-24 z-30">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-2xl border border-slate-100 dark:border-slate-800">
        {/* Price Header */}
        <div className="flex items-end gap-2 mb-6">
          <span className="text-4xl font-black text-slate-900 dark:text-white">
            ${item.price}
          </span>
          <span className="text-lg text-slate-500 font-medium mb-1">/ ticket</span>
          {item.ticketTypes.length > 1 && (
            <div className="ml-auto bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-xs font-bold">
              From
            </div>
          )}
        </div>

        {/* Date Display */}
        <div className="mb-6">
          <button className="w-full flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-[1.5rem] hover:border-orange-500 transition-colors group text-left">
            <div className="flex-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Event Date</p>
              <p className="font-bold text-slate-900 dark:text-white">{item.date}</p>
              {item.startTime && (
                <p className="text-sm text-slate-500 mt-1">{item.startTime}</p>
              )}
            </div>
            <Calendar className="w-5 h-5 text-slate-400 group-hover:text-orange-500 transition-colors" strokeWidth={1.5} />
          </button>
        </div>

        {/* Ticket Type Selection */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Ticket Type</p>
          <div className="space-y-2">
            {item.ticketTypes.map((ticketType) => (
              <button
                key={ticketType.id}
                onClick={() => setSelectedTicketType(ticketType)}
                className={`w-full p-4 rounded-[1.5rem] border text-left transition-all ${
                  selectedTicketType.id === ticketType.id
                    ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-slate-900 dark:text-white mb-1">
                      {ticketType.name}
                    </p>
                    {ticketType.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {ticketType.description}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 mt-2">
                      {ticketType.available} remaining
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-orange-600 dark:text-orange-400">
                      ${ticketType.price}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quantity</p>
          <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800 rounded-[1.5rem] p-4">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={ticketQuantity <= 1}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 transition-colors"
            >
              <Minus className="w-4 h-4" strokeWidth={1.5} />
            </button>
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {ticketQuantity}
            </span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={ticketQuantity >= 10}
              className="w-10 h-10 rounded-full bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center text-slate-900 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-500 transition-colors"
            >
              <Plus className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Add-ons */}
        {item.addOns && item.addOns.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Enhance Your Experience</p>
            <div className="space-y-2">
              {item.addOns.map((addon) => (
                <label
                  key={addon.id}
                  className={`flex items-start gap-3 p-4 rounded-[1.5rem] border cursor-pointer transition-all ${
                    selectedAddOns.includes(addon.id)
                      ? 'border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-orange-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedAddOns.includes(addon.id)}
                    onChange={() => toggleAddOn(addon.id)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-orange-500 focus:ring-orange-500"
                  />
                  <div className="flex-1">
                    <p className="font-bold text-sm text-slate-900 dark:text-white">
                      {addon.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {addon.description}
                    </p>
                  </div>
                  <p className="font-black text-sm text-orange-600 dark:text-orange-400">
                    +${addon.price}
                  </p>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Breakdown */}
        <div className="mb-6 space-y-2 py-4 border-t border-b border-slate-200 dark:border-slate-800">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">
              {ticketQuantity}x {selectedTicketType.name}
            </span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${ticketPrice}
            </span>
          </div>
          {addOnsPrice > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-slate-600 dark:text-slate-400">Add-ons</span>
              <span className="font-bold text-slate-900 dark:text-white">
                ${addOnsPrice}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Service fees</span>
            <span className="font-bold text-slate-900 dark:text-white">
              ${fees}
            </span>
          </div>
          <div className="flex justify-between text-lg pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-black text-slate-900 dark:text-white">Total</span>
            <span className="font-black text-orange-600 dark:text-orange-400">
              ${total}
            </span>
          </div>
        </div>

        {/* Book Button */}
        <button
          onClick={handleBooking}
          disabled={isBooking}
          className="w-full py-4 rounded-[1.5rem] bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-lg shadow-xl shadow-orange-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBooking ? 'Processing...' : 'Book Now'}
        </button>

        {/* Trust Badges */}
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Instant confirmation
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Secure payment processing
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-medium">
            <Check className="w-3 h-3 text-green-500" strokeWidth={1.5} />
            Mobile tickets accepted
          </div>
        </div>
      </div>
    </aside>
  )
}

interface MobileBookingBarProps {
  item: EntertainmentItem
}

export function MobileBookingBar({ item }: MobileBookingBarProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 z-50 lg:hidden flex items-center justify-between gap-4 pb-8 shadow-2xl">
      <div>
        <div className="flex items-center gap-1">
          <span className="text-2xl font-black text-slate-900 dark:text-white">
            ${item.price}
          </span>
          <span className="text-sm text-slate-500 mb-1">/ ticket</span>
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium flex items-center gap-1">
          <Ticket className="w-3 h-3" strokeWidth={1.5} />
          {item.date}
        </p>
      </div>
      <button className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold text-base shadow-lg shadow-orange-500/20">
        Book Now
      </button>
    </div>
  )
}
