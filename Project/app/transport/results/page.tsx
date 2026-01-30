"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import { ResultsHeader } from "@/components/transport/results/ResultsHeader";
import { FiltersSidebar } from "@/components/transport/results/FiltersSidebar";
import { DateSelector } from "@/components/transport/results/DateSelector";
import { VehicleGrid } from "@/components/transport/results/VehicleGrid";
import { FloatingSummary } from "@/components/transport/results/FloatingSummary";

export default function TransportResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [vehicles, setVehicles] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedVehicle, setSelectedVehicle] = useState<any>(null);

    // Filter states
    const [vehicleTypeFilter, setVehicleTypeFilter] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000000]); // Max 5m VND
    const [sortBy, setSortBy] = useState<string>('recommended');

    useEffect(() => {
        const fetchRoutes = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams(searchParams.toString());

                // Add local filters if applied
                if (vehicleTypeFilter) query.set('vehicleType', vehicleTypeFilter);
                if (priceRange[0] > 0) query.set('minPrice', String(priceRange[0]));
                if (priceRange[1] < 5000000) query.set('maxPrice', String(priceRange[1]));

                const res = await fetch(`/api/transport/search?${query.toString()}`);
                if (!res.ok) throw new Error('Failed to fetch');
                const data = await res.json();
                setVehicles(data);
            } catch (error) {
                console.error(error);
                // toast.error("Có lỗi xảy ra khi tải dữ liệu");
            } finally {
                setLoading(false);
            }
        };

        fetchRoutes();
    }, [searchParams, vehicleTypeFilter, priceRange]); // Re-fetch when params or filters change

    const origin = searchParams.get('origin') || '...';
    const destination = searchParams.get('destination') || '...';
    const date = searchParams.get('date');
    const time = searchParams.get('time');
    const passengers = searchParams.get('passengers') || '1';
    const serviceType = searchParams.get('serviceType');
    const duration = searchParams.get('duration');

    // startDate is the first date in the range (initial search date)
    // selectedDate is the currently selected date (can change without shifting range)
    const startDateParam = searchParams.get('startDate');
    const startDate = startDateParam || date || new Date().toISOString().split('T')[0];
    const selectedDate = date || startDate;

    const handleDateChange = (newDate: string) => {
        // Update URL with new date but keep the original start date
        const params = new URLSearchParams(searchParams.toString());
        params.set('date', newDate);
        // Store the startDate if not already stored
        if (!startDateParam) {
            params.set('startDate', startDate);
        }
        router.push(`/transport/results?${params.toString()}`);
        // Clear selected vehicle when date changes
        setSelectedVehicle(null);
    };

    const sortedVehicles = [...vehicles].sort((a, b) => {
        switch (sortBy) {
            case 'price_asc': return a.price - b.price;
            case 'price_desc': return b.price - a.price;
            case 'departure_asc': return new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime();
            case 'duration_asc':
                const durA = new Date(a.arrival_time).getTime() - new Date(a.departure_time).getTime();
                const durB = new Date(b.arrival_time).getTime() - new Date(b.departure_time).getTime();
                return durA - durB;
            default: return 0;
        }
    });

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-32">
            <ResultsHeader
                origin={origin}
                destination={destination}
                date={selectedDate}
                time={time}
                passengers={passengers}
                serviceType={serviceType}
                duration={duration}
            />
            <main className="flex max-w-[1440px] mx-auto min-h-[calc(100vh-80px)] pt-8 px-4 gap-8">
                <FiltersSidebar
                    selectedType={vehicleTypeFilter}
                    onTypeChange={setVehicleTypeFilter}
                    priceRange={priceRange}
                    onPriceChange={setPriceRange}
                />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <DateSelector startDate={startDate} selectedDate={selectedDate} onDateChange={handleDateChange} />

                    {/* Sort Options */}
                    {!loading && vehicles.length > 0 && (
                        <div className="flex items-center gap-2 py-4 overflow-x-auto no-scrollbar mask-gradient-right">
                            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider whitespace-nowrap mr-2">Sort by:</span>
                            {[
                                { id: 'recommended', label: 'Recommended' },
                                { id: 'price_asc', label: 'Cheapest' },
                                { id: 'price_desc', label: 'Luxurious' },
                                { id: 'departure_asc', label: 'Earliest' },
                                { id: 'duration_asc', label: 'Fastest' },
                            ].map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setSortBy(opt.id)}
                                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all ${sortBy === opt.id
                                            ? 'bg-slate-900 text-white dark:bg-white dark:text-black shadow-md'
                                            : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'
                                        }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    )}

                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : vehicles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center opacity-70">
                            <span className="material-symbols-outlined text-6xl mb-4">no_transfer</span>
                            <h3 className="text-xl font-bold">Không tìm thấy chuyến xe phù hợp</h3>
                            <p>Vui lòng thử lại với ngày hoặc tiêu chí khác.</p>
                        </div>
                    ) : (
                        <VehicleGrid
                            vehicles={sortedVehicles}
                            selectedId={selectedVehicle?.id}
                            onSelect={setSelectedVehicle}
                        />
                    )}
                </div>
            </main>
            {selectedVehicle && (
                <FloatingSummary
                    route={selectedVehicle}
                    origin={origin}
                    destination={destination}
                    date={date}
                    passengers={passengers}
                />
            )}
        </div>
    );
}
