"use client"

import LogoLoop from "@/components/ui/LogoLoop"

const REGIONAL_AIRLINES = [
    // Vietnam Airlines (Wikimedia)
    {
        src: "https://cdn.haitrieu.com/wp-content/uploads/2022/01/Logo-VNA-Sky-Te-V.png",
        alt: "Vietnam Airlines",
        width: 120
    },
    // Vietjet Air (Wikimedia)
    {
        src: "https://media.loveitopcdn.com/3807/logo-vietjet-20.png",
        alt: "Vietjet Air",
        width: 100
    },
    // Bamboo Airways (Wikimedia)
    {
        src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Bamboo_Airways_Logo.svg/2560px-Bamboo_Airways_Logo.svg.png",
        alt: "Bamboo Airways",
        width: 110
    },
    // Thai Airways (Wikimedia)
    {
        src: "https://upload.wikimedia.org/wikipedia/vi/thumb/5/58/Thai_Airways_Logo.svg/1280px-Thai_Airways_Logo.svg.png",
        alt: "Thai Airways",
        width: 100
    },
    // AirAsia (Wikimedia)
    {
        src: "https://images.squarespace-cdn.com/content/v1/5a5dbe4632601eb31977f947/1629703651716-J8RVOTD1XO3SDINHP2RG/unnamed+%281%29.png",
        alt: "AirAsia",
        width: 90
    },
    // Singapore Airlines (Wikimedia)
    {
        src: "https://upload.wikimedia.org/wikipedia/vi/thumb/9/9d/Singapore_Airlines_Logo.svg/1200px-Singapore_Airlines_Logo.svg.png",
        alt: "Singapore Airlines",
        width: 120
    },
    // Cathay Pacific (Wikimedia)
    {
        src: "https://upload.wikimedia.org/wikipedia/en/thumb/1/17/Cathay_Pacific_logo.svg/1200px-Cathay_Pacific_logo.svg.png",
        alt: "Cathay Pacific",
        width: 110
    }
];

export function FlightPartnerLoop() {
    return (
        <div className="w-full relative z-30 bg-white dark:bg-[#0f172a] py-10 border-b border-slate-100 dark:border-white/5 min-h-[150px]">
            <div className="max-w-[1440px] mx-auto px-6">
                <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-8">
                    Trusted by Top Regional Carriers
                </p>
                <LogoLoop
                    logos={REGIONAL_AIRLINES}
                    speed={50}
                    direction="left"
                    logoHeight={40}
                    gap={80}
                    pauseOnHover={true}
                    scaleOnHover={true}
                    fadeOut={true}
                    fadeOutColor="var(--logoloop-fadeColorAuto)"
                    className="transition-all duration-500"
                />
            </div>
        </div>
    )
}
