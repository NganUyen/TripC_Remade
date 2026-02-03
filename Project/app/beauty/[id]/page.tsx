"use client"

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import { beautyApi } from '@/lib/beauty/api'
import type { BeautyService, BeautyVenue, BeautyAppointment } from '@/lib/beauty/types'

import { BeautyDetailSkeleton } from '@/components/beauty/BeautyDetailSkeleton'
import { BeautyLocationSection } from '@/components/beauty/BeautyLocationSection'

function formatDate(d: Date): string {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
}

export default function BeautyDetailPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useUser()
    const id = typeof params?.id === 'string' ? params.id : null
    const [service, setService] = useState<BeautyService | null>(null)
    const [venue, setVenue] = useState<BeautyVenue | null>(null)
    const [guestName, setGuestName] = useState('')
    const [guestEmail, setGuestEmail] = useState('')
    const [loading, setLoading] = useState(!!id)
    const [bookingLoading, setBookingLoading] = useState(false)
    const [bookingMessage, setBookingMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

    useEffect(() => {
        if (user) {
            setGuestName(user.fullName || '')
            setGuestEmail(user.primaryEmailAddress?.emailAddress || '')
        }
    }, [user])

    useEffect(() => {
        if (!id) {
            setLoading(false)
            return
        }
        beautyApi
            .getServiceById(id)
            .then((s) => {
                setService(s)
                return s.venue_id ? beautyApi.getVenueById(s.venue_id) : null
            })
            .then((v) => v && setVenue(v))
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [id])

    async function handleBookAppointment() {
        setBookingMessage(null)
        if (!guestName || !guestEmail) {
            setBookingMessage({ type: 'error', text: 'Please provide name and email.' })
            return
        }
        const venueId = service?.venue_id ?? venue?.id
        if (!venueId) {
            setBookingMessage({ type: 'error', text: 'Cannot book: venue not found.' })
            return
        }
        setBookingLoading(true)
        try {
            const tomorrow = new Date()
            tomorrow.setDate(tomorrow.getDate() + 1)
            const dateStr = formatDate(tomorrow)
            const appointment: BeautyAppointment = await beautyApi.createAppointment(
                {
                    venue_id: venueId,
                    service_id: service?.id ?? undefined,
                    appointment_date: dateStr,
                    appointment_time: '10:00',
                    guest_name: guestName.trim(),
                    guest_email: guestEmail,
                },
                { headers: { 'x-user-id': user?.id ?? '' } },
            )
            const code = appointment.appointment_code
            setBookingMessage({
                type: 'success',
                text: code ? `Booked! Your code: ${code}.` : "Booked successfully!",
            })
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Booking failed. Please try again.'
            setBookingMessage({ type: 'error', text: message })
        } finally {
            setBookingLoading(false)
        }
    }

    const title = service?.name
    const description = service?.description
    const heroImage = service?.image_url
    const price = service?.price
    const duration = service?.duration_minutes
    const venueName = venue?.name

    if (loading) {
        return <BeautyDetailSkeleton />
    }

    if (!service) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center flex-col gap-4">
                <p className="text-zinc-500 font-medium">Service not found.</p>
                <button
                    onClick={() => router.back()}
                    className="text-primary font-bold hover:underline"
                >
                    Go Back
                </button>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#181210] dark:text-[#f5f1f0] min-h-screen pb-safe">
            {/* Hero Section */}
            <section className="relative w-full h-[50vh] min-h-[400px] md:h-[600px] overflow-hidden rounded-b-[2.5rem] md:rounded-b-[4rem] shadow-2xl z-0">
                <div
                    className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover transition-transform duration-1000 hover:scale-105"
                    style={{ backgroundImage: `url("${heroImage}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="absolute top-6 left-6 md:top-10 md:left-10 z-20 flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all drop-shadow-md hover:scale-105 active:scale-95"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

                <div className="absolute bottom-8 left-6 md:bottom-12 md:left-12 lg:left-40 max-w-3xl pr-6">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="font-display text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] tracking-tight mb-4"
                    >
                        {title}
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-white/90 text-base md:text-xl font-light max-w-xl leading-relaxed line-clamp-3 md:line-clamp-none"
                    >
                        {description}
                    </motion.p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-4 md:px-8 lg:px-12 py-12 md:py-20">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 relative">

                    {/* Main Content Column */}
                    <div className="flex-1 space-y-12 md:space-y-16 min-w-0">

                        {/* Highlights */}
                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 md:mb-8 flex items-center gap-3">
                                <span>Service Highlights</span>
                                <div className="h-px flex-1 bg-zinc-200 dark:bg-zinc-800 ml-4"></div>
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                <div className="p-5 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-start gap-4 hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-3 bg-primary/5 dark:bg-primary/20 rounded-xl shadow-sm shrink-0">
                                        <span className="material-symbols-outlined text-primary">eco</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base md:text-lg mb-1">Organic Products</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Exclusively using ECOCERT certified oils and serums.</p>
                                    </div>
                                </div>
                                <div className="p-5 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-start gap-4 hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-3 bg-primary/5 dark:bg-primary/20 rounded-xl shadow-sm shrink-0">
                                        <span className="material-symbols-outlined text-primary">psychology</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base md:text-lg mb-1">Expert Therapists</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Treatment administered by CIDESCO certified professionals.</p>
                                    </div>
                                </div>
                                <div className="p-5 md:p-6 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl flex items-start gap-4 hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-3 bg-primary/5 dark:bg-primary/20 rounded-xl shadow-sm shrink-0">
                                        <span className="material-symbols-outlined text-primary">bolt</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base md:text-lg mb-1">Advanced Tech</h4>
                                        <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">Micro-current and ultrasonic infusion included.</p>
                                    </div>
                                </div>
                                <div className="p-5 md:p-6 bg-sage/5 dark:bg-sage/10 border border-sage/20 dark:border-sage/20 rounded-2xl flex items-start gap-4 hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-3 bg-white dark:bg-zinc-800 rounded-xl shadow-sm shrink-0">
                                        <span className="material-symbols-outlined text-sage">auto_awesome</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-base md:text-lg text-sage-800 dark:text-sage mb-1">Holistic Care</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Mind-skin connection through aromatic sequences.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* About */}
                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 flex items-center gap-3">
                                <span>About</span>
                            </h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-600 dark:text-zinc-300 space-y-4 leading-relaxed">
                                <p>The Radiance Renewal Facial is more than just a skincare treatment; it's a sensory journey curated by experts. We begin with a deep double-cleansing process using botanically infused oils, followed by a gentle enzymatic exfoliation that reveals fresh, oxygenated skin cells.</p>
                                <p>Our unique technique combines traditional lymphatic drainage massage with modern micro-current technology to lift, tone, and depuff. The treatment culminates in a custom-blended hydro-jelly mask, tailored to your specific skin needs, ensuring you leave with an undeniable "post-spa" glow.</p>
                            </div>
                        </section>

                        {/* Ritual Steps */}
                        <section>
                            <h2 className="font-display text-2xl md:text-3xl font-bold mb-8 text-center">The Beauty Ritual</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                                {[
                                    { icon: 'water_drop', label: 'Cleansing' },
                                    { icon: 'layers', label: 'Exfoliation' },
                                    { icon: 'auto_fix_high', label: 'Infusion' },
                                    { icon: 'face_6', label: 'Masking' }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center group cursor-default">
                                        <div className="w-16 h-16 md:w-20 md:h-20 mb-4 rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 flex items-center justify-center group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/10 transition-all duration-300">
                                            <span className="material-symbols-outlined text-2xl text-zinc-400 group-hover:text-primary transition-colors">{step.icon}</span>
                                        </div>
                                        <span className="text-xs md:text-sm font-bold uppercase tracking-widest text-zinc-600 dark:text-zinc-400 group-hover:text-primary transition-colors">{step.label}</span>
                                        <span className="text-[10px] text-zinc-400 mt-1 font-mono">STEP 0{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* AI Prediction */}
                        <section className="bg-gradient-to-br from-primary/5 to-transparent dark:from-primary/10 rounded-3xl p-8 border border-primary/10 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <span className="material-symbols-outlined text-9xl text-primary">flare</span>
                            </div>
                            <div className="relative z-10">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <span className="material-symbols-outlined text-primary text-xl">temp_preferences_custom</span>
                                    </div>
                                    <h2 className="font-display text-lg font-bold text-primary">AI Glow Prediction</h2>
                                </div>
                                <p className="text-zinc-700 dark:text-zinc-300 text-lg md:text-xl leading-relaxed font-serif italic">
                                    "Based on your profile, expect a <span className="text-primary font-bold decoration-primary/30 underline decoration-2 underline-offset-4">40% increase</span> in skin hydration and immediate luminosity post-treatment. Best results are achieved with our bi-weekly ritual schedule."
                                </p>
                            </div>
                        </section>
                    </div>

                    {/* Sidebar Column */}
                    <div className="lg:w-[380px] xl:w-[420px] shrink-0">
                        <div className="sticky top-24 space-y-6">
                            <div className="p-6 md:p-8 bg-white dark:bg-zinc-900 rounded-[2rem] border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/50 dark:shadow-none">
                                <div className="flex justify-between items-start mb-8 pb-8 border-b border-zinc-100 dark:border-zinc-800">
                                    <div>
                                        <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold mb-1">Total Price</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-display font-black text-slate-900 dark:text-white">${price}</span>
                                            <span className="text-zinc-400 font-medium">/ session</span>
                                        </div>
                                    </div>
                                    <div className="text-right bg-zinc-50 dark:bg-zinc-800 px-3 py-2 rounded-lg">
                                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold mb-1">Duration</p>
                                        <p className="text-base font-bold text-slate-900 dark:text-white flex items-center justify-end gap-1">
                                            <span className="material-symbols-outlined text-sm">schedule</span>
                                            {duration}m
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                                        <span className="material-symbols-outlined text-green-500 mt-0.5">check_circle</span>
                                        <span className="text-sm leading-snug">Free Cancellation up to 24h before appointment</span>
                                    </div>
                                    <div className="flex items-start gap-3 text-zinc-600 dark:text-zinc-400">
                                        <span className="material-symbols-outlined text-blue-500 mt-0.5">verified_user</span>
                                        <span className="text-sm leading-snug">Health & Safety protocols active at this venue</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mb-6">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-zinc-500 ml-1">GUEST DETAILS</label>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            value={guestName}
                                            onChange={(e) => setGuestName(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3.5 text-sm outline-none transition-all placeholder:text-zinc-400"
                                        />
                                        <input
                                            type="email"
                                            placeholder="Email Address"
                                            value={guestEmail}
                                            onChange={(e) => setGuestEmail(e.target.value)}
                                            className="w-full bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700 focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-xl px-4 py-3.5 text-sm outline-none transition-all placeholder:text-zinc-400"
                                        />
                                    </div>
                                </div>

                                {bookingMessage && (
                                    <div
                                        className={`mb-6 p-4 rounded-xl text-sm font-medium flex items-start gap-3 ${bookingMessage.type === 'success'
                                            ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-100 dark:border-green-800'
                                            : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-100 dark:border-red-800'
                                            }`}
                                    >
                                        <span className="material-symbols-outlined text-lg">
                                            {bookingMessage.type === 'success' ? 'check_circle' : 'error'}
                                        </span>
                                        {bookingMessage.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleBookAppointment}
                                    disabled={bookingLoading}
                                    className="w-full py-4 bg-primary hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    {bookingLoading ? (
                                        <>
                                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        'Book Appointment'
                                    )}
                                </button>

                                <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-xs font-bold text-zinc-500 uppercase">Available Therapists</span>
                                        <span className="text-xs font-bold text-primary cursor-pointer hover:underline">View All</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="flex -space-x-3">
                                            {[1, 2, 3].map((_, i) => (
                                                <div key={i} className="w-10 h-10 rounded-full border-2 border-white dark:border-zinc-800 bg-zinc-200 dark:bg-zinc-700" />
                                            ))}
                                        </div>
                                        <span className="text-xs text-zinc-500 font-medium">+12 professionals available</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {venue && <BeautyLocationSection venue={venue} />}
        </div>
    )
}
