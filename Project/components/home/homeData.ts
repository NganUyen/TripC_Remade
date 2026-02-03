
import { Plane, Hotel, Calendar, Sparkles, Coffee, Map, Camera, Utensils } from 'lucide-react'

export const AI_CURATED = [
    {
        id: 1,
        title: "Kyoto Autumn",
        location: "Japan",
        image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=800&auto=format&fit=crop",
        reason: "Best weather now",
        color: "bg-emerald-500"
    },
    {
        id: 2,
        title: "Santorini Sunset",
        location: "Greece",
        image: "https://images.unsplash.com/photo-1613395877344-13d4c79e4284?q=80&w=800&auto=format&fit=crop",
        reason: "Matches your vibe",
        color: "bg-purple-500"
    },
    {
        id: 3,
        title: "Swiss Alps",
        location: "Switzerland",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800&auto=format&fit=crop",
        reason: "Great value",
        color: "bg-orange-500"
    },
    {
        id: 4,
        title: "Bali Retreat",
        location: "Indonesia",
        image: "https://images.unsplash.com/photo-1544644181-1484b3fdfc62?q=80&w=800&auto=format&fit=crop",
        reason: "Relaxation",
        color: "bg-blue-500"
    },
    {
        id: 5,
        title: "New York City",
        location: "USA",
        image: "https://images.unsplash.com/photo-1496442226666-8d4a0e62e6e9?q=80&w=800&auto=format&fit=crop",
        reason: "City Break",
        color: "bg-rose-500"
    },
    {
        id: 6,
        title: "Safari Adventure",
        location: "Kenya",
        image: "https://images.unsplash.com/photo-1516426122078-c23e76319801?q=80&w=800&auto=format&fit=crop",
        reason: "Adventure",
        color: "bg-amber-500"
    }
]

export const FLASH_DEALS = [
    {
        id: 1,
        title: "Maldives Overwater Villa",
        image: "https://images.unsplash.com/photo-1514282401047-d79a71a590e8?q=80&w=800&auto=format&fit=crop",
        oldPrice: "1,200",
        price: "850",
        discount: "30% OFF",
        tag: "Instant confirmation"
    },
    {
        id: 2,
        title: "Paris City Center Hotel",
        image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop",
        oldPrice: "450",
        price: "315",
        discount: "30% OFF",
        tag: "Selling fast"
    },
    {
        id: 3,
        title: "Tokyo Luxury Stay",
        image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop",
        oldPrice: "600",
        price: "420",
        discount: "30% OFF",
        tag: "Free cancellation"
    }
]

export const CATEGORIES = [
    {
        id: 1,
        name: "Khách Sạn",
        image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800&auto=format&fit=crop",
        icon: Hotel,
        color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30",
        href: "/hotels"
    },
    {
        id: 2,
        name: "Vé Máy Bay",
        image: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=800&auto=format&fit=crop",
        icon: Plane,
        color: "bg-sky-100 text-sky-600 dark:bg-sky-900/30",
        href: "/flights"
    },
    {
        id: 3,
        name: "Sự Kiện",
        image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
        icon: Calendar,
        color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30",
        href: "/events"
    },
    {
        id: 4,
        name: "Sức Khỏe",
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=800&auto=format&fit=crop",
        icon: Sparkles,
        color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30",
        href: "/wellness"
    },
    {
        id: 5,
        name: "Làm Đẹp",
        image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?q=80&w=800&auto=format&fit=crop",
        icon: Camera,
        color: "bg-pink-100 text-pink-600 dark:bg-pink-900/30",
        href: "/beauty"
    },
    {
        id: 6,
        name: "Di Chuyển",
        image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=800&auto=format&fit=crop",
        icon: Map,
        color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30",
        href: "/transport"
    },
    {
        id: 7,
        name: "Ẩm Thực",
        image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop",
        icon: Utensils,
        color: "bg-red-100 text-red-600 dark:bg-red-900/30",
        href: "/dining"
    },
    {
        id: 8,
        name: "Tham Quan",
        image: "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?q=80&w=800&auto=format&fit=crop",
        icon: Coffee,
        color: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30",
        href: "/activities"
    },
]

export const TRENDING = {
    feature: {
        id: 1,
        title: "The Ultimate Northern Lights Guide",
        description: "Experience the magic of the Aurora Borealis in Iceland's most exclusive glass igloos. Book your winter wonderland escape today.",
        image: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=1600&auto=format&fit=crop",
        rating: "4.9"
    },
    small: [
        {
            id: 2,
            title: "Cinque Terre Hiking",
            rating: "4.8",
            image: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 3,
            title: "Cappadocia Balloon Ride",
            rating: "4.9",
            image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=800&auto=format&fit=crop"
        },
        {
            id: 4,
            title: "Kyoto Tea Ceremony",
            rating: "4.7",
            image: "https://images.unsplash.com/photo-1545048702-79362596cdc9?q=80&w=800&auto=format&fit=crop"
        }
    ]
}
