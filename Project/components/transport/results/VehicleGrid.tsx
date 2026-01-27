"use client";

// Link import removed

// vehicles array removed

interface VehicleGridProps {
    vehicles: any[];
    selectedId?: string;
    onSelect: (vehicle: any) => void;
}

export function VehicleGrid({ vehicles, selectedId, onSelect }: VehicleGridProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 overflow-y-auto pb-20">
            {vehicles.map((route, index) => {
                const provider = route.transport_providers;
                const features = route.vehicle_details || {};
                const isSelected = selectedId === route.id;

                return (
                    <div
                        key={route.id}
                        className={`bg-white dark:bg-[#222] rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm transition-all group border-2 ${isSelected ? 'border-primary ring-4 ring-primary/20' : 'border-transparent hover:border-primary/20 hover:shadow-xl'}`}
                    >
                        <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-[#f5f1f0] dark:bg-white/5">
                            <img
                                alt={provider?.name || "Vehicle"}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                src={route.images?.[0] || "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=2670&auto=format&fit=crop"}
                            />
                            <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                                {route.vehicle_type}
                            </div>
                            <div className="absolute bottom-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-2">
                                <span className="text-xs font-bold">{provider?.name}</span>
                                <span className="flex items-center text-[10px] font-bold text-yellow-500">
                                    <span className="material-symbols-outlined text-[14px] mr-0.5">star</span>
                                    {provider?.rating}
                                </span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-4 flex-grow">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="text-lg font-bold">{provider?.name} - {route.type}</h4>
                                    <div className="flex flex-col text-sm text-muted-foreground mt-1">
                                        <span>{new Date(route.departure_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(route.arrival_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-primary">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(route.price)}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground uppercase font-bold">Inc. VAT</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 text-muted-foreground mt-auto pt-4 border-t border-dashed border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-1">
                                    <span className="material-symbols-outlined text-lg">event_seat</span>
                                    <span className="text-sm font-medium">{route.seats_available} Seats</span>
                                </div>
                                {Object.entries(features).map(([key, value]) => (
                                    value === true && (
                                        <div key={key} className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-lg">
                                                {key === 'wifi' ? 'wifi' : key === 'ac' ? 'ac_unit' : 'check_circle'}
                                            </span>
                                            <span className="text-sm font-medium">
                                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>

                            <button
                                onClick={() => onSelect(route)}
                                className={`w-full py-4 rounded-2xl font-bold transition-all text-center ${isSelected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white hover:bg-primary hover:text-white'}`}
                            >
                                {isSelected ? 'Selected' : 'Select Vehicle'}
                            </button>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
