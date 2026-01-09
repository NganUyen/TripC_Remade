import { Footer } from "@/components/Footer"
import { FlightsHero } from "@/components/flights/FlightsHero"
import { PopularRoutes } from "@/components/flights/PopularRoutes"
import { ExploreGrid } from "@/components/flights/ExploreGrid"
import { FlightPartnerLoop } from "@/components/flights/FlightPartnerLoop"

export default function FlightsPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow">
                <FlightsHero />
                <FlightPartnerLoop />
                <PopularRoutes />
                <ExploreGrid />
            </main>
            <Footer />
        </div>
    )
}
