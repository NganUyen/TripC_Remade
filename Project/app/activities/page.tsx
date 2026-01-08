'use client'

import React, { useState } from 'react'
import { Header } from "@/components/Header"
import { Footer } from "@/components/Footer"
import { CategorySlider } from "@/components/CategorySlider"
import { ActivitiesHero } from "@/components/activities/ActivitiesHero"
import { ActivitiesFilters } from "@/components/activities/ActivitiesFilters"
import { ActivitiesActivityCard } from "@/components/activities/ActivitiesActivityCard"
import { SharePopup } from "@/components/SharePopup"

export default function ActivitiesPage() {
    const [isShareOpen, setIsShareOpen] = useState(false)
    const themeColor = 'primary'

    return (
        <>
            <Header />
            <CategorySlider />
            <main className="flex-grow bg-background-light dark:bg-background-dark min-h-screen flex flex-col">
                <ActivitiesHero themeColor={themeColor} />
                <ActivitiesFilters themeColor={themeColor} />
                <section className="w-full pb-20">
                    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            <ActivitiesActivityCard
                                themeColor={themeColor}
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuC4x75BKjh9M8sT8VLI5gslg-u3hXYfywHsjWbKQP5Wu-g_3STEB1SzkIuP8Xa6Ymq1viF9IEONe97bia8JmemCr8YVRZr3M8k4vyZ6gXKQ3ckkYET4zDFR74V5H4xYo1Wri36n-fDtrSy3-VS9-yNBW8G2IL4b9U8RmCpPC2Eit15Mh2h0QcNjCzt59npTk9f1EuD5gTcwowBb_lkp6MnJngXp9dUioppSWEgJPkKBPFbN8FjFIct8jzNIjXuab2Tr5WnXKHgxI9o"
                                title="Sun World Ba Na Hills Ticket"
                                rating="4.8"
                                reviews="1,204"
                                originalPrice="45.30"
                                price="38.50"
                                discount="-15%"
                                badges={[
                                    { text: "Popular", colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuCbByDAuW7N2XK7_8NHUIBgIa5ytnD8EdQZQUSfMHNFwVYksQMx_5h3kft5n4NgJp_J-zZQ9aT_b8WGT-0RfWeUggSROpCd1WwQiRPNCNvD7SSJGpc08nYnG0ioAiAI5RyuYijxPmbHVNrrt_hzVNSQ4Il4yKOc9__eSDEqUBmYs1rjATeVFpPD9QVXlecid8f6rh2_IZWa7OzCxqVibIBtXt_JD1a-pXzW_2k4e6sqDUliV3GSUVamTgq9Nd7g8vpi60c79E9noTo"
                                title="VinWonders Nam Hoi An"
                                rating="4.9"
                                reviews="856"
                                originalPrice="28.00"
                                price="25.00"
                                discount="-10%"
                                badges={[
                                    { text: "Hot", colorClass: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAPI5lqKpFTKxM7N6c_LWn_0OWXrDCYB3MQyDa9-C7KEPmtZuWsyhm4bYoH9xG1Ttyf4VYESn6F3zdxc_Y_AkSaJmA6s5R2GkrdsFp34weBRDh8_-oZR9F2GmtLcuTCUz8_uGPWfidgPZbILa3KuZqmxF7EY42yP2E_jV3iZSWh4zoiU7MRwpATJe9JilnitYRDpFCSX16wiNr3cFz_ZcVb1mq9MsX8b9p-QXpwyDyBYqHuZgmOc-jsssdDz6bGfhwaX4W2P_ilDng"
                                title="Ha Long Bay Day Cruise"
                                rating="4.7"
                                reviews="3,420"
                                originalPrice="56.25"
                                price="45.00"
                                discount="-20%"
                                badges={[]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuB8jHffiNw3yJR9Za4xZAZ1qkgvw8Eu8_WaClpo_yLCfGIEWxjOZ0vQdgOjIgkixPq7OqJfinhGS7B-Spu2yKYW6tp-CDqIS6QkVWzW7BZBjl9SDX15M9g9BlgaV_vo2SKG1hVdouf0FBFWjl43ZGUJtc_9tDmJeazPZnuYEe9au8yFGms6uWPGGz0BNe9zh_z0LkPA6zE2-4FPUr03G0L0pD-3QRXFjREpmoV4eckUX0C4Yvkyb9xvLfllqjbKcXV2-pC2I9lmCr4"
                                title="Cu Chi Tunnels Tour"
                                rating="4.6"
                                reviews="940"
                                originalPrice="28.50"
                                price="19.99"
                                discount="-30%"
                                badges={[
                                    { text: "Best Seller", colorClass: "text-amber-600 bg-amber-50 dark:bg-amber-500/10 border-amber-100 dark:border-amber-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuAj4NJPANn2KYnnB4KXn8D8O6Ni-zcqGcfccyyKvdwJbmDgQf_nIKSMi3xI750ItvVEiXniIX4xMeP9Ijd7i-Q_g3Vo-6g4W_cn9V-chzqNLBUza99QXxq0-Wu1xTbEEgso4_i1eWxgMKqIC5_Drptrz8xMoXS3LQbvo8DtLkyUeB_kVYVbha8MJbwJT4v13zXh2-1Wv4wmKjub6j4AbNAyW33_yx7DCOvOY0HRA0rEQ07I0RlmRROxWbBtiJZ38y0nM3AqdWV181M"
                                title="Hoi An Cooking Class"
                                rating="4.9"
                                reviews="420"
                                originalPrice="37.65"
                                price="32.00"
                                discount="-15%"
                                badges={[
                                    { text: "Small Group", colorClass: "text-blue-600 bg-blue-50 dark:bg-blue-500/10 border-blue-100 dark:border-blue-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuC_YKOJ2jNaTJrTt8LUyw0NRa-8FMbP71OQoaIYi9hcJyfue5TxYCoPC5EkjuBdHTqNN8NrTR_k1aanYVwrCFBWgEkqHsRh1o1G8RGLSkuh8mDJml_Wr3LQSGv3T5eo7OiHvhrcHkSRRbhXI_lcLXQII46h5bDW-y0LbVjQv3QU7L3fE0YIpmh-V8sfgEnjrbMv5wjAlTLURb2j8v9Vkqla8Tq2yIDETQsX92qBsKvONFJDcox2OzvG9KlBTXj96QMYOW9jdjjZ0dQ"
                                title="Mekong Delta Discovery"
                                rating="4.5"
                                reviews="1,500"
                                originalPrice="39.50"
                                price="29.50"
                                discount="-25%"
                                badges={[]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuDb0yYvddhUAwaH2k9II8UEyTt3z_t0yV4zPkypOYWMaIz_PUi_Vv6Ertfv5zcD5k-ikYQ5i19e8WX0iLE2Neb30CdBzFwwiP3edIpPKSTWVasJWqMX9eNOFgaAMOCcRqO0cY2nE_rYgMyaA8Zm7Uz-EOPl4F1NNkBYNWk9Cv6a__rMSpMQPgY_uQ69L0VyCt-lM6FsWKhL5hF3Qk6910mf-NDEvaLH_5aI429hMENb43c_yCN_9c4yd91beNrIbKQE7-UHQSrSeEE"
                                title="Sun World Fansipan Legend"
                                rating="4.8"
                                reviews="720"
                                originalPrice="50.00"
                                price="42.00"
                                discount="-16%"
                                badges={[
                                    { text: "Hot", colorClass: "text-orange-600 bg-orange-50 dark:bg-orange-500/10 border-orange-100 dark:border-orange-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                            <ActivitiesActivityCard
                                image="https://lh3.googleusercontent.com/aida-public/AB6AXuBRgF2eCqWiTRjEPBKEtjtOKspopGoweZ20GRnWyfk6Gguvn7EwHTWuhP8-8Ss9IFyHjtkKfqDDBmcjEAEjKs725YLyxChmGt-NSBazxI3fq0lzzZv-pDfjnLprFqK2IO9RvZTZXr1xRkAO-KTWdC7d6H1qHguQ8fqeBdKaRJUs9QJx9d2jviSUVbMJXpPWdY0Jv06qOBsWKzAcrgY6YN2p6kIFdpr3XMNMn6etCUNZu6Hat3wgh1ez3I7eIo2BBqwrzzT7F4J3CtA"
                                title="I-Resort Mud Bath"
                                rating="4.6"
                                reviews="310"
                                originalPrice="18.50"
                                price="15.00"
                                discount="-18%"
                                badges={[
                                    { text: "Wellness", colorClass: "text-purple-600 bg-purple-50 dark:bg-purple-500/10 border-purple-100 dark:border-purple-500/20" }
                                ]}
                                onShare={() => setIsShareOpen(true)}
                            />
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
            <SharePopup isOpen={isShareOpen} onClose={() => setIsShareOpen(false)} />
        </>
    )
}
