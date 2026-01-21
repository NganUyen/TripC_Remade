"use client";

import { ResultsHeader } from "@/components/transport/results/ResultsHeader";
import { FiltersSidebar } from "@/components/transport/results/FiltersSidebar";
import { DateSelector } from "@/components/transport/results/DateSelector";
import { VehicleGrid } from "@/components/transport/results/VehicleGrid";
import { FloatingSummary } from "@/components/transport/results/FloatingSummary";

export default function TransportResultsPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            <ResultsHeader />
            <main className="flex max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
                <FiltersSidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DateSelector />
                    <VehicleGrid />
                </div>
            </main>
            <FloatingSummary />
        </div>
    );
}
