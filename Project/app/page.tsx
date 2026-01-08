import { Footer } from "@/components/Footer"
import { Hero } from "@/components/Hero"
import { DestinationCard } from "@/components/DestinationCard"
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <main className="flex-grow">
        <Hero />
        <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 -mt-10">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Destinations</h2>
              <p className="text-slate-500 dark:text-slate-400 mt-1">Don't miss out on these top-rated experiences</p>
            </div>
            <Link href="#" className="hidden sm:flex items-center text-primary font-semibold text-sm hover:underline">
              View all
              <span className="material-symbols-outlined text-lg ml-1">arrow_forward</span>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DestinationCard
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuCFK6wEGigQgq8OQ98qr9LjNbwzOkNBQmUq6oxhQ16_9waL8OsoLH3ubCaIpFBNRAF5_0a-eXcSJF5j25knlW5bUW41FyQJW7zFbnJJ6w7st7ggZaAJjfIXYkLSngA2MNtWlQQK1c1o_S2FFOEWP2S58HQRqw-hZ-_ennq37KFk8lUDX-4gnYwL0-UYhynz_ScN46wjnUI5r2157MqNZuJBtZzGp11V76aUOqnVrCowk0twyu_QHmzVEHWdFlbvbZnU87sJ2TaTOQw"
              location="Vancouver"
              country="Canada"
              title="Vancouver Adventure"
              rating="4.9"
              description="Explore the best hiking trails, suspension bridges, and city views in BC."
              price="120"
              tags={[
                { text: "20% OFF", icon: "local_fire_department", color: "text-orange-500" }
              ]}
            />
            <DestinationCard
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuB6__CS-692H8u3LOTo2fNwyqF941tCUTDx8fWYcFIXqIukOJ1DgARpsgkjzPQHPvGxV-5KAW6pCRYXmILH2CoRBsSvPJ2ihvLF-k5sRlwukWwISpUUL7g-5wSLbh5Z2KeS16S4fo0Na2v1fxkCyxMKjJuLULhHizH-PnLinHoG7wanSo26zIlZNlEMelNIXnIhBvHCh0RI_C01HNhikcPXEVrmrdkOwBkhqAN5LY-rk2Ns8JNg6daS9uOLgEXql0apfIq1Kp9wN1Y"
              location="Bangkok"
              country="Thailand"
              title="Bangkok Nights"
              rating="4.7"
              description="Experience world-class dining, bustling night markets and street food."
              price="85"
            />
            <DestinationCard
              image="https://lh3.googleusercontent.com/aida-public/AB6AXuBxb153BbBBxG3i7P1fMTvQ1EA5tCNB25fi-d8rH_GSiNGfrk0kzEk7OTpKzWjO_2u98vkeCMvuc3JHfb5Fe0U3jvcM7yVa2_VDOBRIt_LPSlXxmMmtBZwsBQcBGZYpdgc_GyQ6LxZbGSn8ogH4OQzoPjk9hbuLl5PQlyX7JTbOlo7QSA4E5Z0GmUwZe_tAVKNuajgyGS8XxuuBtACwrBiy85iARjYdcFYcvntnMVWPnogSgQRtw30Tg1bxI2VjBXJbUxEs7rLvtZc"
              location="Bali"
              country="Indonesia"
              title="Bali Retreat"
              rating="5.0"
              description="Wellness, yoga, and beautiful beaches await in this tropical paradise."
              price="210"
              tags={[
                { text: "Popular" }
              ]}
            />
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
