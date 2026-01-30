
import { Tag, Zap, Star, ShoppingBag, Plane, Hotel, Music, Gift } from 'lucide-react'

// --- Types ---

export type UserTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM'

export const TIER_MULTIPLIERS: Record<UserTier, number> = {
    'BRONZE': 1.0,
    'SILVER': 1.2,
    'GOLD': 1.5,
    'PLATINUM': 2.0
}

export interface Voucher {
    id: string
    code: string
    voucher_type: string
    discount_value: number
    min_spend: number
    tcent_price: number | null
    total_usage_limit: number | null
    current_usage_count: number
    is_purchasable: boolean
    is_active: boolean
    // Frontend helpers (will need to be derived or mapped if not in DB, but adhering to strict DB fields for 'Voucher' type itself as requested)
}

export interface Quest {
    id: string
    title: string
    description: string
    quest_type: string
    reward_amount: number
    is_active: boolean
    starts_at: string | null
    expires_at: string | null
    status?: 'pending' | 'approved' | 'rejected' | 'completed' | 'claimed'
}

// --- Data ---

export const EARN_TASKS = [
    { id: '1', title: 'Complete Profile', subtitle: 'Add your email & phone', reward: 500, state: 'new' },
    { id: '2', title: 'Book Local Stay', subtitle: 'Staycation this weekend', reward: 1200, state: 'active' },
    { id: '3', title: 'Share with Friends', subtitle: 'Invite 3 friends', reward: 300, state: 'completed' },
    { id: '4', title: 'Daily Login', subtitle: '7 day streak', reward: 50, state: 'completed' },
]

export const USE_CASES = [
    { id: '1', title: 'Redeem Vouchers', icon: Tag, color: 'bg-orange-100 dark:bg-orange-500/10 text-orange-500' },
    { id: '2', title: 'Boost Content', icon: Zap, color: 'bg-amber-100 dark:bg-amber-500/10 text-amber-500' },
    { id: '3', title: 'Upgrade Plan', icon: Star, color: 'bg-purple-100 dark:bg-purple-500/10 text-purple-500' },
    { id: '4', title: 'Book Services', icon: ShoppingBag, color: 'bg-pink-100 dark:bg-pink-500/10 text-pink-500' },
]

export const VOUCHERS: Voucher[] = [
    {
        id: '101',
        code: 'HOTEL20',
        voucher_type: 'Hotel Credit',
        discount_value: 20,
        min_spend: 0,
        tcent_price: 2000,
        total_usage_limit: 1000,
        current_usage_count: 50,
        is_purchasable: true,
        is_active: true
    },
    {
        id: '102',
        code: 'LOUNGE_ACCESS',
        voucher_type: 'Transport',
        discount_value: 0,
        min_spend: 0,
        tcent_price: 3500,
        total_usage_limit: 500,
        current_usage_count: 20,
        is_purchasable: true,
        is_active: true
    },
    {
        id: '103',
        code: 'SPA_DAY',
        voucher_type: 'Wellness',
        discount_value: 50,
        min_spend: 100,
        tcent_price: 5000,
        total_usage_limit: 200,
        current_usage_count: 45,
        is_purchasable: true,
        is_active: true
    },
    {
        id: '104',
        code: 'CONCERT_VIP',
        voucher_type: 'Entertainment',
        discount_value: 0,
        min_spend: 0,
        tcent_price: 8000,
        total_usage_limit: 50,
        current_usage_count: 48,
        is_purchasable: true,
        is_active: true
    },
]

// --- Animation Config ---

export const springTransition = { type: 'spring' as const, stiffness: 400, damping: 25 }

export const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: springTransition }
}

export const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
}
