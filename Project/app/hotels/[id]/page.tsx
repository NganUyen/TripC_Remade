import { HotelDetailHero } from '@/components/hotels/HotelDetailHero'
import { BookingSidebar, MobileBookingBar } from '@/components/hotels/BookingSidebar'
import { HotelContent } from '@/components/hotels/HotelContent'
import { Footer } from '@/components/Footer'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'

async function getHotelData(slug: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        const res = await fetch(`${baseUrl}/api/hotels/${slug}`, {
            cache: 'no-store'
        })
        
        if (!res.ok) {
            return null
        }
        
        const data = await res.json()
        return data.success ? data.data : null
    } catch (error) {
        console.error('Error fetching hotel:', error)
        return null
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const hotel = await getHotelData(params.id)
    
    if (!hotel) {
        return {
            title: 'Hotel Not Found | TripC',
        }
    }
    
    return {
        title: `${hotel.name} - ${hotel.address?.city || 'Vietnam'} | TripC`,
        description: hotel.description || `Book ${hotel.name} in ${hotel.address?.city || 'Vietnam'}. ${hotel.star_rating}-star hotel with premium amenities.`,
    }
}

export default async function HotelDetailPage({ params }: { params: { id: string } }) {
    const hotel = await getHotelData(params.id)
    
    if (!hotel) {
        notFound()
    }

    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <HotelDetailHero hotel={hotel} />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-12 lg:pt-0 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content (Left) */}
                    <div className="lg:col-span-8">
                        <HotelContent hotel={hotel} />
                    </div>

                    {/* Sidebar (Right) */}
                    <div className="lg:col-span-4 relative">
                        <BookingSidebar hotel={hotel} />
                    </div>
                </div>
            </div>

            <MobileBookingBar hotel={hotel} />
            <Footer />
        </main>
    )
}
