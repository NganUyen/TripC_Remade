"use client"

import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { beautyApi } from '@/lib/beauty/api'
import type { BeautyService, BeautyVenue } from '@/lib/beauty/types'

const FALLBACK_HERO = {
    title: 'Radiance Renewal Facial',
    description: 'Transform your skin with our signature luxury ritual, designed for immediate luminosity and deep restoration.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD69V78Zoy-Xc0l_UHWAJ5LFipbj1SKZqa5c5L3kHbUrs2hNoFj24NIJKKIkonNnoGzxRSE8b1q78fZwPh5uf3GzoStSk6ObLa0OvE5F_pKEAklgpLeguvclP_q9BTb7ijUfiuDMchFndHGV6Smgy1j_dCXt1mdQVkJ366WFeBJfK0PMJtFRccq4sgZU47ApRqHNBQZOJnRJNnnxLgn_2NVGhyJ_qAIoy0RoE82WtQCO9QFH1-9OPE8DC8JG3cZNOiiY5FjesaWi48',
}
const FALLBACK_VENUE = { name: 'Aura Wellness Spa', address: '124 Avenue des Champs-Élysées, 75008 Paris, France', distance: '1.2 km away' }
const FALLBACK_PRICE = 120
const FALLBACK_DURATION = 90

export default function BeautyDetailPage() {
    const router = useRouter()
    const params = useParams()
    const id = typeof params?.id === 'string' ? params.id : null
    const [service, setService] = useState<BeautyService | null>(null)
    const [venue, setVenue] = useState<BeautyVenue | null>(null)
    const [loading, setLoading] = useState(!!id)

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
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [id])

    const title = service?.name ?? FALLBACK_HERO.title
    const description = service?.description ?? FALLBACK_HERO.description
    const heroImage = service?.image_url ?? FALLBACK_HERO.image
    const price = service?.price ?? FALLBACK_PRICE
    const duration = service?.duration_minutes ?? FALLBACK_DURATION
    const venueName = venue?.name ?? FALLBACK_VENUE.name
    const venueAddress = venue?.address ?? venue?.location_summary ?? FALLBACK_VENUE.address
    const venueDistance = venue?.location_summary ?? FALLBACK_VENUE.distance

    if (loading) {
        return (
            <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
                <div className="animate-pulse text-zinc-500 font-medium">Loading...</div>
            </div>
        )
    }

    return (
        <div className="bg-background-light dark:bg-background-dark text-[#181210] dark:text-[#f5f1f0] min-h-screen">
            <div className="absolute top-20 left-0 w-full z-[70] p-8 flex items-center pointer-events-none">
                <button
                    onClick={() => router.back()}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40 transition-all pointer-events-auto drop-shadow-md"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
            </div>

            <section className="relative w-full h-[600px] overflow-hidden rounded-b-[3rem] shadow-2xl">
                <div
                    className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover"
                    style={{ backgroundImage: `url("${heroImage}")` }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40" />
                <div className="absolute bottom-12 left-12 md:left-40 max-w-2xl">
                    <h1 className="font-display text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">{title}</h1>
                    <p className="text-white/90 text-lg md:text-xl mt-4 font-light max-w-lg">{description}</p>
                </div>
            </section>

            <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
                <div className="flex flex-col lg:flex-row gap-16 relative">
                    <div className="flex-1 space-y-16">
                        <section>
                            <h2 className="font-display text-2xl font-bold mb-8">Service Highlights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-6 bg-[#f5f1f0] dark:bg-zinc-800 rounded-2xl flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                                        <span className="material-symbols-outlined text-primary">eco</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Organic Products</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Exclusively using ECOCERT certified oils and serums.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-[#f5f1f0] dark:bg-zinc-800 rounded-2xl flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                                        <span className="material-symbols-outlined text-primary">psychology</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Expert Therapists</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Treatment administered by CIDESCO certified professionals.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-[#f5f1f0] dark:bg-zinc-800 rounded-2xl flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                                        <span className="material-symbols-outlined text-primary">bolt</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg">Advanced Tech</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Micro-current and ultrasonic infusion included.</p>
                                    </div>
                                </div>
                                <div className="p-6 bg-sage/10 dark:bg-sage/20 rounded-2xl flex items-start gap-4">
                                    <div className="p-3 bg-white dark:bg-zinc-700 rounded-xl shadow-sm">
                                        <span className="material-symbols-outlined text-sage">auto_awesome</span>
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg text-sage-700 dark:text-sage">Holistic Care</h4>
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">Mind-skin connection through aromatic sequences.</p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold mb-6">About the Treatment</h2>
                            <div className="prose prose-lg dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 space-y-4">
                                <p>The Radiance Renewal Facial is more than just a skincare treatment; it's a sensory journey curated by experts. We begin with a deep double-cleansing process using botanically infused oils, followed by a gentle enzymatic exfoliation that reveals fresh, oxygenated skin cells.</p>
                                <p>Our unique technique combines traditional lymphatic drainage massage with modern micro-current technology to lift, tone, and depuff. The treatment culminates in a custom-blended hydro-jelly mask, tailored to your specific skin needs, ensuring you leave with an undeniable "post-spa" glow.</p>
                            </div>
                        </section>

                        <section>
                            <h2 className="font-display text-2xl font-bold mb-8">The Beauty Ritual</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                                <div className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary">water_drop</span>
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-widest">Cleansing</span>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary">layers</span>
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-widest">Exfoliation</span>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary">auto_fix_high</span>
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-widest">Infusion</span>
                                </div>
                                <div className="text-center group">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center group-hover:bg-primary/5 transition-colors">
                                        <span className="material-symbols-outlined text-zinc-400 group-hover:text-primary">face_6</span>
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-widest">Masking</span>
                                </div>
                            </div>
                        </section>

                        <section className="bg-primary/5 dark:bg-primary/10 rounded-3xl p-8 border border-primary/10">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary">flare</span>
                                <h2 className="font-display text-xl font-bold">AI Glow Prediction</h2>
                            </div>
                            <p className="text-zinc-700 dark:text-zinc-300 text-lg leading-relaxed italic">
                                "Based on your profile, expect a <span className="text-primary font-bold">40% increase</span> in skin hydration and immediate luminosity post-treatment. Best results are achieved with our bi-weekly ritual schedule."
                            </p>
                        </section>
                    </div>

                    <div className="lg:w-[400px]">
                        <div className="sticky top-24 p-8 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-zinc-700 shadow-2xl">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Price</p>
                                    <p className="text-4xl font-display font-black">${price}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-zinc-500 uppercase tracking-widest font-bold">Time</p>
                                    <p className="text-xl font-bold">{duration} mins</p>
                                </div>
                            </div>
                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    <span className="text-sm">Free Cancellation (up to 24h)</span>
                                </div>
                                <div className="flex items-center gap-3 text-zinc-600 dark:text-zinc-400">
                                    <span className="material-symbols-outlined text-sm">verified_user</span>
                                    <span className="text-sm">Health & Safety protocols active</span>
                                </div>
                            </div>
                            <button className="w-full py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold text-lg shadow-lg shadow-primary/20 transition-all active:scale-[0.98]">
                                Book Appointment
                            </button>

                            <div className="mt-8 pt-8 border-t border-zinc-100 dark:border-zinc-800">
                                <p className="text-center text-zinc-500 text-sm mb-4">Select therapist</p>
                                <div className="flex justify-center -space-x-3">
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAHc-NjQMG4nuqLzVHG5dZCLx2gs9dUt5LfH-Tg4kJUG-pYescDIQ9RwjE3IamYFiHEusl-9mpnYr44M4lTAcw5-mHmDYmMNkB8qtsaL2sj5r9g8VKl4G3v0elzlOb9ObC45287YmEeGnCI7THwVpkECcnUqP1cRO3ahmZvvKlplOiXRs97uGAHSHf7M_abQ7QN5x7umSeO3Cp4n7O4O10Ykb9o-Mc6yNk_jqFCrV88jpE4zzCpRpamhJAXYk9wrpE2RPahMlLErog')" }}></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBDQHVE25D4m_uA1B9MX5S-hhyjZG14WpaM27O-n2BEmnw1Tl2njykW4DF3ECzlrG2EFE919F2wg_KZyTWcPxgPvrhhmLdi1HWmGaLuM3SU6WI-sNIFG7QOwv-FOyhx9ayCVm8VToNZxzGK2ocl8DwMSWaceE_FvApeiTMNb3REJhVpyYTx46XgrGWmu6coi6DuLiZzd8JI0CIal33rLbX_xKpHy02zIU1Ui5Uo08hEEHR6Er9Jx1jO9Olo3B4r8S9AdPMvPR1VDuw')" }}></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-200 bg-center bg-cover" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDB-SBwpbHh2-wCrlxxoQNd10eo0wFl5pRylXXEJsFlchjagHvbHPwF92C1SP35JRazA49j8APxPdDUUsWinZE62hvmF3nkQCQvYiRGtSLwluoOzqt5fStX3rOkMrCzCu1E5J_VRh1bODA4b2yj0oc8QP1RMyIAH_DFe6jy9-Idkjcs2smP3yCancz0V_U2p0v9bFJQX6afzvbgoMIsHfIeMC4y_5aS3sihBG8JaesZntxlKTmKAyXEXRXUBj7RjzLm8fDitiqH0wQ')" }}></div>
                                    <div className="w-10 h-10 rounded-full border-2 border-white bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-slate-800">+12</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
                <div className="relative w-full h-[500px] rounded-[2rem] overflow-hidden shadow-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-100">
                    <div className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover grayscale opacity-60 mix-blend-multiply transition-all duration-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBd22Z0639ZgeP5LDG4Z7EWblESyP4LatuDTxn4XDmO-n7kShtEFRzCpIWQtznAEgGsW_XMAYiOj86OMsPNyFLuzLLttfgTN1Ks2H_fVFW8pF4UJl36MaRBZDqXrpxnowB9ZadwUx2TITu8X5xcIlHhFlaaxU8ANohfNazT7nNQKmPypDPn4VD-YidbBEuIQRF3XYqhqDQiKxRngJBkBH_t3FpNNrDQfC6zWGAjBpXxEvtorVpK9Uo7Mq0wReWrFV7xM-go-Qw4IGk')" }}></div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/40 via-transparent to-white/20 pointer-events-none"></div>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="relative group">
                            <div className="absolute -inset-4 bg-primary/20 rounded-full blur-xl scale-150"></div>
                            <div className="relative bg-primary text-white p-3 rounded-full shadow-2xl border-4 border-white dark:border-zinc-900 transition-transform hover:scale-110">
                                <span className="material-symbols-outlined text-4xl leading-none">location_on</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-8 left-8 z-20">
                        <div className="bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md p-6 rounded-[1.5rem] border border-white/40 dark:border-zinc-700/50 shadow-2xl max-w-xs transition-all hover:bg-white/80 dark:hover:bg-zinc-900/80">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-green-600 dark:text-green-400">Open Now</span>
                            </div>
                            <h3 className="font-display text-xl font-bold mb-1 text-slate-900 dark:text-white">{venueName}</h3>
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">{venueAddress}</p>
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <span className="material-symbols-outlined text-sm">near_me</span>
                                    <span className="text-xs font-semibold">{venueDistance}</span>
                                </div>
                            </div>
                            <button className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-full font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
                                <span className="material-symbols-outlined text-sm">directions</span>
                                Get Directions
                            </button>
                        </div>
                    </div>
                    <div className="absolute bottom-8 right-8 flex flex-col gap-2">
                        <button className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 dark:border-zinc-700 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined">add</span>
                        </button>
                        <button className="w-12 h-12 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-xl border border-white/20 dark:border-zinc-700 shadow-lg flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined">remove</span>
                        </button>
                    </div>
                    <div className="absolute bottom-8 left-8">
                        <button className="px-4 py-2 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-sm rounded-full border border-white/20 dark:border-zinc-700 shadow-lg flex items-center gap-2 text-xs font-bold text-zinc-600 dark:text-zinc-300 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-sm">layers</span>
                            Satellite View
                        </button>
                    </div>
                </div>
            </section>
        </div>
    )
}
