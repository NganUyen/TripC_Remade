"use client"

import { EntertainmentDetailHero } from '@/components/entertainment/EntertainmentDetailHero'
import { EntertainmentContent } from '@/components/entertainment/EntertainmentContent'
import { TicketBookingWidget, MobileBookingBar } from '@/components/entertainment/TicketBookingWidget'
import { Footer } from '@/components/Footer'
import { getEntertainmentById } from '@/components/entertainment/mockData'
import { notFound } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function EntertainmentDetailPage({ params }: { params: { id: string } }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Get the entertainment item by ID
  const item = getEntertainmentById(params.id)

  // If item not found, show 404
  if (!item) {
    notFound()
  }

  // Prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
      <EntertainmentDetailHero item={item} />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-12 lg:pt-0 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content (Left) */}
          <div className="lg:col-span-8">
            <EntertainmentContent item={item} />
          </div>

          {/* Sidebar (Right) */}
          <div className="lg:col-span-4 relative">
            <TicketBookingWidget item={item} />
          </div>
        </div>
      </div>

      <MobileBookingBar item={item} />
      <Footer />
    </main>
  )
}
