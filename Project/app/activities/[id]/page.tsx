import React from 'react'
import { getActivityById } from '@/lib/actions/activities'
import { notFound } from 'next/navigation'
import { ShieldCheck, Calendar, MapPin, Smartphone, Star, Check, X, Info, Ticket, Zap, MessageSquare, Image as ImageIcon, Megaphone, Camera, Star as StarOutline, ArrowLeft } from 'lucide-react'
import { ActivityBookingSidebar } from '@/components/activities/ActivityBookingSidebar'
import { Footer } from '@/components/Footer'
import Link from 'next/link'

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export const dynamic = 'force-dynamic'

export default async function ActivityDetailPage({ params }: PageProps) {
    // Await params first
    const { id } = await params
    
    // Extract ID (last 36 characters if it's a slug based URL, or full string if just ID)
    // UUID length is 36.
    const activityId = id.length > 36 ? id.slice(-36) : id
    const activity = await getActivityById(activityId)

    if (!activity) {
        notFound()
    }

    // Helper to check array length safely
    const hasInclusions = activity.inclusions && activity.inclusions.length > 0
    const hasExclusions = activity.exclusions && activity.exclusions.length > 0

    return (
        <div className="bg-[#fcfaf8] dark:bg-[#0F172A] min-h-screen font-display text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* HERO SECTION */}
            <div className="relative h-[70vh] w-full overflow-hidden">
                <img
                    alt={activity.title}
                    className="w-full h-full object-cover"
                    src={activity.image_url}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/30 via-[#0F172A]/40 to-[#0F172A]/90"></div>

                {/* Back Button */}
                <div className="absolute top-8 left-6 md:left-12 lg:left-24 z-20">
                    <Link
                        href="/activities"
                        className="group flex items-center gap-2 px-5 py-2.5 bg-white/20 backdrop-blur-md border border-white/10 rounded-full text-white font-bold text-sm hover:bg-white/30 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Activities
                    </Link>
                </div>

                <div className="absolute inset-0 flex flex-col justify-end pb-24 px-6 md:px-12 lg:px-24">
                    <div className="max-w-7xl mx-auto w-full">
                        <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-4 py-1.5 rounded-full bg-[#FF5E1F]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                <Ticket className="w-3.5 h-3.5" /> {activity.features?.category || 'Activity'}
                            </span>
                            {activity.is_instant && (
                                <span className="px-4 py-1.5 rounded-full bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="w-3.5 h-3.5" /> Instant Confirmation
                                </span>
                            )}
                        </div>
                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-lg">
                            {activity.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6 text-white/90">
                            {activity.location && (
                                <div className="flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-[#FF5E1F]" />
                                    <span>{activity.location}</span>
                                </div>
                            )}
                            {activity.features?.mobile_ticket && (
                                <div className="flex items-center gap-2">
                                    <Smartphone className="w-5 h-5 text-[#FF5E1F]" />
                                    <span>Mobile Ticket</span>
                                </div>
                            )}
                            {activity.features?.free_cancellation && (
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5 text-[#FF5E1F]" />
                                    <span>Free Cancellation</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-6 md:px-12 lg:px-24 -mt-20 relative z-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* LEFT CONTENT */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Rating Card */}
                        <div className="p-6 rounded-[2rem] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl">
                            <div className="flex items-center gap-4">
                                <div className="bg-[#FF5E1F]/10 p-4 rounded-2xl">
                                    <span className="text-4xl font-black text-[#FF5E1F]">{activity.rating}</span>
                                    <span className="text-slate-400 font-medium">/5</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Rating Score</p>
                                    <div className="flex text-amber-400 mt-1 gap-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <Star key={i} className={`w-5 h-5 ${i <= Math.round(activity.rating) ? 'fill-current' : 'text-slate-300 dark:text-slate-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-500 mt-1">{activity.reviews_count} verified reviews</p>
                                </div>
                            </div>
                        </div>

                        {/* About Section */}
                        <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl">
                            <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
                                <span className="p-2 bg-[#FF5E1F]/10 rounded-xl">
                                    <Info className="w-6 h-6 text-[#FF5E1F]" />
                                </span>
                                About This Experience
                            </h2>
                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                <p className="font-semibold text-lg text-slate-900 dark:text-white mb-4">Starting from: ${activity.price}/Guest</p>
                                <p className="whitespace-pre-line">{activity.description}</p>

                                {hasInclusions && (
                                    <>
                                        <p className="font-bold mt-4">Inclusions:</p>
                                        <ul className="list-disc pl-5 space-y-2 mt-2">
                                            {activity.inclusions?.map((inc, i) => (
                                                <li key={i}>{inc}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}

                                {activity.important_info && (
                                    <p className="mt-4 italic p-4 bg-slate-100 dark:bg-slate-800/50 rounded-xl border-l-4 border-[#FF5E1F]">
                                        {activity.important_info}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Highlights Section */}
                        {activity.highlights && activity.highlights.length > 0 && (
                            <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl">
                                <h2 className="text-2xl font-bold mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
                                    <span className="p-2 bg-amber-500/10 rounded-xl">
                                        <Star className="w-6 h-6 text-amber-500" />
                                    </span>
                                    Highlights
                                </h2>
                                <ul className="space-y-3">
                                    {activity.highlights.map((highlight, i) => (
                                        <li key={i} className="flex items-start gap-4">
                                            <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                                                <Check className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-slate-600 dark:text-slate-400 font-medium">{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Gallery / Images if available */}
                        {activity.images && activity.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-4">
                                {activity.images.slice(0, 4).map((img, idx) => (
                                    <img key={idx} src={img} alt={`Gallery ${idx}`} className="rounded-3xl w-full h-48 object-cover shadow-lg hover:scale-[1.02] transition-transform" />
                                ))}
                            </div>
                        )}

                        {/* Customer Reviews Section */}
                        <div className="p-6 rounded-[2rem] bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <span className="p-2 bg-[#FF5E1F]/10 rounded-xl">
                                        <MessageSquare className="w-6 h-6 text-[#FF5E1F]" />
                                    </span>
                                    Customer Reviews
                                </h2>
                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-bold text-slate-500">0 REVIEWS</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                                <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem]">
                                    <span className="text-6xl font-black text-slate-900 dark:text-white">0.0</span>
                                    <div className="flex text-amber-400 my-4 gap-1">
                                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 text-slate-300 dark:text-slate-700" />)}
                                    </div>
                                    <p className="text-slate-500 text-sm">Based on 0 reviews</p>
                                </div>
                                <div className="space-y-3">
                                    <p className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Rating Breakdown</p>
                                    {[5, 4, 3, 2, 1].map(stars => (
                                        <div key={stars} className="flex items-center gap-4">
                                            <span className="text-sm font-medium w-4">{stars}</span>
                                            <Star className="w-3 h-3 text-amber-400" />
                                            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-amber-400 w-0"></div>
                                            </div>
                                            <span className="text-xs text-slate-400">0%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
                                <button className="px-6 py-2 rounded-full bg-[#FF5E1F] text-white font-bold text-sm">All Reviews (0)</button>
                                <button className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <ImageIcon className="w-4 h-4" /> With Photos
                                </button>
                                <button className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm flex items-center gap-2 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    <Star className="w-4 h-4" /> 5 Star (0)
                                </button>
                                <button className="px-6 py-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">Most Recent</button>
                            </div>

                            {/* Review Form */}
                            <div className="p-8 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-white/5">
                                <h3 className="text-xl font-bold mb-2 flex items-center gap-3">
                                    <Megaphone className="w-6 h-6 text-[#FF5E1F]" />
                                    Share Your Experience
                                </h3>
                                <p className="text-sm text-slate-500 mb-8">Help others by sharing what you loved about this experience</p>

                                <div className="space-y-8">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Overall Rating</label>
                                        <div className="flex gap-2 text-slate-300">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} className="w-8 h-8 cursor-pointer hover:text-[#FF5E1F] hover:fill-[#FF5E1F] transition-colors" />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {['Value for Money', 'Experience', 'Service', 'Location'].map(criteria => (
                                            <div key={criteria} className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col gap-2">
                                                <label className="text-xs font-bold text-slate-400 uppercase">{criteria}</label>
                                                <div className="flex gap-1 text-slate-200">
                                                    {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 cursor-pointer hover:text-[#FF5E1F]" />)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Review Title</label>
                                            <input className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full px-6 py-3 focus:ring-2 focus:ring-[#FF5E1F] focus:outline-none dark:text-white" placeholder="Summarize your experience" type="text" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Your Review</label>
                                            <textarea className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl px-6 py-4 focus:ring-2 focus:ring-[#FF5E1F] focus:outline-none dark:text-white" placeholder="Tell others about your experience..." rows={4}></textarea>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Add Photos (Optional)</label>
                                            <div className="flex items-center gap-4">
                                                <label className="w-24 h-24 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                                                    <Camera className="w-6 h-6 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase">Add</span>
                                                    <input className="hidden" type="file" />
                                                </label>
                                                <p className="text-xs text-slate-400">Up to 5 images, max 5MB each</p>
                                            </div>
                                        </div>
                                    </div>

                                    <button className="w-full md:w-auto px-10 py-4 bg-[#FF5E1F] text-white font-bold rounded-full hover:shadow-lg hover:shadow-[#FF5E1F]/30 transition-all active:scale-[0.98]">
                                        Submit Review
                                    </button>
                                </div>
                            </div>

                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Star className="w-10 h-10 text-slate-300" />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900 dark:text-white">No reviews yet</h4>
                                <p className="text-slate-500">Be the first to share your experience!</p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SIDEBAR - STICKY */}
                    <div className="lg:col-span-4">
                        <ActivityBookingSidebar activity={activity} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    )
}


