import { WellnessHero } from '@/components/wellness/WellnessHero'
import { MoodFilters } from '@/components/wellness/MoodFilters'
import { ExperienceList } from '@/components/wellness/ExperienceList'
import { Footer } from '@/components/Footer'
import { getWellnessExperiences } from '@/lib/actions/wellness'

export const dynamic = 'force-dynamic'

export default async function WellnessPage() {
    const experiences = await getWellnessExperiences()
    return (
        <main className="min-h-screen bg-[#fcfaf8] dark:bg-[#0a0a0a]">
            <WellnessHero />

            <MoodFilters />
            <ExperienceList experiences={experiences} />

            <Footer />
        </main>
    )
}
