

export interface ActivityItem {
    id: string;
    category: 'Tour' | 'Wellness' | 'Adventure' | 'Workshop' | 'Culture' | 'Water' | 'Food';
    title: string;
    location: string;
    duration: string;
    price: number;
    oldPrice?: number;
    rating: number;
    reviews: number;
    image: string;
    images: string[];
    instant: boolean;
    bestseller: boolean;
    features: string[]; // "What's Included"
    description: string;
    // New Detailed Fields
    longDescription?: string;
    highlights?: string[];
    itinerary?: { day: string; title: string; desc: string }[];
    inclusions?: string[];
    exclusions?: string[];
    faqs?: { question: string; answer: string }[];
    gallery?: string[];
    host?: { name: string; avatar: string; rating: number };
}

export const ACTIVITIES: ActivityItem[] = [
    {
        id: 'thai-tour-1',
        category: 'Tour',
        title: 'TOUR THÁI LAN | 4 NGÀY 3 ĐÊM',
        location: 'Bangkok - Pattaya, Thailand',
        duration: '4 Days 3 Nights',
        price: 310, // Approx 7,790,000 VND
        oldPrice: 350,
        rating: 4.8,
        reviews: 45,
        image: 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?q=80&w=2039&auto=format&fit=crop', // Thai Temple
        images: [
            'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=800', // Street food
            'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800', // Nature
            'https://images.unsplash.com/photo-1507608869274-2c33ee13db69?q=80&w=800'  // Scenery
        ],
        instant: true,
        bestseller: true,
        features: ['Buffet Baiyoke Sky', 'Thai Massage', 'Coral Island', 'Alcazar Show'],
        description: 'Khám phá Bangkok & Pattaya với hành trình 4 ngày 3 đêm đầy thú vị.',
        longDescription: "Hành trình ĐÀ NẴNG - BANGKOK - PATTAYA. Ngày khởi hành: Tháng 9, 10, 11. Giờ bay 10:00AM. Hãng hàng không: Air Asia. Một hành trình đầy màu sắc đưa bạn đến với 'Xứ sở Chùa Vàng', trải nghiệm văn hóa độc đáo, ẩm thực phong phú và những show diễn tráng lệ.",
        highlights: [
            "Tặng suất Buffet tại Tòa nhà 86 tầng Baiyoke Sky",
            "Tặng mỗi khách 01 phần Xôi Xoài - món tráng miệng trứ danh",
            "Tặng suất Massage truyền thống Thái Lan 60 phút",
            "Tặng show Thưởng lãm chương trình Nghệ thuật Chuyển giới đặc sắc",
            "Thưởng thức Món Sườn cay - nổi tiếng tại Thái Lan",
            "Mua sắm thỏa thích tại các Trung tâm thương mại hàng đầu",
            "Tham quan khu phức hợp Nong Nooch Garden, vườn khủng long tỉ tê"
        ],
        itinerary: [
            { day: 'Day 1', title: 'Arrival in Bangkok', desc: 'Arrive at Suvarnabhumi Airport. Transfer to Pattaya. Visit Floating Market.' },
            { day: 'Day 2', title: 'Coral Island & Alcazar Show', desc: 'Speedboat to Coral Island. Afternoon visit to Gem Gallery. Evening Alcazar Cabaret Show.' },
            { day: 'Day 3', title: 'Bangkok City Tour', desc: 'Visit Grand Palace, Wat Arun. Shopping at ICONSIAM.' },
            { day: 'Day 4', title: 'Departure', desc: 'Free time until transfer to airport for flight home.' }
        ],
        inclusions: ['Roundtrip Airfare', 'Hotel Accommodation (4-5 Star)', 'Meals as per itinerary', 'English/Vietnamese Speaking Guide', 'Entrance Fees'],
        exclusions: ['Personal Expenses', 'Tips for Guide/Driver ($3/day)', 'Visa Fees (if applicable)'],
        host: {
            name: 'TripC Exclusive',
            avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
            rating: 4.9
        }
    },
    {
        id: '1',
        category: 'Wellness',
        title: 'Luxury Spa & Onsen Retreat',
        location: 'Kyoto, Japan',
        duration: '3 Hours',
        price: 120,
        oldPrice: 180,
        rating: 4.9,
        reviews: 1240,
        image: 'https://images.unsplash.com/photo-1600334019640-eb8c98536f95?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: true,
        bestseller: true,
        features: ['Private Onsen', 'Massage', 'Tea Ceremony'],
        description: 'Relax in a traditional Japanese Onsen followed by a full body massage.',
        longDescription: 'Escape the hustle and bustle of the city and immerse yourself in serenity. Our Luxury Spa & Onsen Retreat offers a comprehensive wellness experience nestled in the mountains of Kyoto.',
        highlights: ['Private Open-air Onsen', '90-minute Aromatherapy Massage', 'Traditional Matcha Tea Ceremony', 'Organic Kaiseki Lunch']
    },
    {
        id: '2',
        category: 'Water',
        title: 'Dolphin Watching & Snorkeling',
        location: 'Bali, Indonesia',
        duration: 'Full Day',
        price: 85,
        oldPrice: 110,
        rating: 4.8,
        reviews: 850,
        image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: true,
        bestseller: false,
        features: ['Boat Transfer', 'Lunch', 'Equipment'],
        description: 'Swim with wild dolphins in their natural habitat.',
        highlights: ['Sunrise Boat Trip', 'Swim with Dolphins', 'Coral Reef Snorkeling', 'Beachside BBQ Lunch']
    },
    {
        id: '3',
        category: 'Workshop',
        title: 'Pottery & Clay Sculpting',
        location: 'Hoi An, Vietnam',
        duration: '2 Hours',
        price: 35,
        rating: 4.7,
        reviews: 320,
        image: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: true,
        bestseller: true,
        features: ['Take Home Art', 'Instructor', 'Materials'],
        description: 'Learn the ancient art of pottery from local artisans.'
    },
    {
        id: '4',
        category: 'Culture',
        title: 'Traditional Tea Ceremony',
        location: 'Seoul, South Korea',
        duration: '1.5 Hours',
        price: 45,
        rating: 4.9,
        reviews: 540,
        image: 'https://images.unsplash.com/photo-1576402187878-974f70c890a5?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: false,
        bestseller: false,
        features: ['Hanbok Rental', 'Tea Tasting', 'Photo Session'],
        description: 'Experience the serenity of a traditional Korean tea ceremony.'
    },
    {
        id: '5',
        category: 'Adventure',
        title: 'Sunrise Hot Air Balloon',
        location: 'Cappadocia, Turkey',
        duration: '4 Hours',
        price: 250,
        oldPrice: 300,
        rating: 5.0,
        reviews: 2100,
        image: 'https://images.unsplash.com/photo-1507608869274-2c33ee13db69?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: false,
        bestseller: true,
        features: ['Champagne Toast', 'Hotel Pickup', 'Flight Certificate'],
        description: 'Float over the fairy chimneys as the sun rises.'
    },
    {
        id: '6',
        category: 'Food',
        title: 'Street Food Walking Tour',
        location: 'Bangkok, Thailand',
        duration: '3 Hours',
        price: 40,
        rating: 4.8,
        reviews: 980,
        image: 'https://images.unsplash.com/photo-1559314809-0d155014e29e?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: true,
        bestseller: true,
        features: ['10+ Tastings', 'Local Guide', 'Night Market'],
        description: 'Taste the best street food Bangkok has to offer.'
    },
    {
        id: '7',
        category: 'Adventure',
        title: 'ATV Jungle Expedition',
        location: 'Phuket, Thailand',
        duration: '2 Hours',
        price: 65,
        rating: 4.6,
        reviews: 450,
        image: 'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: true,
        bestseller: false,
        features: ['Safety Gear', 'Guide', 'Waterfalls'],
        description: 'Ride through the jungle and visit hidden waterfalls.'
    },
    {
        id: '8',
        category: 'Tour',
        title: 'City Helicopter Tour',
        location: 'New York, USA',
        duration: '15 Mins',
        price: 299,
        oldPrice: 350,
        rating: 4.8,
        reviews: 1500,
        image: 'https://images.unsplash.com/photo-1522083165195-3424ed129620?q=80&w=800&auto=format&fit=crop',
        images: [],
        instant: false,
        bestseller: true,
        features: ['Commentary', 'Window Seats', 'Skyline Views'],
        description: 'See the Big Apple from a bird\'s eye view.'
    }
];

export const getActivityById = (id: string): ActivityItem | undefined => {
    return ACTIVITIES.find(item => item.id === id);
};

