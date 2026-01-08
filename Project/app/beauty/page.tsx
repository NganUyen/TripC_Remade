import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CategorySlider } from "@/components/CategorySlider"
import { BeautyHero } from "@/components/beauty/BeautyHero"
import { BeautyFilters } from "@/components/beauty/BeautyFilters"
import { BeautyActivityCard } from "@/components/beauty/BeautyActivityCard"

export default function BeautyPage() {
    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen flex flex-col font-display selection:bg-rose-gold selection:text-white">
            <Header />
            <CategorySlider />

            <main className="flex-grow w-full flex flex-col">
                <BeautyHero />

                <section className="layout-container max-w-[1440px] mx-auto px-4 md:px-8 pb-20 relative z-20 -mt-10">
                    <BeautyFilters />

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCmQD12yj3WwetDw3SMvoTvsL3Xl6erBtPHC7Hb6vJdU4pfEM7Heos4ZHgFeRbFpwDwOd-1gxwcLv6RIijb6L-YVh2Rr2DR6ylIvBe3277lKWGVRbUtW9ftEF5lNkYTy20ujL7V9l3gRJPwq9K6ySN6qRS5HbNorNhs1-Pw5RLWxVC07KrCQTKBxkuoQMO1QdeA-z2Y7D8af8Un_zZNgirnTjPh1sG4nPOl4iwaGSkp_3_iWwsnOBBydrGFWn8vgQBtD_TvegJ8RjQ"
                            title="Luxury Spa Day"
                            location="Serenity Wellness Center"
                            rating="4.9"
                            price="120"
                            originalPrice="150"
                            discount="-20%"
                            badges={[
                                { text: "Instant", colorClass: "bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white", icon: "bolt", iconColor: "text-green-600" },
                                { text: "Popular", colorClass: "bg-gradient-to-r from-orange-500 to-red-500", icon: "local_fire_department" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuANudx47LpOgj80QtM2axiDUWqt6n7_kWW7c24bNGA6RNTk0S9xrY5A1uvBvrsgJyhwDC0MhC2ADadYr05uWeVrZjwD_qgv7X1VjuwwQhBLvbB_YFukqDma2G944TwqIiKM9If4VLDFBPIZBBerTgyGWhfXNcQbTfUAe0MXpvvCOnk6DH8EDGUtxa_0ftbSMjeO-Ip54yAXXcVyJxmHAQs0SHxGAhsHEdvYzgxvTWIW_hlBJI6pmjdq3OGgbMn9lm-iYtTxn1yCnzs"
                            title="Gel Manicure Express"
                            location="Nail Artistry Studio"
                            rating="4.8"
                            price="45"
                            priceLabel="Starting from"
                            badges={[
                                { text: "Instant", colorClass: "bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white", icon: "bolt", iconColor: "text-green-600" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuD-XD_AChPqPSFSkyP2TZDhgsxjmBVVISsneUYc8lhAQ99bKj9_Yz1mzpW2aWmYlJk5M3DxpSZu27cgx4_l-CHpB5gIRYtgNuwM8Mxt3IWhP4SexvKCAgdgX1uaIAzhD0ICFF_iTad4j9lCWmA7h6tqAayDHSmlL_LqS6J_cDpczOjxBUXNPy3UB7TnBRVq8cf_ZE1QDmmwn-VEgoN0J3y3QEmBHAqiIChTCiknmJ5n2D76076FL2Qgx59pC6l0g8tOS3YIMA8HIcU"
                            title="Full Body Aromatherapy"
                            location="Zen Garden Spa"
                            rating="4.9"
                            price="80"
                            originalPrice="100"
                            discount="-20%"
                            badges={[
                                { text: "Popular", colorClass: "bg-gradient-to-r from-orange-500 to-red-500", icon: "local_fire_department" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDWL3yc1JvLJlHSCTDb2ziK6yt3uhnNr6b5XZUptaxWGY4_gOsN0KgiGSI59C1mTPkKuzUGEphXwNsAzCkGvzT-RvRxE9AmwQGDnZFhc_2eQsEC6PRC4TjX2oj3iblhIwZG_nUdb9VKB_yTK_gRSf785jJ4GajF9MpIi-Lz5fdKXGV-WXehwosoUUnrmT2gLG7S_HQ_fhyFkHYP3HISPdeJkkEm7F4M2j6GtN1SGjJ5Fq8T3pvrnotWPV8Ul1OMsJ0Eym8OwXM11Nw"
                            title="Rejuvenating Facial"
                            location="Glow Skin Clinic"
                            rating="4.7"
                            price="95"
                            priceLabel="Standard"
                            badges={[
                                { text: "Instant", colorClass: "bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white", icon: "bolt", iconColor: "text-green-600" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBwkYL78f3aFJHZq-o1m5F-i2ZBjGzGOfE3yHwMR7J1pLFTXHfv0660Z3DUD2WFV1uLbhrIYH7PC3z_Swpa_B9S0kWt3UvW4hvZxMp0eX_m3Q6pTAlIiTjnnj-twUd3D77B-2gFKyHxEtV2ozztTVpmUTbZU6CUN7LZPpHYyx-G4E3kgrTRk8VAT8uj6CtbURa6DQjIAeyRxa441i7-Q12S5NGQAMJov3JvGBNEXRSwe_GmvW02dxzi4iFPIYpVoXLtCIUtvb_KLac"
                            title="Bridal Makeup Trial"
                            location="Luxe Beauty Lounge"
                            rating="5.0"
                            price="150"
                            priceLabel="Package"
                            badges={[
                                { text: "Popular", colorClass: "bg-gradient-to-r from-orange-500 to-red-500", icon: "local_fire_department" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCCQjrtLE99-UsPTdUFZ795vyP9RddBcLOj_SbWX8r3VpiaK7ADcZ6XkDJudUCNNkWsdzcBzE9ZHKLzJY53eE5rJD5XTl3ZkLuFv8cY4eLRIgL_pHer2sSW1uRMHc2lDqYGpiO81diIRAfRF9nRZjj-WSSs4BXz2zzedPqb5hs-7NhYRLsQMCuGGk3UXJwKRCyH33t-GIu8T-e4JTodCJXZ7_21d4wY4J9d2B5fpY6nQBFoOyQgB51hiXAAFzd_eReDjIvWXGkRwaQ"
                            title="Deep Tissue Massage"
                            location="PhysioSpa Central"
                            rating="4.8"
                            price="93"
                            originalPrice="110"
                            discount="-15%"
                            badges={[
                                { text: "Instant", colorClass: "bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white", icon: "bolt", iconColor: "text-green-600" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBbrdlRQzHN3XkMZ3T6gfXzEJH-kklKV4aA5jGwejxV0gqYl2tHGtVmO-wN1FeZwhDaUefEWquJDvAjWnVj_8WyUBsrtTwkhbx_UtLMHjX8ZWUx6JUva7h4nlPm634y4GyLIio6JQFh5rf4uaUemwJBSq8b27SCFLoP8pvCg8XqsIQ74K-p44_QcB6TUq0MYQ1LKTyZswUEpPgh8Zo13Cy0hg8wOh8ybEucTIoaWcsIWwVvtuiUFU7q4Ctl-MQYF2za_T1Ri2U3_Nk"
                            title="Hair Styling & Cut"
                            location="Style Bar Soho"
                            rating="4.6"
                            price="60"
                            priceLabel="Starting from"
                            badges={[
                                { text: "Instant", colorClass: "bg-white/95 dark:bg-black/80 backdrop-blur-md text-slate-900 dark:text-white", icon: "bolt", iconColor: "text-green-600" }
                            ]}
                        />

                        <BeautyActivityCard
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuDE8NFWGr5AE9-zQHl7ufA0SPylIOsdkFZl2epWp5KUG073uNp0wUSMx30mst7KiUH83IqXBzrwMW7BDM5Qve3xTOZV6X1PBIMHU4poqEaoDt_Q_cvCgqy0q8bAO4DuozgK8JGugQcQULifA3cb88qR42AQqC0Ed0SZT0-nI9cKlpVQkVH69dacsVO2XQjAqUpHILvLptHosZ0INxRYEYIDL23lG-KIr8K2kCj2I67GXO3T009Kw4evwdh6FlpN3aKpQHBa3E1Q4uw"
                            title="Detox Clay Wrap"
                            location="Pure Earth Spa"
                            rating="4.9"
                            price="130"
                            priceLabel="90 min"
                            badges={[
                                { text: "New", colorClass: "bg-blue-600 text-white" }
                            ]}
                        />
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    )
}
