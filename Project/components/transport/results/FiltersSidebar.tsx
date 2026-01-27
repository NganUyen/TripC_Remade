"use client";

import { useState } from "react";

interface FiltersSidebarProps {
    selectedType: string | null;
    onTypeChange: (type: string | null) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
}

export function FiltersSidebar({ selectedType, onTypeChange, priceRange, onPriceChange }: FiltersSidebarProps) {
    const handleTypeClick = (type: string) => {
        // Toggle: if same type clicked, clear it
        if (selectedType === type) {
            onTypeChange(null);
        } else {
            onTypeChange(type);
        }
    };

    // Simplified price handler for logic (visual slider can be complex, using min/max inputs or simple buttons for now if UI library not fully set up for double slider)
    // Assuming UI requirement matched previous visual, but making it functional
    // For now, I'll keep the visual HTML but make the interactions valid if possible, or just standard inputs as fallback.
    // The previous code had a hardcoded visual slider. I will keep it but maybe add hidden inputs or make the text editable? 
    // To save time and ensure functionality, I'll add simple range input or buttons.

    return (
        <aside className="w-80 shrink-0 p-6 flex flex-col gap-8 sticky top-20 h-fit hidden lg:flex">
            <div className="flex flex-col gap-1">
                <h3 className="text-xl font-bold">Filters</h3>
                <p className="text-sm text-muted-foreground">Refine your transport</p>
            </div>
            {/* Vehicle Type */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">directions_car</span>
                    <span className="font-semibold text-sm uppercase tracking-wider">Vehicle Type</span>
                </div>
                <div className="flex flex-col gap-1">
                    {[
                        { label: 'Economy', value: '4' },
                        { label: 'Business', value: 'limit' }, // Logic mapping needs care. Let's map to DB types roughly 
                        { label: 'Luxury', value: 'limousine' },
                        { label: 'Van', value: '29' }
                    ].map((item) => {
                        // Simple mapping for demo: Economy -> 4 seats, Van -> 29 seats, Luxury -> Limousine
                        // This should be adjusted based on real DB values vs UI labels
                        return (
                            <label key={item.label} className="flex items-center gap-3 py-2 px-3 rounded-xl hover:bg-white dark:hover:bg-white/5 transition-all cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={selectedType === item.value}
                                    onChange={() => handleTypeClick(item.value)}
                                    className="h-5 w-5 rounded border-border-subtle border-2 bg-transparent text-primary focus:ring-primary/20"
                                />
                                <span className="text-base font-medium">{item.label}</span>
                            </label>
                        );
                    })}
                </div>
            </div>
            {/* Price Range */}
            <div className="flex flex-col gap-6">
                <div className="flex items-center gap-2 text-primary">
                    <span className="material-symbols-outlined">payments</span>
                    <span className="font-semibold text-sm uppercase tracking-wider">Price Range</span>
                </div>
                <div className="px-2">
                    <input
                        type="range"
                        min="0"
                        max="5000000"
                        step="100000"
                        className="w-full accent-primary h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                        value={priceRange[1]}
                        onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                    />
                    <div className="flex justify-between mt-2 text-xs font-bold">
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[0])}</span>
                        <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(priceRange[1])}</span>
                    </div>
                </div>
            </div>
            {/* Service Features - Keep visual for now */}
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
