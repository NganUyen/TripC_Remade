import { TransportHero } from '@/components/transport/TransportHero'
import { PopularTransfers } from '@/components/transport/PopularTransfers'
import { TransportPartnerLoop } from '@/components/transport/TransportPartnerLoop'
import { Footer } from '@/components/Footer'

export default function TransportPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow bg-white dark:bg-[#0f172a]">
                <TransportHero />
                <TransportPartnerLoop />

                <div className="relative z-20 bg-white dark:bg-[#0f172a] rounded-t-[3rem] -mt-8 pt-8 pb-16">
                    <PopularTransfers />
                </div>
            </main>
            <Footer />
        </div>
    )
}
