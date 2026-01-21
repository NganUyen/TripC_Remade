"use client";

export function CheckoutBookingSummary() {
    return (
        <div className="card-shell w-full lg:w-[460px] p-8 md:p-10 flex flex-col bg-white dark:bg-[#1b1a18] border border-border-subtle dark:border-[#333] rounded-card shadow-sm dark:shadow-none">
            <h2 className="text-2xl font-extrabold mb-8">Booking Summary</h2>
            <div className="flex items-center gap-5 p-5 bg-background-light dark:bg-white/5 rounded-[1.5rem] border border-border-subtle/40 dark:border-white/10 mb-8">
                <div className="size-20 rounded-2xl overflow-hidden border border-border-subtle shrink-0 bg-white dark:bg-white/5">
                    <img
                        alt="Vehicle"
                        className="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7pTgGAVasYNwYnJ-ToMCjmyGI1UgSSAkGssnuVeWyGseaNoOYJOVE_qs0yz889LWe2NV7t9UHyIFdnbUDncLU7Ll-JNzeEFHDeAbQL5I7ua9sifWj7fo9PpR1MaiLY18UTq7wWMBO7GBCcjyBXG6GwEtEtuxWyESMUGRzq-tgEgZcZf0u6ZSAUd-ZizGS5XepZD2rZEsRNzlU6jdoCy0-JVku1_1dAGT7FmBO86BQ7HsorLMolFp0uQJ25mKrqAG-86NNiya_D50"
                    />
                </div>
                <div>
                    <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-wider rounded-full">Selected Vehicle</span>
                    <h4 className="font-extrabold text-lg mt-1">Toyota Fortuner</h4>
                    <p className="text-xs text-muted">Luxury SUV • 7 Seats</p>
                </div>
            </div>
            <div className="space-y-6 mb-8 flex-grow">
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                        <div className="w-px h-full border-l-2 border-dashed border-border-subtle my-1"></div>
                    </div>
                    <div className="pb-1">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted">Pickup</p>
                        <p className="font-bold text-sm text-charcoal dark:text-white">Paris Charles de Gaulle (CDG)</p>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                        <span className="material-symbols-outlined text-primary text-xl">sports_score</span>
                    </div>
                    <div>
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted">Drop-off</p>
                        <p className="font-bold text-sm text-charcoal dark:text-white">Hotel Negresco, Nice</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted mb-1">Date</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">calendar_today</span>
                            <p className="font-bold text-xs">Oct 12, 2023</p>
                        </div>
                    </div>
                    <div className="bg-background-light dark:bg-white/5 p-3.5 rounded-2xl border border-border-subtle/30 dark:border-white/10">
                        <p className="text-[10px] uppercase font-black tracking-widest text-muted mb-1">Time</p>
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm text-primary">schedule</span>
                            <p className="font-bold text-xs">14:30 PM</p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="space-y-4 pt-8 border-t border-border-subtle dark:border-white/10">
                <div className="flex justify-between items-center text-sm text-muted">
                    <span>Base Fare</span>
                    <span className="font-bold text-charcoal dark:text-white">$142.00</span>
                </div>
                <div className="flex justify-between items-center text-sm text-muted">
                    <span>Service Fees & Taxes</span>
                    <span className="font-bold text-charcoal dark:text-white">$14.00</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-[1.25rem] border border-primary/10">
                    <div className="flex items-center gap-3">
                        <div className="size-9 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-primary text-xl">token</span>
                        </div>
                        <div>
                            <p className="text-xs font-extrabold">Use Tcent Rewards</p>
                            <p className="text-[9px] font-bold text-muted uppercase tracking-tight">Available: 420 TC</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-10 h-5.5 bg-gray-200 dark:bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
                <div className="pt-6 mt-2 flex justify-between items-end">
                    <div>
                        <p className="text-[10px] font-bold text-muted uppercase tracking-widest mb-1">Total Payable</p>
                        <span className="text-4xl font-black text-charcoal dark:text-white tracking-tighter">$156.00</span>
                    </div>
                    <div className="text-right">
                        <p className="text-[9px] text-muted font-bold leading-tight">All taxes &<br />fees included</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
