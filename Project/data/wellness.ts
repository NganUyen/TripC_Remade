export interface WellnessExperience {
    id: number;
    title: string;
    location: string;
    rating: number;
    reviews: number;
    price: number;
    image: string;
    badge: string | null;
    duration: string;
    description?: string;
    images?: string[];
    features?: { icon: string; title: string; description: string }[];
    reviewsList?: { name: string; date: string; rating: number; comment: string; image: string; type: string }[];
}

export const wellnessExperiences: WellnessExperience[] = [
    {
        id: 1,
        title: "Bali Silence Retreat",
        location: "Ubud, Indonesia",
        rating: 4.9,
        reviews: 420,
        price: 850,
        image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?q=80&w=2070&auto=format&fit=crop",
        badge: "Instant Confirmation",
        duration: "7 Days",
        description: "Everything about Bali Silence Retreat is designed for healing. From the morning meditation at sunrise to the sound baths at night. Highly recommend the garden-view villas.",
        images: [
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAjL8mYGCLHLw9s8leOJbHNgKHAbUvcx9Q6objMnnp7WBj8fuzoWmjeGp1oXXFtjkdC6qF-M-KW2fHX4r_USB9PltNl_WPC5GieE3h9gSGcJdSsM7Wd3uIu63ENB7BMaAZtfsCPpc8keIE9mHtIwThm_Pap8oub7rGiHDHT936_Pefv-AjZEVQ__WlORc-uSHsMhmW1ea_razYaG0gpQ7WLt2isjwH25aWCeVCKs7XUMfnn9PFrXyoO9MrvG3Lq2drWNZ7PjkPUmjA",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuB2guwR48y5alJ3nQh03g9q2JaeGlE2COajEwJg2PfBAG0mqQcjjnTYBbBjEj5MijF1JL1wWdWgAUoK64CyoWiZo0rqvQcxxMq__WSzKhu09RXxsGgDAEd-w4LBrN4k9-tNZlFK7gfPWfEAWo2burT63sKS02sDZVLjwdg20NyDxrPJeXZiEHj2XTYDtYFJn_HP5azI9E48-y0v6qwUnr0mq1ABnKVo1YH4IgaPJp9OU76U5jUNPyFrqjMxZfo9QyiaeL2pz-g5vM8",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuAw7AHMQg6orioUCDzN7-ffgS-Tl4W8D31N_7be748hAH0UqY7rJIE51P-Ezc4duaSc8Ezrg49kPoE8KUtFR_B2PghKJ1mQMbxiZY0x5qvXFrHy82tuPL78bWF2gKnr1NZU7T_UqNH2oIGqG8IKxaLumjoYl6aFVhor1yWfvQxG9p1bTwqmmibqCRbkEhPlWHCSfcIGqiFUp51TgWcqCJuXE8KEwQiGqWKOm-fzgqbG7zwTTwFvcm11SDQRtMGzz6sI8daYv_RCInA",
            "https://lh3.googleusercontent.com/aida-public/AB6AXuD2VbQwr8yRc0ay7-OovWmIHrtVfavkEaEhppp6cGc5Ggbw77xMl8X-MuVDOlWFCw9lBnCiFcidzrQk0JOBtp3AndUN6k_WYR-OvCzvoNDNdJfSy6Yg_bJ6zvPF0o9Zxcj8eqrRn3WERQcsjgRHRlDGmItRWMb5yzgx1namhYMKdPB8WZfutY3AM7LX-AoUUc4KlJFnP3AfxqmtRXD48R3tyzT7KiiBoDvfcy48RDGKt80UZMNM-TkbDp11Kk0EbFwAp09N2Fi62H8"
        ],
        features: [
            { icon: "spa", title: "Soul Healing", description: "Daily meditation and sound healing sessions focused on emotional release and mental clarity." },
            { icon: "restaurant", title: "Organic Dining", description: "Farm-to-table vegetarian meals prepared with ingredients from our private volcanic soil garden." },
            { icon: "nights_stay", title: "Digital Detox", description: "Completely disconnect. No phones or laptops allowed to help you reconnect with your inner self." },
            { icon: "visibility_off", title: "Noble Silence", description: "Experience the profound power of 3 full days of silence amidst the lush Balinese jungle." }
        ],
        reviewsList: [
            {
                name: "Sarah Jenkins",
                date: "Oct 2023",
                rating: 5,
                comment: "The silence was daunting at first, but by day 3, I felt a level of peace I hadn't experienced in years. The guides are incredibly supportive and the food is life-changing.",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBlSmvYqVVI47Xsevk9pMdE98o-lakLsdwZdNYTPMMLVJQn95Ij95JtTSjlKEk48_UXq2HviYtVBUAwk7O-EzB37DjViO8TZkpPuS3rCZHdaIn4ONScJgw6ORjO50sz3oQpR5cqU2d-FDcPpo1wxTb-NcPUTdwJ7Tm2-mmQjBvpjrgx-vt94WIJ7k20I1zlrvMPseKAqHn06PxmgahzdjVGUdketdY72rNZaoi_YWGKYtmHEMDm_Oon-AHAeCm3DpivBncUGhhJ5C4",
                type: "Solo Traveler"
            },
            {
                name: "Michael Chen",
                date: "Sep 2023",
                rating: 4.5,
                comment: "Everything about Bali Silence Retreat is designed for healing. From the morning meditation at sunrise to the sound baths at night. Highly recommend the garden-view villas.",
                image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFbfGUhbXhEe3EpFkiRQ0A8YLkXqFvO1D0Lq8-4cGYKkcYhy3kHhUY5pVbQB8mszQdH293kGfNkgRCH1SKrkkh2SrTuZ29MaoKh2wwHIGkgOMvc7Fqs_4WpTRC7I7izQb_bD55fcvScY7okfaXJsbFQZgTjlkWy5EF3Eu7qs2bHE33qIjGq72SK-oIwofco9xURG7LfxIq7uxwKIjiNvdExiJolg5AT8eQvqCG70CXEkmuEYUMS1j2dvLQugJ_vYYduqz_docHYDE",
                type: "Couple"
            }
        ]
    },
    {
        id: 2,
        title: "Urban Float Tank Experience",
        location: "Singapore",
        rating: 4.8,
        reviews: 156,
        price: 95,
        image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1000",
        badge: "Best Value",
        duration: "90 Mins",
        description: "Escape the city bustle and float weightlessly in our state-of-the-art sensory deprivation tanks. Achieve deep relaxation and reset your circadian rhythms in just 90 minutes.",
        images: [
            "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=2073&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1620733723572-11c52f7c2d82?q=80&w=2070&auto=format&fit=crop"
        ],
        features: [
            { icon: "spa", title: "Gravity Free", description: "Experience 1000lbs of Epsom salt providing effortless buoyancy, relieving joint pressure and muscle tension." },
            { icon: "nights_stay", title: "Theta State", description: "Drift into the Theta brainwave state, usually only achievable after years of deep meditation practice." },
            { icon: "visibility_off", title: "Sensory Rest", description: "Complete darkness and silence allow your brain to reallocate resources to healing and creativity." },
            { icon: "spa", title: "Post-Float Glow", description: "Enjoy complimentary herbal tea in our decompression lounge to integrate your experience." }
        ],
        reviewsList: [
            {
                name: "David Kim",
                date: "Nov 2023",
                rating: 5,
                comment: "I was skeptical at first, but after 10 minutes I completely let go. Came out feeling lighter than I have in years. The facility is spotless.",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1887&auto=format&fit=crop",
                type: "Business Traveler"
            },
            {
                name: "Jessica Lee",
                date: "Oct 2023",
                rating: 4.8,
                comment: "Perfect escape from Singapore's heat and noise. The staff explains everything clearly for first-timers.",
                image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961&auto=format&fit=crop",
                type: "Solo Traveler"
            }
        ]
    },
    {
        id: 3,
        title: "Forest Bathing & Meditation",
        location: "Kyoto, Japan",
        rating: 5.0,
        reviews: 89,
        price: 120,
        image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&q=80&w=1000",
        badge: null,
        duration: "4 Hours",
        description: "Practice Shinrin-yoku (Forest Bathing) in the sacred forests of Arashiyama. Guided mindfulness walking followed by a traditional matcha tea ceremony under the canopy.",
        images: [
            "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1531263060782-b024de9b9793?auto=format&fit=crop&q=80&w=2070",
            "https://images.unsplash.com/photo-1624253321171-1be53e12f5f4?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=2070&auto=format&fit=crop"
        ],
        features: [
            { icon: "spa", title: "Nature Therapy", description: "Absorb phytoncides (wood essential oils) proven to reduce stress hormones and boost immune function." },
            { icon: "restaurant", title: "Tea Ceremony", description: "Traditional open-air tea ceremony using ceremonial grade organic matcha and wagashi sweets." },
            { icon: "visibility_off", title: "Mindful Walking", description: "Slow, intentional movement to awaken the senses and connect deeply with the natural surroundings." },
            { icon: "nights_stay", title: "Zen Guidance", description: "Led by a certified forest therapy guide with background in Zen meditation practices." }
        ],
        reviewsList: [
            {
                name: "Emily Watson",
                date: "Nov 2023",
                rating: 5,
                comment: "A magical experience. The moss garden in the rain was breathtaking. Our guide Kenta was so knowledgeable and peaceful.",
                image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=2070&auto=format&fit=crop",
                type: "Couple"
            },
            {
                name: "Robert Chen",
                date: "Sep 2023",
                rating: 5,
                comment: "The highlight of our Japan trip. It's not a hike, it's a spiritual experience. The tea at the end was perfection.",
                image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=2070&auto=format&fit=crop",
                type: "Family"
            }
        ]
    },
    {
        id: 4,
        title: "Himalayan Sound Healing",
        location: "Pokhara, Nepal",
        rating: 4.9,
        reviews: 310,
        price: 450,
        image: "https://images.unsplash.com/photo-1512413914633-b5043f4041ea?auto=format&fit=crop&q=80&w=1000",
        badge: "Top Rated",
        duration: "3 Days",
        description: "Immerse yourself in the ancient vibrations of Tibetan singing bowls in the foothills of the Himalayas. A transformative 3-day workshop for deep energetic cleansing and realignment.",
        images: [
            "https://images.unsplash.com/photo-1517960413843-0aee8e2b3285?q=80&w=2099&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1515023677547-a45237f18528?q=80&w=2070&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1544367563-12123d896589?q=80&w=1974&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1605642914227-14217cb413c8?q=80&w=1887&auto=format&fit=crop"
        ],
        features: [
            { icon: "spa", title: "Vibrational Therapy", description: "7-metal planetary bowls aimed at balancing chakra frequencies and inducing deep meditative states." },
            { icon: "visibility_off", title: "Mountain Views", description: "Studio overlooks the majestic Annapurna range, providing visual healing alongside sound." },
            { icon: "restaurant", title: "Ayurvedic Meals", description: "Dietary plan designed to grounding and support energy shifts, cooked with local herbs." },
            { icon: "nights_stay", title: "Private Cottage", description: "Stay in traditional stone cottages with modern comforts, surrounded by prayer flags and pine trees." }
        ],
        reviewsList: [
            {
                name: "Sofia Rodriguez",
                date: "Oct 2023",
                rating: 5,
                comment: "I've never felt vibrations like this. It felt like my cells were being rearranged. The view of Machapuchare at sunrise is unforgettable.",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1887&auto=format&fit=crop",
                type: "Solo Traveler"
            },
            {
                name: "James Norton",
                date: "Aug 2023",
                rating: 4.7,
                comment: "Intense but rewarding. The masters are authentic and the setting is spiritual. Bring warm clothes for the evenings!",
                image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1938&auto=format&fit=crop",
                type: "Friends"
            }
        ]
    }
]
