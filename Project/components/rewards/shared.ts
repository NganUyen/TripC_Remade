
import { Tag, Zap, Star, ShoppingBag, Plane, Hotel, Music, Gift } from 'lucide-react'

// --- Types ---

export interface Voucher {
    id: string
    title: string
    description: string
    cost: number
    category: 'Hotel' | 'Transport' | 'Wellness' | 'Entertainment'
    color: string
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
    { id: '101', title: '$20 Hotel Credit', description: 'Valid for focused hotels worldwide', cost: 2000, category: 'Hotel', color: 'bg-blue-500' },
    { id: '102', title: 'Airport Lounge', description: 'One-time access pass', cost: 3500, category: 'Transport', color: 'bg-indigo-500' },
    { id: '103', title: 'Spa Day Pass', description: 'Relax at partner centers', cost: 5000, category: 'Wellness', color: 'bg-emerald-500' },
    { id: '104', title: 'Concert Ticket', description: 'VIP access to select events', cost: 8000, category: 'Entertainment', color: 'bg-rose-500' },
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
