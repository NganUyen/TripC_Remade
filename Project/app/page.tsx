import { Footer } from "@/components/Footer"
import { Hero } from "@/components/Hero"
import { DestinationCard } from "@/components/DestinationCard"
import Link from 'next/link'
import { TrendingCollections } from '@/components/home/TrendingCollections'
import { CategoryGrid } from '@/components/home/CategoryGrid'
import { TrustBenefits } from '@/components/home/TrustBenefits'
import { Newsletter } from '@/components/home/Newsletter'
import { DownloadApp } from '@/components/home/DownloadApp'
import { ArrowRight, MapPin } from 'lucide-react'

import { getPopularActivities } from "@/lib/actions/activities"

export default async function Home() {
  const popularActivities = await getPopularActivities(3);

  return (
    <>
      <main className="flex-grow bg-[#fcfaf8] dark:bg-[#0a0a0a]">
        <Hero />

        {/* Explore Categories (Pushed Up) */}
        <CategoryGrid />

        {/* Trending Collections (New Content) */}
        <TrendingCollections />

        {/* Popular Destinations (Standard Alignment) */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-6 h-6 text-[#FF5E1F]" /> Điểm Đến Phổ Biến
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">Những thành phố được yêu thích nhất mùa này</p>
            </div>
            <Link href="/activities" className="hidden sm:flex items-center text-slate-900 dark:text-white font-bold text-sm hover:text-[#FF5E1F] transition-colors gap-2 cursor-pointer group">
              Xem tất cả
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {popularActivities.map((activity) => (
              <DestinationCard
                key={activity.id}
                image={activity.image_url}
                location={activity.location.split(',')[0]} // Take city from location
                country={activity.location.split(',').slice(-1)[0].trim()} // Take country from end of location string
                title={activity.title}
                rating={activity.rating.toString()}
                description={activity.description}
                price={activity.price.toString()}
                link={`/activities/${activity.id}`}
              />
            ))}
            {popularActivities.length === 0 && (
              <p className="text-slate-500 col-span-full text-center py-8">Không tìm thấy điểm đến phổ biến nào.</p>
            )}
          </div>
        </div>

        {/* Other Sections */}
        <TrustBenefits />
        <DownloadApp />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
