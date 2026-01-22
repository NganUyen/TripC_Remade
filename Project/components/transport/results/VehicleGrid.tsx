"use client";

import Link from "next/link";

const vehicles = [
    {
        name: "Volkswagen Jetta",
        type: "Standard Economy Class",
        price: 156,
        tag: "Economy",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAUjtohyhoVVyDZbEUsbcBY5hABg7U2rkJ9XvgQcAlBDJYvwEnk10BXlu9fHKpf8d1SD0WhUaTJF-NpXyF1UFc8VbiorR6H2UyBot_TUw-sqxfRhyoWwnex7_Naz9sfOVxEvGEQ0l_70CLCDmtMuQkfRKVz2WOYApqHq2xjmSxSSEW3mUciF3r8QL27rY6Kjhr6gyj7XuHTwDAiDoErkcj9ZzGVfX8dCA4MPr338wv8ZGv0DB1Ecupba4EdvMegAE1edbpTU5JRBbI",
        pax: 4,
        bags: 2,
        badge: "Instant",
        badgeIcon: "check_circle"
    },
    {
        name: "Mercedes-Benz E-Class",
        type: "Premium Executive Service",
        price: 284,
        tag: "Business",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCQG3bicNtAscWZaMqd8QvxbAdQeANs2fuE8psRPxd643dRjKkjUeMZGndtIN00GK3UXF8QC4gSLWe3_bN1oweNRoQZavkVa34kl3rRx85HoI4PznIRGOOEDysZ5GufO-dZ6FtaSjj1x5mmyNxs2n8rX0GUiueoRgdYR0bM8uNG0v4Atf8Ln1Di4TP6Pu4blOBUraJiY5xmZu2JRbQxm9LG5ZBCgaLHcD1zj0YmK2mBgrI3kwpoStJCLN32PP1Fp2mEVTdhBJ6FY-k",
        pax: 3,
        bags: 2,
        badge: "WiFi Included",
        badgeIcon: "wifi"
    },
    {
        name: "Mercedes V-Class",
        type: "Spacious Luxury Van",
        price: 410,
        tag: "Group Van",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDNN4UFiS1lHtndxJeuUu2EyojUlJ8TU0ELWFIuCfjBL9-2peixQXfpe4tXY6dYemuQnEBI5DtTavaftM4gAIeLzZv-f5VKqGH883403l5cP1mzJuzR18R_ebH-gkmv-rYAs-rYrBAKt4PMOQg4nnPqtffcap73biuM1LuKDicJfl7mtQMIb3uTU8af6_DwOthMbNQY_t-RudasescGLMXqbgWMvW1dQFRUNAFBf97ymHGPqr3EQ-9dzuA_aj_gdTo-k0QlcX48XNs",
        pax: 7,
        bags: 6,
        badge: "Concierge",
        badgeIcon: "support_agent"
    },
    {
        name: "Range Rover Autobiography",
        type: "Ultimate Luxury Comfort",
        price: 595,
        tag: "Luxury",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7pTgGAVasYNwYnJ-ToMCjmyGI1UgSSAkGssnuVeWyGseaNoOYJOVE_qs0yz889LWe2NV7t9UHyIFdnbUDncLU7Ll-JNzeEFHDeAbQL5I7ua9sifWj7fo9PpR1MaiLY18UTq7wWMBO7GBCcjyBXG6GwEtEtuxWyESMUGRzq-tgEgZcZf0u6ZSAUd-ZizGS5XepZD2rZEsRNzlU6jdoCy0-JVku1_1dAGT7FmBO86BQ7HsorLMolFp0uQJ25mKrqAG-86NNiya_D50",
        pax: 4,
        bags: 3,
        badge: "Top Rated",
        badgeIcon: "verified"
    }
];

export function VehicleGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4">
            {vehicles.map((car, index) => (
                <div key={index} className="bg-white dark:bg-[#222] rounded-[2rem] p-6 flex flex-col gap-6 shadow-sm hover:shadow-xl transition-all group border border-transparent hover:border-primary/20">
                    <div className="relative w-full aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-[#f5f1f0] dark:bg-white/5">
                        <img
                            alt={car.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            src={car.image}
                        />
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                            {car.tag}
                        </div>
                    </div>
                    <div className="flex flex-col gap-4">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-lg font-bold">{car.name}</h4>
                                <p className="text-sm text-muted">{car.type}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-primary">${car.price}</p>
                                <p className="text-[10px] text-muted uppercase font-bold">Inc. VAT</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 text-muted">
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">person</span>
                                <span className="text-sm font-medium">{car.pax} Pax</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="material-symbols-outlined text-lg">shopping_bag</span>
                                <span className="text-sm font-medium">{car.bags} Bags</span>
                            </div>
                            <div className="flex items-center gap-1 ml-auto">
                                <span className="material-symbols-outlined text-primary text-lg">{car.badgeIcon}</span>
                                <span className="text-xs font-bold text-primary">{car.badge}</span>
                            </div>
                        </div>
                        <Link href="/transport/checkout" className="w-full bg-primary py-4 rounded-2xl text-white font-bold hover:bg-primary/90 transition-colors text-center">
                            Select Vehicle
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}
