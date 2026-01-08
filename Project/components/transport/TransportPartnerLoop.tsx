"use client"

import { SiMercedes, SiBmw, SiTesla, SiAudi, SiFord, SiToyota, SiUber } from 'react-icons/si';
import LogoLoop from '@/components/ui/LogoLoop';

const CAR_BRANDS = [
    { node: <SiMercedes className="text-3xl" />, title: "Mercedes-Benz", href: "#" },
    { node: <SiBmw className="text-3xl" />, title: "BMW", href: "#" },
    { node: <SiTesla className="text-3xl" />, title: "Tesla", href: "#" },
    { node: <SiAudi className="text-3xl" />, title: "Audi", href: "#" },
    { node: <SiFord className="text-3xl" />, title: "Ford", href: "#" },
    { node: <SiToyota className="text-3xl" />, title: "Toyota", href: "#" },
    { node: <SiUber className="text-3xl" />, title: "Uber Business", href: "#" },
];

export function TransportPartnerLoop() {
    return (
        <div className="w-full relative z-30 bg-white dark:bg-[#0f172a] py-12 border-b border-slate-100 dark:border-white/5 min-h-[150px]">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-white/30 mb-8">Trusted by Premium Fleets</p>
            <div className="w-full max-w-[1440px] mx-auto px-4">
                <LogoLoop
                    logos={CAR_BRANDS}
                    speed={100}
                    direction="left"
                    logoHeight={40}
                    gap={60}
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
