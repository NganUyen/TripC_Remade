import React from 'react'
import { getWellnessById } from '@/lib/actions/wellness'
import { notFound } from 'next/navigation'
import { ArrowLeft, Share, Heart, MapPin, Calendar, Star, CheckCircle, User, Flower2, Utensils, Moon, EyeOff, ChevronRight, MessageSquare, Zap } from 'lucide-react'
import { Footer } from '@/components/Footer'
import Link from 'next/link'
import { WellnessBookingSidebar } from '@/components/wellness/WellnessBookingSidebar'

interface PageProps {
    params: {
        id: string
    }
}

export const dynamic = 'force-dynamic'

export default async function WellnessDetailPage({ params }: PageProps) {
    const experience = await getWellnessById(params.id)

    if (!experience) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-[#FAFAFA] dark:bg-[#121212] text-slate-900 dark:text-slate-100 font-sans selection:bg-[#FF5E1F]/20">
            {/* HERO SECTION */}
            <section className="relative h-[80vh] w-full overflow-hidden hero-mask group" style={{ borderBottomLeftRadius: '3rem', borderBottomRightRadius: '3rem' }}>
                <div className="absolute inset-0 bg-slate-900">
                    <img
                        alt={experience.title}
                        className="w-full h-full object-cover"
                        src={experience.image_url}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20"></div>
                </div>

                <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
                    <Link href="/wellness" className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="flex gap-3">
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                            <Share className="w-5 h-5" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/40 transition-all">
                            <Heart className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="absolute bottom-24 left-6 md:left-12 right-6 md:right-12 text-white z-20">
                    {experience.badge && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5E1F]/90 text-xs font-bold uppercase tracking-wider mb-4">
                            <Zap className="w-[14px] h-[14px]" />
                            {experience.badge}
                        </div>
                    )}
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold mb-4 tracking-tight drop-shadow-lg">{experience.title}</h1>
                    <div className="flex flex-wrap items-center gap-4 md:gap-6 text-sm md:text-base opacity-90 font-medium">
                        <span className="flex items-center gap-1"><MapPin className="text-[#FF5E1F] w-5 h-5" /> {experience.location}</span>
                        <span className="flex items-center gap-1"><Calendar className="text-[#FF5E1F] w-5 h-5" /> {experience.duration} Experience</span>
                        <span className="flex items-center gap-1"><Star className="text-yellow-400 fill-yellow-400 w-5 h-5" /> {experience.rating} ({experience.reviews_count} Reviews)</span>
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-6 -mt-20 relative z-30 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-8 space-y-6 pt-6 lg:pt-0">
                        {/* About Section */}
                        <section>
                            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">About this Experience</h2>
                            <p className="text-lg text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                                {experience.description}
                            </p>
                        </section>

                        {/* Features */}
                        {experience.features && experience.features.length > 0 && (
                            <section>
                                <h2 className="text-3xl font-bold mb-4">What to Expect</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {experience.features.map((feature, i) => (
                                        <div key={i} className="flex gap-4 p-6 bg-white dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 hover:border-[#FF5E1F]/30 transition-colors">
                                            <div className="w-12 h-12 rounded-2xl bg-[#FF5E1F]/10 flex items-center justify-center shrink-0 text-[#FF5E1F]">
                                                {/* Render distinct icons based on feature icon name or fallback to star */}
                                                {feature.icon === 'spa' ? <Flower2 className="w-6 h-6" /> :
                                                    feature.icon === 'restaurant' ? <Utensils className="w-6 h-6" /> :
                                                        feature.icon === 'nights_stay' ? <Moon className="w-6 h-6" /> :
                                                            feature.icon === 'visibility_off' ? <EyeOff className="w-6 h-6" /> :
                                                                <Star className="w-6 h-6" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold mb-1 text-slate-900 dark:text-white">{feature.title}</h4>
                                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feature.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Gallery / Images */}
                        {experience.images && experience.images.length > 0 && (
                            <section>
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <h2 className="text-3xl font-bold">Captured Moments</h2>
                                        <p className="text-slate-500">Real photos shared by our wellness community</p>
                                    </div>
                                    <button className="text-[#FF5E1F] font-bold hover:underline flex items-center gap-1">
                                        View All <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-[400px]">
                                    {experience.images.slice(0, 4).map((img, i) => (
                                        <div key={i} className={`rounded-3xl overflow-hidden group relative ${i === 0 ? 'col-span-2 row-span-2' : i === 3 ? 'col-span-2' : ''}`}>
                                            <img alt={`Moment ${i + 1}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" src={img} />
                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}


                        {/* Verified Reviews */}
                        {experience.reviews_data && experience.reviews_data.length > 0 && (
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <h2 className="text-3xl font-bold">Verified Reviews</h2>
                                    <div className="px-4 py-1.5 rounded-full bg-white/70 dark:bg-[#1e1e1e]/70 border border-[#FF5E1F]/20 flex items-center gap-2">
                                        <CheckCircle className="text-[#FF5E1F] w-4 h-4" />
                                        <span className="font-bold text-sm">{experience.rating}/5.0</span>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    {experience.reviews_data.map((review, i) => (
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
                        )}
                    </div>

                    {/* RIGHT SIDEBAR - STICKY */}
                    <div className="lg:col-span-4">
                        <WellnessBookingSidebar experience={experience} />
                    </div>
                </div>
            </div>
            <Footer />
        </main>
    )
}
