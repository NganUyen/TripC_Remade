"use client";

export function PassengerDetailsForm() {
    return (
        <div className="flex-1 py-4 flex flex-col">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Passenger Details</h1>
                <p className="text-muted">Enter the primary traveler's information for this booking.</p>
            </div>
            <form className="space-y-6 flex-grow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-extrabold ml-5 text-charcoal/70 dark:text-white/70">First Name</label>
                        <input
                            className="w-full px-6 py-4 rounded-full border-border-subtle dark:border-white/10 focus:ring-primary focus:border-primary bg-white dark:bg-white/5 shadow-sm outline-none transition-shadow focus:shadow-md"
                            placeholder="John"
                            type="text"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-extrabold ml-5 text-charcoal/70 dark:text-white/70">Last Name</label>
                        <input
                            className="w-full px-6 py-4 rounded-full border-border-subtle dark:border-white/10 focus:ring-primary focus:border-primary bg-white dark:bg-white/5 shadow-sm outline-none transition-shadow focus:shadow-md"
                            placeholder="Doe"
                            type="text"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-extrabold ml-5 text-charcoal/70 dark:text-white/70">Email Address</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-muted/60">mail</span>
                        <input
                            className="w-full pl-14 pr-6 py-4 rounded-full border-border-subtle dark:border-white/10 focus:ring-primary focus:border-primary bg-white dark:bg-white/5 shadow-sm outline-none"
                            placeholder="john.doe@tripcpro.com"
                            type="email"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-extrabold ml-5 text-charcoal/70 dark:text-white/70">Phone Number</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-6 top-1/2 -translate-y-1/2 text-muted/60">call</span>
                        <input
                            className="w-full pl-14 pr-6 py-4 rounded-full border-border-subtle dark:border-white/10 focus:ring-primary focus:border-primary bg-white dark:bg-white/5 shadow-sm outline-none"
                            placeholder="+1 (555) 000-0000"
                            type="tel"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-extrabold ml-5 text-charcoal/70 dark:text-white/70">Special Requests</label>
                    <textarea
                        className="w-full px-6 py-5 rounded-[1.5rem] border-border-subtle dark:border-white/10 focus:ring-primary focus:border-primary bg-white dark:bg-white/5 shadow-sm outline-none"
                        placeholder="Any specific requirements for your trip..."
                        rows={4}
                    ></textarea>
                </div>
                <div className="pt-8 mt-auto">
                    <button
                        className="w-full bg-primary text-white py-5 rounded-pill font-extrabold text-lg shadow-xl shadow-primary/25 hover:shadow-2xl hover:translate-y-[-2px] transition-all flex items-center justify-center gap-3"
                        type="button"
                    >
                        Continue to Payment
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                    <p className="text-center text-[10px] text-muted mt-6 px-10 uppercase font-bold tracking-widest">
                        Secure 256-bit SSL Encrypted Booking
                    </p>
                </div>
            </form>
        </div>
    );
}
