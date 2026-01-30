"use client"

import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { MapPin, Star, ArrowLeft, Calendar } from "lucide-react"
import { beautyApi } from "@/lib/beauty/api"
import type { BeautyVenue, BeautyService } from "@/lib/beauty/types"

export default function BeautyVenueDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params?.id === "string" ? params.id : null
  const [venue, setVenue] = useState<BeautyVenue | null>(null)
  const [services, setServices] = useState<BeautyService[]>([])
  const [loading, setLoading] = useState(!!id)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    Promise.all([
      beautyApi.getVenueById(id),
      beautyApi.getVenueServices(id),
    ])
      .then(([v, s]) => {
        setVenue(v)
        setServices(s ?? [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-zinc-500">Loading...</div>
      </div>
    )
  }

  if (!venue) {
    return (
      <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center gap-4 p-8">
        <p className="text-zinc-600 dark:text-zinc-400">Venue not found.</p>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>
    )
  }

  const coverImage = venue.cover_image_url ?? "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1200&auto=format&fit=crop"
  const address = venue.address ?? venue.location_summary ?? venue.city ?? "—"

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

      <section className="relative w-full h-[400px] overflow-hidden rounded-b-[3rem] shadow-2xl">
        <div
          className="absolute inset-0 w-full h-full bg-center bg-no-repeat bg-cover"
          style={{ backgroundImage: `url("${coverImage}")` }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
        <div className="absolute bottom-12 left-12 md:left-40 max-w-2xl">
          <h1 className="font-display text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
            {venue.name}
          </h1>
          {venue.description && (
            <p className="text-white/90 text-base md:text-lg mt-3 font-light max-w-lg line-clamp-2">
              {venue.description}
            </p>
          )}
          <div className="flex items-center gap-4 mt-4 text-white/90">
            <div className="flex items-center gap-1">
              <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span className="font-bold">{venue.average_rating.toFixed(1)}</span>
            </div>
            {venue.review_count > 0 && (
              <span className="text-sm">({venue.review_count} reviews)</span>
            )}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          <div className="flex-1 space-y-8">
            {address !== "—" && (
              <section className="flex items-start gap-3 p-4 rounded-2xl bg-[#f5f1f0] dark:bg-zinc-800">
                <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white mb-1">Address</h3>
                  <p className="text-zinc-600 dark:text-zinc-400">{address}</p>
                </div>
              </section>
            )}

            <section>
              <h2 className="font-display text-2xl font-bold mb-6">Services</h2>
              {services.length === 0 ? (
                <p className="text-zinc-500 dark:text-zinc-400">No services listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((s) => (
                    <div
                      key={s.id}
                      onClick={() => router.push(`/beauty/${s.id}`)}
                      className="p-6 bg-[#f5f1f0] dark:bg-zinc-800 rounded-2xl flex items-start gap-4 cursor-pointer hover:bg-[#ebe7e4] dark:hover:bg-zinc-700 transition-colors border border-transparent hover:border-primary/20"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-zinc-200 dark:bg-zinc-700 shrink-0">
                        {s.image_url ? (
                          <img src={s.image_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400">
                            <span className="material-symbols-outlined text-3xl">spa</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg mb-1">{s.name}</h4>
                        {s.description && (
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2 mb-2">
                            {s.description}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-black text-primary">${s.price}</span>
                          <span className="text-sm text-zinc-500">{s.duration_minutes} mins</span>
                        </div>
                      </div>
                      <Calendar className="w-5 h-5 text-primary shrink-0 mt-1" />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <div className="lg:w-[320px]">
            <div className="sticky top-24 p-6 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl rounded-[2rem] border border-white/20 dark:border-zinc-700 shadow-xl">
              <h3 className="font-display text-lg font-bold mb-4">{venue.name}</h3>
              {venue.phone && (
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">📞 {venue.phone}</p>
              )}
              {venue.website && (
                <a
                  href={venue.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary font-medium hover:underline block mb-4"
                >
                  Visit website
                </a>
              )}
              <button
                onClick={() => router.push(`/beauty?venue=${venue.id}`)}
                className="w-full py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all"
              >
                View services & book
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
