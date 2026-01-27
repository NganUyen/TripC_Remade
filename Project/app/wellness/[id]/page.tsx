"use client"

import { useState } from 'react'
import { useParams, useRouter, notFound } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    Share,
    Heart,
    MapPin,
    Calendar,
    Star,
    CheckCircle,
    User,
    Flower2,
    Utensils,
    Moon,
    EyeOff,
    ChevronRight,
    MessageSquare,
    Zap
} from 'lucide-react'
import { wellnessExperiences } from '@/data/wellness'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

export default function WellnessDetailPage() {
    const params = useParams()
    const router = useRouter()

    // Parse ID and find experience
    const id = Number(params.id)
    const experience = wellnessExperiences.find(item => item.id === id)

    // State for carousel
    const [currentImageIndex, setCurrentImageIndex] = useState(0)

    // Handle not found
    if (!experience) {
        return notFound()
    }

    const nextImage = () => {
        if (experience.images && experience.images.length > 0) {
            setCurrentImageIndex((prev: number) => (prev + 1) % experience.images!.length)
        }
    }

    const prevImage = () => {
        if (experience.images && experience.images.length > 0) {
            setCurrentImageIndex((prev: number) => (prev - 1 + experience.images!.length) % experience.images!.length)
        }
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FF5E1F]/20">

            <section className="relative h-[80vh] w-full overflow-hidden hero-mask group" style={{ borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}>
                <div className="absolute inset-0 bg-slate-900">
                    {experience.images?.map((img, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: index === currentImageIndex ? 1 : 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0"
                        >
                            <img
                                alt={`${experience.title} - Image ${index + 1}`}
                                className="w-full h-full object-cover"
                                src={img}
                            />
                        </motion.div>
                    ))}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                </div>

                {/* Carousel Navigation */}
                {experience.images && experience.images.length > 1 && (
                    <>
                        <button
                            onClick={(e) => { e.stopPropagation(); prevImage(); }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-30"
                        >
                            <ChevronRight className="w-6 h-6 rotate-180" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); nextImage(); }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-md flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-30"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>
                        {/* Indicators */}
                        <div className="absolute bottom-32 left-1/2 -translate-x-1/2 flex gap-2 z-30">
                            {experience.images.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? "w-8 bg-[#FF5E1F]" : "w-2 bg-white/50 hover:bg-white/80"
                                        }`}
                                />
                            ))}
                        </div>
                    </>
                )}

                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <button
                        onClick={() => router.back()}
                        className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all"
                    >
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                            <Share className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-24 left-12 right-12 text-white z-20">
                    {experience.badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1F]/90 text-xs font-bold uppercase tracking-wider mb-4">
                            <Zap className="w-[14px] h-[14px]" />
                            {experience.badge}
                        </div>
                    )}
                    <h1 className="text-5xl md:text-7xl font-extrabold mb-4 tracking-tight">{experience.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-sm md:text-base opacity-90">
                        <span className="flex items-center gap-1"><MapPin className="text-[#FF5E1F] w-5 h-5" /> {experience.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="text-[#FF5E1F] w-5 h-5" /> {experience.duration} Experience</span>
                        <span className="flex items-center gap-1"><Star className="text-yellow-400 fill-yellow-400 w-5 h-5" /> {experience.rating} ({experience.reviews} Reviews)</span>
                    </div>
                </div>

            </section>

            <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-30">
                <div className="bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-md border border-white/30 dark:border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 w-full">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">Check-in / Check-out</label>
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                            <Calendar className="text-slate-400 w-5 h-5" />
                            <span className="text-sm font-semibold">Select Dates</span>
                        </div>
                    </div>
                    <div className="flex-1 w-full">
                        <label className="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400 mb-1 block">Guests</label>
                        <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-3 rounded-xl">
                            <User className="text-slate-400 w-5 h-5" />
                            <span className="text-sm font-semibold">2 Adults</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end pr-4">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">Starting from</span>
                        <span className="text-3xl font-extrabold text-[#FF5E1F]">${experience.price}</span>
                    </div>
                    <button className="w-full md:w-auto px-10 py-4 bg-[#FF5E1F] text-white font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#FF5E1F]/25">
                        Reserve Now
                    </button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-3 gap-16">
                <div className="lg:col-span-2 space-y-16">
                    {/* About Section */}
                    <section>
                        <h2 className="text-3xl font-bold mb-4">About this Experience</h2>
                        <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed">
                            {experience.description}
                        </p>
                    </section>

                    {/* Features */}
                    <section>
                        <h2 className="text-3xl font-bold mb-8">What to Expect</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {experience.features?.map((feature, i) => (
                                <div key={i} className="flex gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="w-12 h-12 rounded-2xl bg-[#FF5E1F]/10 flex items-center justify-center shrink-0">
                                        <div className="material-icons-outlined text-[#FF5E1F] w-6 h-6 flex items-center justify-center">
                                            {/* Mapping icons manually as we're using lucide elsewhere but data has material names */}
                                            {feature.icon === 'spa' && <Flower2 className="w-6 h-6" />}
                                            {feature.icon === 'restaurant' && <Utensils className="w-6 h-6" />}
                                            {feature.icon === 'nights_stay' && <Moon className="w-6 h-6" />}
                                            {feature.icon === 'visibility_off' && <EyeOff className="w-6 h-6" />}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{feature.title}</h4>
                                        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                                    </div>
                                </div>
                            )) || (
                                    <p className="text-slate-500">Detailed features coming soon.</p>
                                )}
                        </div>
                    </section>

                    {/* Captured Moments */}
                    <section>
                        <div className="flex justify-between items-end mb-8">
                            <div>
                                <h2 className="text-3xl font-bold">Captured Moments</h2>
                                <p className="text-slate-500">Real photos shared by our wellness community</p>
                            </div>
                            <button className="text-[#FF5E1F] font-bold hover:underline flex items-center gap-1">
                                View All <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[500px]">
                            {experience.images?.slice(0, 4).map((img, i) => (
                                <div key={i} className={`rounded-3xl overflow-hidden group relative ${i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'col-span-2' : ''}`}>
                                    <img alt={`Moment ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={img} />
                                    {i === 0 && <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>}
                                </div>
                            )) || (
                                    <div className="col-span-4 h-full bg-slate-100 dark:bg-slate-800 rounded-3xl flex items-center justify-center text-slate-400">
                                        No gallery available
                                    </div>
                                )}
                        </div>
                    </section>

                    {/* Verified Reviews */}
                    <section>
                        <div className="flex items-center gap-4 mb-8">
                            <h2 className="text-3xl font-bold">Verified Reviews</h2>
                            <div className="px-4 py-1.5 rounded-full bg-white/70 dark:bg-[#1e1e1e]/70 border border-[#FF5E1F]/20 flex items-center gap-2">
                                <CheckCircle className="text-[#FF5E1F] w-4 h-4" />
                                <span className="font-bold text-sm">{experience.rating}/5.0</span>
                            </div>
                        </div>
                        <div className="space-y-6">
                            {experience.reviewsList?.map((review, i) => (
                                <div key={i} className="bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-md p-8 rounded-3xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-full bg-slate-200 overflow-hidden">
                                                <img alt={review.name} src={review.image} className="w-full h-full object-cover" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-lg">{review.name}</h4>
                                                <p className="text-sm text-slate-500">{review.date} • {review.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex text-yellow-400">
                                            {[...Array(5)].map((_, starI) => (
                                                <Star key={starI} className={`w-5 h-5 ${starI < Math.floor(review.rating) ? 'fill-yellow-400' : 'text-slate-300'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed italic">
                                        "{review.comment}"
                                    </p>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Sidebar */}
                <aside className="space-y-12">
                    <div className="sticky top-24 space-y-12">
                        {/* Map Card */}
                        <div className="rounded-[2rem] overflow-hidden bg-white/70 dark:bg-[#1e1e1e]/70 backdrop-blur-md p-2 border border-slate-100 dark:border-slate-800 shadow-lg">
                            <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-3xl relative overflow-hidden">
                                <img alt="Map mockup" className="w-full h-full object-cover opacity-60 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA5eYiJsfsP5DI-NSwOPxGaGjyW4dUWgritaNFpBatbCGBLGoKf5elLh3lSD3fHWLo-NtdjUcXwpsUiHf3iVykW3eRiEZfETy8_ABa067Y_iSxugdUP2HTQrqmkDpyL_aXrLdE9h08sUnOKcpqdXvWIc6UziwigHtsy6A4NbruFN8eC31TUFTN5PPNSLNy_HEqqw8qd-m19GD0V6e6PEFPawb-HjXlFteP4dTH34zpHSNF19GEiBgG-HQjhb0raGWUPGLqq5Xpi8mw" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-12 h-12 bg-[#FF5E1F] rounded-full flex items-center justify-center text-white shadow-xl animate-bounce">
                                        <MapPin className="w-6 h-6" />
                                    </div>
                                </div>
                                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur p-3 rounded-2xl flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Address</p>
                                        <p className="text-xs font-semibold">{experience.location}</p>
                                    </div>
                                    <button className="bg-[#FF5E1F]/10 text-[#FF5E1F] p-2 rounded-xl">
                                        <ArrowLeft className="w-4 h-4 rotate-180" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Similar Retreats */}
                        <div>
                            <div className="flex items-center gap-2 mb-6">
                                <Zap className="text-[#FF5E1F] w-5 h-5" />
                                <h3 className="font-extrabold text-xl">AI Similar retreats</h3>
                            </div>
                            <div className="space-y-4">
                                {wellnessExperiences.filter(e => e.id !== experience.id).slice(0, 3).map(sim => (
                                    <Link key={sim.id} href={`/wellness/${sim.id}`}>
                                        <div className="flex gap-4 p-3 rounded-3xl hover:bg-white dark:hover:bg-slate-800/50 transition-colors group cursor-pointer">
                                            <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                                                <img alt={sim.title} className="w-full h-full object-cover" src={sim.image} />
                                            </div>
                                            <div className="flex flex-col justify-center">
                                                <h5 className="font-bold text-sm group-hover:text-[#FF5E1F] transition-colors">{sim.title}</h5>
                                                <p className="text-[11px] text-slate-500 mb-1">{sim.location}</p>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-bold text-[#FF5E1F]">${sim.price}</span>
                                                    <span className="text-[10px] bg-yellow-400/20 text-yellow-600 px-2 py-0.5 rounded-full font-bold">★ {sim.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Help Card */}
                        <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-[2rem] text-white relative overflow-hidden">
                            <div className="relative z-10">
                                <h4 className="text-xl font-bold mb-2">Need Help?</h4>
                                <p className="text-sm text-slate-400 mb-6">Our wellness experts are available 24/7 to help plan your perfect retreat.</p>
                                <button className="w-full py-3 bg-white text-slate-900 font-bold rounded-2xl flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors">
                                    <MessageSquare className="w-4 h-4" /> Chat with us
                                </button>
                            </div>
                            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#FF5E1F]/20 rounded-full blur-3xl"></div>
                        </div>
                    </div>
                </aside>
            </main>

            <div className="md:hidden fixed bottom-6 left-6 right-6 z-50">
                <button className="w-full py-4 bg-[#FF5E1F] text-white font-bold rounded-2xl shadow-2xl flex items-center justify-center gap-2">
                    Book Now • ${experience.price}
                </button>
            </div>

            <Footer />
        </main>
    )
}
