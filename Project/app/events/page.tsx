import { Footer } from "@/components/Footer"
import { EventsHero } from "@/components/EventsHero"
import { QuickFilters } from "@/components/QuickFilters"
import { FilterSidebar } from "@/components/FilterSidebar"
import { ExperienceCard } from "@/components/ExperienceCard"

export default function EventsPage() {
    const experiences = [
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBpPRc3qMti0-vx_bsSgsw1Eaq9rKSM69NAiYF141lpOT_I4fQgT8Y94EOTk4V9lsOkIwmUXxR6zR1EnG6RXl71aSTfUBtiuQX97GN7ZZ2Aw4pszRDCPDJb4h72sOSEh_P-uH4XdZ4GTjviSewe4aMNXpOpOUhLb1OvK_uxZ-qk0HnTxqtTmQYqI7tHClc0fT8vDOqEu1K_SqAc4HXCHGKBWPLKpKEoorzFsZVcjUEf0qmx_dnfmN-JXWp5LKakSA0Ya3VYI4mi7DM",
            category: "Theme Park",
            rating: "4.9",
            reviews: "12k",
            title: "Universal Studios Hollywood Ticket",
            location: "Los Angeles",
            duration: "1 Day",
            originalPrice: "145.00",
            price: "109.00",
            tags: [{ text: "BEST SELLER", color: "bg-orange-500" }],
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAzuoLGhBvBjP80-1F0k7cnSylA78ed6MGl-sPKV1st1Mmno3rQht8_ZW5nJpFB6QHAY0JtAIkErA7LqkCrxIdfK7N8d_kyeVjdKU8kH5tIxopxieHUtMnuInlGOXnMy1sBKyl8fOh9h4ScnpfR6HolDCR4BM9uyZgKB5LXL74a9PFQkcb29VnMzSicBMnke6VlOKdtG9SkCTWO0ib1od38jDmVc-HVyCr_fOJh6fIbFyOGo2j2aQyixQUFtWsSIipe9zusz-r37tM",
            category: "Museum",
            rating: "4.7",
            reviews: "850",
            title: "Louvre Museum Priority Access Ticket",
            location: "Paris, France",
            duration: "3 Hrs",
            price: "22.00",
            tags: [{ text: "INSTANT CONFIRMATION", color: "bg-blue-500" }],
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDK1d2-nWBq0MywT1uQD7h9KsVFR8MFWTeBI8nbCVD7hXinLseO4AJw1RNHddHaf_KkvFNVu0dYFF0HtwN4XqdBpF4N6bQ6afTwBLl6NDquYE-mH51dMyctdIcab0SSh0gdUFKNytEP0Wc7eeGImblZPVIsD6YdMHBuB_-OVjj0_31JQ3AAZImsuZZsUexbNc50gWOJgskmHm2C_ee4wqjr1RW_bu08hEdP6X5Yr-LJf9dhjUm3sKhSk9ysLf4auUVc5u6xq8YpMvU",
            category: "City Tour",
            rating: "4.8",
            reviews: "3.2k",
            title: "Tokyo Skytree Admission Ticket",
            location: "Tokyo, Japan",
            duration: "Flexible",
            originalPrice: "25.00",
            price: "18.50",
            tags: [{ text: "Selling Fast", color: "bg-black/50 backdrop-blur-sm" }],
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAf9P3MSWFhS2zu3A0_8_EVOIcm9TkSdUtAY-tyzGPmq1KFa8vZ7ZSyS2504L5_cZ97dr0gCymSL9XkT-1nrDflzm5e0I3txCX5qURkCSq29V2x6ubZ5c97-Ko3zvr_u4bFuuVn7bhygvWv_PmIrO8dvhVnlUUw3NPPshpIFB8-R0tYYgeftpTjiLZgnsMtNn67ccrge4QxIaClJSsXW79Y5SmnBfmuawhocx9lJD_yeBciD14otQbGViKbnJZnwyKi6gPR9sjKWRM",
            category: "River Cruise",
            rating: "4.6",
            reviews: "1.1k",
            title: "Seine River Sightseeing Cruise",
            location: "Paris",
            duration: "1 Hr",
            price: "15.00",
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8-niGZAEi63NQyHUxRtnQcBcymsoOGSW-vsKVQleym8_nqooY5-Iia2aktf_l29xDnrYf8HV4gAGjUJ7x9fM4T7WwWq_FIiGLVSnRkreVxRYQIAiy9mDIrvZMXxw8eCT1hCTbRMweeTMSJMWY9TcH8TAdRzXDaPsWXdF-MnkSp2GyA9X1NMMZzSuX9LxFL99ka034ILRfNMv-wQEiTN-SODjx9eUQA6nuCfXoFWvSQbGcAule6cw3iKHQrOxTk7ubwHkvigU06RM",
            category: "Day Trip",
            rating: "5.0",
            reviews: "215",
            title: "Cinque Terre Day Trip from Florence",
            location: "Florence, Italy",
            duration: "12 Hrs",
            originalPrice: "120.00",
            price: "95.00",
            tags: [{ text: "EXCLUSIVE", color: "bg-purple-600" }],
        },
        {
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWwbo6EjvDCiiF7CyAIO9rCYJDkSYxc8dBWyJdUWZoS5_cZl_qwMmx7VtbpUgtkEVcqFmSuPOdS2kpAD0Lwz8RniKiEl3RuR8e8PTegrDkUTx_uJ0PyhN13U0JXCtxYByOyBbJvIGLFkpVggJTnKWKeD0gHWtlJ0sR_HhgWWU--xRBkJYBc8WBcS9mkMZOkppgFe_iUNFEXExTPPByvgkLh3WmcnZEGcZztWsZwdzxfvDxxHGcYqWQRlA442Lzx-3bvgrC5sniouM",
            category: "Adventure",
            rating: "4.7",
            reviews: "2.8k",
            title: "Bali Instagram Tour: The Most Famous Spots",
            location: "Bali, Indonesia",
            duration: "10 Hrs",
            originalPrice: "50.00",
            price: "35.00",
        },
    ]

    return (
        <>
            <main className="flex-grow bg-background-light dark:bg-background-dark min-h-screen">
                <EventsHero />

                <div className="container mx-auto px-4 -mt-8 relative z-20 mb-8 max-w-5xl">
                    <QuickFilters />
                </div>

                <div className="container mx-auto px-4 pb-20 max-w-[1440px]">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <FilterSidebar />

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-slate-500 dark:text-slate-400 font-medium">124 experiences found</h2>
                                <div className="flex items-center gap-3">
                                    <div className="relative group">
                                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium shadow-sm hover:border-primary transition-colors text-slate-700 dark:text-slate-200">
                                            <span>Recommended</span>
                                            <span className="material-symbols-outlined text-base text-slate-400">expand_more</span>
                                        </button>
                                    </div>
                                    <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-1">
                                        <button className="p-1.5 rounded text-white bg-primary shadow-sm flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">grid_view</span>
                                        </button>
                                        <button className="p-1.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">view_list</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {experiences.map((exp, index) => (
                                    <ExperienceCard
                                        key={index}
                                        {...exp}
                                        staggerIndex={index + 1}
                                    />
                                ))}
                            </div>

                            <div className="mt-12 flex justify-center">
                                <button className="px-8 py-3 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary font-semibold hover:bg-primary hover:text-white transition-all shadow-sm">
                                    Load More Experiences
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    )
}
