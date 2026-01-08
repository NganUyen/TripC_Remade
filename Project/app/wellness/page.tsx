import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CategorySlider } from "@/components/CategorySlider"
import { WellnessHero } from "@/components/wellness/WellnessHero"
import { WellnessFilters } from "@/components/wellness/WellnessFilters"
import { WellnessActivityCard } from "@/components/wellness/WellnessActivityCard"

export default function WellnessPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display selection:bg-primary selection:text-white">
            <Header />
            <CategorySlider />

            <main className="flex-grow w-full flex flex-col">
                <WellnessHero />
                <WellnessFilters />

                <section className="w-full px-4 pb-20">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Curated Experiences</h2>
                            <button className="text-primary font-bold flex items-center gap-1 hover:gap-2 transition-all">
                                View all <span className="material-symbols-outlined text-sm">arrow_forward</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDVKAfNIFCvXp6xrxkgY3PqQmqCIPduphcYgq4SGCUE-j9sPCxtrXbTKKc_M_OK9Cv5Qbq73fwto28XzYokLBlj58EpIa7cfIcWJIlwN0d6Hvs9pbQCpFfdXTZOxebmQMMYFBu_WiJ2eh_J11zb3vdb2KKI8fIG-2dT5ROFjmxF_A13rcwj64dPSuDcFZhA_QvZR-djLqtL0PiX7SaERq86R_Y9m0gSzq8GNxWkZvGvEia_BQyfwwDoJLjeLTtln89FjNWA839FvMA"
                                title="Bali Silence Retreat"
                                location="Ubud, Indonesia"
                                rating="4.9"
                                reviews="120"
                                price="850"
                                priceLabel="Per Person"
                                starCount="5 days"
                                badges={[
                                    { text: "Popular", colorClass: "bg-gradient-to-r from-yellow-400 to-yellow-600", icon: "local_fire_department" }
                                ]}
                            />

                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuA1bWcUk92iviIafTS3QGJpTN0lsQte6RtgOR4GU2x591FvSQNm0vlIc-_sqsRArleLun0u0Vd0UB4KqiubIajhlFf0ohu9HHrQG-H-yCENm_4LSlfAEYQ-9MCvDiJ-C_kRpmnxUZIFJK1CujBd7yYux-ZnsrZ-djcTCGW7aEBQgIny7L-4GA6mUklJtSRB4toGwispYLh-8V2WIOkkTHhZgwZGdYCxRF8Y_P8BhXJ4opNFrz7Yl9w9NP1Ka6LbZy3WljaIV3tnTDU"
                                title="Urban Float Tank"
                                location="New York, USA"
                                rating="4.7"
                                reviews="85"
                                price="65"
                                originalPrice="95"
                                discount="30% Off"
                                badges={[
                                    { text: "30% Off", colorClass: "bg-primary", icon: "percent" }
                                ]}
                            />

                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuCFuTt4hv6Wdhb9GZ96E9DxVq5S2IvJaIhmPI7GspT3faFjwDnPSEPqc7brJ843r3H5RKXM7M7_47pgT9TV9dQDpeJU0uNeRH8R9Lzewip5KYnGhxkG2mk0xxLTZS0-h8ofO-F-18nbnF7pUtku1tLAPAqdNLNocgpmajNdftz45QauzDi1ZHyJUhgPqUJEGfdVTLczYvQOTCUFawiXdJgq97PdDgrGzvNZ1ZamgieSSzAI0xVmwbM_Eu9M-0f8nzoYD21LyILWeeE"
                                title="Forest Bathing Session"
                                location="Kyoto, Japan"
                                rating="4.8"
                                reviews="40"
                                price="120"
                                priceLabel="Per Person"
                            />

                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDK96eelVpLa7FEqCNNA8kr3R2eh_ZOJkg802WjnLiXB1BGtsVOcAk9O7I03pkBNMCceML6dk-LGCo1Ie86fqSitGtdCvM5jMFxVBt7CyC0s3H5DNij8UN-rOdYokoWtwQWqgP6B0e--sOYMQIvMSjDo2Ql-KprVLrg4bVeA8MBlvlIAiXeoZVyGBPZURDFVYUYUckZvtbvLiHlPf6Gsix_IpJxjc1SOEBG7qW9ghja-rjftgL-At5DN-Q2afYhF6VjRv-at1GYAds"
                                title="Digital Detox Weekend"
                                location="Big Sur, USA"
                                rating="4.6"
                                reviews="90"
                                price="450"
                                priceLabel="Per Weekend"
                                badges={[
                                    { text: "Best Value", colorClass: "bg-earth-olive", icon: "savings" }
                                ]}
                            />

                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuD5sp29Vfh-YxD0OqgsvM-in6etkBblkMNIz_mRVp4QFLIxX1nS4WQ_oMO2ft9bMKgQlSKWzlnvCMz86hA2Wrk-LpXv0ZfGBxVSulZoYpq2OQp_aUWsFM6FQmrTyHCVchofxPy-4bUAwvSOYO9-kz6iTzWgjdTflQBAhizTKTlDTBDpf2eoZEzlpaYStIvAvmgjXZc8lpwgMDCeh4ZucHLkOiVzS2YVz-H_YCMwelYEZ4cUJNGjWw1_Qms5-0TCtBAcreDYTufMm8s"
                                title="Hot Stone Therapy"
                                location="London, UK"
                                rating="4.5"
                                reviews="150"
                                price="119"
                                originalPrice="140"
                                discount="15% Off"
                                badges={[
                                    { text: "15% Off", colorClass: "bg-primary", icon: "percent" }
                                ]}
                            />

                            <WellnessActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBOwNza-XSCg-cITTGut5uyuaDvkXOUKYYxu8Wf4U3RiXiZuMgTV9XwdDj0ybCBJSjaNt6JRsQRX-N3uc9uR8zYi72gTKkFR17yCVnQ2rqFqrmpMpyC0aGr1bcQNd-DVjQbxSydp1FDlGA9NKqT_F1mL8s7FwfcWjVpb2m0E_ycnYGWfYQQ2meCNQdX2fA_cLz11crRLSt7NFpm2B3Iev-6ZsZRPbdCEvM2m3sgcTlFked3ZkHdPqtxfRW9Za56wLZRgREg9S5EWH8"
                                title="Himalayan Sound Healing"
                                location="Kathmandu, Nepal"
                                rating="5.0"
                                reviews="30"
                                price="75"
                                priceLabel="Per Session"
                                badges={[
                                    { text: "Trending", colorClass: "bg-gradient-to-r from-yellow-400 to-yellow-600", icon: "verified" }
                                ]}
                            />
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
