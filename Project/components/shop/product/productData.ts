
import { Check, ShieldCheck, Zap, Truck, Star, Box, RefreshCw } from 'lucide-react'

export const PRODUCT_DATA = {
    id: "prod_1",
    category: "Travel Gear",
    title: "Monos Carry-On Pro Plus",
    sku: "TRV-Suitcase-001",
    rating: "4.9",
    reviews: "2,450",
    price: "295",
    oldPrice: "345",
    stock: 12,
    description: "The Carry-On Pro Plus features a built-in front compartment for easy access to your 15-inch laptop, passport, and other essentials. Crafted from unbreakable aerospace-grade polycarbonate, this suitcase is designed to last a lifetime of journeys.",
    images: [
        "https://images.unsplash.com/photo-1565026057447-bccc883d7476?q=80&w=1600&auto=format&fit=crop", // Hero Suitcase
        "https://images.unsplash.com/photo-1581553690325-18b1832e8c8c?q=80&w=1600&auto=format&fit=crop", // Detail
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1600&auto=format&fit=crop", // Lifestyle
        "https://images.unsplash.com/photo-1473186578172-c141e6798cf4?q=80&w=1600&auto=format&fit=crop"  // Open view
    ],
    highlights: [
        { icon: Zap, text: "Fast Shipping" },
        { icon: ShieldCheck, text: "Lifetime Warranty" },
        { icon: RefreshCw, text: "100-Day Return" },
    ],
    inclusions: [
        { icon: Truck, text: "Free delivery within 3 days" },
        { icon: Box, text: "Includes anti-microbial laundry bag" },
        { icon: Star, text: "Vegan leather details" },
    ],
    aiInsight: {
        match: "Perfect Match",
        reason: "Fits your frequent flyer needs for 'Business Travel' and 'Laptop Access'.",
        bestTime: "Best seller this month",
        tip: "Pair with the compression cubes for 30% more space."
    },
    variants: [
        {
            id: "v1",
            type: "Color",
            options: [
                { name: "Midnight Black", value: "#1a1a1a" },
                { name: "Olive Green", value: "#556b2f" },
                { name: "Desert Sand", value: "#eecfa1" }
            ]
        },
        {
            id: "v2",
            type: "Size",
            options: [
                { name: "Pro (Carry-On)", priceMod: 0 },
                { name: "Pro Plus (+ $20)", priceMod: 20 },
                { name: "Check-In Large (+ $80)", priceMod: 80 }
            ]
        }
    ],
    reviewsList: [
        {
            user: "Alex Doe",
            rating: 5,
            date: "Jan 2025",
            text: "Best suitcase I've owned. The laptop pocket is a game changer for security checks."
        },
        {
            user: "Jamie L.",
            rating: 4.8,
            date: "Dec 2024",
            text: "Sturdy and smooth wheels. Love the matte finish."
        }
    ]
}
