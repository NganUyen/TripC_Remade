"use client"

import { useBookingStore } from "@/store/useBookingStore"
import { User, Plus, UserPlus } from "lucide-react"
import { FlightDetailsSummary } from "../FlightDetailsSummary"
import { toast } from "sonner"
import { DatePicker } from "@/components/ui/date-picker"

export function StepPassengers() {
    const { passengers, contact, updatePassenger, setContact, setStep } = useBookingStore()

    const handleContinue = () => {
        // Validate Passengers
        for (let i = 0; i < passengers.length; i++) {
            const p = passengers[i]
            if (!p.firstName?.trim() || !p.lastName?.trim()) {
                toast.error(`Please enter full name for Passenger ${i + 1}`)
                return
            }
            if (!p.dateOfBirth) {
                toast.error(`Please enter Date of Birth for Passenger ${i + 1}`)
                return
            }
            if (!p.gender) {
                toast.error(`Please select gender for Passenger ${i + 1}`)
                return
            }
            // Strict Professional Validation: Passport usually required for international, but let's at least warn if empty or make it required.
            // Requirement says "Robust passenger ... validation".
            if (!p.nationality?.trim()) {
                toast.error(`Please enter nationality for Passenger ${i + 1}`)
                return
            }
            if (!p.passportNumber?.trim()) {
                toast.error(`Please enter passport number for Passenger ${i + 1}`)
                return
            }
        }

        // Validate Contact
        if (!contact.email?.trim() || !contact.email.includes('@')) {
            toast.error("Please enter a valid email address")
            return
        }
        if (!contact.phone?.trim() || contact.phone.length < 8) {
            toast.error("Please enter a valid phone number")
            return
        }

        setStep(2) // Proceed to Seats
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

            <FlightDetailsSummary />

            {/* Passengers Loop */}
            {passengers.map((p, index) => (
                <div key={p.id}>
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-5 h-5 text-slate-900 dark:text-white" />
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">Passenger {index + 1} Details</h3>
                    </div>

                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">

                        <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-slate-500 font-medium">Select from saved travelers</span>
                                <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                    <Plus className="w-3 h-3" /> Add New
                                </button>
                            </div>

                            {/* Empty State for Saved Travelers */}
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-8 flex flex-col items-center justify-center text-center border border-dashed border-slate-200 dark:border-slate-700">
                                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                                    <UserPlus className="w-5 h-5 text-slate-400" />
                                </div>
                                <p className="text-sm text-slate-500">No saved travelers yet. Add one to speed up future bookings.</p>
                            </div>
                        </div>

                        <div className="mb-4">
                            <div className="text-sm text-slate-500 mb-4 font-medium">Or enter details manually:</div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* First Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">First Name *</label>
                                <input
                                    type="text"
                                    placeholder="As shown on passport"
                                    value={p.firstName}
                                    onChange={(e) => updatePassenger(index, { firstName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                                />
                            </div>
                            {/* Last Name */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Last Name *</label>
                                <input
                                    type="text"
                                    placeholder="As shown on passport"
                                    value={p.lastName}
                                    onChange={(e) => updatePassenger(index, { lastName: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                                />
                            </div>

                            {/* Gender */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Gender *</label>
                                <div className="relative">
                                    <select
                                        value={p.gender}
                                        onChange={(e) => updatePassenger(index, { gender: e.target.value as any })}
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all appearance-none"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                                </div>
                            </div>

                            {/* DOB */}
                            <div>
                                <DatePicker
                                    label="Date of Birth *"
                                    date={p.dateOfBirth ? new Date(p.dateOfBirth) : undefined}
                                    onSelect={(date) => updatePassenger(index, { dateOfBirth: date ? date.toISOString() : '' })}
                                    placeholder="Select Date"
                                    maxDate={new Date()}
                                    captionLayout="dropdown"
                                    fromYear={1900}
                                    toYear={new Date().getFullYear()}
                                    disabledDates={(date) => date > new Date()} // Disable future dates
                                />
                            </div>

                            {/* Nationality */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Nationality *</label>
                                <input
                                    type="text"
                                    placeholder="e.g. United States"
                                    value={p.nationality}
                                    onChange={(e) => updatePassenger(index, { nationality: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                                />
                            </div>

                            {/* Passport */}
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Passport Number *</label>
                                <input
                                    type="text"
                                    placeholder="Passport number"
                                    value={p.passportNumber}
                                    onChange={(e) => updatePassenger(index, { passportNumber: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* Contact Info */}
            <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-4 flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">@</span>
                    Contact Details
                </h3>
                <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Email *</label>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={contact.email}
                                onChange={(e) => setContact({ email: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wide">Phone *</label>
                            <input
                                type="tel"
                                placeholder="+1 234 567 890"
                                value={contact.phone}
                                onChange={(e) => setContact({ phone: e.target.value })}
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none focus:border-[#FF5E1F] focus:ring-1 focus:ring-[#FF5E1F] transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={handleContinue}
                className="w-full py-4 bg-[#FF5E1F] hover:bg-orange-600 rounded-xl text-white font-bold text-sm uppercase tracking-wider shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.005] active:scale-[0.99] flex items-center justify-center gap-2"
            >
                Continue to Seat Selection
            </button>
        </div>
    )
}
