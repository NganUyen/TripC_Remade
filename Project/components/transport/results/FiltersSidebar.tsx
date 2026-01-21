"use client";

export function FiltersSidebar() {
    return (
        <aside className="w-80 shrink-0 p-6 flex flex-col gap-8 sticky top-20 h-fit hidden lg:flex">
            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Filters</h3>
                <p className="text-sm text-muted">Refine your transport</p>
            </div>
            {/* Vehicle Type */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">directions_car</span>
                    <span className="font-semibold text-sm uppercase tracking-wider">Vehicle Type</span>
                </div>
                <div className="flex flex-col gap-1">
                    {['Economy', 'Business', 'Luxury', 'Van'].map((type, index) => (
                        <label key={type} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all cursor-pointer group">
                            <input
                                defaultChecked={index === 0}
                                type="checkbox"
                                className="h-5 w-5 rounded border-border-subtle border-2 bg-transparent text-primary focus:ring-primary/20"
                            />
                            <span className="text-base font-medium">{type}</span>
                        </label>
                    ))}
                </div>
            </div>
            {/* Price Range */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-semibold text-sm uppercase tracking-wider">Price Range</span>
                </div>
                <div className="px-2">
                    <div className="flex h-1 w-full rounded-sm bg-border-subtle relative">
                        <div className="absolute left-0 right-[30%] h-full bg-primary rounded-sm"></div>
                        <div className="absolute left-0 -top-1.5 flex flex-col items-center">
                            <div className="size-4 rounded-full bg-primary ring-4 ring-white dark:ring-[#222]"></div>
                            <p className="mt-2 text-xs font-bold">$40</p>
                        </div>
                        <div className="absolute right-[30%] -top-1.5 flex flex-col items-center">
                            <div className="size-4 rounded-full bg-primary ring-4 ring-white dark:ring-[#222]"></div>
                            <p className="mt-2 text-xs font-bold">$420</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Service Features */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">award_star</span>
                    <span className="font-semibold text-sm uppercase tracking-wider">Features</span>
                </div>
                <div className="flex flex-col gap-1">
                    {['WiFi', 'English Speaking', 'Free Cancellation'].map((feature) => (
                        <label key={feature} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all cursor-pointer">
                            <input type="checkbox" className="h-5 w-5 rounded border-border-subtle border-2 bg-transparent text-primary focus:ring-primary/20" />
                            <span className="text-base font-medium">{feature}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
}
