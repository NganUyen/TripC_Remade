"use client"
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { SearchHistoryDropdown } from './SearchHistoryDropdown'

import { useState, useEffect, useMemo } from 'react'
import { SelectPopup } from '../ui/SelectPopup'
import { CounterInput } from '../ui/CounterInput'
import { SimpleCalendar as Calendar } from '../ui/SimpleCalendar'
import { useAuth } from "@clerk/nextjs"

export function TransportHero() {
    const router = useRouter()
    const { userId } = useAuth()
    const [serviceType, setServiceType] = useState('one-way') // 'one-way' | 'hourly'
    const [bookingMode, setBookingMode] = useState('address') // 'address' | 'map'
    const [duration, setDuration] = useState('4h')
    const [date, setDate] = useState<Date | null>(null)
    const [showHistory, setShowHistory] = useState(false)

    // Set default time to 2 hours from now
    const getDefaultTime = () => {
        const now = new Date()
        now.setHours(now.getHours() + 2)
        const hours = now.getHours()
        const minutes = now.getMinutes() >= 30 ? 30 : 0
        const h = hours % 12 || 12
        const ampm = hours < 12 ? 'AM' : 'PM'
        const hourStr = h < 10 ? `0${h}` : `${h}`
        return `${hourStr}:${minutes === 0 ? '00' : '30'} ${ampm}`
    }

    const [time, setTime] = useState(getDefaultTime())

    // Passengers & Luggage State
    const [passengers, setPassengers] = useState({ adults: 1, children: 0, luggage: 2 })
    const [activeTab, setActiveTab] = useState<'date' | 'time' | 'passengers' | null>(null)

    // Locations
    const [pickup, setPickup] = useState('')
    const [dropoff, setDropoff] = useState('')

    // Time options generation
    const timeOptions = useMemo(() => {
        const options = []
        const now = new Date();
        const isToday = date && date.toDateString() === now.toDateString();

        // If today, only show times > now + 1 hour (buffer)
        // If no date selected, we can show all or wait. Let's show all for better UX before date pick.

        for (let i = 0; i < 24; i++) {
            const h = i % 12 || 12
            const ampm = i < 12 ? 'AM' : 'PM'
            const hourStr = h < 10 ? `0${h}` : `${h}`
            const timeStr = `${hourStr}:00 ${ampm}`
            const timeStrHalf = `${hourStr}:30 ${ampm}`

            // Helper to check validity
            const checkTime = (str: string) => {
                if (!isToday) return true;

                const [t, m] = str.split(' ');
                let [hh, mm] = t.split(':').map(Number);
                if (m === 'PM' && hh < 12) hh += 12;
                if (m === 'AM' && hh === 12) hh = 0;

                const slotTime = new Date(date!);
                slotTime.setHours(hh, mm, 0, 0);

                const diff = (slotTime.getTime() - now.getTime()) / (1000 * 60); // minutes
                return diff >= 60; // 1 hour buffer
            }

            if (checkTime(timeStr)) options.push(timeStr);
            if (checkTime(timeStrHalf)) options.push(timeStrHalf);
        }
        return options
    }, [date])

    const updatePassengers = (type: keyof typeof passengers, operation: 'add' | 'sub') => {
        setPassengers(prev => {
            const newValue = operation === 'add' ? prev[type] + 1 : prev[type] - 1
            if (newValue < 0) return prev
            // Basic adult validation
            if (type === 'adults' && newValue < 1) return prev
            return { ...prev, [type]: newValue }
        })
    }

    const totalPassengers = passengers.adults + passengers.children

    const handleSwap = () => {
        const temp = pickup
        setPickup(dropoff)
        setDropoff(temp)
    }

    const validateTime = (selectedDate: Date | null, selectedTime: string) => {
        if (!selectedDate || !selectedTime) return true;

        const now = new Date();
        const selected = new Date(selectedDate);

        // Parse 12h time to 24h
        const [timePart, ampm] = selectedTime.split(' ');
        let [hours, minutes] = timePart.split(':').map(Number);
        if (ampm === 'PM' && hours < 12) hours += 12;
        if (ampm === 'AM' && hours === 12) hours = 0;

        selected.setHours(hours, minutes, 0, 0);

        const diffMinutes = (selected.getTime() - now.getTime()) / 1000 / 60;

        if (diffMinutes < 60) {
            toast.error("Invalid Time", {
                description: "Booking must be at least 1 hour in advance."
            });
            return false;
        }
        return true;
    }

    const handleSearch = async () => {
        if (!pickup) {
            toast.error("Thiếu điểm đón", { description: "Vui lòng nhập điểm đón khách!" });
            return;
        }
        if (serviceType === 'one-way' && !dropoff) {
            toast.error("Thiếu điểm đến", { description: "Vui lòng nhập điểm đến!" });
            return;
        }
        if (!date) {
            toast.error("Thiếu thông tin ngày đi", { description: "Vui lòng chọn ngày khởi hành!" });
            return;
        }
        if (!time) {
            toast.error("Thiếu thông tin giờ đón", { description: "Vui lòng chọn giờ đón khách!" });
            return;
        }

        if (!validateTime(date, time)) return;

        // Save History (Fire & Forget)
        if (userId) {
            fetch('/api/user/history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    origin: pickup,
                    destination: dropoff,
                    searchDate: new Date().toISOString()
                })
            });
        }

        const params = new URLSearchParams();
        params.set('origin', pickup);
        params.set('destination', dropoff);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        params.set('date', `${y}-${m}-${d}`);
        params.set('time', time);
        params.set('passengers', String(passengers.adults + passengers.children));
        if (serviceType === 'hourly') {
            params.set('serviceType', 'hourly');
            params.set('duration', duration);
        }

        router.push(`/transport/results?${params.toString()}`);
    }

    return (
        <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center px-4 py-12 lg:px-0">
            {/* Background - City Nightscape */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div
                    className="w-full h-full bg-cover bg-center bg-no-repeat scale-105"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1519501025264-65ba15a82390?q=80&w=2864&auto=format&fit=crop')" }}
                >
                    <div className="absolute inset-0 bg-black/40"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-[1440px] px-4 lg:px-12 flex flex-col items-center">

                {/* Hero Headings */}
                <div className="text-center mb-10 max-w-4xl animate-fadeIn">
                    <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tight mb-4 drop-shadow-2xl">
                        Premium Chauffeur Services
                    </h1>
                    <p className="text-white/90 text-lg md:text-xl font-medium drop-shadow-md max-w-2xl mx-auto tracking-wide">
                        Arrive in style. Reliable airport transfers and hourly charters.
                    </p>
                </div>

                {/* Search Panel */}
                <div className="w-full max-w-[1100px] relative">
                    <div className="rounded-[2rem] p-6 md:p-8 shadow-2xl bg-white/80 dark:bg-[#18181b]/90 backdrop-blur-xl border border-white/20 relative z-20 pb-16 transition-colors duration-300">

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4 border-b border-black/5 dark:border-white/10 pb-0">
                            {/* Tabs */}
                            <div className="flex gap-6 w-fit">
                                {[
                                    { id: 'one-way', label: 'One Way Transfer' },
                                    { id: 'hourly', label: 'Hourly Charter' }
                                ].map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setServiceType(tab.id)}
                                        className={`relative pb-3 text-sm font-bold tracking-wide transition-all ${serviceType === tab.id ? 'text-primary' : 'text-slate-600 dark:text-white/60 hover:text-black dark:hover:text-white'}`}
                                    >
                                        {tab.label.toUpperCase()}
                                        <span className={`absolute bottom-0 left-0 w-full h-[3px] bg-primary rounded-t-full transition-transform duration-300 ${serviceType === tab.id ? 'scale-x-100' : 'scale-x-0'}`}></span>
                                    </button>
                                ))}
                            </div>

                            {/* Address/Map Toggle (Only visible in One-Way) */}
                            {serviceType === 'one-way' && (
                                <div className="flex bg-slate-100 dark:bg-white/10 rounded-full p-1 mb-2">
                                    <button
                                        onClick={() => setBookingMode('address')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bookingMode === 'address' ? 'bg-white dark:bg-[#18181b] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        Enter Address
                                    </button>
                                    <button
                                        onClick={() => setBookingMode('map')}
                                        className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${bookingMode === 'map' ? 'bg-white dark:bg-[#18181b] shadow-sm text-slate-900 dark:text-white' : 'text-slate-500 dark:text-white/40 hover:text-slate-900 dark:hover:text-white'}`}
                                    >
                                        Pin on Map
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Search Grid */}
                        <div className="flex flex-col gap-4">
                            {/* Row 1: Locations */}
                            {bookingMode === 'map' && serviceType === 'one-way' ? (
                                <div className="h-[64px] bg-slate-100 dark:bg-white/5 border-2 border-dashed border-slate-300 dark:border-white/20 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-white/40 font-bold animate-fadeIn">
                                    <span className="material-symbols-outlined">map</span>
                                    Interactive Map Selection Coming Soon
                                </div>
                            ) : (
                                <div className="flex flex-col md:grid md:grid-cols-12 gap-3 relative items-center animate-fadeIn">

                                    {/* PICKUP (5 Cols) */}
                                    <div className="w-full md:col-span-5 relative">
                                        <div className="h-[64px] bg-white/50 dark:bg-white/5 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group">
                                            <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Pickup Location</label>
                                            <input
                                                type="text"
                                                value={pickup}
                                                onChange={(e) => setPickup(e.target.value)}
                                                onFocus={() => setShowHistory(true)}
                                                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                                                className="bg-transparent border-none outline-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full truncate placeholder:text-slate-400/80 dark:placeholder:text-white/30"
                                                placeholder="Enter pickup address"
                                            />
                                        </div>
                                        {showHistory && (
                                            <SearchHistoryDropdown
                                                onSelect={(o, d) => {
                                                    setPickup(o);
                                                    setDropoff(d);
                                                    setShowHistory(false);
                                                }}
                                            />
                                        )}
                                    </div>

                                    {/* SWAP / SEPARATOR */}
                                    <div className="md:col-span-2 relative flex justify-center z-30 my-[-18px] md:my-0">
                                        {serviceType === 'one-way' ? (
                                            <button
                                                onClick={handleSwap}
                                                className="w-10 h-10 rounded-full bg-white dark:bg-[#2a2a2a] border border-slate-200 dark:border-white/20 flex items-center justify-center text-slate-600 dark:text-white/80 hover:text-primary hover:border-primary shadow-lg transition-all md:absolute md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 rotate-90 md:rotate-0"
                                            >
                                                <span className="material-symbols-outlined text-xl">sync_alt</span>
                                            </button>
                                        ) : (
                                            <div className="hidden md:block w-px h-10 bg-black/10 dark:bg-white/10 mx-auto"></div>
                                        )}
                                    </div>

                                    {/* DROPOFF or DURATION (5 Cols) */}
                                    <div className="w-full md:col-span-5 h-[64px] bg-white/50 dark:bg-white/5 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/50 group relative">
                                        {serviceType === 'one-way' ? (
                                            <>
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Dropoff Location</label>
                                                <input
                                                    type="text"
                                                    value={dropoff}
                                                    onChange={(e) => setDropoff(e.target.value)}
                                                    onFocus={(e) => e.target.select()}
                                                    className="bg-transparent border-none outline-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full truncate placeholder:text-slate-400/80 dark:placeholder:text-white/30"
                                                    placeholder="Enter destination"
                                                />
                                            </>
                                        ) : (
                                            <>
                                                <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Duration</label>
                                                <select
                                                    value={duration}
                                                    onChange={(e) => setDuration(e.target.value)}
                                                    className="bg-transparent border-none p-0 text-slate-900 dark:text-white font-bold text-lg focus:ring-0 w-full cursor-pointer appearance-none"
                                                >
                                                    <option value="4h">4 Hours</option>
                                                    <option value="6h">6 Hours</option>
                                                    <option value="8h">8 Hours</option>
                                                    <option value="12h">12 Hours</option>
                                                    <option value="24h">Full Day</option>
                                                </select>
                                                <span className="material-symbols-outlined absolute right-4 text-slate-400 dark:text-white/40 pointer-events-none">expand_more</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Row 2: Date - Time - Passengers */}
                            <div className="flex flex-col md:grid md:grid-cols-12 gap-3">

                                {/* DATE (4 Cols) */}
                                <div
                                    className={`w-full md:col-span-4 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group ${activeTab === 'date' ? 'bg-white dark:bg-white/10 ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setActiveTab('date')}
                                >
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Date</label>
                                    <div className={`font-bold text-lg ${date ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                        {date ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select Date'}
                                    </div>

                                    <SelectPopup
                                        isOpen={activeTab === 'date'}
                                        onClose={() => setActiveTab(null)}
                                        className="w-[340px]"
                                    >
                                        <Calendar
                                            selectedDate={date || undefined}
                                            onSelect={(d) => {
                                                setDate(d)
                                                setActiveTab(null)
                                            }}
                                            minDate={new Date()}
                                        />
                                    </SelectPopup>
                                </div>

                                {/* TIME (4 Cols) */}
                                <div
                                    className={`w-full md:col-span-4 h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 relative cursor-pointer group ${activeTab === 'time' ? 'bg-white dark:bg-white/10 ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setActiveTab('time')}
                                >
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Pickup Time</label>
                                    <div className={`font-bold text-lg ${time ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-white/40'}`}>
                                        {time || 'Select Time'}
                                    </div>

                                    <SelectPopup
                                        isOpen={activeTab === 'time'}
                                        onClose={() => setActiveTab(null)}
                                        className="w-[200px] max-h-[300px] overflow-y-auto"
                                    >
                                        <div className="flex flex-col gap-1">
                                            {timeOptions.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setTime(t)
                                                        setActiveTab(null)
                                                    }}
                                                    className={`px-3 py-2 text-left text-sm font-bold rounded-lg transition-colors ${time === t ? 'bg-primary text-white' : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/10'}`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </SelectPopup>
                                </div>

                                {/* PASSENGERS & LUGGAGE (4 Cols) */}
                                <div className={`w-full md:col-span-4 relative h-[64px] bg-white/50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 flex flex-col justify-center transition-all hover:bg-white/80 dark:hover:bg-white/10 cursor-pointer ${activeTab === 'passengers' ? 'bg-white dark:bg-white/10 ring-2 ring-primary/20' : ''}`}
                                    onClick={() => setActiveTab('passengers')}
                                >
                                    <label className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-white/40 font-bold mb-0.5">Passengers & Bags</label>
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg text-slate-900 dark:text-white">person</span>
                                            <span className="text-slate-900 dark:text-white font-bold text-lg">{totalPassengers}</span>
                                        </div>
                                        <div className="w-px h-4 bg-slate-300 dark:bg-white/20"></div>
                                        <div className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg text-slate-900 dark:text-white">business_center</span>
                                            <span className="text-slate-900 dark:text-white font-bold text-lg">{passengers.luggage}</span>
                                        </div>
                                    </div>

                                    <SelectPopup
                                        isOpen={activeTab === 'passengers'}
                                        onClose={() => setActiveTab(null)}
                                        className="w-[320px] right-0 left-auto"
                                    >
                                        <div className="flex flex-col">
                                            <CounterInput
                                                label="Adults"
                                                subLabel="Age 13+"
                                                value={passengers.adults}
                                                onChange={(v) => updatePassengers('adults', v > passengers.adults ? 'add' : 'sub')}
                                                min={1}
                                            />
                                            <CounterInput
                                                label="Children"
                                                subLabel="Age 2-12"
                                                value={passengers.children}
                                                onChange={(v) => updatePassengers('children', v > passengers.children ? 'add' : 'sub')}
                                            />
                                            <div className="w-full h-px bg-slate-100 dark:bg-white/10 my-1"></div>
                                            <CounterInput
                                                label="Luggage"
                                                subLabel="Standard Bags"
                                                value={passengers.luggage}
                                                onChange={(v) => updatePassengers('luggage', v > passengers.luggage ? 'add' : 'sub')}
                                            />

                                            <div className="pt-3 border-t border-slate-200 dark:border-white/10 mt-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        setActiveTab(null)
                                                    }}
                                                    className="w-full py-2 bg-primary hover:bg-primary-hover rounded-lg text-white font-bold text-xs uppercase tracking-wider transition-colors"
                                                >
                                                    Done
                                                </button>
                                            </div>
                                        </div>
                                    </SelectPopup>
                                </div>
                            </div>
                        </div>

                        {/* Search Button */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-40 w-full max-w-sm px-4">
                            <button
                                onClick={handleSearch}
                                className="w-full relative py-4 bg-gradient-to-r from-primary to-[#FF8C42] rounded-full shadow-[0_15px_30px_-5px_rgba(255,94,31,0.5)] transition-transform duration-300 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 overflow-hidden text-white font-black text-lg tracking-wide uppercase"
                            >
                                <span className="material-symbols-outlined text-2xl">directions_car</span>
                                {bookingMode === 'map' ? 'Select Location' : 'Search Vehicles'}
                                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent z-10"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
