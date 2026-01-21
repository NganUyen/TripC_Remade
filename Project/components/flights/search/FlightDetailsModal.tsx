"use client"

import { X, Plane, Luggage, CalendarCheck, Info, Share2, Clock } from "lucide-react"

interface FlightDetailsModalProps {
    flight: any
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
}

export function FlightDetailsModal({ flight, isOpen, onClose, onConfirm }: FlightDetailsModalProps) {
    if (!isOpen || !flight) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] rounded-2xl shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                            Your flight to {flight.arrival.airport}
                        </h3>
                        <button className="flex items-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                            <Share2 className="w-3 h-3" /> Share this flight
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-500" />
                    </button>
                </div>

                {/* Content - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8">

                    {/* Flight Leg */}
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <h4 className="font-bold text-slate-900 dark:text-white">Flight to {flight.arrival.airport}</h4>
                            <span className="text-xs text-slate-500 font-medium">Direct · {flight.duration}</span>
                        </div>

                        <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-6">
                            <div className="flex gap-6">
                                {/* Timeline */}
                                <div className="flex flex-col items-center pt-1">
                                    <div className="w-3 h-3 rounded-full border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900"></div>
                                    <div className="w-[2px] h-16 bg-slate-200 dark:bg-slate-700 my-1"></div>
                                    <div className="w-3 h-3 rounded-full border-2 border-slate-900 dark:border-white bg-white dark:bg-slate-900"></div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-8">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white">{flight.departure.time}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">• {flight.departure.airport}</span>
                                        </div>
                                        <div className="text-sm text-slate-500">Thu, Jan 22</div>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-bold text-slate-900 dark:text-white">{flight.arrival.time}</span>
                                            <span className="text-sm font-bold text-slate-900 dark:text-white">• {flight.arrival.airport}</span>
                                        </div>
                                        <div className="text-sm text-slate-500">Thu, Jan 22</div>
                                    </div>
                                </div>

                                {/* Airline Info */}
                                <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{flight.airline}</span>
                                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                            <Plane className="w-3 h-3 text-slate-500" />
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400">{flight.flightNumber} · Economy</div>
                                    <div className="text-xs text-slate-400">Flight time {flight.duration}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Baggage */}
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Baggage</h4>
                        <div className="flex items-start gap-4">
                            <Luggage className="w-5 h-5 text-slate-400 mt-0.5" />
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">1 carry-on bag</div>
                                        <div className="text-xs text-slate-500">23 x 36 x 56 cm • Max weight 7 kg</div>
                                    </div>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">Included</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Fare Rules */}
                    <div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Fare rules</h4>
                        <div className="space-y-3">
                            <div className="flex items-start gap-4">
                                <CalendarCheck className="w-5 h-5 text-slate-400 mt-0.5" />
                                <div>
                                    <div className="text-sm text-slate-700 dark:text-slate-300">You're allowed to change this flight for a fee</div>
                                    <div className="text-xs text-slate-500">Helpful policy information</div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
                    <div>
                        <div className="text-sm text-slate-500">Total Price</div>
                        <div className="text-2xl font-black text-slate-900 dark:text-white">${flight.price}</div>
                    </div>
                    <button
                        onClick={onConfirm}
                        className="px-8 py-3 rounded-full bg-[#FF5E1F] hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/20 transition-all active:scale-95"
                    >
                        Select Flight
                    </button>
                </div>
            </div>
        </div>
    )
}
